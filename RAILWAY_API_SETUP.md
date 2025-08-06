# 🔑 НАСТРОЙКА API КЛЮЧЕЙ В RAILWAY

## 📋 Ваш Railway проект
- **Project ID**: `db239086-d307-47e7-9c39-871df85a6403`
- **Service ID**: `7fdadcef-a299-4b5c-9bd9-4fcb3494cfd2`
- **Environment ID**: `889c73d8-cc63-4eae-b6a9-4401e6711732`
- **Статус**: ✅ Все системы работают операционно

## 🔧 Настройка переменных окружения в Railway

### 1. Откройте Railway Dashboard
Перейдите по ссылке: [Railway Project](https://railway.com/project/db239086-d307-47e7-9c39-871df85a6403/service/7fdadcef-a299-4b5c-9bd9-4fcb3494cfd2?environmentId=889c73d8-cc63-4eae-b6a9-4401e6711732)

### 2. Добавьте переменные окружения

В разделе **Variables** добавьте следующие переменные:

#### 🔐 Supabase Configuration
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
```

#### 🤖 Telegram Bot Configuration
```bash
BOT_TOKEN=your-telegram-bot-token
ADMIN_CHAT_ID=802895688
```

#### 🗄️ Database Configuration (если используете)
```bash
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

#### ⚙️ Node.js Configuration
```bash
NODE_ENV=production
NODE_VERSION=22.17.1
RAILWAY_ENVIRONMENT=production
```

## 🔍 Как получить API ключи

### 1. Supabase API ключи
1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Settings** → **API**
4. Скопируйте:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Telegram Bot Token
1. Найдите @BotFather в Telegram
2. Отправьте `/mybots`
3. Выберите вашего бота
4. Нажмите **API Token**
5. Скопируйте токен → `BOT_TOKEN`

## 🚀 Настройка через Railway CLI

### 1. Установите Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Войдите в Railway
```bash
railway login
```

### 3. Подключитесь к проекту
```bash
railway link
```

### 4. Добавьте переменные
```bash
# Supabase
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_ANON_KEY=your-anon-key-here
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Telegram Bot
railway variables set BOT_TOKEN=your-telegram-bot-token
railway variables set ADMIN_CHAT_ID=802895688

# Environment
railway variables set NODE_ENV=production
railway variables set NODE_VERSION=22.17.1
```

## 🔍 Проверка настроек

### 1. Просмотр переменных
```bash
railway variables
```

### 2. Тест подключения
```bash
railway run node test_supabase_diagnosis.js
```

### 3. Проверка логов
```bash
railway logs
```

## 📊 Мониторинг

### 1. Railway Dashboard
- Перейдите в ваш проект
- Откройте вкладку **Metrics**
- Следите за:
  - CPU Usage
  - Memory Usage
  - Network I/O
  - Response Time

### 2. Health Check
После настройки API ключей проверьте:
```
https://your-railway-app.railway.app/healthz
```

### 3. Детальная диагностика
```
https://your-railway-app.railway.app/health/detailed
```

## 🛠️ Устранение проблем

### Если переменные не работают:
1. Проверьте правильность API ключей
2. Убедитесь, что переменные добавлены в правильный environment
3. Перезапустите сервис: `railway service restart`

### Если Supabase не подключается:
1. Проверьте `SUPABASE_URL` и `SUPABASE_ANON_KEY`
2. Убедитесь, что проект активен в Supabase
3. Проверьте настройки безопасности в Supabase

### Если бот не отвечает:
1. Проверьте `BOT_TOKEN`
2. Убедитесь, что бот не заблокирован
3. Проверьте webhook URL в Telegram

## 📝 Шаблон для копирования

Скопируйте этот блок и замените значения:

```bash
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Telegram Bot
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
ADMIN_CHAT_ID=802895688

# Environment
NODE_ENV=production
NODE_VERSION=22.17.1
RAILWAY_ENVIRONMENT=production
```

## 🎯 Следующие шаги

1. **Добавьте API ключи** в Railway Dashboard
2. **Перезапустите сервис** после добавления переменных
3. **Протестируйте подключение** с помощью health check
4. **Проверьте логи** на наличие ошибок
5. **Убедитесь, что бот работает** в Telegram

---

**Статус**: ⏳ Ожидает настройки API ключей
**Следующий шаг**: Добавление переменных окружения в Railway Dashboard 