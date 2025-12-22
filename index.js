// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const crypto = require('crypto');

const User = require('./models/User'); // Make sure this path is correct

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.29.45:3000",
  "http://192.168.29.100:3000",
  "http://192.168.29.163:3000", // Add your frontend dev IP if needed
  // Add production origin later, e.g., "https://yourapp.com"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// POST /api/auth/google - Login with Google access token
app.post("/api/auth/google", async (req, res) => {
  const { token } = req.body; // This is the access_token from useGoogleLogin()

  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }

  try {
    // IMPORTANT: Use Authorization Bearer header (not query param)
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const googleUser = response.data;

    // Basic validation
    if (!googleUser.sub) {
      return res.status(400).json({ error: "Invalid Google user data" });
    }

    if (!googleUser.email_verified) {
      return res.status(400).json({ error: "Email not verified by Google" });
    }

    // Find or create user
    let user = await User.findOne({ googleId: googleUser.sub });

    if (!user) {
      // Check if email already exists (prevent duplicate emails)
      const existingUser = await User.findOne({ email: googleUser.email });
      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }

      // Create new user
      user = new User({
        googleId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name || null,
        picture: googleUser.picture || null,
      });
      await user.save();
    } else {
      // Update profile info if changed
      user.name = googleUser.name || user.name;
      user.picture = googleUser.picture || user.picture;
      await user.save();
    }

    // Create session token (simple random string - improve with DB/Redis in production)
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Set httpOnly cookie
    res.cookie("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: sessionExpires,
      path: "/",
    });

    // Respond with user data
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
  console.error("Full error object:", error);
  console.error("Error message:", error.message);
  console.error("Error code:", error.code); // e.g., ENOTFOUND, ECONNREFUSED
  console.error("Axios response:", error.response?.data);
  console.error("Axios status:", error.response?.status);

  if (error.response?.status === 401 || error.response?.status === 400) {
    return res.status(401).json({ error: "Invalid or expired Google token" });
  }

  res.status(500).json({ error: "Server error during authentication" });
}
});

// GET /api/me - Get current logged-in user
app.get("/api/me", async (req, res) => {
  const token = req.cookies.session_token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // For demo: just return first user (replace with proper session validation later)
  // In production: store sessionToken → userId in DB/Redis and validate here
  const user = await User.findOne();

  if (!user) {
    return res.status(401).json({ error: "Invalid session" });
  }

  res.json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  });
});

// POST /api/auth/logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("session_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.json({ success: true });
});


// GET /api/users - List all users (Admin-only or protected route)
app.get("/api/users", async (req, res) => {
  // Optional: Add authentication check here
  // For now, we'll allow it if session cookie exists (you can make it stricter later)
  const token = req.cookies.session_token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Fetch all users from MongoDB (select only needed fields)
    const users = await User.find({}, { googleId: 1, email: 1, name: 1, picture: 1, _id: 1 });

    // Optional: Remove sensitive data
    const safeUsers = users.map(user => ({
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    }));

    res.json({
      success: true,
      count: safeUsers.length,
      users: safeUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error while fetching users" });
  }
});


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});