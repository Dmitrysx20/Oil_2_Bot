#!/bin/bash

# Скрипт для быстрого развертывания Aroma Helper Bot

set -e

echo "🌿 Развертывание Aroma Helper Bot..."

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo "❌ Файл .env не найден!"
    echo "📝 Скопируйте env.example в .env и заполните переменные:"
    echo "   cp env.example .env"
    exit 1
fi

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен!"
    echo "📥 Установите Node.js версии 18+: https://nodejs.org/"
    exit 1
fi

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен!"
    exit 1
fi

echo "✅ Проверки пройдены"

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install

# Проверка переменных окружения
echo "🔧 Проверка переменных окружения..."
source .env

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN не установлен в .env"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY не установлен в .env"
    exit 1
fi

if [ -z "$SUPABASE_URL" ]; then
    echo "❌ SUPABASE_URL не установлен в .env"
    exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ SUPABASE_ANON_KEY не установлен в .env"
    exit 1
fi

echo "✅ Переменные окружения настроены"

# Создание папки для логов
mkdir -p logs

# Запуск приложения
echo "🚀 Запуск приложения..."
echo "📱 Бот будет доступен на порту ${PORT:-3000}"
echo "🔗 Health check: http://localhost:${PORT:-3000}/health"

# Проверка режима запуска
if [ "$1" = "docker" ]; then
    echo "🐳 Запуск в Docker..."
    docker-compose up -d
    echo "✅ Приложение запущено в Docker"
    echo "📊 Логи: docker-compose logs -f aroma-bot"
elif [ "$1" = "pm2" ]; then
    echo "⚡ Запуск с PM2..."
    if ! command -v pm2 &> /dev/null; then
        echo "📥 Установка PM2..."
        npm install -g pm2
    fi
    pm2 start src/index.js --name "aroma-bot"
    pm2 save
    pm2 startup
    echo "✅ Приложение запущено с PM2"
    echo "📊 Логи: pm2 logs aroma-bot"
else
    echo "🔄 Запуск в режиме разработки..."
    npm run dev
fi

echo ""
echo "🎉 Развертывание завершено!"
echo ""
echo "📋 Полезные команды:"
echo "   npm run dev     - режим разработки"
echo "   npm start       - продакшн режим"
echo "   npm test        - запуск тестов"
echo "   npm run lint    - проверка кода"
echo ""
echo "🐳 Docker команды:"
echo "   docker-compose up -d    - запуск в Docker"
echo "   docker-compose down     - остановка Docker"
echo "   docker-compose logs     - просмотр логов"
echo ""
echo "⚡ PM2 команды:"
echo "   pm2 start src/index.js --name aroma-bot"
echo "   pm2 stop aroma-bot"
echo "   pm2 restart aroma-bot"
echo "   pm2 logs aroma-bot"
echo ""
echo "🌿 Приятного использования ароматерапии!" 