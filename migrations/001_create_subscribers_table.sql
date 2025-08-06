-- Миграция 001: Создание таблицы подписчиков
-- Дата: 2025-08-06
-- Описание: Создает основную таблицу для хранения информации о подписчиках бота

-- Создание таблицы subscribers
CREATE TABLE IF NOT EXISTS subscribers (
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

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_subscribers_telegram_id ON subscribers(telegram_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(subscription_status);
CREATE INDEX IF NOT EXISTS idx_subscribers_last_activity ON subscribers(last_activity);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed_at ON subscribers(subscribed_at);

-- Создание триггера для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscribers_updated_at 
    BEFORE UPDATE ON subscribers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Создание таблицы для логирования действий подписчиков
CREATE TABLE IF NOT EXISTS subscriber_activity_log (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для таблицы логов
CREATE INDEX IF NOT EXISTS idx_activity_log_telegram_id ON subscriber_activity_log(telegram_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON subscriber_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON subscriber_activity_log(created_at);

-- Создание представления для статистики подписчиков
CREATE OR REPLACE VIEW subscribers_stats AS
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

-- Добавление комментариев к таблицам
COMMENT ON TABLE subscribers IS 'Таблица подписчиков Telegram бота ароматерапии';
COMMENT ON TABLE subscriber_activity_log IS 'Лог активности подписчиков';
COMMENT ON VIEW subscribers_stats IS 'Статистика подписчиков';

-- Создание RLS (Row Level Security) политик
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_activity_log ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы subscribers (только чтение для анонимных пользователей)
CREATE POLICY "Allow read access to subscribers" ON subscribers
    FOR SELECT USING (true);

-- Политики для таблицы логов (только чтение для анонимных пользователей)
CREATE POLICY "Allow read access to activity logs" ON subscriber_activity_log
    FOR SELECT USING (true); 