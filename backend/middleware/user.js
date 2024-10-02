const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user");
dotenv.config();

const authMiddleware = async (req, res, next) => {
  try {
    // const token = req.headers['auth-token'];
    // const token = req.headers.authorization;
    const token =
      req.body.token || req.headers.authorization.replace("Bearer ", "");
console.log("Token: ", token);
    if (!token) {
      return res.status(401).json({ message: "Access denied" });
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!verified) {
      return res.status(401).json({ message: "Access denied" });
    }
    const user = await User.findOne({ _id: verified._id });
    if (!user) {
      return res.status(401).json({ message: "Access denied" });
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
