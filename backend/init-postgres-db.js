const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDatabase() {
  try {
    console.log('🔄 Инициализация PostgreSQL базы данных...');
    
    // Create tables
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
        user_id INTEGER REFERENCES users(id),
        is_default BOOLEAN DEFAULT false
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
    
    // Create default categories (без привязки к пользователю)
    const defaultCategories = [
      // Доходы
      { name: 'Зарплата', type: 'income', color: '#10B981' },
      { name: 'Подработка', type: 'income', color: '#06B6D4' },
      { name: 'Инвестиции', type: 'income', color: '#8B5CF6' },
      { name: 'Подарки', type: 'income', color: '#F59E0B' },
      { name: 'Возврат', type: 'income', color: '#84CC16' },
      { name: 'Проценты', type: 'income', color: '#22C55E' },
      { name: 'Продажи', type: 'income', color: '#14B8A6' },
      
      // Расходы
      { name: 'Продукты', type: 'expense', color: '#EF4444' },
      { name: 'Транспорт', type: 'expense', color: '#F59E0B' },
      { name: 'Коммунальные', type: 'expense', color: '#8B5CF6' },
      { name: 'Интернет/Телефон', type: 'expense', color: '#06B6D4' },
      { name: 'Здоровье', type: 'expense', color: '#EC4899' },
      { name: 'Лекарства', type: 'expense', color: '#F97316' },
      { name: 'Страховка', type: 'expense', color: '#6366F1' },
      { name: 'Развлечения', type: 'expense', color: '#8B5CF6' },
      { name: 'Рестораны', type: 'expense', color: '#F59E0B' },
      { name: 'Кафе', type: 'expense', color: '#EF4444' },
      { name: 'Одежда', type: 'expense', color: '#EC4899' },
      { name: 'Красота', type: 'expense', color: '#F97316' },
      { name: 'Спорт', type: 'expense', color: '#10B981' },
      { name: 'Кино/Театр', type: 'expense', color: '#8B5CF6' },
      { name: 'Хобби', type: 'expense', color: '#06B6D4' },
      { name: 'Дом/Ремонт', type: 'expense', color: '#F59E0B' },
      { name: 'Мебель', type: 'expense', color: '#EF4444' },
      { name: 'Техника', type: 'expense', color: '#6366F1' },
      { name: 'Образование', type: 'expense', color: '#14B8A6' },
      { name: 'Книги', type: 'expense', color: '#84CC16' },
      { name: 'Путешествия', type: 'expense', color: '#06B6D4' },
      { name: 'Отель', type: 'expense', color: '#8B5CF6' },
      { name: 'Благотворительность', type: 'expense', color: '#F59E0B' },
      { name: 'Прочее', type: 'expense', color: '#6B7280' }
    ];
    
    // Вставляем категории без user_id (они будут копироваться для новых пользователей)
    for (const category of defaultCategories) {
      await pool.query(
        'INSERT INTO categories (name, type, color, is_default) VALUES ($1, $2, $3, $4) ON CONFLICT (name, type) DO NOTHING',
        [category.name, category.type, category.color, true]
      );
    }
    
    console.log(`✅ Создано ${defaultCategories.length} базовых категорий`);
    
    // Создаем индексы для оптимизации
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);');
    
    console.log('✅ Индексы созданы');
    
    console.log('🎉 База данных инициализирована успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при инициализации:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run initialization if called directly
if (require.main === module) {
  initDatabase().catch(console.error);
}

module.exports = { initDatabase };
