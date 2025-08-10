#!/usr/bin/env node

/**
 * 🧪 Улучшенный тест Telegram бота для GB Money Tracker
 * Тестирует функциональность бота без внешних зависимостей
 */

console.log('🧪 Начинаем тестирование Telegram бота...\n');

// Проверяем конфигурацию
console.log('1. Проверка конфигурации...');
try {
  const config = require('./backend/config.js');
  console.log('✅ Конфигурация загружена');
  console.log(`   - Порт: ${config.PORT}`);
  console.log(`   - WebApp URL: ${config.WEBAPP_URL}`);
  console.log(`   - Режим: ${config.NODE_ENV}`);
} catch (error) {
  console.log('❌ Ошибка загрузки конфигурации:', error.message);
  process.exit(1);
}

// Проверяем файлы бота
console.log('\n2. Проверка файлов бота...');
const fs = require('fs');
const path = require('path');

const botFiles = [
  'backend/bot.js',
  'backend/server.js',
  'backend/config.js'
];

botFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - найден`);
  } else {
    console.log(`❌ ${file} - не найден`);
  }
});

// Проверяем переменные окружения
console.log('\n3. Проверка переменных окружения...');
const envPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Файл .env найден');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasBotToken = envContent.includes('BOT_TOKEN');
  const hasWebAppUrl = envContent.includes('WEBAPP_URL');
  
  console.log(`   - BOT_TOKEN: ${hasBotToken ? '✅' : '❌'}`);
  console.log(`   - WEBAPP_URL: ${hasWebAppUrl ? '✅' : '❌'}`);
} else {
  console.log('❌ Файл .env не найден');
  console.log('   Создайте файл backend/.env с переменными:');
  console.log('   BOT_TOKEN=your_bot_token_here');
  console.log('   WEBAPP_URL=https://your-domain.com');
}

// Проверяем базу данных
console.log('\n4. Проверка базы данных...');
const dbPath = path.join(__dirname, 'backend', 'money.db');
if (fs.existsSync(dbPath)) {
  console.log('✅ База данных найдена');
  const stats = fs.statSync(dbPath);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`   - Размер: ${sizeInMB} MB`);
  console.log(`   - Последнее изменение: ${stats.mtime.toLocaleString('ru-RU')}`);
} else {
  console.log('❌ База данных не найдена');
}

// Проверяем package.json
console.log('\n5. Проверка зависимостей...');
const packagePath = path.join(__dirname, 'backend', 'package.json');
if (fs.existsSync(packagePath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const hasBotApi = packageJson.dependencies && packageJson.dependencies['node-telegram-bot-api'];
    const hasExpress = packageJson.dependencies && packageJson.dependencies.express;
    
    console.log('✅ package.json найден');
    console.log(`   - node-telegram-bot-api: ${hasBotApi ? '✅' : '❌'}`);
    console.log(`   - express: ${hasExpress ? '✅' : '❌'}`);
    
    if (!hasBotApi) {
      console.log('   Установите: npm install node-telegram-bot-api --prefix backend');
    }
  } catch (error) {
    console.log('❌ Ошибка чтения package.json:', error.message);
  }
} else {
  console.log('❌ package.json не найден');
}

// Проверяем ngrok туннели
console.log('\n6. Проверка ngrok туннелей...');
const ngrokLogPath = path.join(__dirname, 'ngrok.log');
if (fs.existsSync(ngrokLogPath)) {
  console.log('✅ Ngrok лог найден');
  const logContent = fs.readFileSync(ngrokLogPath, 'utf8');
  const hasTunnels = logContent.includes('tunnel established');
  const hasErrors = logContent.includes('error');
  
  console.log(`   - Туннели: ${hasTunnels ? '✅' : '❌'}`);
  console.log(`   - Ошибки: ${hasErrors ? '⚠️' : '✅'}`);
} else {
  console.log('❌ Ngrok лог не найден');
}

// Проверяем скрипты запуска
console.log('\n7. Проверка скриптов запуска...');
const scripts = [
  'setup-bot.sh',
  'start-ngrok.sh'
];

scripts.forEach(script => {
  if (fs.existsSync(script)) {
    const stats = fs.statSync(script);
    const isExecutable = (stats.mode & fs.constants.S_IXUSR) !== 0;
    console.log(`✅ ${script} - найден ${isExecutable ? '(исполняемый)' : '(не исполняемый)'}`);
  } else {
    console.log(`❌ ${script} - не найден`);
  }
});

// Проверяем API endpoints
console.log('\n8. Проверка API endpoints...');
const serverPath = path.join(__dirname, 'backend', 'server.js');
if (fs.existsSync(serverPath)) {
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  const endpoints = [
    '/api/health',
    '/api/users',
    '/api/categories',
    '/api/transactions',
    '/api/stats'
  ];
  
  endpoints.forEach(endpoint => {
    const hasEndpoint = serverContent.includes(endpoint);
    console.log(`   ${endpoint}: ${hasEndpoint ? '✅' : '❌'}`);
  });
} else {
  console.log('❌ server.js не найден');
}

// Рекомендации
console.log('\n📋 Рекомендации:');
console.log('1. Убедитесь, что backend сервер запущен: npm run dev:backend');
console.log('2. Проверьте, что ngrok туннели активны: ./start-ngrok.sh');
console.log('3. Настройте бота: ./setup-bot.sh');
console.log('4. Протестируйте команды бота в Telegram');

// Проверяем статус сервисов
console.log('\n9. Проверка статуса сервисов...');
const http = require('http');

// Проверка backend
const checkBackend = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          resolve({
            status: 'online',
            database: health.database,
            timestamp: health.timestamp
          });
        } catch (error) {
          resolve({ status: 'error', message: 'Invalid JSON response' });
        }
      });
    });
    
    req.on('error', () => resolve({ status: 'offline' }));
    req.on('timeout', () => resolve({ status: 'timeout' }));
    req.end();
  });
};

checkBackend().then(status => {
  if (status.status === 'online') {
    console.log('✅ Backend сервер: онлайн');
    console.log(`   - База данных: ${status.database}`);
    console.log(`   - Время: ${status.timestamp}`);
  } else {
    console.log(`❌ Backend сервер: ${status.status}`);
    if (status.message) console.log(`   - Ошибка: ${status.message}`);
  }
});

console.log('\n🎉 Тестирование завершено!');
console.log('\n📱 Следующие шаги:');
console.log('1. Запустите backend: npm run dev:backend');
console.log('2. Запустите frontend: npm run dev:frontend');
console.log('3. Запустите ngrok: ./start-ngrok.sh');
console.log('4. Настройте бота: ./setup-bot.sh');
console.log('5. Протестируйте в Telegram!');
