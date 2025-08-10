# TG Money MiniApp

Telegram мини-приложение для управления личными финансами.

## Структура проекта

```
tg-money-miniapp/
├── frontend/           # React фронтенд приложение
├── backend/            # Node.js бэкенд
├── docs/              # Документация и README файлы
├── tests/             # Тестовые файлы и скрипты
├── deploy/            # Скрипты развертывания и конфигурация
├── logs/              # Логи приложения
├── config/            # Конфигурационные файлы
├── scripts/           # Вспомогательные скрипты
└── package.json       # Зависимости проекта
```

## 🐳 Быстрый старт с Docker

### 1. **Запуск локальной разработки:**
   ```bash
   # Запуск всех сервисов
   docker-compose up -d
   
   # Проверка статуса
   docker-compose ps
   ```

### 2. **Доступ к приложению:**
   - **Frontend**: http://localhost:8081
   - **Backend API**: http://localhost:3002
   - **PostgreSQL**: localhost:5433

### 3. **Остановка:**
   ```bash
   docker-compose down
   ```

**📖 Подробное руководство**: [QUICK_START_DOCKER.md](QUICK_START_DOCKER.md)

## 🔧 Ручная установка

1. **Установка зависимостей:**
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Настройка окружения:**
   ```bash
   cp config/env.example .env
   # Отредактируйте .env файл
   ```

3. **Запуск:**
   ```bash
   # Бэкенд
   npm run dev:backend
   
   # Фронтенд
   npm run dev:frontend
   ```

## Документация

- [Быстрый старт с Docker](QUICK_START_DOCKER.md)
- [Локальная разработка с Docker](docs/DOCKER_DEVELOPMENT.md)
- [Настройка бота](docs/BOT_SETUP_README.md)
- [Настройка окружения](docs/ENV_SETUP_README.md)
- [План развертывания](docs/PRODUCTION_DEPLOYMENT_PLAN.md)
- [Инструкции по тестированию](docs/TESTING_INSTRUCTIONS.md)

## Тестирование

Все тестовые файлы находятся в папке `tests/`:
- `comprehensive-test.js` - комплексное тестирование
- `test-*.js` - модульные тесты
- `test-*.html` - HTML тесты для фронтенда

## 🚀 Развертывание

### ☁️ Yandex Cloud (рекомендуется для России)
- **Быстрый старт**: [QUICK_YANDEX_DEPLOY.md](QUICK_YANDEX_DEPLOY.md)
- **Подробное руководство**: [docs/YANDEX_DEPLOYMENT_GUIDE.md](docs/YANDEX_DEPLOYMENT_GUIDE.md)

### 🔧 Локальная разработка
Скрипты и конфигурация для развертывания в папке `deploy/`:
- `setup-env.sh` - настройка окружения
- `setup-bot.sh` - настройка Telegram бота

## 🐳 Docker

Проект полностью настроен для работы с Docker:

- **`docker-compose.yml`** - для локальной разработки
- **`docker-compose.prod.yml`** - для продакшн деплоя
- **`Dockerfile`** - для сборки backend контейнера

### Команды Docker:
```bash
# Локальная разработка
docker-compose up -d

# Продакшн деплой
docker-compose -f docker-compose.prod.yml up -d

# Пересборка
docker-compose build --no-cache

# Просмотр логов
docker-compose logs -f
```

### NPM скрипты для Docker:
```bash
npm run docker:dev      # Запуск разработки
npm run docker:stop     # Остановка
npm run docker:status   # Статус
npm run docker:logs     # Логи
npm run docker:restart  # Перезапуск
npm run docker:rebuild  # Пересборка
```

## Логи

Логи приложения сохраняются в папке `logs/`.
