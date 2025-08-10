# 🚀 Руководство по деплою на Render

## 📋 Обзор

Это руководство поможет вам развернуть **TG Money MiniApp** на платформе Render. Render предоставляет бесплатный план для full-stack приложений с автоматическим деплоем.

## 🎯 Что мы развернем

1. **Backend API** - Node.js сервер с PostgreSQL
2. **Frontend** - React приложение
3. **База данных** - PostgreSQL
4. **Автоматический деплой** из GitHub

## 📋 Предварительные требования

- ✅ GitHub аккаунт
- ✅ Render аккаунт (бесплатный)
- ✅ Код приложения готов к деплою

## 🚀 Пошаговый деплой

### Шаг 1: Создание аккаунта на Render

1. Перейдите на [render.com](https://render.com)
2. Нажмите "Get Started for Free"
3. Войдите через GitHub или создайте аккаунт
4. Подтвердите email

### Шаг 2: Подключение GitHub репозитория

1. В Render Dashboard нажмите "New +"
2. Выберите "Blueprint"
3. Подключите ваш GitHub аккаунт
4. Выберите репозиторий `tg-money-miniapp`
5. Нажмите "Connect"

### Шаг 3: Настройка Blueprint

1. Render автоматически обнаружит `render.yaml`
2. Проверьте настройки:
   - **Backend**: `gb-money-tracker-backend`
   - **Frontend**: `gb-money-tracker-frontend`
   - **Database**: `gb-money-tracker-db`
3. Нажмите "Apply"

### Шаг 4: Настройка переменных окружения

После создания сервисов, добавьте переменные:

#### Backend Service
```
NODE_ENV=production
BOT_TOKEN=ваш_токен_бота
WEBAPP_URL=https://gb-money-tracker-frontend.onrender.com
```

#### Frontend Service
```
VITE_BACKEND_API_URL=https://gb-money-tracker-backend.onrender.com
```

### Шаг 5: Первый деплой

1. Render автоматически начнет деплой
2. Следите за логами в реальном времени
3. Дождитесь успешного завершения

## 🔧 Конфигурация

### Backend (Node.js)
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm install pg && node server.prod.js`
- **Port**: 3001 (автоматически)
- **Health Check**: `/api/health`

### Frontend (Static Site)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`
- **Environment**: Production

### Database (PostgreSQL)
- **Plan**: Free
- **Database Name**: `gbmoneytracker`
- **SSL**: Автоматически включен

## 📊 Мониторинг деплоя

### Логи
- **Backend**: `/logs` в Render Dashboard
- **Frontend**: Build logs в реальном времени
- **Database**: Connection logs

### Health Checks
- **Backend**: `https://gb-money-tracker-backend.onrender.com/api/health`
- **Frontend**: Автоматическая проверка доступности

## 🔄 Автоматический деплой

### Настройка
1. В Render Dashboard включите "Auto-Deploy"
2. При каждом push в `main` ветку будет автоматический деплой
3. Можно настроить preview deployments для pull requests

### Rollback
1. В Render Dashboard выберите предыдущую версию
2. Нажмите "Rollback"
3. Сервис вернется к предыдущей версии

## 🧪 Тестирование после деплоя

### 1. Проверка Backend
```bash
curl https://gb-money-tracker-backend.onrender.com/api/health
```

### 2. Проверка Frontend
```bash
curl https://gb-money-tracker-frontend.onrender.com
```

### 3. Проверка интеграции
- Откройте frontend URL в браузере
- Проверьте, что API calls работают
- Протестируйте основные функции

## 🚨 Устранение проблем

### Build Errors
- Проверьте логи сборки
- Убедитесь, что все зависимости указаны в `package.json`
- Проверьте Node.js версию (рекомендуется 18+)

### Runtime Errors
- Проверьте логи выполнения
- Убедитесь, что переменные окружения настроены
- Проверьте подключение к базе данных

### Database Issues
- Проверьте `DATABASE_URL` в переменных окружения
- Убедитесь, что база данных создана
- Проверьте SSL настройки

## 📈 Масштабирование

### Starter Plan Features
- **Backend**: 750 часов/месяц
- **Frontend**: 100 GB bandwidth/месяц
- **Database**: 1 GB storage
- **Custom Domains**: Поддерживаются
- **SSL Certificates**: Автоматически

### Upgrade Options
- **Paid Plans**: От $7/месяц
- **Custom Domains**: Поддерживаются
- **SSL Certificates**: Автоматически

## 🔐 Безопасность

### Environment Variables
- Никогда не коммитьте секреты в код
- Используйте Render Environment Variables
- Регулярно ротируйте токены

### CORS
- Настроен только для разрешенных доменов
- Включает localhost для разработки
- Автоматически обновляется при деплое

## 📝 Полезные команды

### Локальное тестирование production build
```bash
# Backend
cd backend && npm install pg && NODE_ENV=production node server.prod.js

# Frontend
cd frontend && npm run build && npm run preview
```

### Проверка production конфигурации
```bash
# Проверить render.yaml
render validate render.yaml

# Проверить build
cd frontend && npm run build
```

## 🎉 После успешного деплоя

1. **Обновите Telegram бота**:
   - Новый Web App URL: `https://gb-money-tracker-frontend.onrender.com`
   - Новый API URL: `https://gb-money-tracker-backend.onrender.com`

2. **Протестируйте приложение**:
   - Откройте в браузере
   - Проверьте все функции
   - Протестируйте через Telegram

3. **Настройте мониторинг**:
   - Включите уведомления о статусе
   - Настройте логирование ошибок
   - Мониторьте производительность

## 📞 Поддержка

- **Render Docs**: [docs.render.com](https://docs.render.com)
- **Render Support**: [render.com/support](https://render.com/support)
- **GitHub Issues**: Создайте issue в репозитории

---

**Удачи с деплоем! 🚀**
