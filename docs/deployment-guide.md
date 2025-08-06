# 🚀 Руководство по развертыванию Арома-Помощника

## 📋 Предварительные требования

### Необходимые сервисы
- **n8n** - Платформа автоматизации
- **Supabase** - База данных PostgreSQL
- **OpenAI API** - AI модели
- **Perplexity API** - Веб-поиск
- **Telegram Bot** - Мессенджер

### Системные требования
- Node.js 18+ (для n8n)
- PostgreSQL 12+ (для Supabase)
- Минимум 2GB RAM
- 10GB свободного места

## 🔧 Пошаговая установка

### 1. Настройка Supabase

#### 1.1 Создание проекта
1. Зайдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Запишите URL и API ключи

#### 1.2 Создание таблиц
Выполните SQL скрипты в Supabase SQL Editor:

```sql
-- Таблица масел
CREATE TABLE oils (
  id SERIAL PRIMARY KEY,
  oil_name VARCHAR(255) NOT NULL,
  description TEXT,
  emotional_effect TEXT,
  physical_effect TEXT,
  applications TEXT,
  safety_warning TEXT,
  joke TEXT,
  keywords TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица подписчиков
CREATE TABLE subscribers (
  id SERIAL PRIMARY KEY,
  chat_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  subscription_date TIMESTAMP DEFAULT NOW(),
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица взаимодействий пользователей
CREATE TABLE user_interactions (
  id SERIAL PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  interaction_type VARCHAR(100),
  interaction_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица админских настроек
CREATE TABLE admin_settings (
  id SERIAL PRIMARY KEY,
  chat_id BIGINT UNIQUE NOT NULL,
  permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.3 Настройка RLS (Row Level Security)
```sql
-- Включение RLS
ALTER TABLE oils ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Политики для oils (публичный доступ для чтения)
CREATE POLICY "Allow public read access" ON oils FOR SELECT USING (true);

-- Политики для subscribers
CREATE POLICY "Users can view own data" ON subscribers FOR SELECT USING (chat_id = current_setting('request.jwt.claims')::json->>'chat_id');
CREATE POLICY "Users can update own data" ON subscribers FOR UPDATE USING (chat_id = current_setting('request.jwt.claims')::json->>'chat_id');
```

### 2. Настройка Telegram Bot

#### 2.1 Создание бота
1. Найдите @BotFather в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям
4. Сохраните токен бота

#### 2.2 Настройка webhook
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-n8n-domain.com/webhook/telegram-trigger",
    "allowed_updates": ["message", "callback_query"]
  }'
```

### 3. Настройка n8n

#### 3.1 Установка n8n
```bash
# Установка через npm
npm install -g n8n

# Или через Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

#### 3.2 Настройка переменных окружения
Создайте файл `.env`:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Perplexity
PERPLEXITY_API_KEY=your_perplexity_api_key

# n8n
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_secure_password
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_WEBHOOK_URL=https://your-domain.com
```

### 4. Импорт workflows

#### 4.1 Основной бот
1. Откройте n8n в браузере
2. Перейдите в раздел Workflows
3. Нажмите "Import from file"
4. Выберите файл `workflows/main-bot.json`

#### 4.2 Система подписок
1. Импортируйте `workflows/subscription-system.json`
2. Настройте связи между workflows

### 5. Настройка credentials

#### 5.1 Supabase
1. В n8n перейдите в Credentials
2. Создайте новый Supabase credential
3. Введите URL и API ключ

#### 5.2 Telegram
1. Создайте Telegram Bot credential
2. Введите токен бота

#### 5.3 OpenAI
1. Создайте OpenAI API credential
2. Введите API ключ

#### 5.4 Perplexity
1. Создайте Perplexity API credential
2. Введите API ключ

## 🔄 Настройка автоматизации

### 1. Ежедневные уведомления
Создайте отдельный workflow для отправки ежедневных уведомлений:

```javascript
// Пример кода для ежедневных уведомлений
const cronExpression = '0 9,20 * * *'; // 9:00 и 20:00 каждый день

// Получение активных подписчиков
const subscribers = await supabase
  .from('subscribers')
  .select('*')
  .eq('is_active', true);

// Отправка уведомлений
for (const subscriber of subscribers) {
  await sendDailyNotification(subscriber);
}
```

### 2. Резервное копирование
Настройте автоматическое резервное копирование базы данных:

```bash
# Скрипт для резервного копирования
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
```

## 🔍 Мониторинг и логирование

### 1. Логирование в Supabase
```sql
-- Создание таблицы логов
CREATE TABLE system_logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(20),
  message TEXT,
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Функция для логирования
CREATE OR REPLACE FUNCTION log_event(
  p_level VARCHAR(20),
  p_message TEXT,
  p_context JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO system_logs (level, message, context)
  VALUES (p_level, p_message, p_context);
END;
$$ LANGUAGE plpgsql;
```

### 2. Мониторинг производительности
- Настройте метрики n8n
- Мониторьте использование API
- Отслеживайте время ответа

## 🛡️ Безопасность

### 1. Настройка HTTPS
```bash
# Установка SSL сертификата
sudo certbot --nginx -d your-domain.com
```

### 2. Ограничение доступа
```bash
# Настройка firewall
sudo ufw allow 5678
sudo ufw allow 443
sudo ufw enable
```

### 3. Резервные копии
- Настройте автоматические бэкапы
- Тестируйте восстановление
- Храните копии в разных местах

## 🚨 Устранение неполадок

### Частые проблемы

#### 1. Webhook не работает
- Проверьте URL webhook
- Убедитесь, что n8n доступен извне
- Проверьте логи n8n

#### 2. Ошибки базы данных
- Проверьте подключение к Supabase
- Убедитесь в правильности RLS политик
- Проверьте API ключи

#### 3. AI не отвечает
- Проверьте API ключи OpenAI/Perplexity
- Убедитесь в наличии кредитов
- Проверьте лимиты запросов

### Полезные команды
```bash
# Проверка статуса n8n
n8n status

# Просмотр логов
n8n logs

# Перезапуск сервиса
sudo systemctl restart n8n
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи n8n
2. Изучите документацию n8n
3. Обратитесь в сообщество n8n
4. Создайте issue в репозитории проекта 