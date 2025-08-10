const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  try {
    console.log('🔌 Подключаемся к PostgreSQL...');
    
    // Создаем таблицы
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id BIGINT UNIQUE NOT NULL,
        username VARCHAR(255),
        first_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
        color VARCHAR(7) DEFAULT '#3B82F6',
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS budget_alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        limit_amount DECIMAL(10,2) NOT NULL,
        current_amount DECIMAL(10,2) DEFAULT 0,
        period VARCHAR(50) DEFAULT 'month' CHECK (period IN ('week', 'month', 'year')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        target_amount DECIMAL(10,2) NOT NULL,
        current_amount DECIMAL(10,2) DEFAULT 0,
        deadline DATE,
        is_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Создаем индексы для производительности
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_budget_alerts_user_id ON budget_alerts(user_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);');
    
    console.log('✅ База данных успешно настроена!');
    console.log('📊 Созданы таблицы: users, categories, transactions, budget_alerts, goals');
    console.log('🚀 Индексы созданы для оптимизации производительности');
    
  } catch (error) {
    console.error('❌ Ошибка при настройке базы данных:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Запускаем настройку, если файл вызван напрямую
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('🎉 Настройка завершена успешно!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Критическая ошибка:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase;
