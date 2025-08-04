const request = require('supertest');
const express = require('express');
const { authenticateToken, requireTier } = require('../../middleware/auth');
const authService = require('../../services/authService');

const app = express();
app.use(express.json());

app.get('/protected', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.get('/pro-only', authenticateToken, requireTier('pro'), (req, res) => {
  res.json({ message: 'Pro tier access granted' });
});

describe('Auth Middleware', () => {
  describe('authenticateToken', () => {
    it('should allow demo user in development', async () => {
      process.env.NODE_ENV = 'development';
      
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer demo-jwt-token-for-development');

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('demo@govconone.com');
    });

    it('should reject requests without token in production', async () => {
      process.env.NODE_ENV = 'production';
      
      const response = await request(app)
        .get('/protected');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
      
      process.env.NODE_ENV = 'test';
    });

    it('should validate JWT token', async () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        tenant_id: 'tenant-123',
        role: 'admin',
        subscription_tier: 'pro'
      };

      jest.spyOn(authService, 'getUserById').mockResolvedValue(user);

      const token = authService.generateJWT(user);
      
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(user.id);
      
      authService.getUserById.mockRestore();
    });
  });

  describe('requireTier', () => {
    it('should allow access for sufficient tier', async () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        tenant_id: 'tenant-123',
        role: 'admin',
        subscription_tier: 'pro'
      };

      jest.spyOn(authService, 'getUserById').mockResolvedValue(user);
      const token = authService.generateJWT(user);
      
      const response = await request(app)
        .get('/pro-only')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      
      authService.getUserById.mockRestore();
    });

    it('should deny access for insufficient tier', async () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        tenant_id: 'tenant-123',
        role: 'admin',
        subscription_tier: 'free'
      };

      jest.spyOn(authService, 'getUserById').mockResolvedValue(user);
      const token = authService.generateJWT(user);
      
      const response = await request(app)
        .get('/pro-only')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Upgrade required');
      
      authService.getUserById.mockRestore();
    });
  });
});
