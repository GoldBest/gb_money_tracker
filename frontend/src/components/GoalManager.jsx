import React, { useState, useEffect } from 'react'
import { Target, Plus, Trash2, Edit, TrendingUp, Calendar, X } from 'lucide-react'
import { useTelegram } from '../contexts/TelegramContext'
const GoalManager = () => {
  const { user } = useTelegram()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    description: ''
  })

  useEffect(() => {
    if (user) {
      loadGoals()
    }
  }, [user])

  const loadGoals = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${user.id}/goals`)
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const createGoal = async () => {
    if (!user) return
    
    if (!formData.title || !formData.target_amount) {
      window.showTelegramAlert('Пожалуйста, заполните все обязательные поля')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          ...formData,
          target_amount: parseFloat(formData.target_amount),
          current_amount: parseFloat(formData.current_amount) || 0
        })
      })

      if (response.ok) {
        window.showTelegramAlert('Цель успешно создана!')
        setShowCreateModal(false)
        setFormData({
          title: '',
          target_amount: '',
          current_amount: '',
          deadline: '',
          description: ''
        })
        loadGoals()
      } else {
        throw new Error('Failed to create goal')
      }
    } catch (error) {
      console.error('Error creating goal:', error)
      window.showTelegramAlert('Ошибка при создании цели')
    } finally {
      setLoading(false)
    }
  }

  const updateGoal = async () => {
    if (!editingGoal) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/goals/${editingGoal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          target_amount: parseFloat(formData.target_amount),
          current_amount: parseFloat(formData.current_amount) || 0
        })
      })

      if (response.ok) {
        window.showTelegramAlert('Цель успешно обновлена!')
        setShowCreateModal(false)
        setEditingGoal(null)
        setFormData({
          title: '',
          target_amount: '',
          current_amount: '',
          deadline: '',
          description: ''
        })
        loadGoals()
      } else {
        throw new Error('Failed to update goal')
      }
    } catch (error) {
      console.error('Error updating goal:', error)
      window.showTelegramAlert('Ошибка при обновлении цели')
    } finally {
      setLoading(false)
    }
  }

  const deleteGoal = async (goalId) => {
    window.showTelegramConfirm(
      'Вы уверены, что хотите удалить эту цель?',
      async (confirmed) => {
        if (confirmed) {
          try {
            const response = await fetch(`/api/goals/${goalId}`, {
              method: 'DELETE'
            })

            if (response.ok) {
              window.showTelegramAlert('Цель удалена!')
              loadGoals()
            } else {
              throw new Error('Failed to delete goal')
            }
          } catch (error) {
            console.error('Error deleting goal:', error)
            window.showTelegramAlert('Ошибка при удалении цели')
          }
        }
      }
    )
  }

  const handleEdit = (goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      deadline: goal.deadline || '',
      description: goal.description || ''
    })
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingGoal(null)
    setFormData({
      title: '',
      target_amount: '',
      current_amount: '',
      deadline: '',
      description: ''
    })
  }

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100)
  }

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#10b981' // Зеленый
    if (progress >= 75) return '#3b82f6' // Синий
    if (progress >= 50) return '#f59e0b' // Желтый
    return '#ef4444' // Красный
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Без срока'
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const daysUntilDeadline = (deadline) => {
    if (!deadline) return null
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading && goals.length === 0) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Загрузка целей...</p>
      </div>
    )
  }

  return (
    <div className="goal-manager">
      <div className="section-header">
        <h2>🎯 Финансовые цели</h2>
        <p>Отслеживайте прогресс в достижении ваших финансовых целей</p>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Target size={48} />
          </div>
          <h3>У вас пока нет целей</h3>
          <p>Создайте свою первую финансовую цель и начните копить!</p>
          <button 
            className="action-button primary button-animation"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            Создать цель
          </button>
        </div>
      ) : (
        <>
          <div className="goals-header">
            <button 
              className="action-button primary button-animation"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={20} />
              Новая цель
            </button>
          </div>

          <div className="goals-grid">
            {goals.map(goal => {
              const progress = calculateProgress(goal.current_amount, goal.target_amount)
              const progressColor = getProgressColor(progress)
              const daysLeft = daysUntilDeadline(goal.deadline)
              
              return (
                <div key={goal.id} className="goal-card">
                  <div className="goal-header">
                    <h3>{goal.title}</h3>
                    <div className="goal-actions">
                      <button 
                        className="edit-button button-animation"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="delete-button button-animation"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="goal-description">{goal.description}</p>
                  )}

                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: progressColor
                        }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      <span>{progress.toFixed(1)}%</span>
                      <span>{goal.current_amount.toLocaleString()} / {goal.target_amount.toLocaleString()} ₽</span>
                    </div>
                  </div>

                  <div className="goal-details">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>{formatDate(goal.deadline)}</span>
                    </div>
                    {daysLeft !== null && (
                      <div className="detail-item">
                        <TrendingUp size={16} />
                        <span className={daysLeft < 0 ? 'overdue' : daysLeft < 7 ? 'urgent' : ''}>
                          {daysLeft < 0 ? `Просрочено на ${Math.abs(daysLeft)} дн.` : 
                           daysLeft === 0 ? 'Срок сегодня' : 
                           `${daysLeft} дн. осталось`}
                        </span>
                      </div>
                    )}
                  </div>

                  {progress >= 100 && (
                    <div className="goal-completed">
                      🎉 Цель достигнута!
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Модальное окно создания/редактирования цели */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingGoal ? 'Редактировать цель' : 'Новая цель'}</h2>
              <button className="close-button button-animation" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); editingGoal ? updateGoal() : createGoal() }} className="goal-form">
              <div className="form-group">
                <label>Название цели *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Например: Новый телефон"
                  required
                />
              </div>

              <div className="form-group">
                <label>Целевая сумма *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Текущая сумма</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.current_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Срок достижения</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Дополнительная информация о цели"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="button secondary button-animation" onClick={handleCloseModal}>
                  Отмена
                </button>
                <button type="submit" className="button primary button-animation" disabled={loading}>
                  {loading ? 'Сохранение...' : (editingGoal ? 'Обновить' : 'Создать')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoalManager
