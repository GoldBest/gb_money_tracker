#!/bin/bash

echo "🐳 Запуск локальной разработки TG Money MiniApp с Docker..."

# Проверяем, что мы в правильной папке
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Ошибка: docker-compose.yml не найден. Убедитесь, что вы в корневой папке проекта."
    exit 1
fi

# Проверяем, что Docker запущен
if ! docker info > /dev/null 2>&1; then
    echo "❌ Ошибка: Docker не запущен. Запустите Docker Desktop или Docker daemon."
    exit 1
fi

# Проверяем, что Docker Compose установлен
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Ошибка: docker-compose не установлен."
    echo "Установите Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker готов к работе!"

# Проверяем, есть ли .env файл
if [ ! -f ".env" ]; then
    echo "⚠️  .env файл не найден. Создаю из примера..."
    if [ -f "config/env.example" ]; then
        cp config/env.example .env
        echo "✅ Создан .env файл из config/env.example"
        echo "📝 Отредактируйте .env файл, если необходимо"
    else
        echo "⚠️  config/env.example не найден. Создаю базовый .env..."
        cat > .env << EOF
# Local Development Environment
NODE_ENV=development
BOT_TOKEN=your_bot_token_here
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/gbmoneytracker
EOF
        echo "✅ Создан базовый .env файл"
    fi
fi

# Проверяем, есть ли frontend build
if [ ! -d "frontend/dist" ]; then
    echo "📦 Frontend build не найден. Создаю..."
    cd frontend
    npm install
    npm run build
    cd ..
    echo "✅ Frontend build создан"
fi

echo ""
echo "🚀 Запускаю приложение..."

# Останавливаем существующие контейнеры
echo "🛑 Останавливаю существующие контейнеры..."
docker-compose down

# Запускаем приложение
echo "▶️  Запускаю контейнеры..."
docker-compose up -d

# Ждем немного для запуска
echo "⏳ Ждем запуска сервисов..."
sleep 5

# Проверяем статус
echo "📊 Проверяю статус сервисов..."
docker-compose ps

echo ""
echo "🎉 Приложение запущено!"
echo ""
echo "🌐 Доступ к приложению:"
echo "   Frontend: http://localhost:8081"
echo "   Backend API: http://localhost:3002"
echo "   PostgreSQL: localhost:5433"
echo ""
echo "🔧 Полезные команды:"
echo "   docker-compose ps                    # Статус сервисов"
echo "   docker-compose logs -f               # Просмотр логов"
echo "   docker-compose logs -f backend       # Логи backend"
echo "   docker-compose logs -f frontend      # Логи frontend"
echo "   docker-compose logs -f postgres      # Логи базы данных"
echo "   docker-compose restart backend       # Перезапуск backend"
echo "   docker-compose restart frontend      # Перезапуск frontend"
echo "   docker-compose down                  # Остановка приложения"
echo ""
echo "📚 Документация: docs/DOCKER_DEVELOPMENT.md"
echo ""
echo "💡 Для остановки приложения выполните: docker-compose down"
