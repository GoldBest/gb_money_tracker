#!/bin/bash

echo "🚀 Начинаю деплой TG Money MiniApp на Render..."

# Проверяем, что мы в правильной папке
if [ ! -f "render.yaml" ]; then
    echo "❌ Ошибка: render.yaml не найден. Убедитесь, что вы в корневой папке проекта."
    exit 1
fi

# Проверяем, что все файлы готовы
echo "📋 Проверяю готовность к деплою..."

# Проверяем backend
if [ ! -f "backend/server.prod.js" ]; then
    echo "❌ Ошибка: backend/server.prod.js не найден"
    exit 1
fi

# Проверяем frontend build
if [ ! -d "frontend/dist" ]; then
    echo "📦 Создаю production build для frontend..."
    cd frontend
    npm run build
    cd ..
fi

# Проверяем package.json
if [ ! -f "backend/package.json" ] || ! grep -q "pg" backend/package.json; then
    echo "❌ Ошибка: PostgreSQL зависимости не установлены в backend"
    exit 1
fi

echo "✅ Все проверки пройдены успешно!"

# Создаем .env.example для production
echo "🔧 Создаю .env.example для production..."
cat > .env.production.example << EOF
# Production Environment Variables
NODE_ENV=production
BOT_TOKEN=your_bot_token_here
WEBAPP_URL=https://gb-money-tracker-frontend.onrender.com
DATABASE_URL=postgresql://username:password@host:port/database
EOF

echo "📝 Создан .env.production.example"

# Проверяем git статус
echo "📊 Проверяю git статус..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Внимание: есть несохраненные изменения в git"
    echo "Рекомендуется закоммитить изменения перед деплоем"
    echo ""
    git status --short
    echo ""
    read -p "Продолжить деплой? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Деплой отменен"
        exit 1
    fi
fi

# Проверяем, что render.yaml валиден
echo "🔍 Проверяю render.yaml..."
if ! command -v yamllint &> /dev/null; then
    echo "⚠️  yamllint не установлен. Установите его для валидации:"
    echo "   brew install yamllint (macOS)"
    echo "   или pip install yamllint"
else
    if yamllint render.yaml; then
        echo "✅ render.yaml валиден"
    else
        echo "❌ render.yaml содержит ошибки"
        exit 1
    fi
fi

echo ""
echo "🎯 Готово к деплою на Render!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Перейдите на https://render.com"
echo "2. Создайте аккаунт или войдите"
echo "3. Нажмите 'New +' и выберите 'Blueprint'"
echo "4. Подключите ваш GitHub репозиторий"
echo "5. Выберите репозиторий 'tg-money-miniapp'"
echo "6. Render автоматически обнаружит render.yaml"
echo "7. Нажмите 'Apply' для создания сервисов"
echo ""
echo "🔧 После создания сервисов добавьте переменные окружения:"
echo "   - BOT_TOKEN: ваш токен Telegram бота"
echo "   - DATABASE_URL: будет автоматически создан"
echo ""
echo "📚 Подробная инструкция: docs/RENDER_DEPLOYMENT_GUIDE.md"
echo ""
echo "�� Удачи с деплоем!"
