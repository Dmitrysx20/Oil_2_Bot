const logger = require('../utils/logger');

class MusicService {
  constructor() {
    this.musicDatabase = this.initMusicDatabase();
  }

  initMusicDatabase() {
    return {
      'расслабляющая': {
        tracks: [
          { title: 'Weightless', artist: 'Marconi Union', genre: 'ambient', duration: '8:10' },
          { title: 'Claire de Lune', artist: 'Debussy', genre: 'classical', duration: '5:20' },
          { title: 'River Flows in You', artist: 'Yiruma', genre: 'piano', duration: '3:10' },
          { title: 'Spiegel im Spiegel', artist: 'Arvo Pärt', genre: 'minimalism', duration: '9:25' },
          { title: 'The Sound of Silence', artist: 'Disturbed', genre: 'rock', duration: '4:08' }
        ],
        recommendedOils: ['лаванда', 'ромашка', 'сандал', 'иланг-иланг', 'валериана']
      },
      'энергичная': {
        tracks: [
          { title: 'Eye of the Tiger', artist: 'Survivor', genre: 'rock', duration: '4:05' },
          { title: 'Happy', artist: 'Pharrell Williams', genre: 'pop', duration: '3:53' },
          { title: 'Can\'t Stop the Feeling!', artist: 'Justin Timberlake', genre: 'pop', duration: '3:56' },
          { title: 'Walking on Sunshine', artist: 'Katrina & The Waves', genre: 'pop', duration: '3:58' },
          { title: 'Good Vibrations', artist: 'The Beach Boys', genre: 'pop', duration: '3:37' }
        ],
        recommendedOils: ['апельсин', 'лимон', 'грейпфрут', 'бергамот', 'розмарин']
      },
      'для сна': {
        tracks: [
          { title: 'Nocturne in C minor', artist: 'Chopin', genre: 'classical', duration: '4:15' },
          { title: 'Moonlight Sonata', artist: 'Beethoven', genre: 'classical', duration: '14:00' },
          { title: 'Gymnopedie No.1', artist: 'Erik Satie', genre: 'classical', duration: '3:20' },
          { title: 'Air on the G String', artist: 'Bach', genre: 'classical', duration: '5:10' },
          { title: 'Pavane for a Dead Princess', artist: 'Ravel', genre: 'classical', duration: '6:30' }
        ],
        recommendedOils: ['лаванда', 'ромашка', 'валериана', 'сандал', 'иланг-иланг']
      },
      'медитативная': {
        tracks: [
          { title: 'Om Mani Padme Hum', artist: 'Tibetan Monks', genre: 'meditation', duration: '10:00' },
          { title: 'Deep Meditation', artist: 'Nature Sounds', genre: 'ambient', duration: '15:30' },
          { title: 'Zen Garden', artist: 'Peaceful Mind', genre: 'ambient', duration: '12:45' },
          { title: 'Inner Peace', artist: 'Meditation Music', genre: 'ambient', duration: '20:00' },
          { title: 'Sacred Chants', artist: 'Gregorian Monks', genre: 'meditation', duration: '8:20' }
        ],
        recommendedOils: ['ладан', 'сандал', 'пачули', 'ветивер', 'мирра']
      },
      'романтическая': {
        tracks: [
          { title: 'Perfect', artist: 'Ed Sheeran', genre: 'pop', duration: '4:23' },
          { title: 'All of Me', artist: 'John Legend', genre: 'pop', duration: '4:29' },
          { title: 'Can\'t Help Falling in Love', artist: 'Elvis Presley', genre: 'pop', duration: '3:00' },
          { title: 'Wonderful Tonight', artist: 'Eric Clapton', genre: 'rock', duration: '3:42' },
          { title: 'Just the Way You Are', artist: 'Bruno Mars', genre: 'pop', duration: '3:40' }
        ],
        recommendedOils: ['роза', 'иланг-иланг', 'жасмин', 'ваниль', 'сандал']
      }
    };
  }

  async findMusicByMood(routingResult) {
    try {
      const { requestedMood, chatId } = routingResult;
      
      logger.info('🎵 Music search:', { mood: requestedMood });

      const moodData = this.musicDatabase[requestedMood];
      if (!moodData) {
        return {
          action: 'music_not_found',
          chatId: chatId,
          message: `🎵 К сожалению, не нашел музыку для настроения "${requestedMood}". Попробуйте: расслабляющая, энергичная, для сна, медитативная, романтическая.`,
          keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        };
      }

      const { tracks, recommendedOils } = moodData;
      const selectedTracks = this.selectRandomTracks(tracks, 3);

      let message = `🎵 **Музыка для настроения "${requestedMood}"**\n\n`;
      message += `🎧 **Рекомендуемые треки:**\n`;
      
      selectedTracks.forEach((track, index) => {
        message += `${index + 1}. **"${track.title}"** - ${track.artist}\n`;
        message += `   ⏱️ ${track.duration} | 🎼 ${track.genre}\n\n`;
      });

      message += `🌿 **Идеальные масла для этого настроения:**\n`;
      message += `${recommendedOils.join(', ')}\n\n`;
      message += `💡 **Совет:** Создайте идеальную атмосферу с помощью аромалампы и подходящего масла!`;

      return {
        action: 'music_recommendation',
        chatId: chatId,
        message: message,
        keyboard: this.getMusicKeyboard(requestedMood, selectedTracks),
        data: {
          mood: requestedMood,
          tracks: selectedTracks,
          recommendedOils: recommendedOils
        }
      };

    } catch (error) {
      logger.error('Music service error:', error);
      return {
        action: 'music_error',
        chatId: routingResult.chatId,
        message: '🎵 Произошла ошибка при поиске музыки. Попробуйте позже.',
        keyboard: [
          [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
        ]
      };
    }
  }

  async getMusicRecommendation(mood, timeOfDay = null) {
    try {
      logger.info('🎵 Getting music recommendation:', { mood, timeOfDay });

      // Определяем настроение на основе времени дня, если не указано
      let finalMood = mood;
      if (!mood && timeOfDay) {
        if (timeOfDay === 'morning') {
          finalMood = 'энергичная';
        } else if (timeOfDay === 'evening') {
          finalMood = 'расслабляющая';
        } else if (timeOfDay === 'night') {
          finalMood = 'для сна';
        }
      }

      const moodData = this.musicDatabase[finalMood];
      if (!moodData) {
        return null;
      }

      const { tracks, recommendedOils } = moodData;
      const selectedTracks = this.selectRandomTracks(tracks, 3);

      return {
        mood: finalMood,
        tracks: selectedTracks,
        recommendedOils: recommendedOils
      };

    } catch (error) {
      logger.error('Error getting music recommendation:', error);
      return null;
    }
  }

  selectRandomTracks(tracks, count) {
    const shuffled = [...tracks].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  getMusicKeyboard(mood, tracks) {
    const keyboard = [];
    
    // Кнопки для каждого трека
    tracks.forEach((track, index) => {
      keyboard.push([
        { 
          text: `🎧 ${index + 1}. ${track.title}`, 
          callback_data: `music_play_${mood}_${index}` 
        }
      ]);
    });

    // Дополнительные кнопки
    keyboard.push([
      { text: '🔄 Другие треки', callback_data: `music_refresh_${mood}` },
      { text: '❤️ Сохранить', callback_data: `music_save_${mood}` }
    ]);

    keyboard.push([
      { text: '🏠 Главное меню', callback_data: 'main_menu' }
    ]);

    return keyboard;
  }

  getAvailableMoods() {
    return Object.keys(this.musicDatabase);
  }

  getMoodDescription(mood) {
    const descriptions = {
      'расслабляющая': 'Мягкая, успокаивающая музыка для релаксации',
      'энергичная': 'Бодрящая музыка для активности и хорошего настроения',
      'для сна': 'Спокойная музыка для легкого засыпания',
      'медитативная': 'Глубокая музыка для медитации и самопознания',
      'романтическая': 'Нежная музыка для романтического настроения'
    };
    return descriptions[mood] || 'Музыка для особого настроения';
  }
}

module.exports = MusicService; 