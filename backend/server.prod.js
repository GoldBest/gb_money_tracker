const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5176',
    'http://localhost:8081',
    'https://gb-money-tracker-frontend.onrender.com',
    'https://*.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
app.use(express.json());

// Database setup - PostgreSQL for production
const pool = new Pool({
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'postgresql',
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get or create user
app.post('/api/users', async (req, res) => {
  try {
    const { telegram_id, username, first_name } = req.body;
    
    // Check if user exists
    let userResult = await pool.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegram_id]
    );
    
    let user = userResult.rows[0];
    
    if (!user) {
      // Create new user
      const newUserResult = await pool.query(
        'INSERT INTO users (telegram_id, username, first_name) VALUES ($1, $2, $3) RETURNING *',
        [telegram_id, username, first_name]
      );
      user = newUserResult.rows[0];
      
      // Create default categories for new user
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
  } catch (error) {
    console.error('Ошибка при получении/создании пользователя:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user categories
app.get('/api/users/:userId/categories', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user transactions
app.get('/api/users/:userId/transactions', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT t.*, c.name as category_name, c.color as category_color 
       FROM transactions t 
       LEFT JOIN categories c ON t.category_id = c.id 
       WHERE t.user_id = $1 
       ORDER BY t.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении транзакций:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { amount, description, type, category_id, user_id } = req.body;
    
    const result = await pool.query(
      'INSERT INTO transactions (amount, description, type, category_id, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [amount, description, type, category_id, user_id]
    );
    
    const transaction = result.rows[0];
    
    // Get category info
    const categoryResult = await pool.query(
      'SELECT name, color FROM categories WHERE id = $1',
      [category_id]
    );
    
    const fullTransaction = {
      ...transaction,
      category_name: categoryResult.rows[0]?.name,
      category_color: categoryResult.rows[0]?.color
    };
    
    res.json(fullTransaction);
  } catch (error) {
    console.error('Ошибка при создании транзакции:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update transaction
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, type, category_id, user_id } = req.body;
    
    const result = await pool.query(
      'UPDATE transactions SET amount = $1, description = $2, type = $3, category_id = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [amount, description, type, category_id, id, user_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Транзакция не найдена' });
    }
    
    const transaction = result.rows[0];
    
    // Get category info
    const categoryResult = await pool.query(
      'SELECT name, color FROM categories WHERE id = $1',
      [category_id]
    );
    
    const fullTransaction = {
      ...transaction,
      category_name: categoryResult.rows[0]?.name,
      category_color: categoryResult.rows[0]?.color
    };
    
    res.json(fullTransaction);
  } catch (error) {
    console.error('Ошибка при обновлении транзакции:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
app.get('/api/users/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND t.created_at >= NOW() - INTERVAL '7 days'";
    } else if (period === 'month') {
      dateFilter = "AND t.created_at >= NOW() - INTERVAL '30 days'";
    } else if (period === 'quarter') {
      dateFilter = "AND t.created_at >= NOW() - INTERVAL '90 days'";
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
        COALESCE(SUM(t.amount), 0) as total,
        COUNT(*) as count
       FROM transactions t 
       JOIN categories c ON t.category_id = c.id 
       WHERE t.user_id = $1 AND t.type = 'expense' ${dateFilter}
       GROUP BY c.id, c.name, c.color 
       ORDER BY total DESC`,
      [userId]
    );
    
    const stats = statsResult.rows[0];
    const balance = stats.total_income - stats.total_expense;
    
    res.json({
      total_income: parseFloat(stats.total_income),
      total_expense: parseFloat(stats.total_expense),
      total_transactions: parseInt(stats.total_transactions),
      balance: parseFloat(balance),
      categoryStats: categoryStatsResult.rows
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get budget alerts
app.get('/api/users/:userId/budget-alerts', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT ba.*, c.name as category_name, c.color as category_color 
       FROM budget_alerts ba 
       JOIN categories c ON ba.category_id = c.id 
       WHERE ba.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении бюджетных уведомлений:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create budget alert
app.post('/api/users/:userId/budget-alerts', async (req, res) => {
  try {
    const { userId } = req.params;
    const { category_id, limit_amount, period } = req.body;
    
    const result = await pool.query(
      'INSERT INTO budget_alerts (user_id, category_id, limit_amount, period) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, category_id, limit_amount, period]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при создании бюджетного уведомления:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint не найден' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌍 Окружение: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 База данных: PostgreSQL`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Получен SIGTERM, закрываю сервер...');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 Получен SIGINT, закрываю сервер...');
  pool.end();
  process.exit(0);
});
