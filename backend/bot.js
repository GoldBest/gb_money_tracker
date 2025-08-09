const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
require('dotenv').config();

// Конфигурация бота
const token = config.BOT_TOKEN;
const webAppUrl = config.WEBAPP_URL;

// Создание экземпляра бота
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Telegram Bot запущен...');
console.log('📱 Web App URL:', webAppUrl);

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name;
  
  console.log(`👤 Пользователь ${username} (${chatId}) запустил бота`);
  
  bot.sendMessage(chatId, `Привет, ${username}! 👋\n\nДобро пожаловать в GB Money Tracker - приложение для учета финансов! 💰`, {
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

// Обработка команды /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpText = `📚 Доступные команды:

/start - Запустить приложение
/help - Показать эту справку
/balance - Показать текущий баланс
/status - Статус приложения

💰 Основные функции:
• Добавление доходов и расходов
• Категоризация транзакций
• Статистика и аналитика
• Графики и отчеты

Для начала работы нажмите кнопку "Открыть приложения" в команде /start`;

  bot.sendMessage(chatId, helpText);
});

// Обработка команды /balance
bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    // Здесь можно добавить логику получения баланса из БД
    bot.sendMessage(chatId, '💳 Баланс: $0.00\n\nДля просмотра актуального баланса откройте приложение!');
  } catch (error) {
    console.error('Ошибка при получении баланса:', error);
    bot.sendMessage(chatId, '❌ Ошибка при получении баланса. Попробуйте позже.');
  }
});

// Обработка команды /status
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  
  const statusText = `📊 Статус приложения:

✅ Бот: Активен
✅ Web App: ${webAppUrl}
✅ Сервер: Работает
🕐 Время: ${new Date().toLocaleString('ru-RU')}

Для проверки работы откройте приложение!`;
  
  bot.sendMessage(chatId, statusText);
});

// Обработка данных из Web App
bot.on('web_app_data', (msg) => {
  const chatId = msg.chat.id;
  const data = msg.web_app_data;
  
  console.log('📱 Получены данные из Web App:', data);
  
  try {
    // Парсим данные
    const parsedData = JSON.parse(data.data);
    
    bot.sendMessage(chatId, `✅ Данные получены!\n\n📊 Тип: ${parsedData.type || 'Неизвестно'}\n💰 Сумма: ${parsedData.amount || 'Не указано'}\n📝 Описание: ${parsedData.description || 'Не указано'}`);
    
  } catch (error) {
    console.error('Ошибка при парсинге данных:', error);
    bot.sendMessage(chatId, '❌ Ошибка при обработке данных из приложения.');
  }
});

// Обработка ошибок
bot.on('error', (error) => {
  console.error('❌ Ошибка бота:', error);
});

bot.on('polling_error', (error) => {
  console.error('❌ Ошибка polling:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Остановка бота...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Остановка бота...');
  bot.stopPolling();
  process.exit(0);
});

module.exports = bot;
