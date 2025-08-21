const express = require("express");
const app = express();
const routes = require("./routes/routes");
const path = require("path");

app.use(express.json());

// Routes use karo
app.use("/", routes);

//static file dene ke liye
app.use(express.static(path.join(__dirname, "public")));

app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
