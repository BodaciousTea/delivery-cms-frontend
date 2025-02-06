// backend/routes/admin.js
require("dotenv").config();
const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");

const cognitoISP = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// In-memory client counter (for testing)
// In production, use a persistent store (e.g., DynamoDB)
let clientCounter = 1;

// POST /admin/create-user endpoint
router.post("/create-user", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const clientId = "client" + clientCounter;
  clientCounter++;

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

module.exports = router;
