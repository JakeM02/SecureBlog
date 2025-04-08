require("dotenv").config();
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const session = require("express-session");
const csurf = require("csurf");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const db = new sqlite3.Database("./db/blog.db");

// Middleware 
app.use(morgan("combined"));
app.use(cookieParser()); 
app.use(bodyParser.urlencoded({ extended: true }));

// Sessions
app.use(session({
  name: "session_id",
  secret: process.env.SECRET || "insecure_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60
  }
}));

// CSRF protection 
const csrfProtection = csurf();
app.use(csrfProtection);

// Helmet (security headers)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
    styleSrc: ["'self'", "https://cdn.jsdelivr.net"],
  }
}));

// View engine & static files
app.use(express.static("public"));
app.set("view engine", "ejs");

// Inject csrfToken + user into all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/dashboard", dashboardRoutes);

// Views
app.get("/", (req, res) => res.render("login"));
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));

app.get("/myblogs", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const username = req.session.user.username;
  db.all("SELECT * FROM posts WHERE created_by = ?", [username], (err, userBlogs) => {
    if (err) {
      console.error("Error fetching user blogs:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("myblogs", { posts: userBlogs });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
