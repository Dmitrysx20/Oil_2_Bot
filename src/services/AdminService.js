const logger = require('../utils/logger');
const config = require('../../config');
const AdminSettingsService = require('./AdminSettingsService');

class AdminService {
  constructor() {
    this.adminChatIds = config.admin.chatIds;
    this.adminSettingsService = new AdminSettingsService();
  }

  async checkAdminAccess(chatId) {
    try {
      // Проверка админа из конфигурации
      if (this.adminChatIds.includes(parseInt(chatId))) {
        return {
          isAdmin: true,
          hasPermission: true,
          permissions: ['view_stats', 'manage_users', 'broadcast', 'export_data']
        };
      }

      return {
        isAdmin: false,
        hasPermission: false,
        reason: 'not_admin'
      };

    } catch (error) {
      logger.error('Admin access check error:', error);
      return { isAdmin: false, hasPermission: false, reason: 'error' };
    }
  }

  async handleCommand(routingResult) {
    try {
      const { chatId, command, adminAction } = routingResult;
      
      // Проверяем доступ
      const accessCheck = await this.checkAdminAccess(chatId);
      if (!accessCheck.isAdmin) {
        return this.getAccessDeniedResponse(chatId);
      }

      logger.info('👨‍💼 Admin command:', { chatId, command: command || adminAction });

      // Обрабатываем команду
      if (command) {
        return await this.handleTextCommand(command, chatId);
      } else if (adminAction) {
        return await this.handleCallbackAction(adminAction, chatId);
      }

      return this.getUnknownCommandResponse(chatId);

    } catch (error) {
      logger.error('Admin command error:', error);
      return this.getErrorResponse(chatId);
    }
  }

  async handleTextCommand(command, chatId) {
    switch(command) {
      case '/admin':
        return this.generateAdminPanel(chatId);
        
      case '/stats':
        return await this.generateStats(chatId);
        
      case '/users':
        return await this.generateUsersList(chatId);
        
      case '/broadcast':
        return this.generateBroadcastMenu(chatId);
        
      default:
        return this.getUnknownCommandResponse(chatId);
    }
  }

  async handleCallbackAction(action, chatId) {
    switch(action) {
      case 'admin_stats':
        return await this.generateDetailedStats(chatId);
        
      case 'admin_users':
        return await this.generateUsersManagement(chatId);
        
      case 'admin_broadcast':
        return this.generateBroadcastCreator(chatId);
        
      case 'admin_music':
        return await this.generateMusicStats(chatId);
        
      case 'admin_export':
        return this.generateExportMenu(chatId);
        
      case 'admin_settings':
        return await this.generateSettingsPanel(chatId);
        
      case 'admin_maintenance_toggle':
        return await this.toggleMaintenanceMode(chatId);
        
      case 'admin_daily_stats_toggle':
        return await this.toggleDailyStats(chatId);
        
      case 'admin_broadcast_toggle':
        return await this.toggleBroadcastEnabled(chatId);
        
      case 'admin_error_notifications_toggle':
        return await this.toggleErrorNotifications(chatId);
        
      case 'admin_new_user_notifications_toggle':
        return await this.toggleNewUserNotifications(chatId);
        
      default:
        return this.getUnknownCommandResponse(chatId);
    }
  }

  generateAdminPanel(chatId) {
    const message = `🛡️ **АДМИН-ПАНЕЛЬ** 🛡️

⚡ Расширенная система управления
🔐 Полный доступ ко всем функциям

⚡ Выберите действие:`;

    const keyboard = [
      [
        { text: '📊 Статистика', callback_data: 'admin_stats' },
        { text: '👥 Пользователи', callback_data: 'admin_users' }
      ],
      [
        { text: '📢 Рассылки', callback_data: 'admin_broadcast' },
        { text: '⚙️ Настройки', callback_data: 'admin_settings' }
      ],
      [
        { text: '🎵 Музыка', callback_data: 'admin_music' },
        { text: '💾 Экспорт данных', callback_data: 'admin_export' }
      ],
      [{ text: '🚪 Выход', callback_data: 'main_menu' }]
    ];

    return {
      action: 'admin_panel',
      chatId: chatId,
      message: message,
      keyboard: keyboard
    };
  }

  async generateDetailedStats(chatId) {
    try {
      // Заглушка статистики
      const stats = {
        users: { total: 42, activeSubscribers: 15, newToday: 3, active7d: 28 },
        notifications: { morningSent: 12, eveningSent: 14, deliveryRate: 85 },
        music: { totalTracks: 156, requestsToday: 8, topGenres: ['ambient', 'classical', 'nature'] },
        oils: { total: 25, searchesToday: 23, topSearches: ['лаванда', 'мята', 'эвкалипт'] },
        activity: { messagesProcessed: 156, avgResponseTime: 2.3, errors: 2 }
      };
      
      const message = `📊 **Детальная статистика бота**

👥 **Пользователи:**
- Всего: ${stats.users.total}
- Активных подписчиков: ${stats.users.activeSubscribers}
- Новых за сегодня: ${stats.users.newToday}
- Активных за 7 дней: ${stats.users.active7d}

📤 **Уведомления за сегодня:**
- Утренних отправлено: ${stats.notifications.morningSent}
- Вечерних отправлено: ${stats.notifications.eveningSent}
- Успешная доставка: ${stats.notifications.deliveryRate}%

🎵 **Музыка:**
- Треков в библиотеке: ${stats.music.totalTracks}
- Запросов сегодня: ${stats.music.requestsToday}
- Популярные жанры: ${stats.music.topGenres.join(', ')}

🌿 **Масла:**
- Всего в базе: ${stats.oils.total}
- Поисковых запросов: ${stats.oils.searchesToday}
- Топ запросы: ${stats.oils.topSearches.join(', ')}

📈 **Активность:**
- Сообщений обработано: ${stats.activity.messagesProcessed}
- Среднее время ответа: ${stats.activity.avgResponseTime}с
- Ошибок: ${stats.activity.errors}

🕐 **Последнее обновление:** ${new Date().toLocaleString('ru-RU')}`;

      const keyboard = [
        [
          { text: '🔄 Обновить', callback_data: 'admin_stats' },
          { text: '📊 Экспорт статистики', callback_data: 'export_stats' }
        ],
        [{ text: '🏠 Админ-панель', callback_data: 'admin_panel' }]
      ];

      return {
        action: 'admin_detailed_stats',
        chatId: chatId,
        message: message,
        keyboard: keyboard,
        statsData: stats
      };

    } catch (error) {
      logger.error('Stats generation error:', error);
      return this.getErrorResponse(chatId);
    }
  }

  async generateUsersManagement(chatId) {
    try {
      // Заглушка пользователей
      const recentUsers = [
        { telegram_id: '123456789', first_name: 'Анна', subscription_status: 'active', last_activity: new Date() },
        { telegram_id: '987654321', first_name: 'Михаил', subscription_status: 'active', last_activity: new Date() },
        { telegram_id: '555666777', first_name: 'Елена', subscription_status: 'inactive', last_activity: new Date() }
      ];

      let message = `👥 **Управление пользователями**\n\n`;
      message += `📊 **Последние активные пользователи:**\n\n`;

      recentUsers.forEach((user, index) => {
        const status = user.subscription_status === 'active' ? '✅' : '❌';
        const lastActivity = new Date(user.last_activity).toLocaleDateString('ru-RU');
        message += `${index + 1}. ${status} ${user.first_name} (${user.telegram_id})\n`;
        message += `   Последняя активность: ${lastActivity}\n\n`;
      });

      const keyboard = [
        [
          { text: '📊 Полная статистика', callback_data: 'users_full_stats' },
          { text: '📤 Экспорт пользователей', callback_data: 'export_users' }
        ],
        [
          { text: '🔍 Поиск пользователя', callback_data: 'user_search' },
          { text: '📢 Рассылка', callback_data: 'admin_broadcast' }
        ],
        [{ text: '🏠 Админ-панель', callback_data: 'admin_panel' }]
      ];

      return {
        action: 'users_management',
        chatId: chatId,
        message: message,
        keyboard: keyboard,
        usersData: recentUsers
      };

    } catch (error) {
      logger.error('Users management error:', error);
      return this.getErrorResponse(chatId);
    }
  }

  generateBroadcastCreator(chatId) {
    const message = `📢 **Создание рассылки**

🎯 **Шаги создания:**
1️⃣ Напишите текст сообщения
2️⃣ Выберите аудиторию
3️⃣ Настройте расписание
4️⃣ Отправьте или запланируйте

📝 **Напишите текст для рассылки** (следующим сообщением):

💡 **Поддерживается:**
- Markdown форматирование
- Эмодзи
- Ссылки
- До 4096 символов

⚠️ **Важно:** После отправки текста появится меню с настройками аудитории.`;

    const keyboard = [
      [{ text: '📋 Шаблоны сообщений', callback_data: 'broadcast_templates' }],
      [{ text: '❌ Отмена', callback_data: 'admin_panel' }]
    ];

    return {
      action: 'broadcast_creator',
      chatId: chatId,
      message: message,
      keyboard: keyboard,
      broadcastStep: 'message_input'
    };
  }

  async generateStats(chatId) {
    return await this.generateDetailedStats(chatId);
  }

  async generateUsersList(chatId) {
    return await this.generateUsersManagement(chatId);
  }

  generateBroadcastMenu(chatId) {
    return this.generateBroadcastCreator(chatId);
  }

  async generateMusicStats(chatId) {
    const message = `🎵 **Статистика музыки**

📊 **Общая информация:**
- Треков в библиотеке: 156
- Запросов сегодня: 8
- Популярные жанры: ambient, classical, nature

🎯 **Топ запросы:**
1. "расслабляющая музыка" - 12 запросов
2. "энергичная музыка" - 8 запросов
3. "музыка для сна" - 6 запросов

📈 **Активность:**
- Среднее время прослушивания: 15 минут
- Повторные запросы: 45%
- Интеграция с платформами: 78%`;

    return {
      action: 'music_stats',
      chatId: chatId,
      message: message,
      keyboard: [
        [{ text: '🏠 Админ-панель', callback_data: 'admin_panel' }]
      ]
    };
  }

  generateExportMenu(chatId) {
    const message = `💾 **Экспорт данных**

📊 **Доступные экспорты:**
• Статистика пользователей (CSV)
• Логи взаимодействий (JSON)
• Музыкальные запросы (Excel)
• Уведомления (PDF)

⚙️ **Настройки экспорта:**
• Период: последние 30 дней
• Формат: CSV/JSON/Excel
• Сжатие: ZIP архив

📧 **Доставка:**
• Email: admin@example.com
• Telegram: прямая отправка
• Скачивание: прямая ссылка`;

    return {
      action: 'export_menu',
      chatId: chatId,
      message: message,
      keyboard: [
        [
          { text: '📊 Статистика', callback_data: 'export_stats' },
          { text: '👥 Пользователи', callback_data: 'export_users' }
        ],
        [
          { text: '🎵 Музыка', callback_data: 'export_music' },
          { text: '📝 Логи', callback_data: 'export_logs' }
        ],
        [{ text: '🏠 Админ-панель', callback_data: 'admin_panel' }]
      ]
    };
  }

  getAccessDeniedResponse(chatId) {
    return {
      action: 'access_denied',
      chatId: chatId,
      message: '❌ У вас нет прав администратора.',
      keyboard: [
        [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
      ]
    };
  }

  getUnknownCommandResponse(chatId) {
    return {
      action: 'admin_unknown_command',
      chatId: chatId,
      message: 'ℹ️ Неизвестная админская команда. Используйте /admin для помощи.',
      keyboard: [
        [{ text: '🛡️ Админ-панель', callback_data: 'admin_panel' }]
      ]
    };
  }

  getErrorResponse(chatId) {
    return {
      action: 'admin_error',
      chatId: chatId,
      message: '🚨 Произошла ошибка в админ-панели. Попробуйте позже.',
      keyboard: [
        [{ text: '🛡️ Админ-панель', callback_data: 'admin_panel' }]
      ]
    };
  }

  // ===== НОВЫЕ МЕТОДЫ ДЛЯ АДМИНСКИХ НАСТРОЕК =====

  async generateSettingsPanel(chatId) {
    try {
      const settings = await this.adminSettingsService.getAdminSettings(chatId);
      
      if (!settings) {
        // Инициализируем настройки если их нет
        await this.adminSettingsService.initializeAdminSettings(chatId);
        const newSettings = await this.adminSettingsService.getAdminSettings(chatId);
        return this.buildSettingsPanel(chatId, newSettings);
      }

      return this.buildSettingsPanel(chatId, settings);

    } catch (error) {
      logger.error('Settings panel generation error:', error);
      return this.getErrorResponse(chatId);
    }
  }

  buildSettingsPanel(chatId, settings) {
    const botSettings = settings.bot_settings || {};
    const dailyStats = settings.daily_stats || {};

    const message = `⚙️ **Настройки бота**

🔧 **Основные настройки:**
${botSettings.maintenance_mode ? '🔴' : '🟢'} Режим обслуживания: ${botSettings.maintenance_mode ? 'ВКЛ' : 'ВЫКЛ'}
${botSettings.daily_stats ? '🟢' : '🔴'} Ежедневная статистика: ${botSettings.daily_stats ? 'ВКЛ' : 'ВЫКЛ'}
${botSettings.broadcast_enabled ? '🟢' : '🔴'} Рассылки: ${botSettings.broadcast_enabled ? 'ВКЛ' : 'ВЫКЛ'}
${botSettings.error_notifications ? '🟢' : '🔴'} Уведомления об ошибках: ${botSettings.error_notifications ? 'ВКЛ' : 'ВЫКЛ'}
${botSettings.new_user_notifications ? '🟢' : '🔴'} Уведомления о новых пользователях: ${botSettings.new_user_notifications ? 'ВКЛ' : 'ВЫКЛ'}

📊 **Сегодняшняя статистика:**
❌ Ошибки: ${dailyStats.errors || 0}
👥 Новые пользователи: ${dailyStats.new_users || 0}
✅ Активные пользователи: ${dailyStats.active_users || 0}
📨 Отправлено сообщений: ${dailyStats.messages_sent || 0}
🕐 Последнее обновление: ${dailyStats.last_updated ? new Date(dailyStats.last_updated).toLocaleString('ru-RU') : 'Не обновлялось'}

Выберите настройку для изменения:`;

    const keyboard = [
      [
        { text: `${botSettings.maintenance_mode ? '🔴' : '🟢'} Режим обслуживания`, callback_data: 'admin_maintenance_toggle' },
        { text: `${botSettings.daily_stats ? '🟢' : '🔴'} Ежедневная статистика`, callback_data: 'admin_daily_stats_toggle' }
      ],
      [
        { text: `${botSettings.broadcast_enabled ? '🟢' : '🔴'} Рассылки`, callback_data: 'admin_broadcast_toggle' },
        { text: `${botSettings.error_notifications ? '🟢' : '🔴'} Ошибки`, callback_data: 'admin_error_notifications_toggle' }
      ],
      [
        { text: `${botSettings.new_user_notifications ? '🟢' : '🔴'} Новые пользователи`, callback_data: 'admin_new_user_notifications_toggle' }
      ],
      [{ text: '🏠 Админ-панель', callback_data: 'admin_panel' }]
    ];

    return {
      action: 'admin_settings_panel',
      chatId: chatId,
      message: message,
      keyboard: keyboard
    };
  }

  async toggleMaintenanceMode(chatId) {
    try {
      const currentMode = await this.adminSettingsService.isMaintenanceMode(chatId);
      const newMode = !currentMode;
      
      await this.adminSettingsService.setMaintenanceMode(chatId, newMode);
      
      const message = `🔧 **Режим обслуживания ${newMode ? 'ВКЛЮЧЕН' : 'ВЫКЛЮЧЕН'}**

${newMode ? '🔴 Бот переведен в режим обслуживания. Пользователи будут получать уведомление о временной недоступности.' : '🟢 Бот снова доступен для пользователей.'}

${newMode ? '⚠️ В режиме обслуживания бот будет отвечать только администраторам.' : '✅ Все функции бота восстановлены.'}`;

      return {
        action: 'maintenance_mode_toggled',
        chatId: chatId,
        message: message,
        keyboard: [
          [{ text: '⚙️ Настройки', callback_data: 'admin_settings' }],
          [{ text: '🏠 Админ-панель', callback_data: 'admin_panel' }]
        ]
      };

    } catch (error) {
      logger.error('Toggle maintenance mode error:', error);
      return this.getErrorResponse(chatId);
    }
  }

  async toggleDailyStats(chatId) {
    try {
      const currentSetting = await this.adminSettingsService.shouldSendDailyStats(chatId);
      const newSetting = !currentSetting;
      
      await this.adminSettingsService.toggleDailyStats(chatId, newSetting);
      
      const message = `📊 **Ежедневная статистика ${newSetting ? 'ВКЛЮЧЕНА' : 'ВЫКЛЮЧЕНА'}**

${newSetting ? '🟢 Вы будете получать ежедневные отчеты о работе бота.' : '🔴 Ежедневные отчеты отключены.'}`;

      return {
        action: 'daily_stats_toggled',
        chatId: chatId,
        message: message,
        keyboard: [
          [{ text: '⚙️ Настройки', callback_data: 'admin_settings' }],
          [{ text: '🏠 Админ-панель', callback_data: 'admin_panel' }]
        ]
      };

    } catch (error) {
      logger.error('Toggle daily stats error:', error);
      return this.getErrorResponse(chatId);
    }
  }

  async toggleBroadcastEnabled(chatId) {
    try {
      const currentSetting = await this.adminSettingsService.isBroadcastEnabled(chatId);
      const newSetting = !currentSetting;
      
      await this.adminSettingsService.toggleBroadcastEnabled(chatId, newSetting);
      
      const message = `📢 **Рассылки ${newSetting ? 'ВКЛЮЧЕНЫ' : 'ВЫКЛЮЧЕНЫ'}**

${newSetting ? '🟢 Вы можете отправлять рассылки пользователям.' : '🔴 Функция рассылок отключена.'}`;

      return {
        action: 'broadcast_toggled',
        chatId: chatId,
        message: message,
        keyboard: [
          [{ text: '⚙️ Настройки', callback_data: 'admin_settings' }],
          [{ text: '🏠 Админ-панель', callback_data: 'admin_panel' }]
        ]
      };

    } catch (error) {
      logger.error('Toggle broadcast enabled error:', error);
      return this.getErrorResponse(chatId);
    }
  }

  async toggleErrorNotifications(chatId) {
    try {
      const currentSetting = await this.adminSettingsService.shouldSendErrorNotifications(chatId);
      const newSetting = !currentSetting;
      
      await this.adminSettingsService.toggleErrorNotifications(chatId, newSetting);
      
      const message = `⚠️ **Уведомления об ошибках ${newSetting ? 'ВКЛЮЧЕНЫ' : 'ВЫКЛЮЧЕНЫ'}**

${newSetting ? '🟢 Вы будете получать уведомления о критических ошибках.' : '🔴 Уведомления об ошибках отключены.'}`;

      return {
        action: 'error_notifications_toggled',
        chatId: chatId,
        message: message,
        keyboard: [
          [{ text: '⚙️ Настройки', callback_data: 'admin_settings' }],
          [{ text: '🏠 Админ-панель', callback_data: 'admin_panel' }]
        ]
      };

    } catch (error) {
      logger.error('Toggle error notifications error:', error);
      return this.getErrorResponse(chatId);
    }
  }

  async toggleNewUserNotifications(chatId) {
    try {
      const currentSetting = await this.adminSettingsService.shouldSendNewUserNotifications(chatId);
      const newSetting = !currentSetting;
      
      await this.adminSettingsService.toggleNewUserNotifications(chatId, newSetting);
      
      const message = `👥 **Уведомления о новых пользователях ${newSetting ? 'ВКЛЮЧЕНЫ' : 'ВЫКЛЮЧЕНЫ'}**

${newSetting ? '🟢 Вы будете получать уведомления о новых подписчиках.' : '🔴 Уведомления о новых пользователях отключены.'}`;

      return {
        action: 'new_user_notifications_toggled',
        chatId: chatId,
        message: message,
        keyboard: [
          [{ text: '⚙️ Настройки', callback_data: 'admin_settings' }],
          [{ text: '🏠 Админ-панель', callback_data: 'admin_panel' }]
        ]
      };

    } catch (error) {
      logger.error('Toggle new user notifications error:', error);
      return this.getErrorResponse(chatId);
    }
  }
}

module.exports = AdminService; 