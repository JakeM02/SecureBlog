const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// Connect to database
const db = new sqlite3.Database("./db/blog.db");

// Insecure Register (No password hashing, vulnerable to SQL Injection)
router.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Insecure SQL query (vulnerable to SQL injection)
  const query = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;

  db.run(query, function (err) {
      if (err) {
          return res.send("Error: " + err.message);
      }
      res.redirect("/login"); // Redirects to login page after registration
  });
});


// Insecure Login Route ( vulnerable )
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // SQL Injection vulnerability 
  const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;

  db.get(query, (err, user) => {
      if (err || !user) {
          return res.send("Invalid credentials! <a href='/'>Try Again</a>");
      }
      
      // Ensure session exists
      if (!req.session) {
          return res.send("Session error. Please try again.");
      }

      req.session.user = user; 
      res.redirect("/dashboard"); // redirects to dashboard
  });
});

//Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
      res.redirect("/"); 
  });
});


module.exports = router;
