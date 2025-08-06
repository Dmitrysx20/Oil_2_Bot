# 🐳 Исправление ошибки Docker сборки

## 🚨 Проблема

Ошибка при сборке Docker в Railway:
```
ОШИБКА: недопустимая пара «ключ-значение» «= PERPLEXITY_API_KEY=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»: пустой ключ
```

## 🔍 Причина

Проблема возникает из-за неправильного формата переменных окружения в Docker. Возможные причины:

1. **Лишние пробелы** в переменных окружения
2. **Неправильный синтаксис** переменных
3. **Отсутствующие переменные** окружения
4. **Специальные символы** в значениях

## ✅ Решение

### 1. Автоматическое исправление

Запустите скрипт для автоматического исправления:

```bash
npm run railway:fix
```

### 2. Ручное исправление

#### Шаг 1: Проверьте переменные окружения

```bash
# Проверка текущих переменных
node scripts/checkEnv.js

# Проверка через Railway CLI
railway variables
```

#### Шаг 2: Установите правильные переменные

В Railway Dashboard или через CLI:

```bash
# Основные настройки
railway variables set NODE_ENV=production
railway variables set PORT=3000

# Подавление предупреждений
railway variables set NODE_NO_WARNINGS=1
railway variables set NODE_OPTIONS="--no-deprecation --no-warnings"

# API ключи (замените на реальные значения)
railway variables set TELEGRAM_BOT_TOKEN=your_token_here
railway variables set OPENAI_API_KEY=your_key_here
railway variables set PERPLEXITY_API_KEY=your_key_here

# База данных
railway variables set SUPABASE_URL=your_url_here
railway variables set SUPABASE_ANON_KEY=your_key_here

# Администраторы
railway variables set ADMIN_CHAT_IDS=123456789,987654321

# Webhook
railway variables set ENABLE_WEBHOOK=false
railway variables set WEBHOOK_URL=https://your-domain.com/webhook
```

#### Шаг 3: Проверьте формат

Убедитесь, что:
- ✅ Нет лишних пробелов в начале или конце
- ✅ Нет специальных символов в значениях
- ✅ Все обязательные переменные установлены
- ✅ Значения не содержат недопустимых символов

### 3. Перезапуск деплоя

```bash
# Перезапуск через CLI
railway up

# Или через Dashboard
# 1. Перейдите в Railway Dashboard
# 2. Выберите проект
# 3. Нажмите "Redeploy"
```

## 🔧 Дополнительные проверки

### Проверка конфигурации

```bash
# Проверка файлов конфигурации
cat railway.env
cat railway-variables.json
cat railway.toml
```

### Проверка логов

```bash
# Просмотр логов сборки
railway logs

# Просмотр логов в реальном времени
railway logs --follow
```

## 🎯 Рекомендации

1. **Всегда используйте кавычки** для значений с пробелами
2. **Проверяйте переменные** перед деплоем
3. **Используйте скрипт проверки** `npm run check:env`
4. **Тестируйте локально** перед отправкой в Railway
5. **Ведите документацию** переменных окружения

## 📋 Список обязательных переменных

| Переменная | Описание | Пример |
|------------|----------|---------|
| `NODE_ENV` | Окружение | `production` |
| `PORT` | Порт приложения | `3000` |
| `NODE_NO_WARNINGS` | Подавление предупреждений | `1` |
| `NODE_OPTIONS` | Опции Node.js | `--no-deprecation --no-warnings` |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота | `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz` |
| `OPENAI_API_KEY` | Ключ OpenAI API | `sk-...` |
| `PERPLEXITY_API_KEY` | Ключ Perplexity API | `pplx-...` |
| `SUPABASE_URL` | URL Supabase | `https://...supabase.co` |
| `SUPABASE_ANON_KEY` | Ключ Supabase | `eyJ...` |
| `ADMIN_CHAT_IDS` | ID администраторов | `123456789,987654321` |
| `ENABLE_WEBHOOK` | Включение webhook | `false` |
| `WEBHOOK_URL` | URL webhook | `https://...` |

## 🚀 После исправления

После успешного исправления:

1. ✅ Docker сборка пройдет без ошибок
2. ✅ Приложение запустится корректно
3. ✅ Все сервисы будут работать
4. ✅ Логи будут чистыми

## 📞 Поддержка

Если проблема не решается:

1. Проверьте логи Railway
2. Убедитесь в правильности API ключей
3. Проверьте доступность внешних сервисов
4. Обратитесь к документации Railway 