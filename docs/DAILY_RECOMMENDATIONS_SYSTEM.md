# Система Ежедневных Рекомендаций

## Обзор

Система ежедневных рекомендаций (Daily Recommendations System) - это комплексное решение для создания, управления и доставки персонализированных рекомендаций по ароматерапии пользователям бота.

## Архитектура

### База данных

#### Таблица `daily_recommendations`

```sql
CREATE TABLE public.daily_recommendations (
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
);
```

#### Индексы

- `idx_recommendations_chat_id` - для быстрого поиска по пользователю
- `idx_recommendations_date` - для поиска по дате
- `idx_recommendations_type` - для фильтрации по типу
- `idx_recommendations_chat_date` - составной индекс для поиска по пользователю и дате
- `idx_recommendations_unsent` - для поиска неотправленных рекомендаций

### Сервисы

#### DailyRecommendationsService

Основной сервис для работы с рекомендациями.

**Основные методы:**

- `createRecommendation(chatId, recommendationData)` - создание новой рекомендации
- `getUserRecommendations(chatId, startDate, endDate)` - получение рекомендаций пользователя
- `getRecommendationByDate(chatId, date)` - получение рекомендации на конкретную дату
- `markAsSent(recommendationId)` - отметка как отправленной
- `markAsRead(recommendationId)` - отметка как прочитанной
- `saveUserFeedback(recommendationId, feedback)` - сохранение обратной связи
- `generatePersonalizedRecommendation(chatId, userProfile)` - генерация персонализированной рекомендации

## Типы рекомендаций

### 1. Morning Boost (Утренний заряд)
- **Время**: 6:00 - 12:00
- **Цель**: Энергия и концентрация
- **Масла**: Мята перечная, Розмарин, Эвкалипт
- **Музыка**: Энергичная, поп

### 2. Afternoon Focus (Дневная концентрация)
- **Время**: 12:00 - 18:00
- **Цель**: Фокус и продуктивность
- **Масла**: Розмарин, Базилик, Лимон
- **Музыка**: Концентрированная, инструментальная

### 3. Evening Relax (Вечернее расслабление)
- **Время**: 18:00 - 22:00
- **Цель**: Расслабление и спокойствие
- **Масла**: Лаванда, Ромашка, Иланг-иланг
- **Музыка**: Расслабляющая, ambient

### 4. Night Sleep (Ночной сон)
- **Время**: 22:00 - 6:00
- **Цель**: Глубокий сон
- **Масла**: Лаванда, Ромашка, Бергамот
- **Музыка**: Успокаивающая, классическая

## Персонализация

### Факторы персонализации

1. **Время суток** - автоматическое определение типа рекомендации
2. **Предпочтения пользователя** - любимые масла из профиля
3. **История использования** - часто используемые масла
4. **Настроение** - последнее зафиксированное настроение
5. **Цели** - текущие цели пользователя
6. **Активность** - количество дней подряд использования

### Алгоритм выбора масел

```javascript
function selectOilsForUser(userProfile) {
  const favoriteOils = userProfile?.stats?.favorite_oils || [];
  const lastMood = userProfile?.current_state?.last_mood;

  // Базовые масла по настроению
  const moodOils = {
    'energetic': ['Мята перечная', 'Розмарин', 'Эвкалипт'],
    'relaxed': ['Лаванда', 'Ромашка', 'Иланг-иланг'],
    'focused': ['Розмарин', 'Базилик', 'Лимон'],
    'stressed': ['Лаванда', 'Бергамот', 'Ромашка']
  };

  let selectedOils = moodOils[lastMood] || moodOils['energetic'];
  
  // Добавляем любимые масла пользователя
  if (favoriteOils.length > 0) {
    selectedOils = [...new Set([...favoriteOils.slice(0, 2), ...selectedOils.slice(0, 1)])];
  }

  return {
    oils: selectedOils.slice(0, 3),
    effects: getOilEffects(selectedOils),
    blend_ratio: '1:1:1'
  };
}
```

## Структура данных

### Рекомендация

```json
{
  "id": "uuid",
  "chat_id": 123456789,
  "recommendation_date": "2025-08-06",
  "recommendation_type": "morning_boost",
  "oils_recommended": {
    "oils": ["Мята перечная", "Розмарин", "Эвкалипт"],
    "effects": ["энергия", "концентрация", "освежение"],
    "blend_ratio": "1:1:1"
  },
  "music_recommendations": {
    "mood": "энергичная",
    "genre": "pop",
    "duration": 25,
    "youtube": "https://youtube.com/watch?v=example",
    "apple_music": null,
    "yandex_music": null
  },
  "instructions": "Используйте масла утром для бодрости и концентрации",
  "user_feedback": {
    "notes": "Отличные масла, очень помогли",
    "rating": 5,
    "used_oils": true,
    "effectiveness": "high",
    "listened_music": true
  },
  "was_sent": true,
  "sent_at": "2025-08-06T09:00:00Z",
  "read_at": null,
  "created_at": "2025-08-06T08:30:00Z"
}
```

## API Endpoints

### Создание рекомендации

```javascript
POST /api/recommendations
{
  "chat_id": 123456789,
  "type": "morning_boost",
  "oils": {
    "oils": ["Мята перечная", "Розмарин"],
    "effects": ["энергия", "концентрация"],
    "blend_ratio": "1:1"
  },
  "music": {
    "mood": "энергичная",
    "duration": 25
  },
  "instructions": "Используйте масла утром"
}
```

### Получение рекомендаций пользователя

```javascript
GET /api/recommendations/user/:chatId?startDate=2025-08-01&endDate=2025-08-07
```

### Обновление статуса

```javascript
PUT /api/recommendations/:id/sent
PUT /api/recommendations/:id/read
```

### Сохранение обратной связи

```javascript
PUT /api/recommendations/:id/feedback
{
  "rating": 5,
  "used_oils": true,
  "effectiveness": "high",
  "notes": "Отличные масла"
}
```

## Статистика и аналитика

### Метрики

1. **Общие метрики**
   - Общее количество рекомендаций
   - Количество отправленных рекомендаций
   - Количество прочитанных рекомендаций
   - Средний рейтинг

2. **Метрики по типам**
   - Популярность типов рекомендаций
   - Эффективность по типам
   - Время открытия по типам

3. **Пользовательские метрики**
   - Процент использования масел
   - Время между рекомендациями
   - Длительность использования

### Функция статистики

```sql
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
)
```

## Автоматизация

### Триггеры

1. **Автоматическое обновление статистики пользователя**
   - При создании новой рекомендации увеличивается счетчик `recommendations_received`

2. **Очистка старых данных**
   - Автоматическое удаление рекомендаций старше 90 дней

### Представления

```sql
CREATE VIEW public.recommendations_summary AS
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
```

## Тестирование

### Тестовые сценарии

1. **Создание рекомендации**
   - Проверка корректности данных
   - Валидация обязательных полей
   - Проверка связей с пользователем

2. **Персонализация**
   - Тестирование алгоритма выбора масел
   - Проверка влияния предпочтений пользователя
   - Тестирование различных типов рекомендаций

3. **Статусы**
   - Отметка как отправленной
   - Отметка как прочитанной
   - Сохранение обратной связи

4. **Статистика**
   - Корректность подсчета метрик
   - Работа с временными периодами
   - Агрегация данных

### Запуск тестов

```bash
node scripts/testDailyRecommendations.js
```

## Развертывание

### Миграция

```bash
# Запуск миграции
node migrations/run.js
```

### Переменные окружения

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Мониторинг

### Логирование

- Создание рекомендаций
- Отправка рекомендаций
- Обратная связь пользователей
- Ошибки системы

### Алерты

- Высокий процент неотправленных рекомендаций
- Низкий рейтинг эффективности
- Ошибки в создании рекомендаций

## Планы развития

### Краткосрочные (1-2 месяца)

1. **A/B тестирование**
   - Тестирование различных типов рекомендаций
   - Оптимизация алгоритма персонализации

2. **Уведомления**
   - Push-уведомления о новых рекомендациях
   - Напоминания о неиспользованных рекомендациях

3. **Интеграция с календарем**
   - Синхронизация с календарем пользователя
   - Учет запланированных событий

### Среднесрочные (3-6 месяцев)

1. **Машинное обучение**
   - Предсказание предпочтений пользователя
   - Оптимизация времени отправки
   - Адаптация к сезонным изменениям

2. **Групповые рекомендации**
   - Рекомендации для семей
   - Совместные сессии ароматерапии

3. **Расширенная аналитика**
   - Детальная аналитика эффективности
   - Корреляция с внешними факторами

### Долгосрочные (6+ месяцев)

1. **Интеграция с IoT**
   - Управление диффузорами
   - Автоматическое включение/выключение

2. **Социальные функции**
   - Обмен рекомендациями между пользователями
   - Рейтинги и отзывы

3. **Персонализированные программы**
   - Многонедельные программы ароматерапии
   - Адаптация к целям пользователя

## Заключение

Система ежедневных рекомендаций предоставляет мощный инструмент для персонализации опыта пользователей ароматерапевтического бота. Система автоматически создает рекомендации на основе предпочтений пользователя, времени суток и истории использования, обеспечивая максимальную эффективность и удовлетворенность пользователей. 