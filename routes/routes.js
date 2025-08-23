const express = require("express");  // initialize expree
const router = express.Router();  //  for enable routing   
const blogController = require("../controllers/blogController"); // logic of web after routing
const passport = require('passport'); // auth routing
const authMiddleware = require('../middleware/authMiddleware');  // to secure routing 

router.get("/", blogController.getblogs);
router.get("/:id", blogController.getblogById);
router.post("/", blogController.createblog);
router.put("/:id", blogController.updateblog);
router.delete("/:id", blogController.deleteblog);

// Auth Routes
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// is authenticated or not
router.get('/api/user', (req, res) => {
  res.json({ user: req.user || null });
});

// Protect the create route
router.get('/create', authMiddleware.isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/create.html'));
});

// API route to create a blog
router.post('/api/blogs', authMiddleware.isAuthenticated, (req, res) => {
  // Add user_id to the blog data
  const blogData = {
    ...req.body,
    user_id: req.user.id
  };
});

module.exports = router;
