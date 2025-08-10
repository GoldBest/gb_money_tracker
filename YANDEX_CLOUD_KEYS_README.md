# Yandex Cloud - Настройка ключей

## Что создано

✅ **Сервисный аккаунт**: `aje1rlqa4l9tui4pf8s0`  
✅ **Ключ доступа**: `yandex-cloud-key.json`  
✅ **Folder ID**: `b1gdvm21sspiapg1g55p`  
✅ **Конфигурация**: `.env.production`

## Как использовать

### 1. Для CLI команд
```bash
# Экспорт переменных окружения
export YC_FOLDER_ID=b1gdvm21sspiapg1g55p
export YC_SA_ID=aje1rlqa4l9tui4pf8s0

# Использование ключа для аутентификации
yc config set service-account-key yandex-cloud-key.json
```

### 2. Для API вызовов
```bash
# Получение токена доступа
TOKEN=$(yc iam create-token --iam-key-file yandex-cloud-key.json)

# Использование токена в API запросах
curl -H "Authorization: Bearer $TOKEN" \
     https://resource-manager.api.cloud.yandex.net/resource-manager/v1/folders
```

### 3. Для деплоя
```bash
# Запуск автоматического скрипта настройки
./scripts/setup-yandex-cloud.sh

# Или ручное создание ресурсов
yc managed-postgresql cluster create --name gb-money-tracker-db ...
yc compute instance create --name gb-money-tracker ...
```

## Безопасность

⚠️ **ВАЖНО**: 
- Файл `yandex-cloud-key.json` содержит секретные данные
- Добавлен в `.gitignore` для предотвращения случайного коммита
- Храните ключ в безопасном месте
- Не передавайте ключ третьим лицам

## Следующие шаги

1. **Настройка прав доступа** для сервисного аккаунта
2. **Создание ресурсов** (PostgreSQL, Compute Instance)
3. **Настройка сети** и безопасности
4. **Деплой приложения**

## Полезные команды

```bash
# Проверка аутентификации
yc config list

# Список сервисных аккаунтов
yc iam service-account list

# Список ключей
yc iam key list --service-account-name gb-money-tracker

# Удаление ключа (если нужно)
yc iam key delete --id <key-id>
```

## Поддержка

При возникновении проблем:
1. Проверьте аутентификацию: `yc config list`
2. Убедитесь, что ключ действителен
3. Проверьте права доступа сервисного аккаунта
4. Обратитесь к документации Yandex Cloud

## 🚀 Статус деплоя Yandex Cloud

✅ **Сервер**: `62.84.114.186`  
✅ **Домен**: `gbmt.gbdev.ru`  
✅ **База данных**: PostgreSQL кластер `gb-money-tracker-db`  
✅ **Сеть**: `gb-money-tracker-network` с группой безопасности  
✅ **Скрипт деплоя**: `deploy-on-server.sh`  
✅ **SSL настройка**: `setup-ssl.sh`  
✅ **Инструкция**: `SERVER_CONNECTION_GUIDE.md`  

### Следующие шаги:
1. Подключитесь к серверу: `ssh ubuntu@62.84.114.186`
2. Запустите деплой: `./deploy-on-server.sh` (SSL настроится автоматически)
3. Настройте BOT_TOKEN в .env
4. Проверьте работу приложения по адресу: https://gbmt.gbdev.ru

## 🚀 Статус деплоя Yandex Cloud

✅ **Сервер**: 
✅ **База данных**: PostgreSQL кластер 
✅ **Сеть**:  с группой безопасности
✅ **Скрипт деплоя**: 
✅ **Инструкция**: 
