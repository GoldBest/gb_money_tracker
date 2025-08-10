#!/bin/bash

echo "🤖 Настройка Telegram Bot для GB Money Tracker"
echo "=========================================="
echo ""

# Проверяем, есть ли уже .env файл
if [ -f "../.env" ]; then
    echo "✅ Файл .env уже существует"
    echo "📝 Текущие настройки:"
    cat ../.env
    echo ""
    read -p "Хотите обновить настройки? (y/n): " update_env
    if [ "$update_env" != "y" ]; then
        echo "Настройки не изменены"
        exit 0
    fi
fi

echo "📋 Для настройки бота вам нужно:"
echo "1. Создать бота через @BotFather в Telegram"
echo "2. Получить токен бота"
echo "3. Настроить Web App URL"
echo ""
echo "💡 Рекомендуемое имя бота: gb_money_tracker_bot"
echo "💡 Рекомендуемое имя: GB Money Tracker"
echo "💡 Рекомендуемое описание: Приложение для учета личных финансов"
echo ""

# Запрашиваем токен бота
read -p "Введите токен вашего бота: " bot_token

if [ -z "$bot_token" ]; then
    echo "❌ Токен бота не может быть пустым"
    exit 1
fi

# Запрашиваем URL Web App
echo ""
echo "🌐 Введите URL вашего Web App (для продакшн):"
echo "Для локальной разработки используйте localhost:5176"
echo ""

read -p "Введите URL вашего Web App: " webapp_url

if [ -z "$webapp_url" ]; then
    echo "❌ URL Web App не может быть пустым"
    exit 1
fi

# Создаем .env файл
echo "📝 Создаю файл .env..."
cat > ../.env << EOF
# Telegram Bot Configuration
BOT_TOKEN=$bot_token
WEBAPP_URL=$webapp_url
WEBHOOK_URL=$webapp_url/webhook

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_PATH=./money.db
EOF

echo "✅ Файл .env создан успешно!"
echo ""

# Показываем инструкции по запуску
echo "🚀 Теперь вы можете запустить бота:"
echo ""
echo "1. Запустить только бота:"
echo "   cd backend && npm run bot"
echo ""
echo "2. Запустить бота в режиме разработки:"
echo "   cd backend && npm run dev:bot"
echo ""
echo "3. Запустить весь проект:"
echo "   npm run dev"
echo ""

echo "📱 Для тестирования:"
echo "1. Найдите вашего бота в Telegram"
echo "2. Отправьте команду /start"
echo "3. Нажмите кнопку 'Открыть приложение'"
echo ""

echo "🔧 Полезные команды бота:"
echo "   /start - Запустить приложение"
echo "   /help - Показать справку"
echo "   /status - Статус приложения"
echo "   /balance - Показать баланс"
echo ""

echo "✨ Настройка завершена! Удачи в разработке!"
