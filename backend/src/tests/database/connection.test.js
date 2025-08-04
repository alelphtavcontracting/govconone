const db = require('../../database/connection');

describe('Database Connection', () => {
  it('should execute a simple query', async () => {
    const result = await db.query('SELECT 1 as test');
    expect(result.rows[0].test).toBe(1);
  });

  it('should handle transactions', async () => {
    const result = await db.transaction(async (client) => {
      const res = await client.query('SELECT 2 as test');
      return res.rows[0];
    });
    
    expect(result.test).toBe(2);
  });

  it('should rollback failed transactions', async () => {
    try {
      await db.transaction(async (client) => {
        await client.query('SELECT 1');
        throw new Error('Test error');
      });
    } catch (error) {
      expect(error.message).toBe('Test error');
    }
  });
});
