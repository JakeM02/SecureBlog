const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./db/blog.db");

// Middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/auth/login");
    }
    next();
}

// Dashboard Route
router.get("/", isAuthenticated, (req, res) => {
    const query = `SELECT id, title, content, created_at, created_by FROM posts ORDER BY created_at DESC`;

    db.all(query, [], (err, posts) => {
        if (err) {
            console.error("Dashboard DB error:", err);
            return res.status(500).send("Internal Server Error");
        }

        res.render("dashboard", {
            user: req.session.user,
            posts,
        });
    });
});

module.exports = router;
