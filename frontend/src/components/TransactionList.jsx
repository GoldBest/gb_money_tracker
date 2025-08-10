import { useState, useEffect } from 'react'
import { useTelegram } from '../contexts/TelegramContext'
import { 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Tag,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'


const TransactionList = ({ onEditTransaction }) => {
  const { user, api } = useTelegram()
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, filterType])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/users/${user.id}/transactions`)
      setTransactions(response.data)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    // Фильтр по типу
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType)
    }

    // Поиск по описанию и категории
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(term) ||
        t.category_name?.toLowerCase().includes(term) ||
        t.amount.toString().includes(term)
      )
    }

    setFilteredTransactions(filtered)
  }

  const handleDelete = async (id) => {
    window.showTelegramConfirm(
      'Вы уверены, что хотите удалить эту транзакцию?',
      async (confirmed) => {
        if (!confirmed) return

        try {
          setDeletingId(id)
          await api.delete(`/api/transactions/${id}`)
          setTransactions(prev => prev.filter(t => t.id !== id))
          window.showTelegramAlert('Транзакция успешно удалена')
        } catch (error) {
          console.error('Error deleting transaction:', error)
          window.showTelegramAlert('Ошибка при удалении транзакции')
        } finally {
          setDeletingId(null)
        }
      }
    )
  }

  const handleEdit = (transaction) => {
    if (onEditTransaction) {
      onEditTransaction(transaction)
    }
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: ru })
    } catch {
      return dateString
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterType('all')
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Загрузка транзакций...</p>
      </div>
    )
  }

  return (
    <div className="transaction-list">
        {/* Header */}
        <div className="apple-card mb-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--apple-spacing-md)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Транзакции</h2>
            <span style={{ color: 'var(--apple-text-secondary)', fontSize: '14px' }}>
              {filteredTransactions.length} из {transactions.length}
            </span>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: 'var(--apple-spacing-sm)', marginBottom: 'var(--apple-spacing-md)' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ 
                position: 'absolute', 
                left: 'var(--apple-spacing-sm)', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--apple-text-secondary)'
              }} />
              <input
                type="text"
                className="apple-input"
                placeholder="Поиск транзакций..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 'var(--apple-spacing-xl)' }}
              />
            </div>
            <button
              className={`apple-button ${showFilters ? 'primary' : 'secondary'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="apple-card compact" style={{ 
              backgroundColor: 'var(--apple-bg-secondary)',
              marginBottom: 'var(--apple-spacing-md)'
            }}>
              <div style={{ display: 'flex', gap: 'var(--apple-spacing-sm)', marginBottom: 'var(--apple-spacing-sm)' }}>
                <button
                  className={`apple-button small ${filterType === 'all' ? 'primary' : 'secondary'}`}
                  onClick={() => setFilterType('all')}
                >
                  Все
                </button>
                <button
                  className={`apple-button small ${filterType === 'income' ? 'primary' : 'secondary'}`}
                  onClick={() => setFilterType('income')}
                >
                  <TrendingUp size={14} />
                  Доходы
                </button>
                <button
                  className={`apple-button small ${filterType === 'expense' ? 'primary' : 'secondary'}`}
                  onClick={() => setFilterType('expense')}
                >
                  <TrendingDown size={14} />
                  Расходы
                </button>
              </div>
              {(searchTerm || filterType !== 'all') && (
                <button
                  className="apple-button small secondary"
                  onClick={clearFilters}
                  style={{ fontSize: '12px' }}
                >
                  <X size={12} />
                  Очистить фильтры
                </button>
              )}
            </div>
          )}
        </div>

        {/* Transactions */}
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="apple-card text-center">
              <div className="mb-3">
                <Search size={48} style={{ color: 'var(--apple-text-secondary)', opacity: 0.5 }} />
              </div>
              <h3>Транзакции не найдены</h3>
              <p>
                {searchTerm || filterType !== 'all' 
                  ? 'Попробуйте изменить параметры поиска или фильтры'
                  : 'У вас пока нет транзакций. Добавьте первую!'
                }
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--apple-spacing-sm)' }}>
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-main">
                  <div className="transaction-info">
                    <div className="transaction-description">
                      {transaction.description || 'Без описания'}
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
                      <span>{transaction.category_name}</span>
                      <span style={{ marginLeft: 'var(--apple-spacing-sm)', opacity: 0.7 }}>
                        <Calendar size={12} />
                        {formatDate(transaction.date)}
                      </span>
                    </div>
                  </div>
                  <div className="transaction-amount">
                    <span className={`amount ${transaction.type === 'income' ? 'positive' : 'negative'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
                
                {/* Transaction Actions */}
                <div style={{ 
                  display: 'flex', 
                  gap: 'var(--apple-spacing-sm)', 
                  marginTop: 'var(--apple-spacing-sm)',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    className="apple-button small secondary"
                    onClick={() => handleEdit(transaction)}
                    disabled={deletingId === transaction.id}
                  >
                    <Edit size={14} />
                    Изменить
                  </button>
                  <button
                    className="apple-button small danger"
                    onClick={() => handleDelete(transaction.id)}
                    disabled={deletingId === transaction.id}
                  >
                    {deletingId === transaction.id ? (
                      <div className="loading-spinner" style={{ width: '14px', height: '14px', margin: 0 }} />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  )
}

export default TransactionList
