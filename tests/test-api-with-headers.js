const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testAPI() {
  try {
    console.log('🧪 Тестируем API...');
    
    const response = await axios.get(`${API_URL}/api/health`, {
      headers: {
        'User-Agent': 'TelegramWebApp/1.0'
      },
      timeout: 10000
    });
    
    console.log('✅ API работает!');
    console.log('📊 Статус:', response.status);
    console.log('📄 Данные:', response.data);
    
  } catch (error) {
    console.error('❌ Ошибка API:', error.message);
    if (error.response) {
      console.error('📊 Статус ответа:', error.response.status);
      console.error('📄 Данные ошибки:', error.response.data);
    }
  }
}

// Тестируем также POST запрос
async function testPostAPI() {
  try {
    console.log('\n🧪 Тестируем POST API...');
    
    const response = await axios.post(`${API_URL}/api/users`, {
      telegram_id: '123456789',
      username: 'test_user',
      first_name: 'Test User'
    }, {
      headers: {
        'User-Agent': 'TelegramWebApp/1.0',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ POST API работает!');
    console.log('📊 Статус:', response.status);
    console.log('📄 Данные:', response.data);
    
  } catch (error) {
    console.error('❌ Ошибка POST API:', error.message);
    if (error.response) {
      console.error('📊 Статус ответа:', error.response.status);
      console.error('📄 Данные ошибки:', error.response.data);
    }
  }
}

// Запускаем тесты
testAPI().then(() => {
  setTimeout(testPostAPI, 1000);
});
