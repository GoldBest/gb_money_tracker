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

## Быстрый старт

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

- [Быстрый старт](docs/QUICK_START.md)
- [Настройка бота](docs/BOT_SETUP_README.md)
- [Настройка окружения](docs/ENV_SETUP_README.md)
- [План развертывания](docs/PRODUCTION_DEPLOYMENT_PLAN.md)
- [Инструкции по тестированию](docs/TESTING_INSTRUCTIONS.md)

## Тестирование

Все тестовые файлы находятся в папке `tests/`:
- `comprehensive-test.js` - комплексное тестирование
- `test-*.js` - модульные тесты
- `test-*.html` - HTML тесты для фронтенда

## Развертывание

Скрипты и конфигурация для развертывания в папке `deploy/`:
- `setup-env.sh` - настройка окружения
- `setup-bot.sh` - настройка Telegram бота
- `start-ngrok.sh` - запуск ngrok для разработки
- `ngrok.yml` - конфигурация ngrok

## Логи

Логи приложения сохраняются в папке `logs/`:
- `ngrok.log` - логи ngrok
- `ngrok-backend.log` - логи ngrok для бэкенда
- `ngrok-frontend.log` - логи ngrok для фронтенда
