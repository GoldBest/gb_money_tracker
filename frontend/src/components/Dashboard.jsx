import { useState, useEffect } from 'react'
import { useTelegram } from '../contexts/TelegramContext'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  PiggyBank
} from 'lucide-react'
import NotificationManager from './NotificationManager'
import PullToRefresh from './PullToRefresh'
import { AppleFadeIn, AppleAnimatedCounter, AppleStaggeredList } from './ApplePageTransition'

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
    } catch (error) {
      console.error('Error loading stats:', error)
      window.showTelegramAlert('Ошибка при загрузке статистики')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Загрузка данных...</p>
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
        <div className="empty-state">
          <AppleFadeIn delay={100}>
            <div className="apple-card large text-center">
              <div className="mb-4">
                <Wallet size={64} style={{ color: 'var(--apple-accent-blue)', opacity: 0.8 }} />
              </div>
              <h3>Добро пожаловать в GB Money Tracker!</h3>
              <p className="mb-4">
                Для вас созданы базовые категории доходов и расходов
              </p>
              
              <AppleStaggeredList staggerDelay={200}>
                <div className="apple-card compact text-center">
                  <div className="mb-2">
                    <TrendingUp size={32} style={{ color: 'var(--apple-accent-green)' }} />
                  </div>
                  <h4>Доходы</h4>
                  <p className="text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    Зарплата, подработка, инвестиции, подарки
                  </p>
                </div>
                
                <div className="apple-card compact text-center">
                  <div className="mb-2">
                    <TrendingDown size={32} style={{ color: 'var(--apple-accent-red)' }} />
                  </div>
                  <h4>Расходы</h4>
                  <p className="text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    Продукты, транспорт, коммунальные, развлечения
                  </p>
                </div>
              </AppleStaggeredList>
              
              <AppleFadeIn delay={800}>
                <button
                  className="apple-button primary large"
                  onClick={onAddTransaction}
                >
                  <Plus size={20} />
                  Добавить первую транзакцию
                </button>
              </AppleFadeIn>
            </div>
          </AppleFadeIn>
        </div>
      </PullToRefresh>
    )
  }

  return (
    <PullToRefresh onRefresh={loadStats}>
      <div className="dashboard">
        {/* Balance Card */}
        <div className="apple-card balance-card mb-4">
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
              <ArrowUpRight size={32} style={{ color: 'var(--apple-accent-green)' }} />
            </div>
            <div className="stat-value" style={{ color: 'var(--apple-accent-green)' }}>
              +{totalIncome.toLocaleString('ru-RU')} ₽
            </div>
            <div className="stat-label">Доходы</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <ArrowDownRight size={32} style={{ color: 'var(--apple-accent-red)' }} />
            </div>
            <div className="stat-value" style={{ color: 'var(--apple-accent-red)' }}>
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
              {((totalIncome - totalExpense) / totalIncome * 100).toFixed(1)}%
            </div>
            <div className="stat-label">Сбережения</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="apple-card mb-4">
          <h3 className="mb-3" style={{ fontSize: '20px', fontWeight: '600' }}>Быстрые действия</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--apple-spacing-md)' }}>
            <button
              className="apple-button primary full-width"
              onClick={onAddTransaction}
            >
              <Plus size={18} />
              Доход
            </button>
            <button
              className="apple-button secondary full-width"
              onClick={onAddTransaction}
            >
              <Plus size={18} />
              Расход
            </button>
          </div>
        </div>

        {/* Recent Categories */}
        {stats?.recent_categories && stats.recent_categories.length > 0 && (
          <div className="apple-card">
            <h3 className="mb-3" style={{ fontSize: '20px', fontWeight: '600' }}>Популярные категории</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--apple-spacing-sm)' }}>
              {stats.recent_categories.slice(0, 5).map((category, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--apple-spacing-sm)',
                    borderRadius: 'var(--apple-radius-sm)',
                    backgroundColor: 'var(--apple-bg-secondary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--apple-spacing-sm)' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: category.color || 'var(--apple-accent-blue)'
                      }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <span style={{ fontWeight: '500' }}>
                    {category.amount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {stats?.recent_transactions && stats.recent_transactions.length > 0 && (
          <div className="apple-card">
            <h3 className="mb-3" style={{ fontSize: '20px', fontWeight: '600' }}>Последние транзакции</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--apple-spacing-sm)' }}>
              {stats.recent_transactions.slice(0, 5).map((transaction, index) => (
                <div
                  key={index}
                  className="transaction-item"
                  style={{ marginBottom: 0 }}
                >
                  <div className="transaction-main">
                    <div className="transaction-info">
                      <div className="transaction-description">
                        {transaction.description}
                      </div>
                      <div className="transaction-category">
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: transaction.category_color || 'var(--apple-accent-blue)'
                          }}
                        />
                        {transaction.category_name}
                      </div>
                    </div>
                    <div className="transaction-amount">
                      <span className={`amount ${transaction.type === 'income' ? 'positive' : 'negative'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString('ru-RU')} ₽
                      </span>
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
    </PullToRefresh>
  )
}

export default Dashboard
