#!/bin/bash

echo "🚀 Начинаем деплой бота на Railway..."

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден. Убедитесь, что вы в корневой папке проекта."
    exit 1
fi

# Проверяем Railway CLI
echo "📋 Проверяем Railway CLI..."
if ! npx @railway/cli --version > /dev/null 2>&1; then
    echo "❌ Railway CLI не найден. Устанавливаем..."
    npm install -g @railway/cli
fi

# Проверяем авторизацию
echo "🔐 Проверяем авторизацию в Railway..."
if ! npx @railway/cli whoami > /dev/null 2>&1; then
    echo "⚠️  Не авторизованы в Railway. Выполните: npx @railway/cli login"
    echo "📝 После авторизации запустите этот скрипт снова."
    exit 1
fi

# Проверяем статус проекта
echo "📊 Проверяем статус проекта..."
if ! npx @railway/cli status > /dev/null 2>&1; then
    echo "⚠️  Проект не найден. Создаем новый проект..."
    npx @railway/cli init
fi

# Устанавливаем переменные окружения
echo "🔧 Настраиваем переменные окружения..."
if [ -f "railway.env" ]; then
    echo "📝 Загружаем переменные из railway.env..."
    npx @railway/cli variables < railway.env
fi

# Деплоим
echo "🚀 Запускаем деплой..."
npx @railway/cli deploy

# Проверяем статус
echo "✅ Деплой завершен!"
echo "📊 Проверяем статус сервиса..."
npx @railway/cli status

echo "🎉 Готово! Ваш бот должен быть доступен по ссылке выше."
