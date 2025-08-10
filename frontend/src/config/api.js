// API Configuration
export const API_CONFIG = {
  // Ngrok URL для бэкенда
  NGROK_BACKEND_URL: 'https://1b0966126d83.ngrok-free.app',
  
  // Локальный URL для разработки
  LOCAL_BACKEND_URL: 'http://localhost:3001',
  
  // Заголовки для обхода предупреждений ngrok
  HEADERS: {
    'ngrok-skip-browser-warning': 'true',
    'User-Agent': 'TelegramWebApp/1.0',
    'Content-Type': 'application/json'
  },
  
  // Таймаут для запросов
  TIMEOUT: 10000
}

// Функция для определения baseURL
export const getBaseURL = () => {
  // Если мы в Telegram Web App, используем ngrok URL для бэкенда
  if (window.Telegram?.WebApp) {
    return API_CONFIG.NGROK_BACKEND_URL
  }
  
  // Если локальная разработка
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return API_CONFIG.LOCAL_BACKEND_URL
  }
  
  // По умолчанию используем ngrok URL для бэкенда
  return API_CONFIG.NGROK_BACKEND_URL
}
