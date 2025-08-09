// Конфигурация для Telegram бота
module.exports = {
  // Telegram Bot токен (замените на свой)
  BOT_TOKEN: process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE',
  
  // URL вашего Web App
  WEBAPP_URL: process.env.WEBAPP_URL || 'https://f55e154b6f3a.ngrok-free.app',
  
  // URL для webhook (для продакшн)
  WEBHOOK_URL: process.env.WEBHOOK_URL || null,
  
  // Порт сервера
  PORT: process.env.PORT || 3001,
  
  // Режим работы
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Путь к базе данных
  DB_PATH: process.env.DB_PATH || './money.db',
  
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
