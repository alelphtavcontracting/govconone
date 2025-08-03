const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const requireTier = (requiredTier) => {
  const tierLevels = { free: 1, pro: 2, elite: 3 };
  
  return (req, res, next) => {
    const userTier = req.user.tier || 'free';
    const userLevel = tierLevels[userTier] || 1;
    const requiredLevel = tierLevels[requiredTier] || 1;
    
    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        error: 'Upgrade required',
        required_tier: requiredTier,
        current_tier: userTier
      });
    }
    
    next();
  };
};

module.exports = {
  authenticateToken,
  requireTier
};
