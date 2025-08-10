# 🚀 Быстрый деплой на Vercel + Railway

## 📋 Предварительные требования

1. **GitHub аккаунт** (для Vercel)
2. **Railway аккаунт** (для backend)
3. **Node.js 20+** и **npm** установлены
4. **Telegram Bot Token** (получить у @BotFather)

## 🚀 Деплой Frontend на Vercel

### 1. Авторизация в Vercel
```bash
npm install -g vercel
vercel login
```

### 2. Деплой
```bash
npm run deploy:vercel
```

### 3. Настройка переменных окружения
В Vercel Dashboard → Project Settings → Environment Variables:
- `REACT_APP_API_URL`: `https://your-backend.railway.app`

## 🚂 Деплой Backend на Railway

### 1. Авторизация в Railway
```bash
npm install -g @railway/cli
railway login
```

### 2. Деплой
```bash
npm run deploy:railway
```

### 3. Настройка переменных окружения
В Railway Dashboard → Variables:
- `DATABASE_URL`: строка подключения к PostgreSQL
- `BOT_TOKEN`: токен вашего Telegram бота
- `WEBHOOK_URL`: `https://your-backend.railway.app/webhook`

## 🔄 Полный деплой

```bash
npm run deploy
```

## 📱 Обновление Telegram Bot

После деплоя обновите Web App URL в настройках бота:
```
https://your-frontend.vercel.app
```

## 🧪 Тестирование

1. Откройте frontend URL
2. Протестируйте основные функции
3. Проверьте подключение к backend API

## 🆘 Устранение проблем

### Ошибка "vercel: command not found"
```bash
export PATH="$PATH:$(npm config get prefix)/bin:$HOME/.npm-global/bin"
```

### Ошибка авторизации
```bash
vercel login
railway login
```

### Проблемы с переменными окружения
Проверьте, что все переменные настроены в соответствующих dashboard'ах.

## 📚 Подробная документация

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Telegram Bot API](https://core.telegram.org/bots/api)
