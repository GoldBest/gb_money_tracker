# 💰 TG Money MiniApp

Приложение для управления личными финансами, интегрированное с Telegram Web App API.

## 🚀 Возможности

- **Управление транзакциями**: Добавление доходов и расходов с категоризацией
- **Статистика**: Детальная аналитика по периодам (неделя/месяц/год)
- **Категории**: Настраиваемые категории с цветовой кодировкой
- **Базовые категории**: Автоматическое создание предустановленных категорий для новых пользователей
- **Telegram интеграция**: Полная интеграция с Telegram Web App
- **Современный UI**: Адаптивный дизайн с красивыми анимациями
- **Pull-to-Refresh**: Обновление данных потягиванием вниз
- **Поиск и фильтрация**: Быстрый поиск и фильтрация транзакций
- **Экспорт данных**: Экспорт транзакций в CSV формат

## 🛠 Технологии

### Backend
- **Node.js** + **Express.js** - серверная часть
- **PostgreSQL** - база данных (Docker)
- **CORS** - для работы с фронтендом

### Frontend
- **React 19** - пользовательский интерфейс
- **Vite** - сборщик и dev-сервер
- **Axios** - HTTP клиент
- **Lucide React** - иконки
- **date-fns** - работа с датами

### Инфраструктура
- **Docker** - контейнеризация
- **Docker Compose** - оркестрация сервисов
- **Nginx** - веб-сервер для фронтенда

## 🐳 Быстрый старт с Docker

### 1. **Запуск локальной разработки:**
```bash
# Автоматический запуск
npm run docker:dev

# Или вручную
./scripts/dev-docker.sh
```

### 2. **Доступ к приложению:**
- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:3002
- **PostgreSQL**: localhost:5433

### 3. **Остановка:**
```bash
npm run docker:stop
# Или
./scripts/stop-docker.sh
```

## 🔧 Ручная установка

1. **Установка зависимостей:**
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

2. **Настройка переменных окружения:**
```bash
cp config/env.example .env
# Отредактируйте .env файл
```

3. **Запуск:**
```bash
# Backend
npm run dev:backend

# Frontend
npm run dev:frontend
```

## 🚀 Развертывание

### 🚀 Облачные платформы
- **Vercel (Frontend)**: `npm run deploy:vercel`
- **Railway (Backend)**: `npm run deploy:railway`
- **Полный деплой**: `npm run deploy`

### 🐳 Docker развертывание
- **Локальная разработка**: [QUICK_START_DOCKER.md](QUICK_START_DOCKER.md)
- **Docker развертывание**: [docs/DOCKER_DEVELOPMENT.md](docs/DOCKER_DEVELOPMENT.md)

### 🔧 Локальная разработка
Скрипты и конфигурация для развертывания в папке `deploy/`:
- `setup-env.sh` - настройка окружения
- `setup-bot.sh` - настройка Telegram бота

### 🌍 Переменные окружения
После деплоя настройте переменные окружения:

**Vercel (Frontend):**
- `REACT_APP_API_URL` - URL вашего backend API

**Railway (Backend):**
- `DATABASE_URL` - строка подключения к PostgreSQL
- `BOT_TOKEN` - токен Telegram бота
- `WEBHOOK_URL` - URL для webhook'ов бота

## 🐳 Docker

Проект полностью настроен для работы с Docker:

- **`docker-compose.yml`** - для локальной разработки
- **`docker-compose.prod.yml`** - для продакшн деплоя
- **`Dockerfile`** - для сборки backend контейнера

### Команды Docker:
```bash
# Локальная разработка
npm run docker:dev

# Продакшн деплой
docker-compose -f docker-compose.prod.yml up -d

# Пересборка
npm run docker:rebuild

# Просмотр логов
npm run docker:logs
```

### NPM скрипты для Docker:
```bash
npm run docker:dev      # Запуск разработки
npm run docker:stop     # Остановка
npm run docker:status   # Статус
npm run docker:logs     # Логи
npm run docker:restart  # Перезапуск
npm run docker:rebuild  # Пересборка
npm run docker:clean    # Очистка
```

## 📚 Документация

- [Быстрый старт с Docker](QUICK_START_DOCKER.md)
- [Локальная разработка с Docker](docs/DOCKER_DEVELOPMENT.md)
- [Настройка бота](docs/BOT_SETUP_README.md)
- [Настройка окружения](docs/ENV_SETUP_README.md)
- [Тестирование](docs/TESTING_INSTRUCTIONS.md)
- [Устранение неполадок](docs/TROUBLESHOOTING.md)

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Тестирование с Docker
npm run docker:dev
# Откройте http://localhost:8081 в браузере
```

## 📁 Структура проекта

```
tg-money-miniapp/
├── backend/                 # Backend API (Node.js + Express)
├── frontend/                # Frontend (React + Vite)
├── docs/                    # Документация
├── deploy/                  # Скрипты деплоя
├── scripts/                 # Docker скрипты
├── docker-compose.yml       # Docker Compose (разработка)
├── docker-compose.prod.yml  # Docker Compose (продакшн)
├── Dockerfile               # Backend контейнер
└── nginx.conf               # Конфигурация Nginx
```

## 🎯 Следующие шаги

1. **Запустите Docker**: `npm run docker:dev`
2. **Настройте Telegram бота**: [docs/BOT_SETUP_README.md](docs/BOT_SETUP_README.md)
3. **Протестируйте приложение**: [docs/TESTING_INSTRUCTIONS.md](docs/TESTING_INSTRUCTIONS.md)
4. **Подготовьтесь к деплою**: [docs/DOCKER_DEVELOPMENT.md](docs/DOCKER_DEVELOPMENT.md)

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License

---

**Удачи с разработкой! 🚀**
