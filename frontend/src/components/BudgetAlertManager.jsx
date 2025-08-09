import React, { useState, useEffect } from 'react'
import { AlertTriangle, Plus, Edit3, Trash2, DollarSign, TrendingUp, Bell } from 'lucide-react'
import { hapticFeedback } from '../utils/haptic'

const BudgetAlertManager = () => {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [formData, setFormData] = useState({
    categoryId: '',
    limitAmount: '',
    period: 'month',
    alertThreshold: '80',
    notifications: true
  })

  useEffect(() => {
    loadBudgets()
    loadCategories()
  }, [])

  const loadBudgets = async () => {
    try {
      const response = await fetch('/api/budgets')
      if (response.ok) {
        const data = await response.json()
        setBudgets(data)
      }
    } catch (error) {
      console.error('Error loading budgets:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.filter(cat => cat.type === 'expense'))
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const budgetData = {
        ...formData,
        limitAmount: parseFloat(formData.limitAmount),
        alertThreshold: parseInt(formData.alertThreshold)
      }

      const url = editingBudget ? `/api/budgets/${editingBudget.id}` : '/api/budgets'
      const method = editingBudget ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(budgetData)
      })

      if (response.ok) {
        hapticFeedback.success()
        window.showTelegramAlert(
          editingBudget ? 'Бюджет обновлен!' : 'Бюджет создан!'
        )
        setShowForm(false)
        setEditingBudget(null)
        resetForm()
        loadBudgets()
      }
    } catch (error) {
      console.error('Error saving budget:', error)
      hapticFeedback.error()
      window.showTelegramAlert('Ошибка при сохранении бюджета')
    }
  }

  const handleEdit = (budget) => {
    setEditingBudget(budget)
    setFormData({
      categoryId: budget.categoryId.toString(),
      limitAmount: budget.limitAmount.toString(),
      period: budget.period,
      alertThreshold: budget.alertThreshold.toString(),
      notifications: budget.notifications
    })
    setShowForm(true)
  }

  const handleDelete = async (budgetId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот бюджет?')) return

    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        hapticFeedback.success()
        window.showTelegramAlert('Бюджет удален!')
        loadBudgets()
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
      hapticFeedback.error()
      window.showTelegramAlert('Ошибка при удалении бюджета')
    }
  }

  const resetForm = () => {
    setFormData({
      categoryId: '',
      limitAmount: '',
      period: 'month',
      alertThreshold: '80',
      notifications: true
    })
  }

  const getBudgetStatus = (budget) => {
    const used = budget.usedAmount || 0
    const limit = budget.limitAmount
    const percentage = (used / limit) * 100
    
    if (percentage >= 100) return { status: 'exceeded', color: 'text-red-600', bgColor: 'bg-red-100', text: 'Превышен' }
    if (percentage >= parseInt(budget.alertThreshold)) return { status: 'warning', color: 'text-orange-600', bgColor: 'bg-orange-100', text: 'Внимание' }
    return { status: 'normal', color: 'text-green-600', bgColor: 'bg-green-100', text: 'В норме' }
  }

  const getProgressColor = (percentage, threshold) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= threshold) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'week': return 'Неделя'
      case 'month': return 'Месяц'
      case 'quarter': return 'Квартал'
      case 'year': return 'Год'
      default: return period
    }
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === parseInt(categoryId))
    return category ? category.name : 'Неизвестная категория'
  }

  return (
    <div className="budget-alert-manager">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Управление бюджетами
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Новый бюджет
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-card rounded-lg border">
          <h3 className="text-lg font-medium mb-4">
            {editingBudget ? 'Редактировать бюджет' : 'Создать новый бюджет'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Категория расходов
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                className="input-field"
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Лимит (₽)
                </label>
                <input
                  type="number"
                  value={formData.limitAmount}
                  onChange={(e) => setFormData({...formData, limitAmount: e.target.value})}
                  className="input-field"
                  placeholder="1000"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Период
                </label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({...formData, period: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="week">Неделя</option>
                  <option value="month">Месяц</option>
                  <option value="quarter">Квартал</option>
                  <option value="year">Год</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Порог предупреждения (%)
                </label>
                <input
                  type="number"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({...formData, alertThreshold: e.target.value})}
                  className="input-field"
                  placeholder="80"
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={formData.notifications}
                    onChange={(e) => setFormData({...formData, notifications: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">Уведомления</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                {editingBudget ? 'Обновить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingBudget(null)
                  resetForm()
                }}
                className="btn-secondary"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>У вас пока нет установленных бюджетов</p>
            <p className="text-sm">Создайте первый бюджет для контроля расходов</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const status = getBudgetStatus(budget)
            const percentage = ((budget.usedAmount || 0) / budget.limitAmount) * 100
            const categoryName = getCategoryName(budget.categoryId)

            return (
              <div
                key={budget.id}
                className={`p-4 bg-card rounded-lg border ${status.bgColor}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-lg">{categoryName}</h4>
                      {budget.notifications && (
                        <Bell className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Период: {getPeriodLabel(budget.period)}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Порог: {budget.alertThreshold}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="btn-icon"
                      title="Редактировать"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="btn-icon text-red-500 hover:text-red-600"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${status.color}`}>
                      {(budget.usedAmount || 0).toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-sm text-muted">Использовано</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {budget.limitAmount.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-sm text-muted">Лимит</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Прогресс</span>
                    <span className="font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage, budget.alertThreshold)}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                    {status.text}
                  </div>
                  <div className="text-sm text-muted">
                    Осталось: {(budget.limitAmount - (budget.usedAmount || 0)).toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {budgets.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900 mb-1">
                Как работают предупреждения
              </h3>
              <p className="text-sm text-yellow-700">
                Когда расходы по категории достигают указанного порога (по умолчанию 80%), 
                вы получите уведомление. При превышении лимита появится предупреждение о превышении бюджета.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BudgetAlertManager

