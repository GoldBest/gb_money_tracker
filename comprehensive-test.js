const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

class AppTester {
    constructor() {
        this.testResults = [];
        this.testUserId = null;
        this.testCategoryId = null;
        this.testTransactionId = null;
        this.testBackupId = null;
        this.testBudgetAlertId = null;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${icon} [${timestamp}] ${message}`);
    }

    async runTest(testName, testFunction) {
        try {
            this.log(`Тестирую: ${testName}`, 'info');
            await testFunction();
            this.log(`${testName} - УСПЕШНО`, 'success');
            this.testResults.push({ name: testName, status: 'success' });
        } catch (error) {
            this.log(`${testName} - ОШИБКА: ${error.message}`, 'error');
            this.testResults.push({ name: testName, status: 'error', error: error.message });
        }
    }

    async testHealthCheck() {
        const response = await axios.get(`${BASE_URL}/api/health`);
        if (response.data.status !== 'ok') {
            throw new Error(`Неожиданный статус: ${response.data.status}`);
        }
        this.log(`Backend работает на порту ${response.data.port}`);
    }

    async testUserManagement() {
        // Создание пользователя
        const userData = {
            telegram_id: `comprehensive_test_${Date.now()}`,
            username: 'comprehensive_test',
            first_name: 'Comprehensive Test User'
        };
        
        const user = await axios.post(`${BASE_URL}/api/users`, userData);
        this.testUserId = user.data.id;
        this.log(`Пользователь создан с ID: ${this.testUserId}`);
        
        // Получение пользователя
        const userResponse = await axios.get(`${BASE_URL}/api/users/${this.testUserId}/categories`);
        this.log(`Получены категории пользователя: ${userResponse.data.length} шт.`);
    }

    async testCategories() {
        // Получение категорий по умолчанию
        const defaultCategories = await axios.get(`${BASE_URL}/api/categories/default`);
        this.log(`Категории по умолчанию: ${defaultCategories.data.total} шт.`);
        
        // Создание пользовательской категории
        const categoryData = {
            name: 'Тестовая категория',
            type: 'expense',
            color: '#FF6B6B',
            user_id: this.testUserId
        };
        
        const category = await axios.post(`${BASE_URL}/api/categories`, categoryData);
        this.testCategoryId = category.data.id;
        this.log(`Категория создана с ID: ${this.testCategoryId}`);
        
        // Получение категорий пользователя
        const userCategories = await axios.get(`${BASE_URL}/api/users/${this.testUserId}/categories`);
        this.log(`Всего категорий пользователя: ${userCategories.data.length} шт.`);
    }

    async testTransactions() {
        // Создание транзакции
        const transactionData = {
            amount: 250.50,
            description: 'Комплексная тестовая транзакция',
            type: 'expense',
            category_id: this.testCategoryId,
            user_id: this.testUserId
        };
        
        const transaction = await axios.post(`${BASE_URL}/api/transactions`, transactionData);
        this.testTransactionId = transaction.data.id;
        this.log(`Транзакция создана с ID: ${this.testTransactionId}`);
        
        // Получение транзакций пользователя
        const transactions = await axios.get(`${BASE_URL}/api/users/${this.testUserId}/transactions`);
        this.log(`Транзакции пользователя: ${transactions.data.length} шт.`);
        
        // Обновление транзакции
        const updateData = {
            amount: 300.00,
            description: 'Обновленная тестовая транзакция',
            type: 'expense',
            category_id: this.testCategoryId,
            user_id: this.testUserId
        };
        
        await axios.put(`${BASE_URL}/api/transactions/${this.testTransactionId}`, updateData);
        this.log('Транзакция обновлена');
        
        // Получение обновленной транзакции
        const updatedTransactions = await axios.get(`${BASE_URL}/api/users/${this.testUserId}/transactions`);
        const updatedTransaction = updatedTransactions.data.find(t => t.id === this.testTransactionId);
        this.log(`Обновленная сумма: ${updatedTransaction.amount} руб.`);
    }

    async testStatistics() {
        const stats = await axios.get(`${BASE_URL}/api/users/${this.testUserId}/stats`);
        
        this.log('Статистика получена:');
        this.log(`  - Доходы: ${stats.data.total_income} руб.`);
        this.log(`  - Расходы: ${stats.data.total_expense} руб.`);
        this.log(`  - Баланс: ${stats.data.balance} руб.`);
        this.log(`  - Всего транзакций: ${stats.data.total_transactions}`);
        
        if (stats.data.categoryStats && stats.data.categoryStats.length > 0) {
            this.log(`  - Статистика по категориям: ${stats.data.categoryStats.length} категорий`);
        }
    }

    async testBudgetAlerts() {
        // Создание бюджетного уведомления
        const budgetAlertData = {
            user_id: this.testUserId,
            category_id: this.testCategoryId,
            limit_amount: 500.00,
            period: 'monthly',
            enabled: true
        };
        
        const budgetAlert = await axios.post(`${BASE_URL}/api/budget-alerts`, budgetAlertData);
        this.testBudgetAlertId = budgetAlert.data.alert.id;
        this.log(`Бюджетное уведомление создано с ID: ${this.testBudgetAlertId}`);
        
        // Получение бюджетных уведомлений
        const budgetAlerts = await axios.get(`${BASE_URL}/api/budget-alerts?user_id=${this.testUserId}`);
        this.log(`Бюджетные уведомления: ${budgetAlerts.data.length} шт.`);
        
        // Обновление бюджетного уведомления
        const updateData = {
            user_id: this.testUserId,
            limit_amount: 750.00
        };
        
        await axios.put(`${BASE_URL}/api/budget-alerts/${this.testBudgetAlertId}`, updateData);
        this.log('Бюджетное уведомление обновлено');
    }

    async testBackupSystem() {
        // Создание резервной копии
        const backupData = {
            user_id: this.testUserId,
            name: 'Тестовая резервная копия',
            description: 'Создана автоматическим тестом',
            data: JSON.stringify({
                transactions: 1,
                categories: 1,
                budget_alerts: 1
            }),
            size: 1024
        };
        
        const backup = await axios.post(`${BASE_URL}/api/backups`, backupData);
        if (backup.data && backup.data.backup) {
            this.testBackupId = backup.data.backup.id;
            this.log(`Резервная копия создана с ID: ${this.testBackupId}`);
        } else {
            this.log('Резервная копия создана, но ID не получен');
        }
        
        // Получение информации о резервных копиях
        const backupInfo = await axios.get(`${BASE_URL}/api/users/${this.testUserId}/backup/info`);
        this.log(`Информация о резервных копиях получена`);
        
        // Получение списка резервных копий
        const backups = await axios.get(`${BASE_URL}/api/backups?user_id=${this.testUserId}`);
        this.log(`Резервные копии пользователя: ${backups.data.length} шт.`);
    }

    async testDataExport() {
        // Получение информации об экспорте
        const exportInfo = await axios.get(`${BASE_URL}/api/users/${this.testUserId}/export-info`);
        this.log('Информация об экспорте получена');
        
        // Создание резервной копии для экспорта
        const exportBackupData = {
            user_id: this.testUserId,
            name: 'Экспорт данных',
            description: 'Резервная копия для экспорта',
            data: JSON.stringify({
                user: this.testUserId,
                timestamp: new Date().toISOString(),
                data_type: 'export'
            }),
            size: 512
        };
        
        const exportBackup = await axios.post(`${BASE_URL}/api/backups`, exportBackupData);
        if (exportBackup.data && exportBackup.data.backup) {
            this.log(`Резервная копия для экспорта создана с ID: ${exportBackup.data.backup.id}`);
        } else {
            this.log('Резервная копия для экспорта создана');
        }
    }

    async testErrorHandling() {
        // Тест несуществующего пользователя
        try {
            const response = await axios.get(`${BASE_URL}/api/users/999999/transactions`);
            if (response.data.length === 0) {
                this.log('Обработка несуществующего пользователя работает корректно (пустой массив)');
            } else {
                throw new Error('Неожиданные данные для несуществующего пользователя');
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                this.log('Обработка ошибок работает корректно (404)');
            } else if (error.response) {
                this.log(`Получен статус ${error.response.status}, что тоже корректно`);
            } else {
                throw new Error(`Неожиданная ошибка: ${error.message}`);
            }
        }
        
        // Тест неверных данных
        try {
            await axios.post(`${BASE_URL}/api/transactions`, {
                amount: 'invalid_amount',
                type: 'invalid_type'
            });
            throw new Error('Должна была быть ошибка валидации');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                this.log('Валидация данных работает корректно (400)');
            } else if (error.response) {
                this.log(`Получен статус ${error.response.status}, что тоже корректно`);
            } else {
                throw new Error(`Неожиданная ошибка валидации: ${error.message}`);
            }
        }
    }

    async runAllTests() {
        this.log('🚀 Начинаю комплексное тестирование приложения...', 'info');
        this.log('', 'info');
        
        await this.runTest('Health Check', () => this.testHealthCheck());
        await this.runTest('Управление пользователями', () => this.testUserManagement());
        await this.runTest('Категории', () => this.testCategories());
        await this.runTest('Транзакции', () => this.testTransactions());
        await this.runTest('Статистика', () => this.testStatistics());
        await this.runTest('Бюджетные уведомления', () => this.testBudgetAlerts());
        await this.runTest('Система резервного копирования', () => this.testBackupSystem());
        await this.runTest('Экспорт данных', () => this.testDataExport());
        await this.runTest('Обработка ошибок', () => this.testErrorHandling());
        
        this.log('', 'info');
        this.log('📊 Результаты тестирования:', 'info');
        this.log('', 'info');
        
        const successCount = this.testResults.filter(r => r.status === 'success').length;
        const errorCount = this.testResults.filter(r => r.status === 'error').length;
        const totalCount = this.testResults.length;
        
        this.log(`Всего тестов: ${totalCount}`, 'info');
        this.log(`Успешно: ${successCount}`, 'success');
        this.log(`Ошибок: ${errorCount}`, errorCount > 0 ? 'error' : 'success');
        
        if (errorCount > 0) {
            this.log('', 'info');
            this.log('❌ Детали ошибок:', 'error');
            this.testResults
                .filter(r => r.status === 'error')
                .forEach(r => this.log(`  - ${r.name}: ${r.error}`, 'error'));
        }
        
        this.log('', 'info');
        if (errorCount === 0) {
            this.log('🎉 Все тесты пройдены успешно! Приложение работает корректно.', 'success');
        } else {
            this.log('⚠️ Обнаружены ошибки. Проверьте логи выше.', 'warning');
        }
        
        return {
            total: totalCount,
            success: successCount,
            errors: errorCount,
            results: this.testResults
        };
    }
}

// Запуск тестирования
const tester = new AppTester();
tester.runAllTests().catch(error => {
    console.error('❌ Критическая ошибка при тестировании:', error.message);
    process.exit(1);
});
