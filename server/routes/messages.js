const express = require("express");
const GroupMessage = require("../models/GroupMessage");

const router = express.Router();

// Get last 50 messages for a room (most recent last)
router.get("/group/:room", async (req, res) => {
  try {
    const room = decodeURIComponent(req.params.room);

    const msgs = await GroupMessage.find({ room })
      .sort({ date_sent: 1 })
      .limit(50);

    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
