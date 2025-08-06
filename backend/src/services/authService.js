const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../database/connection');

class AuthService {
  constructor() {
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.FRONTEND_URL}/auth/callback`
    );
  }

  async verifyGoogleToken(token) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      return ticket.getPayload();
    } catch (error) {
      throw new Error('Invalid Google token');
    }
  }

  async findOrCreateUser(googlePayload) {
    const { sub: googleId, email, name, picture } = googlePayload;

    return await db.transaction(async (client) => {
      let userResult = await client.query(
        'SELECT u.*, t.name as tenant_name, t.subscription_tier FROM users u JOIN tenants t ON u.tenant_id = t.id WHERE u.google_id = $1',
        [googleId]
      );

      if (userResult.rows.length > 0) {
        await client.query(
          'UPDATE users SET last_login_at = NOW() WHERE id = $1',
          [userResult.rows[0].id]
        );
        return userResult.rows[0];
      }

      userResult = await client.query(
        'SELECT u.*, t.name as tenant_name, t.subscription_tier FROM users u JOIN tenants t ON u.tenant_id = t.id WHERE u.email = $1',
        [email]
      );

      if (userResult.rows.length > 0) {
        await client.query(
          'UPDATE users SET google_id = $1, avatar_url = $2, last_login_at = NOW() WHERE id = $3',
          [googleId, picture, userResult.rows[0].id]
        );
        return { ...userResult.rows[0], google_id: googleId, avatar_url: picture };
      }

      const domain = email.split('@')[1];
      const tenantResult = await client.query(
        'INSERT INTO tenants (name, domain) VALUES ($1, $2) RETURNING *',
        [name || email.split('@')[0], domain]
      );

      const tenant = tenantResult.rows[0];

      const newUserResult = await client.query(
        `INSERT INTO users (tenant_id, email, name, google_id, avatar_url, role, last_login_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
        [tenant.id, email, name, googleId, picture, 'admin']
      );

      return {
        ...newUserResult.rows[0],
        tenant_name: tenant.name,
        subscription_tier: tenant.subscription_tier
      };
    });
  }

  generateJWT(user) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      tenant_id: user.tenant_id,
      role: user.role,
      tier: user.subscription_tier || 'free'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
      issuer: 'govconone',
      audience: 'govconone-users'
    });
  }

  verifyJWT(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'govconone',
        audience: 'govconone-users'
      });
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }

  async getUserById(userId) {
    const result = await db.query(
      'SELECT u.*, t.name as tenant_name, t.subscription_tier FROM users u JOIN tenants t ON u.tenant_id = t.id WHERE u.id = $1 AND u.is_active = true',
      [userId]
    );
    return result.rows[0] || null;
  }

  async updateUserLastLogin(userId) {
    await db.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [userId]
    );
  }
}

module.exports = new AuthService();
