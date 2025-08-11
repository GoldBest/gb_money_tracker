const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/gbmoneytracker',
  ssl: false
});

async function seedData() {
  try {
    console.log('🌱 Добавляю тестовые данные в PostgreSQL...');
    
    // Создаем тестового пользователя
    const userResult = await pool.query(`
      INSERT INTO users (telegram_id, username, first_name) 
      VALUES ('123456789', 'test_user', 'Test User')
      ON CONFLICT (telegram_id) DO NOTHING
      RETURNING id
    `);
    
    let userId;
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
      console.log('✅ Тестовый пользователь создан с ID:', userId);
    } else {
      // Получаем существующего пользователя
      const existingUser = await pool.query('SELECT id FROM users WHERE telegram_id = $1', ['123456789']);
      userId = existingUser.rows[0].id;
      console.log('✅ Используем существующего пользователя с ID:', userId);
    }
    
    // Создаем базовые категории
    const defaultCategories = [
      { name: 'Продукты', type: 'expense', color: '#EF4444' },
      { name: 'Транспорт', type: 'expense', color: '#F59E0B' },
      { name: 'Развлечения', type: 'expense', color: '#8B5CF6' },
      { name: 'Коммунальные', type: 'expense', color: '#EC4899' },
      { name: 'Зарплата', type: 'income', color: '#10B981' },
      { name: 'Подработка', type: 'income', color: '#06B6D4' },
      { name: 'Инвестиции', type: 'income', color: '#84CC16' },
      { name: 'Подарки', type: 'income', color: '#F97316' }
    ];
    
    for (const category of defaultCategories) {
      await pool.query(`
        INSERT INTO categories (name, type, color, user_id) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [category.name, category.type, category.color, userId]);
    }
    console.log('✅ Базовые категории созданы');
    
    // Получаем ID категорий для создания транзакций
    const categories = await pool.query('SELECT id, name FROM categories WHERE user_id = $1', [userId]);
    const categoryMap = {};
    categories.rows.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });
    
    // Добавляем тестовые транзакции
    const testTransactions = [
      { amount: 50000, description: 'Зарплата за август', type: 'income', category_id: categoryMap['Зарплата'], date: '2024-08-01' },
      { amount: 1500, description: 'Продукты на неделю', type: 'expense', category_id: categoryMap['Продукты'], date: '2024-08-05' },
      { amount: 500, description: 'Проезд на метро', type: 'expense', category_id: categoryMap['Транспорт'], date: '2024-08-06' },
      { amount: 2000, description: 'Поход в кино', type: 'expense', category_id: categoryMap['Развлечения'], date: '2024-08-07' }
    ];
    
    for (const transaction of testTransactions) {
      await pool.query(`
        INSERT INTO transactions (amount, description, type, category_id, user_id, date) 
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [transaction.amount, transaction.description, transaction.type, transaction.category_id, userId, transaction.date]);
    }
    console.log('✅ Тестовые транзакции добавлены');
    
    console.log('🎉 Все тестовые данные успешно добавлены!');
    
  } catch (error) {
    console.error('❌ Ошибка при добавлении тестовых данных:', error);
  } finally {
    await pool.end();
    console.log('🔒 Соединение с базой данных закрыто');
  }
}

seedData();
