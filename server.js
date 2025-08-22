const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const blogRoutes = require("./routes/routes");
app.use("/api/blogs", blogRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.listen(3000, () => console.log(" Server running at http://localhost:3000"));
