# MusicService - Сервис музыкальных рекомендаций

## Обзор

`MusicService` - это сервис для предоставления персонализированных музыкальных рекомендаций в сочетании с эфирными маслами. Он предлагает музыку для разных настроений и времени дня, создавая идеальную атмосферу для ароматерапии.

## Возможности

### 🎵 Доступные настроения

1. **Расслабляющая** - Мягкая, успокаивающая музыка для релаксации
2. **Энергичная** - Бодрящая музыка для активности и хорошего настроения
3. **Для сна** - Спокойная музыка для легкого засыпания
4. **Медитативная** - Глубокая музыка для медитации и самопознания
5. **Романтическая** - Нежная музыка для романтического настроения

### 🕐 Рекомендации по времени дня

- **Утро** → Энергичная музыка
- **Вечер** → Расслабляющая музыка
- **Ночь** → Музыка для сна

## Использование

### Инициализация

```javascript
const MusicService = require('./src/services/MusicService');
const musicService = new MusicService();
```

### Поиск музыки по настроению

```javascript
const result = await musicService.findMusicByMood({
  requestedMood: 'расслабляющая',
  chatId: 123456789
});

console.log(result.action); // 'music_recommendation'
console.log(result.message); // Форматированное сообщение с треками
console.log(result.keyboard); // Интерактивная клавиатура
```

### Получение рекомендаций

```javascript
// По настроению
const recommendation = await musicService.getMusicRecommendation('энергичная');

// По времени дня
const morningMusic = await musicService.getMusicRecommendation(null, 'morning');
const eveningMusic = await musicService.getMusicRecommendation(null, 'evening');
const nightMusic = await musicService.getMusicRecommendation(null, 'night');
```

### Информационные методы

```javascript
// Получить все доступные настроения
const moods = musicService.getAvailableMoods();

// Получить описание настроения
const description = musicService.getMoodDescription('расслабляющая');
```

## Структура данных

### Музыкальная база данных

```javascript
{
  'расслабляющая': {
    tracks: [
      {
        title: 'Weightless',
        artist: 'Marconi Union',
        genre: 'ambient',
        duration: '8:10'
      },
      // ... другие треки
    ],
    recommendedOils: ['лаванда', 'ромашка', 'сандал', 'иланг-иланг', 'валериана']
  }
}
```

### Результат поиска

```javascript
{
  action: 'music_recommendation',
  chatId: 123456789,
  message: '🎵 **Музыка для настроения "расслабляющая"...',
  keyboard: [
    [{ text: '🎧 1. Weightless', callback_data: 'music_play_расслабляющая_0' }],
    [{ text: '🔄 Другие треки', callback_data: 'music_refresh_расслабляющая' }],
    [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
  ],
  data: {
    mood: 'расслабляющая',
    tracks: [/* выбранные треки */],
    recommendedOils: [/* рекомендуемые масла */]
  }
}
```

## Музыкальная база данных

### Расслабляющая музыка
- **Weightless** - Marconi Union (ambient)
- **Claire de Lune** - Debussy (classical)
- **River Flows in You** - Yiruma (piano)
- **Spiegel im Spiegel** - Arvo Pärt (minimalism)
- **The Sound of Silence** - Disturbed (rock)

**Рекомендуемые масла:** лаванда, ромашка, сандал, иланг-иланг, валериана

### Энергичная музыка
- **Eye of the Tiger** - Survivor (rock)
- **Happy** - Pharrell Williams (pop)
- **Can't Stop the Feeling!** - Justin Timberlake (pop)
- **Walking on Sunshine** - Katrina & The Waves (pop)
- **Good Vibrations** - The Beach Boys (pop)

**Рекомендуемые масла:** апельсин, лимон, грейпфрут, бергамот, розмарин

### Музыка для сна
- **Nocturne in C minor** - Chopin (classical)
- **Moonlight Sonata** - Beethoven (classical)
- **Gymnopedie No.1** - Erik Satie (classical)
- **Air on the G String** - Bach (classical)
- **Pavane for a Dead Princess** - Ravel (classical)

**Рекомендуемые масла:** лаванда, ромашка, валериана, сандал, иланг-иланг

### Медитативная музыка
- **Om Mani Padme Hum** - Tibetan Monks (meditation)
- **Deep Meditation** - Nature Sounds (ambient)
- **Zen Garden** - Peaceful Mind (ambient)
- **Inner Peace** - Meditation Music (ambient)
- **Sacred Chants** - Gregorian Monks (meditation)

**Рекомендуемые масла:** ладан, сандал, пачули, ветивер, мирра

### Романтическая музыка
- **Perfect** - Ed Sheeran (pop)
- **All of Me** - John Legend (pop)
- **Can't Help Falling in Love** - Elvis Presley (pop)
- **Wonderful Tonight** - Eric Clapton (rock)
- **Just the Way You Are** - Bruno Mars (pop)

**Рекомендуемые масла:** роза, иланг-иланг, жасмин, ваниль, сандал

## Интеграция с ботом

### Обработка запросов

```javascript
// В SmartRouter
const musicResult = this.checkMusicRequest(normalizedText);
if (musicResult.isMusic) {
  return {
    requestType: 'music_request',
    chatId: chatId,
    musicKeyword: musicResult.keyword,
    requestedMood: musicResult.mood
  };
}
```

### Обработка в контроллере

```javascript
// В TelegramController
async handleMusicRequest(routeResult) {
  const musicRecommendation = await this.musicService.getMusicRecommendation(
    routeResult.requestedMood,
    routeResult.timeOfDay
  );
  
  const formattedResponse = responseFormatter.formatMusicRecommendation(musicRecommendation);
  return {
    chatId: routeResult.chatId,
    message: formattedResponse,
    keyboard: this.getMusicActionsKeyboard(musicRecommendation)
  };
}
```

## Клавиатуры

### Основная музыкальная клавиатура

```javascript
[
  [{ text: '🎧 1. Track Title', callback_data: 'music_play_mood_0' }],
  [{ text: '🎧 2. Track Title', callback_data: 'music_play_mood_1' }],
  [{ text: '🎧 3. Track Title', callback_data: 'music_play_mood_2' }],
  [
    { text: '🔄 Другие треки', callback_data: 'music_refresh_mood' },
    { text: '❤️ Сохранить', callback_data: 'music_save_mood' }
  ],
  [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
]
```

### Callback данные

- `music_play_{mood}_{index}` - Воспроизвести конкретный трек
- `music_refresh_{mood}` - Получить другие треки для настроения
- `music_save_{mood}` - Сохранить плейлист

## Тестирование

Для тестирования используйте скрипт:

```bash
node scripts/testMusic.js
```

Этот скрипт:
- Тестирует все доступные настроения
- Проверяет рекомендации по времени дня
- Тестирует обработку ошибок
- Проверяет генерацию клавиатур

## Логирование

Сервис ведет подробные логи:
- Поиск музыки по настроению
- Рекомендации по времени дня
- Ошибки при поиске
- Статистика использования

## Расширение

Для добавления новых настроений:

1. Добавьте новое настроение в `initMusicDatabase()`
2. Добавьте описание в `getMoodDescription()`
3. Обновите логику определения настроения в `SmartRouter`
4. Добавьте тесты в `testMusic.js`

## Совместимость

- Полностью интегрирован с `SmartRouter`
- Совместим с `TelegramController`
- Использует `responseFormatter` для форматирования
- Поддерживает все типы callback-запросов 