# 🚀 Быстрый деплой на Render

## ⚡ 5 минут до продакшн

### 1. Перейдите на [render.com](https://render.com)
- Создайте аккаунт (Starter план)
- Войдите через GitHub

### 2. Создайте Blueprint
- Нажмите **"New +"**
- Выберите **"Blueprint"**
- Подключите GitHub репозиторий `tg-money-miniapp`

### 3. Настройте сервисы
Render автоматически обнаружит `render.yaml` и создаст:
- ✅ **Backend API** (Node.js + PostgreSQL)
- ✅ **Frontend** (React)
- ✅ **База данных** (PostgreSQL)

### 4. Добавьте переменные окружения
В Backend Service добавьте:
```
BOT_TOKEN=ваш_токен_бота
```

### 5. Дождитесь деплоя
- Backend: ~3-5 минут
- Frontend: ~2-3 минуты
- Database: ~1-2 минуты

## 🔗 Ваши URL после деплоя

- **Frontend**: `https://gb-money-tracker-frontend.onrender.com`
- **Backend**: `https://gb-money-tracker-backend.onrender.com`
- **Database**: Автоматически настроена

## 🧪 Тестирование

```bash
# Проверка backend
curl https://gb-money-tracker-backend.onrender.com/api/health

# Проверка frontend
curl https://gb-money-tracker-frontend.onrender.com
```

## 📚 Подробная инструкция

Полное руководство: [`docs/RENDER_DEPLOYMENT_GUIDE.md`](docs/RENDER_DEPLOYMENT_GUIDE.md)

---

**🎯 Готово! Ваше приложение в продакшн за 5 минут!**
