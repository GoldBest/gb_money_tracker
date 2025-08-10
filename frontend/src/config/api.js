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
