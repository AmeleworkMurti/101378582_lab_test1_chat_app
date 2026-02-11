const express = require("express");
const User = require("../models/User");

const router = express.Router();

// signup
router.post("/signup", async (req, res) => {
  try {
    const { username, firstname, lastname, password } = req.body;

    if (!username || !firstname || !lastname || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const user = await User.create({ username, firstname, lastname, password });
    return res.status(201).json({ message: "Signup successful", user: { username: user.username } });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // frontend will store session in localStorage
    return res.json({
      message: "Login successful",
      user: { username: user.username, firstname: user.firstname, lastname: user.lastname }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
