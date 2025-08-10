import { useState, useEffect } from 'react'
import { useTelegram } from '../contexts/TelegramContext'
import { Trash2, Plus, Search, Filter, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import PullToRefresh from './PullToRefresh'


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
      <div className="transaction-list">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Загрузка транзакций...</p>
        </div>
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={loadTransactions}>
      <div className="transaction-list">
        <div className="list-header">
          <h2>Транзакции</h2>
          <span className="transaction-count">{filteredTransactions.length} из {transactions.length} транзакций</span>
        </div>

        {/* Поиск и фильтры */}
        <div className="search-filters">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Поиск по описанию, категории или сумме..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            className="filter-toggle button-animation"
            onClick={() => {
              setShowFilters(!showFilters);
            }}
          >
            <Filter size={16} />
            Фильтры
          </button>
        </div>

        {showFilters && (
          <div className="filter-panel">
            <div className="filter-group">
              <label>Тип транзакции:</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Все</option>
                <option value="income">Доходы</option>
                <option value="expense">Расходы</option>
              </select>
            </div>
            
            {(searchTerm || filterType !== 'all') && (
              <button className="clear-filters button-animation" onClick={() => {
                clearFilters();
              }}>
                Очистить фильтры
              </button>
            )}
          </div>
        )}

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {searchTerm || filterType !== 'all' ? '🔍' : '📝'}
            </div>
            <h3>
              {searchTerm || filterType !== 'all' 
                ? 'Транзакции не найдены' 
                : 'Нет транзакций'
              }
            </h3>
            <p>
              {searchTerm || filterType !== 'all'
                ? 'Попробуйте изменить параметры поиска или фильтры'
                : 'Добавьте первую транзакцию, чтобы начать отслеживать свои финансы'
              }
            </p>
            {(searchTerm || filterType !== 'all') && (
              <button className="button secondary button-animation" onClick={() => {
                clearFilters();
              }}>
                Очистить фильтры
              </button>
            )}
          </div>
        ) : (
          <div className="transactions">
            {filteredTransactions.map(transaction => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-main">
                  <div className="transaction-info">
                    <div className="transaction-amount">
                      <span className={`amount ${transaction.type === 'income' ? 'positive' : 'negative'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-category">
                        <div 
                          className="category-dot" 
                          style={{ backgroundColor: transaction.category_color }}
                        />
                        {transaction.category_name}
                      </div>
                      {transaction.description && (
                        <div className="transaction-description">{transaction.description}</div>
                      )}
                      <div className="transaction-date">{formatDate(transaction.created_at)}</div>
                    </div>
                  </div>
                  <div className="transaction-actions">
                    <button
                      className="edit-button button-animation"
                      onClick={() => handleEdit(transaction)}
                      title="Редактировать"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="delete-button button-animation"
                      onClick={() => handleDelete(transaction.id)}
                      disabled={deletingId === transaction.id}
                      title="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PullToRefresh>
  )
}

export default TransactionList
