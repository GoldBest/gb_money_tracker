# 🚀 Деплой на Vercel + Railway

## 📋 Быстрый старт

### 1. Frontend на Vercel (15 минут)

#### Шаг 1: Создание аккаунта
1. Перейдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Создайте новый аккаунт

#### Шаг 2: Установка Vercel CLI
```bash
npm install -g vercel
```

#### Шаг 3: Деплой
```bash
cd frontend
vercel --prod
```

#### Шаг 4: Настройка переменных окружения
В Vercel Dashboard:
- `VITE_API_URL` = `https://your-backend.railway.app`
- `VITE_TELEGRAM_BOT_USERNAME` = `@your_bot_username`

### 2. Backend на Railway (25 минут)

#### Шаг 1: Создание аккаунта
1. Перейдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Создайте новый аккаунт

#### Шаг 2: Установка Railway CLI
```bash
npm install -g @railway/cli
```

#### Шаг 3: Создание проекта
```bash
cd backend
railway login
railway init
```

#### Шаг 4: Создание базы данных
1. В Railway Dashboard создайте PostgreSQL базу
2. Скопируйте `DATABASE_URL`

#### Шаг 5: Настройка переменных окружения
В Railway Dashboard:
- `NODE_ENV` = `production`
- `PORT` = `3001`
- `BOT_TOKEN` = `your_bot_token`
- `WEBAPP_URL` = `https://your-frontend.vercel.app`
- `DATABASE_URL` = `your_postgresql_url`

#### Шаг 6: Деплой
```bash
railway up
```

## 🔧 Автоматические скрипты

### Деплой Frontend
```bash
./scripts/deploy-vercel.sh
```

### Деплой Backend
```bash
./scripts/deploy-railway.sh
```

## 📱 Обновление Telegram Bot

После деплоя обновите Web App URL:

1. Напишите @BotFather
2. `/setmenubutton`
3. Выберите вашего бота
4. Установите URL: `https://your-frontend.vercel.app`

## 🧪 Тестирование

### Проверка Frontend
- [ ] Приложение загружается
- [ ] Нет ошибок в консоли
- [ ] Все компоненты отображаются

### Проверка Backend
- [ ] Health check: `/health`
- [ ] API отвечает: `/api/health`
- [ ] База данных подключена

### Проверка интеграции
- [ ] Telegram Web App открывается
- [ ] API запросы работают
- [ ] Все функции работают

## 🚨 Решение проблем

### Frontend не загружается
- Проверьте переменные окружения в Vercel
- Убедитесь, что API URL правильный

### Backend не отвечает
- Проверьте переменные окружения в Railway
- Убедитесь, что база данных создана
- Проверьте логи в Railway Dashboard

### База данных не подключается
- Проверьте `DATABASE_URL` в Railway
- Убедитесь, что PostgreSQL запущен
- Проверьте SSL настройки

## 📊 Мониторинг

### Vercel
- Автоматический мониторинг
- Аналитика производительности
- Логи ошибок

### Railway
- Мониторинг ресурсов
- Логи приложения
- Метрики базы данных

## 💰 Стоимость

### Vercel
- **Hobby**: Бесплатно (до 100GB трафика)
- **Pro**: $20/месяц

### Railway
- **Starter**: $5/месяц (до 500 часов)
- **Pro**: $20/месяц

## 🎯 Следующие шаги

1. ✅ Создать аккаунты на Vercel и Railway
2. 🔄 Подключить GitHub репозиторий
3. 🚀 Запустить деплой
4. ⚙️ Настроить переменные окружения
5. 🧪 Протестировать приложение
6. 🤖 Обновить Telegram Bot

---

**Время выполнения**: 1-1.5 часа  
**Сложность**: Средняя  
**Результат**: Продакшн приложение с SSL и мониторингом
