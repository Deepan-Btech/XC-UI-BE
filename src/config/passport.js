const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const CALLBACK_URL =
  process.env.NODE_ENV === "production"
    ? "https://xplocode.onrender.com/auth/google/callback"
    : "http://localhost:4000/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL
    },
    async (_, __, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value
          });
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
