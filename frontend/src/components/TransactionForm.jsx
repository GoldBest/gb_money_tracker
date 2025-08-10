import { useState, useEffect } from 'react'
import { useTelegram } from '../contexts/TelegramContext'
import { X, Plus } from 'lucide-react'


const TransactionForm = ({ onClose, onSuccess }) => {
  const { user, api } = useTelegram()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    type: 'expense',
    category_id: ''
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
      window.showTelegramAlert('Пожалуйста, заполните все обязательные поля')
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
        window.showTelegramAlert(`Транзакция создана, но есть предупреждения:\n\n${warningMessages}`)
        
        // Показываем предупреждения пользователю
      } else {
        window.showTelegramAlert('Транзакция успешно создана!')
      }
      
      onSuccess()
    } catch (error) {
      console.error('Error creating transaction:', error)
      window.showTelegramAlert('Ошибка при создании транзакции')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    if (hasChanges) {
      window.showTelegramConfirm(
        'У вас есть несохраненные изменения. Закрыть форму?',
        (confirmed) => {
          if (confirmed) {
            onClose()
          }
        }
      )
    } else {
      onClose()
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Новая транзакция</h2>
          <button className="close-button button-animation" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-group">
            <label>Тип</label>
            <div className="type-selector">
              <button
                type="button"
                className={`type-button button-animation ${formData.type === 'expense' ? 'active' : ''}`}
                onClick={() => {
                  handleInputChange('type', 'expense');
                }}
              >
                Расход
              </button>
              <button
                type="button"
                className={`type-button button-animation ${formData.type === 'income' ? 'active' : ''}`}
                onClick={() => {
                  handleInputChange('type', 'income');
                }}
              >
                Доход
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Сумма *</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label>Категория *</label>
            <select
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

          <div className="form-group">
            <label>Описание</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Краткое описание"
            />
          </div>

          {/* Бюджетные предупреждения */}
          {budgetWarnings.length > 0 && (
            <div className="budget-warnings">
              <h4>⚠️ Бюджетные предупреждения</h4>
              {budgetWarnings.map((warning, index) => (
                <div 
                  key={index} 
                  className={`warning-item ${warning.type === 'budget_exceeded' ? 'exceeded' : 'warning'}`}
                >
                  <div className="warning-icon">
                    {warning.type === 'budget_exceeded' ? '🚨' : '⚠️'}
                  </div>
                  <div className="warning-content">
                    <p className="warning-message">{warning.message}</p>
                    <div className="warning-details">
                      <span>Текущие траты: {warning.current.toLocaleString()} ₽</span>
                      <span>Лимит: {warning.limit.toLocaleString()} ₽</span>
                      <span>Новый итог: {warning.newTotal.toLocaleString()} ₽</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="button secondary button-animation" onClick={handleClose}>
              Отмена
            </button>
            <button type="submit" className="button primary button-animation" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TransactionForm
