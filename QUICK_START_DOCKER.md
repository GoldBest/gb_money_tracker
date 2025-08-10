# 🐳 Быстрый старт с Docker

## ⚡ Запуск за 2 минуты

### 1. **Установите Docker**
```bash
# macOS
brew install --cask docker

# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
```

### 2. **Запустите приложение**
```bash
# Автоматический запуск
npm run docker:dev

# Или вручную
./scripts/dev-docker.sh
```

### 3. **Откройте в браузере**
- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:3002

## 🔧 Основные команды

```bash
# Запуск
npm run docker:dev

# Остановка
npm run docker:stop

# Статус
npm run docker:status

# Логи
npm run docker:logs

# Перезапуск
npm run docker:restart

# Пересборка
npm run docker:rebuild
```

## 📁 Структура проекта

```
tg-money-miniapp/
├── docker-compose.yml          # Локальная разработка
├── docker-compose.prod.yml     # Продакшн
├── Dockerfile                  # Backend контейнер
├── scripts/
│   ├── dev-docker.sh          # Запуск разработки
│   ├── stop-docker.sh         # Остановка
│   └── clean-docker.sh        # Очистка
└── docs/
    └── DOCKER_DEVELOPMENT.md  # Подробная документация
```

## 🚀 Что запускается

- **PostgreSQL** - база данных (порт 5433)
- **Backend** - Node.js API (порт 3002)
- **Frontend** - React + Nginx (порт 8081)

## 📚 Документация

- **Локальная разработка**: [docs/DOCKER_DEVELOPMENT.md](docs/DOCKER_DEVELOPMENT.md)
- **Продакшн деплой**: [docs/DOCKER_DEVELOPMENT.md](docs/DOCKER_DEVELOPMENT.md)

## 🎯 Готово!

Ваше приложение работает локально с Docker! 🎉

**Следующие шаги:**
1. Настройте Telegram бота
2. Протестируйте функциональность
3. Подготовьтесь к продакшн деплою
