require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

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
/budgets - Показать бюджетные лимиты
/test-budget - Тест бюджетных уведомлений

💰 Основные функции:
• Добавление доходов и расходов
• Категоризация транзакций
• Статистика и аналитика
• Графики и отчеты
• Бюджетные уведомления 🆕

Для начала работы нажмите кнопку "Открыть приложения" в команде /start`;

  bot.sendMessage(chatId, helpText);
});

// Обработка команды /balance
bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    // Здесь можно добавить логику получения баланса из БД
    bot.sendMessage(chatId, '💳 Баланс: 0.00 ₽\n\nДля просмотра актуального баланса откройте приложение!');
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

// Обработка команды /test-budget
bot.onText(/\/test-budget/, (msg) => {
  const chatId = msg.chat.id;
  
  const testWarning = {
    type: 'budget_exceeded',
    message: 'Тестовое уведомление: превышен лимит бюджета для категории "Продукты" (monthly)',
    message: 'Тестовое уведомление: превышен лимит бюджета для категории "Продукты" (monthly)',
    current: 15000,
    limit: 20000,
    newTotal: 25000,
    period: 'monthly'
  };
  
  sendBudgetNotification(chatId, testWarning);
});

// Обработка команды /budgets
bot.onText(/\/budgets/, (msg) => {
  const chatId = msg.chat.id;
  
  // Здесь можно добавить логику получения бюджетных лимитов из БД
  const budgetsText = `💰 Ваши бюджетные лимиты:

📊 Категория: Продукты
🎯 Лимит: 20,000 ₽ (месяц)
💰 Текущие траты: 25,000 ₽
🚨 Статус: Превышен

Для управления бюджетными лимитами откройте приложение!`;
  
  bot.sendMessage(chatId, budgetsText, {
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

// Функция для отправки бюджетных уведомлений
async function sendBudgetNotification(chatId, warning) {
  try {
    let emoji = '⚠️';
    let title = 'Предупреждение о бюджете';
    
    if (warning.type === 'budget_exceeded') {
      emoji = '🚨';
      title = 'Превышен лимит бюджета!';
    }
    
    const message = `${emoji} ${title}\n\n${warning.message}\n\n💰 Текущие траты: ${warning.current.toLocaleString()} ₽\n🎯 Лимит: ${warning.limit.toLocaleString()} ₽\n📊 Новый итог: ${warning.newTotal.toLocaleString()} ₽\n\nПериод: ${warning.period === 'daily' ? 'день' : warning.period === 'weekly' ? 'неделя' : 'месяц'}`;
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[
          {
            text: '💰 Открыть приложение',
            web_app: { url: webAppUrl }
          }
        ]]
      }
    });
    
    console.log(`📢 Бюджетное уведомление отправлено пользователю ${chatId}`);
  } catch (error) {
    console.error('Ошибка при отправке бюджетного уведомления:', error);
  }
}

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
    console.error('Ошибка при обработке данных из приложения:', error);
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
