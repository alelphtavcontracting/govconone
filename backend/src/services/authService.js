const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../database/connection');

class AuthService {
  constructor() {
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
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
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  async exchangeCodeForProfile(code) {
    try {
      const { tokens } = await this.googleClient.getToken(code);
      this.googleClient.setCredentials(tokens);
      
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      
      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        email_verified: payload.email_verified
      };
    } catch (error) {
      console.error('Google code exchange failed:', error);
      throw new Error('Failed to exchange authorization code');
    }
  }

  async findOrCreateUser(googleProfile) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      let userResult = await client.query(
        'SELECT * FROM users WHERE google_id = $1 OR email = $2',
        [googleProfile.sub, googleProfile.email]
      );
      
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        await client.query(
          'UPDATE users SET last_login = CURRENT_TIMESTAMP, avatar_url = $1 WHERE id = $2',
          [googleProfile.picture, user.id]
        );
        
        await client.query('COMMIT');
        return user;
      }
      
      const tenantResult = await client.query(
        'INSERT INTO tenants (name, subscription_tier) VALUES ($1, $2) RETURNING *',
        [googleProfile.name + '\'s Organization', 'free']
      );
      
      const tenant = tenantResult.rows[0];
      
      const newUserResult = await client.query(
        `INSERT INTO users (tenant_id, email, name, google_id, avatar_url, role, last_login) 
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING *`,
        [tenant.id, googleProfile.email, googleProfile.name, googleProfile.sub, googleProfile.picture, 'admin']
      );
      
      await client.query('COMMIT');
      
      const newUser = newUserResult.rows[0];
      newUser.tenant = tenant;
      
      return newUser;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getUserById(userId) {
    try {
      const result = await db.query(
        `SELECT u.*, t.name as tenant_name, t.subscription_tier, t.subscription_status 
         FROM users u 
         JOIN tenants t ON u.tenant_id = t.id 
         WHERE u.id = $1 AND u.is_active = true`,
        [userId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const result = await db.query(
        `SELECT u.*, t.name as tenant_name, t.subscription_tier, t.subscription_status 
         FROM users u 
         JOIN tenants t ON u.tenant_id = t.id 
         WHERE u.email = $1 AND u.is_active = true`,
        [email]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  generateJWT(user) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      tenant_id: user.tenant_id,
      tier: user.subscription_tier || 'free',
      role: user.role
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
      console.error('JWT verification failed:', error);
      throw new Error('Invalid token');
    }
  }

  async logAIUsage(userId, tenantId, feature, model, tokensUsed, costCents, requestData, responseData) {
    try {
      await db.query(
        `INSERT INTO ai_usage_logs (tenant_id, user_id, feature, model_used, tokens_used, cost_cents, request_data, response_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [tenantId, userId, feature, model, tokensUsed, costCents, requestData, responseData]
      );
    } catch (error) {
      console.error('Error logging AI usage:', error);
    }
  }

  async getTenantUsage(tenantId, startDate, endDate) {
    try {
      const result = await db.query(
        `SELECT feature, model_used, SUM(tokens_used) as total_tokens, SUM(cost_cents) as total_cost_cents, COUNT(*) as request_count
         FROM ai_usage_logs 
         WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
         GROUP BY feature, model_used
         ORDER BY total_cost_cents DESC`,
        [tenantId, startDate, endDate]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching tenant usage:', error);
      throw error;
    }
  }

  async createUserWithPassword(userData) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      const tenantResult = await client.query(
        'INSERT INTO tenants (name, subscription_tier) VALUES ($1, $2) RETURNING *',
        [userData.name + '\'s Organization', 'free']
      );
      
      const tenant = tenantResult.rows[0];
      
      const newUserResult = await client.query(
        `INSERT INTO users (tenant_id, email, name, password_hash, role, last_login) 
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`,
        [tenant.id, userData.email, userData.name, userData.password_hash, 'admin']
      );
      
      await client.query('COMMIT');
      
      const newUser = newUserResult.rows[0];
      newUser.tenant = tenant;
      newUser.subscription_tier = tenant.subscription_tier;
      
      return newUser;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating user with password:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new AuthService();
