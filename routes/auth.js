const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

// Connect to database
const db = new sqlite3.Database("./db/blog.db");

// REGISTER (Secure)
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Basic input validation
  if (!username || !password) {
    return res.status(400).send("Please fill in all fields.");
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;

    db.run(query, [username, hashedPassword], function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(400).send("Username already exists.");
        }
        return res.status(500).send("Error: " + err.message);
      }
      res.redirect("/login"); // Redirects to login page after registration
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// LOGIN (Secure)
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Please fill in all fields.");
  }

  const query = `SELECT * FROM users WHERE username = ?`;

  db.get(query, [username], async (err, user) => {
    if (err || !user) {
      return res.status(401).send("Invalid credentials! <a href='/'>Try Again</a>");
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).send("Invalid credentials! <a href='/'>Try Again</a>");
      }

      if (!req.session) {
        return res.status(500).send("Session error. Please try again.");
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        isAdmin: user.username === "admin"
      };

      res.redirect("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

//Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
      res.redirect("/"); 
  });
});

module.exports = router;
