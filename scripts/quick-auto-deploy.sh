#!/bin/bash

echo "🚀 БЫСТРАЯ НАСТРОЙКА АВТОДЕПЛОЯ"
echo "================================"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo "Этот скрипт настроит автоматический деплой при push в main/master ветку."
echo ""

# Проверяем git статус
if [ ! -d ".git" ]; then
    error "Это не git репозиторий!"
    exit 1
fi

# Проверяем наличие GitHub Actions
if [ ! -d ".github/workflows" ]; then
    warning "Папка .github/workflows не найдена. Создаем..."
    mkdir -p .github/workflows
fi

# Проверяем наличие deploy.yml
if [ ! -f ".github/workflows/deploy.yml" ]; then
    error "Файл .github/workflows/deploy.yml не найден!"
    echo "Сначала создайте GitHub Actions workflow."
    exit 1
fi

success "GitHub Actions workflow найден"

# Проверяем текущую ветку
CURRENT_BRANCH=$(git branch --show-current)
log "Текущая ветка: $CURRENT_BRANCH"

# Проверяем, есть ли удаленная ветка
REMOTE_BRANCH=$(git ls-remote --heads origin main 2>/dev/null | head -n1 | cut -f2 | sed 's/refs\/heads\///')
if [ -z "$REMOTE_BRANCH" ]; then
    REMOTE_BRANCH=$(git ls-remote --heads origin master 2>/dev/null | head -n1 | cut -f2 | sed 's/refs\/heads\///')
fi

if [ -z "$REMOTE_BRANCH" ]; then
    warning "Удаленная ветка main/master не найдена"
    echo "Создайте ветку main или master на GitHub"
    exit 1
fi

log "Удаленная ветка: $REMOTE_BRANCH"

# Проверяем, есть ли изменения для коммита
if [ -n "$(git status --porcelain)" ]; then
    warning "Есть несохраненные изменения"
    echo "Текущие изменения:"
    git status --short
    
    read -p "Хотите закоммитить изменения? (y/n): " COMMIT_CHANGES
    
    if [ "$COMMIT_CHANGES" = "y" ] || [ "$COMMIT_CHANGES" = "Y" ]; then
        git add .
        read -p "Введите сообщение коммита: " COMMIT_MESSAGE
        if [ -z "$COMMIT_MESSAGE" ]; then
            COMMIT_MESSAGE="feat: setup auto-deploy"
        fi
        git commit -m "$COMMIT_MESSAGE"
        success "Изменения закоммичены"
    else
        error "Сначала сохраните изменения!"
        exit 1
    fi
fi

# Проверяем, есть ли push
if [ "$CURRENT_BRANCH" != "$REMOTE_BRANCH" ]; then
    warning "Текущая ветка ($CURRENT_BRANCH) отличается от удаленной ($REMOTE_BRANCH)"
    read -p "Хотите переключиться на $REMOTE_BRANCH? (y/n): " SWITCH_BRANCH
    
    if [ "$SWITCH_BRANCH" = "y" ] || [ "$SWITCH_BRANCH" = "Y" ]; then
        git checkout $REMOTE_BRANCH
        success "Переключились на ветку $REMOTE_BRANCH"
    else
        error "Сначала переключитесь на ветку $REMOTE_BRANCH!"
        exit 1
    fi
fi

# Проверяем, есть ли изменения для push
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/$REMOTE_BRANCH)

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    success "Локальная и удаленная ветки синхронизированы"
else
    warning "Есть изменения для push"
    git log --oneline origin/$REMOTE_BRANCH..HEAD
    
    read -p "Хотите сделать push? (y/n): " PUSH_CHANGES
    
    if [ "$PUSH_CHANGES" = "y" ] || [ "$PUSH_CHANGES" = "Y" ]; then
        git push origin $REMOTE_BRANCH
        success "Изменения отправлены на GitHub"
    else
        error "Сначала сделайте push!"
        exit 1
    fi
fi

echo ""
success "🎉 АВТОДЕПЛОЙ НАСТРОЕН!"
echo ""
echo "📝 Что произойдет дальше:"
echo "  1. GitHub Actions автоматически запустится"
echo "  2. Проверьте статус в: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1\/\2/')/actions"
echo ""
echo "🔧 Для настройки секретов выполните:"
echo "  ./scripts/setup-github-secrets.sh"
echo ""
echo "🚀 Или настройте секреты вручную в GitHub:"
echo "  Settings → Secrets and variables → Actions"
echo ""
echo "📋 Необходимые секреты:"
echo "  - VERCEL_TOKEN"
echo "  - VERCEL_PROJECT_ID" 
echo "  - VERCEL_ORG_ID"
echo "  - RAILWAY_TOKEN"
echo "  - RAILWAY_SERVICE_NAME"
echo ""
echo "✅ Готово! Теперь при каждом push будет автоматический деплой."
