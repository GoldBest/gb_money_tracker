const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://localhost:5176',
    'https://*.ngrok-free.app',
    'https://*.ngrok.io',
    'https://103ff5d4ede5.ngrok-free.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
app.use(express.json());

// Database setup
const db = new Database('money.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    color TEXT DEFAULT '#3B82F6',
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    category_id INTEGER,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    data TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS budget_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    limit_amount DECIMAL(10,2) NOT NULL,
    period TEXT NOT NULL CHECK(period IN ('daily', 'weekly', 'monthly')),
    enabled BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (category_id) REFERENCES categories (id)
  );
`);

// Default categories for new users
const defaultCategories = [
  // Income categories
  { name: 'Зарплата', type: 'income', color: '#10B981' },
  { name: 'Подработка', type: 'income', color: '#059669' },
  { name: 'Инвестиции', type: 'income', color: '#047857' },
  { name: 'Подарки', type: 'income', color: '#065F46' },
  { name: 'Возврат', type: 'income', color: '#064E3B' },
  { name: 'Проценты', type: 'income', color: '#0D9488' },
  { name: 'Продажи', type: 'income', color: '#14B8A6' },
  
  // Essential expense categories
  { name: 'Продукты', type: 'expense', color: '#EF4444' },
  { name: 'Транспорт', type: 'expense', color: '#F59E0B' },
  { name: 'Коммунальные', type: 'expense', color: '#DC2626' },
  { name: 'Интернет/Телефон', type: 'expense', color: '#B91C1C' },
  { name: 'Здоровье', type: 'expense', color: '#06B6D4' },
  { name: 'Лекарства', type: 'expense', color: '#0891B2' },
  { name: 'Страховка', type: 'expense', color: '#0EA5E9' },
  
  // Lifestyle expense categories
  { name: 'Развлечения', type: 'expense', color: '#8B5CF6' },
  { name: 'Рестораны', type: 'expense', color: '#7C3AED' },
  { name: 'Кафе', type: 'expense', color: '#9333EA' },
  { name: 'Одежда', type: 'expense', color: '#EC4899' },
  { name: 'Красота', type: 'expense', color: '#DB2777' },
  { name: 'Спорт', type: 'expense', color: '#BE185D' },
  { name: 'Кино/Театр', type: 'expense', color: '#A855F7' },
  { name: 'Хобби', type: 'expense', color: '#C084FC' },
  
  // Home and other categories
  { name: 'Дом/Ремонт', type: 'expense', color: '#84CC16' },
  { name: 'Мебель', type: 'expense', color: '#65A30D' },
  { name: 'Техника', type: 'expense', color: '#4D7C0F' },
  { name: 'Образование', type: 'expense', color: '#3F6212' },
  { name: 'Книги', type: 'expense', color: '#166534' },
  { name: 'Путешествия', type: 'expense', color: '#15803D' },
  { name: 'Отель', type: 'expense', color: '#16A34A' },
  { name: 'Подарки', type: 'expense', color: '#22C55E' },
  { name: 'Благотворительность', type: 'expense', color: '#4ADE80' },
  
  // Other categories
  { name: 'Прочее', type: 'income', color: '#6B7280' },
  { name: 'Прочее', type: 'expense', color: '#6B7280' }
];

// API Routes

// Get or create user
app.post('/api/users', (req, res) => {
  try {
    const { telegram_id, username, first_name } = req.body;
    
    let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegram_id);
    
    if (!user) {
      const stmt = db.prepare('INSERT INTO users (telegram_id, username, first_name) VALUES (?, ?, ?)');
      const result = stmt.run(telegram_id, username, first_name);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
      
      // Create default categories for new user
      const categoryStmt = db.prepare('INSERT INTO categories (name, type, color, user_id) VALUES (?, ?, ?, ?)');
      defaultCategories.forEach(category => {
        categoryStmt.run(category.name, category.type, category.color, user.id);
      });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user categories
app.get('/api/users/:userId/categories', (req, res) => {
  try {
    const { userId } = req.params;
    const categories = db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY name').all(userId);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create category
app.post('/api/categories', (req, res) => {
  try {
    const { name, type, color, user_id } = req.body;
    const stmt = db.prepare('INSERT INTO categories (name, type, color, user_id) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name, type, color, user_id);
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create default categories for existing user
app.post('/api/users/:userId/categories/default', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Check if user already has categories
    const existingCategories = db.prepare('SELECT COUNT(*) as count FROM categories WHERE user_id = ?').get(userId);
    if (existingCategories.count > 0) {
      return res.status(400).json({ 
        error: 'У пользователя уже есть категории',
        message: 'Базовые категории создаются только для пользователей без существующих категорий'
      });
    }
    
    // Create default categories
    const categoryStmt = db.prepare('INSERT INTO categories (name, type, color, user_id) VALUES (?, ?, ?, ?)');
    const createdCategories = [];
    
    defaultCategories.forEach(category => {
      const result = categoryStmt.run(category.name, category.type, category.color, userId);
      const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
      createdCategories.push(newCategory);
    });
    
    res.json({
      success: true,
      message: `Создано ${createdCategories.length} базовых категорий`,
      categories: createdCategories
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get default categories (for reference)
app.get('/api/categories/default', (req, res) => {
  try {
    res.json({
      success: true,
      categories: defaultCategories,
      total: defaultCategories.length,
      income_count: defaultCategories.filter(c => c.type === 'income').length,
      expense_count: defaultCategories.filter(c => c.type === 'expense').length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transactions
app.get('/api/users/:userId/transactions', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, period } = req.query;
    
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND t.created_at >= datetime('now', '-7 days')";
    } else if (period === 'month') {
      dateFilter = "AND t.created_at >= datetime('now', '-30 days')";
    } else if (period === 'quarter') {
      dateFilter = "AND t.created_at >= datetime('now', '-90 days')";
    } else if (period === 'year') {
      dateFilter = "AND t.created_at >= datetime('now', '-365 days')";
    }
    // Для period === 'all' фильтр не применяется
    
    // Если limit === '10000', то получаем все транзакции без лимита
    let queryLimit = limit;
    let queryOffset = offset;
    
    if (limit === '10000') {
      queryLimit = 999999; // Большое число для получения всех транзакций
      queryOffset = 0;
    }
    
    const transactions = db.prepare(`
      SELECT t.*, c.name as category_name, c.color as category_color 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.user_id = ? ${dateFilter}
      ORDER BY t.created_at DESC 
      LIMIT ? OFFSET ?
    `).all(userId, queryLimit, queryOffset);
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Function to check budget limits
function checkBudgetLimits(userId, categoryId, amount, type) {
  if (type === 'expense') {
    // Get budget alerts for this category
    const budgetAlerts = db.prepare(`
      SELECT * FROM budget_alerts 
      WHERE user_id = ? AND category_id = ? AND enabled = 1
    `).all(userId, categoryId);
    
    const warnings = [];
    
    for (const alert of budgetAlerts) {
      let currentSpending = 0;
      
      if (alert.period === 'daily') {
        currentSpending = db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as total 
          FROM transactions 
          WHERE user_id = ? AND category_id = ? AND type = 'expense' 
          AND DATE(created_at) = DATE('now')
        `).get(userId, categoryId).total;
      } else if (alert.period === 'weekly') {
        currentSpending = db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as total 
          FROM transactions 
          WHERE user_id = ? AND category_id = ? AND type = 'expense' 
          AND created_at >= datetime('now', '-7 days')
        `).get(userId, categoryId).total;
      } else if (alert.period === 'monthly') {
        currentSpending = db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as total 
          FROM transactions 
          WHERE user_id = ? AND category_id = ? AND type = 'expense' 
          AND created_at >= datetime('now', '-30 days')
        `).get(userId, categoryId).total;
      }
      
      const newTotal = currentSpending + amount;
      
      // Get category name for the message
      const category = db.prepare('SELECT name FROM categories WHERE id = ?').get(alert.category_id);
      const categoryName = category ? category.name : 'Неизвестная категория';
      
      if (newTotal > alert.limit_amount) {
        warnings.push({
          type: 'budget_exceeded',
          message: `Превышен лимит бюджета для категории "${categoryName}" (${alert.period})`,
          current: currentSpending,
          limit: alert.limit_amount,
          newTotal: newTotal,
          period: alert.period
        });
      } else if (newTotal > alert.limit_amount * 0.8) {
        warnings.push({
          type: 'budget_warning',
          message: `Приближение к лимиту бюджета для категории "${categoryName}" (${alert.period})`,
          current: currentSpending,
          limit: alert.limit_amount,
          newTotal: newTotal,
          period: alert.period
        });
      }
    }
    
    return warnings;
  }
  
  return [];
}

// Create transaction
app.post('/api/transactions', (req, res) => {
  try {
    const { amount, description, type, category_id, user_id } = req.body;
    
    // Check budget limits before creating transaction
    const budgetWarnings = checkBudgetLimits(user_id, category_id, amount, type);
    
    const stmt = db.prepare('INSERT INTO transactions (amount, description, type, category_id, user_id) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(amount, description, type, category_id, user_id);
    const transaction = db.prepare(`
      SELECT t.*, c.name as category_name, c.color as category_color 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.id = ?
    `).get(result.lastInsertRowid);
    
    res.json({
      ...transaction,
      budgetWarnings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update transaction
app.put('/api/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, type, category_id, user_id } = req.body;
    
    // Проверяем, что транзакция существует и принадлежит пользователю
    const existingTransaction = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(id, user_id);
    
    if (!existingTransaction) {
      return res.status(404).json({ error: 'Транзакция не найдена' });
    }
    
    const stmt = db.prepare('UPDATE transactions SET amount = ?, description = ?, type = ?, category_id = ? WHERE id = ?');
    const result = stmt.run(amount, description, type, category_id, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Транзакция не найдена' });
    }
    
    const updatedTransaction = db.prepare(`
      SELECT t.*, c.name as category_name, c.color as category_color 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.id = ?
    `).get(id);
    
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
app.get('/api/users/:userId/stats', (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND t.created_at >= datetime('now', '-7 days')";
    } else if (period === 'month') {
      dateFilter = "AND t.created_at >= datetime('now', '-30 days')";
    } else if (period === 'quarter') {
      dateFilter = "AND t.created_at >= datetime('now', '-90 days')";
    } else if (period === 'year') {
      dateFilter = "AND t.created_at >= datetime('now', '-365 days')";
    }
    // Для period === 'all' фильтр не применяется
    
    const stats = db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
        COUNT(*) as total_transactions
      FROM transactions t 
      WHERE user_id = ? ${dateFilter}
    `).get(userId);
    
    const categoryStats = db.prepare(`
      SELECT 
        c.name,
        c.color,
        SUM(t.amount) as total,
        COUNT(*) as count
      FROM transactions t 
      JOIN categories c ON t.category_id = c.id 
      WHERE t.user_id = ? AND t.type = 'expense' ${dateFilter}
      GROUP BY c.id 
      ORDER BY total DESC
    `).all(userId);
    
    res.json({
      ...stats,
      categoryStats,
      balance: (stats.total_income || 0) - (stats.total_expense || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete transaction
app.delete('/api/transactions/:id', (req, res) => {
  try {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
  const result = stmt.run(id);
  res.json({ success: result.changes > 0 });
  } catch (error) {
  res.status(500).json({ error: error.message });
  }
});

// Backup API endpoints

// Export user data (backup)
app.get('/api/users/:userId/backup', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user data
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Get categories
    const categories = db.prepare('SELECT * FROM categories WHERE user_id = ?').all(userId);
    
    // Get transactions
    const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ?').all(userId);
    
    // Create backup object
    const backup = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      user: {
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        created_at: user.created_at
      },
      categories: categories,
      transactions: transactions,
      metadata: {
        total_categories: categories.length,
        total_transactions: transactions.length,
        export_date: new Date().toISOString()
      }
    };
    
    res.json(backup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import user data (restore)
app.post('/api/users/:userId/restore', (req, res) => {
  try {
    const { userId } = req.params;
    const backup = req.body;
    
    // Validate backup data
    if (!backup || !backup.version || !backup.categories || !backup.transactions) {
      return res.status(400).json({ error: 'Неверный формат резервной копии' });
    }
    
    // Start transaction
    const transaction = db.transaction(() => {
      // Clear existing data (optional - can be made configurable)
      db.prepare('DELETE FROM transactions WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM categories WHERE user_id = ?').run(userId);
      
      // Restore categories
      const categoryStmt = db.prepare('INSERT INTO categories (name, type, color, user_id) VALUES (?, ?, ?, ?)');
      const categoryMap = new Map(); // Map old category IDs to new ones
      
      backup.categories.forEach(category => {
        const result = categoryStmt.run(category.name, category.type, category.color, userId);
        categoryMap.set(category.id, result.lastInsertRowid);
      });
      
      // Restore transactions
      const transactionStmt = db.prepare('INSERT INTO transactions (amount, description, type, category_id, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)');
      backup.transactions.forEach(transaction => {
        const newCategoryId = categoryMap.get(transaction.category_id);
        if (newCategoryId) {
          transactionStmt.run(
            transaction.amount,
            transaction.description,
            transaction.type,
            newCategoryId,
            userId,
            transaction.created_at
          );
        }
      });
    });
    
    // Execute transaction
    transaction();
    
    res.json({ 
      success: true, 
      message: 'Данные успешно восстановлены',
      restored: {
        categories: backup.categories.length,
        transactions: backup.transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get backup info
app.get('/api/users/:userId/backup/info', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user data
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Get counts
    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories WHERE user_id = ?').get(userId);
    const transactionCount = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE user_id = ?').get(userId);
    
    // Get last transaction date
    const lastTransaction = db.prepare('SELECT created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);
    
    res.json({
      user: {
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name
      },
      data_summary: {
        categories: categoryCount.count,
        transactions: transactionCount.count,
        last_activity: lastTransaction?.created_at || null
      },
      backup_size: {
        categories: categoryCount.count * 100, // Approximate size in bytes
        transactions: transactionCount.count * 200, // Approximate size in bytes
        total: (categoryCount.count * 100) + (transactionCount.count * 200)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get export info
app.get('/api/users/:userId/export-info', (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND t.created_at >= datetime('now', '-7 days')";
    } else if (period === 'month') {
      dateFilter = "AND t.created_at >= datetime('now', '-30 days')";
    } else if (period === 'quarter') {
      dateFilter = "AND t.created_at >= datetime('now', '-90 days')";
    } else if (period === 'year') {
      dateFilter = "AND t.created_at >= datetime('now', '-365 days')";
    }
    // Для period === 'all' фильтр не применяется
    
    const exportInfo = db.prepare(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
        MIN(created_at) as date_from,
        MAX(created_at) as date_to
      FROM transactions t 
      WHERE user_id = ? ${dateFilter}
    `).get(userId);
    
    res.json({
      ...exportInfo,
      period: period,
      balance: (exportInfo.total_income || 0) - (exportInfo.total_expense || 0),
      export_date: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all backups for a user
app.get('/api/backups', (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }
    
    // Get user data to verify user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Get backups from database
    const backups = db.prepare(`
      SELECT id, name, description, size, created_at, 
             (SELECT COUNT(*) FROM transactions WHERE user_id = ?) as transactions_count
      FROM backups 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(user_id, user_id);
    
    res.json(backups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new backup
app.post('/api/backups', (req, res) => {
  try {
    const { user_id, name = 'Автоматическая копия', description } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }
    
    // Get user data
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Get categories and transactions
    const categories = db.prepare('SELECT * FROM categories WHERE user_id = ?').all(user_id);
    const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ?').all(user_id);
    
    // Create backup data
    const backupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      user: {
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        created_at: user.created_at
      },
      categories: categories,
      transactions: transactions,
      metadata: {
        total_categories: categories.length,
        total_transactions: transactions.length,
        export_date: new Date().toISOString()
      }
    };
    
    // Calculate size
    const size = JSON.stringify(backupData).length;
    
    // Save backup to database
    const stmt = db.prepare(`
      INSERT INTO backups (user_id, name, description, data, size) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(user_id, name, description, JSON.stringify(backupData), size);
    
    // Get created backup
    const backup = db.prepare('SELECT * FROM backups WHERE id = ?').get(result.lastInsertRowid);
    
    res.json({
      id: backup.id,
      created_at: backup.created_at,
      size: backup.size,
      transactions_count: transactions.length,
      user_id: backup.user_id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download backup
app.get('/api/backups/:backupId/download', (req, res) => {
  try {
    const { backupId } = req.params;
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }
    
    // Get backup from database
    const backup = db.prepare('SELECT * FROM backups WHERE id = ? AND user_id = ?').get(backupId, user_id);
    if (!backup) {
      return res.status(404).json({ error: 'Резервная копия не найдена' });
    }
    
    // Parse backup data
    const backupData = JSON.parse(backup.data);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup_${backup.name}_${new Date(backup.created_at).toISOString().split('T')[0]}.json"`);
    
    res.json(backupData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore backup
app.post('/api/backups/:backupId/restore', (req, res) => {
  try {
    const { backupId } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }
    
    // Get backup from database
    const backup = db.prepare('SELECT * FROM backups WHERE id = ? AND user_id = ?').get(backupId, user_id);
    if (!backup) {
      return res.status(404).json({ error: 'Резервная копия не найдена' });
    }
    
    // Parse backup data
    const backupData = JSON.parse(backup.data);
    
    // Validate backup data
    if (!backupData || !backupData.version || !backupData.categories || !backupData.transactions) {
      return res.status(400).json({ error: 'Неверный формат резервной копии' });
    }
    
    // Start transaction
    const transaction = db.transaction(() => {
      // Clear existing data
      db.prepare('DELETE FROM transactions WHERE user_id = ?').run(user_id);
      db.prepare('DELETE FROM categories WHERE user_id = ?').run(user_id);
      
      // Restore categories
      const categoryStmt = db.prepare('INSERT INTO categories (name, type, color, user_id) VALUES (?, ?, ?, ?)');
      const categoryMap = new Map(); // Map old category IDs to new ones
      
      backupData.categories.forEach(category => {
        const result = categoryStmt.run(category.name, category.type, category.color, user_id);
        categoryMap.set(category.id, result.lastInsertRowid);
      });
      
      // Restore transactions
      const transactionStmt = db.prepare('INSERT INTO transactions (amount, description, type, category_id, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)');
      backupData.transactions.forEach(transaction => {
        const newCategoryId = categoryMap.get(transaction.category_id);
        if (newCategoryId) {
          transactionStmt.run(
            transaction.amount,
            transaction.description,
            transaction.type,
            newCategoryId,
            user_id,
            transaction.created_at
          );
        }
      });
    });
    
    // Execute transaction
    transaction();
    
    res.json({ 
      success: true, 
      message: 'Данные восстановлены успешно',
      backup_id: backupId,
      restored: {
        categories: backupData.categories.length,
        transactions: backupData.transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete backup
app.delete('/api/backups/:backupId', (req, res) => {
  try {
    const { backupId } = req.params;
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }
    
    // Delete backup from database
    const stmt = db.prepare('DELETE FROM backups WHERE id = ? AND user_id = ?');
    const result = stmt.run(backupId, user_id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Резервная копия не найдена' });
    }
    
    res.json({ success: true, message: 'Резервная копия удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import backup
app.post('/api/backups/import', (req, res) => {
  try {
    const { user_id, ...backupData } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }
    
    // Validate backup data
    if (!backupData || !backupData.version || !backupData.categories || !backupData.transactions) {
      return res.status(400).json({ error: 'Неверный формат резервной копии' });
    }
    
    // Get user data
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Start transaction
    const transaction = db.transaction(() => {
      // Clear existing data
      db.prepare('DELETE FROM transactions WHERE user_id = ?').run(user_id);
      db.prepare('DELETE FROM categories WHERE user_id = ?').run(user_id);
      
      // Restore categories
      const categoryStmt = db.prepare('INSERT INTO categories (name, type, color, user_id) VALUES (?, ?, ?, ?)');
      const categoryMap = new Map(); // Map old category IDs to new ones
      
      backupData.categories.forEach(category => {
        const result = categoryStmt.run(category.name, category.type, category.color, user_id);
        categoryMap.set(category.id, result.lastInsertRowid);
      });
      
      // Restore transactions
      const transactionStmt = db.prepare('INSERT INTO transactions (amount, description, type, category_id, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)');
      backupData.transactions.forEach(transaction => {
        const newCategoryId = categoryMap.get(transaction.category_id);
        if (newCategoryId) {
          transactionStmt.run(
            transaction.amount,
            transaction.description,
            transaction.type,
            newCategoryId,
            user_id,
            transaction.created_at
          );
        }
      });
    });
    
    // Execute transaction
    transaction();
    
    res.json({ 
      success: true, 
      message: 'Резервная копия импортирована успешно',
      imported: {
        categories: backupData.categories.length,
        transactions: backupData.transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Budget Alerts API

// Get all budget alerts for a user
app.get('/api/budget-alerts', (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }
    
    const stmt = db.prepare(`
      SELECT 
        ba.*,
        c.name as category_name,
        c.color as category_color,
        c.type as category_type
      FROM budget_alerts ba
      JOIN categories c ON ba.category_id = c.id
      WHERE ba.user_id = ?
      ORDER BY ba.created_at DESC
    `);
    
    const alerts = stmt.all(user_id);
    
    // Calculate current spending for each alert
    const alertsWithSpending = alerts.map(alert => {
      let periodStart;
      const now = new Date();
      
      switch (alert.period) {
        case 'daily':
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          const dayOfWeek = now.getDay();
          const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
          periodStart = new Date(now.getFullYear(), now.getMonth(), diff);
          break;
        case 'monthly':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }
      
      // Get spending for the period
      const spendingStmt = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions 
        WHERE user_id = ? 
          AND category_id = ? 
          AND type = 'expense'
          AND created_at >= ?
      `);
      
      const spending = spendingStmt.get(user_id, alert.category_id, periodStart.toISOString());
      const currentSpending = spending.total;
      const remaining = alert.limit_amount - currentSpending;
      const percentage = (currentSpending / alert.limit_amount) * 100;
      
      return {
        ...alert,
        current_spending: currentSpending,
        remaining: remaining,
        percentage: Math.round(percentage * 100) / 100,
        is_over_limit: currentSpending > alert.limit_amount
      };
    });
    
    res.json(alertsWithSpending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new budget alert
app.post('/api/budget-alerts', (req, res) => {
  try {
    const { user_id, category_id, limit_amount, period } = req.body;
    
    if (!user_id || !category_id || !limit_amount || !period) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    // Validate period
    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ error: 'Неверный период' });
    }
    
    // Check if category exists and belongs to user
    const category = db.prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?').get(category_id, user_id);
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    // Check if alert already exists for this category and period
    const existingAlert = db.prepare('SELECT * FROM budget_alerts WHERE user_id = ? AND category_id = ? AND period = ?').get(user_id, category_id, period);
    if (existingAlert) {
      return res.status(400).json({ error: 'Уведомление для этой категории и периода уже существует' });
    }
    
    const stmt = db.prepare('INSERT INTO budget_alerts (user_id, category_id, limit_amount, period) VALUES (?, ?, ?, ?)');
    const result = stmt.run(user_id, category_id, limit_amount, period);
    
    const newAlert = db.prepare('SELECT * FROM budget_alerts WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json({
      success: true,
      message: 'Уведомление о бюджете создано',
      alert: newAlert
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update budget alert
app.put('/api/budget-alerts/:alertId', (req, res) => {
  try {
    const { alertId } = req.params;
    const { user_id, limit_amount, period } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }
    
    // Validate period if provided
    if (period && !['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ error: 'Неверный период' });
    }
    
    // Check if alert exists and belongs to user
    const existingAlert = db.prepare('SELECT * FROM budget_alerts WHERE id = ? AND user_id = ?').get(alertId, user_id);
    if (!existingAlert) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }
    
    // Build update query
    const updates = [];
    const params = [];
    
    if (limit_amount !== undefined) {
      updates.push('limit_amount = ?');
      params.push(limit_amount);
    }
    
    if (period !== undefined) {
      updates.push('period = ?');
      params.push(period);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }
    
    params.push(alertId, user_id);
    
    const stmt = db.prepare(`UPDATE budget_alerts SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`);
    const result = stmt.run(...params);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }
    
    const updatedAlert = db.prepare('SELECT * FROM budget_alerts WHERE id = ?').get(alertId);
    
    res.json({
      success: true,
      message: 'Уведомление о бюджете обновлено',
      alert: updatedAlert
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete budget alert
app.delete('/api/budget-alerts/:alertId', (req, res) => {
  try {
    const { alertId } = req.params;
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }
    
    const stmt = db.prepare('DELETE FROM budget_alerts WHERE id = ? AND user_id = ?');
    const result = stmt.run(alertId, user_id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }
    
    res.json({ success: true, message: 'Уведомление о бюджете удалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle budget alert
app.patch('/api/budget-alerts/:alertId/toggle', (req, res) => {
  try {
    const { alertId } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }
    
    // Get current alert
    const alert = db.prepare('SELECT * FROM budget_alerts WHERE id = ? AND user_id = ?').get(alertId, user_id);
    if (!alert) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }
    
    // Toggle enabled status
    const newStatus = alert.enabled ? 0 : 1;
    const stmt = db.prepare('UPDATE budget_alerts SET enabled = ? WHERE id = ? AND user_id = ?');
    const result = stmt.run(newStatus, alertId, user_id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }
    
    const updatedAlert = db.prepare('SELECT * FROM budget_alerts WHERE id = ?').get(alertId);
    
    res.json({
      success: true,
      message: `Уведомление ${newStatus ? 'включено' : 'отключено'}`,
      alert: updatedAlert
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send budget notification via Telegram
app.post('/api/notifications/send', (req, res) => {
  try {
    const { chatId, warning } = req.body;
    
    if (!chatId || !warning) {
      return res.status(400).json({ error: 'chatId и warning обязательны' });
    }
    
    // Здесь будет логика отправки уведомления через Telegram
    // Пока просто возвращаем успех
    console.log(`📢 Уведомление для ${chatId}:`, warning);
    
    res.json({
      success: true,
      message: 'Уведомление отправлено',
      notification: { chatId, warning }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notifications for user
app.get('/api/notifications', (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }
    
    // Get user's notifications (budget alerts)
    const notifications = db.prepare(`
      SELECT ba.*, c.name as category_name 
      FROM budget_alerts ba 
      LEFT JOIN categories c ON ba.category_id = c.id 
      WHERE ba.user_id = ? 
      ORDER BY ba.created_at DESC
    `).all(user_id);
    
    res.json({
      success: true,
      notifications: notifications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notification settings for user
app.get('/api/notification-settings', (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }
    
    // Get user's notification preferences
    const settings = db.prepare(`
      SELECT 
        id,
        user_id,
        enabled,
        created_at
      FROM budget_alerts 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(user_id);
    
    res.json({
      success: true,
      settings: settings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    // Check database connection
    const dbCheck = db.prepare('SELECT 1').get();
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      port: PORT
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
