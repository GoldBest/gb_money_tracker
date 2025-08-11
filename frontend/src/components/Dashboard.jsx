import { useState, useEffect } from 'react'
import { useTelegram } from '../contexts/TelegramContext'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  PiggyBank
} from 'lucide-react'
import NotificationManager from './NotificationManager'

const Dashboard = ({ onAddTransaction }) => {
  const { user, api } = useTelegram()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Для разработки без backend, используем mock данные
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔧 Development mode: using mock stats')
        const mockStats = {
          balance: 0,
          total_income: 0,
          total_expense: 0,
          total_transactions: 0
        }
        setStats(mockStats)
        setLoading(false)
        return
      }
      
      const response = await api.get(`/api/users/${user.id}/stats?period=month`)
      setStats(response.data)
    } catch (error) {
      console.error('Error loading stats:', error)
      if (window.showTelegramAlert) {
        window.showTelegramAlert('Ошибка при загрузке статистики')
      } else {
        console.error('Ошибка при загрузке статистики')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    )
  }

  const balance = stats?.balance || 0
  const totalIncome = stats?.total_income || 0
  const totalExpense = stats?.total_expense || 0
  const totalTransactions = stats?.total_transactions || 0

  // Пустое состояние
  if (totalTransactions === 0) {
    return (
      <div className="empty-state">
        <div className="balance-card text-center">
          <div className="mb-4">
            <Wallet size={64} style={{ color: 'var(--accent-color)', opacity: 0.8 }} />
          </div>
          <h3>Добро пожаловать в GB Money Tracker!</h3>
          <p className="mb-4">
            Для вас созданы базовые категории доходов и расходов
          </p>
          
          <div className="stats-grid">
            <div className="stat-card text-center">
              <div className="mb-2">
                <TrendingUp size={32} style={{ color: 'var(--success-color)' }} />
              </div>
              <h4>Доходы</h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Зарплата, подработка, инвестиции, подарки
              </p>
            </div>
            
            <div className="stat-card text-center">
              <div className="mb-2">
                <TrendingDown size={32} style={{ color: 'var(--error-color)' }} />
              </div>
              <h4>Расходы</h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Продукты, транспорт, коммунальные, развлечения
              </p>
            </div>
          </div>
          
          <button
            className="action-button primary"
            onClick={onAddTransaction}
            style={{ marginTop: '1.5rem', width: '100%' }}
          >
            <Plus size={20} />
            Добавить первую транзакцию
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Balance Card */}
      <div className="balance-card">
        <h2>Текущий баланс</h2>
        <div className={`balance-amount ${balance >= 0 ? 'positive' : 'negative'}`}>
          {balance >= 0 ? '+' : ''}{balance.toLocaleString('ru-RU')} ₽
        </div>
        <p style={{ opacity: 0.8, fontSize: '14px' }}>
          За текущий месяц
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <ArrowUpRight size={32} style={{ color: 'var(--success-color)' }} />
          </div>
          <div className="stat-value" style={{ color: 'var(--success-color)' }}>
            +{totalIncome.toLocaleString('ru-RU')} ₽
          </div>
          <div className="stat-label">Доходы</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <ArrowDownRight size={32} style={{ color: 'var(--error-color)' }} />
          </div>
          <div className="stat-value" style={{ color: 'var(--error-color)' }}>
            -{totalExpense.toLocaleString('ru-RU')} ₽
          </div>
          <div className="stat-label">Расходы</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CreditCard size={32} />
          </div>
          <div className="stat-value">
            {totalTransactions}
          </div>
          <div className="stat-label">Транзакций</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <PiggyBank size={32} />
          </div>
          <div className="stat-value">
            {totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0}%
          </div>
          <div className="stat-label">Сбережения</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="stat-card">
        <h3 className="mb-3" style={{ fontSize: '20px', fontWeight: '600' }}>Быстрые действия</h3>
        <div className="quick-actions">
          <button
            className="action-button primary"
            onClick={onAddTransaction}
          >
            <Plus size={18} />
            Доход
          </button>
          <button
            className="action-button secondary"
            onClick={onAddTransaction}
          >
            <Plus size={18} />
            Расход
          </button>
        </div>
      </div>

      {/* Recent Categories */}
      {stats?.recent_categories && stats.recent_categories.length > 0 && (
        <div className="stat-card">
          <h3 className="mb-3" style={{ fontSize: '18px', fontWeight: '600' }}>Недавние категории</h3>
          <div className="category-list">
            {stats.recent_categories.slice(0, 5).map((category, index) => (
              <div key={index} className="category-item">
                <div 
                  className="category-color" 
                  style={{ backgroundColor: category.color || '#007aff' }}
                ></div>
                <div className="category-info">
                  <div className="category-name">{category.name}</div>
                  <div className="category-amount">
                    {category.total_amount > 0 ? '+' : ''}{category.total_amount.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification Manager */}
      <NotificationManager />
    </div>
  )
}

export default Dashboard
