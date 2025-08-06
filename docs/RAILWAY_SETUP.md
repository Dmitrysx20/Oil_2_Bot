# 🚂 Настройка Railway для Aromatherapy Bot

## 📋 Предварительные требования

1. Аккаунт на [Railway](https://railway.app/)
2. GitHub репозиторий с кодом бота
3. API ключи для сервисов

## 🔧 Пошаговая настройка

### 1. Подключение репозитория

1. Войдите в Railway Dashboard
2. Нажмите "New Project"
3. Выберите "Deploy from GitHub repo"
4. Выберите ваш репозиторий `Oil_2_Bot`

### 2. Настройка переменных окружения

**ВАЖНО**: Убедитесь, что все переменные окружения настроены правильно без лишних пробелов или символов.

В Railway Dashboard перейдите в раздел "Variables" и добавьте следующие переменные:

```bash
# Основные настройки
NODE_ENV=production
PORT=3000

# Подавление предупреждений Node.js
NODE_NO_WARNINGS=1
NODE_OPTIONS=--no-deprecation --no-warnings

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# AI Services
OPENAI_API_KEY=your_openai_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Database
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Admin
ADMIN_CHAT_IDS=123456789,987654321

# Webhook
ENABLE_WEBHOOK=false
WEBHOOK_URL=https://your-domain.com/webhook
```

### 3. Настройка через CLI (альтернативный способ)

```bash
# Установка Railway CLI
npm install -g @railway/cli

# Вход в аккаунт
railway login

# Подключение к проекту
railway link

# Установка переменных окружения
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set NODE_NO_WARNINGS=1
railway variables set NODE_OPTIONS="--no-deprecation --no-warnings"
railway variables set TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
railway variables set OPENAI_API_KEY=your_openai_api_key_here
railway variables set PERPLEXITY_API_KEY=your_perplexity_api_key_here
railway variables set SUPABASE_URL=your_supabase_url_here
railway variables set SUPABASE_ANON_KEY=your_supabase_anon_key_here
railway variables set ADMIN_CHAT_IDS=123456789,987654321
railway variables set ENABLE_WEBHOOK=false
railway variables set WEBHOOK_URL=https://your-domain.com/webhook
```

### 4. Настройка домена

1. В Railway Dashboard перейдите в раздел "Settings"
2. Нажмите "Generate Domain" или добавьте свой домен
3. Скопируйте URL домена

### 5. Настройка webhook (опционально)

Если вы хотите использовать webhook вместо polling:

```bash
# Установите ENABLE_WEBHOOK=true
railway variables set ENABLE_WEBHOOK=true

# Установите WEBHOOK_URL с вашим доменом
railway variables set WEBHOOK_URL=https://your-railway-domain.railway.app/webhook
```

## 🔍 Проверка настройки

### Локальная проверка

```bash
# Проверка переменных окружения
node scripts/checkEnv.js

# Тест приложения
node scripts/testApp.js

# Тест Perplexity API
node scripts/testPerplexity.js
```

### Проверка в Railway

1. Перейдите в Railway Dashboard
2. Откройте логи деплоя
3. Убедитесь, что нет ошибок
4. Проверьте health check: `https://your-domain.railway.app/health`

## 🚨 Решение проблем

### Ошибка "недопустимая пара ключ-значение"

**Проблема**: Неправильный формат переменных окружения в Docker.

**Решение**:
1. Убедитесь, что в переменных нет лишних пробелов
2. Проверьте, что значения не содержат специальных символов
3. Используйте кавычки для значений с пробелами

### Ошибка сборки Docker

**Проблема**: Отсутствуют необходимые переменные окружения.

**Решение**:
1. Добавьте все обязательные переменные в Railway
2. Убедитесь, что `NODE_ENV=production`
3. Проверьте, что `PORT=3000`

### Ошибка подключения к базе данных

**Проблема**: Неправильные данные Supabase.

**Решение**:
1. Проверьте `SUPABASE_URL` и `SUPABASE_ANON_KEY`
2. Убедитесь, что база данных доступна
3. Проверьте права доступа

## 📊 Мониторинг

### Логи приложения

```bash
# Просмотр логов в Railway
railway logs

# Просмотр логов в реальном времени
railway logs --follow
```

### Метрики

- **Health Check**: `https://your-domain.railway.app/health`
- **Статус**: Railway Dashboard → Deployments
- **Использование ресурсов**: Railway Dashboard → Metrics

## 🔄 Обновление приложения

```bash
# Отправка изменений в GitHub
git add .
git commit -m "Update application"
git push origin main

# Railway автоматически пересоберет и развернет приложение
```

## 📝 Полезные команды

```bash
# Перезапуск приложения
railway service restart

# Просмотр переменных окружения
railway variables

# Обновление переменной
railway variables set VARIABLE_NAME=value

# Удаление переменной
railway variables unset VARIABLE_NAME
```

## 🎯 Рекомендации

1. **Безопасность**: Никогда не коммитьте реальные API ключи в код
2. **Мониторинг**: Регулярно проверяйте логи приложения
3. **Резервное копирование**: Настройте автоматическое резервное копирование базы данных
4. **Обновления**: Регулярно обновляйте зависимости
5. **Тестирование**: Тестируйте изменения локально перед деплоем 