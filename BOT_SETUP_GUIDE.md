# 🤖 Настройка токена Telegram бота

## ❌ Проблема: Бот не отвечает на /start

**Причина:** У вас не настроен токен бота в переменных окружения.

## ✅ Решение: Настройка токена

### Шаг 1: Создание бота в Telegram

1. **Откройте Telegram**
2. **Найдите @BotFather** (официальный бот для создания ботов)
3. **Отправьте команду** `/newbot`
4. **Следуйте инструкциям:**
   - Введите имя бота (например: "Aromatic Story")
   - Введите username бота (например: "aromatic_story_bot")
5. **Сохраните токен** - BotFather выдаст вам токен вида:
   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

### Шаг 2: Настройка переменных окружения

#### Вариант A: Локальная разработка

Создайте файл `.env` в корне проекта:

```env
# Telegram Bot Token
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Webhook settings
ENABLE_WEBHOOK=true
WEBHOOK_URL=your-app-url.railway.app

# Optional: AI Services
OPENAI_API_KEY=your_openai_key
PERPLEXITY_API_KEY=your_perplexity_key

# Optional: Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Optional: Admin
ADMIN_CHAT_IDS=123456789,987654321
```

#### Вариант B: Railway (продакшен)

1. Откройте Railway Dashboard
2. Выберите ваш проект
3. Перейдите в "Variables"
4. Добавьте переменную:
   - **Name:** `TELEGRAM_BOT_TOKEN`
   - **Value:** `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

### Шаг 3: Перезапуск бота

```bash
# Остановите текущий процесс
pkill -f "node.*app.js"

# Запустите с новым токеном
ENABLE_WEBHOOK=true npm start
```

### Шаг 4: Настройка webhook

```bash
# Установите webhook
node scripts/setWebhook.js set

# Проверьте статус
node scripts/setWebhook.js info
```

## 🔧 Проверка настройки

### Тест локально:

```bash
# Проверьте переменные
echo $TELEGRAM_BOT_TOKEN

# Запустите тест
node scripts/testStartCommand.js

# Проверьте webhook
curl -X POST http://localhost:3000/webhook/telegram \
  -H "Content-Type: application/json" \
  -d '{"update_id":1,"message":{"text":"/start","chat":{"id":123456789}}}'
```

### Тест в Telegram:

1. Найдите вашего бота по username
2. Отправьте `/start`
3. Бот должен ответить приветственным сообщением

## 🚨 Устранение неполадок

### Проблема: "Bot token is invalid"
- Проверьте правильность токена
- Убедитесь, что бот не был удален
- Создайте нового бота через @BotFather

### Проблема: "Webhook failed"
- Проверьте доступность URL
- Убедитесь, что сервер запущен
- Проверьте SSL сертификат (для HTTPS)

### Проблема: "Bot doesn't respond"
- Проверьте логи: `tail -f logs/combined.log`
- Убедитесь, что webhook установлен
- Проверьте переменные окружения

## 📋 Чек-лист настройки

- [ ] Создан бот через @BotFather
- [ ] Получен токен бота
- [ ] Токен добавлен в переменные окружения
- [ ] Сервер перезапущен
- [ ] Webhook установлен
- [ ] Бот отвечает на `/start`

## 🎯 Результат

После настройки токена ваш бот должен:
- ✅ Отвечать на команду `/start`
- ✅ Показывать приветственное сообщение
- ✅ Отображать клавиатуру с кнопками
- ✅ Обрабатывать все команды

---

**После настройки токена бот будет полностью функционален!** 🚀 