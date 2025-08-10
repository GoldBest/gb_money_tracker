# 🚀 Автоматический деплой

Этот документ описывает, как настроить автоматический деплой вашего приложения при каждом push в main/master ветку.

## 📋 Что происходит при автодеплое

1. **Frontend** автоматически деплоится на Vercel
2. **Backend** автоматически деплоится на Railway
3. **Тесты** запускаются для проверки работоспособности
4. **Уведомления** отправляются в GitHub Actions

## 🛠️ Быстрая настройка

### Шаг 1: Запустите скрипт настройки

```bash
./scripts/quick-auto-deploy.sh
```

Этот скрипт:
- Проверит git статус
- Создаст необходимые папки
- Поможет закоммитить изменения
- Сделает push на GitHub

### Шаг 2: Настройте секреты

```bash
./scripts/setup-github-secrets.sh
```

Или настройте вручную в GitHub:
1. Перейдите в ваш репозиторий
2. Settings → Secrets and variables → Actions
3. Добавьте необходимые секреты

## 🔐 Необходимые секреты

### Vercel (Frontend)
- `VERCEL_TOKEN` - токен доступа к Vercel
- `VERCEL_PROJECT_ID` - ID проекта Vercel
- `VERCEL_ORG_ID` - ID организации Vercel

### Railway (Backend)
- `RAILWAY_TOKEN` - токен доступа к Railway
- `RAILWAY_SERVICE_NAME` - название сервиса backend

## 📁 Структура файлов

```
.github/
└── workflows/
    └── deploy.yml          # GitHub Actions workflow

scripts/
├── quick-auto-deploy.sh    # Быстрая настройка
├── setup-github-secrets.sh # Настройка секретов
└── deploy-all.sh           # Ручной деплой

frontend/
├── vercel.json             # Конфигурация Vercel
└── package.json

backend/
└── package.json
```

## 🚀 Как это работает

### GitHub Actions Workflow

```yaml
name: 🚀 Auto Deploy

on:
  push:
    branches: [ main, master ]

jobs:
  deploy-frontend:
    # Деплой на Vercel
  deploy-backend:
    # Деплой на Railway
  test:
    # Запуск тестов
```

### Триггеры

- **Push в main/master** → Автоматический деплой
- **Pull Request** → Только тесты (без деплоя)
- **Другие ветки** → Ничего не происходит

## 📊 Мониторинг

### GitHub Actions
- Перейдите в: `https://github.com/USERNAME/REPO/actions`
- Следите за статусом деплоя
- Просматривайте логи выполнения

### Vercel Dashboard
- Перейдите в: `https://vercel.com/dashboard`
- Проверьте статус деплоя frontend
- Просматривайте логи и метрики

### Railway Dashboard
- Перейдите в: `https://railway.app/dashboard`
- Проверьте статус деплоя backend
- Мониторьте ресурсы и логи

## 🔧 Ручной деплой

Если нужно развернуть вручную:

```bash
# Деплой всего
./scripts/deploy-all.sh

# Только frontend
./scripts/deploy-vercel.sh

# Только backend
./scripts/deploy-railway.sh
```

## 🚨 Устранение проблем

### GitHub Actions не запускается
1. Проверьте, что файл `.github/workflows/deploy.yml` существует
2. Убедитесь, что push сделан в main/master ветку
3. Проверьте права доступа к репозиторию

### Ошибки деплоя
1. Проверьте логи в GitHub Actions
2. Убедитесь, что все секреты настроены правильно
3. Проверьте статус сервисов Vercel/Railway

### Секреты не работают
1. Проверьте названия секретов (должны точно совпадать)
2. Убедитесь, что токены не истекли
3. Проверьте права доступа токенов

## 📝 Полезные команды

```bash
# Проверить статус GitHub Actions
gh run list

# Посмотреть логи последнего запуска
gh run view --log

# Перезапустить failed workflow
gh run rerun <run-id>

# Проверить секреты
gh secret list
```

## 🎯 Лучшие практики

1. **Всегда тестируйте локально** перед push
2. **Используйте feature branches** для разработки
3. **Делайте merge только через Pull Request**
4. **Мониторьте логи деплоя** после каждого push
5. **Настройте уведомления** о статусе деплоя

## 🆘 Поддержка

Если что-то не работает:

1. Проверьте логи GitHub Actions
2. Убедитесь, что все секреты настроены
3. Проверьте статус внешних сервисов
4. Создайте Issue в репозитории

---

## ✅ Готово!

После настройки ваш workflow будет выглядеть так:

1. **Push в main/master** → 🚀
2. **GitHub Actions запускается** → ⚡
3. **Frontend деплоится на Vercel** → 🌐
4. **Backend деплоится на Railway** → 🚂
5. **Тесты проходят** → ✅
6. **Деплой завершен** → 🎉

**Теперь каждое изменение будет автоматически развернуто!** 🚀
