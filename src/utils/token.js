const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
