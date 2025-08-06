# 🚂 Развертывание на Railway

Railway - это отличная платформа для развертывания Node.js приложений. Она предоставляет автоматическое развертывание, масштабирование и мониторинг.

## 🚀 Быстрое развертывание

### Шаг 1: Подготовка репозитория

Убедитесь, что ваш код загружен в GitHub репозиторий:

```bash
# Добавьте удаленный репозиторий (если еще не сделали)
git remote add origin https://github.com/YOUR_USERNAME/aroma-helper-bot.git
git push -u origin main
```

### Шаг 2: Создание проекта на Railway

1. Перейдите на [Railway.app](https://railway.app)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите "Deploy from GitHub repo"
5. Выберите ваш репозиторий `aroma-helper-bot`
6. Нажмите "Deploy Now"

### Шаг 3: Настройка переменных окружения

После создания проекта:

1. Перейдите в раздел "Variables"
2. Добавьте следующие переменные:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here

# OpenAI
OPENAI_API_KEY=your_openai_key_here

# Supabase
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Server
PORT=3000
NODE_ENV=production
```

### Шаг 4: Настройка домена

1. Перейдите в раздел "Settings"
2. В разделе "Domains" нажмите "Generate Domain"
3. Скопируйте полученный URL (например: `https://aroma-bot-production.up.railway.app`)

### Шаг 5: Настройка Telegram Webhook

Используйте полученный URL для настройки webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://aroma-bot-production.up.railway.app/webhook"}'
```

## 🔧 Конфигурация

### Файл railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Файл nixpacks.toml

```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm"]

[phases.install]
cmds = ["npm ci --only=production"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

## 📊 Мониторинг

### Логи

1. Перейдите в раздел "Deployments"
2. Выберите последний деплой
3. Нажмите "View Logs"

### Метрики

Railway автоматически предоставляет:
- Использование CPU
- Использование памяти
- Количество запросов
- Время ответа

## 🔄 Автоматическое развертывание

Railway автоматически развертывает ваше приложение при каждом push в ветку `main`.

### Настройка автодеплоя

1. Перейдите в "Settings" проекта
2. В разделе "Deploy" включите "Auto Deploy"
3. Выберите ветку `main`

## 🚨 Устранение проблем

### Проблема: Приложение не запускается

1. Проверьте логи в Railway
2. Убедитесь, что все переменные окружения настроены
3. Проверьте, что порт указан правильно

### Проблема: Webhook не работает

1. Убедитесь, что URL webhook правильный
2. Проверьте, что бот токен корректный
3. Проверьте логи приложения

### Проблема: Ошибки базы данных

1. Проверьте переменные Supabase
2. Убедитесь, что таблицы созданы
3. Проверьте права доступа

## 💰 Стоимость

Railway предоставляет:
- **Бесплатный план**: $5 кредитов в месяц
- **Платный план**: $20/месяц за 1000 часов

Для Telegram бота бесплатного плана обычно достаточно.

## 🔒 Безопасность

### Переменные окружения

- Все секретные данные хранятся в переменных окружения
- Railway автоматически шифрует переменные
- Переменные не попадают в логи

### HTTPS

Railway автоматически предоставляет SSL сертификаты для всех доменов.

## 📈 Масштабирование

### Автоматическое масштабирование

1. Перейдите в "Settings"
2. Включите "Auto Scale"
3. Установите минимальное и максимальное количество реплик

### Ручное масштабирование

1. Перейдите в "Deployments"
2. Нажмите "Scale"
3. Установите нужное количество реплик

## 🔄 Обновление приложения

### Автоматическое обновление

Просто отправьте изменения в GitHub:

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

Railway автоматически развернет новую версию.

### Ручное обновление

1. Перейдите в "Deployments"
2. Нажмите "Deploy"
3. Выберите коммит для развертывания

## 📱 Тестирование

После развертывания протестируйте бота:

1. Отправьте `/start` боту
2. Попробуйте поиск масла: `лаванда`
3. Проверьте рекомендации: `нужна энергия`
4. Тестируйте подписку: `подписаться`

## 🔗 Полезные ссылки

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI](https://docs.railway.app/reference/cli)
- [Node.js на Railway](https://docs.railway.app/deploy/deployments/languages/nodejs)

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте логи в Railway
2. Убедитесь, что все переменные настроены
3. Проверьте документацию Railway
4. Обратитесь в поддержку Railway

---

**Удачи с развертыванием на Railway! 🚂✨** 