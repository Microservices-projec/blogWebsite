const express = require("express");  // initialize expree
const router = express.Router();  //  for enable routing 
const path = require("path");   // for path setting 

router.get("/", (req, res) => {
  //res.send(" Welcome to our Website"); // for normal message
  res.sendFile(path.join(__dirname, "../public/home.html"));
});

router.get("/create", (req, res) => {
  //res.send(" Welcome to Create Blog page"); // for normal message
  res.sendFile(path.join(__dirname,"../public/create.html"))
});

router.get("/blogs", (req, res) => {
  //res.send(" Welcome to All Blogs page ");  // for normal message
  res.sendFile(path.join(__dirname,"../public/blogs.html"))
});


module.exports = router;
