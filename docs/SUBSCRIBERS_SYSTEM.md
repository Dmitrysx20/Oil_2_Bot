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
CREATE TABLE public.subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_id bigint NOT NULL,
  username text NULL,
  first_name text NULL,
  last_name text NULL,
  language_code text NULL DEFAULT 'ru'::text,
  is_active boolean NULL DEFAULT true,
  subscription_date timestamp without time zone NULL DEFAULT now(),
  last_activity timestamp without time zone NULL DEFAULT now(),
  timezone text NULL DEFAULT 'Europe/Moscow'::text,
  preferences jsonb NULL DEFAULT '{"language": "ru", "evening_time": "20:00", "morning_time": "09:00", "weekend_mode": false, "music_platforms": ["youtube"], "notification_enabled": true}'::jsonb,
  stats jsonb NULL DEFAULT '{"favorite_oils": [], "feedback_given": 0, "most_active_hour": 12, "avg_response_time": 0, "total_interactions": 0, "recommendations_received": 0}'::jsonb,
  current_state jsonb NULL DEFAULT '{"last_mood": null, "last_goals": [], "streak_days": 0, "current_program": null}'::jsonb,
  created_at timestamp without time zone NULL DEFAULT now(),
  updated_at timestamp without time zone NULL DEFAULT now(),
  CONSTRAINT subscribers_pkey PRIMARY KEY (id),
  CONSTRAINT subscribers_chat_id_key UNIQUE (chat_id)
);
```

**Поля:**
- `chat_id` - уникальный ID пользователя в Telegram
- `is_active` - статус активности пользователя
- `language_code` - код языка пользователя
- `timezone` - часовой пояс пользователя
- `preferences` - настройки пользователя (язык, время уведомлений, платформы)
- `stats` - статистика пользователя (любимые масла, активность, отзывы)
- `current_state` - текущее состояние пользователя (настроение, цели, программы)

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
CREATE OR REPLACE VIEW subscribers_stats AS
SELECT 
    COUNT(*) as total_subscribers,
    COUNT(*) FILTER (WHERE is_active = true) as active_subscribers,
    COUNT(*) FILTER (WHERE is_active = false) as inactive_subscribers,
    COUNT(*) FILTER (WHERE last_activity > NOW() - INTERVAL '7 days') as active_last_7_days,
    COUNT(*) FILTER (WHERE last_activity > NOW() - INTERVAL '30 days') as active_last_30_days,
    COUNT(*) FILTER (WHERE subscription_date > NOW() - INTERVAL '7 days') as new_last_7_days,
    COUNT(*) FILTER (WHERE subscription_date > NOW() - INTERVAL '30 days') as new_last_30_days,
    COUNT(*) FILTER (WHERE (stats->>'total_interactions')::int > 0) as engaged_users,
    AVG((stats->>'total_interactions')::int) as avg_interactions_per_user,
    COUNT(*) FILTER (WHERE (current_state->>'streak_days')::int > 7) as loyal_users
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

#### `updateUserPreferences(telegramId, preferences)`
Обновляет настройки пользователя:

```javascript
const preferences = {
  language: 'ru',
  evening_time: '21:00',
  morning_time: '08:00',
  weekend_mode: true,
  music_platforms: ['youtube', 'spotify'],
  notification_enabled: true
};
await subscriptionService.updateUserPreferences(telegramId, preferences);
```

#### `updateUserStats(telegramId, stats)`
Обновляет статистику пользователя:

```javascript
const stats = {
  favorite_oils: ['лаванда', 'мята'],
  feedback_given: 5,
  total_interactions: 25,
  recommendations_received: 10
};
await subscriptionService.updateUserStats(telegramId, stats);
```

#### `updateUserState(telegramId, state)`
Обновляет текущее состояние пользователя:

```javascript
const state = {
  last_mood: 'energetic',
  last_goals: ['концентрация', 'энергия'],
  streak_days: 5,
  current_program: 'morning_boost'
};
await subscriptionService.updateUserState(telegramId, state);
```

#### `getUserProfile(telegramId)`
Получает полный профиль пользователя:

```javascript
const profile = await subscriptionService.getUserProfile(telegramId);
// Возвращает: { chat_id, first_name, is_active, preferences, stats, current_state }
```

#### `incrementInteraction(telegramId, interactionType)`
Увеличивает счетчик взаимодействий:

```javascript
await subscriptionService.incrementInteraction(telegramId, 'oil_search');
```

#### `addFavoriteOil(telegramId, oilName)`
Добавляет масло в список любимых:

```javascript
await subscriptionService.addFavoriteOil(telegramId, 'Лаванда');
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
SELECT chat_id, first_name, last_activity 
FROM subscribers 
WHERE is_active = true 
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