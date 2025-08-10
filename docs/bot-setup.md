# 🤖 Настройка Telegram Bot для GB Money Tracker

## Шаги для создания и настройки бота

### 1. Создание бота через @BotFather

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/newbot`
3. Введите имя бота: "GB Money Tracker"
4. Введите username бота: "gb_money_tracker_bot"
5. Сохраните токен бота для дальнейшего использования

### 2. Настройка Web App

1. Отправьте @BotFather команду `/mybots`
2. Выберите вашего бота
3. Нажмите "Bot Settings" → "Menu Button"
4. Введите текст кнопки (например: "💰 Открыть приложение")
5. Введите URL вашего приложения (например: `https://your-domain.com`)

### 3. Альтернативный способ через команду

Отправьте @BotFather команду:
```
/setmenubutton
```

Затем:
- Выберите бота
- Введите текст кнопки
- Введите URL приложения

### 4. Пример кода для бота (Node.js)

```javascript
const TelegramBot = require('node-telegram-bot-api');

const token = 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(token, {polling: true});

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const webAppUrl = 'https://your-domain.com';
  
  bot.sendMessage(chatId, 'Добро пожаловать в GB Money Tracker!', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: '💰 Открыть приложение',
          web_app: { url: webAppUrl }
        }
      ]]
    }
  });
});

// Обработка данных из Web App
bot.on('web_app_data', (msg) => {
  const chatId = msg.chat.id;
  const data = JSON.parse(msg.web_app_data.data);
  
  console.log('Получены данные из Web App:', data);
  
  // Здесь можно обработать данные
  bot.sendMessage(chatId, 'Данные получены!');
});
```

### 5. Настройка для разработки

Для локальной разработки:

1. **Запустите frontend сервер**:
```bash
cd frontend
npm run dev
```

2. **Для локальной разработки используйте localhost:5176**

3. **Для продакшн настройте ваш домен**

4. **Используйте URL в настройках бота**

5. **Обновите URL в коде бота**

### 6. Проверка работы

1. Найдите вашего бота в Telegram
2. Отправьте команду `/start`
3. Нажмите на кнопку "Открыть приложение"
4. Приложение должно открыться в Telegram

### 7. Полезные команды

- `/mybots` - список ваших ботов
- `/setmenubutton` - настройка кнопки меню
- `/deletebot` - удаление бота
- `/setcommands` - настройка команд бота

### 8. Безопасность

- Никогда не публикуйте токен бота
- Используйте HTTPS для продакшн
- Валидируйте данные от Telegram
- Используйте webhook для продакшн

### 9. Пример .env файла для бота

```env
BOT_TOKEN=your_bot_token_here
WEBAPP_URL=https://your-domain.com
WEBHOOK_URL=https://your-domain.com/webhook
```

### 10. Деплой

Для продакшн деплоя:

1. Разверните приложение на сервере
2. Настройте домен и SSL
3. Обновите URL в настройках бота
4. Настройте webhook для бота
5. Протестируйте все функции
