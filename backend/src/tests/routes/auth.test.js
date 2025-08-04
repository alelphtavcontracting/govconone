const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');
const authService = require('../../services/authService');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  describe('POST /api/auth/google', () => {
    it('should authenticate user with valid Google token', async () => {
      const mockGooglePayload = {
        sub: 'google-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg'
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        google_id: 'google-123',
        avatar_url: 'https://example.com/avatar.jpg',
        role: 'admin',
        tenant_id: 'tenant-123',
        tenant_name: 'Test Tenant',
        subscription_tier: 'free'
      };

      jest.spyOn(authService, 'verifyGoogleToken').mockResolvedValue(mockGooglePayload);
      jest.spyOn(authService, 'findOrCreateUser').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'generateJWT').mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/api/auth/google')
        .send({ token: 'valid-google-token' });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('mock-jwt-token');
      expect(response.body.user.email).toBe('test@example.com');

      authService.verifyGoogleToken.mockRestore();
      authService.findOrCreateUser.mockRestore();
      authService.generateJWT.mockRestore();
    });

    it('should return 400 for missing token', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Google token is required');
    });

    it('should return 401 for invalid Google token', async () => {
      jest.spyOn(authService, 'verifyGoogleToken').mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .post('/api/auth/google')
        .send({ token: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication failed');

      authService.verifyGoogleToken.mockRestore();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user information for authenticated user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        role: 'admin',
        tenant_id: 'tenant-123',
        tenant_name: 'Test Tenant',
        subscription_tier: 'free'
      };

      jest.spyOn(authService, 'getUserById').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'verifyJWT').mockReturnValue({ id: 'user-123' });

      const token = 'valid-jwt-token';
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('test@example.com');

      authService.getUserById.mockRestore();
      authService.verifyJWT.mockRestore();
    });
  });
});
