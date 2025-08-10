const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testApp() {
  console.log('🧪 Начинаю тестирование приложения...\n');

  try {
    // 1. Тест health check
    console.log('1️⃣ Тестирую health check...');
    const health = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check:', health.data.status);

    // 2. Тест создания пользователя
    console.log('\n2️⃣ Тестирую создание пользователя...');
    const userData = {
      telegram_id: `test_user_${Date.now()}`,
      username: 'testuser',
      first_name: 'Test User'
    };
    const user = await axios.post(`${BASE_URL}/api/users`, userData);
    const userId = user.data.id;
    console.log('✅ Пользователь создан:', user.data.telegram_id);

    // 3. Тест получения категорий по умолчанию
    console.log('\n3️⃣ Тестирую получение категорий...');
    const categories = await axios.get(`${BASE_URL}/api/categories/default`);
    console.log('✅ Категории получены:', categories.data.total, 'шт.');

    // 4. Тест создания транзакции
    console.log('\n4️⃣ Тестирую создание транзакции...');
    const transactionData = {
      amount: 150.75,
      description: 'Тестовая покупка',
      type: 'expense',
      category_id: 1,
      user_id: userId
    };
    const transaction = await axios.post(`${BASE_URL}/api/transactions`, transactionData);
    console.log('✅ Транзакция создана:', transaction.data.amount, 'руб.');

    // 5. Тест получения транзакций пользователя
    console.log('\n5️⃣ Тестирую получение транзакций...');
    const transactions = await axios.get(`${BASE_URL}/api/users/${userId}/transactions`);
    console.log('✅ Транзакции получены:', transactions.data.length, 'шт.');

    // 6. Тест статистики пользователя
    console.log('\n6️⃣ Тестирую статистику...');
    const stats = await axios.get(`${BASE_URL}/api/users/${userId}/stats`);
    console.log('✅ Статистика получена:');
    console.log('   - Доходы:', stats.data.total_income, 'руб.');
    console.log('   - Расходы:', stats.data.total_expense, 'руб.');
    console.log('   - Баланс:', stats.data.balance, 'руб.');

    // 7. Тест создания категории
    console.log('\n7️⃣ Тестирую создание категории...');
    const categoryData = {
      name: 'Тестовая категория',
      type: 'expense',
      color: '#FF6B6B',
      user_id: userId
    };
    const category = await axios.post(`${BASE_URL}/api/categories`, categoryData);
    console.log('✅ Категория создана:', category.data.name);

    // 8. Тест получения категорий пользователя
    console.log('\n8️⃣ Тестирую получение категорий пользователя...');
    const userCategories = await axios.get(`${BASE_URL}/api/users/${userId}/categories`);
    console.log('✅ Категории пользователя получены:', userCategories.data.length, 'шт.');

    // 9. Тест создания бюджетного уведомления
    console.log('\n9️⃣ Тестирую создание бюджетного уведомления...');
    
    // Используем первую категорию пользователя
    const firstCategoryId = userCategories.data[0].id;
    
    const budgetAlertData = {
      user_id: userId,
      category_id: firstCategoryId,
      limit_amount: 1000.00,
      period: 'monthly',
      enabled: true
    };
    const budgetAlert = await axios.post(`${BASE_URL}/api/budget-alerts`, budgetAlertData);
    console.log('✅ Бюджетное уведомление создано:', budgetAlert.data.alert.limit_amount, 'руб.');

    // 10. Тест получения бюджетных уведомлений
    console.log('\n🔟 Тестирую получение бюджетных уведомлений...');
    const budgetAlerts = await axios.get(`${BASE_URL}/api/budget-alerts?user_id=${userId}`);
    console.log('✅ Бюджетные уведомления получены:', budgetAlerts.data.length, 'шт.');

    console.log('\n🎉 Все тесты пройдены успешно!');
    console.log('\n📊 Итоговая статистика:');
    console.log(`   - Пользователь: ${userData.telegram_id}`);
    console.log(`   - Транзакции: ${transactions.data.length} шт.`);
    console.log(`   - Категории: ${userCategories.data.length} шт.`);
    console.log(`   - Бюджетные уведомления: ${budgetAlerts.data.length} шт.`);

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.response?.data || error.message);
  }
}

testApp();
