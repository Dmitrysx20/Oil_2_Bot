# Система Подписок на Рекомендации

## Обзор

Система подписок на рекомендации позволяет пользователям подписываться на автоматические утренние и вечерние рекомендации по ароматерапии. Система автоматически генерирует персонализированные рекомендации и отправляет их в указанное пользователем время.

## Как это работает

### 🌅 Утренние рекомендации

**Время отправки**: Настраивается пользователем (по умолчанию 09:00)

**Содержание**:
- Масла для бодрости и энергии
- Энергичная музыка
- Инструкции по использованию
- Мотивирующие сообщения

**Пример сообщения**:
```
🌅 **Доброе утро! Ваша утренняя рекомендация:**

🌿 **Масла для бодрости:**
1. Мята перечная
2. Розмарин
3. Эвкалипт

🎵 **Музыка для энергии:**
энергичная (25 мин)

💡 **Инструкция:**
Используйте масла в аромалампе для бодрости и концентрации

Хорошего дня! ✨
```

### 🌆 Вечерние рекомендации

**Время отправки**: Настраивается пользователем (по умолчанию 20:00)

**Содержание**:
- Масла для расслабления и спокойствия
- Расслабляющая музыка
- Инструкции для вечернего отдыха
- Успокаивающие сообщения

**Пример сообщения**:
```
🌆 **Добрый вечер! Ваша вечерняя рекомендация:**

🌿 **Масла для расслабления:**
1. Лаванда
2. Ромашка
3. Иланг-иланг

🎵 **Музыка для спокойствия:**
расслабляющая (30 мин)

💡 **Инструкция:**
Используйте масла для расслабления перед сном

Спокойной ночи! 🌙
```

## Архитектура системы

### Сервисы

#### RecommendationSubscriptionService

Основной сервис для управления подписками.

**Основные методы**:

```javascript
// Подписка на рекомендации
await subscriptionService.subscribeToMorningRecommendations(chatId, time);
await subscriptionService.subscribeToEveningRecommendations(chatId, time);

// Отписка от рекомендаций
await subscriptionService.unsubscribeFromMorningRecommendations(chatId);
await subscriptionService.unsubscribeFromEveningRecommendations(chatId);

// Управление временем
await subscriptionService.updateMorningTime(chatId, time);
await subscriptionService.updateEveningTime(chatId, time);

// Получение статуса
await subscriptionService.getSubscriptionStatus(chatId);

// Отправка рекомендаций
await subscriptionService.sendMorningRecommendations();
await subscriptionService.sendEveningRecommendations();
```

### База данных

#### Структура подписок

Подписки хранятся в таблице `subscribers` в поле `preferences`:

```json
{
  "morning_subscription": true,
  "evening_subscription": true,
  "morning_time": "08:30",
  "evening_time": "21:00",
  "notification_enabled": true
}
```

#### Поля подписки

- `morning_subscription` - подписка на утренние рекомендации
- `evening_subscription` - подписка на вечерние рекомендации
- `morning_time` - время утренних уведомлений (формат HH:MM)
- `evening_time` - время вечерних уведомлений (формат HH:MM)
- `notification_enabled` - общее включение уведомлений

## Персонализация

### Факторы персонализации

1. **Любимые масла пользователя**
   - Извлекаются из профиля пользователя
   - Включаются в рекомендации в приоритетном порядке

2. **История использования**
   - Анализируются часто используемые масла
   - Учитывается эффективность предыдущих рекомендаций

3. **Текущее настроение**
   - Учитывается последнее зафиксированное настроение
   - Адаптируется под эмоциональное состояние

4. **Время суток**
   - Утренние рекомендации: энергичные масла
   - Вечерние рекомендации: расслабляющие масла

### Алгоритм выбора масел

```javascript
function selectOilsForUser(userProfile, timeOfDay) {
  const favoriteOils = userProfile?.stats?.favorite_oils || [];
  const lastMood = userProfile?.current_state?.last_mood;

  // Базовые масла по времени суток
  const timeBasedOils = {
    'morning': ['Мята перечная', 'Розмарин', 'Эвкалипт'],
    'evening': ['Лаванда', 'Ромашка', 'Иланг-иланг']
  };

  let selectedOils = timeBasedOils[timeOfDay];
  
  // Добавляем любимые масла пользователя
  if (favoriteOils.length > 0) {
    selectedOils = [...new Set([...favoriteOils.slice(0, 2), ...selectedOils.slice(0, 1)])];
  }

  return selectedOils.slice(0, 3);
}
```

## API Endpoints

### Подписка на рекомендации

```javascript
// Подписка на утренние рекомендации
POST /api/subscriptions/morning
{
  "chat_id": 123456789,
  "time": "08:30"
}

// Подписка на вечерние рекомендации
POST /api/subscriptions/evening
{
  "chat_id": 123456789,
  "time": "21:00"
}
```

### Отписка от рекомендаций

```javascript
// Отписка от утренних рекомендаций
DELETE /api/subscriptions/morning/:chatId

// Отписка от вечерних рекомендаций
DELETE /api/subscriptions/evening/:chatId
```

### Управление временем

```javascript
// Обновление времени утренних уведомлений
PUT /api/subscriptions/morning/:chatId/time
{
  "time": "07:00"
}

// Обновление времени вечерних уведомлений
PUT /api/subscriptions/evening/:chatId/time
{
  "time": "22:30"
}
```

### Получение статуса

```javascript
// Получение статуса подписок пользователя
GET /api/subscriptions/status/:chatId

// Получение статистики подписок
GET /api/subscriptions/stats
```

## Автоматизация

### Планировщик задач

Система использует cron-задачи для автоматической отправки рекомендаций:

```javascript
// Утренние рекомендации - каждый день в указанное время
cron.schedule('0 8 * * *', async () => {
  await subscriptionService.sendMorningRecommendations();
});

// Вечерние рекомендации - каждый день в указанное время
cron.schedule('0 20 * * *', async () => {
  await subscriptionService.sendEveningRecommendations();
});
```

### Процесс отправки

1. **Получение подписчиков**
   - Запрос всех активных пользователей с подпиской
   - Фильтрация по времени отправки

2. **Генерация рекомендаций**
   - Получение профиля пользователя
   - Создание персонализированной рекомендации
   - Сохранение в базе данных

3. **Отправка сообщений**
   - Форматирование сообщения
   - Отправка через Telegram API
   - Отметка как отправленной

4. **Логирование**
   - Запись результатов отправки
   - Обработка ошибок
   - Обновление статистики

## Статистика и аналитика

### Метрики

1. **Общие метрики**
   - Общее количество подписчиков
   - Количество активных подписок
   - Процент отписок

2. **Метрики по типам**
   - Подписчики на утренние рекомендации
   - Подписчики на вечерние рекомендации
   - Подписчики на оба типа

3. **Метрики эффективности**
   - Процент открытия сообщений
   - Время между подпиской и отпиской
   - Рейтинг рекомендаций

### Отчеты

```javascript
// Получение статистики подписок
const stats = await subscriptionService.getSubscriptionStats();
console.log(stats);
// {
//   total_subscribers: 100,
//   morning_subscribers: 75,
//   evening_subscribers: 80,
//   both_subscriptions: 65,
//   active_subscribers: 85
// }
```

## Интеграция с Telegram

### Команды бота

```javascript
// Подписка на утренние рекомендации
bot.command('subscribe_morning', async (ctx) => {
  const time = ctx.message.text.split(' ')[1] || '09:00';
  await subscriptionService.subscribeToMorningRecommendations(ctx.chat.id, time);
  await ctx.reply('✅ Вы подписались на утренние рекомендации!');
});

// Подписка на вечерние рекомендации
bot.command('subscribe_evening', async (ctx) => {
  const time = ctx.message.text.split(' ')[1] || '20:00';
  await subscriptionService.subscribeToEveningRecommendations(ctx.chat.id, time);
  await ctx.reply('✅ Вы подписались на вечерние рекомендации!');
});

// Отписка от рекомендаций
bot.command('unsubscribe_morning', async (ctx) => {
  await subscriptionService.unsubscribeFromMorningRecommendations(ctx.chat.id);
  await ctx.reply('❌ Вы отписались от утренних рекомендаций');
});

bot.command('unsubscribe_evening', async (ctx) => {
  await subscriptionService.unsubscribeFromEveningRecommendations(ctx.chat.id);
  await ctx.reply('❌ Вы отписались от вечерних рекомендаций');
});

// Статус подписок
bot.command('subscription_status', async (ctx) => {
  const status = await subscriptionService.getSubscriptionStatus(ctx.chat.id);
  const message = `📊 Ваши подписки:\n` +
    `🌅 Утренние: ${status.morning_subscription ? '✅' : '❌'} (${status.morning_time})\n` +
    `🌆 Вечерние: ${status.evening_subscription ? '✅' : '❌'} (${status.evening_time})`;
  await ctx.reply(message);
});
```

### Инлайн-кнопки

```javascript
// Меню управления подписками
const subscriptionKeyboard = {
  inline_keyboard: [
    [
      { text: '🌅 Подписаться на утренние', callback_data: 'subscribe_morning' },
      { text: '🌆 Подписаться на вечерние', callback_data: 'subscribe_evening' }
    ],
    [
      { text: '❌ Отписаться от утренних', callback_data: 'unsubscribe_morning' },
      { text: '❌ Отписаться от вечерних', callback_data: 'unsubscribe_evening' }
    ],
    [
      { text: '⏰ Изменить время', callback_data: 'change_time' },
      { text: '📊 Статус подписок', callback_data: 'subscription_status' }
    ]
  ]
};
```

## Тестирование

### Запуск тестов

```bash
# Тест системы подписок
node scripts/testRecommendationSubscriptions.js
```

### Тестовые сценарии

1. **Подписка на рекомендации**
   - Подписка на утренние рекомендации
   - Подписка на вечерние рекомендации
   - Настройка времени уведомлений

2. **Управление подписками**
   - Отписка от рекомендаций
   - Изменение времени
   - Получение статуса

3. **Отправка рекомендаций**
   - Массовая отправка утренних рекомендаций
   - Массовая отправка вечерних рекомендаций
   - Обработка ошибок

4. **Статистика**
   - Подсчет подписчиков
   - Анализ эффективности
   - Генерация отчетов

## Мониторинг

### Логирование

```javascript
// Логи подписок
logger.info(`User ${chatId} subscribed to morning recommendations at ${time}`);
logger.info(`User ${chatId} unsubscribed from evening recommendations`);

// Логи отправки
logger.info(`🌅 Morning recommendations completed: ${sentCount} sent, ${errorCount} errors`);
logger.info(`🌆 Evening recommendations completed: ${sentCount} sent, ${errorCount} errors`);
```

### Алерты

- Высокий процент отписок
- Ошибки при отправке рекомендаций
- Низкая активность подписчиков
- Проблемы с генерацией рекомендаций

## Планы развития

### Краткосрочные (1-2 месяца)

1. **A/B тестирование**
   - Тестирование различных форматов сообщений
   - Оптимизация времени отправки
   - Анализ эффективности

2. **Персонализация**
   - Учет дня недели
   - Адаптация под сезонность
   - Интеграция с календарем

3. **Уведомления**
   - Push-уведомления
   - Напоминания о неиспользованных рекомендациях
   - Уведомления о новых маслах

### Среднесрочные (3-6 месяцев)

1. **Машинное обучение**
   - Предсказание предпочтений
   - Оптимизация времени отправки
   - Адаптация под поведение пользователя

2. **Расширенные типы рекомендаций**
   - Сезонные рекомендации
   - Рекомендации по праздникам
   - Специальные программы

3. **Социальные функции**
   - Обмен рекомендациями
   - Групповые подписки
   - Рейтинги и отзывы

### Долгосрочные (6+ месяцев)

1. **IoT интеграция**
   - Управление диффузорами
   - Автоматическое включение/выключение
   - Синхронизация с умным домом

2. **Персонализированные программы**
   - Многонедельные программы
   - Адаптация под цели пользователя
   - Интеграция с фитнес-трекерами

3. **Аналитика здоровья**
   - Корреляция с качеством сна
   - Анализ настроения
   - Рекомендации по здоровью

## Заключение

Система подписок на рекомендации предоставляет пользователям удобный способ получать персонализированные рекомендации по ароматерапии в удобное время. Система автоматически адаптируется под предпочтения пользователя и обеспечивает высокий уровень персонализации и удобства использования. 