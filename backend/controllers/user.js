const User = require("../models/user");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
var bcrypt = require("bcryptjs");
dotenv.config();

exports.signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);

    const user = await User.findOne({ username });
    if (user) {
      return res.status(200).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({username, password: hashedPassword });
    await newUser.save();
    res
      .status(201)
      .json({
        success: true,
        data: newUser,
        message: "Account created successfully",
      });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const {username, password } = req.body;
    const user = await User.findOne({username: username });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
     
    const validatePassword = await bcrypt.compare(password, user.password);
    if (!validatePassword) {
      return res.status(400).json({ message: "Wrong email or password" });
    }
    console.log("user_id: " + user._id);
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);
    res.setHeader("Authorization", `Bearer ${token}`);
    return res.json({ message: "Logged in successfully", token, user });
  } catch (error) {
    next(error);
  }
};


