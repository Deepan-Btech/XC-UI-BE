const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");

const { getAllUsers } = require("../controllers/userController");

const router = express.Router();
router.get("/", requireAuth, getAllUsers);
router.get("/profile", requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

module.exports = router;
