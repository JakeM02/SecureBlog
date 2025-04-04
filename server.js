require("dotenv").config();
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const session = require("express-session");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const db = new sqlite3.Database("./db/blog.db");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// sessions
app.use(
  session({
    secret: process.env.SECRET || "insecure_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.render("login"); 
});


app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register"); 
});

app.get('/myblogs', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); 
  } // Redirect if not logged in

  const username = req.session.user.username;

  db.all('SELECT * FROM posts WHERE created_by = ?', [username], (err, userBlogs) => {
    if (err) {
      console.error("Error fetching user blogs:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.render('myblogs', { user: req.session.user, posts: userBlogs });
  });
});




// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
