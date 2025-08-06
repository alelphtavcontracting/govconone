const express = require('express');
const authService = require('../services/authService');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    const googlePayload = await authService.verifyGoogleToken(token);
    
    const user = await authService.findOrCreateUser(googlePayload);
    
    const jwt = authService.generateJWT(user);
    
    res.json({
      token: jwt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role,
        tenant_id: user.tenant_id,
        tenant_name: user.tenant_name,
        tier: user.subscription_tier || 'free'
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    await authService.updateUserLastLogin(req.user.id);
    
    const user = await authService.getUserById(req.user.id);
    const jwt = authService.generateJWT(user);
    
    res.json({
      token: jwt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role,
        tenant_id: user.tenant_id,
        tenant_name: user.tenant_name,
        tier: user.subscription_tier || 'free'
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      role: user.role,
      tenant_id: user.tenant_id,
      tenant_name: user.tenant_name,
      tier: user.subscription_tier || 'free'
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

router.post('/logout', authenticateToken, async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
