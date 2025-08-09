const logger = require('../utils/logger');
const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');

class MusicService {
  constructor() {
    this.musicDatabase = this.initMusicDatabase();
    this.supabase = null;
    this.initializeSupabase();
  }

  initializeSupabase() {
    try {
      const supabaseUrl = config.supabase.url;
      const supabaseKey = config.supabase.key;
      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        logger.info('MusicService: Supabase client initialized');
      } else {
        logger.warn('MusicService: Supabase credentials not found, using in-memory music database');
      }
    } catch (error) {
      logger.error('MusicService: Failed to initialize Supabase', error);
      this.supabase = null;
    }
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

      // 1) Пробуем из Supabase
      if (this.supabase) {
        try {
          let query = this.supabase
            .from('music_library')
            .select('id,title,artist,genre,mood,duration,links,recommended_oils,popularity_score')
            .eq('is_active', true)
            .order('popularity_score', { ascending: false })
            .limit(10);

          if (finalMood) {
            query = query.eq('mood', finalMood);
          }

          const { data, error } = await query;
          if (!error && data && data.length > 0) {
            const selected = this.selectRandomTracks(data, Math.min(3, data.length));
            const recommendedOils = this.collectRecommendedOils(data);
            return {
              mood: finalMood || data[0].mood,
              tracks: selected.map(t => ({
                id: t.id,
                title: t.title,
                artist: t.artist,
                genre: t.genre,
                duration: typeof t.duration === 'number' ? `${Math.floor(t.duration / 60)}:${String(t.duration % 60).padStart(2, '0')}` : (t.duration || ''),
                links: t.links || null,
                recommended_oils: t.recommended_oils || []
              })),
              recommendedOils
            };
          }
        } catch (supabaseError) {
          logger.warn('MusicService: Supabase query failed, falling back to in-memory', supabaseError.message);
        }
      }

      // 2) Fallback на in-memory
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

  collectRecommendedOils(rows) {
    const oils = new Set();
    for (const row of rows) {
      if (Array.isArray(row.recommended_oils)) {
        row.recommended_oils.forEach(o => typeof o === 'string' && oils.add(o));
      }
    }
    return Array.from(oils);
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

  async savePreferredMood(chatId, mood) {
    try {
      if (!this.supabase) {
        logger.warn('MusicService: Supabase not configured, skip saving preferred mood');
        return { saved: false };
      }

      const payload = {
        chat_id: chatId,
        mood: mood,
        last_used: new Date().toISOString(),
        like_count: 1
      };

      const { error } = await this.supabase
        .from('user_music_prefs')
        .upsert(payload, { onConflict: 'chat_id,mood' })
        .select('chat_id');

      if (error) {
        logger.error('MusicService: Failed to save preferred mood', error);
        return { saved: false };
      }

      return { saved: true };
    } catch (error) {
      logger.error('MusicService: savePreferredMood error', error);
      return { saved: false };
    }
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