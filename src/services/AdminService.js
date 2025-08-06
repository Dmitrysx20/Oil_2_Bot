const logger = require('../utils/logger');
const config = require('../../config');

class AdminService {
  constructor() {
    this.adminChatIds = config.admin.chatIds;
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
        { text: '🔔 Уведомления', callback_data: 'admin_notifications' }
      ],
      [
        { text: '🎵 Музыка', callback_data: 'admin_music' },
        { text: '💡 Рекомендации', callback_data: 'admin_recommendations' }
      ],
      [
        { text: '💾 Экспорт данных', callback_data: 'admin_export' },
        { text: '⚙️ Настройки бота', callback_data: 'admin_settings' }
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
}

module.exports = AdminService; 