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

// Show create post form
router.get("/create", isAuthenticated, (req, res) => {
    res.render("createPost");
});

// Handle creating a new post
router.post("/create", (req, res) => {
    const { title, content } = req.body;
    const user_id = req.session.user.id;
    const created_by = req.session.user.username; 

    const query = `INSERT INTO posts (title, content, user_id, created_by, created_at) VALUES (?, ?, ?, ?, datetime('now'))`;
    db.run(query, [title, content, user_id, created_by], function (err) {
        if (err) return res.send("Error creating post: " + err.message);
        res.redirect("/dashboard");
    });
});


// Show edit post form
router.get("/edit/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM posts WHERE id = ?`, [id], (err, post) => {
        if (err || !post) return res.send("Post not found");
        res.render("editPost", { post });
    });
});

// Handle editing a post
router.post("/edit/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    db.run(`UPDATE posts SET title = ?, content = ? WHERE id = ?`, [title, content, id], function (err) {
        if (err) return res.send("Error updating post");
        res.redirect("/dashboard");
    });
});

// Handle deleting a post (Only Admins & Post Creators)
router.get("/delete/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    const user = req.session.user;

    db.get(`SELECT user_id FROM posts WHERE id = ?`, [id], (err, post) => {
        if (err || !post) return res.send("Post not found");

        if (user.username === "admin" || user.id == post.user_id) {
            db.run(`DELETE FROM posts WHERE id = ?`, [id], function (err) {
                if (err) return res.send("Error deleting post");
                res.redirect("/dashboard");
            });
        } else {
            res.send("Unauthorized to delete this post");
        }
    });
});


// Fetch all posts & show in dashboard
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


module.exports = router;
