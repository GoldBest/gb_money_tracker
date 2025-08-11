const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5176',
    'http://localhost:8081',
    'https://gbmt.gbdev.ru',
    'https://*.vercel.app',
    'https://*.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database setup - Support both SQLite and PostgreSQL
let db;
let pool;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgres')) {
  // PostgreSQL for production
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  // Test database connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Ошибка подключения к PostgreSQL:', err);
    } else {
      console.log('✅ Подключение к PostgreSQL установлено');
    }
  });
} else {
  // SQLite for development
  const Database = require('better-sqlite3');
  db = new Database('money_tracker.db');
  
  console.log('✅ Подключение к SQLite установлено');
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'postgresql' : 'sqlite',
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'postgresql' : 'sqlite',
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get or create user
app.post('/api/users', async (req, res) => {
  try {
    const { telegram_id, username, first_name } = req.body;
    
    if (pool) {
      // PostgreSQL
      let userResult = await pool.query(
        'SELECT * FROM users WHERE telegram_id = $1',
        [telegram_id]
      );
      
      let user = userResult.rows[0];
      
      if (!user) {
        const newUserResult = await pool.query(
          'INSERT INTO users (telegram_id, username, first_name) VALUES ($1, $2, $3) RETURNING *',
          [telegram_id, username, first_name]
        );
        user = newUserResult.rows[0];
        
        // Create default categories
        const defaultCategories = [
          { name: 'Продукты', type: 'expense', color: '#EF4444' },
          { name: 'Транспорт', type: 'expense', color: '#F59E0B' },
          { name: 'Развлечения', type: 'expense', color: '#8B5CF6' },
          { name: 'Зарплата', type: 'income', color: '#10B981' },
          { name: 'Подработка', type: 'income', color: '#06B6D4' }
        ];
        
        for (const category of defaultCategories) {
          await pool.query(
            'INSERT INTO categories (name, type, color, user_id) VALUES ($1, $2, $3, $4)',
            [category.name, category.type, category.color, user.id]
          );
        }
      }
      
      res.json(user);
    } else {
      // SQLite
      let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegram_id);
      
      if (!user) {
        const insertUser = db.prepare('INSERT INTO users (telegram_id, username, first_name) VALUES (?, ?, ?)');
        const result = insertUser.run(telegram_id, username, first_name);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        
        // Create default categories
        const defaultCategories = [
          { name: 'Продукты', type: 'expense', color: '#EF4444' },
          { name: 'Транспорт', type: 'expense', color: '#F59E0B' },
          { name: 'Развлечения', type: 'expense', color: '#8B5CF6' },
          { name: 'Зарплата', type: 'income', color: '#10B981' },
          { name: 'Подработка', type: 'income', color: '#06B6D4' }
        ];
        
        const insertCategory = db.prepare('INSERT INTO categories (name, type, color, user_id) VALUES (?, ?, ?, ?)');
        for (const category of defaultCategories) {
          insertCategory.run(category.name, category.type, category.color, user.id);
        }
      }
      
      res.json(user);
    }
  } catch (error) {
    console.error('Ошибка при создании/получении пользователя:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get categories
app.get('/api/users/:userId/categories', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (pool) {
      // PostgreSQL
      const result = await pool.query('SELECT * FROM categories WHERE user_id = $1 ORDER BY name', [userId]);
      res.json(result.rows);
    } else {
      // SQLite
      const categories = db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY name').all(userId);
      res.json(categories);
    }
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create category
app.post('/api/users/:userId/categories', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, type, color } = req.body;
    
    if (pool) {
      // PostgreSQL
      const result = await pool.query(
        'INSERT INTO categories (name, type, color, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, type, color, userId]
      );
      res.json(result.rows[0]);
    } else {
      // SQLite
      const insertCategory = db.prepare('INSERT INTO categories (name, type, color, user_id) VALUES (?, ?, ?, ?)');
      const result = insertCategory.run(name, type, color, userId);
      const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
      res.json(category);
    }
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get transactions
app.get('/api/users/:userId/transactions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    if (pool) {
      // PostgreSQL
      const result = await pool.query(
        `SELECT t.*, c.name as category_name, c.color as category_color 
         FROM transactions t 
         LEFT JOIN categories c ON t.category_id = c.id 
         WHERE t.user_id = $1 
         ORDER BY t.created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      res.json(result.rows);
    } else {
      // SQLite
      const transactions = db.prepare(
        `SELECT t.*, c.name as category_name, c.color as category_color 
         FROM transactions t 
         LEFT JOIN categories c ON t.category_id = c.id 
         WHERE t.user_id = ? 
         ORDER BY t.created_at DESC 
         LIMIT ? OFFSET ?`
      ).all(userId, limit, offset);
      res.json(transactions);
    }
  } catch (error) {
    console.error('Ошибка при получении транзакций:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
app.post('/api/users/:userId/transactions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, description, type, category_id, date } = req.body;
    
    if (pool) {
      // PostgreSQL
      const result = await pool.query(
        'INSERT INTO transactions (amount, description, type, category_id, user_id, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [amount, description, type, category_id, userId, date]
      );
      res.json(result.rows[0]);
    } else {
      // SQLite
      const insertTransaction = db.prepare(
        'INSERT INTO transactions (amount, description, type, category_id, user_id, date) VALUES (?, ?, ?, ?, ?, ?)'
      );
      const result = insertTransaction.run(amount, description, type, category_id, userId, date);
      const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
      res.json(transaction);
    }
  } catch (error) {
    console.error('Ошибка при создании транзакции:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update transaction
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, type, category_id, date } = req.body;
    
    if (pool) {
      // PostgreSQL
      await pool.query(
        'UPDATE transactions SET amount = $1, type = $2, category_id = $3, description = $4, date = $5, updated_at = NOW() WHERE id = $6',
        [amount, type, category_id, description, date, id]
      );
      const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
      res.json(result.rows[0]);
    } else {
      // SQLite
      const updateTransaction = db.prepare(
        'UPDATE transactions SET amount = ?, type = ?, category_id = ?, description = ?, date = ?, updated_at = DATETIME("now") WHERE id = ?'
      );
      updateTransaction.run(amount, type, category_id, description, date, id);
      const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
      res.json(transaction);
    }
  } catch (error) {
    console.error('Ошибка при обновлении транзакции:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (pool) {
      // PostgreSQL
      await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
    } else {
      // SQLite
      db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    }
    
    res.json({ message: 'Транзакция удалена' });
  } catch (error) {
    console.error('Ошибка при удалении транзакции:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user statistics (compatible with frontend)
app.get('/api/users/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    
    if (pool) {
      // PostgreSQL
      if (period === 'week') {
        dateFilter = "AND t.created_at >= NOW() - INTERVAL '7 days'";
      } else if (period === 'month') {
        dateFilter = "AND t.created_at >= NOW() - INTERVAL '30 days'";
      } else if (period === 'year') {
        dateFilter = "AND t.created_at >= NOW() - INTERVAL '365 days'";
      }
      
      const statsResult = await pool.query(
        `SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
          COUNT(*) as total_transactions
         FROM transactions t 
         WHERE user_id = $1 ${dateFilter}`,
        [userId]
      );
      
      const categoryStatsResult = await pool.query(
        `SELECT 
          c.name,
          c.color,
          COALESCE(SUM(t.amount), 0) as total_amount,
          COUNT(*) as count
         FROM transactions t 
         JOIN categories c ON t.category_id = c.id 
         WHERE t.user_id = $1 AND t.type = 'expense' ${dateFilter}
         GROUP BY c.id, c.name, c.color 
         ORDER BY total_amount DESC`,
        [userId]
      );
      
      const stats = statsResult.rows[0];
      const balance = stats.total_income - stats.total_expense;
      
      res.json({
        total_income: parseFloat(stats.total_income),
        total_expense: parseFloat(stats.total_expense),
        total_transactions: parseInt(stats.total_transactions),
        balance: parseFloat(balance),
        recent_categories: categoryStatsResult.rows
      });
    } else {
      // SQLite - используем простой подход без сложных фильтров по датам
      const statsQuery = `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COUNT(*) as total_transactions
       FROM transactions WHERE user_id = ?`;
      
      const stats = db.prepare(statsQuery).get(userId);
      
      const categoryStatsQuery = `SELECT 
        c.name,
        c.color,
        COALESCE(SUM(t.amount), 0) as total_amount,
        COUNT(*) as count
       FROM transactions t 
       JOIN categories c ON t.category_id = c.id 
       WHERE t.user_id = ? AND t.type = 'expense'
       GROUP BY c.id, c.name, c.color 
       ORDER BY total_amount DESC`;
      
      const categoryStats = db.prepare(categoryStatsQuery).all(userId);
      
      const balance = stats.total_income - stats.total_expense;
      
      res.json({
        total_income: parseFloat(stats.total_income),
        total_expense: parseFloat(stats.total_expense),
        total_transactions: parseInt(stats.total_transactions),
        balance: parseFloat(balance),
        recent_categories: categoryStats
      });
    }
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user statistics (legacy endpoint)
app.get('/api/users/:userId/statistics', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    let queryParams = [userId];
    
    if (pool) {
      // PostgreSQL
      if (period === 'week') {
        dateFilter = "AND t.created_at >= NOW() - INTERVAL '7 days'";
      } else if (period === 'month') {
        dateFilter = "AND t.created_at >= NOW() - INTERVAL '30 days'";
      } else if (period === 'year') {
        dateFilter = "AND t.created_at >= NOW() - INTERVAL '365 days'";
      }
      
      const incomeQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = 'income' ${dateFilter}`;
      const expenseQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = 'expense' ${dateFilter}`;
      
      const incomeResult = await pool.query(incomeQuery, queryParams);
      const expenseResult = await pool.query(expenseQuery, queryParams);
      
      const income = parseFloat(incomeResult.rows[0].total);
      const expense = parseFloat(expenseResult.rows[0].total);
      
      res.json({
        income,
        expense,
        balance: income - expense,
        period
      });
    } else {
      // SQLite - используем простой подход без сложных фильтров по датам
      const incomeQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'income'`;
      const expenseQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'expense'`;
      
      const income = db.prepare(incomeQuery).get(userId).total;
      const expense = db.prepare(expenseQuery).get(userId).total;
      
      res.json({
        income,
        expense,
        balance: income - expense,
        period
      });
    }
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌍 Окружение: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ База данных: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'}`);
});

module.exports = app;
