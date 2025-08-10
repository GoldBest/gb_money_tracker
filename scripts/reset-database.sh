#!/bin/bash

echo "🗄️  Сброс базы данных TG Money MiniApp для нового пользователя"
echo "=========================================================="
echo ""

# Проверяем, что мы в правильной папке
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Ошибка: docker-compose.yml не найден. Убедитесь, что вы в корневой папке проекта."
    exit 1
fi

# Проверяем, существует ли база данных
if [ ! -f "backend/money.db" ]; then
    echo "❌ Ошибка: backend/money.db не найден."
    exit 1
fi

echo "📊 Текущее состояние базы данных:"
sqlite3 backend/money.db "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'transactions', COUNT(*) FROM transactions UNION ALL SELECT 'categories', COUNT(*) FROM categories UNION ALL SELECT 'budget_alerts', COUNT(*) FROM budget_alerts UNION ALL SELECT 'backups', COUNT(*) FROM backups;"

echo ""
echo "⚠️  ВНИМАНИЕ: Это действие удалит ВСЕ данные пользователей!"
echo "   - Транзакции"
echo "   - Пользователи"
echo "   - Бюджетные уведомления"
echo "   - Резервные копии"
echo "   - Пользовательские категории"
echo ""

read -p "Вы уверены, что хотите продолжить? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Операция отменена"
    exit 0
fi

# Создаем резервную копию
echo "💾 Создаю резервную копию..."
backup_file="backend/money.db.backup.$(date +%Y%m%d_%H%M%S)"
cp backend/money.db "$backup_file"
echo "✅ Резервная копия создана: $backup_file"

# Останавливаем приложение, если оно запущено
echo "🛑 Останавливаю приложение..."
docker-compose down 2>/dev/null || echo "Приложение не было запущено"

# Очищаем данные пользователей
echo "🧹 Очищаю данные пользователей..."
sqlite3 backend/money.db << 'EOF'
DELETE FROM transactions;
DELETE FROM budget_alerts;
DELETE FROM backups;
DELETE FROM users;
DELETE FROM categories WHERE user_id IS NOT NULL;
VACUUM;
EOF

echo "✅ Данные очищены"

# Проверяем результат
echo ""
echo "📊 Состояние базы данных после очистки:"
sqlite3 backend/money.db "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'transactions', COUNT(*) FROM transactions UNION ALL SELECT 'categories', COUNT(*) FROM categories UNION ALL SELECT 'budget_alerts', COUNT(*) FROM budget_alerts UNION ALL SELECT 'backups', COUNT(*) FROM backups;"

echo ""
echo "🎉 База данных готова для нового пользователя!"
echo ""
echo "💡 Что произошло:"
echo "   ✅ Все данные пользователей удалены"
echo "   ✅ Структура таблиц сохранена"
echo "   ✅ База данных оптимизирована (VACUUM)"
echo "   ✅ Резервная копия создана"
echo ""
echo "🚀 Теперь можно запускать приложение:"
echo "   ./scripts/dev-docker.sh"
echo ""
echo "📁 Резервная копия: $backup_file"
echo "🔒 Для восстановления: cp $backup_file backend/money.db"
