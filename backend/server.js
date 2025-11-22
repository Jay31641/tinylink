require("dotenv").config();

// Importing required packages
const express = require("express");
const cors = require("cors");
const validator = require("validator");
const { Pool } = require("pg");

// Create Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // allows JSON body in requests

// Connect to Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Health check route
app.get("/healthz", (req, res) => {
  res.status(200).json({ ok: true, version: "1.0" });
});

app.use("/api/links", require("./routes/links"));

// Redirect Route - GET /:code
app.get("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    // Check if code exists
    const result = await pool.query(
      "SELECT url, click_count FROM links WHERE code = $1",
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Short link not found");
    }

    const originalUrl = result.rows[0].url;

    // Update click count + last clicked time
    await pool.query(
      "UPDATE links SET click_count = click_count + 1, last_clicked = NOW() WHERE code = $1",
      [code]
    );

    // Redirect to the original URL
    return res.redirect(302, originalUrl);
  } catch (error) {
    console.error("Error in redirect:", error);
    res.status(500).send("Internal server error");
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});