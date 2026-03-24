const express = require("express");
const router = express.Router();
const postController = require("../controllers/post");
const { verify } = require("../middlewares/auth");

// Public
router.get("/all", postController.getAllPosts);
router.get("/:id", postController.getPostById);

// Logged-in users
router.post("/create", verify, postController.createPost);
router.patch("/:id", verify, postController.updatePost);
router.delete("/:id", verify, postController.deletePost);

module.exports = router;