const { generateToken } = require("../utils/token");

exports.googleSuccess = (req, res) => {
  const token = generateToken(req.user);

  console.log("JWT TOKEN:", token); // 🔴 ADD THIS LINE

  res.redirect(
    `${process.env.FRONTEND_URL}/?token=${encodeURIComponent(token)}`
  );
};

