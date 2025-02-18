require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Register your routes
const adminRoutes = require("./routes/admin");
const fileRoutes = require("./routes/files");
const otherRoutes = require("./routes/index"); // if you have additional routes

app.use("/admin", adminRoutes);
app.use("/api", fileRoutes);
app.use("/", otherRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Media API! Use '/api/files' to fetch the list of files.");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
