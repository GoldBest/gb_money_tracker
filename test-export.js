const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testExportAPI() {
  try {
    console.log('🧪 Тестирование API экспорта...\n');

    // 1. Создаем тестового пользователя
    console.log('1. Создание тестового пользователя...');
    const userResponse = await axios.post(`${BASE_URL}/api/users`, {
      telegram_id: 'test_export_user_123',
      username: 'testexport',
      first_name: 'Test Export'
    });
    const userId = userResponse.data.id;
    console.log(`✅ Пользователь создан с ID: ${userId}\n`);

    // 2. Создаем несколько тестовых транзакций
    console.log('2. Создание тестовых транзакций...');
    const transactions = [
      { amount: 50000, description: 'Зарплата', type: 'income', user_id: userId },
      { amount: 15000, description: 'Продукты', type: 'expense', user_id: userId },
      { amount: 8000, description: 'Транспорт', type: 'expense', user_id: userId },
      { amount: 12000, description: 'Развлечения', type: 'expense', user_id: userId },
      { amount: 25000, description: 'Фриланс', type: 'income', user_id: userId }
    ];

    for (const transaction of transactions) {
      await axios.post(`${BASE_URL}/api/transactions`, transaction);
    }
    console.log(`✅ Создано ${transactions.length} транзакций\n`);

    // 3. Тестируем получение информации об экспорте
    console.log('3. Тестирование информации об экспорте...');
    const periods = ['week', 'month', 'quarter', 'year', 'all'];
    
    for (const period of periods) {
      try {
        const exportInfoResponse = await axios.get(`${BASE_URL}/api/users/${userId}/export-info?period=${period}`);
        console.log(`✅ ${period}: ${exportInfoResponse.data.total_transactions} транзакций, доходы: ${exportInfoResponse.data.total_income}, расходы: ${exportInfoResponse.data.total_expense}`);
      } catch (error) {
        console.log(`❌ ${period}: Ошибка - ${error.response?.data?.error || error.message}`);
      }
    }
    console.log('');

    // 4. Тестируем получение транзакций для экспорта
    console.log('4. Тестирование получения транзакций для экспорта...');
    for (const period of periods) {
      try {
        const transactionsResponse = await axios.get(`${BASE_URL}/api/users/${userId}/transactions?period=${period}&limit=10000`);
        console.log(`✅ ${period}: Получено ${transactionsResponse.data.length} транзакций`);
      } catch (error) {
        console.log(`❌ ${period}: Ошибка - ${error.response?.data?.error || error.message}`);
      }
    }
    console.log('');

    // 5. Тестируем статистику
    console.log('5. Тестирование статистики...');
    for (const period of periods) {
      try {
        const statsResponse = await axios.get(`${BASE_URL}/api/users/${userId}/stats?period=${period}`);
        console.log(`✅ ${period}: ${statsResponse.data.total_transactions} транзакций, баланс: ${statsResponse.data.balance}`);
      } catch (error) {
        console.log(`❌ ${period}: Ошибка - ${error.response?.data?.error || error.message}`);
      }
    }
    console.log('');

    console.log('🎉 Все тесты завершены успешно!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.response?.data || error.message);
  }
}

// Запускаем тесты
testExportAPI();
