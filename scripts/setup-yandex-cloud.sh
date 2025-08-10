#!/bin/bash

echo "🚀 Настройка Yandex Cloud для TG Money MiniApp..."

# Проверяем, что yc установлен
if ! command -v yc &> /dev/null; then
    echo "❌ Yandex Cloud CLI не установлен"
    echo "Установите его: curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash"
    exit 1
fi

# Проверяем аутентификацию
if ! yc config list &> /dev/null; then
    echo "❌ Не настроена аутентификация Yandex Cloud"
    echo "Выполните: yc init"
    exit 1
fi

echo "✅ Yandex Cloud CLI настроен"

# Получаем Folder ID
echo "📁 Получаю Folder ID..."
FOLDER_ID=$(yc config get folder-id)
if [ -z "$FOLDER_ID" ]; then
    echo "❌ Folder ID не найден"
    exit 1
fi
echo "✅ Folder ID: $FOLDER_ID"

# Создаем или получаем существующий сервисный аккаунт
echo "👤 Проверяю существующий сервисный аккаунт..."
SA_NAME="gb-money-tracker"
SA_ID=$(yc iam service-account list --format json | jq -r '.[] | select(.name == "'$SA_NAME'") | .id')

if [ -z "$SA_ID" ] || [ "$SA_ID" = "null" ]; then
    echo "📝 Создаю новый сервисный аккаунт..."
    SA_ID=$(yc iam service-account create --name $SA_NAME --description "Service account for TG Money MiniApp" --format json | jq -r '.id')
    
    if [ -z "$SA_ID" ] || [ "$SA_ID" = "null" ]; then
        echo "❌ Не удалось создать сервисный аккаунт"
        exit 1
    fi
    echo "✅ Новый сервисный аккаунт создан: $SA_ID"
else
    echo "✅ Использую существующий сервисный аккаунт: $SA_ID"
fi

# Создаем ключ для сервисного аккаунта
echo "🔑 Проверяю существующий ключ..."
KEY_FILE="yandex-cloud-key.json"

if [ -f "$KEY_FILE" ]; then
    echo "✅ Использую существующий ключ: $KEY_FILE"
else
    echo "📝 Создаю новый ключ..."
    yc iam key create --service-account-name $SA_NAME --output $KEY_FILE
    
    if [ ! -f "$KEY_FILE" ]; then
        echo "❌ Не удалось создать ключ"
        exit 1
    fi
    echo "✅ Новый ключ создан: $KEY_FILE"
fi

# Создаем Managed PostgreSQL
echo "🗄️ Создаю Managed PostgreSQL..."
DB_NAME="gb-money-tracker-db"
yc managed-postgresql cluster create \
    --name $DB_NAME \
    --description "База данных для TG Money MiniApp" \
    --environment production \
    --network-name default \
    --resource-preset s2.micro \
    --disk-size 10 \
    --disk-type network-ssd \
    --host zone-id=ru-central1-a,subnet-name=default-ru-central1-a

echo "✅ PostgreSQL кластер создан: $DB_NAME"

# Создаем Compute Instance
echo "🖥️ Создаю Compute Instance..."
INSTANCE_NAME="gb-money-tracker"
yc compute instance create \
    --name $INSTANCE_NAME \
    --description "TG Money MiniApp Server" \
    --zone-id ru-central1-a \
    --platform standard-v3 \
    --cores 2 \
    --memory 4GB \
    --network-interface subnet-name=default-ru-central1-a,nat-ip-version=ipv4 \
    --create-boot-disk size=20GB,type=network-ssd,image-folder-id=standard-images,image-family=ubuntu-2004-lts

echo "✅ Compute Instance создан: $INSTANCE_NAME"

# Получаем внешний IP
echo "🌐 Получаю внешний IP..."
EXTERNAL_IP=$(yc compute instance get $INSTANCE_NAME --format json | jq -r '.network_interfaces[0].primary_v4_address.one_to_one_nat.address')

if [ -z "$EXTERNAL_IP" ] || [ "$EXTERNAL_IP" = "null" ]; then
    echo "❌ Не удалось получить внешний IP"
    exit 1
fi

echo "✅ Внешний IP: $EXTERNAL_IP"

# Создаем .env файл для production
echo "🔧 Создаю .env для production..."
cat > .env.production << EOF
# Yandex Cloud Production Environment
NODE_ENV=production
BOT_TOKEN=your_bot_token_here

# Database (заполните после создания БД)
DATABASE_URL=postgresql://username:password@host:6432/gbmoneytracker

# Yandex Cloud
YC_FOLDER_ID=$FOLDER_ID
YC_SA_ID=$SA_ID
YC_SA_KEY_FILE=$KEY_FILE
EXTERNAL_IP=$EXTERNAL_IP
EOF

echo "✅ .env.production создан"

# Создаем скрипт для деплоя на сервер
echo "📝 Создаю скрипт деплоя на сервер..."
cat > deploy-on-server.sh << 'EOF'
#!/bin/bash

echo "🚀 Деплой TG Money MiniApp на сервер..."

# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Устанавливаем Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Клонируем репозиторий
git clone https://github.com/your-username/tg-money-miniapp.git
cd tg-money-tracker

# Собираем frontend
cd frontend && npm run build && cd ..

# Запускаем приложение
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Приложение запущено!"
echo "🌐 Frontend: http://$(curl -s ifconfig.me)"
echo "🔧 Backend: http://$(curl -s ifconfig.me):3001"
EOF

chmod +x deploy-on-server.sh

echo ""
echo "🎯 Настройка Yandex Cloud завершена!"
echo ""
echo "📋 Что создано:"
echo "✅ Сервисный аккаунт: $SA_ID"
echo "✅ PostgreSQL кластер: $DB_NAME"
echo "✅ Compute Instance: $INSTANCE_NAME"
echo "✅ Внешний IP: $EXTERNAL_IP"
echo "✅ Ключ: $KEY_FILE"
echo "✅ .env.production"
echo "✅ deploy-on-server.sh"
echo ""
echo "🚀 Следующие шаги:"
echo "1. Подключитесь к серверу: ssh ubuntu@$EXTERNAL_IP"
echo "2. Запустите деплой: ./deploy-on-server.sh"
echo "3. Настройте BOT_TOKEN в .env"
echo "4. Настройте DATABASE_URL после создания БД"
echo ""
echo "📚 Подробная инструкция: docs/YANDEX_DEPLOYMENT_GUIDE.md"
