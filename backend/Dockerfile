FROM node:20-alpine

WORKDIR /app

# Устанавливаем системные зависимости
RUN apk add --no-cache python3 make g++

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Создаем пользователя nodejs
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Меняем владельца файлов
RUN chown -R nodejs:nodejs /app
USER nodejs

# Открываем порт
EXPOSE 3001

# Запускаем приложение
CMD ["node", "server.js"]
