const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');
const logger = require('../utils/logger');

class AdminSettingsService {
  constructor() {
    this.supabase = null;
    this.initSupabase();
  }

  initSupabase() {
    try {
      if (config.supabase.url && config.supabase.key) {
        this.supabase = createClient(config.supabase.url, config.supabase.key);
        logger.info('✅ AdminSettingsService: Supabase client initialized');
      } else {
        logger.warn('⚠️ AdminSettingsService: Supabase credentials not found, using mock data');
      }
    } catch (error) {
      logger.error('❌ AdminSettingsService: Failed to initialize Supabase:', error);
    }
  }

  // ===== ОСНОВНЫЕ МЕТОДЫ =====

  async initializeAdminSettings(adminChatId) {
    try {
      if (!this.supabase) {
        logger.warn('⚠️ Supabase not available, using mock initialization');
        return { success: true, mock: true };
      }

      const { data, error } = await this.supabase
        .rpc('initialize_admin_settings', {
          admin_chat_id_param: adminChatId
        });

      if (error) {
        logger.error('❌ Failed to initialize admin settings:', error);
        throw error;
      }

      logger.info('✅ Admin settings initialized successfully:', { adminChatId });
      return { success: true };

    } catch (error) {
      logger.error('❌ Initialize admin settings error:', error);
      throw error;
    }
  }

  async getAdminSettings(adminChatId) {
    try {
      if (!this.supabase) {
        logger.warn('⚠️ Supabase not available, returning mock admin settings');
        return {
          admin_chat_id: adminChatId,
          bot_settings: {
            daily_stats: true,
            maintenance_mode: false,
            broadcast_enabled: true,
            error_notifications: true,
            new_user_notifications: true
          },
          daily_stats: {
            errors: 0,
            new_users: 0,
            active_users: 0,
            last_updated: null,
            messages_sent: 0
          }
        };
      }

      const { data, error } = await this.supabase
        .from('admin_settings')
        .select('*')
        .eq('admin_chat_id', adminChatId)
        .single();

      if (error) {
        logger.error('❌ Failed to get admin settings:', error);
        throw error;
      }

      return data;

    } catch (error) {
      logger.error('❌ Get admin settings error:', error);
      return null;
    }
  }

  async updateBotSettings(adminChatId, botSettings) {
    try {
      if (!this.supabase) {
        logger.warn('⚠️ Supabase not available, using mock update');
        return { success: true, mock: true };
      }

      const { data, error } = await this.supabase
        .from('admin_settings')
        .update({ 
          bot_settings: botSettings,
          updated_at: new Date().toISOString()
        })
        .eq('admin_chat_id', adminChatId)
        .select()
        .single();

      if (error) {
        logger.error('❌ Failed to update bot settings:', error);
        throw error;
      }

      logger.info('✅ Bot settings updated successfully:', { adminChatId });
      return { success: true, data };

    } catch (error) {
      logger.error('❌ Update bot settings error:', error);
      throw error;
    }
  }

  async updateDailyStats(adminChatId, statsUpdate) {
    try {
      if (!this.supabase) {
        logger.warn('⚠️ Supabase not available, using mock update');
        return { success: true, mock: true };
      }

      const { data, error } = await this.supabase
        .rpc('update_daily_stats', {
          admin_chat_id_param: adminChatId,
          errors_count: statsUpdate.errors || 0,
          new_users_count: statsUpdate.new_users || 0,
          active_users_count: statsUpdate.active_users || 0,
          messages_sent_count: statsUpdate.messages_sent || 0
        });

      if (error) {
        logger.error('❌ Failed to update daily stats:', error);
        throw error;
      }

      logger.info('✅ Daily stats updated successfully:', { adminChatId, statsUpdate });
      return { success: true };

    } catch (error) {
      logger.error('❌ Update daily stats error:', error);
      throw error;
    }
  }

  async getDashboardStats() {
    try {
      if (!this.supabase) {
        logger.warn('⚠️ Supabase not available, returning mock dashboard stats');
        return {
          total_admins: 1,
          maintenance_mode_enabled: 0,
          daily_stats_enabled: 1,
          broadcast_enabled: 1,
          total_errors: 0,
          total_new_users: 5,
          total_active_users: 25,
          total_messages_sent: 150,
          last_stats_update: new Date().toISOString()
        };
      }

      const { data, error } = await this.supabase
        .from('admin_dashboard_stats')
        .select('*')
        .single();

      if (error) {
        logger.error('❌ Failed to get dashboard stats:', error);
        throw error;
      }

      return data;

    } catch (error) {
      logger.error('❌ Get dashboard stats error:', error);
      return {
        total_admins: 0,
        maintenance_mode_enabled: 0,
        daily_stats_enabled: 0,
        broadcast_enabled: 0,
        total_errors: 0,
        total_new_users: 0,
        total_active_users: 0,
        total_messages_sent: 0,
        last_stats_update: null
      };
    }
  }

  // ===== СПЕЦИАЛИЗИРОВАННЫЕ МЕТОДЫ =====

  async setMaintenanceMode(adminChatId, enabled) {
    try {
      const currentSettings = await this.getAdminSettings(adminChatId);
      if (!currentSettings) {
        throw new Error('Admin settings not found');
      }

      const updatedSettings = {
        ...currentSettings.bot_settings,
        maintenance_mode: enabled
      };

      return await this.updateBotSettings(adminChatId, updatedSettings);

    } catch (error) {
      logger.error('❌ Set maintenance mode error:', error);
      throw error;
    }
  }

  async toggleDailyStats(adminChatId, enabled) {
    try {
      const currentSettings = await this.getAdminSettings(adminChatId);
      if (!currentSettings) {
        throw new Error('Admin settings not found');
      }

      const updatedSettings = {
        ...currentSettings.bot_settings,
        daily_stats: enabled
      };

      return await this.updateBotSettings(adminChatId, updatedSettings);

    } catch (error) {
      logger.error('❌ Toggle daily stats error:', error);
      throw error;
    }
  }

  async toggleBroadcastEnabled(adminChatId, enabled) {
    try {
      const currentSettings = await this.getAdminSettings(adminChatId);
      if (!currentSettings) {
        throw new Error('Admin settings not found');
      }

      const updatedSettings = {
        ...currentSettings.bot_settings,
        broadcast_enabled: enabled
      };

      return await this.updateBotSettings(adminChatId, updatedSettings);

    } catch (error) {
      logger.error('❌ Toggle broadcast enabled error:', error);
      throw error;
    }
  }

  async toggleErrorNotifications(adminChatId, enabled) {
    try {
      const currentSettings = await this.getAdminSettings(adminChatId);
      if (!currentSettings) {
        throw new Error('Admin settings not found');
      }

      const updatedSettings = {
        ...currentSettings.bot_settings,
        error_notifications: enabled
      };

      return await this.updateBotSettings(adminChatId, updatedSettings);

    } catch (error) {
      logger.error('❌ Toggle error notifications error:', error);
      throw error;
    }
  }

  async toggleNewUserNotifications(adminChatId, enabled) {
    try {
      const currentSettings = await this.getAdminSettings(adminChatId);
      if (!currentSettings) {
        throw new Error('Admin settings not found');
      }

      const updatedSettings = {
        ...currentSettings.bot_settings,
        new_user_notifications: enabled
      };

      return await this.updateBotSettings(adminChatId, updatedSettings);

    } catch (error) {
      logger.error('❌ Toggle new user notifications error:', error);
      throw error;
    }
  }

  // ===== МЕТОДЫ ДЛЯ ОТСЛЕЖИВАНИЯ СТАТИСТИКИ =====

  async incrementErrors(adminChatId, count = 1) {
    try {
      return await this.updateDailyStats(adminChatId, { errors: count });
    } catch (error) {
      logger.error('❌ Increment errors error:', error);
    }
  }

  async incrementNewUsers(adminChatId, count = 1) {
    try {
      return await this.updateDailyStats(adminChatId, { new_users: count });
    } catch (error) {
      logger.error('❌ Increment new users error:', error);
    }
  }

  async incrementActiveUsers(adminChatId, count = 1) {
    try {
      return await this.updateDailyStats(adminChatId, { active_users: count });
    } catch (error) {
      logger.error('❌ Increment active users error:', error);
    }
  }

  async incrementMessagesSent(adminChatId, count = 1) {
    try {
      return await this.updateDailyStats(adminChatId, { messages_sent: count });
    } catch (error) {
      logger.error('❌ Increment messages sent error:', error);
    }
  }

  // ===== МЕТОДЫ ДЛЯ ПРОВЕРКИ СОСТОЯНИЯ =====

  async isMaintenanceMode(adminChatId) {
    try {
      const settings = await this.getAdminSettings(adminChatId);
      return settings?.bot_settings?.maintenance_mode || false;
    } catch (error) {
      logger.error('❌ Check maintenance mode error:', error);
      return false;
    }
  }

  async shouldSendDailyStats(adminChatId) {
    try {
      const settings = await this.getAdminSettings(adminChatId);
      return settings?.bot_settings?.daily_stats || false;
    } catch (error) {
      logger.error('❌ Check daily stats setting error:', error);
      return false;
    }
  }

  async shouldSendErrorNotifications(adminChatId) {
    try {
      const settings = await this.getAdminSettings(adminChatId);
      return settings?.bot_settings?.error_notifications || false;
    } catch (error) {
      logger.error('❌ Check error notifications setting error:', error);
      return false;
    }
  }

  async shouldSendNewUserNotifications(adminChatId) {
    try {
      const settings = await this.getAdminSettings(adminChatId);
      return settings?.bot_settings?.new_user_notifications || false;
    } catch (error) {
      logger.error('❌ Check new user notifications setting error:', error);
      return false;
    }
  }

  async isBroadcastEnabled(adminChatId) {
    try {
      const settings = await this.getAdminSettings(adminChatId);
      return settings?.bot_settings?.broadcast_enabled || false;
    } catch (error) {
      logger.error('❌ Check broadcast enabled error:', error);
      return false;
    }
  }
}

module.exports = AdminSettingsService; 