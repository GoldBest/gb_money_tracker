FROM node:20-alpine

WORKDIR /app

# Устанавливаем системные зависимости
RUN apk add --no-cache python3 make g++

# Копируем package.json и package-lock.json
COPY backend/package*.json ./

# Устанавливаем только production зависимости (без SQLite)
RUN npm ci --omit=dev --ignore-scripts

# Копируем исходный код
COPY backend/ ./

# Устанавливаем pg для PostgreSQL
RUN npm install pg

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Меняем владельца файлов
RUN chown -R nodejs:nodejs /app
USER nodejs

# Открываем порт
EXPOSE 3001

# Запускаем приложение
CMD ["node", "server.js"]
