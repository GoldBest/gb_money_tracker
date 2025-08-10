import React, { useState, useEffect } from 'react'
import { Download, Upload, Database, FileText, Calendar, Trash2, RefreshCw } from 'lucide-react'
import { hapticFeedback } from '../utils/haptic'
import { useTelegram } from '../contexts/TelegramContext'

const BackupManager = () => {
  const { user } = useTelegram()
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState(null)
  const [restoreProgress, setRestoreProgress] = useState(0)
  const [backupName, setBackupName] = useState('')
  const [backupDescription, setBackupDescription] = useState('')

  useEffect(() => {
    if (user) {
      loadBackups()
    }
  }, [user])

  const loadBackups = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/backups?user_id=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setBackups(data)
      }
    } catch (error) {
      console.error('Error loading backups:', error)
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await fetch('/api/backups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          user_id: user.id,
          name: backupName || 'Автоматическая копия',
          description: backupDescription || ''
        })
      })

      if (response.ok) {
        hapticFeedback.success()
        window.showTelegramAlert('Резервная копия создана успешно!')
        setShowCreateModal(false)
        setBackupName('')
        setBackupDescription('')
        loadBackups()
      } else {
        throw new Error('Failed to create backup')
      }
    } catch (error) {
      console.error('Error creating backup:', error)
      hapticFeedback.error()
      window.showTelegramAlert('Ошибка при создании резервной копии')
    } finally {
      setLoading(false)
    }
  }

  const downloadBackup = async (backupId) => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/backups/${backupId}/download?user_id=${user.id}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `backup_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        hapticFeedback.success()
        window.showTelegramAlert('Резервная копия загружена!')
      }
    } catch (error) {
      console.error('Error downloading backup:', error)
      hapticFeedback.error()
      window.showTelegramAlert('Ошибка при загрузке резервной копии')
    }
  }

  const restoreBackup = async (backupId) => {
    if (!user) return
    
    if (!window.confirm('Внимание! Восстановление данных перезапишет все текущие данные. Продолжить?')) {
      return
    }

    try {
      setShowRestoreModal(true)
      setRestoreProgress(0)
      
      const response = await fetch(`/api/backups/${backupId}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: user.id })
      })

      if (response.ok) {
        // Симулируем прогресс восстановления
        for (let i = 0; i <= 100; i += 10) {
          setRestoreProgress(i)
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        hapticFeedback.success()
        window.showTelegramAlert('Данные восстановлены успешно! Приложение будет перезагружено.')
        
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        throw new Error('Failed to restore backup')
      }
    } catch (error) {
      console.error('Error restoring backup:', error)
      hapticFeedback.error()
      window.showTelegramAlert('Ошибка при восстановлении данных')
    } finally {
      setShowRestoreModal(false)
      setRestoreProgress(0)
    }
  }

  const deleteBackup = async (backupId) => {
    if (!user) return
    
    if (!window.confirm('Вы уверены, что хотите удалить эту резервную копию?')) {
      return
    }

    try {
      const response = await fetch(`/api/backups/${backupId}?user_id=${user.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        hapticFeedback.success()
        window.showTelegramAlert('Резервная копия удалена!')
        loadBackups()
      }
    } catch (error) {
      console.error('Error deleting backup:', error)
      hapticFeedback.error()
      window.showTelegramAlert('Ошибка при удалении резервной копии')
    }
  }

  const importBackup = async (event) => {
    if (!user) return
    
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      window.showTelegramAlert('Пожалуйста, выберите JSON файл')
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target.result)
          
          const response = await fetch('/api/backups/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: user.id,
              ...backupData
            })
          })

          if (response.ok) {
            hapticFeedback.success()
            window.showTelegramAlert('Резервная копия импортирована успешно!')
            loadBackups()
          } else {
            throw new Error('Failed to import backup')
          }
        } catch (error) {
          console.error('Error parsing backup file:', error)
          hapticFeedback.error()
          window.showTelegramAlert('Ошибка при чтении файла резервной копии')
        }
      }
      reader.readAsText(file)
    } catch (error) {
      console.error('Error importing backup:', error)
      hapticFeedback.error()
      window.showTelegramAlert('Ошибка при импорте резервной копии')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Б'
    const k = 1024
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="backup-manager">
      {!user ? (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-muted" />
          <p className="text-muted">Загрузка пользователя...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Database className="w-5 h-5" />
              Резервные копии
            </h2>
            <div className="flex gap-3">
              <label className="btn-secondary flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Импорт
                <input
                  type="file"
                  accept=".json"
                  onChange={importBackup}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Создать копию
              </button>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">
                  Резервные копии данных
                </h3>
                <p className="text-sm text-blue-700">
                  Создавайте резервные копии всех ваших финансовых данных для безопасного хранения. 
                  Рекомендуется создавать копии регулярно, особенно перед важными изменениями.
                </p>
              </div>
            </div>
          </div>

          {loading && backups.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-muted" />
              <p className="text-muted">Загрузка резервных копий...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>У вас пока нет резервных копий</p>
              <p className="text-sm">Создайте первую копию для защиты ваших данных</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="p-4 bg-card rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Database className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {backup.name || 'Резервная копия'} от {formatDate(backup.created_at)}
                        </h4>
                        {backup.description && (
                          <p className="text-sm text-gray-600 mt-1">{backup.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted mt-1">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {formatFileSize(backup.size || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {backup.transactions_count || 0} транзакций
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadBackup(backup.id)}
                        className="btn-icon text-blue-600 hover:text-blue-700"
                        title="Скачать"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => restoreBackup(backup.id)}
                        className="btn-icon text-green-600 hover:text-green-700"
                        title="Восстановить"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBackup(backup.id)}
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

      {/* Модальное окно восстановления */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Восстановление данных</h3>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${restoreProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted mt-2">
                Прогресс: {restoreProgress}%
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Пожалуйста, не закрывайте приложение во время восстановления данных.
            </p>
          </div>
        </div>
      )}

      {/* Модальное окно создания резервной копии */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Создать резервную копию</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название
              </label>
              <input
                type="text"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder="Автоматическая копия"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание (необязательно)
              </label>
              <textarea
                value={backupDescription}
                onChange={(e) => setBackupDescription(e.target.value)}
                placeholder="Описание резервной копии..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setBackupName('')
                  setBackupDescription('')
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={createBackup}
                disabled={loading}
                className="btn-primary px-4 py-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Создать'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BackupManager
