-- Миграция 003: Создание таблицы админских настроек
-- Дата: 2025-08-06
-- Описание: Создает таблицу для хранения админских настроек бота

-- Создание таблицы admin_settings
CREATE TABLE public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_chat_id bigint NOT NULL,
  bot_settings jsonb NULL DEFAULT '{"daily_stats": true, "maintenance_mode": false, "broadcast_enabled": true, "error_notifications": true, "new_user_notifications": true}'::jsonb,
  daily_stats jsonb NULL DEFAULT '{"errors": 0, "new_users": 0, "active_users": 0, "last_updated": null, "messages_sent": 0}'::jsonb,
  created_at timestamp without time zone NULL DEFAULT now(),
  updated_at timestamp without time zone NULL DEFAULT now(),
  CONSTRAINT admin_settings_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_admin_settings_chat_id ON public.admin_settings USING btree (admin_chat_id) TABLESPACE pg_default;

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER update_admin_settings_updated_at 
    BEFORE UPDATE ON admin_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Добавление комментариев к таблице
COMMENT ON TABLE admin_settings IS 'Таблица админских настроек бота ароматерапии';
COMMENT ON COLUMN admin_settings.admin_chat_id IS 'Telegram Chat ID администратора';
COMMENT ON COLUMN admin_settings.bot_settings IS 'Настройки бота (статистика, режим обслуживания, уведомления)';
COMMENT ON COLUMN admin_settings.daily_stats IS 'Ежедневная статистика (ошибки, пользователи, сообщения)';

-- Создание RLS политик
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы admin_settings (только чтение для анонимных пользователей)
CREATE POLICY "Allow read access to admin settings" ON admin_settings
    FOR SELECT USING (true);

-- Создание представления для агрегированной админской статистики
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    COUNT(DISTINCT admin_chat_id) as total_admins,
    COUNT(*) FILTER (WHERE (bot_settings->>'maintenance_mode')::boolean = true) as maintenance_mode_enabled,
    COUNT(*) FILTER (WHERE (bot_settings->>'daily_stats')::boolean = true) as daily_stats_enabled,
    COUNT(*) FILTER (WHERE (bot_settings->>'broadcast_enabled')::boolean = true) as broadcast_enabled,
    SUM((daily_stats->>'errors')::int) as total_errors,
    SUM((daily_stats->>'new_users')::int) as total_new_users,
    SUM((daily_stats->>'active_users')::int) as total_active_users,
    SUM((daily_stats->>'messages_sent')::int) as total_messages_sent,
    MAX((daily_stats->>'last_updated')::timestamp) as last_stats_update
FROM admin_settings;

-- Добавление комментария к представлению
COMMENT ON VIEW admin_dashboard_stats IS 'Агрегированная статистика админской панели';

-- Создание функции для инициализации админских настроек
CREATE OR REPLACE FUNCTION initialize_admin_settings(admin_chat_id_param bigint)
RETURNS void AS $$
BEGIN
  INSERT INTO admin_settings (admin_chat_id, bot_settings, daily_stats)
  VALUES (
    admin_chat_id_param,
    '{"daily_stats": true, "maintenance_mode": false, "broadcast_enabled": true, "error_notifications": true, "new_user_notifications": true}'::jsonb,
    '{"errors": 0, "new_users": 0, "active_users": 0, "last_updated": null, "messages_sent": 0}'::jsonb
  )
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Создание функции для обновления ежедневной статистики
CREATE OR REPLACE FUNCTION update_daily_stats(
  admin_chat_id_param bigint,
  errors_count int DEFAULT 0,
  new_users_count int DEFAULT 0,
  active_users_count int DEFAULT 0,
  messages_sent_count int DEFAULT 0
)
RETURNS void AS $$
BEGIN
  UPDATE admin_settings 
  SET daily_stats = jsonb_build_object(
    'errors', COALESCE((daily_stats->>'errors')::int, 0) + errors_count,
    'new_users', COALESCE((daily_stats->>'new_users')::int, 0) + new_users_count,
    'active_users', COALESCE((daily_stats->>'active_users')::int, 0) + active_users_count,
    'messages_sent', COALESCE((daily_stats->>'messages_sent')::int, 0) + messages_sent_count,
    'last_updated', now()
  )
  WHERE admin_chat_id = admin_chat_id_param;
END;
$$ LANGUAGE plpgsql; 