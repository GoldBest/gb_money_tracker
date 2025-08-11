const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/gbmoneytracker',
  ssl: false
});

async function recreateTransactionsTable() {
  try {
    console.log('🔄 Пересоздаю таблицу transactions...');
    
    // Удаляем существующую таблицу
    await pool.query('DROP TABLE IF EXISTS transactions CASCADE');
    console.log('✅ Старая таблица transactions удалена');
    
    // Создаем новую таблицу с правильной структурой
    await pool.query(`
      CREATE TABLE transactions (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        category_id INTEGER REFERENCES categories(id),
        user_id INTEGER REFERENCES users(id),
        date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Новая таблица transactions создана');
    
    console.log('🎉 Таблица transactions успешно пересоздана!');
    
  } catch (error) {
    console.error('❌ Ошибка при пересоздании таблицы:', error);
  } finally {
    await pool.end();
    console.log('🔒 Соединение с базой данных закрыто');
  }
}

recreateTransactionsTable();
