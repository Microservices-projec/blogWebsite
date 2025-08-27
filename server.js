const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./utils/userUtils');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Environment variables check
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.SESSION_SECRET) {
  console.error('Missing required environment variables. Please check your .env file');
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
  console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
  console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? 'Set' : 'Not set');
  process.exit(1);
}

// Session middleware - sirf ek baar use karein
app.use(session({
  secret: process.env.SESSION_SECRET,  // session secret 
  resave: false,      // save session
  saveUninitialized: false,  // empty session will not save
  cookie: { secure: false } // development ke liye false rakhein
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport session serialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google Strategy configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `http://localhost:3000/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => {
  User.findOrCreate(profile, (err, user) => {
    return done(err, user);
  });
}));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Auth routes - ye add karna important hai
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home
    res.redirect('/');
  }
);

// Logout route - Updated version
app.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/');
    }
    res.redirect('/');
  });
});

// Get current user API endpoint
app.get('/api/user', (req, res) => {
  res.json({ user: req.user || null });
});

// routes serve for CRUD blog
const blogRoutes = require("./routes/routes");
app.use("/api/blogs", blogRoutes);

// pages serve
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.get("/blogs", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "blogs.html"));
});

app.get("/create", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "create.html"));
});

app.listen(3000, () => console.log(" Server running at http://localhost:3000"));