# 🚀 Быстрый запуск деплоя

## ⚡ Экспресс-деплой (5 минут)

### 1. Подключение к серверу
```bash
ssh ubuntu@62.84.114.186
```

### 2. Автоматический деплой
```bash
# Скачать и запустить
wget https://raw.githubusercontent.com/your-username/tg-money-miniapp/master/deploy-on-server.sh
chmod +x deploy-on-server.sh
./deploy-on-server.sh
```

### 3. Настройка BOT_TOKEN
```bash
nano .env
# Установить: BOT_TOKEN=your_actual_bot_token_here
```

### 4. Проверка работы
- Frontend: https://gbmt.gbdev.ru
- API: https://gbmt.gbdev.ru/api
- Health: https://gbmt.gbdev.ru/health

## 🔧 Что настроится автоматически

✅ **Система**: Ubuntu 20.04 LTS  
✅ **Docker**: Последняя версия  
✅ **Node.js**: Версия 18.x  
✅ **Nginx**: Прокси + статика  
✅ **SSL**: Let's Encrypt для gbmt.gbdev.ru  
✅ **Backend**: Systemd сервис  
✅ **Автозапуск**: При перезагрузке сервера  
✅ **Обновления**: Автоматическое обновление SSL  

## 🚨 Если что-то пошло не так

### Проблемы с SSL
```bash
# Ручная настройка SSL
./setup-ssl.sh
```

### Проблемы с backend
```bash
# Проверить статус
sudo systemctl status tg-money-backend

# Посмотреть логи
sudo journalctl -u tg-money-backend -f

# Перезапустить
sudo systemctl restart tg-money-backend
```

### Проблемы с Nginx
```bash
# Проверить конфигурацию
sudo nginx -t

# Перезагрузить
sudo systemctl reload nginx

# Посмотреть логи
sudo tail -f /var/log/nginx/error.log
```

## 📱 Telegram Bot

После настройки BOT_TOKEN:
1. Бот будет доступен по адресу: https://gbmt.gbdev.ru
2. Webhook автоматически настроится
3. Приложение будет работать в Telegram

## 🔄 Обновления

```bash
# Автоматическое обновление
./update-app.sh

# Ручное обновление
git pull origin master
cd frontend && npm run build
sudo systemctl restart tg-money-backend
```

---
*Деплой готов к запуску! 🎉*
