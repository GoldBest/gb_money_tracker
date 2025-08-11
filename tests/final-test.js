#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3002';
const FRONTEND_URL = 'http://localhost:8081';

console.log('🧪 Начинаю финальное тестирование приложения...\n');

async function testBackendAPI() {
  console.log('📡 Тестирую Backend API...');
  
  try {
    // Health check
    const health = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check:', health.data.status);
    
    // Categories
    const categories = await axios.get(`${BASE_URL}/api/users/1/categories`);
    console.log('✅ Категории загружены:', categories.data.length, 'шт.');
    
    // Transactions
    const transactions = await axios.get(`${BASE_URL}/api/users/1/transactions`);
    console.log('✅ Транзакции загружены:', transactions.data.length, 'шт.');
    
    // Statistics
    const stats = await axios.get(`${BASE_URL}/api/users/1/stats`);
    console.log('✅ Статистика загружена. Баланс:', stats.data.balance, 'руб.');
    
    // Create test transaction
    const newTransaction = await axios.post(`${BASE_URL}/api/transactions`, {
      amount: 2000,
      type: 'income',
      category_id: 1,
      description: 'Финальный тест',
      user_id: 1
    });
    console.log('✅ Тестовая транзакция создана с ID:', newTransaction.data.id);
    
    return true;
  } catch (error) {
    console.log('❌ Ошибка в Backend API:', error.message);
    return false;
  }
}

async function testFrontend() {
  console.log('\n🌐 Тестирую Frontend...');
  
  try {
    const response = await axios.get(FRONTEND_URL);
    if (response.status === 200) {
      console.log('✅ Frontend доступен');
      return true;
    }
  } catch (error) {
    console.log('❌ Ошибка в Frontend:', error.message);
    return false;
  }
}



async function testTelegramBot() {
  console.log('\n🤖 Тестирую Telegram бота...');
  
  try {
    const botToken = require('dotenv').config().parsed.BOT_TOKEN;
    if (!botToken) {
      console.log('⚠️  BOT_TOKEN не найден в .env файле');
      return false;
    }
    
    const response = await axios.get(`https://api.telegram.org/bot${botToken}/getMe`);
    if (response.data.ok) {
      console.log('✅ Telegram бот работает:', response.data.result.first_name);
      return true;
    }
  } catch (error) {
    console.log('❌ Ошибка в Telegram боте:', error.message);
    return false;
  }
}

async function runAllTests() {
  const results = {
    backend: await testBackendAPI(),
    frontend: await testFrontend(),
    telegram: await testTelegramBot()
  };
  
  console.log('\n📊 Результаты финального тестирования:');
  console.log('=====================================');
  console.log(`Backend API: ${results.backend ? '✅' : '❌'}`);
  console.log(`Frontend: ${results.frontend ? '✅' : '❌'}`);
  console.log(`Telegram бот: ${results.telegram ? '✅' : '❌'}`);
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n🎯 Итого: ${successCount}/${totalCount} тестов пройдено`);
  
  if (successCount === totalCount) {
    console.log('🎉 Все тесты пройдены успешно! Приложение готово к использованию!');
  } else {
    console.log('⚠️  Некоторые тесты не пройдены. Проверьте логи выше.');
  }
}

// Запускаем тесты
runAllTests().catch(console.error);
