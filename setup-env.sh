#!/bin/bash

# Скрипт для настройки переменных окружения
echo "🔧 Настройка переменных окружения для проекта..."

# Проверяем, существует ли уже .env файл
if [ -f ".env" ]; then
    echo "⚠️  Файл .env уже существует. Создаю резервную копию..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Копируем пример в .env
if [ -f "env.example" ]; then
    cp env.example .env
    echo "✅ Файл .env создан из env.example"
else
    echo "❌ Файл env.example не найден!"
    exit 1
fi

# Запрашиваем у пользователя основные переменные
echo ""
echo "📝 Введите основные переменные окружения:"
echo ""

# BOT_TOKEN
read -p "🤖 Введите токен Telegram бота (или нажмите Enter для пропуска): " bot_token
if [ ! -z "$bot_token" ]; then
    sed -i '' "s/BOT_TOKEN=YOUR_BOT_TOKEN_HERE/BOT_TOKEN=$bot_token/" .env
    echo "✅ BOT_TOKEN обновлен"
fi

# NGROK_AUTHTOKEN
read -p "🌐 Введите ngrok auth token (или нажмите Enter для пропуска): " ngrok_token
if [ ! -z "$ngrok_token" ]; then
    sed -i '' "s/NGROK_AUTHTOKEN=314LYEGUIzQbhy1afASkUxaL7vg_3hYAJpqD7WK12biYZ8rzq/NGROK_AUTHTOKEN=$ngrok_token/" .env
    echo "✅ NGROK_AUTHTOKEN обновлен"
fi

# PORT
read -p "🔌 Введите порт для backend (по умолчанию 3001): " port
if [ ! -z "$port" ]; then
    sed -i '' "s/PORT=3001/PORT=$port/" .env
    sed -i '' "s/BACKEND_API_URL=http:\/\/localhost:3001/BACKEND_API_URL=http:\/\/localhost:$port/" .env
    echo "✅ PORT обновлен на $port"
fi

# FRONTEND_PORT
read -p "🎨 Введите порт для frontend (по умолчанию 5176): " frontend_port
if [ ! -z "$frontend_port" ]; then
    sed -i '' "s/FRONTEND_PORT=5176/FRONTEND_PORT=$frontend_port/" .env
    sed -i '' "s/FRONTEND_URL=http:\/\/localhost:5176/FRONTEND_URL=http:\/\/localhost:$frontend_port/" .env
    echo "✅ FRONTEND_PORT обновлен на $frontend_port"
fi

# NODE_ENV
read -p "🌍 Введите режим работы (development/production, по умолчанию development): " node_env
if [ ! -z "$node_env" ]; then
    sed -i '' "s/NODE_ENV=development/NODE_ENV=$node_env/" .env
    echo "✅ NODE_ENV обновлен на $node_env"
fi

echo ""
echo "🎉 Настройка переменных окружения завершена!"
echo "📁 Файл .env создан в корне проекта"
echo ""
echo "💡 Для изменения переменных в будущем отредактируйте файл .env"
echo "💡 Или запустите этот скрипт снова: ./setup-env.sh"
echo ""
echo "🔒 Не забудьте добавить .env в .gitignore для безопасности!"
