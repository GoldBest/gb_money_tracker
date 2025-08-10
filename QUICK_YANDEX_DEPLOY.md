# ⚡ Быстрый деплой на Yandex Cloud за 10 минут

## 🚀 Экспресс-деплой

### 1. Установка Yandex Cloud CLI (2 мин)
```bash
curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
source ~/.bashrc
yc init
```

### 2. Создание инфраструктуры (5 мин)
```bash
# Сервисный аккаунт
yc iam service-account create --name gb-money-tracker
yc iam service-account key create --id <sa-id> --output key.json

# PostgreSQL
yc managed-postgresql cluster create \
  --name gb-money-tracker-db \
  --environment production \
  --resource-preset s2.micro \
  --disk-size 10

# Compute Instance
yc compute instance create \
  --name gb-money-tracker \
  --platform standard-v3 \
  --cores 2 \
  --memory 4GB \
  --network-interface subnet-name=default-ru-central1-a,nat-ip-version=ipv4
```

### 3. Деплой приложения (3 мин)
```bash
# Подключение к серверу
ssh ubuntu@<external-ip>

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh

# Клонирование и запуск
git clone https://github.com/your-username/tg-money-miniapp.git
cd tg-money-miniapp
docker-compose -f docker-compose.prod.yml up -d
```

## 🎯 Готово! Ваше приложение работает на Yandex Cloud!

## 📋 Что создано:
- ✅ **Compute Instance** с 2 vCPU, 4GB RAM
- ✅ **Managed PostgreSQL** база данных
- ✅ **Docker контейнеры** для backend и frontend
- ✅ **Nginx** веб-сервер с проксированием API

## 🔧 Переменные окружения:
```bash
NODE_ENV=production
BOT_TOKEN=your_bot_token_here
DATABASE_URL=postgresql://user:pass@host:port/db
```

## 🐳 Docker для продакшн

Проект использует Docker для контейнеризации:

- **`docker-compose.prod.yml`** - продакшн конфигурация
- **`Dockerfile`** - сборка backend контейнера
- **Nginx** - веб-сервер для frontend

### Команды Docker на сервере:
```bash
# Запуск приложения
docker-compose -f docker-compose.prod.yml up -d

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f

# Обновление приложения
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📚 Подробная инструкция:
`docs/YANDEX_DEPLOYMENT_GUIDE.md`

## 💰 Стоимость: ~1600₽/месяц

**🎯 Готово! Ваше приложение в продакшн за 10 минут!**
