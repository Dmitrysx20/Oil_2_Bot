const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');
const logger = require('../utils/logger');

class UserService {
  constructor() {
    this.supabase = null;
    this.initSupabase();
  }

  initSupabase() {
    try {
      if (config.supabase.url && config.supabase.key) {
        this.supabase = createClient(config.supabase.url, config.supabase.key);
        logger.info('✅ UserService: Supabase client initialized');
      } else {
        logger.warn('⚠️ UserService: Supabase credentials not found, using mock data');
      }
    } catch (error) {
      logger.error('❌ UserService: Failed to initialize Supabase:', error);
    }
  }

  // ===== ОСНОВНЫЕ МЕТОДЫ =====

  async initializeUser(telegramId) {
    try {
      if (!this.supabase) {
        logger.warn('⚠️ Supabase not available, using mock initialization');
        return {
          success: true,
          message: 'User initialized (mock)',
          user_id: 'mock-user-id',
          telegram_id: telegramId,
          start_date: new Date().toISOString(),
          current_day: 1,
          status: 'active',
          subscription_end: null,
          mock: true
        };
      }

      const { data, error } = await this.supabase
        .rpc('initialize_user', {
          telegram_id_param: telegramId.toString()
        });

      if (error) {
        logger.error('❌ Failed to initialize user:', error);
        throw error;
      }

      logger.info('✅ User initialized successfully:', { telegramId });
      return data;

    } catch (error) {
      logger.error('❌ Initialize user error:', error);
      throw error;
    }
  }

  async getUser(telegramId) {
    try {
      if (!this.supabase) {
        logger.warn('⚠️ Supabase not available, returning mock user data');
        return {
          id: 'mock-user-id',
          telegram_id: telegramId.toString(),
          start_date: new Date().toISOString(),
          current_day: 1,
          status: 'active',
          subscription_end: null,
          mock: true
        };
      }

      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId.toString())
        .single();

      if (error) {
        logger.error('❌ Failed to get user:', error);
        throw error;
      }

      return data;

    } catch (error) {
      logger.error('❌ Get user error:', error);
      return null;
    }
  }

  async updateUserDay(telegramId, newDay) {
    try {
      if (!this.supabase) {
        logger.warn('⚠️ Supabase not available, using mock update');
        return {
          success: true,
          message: 'User day updated (mock)',
          user_id: 'mock-user-id',
          telegram_id: telegramId.toString(),
          current_day: newDay,
          status: 'active',
          mock: true
        };
      }

      const { data, error } = await this.supabase
        .rpc('update_user_day', {
          telegram_id_param: telegramId.toString(),
          new_day: newDay
        });

      if (error) {
        logger.error('❌ Failed to update user day:', error);
        throw error;
      }

      logger.info('✅ User day updated successfully:', { telegramId, newDay });
      return data;

    } catch (error) {
      logger.error('❌ Update user day error:', error);
      throw error;
    }
  }

  async updateUserStatus(telegramId, newStatus) {
    try {
      if (!this.supabase) {
        logger.warn('⚠️ Supabase not available, using mock update');
        return {
          success: true,
          message: 'User status updated (mock)',
          user_id: 'mock-user-id',
          telegram_id: telegramId.toString(),
          status: newStatus,
          mock: true
        };
      }

      const { data, error } = await this.supabase
        .rpc('update_user_status', {
          telegram_id_param: telegramId.toString(),
          new_status: newStatus
        });

      if (error) {
        logger.error('❌ Failed to update user status:', error);
        throw error;
      }

      logger.info('✅ User status updated successfully:', { telegramId, newStatus });
      return data;

    } catch (error) {
      logger.error('❌ Update user status error:', error);
      throw error;
    }
  }

  async updateSubscriptionEnd(telegramId, subscriptionEnd) {
    try {
      if (!this.supabase) {
        logger.warn('⚠️ Supabase not available, using mock update');
        return {
          success: true,
          message: 'Subscription end updated (mock)',
          user_id: 'mock-user-id',
          telegram_id: telegramId.toString(),
          subscription_end: subscriptionEnd,
          mock: true
        };
      }

      const { data, error } = await this.supabase
        .from('users')
        .update({ 
          subscription_end: subscriptionEnd,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', telegramId.toString())
        .select()
        .single();

      if (error) {
        logger.error('❌ Failed to update subscription end:', error);
        throw error;
      }

      logger.info('✅ Subscription end updated successfully:', { telegramId, subscriptionEnd });
      return { success: true, data };

    } catch (error) {
      logger.error('❌ Update subscription end error:', error);
      throw error;
    }
  }

  // ===== СПЕЦИАЛИЗИРОВАННЫЕ МЕТОДЫ =====

  async isUserActive(telegramId) {
    try {
      const user = await this.getUser(telegramId);
      return user?.status === 'active';
    } catch (error) {
      logger.error('❌ Check user active error:', error);
      return false;
    }
  }

  async isSubscriptionActive(telegramId) {
    try {
      const user = await this.getUser(telegramId);
      if (!user?.subscription_end) return true; // Если нет даты окончания, считаем активной
      
      return new Date(user.subscription_end) > new Date();
    } catch (error) {
      logger.error('❌ Check subscription active error:', error);
      return false;
    }
  }

  async getCurrentDay(telegramId) {
    try {
      const user = await this.getUser(telegramId);
      return user?.current_day || 1;
    } catch (error) {
      logger.error('❌ Get current day error:', error);
      return 1;
    }
  }

  async incrementDay(telegramId) {
    try {
      const currentDay = await this.getCurrentDay(telegramId);
      const newDay = currentDay + 1;
      
      return await this.updateUserDay(telegramId, newDay);
    } catch (error) {
      logger.error('❌ Increment day error:', error);
      throw error;
    }
  }

  // ===== СТАТИСТИКА =====

  async getUsersStats() {
    try {
      if (!this.supabase) {
        logger.warn('⚠️ Supabase not available, returning mock stats');
        return {
          total_users: 100,
          active_users: 85,
          inactive_users: 15,
          new_users_today: 5,
          mock: true
        };
      }

      const { data: totalUsers, error: totalError } = await this.supabase
        .from('users')
        .select('id', { count: 'exact' });

      if (totalError) {
        logger.error('❌ Failed to get total users:', totalError);
        throw totalError;
      }

      const { data: activeUsers, error: activeError } = await this.supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('status', 'active');

      if (activeError) {
        logger.error('❌ Failed to get active users:', activeError);
        throw activeError;
      }

      const { data: newUsersToday, error: newError } = await this.supabase
        .from('users')
        .select('id', { count: 'exact' })
        .gte('start_date', new Date().toISOString().split('T')[0]);

      if (newError) {
        logger.error('❌ Failed to get new users today:', newError);
        throw newError;
      }

      return {
        total_users: totalUsers || 0,
        active_users: activeUsers || 0,
        inactive_users: (totalUsers || 0) - (activeUsers || 0),
        new_users_today: newUsersToday || 0
      };

    } catch (error) {
      logger.error('❌ Get users stats error:', error);
      throw error;
    }
  }

  async getUsersByStatus(status) {
    try {
      if (!this.supabase) {
        logger.warn('⚠️ Supabase not available, returning mock users');
        return [
          {
            id: 'mock-user-1',
            telegram_id: '123456789',
            start_date: new Date().toISOString(),
            current_day: 1,
            status: status,
            subscription_end: null,
            mock: true
          }
        ];
      }

      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('status', status);

      if (error) {
        logger.error('❌ Failed to get users by status:', error);
        throw error;
      }

      return data || [];

    } catch (error) {
      logger.error('❌ Get users by status error:', error);
      throw error;
    }
  }

  async getUsersWithExpiringSubscription(daysAhead = 7) {
    try {
      if (!this.supabase) {
        logger.warn('⚠️ Supabase not available, returning mock users');
        return [];
      }

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .not('subscription_end', 'is', null)
        .lte('subscription_end', futureDate.toISOString())
        .gte('subscription_end', new Date().toISOString());

      if (error) {
        logger.error('❌ Failed to get users with expiring subscription:', error);
        throw error;
      }

      return data || [];

    } catch (error) {
      logger.error('❌ Get users with expiring subscription error:', error);
      throw error;
    }
  }

  // ===== УТИЛИТЫ =====

  async deleteUser(telegramId) {
    try {
      if (!this.supabase) {
        logger.warn('⚠️ Supabase not available, using mock delete');
        return { success: true, message: 'User deleted (mock)', mock: true };
      }

      const { error } = await this.supabase
        .from('users')
        .delete()
        .eq('telegram_id', telegramId.toString());

      if (error) {
        logger.error('❌ Failed to delete user:', error);
        throw error;
      }

      logger.info('✅ User deleted successfully:', { telegramId });
      return { success: true, message: 'User deleted successfully' };

    } catch (error) {
      logger.error('❌ Delete user error:', error);
      throw error;
    }
  }

  async resetUserProgress(telegramId) {
    try {
      const result = await this.updateUserDay(telegramId, 1);
      logger.info('✅ User progress reset successfully:', { telegramId });
      return result;
    } catch (error) {
      logger.error('❌ Reset user progress error:', error);
      throw error;
    }
  }
}

module.exports = UserService; 