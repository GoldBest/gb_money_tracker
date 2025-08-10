// Загружаем переменные окружения из корневого .env файла
const { loadEnvFromRoot, getEnv, getProjectConfig } = require('../config/env-loader');

// Загружаем переменные из корневого .env
loadEnvFromRoot();

// Конфигурация для Telegram бота
console.log('🔧 Загрузка конфигурации...');
console.log('🔑 BOT_TOKEN из env:', getEnv('BOT_TOKEN') ? 'Загружен' : 'Не загружен');
console.log('🌐 WEBAPP_URL из env:', getEnv('WEBAPP_URL') ? 'Загружен' : 'Не загружен');

// Получаем конфигурацию для backend
const backendConfig = getProjectConfig('backend');

module.exports = {
  // Telegram Bot токен
  BOT_TOKEN: getEnv('BOT_TOKEN') || 'YOUR_BOT_TOKEN_HERE',
  
  // URL вашего Web App
  WEBAPP_URL: getEnv('WEBAPP_URL') || 'http://localhost:5176',
  
  // URL для webhook (для продакшн)
  WEBHOOK_URL: getEnv('WEBHOOK_URL') || null,
  
  // Порт сервера
  PORT: getEnv('PORT') || 3001,
  
  // Режим работы
  NODE_ENV: getEnv('NODE_ENV') || 'development',
  
  // Путь к базе данных
  DB_PATH: getEnv('DB_PATH') || './money.db',
  
  // CORS настройки
  CORS_ORIGIN: getEnv('CORS_ORIGIN') || 'http://localhost:5176',
  
  // JWT секрет
  JWT_SECRET: getEnv('JWT_SECRET') || 'your-super-secret-jwt-key-here',
  
  // Уровень логирования
  LOG_LEVEL: getEnv('LOG_LEVEL') || 'info',
  
  // Путь к логам
  LOG_PATH: getEnv('LOG_PATH') || './logs',
  
  // Настройки бота
  BOT_OPTIONS: {
    polling: true,
    // Для продакшн используйте webhook
    // webHook: {
    //   port: 443,
    //   host: 'your-domain.com'
    // }
  }
};

console.log('✅ Конфигурация загружена');
console.log('🔑 Итоговый BOT_TOKEN:', getEnv('BOT_TOKEN') || 'YOUR_BOT_TOKEN_HERE');
console.log('🔌 Порт сервера:', getEnv('PORT') || 3001);
console.log('🌍 Режим работы:', getEnv('NODE_ENV') || 'development');
