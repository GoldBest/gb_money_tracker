#!/bin/bash

echo "🚀 Деплой TG Money MiniApp на сервер..."

# Обновляем систему
echo "📦 Обновляем систему..."
sudo apt update && sudo apt upgrade -y

# Устанавливаем необходимые пакеты
echo "🔧 Устанавливаем необходимые пакеты..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Устанавливаем Docker
echo "🐳 Устанавливаем Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker установлен"
else
    echo "✅ Docker уже установлен"
fi

# Устанавливаем Docker Compose
echo "📋 Устанавливаем Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose установлен"
else
    echo "✅ Docker Compose уже установлен"
fi

# Устанавливаем Node.js и npm
echo "📦 Устанавливаем Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js установлен"
else
    echo "✅ Node.js уже установлен"
fi

# Устанавливаем Nginx
echo "🌐 Устанавливаем Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    echo "✅ Nginx установлен"
else
    echo "✅ Nginx уже установлен"
fi

# Создаем директорию для приложения
echo "📁 Создаем директорию для приложения..."
APP_DIR="/opt/tg-money-miniapp"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Клонируем репозиторий (если не существует)
if [ ! -d "$APP_DIR/.git" ]; then
    echo "📥 Клонируем репозиторий..."
    cd $APP_DIR
    git clone https://github.com/your-username/tg-money-miniapp.git .
else
    echo "✅ Репозиторий уже существует, обновляем..."
    cd $APP_DIR
    git pull origin master
fi

# Создаем .env файл для production
echo "🔧 Создаем .env для production..."
cat > .env << EOF
# Production Environment
NODE_ENV=production
BOT_TOKEN=your_bot_token_here

# Database
DATABASE_URL=postgresql://gbuser:SecurePass123@rc1a-v0qg4dfjnrbn7kqm.mdb.yandexcloud.net:6432/gbmoneytracker

# Yandex Cloud
YC_FOLDER_ID=b1gdvm21sspiapg1g55p
YC_SA_ID=aje1rlqa4l9tui4pf8s0
YC_SA_KEY_FILE=yandex-cloud-key.json
EXTERNAL_IP=62.84.114.186
EOF

# Собираем frontend
echo "🏗️ Собираем frontend..."
cd frontend
npm install
npm run build
cd ..

# Настраиваем Nginx
echo "🌐 Настраиваем Nginx..."
sudo tee /etc/nginx/sites-available/tg-money-miniapp > /dev/null << 'EOF'
server {
    listen 80;
    server_name 62.84.114.186;

    # Frontend
    location / {
        root /opt/tg-money-miniapp/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Активируем сайт
sudo ln -sf /etc/nginx/sites-available/tg-money-miniapp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Создаем systemd сервис для backend
echo "🔧 Создаем systemd сервис для backend..."
sudo tee /etc/systemd/system/tg-money-backend.service > /dev/null << 'EOF'
[Unit]
Description=TG Money MiniApp Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/tg-money-miniapp/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Перезагружаем systemd и запускаем сервис
sudo systemctl daemon-reload
sudo systemctl enable tg-money-backend
sudo systemctl start tg-money-backend

# Проверяем статус
echo "📊 Проверяем статус сервисов..."
echo "Nginx status:"
sudo systemctl status nginx --no-pager -l
echo ""
echo "Backend status:"
sudo systemctl status tg-money-backend --no-pager -l

# Создаем скрипт для обновления
echo "📝 Создаем скрипт для обновления..."
cat > update-app.sh << 'EOF'
#!/bin/bash
echo "🔄 Обновление приложения..."
cd /opt/tg-money-miniapp
git pull origin master

# Обновляем frontend
cd frontend
npm install
npm run build
cd ..

# Перезапускаем backend
sudo systemctl restart tg-money-backend

# Перезагружаем Nginx
sudo systemctl reload nginx

echo "✅ Приложение обновлено!"
EOF

chmod +x update-app.sh

echo ""
echo "🎯 Деплой завершен!"
echo ""
echo "📋 Что настроено:"
echo "✅ Docker и Docker Compose"
echo "✅ Node.js и npm"
echo "✅ Nginx (прокси + статика)"
echo "✅ Systemd сервис для backend"
echo "✅ Автоматический запуск при перезагрузке"
echo "✅ Скрипт обновления: ./update-app.sh"
echo ""
echo "🌐 Доступные URL:"
echo "Frontend: http://62.84.114.186"
echo "Backend API: http://62.84.114.186/api"
echo "Health check: http://62.84.114.186/health"
echo ""
echo "🔧 Управление:"
echo "Проверить статус: sudo systemctl status tg-money-backend"
echo "Перезапустить: sudo systemctl restart tg-money-backend"
echo "Логи: sudo journalctl -u tg-money-backend -f"
echo ""
echo "⚠️ Не забудьте:"
echo "1. Настроить BOT_TOKEN в .env"
echo "2. Проверить подключение к базе данных"
echo "3. Настроить SSL сертификат (Let's Encrypt)"
