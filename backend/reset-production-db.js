const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetDatabase() {
  try {
    console.log('🗑️ Сбрасываем базу данных...');
    
    // Удаляем существующие таблицы
    await pool.query('DROP TABLE IF EXISTS budget_alerts CASCADE;');
    await pool.query('DROP TABLE IF EXISTS goals CASCADE;');
    await pool.query('DROP TABLE IF EXISTS transactions CASCADE;');
    await pool.query('DROP TABLE IF EXISTS categories CASCADE;');
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');
    
    console.log('✅ Существующие таблицы удалены');
    
    // Создаем таблицы заново
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        telegram_id BIGINT UNIQUE NOT NULL,
        username VARCHAR(255),
        first_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE categories (
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
      CREATE TABLE transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        description TEXT,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE budget_alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        limit_amount DECIMAL(10,2) NOT NULL,
        current_amount DECIMAL(10,2) DEFAULT 0,
        period VARCHAR(50) DEFAULT 'month' CHECK (period IN ('week', 'month', 'year')),
        is_active BOOLEAN DEFAULT true,
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE goals (
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
    await pool.query('CREATE INDEX idx_transactions_user_id ON transactions(user_id);');
    await pool.query('CREATE INDEX idx_transactions_date ON transactions(date);');
    await pool.query('CREATE INDEX idx_transactions_type ON transactions(type);');
    await pool.query('CREATE INDEX idx_categories_user_id ON categories(user_id);');
    await pool.query('CREATE INDEX idx_budget_alerts_user_id ON budget_alerts(user_id);');
    await pool.query('CREATE INDEX idx_goals_user_id ON goals(user_id);');
    
    console.log('✅ База данных успешно сброшена и пересоздана!');
    console.log('📊 Созданы таблицы: users, categories, transactions, budget_alerts, goals');
    console.log('🚀 Индексы созданы для оптимизации производительности');
    
  } catch (error) {
    console.error('❌ Ошибка при сбросе базы данных:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Запускаем сброс, если файл вызван напрямую
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('🎉 Сброс завершен успешно!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Критическая ошибка:', error);
      process.exit(1);
    });
}

module.exports = resetDatabase;
