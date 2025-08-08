const { Pool } = require('pg');

const testDb = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/govconone_test',
  ssl: false
});

beforeAll(async () => {
  const MigrationManager = require('../database/migrations');
  const migrationManager = new MigrationManager(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/govconone_test');
  await migrationManager.runMigrations();
  await migrationManager.close();
});

afterEach(async () => {
  await testDb.query('TRUNCATE TABLE ai_usage_logs, capability_statements, subcontractors, contracts, opportunities, documents, users, tenants RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await testDb.end();
});

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
