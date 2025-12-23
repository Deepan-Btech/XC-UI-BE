const express = require('express');
const passport = require('passport');
const { googleSuccess } = require('../controllers/authController');

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  googleSuccess
);

module.exports = router;
