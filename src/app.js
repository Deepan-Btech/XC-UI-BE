const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');

require('./config/passport');

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);

app.use(passport.initialize());

app.use('/auth', authRoutes);

module.exports = app;
