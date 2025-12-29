const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const url=["http://192.168.29.45:3000","http://localhost:3000","https://xc-ui-be.onrender.com","https://xplocode.vercel.app"]

require('./config/passport');

const authRoutes = require('./routes/authRoutes');

const app = express();
const userRoutes = require("./routes/userRoutes");

app.use("/api/users", userRoutes);

app.use(express.json());
app.use(cookieParser());


app.use("/api/user", userRoutes);

app.use(
  cors({
    origin: url,
    credentials: true
  })
);

app.use(passport.initialize());

app.use('/auth', authRoutes);

module.exports = app;
