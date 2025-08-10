#!/bin/bash

echo "🚀 Запуск ngrok туннелей..."

# Проверяем, есть ли конфигурационный файл
if [ ! -f "ngrok.yml" ]; then
    echo "❌ Файл ngrok.yml не найден!"
    echo "Создайте файл ngrok.yml с вашим authtoken"
    exit 1
fi

# Проверяем, что authtoken не дефолтный
if grep -q "YOUR_NGROK_AUTHTOKEN_HERE" ngrok.yml; then
    echo "❌ Замените YOUR_NGROK_AUTHTOKEN_HERE в ngrok.yml на ваш реальный токен!"
    exit 1
fi

# Проверяем, запущены ли сервисы
if ! curl -s http://localhost:5176 > /dev/null; then
    echo "⚠️  Frontend сервер не запущен на порту 5176"
    echo "Запустите сначала: cd frontend && npm run dev"
    exit 1
fi

if ! curl -s http://localhost:3001 > /dev/null; then
    echo "⚠️  Backend сервер не запущен на порту 3001"
    echo "Запустите сначала: cd backend && node server.js"
    exit 1
fi

echo "✅ Сервисы запущены"
echo "🌐 Запуск ngrok с конфигурацией..."

# Запускаем ngrok с конфигурационным файлом
ngrok start --all --config ngrok.yml --log=stdout > ngrok.log 2>&1 &
NGROK_PID=$!

echo "✅ Ngrok запущен с PID: $NGROK_PID"
echo "⏳ Ожидание запуска туннелей..."

# Ждем запуска туннелей
sleep 10

echo ""
echo "🌐 Доступные туннели:"
echo "📱 Фронтенд:"
curl -s http://localhost:4040/api/tunnels | jq '.tunnels[] | select(.name=="frontend") | .public_url' 2>/dev/null || echo "Недоступен"
echo "🔧 Бэкенд:"
curl -s http://localhost:4040/api/tunnels | jq '.tunnels[] | select(.name=="backend") | .public_url' 2>/dev/null || echo "Недоступен"

echo ""
echo "📋 Логи: tail -f ngrok.log"
echo "🛑 Для остановки: pkill -f ngrok"
