const authService = require('../services/authService');

const authenticateToken = async (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    req.user = {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'demo@govconone.com',
      name: 'Demo User',
      tier: 'pro',
      tenant_id: '00000000-0000-0000-0000-000000000001',
      role: 'admin'
    };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = authService.verifyJWT(token);
    const user = await authService.getUserById(decoded.id);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.subscription_tier,
      tenant_id: user.tenant_id,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
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
