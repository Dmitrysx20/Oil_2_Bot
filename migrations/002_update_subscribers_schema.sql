-- Миграция 002: Обновление схемы таблицы подписчиков
-- Дата: 2025-08-06
-- Описание: Обновляет структуру таблицы subscribers в соответствии с новой схемой

-- Удаляем старую таблицу если она существует
DROP TABLE IF EXISTS subscribers CASCADE;

-- Создание новой таблицы subscribers с улучшенной структурой
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
) TABLESPACE pg_default;

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_subscribers_chat_id ON public.subscribers USING btree (chat_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_subscribers_active ON public.subscribers USING btree (is_active) TABLESPACE pg_default
WHERE (is_active = true);

CREATE INDEX IF NOT EXISTS idx_subscribers_last_activity ON public.subscribers USING btree (last_activity) TABLESPACE pg_default;

-- Создание функции для создания расписания по умолчанию
CREATE OR REPLACE FUNCTION create_default_schedule()
RETURNS TRIGGER AS $$
BEGIN
  -- Здесь можно добавить логику создания расписания по умолчанию
  -- Пока оставляем пустой для совместимости
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для автоматического создания расписания
CREATE TRIGGER trigger_create_default_schedule
  AFTER INSERT ON subscribers FOR EACH ROW
  EXECUTE FUNCTION create_default_schedule();

-- Создание триггера для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscribers_updated_at 
    BEFORE UPDATE ON subscribers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Обновление представления статистики
DROP VIEW IF EXISTS subscribers_stats;

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

-- Добавление комментариев к таблице
COMMENT ON TABLE subscribers IS 'Таблица подписчиков Telegram бота ароматерапии с расширенной функциональностью';
COMMENT ON COLUMN subscribers.chat_id IS 'Telegram Chat ID пользователя';
COMMENT ON COLUMN subscribers.preferences IS 'Настройки пользователя (язык, время уведомлений, платформы)';
COMMENT ON COLUMN subscribers.stats IS 'Статистика пользователя (любимые масла, активность, отзывы)';
COMMENT ON COLUMN subscribers.current_state IS 'Текущее состояние пользователя (настроение, цели, программы)';

-- Создание RLS политик
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы subscribers (только чтение для анонимных пользователей)
CREATE POLICY "Allow read access to subscribers" ON subscribers
    FOR SELECT USING (true);

-- Создание таблицы для логирования действий подписчиков (если не существует)
CREATE TABLE IF NOT EXISTS subscriber_activity_log (
    id BIGSERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для таблицы логов
CREATE INDEX IF NOT EXISTS idx_activity_log_chat_id ON subscriber_activity_log(chat_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON subscriber_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON subscriber_activity_log(created_at);

-- Политики для таблицы логов
ALTER TABLE subscriber_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to activity logs" ON subscriber_activity_log
    FOR SELECT USING (true); 