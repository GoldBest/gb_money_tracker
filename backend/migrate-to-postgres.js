const { Pool } = require('pg');
const Database = require('better-sqlite3');
const fs = require('fs');

// SQLite database
const sqliteDb = new Database('money.db');

// PostgreSQL connection (will be set via environment)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateData() {
  try {
    console.log('🔄 Начинаю миграцию данных с SQLite на PostgreSQL...');
    
    // Create tables in PostgreSQL
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id TEXT UNIQUE NOT NULL,
        username TEXT,
        first_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        color TEXT DEFAULT '#3B82F6',
        user_id INTEGER REFERENCES users(id)
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        category_id INTEGER REFERENCES categories(id),
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS backups (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        description TEXT,
        data TEXT NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS budget_alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        category_id INTEGER NOT NULL REFERENCES categories(id),
        limit_amount DECIMAL(10,2) NOT NULL,
        period TEXT NOT NULL CHECK(period IN ('daily', 'weekly', 'monthly')),
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Таблицы созданы в PostgreSQL');
    
    // Migrate users
    const users = sqliteDb.prepare('SELECT * FROM users').all();
    for (const user of users) {
      await pool.query(
        'INSERT INTO users (id, telegram_id, username, first_name, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [user.id, user.telegram_id, user.username, user.first_name, user.created_at]
      );
    }
    console.log(`✅ Мигрировано пользователей: ${users.length}`);
    
    // Migrate categories
    const categories = sqliteDb.prepare('SELECT * FROM categories').all();
    for (const category of categories) {
      await pool.query(
        'INSERT INTO categories (id, name, type, color, user_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [category.id, category.name, category.type, category.color, category.user_id]
      );
    }
    console.log(`✅ Мигрировано категорий: ${categories.length}`);
    
    // Migrate transactions
    const transactions = sqliteDb.prepare('SELECT * FROM transactions').all();
    for (const transaction of transactions) {
      await pool.query(
        'INSERT INTO transactions (id, amount, description, type, category_id, user_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
        [transaction.id, transaction.amount, transaction.description, transaction.type, transaction.category_id, transaction.user_id, transaction.created_at]
      );
    }
    console.log(`✅ Мигрировано транзакций: ${transactions.length}`);
    
    // Migrate budget alerts
    const budgetAlerts = sqliteDb.prepare('SELECT * FROM budget_alerts').all();
    for (const alert of budgetAlerts) {
      await pool.query(
        'INSERT INTO budget_alerts (id, user_id, category_id, limit_amount, period, enabled, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
        [alert.id, alert.user_id, alert.category_id, alert.limit_amount, alert.period, alert.enabled, alert.created_at]
      );
    }
    console.log(`✅ Мигрировано бюджетных уведомлений: ${budgetAlerts.length}`);
    
    console.log('🎉 Миграция завершена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при миграции:', error);
    throw error;
  } finally {
    await pool.end();
    sqliteDb.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateData().catch(console.error);
}

module.exports = { migrateData };
