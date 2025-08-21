const express = require("express");
const router = express.Router();

const app = express();

router.get("/", (req, res) => {
  res.send(" Welcome to our Website");
});

router.get("/create", (req, res) => {
  res.send(" Welcome to Create Blog page");
});

router.get("/blogs", (req, res) => {
  res.send(" Welcome to All Blogs page ");
});


module.exports = router;
