import React, { useState, useEffect } from 'react'
import { Bell, Settings, X, Check, AlertTriangle, Info } from 'lucide-react'
import { hapticFeedback } from '../utils/haptic'

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    budgetAlerts: true,
    goalReminders: true,
    weeklyReports: true,
    lowBalance: true,
    unusualSpending: true
  })

  useEffect(() => {
    loadNotifications()
    loadSettings()
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/notification-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      })

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ))
        hapticFeedback.light()
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== notificationId))
        hapticFeedback.success()
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const updateSettings = async (newSettings) => {
    try {
      const response = await fetch('/api/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      })

      if (response.ok) {
        setSettings(newSettings)
        hapticFeedback.success()
        window.showTelegramAlert('Настройки уведомлений обновлены!')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      hapticFeedback.error()
      window.showTelegramAlert('Ошибка при обновлении настроек')
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'budget':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'goal':
        return <Check className="w-5 h-5 text-green-500" />
      case 'report':
        return <Info className="w-5 h-5 text-blue-500" />
      case 'balance':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'budget':
        return 'border-l-orange-500 bg-orange-50'
      case 'goal':
        return 'border-l-green-500 bg-green-50'
      case 'report':
        return 'border-l-blue-500 bg-blue-50'
      case 'balance':
        return 'border-l-red-500 bg-red-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now - date
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))

    if (diffDays > 0) {
      return `${diffDays} дн. назад`
    } else if (diffHours > 0) {
      return `${diffHours} ч. назад`
    } else if (diffMinutes > 0) {
      return `${diffMinutes} мин. назад`
    } else {
      return 'Только что'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="notification-manager">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Уведомления
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="btn-secondary flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Настройки
        </button>
      </div>

      {showSettings && (
        <div className="mb-6 p-4 bg-card rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Настройки уведомлений</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.budgetAlerts}
                onChange={(e) => updateSettings({...settings, budgetAlerts: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>Предупреждения о превышении бюджета</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.goalReminders}
                onChange={(e) => updateSettings({...settings, goalReminders: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>Напоминания о целях</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.weeklyReports}
                onChange={(e) => updateSettings({...settings, weeklyReports: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>Еженедельные отчеты</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.lowBalance}
                onChange={(e) => updateSettings({...settings, lowBalance: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>Низкий баланс</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.unusualSpending}
                onChange={(e) => updateSettings({...settings, unusualSpending: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>Необычные траты</span>
            </label>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>У вас пока нет уведомлений</p>
            <p className="text-sm">Здесь будут появляться важные сообщения о ваших финансах</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-l-4 ${
                notification.read ? 'opacity-75' : ''
              } ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{formatDate(notification.created_at)}</span>
                        {notification.category && (
                          <span className="bg-gray-200 px-2 py-1 rounded">
                            {notification.category}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-3">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="btn-icon text-blue-600 hover:text-blue-700"
                          title="Отметить как прочитанное"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="btn-icon text-red-500 hover:text-red-600"
                        title="Удалить"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              // Mark all as read
              notifications.forEach(n => {
                if (!n.read) markAsRead(n.id)
              })
            }}
            className="btn-secondary"
          >
            Отметить все как прочитанные
          </button>
        </div>
      )}
    </div>
  )
}

export default NotificationManager
