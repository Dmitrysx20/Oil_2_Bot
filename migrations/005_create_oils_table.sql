-- Миграция 005: Создание таблицы масел
-- Дата: 2025-08-06
-- Описание: Создает таблицу для хранения информации о маслах ароматерапии

-- Создание таблицы oils
CREATE TABLE public.oils (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  oil_name text NOT NULL,
  description text NULL,
  keywords text NULL,
  emotional_effect text NULL,
  physical_effect text NULL,
  applications text NULL,
  safety_warning text NULL,
  joke text NULL,
  CONSTRAINT oils_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_oils_name ON public.oils USING btree (oil_name) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_oils_keywords ON public.oils USING gin (to_tsvector('russian', keywords)) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_oils_emotional_effect ON public.oils USING gin (to_tsvector('russian', emotional_effect)) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_oils_physical_effect ON public.oils USING gin (to_tsvector('russian', physical_effect)) TABLESPACE pg_default;

-- Добавление комментариев к таблице
COMMENT ON TABLE oils IS 'Таблица масел ароматерапии';
COMMENT ON COLUMN oils.id IS 'Уникальный идентификатор масла (UUID)';
COMMENT ON COLUMN oils.oil_name IS 'Название масла';
COMMENT ON COLUMN oils.description IS 'Описание масла';
COMMENT ON COLUMN oils.keywords IS 'Ключевые слова для поиска';
COMMENT ON COLUMN oils.emotional_effect IS 'Эмоциональный эффект масла';
COMMENT ON COLUMN oils.physical_effect IS 'Физический эффект масла';
COMMENT ON COLUMN oils.applications IS 'Способы применения';
COMMENT ON COLUMN oils.safety_warning IS 'Предупреждения по безопасности';
COMMENT ON COLUMN oils.joke IS 'Шутка или интересный факт о масле';

-- Создание RLS политик (если необходимо)
-- ALTER TABLE oils ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (все пользователи могут читать данные о маслах)
-- CREATE POLICY "Anyone can view oils" ON oils
--     FOR SELECT USING (true);

-- Политика для вставки (только администраторы)
-- CREATE POLICY "Admins can insert oils" ON oils
--     FOR INSERT WITH CHECK (auth.uid()::text IN (SELECT admin_chat_id::text FROM admin_settings));

-- Политика для обновления (только администраторы)
-- CREATE POLICY "Admins can update oils" ON oils
--     FOR UPDATE USING (auth.uid()::text IN (SELECT admin_chat_id::text FROM admin_settings));

-- Создание функции для поиска масел по ключевым словам
CREATE OR REPLACE FUNCTION search_oils(search_query text)
RETURNS TABLE (
    id uuid,
    oil_name text,
    description text,
    keywords text,
    emotional_effect text,
    physical_effect text,
    applications text,
    safety_warning text,
    joke text,
    relevance_score float
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.oil_name,
        o.description,
        o.keywords,
        o.emotional_effect,
        o.physical_effect,
        o.applications,
        o.safety_warning,
        o.joke,
        ts_rank(
            to_tsvector('russian', 
                COALESCE(o.oil_name, '') || ' ' || 
                COALESCE(o.keywords, '') || ' ' || 
                COALESCE(o.emotional_effect, '') || ' ' || 
                COALESCE(o.physical_effect, '') || ' ' || 
                COALESCE(o.description, '')
            ),
            to_tsquery('russian', search_query)
        ) as relevance_score
    FROM oils o
    WHERE 
        to_tsvector('russian', 
            COALESCE(o.oil_name, '') || ' ' || 
            COALESCE(o.keywords, '') || ' ' || 
            COALESCE(o.emotional_effect, '') || ' ' || 
            COALESCE(o.physical_effect, '') || ' ' || 
            COALESCE(o.description, '')
        ) @@ to_tsquery('russian', search_query)
    ORDER BY relevance_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Добавление комментария к функции
COMMENT ON FUNCTION search_oils(text) IS 'Поиск масел по ключевым словам с релевантностью';

-- Создание функции для получения случайного масла
CREATE OR REPLACE FUNCTION get_random_oil()
RETURNS TABLE (
    id uuid,
    oil_name text,
    description text,
    keywords text,
    emotional_effect text,
    physical_effect text,
    applications text,
    safety_warning text,
    joke text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.oil_name,
        o.description,
        o.keywords,
        o.emotional_effect,
        o.physical_effect,
        o.applications,
        o.safety_warning,
        o.joke
    FROM oils o
    ORDER BY random()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Добавление комментария к функции
COMMENT ON FUNCTION get_random_oil() IS 'Возвращает случайное масло из базы данных';

-- Создание функции для получения масел по эффекту
CREATE OR REPLACE FUNCTION get_oils_by_effect(effect_type text, effect_query text)
RETURNS TABLE (
    id uuid,
    oil_name text,
    description text,
    keywords text,
    emotional_effect text,
    physical_effect text,
    applications text,
    safety_warning text,
    joke text,
    relevance_score float
) AS $$
BEGIN
    IF effect_type = 'emotional' THEN
        RETURN QUERY
        SELECT 
            o.id,
            o.oil_name,
            o.description,
            o.keywords,
            o.emotional_effect,
            o.physical_effect,
            o.applications,
            o.safety_warning,
            o.joke,
            ts_rank(
                to_tsvector('russian', COALESCE(o.emotional_effect, '')),
                to_tsquery('russian', effect_query)
            ) as relevance_score
        FROM oils o
        WHERE 
            to_tsvector('russian', COALESCE(o.emotional_effect, '')) @@ to_tsquery('russian', effect_query)
        ORDER BY relevance_score DESC;
    ELSIF effect_type = 'physical' THEN
        RETURN QUERY
        SELECT 
            o.id,
            o.oil_name,
            o.description,
            o.keywords,
            o.emotional_effect,
            o.physical_effect,
            o.applications,
            o.safety_warning,
            o.joke,
            ts_rank(
                to_tsvector('russian', COALESCE(o.physical_effect, '')),
                to_tsquery('russian', effect_query)
            ) as relevance_score
        FROM oils o
        WHERE 
            to_tsvector('russian', COALESCE(o.physical_effect, '')) @@ to_tsquery('russian', effect_query)
        ORDER BY relevance_score DESC;
    ELSE
        RAISE EXCEPTION 'Invalid effect_type. Use "emotional" or "physical"';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Добавление комментария к функции
COMMENT ON FUNCTION get_oils_by_effect(text, text) IS 'Поиск масел по типу эффекта (эмоциональный или физический)';

-- Создание функции для добавления нового масла
CREATE OR REPLACE FUNCTION add_oil(
    oil_name_param text,
    description_param text DEFAULT NULL,
    keywords_param text DEFAULT NULL,
    emotional_effect_param text DEFAULT NULL,
    physical_effect_param text DEFAULT NULL,
    applications_param text DEFAULT NULL,
    safety_warning_param text DEFAULT NULL,
    joke_param text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
    new_oil_id uuid;
    result json;
BEGIN
    -- Проверяем, существует ли масло с таким названием
    IF EXISTS (SELECT 1 FROM oils WHERE LOWER(oil_name) = LOWER(oil_name_param)) THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Oil with this name already exists'
        );
    END IF;
    
    -- Создаем новое масло
    INSERT INTO oils (
        oil_name,
        description,
        keywords,
        emotional_effect,
        physical_effect,
        applications,
        safety_warning,
        joke
    )
    VALUES (
        oil_name_param,
        description_param,
        keywords_param,
        emotional_effect_param,
        physical_effect_param,
        applications_param,
        safety_warning_param,
        joke_param
    )
    RETURNING id INTO new_oil_id;
    
    -- Возвращаем информацию о созданном масле
    SELECT json_build_object(
        'success', true,
        'message', 'Oil added successfully',
        'oil_id', id,
        'oil_name', oil_name,
        'description', description,
        'keywords', keywords,
        'emotional_effect', emotional_effect,
        'physical_effect', physical_effect,
        'applications', applications,
        'safety_warning', safety_warning,
        'joke', joke
    ) INTO result
    FROM oils 
    WHERE id = new_oil_id;
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to add oil'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Добавление комментария к функции
COMMENT ON FUNCTION add_oil(text, text, text, text, text, text, text, text) IS 'Добавляет новое масло в базу данных';

-- Вставка базовых масел для тестирования
INSERT INTO oils (oil_name, description, keywords, emotional_effect, physical_effect, applications, safety_warning, joke) VALUES
('Мята перечная', 'Освежающее масло с ментоловым ароматом', 'мята перечная, ментол, свежесть, бодрость, концентрация', 'Повышает концентрацию, снимает стресс, улучшает память', 'Снимает головную боль, улучшает пищеварение, освежает дыхание', 'Ингаляции, массаж, аромалампа, полоскание рта', 'Не использовать при беременности, избегать попадания в глаза', 'Почему мята перечная такая свежая? Потому что она всегда "мятная"!'),
('Мята садовая', 'Нежное масло с мягким мятным ароматом', 'мята садовая, мята колосистая, нежность, успокоение', 'Успокаивает нервы, снимает раздражительность, улучшает настроение', 'Успокаивает желудок, снимает тошноту, улучшает аппетит', 'Аромалампа, ванна, массаж живота, чай', 'Более мягкое действие, но не использовать при беременности', 'Мята садовая такая нежная, что даже пчелы приносят ей цветы!'),
('Мята лимонная', 'Освежающее масло с цитрусово-мятным ароматом', 'мята лимонная, цитрус, свежесть, энергия, лимон', 'Повышает энергию, улучшает настроение, снимает усталость', 'Улучшает пищеварение, снимает тошноту, освежает дыхание', 'Ингаляции, аромалампа, массаж, добавка в чай', 'Может вызывать фотосенсибилизацию, избегать солнца', 'Мята лимонная такая освежающая, что даже лимоны ей завидуют!'),
('Лаванда', 'Успокаивающее масло с цветочным ароматом', 'лаванда, спокойствие, сон, релаксация, цветы', 'Успокаивает нервную систему, улучшает сон, снимает тревогу', 'Снимает мышечное напряжение, заживляет раны, успокаивает кожу', 'Аромалампа, ванна, массаж, компрессы', 'Может вызывать сонливость, не использовать перед вождением', 'Лаванда - единственное растение, которое может усыпить даже будильник!'),
('Лаванда узколистная', 'Классическое масло лаванды с чистым ароматом', 'лаванда узколистная, лаванда настоящая, классика, чистота', 'Глубокое успокоение, улучшает качество сна, снимает стресс', 'Антисептическое действие, заживляет ожоги, снимает боль', 'Аромалампа, ванна, массаж, лечение ожогов', 'Не использовать при низком давлении, может вызывать сонливость', 'Лаванда узколистная такая классическая, что даже короли её используют!'),
('Эвкалипт', 'Очищающее масло с камфорным ароматом', 'эвкалипт, очищение, дыхание, простуда, камфора', 'Повышает ясность мышления, снимает усталость, улучшает концентрацию', 'Улучшает дыхание, снимает заложенность носа, антисептик', 'Ингаляции, растирания, аромалампа, полоскание', 'Не использовать при астме, избегать попадания в глаза', 'Эвкалипт так хорошо очищает, что даже бактерии просят отпуск!'),
('Эвкалипт лучистый', 'Мягкое масло эвкалипта с нежным ароматом', 'эвкалипт лучистый, мягкость, дыхание, дети', 'Успокаивает, снимает напряжение, улучшает дыхание', 'Мягко очищает дыхательные пути, подходит для детей', 'Ингаляции для детей, аромалампа, массаж груди', 'Более мягкое действие, подходит для детей старше 3 лет', 'Эвкалипт лучистый такой нежный, что даже дети его любят!'),
('Ромашка римская', 'Нежное масло с яблочным ароматом', 'ромашка римская, нежность, кожа, воспаление, яблоко', 'Снимает раздражительность, успокаивает, улучшает сон', 'Снимает воспаления, успокаивает кожу, заживляет раны', 'Компрессы, ванна, массаж, уход за кожей', 'Может вызывать аллергию у чувствительных людей', 'Ромашка римская такая нежная, что даже пчелы приносят ей извинения!'),
('Ромашка немецкая', 'Классическое масло ромашки с сильным действием', 'ромашка немецкая, классика, воспаление, желудок', 'Успокаивает, снимает стресс, улучшает настроение', 'Сильное противовоспалительное, успокаивает желудок', 'Компрессы, ванна, массаж, внутреннее применение', 'Сильное действие, не использовать при беременности', 'Ромашка немецкая такая сильная, что даже воспаления её боятся!'),
('Чайное дерево', 'Антисептическое масло с резким ароматом', 'чайное дерево, антисептик, иммунитет, акне, бактерии', 'Повышает уверенность, снимает тревогу, укрепляет дух', 'Укрепляет иммунитет, лечит кожные проблемы, антисептик', 'Точечное нанесение, ингаляции, аромалампа', 'Не принимать внутрь, может раздражать кожу', 'Чайное дерево так сильное, что даже микробы просят автограф!'),
('Розмарин', 'Стимулирующее масло с травяным ароматом', 'розмарин, память, концентрация, стимуляция, трава', 'Улучшает память и концентрацию, повышает энергию', 'Стимулирует кровообращение, снимает мышечную боль', 'Ингаляции, массаж, аромалампа, ванна', 'Не использовать при беременности и эпилепсии', 'Розмарин такой умный, что даже растения у него консультируются!'),
('Апельсин сладкий', 'Радостное масло с цитрусовым ароматом', 'апельсин, цитрус, радость, энергия, витамин C', 'Повышает настроение, снимает депрессию, дарит радость', 'Улучшает пищеварение, укрепляет иммунитет, освежает', 'Аромалампа, массаж, ванна, добавка в косметику', 'Может вызывать фотосенсибилизацию, избегать солнца', 'Апельсин такой радостный, что даже облака улыбаются!'); 