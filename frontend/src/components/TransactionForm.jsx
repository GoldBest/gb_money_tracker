import { useState, useEffect } from 'react'
import { useTelegram } from '../contexts/TelegramContext'
import { X, Plus, Tag, FileText, Calendar, TrendingDown, TrendingUp } from 'lucide-react'

const TransactionForm = ({ onSubmit, onCancel }) => {
  const { user, api } = useTelegram()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    type: 'expense',
    category_id: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [user, formData.type])

  // Отслеживаем изменения в форме
  useEffect(() => {
    const hasData = formData.amount || formData.description || formData.category_id
    setHasChanges(hasData)
  }, [formData])

  const loadCategories = async () => {
    try {
      const response = await api.get(`/api/users/${user.id}/categories`)
      const filteredCategories = response.data.filter(cat => cat.type === formData.type)
      setCategories(filteredCategories)
      
      // Auto-select first category if none selected
      if (!formData.category_id && filteredCategories.length > 0) {
        setFormData(prev => ({ ...prev, category_id: filteredCategories[0].id }))
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const [budgetWarnings, setBudgetWarnings] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.category_id) {
      if (window.showTelegramAlert) {
        window.showTelegramAlert('Пожалуйста, заполните все обязательные поля')
      } else {
        alert('Пожалуйста, заполните все обязательные поля')
      }
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/api/transactions', {
        ...formData,
        user_id: user.id,
        amount: parseFloat(formData.amount)
      })
      
      // Проверяем бюджетные предупреждения
      if (response.data.budgetWarnings && response.data.budgetWarnings.length > 0) {
        setBudgetWarnings(response.data.budgetWarnings)
        
        // Показываем предупреждения пользователю
        const warningMessages = response.data.budgetWarnings.map(w => w.message).join('\n\n')
        if (window.showTelegramAlert) {
          window.showTelegramAlert(`Транзакция создана, но есть предупреждения:\n\n${warningMessages}`)
        }
        
        // Показываем предупреждения пользователю
      } else {
        if (window.showTelegramAlert) {
          window.showTelegramAlert('Транзакция успешно создана!')
        }
      }
      
      onSubmit()
    } catch (error) {
      console.error('Error creating transaction:', error)
      if (window.showTelegramAlert) {
        window.showTelegramAlert('Ошибка при создании транзакции')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    if (hasChanges) {
      if (window.showTelegramConfirm) {
        window.showTelegramConfirm(
          'У вас есть несохраненные изменения. Закрыть форму?',
          (confirmed) => {
            if (confirmed) {
              onCancel()
            }
          }
        )
      } else {
        // Fallback для разработки
        if (confirm('У вас есть несохраненные изменения. Закрыть форму?')) {
          onCancel()
        }
      }
    } else {
      onCancel()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      {/* Type Selector */}
      <div className="apple-form-group">
        <label>Тип транзакции</label>
        <div style={{ display: 'flex', gap: 'var(--apple-spacing-sm)' }}>
          <button
            type="button"
            className={`apple-button ${formData.type === 'expense' ? 'primary' : 'secondary'}`}
            onClick={() => handleInputChange('type', 'expense')}
            style={{ flex: 1 }}
          >
            <TrendingDown size={16} />
            Расход
          </button>
          <button
            type="button"
            className={`apple-button ${formData.type === 'income' ? 'primary' : 'secondary'}`}
            onClick={() => handleInputChange('type', 'income')}
            style={{ flex: 1 }}
          >
            <TrendingUp size={16} />
            Доход
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="apple-form-group">
        <label htmlFor="amount">
          <span style={{ marginRight: 'var(--apple-spacing-xs)', fontSize: '16px', fontWeight: 'bold' }}>₽</span>
          Сумма
        </label>
        <input
          id="amount"
          type="number"
          className="apple-input"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          step="0.01"
          min="0"
          required
        />
      </div>

      {/* Description Input */}
      <div className="apple-form-group">
        <label htmlFor="description">
          <FileText size={16} style={{ marginRight: 'var(--apple-spacing-xs)' }} />
          Описание
        </label>
        <input
          id="description"
          type="text"
          className="apple-input"
          placeholder="Введите описание транзакции"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
        />
      </div>

      {/* Category Select */}
      <div className="apple-form-group">
        <label htmlFor="category">
          <Tag size={16} style={{ marginRight: 'var(--apple-spacing-xs)' }} />
          Категория
        </label>
        <select
          id="category"
          className="apple-select"
          value={formData.category_id}
          onChange={(e) => handleInputChange('category_id', e.target.value)}
          required
        >
          <option value="">Выберите категорию</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date Input */}
      <div className="apple-form-group">
        <label htmlFor="date">
          <Calendar size={16} style={{ marginRight: 'var(--apple-spacing-xs)' }} />
          Дата
        </label>
        <input
          id="date"
          type="date"
          className="apple-input"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          required
        />
      </div>

      {/* Budget Warnings */}
      {budgetWarnings.length > 0 && (
        <div className="apple-card" style={{ 
          backgroundColor: 'var(--apple-accent-orange)', 
          color: 'var(--apple-text-inverse)',
          marginBottom: 'var(--apple-spacing-md)'
        }}>
          <h4 style={{ marginBottom: 'var(--apple-spacing-sm)' }}>⚠️ Предупреждения о бюджете</h4>
          {budgetWarnings.map((warning, index) => (
            <p key={index} style={{ fontSize: '14px', marginBottom: 'var(--apple-spacing-xs)' }}>
              {warning.message}
            </p>
          ))}
        </div>
      )}

      {/* Form Actions */}
      <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
        <button
          type="button"
          className="apple-button secondary"
          onClick={handleClose}
          disabled={loading}
        >
          Отмена
        </button>
        <button
          type="submit"
          className="apple-button primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="loading-spinner" style={{ width: '16px', height: '16px', margin: 0 }} />
              Сохранение...
            </>
          ) : (
            <>
              <Plus size={16} />
              Сохранить
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm
