# Используем официальный образ Node.js 22
FROM node:22.17.1-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY .nvmrc ./

# Проверяем версию Node.js
RUN node --version && echo "✅ Node.js version confirmed: $(node --version)"

# Устанавливаем зависимости (максимально упрощенно)
RUN npm install

# Копируем исходный код
COPY . .

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Меняем владельца файлов
RUN chown -R nodejs:nodejs /app
USER nodejs

# Открываем порт
EXPOSE 3000

# Проверяем версию Node.js еще раз
RUN node --version && echo "✅ Final Node.js version check: $(node --version)"

# Устанавливаем переменные окружения
ENV NODE_VERSION=22.17.1
ENV NODE_ENV=production
ENV RAILWAY_ENVIRONMENT=production

# Запускаем приложение (исправлено)
CMD ["npm", "run", "start-simple"] 