import { useState, useEffect } from 'react'
import { useTelegram } from '../contexts/TelegramContext'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import NotificationManager from './NotificationManager'
import PullToRefresh from './PullToRefresh'
import { hapticFeedback } from '../utils/haptic'

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
      const response = await api.get(`/api/users/${user.id}/stats?period=month`)
      setStats(response.data)
      hapticFeedback.success()
    } catch (error) {
      console.error('Error loading stats:', error)
      window.showTelegramAlert('Ошибка при загрузке статистики')
      hapticFeedback.error()
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Загрузка данных...</p>
        </div>
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
      <PullToRefresh onRefresh={loadStats}>
        <div className="dashboard">
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h3>Добро пожаловать в Money Tracker!</h3>
            <p>Начните отслеживать свои финансы, добавив первую транзакцию</p>
            <button className="action-button primary haptic-trigger" onClick={() => {
              hapticFeedback.light();
              onAddTransaction();
            }}>
              <Plus size={20} />
              Добавить первую транзакцию
            </button>
          </div>
          
          <NotificationManager />
        </div>
      </PullToRefresh>
    )
  }

  return (
    <PullToRefresh onRefresh={loadStats}>
      <div className="dashboard">
        <div className="balance-card">
          <h2>Баланс</h2>
          <div className={`balance-amount ${balance >= 0 ? 'positive' : 'negative'}`}>
            {balance >= 0 ? '+' : ''}{balance.toLocaleString('ru-RU')} ₽
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon positive">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Доходы</div>
              <div className="stat-value">{totalIncome.toLocaleString('ru-RU')} ₽</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon negative">
              <TrendingDown size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Расходы</div>
              <div className="stat-value">{totalExpense.toLocaleString('ru-RU')} ₽</div>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <button className="action-button primary haptic-trigger" onClick={() => {
            hapticFeedback.light();
            onAddTransaction();
          }}>
            <Plus size={20} />
            Добавить транзакцию
          </button>
        </div>

        {stats?.categoryStats && stats.categoryStats.length > 0 && (
          <div className="recent-categories">
            <h3>Топ категорий расходов</h3>
            <div className="category-list">
              {stats.categoryStats.slice(0, 5).map((category, index) => (
                <div key={index} className="category-item">
                  <div 
                    className="category-color" 
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="category-info">
                    <div className="category-name">{category.name}</div>
                    <div className="category-amount">
                      {category.total.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <NotificationManager />
      </div>
    </PullToRefresh>
  )
}

export default Dashboard
