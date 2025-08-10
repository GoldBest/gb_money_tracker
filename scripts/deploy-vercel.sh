#!/bin/bash

echo "🚀 Начинаем деплой на Vercel..."

# Проверяем, установлен ли Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен. Устанавливаем..."
    npm install -g vercel
fi

# Переходим в папку frontend
cd frontend

echo "📁 Переходим в папку frontend..."

# Проверяем, есть ли .vercel папка
if [ ! -d ".vercel" ]; then
    echo "🔧 Инициализируем проект Vercel..."
    vercel --yes
else
    echo "✅ Проект Vercel уже инициализирован"
fi

# Деплоим на продакшн
echo "🚀 Деплоим на продакшн..."
vercel --prod --yes

echo "✅ Деплой на Vercel завершен!"
echo "🌐 Ваше приложение доступно по адресу выше"
echo "📝 Не забудьте обновить переменные окружения в настройках Vercel"
