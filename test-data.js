const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/gbmoneytracker',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function insertTestData() {
  try {
    console.log('🔄 Добавляю тестовые данные...');
    
    // Create test user
    const userResult = await pool.query(
      'INSERT INTO users (telegram_id, username, first_name) VALUES ($1, $2, $3) RETURNING id',
      ['123456789', 'testuser', 'Test User']
    );
    const userId = userResult.rows[0].id;
    console.log(`✅ Создан пользователь с ID: ${userId}`);
    
    // Create test categories
    const categories = [
      { name: 'Продукты', type: 'expense', color: '#EF4444' },
      { name: 'Транспорт', type: 'expense', color: '#F59E0B' },
      { name: 'Зарплата', type: 'income', color: '#10B981' }
    ];
    
    for (const category of categories) {
      const result = await pool.query(
        'INSERT INTO categories (name, type, color, user_id) VALUES ($1, $2, $3, $4) RETURNING id',
        [category.name, category.type, category.color, userId]
      );
      console.log(`✅ Создана категория: ${category.name} (ID: ${result.rows[0].id})`);
    }
    
    // Create test transactions
    const transactions = [
      { amount: 1500.50, description: 'Покупка продуктов', type: 'expense', category_id: 1 },
      { amount: 500.00, description: 'Такси', type: 'expense', category_id: 2 },
      { amount: 50000.00, description: 'Зарплата за месяц', type: 'income', category_id: 3 }
    ];
    
    for (const transaction of transactions) {
      const result = await pool.query(
        'INSERT INTO transactions (amount, description, type, category_id, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [transaction.amount, transaction.description, transaction.type, transaction.category_id, userId]
      );
      console.log(`✅ Создана транзакция: ${transaction.description} (ID: ${result.rows[0].id})`);
    }
    
    console.log('🎉 Тестовые данные успешно добавлены!');
    
    // Show summary
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
    const transactionCount = await pool.query('SELECT COUNT(*) FROM transactions');
    
    console.log(`📊 Итого в базе:`);
    console.log(`   - Пользователей: ${userCount.rows[0].count}`);
    console.log(`   - Категорий: ${categoryCount.rows[0].count}`);
    console.log(`   - Транзакций: ${transactionCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Ошибка при добавлении тестовых данных:', error);
  } finally {
    await pool.end();
  }
}

insertTestData();
