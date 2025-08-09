// Тестирование API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Тестовые данные
const testUser = {
  telegram_id: '123456789',
  username: 'test_user',
  first_name: 'Test User'
};

const testTransaction = {
  amount: 1000,
  description: 'Тестовая транзакция',
  type: 'expense',
  category_id: 1,
  user_id: 1
};

async function testAPI() {
  console.log('🧪 Начинаем тестирование API...\n');

  try {
    // 1. Создание пользователя
    console.log('1. Создание пользователя...');
    const userResponse = await axios.post(`${BASE_URL}/users`, testUser);
    console.log('✅ Пользователь создан:', userResponse.data);
    const userId = userResponse.data.id;

    // 2. Получение категорий
    console.log('\n2. Получение категорий...');
    const categoriesResponse = await axios.get(`${BASE_URL}/users/${userId}/categories`);
    console.log('✅ Категории получены:', categoriesResponse.data.length, 'категорий');

    // 3. Создание транзакции
    console.log('\n3. Создание транзакции...');
    const transactionData = { ...testTransaction, user_id: userId };
    const transactionResponse = await axios.post(`${BASE_URL}/transactions`, transactionData);
    console.log('✅ Транзакция создана:', transactionResponse.data);

    // 4. Получение транзакций
    console.log('\n4. Получение транзакций...');
    const transactionsResponse = await axios.get(`${BASE_URL}/users/${userId}/transactions`);
    console.log('✅ Транзакции получены:', transactionsResponse.data.length, 'транзакций');

    // 5. Получение статистики
    console.log('\n5. Получение статистики...');
    const statsResponse = await axios.get(`${BASE_URL}/users/${userId}/stats?period=month`);
    console.log('✅ Статистика получена:', {
      balance: statsResponse.data.balance,
      total_income: statsResponse.data.total_income,
      total_expense: statsResponse.data.total_expense,
      total_transactions: statsResponse.data.total_transactions
    });

    // 6. Создание еще одной транзакции (доход)
    console.log('\n6. Создание транзакции дохода...');
    const incomeTransaction = {
      amount: 5000,
      description: 'Зарплата',
      type: 'income',
      category_id: categoriesResponse.data.find(c => c.type === 'income').id,
      user_id: userId
    };
    const incomeResponse = await axios.post(`${BASE_URL}/transactions`, incomeTransaction);
    console.log('✅ Транзакция дохода создана:', incomeResponse.data);

    // 7. Обновленная статистика
    console.log('\n7. Обновленная статистика...');
    const updatedStatsResponse = await axios.get(`${BASE_URL}/users/${userId}/stats?period=month`);
    console.log('✅ Обновленная статистика:', {
      balance: updatedStatsResponse.data.balance,
      total_income: updatedStatsResponse.data.total_income,
      total_expense: updatedStatsResponse.data.total_expense,
      total_transactions: updatedStatsResponse.data.total_transactions
    });

    // 8. Тест удаления транзакции
    console.log('\n8. Удаление транзакции...');
    const deleteResponse = await axios.delete(`${BASE_URL}/transactions/${transactionResponse.data.id}`);
    console.log('✅ Транзакция удалена:', deleteResponse.data);

    console.log('\n🎉 Все тесты прошли успешно!');
    console.log('\n📊 Финальная статистика:');
    const finalStatsResponse = await axios.get(`${BASE_URL}/users/${userId}/stats?period=month`);
    console.log({
      balance: finalStatsResponse.data.balance,
      total_income: finalStatsResponse.data.total_income,
      total_expense: finalStatsResponse.data.total_expense,
      total_transactions: finalStatsResponse.data.total_transactions
    });

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.response?.data || error.message);
  }
}

// Запуск тестов
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
