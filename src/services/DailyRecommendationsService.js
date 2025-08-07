const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

class DailyRecommendationsService {
  constructor() {
    this.supabase = null;
    this.initializeSupabase();
  }

  initializeSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      logger.info('DailyRecommendationsService: Supabase client initialized');
    } else {
      logger.warn('DailyRecommendationsService: Supabase credentials not found, using mock data');
    }
  }

  /**
   * Создает новую ежедневную рекомендацию
   */
  async createRecommendation(chatId, recommendationData) {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, using mock creation');
        return {
          id: 'mock-uuid-' + Date.now(),
          chat_id: chatId,
          ...recommendationData,
          created_at: new Date().toISOString()
        };
      }

      const { data, error } = await this.supabase
        .from('daily_recommendations')
        .insert({
          chat_id: chatId,
          recommendation_type: recommendationData.type,
          oils_recommended: recommendationData.oils,
          music_recommendations: recommendationData.music,
          instructions: recommendationData.instructions
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating recommendation:', error);
        throw error;
      }

      logger.info(`Created recommendation for user ${chatId}: ${data.id}`);
      return data;
    } catch (error) {
      logger.error('Error in createRecommendation:', error);
      throw error;
    }
  }

  /**
   * Получает рекомендации пользователя за период
   */
  async getUserRecommendations(chatId, startDate = null, endDate = null) {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, returning mock recommendations');
        return [
          {
            id: 'mock-1',
            chat_id: chatId,
            recommendation_date: new Date().toISOString().split('T')[0],
            recommendation_type: 'morning_boost',
            oils_recommended: { oils: ['Мята перечная', 'Розмарин'] },
            music_recommendations: { mood: 'энергичная' },
            was_sent: true,
            created_at: new Date().toISOString()
          }
        ];
      }

      let query = this.supabase
        .from('daily_recommendations')
        .select('*')
        .eq('chat_id', chatId)
        .order('recommendation_date', { ascending: false });

      if (startDate) {
        query = query.gte('recommendation_date', startDate);
      }
      if (endDate) {
        query = query.lte('recommendation_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error getting user recommendations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getUserRecommendations:', error);
      throw error;
    }
  }

  /**
   * Получает рекомендацию на конкретную дату
   */
  async getRecommendationByDate(chatId, date) {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, returning mock recommendation');
        return {
          id: 'mock-date',
          chat_id: chatId,
          recommendation_date: date,
          recommendation_type: 'daily',
          oils_recommended: { oils: ['Лаванда', 'Ромашка'] },
          music_recommendations: { mood: 'расслабляющая' },
          was_sent: false,
          created_at: new Date().toISOString()
        };
      }

      const { data, error } = await this.supabase
        .from('daily_recommendations')
        .select('*')
        .eq('chat_id', chatId)
        .eq('recommendation_date', date)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error getting recommendation by date:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error in getRecommendationByDate:', error);
      throw error;
    }
  }

  /**
   * Отмечает рекомендацию как отправленную
   */
  async markAsSent(recommendationId) {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, using mock update');
        return { id: recommendationId, was_sent: true, sent_at: new Date().toISOString() };
      }

      const { data, error } = await this.supabase
        .from('daily_recommendations')
        .update({
          was_sent: true,
          sent_at: new Date().toISOString()
        })
        .eq('id', recommendationId)
        .select()
        .single();

      if (error) {
        logger.error('Error marking recommendation as sent:', error);
        throw error;
      }

      logger.info(`Marked recommendation ${recommendationId} as sent`);
      return data;
    } catch (error) {
      logger.error('Error in markAsSent:', error);
      throw error;
    }
  }

  /**
   * Отмечает рекомендацию как прочитанную
   */
  async markAsRead(recommendationId) {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, using mock update');
        return { id: recommendationId, read_at: new Date().toISOString() };
      }

      const { data, error } = await this.supabase
        .from('daily_recommendations')
        .update({
          read_at: new Date().toISOString()
        })
        .eq('id', recommendationId)
        .select()
        .single();

      if (error) {
        logger.error('Error marking recommendation as read:', error);
        throw error;
      }

      logger.info(`Marked recommendation ${recommendationId} as read`);
      return data;
    } catch (error) {
      logger.error('Error in markAsRead:', error);
      throw error;
    }
  }

  /**
   * Сохраняет обратную связь пользователя
   */
  async saveUserFeedback(recommendationId, feedback) {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, using mock update');
        return { id: recommendationId, user_feedback: feedback };
      }

      const { data, error } = await this.supabase
        .from('daily_recommendations')
        .update({
          user_feedback: feedback
        })
        .eq('id', recommendationId)
        .select()
        .single();

      if (error) {
        logger.error('Error saving user feedback:', error);
        throw error;
      }

      logger.info(`Saved feedback for recommendation ${recommendationId}`);
      return data;
    } catch (error) {
      logger.error('Error in saveUserFeedback:', error);
      throw error;
    }
  }

  /**
   * Получает неотправленные рекомендации
   */
  async getUnsentRecommendations() {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, returning mock unsent recommendations');
        return [
          {
            id: 'mock-unsent-1',
            chat_id: 123456789,
            recommendation_type: 'morning_boost',
            oils_recommended: { oils: ['Мята перечная'] },
            was_sent: false
          }
        ];
      }

      const { data, error } = await this.supabase
        .from('daily_recommendations')
        .select('*')
        .eq('was_sent', false)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Error getting unsent recommendations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getUnsentRecommendations:', error);
      throw error;
    }
  }

  /**
   * Получает статистику рекомендаций
   */
  async getRecommendationsStats(startDate = null, endDate = null) {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, returning mock stats');
        return {
          total_recommendations: 100,
          sent_recommendations: 85,
          read_recommendations: 70,
          avg_rating: 4.2,
          most_popular_type: 'morning_boost'
        };
      }

      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];

      const { data, error } = await this.supabase
        .rpc('get_recommendations_stats', {
          start_date: start,
          end_date: end
        });

      if (error) {
        logger.error('Error getting recommendations stats:', error);
        throw error;
      }

      return data[0] || {
        total_recommendations: 0,
        sent_recommendations: 0,
        read_recommendations: 0,
        avg_rating: 0,
        most_popular_type: null
      };
    } catch (error) {
      logger.error('Error in getRecommendationsStats:', error);
      throw error;
    }
  }

  /**
   * Удаляет старые рекомендации (старше 90 дней)
   */
  async cleanupOldRecommendations() {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, skipping cleanup');
        return { deleted_count: 0 };
      }

      const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data, error } = await this.supabase
        .from('daily_recommendations')
        .delete()
        .lt('recommendation_date', cutoffDate)
        .select('id');

      if (error) {
        logger.error('Error cleaning up old recommendations:', error);
        throw error;
      }

      const deletedCount = data ? data.length : 0;
      logger.info(`Cleaned up ${deletedCount} old recommendations`);
      return { deleted_count: deletedCount };
    } catch (error) {
      logger.error('Error in cleanupOldRecommendations:', error);
      throw error;
    }
  }

  /**
   * Генерирует рекомендацию на основе предпочтений пользователя
   */
  async generatePersonalizedRecommendation(chatId, userProfile) {
    try {
      const recommendation = {
        type: this.determineRecommendationType(userProfile),
        oils: this.selectOilsForUser(userProfile),
        music: this.selectMusicForUser(userProfile),
        instructions: this.generateInstructions(userProfile)
      };

      return await this.createRecommendation(chatId, recommendation);
    } catch (error) {
      logger.error('Error in generatePersonalizedRecommendation:', error);
      throw error;
    }
  }

  /**
   * Определяет тип рекомендации на основе профиля пользователя
   */
  determineRecommendationType(userProfile) {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
      return 'morning_boost';
    } else if (hour >= 12 && hour < 18) {
      return 'afternoon_focus';
    } else if (hour >= 18 && hour < 22) {
      return 'evening_relax';
    } else {
      return 'night_sleep';
    }
  }

  /**
   * Выбирает масла для пользователя на основе предпочтений
   */
  selectOilsForUser(userProfile) {
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
      effects: this.getOilEffects(selectedOils),
      blend_ratio: '1:1:1'
    };
  }

  /**
   * Выбирает музыку для пользователя
   */
  selectMusicForUser(userProfile) {
    const lastMood = userProfile?.current_state?.last_mood;
    
    const moodMusic = {
      'energetic': { mood: 'энергичная', genre: 'pop', duration: 25 },
      'relaxed': { mood: 'расслабляющая', genre: 'ambient', duration: 30 },
      'focused': { mood: 'концентрированная', genre: 'instrumental', duration: 20 },
      'stressed': { mood: 'успокаивающая', genre: 'classical', duration: 35 }
    };

    return moodMusic[lastMood] || moodMusic['energetic'];
  }

  /**
   * Генерирует инструкции для пользователя
   */
  generateInstructions(userProfile) {
    const streakDays = userProfile?.current_state?.streak_days || 0;
    const favoriteOils = userProfile?.stats?.favorite_oils || [];
    
    let instructions = 'Используйте масла в аромалампе или диффузоре в течение 20-30 минут.';
    
    if (streakDays > 0) {
      instructions += ` Отличная работа! Вы уже ${streakDays} дней подряд используете ароматерапию.`;
    }
    
    if (favoriteOils.length > 0) {
      instructions += ` Попробуйте смешать ${favoriteOils[0]} с другими маслами для новых эффектов.`;
    }
    
    return instructions;
  }

  /**
   * Получает эффекты масел
   */
  getOilEffects(oils) {
    const oilEffects = {
      'Мята перечная': ['энергия', 'концентрация', 'освежение'],
      'Розмарин': ['память', 'концентрация', 'энергия'],
      'Лаванда': ['расслабление', 'сон', 'спокойствие'],
      'Эвкалипт': ['дыхание', 'освежение', 'энергия'],
      'Ромашка': ['расслабление', 'спокойствие', 'сон'],
      'Иланг-иланг': ['расслабление', 'романтика', 'спокойствие'],
      'Базилик': ['концентрация', 'память', 'ясность'],
      'Лимон': ['энергия', 'концентрация', 'освежение'],
      'Бергамот': ['расслабление', 'антистресс', 'спокойствие']
    };

    return oils.map(oil => oilEffects[oil] || ['общее благополучие']).flat();
  }
}

module.exports = DailyRecommendationsService; 