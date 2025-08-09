import React, { useState, useEffect } from 'react'
import { Target, Plus, Edit3, Trash2, TrendingUp, Calendar } from 'lucide-react'
import { hapticFeedback } from '../utils/haptic'

const GoalManager = () => {
  const [goals, setGoals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    description: ''
  })

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Error loading goals:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0
      }

      const url = editingGoal ? `/api/goals/${editingGoal.id}` : '/api/goals'
      const method = editingGoal ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(goalData)
      })

      if (response.ok) {
        hapticFeedback.success()
        window.showTelegramAlert(
          editingGoal ? 'Цель обновлена!' : 'Цель создана!'
        )
        setShowForm(false)
        setEditingGoal(null)
        resetForm()
        loadGoals()
      }
    } catch (error) {
      console.error('Error saving goal:', error)
      hapticFeedback.error()
      window.showTelegramAlert('Ошибка при сохранении цели')
    }
  }

  const handleEdit = (goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      description: goal.description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (goalId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту цель?')) return

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        hapticFeedback.success()
        window.showTelegramAlert('Цель удалена!')
        loadGoals()
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
      hapticFeedback.error()
      window.showTelegramAlert('Ошибка при удалении цели')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      description: ''
    })
  }

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100)
  }

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="goal-manager">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="w-5 h-5" />
          Финансовые цели
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Новая цель
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-card rounded-lg border">
          <h3 className="text-lg font-medium mb-4">
            {editingGoal ? 'Редактировать цель' : 'Создать новую цель'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Название цели
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="input-field"
                placeholder="Например: Покупка ноутбука"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Целевая сумма (₽)
                </label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                  className="input-field"
                  placeholder="50000"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Текущая сумма (₽)
                </label>
                <input
                  type="number"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({...formData, currentAmount: e.target.value})}
                  className="input-field"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Срок достижения
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Описание (необязательно)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input-field"
                rows="3"
                placeholder="Дополнительная информация о цели..."
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                {editingGoal ? 'Обновить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingGoal(null)
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
        {goals.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>У вас пока нет финансовых целей</p>
            <p className="text-sm">Создайте первую цель для отслеживания прогресса</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount)
            const daysLeft = getDaysUntilDeadline(goal.deadline)
            const isCompleted = progress >= 100
            const isOverdue = daysLeft < 0

            return (
              <div
                key={goal.id}
                className={`p-4 bg-card rounded-lg border ${
                  isCompleted ? 'border-green-200 bg-green-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{goal.title}</h4>
                    {goal.description && (
                      <p className="text-sm text-muted mt-1">{goal.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="btn-icon"
                      title="Редактировать"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="btn-icon text-red-500 hover:text-red-600"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {goal.currentAmount.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-sm text-muted">Накоплено</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {goal.targetAmount.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-sm text-muted">Цель</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Прогресс</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                      {isOverdue 
                        ? `Просрочено на ${Math.abs(daysLeft)} дн.`
                        : `Осталось ${daysLeft} дн.`
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-muted">
                      Осталось: {(goal.targetAmount - goal.currentAmount).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>

                {isCompleted && (
                  <div className="mt-3 p-2 bg-green-100 text-green-800 rounded text-center text-sm font-medium">
                    🎉 Цель достигнута!
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default GoalManager
