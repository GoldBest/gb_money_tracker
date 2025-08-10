import { useState, useEffect } from 'react'
import { useTelegram } from '../contexts/TelegramContext'
import { Plus, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react'
import NotificationManager from './NotificationManager'
import PullToRefresh from './PullToRefresh'
import AnimatedCard from './AnimatedCard'
import AnimatedButton from './AnimatedButton'
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
          <AnimatedCard
            variant="gradient"
            hoverEffect="glow"
            icon="💰"
            title="Добро пожаловать в GB Money Tracker!"
            className="welcome-card"
          >
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Для вас созданы базовые категории доходов и расходов
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <AnimatedCard
                variant="glass"
                hoverEffect="scale"
                icon="📈"
                title="Доходы"
                className="info-card"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Зарплата, подработка, инвестиции, подарки
                </p>
              </AnimatedCard>
              
              <AnimatedCard
                variant="glass"
                hoverEffect="scale"
                icon="📉"
                title="Расходы"
                className="info-card"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Продукты, транспорт, коммунальные, развлечения
                </p>
              </AnimatedCard>
            </div>
            
            <AnimatedButton
              variant="primary"
              size="large"
              onClick={() => {
                hapticFeedback.light();
                onAddTransaction();
              }}
              icon={<Plus size={20} />}
              fullWidth
              className="welcome-button"
            >
              Добавить первую транзакцию
            </AnimatedButton>
          </AnimatedCard>
          
          <NotificationManager />
        </div>
      </PullToRefresh>
    )
  }

  return (
    <PullToRefresh onRefresh={loadStats}>
      <div className="dashboard">
        <AnimatedCard
          variant="gradient"
          hoverEffect="glow"
          icon={<DollarSign className="w-8 h-8" />}
          title="Баланс"
          className="balance-card"
        >
          <div className={`text-4xl font-bold text-center ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {balance >= 0 ? '+' : ''}{balance.toLocaleString('ru-RU')} ₽
          </div>
        </AnimatedCard>

        <div className="stats-grid">
          <AnimatedCard
            variant="elevated"
            hoverEffect="lift"
            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            title="Доходы"
            className="stat-card"
          >
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              +{totalIncome.toLocaleString('ru-RU')} ₽
            </div>
          </AnimatedCard>

          <AnimatedCard
            variant="elevated"
            hoverEffect="lift"
            icon={<TrendingDown className="w-6 h-6 text-red-500" />}
            title="Расходы"
            className="stat-card"
          >
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              -{totalExpense.toLocaleString('ru-RU')} ₽
            </div>
          </AnimatedCard>

          <AnimatedCard
            variant="elevated"
            hoverEffect="lift"
            icon={<Wallet className="w-6 h-6 text-blue-500" />}
            title="Транзакции"
            className="stat-card"
          >
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalTransactions}
            </div>
          </AnimatedCard>
        </div>

        <AnimatedButton
          variant="primary"
          size="large"
          onClick={() => {
            hapticFeedback.light();
            onAddTransaction();
          }}
          icon={<Plus size={20} />}
          fullWidth
          className="add-transaction-button"
        >
          Добавить транзакцию
        </AnimatedButton>
        
        <NotificationManager />
      </div>
    </PullToRefresh>
  )
}

export default Dashboard
