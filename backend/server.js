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
    console.error('Ошибка при получении/создании пользователя:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user categories
app.get('/api/users/:userId/categories', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (pool) {
      // PostgreSQL
      const result = await pool.query(
        'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
        [userId]
      );
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

// Get user transactions
app.get('/api/users/:userId/transactions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type, category_id, search, start_date, end_date } = req.query;
    
    let whereClause = 'WHERE user_id = ?';
    let params = [userId];
    let paramIndex = 1;
    
    if (type) {
      paramIndex++;
      whereClause += ` AND type = $${paramIndex}`;
      params.push(type);
    }
    
    if (category_id) {
      paramIndex++;
      whereClause += ` AND category_id = $${paramIndex}`;
      params.push(category_id);
    }
    
    if (search) {
      paramIndex++;
      whereClause += ` AND (description ILIKE $${paramIndex} OR amount::text ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
    }
    
    if (start_date) {
      paramIndex++;
      whereClause += ` AND date >= $${paramIndex}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramIndex++;
      whereClause += ` AND date <= $${paramIndex}`;
      params.push(end_date);
    }
    
    const offset = (page - 1) * limit;
    
    if (pool) {
      // PostgreSQL
      const countQuery = `SELECT COUNT(*) FROM transactions ${whereClause}`;
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);
      
      const dataQuery = `
        SELECT t.*, c.name as category_name, c.color as category_color 
        FROM transactions t 
        LEFT JOIN categories c ON t.category_id = c.id 
        ${whereClause} 
        ORDER BY t.date DESC, t.created_at DESC 
        LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}
      `;
      const dataParams = [...params, limit, offset];
      const dataResult = await pool.query(dataQuery, dataParams);
      
      res.json({
        transactions: dataResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } else {
      // SQLite
      const countQuery = `SELECT COUNT(*) as count FROM transactions ${whereClause}`;
      const total = db.prepare(countQuery).get(...params).count;
      
      const dataQuery = `
        SELECT t.*, c.name as category_name, c.color as category_color 
        FROM transactions t 
        LEFT JOIN categories c ON t.category_id = c.id 
        ${whereClause} 
        ORDER BY t.date DESC, t.created_at DESC 
        LIMIT ? OFFSET ?
      `;
      const dataParams = [...params, limit, offset];
      const transactions = db.prepare(dataQuery).all(...dataParams);
      
      res.json({
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }
  } catch (error) {
    console.error('Ошибка при получении транзакций:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { user_id, amount, type, category_id, description, date } = req.body;
    
    if (pool) {
      // PostgreSQL
      const result = await pool.query(
        'INSERT INTO transactions (user_id, amount, type, category_id, description, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [user_id, amount, type, category_id, description, date]
      );
      res.json(result.rows[0]);
    } else {
      // SQLite
      const insertTransaction = db.prepare(
        'INSERT INTO transactions (user_id, amount, type, category_id, description, date) VALUES (?, ?, ?, ?, ?, ?)'
      );
      const result = insertTransaction.run(user_id, amount, type, category_id, description, date);
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
    const { amount, type, category_id, description, date } = req.body;
    
    if (pool) {
      // PostgreSQL
      const result = await pool.query(
        'UPDATE transactions SET amount = $1, type = $2, category_id = $3, description = $4, date = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
        [amount, type, category_id, description, date, id]
      );
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

// Get user statistics
app.get('/api/users/:userId/statistics', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    let params = [userId];
    
    if (period === 'week') {
      dateFilter = 'AND date >= date("now", "-7 days")';
    } else if (period === 'month') {
      dateFilter = 'AND date >= date("now", "-30 days")';
    } else if (period === 'year') {
      dateFilter = 'AND date >= date("now", "-365 days")';
    }
    
    if (pool) {
      // PostgreSQL
      const incomeQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = 'income' ${dateFilter}`;
      const expenseQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = 'expense' ${dateFilter}`;
      
      const incomeResult = await pool.query(incomeQuery, params);
      const expenseResult = await pool.query(expenseQuery, params);
      
      const income = parseFloat(incomeResult.rows[0].total);
      const expense = parseFloat(expenseResult.rows[0].total);
      
      res.json({
        income,
        expense,
        balance: income - expense,
        period
      });
    } else {
      // SQLite
      const incomeQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'income' ${dateFilter}`;
      const expenseQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'expense' ${dateFilter}`;
      
      const income = db.prepare(incomeQuery).get(...params).total;
      const expense = db.prepare(expenseQuery).get(...params).total;
      
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
