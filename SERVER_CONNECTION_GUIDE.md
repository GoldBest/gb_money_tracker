# 🚀 Подключение к серверу и запуск деплоя

## 📋 Информация о сервере

- **IP адрес**: `62.84.114.186`
- **Домен**: `gbmt.gbdev.ru`
- **Зона**: `ru-central1-a`
- **Платформа**: `standard-v3`
- **CPU**: 2 ядра
- **RAM**: 4 GB
- **Диск**: 20 GB SSD

## 🔑 Подключение к серверу

### 1. Через SSH (если настроен ключ)
```bash
ssh ubuntu@62.84.114.186
```

### 2. Через Yandex Cloud Console
1. Откройте [Yandex Cloud Console](https://console.cloud.yandex.ru)
2. Перейдите в раздел Compute → Instances
3. Найдите instance `gb-money-tracker`
4. Нажмите на имя instance
5. В разделе "Network" нажмите "Connect" → "Serial console"

## 🚀 Запуск деплоя

### Автоматический деплой (рекомендуется)
```bash
# Подключитесь к серверу
ssh ubuntu@62.84.114.186

# Скачайте скрипт деплоя
wget https://raw.githubusercontent.com/your-username/tg-money-miniapp/master/deploy-on-server.sh

# Сделайте его исполняемым
chmod +x deploy-on-server.sh

# Запустите деплой
./deploy-on-server.sh
```

### Ручной деплой
Если автоматический деплой не работает, выполните команды пошагово:

```bash
# 1. Обновление системы
sudo apt update && sudo apt upgrade -y

# 2. Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Установка Nginx
sudo apt install -y nginx

# 5. Клонирование репозитория
cd /opt
sudo git clone https://github.com/your-username/tg-money-miniapp.git
sudo chown -R $USER:$USER tg-money-miniapp
cd tg-money-miniapp

# 6. Настройка .env
# Создайте .env файл с вашими настройками

# 7. Сборка frontend
cd frontend
npm install
npm run build
cd ..

# 8. Запуск backend
cd backend
npm install
npm start
```

## 🔧 Настройка после деплоя

### 1. Настройка BOT_TOKEN
```bash
# Отредактируйте .env файл
nano .env

# Установите ваш BOT_TOKEN
BOT_TOKEN=your_actual_bot_token_here
```

### 2. Проверка подключения к базе данных
```bash
# Проверьте статус backend
sudo systemctl status tg-money-backend

# Посмотрите логи
sudo journalctl -u tg-money-backend -f
```

### 3. Настройка SSL (Let's Encrypt)
```bash
# SSL настраивается автоматически при деплое
# Сертификат получается для домена: gbmt.gbdev.ru
# Автоматическое обновление настроено в cron

# Ручная проверка статуса SSL
sudo certbot certificates

# Ручное обновление (если нужно)
sudo certbot renew --dry-run
```

## 📊 Мониторинг и управление

### Проверка статуса сервисов
```bash
# Nginx
sudo systemctl status nginx

# Backend
sudo systemctl status tg-money-backend

# Docker
sudo systemctl status docker
```

### Логи
```bash
# Backend логи
sudo journalctl -u tg-money-backend -f

# Nginx логи
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Docker логи
sudo docker logs <container_id>
```

### Перезапуск сервисов
```bash
# Backend
sudo systemctl restart tg-money-backend

# Nginx
sudo systemctl reload nginx

# Docker
sudo systemctl restart docker
```

## 🔄 Обновление приложения

### Автоматическое обновление
```bash
./update-app.sh
```

### Ручное обновление
```bash
cd /opt/tg-money-miniapp
git pull origin master

# Обновление frontend
cd frontend
npm install
npm run build
cd ..

# Перезапуск backend
sudo systemctl restart tg-money-backend

# Перезагрузка Nginx
sudo systemctl reload nginx
```

## 🚨 Устранение неполадок

### Проблемы с подключением
1. Проверьте статус instance в Yandex Cloud Console
2. Убедитесь, что группа безопасности разрешает нужные порты
3. Проверьте логи Nginx и backend

### Проблемы с базой данных
1. Проверьте подключение к PostgreSQL
2. Убедитесь, что база данных запущена
3. Проверьте правильность DATABASE_URL в .env

### Проблемы с frontend
1. Проверьте, что build прошел успешно
2. Убедитесь, что Nginx правильно настроен
3. Проверьте права доступа к файлам

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сервисов
2. Убедитесь, что все зависимости установлены
3. Проверьте настройки firewall и security groups
4. Обратитесь к документации проекта
