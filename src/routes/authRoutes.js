const express = require('express');
const passport = require('passport');
const { googleSuccess } = require('../controllers/authController');

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email',] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`
  }),
  googleSuccess
);


// router.get("/token", (req, res) => {
//   const token = req.cookies.access_token;

//   if (!token) {
//     return res.status(401).json({ message: "Token not found" });
//   }

//   res.status(200).json({ token });
// });




module.exports = router;
