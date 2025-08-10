#!/bin/bash

echo "🚀 Начинаю деплой TG Money MiniApp на Yandex Cloud..."

# Проверяем, что мы в правильной папке
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Ошибка: docker-compose.yml не найден. Убедитесь, что вы в корневой папке проекта."
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

# Проверяем Dockerfile
if [ ! -f "Dockerfile" ]; then
    echo "❌ Ошибка: Dockerfile не найден"
    exit 1
fi

# Проверяем nginx.conf
if [ ! -f "nginx.conf" ]; then
    echo "❌ Ошибка: nginx.conf не найден"
    exit 1
fi

echo "✅ Все проверки пройдены успешно!"

# Создаем .env.example для production
echo "🔧 Создаю .env.example для production..."
cat > .env.production.example << EOF
# Production Environment Variables
NODE_ENV=production
BOT_TOKEN=your_bot_token_here
DATABASE_URL=postgresql://username:password@host:port/database

# Yandex Cloud Variables
YC_FOLDER_ID=your_folder_id
YC_SA_ID=your_service_account_id
YC_SA_KEY_FILE=path/to/key.json
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

echo ""
echo "🎯 Готово к деплою на Yandex Cloud!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Установите Yandex Cloud CLI:"
echo "   curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash"
echo ""
echo "2. Настройте аутентификацию:"
echo "   yc init"
echo ""
echo "3. Создайте сервисный аккаунт и получите ключ:"
echo "   yc iam service-account create --name gb-money-tracker"
echo "   yc iam service-account key create --id <sa-id> --output key.json"
echo ""
echo "4. Создайте Managed PostgreSQL:"
echo "   yc managed-postgresql cluster create --name gb-money-tracker-db"
echo ""
echo "5. Создайте Compute Instance:"
echo "   yc compute instance create --name gb-money-tracker"
echo ""
echo "6. Запустите приложение:"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "📚 Подробная инструкция: docs/YANDEX_DEPLOYMENT_GUIDE.md"
echo ""
echo "💡 После деплоя не забудьте добавить BOT_TOKEN в переменные окружения!"
