const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
`);

// Default categories
const defaultCategories = [
  { name: 'Зарплата', type: 'income', color: '#10B981' },
  { name: 'Продукты', type: 'expense', color: '#EF4444' },
  { name: 'Транспорт', type: 'expense', color: '#F59E0B' },
  { name: 'Развлечения', type: 'expense', color: '#8B5CF6' },
  { name: 'Здоровье', type: 'expense', color: '#06B6D4' },
  { name: 'Одежда', type: 'expense', color: '#EC4899' },
  { name: 'Дом', type: 'expense', color: '#84CC16' },
  { name: 'Другое', type: 'income', color: '#6B7280' },
  { name: 'Другое', type: 'expense', color: '#6B7280' }
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

// Create transaction
app.post('/api/transactions', (req, res) => {
  try {
    const { amount, description, type, category_id, user_id } = req.body;
    const stmt = db.prepare('INSERT INTO transactions (amount, description, type, category_id, user_id) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(amount, description, type, category_id, user_id);
    const transaction = db.prepare(`
      SELECT t.*, c.name as category_name, c.color as category_color 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.id = ?
    `).get(result.lastInsertRowid);
    res.json(transaction);
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
