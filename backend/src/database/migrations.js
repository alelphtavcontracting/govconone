const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

class MigrationManager {
  constructor(databaseUrl) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async createMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await this.pool.query(query);
  }

  async getExecutedMigrations() {
    const result = await this.pool.query('SELECT name FROM migrations ORDER BY id');
    return result.rows.map(row => row.name);
  }

  async executeMigration(name, sql) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
      await client.query('COMMIT');
      console.log(`Migration ${name} executed successfully`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async runMigrations() {
    try {
      await this.createMigrationsTable();
      
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      
      for (const file of migrationFiles) {
        if (!executedMigrations.includes(file.name)) {
          console.log(`Running migration: ${file.name}`);
          await this.executeMigration(file.name, file.sql);
        } else {
          console.log(`Migration ${file.name} already executed, skipping`);
        }
      }
      
      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  async getMigrationFiles() {
    const migrationsDir = path.join(__dirname, 'migrations');
    
    try {
      await fs.access(migrationsDir);
    } catch {
      await fs.mkdir(migrationsDir, { recursive: true });
    }

    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();
    
    const migrations = [];
    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf8');
      migrations.push({
        name: file,
        sql: sql
      });
    }
    
    return migrations;
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = MigrationManager;
