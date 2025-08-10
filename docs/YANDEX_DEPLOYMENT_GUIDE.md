# 🚀 Руководство по деплою на Yandex Cloud

## 📋 Обзор

Это руководство поможет вам развернуть TG Money MiniApp на Yandex Cloud с использованием:
- **Compute Instance** для backend и frontend
- **Managed PostgreSQL** для базы данных
- **Docker** для контейнеризации
- **Nginx** для веб-сервера

## 🎯 Преимущества Yandex Cloud

- **Локализация**: Серверы в России для быстрого доступа
- **Цены**: Конкурентные тарифы
- **Интеграция**: Хорошая интеграция с российскими сервисами
- **Поддержка**: Русскоязычная поддержка

## 🐳 Docker преимущества

- **Консистентность**: Одинаковая среда разработки и продакшн
- **Простота**: Легкий деплой и обновление
- **Масштабируемость**: Простое масштабирование сервисов
- **Изоляция**: Каждый сервис работает в своем контейнере

## ⚙️ Предварительные требования

### 1. Установка Yandex Cloud CLI

```bash
# macOS/Linux
curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash

# Windows
# Скачайте с https://cloud.yandex.ru/docs/cli/operations/install-cli#windows
```

### 2. Настройка аутентификации

```bash
yc init
# Следуйте инструкциям для настройки профиля
```

### 3. Установка Docker (для локальной разработки)

```bash
# macOS
brew install --cask docker

# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

## 🏗️ Создание инфраструктуры

### 1. Создание сервисного аккаунта

```bash
# Создаем сервисный аккаунт
yc iam service-account create --name gb-money-tracker

# Получаем ID аккаунта
yc iam service-account list

# Создаем ключ
yc iam service-account key create --id <sa-id> --output key.json
```

### 2. Создание Managed PostgreSQL

```bash
# Создаем кластер PostgreSQL
yc managed-postgresql cluster create \
  --name gb-money-tracker-db \
  --description "База данных для TG Money MiniApp" \
  --environment production \
  --network-name default \
  --resource-preset s2.micro \
  --disk-size 10 \
  --disk-type network-ssd \
  --host zone-id=ru-central1-a,subnet-name=default-ru-central1-a

# Получаем информацию о кластере
yc managed-postgresql cluster get gb-money-tracker-db

# Создаем базу данных
yc managed-postgresql database create \
  --cluster-name gb-money-tracker-db \
  --name gbmoneytracker

# Создаем пользователя
yc managed-postgresql user create \
  --cluster-name gb-money-tracker-db \
  --name gbmoneytracker \
  --password <strong-password>
```

### 3. Создание Compute Instance

```bash
# Создаем instance
yc compute instance create \
  --name gb-money-tracker \
  --description "TG Money MiniApp Server" \
  --zone-id ru-central1-a \
  --platform standard-v3 \
  --cores 2 \
  --memory 4GB \
  --network-interface subnet-name=default-ru-central1-a,nat-ip-version=ipv4 \
  --create-boot-disk size=20GB,type=network-ssd,image-folder-id=standard-images,image-family=ubuntu-2004-lts

# Получаем внешний IP
yc compute instance get gb-money-tracker
```

## 🐳 Деплой приложения

### 1. Подключение к серверу

```bash
# Подключаемся по SSH
ssh ubuntu@<external-ip>

# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Устанавливаем Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Клонирование репозитория

```bash
# Клонируем репозиторий
git clone https://github.com/your-username/tg-money-miniapp.git
cd tg-money-miniapp

# Создаем .env файл
cat > .env << EOF
NODE_ENV=production
BOT_TOKEN=your_bot_token_here
DATABASE_URL=postgresql://gbmoneytracker:password@<db-host>:6432/gbmoneytracker
EOF
```

### 3. Запуск приложения

```bash
# Собираем frontend
cd frontend && npm run build && cd ..

# Запускаем приложение
docker-compose -f docker-compose.prod.yml up -d

# Проверяем статус
docker-compose -f docker-compose.prod.yml ps
```

## 🔒 Настройка безопасности

### 1. Firewall

```bash
# Открываем только необходимые порты
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. SSL сертификат

```bash
# Устанавливаем Certbot
sudo apt install certbot python3-certbot-nginx

# Получаем сертификат
sudo certbot --nginx -d your-domain.com
```

### 3. Обновление Nginx для HTTPS

```bash
# Обновляем nginx.conf для поддержки HTTPS
# Смотрите nginx.ssl.conf
```

## 📊 Мониторинг и логирование

### 1. Просмотр логов Docker

```bash
# Логи backend
docker-compose -f docker-compose.prod.yml logs backend

# Логи frontend
docker-compose -f docker-compose.prod.yml logs frontend

# Логи Nginx
docker exec gb-money-tracker-frontend tail -f /var/log/nginx/access.log

# Все логи
docker-compose -f docker-compose.prod.yml logs -f
```

### 2. Мониторинг ресурсов

```bash
# Использование ресурсов Docker
docker stats

# Дисковое пространство
df -h

# Память
free -h
```

## 🔄 Обновление приложения

### 1. Автоматическое обновление

```bash
# Создаем скрипт обновления
cat > update.sh << 'EOF'
#!/bin/bash
cd /home/ubuntu/tg-money-miniapp
git pull origin main
cd frontend && npm run build && cd ..
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
EOF

chmod +x update.sh
```

### 2. Настройка cron для автообновления

```bash
# Добавляем в crontab
crontab -e

# Обновление каждый день в 3:00
0 3 * * * /home/ubuntu/tg-money-tracker/update.sh
```

### 3. Ручное обновление

```bash
# Остановка приложения
docker-compose -f docker-compose.prod.yml down

# Обновление кода
git pull origin main

# Пересборка frontend
cd frontend && npm run build && cd ..

# Запуск с пересборкой
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🚨 Устранение неполадок

### 1. Проблемы с подключением к БД

```bash
# Проверяем подключение через Docker
docker exec gb-money-tracker-backend node -e "
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);
client.connect()
  .then(() => console.log('DB connected'))
  .catch(err => console.error('DB error:', err))
  .finally(() => client.end());
"
```

### 2. Проблемы с Nginx

```bash
# Проверяем конфигурацию
docker exec gb-money-tracker-frontend nginx -t

# Перезапускаем Nginx
docker exec gb-money-tracker-frontend nginx -s reload
```

### 3. Проблемы с Docker

```bash
# Очистка Docker
docker system prune -a

# Перезапуск Docker
sudo systemctl restart docker

# Проверка статуса контейнеров
docker-compose -f docker-compose.prod.yml ps
```

### 4. Проблемы с портами

```bash
# Проверка занятых портов
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Остановка процессов на портах
sudo fuser -k 80/tcp
sudo fuser -k 443/tcp
```

## 💰 Стоимость

Примерная стоимость в месяц:
- **Compute Instance** (2 vCPU, 4GB RAM): ~1000₽
- **Managed PostgreSQL** (s2.micro): ~500₽
- **Общий трафик**: ~100₽
- **Итого**: ~1600₽/месяц

## 📚 Полезные ссылки

- [Yandex Cloud CLI](https://cloud.yandex.ru/docs/cli/)
- [Managed PostgreSQL](https://cloud.yandex.ru/docs/managed-postgresql/)
- [Compute Instance](https://cloud.yandex.ru/docs/compute/)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## 🎯 Следующие шаги

После успешного деплоя:
1. **Настройте домен** и SSL сертификат
2. **Настройте мониторинг** (Prometheus + Grafana)
3. **Настройте backup** базы данных
4. **Настройте CI/CD** для автоматического деплоя

## 🐳 Docker команды для продакшн

```bash
# Основные команды
docker-compose -f docker-compose.prod.yml up -d          # Запуск
docker-compose -f docker-compose.prod.yml down           # Остановка
docker-compose -f docker-compose.prod.yml restart        # Перезапуск
docker-compose -f docker-compose.prod.yml logs -f        # Логи
docker-compose -f docker-compose.prod.yml ps             # Статус

# Обновление
docker-compose -f docker-compose.prod.yml pull           # Pull образов
docker-compose -f docker-compose.prod.yml up -d --build  # Пересборка

# Отладка
docker-compose -f docker-compose.prod.yml exec backend bash  # Вход в backend
docker-compose -f docker-compose.prod.yml exec frontend sh   # Вход в frontend
```

**Удачи с деплоем! 🚀**
