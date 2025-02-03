require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import and use routes
const fileRoutes = require("./routes/files");
app.use("/api", fileRoutes);

// Root route for basic information
app.get("/", (req, res) => {
  res.send("Welcome to the Media API! Use '/api/files' to fetch the list of files.");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
