# ⚡ БЫСТРАЯ НАСТРОЙКА API КЛЮЧЕЙ

## 🎯 Ваша задача
Настроить API ключи в Railway для исправления проблемы с Supabase.

## 📋 Что нужно сделать

### 1. Откройте Railway Dashboard
🔗 [Ваш проект в Railway](https://railway.com/project/db239086-d307-47e7-9c39-871df85a6403/service/7fdadcef-a299-4b5c-9bd9-4fcb3494cfd2?environmentId=889c73d8-cc63-4eae-b6a9-4401e6711732)

### 2. Добавьте переменные окружения

В разделе **Variables** добавьте:

#### 🔐 Supabase (обязательно)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 🤖 Telegram Bot (обязательно)
```
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
ADMIN_CHAT_ID=802895688
```

#### ⚙️ Environment (обязательно)
```
NODE_ENV=production
RAILWAY_ENVIRONMENT=production
```

## 🔍 Где взять ключи

### Supabase API ключи:
1. [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. **Settings** → **API**
4. Скопируйте:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### Telegram Bot Token:
1. Найдите @BotFather в Telegram
2. Отправьте `/mybots`
3. Выберите вашего бота
4. **API Token** → скопируйте токен

## ✅ Проверка настройки

После добавления переменных:

1. **Перезапустите сервис** в Railway
2. **Проверьте логи**: `railway logs`
3. **Запустите тест**: `railway run node check_api_keys.js`

## 🚨 Если что-то не работает

### Проблема: "Node.js 18 and below are deprecated"
✅ **РЕШЕНО!** Ваша Node.js v22.17.1 совместима.

### Проблема: Supabase не подключается
1. Проверьте правильность API ключей
2. Убедитесь, что проект активен в Supabase
3. Проверьте настройки безопасности

### Проблема: Бот не отвечает
1. Проверьте `BOT_TOKEN`
2. Убедитесь, что бот не заблокирован
3. Проверьте webhook URL

## 📞 Поддержка

Если нужна помощь:
1. Проверьте логи в Railway Dashboard
2. Запустите диагностику: `node test_supabase_diagnosis.js`
3. Проверьте health check: `/healthz`

---

**Статус**: ⏳ Ожидает настройки API ключей
**Следующий шаг**: Добавить переменные в Railway Dashboard 