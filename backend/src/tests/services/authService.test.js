const authService = require('../../services/authService');
const db = require('../../database/connection');

describe('AuthService', () => {
  describe('generateJWT', () => {
    it('should generate a valid JWT token', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        tenant_id: 'tenant-123',
        role: 'admin',
        subscription_tier: 'pro'
      };

      const token = authService.generateJWT(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyJWT', () => {
    it('should verify a valid JWT token', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        tenant_id: 'tenant-123',
        role: 'admin',
        subscription_tier: 'pro'
      };

      const token = authService.generateJWT(user);
      const decoded = authService.verifyJWT(token);

      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.tenant_id).toBe(user.tenant_id);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        authService.verifyJWT('invalid-token');
      }).toThrow('Invalid JWT token');
    });
  });

  describe('findOrCreateUser', () => {
    it('should create new tenant and user for new Google user', async () => {
      const googlePayload = {
        sub: 'google-123',
        email: 'newuser@example.com',
        name: 'New User',
        picture: 'https://example.com/avatar.jpg'
      };

      const user = await authService.findOrCreateUser(googlePayload);

      expect(user.email).toBe(googlePayload.email);
      expect(user.name).toBe(googlePayload.name);
      expect(user.google_id).toBe(googlePayload.sub);
      expect(user.role).toBe('admin');
      expect(user.tenant_id).toBeDefined();
    });

    it('should return existing user for known Google ID', async () => {
      const googlePayload = {
        sub: 'google-456',
        email: 'existing@example.com',
        name: 'Existing User',
        picture: 'https://example.com/avatar.jpg'
      };

      const firstUser = await authService.findOrCreateUser(googlePayload);
      const secondUser = await authService.findOrCreateUser(googlePayload);

      expect(firstUser.id).toBe(secondUser.id);
      expect(firstUser.tenant_id).toBe(secondUser.tenant_id);
    });
  });
});
