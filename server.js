const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Import routes
const blogRoutes = require("./routes/routes");

// API Routes
app.use("/api/blogs", blogRoutes);

// Serve static frontend files (html, css, js)
app.use(express.static(path.join(__dirname, "public")));

// Default route -> Home page
app.get("/", (req, res) => {
  res.send("hello ")
  res.sendFile(path.join(__dirname, "public", "home.html"));
});



// Start server
app.listen(3000, () => {
  console.log(`Server is running at http://localhost:3000`);
});
