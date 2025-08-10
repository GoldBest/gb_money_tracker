# 🚀 Быстрый старт

## Установка и запуск

### 1. Установка зависимостей
```bash
npm install
npm install --prefix backend
npm install --prefix frontend --legacy-peer-deps
```

### 2. Запуск проекта
```bash
npm run dev
```

Это запустит:
- Backend на http://localhost:3001
- Frontend на http://localhost:5176

### 3. Проверка работы
- Откройте http://localhost:5176 в браузере
- Добавьте тестовую транзакцию
- Проверьте статистику

## Тестирование API

```bash
node test-api.js
```

## Структура проекта

```
gb-money-tracker/
├── backend/           # Express.js сервер
│   ├── server.js     # Основной сервер
│   └── money.db      # SQLite база данных
├── frontend/         # React приложение
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── contexts/      # React контексты
│   │   └── App.jsx        # Главный компонент
│   └── public/
│       └── telegram-web-app.js  # Telegram интеграция
└── README.md         # Подробная документация
```

## Основные функции

✅ **Управление транзакциями**
- Добавление доходов и расходов
- Категоризация транзакций
- Удаление транзакций

✅ **Статистика**
- Баланс по периодам
- Аналитика по категориям
- Графики расходов

✅ **Telegram интеграция**
- Web App API
- Адаптивный дизайн
- Мобильная оптимизация

## Следующие шаги

1. **Настройка Telegram бота** - см. `bot-setup.md`
2. **Деплой на сервер** - см. `README.md`
3. **Настройка домена и SSL**
4. **Интеграция с реальным ботом**

## Полезные команды

```bash
# Запуск только бэкенда
npm run dev:backend

# Запуск только фронтенда  
npm run dev:frontend

# Сборка для продакшн
npm run build --prefix frontend

# Проверка базы данных
sqlite3 backend/money.db ".tables"
```

## Поддержка

- 📖 Подробная документация: `README.md`
- 🤖 Настройка бота: `bot-setup.md`
- 🧪 Тестирование: `test-api.js`
