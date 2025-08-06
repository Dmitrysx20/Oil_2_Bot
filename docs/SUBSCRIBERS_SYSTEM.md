# 👥 Система учета подписчиков

## 📋 Обзор

Система учета подписчиков бота ароматерапии построена на базе Supabase и включает в себя:

- **Таблицу подписчиков** (`subscribers`) - основная информация о пользователях
- **Таблицу логов активности** (`subscriber_activity_log`) - история действий пользователей
- **Представление статистики** (`subscribers_stats`) - агрегированные данные
- **Сервис подписок** (`SubscriptionService`) - бизнес-логика работы с подписчиками

## 🗄️ Структура базы данных

### Таблица `subscribers`

Основная таблица для хранения информации о подписчиках:

```sql
CREATE TABLE subscribers (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'blocked')),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
    morning_notifications BOOLEAN DEFAULT true,
    evening_notifications BOOLEAN DEFAULT true,
    morning_time TIME DEFAULT '09:00',
    evening_time TIME DEFAULT '20:00',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Поля:**
- `telegram_id` - уникальный ID пользователя в Telegram
- `subscription_status` - статус подписки (active/inactive/blocked)
- `timezone` - часовой пояс пользователя
- `morning_notifications` / `evening_notifications` - настройки уведомлений
- `morning_time` / `evening_time` - время отправки уведомлений
- `preferences` - дополнительные настройки в формате JSON

### Таблица `subscriber_activity_log`

Лог всех действий пользователей:

```sql
CREATE TABLE subscriber_activity_log (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Типы действий:**
- `subscribe` - подписка на уведомления
- `unsubscribe` - отписка от уведомлений
- `update_settings` - изменение настроек
- `interaction` - взаимодействие с ботом
- `error` - ошибки

### Представление `subscribers_stats`

Агрегированная статистика подписчиков:

```sql
CREATE VIEW subscribers_stats AS
SELECT 
    COUNT(*) as total_subscribers,
    COUNT(*) FILTER (WHERE subscription_status = 'active') as active_subscribers,
    COUNT(*) FILTER (WHERE subscription_status = 'inactive') as inactive_subscribers,
    COUNT(*) FILTER (WHERE subscription_status = 'blocked') as blocked_subscribers,
    COUNT(*) FILTER (WHERE last_activity > NOW() - INTERVAL '7 days') as active_last_7_days,
    COUNT(*) FILTER (WHERE last_activity > NOW() - INTERVAL '30 days') as active_last_30_days,
    COUNT(*) FILTER (WHERE subscribed_at > NOW() - INTERVAL '7 days') as new_last_7_days,
    COUNT(*) FILTER (WHERE subscribed_at > NOW() - INTERVAL '30 days') as new_last_30_days
FROM subscribers;
```

## 🔧 Настройка

### 1. Выполнение миграций

```bash
# Запуск миграций
npm run migrate

# Или вручную через Supabase SQL Editor
# Скопируйте содержимое файла migrations/001_create_subscribers_table.sql
```

### 2. Настройка переменных окружения

```bash
# В Railway Dashboard или .env файле:
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Проверка настроек

```bash
# Проверка переменных окружения
npm run check:env

# Тестирование системы подписчиков
npm run test:subscribers
```

## 📊 API SubscriptionService

### Основные методы

#### `subscribeUser(telegramId, userName)`
Подписывает пользователя на уведомления:

```javascript
const result = await subscriptionService.subscribeUser(123456789, 'John Doe');
// Возвращает: { success: true, data: subscriberData }
```

#### `unsubscribeUser(telegramId)`
Отписывает пользователя от уведомлений:

```javascript
const result = await subscriptionService.unsubscribeUser(123456789);
// Возвращает: { success: true, data: subscriberData }
```

#### `getActiveSubscribers()`
Получает список активных подписчиков:

```javascript
const subscribers = await subscriptionService.getActiveSubscribers();
// Возвращает: [{ telegram_id, first_name, username, last_activity }]
```

#### `getSubscriberStats()`
Получает статистику подписчиков:

```javascript
const stats = await subscriptionService.getSubscriberStats();
// Возвращает: { total_subscribers, active_subscribers, ... }
```

#### `updateLastActivity(telegramId)`
Обновляет время последней активности:

```javascript
await subscriptionService.updateLastActivity(123456789);
```

#### `logActivity(telegramId, action, details)`
Логирует действие пользователя:

```javascript
await subscriptionService.logActivity(123456789, 'interaction', {
  message: 'Поиск масла',
  oil: 'лаванда'
});
```

## 📈 Мониторинг и аналитика

### Ключевые метрики

1. **Общее количество подписчиков** - `total_subscribers`
2. **Активные подписчики** - `active_subscribers`
3. **Активность за 7/30 дней** - `active_last_7_days`, `active_last_30_days`
4. **Новые подписчики** - `new_last_7_days`, `new_last_30_days`

### Запросы для аналитики

```sql
-- Топ активных пользователей
SELECT telegram_id, first_name, last_activity 
FROM subscribers 
WHERE subscription_status = 'active' 
ORDER BY last_activity DESC 
LIMIT 10;

-- Статистика по часовым поясам
SELECT timezone, COUNT(*) as count 
FROM subscribers 
GROUP BY timezone 
ORDER BY count DESC;

-- Активность по дням недели
SELECT 
    EXTRACT(DOW FROM last_activity) as day_of_week,
    COUNT(*) as activity_count
FROM subscribers 
WHERE last_activity > NOW() - INTERVAL '30 days'
GROUP BY day_of_week 
ORDER BY day_of_week;
```

## 🔒 Безопасность

### Row Level Security (RLS)

Включены политики безопасности:

```sql
-- Только чтение для анонимных пользователей
CREATE POLICY "Allow read access to subscribers" ON subscribers
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to activity logs" ON subscriber_activity_log
    FOR SELECT USING (true);
```

### Рекомендации по безопасности

1. **Ограничьте доступ к таблицам** - настройте RLS политики
2. **Логируйте все действия** - используйте `subscriber_activity_log`
3. **Валидируйте данные** - проверяйте входные данные
4. **Мониторьте активность** - отслеживайте подозрительную активность

## 🚀 Развертывание

### Railway

1. **Подключите репозиторий** к Railway
2. **Настройте переменные окружения**:
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. **Выполните миграции**:
   ```bash
   npm run migrate
   ```
4. **Протестируйте систему**:
   ```bash
   npm run test:subscribers
   ```

### Локальная разработка

1. **Создайте проект в Supabase**
2. **Скопируйте credentials** в `.env` файл
3. **Выполните миграции**:
   ```bash
   npm run migrate
   ```
4. **Запустите тесты**:
   ```bash
   npm run test:subscribers
   ```

## 🐛 Отладка

### Частые проблемы

1. **"Supabase credentials not found"**
   - Проверьте переменные окружения
   - Убедитесь, что `SUPABASE_URL` и `SUPABASE_ANON_KEY` установлены

2. **"Table does not exist"**
   - Выполните миграции: `npm run migrate`
   - Проверьте SQL в Supabase Dashboard

3. **"Permission denied"**
   - Проверьте RLS политики
   - Убедитесь, что анонимный ключ имеет права на чтение

### Полезные команды

```bash
# Проверка подключения к базе данных
npm run test:subscribers

# Проверка переменных окружения
npm run check:env

# Запуск миграций
npm run migrate

# Просмотр логов
tail -f logs/app.log
```

## 📚 Дополнительные ресурсы

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Дата создания:** 6 августа 2025  
**Версия:** 1.0.0  
**Автор:** AI Assistant 