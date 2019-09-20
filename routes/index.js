const express = require("express");

const router = express.Router();

// a friendly greeting for the root route
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Book Trader REST API!"
  });
});

module.exports = router;
