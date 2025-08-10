#!/bin/bash

echo "🔒 Настройка SSL сертификата для gbmt.gbdev.ru..."

# Проверяем, что домен указывает на сервер
echo "🌐 Проверяем DNS..."
if ! nslookup gbmt.gbdev.ru | grep -q "62.84.114.186"; then
    echo "❌ Домен gbmt.gbdev.ru не указывает на IP 62.84.114.186"
    echo "Убедитесь, что DNS настроен правильно перед продолжением"
    exit 1
fi

echo "✅ DNS настроен правильно"

# Устанавливаем Certbot
echo "📦 Устанавливаем Certbot..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Создаем временную конфигурацию Nginx для получения сертификата
echo "🔧 Создаем временную конфигурацию Nginx..."
sudo tee /etc/nginx/sites-available/tg-money-miniapp-temp > /dev/null << 'EOF'
server {
    listen 80;
    server_name gbmt.gbdev.ru;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}
EOF

# Активируем временную конфигурацию
sudo ln -sf /etc/nginx/sites-available/tg-money-miniapp-temp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/tg-money-miniapp

# Проверяем и перезагружаем Nginx
echo "🔄 Перезагружаем Nginx..."
sudo nginx -t
sudo systemctl reload nginx

# Получаем SSL сертификат
echo "📜 Получаем SSL сертификат от Let's Encrypt..."
sudo certbot certonly --webroot -w /var/www/html -d gbmt.gbdev.ru --non-interactive --agree-tos --email admin@gbdev.ru

if [ $? -eq 0 ]; then
    echo "✅ SSL сертификат успешно получен!"
    
    # Возвращаем основную конфигурацию
    echo "🔧 Возвращаем основную конфигурацию Nginx..."
    sudo rm -f /etc/nginx/sites-enabled/tg-money-miniapp-temp
    sudo ln -sf /etc/nginx/sites-available/tg-money-miniapp /etc/nginx/sites-enabled/
    
    # Проверяем и перезагружаем Nginx
    sudo nginx -t
    sudo systemctl reload nginx
    
    # Настраиваем автоматическое обновление
    echo "🔄 Настраиваем автоматическое обновление SSL..."
    sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet && sudo systemctl reload nginx"; } | sudo crontab -
    
    echo ""
    echo "🎉 SSL настройка завершена!"
    echo "🌐 Доступные URL:"
    echo "   Frontend: https://gbmt.gbdev.ru"
    echo "   Backend API: https://gbmt.gbdev.ru/api"
    echo "   Health check: https://gbmt.gbdev.ru/health"
    echo ""
    echo "🔒 Проверить статус сертификата: sudo certbot certificates"
    echo "🔄 Тестовое обновление: sudo certbot renew --dry-run"
    
else
    echo "❌ Ошибка при получении SSL сертификата"
    echo "Проверьте логи: sudo journalctl -u nginx"
    exit 1
fi
