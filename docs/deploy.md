# 🚀 Деплой проекта

## Варианты деплоя

### 1. Vercel (Рекомендуется для фронтенда)

#### Настройка фронтенда
```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
cd frontend
vercel

# Настройка переменных окружения
vercel env add REACT_APP_API_URL
```

#### Настройка бэкенда
```bash
# Деплой на Railway или Heroku
cd backend
# Следуйте инструкциям платформы
```

### 2. Railway (Полный стек)

1. Подключите GitHub репозиторий
2. Настройте переменные окружения:
   ```
   PORT=3001
   NODE_ENV=production
   ```
3. Деплой автоматический

### 3. Heroku

#### Backend
```bash
# Создание приложения
heroku create your-money-app-backend

# Настройка переменных
heroku config:set NODE_ENV=production

# Деплой
git push heroku main
```

#### Frontend
```bash
# Создание приложения
heroku create your-money-app-frontend

# Настройка buildpack
heroku buildpacks:set mars/create-react-app

# Деплой
git push heroku main
```

### 4. Docker

#### Dockerfile для Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

#### Dockerfile для Frontend
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    volumes:
      - ./backend/money.db:/app/money.db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## Настройка домена

### 1. Покупка домена
- Namecheap, GoDaddy, или любой другой регистратор

### 2. Настройка DNS
```
A     @      YOUR_SERVER_IP
CNAME www    your-domain.com
```

### 3. SSL сертификат
```bash
# Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

## Настройка Telegram бота

### 1. Обновление URL в боте
```javascript
// В настройках бота
const webAppUrl = 'https://your-domain.com';
```

### 2. Настройка webhook
```javascript
// Установка webhook
bot.setWebhook('https://your-domain.com/webhook');
```

## Мониторинг

### 1. Логирование
```javascript
// Добавьте в backend/server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 2. Health check
```javascript
// Добавьте endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});
```

## Безопасность

### 1. Переменные окружения
```bash
# .env.production
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 2. Rate limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100 // максимум 100 запросов
});

app.use(limiter);
```

### 3. Helmet
```javascript
const helmet = require('helmet');
app.use(helmet());
```

## Backup стратегия

### 1. База данных
```bash
# Автоматический backup
0 2 * * * sqlite3 /app/money.db ".backup '/backup/money-$(date +%Y%m%d).db'"
```

### 2. Файлы
```bash
# Backup статических файлов
tar -czf backup-$(date +%Y%m%d).tar.gz /app/public/
```

## CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Проверка после деплоя

1. ✅ Приложение открывается
2. ✅ API endpoints работают
3. ✅ База данных создается
4. ✅ Telegram интеграция работает
5. ✅ SSL сертификат активен
6. ✅ Мониторинг настроен
7. ✅ Backup работает
8. ✅ Логи пишутся

## Полезные команды

```bash
# Проверка статуса
curl https://your-domain.com/health

# Проверка SSL
curl -I https://your-domain.com

# Мониторинг логов
tail -f /var/log/nginx/access.log

# Backup базы
sqlite3 money.db ".backup backup.db"
```
