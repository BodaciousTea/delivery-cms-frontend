// delivery-cms/backend/routes/admin.js
require("dotenv").config();
const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const basicAuth = require("express-basic-auth");
const { getNextClientNumber } = require("../dynamoCounter");

router.use(
  basicAuth({
    users: { [process.env.ADMIN_USERNAME]: process.env.ADMIN_PASSWORD },
    challenge: true,
    realm: "Admin Area",
  })
);

// Initialize the Cognito Identity Service Provider
const cognitoISP = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ---------- Create User Endpoint ----------
router.post("/create-user", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  let clientNumber;
  try {
    clientNumber = await getNextClientNumber();
  } catch (err) {
    console.error("Error generating client number:", err);
    return res
      .status(500)
      .json({ error: "Error generating client ID", details: err.message });
  }

  // Form a clientId 
  const clientId = "client" + clientNumber;
  const temporaryPassword = Math.random().toString(36).slice(-8) + "A1!";

  const params = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: email,
    DesiredDeliveryMediums: ["EMAIL"],
    ForceAliasCreation: false,
    MessageAction: "SUPPRESS",
    TemporaryPassword: temporaryPassword,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "custom:clientId", Value: clientId },
    ],
  };

  try {
    const createResult = await cognitoISP.adminCreateUser(params).promise();
    console.log("User created:", createResult);

    const setPassParams = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email,
      Password: temporaryPassword,
      Permanent: true,
    };
    await cognitoISP.adminSetUserPassword(setPassParams).promise();

    res.status(200).json({
      message: "User created successfully",
      email,
      clientId,
      temporaryPassword,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Error creating user", details: err.message });
  }
});

// ---------- List Users Endpoint ----------
router.get("/users", async (req, res) => {
  const params = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Limit: 60,
  };

  try {
    const result = await cognitoISP.listUsers(params).promise();
    res.status(200).json({ users: result.Users });
  } catch (err) {
    console.error("Error listing users:", err);
    res.status(500).json({ error: "Error listing users", details: err.message });
  }
});

// ---------- Delete User Endpoint ----------
router.delete("/delete-user", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  
  const params = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: email,
  };

  try {
    const result = await cognitoISP.adminDeleteUser(params).promise();
    console.log("User deleted:", result);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Error deleting user", details: err.message });
  }
});

// ---------- S3 Client and Combined S3 Imports ----------
const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ---------- Generate Upload URL Endpoint ----------
router.post("/generate-upload-url", async (req, res) => {
  const { email, clientId, fileName } = req.body;
  if (!email || !clientId || !fileName) {
    return res
      .status(400)
      .json({ error: "Email, clientId, and fileName are required" });
  }

  const key = `clients/${clientId}/${fileName}`;

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    res.status(200).json({ uploadUrl, key });
  } catch (err) {
    console.error("Error generating upload URL:", err);
    res.status(500).json({
      error: "Error generating upload URL",
      details: err.message,
    });
  }
});

// ---------- Generate Report Endpoint ----------
router.get("/report", async (req, res) => {
  try {
    const userParams = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Limit: 60,
    };
    const usersResult = await cognitoISP.listUsers(userParams).promise();
    const users = usersResult.Users || [];
    let csvRows = [];
    csvRows.push("User Email,Client ID,File Name,Last Modified");

    for (const user of users) {
      const emailAttr = user.Attributes.find((attr) => attr.Name === "email");
      const clientIdAttr = user.Attributes.find(
        (attr) => attr.Name === "custom:clientId"
      );
      const email = emailAttr ? emailAttr.Value : "N/A";
      const clientId = clientIdAttr ? clientIdAttr.Value : "N/A";
      const bucketParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: `clients/${clientId}/`,
      };

      try {
        const s3Result = await s3.send(new ListObjectsV2Command(bucketParams));
        const objects = s3Result.Contents || [];
        if (objects.length === 0) {
          csvRows.push(`${email},${clientId},(no files),`);
        } else {
          for (const obj of objects) {
            if (obj.Key.endsWith("/")) continue;
            const fileName = obj.Key.split("/").pop();
            const lastModified = obj.LastModified
              ? obj.LastModified.toISOString()
              : "";
            csvRows.push(`${email},${clientId},${fileName},${lastModified}`);
          }
        }
      } catch (s3Err) {
        console.error(`Error listing S3 objects for client ${clientId}:`, s3Err);
        csvRows.push(`${email},${clientId},(error listing files),`);
      }
    }

    const now = new Date().toISOString();
    const title = `Report: User & File Report\nGenerated At: ${now}\n\n`;
    const csvData = title + csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=report.csv");
    res.status(200).send(csvData);
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({
      error: "Error generating report",
      details: err.message,
    });
  }
});

// ---------- List Files for a Client Endpoint ----------
router.get("/files", async (req, res) => {
  const clientId = req.query.clientId;
  if (!clientId) {
    return res
      .status(400)
      .json({ error: "clientId query parameter is required" });
  }

  const bucketParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: `clients/${clientId}/`,
  };

  try {
    const data = await s3.send(new ListObjectsV2Command(bucketParams));
    if (!data.Contents || data.Contents.length === 0) {
      return res.status(200).json({ files: [] });
    }
    const files = await Promise.all(
      data.Contents.map(async (file) => {
        if (file.Key.endsWith("/")) return null;
        const url = await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.Key,
            ResponseContentDisposition: `attachment; filename="${encodeURIComponent(
              file.Key.split("/").pop()
            )}"`
          }),
          { expiresIn: 3600 }
        );
        return {
          name: file.Key.split("/").pop(), 
          key: file.Key,
          url,
        };
      })
    );
    res.status(200).json({ files: files.filter(Boolean) });
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Error fetching files." });
  }
});

// ---------- Generate All Files Endpoint ----------
router.get("/all-files", async (req, res) => {
  try {
    const userParams = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Limit: 60,
    };
    const usersResult = await cognitoISP.listUsers(userParams).promise();
    const users = usersResult.Users || [];
    const filesByUser = await Promise.all(
      users.map(async (user) => {
        const emailAttr = user.Attributes.find((attr) => attr.Name === "email");
        const clientIdAttr = user.Attributes.find(
          (attr) => attr.Name === "custom:clientId"
        );
        const email = emailAttr ? emailAttr.Value : "N/A";
        const clientId = clientIdAttr ? clientIdAttr.Value : null;
        let files = [];
        if (clientId) {
          const bucketParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Prefix: `clients/${clientId}/`,
          };
          try {
            const s3Result = await s3.send(new ListObjectsV2Command(bucketParams));
            const objects = s3Result.Contents || [];
            files = objects
              .filter((obj) => !obj.Key.endsWith("/"))
              .map((obj) => ({
                key: obj.Key,
                lastModified: obj.LastModified
                  ? obj.LastModified.toISOString()
                  : null,
              }));
          } catch (s3Err) {
            console.error(
              `Error listing files for client ${clientId}:`,
              s3Err
            );
            files = [{ error: "Error listing files" }];
          }
        }
        return { email, clientId, files };
      })
    );
    res.status(200).json({ filesByUser });
  } catch (err) {
    console.error("Error generating all-files report:", err);
    res.status(500).json({
      error: "Error generating all-files report",
      details: err.message,
    });
  }
});

// ---------- Delete File Endpoint ----------
router.delete("/delete-file", async (req, res) => {
  const { clientId, key } = req.body;
  if (!clientId || !key) {
    return res
      .status(400)
      .json({ error: "clientId and key are required" });
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  try {
    await s3.send(new DeleteObjectCommand(params));
    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({
      error: "Error deleting file",
      details: err.message,
    });
  }
});

// ---------- Download Endpoint ----------
router.get("/download", async (req, res) => {
  const { clientId, fileName } = req.query;
  if (!clientId || !fileName) {
    return res.status(400).json({ error: "clientId and fileName query parameters are required" });
  }

  // Construct the full S3 key
  const key = `clients/${clientId}/${fileName}`;

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });
    const s3Response = await s3.send(command);

    res.attachment(fileName.toString());
    if (s3Response.ContentType) {
      res.setHeader("Content-Type", s3Response.ContentType);
    }
    s3Response.Body.pipe(res);
  } catch (err) {
    console.error("Error streaming download:", err);
    res.status(500).json({
      error: "Error downloading file",
      details: err.message,
    });
  }
});


module.exports = router;
