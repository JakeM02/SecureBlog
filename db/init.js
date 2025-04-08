const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const db = new sqlite3.Database("./db/blog.db");

const saltRounds = 10; // Number of salt rounds for bcrypt

// Create tables
db.serialize(async () => {
    db.run("DROP TABLE IF EXISTS users");
    db.run("DROP TABLE IF EXISTS posts");

    // Users Table
    db.run(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        )
    `);

    // Posts Table
    db.run(`
        CREATE TABLE posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_by TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Hash the admin password
    const hashedPassword = await bcrypt.hash('admin', saltRounds);

    // Creates Admin User
    db.run(`INSERT INTO users (username, password, role) VALUES ('admin', ?, 'admin')`, [hashedPassword], function(err) {
        if (err) {
            return console.error("Error creating admin user:", err.message);
        }
        console.log("Admin user created with hashed password!");
    });

    console.log("Database initialized!");
});

db.close();
