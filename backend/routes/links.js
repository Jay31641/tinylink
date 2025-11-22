const express = require("express");
const router = express.Router();
const validator = require("validator");
const { Pool } = require("pg");

// Connect to DB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Function to generate random code
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// POST /api/links - Create short link
router.post("/", async (req, res) => {
  const { url, code } = req.body;

  // 1. Validate URL
  if (!validator.isURL(url, { require_protocol: true })) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  // 2. Determine final short code
  let finalCode = code ? code.trim() : generateCode();

  // Validate custom code (assignment requirement)
  const codePattern = /^[A-Za-z0-9]{6,8}$/;
  if (!codePattern.test(finalCode)) {
    return res
      .status(400)
      .json({ error: "Code must be 6–8 characters (letters and numbers only)" });
  }

  try {
    // 3. Check if code exists
    const exists = await pool.query("SELECT * FROM links WHERE code = $1", [
      finalCode,
    ]);

    if (exists.rows.length > 0) {
      return res.status(409).json({ error: "Short code already exists" });
    }

    // 4. Insert new link
    await pool.query(
      "INSERT INTO links (code, url) VALUES ($1, $2)",
      [finalCode, url]
    );

    // 5. Return response
    res.status(201).json({
      message: "Link created successfully",
      code: finalCode,
      shortUrl: `${process.env.BASE_URL}/${finalCode}`,
      url: url,
    });
  } catch (error) {
    console.error("Error creating link:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/links - List all links
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT code, url, click_count, last_clicked, created_at FROM links ORDER BY created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching links:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/links/:code - Get single link stats
router.get("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const result = await pool.query(
      "SELECT code, url, click_count, last_clicked, created_at FROM links WHERE code = $1",
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Code not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching link stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/links/:code - Delete a link
router.delete("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    // Check if exists
    const exists = await pool.query("SELECT * FROM links WHERE code = $1", [
      code,
    ]);

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: "Code not found" });
    }

    // Delete the link
    await pool.query("DELETE FROM links WHERE code = $1", [code]);

    res.status(200).json({ message: "Link deleted successfully" });
  } catch (error) {
    console.error("Error deleting link:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;