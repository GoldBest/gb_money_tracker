import { useState, useEffect } from 'react'
import { useTelegram } from '../contexts/TelegramContext'
import { TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react'
import { CategoryPieChart, TrendLineChart, ComparisonBarChart } from './Charts'
import PullToRefresh from './PullToRefresh'
const Statistics = () => {
  const { user, api } = useTelegram()
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [exporting, setExporting] = useState(false)
  const [chartView, setChartView] = useState('pie') // pie, line, bar

  const periods = [
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
    { value: 'year', label: 'Год' }
  ]

  useEffect(() => {
    if (user) {
      loadStats()
      loadTransactions()
    }
  }, [user, period])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/users/${user.id}/stats?period=${period}`)
      setStats(response.data)
      } catch (error) {
      console.error('Error loading stats:', error)
      } finally {
      setLoading(false)
    }
  }

  const loadTransactions = async () => {
    try {
      const response = await api.get(`/api/users/${user.id}/transactions?limit=1000`)
      setTransactions(response.data)
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  const exportToCSV = async () => {
    try {
      setExporting(true)
      
      // Создаем CSV контент
      const headers = ['Дата', 'Тип', 'Сумма', 'Категория', 'Описание']
      const csvContent = [
        headers.join(','),
        ...transactions.map(t => [
          new Date(t.created_at).toLocaleDateString('ru-RU'),
          t.type === 'income' ? 'Доход' : 'Расход',
          t.amount,
          t.category_name,
          t.description || ''
        ].join(','))
      ].join('\n')

      // Создаем и скачиваем файл
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.showTelegramAlert('Данные успешно экспортированы!')
    } catch (error) {
      console.error('Error exporting data:', error)
      window.showTelegramAlert('Ошибка при экспорте данных')
    } finally {
      setExporting(false)
    }
  }

  // Подготовка данных для графиков
  const prepareChartData = () => {
    if (!stats?.categoryStats) return []

    return stats.categoryStats.map(category => ({
      name: category.name,
      total: category.total,
      color: category.color
    }))
  }

  const prepareTrendData = () => {
    if (!transactions.length) return []

    // Группируем транзакции по дням
    const grouped = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.created_at).toLocaleDateString('ru-RU')
      if (!acc[date]) {
        acc[date] = { income: 0, expense: 0 }
      }
      if (transaction.type === 'income') {
        acc[date].income += transaction.amount
      } else {
        acc[date].expense += transaction.amount
      }
      return acc
    }, {})

    return Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        income: data.income,
        expense: data.expense
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7) // Последние 7 дней
  }

  const prepareComparisonData = () => {
    if (!stats?.categoryStats) return []

    return stats.categoryStats
      .slice(0, 8) // Топ 8 категорий
      .map(category => ({
        name: category.name,
        amount: category.total
      }))
  }

  if (loading) {
    return (
      <div className="statistics">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Загрузка статистики...</p>
        </div>
      </div>
    )
  }

  const totalIncome = stats?.total_income || 0
  const totalExpense = stats?.total_expense || 0
  const balance = stats?.balance || 0
  const totalTransactions = stats?.total_transactions || 0

  const chartData = prepareChartData()
  const trendData = prepareTrendData()
  const comparisonData = prepareComparisonData()

  return (
    <PullToRefresh onRefresh={loadStats}>
      <div className="statistics">
        <div className="stats-header">
          <h2>Статистика</h2>
          <div className="stats-actions">
            <div className="period-selector">
              {periods.map(p => (
                <button
                  key={p.value}
                  className={`period-button button-animation ${period === p.value ? 'active' : ''}`}
                  onClick={() => {
                    setPeriod(p.value);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button 
              className="export-button button-animation"
              onClick={exportToCSV}
              disabled={exporting || totalTransactions === 0}
            >
              <Download size={16} />
              {exporting ? 'Экспорт...' : 'Экспорт CSV'}
            </button>
          </div>
        </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon positive">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Общий доход</div>
            <div className="stat-value">{totalIncome.toLocaleString('ru-RU')} ₽</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon negative">
            <TrendingDown size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Общий расход</div>
            <div className="stat-value">{totalExpense.toLocaleString('ru-RU')} ₽</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Баланс</div>
            <div className={`stat-value ${balance >= 0 ? 'positive' : 'negative'}`}>
              {balance >= 0 ? '+' : ''}{balance.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            📊
          </div>
          <div className="stat-content">
            <div className="stat-label">Транзакций</div>
            <div className="stat-value">{totalTransactions}</div>
          </div>
        </div>
      </div>

      {/* Переключатель видов графиков */}
      <div className="chart-controls">
        <button 
          className={`chart-button button-animation ${chartView === 'pie' ? 'active' : ''}`}
          onClick={() => {
            setChartView('pie');
          }}
        >
          Круговая диаграмма
        </button>
        <button 
          className={`chart-button button-animation ${chartView === 'line' ? 'active' : ''}`}
          onClick={() => {
            setChartView('line');
          }}
        >
          Тренды
        </button>
        <button 
          className={`chart-button button-animation ${chartView === 'bar' ? 'active' : ''}`}
          onClick={() => {
            setChartView('bar');
          }}
        >
          Сравнение
        </button>
      </div>

      {/* Графики */}
      {chartView === 'pie' && (
        <CategoryPieChart 
          data={chartData} 
          title="Расходы по категориям" 
        />
      )}

      {chartView === 'line' && (
        <TrendLineChart 
          data={trendData} 
          title="Тренды доходов и расходов" 
        />
      )}

      {chartView === 'bar' && (
        <ComparisonBarChart 
          data={comparisonData} 
          title="Топ категорий расходов" 
        />
      )}

      {totalTransactions === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <h3>Нет данных для статистики</h3>
          <p>Добавьте транзакции, чтобы увидеть статистику</p>
        </div>
      )}
      </div>
    </PullToRefresh>
  )
}

export default Statistics
