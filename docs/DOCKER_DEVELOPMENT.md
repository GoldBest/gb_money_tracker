# 🐳 Локальная разработка с Docker

## 📋 Обзор

Это руководство поможет вам настроить локальную среду разработки для TG Money MiniApp с использованием Docker.

## ⚙️ Предварительные требования

### 1. Установка Docker

```bash
# macOS
brew install --cask docker

# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Windows
# Скачайте Docker Desktop с https://www.docker.com/products/docker-desktop
```

### 2. Установка Docker Compose

```bash
# Docker Compose обычно устанавливается вместе с Docker Desktop
# Для Linux может потребоваться отдельная установка:
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-username/tg-money-miniapp.git
cd tg-money-miniapp
```

### 2. Настройка переменных окружения

```bash
# Копируем пример конфигурации
cp config/env.example .env

# Редактируем .env файл
nano .env
```

### 3. Запуск приложения

```bash
# Запуск всех сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps
```

### 4. Доступ к приложению

- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:3002
- **PostgreSQL**: localhost:5433

## 🏗️ Архитектура Docker

### Сервисы

1. **PostgreSQL** (`postgres`)
   - Порт: 5433 (внешний) → 5432 (внутренний)
   - База данных: `gbmoneytracker`
   - Пользователь: `postgres`
   - Пароль: `postgres`

2. **Backend API** (`backend`)
   - Порт: 3002 (внешний) → 3001 (внутренний)
   - Зависит от PostgreSQL
   - Автоматический перезапуск

3. **Frontend** (`frontend`)
   - Порт: 8081 (внешний) → 80 (внутренний)
   - Nginx сервер
   - Зависит от Backend

### Volumes

- `postgres_data` - постоянное хранение данных PostgreSQL

## 🔧 Команды Docker

### Основные команды

```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Просмотр логов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Управление контейнерами

```bash
# Статус сервисов
docker-compose ps

# Пересборка и запуск
docker-compose up -d --build

# Остановка и удаление контейнеров
docker-compose down

# Остановка и удаление контейнеров + volumes
docker-compose down -v
```

### Отладка

```bash
# Подключение к контейнеру
docker-compose exec backend bash
docker-compose exec postgres psql -U postgres -d gbmoneytracker

# Просмотр ресурсов
docker stats

# Очистка Docker
docker system prune -a
```

## 📝 Разработка

### Backend разработка

```bash
# Подключение к контейнеру backend
docker-compose exec backend bash

# Установка новых зависимостей
docker-compose exec backend npm install <package-name>

# Перезапуск backend после изменений
docker-compose restart backend
```

### Frontend разработка

```bash
# Сборка frontend
cd frontend
npm run build
cd ..

# Перезапуск frontend
docker-compose restart frontend
```

### База данных

```bash
# Подключение к PostgreSQL
docker-compose exec postgres psql -U postgres -d gbmoneytracker

# Основные команды PostgreSQL
\dt          # список таблиц
\d <table>   # структура таблицы
\q           # выход
```

## 🔄 Обновление кода

### Автоматическое обновление

```bash
# Pull последних изменений
git pull origin main

# Пересборка и перезапуск
docker-compose down
docker-compose up -d --build
```

### Частичное обновление

```bash
# Только backend
docker-compose restart backend

# Только frontend
cd frontend && npm run build && cd ..
docker-compose restart frontend

# Только база данных (осторожно!)
docker-compose restart postgres
```

## 🐛 Устранение неполадок

### Проблемы с портами

```bash
# Проверка занятых портов
lsof -i :3002
lsof -i :8081
lsof -i :5433

# Остановка процессов на портах
sudo kill -9 <PID>
```

### Проблемы с Docker

```bash
# Перезапуск Docker
sudo systemctl restart docker

# Очистка Docker
docker system prune -a
docker volume prune
```

### Проблемы с базой данных

```bash
# Сброс базы данных
docker-compose down -v
docker-compose up -d

# Проверка подключения
docker-compose exec backend node -e "
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);
client.connect()
  .then(() => console.log('DB connected'))
  .catch(err => console.error('DB error:', err))
  .finally(() => client.end());
"
```

## 📊 Мониторинг

### Логи

```bash
# Все логи
docker-compose logs -f

# Логи по сервисам
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Ресурсы

```bash
# Использование ресурсов
docker stats

# Дисковое пространство
docker system df
```

## 🚀 Продакшн деплой

Для продакшн деплоя используйте:

```bash
# Продакшн конфигурация
docker-compose -f docker-compose.prod.yml up -d

# С переменными окружения
DATABASE_URL=your_prod_db_url BOT_TOKEN=your_bot_token docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Полезные ссылки

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Nginx Docker](https://hub.docker.com/_/nginx)

## 🎯 Следующие шаги

После настройки локальной среды:
1. **Настройте Telegram бота** - [BOT_SETUP_README.md](BOT_SETUP_README.md)
2. **Протестируйте приложение** - [TESTING_INSTRUCTIONS.md](TESTING_INSTRUCTIONS.md)
3. **Подготовьтесь к деплою** - [YANDEX_DEPLOYMENT_GUIDE.md](YANDEX_DEPLOYMENT_GUIDE.md)

**Удачи с разработкой! 🚀**
