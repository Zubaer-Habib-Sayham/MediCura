const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// Simple auth middleware that reads JWT from httpOnly cookie
module.exports = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
