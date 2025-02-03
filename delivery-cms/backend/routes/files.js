const express = require("express");
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.get("/files", async (req, res) => {
  const bucketParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: "videos/", // Your videos folder
  };

  try {
    const data = await s3.send(new ListObjectsV2Command(bucketParams));

    if (!data.Contents) {
      return res.status(200).json({ files: [] });
    }

    // Filter out any empty or folder-like objects
    const validFiles = data.Contents.filter((file) => file.Key && !file.Key.endsWith("/"));

    const files = await Promise.all(
      validFiles.map(async (file) => {
        const url = await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.Key,
            ResponseContentDisposition: `attachment; filename="${file.Key.replace('videos/', '')}"`, // Forces download
          }),
          { expiresIn: 3600 }
        );

        return {
          name: file.Key.replace("videos/", ""), // Remove "videos/" prefix
          url,
        };
      })
    );

    res.status(200).json({ files });
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).send("Error fetching files.");
  }
});

module.exports = router;
