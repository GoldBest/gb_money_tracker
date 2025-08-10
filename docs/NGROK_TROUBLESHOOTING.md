# Решение проблем с Ngrok

## Проблема: Предупреждение безопасности ngrok

При использовании бесплатного аккаунта ngrok вы можете увидеть предупреждение:

```
This website is served for free through ngrok.com.
You should only visit this website if you trust whoever sent the link to you.
```

## Решения

### 1. Добавление заголовков в код

В вашем коде уже добавлены необходимые заголовки:

```javascript
headers: {
  'ngrok-skip-browser-warning': 'true',
  'User-Agent': 'TelegramWebApp/1.0',
  'Content-Type': 'application/json'
}
```

### 2. Конфигурация ngrok.yml

В файле `ngrok.yml` добавлены заголовки по умолчанию:

```yaml
tunnels:
  frontend:
    addr: 5177
    proto: http
    inspect: false
    headers:
      ngrok-skip-browser-warning: "true"
  backend:
    addr: 3001
    proto: http
    inspect: false
    headers:
      ngrok-skip-browser-warning: "true"
```

### 3. Обновление URL

При каждом перезапуске ngrok URL меняется. Обновите URL в файле `frontend/src/config/api.js`:

```javascript
export const API_CONFIG = {
  NGROK_BACKEND_URL: 'https://f44d02326756.ngrok-free.app', // Текущий URL
  // ... остальные настройки
}
```

**Важно:** URL меняется при каждом перезапуске ngrok. Проверьте текущие туннели командой:
```bash
curl -s http://localhost:4040/api/tunnels | jq '.tunnels[] | {name: .name, public_url: .public_url}'
```

## Проверка работы

### Тест API с заголовками

```bash
node test-api-with-headers.js
```

### Тест фронтенда

Откройте файл `test-frontend.html` в браузере для тестирования фронтенда с обходом предупреждения ngrok.

### Проверка в браузере

1. Откройте DevTools (F12)
2. Перейдите на вкладку Network
3. Убедитесь, что запросы отправляются с заголовком `ngrok-skip-browser-warning: true`

## Альтернативные решения

### 1. Платный аккаунт ngrok

С платным аккаунтом предупреждения не появляются.

### 2. Использование других сервисов

- Cloudflare Tunnel
- LocalTunnel
- Serveo

### 3. Развертывание на реальном хостинге

Для продакшена рекомендуется использовать реальный хостинг вместо ngrok.

## Частые проблемы

### URL не обновляется

1. Проверьте логи ngrok
2. Перезапустите ngrok
3. Обновите URL в конфигурации

### Заголовки не работают

1. Проверьте консоль браузера на ошибки
2. Убедитесь, что заголовки отправляются
3. Проверьте конфигурацию axios

### CORS ошибки

1. Добавьте CORS заголовки на бэкенде
2. Проверьте настройки ngrok
3. Убедитесь, что домены совпадают
