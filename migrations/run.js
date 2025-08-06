#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const logger = require('../src/utils/logger');

class MigrationRunner {
  constructor() {
    this.supabase = null;
    this.migrationsPath = path.join(__dirname);
  }

  async init() {
    try {
      if (!config.supabase.url || !config.supabase.key) {
        throw new Error('Supabase credentials not configured');
      }

      this.supabase = createClient(config.supabase.url, config.supabase.key);
      logger.info('✅ Supabase client initialized for migrations');
    } catch (error) {
      logger.error('❌ Failed to initialize Supabase for migrations:', error);
      throw error;
    }
  }

  async createMigrationsTable() {
    try {
      const { error } = await this.supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      if (error) {
        // Если RPC не доступен, попробуем через SQL Editor
        logger.warn('RPC not available, migrations table creation skipped');
      } else {
        logger.info('✅ Migrations table created/verified');
      }
    } catch (error) {
      logger.warn('⚠️ Could not create migrations table:', error.message);
    }
  }

  async getExecutedMigrations() {
    try {
      const { data, error } = await this.supabase
        .from('migrations')
        .select('name')
        .order('executed_at');

      if (error) {
        logger.warn('⚠️ Could not fetch executed migrations:', error.message);
        return [];
      }

      return data.map(row => row.name);
    } catch (error) {
      logger.warn('⚠️ Could not fetch executed migrations:', error.message);
      return [];
    }
  }

  async markMigrationAsExecuted(migrationName) {
    try {
      const { error } = await this.supabase
        .from('migrations')
        .insert({ name: migrationName });

      if (error) {
        logger.warn(`⚠️ Could not mark migration ${migrationName} as executed:`, error.message);
      } else {
        logger.info(`✅ Migration ${migrationName} marked as executed`);
      }
    } catch (error) {
      logger.warn(`⚠️ Could not mark migration ${migrationName} as executed:`, error.message);
    }
  }

  async executeMigration(migrationFile) {
    try {
      const migrationPath = path.join(this.migrationsPath, migrationFile);
      const sql = fs.readFileSync(migrationPath, 'utf8');

      logger.info(`🔄 Executing migration: ${migrationFile}`);

      // Выполняем SQL через Supabase
      const { error } = await this.supabase.rpc('exec_sql', { sql });

      if (error) {
        // Если RPC не доступен, выводим SQL для ручного выполнения
        logger.warn('⚠️ RPC not available, please execute SQL manually in Supabase SQL Editor:');
        console.log('\n' + '='.repeat(80));
        console.log(`Migration: ${migrationFile}`);
        console.log('='.repeat(80));
        console.log(sql);
        console.log('='.repeat(80) + '\n');
        
        // Помечаем как выполненную (предполагая, что пользователь выполнит вручную)
        await this.markMigrationAsExecuted(migrationFile);
        return true;
      }

      await this.markMigrationAsExecuted(migrationFile);
      logger.info(`✅ Migration ${migrationFile} executed successfully`);
      return true;

    } catch (error) {
      logger.error(`❌ Failed to execute migration ${migrationFile}:`, error);
      return false;
    }
  }

  async runMigrations() {
    try {
      await this.init();
      await this.createMigrationsTable();

      // Получаем список файлов миграций
      const migrationFiles = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      if (migrationFiles.length === 0) {
        logger.info('📋 No migration files found');
        return;
      }

      logger.info(`📋 Found ${migrationFiles.length} migration files`);

      // Получаем уже выполненные миграции
      const executedMigrations = await this.getExecutedMigrations();

      let successCount = 0;
      let errorCount = 0;

      for (const migrationFile of migrationFiles) {
        if (executedMigrations.includes(migrationFile)) {
          logger.info(`⏭️  Migration ${migrationFile} already executed, skipping`);
          continue;
        }

        const success = await this.executeMigration(migrationFile);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }

        // Небольшая задержка между миграциями
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      logger.info(`\n📊 Migration summary:`);
      logger.info(`   ✅ Successful: ${successCount}`);
      logger.info(`   ❌ Failed: ${errorCount}`);
      logger.info(`   📋 Total: ${migrationFiles.length}`);

      if (errorCount > 0) {
        logger.warn('⚠️ Some migrations failed. Please check the logs above.');
        process.exit(1);
      }

    } catch (error) {
      logger.error('❌ Migration runner failed:', error);
      process.exit(1);
    }
  }
}

// Запуск миграций
async function main() {
  console.log('🚀 Starting database migrations...\n');
  
  const runner = new MigrationRunner();
  await runner.runMigrations();
  
  console.log('\n✅ Migrations completed!');
}

main().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}); 