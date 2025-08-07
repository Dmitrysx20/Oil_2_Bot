const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
const DailyRecommendationsService = require('./DailyRecommendationsService');

class RecommendationSubscriptionService {
  constructor() {
    this.supabase = null;
    this.dailyRecommendationsService = new DailyRecommendationsService();
    this.initializeSupabase();
  }

  initializeSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      logger.info('RecommendationSubscriptionService: Supabase client initialized');
    } else {
      logger.warn('RecommendationSubscriptionService: Supabase credentials not found, using mock data');
    }
  }

  /**
   * Подписывает пользователя на утренние рекомендации
   */
  async subscribeToMorningRecommendations(chatId, time = '09:00') {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, using mock subscription');
        return {
          chat_id: chatId,
          morning_subscription: true,
          morning_time: time,
          status: 'active'
        };
      }

      const { data, error } = await this.supabase
        .from('subscribers')
        .update({
          preferences: this.supabase.sql`jsonb_set(
            COALESCE(preferences, '{}'::jsonb),
            '{morning_subscription}',
            'true'::jsonb
          )`,
          updated_at: new Date().toISOString()
        })
        .eq('chat_id', chatId)
        .select('chat_id, preferences')
        .single();

      if (error) {
        logger.error('Error subscribing to morning recommendations:', error);
        throw error;
      }

      // Обновляем время утренних уведомлений
      await this.updateMorningTime(chatId, time);

      logger.info(`User ${chatId} subscribed to morning recommendations at ${time}`);
      return {
        chat_id: chatId,
        morning_subscription: true,
        morning_time: time,
        status: 'active'
      };
    } catch (error) {
      logger.error('Error in subscribeToMorningRecommendations:', error);
      throw error;
    }
  }

  /**
   * Подписывает пользователя на вечерние рекомендации
   */
  async subscribeToEveningRecommendations(chatId, time = '20:00') {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, using mock subscription');
        return {
          chat_id: chatId,
          evening_subscription: true,
          evening_time: time,
          status: 'active'
        };
      }

      const { data, error } = await this.supabase
        .from('subscribers')
        .update({
          preferences: this.supabase.sql`jsonb_set(
            COALESCE(preferences, '{}'::jsonb),
            '{evening_subscription}',
            'true'::jsonb
          )`,
          updated_at: new Date().toISOString()
        })
        .eq('chat_id', chatId)
        .select('chat_id, preferences')
        .single();

      if (error) {
        logger.error('Error subscribing to evening recommendations:', error);
        throw error;
      }

      // Обновляем время вечерних уведомлений
      await this.updateEveningTime(chatId, time);

      logger.info(`User ${chatId} subscribed to evening recommendations at ${time}`);
      return {
        chat_id: chatId,
        evening_subscription: true,
        evening_time: time,
        status: 'active'
      };
    } catch (error) {
      logger.error('Error in subscribeToEveningRecommendations:', error);
      throw error;
    }
  }

  /**
   * Отписывает пользователя от утренних рекомендаций
   */
  async unsubscribeFromMorningRecommendations(chatId) {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, using mock unsubscription');
        return {
          chat_id: chatId,
          morning_subscription: false,
          status: 'unsubscribed'
        };
      }

      const { data, error } = await this.supabase
        .from('subscribers')
        .update({
          preferences: this.supabase.sql`jsonb_set(
            COALESCE(preferences, '{}'::jsonb),
            '{morning_subscription}',
            'false'::jsonb
          )`,
          updated_at: new Date().toISOString()
        })
        .eq('chat_id', chatId)
        .select('chat_id, preferences')
        .single();

      if (error) {
        logger.error('Error unsubscribing from morning recommendations:', error);
        throw error;
      }

      logger.info(`User ${chatId} unsubscribed from morning recommendations`);
      return {
        chat_id: chatId,
        morning_subscription: false,
        status: 'unsubscribed'
      };
    } catch (error) {
      logger.error('Error in unsubscribeFromMorningRecommendations:', error);
      throw error;
    }
  }

  /**
   * Отписывает пользователя от вечерних рекомендаций
   */
  async unsubscribeFromEveningRecommendations(chatId) {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, using mock unsubscription');
        return {
          chat_id: chatId,
          evening_subscription: false,
          status: 'unsubscribed'
        };
      }

      const { data, error } = await this.supabase
        .from('subscribers')
        .update({
          preferences: this.supabase.sql`jsonb_set(
            COALESCE(preferences, '{}'::jsonb),
            '{evening_subscription}',
            'false'::jsonb
          )`,
          updated_at: new Date().toISOString()
        })
        .eq('chat_id', chatId)
        .select('chat_id, preferences')
        .single();

      if (error) {
        logger.error('Error unsubscribing from evening recommendations:', error);
        throw error;
      }

      logger.info(`User ${chatId} unsubscribed from evening recommendations`);
      return {
        chat_id: chatId,
        evening_subscription: false,
        status: 'unsubscribed'
      };
    } catch (error) {
      logger.error('Error in unsubscribeFromEveningRecommendations:', error);
      throw error;
    }
  }

  /**
   * Обновляет время утренних уведомлений
   */
  async updateMorningTime(chatId, time) {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, using mock update');
        return { chat_id: chatId, morning_time: time };
      }

      const { data, error } = await this.supabase
        .from('subscribers')
        .update({
          preferences: this.supabase.sql`jsonb_set(
            COALESCE(preferences, '{}'::jsonb),
            '{morning_time}',
            ${JSON.stringify(time)}::jsonb
          )`,
          updated_at: new Date().toISOString()
        })
        .eq('chat_id', chatId)
        .select('chat_id, preferences')
        .single();

      if (error) {
        logger.error('Error updating morning time:', error);
        throw error;
      }

      logger.info(`Updated morning time for user ${chatId} to ${time}`);
      return { chat_id: chatId, morning_time: time };
    } catch (error) {
      logger.error('Error in updateMorningTime:', error);
      throw error;
    }
  }

  /**
   * Обновляет время вечерних уведомлений
   */
  async updateEveningTime(chatId, time) {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, using mock update');
        return { chat_id: chatId, evening_time: time };
      }

      const { data, error } = await this.supabase
        .from('subscribers')
        .update({
          preferences: this.supabase.sql`jsonb_set(
            COALESCE(preferences, '{}'::jsonb),
            '{evening_time}',
            ${JSON.stringify(time)}::jsonb
          )`,
          updated_at: new Date().toISOString()
        })
        .eq('chat_id', chatId)
        .select('chat_id, preferences')
        .single();

      if (error) {
        logger.error('Error updating evening time:', error);
        throw error;
      }

      logger.info(`Updated evening time for user ${chatId} to ${time}`);
      return { chat_id: chatId, evening_time: time };
    } catch (error) {
      logger.error('Error in updateEveningTime:', error);
      throw error;
    }
  }

  /**
   * Получает статус подписок пользователя
   */
  async getSubscriptionStatus(chatId) {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, returning mock subscription status');
        return {
          chat_id: chatId,
          morning_subscription: true,
          evening_subscription: true,
          morning_time: '09:00',
          evening_time: '20:00',
          status: 'active'
        };
      }

      const { data, error } = await this.supabase
        .from('subscribers')
        .select('chat_id, preferences')
        .eq('chat_id', chatId)
        .single();

      if (error) {
        logger.error('Error getting subscription status:', error);
        throw error;
      }

      const preferences = data?.preferences || {};
      return {
        chat_id: chatId,
        morning_subscription: preferences.morning_subscription || false,
        evening_subscription: preferences.evening_subscription || false,
        morning_time: preferences.morning_time || '09:00',
        evening_time: preferences.evening_time || '20:00',
        status: 'active'
      };
    } catch (error) {
      logger.error('Error in getSubscriptionStatus:', error);
      throw error;
    }
  }

  /**
   * Получает всех пользователей, подписанных на утренние рекомендации
   */
  async getMorningSubscribers() {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, returning mock morning subscribers');
        return [
          { chat_id: 123456789, morning_time: '09:00' },
          { chat_id: 987654321, morning_time: '08:30' }
        ];
      }

      const { data, error } = await this.supabase
        .from('subscribers')
        .select('chat_id, preferences')
        .eq('is_active', true)
        .filter('preferences->morning_subscription', 'eq', true);

      if (error) {
        logger.error('Error getting morning subscribers:', error);
        throw error;
      }

      return data.map(subscriber => ({
        chat_id: subscriber.chat_id,
        morning_time: subscriber.preferences?.morning_time || '09:00'
      }));
    } catch (error) {
      logger.error('Error in getMorningSubscribers:', error);
      throw error;
    }
  }

  /**
   * Получает всех пользователей, подписанных на вечерние рекомендации
   */
  async getEveningSubscribers() {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, returning mock evening subscribers');
        return [
          { chat_id: 123456789, evening_time: '20:00' },
          { chat_id: 987654321, evening_time: '21:00' }
        ];
      }

      const { data, error } = await this.supabase
        .from('subscribers')
        .select('chat_id, preferences')
        .eq('is_active', true)
        .filter('preferences->evening_subscription', 'eq', true);

      if (error) {
        logger.error('Error getting evening subscribers:', error);
        throw error;
      }

      return data.map(subscriber => ({
        chat_id: subscriber.chat_id,
        evening_time: subscriber.preferences?.evening_time || '20:00'
      }));
    } catch (error) {
      logger.error('Error in getEveningSubscribers:', error);
      throw error;
    }
  }

  /**
   * Отправляет утренние рекомендации всем подписчикам
   */
  async sendMorningRecommendations() {
    try {
      logger.info('🌅 Starting morning recommendations distribution');
      
      const subscribers = await this.getMorningSubscribers();
      logger.info(`Found ${subscribers.length} morning subscribers`);

      let sentCount = 0;
      let errorCount = 0;

      for (const subscriber of subscribers) {
        try {
          // Получаем профиль пользователя для персонализации
          const userProfile = await this.getUserProfile(subscriber.chat_id);
          
          // Генерируем персонализированную рекомендацию
          const recommendation = await this.dailyRecommendationsService.generatePersonalizedRecommendation(
            subscriber.chat_id, 
            userProfile
          );

          // Отмечаем как отправленную
          await this.dailyRecommendationsService.markAsSent(recommendation.id);

          // Здесь должна быть логика отправки в Telegram
          // await this.sendTelegramMessage(subscriber.chat_id, this.formatMorningRecommendation(recommendation));

          sentCount++;
          logger.info(`Sent morning recommendation to user ${subscriber.chat_id}`);

        } catch (error) {
          errorCount++;
          logger.error(`Error sending morning recommendation to user ${subscriber.chat_id}:`, error);
        }

        // Небольшая задержка между отправками
        await this.delay(100);
      }

      logger.info(`🌅 Morning recommendations completed: ${sentCount} sent, ${errorCount} errors`);
      return { sent: sentCount, errors: errorCount };
    } catch (error) {
      logger.error('Error in sendMorningRecommendations:', error);
      throw error;
    }
  }

  /**
   * Отправляет вечерние рекомендации всем подписчикам
   */
  async sendEveningRecommendations() {
    try {
      logger.info('🌆 Starting evening recommendations distribution');
      
      const subscribers = await this.getEveningSubscribers();
      logger.info(`Found ${subscribers.length} evening subscribers`);

      let sentCount = 0;
      let errorCount = 0;

      for (const subscriber of subscribers) {
        try {
          // Получаем профиль пользователя для персонализации
          const userProfile = await this.getUserProfile(subscriber.chat_id);
          
          // Генерируем персонализированную рекомендацию
          const recommendation = await this.dailyRecommendationsService.generatePersonalizedRecommendation(
            subscriber.chat_id, 
            userProfile
          );

          // Отмечаем как отправленную
          await this.dailyRecommendationsService.markAsSent(recommendation.id);

          // Здесь должна быть логика отправки в Telegram
          // await this.sendTelegramMessage(subscriber.chat_id, this.formatEveningRecommendation(recommendation));

          sentCount++;
          logger.info(`Sent evening recommendation to user ${subscriber.chat_id}`);

        } catch (error) {
          errorCount++;
          logger.error(`Error sending evening recommendation to user ${subscriber.chat_id}:`, error);
        }

        // Небольшая задержка между отправками
        await this.delay(100);
      }

      logger.info(`🌆 Evening recommendations completed: ${sentCount} sent, ${errorCount} errors`);
      return { sent: sentCount, errors: errorCount };
    } catch (error) {
      logger.error('Error in sendEveningRecommendations:', error);
      throw error;
    }
  }

  /**
   * Получает профиль пользователя
   */
  async getUserProfile(chatId) {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, returning mock user profile');
        return {
          current_state: { last_mood: 'energetic', streak_days: 5 },
          stats: { favorite_oils: ['Мята перечная', 'Лаванда'] }
        };
      }

      const { data, error } = await this.supabase
        .from('subscribers')
        .select('current_state, stats')
        .eq('chat_id', chatId)
        .single();

      if (error) {
        logger.error('Error getting user profile:', error);
        throw error;
      }

      return {
        current_state: data.current_state || {},
        stats: data.stats || {}
      };
    } catch (error) {
      logger.error('Error in getUserProfile:', error);
      throw error;
    }
  }

  /**
   * Форматирует утреннюю рекомендацию для отправки
   */
  formatMorningRecommendation(recommendation) {
    const oils = recommendation.oils_recommended?.oils || [];
    const music = recommendation.music_recommendations;
    const instructions = recommendation.instructions;

    return `🌅 **Доброе утро! Ваша утренняя рекомендация:**

🌿 **Масла для бодрости:**
${oils.map((oil, i) => `${i + 1}. ${oil}`).join('\n')}

🎵 **Музыка для энергии:**
${music?.mood || 'энергичная'} (${music?.duration || 20} мин)

💡 **Инструкция:**
${instructions || 'Используйте масла в аромалампе для бодрости'}

Хорошего дня! ✨`;
  }

  /**
   * Форматирует вечернюю рекомендацию для отправки
   */
  formatEveningRecommendation(recommendation) {
    const oils = recommendation.oils_recommended?.oils || [];
    const music = recommendation.music_recommendations;
    const instructions = recommendation.instructions;

    return `🌆 **Добрый вечер! Ваша вечерняя рекомендация:**

🌿 **Масла для расслабления:**
${oils.map((oil, i) => `${i + 1}. ${oil}`).join('\n')}

🎵 **Музыка для спокойствия:**
${music?.mood || 'расслабляющая'} (${music?.duration || 30} мин)

💡 **Инструкция:**
${instructions || 'Используйте масла для расслабления перед сном'}

Спокойной ночи! 🌙`;
  }

  /**
   * Задержка между операциями
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Получает статистику подписок
   */
  async getSubscriptionStats() {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not available, returning mock subscription stats');
        return {
          total_subscribers: 100,
          morning_subscribers: 75,
          evening_subscribers: 80,
          both_subscriptions: 65,
          active_subscribers: 85
        };
      }

      const { data, error } = await this.supabase
        .from('subscribers')
        .select('preferences, is_active');

      if (error) {
        logger.error('Error getting subscription stats:', error);
        throw error;
      }

      const stats = {
        total_subscribers: data.length,
        morning_subscribers: 0,
        evening_subscribers: 0,
        both_subscriptions: 0,
        active_subscribers: 0
      };

      data.forEach(subscriber => {
        const preferences = subscriber.preferences || {};
        
        if (subscriber.is_active) {
          stats.active_subscribers++;
        }
        
        if (preferences.morning_subscription) {
          stats.morning_subscribers++;
        }
        
        if (preferences.evening_subscription) {
          stats.evening_subscribers++;
        }
        
        if (preferences.morning_subscription && preferences.evening_subscription) {
          stats.both_subscriptions++;
        }
      });

      return stats;
    } catch (error) {
      logger.error('Error in getSubscriptionStats:', error);
      throw error;
    }
  }
}

module.exports = RecommendationSubscriptionService; 