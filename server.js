const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send(" Welcome to our Website");
});

app.get("/create", (req, res) => {
  res.send(" Welcome to Create Blog page");
});

app.get("/blogs", (req, res) => {
  res.send(" Welcome to All Blogs page ");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
