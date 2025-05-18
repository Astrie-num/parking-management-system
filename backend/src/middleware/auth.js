// const jwt = require('jsonwebtoken');

// const authenticate = (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');
//   if (!token) return res.status(401).json({ error: 'Access denied' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ error: 'Invalid token' });
//   }
// };

// const isAdmin = (req, res, next) => {
//   if (req.user.role !== 'admin') {
//     return res.status(403).json({ error: 'Admin access required' });
//   }
//   next();
// };

// module.exports = { authenticate, isAdmin };

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(401).json({ error: `Invalid or expired token: ${err.message}` });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authenticate, isAdmin };