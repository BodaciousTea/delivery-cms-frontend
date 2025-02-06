const express = require("express");
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.get("/files", authMiddleware, async (req, res) => {
  
  const clientId = req.user["custom:clientId"];
  if (!clientId) {
    return res.status(400).json({ error: "No clientId associated with user" });
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
          }),
          { expiresIn: 3600 } 
        );

        return {
          name: file.Key.split("/").pop(), 
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

module.exports = router;
