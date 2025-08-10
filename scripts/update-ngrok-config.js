#!/usr/bin/env node

/**
 * Скрипт для обновления ngrok.yml из переменных окружения
 */

const fs = require('fs');
const path = require('path');
const { loadEnvFromRoot, getEnv } = require('../config/env-loader');

// Загружаем переменные окружения
loadEnvFromRoot();

// Получаем значения из .env
const ngrokAuthToken = getEnv('NGROK_AUTHTOKEN');
const frontendPort = getEnv('FRONTEND_PORT', '5176');
const backendPort = getEnv('PORT', '3001');
const ngrokDomain = getEnv('NGROK_DOMAIN');

// Создаем содержимое ngrok.yml
const ngrokConfig = `version: "2"
authtoken: ${ngrokAuthToken || 'YOUR_NGROK_AUTHTOKEN'}
tunnels:
  frontend:
    addr: ${frontendPort}
    proto: http
    inspect: false
    ${ngrokDomain ? `domain: ${ngrokDomain}` : ''}
  backend:
    addr: ${backendPort}
    proto: http
    inspect: false
    ${ngrokDomain ? `domain: ${ngrokDomain}-backend` : ''}
`;

// Путь к ngrok.yml
const ngrokPath = path.join(__dirname, '..', 'ngrok.yml');

try {
  // Записываем конфигурацию
  fs.writeFileSync(ngrokPath, ngrokConfig);
  console.log('✅ ngrok.yml обновлен из переменных окружения');
  console.log(`🔌 Frontend порт: ${frontendPort}`);
  console.log(`🔌 Backend порт: ${backendPort}`);
  if (ngrokDomain) {
    console.log(`🌐 Ngrok домен: ${ngrokDomain}`);
  }
} catch (error) {
  console.error('❌ Ошибка при обновлении ngrok.yml:', error.message);
  process.exit(1);
}
