const express = require("express");
const app = express();
const routes = require("./routes/routes");

app.use(express.json());

// Routes use karo
app.use("/", routes);

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});