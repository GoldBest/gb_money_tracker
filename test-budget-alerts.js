const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testBudgetAlerts() {
  try {
    console.log('🧪 Тестирование API бюджетных уведомлений...\n');

    // 1. Создаем пользователя
    console.log('1. Создание пользователя...');
    const userResponse = await axios.post(`${BASE_URL}/users`, {
      telegram_id: 'test_user_123',
      username: 'testuser',
      first_name: 'Test User'
    });
    const user = userResponse.data;
    console.log(`✅ Пользователь создан: ID ${user.id}\n`);

    // 2. Получаем категории пользователя
    console.log('2. Получение категорий...');
    const categoriesResponse = await axios.get(`${BASE_URL}/users/${user.id}/categories`);
    const categories = categoriesResponse.data;
    const expenseCategory = categories.find(c => c.type === 'expense');
    console.log(`✅ Категории получены: ${categories.length} шт. (выбрана: ${expenseCategory.name})\n`);

    // 3. Создаем бюджетное уведомление
    console.log('3. Создание бюджетного уведомления...');
    const alertResponse = await axios.post(`${BASE_URL}/budget-alerts`, {
      user_id: user.id,
      category_id: expenseCategory.id,
      limit_amount: 1000,
      period: 'monthly'
    });
    const alert = alertResponse.data.alert;
    console.log(`✅ Уведомление создано: ID ${alert.id}, лимит ${alert.limit_amount} руб.\n`);

    // 4. Получаем все уведомления пользователя
    console.log('4. Получение всех уведомлений...');
    const alertsResponse = await axios.get(`${BASE_URL}/budget-alerts?user_id=${user.id}`);
    const alerts = alertsResponse.data;
    console.log(`✅ Уведомления получены: ${alerts.length} шт.`);
    console.log(`   Первое уведомление: ${alerts[0].category_name}, лимит: ${alerts[0].limit_amount}, текущие траты: ${alerts[0].current_spending}\n`);

    // 5. Обновляем уведомление
    console.log('5. Обновление уведомления...');
    const updateResponse = await axios.put(`${BASE_URL}/budget-alerts/${alert.id}`, {
      user_id: user.id,
      limit_amount: 1500
    });
    console.log(`✅ Уведомление обновлено: ${updateResponse.data.message}\n`);

    // 6. Переключаем статус уведомления
    console.log('6. Переключение статуса уведомления...');
    const toggleResponse = await axios.patch(`${BASE_URL}/budget-alerts/${alert.id}/toggle`, {
      user_id: user.id
    });
    console.log(`✅ Статус изменен: ${toggleResponse.data.message}\n`);

    // 7. Удаляем уведомление
    console.log('7. Удаление уведомления...');
    const deleteResponse = await axios.delete(`${BASE_URL}/budget-alerts/${alert.id}?user_id=${user.id}`);
    console.log(`✅ Уведомление удалено: ${deleteResponse.data.message}\n`);

    // 8. Проверяем, что уведомление удалено
    console.log('8. Проверка удаления...');
    const finalAlertsResponse = await axios.get(`${BASE_URL}/budget-alerts?user_id=${user.id}`);
    const finalAlerts = finalAlertsResponse.data;
    console.log(`✅ Финальная проверка: ${finalAlerts.length} уведомлений\n`);

    console.log('🎉 Все тесты прошли успешно!');

  } catch (error) {
    console.error('❌ Ошибка:', error.response?.data || error.message);
  }
}

testBudgetAlerts();
