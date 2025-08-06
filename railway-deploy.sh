#!/bin/bash

# Скрипт для развертывания Aroma Helper Bot на Railway

set -e

echo "🚂 Развертывание на Railway..."

# Проверка наличия Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📥 Установка Railway CLI..."
    npm install -g @railway/cli
fi

# Проверка авторизации
if ! railway whoami &> /dev/null; then
    echo "🔐 Авторизация в Railway..."
    railway login
fi

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo "❌ Файл .env не найден!"
    echo "📝 Создайте .env файл с переменными окружения:"
    echo "   cp env.example .env"
    echo "   # Отредактируйте .env файл"
    exit 1
fi

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

# Проверка Git репозитория
if [ ! -d .git ]; then
    echo "❌ Git репозиторий не инициализирован!"
    echo "📝 Выполните:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Проверка удаленного репозитория
if ! git remote get-url origin &> /dev/null; then
    echo "❌ Удаленный репозиторий не настроен!"
    echo "📝 Добавьте удаленный репозиторий:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/aroma-helper-bot.git"
    exit 1
fi

echo "✅ Git репозиторий настроен"

# Отправка изменений в GitHub
echo "📤 Отправка изменений в GitHub..."
git add .
git commit -m "feat: prepare for Railway deployment" || echo "Нет изменений для коммита"
git push origin main

# Развертывание на Railway
echo "🚂 Развертывание на Railway..."

# Проверка существования проекта
if railway projects &> /dev/null; then
    echo "📋 Существующие проекты Railway:"
    railway projects
    echo ""
    echo "💡 Если проект уже существует, используйте:"
    echo "   railway link"
    echo "   railway up"
else
    echo "🆕 Создание нового проекта Railway..."
    railway init
fi

# Установка переменных окружения
echo "🔧 Установка переменных окружения..."
railway variables set TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN"
railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"
railway variables set SUPABASE_URL="$SUPABASE_URL"
railway variables set SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
railway variables set PORT=3000
railway variables set NODE_ENV=production

# Развертывание
echo "🚀 Запуск развертывания..."
railway up

# Получение URL
echo "🔗 Получение URL приложения..."
RAILWAY_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)

if [ -n "$RAILWAY_URL" ]; then
    echo "✅ Приложение развернуто: $RAILWAY_URL"
    
    # Настройка webhook
    echo "🔗 Настройка Telegram webhook..."
    curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
      -H "Content-Type: application/json" \
      -d "{\"url\":\"$RAILWAY_URL/webhook\"}"
    
    echo ""
    echo "🎉 Развертывание завершено!"
    echo ""
    echo "📱 URL приложения: $RAILWAY_URL"
    echo "🔗 Health check: $RAILWAY_URL/health"
    echo ""
    echo "📋 Полезные команды:"
    echo "   railway logs          - просмотр логов"
    echo "   railway status        - статус приложения"
    echo "   railway open          - открыть приложение"
    echo "   railway variables     - управление переменными"
    echo ""
    echo "🌿 Протестируйте бота, отправив /start"
else
    echo "❌ Не удалось получить URL приложения"
    echo "💡 Проверьте логи: railway logs"
fi

echo ""
echo "📚 Дополнительная информация:"
echo "   - docs/railway-deployment.md"
echo "   - https://docs.railway.app/"
echo ""
echo "🌿 Приятного использования ароматерапии!" 