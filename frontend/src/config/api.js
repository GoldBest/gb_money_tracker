// API Configuration
// Примечание: В frontend мы не можем напрямую читать .env файл,
// поэтому используем переменные, которые будут установлены при сборке

export const API_CONFIG = {
  // URL для бэкенда (будет заменен при сборке)
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  
  // Локальный URL для разработки
  LOCAL_BACKEND_URL: import.meta.env.VITE_LOCAL_BACKEND_URL || 'http://localhost:3001',
  
  // Заголовки для API запросов
  HEADERS: {
    'Content-Type': 'application/json'
  },
  
  // Таймаут для запросов
  TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 10000
}

// Отладочная информация при загрузке модуля
console.log('🔍 API_CONFIG loaded:', {
  BACKEND_URL: API_CONFIG.BACKEND_URL,
  LOCAL_BACKEND_URL: API_CONFIG.LOCAL_BACKEND_URL,
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  VITE_LOCAL_BACKEND_URL: import.meta.env.VITE_LOCAL_BACKEND_URL
})

// Функция для определения baseURL
export const getBaseURL = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;
  
  console.log('🔍 getBaseURL() called with:', {
    hostname,
    port,
    protocol,
    fullLocation: window.location.href,
    hasTelegram: !!window.Telegram?.WebApp,
    isLocalhost: hostname === 'localhost' || hostname === '127.0.0.1'
  })
  
  // ВСЕГДА используем локальный бэкенд для разработки
  console.log('🔍 Using LOCAL_BACKEND_URL:', API_CONFIG.LOCAL_BACKEND_URL)
  return API_CONFIG.LOCAL_BACKEND_URL
}

// Функция для получения конфигурации в зависимости от окружения
export const getApiConfig = () => {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;
  
  return {
    baseURL: getBaseURL(),
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
    environment: isDev ? 'development' : isProd ? 'production' : 'unknown'
  };
};
