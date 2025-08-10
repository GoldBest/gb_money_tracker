#!/bin/bash

echo "🚂 Начинаем деплой на Railway..."

# Проверяем, установлен ли Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен. Устанавливаем..."
    npm install -g @railway/cli
fi

# Переходим в папку backend
cd backend

echo "📁 Переходим в папку backend..."

# Проверяем, авторизован ли пользователь
if ! railway whoami &> /dev/null; then
    echo "🔐 Авторизуемся в Railway..."
    railway login
fi

# Проверяем, есть ли проект
if [ ! -f "railway.json" ]; then
    echo "❌ Файл railway.json не найден!"
    exit 1
fi

# Инициализируем проект, если нужно
if [ ! -d ".railway" ]; then
    echo "🔧 Инициализируем проект Railway..."
    railway init
fi

# Деплоим
echo "🚂 Деплоим на Railway..."
railway up

echo "✅ Деплой на Railway завершен!"
echo "🌐 Ваш API доступен по адресу выше"
echo "📝 Не забудьте обновить переменные окружения в настройках Railway"
echo "🗄️ Создайте базу данных PostgreSQL в Railway Dashboard"
