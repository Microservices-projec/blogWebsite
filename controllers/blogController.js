const db = require("../databases/db");

// Get all blogs
exports.getblogs = (req, res) => {
  db.query("SELECT * FROM blogs", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

// Get single blog
exports.getblogById = (req, res) => {
  db.query("SELECT * FROM blogs WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send("Blog not found");
    res.json(results[0]);
  });
};

// Create blog
exports.createblog = (req, res) => {
  const { title, content } = req.body;
  db.query("INSERT INTO blogs (title, content) VALUES (?, ?)", [title, content], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ id: result.insertId, title, content });
  });
};

// Update blog
exports.updateblog = (req, res) => {
  const { title, content } = req.body;
  db.query("UPDATE blogs SET title=?, content=? WHERE id=?", [title, content, req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Blog updated" });
  });
};

// Delete blog
exports.deleteblog = (req, res) => {
  db.query("DELETE FROM blogs WHERE id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Blog deleted" });
  });
};
