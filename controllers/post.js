const Post = require("../models/Post");
const User = require("../models/User");

// Create post
module.exports.createPost = async (req, res) => {
  try {
    const { title, content, information } = req.body;

    if (!title || !content) {
      return res.status(400).send({
        error: "Title and content are required"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).send({
        error: "User not found"
      });
    }

    const newPost = new Post({
      title,
      content,
      information: information || "",
      author: user.username,
      userId: user._id
    });

    const savedPost = await newPost.save();

    return res.status(201).send({
      message: "Post created successfully",
      post: savedPost
    });
  } catch (err) {
    console.error("Create post error:", err);
    return res.status(500).send({
      error: "Failed to create post"
    });
  }
};

// Get all posts
module.exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });

    return res.status(200).send({
      posts
    });
  } catch (err) {
    console.error("Get all posts error:", err);
    return res.status(500).send({
      error: "Failed to fetch posts"
    });
  }
};

// Get single post
module.exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send({
        error: "Post not found"
      });
    }

    return res.status(200).send({
      post
    });
  } catch (err) {
    console.error("Get post by ID error:", err);
    return res.status(500).send({
      error: "Failed to fetch post"
    });
  }
};

// Update own post only
module.exports.updatePost = async (req, res) => {
  try {
    const { title, content, information } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send({
        error: "Post not found"
      });
    }

    if (String(post.userId) !== String(req.user.id)) {
      return res.status(403).send({
        error: "You are not allowed to update this post"
      });
    }

    post.title = title ?? post.title;
    post.content = content ?? post.content;
    post.information = information ?? post.information;

    const updatedPost = await post.save();

    return res.status(200).send({
      message: "Post updated successfully",
      post: updatedPost
    });
  } catch (err) {
    console.error("Update post error:", err);
    return res.status(500).send({
      error: "Failed to update post"
    });
  }
};

// Delete own post or admin
module.exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send({
        error: "Post not found"
      });
    }

    const isOwner = String(post.userId) === String(req.user.id);
    const isAdmin = req.user.isAdmin === true;

    if (!isOwner && !isAdmin) {
      return res.status(403).send({
        error: "You are not allowed to delete this post"
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      message: "Post deleted successfully"
    });
  } catch (err) {
    console.error("Delete post error:", err);
    return res.status(500).send({
      error: "Failed to delete post"
    });
  }
};