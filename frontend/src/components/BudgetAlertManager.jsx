import React, { useState, useEffect } from 'react'
import { AlertTriangle, Plus, Trash2, Edit, Bell, BellOff } from 'lucide-react'
import { useTelegram } from '../contexts/TelegramContext'
const BudgetAlertManager = () => {
  const { user } = useTelegram()
  const [alerts, setAlerts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAlert, setEditingAlert] = useState(null)
  const [formData, setFormData] = useState({
    category_id: '',
    limit: '',
    period: 'month',
    enabled: true
  })

  useEffect(() => {
    if (user) {
      loadAlerts()
      loadCategories()
    }
  }, [user])

  const loadAlerts = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${user.id}/budget-alerts`)
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/users/${user.id}/categories`)
      if (response.ok) {
        const data = await response.json()
        // Только категории расходов
        setCategories(data.filter(cat => cat.type === 'expense'))
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const createAlert = async () => {
    if (!user) return
    
    if (!formData.category_id || !formData.limit) {
      window.showTelegramAlert('Пожалуйста, заполните все поля')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/budget-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          ...formData,
          limit: parseFloat(formData.limit)
        })
      })

      if (response.ok) {
        window.showTelegramAlert('Уведомление о бюджете создано!')
        setShowCreateModal(false)
        setFormData({
          category_id: '',
          limit: '',
          period: 'month',
          enabled: true
        })
        loadAlerts()
      } else {
        throw new Error('Failed to create alert')
      }
    } catch (error) {
      console.error('Error creating alert:', error)
      window.showTelegramAlert('Ошибка при создании уведомления')
    } finally {
      setLoading(false)
    }
  }

  const updateAlert = async () => {
    if (!user || !editingAlert) return
    
    if (!formData.category_id || !formData.limit) {
      window.showTelegramAlert('Пожалуйста, заполните все поля')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/budget-alerts/${editingAlert.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          ...formData,
          limit: parseFloat(formData.limit)
        })
      })

      if (response.ok) {
        window.showTelegramAlert('Уведомление обновлено!')
        setEditingAlert(null)
        setFormData({
          category_id: '',
          limit: '',
          period: 'month',
          enabled: true
        })
        loadAlerts()
      } else {
        throw new Error('Failed to update alert')
      }
    } catch (error) {
      console.error('Error updating alert:', error)
      window.showTelegramAlert('Ошибка при обновлении уведомления')
    } finally {
      setLoading(false)
    }
  }

  const deleteAlert = async (alertId) => {
    if (!user) return
    
    if (!window.confirm('Вы уверены, что хотите удалить это уведомление?')) {
      return
    }

    try {
      const response = await fetch(`/api/budget-alerts/${alertId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: user.id })
      })

      if (response.ok) {
        window.showTelegramAlert('Уведомление удалено!')
        loadAlerts()
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
      window.showTelegramAlert('Ошибка при удалении уведомления')
    }
  }

  const toggleAlert = async (alertId, enabled) => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/budget-alerts/${alertId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          user_id: user.id,
          enabled: !enabled
        })
      })

      if (response.ok) {
        window.showTelegramAlert(`Уведомление ${!enabled ? 'включено' : 'отключено'}!`)
        loadAlerts()
      }
    } catch (error) {
      console.error('Error toggling alert:', error)
      window.showTelegramAlert('Ошибка при изменении состояния уведомления')
    }
  }

  const handleEdit = (alert) => {
    setEditingAlert(alert)
    setFormData({
      category_id: alert.category_id,
      limit: alert.limit.toString(),
      period: alert.period,
      enabled: alert.enabled
    })
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingAlert(null)
    setFormData({
      category_id: '',
      limit: '',
      period: 'month',
      enabled: true
    })
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : 'Неизвестная категория'
  }

  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.color : '#6B7280'
  }

  const formatPeriod = (period) => {
    const periods = {
      week: 'Неделя',
      month: 'Месяц',
      quarter: 'Квартал',
      year: 'Год'
    }
    return periods[period] || period
  }

  return (
    <div className="budget-alert-manager">
      {!user ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 mx-auto mb-4 animate-spin text-muted">⏳</div>
          <p className="text-muted">Загрузка пользователя...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Уведомления о бюджете
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Добавить уведомление
            </button>
          </div>

          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-900 mb-1">
                  Уведомления о превышении бюджета
                </h3>
                <p className="text-sm text-amber-700">
                  Настройте уведомления для отслеживания расходов по категориям. 
                  Получайте предупреждения, когда траты приближаются к установленному лимиту.
                </p>
              </div>
            </div>
          </div>

          {loading && alerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 mx-auto mb-4 animate-spin text-muted">⏳</div>
              <p className="text-muted">Загрузка уведомлений...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>У вас пока нет уведомлений о бюджете</p>
              <p className="text-sm">Создайте первое уведомление для отслеживания расходов</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 bg-card rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${getCategoryColor(alert.category_id)}20` }}
                      >
                        <AlertTriangle 
                          className="w-5 h-5" 
                          style={{ color: getCategoryColor(alert.category_id) }}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {getCategoryName(alert.category_id)}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-muted mt-1">
                          <span>Лимит: {alert.limit} ₽</span>
                          <span>Период: {formatPeriod(alert.period)}</span>
                          <span className={`flex items-center gap-1 ${alert.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                            {alert.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                            {alert.enabled ? 'Активно' : 'Отключено'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAlert(alert.id, alert.enabled)}
                        className={`btn-icon ${alert.enabled ? 'text-amber-600 hover:text-amber-700' : 'text-gray-600 hover:text-gray-700'}`}
                        title={alert.enabled ? 'Отключить' : 'Включить'}
                      >
                        {alert.enabled ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(alert)}
                        className="btn-icon text-blue-600 hover:text-blue-700"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="btn-icon text-red-500 hover:text-red-600"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Модальное окно создания/редактирования */}
      {(showCreateModal || editingAlert) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">
              {editingAlert ? 'Редактировать уведомление' : 'Создать уведомление'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите категорию</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Лимит (₽) *
              </label>
              <input
                type="number"
                value={formData.limit}
                onChange={(e) => setFormData(prev => ({ ...prev, limit: e.target.value }))}
                placeholder="1000"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Период
              </label>
              <select
                value={formData.period}
                onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Неделя</option>
                <option value="month">Месяц</option>
                <option value="quarter">Квартал</option>
                <option value="year">Год</option>
              </select>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={editingAlert ? updateAlert : createAlert}
                disabled={loading}
                className="btn-primary px-4 py-2"
              >
                {loading ? (
                  <div className="w-4 h-4 animate-spin">⏳</div>
                ) : (
                  editingAlert ? 'Обновить' : 'Создать'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BudgetAlertManager

