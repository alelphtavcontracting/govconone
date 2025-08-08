const express = require('express');
const authService = require('../services/authService');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
const authService = require('../services/authService');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await authService.getUserByEmail(email);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.password_hash) {
      return res.status(401).json({ error: 'Please use Google Sign-In for this account' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const jwt = authService.generateJWT(user);
    
    res.json({
      success: true,
      token: jwt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        tier: user.subscription_tier || 'free',
        tenant_id: user.tenant_id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const existingUser = await authService.getUserByEmail(email);
    
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    const user = await authService.createUserWithPassword({
      email,
      name,
      password_hash: passwordHash
    });
    
    const jwt = authService.generateJWT(user);
    
    res.status(201).json({
      success: true,
      token: jwt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        tier: user.subscription_tier || 'free',
        tenant_id: user.tenant_id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
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

router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    const googleProfile = await authService.verifyGoogleToken(token);
    
    const user = await authService.findOrCreateUser(googleProfile);
    
    const jwt = authService.generateJWT(user);
    
    res.json({
      success: true,
      token: jwt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        tier: user.subscription_tier || 'free',
        tenant_id: user.tenant_id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const googleProfile = await authService.exchangeCodeForProfile(code);
    
    const user = await authService.findOrCreateUser(googleProfile);
    
    const jwt = authService.generateJWT(user);
    
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${jwt}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
  }
});

router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = authService.verifyJWT(token);
    const user = await authService.getUserById(decoded.id);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        tier: user.subscription_tier || 'free',
        tenant_id: user.tenant_id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = authService.verifyJWT(token);
    const user = await authService.getUserById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      tier: user.subscription_tier || 'free',
      tenant_name: user.tenant_name,
      role: user.role,
      created_at: user.created_at,
      last_login: user.last_login
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
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
