#!/usr/bin/env node

const MigrationManager = require('../database/migrations');
const logger = require('../utils/logger');

async function runMigrations() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    logger.info('Starting database migrations...');
    const migrationManager = new MigrationManager(databaseUrl);
    await migrationManager.runMigrations();
    await migrationManager.close();
    logger.info('Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed', { error: error.message });
    process.exit(1);
  }
}

runMigrations();
