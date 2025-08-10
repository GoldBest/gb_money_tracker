#!/bin/bash

echo "🧹 Очистка Docker для TG Money MiniApp..."

# Проверяем, что мы в правильной папке
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Ошибка: docker-compose.yml не найден. Убедитесь, что вы в корневой папке проекта."
    exit 1
fi

# Останавливаем приложение
echo "🛑 Останавливаю приложение..."
docker-compose down

# Удаляем volumes (осторожно - это удалит все данные!)
echo "⚠️  Удаляю volumes (все данные будут потеряны!)..."
read -p "Вы уверены? Это удалит все данные из базы данных! (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down -v
    echo "✅ Volumes удалены"
else
    echo "❌ Volumes не удалены"
fi

# Удаляем образы
echo "🗑️  Удаляю образы..."
docker rmi $(docker images -q gb-money-miniapp-backend) 2>/dev/null || echo "Образы уже удалены"

# Очистка Docker системы
echo "🧹 Очищаю Docker систему..."
docker system prune -f

echo "✅ Очистка завершена!"

echo ""
echo "💡 Для запуска приложения выполните: ./scripts/dev-docker.sh"
