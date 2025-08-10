#!/bin/bash

echo "🔐 НАСТРОЙКА GITHUB SECRETS ДЛЯ АВТОДЕПЛОЯ"
echo "=========================================="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для логирования
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

echo "Этот скрипт поможет настроить GitHub Secrets для автоматического деплоя."
echo ""

# Проверяем наличие gh CLI
if ! command -v gh &> /dev/null; then
    error "GitHub CLI (gh) не установлен!"
    echo ""
    echo "Установите GitHub CLI:"
    echo "  macOS: brew install gh"
    echo "  Ubuntu: sudo apt install gh"
    echo "  Windows: winget install GitHub.cli"
    echo ""
    echo "После установки выполните: gh auth login"
    exit 1
fi

# Проверяем авторизацию в GitHub
if ! gh auth status &> /dev/null; then
    error "Вы не авторизованы в GitHub CLI!"
    echo "Выполните: gh auth login"
    exit 1
fi

success "GitHub CLI найден и авторизован"

# Получаем информацию о репозитории
REPO_INFO=$(gh repo view --json name,owner,defaultBranchRef)
REPO_NAME=$(echo $REPO_INFO | jq -r '.name')
REPO_OWNER=$(echo $REPO_INFO | jq -r '.owner.login')
DEFAULT_BRANCH=$(echo $REPO_INFO | jq -r '.defaultBranchRef.name')

echo ""
log "Репозиторий: $REPO_OWNER/$REPO_NAME"
log "Ветка по умолчанию: $DEFAULT_BRANCH"
echo ""

# Настройка Vercel
echo "🚀 НАСТРОЙКА VERCEL"
echo "-------------------"

echo "1. Перейдите на https://vercel.com/account/tokens"
echo "2. Создайте новый токен"
echo "3. Скопируйте токен"

read -p "Введите VERCEL_TOKEN: " VERCEL_TOKEN

if [ -z "$VERCEL_TOKEN" ]; then
    error "VERCEL_TOKEN не может быть пустым!"
    exit 1
fi

# Получаем Vercel Project ID
echo ""
echo "Получаем информацию о проекте Vercel..."
cd frontend

if [ ! -d ".vercel" ]; then
    warning "Проект Vercel не инициализирован. Инициализируем..."
    echo "n" | vercel --yes
fi

if [ -f ".vercel/project.json" ]; then
    VERCEL_PROJECT_ID=$(cat .vercel/project.json | jq -r '.projectId')
    VERCEL_ORG_ID=$(cat .vercel/project.json | jq -r '.orgId')
    
    log "Vercel Project ID: $VERCEL_PROJECT_ID"
    log "Vercel Org ID: $VERCEL_ORG_ID"
else
    warning "Не удалось получить Project ID автоматически"
    read -p "Введите VERCEL_PROJECT_ID: " VERCEL_PROJECT_ID
    read -p "Введите VERCEL_ORG_ID: " VERCEL_ORG_ID
fi

cd ..

# Настройка Railway
echo ""
echo "🚂 НАСТРОЙКА RAILWAY"
echo "-------------------"

echo "1. Перейдите на https://railway.app/account/tokens"
echo "2. Создайте новый токен"
echo "3. Скопируйте токен"

read -p "Введите RAILWAY_TOKEN: " RAILWAY_TOKEN

if [ -z "$RAILWAY_TOKEN" ]; then
    error "RAILWAY_TOKEN не может быть пустым!"
    exit 1
fi

echo ""
echo "Получаем список сервисов Railway..."
RAILWAY_SERVICES=$(railway service list --json 2>/dev/null || echo "[]")

if [ "$RAILWAY_SERVICES" != "[]" ]; then
    echo "Доступные сервисы:"
    echo "$RAILWAY_SERVICES" | jq -r '.[] | "  - \(.name) (\(.id))"'
    echo ""
    read -p "Введите название сервиса для backend: " RAILWAY_SERVICE_NAME
else
    warning "Не удалось получить список сервисов Railway"
    read -p "Введите название сервиса для backend: " RAILWAY_SERVICE_NAME
fi

# Устанавливаем секреты в GitHub
echo ""
log "Устанавливаем секреты в GitHub..."

# Vercel секреты
gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"
gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"

# Railway секреты
gh secret set RAILWAY_TOKEN --body "$RAILWAY_TOKEN"
gh secret set RAILWAY_SERVICE_NAME --body "$RAILWAY_SERVICE_NAME"

success "Все секреты установлены в GitHub!"

echo ""
echo "✅ НАСТРОЙКА ЗАВЕРШЕНА!"
echo ""
echo "Теперь при каждом push в ветку $DEFAULT_BRANCH будет происходить:"
echo "  1. 🚀 Автоматический деплой frontend на Vercel"
echo "  2. 🚂 Автоматический деплой backend на Railway"
echo "  3. 🧪 Запуск тестов"
echo ""
echo "📝 Для проверки статуса деплоя перейдите в:"
echo "  https://github.com/$REPO_OWNER/$REPO_NAME/actions"
echo ""
echo "🔧 Если нужно изменить секреты, используйте:"
echo "  gh secret set SECRET_NAME --body 'new_value'"
echo ""
echo "🚀 Готово к автодеплою!"
