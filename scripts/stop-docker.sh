#!/bin/bash

echo "🛑 Остановка TG Money MiniApp..."

# Проверяем, что мы в правильной папке
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Ошибка: docker-compose.yml не найден. Убедитесь, что вы в корневой папке проекта."
    exit 1
fi

# Останавливаем приложение
echo "⏹️  Останавливаю контейнеры..."
docker-compose down

echo "✅ Приложение остановлено!"

# Показываем статус
echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "💡 Для запуска приложения выполните: ./scripts/dev-docker.sh"
