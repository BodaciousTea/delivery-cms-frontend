// backend/middleware/auth.js
const { CognitoJwtVerifier } = require("aws-jwt-verify");

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "id", // or "access" if you prefer access tokens
  clientId: process.env.COGNITO_APP_CLIENT_ID,
  region: process.env.AWS_REGION,
});

module.exports = async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const payload = await verifier.verify(token);
    console.log("Token verified successfully, payload:", payload);
    req.user = payload;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ error: "Invalid token", details: err.message });
  }
};
