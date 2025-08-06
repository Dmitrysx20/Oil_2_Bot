# 🤖 Aromatherapy Telegram Bot

Telegram бот для ароматерапии с AI и музыкальными рекомендациями.

## 🚨 ВАЖНО: Исправление ошибки Docker сборки

Если вы получаете ошибку:
```
ОШИБКА: недопустимая пара «ключ-значение» «= PERPLEXITY_API_KEY=...»: пустой ключ
```

### 🔧 Быстрое исправление:

1. **В Railway Dashboard** удалите ВСЕ переменные окружения
2. **Добавьте ТОЛЬКО базовые переменные**:
   ```
   NODE_ENV=production
   PORT=3000
   NODE_NO_WARNINGS=1
   NODE_OPTIONS=--no-deprecation --no-warnings
   ```
3. **Перезапустите деплой**
4. **После успешной сборки** добавьте API ключи по одному

### 📚 Подробные инструкции:

- [Экстренное исправление](docs/EMERGENCY_FIX.md)
- [Полное руководство по Railway](docs/RAILWAY_SETUP.md)
- [Исправление Docker ошибок](docs/DOCKER_FIX.md)

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Проверка переменных окружения
npm run check:env

# Запуск в режиме разработки
npm run dev

# Запуск в продакшене
npm start
```

### Railway деплой

```bash
# Автоматическое исправление переменных
npm run railway:debug

# Проверка переменных
npm run check:env

# Тестирование приложения
npm run test:app
```

## 📋 Переменные окружения

### Обязательные переменные:

| Переменная | Описание |
|------------|----------|
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота |
| `OPENAI_API_KEY` | Ключ OpenAI API |
| `PERPLEXITY_API_KEY` | Ключ Perplexity API |
| `SUPABASE_URL` | URL Supabase |
| `SUPABASE_ANON_KEY` | Ключ Supabase |
| `ADMIN_CHAT_IDS` | ID администраторов |

### Базовые переменные (устанавливаются автоматически):

| Переменная | Значение |
|------------|----------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `NODE_NO_WARNINGS` | `1` |
| `NODE_OPTIONS` | `--no-deprecation --no-warnings` |

## 🔧 Доступные скрипты

```bash
# Основные команды
npm start              # Запуск приложения
npm run dev           # Режим разработки
npm run test          # Запуск тестов

# Проверка и тестирование
npm run check:env     # Проверка переменных окружения
npm run test:app      # Тест приложения
npm run test:perplexity # Тест Perplexity API

# Railway команды
npm run railway:debug # Диагностика и очистка Railway
npm run railway:clean # Очистка переменных Railway
npm run railway:fix   # Исправление переменных Railway

# Webhook
npm run webhook:set   # Настройка webhook
```

## 📚 Документация

- [Настройка Railway](docs/RAILWAY_SETUP.md)
- [Интеграция Perplexity](docs/PerplexityIntegration.md)
- [Музыкальный сервис](docs/MusicService.md)
- [Планировщик уведомлений](docs/NotificationScheduler.md)
- [Исправление ошибок](docs/DOCKER_FIX.md)

## 🎯 Функции

- 🤖 AI рекомендации по ароматерапии
- 🎵 Музыкальные рекомендации
- 📊 Опросники и статистика
- 🔔 Уведомления и напоминания
- 🏥 Медицинские рекомендации
- 📱 Telegram интерфейс

## 🛠️ Технологии

- Node.js
- Express.js
- Telegram Bot API
- OpenAI API
- Perplexity API
- Supabase
- Winston (логирование)
- Node-cron (планировщик)

## 📞 Поддержка

При возникновении проблем:

1. Проверьте [документацию по исправлению](docs/EMERGENCY_FIX.md)
2. Запустите диагностику: `npm run railway:debug`
3. Проверьте логи Railway
4. Убедитесь в правильности API ключей 