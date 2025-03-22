const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/blog.db");

// Create tables
db.serialize(() => {
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

    
    // Creates Admin User
    db.run(`INSERT INTO users (username, password, role) VALUES ('admin', 'admin', 'admin')`);

    console.log("Database initialized!");
});

db.close();
