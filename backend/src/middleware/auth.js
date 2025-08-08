const authService = require('../services/authService');
const db = require('../database/connection');

const authenticateToken = async (req, res, next) => {
  // Handle development environment with demo user
  if (process.env.NODE_ENV === 'development') {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    // Check for demo token or no token in development
    if (!token || token === 'demo-jwt-token-for-development' || token === 'null' || token === 'undefined') {
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
  }

  // Production or token provided in development
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify JWT token
    const decoded = authService.verifyJWT(token);
    const user = await authService.getUserById(decoded.id);
    
    // Check if user exists and is active
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Set user object on request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.subscription_tier || 'free',
      tenant_id: user.tenant_id,
      role: user.role
    };

    // Set up tenant context for non-demo tenants
    if (req.user.tenant_id && req.user.tenant_id !== 'demo-tenant') {
      const client = await db.getClient();
      try {
        await db.setTenantContext(client, req.user.tenant_id);
        // Store client on request for later cleanup
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
