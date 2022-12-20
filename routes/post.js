const express = require("express");
const router = express.Router();
const { viewPosts, createPosts, updatePost, deletePost } = require("../controllers/postController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/", verifyToken, viewPosts);
router.post("/new", verifyToken, createPosts);
router.put("/update", verifyToken, updatePost);
router.delete("/delete", verifyToken, deletePost);

module.exports = router;