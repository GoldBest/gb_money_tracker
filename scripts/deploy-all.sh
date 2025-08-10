#!/bin/bash

echo "🚀 🚂 ПОЛНЫЙ ДЕПЛОЙ НА VERCEL + RAILWAY"
echo "=========================================="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверяем, что мы в корневой папке проекта
if [ ! -f "package.json" ]; then
    error "Скрипт должен запускаться из корневой папки проекта!"
    exit 1
fi

log "Проверяем зависимости..."

# Проверяем Node.js
if ! command -v node &> /dev/null; then
    error "Node.js не установлен!"
    exit 1
fi

# Проверяем npm
if ! command -v npm &> /dev/null; then
    error "npm не установлен!"
    exit 1
fi

success "Node.js и npm найдены"

# Настраиваем PATH для глобальных npm пакетов
log "Настраиваем PATH для глобальных npm пакетов..."
export PATH="$PATH:$(npm config get prefix)/bin"
export PATH="$PATH:$HOME/.npm-global/bin"
success "PATH настроен"

# Устанавливаем зависимости для frontend
log "Устанавливаем зависимости для frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    error "Ошибка установки зависимостей frontend!"
    exit 1
fi
success "Зависимости frontend установлены"
cd ..

# Устанавливаем зависимости для backend
log "Устанавливаем зависимости для backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    error "Ошибка установки зависимостей backend!"
    exit 1
fi
success "Зависимости backend установлены"
cd ..

echo ""
log "Начинаем деплой..."

# Деплой на Vercel
echo ""
log "🚀 ДЕПЛОЙ FRONTEND НА VERCEL"
echo "----------------------------"

# Добавляем путь к глобальным npm пакетам в PATH
export PATH="$PATH:$(npm config get prefix)/bin"
export PATH="$PATH:$HOME/.npm-global/bin"

if ! command -v vercel &> /dev/null; then
    log "Устанавливаем Vercel CLI..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        error "Ошибка установки Vercel CLI!"
        exit 1
    fi
    # Обновляем PATH после установки
    export PATH="$PATH:$(npm config get prefix)/bin"
    export PATH="$PATH:$HOME/.npm-global/bin"
fi

cd frontend

# Проверяем авторизацию в Vercel
log "Проверяем авторизацию в Vercel..."
if ! vercel whoami &> /dev/null; then
    log "Требуется авторизация в Vercel..."
    vercel login
    if [ $? -ne 0 ]; then
        error "Ошибка авторизации в Vercel!"
        exit 1
    fi
fi

log "Деплоим на Vercel..."
vercel --prod --yes
if [ $? -ne 0 ]; then
    error "Ошибка деплоя на Vercel!"
    exit 1
fi
success "Frontend успешно развернут на Vercel!"
cd ..

# Деплой на Railway
echo ""
log "🚂 ДЕПЛОЙ BACKEND НА RAILWAY"
echo "----------------------------"

if ! command -v railway &> /dev/null; then
    log "Устанавливаем Railway CLI..."
    npm install -g @railway/cli
    if [ $? -ne 0 ]; then
        error "Ошибка установки Railway CLI!"
        exit 1
    fi
    # Обновляем PATH после установки
    export PATH="$PATH:$(npm config get prefix)/bin"
    export PATH="$PATH:$HOME/.npm-global/bin"
fi

cd backend

# Проверяем авторизацию в Railway
log "Проверяем авторизацию в Railway..."
if ! railway whoami &> /dev/null; then
    log "Требуется авторизация в Railway..."
    railway login
    if [ $? -ne 0 ]; then
        error "Ошибка авторизации в Railway!"
        exit 1
    fi
fi

log "Инициализируем проект Railway..."
railway init
if [ $? -ne 0 ]; then
    error "Ошибка инициализации Railway проекта!"
    exit 1
fi

log "Деплоим на Railway..."
railway up
if [ $? -ne 0 ]; then
    error "Ошибка деплоя на Railway!"
    exit 1
fi
success "Backend успешно развернут на Railway!"
cd ..

echo ""
success "🎉 ПОЛНЫЙ ДЕПЛОЙ ЗАВЕРШЕН УСПЕШНО!"
echo "=========================================="
echo ""
echo "📋 СЛЕДУЮЩИЕ ШАГИ:"
echo "1. 🔧 Настройте переменные окружения в Vercel Dashboard"
echo "2. 🗄️ Создайте PostgreSQL базу данных в Railway Dashboard"
echo "3. ⚙️ Настройте переменные окружения в Railway Dashboard"
echo "4. 🧪 Протестируйте приложение"
echo "5. 🤖 Обновите Web App URL в Telegram Bot"
echo ""
echo "📚 Подробные инструкции: docs/VERCEL_RAILWAY_DEPLOY.md"
echo ""
echo "🚀 Frontend: https://your-app.vercel.app"
echo "🚂 Backend: https://your-app.railway.app"
echo ""
echo "💡 Для настройки базы данных выполните:"
echo "   cd backend && npm run setup-db"
