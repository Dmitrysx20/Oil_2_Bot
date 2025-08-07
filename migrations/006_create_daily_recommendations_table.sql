-- Миграция 006: Создание таблицы ежедневных рекомендаций
-- Дата: 2025-08-06
-- Описание: Таблица для хранения ежедневных рекомендаций пользователям

-- Создание таблицы daily_recommendations
CREATE TABLE IF NOT EXISTS public.daily_recommendations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_id bigint NULL,
  recommendation_date date NULL DEFAULT CURRENT_DATE,
  recommendation_type text NOT NULL,
  oils_recommended jsonb NOT NULL,
  music_recommendations jsonb NULL DEFAULT '{"mood": null, "genre": null, "youtube": null, "duration": 20, "apple_music": null, "yandex_music": null}'::jsonb,
  instructions text NULL,
  user_feedback jsonb NULL DEFAULT '{"notes": null, "rating": null, "used_oils": false, "effectiveness": null, "listened_music": false}'::jsonb,
  was_sent boolean NULL DEFAULT false,
  sent_at timestamp without time zone NULL,
  read_at timestamp without time zone NULL,
  created_at timestamp without time zone NULL DEFAULT now(),
  CONSTRAINT daily_recommendations_pkey PRIMARY KEY (id),
  CONSTRAINT daily_recommendations_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES subscribers (chat_id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_recommendations_chat_id ON public.daily_recommendations USING btree (chat_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_recommendations_date ON public.daily_recommendations USING btree (recommendation_date) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_recommendations_type ON public.daily_recommendations USING btree (recommendation_type) TABLESPACE pg_default;

-- Создание составного индекса для быстрого поиска рекомендаций по пользователю и дате
CREATE INDEX IF NOT EXISTS idx_recommendations_chat_date ON public.daily_recommendations USING btree (chat_id, recommendation_date) TABLESPACE pg_default;

-- Создание индекса для поиска неотправленных рекомендаций
CREATE INDEX IF NOT EXISTS idx_recommendations_unsent ON public.daily_recommendations USING btree (was_sent) WHERE was_sent = false TABLESPACE pg_default;

-- Добавление комментариев к таблице и колонкам
COMMENT ON TABLE public.daily_recommendations IS 'Таблица для хранения ежедневных рекомендаций пользователям';
COMMENT ON COLUMN public.daily_recommendations.id IS 'Уникальный идентификатор рекомендации';
COMMENT ON COLUMN public.daily_recommendations.chat_id IS 'ID чата пользователя (ссылка на subscribers)';
COMMENT ON COLUMN public.daily_recommendations.recommendation_date IS 'Дата рекомендации (по умолчанию текущая)';
COMMENT ON COLUMN public.daily_recommendations.recommendation_type IS 'Тип рекомендации (morning, evening, custom, etc.)';
COMMENT ON COLUMN public.daily_recommendations.oils_recommended IS 'JSON с рекомендованными маслами и их свойствами';
COMMENT ON COLUMN public.daily_recommendations.music_recommendations IS 'JSON с музыкальными рекомендациями';
COMMENT ON COLUMN public.daily_recommendations.instructions IS 'Текстовые инструкции по использованию';
COMMENT ON COLUMN public.daily_recommendations.user_feedback IS 'JSON с обратной связью от пользователя';
COMMENT ON COLUMN public.daily_recommendations.was_sent IS 'Флаг отправки рекомендации';
COMMENT ON COLUMN public.daily_recommendations.sent_at IS 'Время отправки рекомендации';
COMMENT ON COLUMN public.daily_recommendations.read_at IS 'Время прочтения пользователем';
COMMENT ON COLUMN public.daily_recommendations.created_at IS 'Время создания записи';

-- Создание представления для удобного просмотра рекомендаций
CREATE OR REPLACE VIEW public.recommendations_summary AS
SELECT 
  dr.id,
  dr.chat_id,
  s.username,
  dr.recommendation_date,
  dr.recommendation_type,
  dr.oils_recommended,
  dr.music_recommendations,
  dr.was_sent,
  dr.sent_at,
  dr.read_at,
  dr.user_feedback,
  dr.created_at
FROM public.daily_recommendations dr
LEFT JOIN public.subscribers s ON dr.chat_id = s.chat_id
ORDER BY dr.recommendation_date DESC, dr.created_at DESC;

COMMENT ON VIEW public.recommendations_summary IS 'Представление для удобного просмотра рекомендаций с информацией о пользователях';

-- Создание функции для получения статистики рекомендаций
CREATE OR REPLACE FUNCTION public.get_recommendations_stats(
  start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_recommendations bigint,
  sent_recommendations bigint,
  read_recommendations bigint,
  avg_rating numeric,
  most_popular_type text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_recommendations,
    COUNT(*) FILTER (WHERE was_sent = true)::bigint as sent_recommendations,
    COUNT(*) FILTER (WHERE read_at IS NOT NULL)::bigint as read_recommendations,
    AVG((user_feedback->>'rating')::numeric) as avg_rating,
    (SELECT recommendation_type 
     FROM public.daily_recommendations 
     WHERE recommendation_date BETWEEN start_date AND end_date
     GROUP BY recommendation_type 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) as most_popular_type
  FROM public.daily_recommendations
  WHERE recommendation_date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_recommendations_stats IS 'Функция для получения статистики рекомендаций за период';

-- Создание триггера для автоматического обновления статистики пользователя
CREATE OR REPLACE FUNCTION public.update_user_recommendations_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Обновляем счетчик рекомендаций в таблице subscribers
  UPDATE public.subscribers 
  SET stats = jsonb_set(
    COALESCE(stats, '{}'::jsonb),
    '{recommendations_received}',
    (COALESCE((stats->>'recommendations_received')::int, 0) + 1)::text::jsonb
  )
  WHERE chat_id = NEW.chat_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера
CREATE TRIGGER trigger_update_recommendations_count
  AFTER INSERT ON public.daily_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_recommendations_count();

COMMENT ON TRIGGER trigger_update_recommendations_count ON public.daily_recommendations IS 'Триггер для автоматического обновления счетчика рекомендаций пользователя';

-- Вставка тестовых данных (опционально)
-- INSERT INTO public.daily_recommendations (chat_id, recommendation_type, oils_recommended, instructions) VALUES
-- (123456789, 'morning_boost', '{"oils": ["Мята перечная", "Розмарин"], "effects": ["энергия", "концентрация"]}', 'Используйте масла утром для бодрости'),
-- (123456789, 'evening_relax', '{"oils": ["Лаванда", "Ромашка"], "effects": ["расслабление", "сон"]}', 'Используйте масла вечером для расслабления');

-- Логирование создания миграции
DO $$
BEGIN
  RAISE NOTICE 'Миграция 006: Таблица daily_recommendations успешно создана';
  RAISE NOTICE 'Созданы индексы для оптимизации запросов';
  RAISE NOTICE 'Создано представление recommendations_summary';
  RAISE NOTICE 'Создана функция get_recommendations_stats';
  RAISE NOTICE 'Создан триггер для обновления статистики пользователей';
END $$; 