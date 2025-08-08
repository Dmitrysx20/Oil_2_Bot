# 🚨 Быстрое исправление: Бот не отвечает

## ❌ Проблема
Бот не отвечает на сообщения в Telegram, хотя локально все работает.

## 🔍 Диагностика
- ✅ Локальный сервер работает
- ✅ Webhook endpoint работает
- ❌ Токен бота недействителен (401 Unauthorized)
- ❌ Telegram не отправляет сообщения на локальный сервер

## 🚀 Решение 1: Railway (Рекомендуется)

### Шаг 1: Проверьте Railway
1. Откройте Railway Dashboard
2. Убедитесь, что приложение развернуто
3. Проверьте переменные окружения

### Шаг 2: Получите URL приложения
```bash
# В Railway Dashboard найдите URL вашего приложения
# Например: https://your-app-name.railway.app
```

### Шаг 3: Настройте webhook
```bash
# Замените YOUR_APP_URL на URL из Railway
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://YOUR_APP_URL.railway.app/webhook/telegram"}'
```

## 🔧 Решение 2: Новый бот (Локально)

### Шаг 1: Создайте нового бота
1. Откройте Telegram
2. Найдите @BotFather
3. Отправьте `/newbot`
4. Следуйте инструкциям
5. Сохраните новый токен

### Шаг 2: Обновите токен
```bash
# Установите новый токен
export TELEGRAM_BOT_TOKEN="YOUR_NEW_TOKEN"

# Проверьте токен
curl -s "https://api.telegram.org/botYOUR_NEW_TOKEN/getMe"
```

### Шаг 3: Настройте ngrok (для локального тестирования)
```bash
# Установите ngrok (если не установлен)
# Скачайте с https://ngrok.com/

# Запустите ngrok
./ngrok http 3000

# Скопируйте HTTPS URL (например: https://abc123.ngrok.io)
```

### Шаг 4: Настройте webhook
```bash
# Замените URL на ваш ngrok URL
curl -X POST "https://api.telegram.org/botYOUR_NEW_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://YOUR_NGROK_URL.ngrok.io/webhook/telegram"}'
```

## 🧪 Тестирование

### Проверьте webhook
```bash
# Получите информацию о webhook
curl -s "https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo" | python3 -m json.tool
```

### Тест локально
```bash
# Запустите бота
ENABLE_WEBHOOK=true npm start

# Отправьте тестовое сообщение
curl -X POST http://localhost:3000/webhook/telegram \
  -H "Content-Type: application/json" \
  -d '{"update_id":1,"message":{"text":"/start","chat":{"id":123456789}}}'
```

## 🎯 Ожидаемый результат

После настройки:
- ✅ Бот отвечает на `/start`
- ✅ Обрабатывает поиск масел
- ✅ Показывает справку
- ✅ Работает в Telegram

## 🚨 Если ничего не помогает

1. **Проверьте логи Railway**
2. **Убедитесь, что приложение запущено**
3. **Проверьте переменные окружения**
4. **Создайте нового бота**

---

**Выберите один из вариантов и следуйте инструкциям!** 🚀 