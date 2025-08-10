# 🔧 Исправление проблемы "Нет соединения с сервером"

## ✅ Проблема решена!

Проблема была в том, что Telegram Web App пытался подключиться к API по адресу `localhost:3001`, но когда приложение открывается через Telegram, оно должно обращаться к серверу через публичный URL.

## 🚀 Что было исправлено:

### 1. Настройка ngrok туннелей
- Создан туннель для фронтенда (порт 5176): `https://f55e154b6f3a.ngrok-free.app`
- Создан туннель для бэкенда (порт 3001): `https://46d4bfbcf6f5.ngrok-free.app`

### 2. Обновление конфигурации
- `backend/config.js` - обновлен WEBAPP_URL
- `frontend/src/contexts/TelegramContext.jsx` - добавлена логика автоматического определения API URL

### 3. Автоматическое переключение API
Теперь приложение автоматически:
- Использует `localhost:3001` для локальной разработки
- Использует ngrok URL для работы через Telegram

## 📱 Как использовать:

### Запуск сервисов:
```bash
# Терминал 1: Бэкенд
cd backend && node server.js

# Терминал 2: Фронтенд  
cd frontend && npm run dev

# Терминал 3: Ngrok туннели
./start-ngrok.sh
```

### Проверка работы:
```bash
# Тест API через ngrok
node test-connection.js
```

## 🔍 Диагностика:

Если проблема повторится:

1. **Проверьте ngrok туннели:**
   ```bash
   curl -s http://localhost:4040/api/tunnels | jq '.tunnels[] | {name, public_url}'
   ```

2. **Проверьте доступность API:**
   ```bash
   curl -s "https://YOUR_BACKEND_NGROK_URL/api/users" -X POST -H "Content-Type: application/json" -d '{"telegram_id":"test","username":"test","first_name":"Test"}'
   ```

3. **Проверьте логи ngrok:**
   ```bash
   tail -f ngrok.log
   ```

## 🌐 Текущие URL:

- **Фронтенд:** https://f55e154b6f3a.ngrok-free.app
- **Бэкенд:** https://46d4bfbcf6f5.ngrok-free.app

## ⚠️ Важно:

- Ngrok URL меняются при каждом перезапуске
- Обновляйте конфигурацию после перезапуска ngrok
- Используйте `./start-ngrok.sh` для автоматического запуска

## 🎯 Результат:

Теперь Telegram Web App должен успешно подключаться к API и работать без ошибок "Нет соединения с сервером"!
