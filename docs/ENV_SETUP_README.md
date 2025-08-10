# 🔧 Настройка переменных окружения

Этот проект использует централизованную систему переменных окружения через корневой `.env` файл.

## 📁 Структура файлов

```
tg-money-miniapp/
├── .env                    # Основной файл с переменными (создается автоматически)
├── env.example            # Пример файла с переменными
├── setup-env.sh          # Скрипт настройки переменных
├── config/
│   └── env-loader.js     # Утилита загрузки переменных

```

## 🚀 Быстрый старт

### 1. Настройка переменных окружения

```bash
# Запустите скрипт настройки
./setup-env.sh

# Или скопируйте пример вручную
cp env.example .env
```

### 2. Заполните основные переменные

Отредактируйте файл `.env` и заполните:

```bash
# Telegram Bot токен (обязательно)
BOT_TOKEN=your_actual_bot_token_here



# Порт для backend (по умолчанию 3001)
PORT=3001

# Порт для frontend (по умолчанию 5176)
FRONTEND_PORT=5176
```



## 🔑 Основные переменные

### Telegram Bot
- `BOT_TOKEN` - Токен вашего Telegram бота
- `WEBAPP_URL` - URL вашего Web App
- `WEBHOOK_URL` - URL для webhook (для продакшн)

### Сервер
- `PORT` - Порт для backend сервера
- `FRONTEND_PORT` - Порт для frontend (Vite)
- `NODE_ENV` - Режим работы (development/production)



### API
- `BACKEND_API_URL` - URL для backend API
- `FRONTEND_URL` - URL для frontend

### Безопасность
- `JWT_SECRET` - Секретный ключ для JWT
- `CORS_ORIGIN` - CORS настройки

## 📝 Использование в коде

### Backend (Node.js)

```javascript
const { loadEnvFromRoot, getEnv, getProjectConfig } = require('../config/env-loader');

// Загружаем переменные из корневого .env
loadEnvFromRoot();

// Получаем значение переменной
const botToken = getEnv('BOT_TOKEN');

// Получаем конфигурацию для backend
const config = getProjectConfig('backend');
```

### Frontend (Vite)

```javascript
// Переменные доступны через import.meta.env
const backendUrl = import.meta.env.VITE_BACKEND_API_URL;

// Или через глобальные переменные
const backendUrl = __BACKEND_URL__;
```

## 🔄 Автоматическое обновление

### Переменные окружения

### Переменные окружения

```bash
# Настроить переменные заново
npm run setup:env

# Установить все зависимости
npm run install:all
```

## 🛠️ Скрипты npm

```bash
# Основные команды
npm run dev              # Запуск backend + frontend
npm run dev:backend      # Только backend
npm run dev:frontend     # Только frontend
npm run bot              # Запуск бота
npm run setup:bot        # Настройка бота
npm run setup:env        # Настройка переменных


# Сборка
npm run build            # Сборка всего проекта
npm run build:frontend   # Сборка frontend
npm run build:backend    # Сборка backend

# Утилиты
npm run clean            # Очистка node_modules
npm run install:all      # Установка всех зависимостей
```

## 🔒 Безопасность

### .gitignore

Убедитесь, что `.env` файл добавлен в `.gitignore`:

```gitignore
# Переменные окружения
.env
.env.local
.env.*.local

# Логи
*.log
logs/

# База данных
*.db
*.sqlite
```

### Резервные копии

Скрипт `setup-env.sh` автоматически создает резервные копии существующих `.env` файлов.

## 🚨 Устранение неполадок

### Переменные не загружаются

1. Проверьте, что файл `.env` существует в корне проекта
2. Убедитесь, что синтаксис файла корректен
3. Проверьте права доступа к файлу



### Frontend не подключается к backend

1. Проверьте `PORT` и `FRONTEND_PORT` в `.env`
2. Убедитесь, что backend запущен
3. Проверьте CORS настройки

## 📚 Дополнительные ресурсы

- [Telegram Bot API](https://core.telegram.org/bots/api)

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Node.js Environment Variables](https://nodejs.org/api/process.html#processenv)
