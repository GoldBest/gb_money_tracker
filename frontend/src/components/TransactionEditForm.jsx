import { useState, useEffect } from 'react'
import { useTelegram } from '../contexts/TelegramContext'
import { X, Save } from 'lucide-react'

const TransactionEditForm = ({ transaction, onClose, onSuccess }) => {
  const { user, api } = useTelegram()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: transaction.amount.toString(),
    description: transaction.description || '',
    type: transaction.type,
    category_id: transaction.category_id.toString()
  })

  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [user, formData.type])

  const loadCategories = async () => {
    try {
      const response = await api.get(`/api/users/${user.id}/categories`)
      const filteredCategories = response.data.filter(cat => cat.type === formData.type)
      setCategories(filteredCategories)
      
      // Если текущая категория не подходит для нового типа, выбери первую
      if (!filteredCategories.find(c => c.id.toString() === formData.category_id)) {
        setFormData(prev => ({ 
          ...prev, 
          category_id: filteredCategories[0]?.id?.toString() || ''
        }))
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.category_id) {
      window.showTelegramAlert('Пожалуйста, заполните все обязательные поля')
      return
    }

    try {
      setLoading(true)
      await api.put(`/api/transactions/${transaction.id}`, {
        ...formData,
        user_id: user.id,
        amount: parseFloat(formData.amount)
      })
      
      window.showTelegramAlert('Транзакция успешно обновлена')
      onSuccess()
    } catch (error) {
      console.error('Error updating transaction:', error)
      window.showTelegramAlert('Ошибка при обновлении транзакции')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Редактировать транзакцию</h2>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-group">
            <label>Тип</label>
            <div className="type-selector">
              <button
                type="button"
                className={`type-button ${formData.type === 'expense' ? 'active' : ''}`}
                onClick={() => handleInputChange('type', 'expense')}
              >
                Расход
              </button>
              <button
                type="button"
                className={`type-button ${formData.type === 'income' ? 'active' : ''}`}
                onClick={() => handleInputChange('type', 'income')}
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

          <div className="form-actions">
            <button type="button" className="button secondary" onClick={handleClose}>
              Отмена
            </button>
            <button type="submit" className="button primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Сохранить
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TransactionEditForm
