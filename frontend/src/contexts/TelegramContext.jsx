import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const TelegramContext = createContext()

export const useTelegram = () => {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider')
  }
  return context
}

// Функция для определения baseURL
const getBaseURL = () => {
  // Если мы в Telegram Web App, используем ngrok URL для бэкенда
  if (window.Telegram?.WebApp) {
    return 'https://46d4bfbcf6f5.ngrok-free.app'
  }
  
  // Если локальная разработка
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001'
  }
  
  // По умолчанию используем ngrok URL для бэкенда
  return 'https://46d4bfbcf6f5.ngrok-free.app'
}

// Создаем axios instance с настройками
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
})

// Логируем используемый baseURL
console.log('🔗 API Base URL:', getBaseURL())
console.log('🌐 Current hostname:', window.location.hostname)
console.log('📱 Telegram WebApp available:', !!window.Telegram?.WebApp)

// Interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    console.error('Request URL:', error.config?.url)
    console.error('Base URL:', error.config?.baseURL)
    
    if (error.response?.status === 500) {
      window.showTelegramAlert('Ошибка сервера. Попробуйте позже.')
    } else if (error.response?.status === 404) {
      window.showTelegramAlert('Ресурс не найден.')
    } else if (error.code === 'ECONNABORTED') {
      window.showTelegramAlert('Превышено время ожидания. Проверьте соединение.')
    } else if (!error.response) {
      if (error.code === 'ERR_NETWORK') {
        window.showTelegramAlert('Ошибка сети. Проверьте интернет соединение.')
      } else {
        window.showTelegramAlert(`Ошибка соединения: ${error.message}`)
      }
    }
    
    return Promise.reject(error)
  }
)

export const TelegramProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  // Mock Telegram Web App functions for development
  useEffect(() => {
    if (!window.Telegram?.WebApp) {
      // Mock Telegram Web App
      window.Telegram = {
        WebApp: {
          ready: () => console.log('Mock Telegram WebApp ready'),
          expand: () => console.log('Mock Telegram WebApp expand'),
          initDataUnsafe: {
            user: {
              id: 123456789,
              username: 'test_user',
              first_name: 'Test User'
            }
          }
        }
      }
      
      // Mock showTelegramAlert function
      window.showTelegramAlert = (message) => {
        console.log('Mock Telegram Alert:', message)
        alert(message)
      }
      
      // Mock haptic feedback
      window.Telegram.WebApp.HapticFeedback = {
        impactOccurred: (style) => console.log('Mock haptic feedback:', style),
        notificationOccurred: (type) => console.log('Mock haptic notification:', type),
        selectionChanged: () => console.log('Mock haptic selection')
      }
    }
  }, [])

  // Initialize Telegram Web App
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
      
      const initUser = window.Telegram.WebApp.initDataUnsafe?.user
      if (initUser) {
        createOrGetUser(initUser)
      } else {
        // For development/testing without Telegram
        createOrGetUser({
          id: 123456789,
          username: 'test_user',
          first_name: 'Test User'
        })
      }
    } else {
      // Fallback for development
      createOrGetUser({
        id: 123456789,
        username: 'test_user',
        first_name: 'Test User'
      })
    }
  }, [])

  const createOrGetUser = async (telegramUser, retry = 0) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.post('/api/users', {
        telegram_id: telegramUser.id.toString(),
        username: telegramUser.username,
        first_name: telegramUser.first_name
      })
      
      setUser(response.data)
      setRetryCount(0)
    } catch (err) {
      console.error('Error creating/getting user:', err)
      setError(err.message)
      
      // Retry logic
      if (retry < 3) {
        setTimeout(() => {
          createOrGetUser(telegramUser, retry + 1)
        }, 1000 * (retry + 1))
      } else {
        setRetryCount(retry)
      }
    } finally {
      setLoading(false)
    }
  }

  const retryConnection = () => {
    if (user) {
      createOrGetUser({
        id: user.telegram_id,
        username: user.username,
        first_name: user.first_name
      })
    }
  }

  const api = {
    get: (url) => apiClient.get(url),
    post: (url, data) => apiClient.post(url, data),
    delete: (url) => apiClient.delete(url)
  }

  const value = {
    user,
    loading,
    error,
    retryCount,
    retryConnection,
    api,
    telegram: window.Telegram?.WebApp
  }

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  )
}
