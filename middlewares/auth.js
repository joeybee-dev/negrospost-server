const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not defined in .env");
}

// Create token
const createAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin
    },
    secret,
    { expiresIn: "1d" }
  );
};

// Verify token
const verify = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).send({
      error: "Unauthorized"
    });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      return res.status(401).send({
        error: "Invalid or expired token"
      });
    }

    req.user = decodedToken;
    next();
  });
};

// Verify admin
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.isAdmin !== true) {
    return res.status(403).send({
      error: "Admin access required"
    });
  }

  next();
};

module.exports = {
  createAccessToken,
  verify,
  verifyAdmin
};