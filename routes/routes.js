const express = require("express");  // initialize expree
const router = express.Router();  //  for enable routing   
const blogController = require("../controllers/blogController");

router.get("/", blogController.getblogs);
router.get("/:id", blogController.getblogById);
router.post("/", blogController.createblog);
router.put("/:id", blogController.updateblog);
router.delete("/:id", blogController.deleteblog);


module.exports = router;
