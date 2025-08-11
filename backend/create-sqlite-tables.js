const Database = require('better-sqlite3');
const path = require('path');

// Создаем подключение к SQLite базе данных
const dbPath = path.join(__dirname, 'money_tracker.db');
const db = new Database(dbPath);

console.log('🗄️ Подключение к SQLite базе данных:', dbPath);

async function createTables() {
  try {
    console.log('🔄 Создаю таблицы в SQLite...');
    
    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id TEXT UNIQUE NOT NULL,
        username TEXT,
        first_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Таблица users создана');
    
    // Create categories table
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        color TEXT DEFAULT '#3B82F6',
        user_id INTEGER REFERENCES users(id)
      );
    `);
    console.log('✅ Таблица categories создана');
    
    // Create transactions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        category_id INTEGER REFERENCES categories(id),
        user_id INTEGER REFERENCES users(id),
        date DATE DEFAULT CURRENT_DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Таблица transactions создана');
    
    // Create backups table
    db.exec(`
      CREATE TABLE IF NOT EXISTS backups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        description TEXT,
        data TEXT NOT NULL,
        size INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Таблица backups создана');
    
    // Create budget_alerts table
    db.exec(`
      CREATE TABLE IF NOT EXISTS budget_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        category_id INTEGER NOT NULL REFERENCES categories(id),
        limit_amount DECIMAL(10,2) NOT NULL,
        period TEXT NOT NULL CHECK(period IN ('daily', 'weekly', 'monthly')),
        enabled BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Таблица budget_alerts создана');
    
    // Create goals table
    db.exec(`
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        target_amount DECIMAL(10,2) NOT NULL,
        current_amount DECIMAL(10,2) DEFAULT 0,
        deadline DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Таблица goals создана');
    
    // Create notifications table
    db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Таблица notifications создана');
    
    // Insert default categories for user ID 1
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
    
    // Сначала создаем тестового пользователя
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, telegram_id, username, first_name) 
      VALUES (1, '123456789', 'test_user', 'Test User')
    `);
    insertUser.run();
    console.log('✅ Тестовый пользователь создан');
    
    // Создаем категории для пользователя
    const insertCategory = db.prepare(`
      INSERT OR IGNORE INTO categories (name, type, color, user_id) 
      VALUES (?, ?, ?, 1)
    `);
    
    for (const category of defaultCategories) {
      insertCategory.run(category.name, category.type, category.color);
    }
    console.log('✅ Базовые категории созданы');
    
    // Добавляем несколько тестовых транзакций
    const insertTransaction = db.prepare(`
      INSERT OR IGNORE INTO transactions (amount, description, type, category_id, user_id, date) 
      VALUES (?, ?, ?, ?, 1, ?)
    `);
    
    // Тестовые транзакции
    const testTransactions = [
      { amount: 50000, description: 'Зарплата за август', type: 'income', category_id: 5, date: '2024-08-01' },
      { amount: 1500, description: 'Продукты на неделю', type: 'expense', category_id: 1, date: '2024-08-05' },
      { amount: 500, description: 'Проезд на метро', type: 'expense', category_id: 2, date: '2024-08-06' },
      { amount: 2000, description: 'Поход в кино', type: 'expense', category_id: 3, date: '2024-08-07' }
    ];
    
    for (const transaction of testTransactions) {
      insertTransaction.run(
        transaction.amount,
        transaction.description,
        transaction.type,
        transaction.category_id,
        transaction.date
      );
    }
    console.log('✅ Тестовые транзакции добавлены');
    
    console.log('🎉 Все таблицы и тестовые данные успешно созданы!');
    
  } catch (error) {
    console.error('❌ Ошибка при создании таблиц:', error);
  } finally {
    db.close();
    console.log('🔒 Соединение с базой данных закрыто');
  }
}

createTables();
