require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const adminRoutes = require("./routes/admin");
const fileRoutes = require("./routes/files");
const otherRoutes = require("./routes/index");

app.use("/admin", adminRoutes);
app.use("/api", fileRoutes);
app.use("/", otherRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Media API! Use '/api/files' to fetch the list of files.");
});

// Only start the server if not in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
