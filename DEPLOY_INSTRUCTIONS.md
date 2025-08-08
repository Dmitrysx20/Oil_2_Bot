# 🚀 Инструкция по деплою на Railway

## 📋 Подготовка к деплою

### 1. Авторизация в Railway
```bash
npx @railway/cli login
```
Следуйте инструкциям в браузере для авторизации через GitHub.

### 2. Проверка проекта
```bash
npx @railway/cli status
```

### 3. Автоматический деплой
```bash
./deploy.sh
```

## 🔧 Ручной деплой

### Шаг 1: Инициализация проекта (если нужно)
```bash
npx @railway/cli init
```

### Шаг 2: Настройка переменных окружения
```bash
npx @railway/cli variables < railway.env
```

### Шаг 3: Деплой
```bash
npx @railway/cli deploy
```

### Шаг 4: Проверка статуса
```bash
npx @railway/cli status
```

## 🔑 Необходимые переменные окружения

Убедитесь, что в Railway Dashboard настроены следующие переменные:

### Обязательные:
- `TELEGRAM_BOT_TOKEN` - токен вашего Telegram бота

### Опциональные:
- `OPENAI_API_KEY` - для AI рекомендаций
- `SUPABASE_URL` - для базы данных
- `SUPABASE_ANON_KEY` - для базы данных
- `ADMIN_CHAT_IDS` - ID администраторов (через запятую)

## 📊 Мониторинг

### Просмотр логов:
```bash
npx @railway/cli logs
```

### Проверка здоровья:
```bash
curl https://your-app-name.railway.app/health
```

## 🛠️ Устранение неполадок

### Проблема: "Unauthorized"
**Решение:** Выполните `npx @railway/cli login`

### Проблема: "Project not found"
**Решение:** Выполните `npx @railway/cli init`

### Проблема: "Build failed"
**Решение:** Проверьте логи и убедитесь, что все зависимости указаны в package.json

### Проблема: "Environment variables missing"
**Решение:** Настройте переменные в Railway Dashboard

## 🎯 После деплоя

1. ✅ Проверьте, что бот отвечает в Telegram
2. ✅ Проверьте логи на наличие ошибок
3. ✅ Протестируйте основные функции бота
4. ✅ Настройте webhook (если нужно)

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи: `npx @railway/cli logs`
2. Проверьте статус: `npx @railway/cli status`
3. Обратитесь к документации Railway
