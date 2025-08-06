const authService = require('../services/authService');
const db = require('../database/connection');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || token === 'demo-jwt-token-for-development' || token === 'null' || token === 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      req.user = {
        id: '1',
        email: 'demo@govconone.com',
        name: 'Demo User',
        tier: 'free',
        tenant_id: 'demo-tenant',
        role: 'admin'
      };
      return next();
    } else {
      return res.status(401).json({ error: 'Authentication required' });
    }
  }

  try {
    const decoded = authService.verifyJWT(token);
    const user = await authService.getUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      tenant_id: user.tenant_id,
      role: user.role,
      tier: user.subscription_tier || 'free'
    };

    if (req.user.tenant_id !== 'demo-tenant') {
      const client = await db.getClient();
      try {
        await db.setTenantContext(client, req.user.tenant_id);
        req.dbClient = client;
      } catch (error) {
        client.release();
        throw error;
      }
    }

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
