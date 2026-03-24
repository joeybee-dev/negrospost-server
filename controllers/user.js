const User = require("../models/User");
const auth = require("../middlewares/auth");

// Register user
module.exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send({
        error: "Username, email, and password are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).send({
        error: "Email already registered"
      });
    }

    const newUser = new User({
      username,
      email,
      password
    });

    const savedUser = await newUser.save();

    return res.status(201).send({
      message: "User registered successfully",
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email
      }
    });
  } catch (err) {
    console.error("Register user error:", err);
    return res.status(500).send({
      error: "Failed to register user"
    });
  }
};


// Login user
module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        error: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).send({
        error: "Invalid email or password"
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).send({
        error: "Invalid email or password"
      });
    }

    const access = auth.createAccessToken(user);

    return res.status(200).send({
      message: "Login successful",
      access,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error("Login user error:", err);
    return res.status(500).send({
      error: "Failed to login"
    });
  }
};

// Get logged-in user details
module.exports.userDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).send({
        error: "User not found"
      });
    }

    return res.status(200).send({ user });
  } catch (err) {
    console.error("User details error:", err);
    return res.status(500).send({
      error: "Failed to fetch user details"
    });
  }
};