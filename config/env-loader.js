const path = require('path');
const fs = require('fs');

/**
 * Загружает переменные окружения из корневого .env файла
 * @param {string} projectRoot - Путь к корню проекта
 * @returns {Object} Объект с переменными окружения
 */
function loadEnvFromRoot(projectRoot = process.cwd()) {
  const envPath = path.join(projectRoot, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  Файл .env не найден в корне проекта');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  // Парсим .env файл
  envContent.split('\n').forEach(line => {
    line = line.trim();
    
    // Пропускаем комментарии и пустые строки
    if (line.startsWith('#') || !line || !line.includes('=')) {
      return;
    }

    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    
    // Убираем кавычки если есть
    const cleanValue = value.replace(/^["']|["']$/g, '');
    
    envVars[key.trim()] = cleanValue;
  });

  // Устанавливаем переменные в process.env
  Object.keys(envVars).forEach(key => {
    if (!process.env[key]) {
      process.env[key] = envVars[key];
    }
  });

  console.log('✅ Переменные окружения загружены из корневого .env файла');
  return envVars;
}

/**
 * Получает значение переменной окружения
 * @param {string} key - Ключ переменной
 * @param {string} defaultValue - Значение по умолчанию
 * @returns {string} Значение переменной
 */
function getEnv(key, defaultValue = '') {
  return process.env[key] || defaultValue;
}

/**
 * Проверяет, является ли окружение продакшн
 * @returns {boolean}
 */
function isProduction() {
  return getEnv('NODE_ENV') === 'production';
}

/**
 * Проверяет, является ли окружение разработкой
 * @returns {boolean}
 */
function isDevelopment() {
  return getEnv('NODE_ENV') === 'development';
}

/**
 * Получает конфигурацию для указанной части проекта
 * @param {string} part - Часть проекта (backend, frontend, ngrok)
 * @returns {Object} Конфигурация
 */
function getProjectConfig(part) {
  const configs = {
    backend: {
      port: getEnv('PORT', '3001'),
      dbPath: getEnv('DB_PATH', './money.db'),
      nodeEnv: getEnv('NODE_ENV', 'development'),
      botToken: getEnv('BOT_TOKEN'),
      webappUrl: getEnv('WEBAPP_URL'),
      webhookUrl: getEnv('WEBHOOK_URL'),
      corsOrigin: getEnv('CORS_ORIGIN', 'http://localhost:5176'),
      jwtSecret: getEnv('JWT_SECRET'),
      logLevel: getEnv('LOG_LEVEL', 'info'),
      logPath: getEnv('LOG_PATH', './logs')
    },
    frontend: {
      port: getEnv('FRONTEND_PORT', '5176'),
      backendUrl: getEnv('BACKEND_API_URL', 'http://localhost:3001'),
      frontendUrl: getEnv('FRONTEND_URL', 'http://localhost:5176'),
      nodeEnv: getEnv('NODE_ENV', 'development')
    },
    ngrok: {
      authToken: getEnv('NGROK_AUTHTOKEN'),
      domain: getEnv('NGROK_DOMAIN'),
      frontendPort: getEnv('FRONTEND_PORT', '5176'),
      backendPort: getEnv('PORT', '3001')
    }
  };

  return configs[part] || {};
}

module.exports = {
  loadEnvFromRoot,
  getEnv,
  isProduction,
  isDevelopment,
  getProjectConfig
};
