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
    db.all("SELECT * FROM posts", [], (err, posts) => {
        if (err) return res.send("Error fetching posts");

        res.render("dashboard", {
            user: req.session.user,
            posts,
        });
    });
});

module.exports = router;
