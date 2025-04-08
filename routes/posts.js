const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const csrf = require("csurf");
const { body } = require("express-validator");

const db = new sqlite3.Database("./db/blog.db");
const csrfProtection = csrf();

// Middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/auth/login");
    }
    next();
}

// Show create post form
router.get("/create", isAuthenticated, csrfProtection, (req, res) => {
    res.render("createPost", { csrfToken: req.csrfToken() });
});

// Create new post (secure)
router.post("/create", isAuthenticated, csrfProtection,
    body("title").trim().escape(),
    body("content").trim().escape(),
    (req, res) => {
      const { title, content } = req.body;
      const user_id = req.session.user.id;
      const created_by = req.session.user.username;
  
      const query = `INSERT INTO posts (title, content, user_id, created_by, created_at) VALUES (?, ?, ?, ?, datetime('now'))`;

      db.run(query, [title, content, user_id, created_by], function (err) {
        if (err) return res.status(500).send("Error creating post");
        res.redirect("/dashboard");
      });
    }
  );
  

// Showedit post form
router.get("/edit/:id", isAuthenticated, csrfProtection, (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM posts WHERE id = ?`, [id], (err, post) => {
        if (err || !post) return res.send("Post not found");

        // Check access rights
        if (req.session.user.username !== "admin" && req.session.user.id !== post.user_id) {
            return res.status(403).send("Unauthorized");
        }

        res.render("editPost", { post, csrfToken: req.csrfToken() });
    });
});

// Handle editing a post
router.post("/edit/:id", isAuthenticated, csrfProtection,
    // Use body() for sanitization
    body("title").trim().escape(),
    body("content").trim().escape(),
    (req, res) => {
        const { id } = req.params;
        const { title, content } = req.body;

        db.run(
            `UPDATE posts SET title = ?, content = ? WHERE id = ?`,
            [title, content, id],
            function (err) {
                if (err) return res.send("Error updating post");
                res.redirect("/dashboard");
            }
        );
    }
);

// Handle deleting a post (Only Admins & Post Creators)
router.post("/delete/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    const user = req.session.user;

    db.get(`SELECT user_id FROM posts WHERE id = ?`, [id], (err, post) => {
        if (err || !post) return res.send("Post not found");

        if (user.username === "admin" || user.id === post.user_id) {
            db.run(`DELETE FROM posts WHERE id = ?`, [id], function (err) {
                if (err) return res.send("Error deleting post");
                res.redirect("/dashboard");
            });
        } else {
            res.status(403).send("Unauthorized");
        }
    });
});


// Secure Dashboard
router.get("/dashboard", isAuthenticated, (req, res) => {
    const postsQuery = `
        SELECT posts.id, posts.title, posts.content, posts.created_at, posts.created_by, users.username AS author, posts.user_id
        FROM posts
        JOIN users ON posts.user_id = users.id
        ORDER BY posts.created_at DESC
    `;

    db.all(postsQuery, [], (err, posts) => {
        if (err) return res.send("Error retrieving posts");

        res.render("dashboard", {
            user: req.session.user,
            posts,
        });
    });
});

// Secure Search 
router.get("/search", isAuthenticated, (req, res) => {
    const searchQuery = req.query.q;

    if (!searchQuery) return res.redirect("/dashboard");

    const query = `SELECT * FROM posts WHERE title LIKE ?`;

    db.all(query, [`%${searchQuery}%`], (err, posts) => {
        if (err) return res.send("Error retrieving search results.");

        // searchQuery escaped in the view using <%= %>
        res.render("searchResults", {
            searchQuery,
            posts,
            user: req.session.user,
        });
    });
});

module.exports = router;
