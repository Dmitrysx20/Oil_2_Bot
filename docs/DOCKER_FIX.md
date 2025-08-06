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
3. **Пустые значения** переменных с API ключами
4. **Специальные символы** в значениях
5. **Конфликт** между файлами конфигурации

## ✅ Решение

### 🧹 Автоматическая очистка (РЕКОМЕНДУЕТСЯ)

Запустите скрипт для полной очистки и переустановки переменных:

```bash
npm run railway:clean
```

Этот скрипт:
- ✅ Удалит все проблемные переменные
- ✅ Установит только базовые переменные
- ✅ Предоставит инструкции по настройке API ключей

### 🔧 Ручное исправление

#### Шаг 1: Очистка переменных окружения

В Railway Dashboard:
1. Перейдите в раздел "Variables"
2. Удалите все переменные с API ключами:
   - `TELEGRAM_BOT_TOKEN`
   - `OPENAI_API_KEY`
   - `PERPLEXITY_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `ADMIN_CHAT_IDS`

#### Шаг 2: Установка базовых переменных

Добавьте только эти переменные:

```bash
NODE_ENV=production
PORT=3000
NODE_NO_WARNINGS=1
NODE_OPTIONS=--no-deprecation --no-warnings
ENABLE_WEBHOOK=false
WEBHOOK_URL=
```

#### Шаг 3: Добавление API ключей

После успешной сборки добавьте API ключи по одному:

```bash
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
ADMIN_CHAT_IDS=123456789,987654321
```

### 🚀 Перезапуск деплоя

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

1. **Сначала очистите** все переменные окружения
2. **Устанавливайте переменные по одной** для выявления проблемной
3. **Используйте кавычки** для значений с пробелами
4. **Проверяйте переменные** перед деплоем
5. **Используйте скрипт очистки** `npm run railway:clean`
6. **Тестируйте локально** перед отправкой в Railway
7. **Ведите документацию** переменных окружения

## 📋 Правильный порядок настройки

### 1. Очистка
```bash
npm run railway:clean
```

### 2. Проверка базовых переменных
```bash
npm run check:env
```

### 3. Добавление API ключей в Railway Dashboard
- `TELEGRAM_BOT_TOKEN`
- `OPENAI_API_KEY`
- `PERPLEXITY_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ADMIN_CHAT_IDS`

### 4. Перезапуск деплоя
```bash
railway up
```

## 📋 Список обязательных переменных

| Переменная | Описание | Пример | Обязательная |
|------------|----------|---------|--------------|
| `NODE_ENV` | Окружение | `production` | ✅ |
| `PORT` | Порт приложения | `3000` | ✅ |
| `NODE_NO_WARNINGS` | Подавление предупреждений | `1` | ✅ |
| `NODE_OPTIONS` | Опции Node.js | `--no-deprecation --no-warnings` | ✅ |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота | `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz` | ✅ |
| `OPENAI_API_KEY` | Ключ OpenAI API | `sk-...` | ✅ |
| `PERPLEXITY_API_KEY` | Ключ Perplexity API | `pplx-...` | ✅ |
| `SUPABASE_URL` | URL Supabase | `https://...supabase.co` | ✅ |
| `SUPABASE_ANON_KEY` | Ключ Supabase | `eyJ...` | ✅ |
| `ADMIN_CHAT_IDS` | ID администраторов | `123456789,987654321` | ✅ |
| `ENABLE_WEBHOOK` | Включение webhook | `false` | ❌ |
| `WEBHOOK_URL` | URL webhook | `https://...` | ❌ |

## 🚀 После исправления

После успешного исправления:

1. ✅ Docker сборка пройдет без ошибок
2. ✅ Приложение запустится корректно
3. ✅ Все сервисы будут работать
4. ✅ Логи будут чистыми

## 📞 Поддержка

Если проблема не решается:

1. Запустите `npm run railway:clean`
2. Проверьте логи Railway
3. Убедитесь в правильности API ключей
4. Проверьте доступность внешних сервисов
5. Обратитесь к документации Railway 