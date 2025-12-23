const { generateToken } = require('../utils/token');

exports.googleSuccess = (req, res) => {
  const token = generateToken(req.user._id);

  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // true in production
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.redirect(`${process.env.FRONTEND_URL}/login-success`);
};
