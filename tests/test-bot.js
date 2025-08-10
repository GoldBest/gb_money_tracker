#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки работы Telegram бота GB Money Tracker
 * Запуск: node test-bot.js
 */

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Проверяем наличие токена
const token = process.env.BOT_TOKEN;
if (!token || token === 'YOUR_BOT_TOKEN_HERE') {
  console.log('❌ Токен бота не настроен!');
  console.log('📝 Создайте файл backend/.env с вашим токеном:');
  console.log('BOT_TOKEN=your_actual_token_here');
  console.log('');
  console.log('🚀 Или запустите автоматическую настройку:');
  console.log('./setup-bot.sh');
  process.exit(1);
}

// Создаем тестовый бот
const bot = new TelegramBot(token, { polling: false });

console.log('🧪 Тестирование Telegram бота...');
console.log('📱 Токен:', token.substring(0, 10) + '...');
console.log('');

// Тестируем получение информации о боте
async function testBot() {
  try {
    console.log('🔍 Получение информации о боте...');
    const me = await bot.getMe();
    
    console.log('✅ Бот успешно подключен!');
    console.log('📋 Информация о боте:');
    console.log(`   ID: ${me.id}`);
    console.log(`   Имя: ${me.first_name}`);
    console.log(`   Username: @${me.username}`);
    console.log(`   Может читать сообщения: ${me.can_read_all_group_messages ? 'Да' : 'Нет'}`);
    console.log(`   Поддерживает inline режим: ${me.supports_inline_queries ? 'Да' : 'Нет'}`);
    console.log('');
    
    // Проверяем настройки Web App
    console.log('🌐 Проверка настроек Web App...');
    try {
      const webAppInfo = await bot.getWebhookInfo();
      console.log('📊 Webhook информация:');
      console.log(`   URL: ${webAppInfo.url || 'Не настроен'}`);
      console.log(`   Последняя ошибка: ${webAppInfo.last_error_message || 'Нет'}`);
      console.log(`   Последняя ошибка время: ${webAppInfo.last_error_date || 'Нет'}`);
      console.log('');
    } catch (webhookError) {
      console.log('⚠️  Не удалось получить информацию о webhook');
    }
    
    console.log('🎉 Тест завершен успешно!');
    console.log('');
    console.log('📱 Теперь вы можете:');
    console.log('1. Запустить бота: cd backend && npm run bot');
    console.log('2. Найти бота в Telegram: @' + me.username);
    console.log('3. Отправить команду /start');
    console.log('');
    console.log('🔧 Для настройки Web App:');
    console.log('1. Запустите ngrok: ngrok http 5175');
    console.log('2. Настройте URL в @BotFather');
    console.log('3. Обновите WEBAPP_URL в .env файле');
    
  } catch (error) {
    console.log('❌ Ошибка при тестировании бота:');
    console.log('   ' + error.message);
    console.log('');
    
    if (error.code === 'ETELEGRAM') {
      console.log('🔍 Возможные причины:');
      console.log('   • Неверный токен бота');
      console.log('   • Бот заблокирован');
      console.log('   • Проблемы с интернетом');
      console.log('');
      console.log('💡 Решения:');
      console.log('   • Проверьте правильность токена');
      console.log('   • Создайте нового бота через @BotFather');
      console.log('   • Проверьте интернет соединение');
    }
  } finally {
    process.exit(0);
  }
}

// Запускаем тест
testBot();
