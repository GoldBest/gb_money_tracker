// API Configuration
// Примечание: В frontend мы не можем напрямую читать .env файл,
// поэтому используем переменные, которые будут установлены при сборке

export const API_CONFIG = {
  // Ngrok URL для бэкенда (будет заменен при сборке)
  NGROK_BACKEND_URL: import.meta.env.VITE_NGROK_BACKEND_URL || 'https://c93fb5a36884.ngrok-free.app',
  
  // Локальный URL для разработки
  LOCAL_BACKEND_URL: import.meta.env.VITE_LOCAL_BACKEND_URL || 'http://localhost:3001',
  
  // Заголовки для обхода предупреждений ngrok
  HEADERS: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
  },
  
  // Таймаут для запросов
  TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 10000
}

// Отладочная информация при загрузке модуля
console.log('🔍 API_CONFIG loaded:', {
  NGROK_BACKEND_URL: API_CONFIG.NGROK_BACKEND_URL,
  LOCAL_BACKEND_URL: API_CONFIG.LOCAL_BACKEND_URL,
  VITE_NGROK_BACKEND_URL: import.meta.env.VITE_NGROK_BACKEND_URL,
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
    isNgrok: hostname.includes('ngrok-free.app'),
    isLocalhost: hostname === 'localhost' || hostname === '127.0.0.1'
  })
  
  // ВСЕГДА используем локальный бэкенд для разработки
  // Независимо от того, как открыт фронтенд (localhost или ngrok)
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
