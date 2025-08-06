-- Миграция 004: Создание таблицы пользователей
-- Дата: 2025-08-06
-- Описание: Создает таблицу для хранения информации о пользователях бота

-- Создание таблицы users
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  telegram_id text NOT NULL,
  start_date timestamp with time zone NULL,
  current_day integer NULL,
  status text NULL,
  subscription_end timestamp with time zone NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_telegram_id_key UNIQUE (telegram_id)
) TABLESPACE pg_default;

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users USING btree (telegram_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_subscription_end ON public.users USING btree (subscription_end) TABLESPACE pg_default;

-- Создание триггера для автоматического обновления updated_at (если нужно)
-- ALTER TABLE users ADD COLUMN updated_at timestamp with time zone DEFAULT now();
-- CREATE TRIGGER update_users_updated_at 
--     BEFORE UPDATE ON users 
--     FOR EACH ROW 
--     EXECUTE FUNCTION update_updated_at_column();

-- Добавление комментариев к таблице
COMMENT ON TABLE users IS 'Таблица пользователей бота ароматерапии';
COMMENT ON COLUMN users.id IS 'Уникальный идентификатор пользователя (UUID)';
COMMENT ON COLUMN users.telegram_id IS 'Telegram ID пользователя (уникальный)';
COMMENT ON COLUMN users.start_date IS 'Дата начала использования бота';
COMMENT ON COLUMN users.current_day IS 'Текущий день использования бота';
COMMENT ON COLUMN users.status IS 'Статус пользователя (active, inactive, blocked, etc.)';
COMMENT ON COLUMN users.subscription_end IS 'Дата окончания подписки';

-- Создание RLS политик (если необходимо)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (все пользователи могут читать свои данные)
-- CREATE POLICY "Users can view own data" ON users
--     FOR SELECT USING (auth.uid()::text = telegram_id);

-- Политика для вставки (только авторизованные пользователи)
-- CREATE POLICY "Users can insert own data" ON users
--     FOR INSERT WITH CHECK (auth.uid()::text = telegram_id);

-- Политика для обновления (только свои данные)
-- CREATE POLICY "Users can update own data" ON users
--     FOR UPDATE USING (auth.uid()::text = telegram_id);

-- Создание функции для инициализации пользователя
CREATE OR REPLACE FUNCTION initialize_user(telegram_id_param text)
RETURNS json AS $$
DECLARE
    new_user_id uuid;
    result json;
BEGIN
    -- Проверяем, существует ли пользователь
    IF EXISTS (SELECT 1 FROM users WHERE telegram_id = telegram_id_param) THEN
        -- Пользователь уже существует, возвращаем информацию
        SELECT json_build_object(
            'success', true,
            'message', 'User already exists',
            'user_id', id,
            'telegram_id', telegram_id,
            'start_date', start_date,
            'current_day', current_day,
            'status', status,
            'subscription_end', subscription_end
        ) INTO result
        FROM users 
        WHERE telegram_id = telegram_id_param;
        
        RETURN result;
    ELSE
        -- Создаем нового пользователя
        INSERT INTO users (telegram_id, start_date, current_day, status)
        VALUES (
            telegram_id_param,
            now(),
            1,
            'active'
        )
        RETURNING id INTO new_user_id;
        
        -- Возвращаем информацию о созданном пользователе
        SELECT json_build_object(
            'success', true,
            'message', 'User created successfully',
            'user_id', id,
            'telegram_id', telegram_id,
            'start_date', start_date,
            'current_day', current_day,
            'status', status,
            'subscription_end', subscription_end
        ) INTO result
        FROM users 
        WHERE id = new_user_id;
        
        RETURN result;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to initialize user'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Добавление комментария к функции
COMMENT ON FUNCTION initialize_user(text) IS 'Инициализирует нового пользователя или возвращает информацию о существующем';

-- Создание функции для обновления дня пользователя
CREATE OR REPLACE FUNCTION update_user_day(telegram_id_param text, new_day integer)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    -- Обновляем день пользователя
    UPDATE users 
    SET current_day = new_day
    WHERE telegram_id = telegram_id_param;
    
    -- Проверяем, был ли пользователь обновлен
    IF FOUND THEN
        -- Возвращаем обновленную информацию
        SELECT json_build_object(
            'success', true,
            'message', 'User day updated successfully',
            'user_id', id,
            'telegram_id', telegram_id,
            'current_day', current_day,
            'status', status
        ) INTO result
        FROM users 
        WHERE telegram_id = telegram_id_param;
        
        RETURN result;
    ELSE
        RETURN json_build_object(
            'success', false,
            'message', 'User not found'
        );
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to update user day'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Добавление комментария к функции
COMMENT ON FUNCTION update_user_day(text, integer) IS 'Обновляет текущий день пользователя';

-- Создание функции для обновления статуса пользователя
CREATE OR REPLACE FUNCTION update_user_status(telegram_id_param text, new_status text)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    -- Обновляем статус пользователя
    UPDATE users 
    SET status = new_status
    WHERE telegram_id = telegram_id_param;
    
    -- Проверяем, был ли пользователь обновлен
    IF FOUND THEN
        -- Возвращаем обновленную информацию
        SELECT json_build_object(
            'success', true,
            'message', 'User status updated successfully',
            'user_id', id,
            'telegram_id', telegram_id,
            'status', status
        ) INTO result
        FROM users 
        WHERE telegram_id = telegram_id_param;
        
        RETURN result;
    ELSE
        RETURN json_build_object(
            'success', false,
            'message', 'User not found'
        );
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to update user status'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Добавление комментария к функции
COMMENT ON FUNCTION update_user_status(text, text) IS 'Обновляет статус пользователя'; 