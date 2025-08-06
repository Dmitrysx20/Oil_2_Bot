const logger = require('../utils/logger');
const cron = require('node-cron');

class NotificationScheduler {
  constructor(subscriptionService, adminService) {
    this.subscriptionService = subscriptionService;
    this.adminService = adminService;
    this.jobs = new Map();
    this.isRunning = false;
  }

  start() {
    try {
      logger.info('🚀 Starting Notification Scheduler...');
      
      // Проверяем доступность сервисов
      if (!this.subscriptionService || !this.adminService) {
        throw new Error('Required services not available');
      }

      // Запускаем основные задачи
      this.scheduleWeeklyNotifications();
      this.scheduleDailyHealthCheck();
      this.scheduleMonthlyStats();
      
      // Запускаем задачи для опросников
      this.scheduleMorningSurveys();
      this.scheduleEveningSurveys();
      this.scheduleWeeklySurveys();

      this.isRunning = true;
      logger.info('✅ Notification Scheduler started successfully');

    } catch (error) {
      logger.error('❌ Failed to start Notification Scheduler:', error);
      throw error;
    }
  }

  stop() {
    try {
      logger.info('🛑 Stopping Notification Scheduler...');
      
      // Останавливаем все активные задачи
      for (const [jobName, job] of this.jobs) {
        if (job && typeof job.stop === 'function') {
          job.stop();
          logger.info(`Stopped job: ${jobName}`);
        }
      }
      
      this.jobs.clear();
      this.isRunning = false;
      logger.info('✅ Notification Scheduler stopped');

    } catch (error) {
      logger.error('❌ Error stopping Notification Scheduler:', error);
    }
  }

  scheduleWeeklyNotifications() {
    try {
      // Планируем отправку уведомлений по понедельникам и четвергам в 10:00
      const weeklyJob = cron.schedule('0 10 * * 1,4', async () => {
        logger.info('📅 Running weekly notifications job');
        await this.sendWeeklyNotifications();
      }, {
        scheduled: false,
        timezone: 'Europe/Moscow'
      });

      weeklyJob.start();
      this.jobs.set('weekly_notifications', weeklyJob);
      logger.info('📅 Weekly notifications scheduled (Mon, Thu 10:00)');

    } catch (error) {
      logger.error('❌ Failed to schedule weekly notifications:', error);
    }
  }

  scheduleDailyHealthCheck() {
    try {
      // Ежедневная проверка здоровья системы в 6:00
      const healthJob = cron.schedule('0 6 * * *', async () => {
        logger.info('🏥 Running daily health check');
        await this.performHealthCheck();
      }, {
        scheduled: false,
        timezone: 'Europe/Moscow'
      });

      healthJob.start();
      this.jobs.set('daily_health_check', healthJob);
      logger.info('🏥 Daily health check scheduled (6:00 daily)');

    } catch (error) {
      logger.error('❌ Failed to schedule daily health check:', error);
    }
  }

  scheduleMonthlyStats() {
    try {
      // Ежемесячная статистика в первое число месяца в 9:00
      const statsJob = cron.schedule('0 9 1 * *', async () => {
        logger.info('📊 Running monthly stats collection');
        await this.collectMonthlyStats();
      }, {
        scheduled: false,
        timezone: 'Europe/Moscow'
      });

      statsJob.start();
      this.jobs.set('monthly_stats', statsJob);
      logger.info('📊 Monthly stats scheduled (1st of month 9:00)');

    } catch (error) {
      logger.error('❌ Failed to schedule monthly stats:', error);
    }
  }

  scheduleMorningSurveys() {
    try {
      // Утренние опросники каждый день в 9:00
      const morningJob = cron.schedule('0 9 * * *', async () => {
        logger.info('🌅 Running morning surveys job');
        await this.sendMorningSurveys();
      }, {
        scheduled: false,
        timezone: 'Europe/Moscow'
      });

      morningJob.start();
      this.jobs.set('morning_surveys', morningJob);
      logger.info('🌅 Morning surveys scheduled (9:00 daily)');

    } catch (error) {
      logger.error('❌ Failed to schedule morning surveys:', error);
    }
  }

  scheduleEveningSurveys() {
    try {
      // Вечерние опросники каждый день в 20:00
      const eveningJob = cron.schedule('0 20 * * *', async () => {
        logger.info('🌙 Running evening surveys job');
        await this.sendEveningSurveys();
      }, {
        scheduled: false,
        timezone: 'Europe/Moscow'
      });

      eveningJob.start();
      this.jobs.set('evening_surveys', eveningJob);
      logger.info('🌙 Evening surveys scheduled (20:00 daily)');

    } catch (error) {
      logger.error('❌ Failed to schedule evening surveys:', error);
    }
  }

  scheduleWeeklySurveys() {
    try {
      // Еженедельные опросники по воскресеньям в 18:00
      const weeklyJob = cron.schedule('0 18 * * 0', async () => {
        logger.info('📅 Running weekly surveys job');
        await this.sendWeeklySurveys();
      }, {
        scheduled: false,
        timezone: 'Europe/Moscow'
      });

      weeklyJob.start();
      this.jobs.set('weekly_surveys', weeklyJob);
      logger.info('📅 Weekly surveys scheduled (Sunday 18:00)');

    } catch (error) {
      logger.error('❌ Failed to schedule weekly surveys:', error);
    }
  }

  async sendWeeklyNotifications() {
    try {
      logger.info('📧 Starting weekly notifications...');

      // Получаем список подписчиков
      const subscribers = await this.subscriptionService.getActiveSubscribers();
      
      if (!subscribers || subscribers.length === 0) {
        logger.info('No active subscribers found');
        return;
      }

      logger.info(`Found ${subscribers.length} active subscribers`);

      // Получаем новые масла за неделю
      const newOils = await this.getNewOilsForWeek();
      
      // Получаем полезные статьи
      const articles = await this.getWeeklyArticles();

      // Формируем сообщение
      const message = this.formatWeeklyMessage(newOils, articles);

      // Отправляем уведомления
      let successCount = 0;
      let errorCount = 0;

      for (const subscriber of subscribers) {
        try {
          await this.subscriptionService.sendNotification(
            subscriber.chatId,
            message,
            subscriber.preferences
          );
          successCount++;
          
          // Небольшая задержка между отправками
          await this.delay(100);
          
        } catch (error) {
          logger.error(`Failed to send notification to ${subscriber.chatId}:`, error);
          errorCount++;
        }
      }

      logger.info(`📧 Weekly notifications sent: ${successCount} success, ${errorCount} errors`);

      // Отправляем отчет администраторам
      await this.sendAdminReport('weekly_notifications', {
        totalSubscribers: subscribers.length,
        successCount,
        errorCount,
        newOilsCount: newOils.length,
        articlesCount: articles.length
      });

    } catch (error) {
      logger.error('❌ Error in weekly notifications:', error);
    }
  }

  async sendMorningSurveys() {
    try {
      logger.info('🌅 Starting morning surveys...');

      const SurveyService = require('../services/SurveyService');
      const surveyService = new SurveyService();

      // Получаем список активных подписчиков
      const subscribers = await this.subscriptionService.getActiveSubscribers();
      
      if (!subscribers || subscribers.length === 0) {
        logger.info('No active subscribers for morning surveys');
        return;
      }

      logger.info(`Sending morning surveys to ${subscribers.length} subscribers`);

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const subscriber of subscribers) {
        try {
          const result = await surveyService.sendMorningSurvey(subscriber.chatId);
          
          if (result && result.success) {
            successCount++;
            logger.debug(`✅ Morning survey sent to ${subscriber.chatId}`);
          } else {
            errorCount++;
            errors.push(`Failed to send to ${subscriber.chatId}: ${result?.error || 'Unknown error'}`);
          }
          
          // Задержка между отправками
          await this.delay(200);
          
        } catch (error) {
          logger.error(`Failed to send morning survey to ${subscriber.chatId}:`, error);
          errorCount++;
          errors.push(`Error sending to ${subscriber.chatId}: ${error.message}`);
        }
      }

      logger.info(`🌅 Morning surveys completed: ${successCount} success, ${errorCount} errors`);

      // Отправляем отчет администраторам
      await this.sendAdminReport('morning_surveys', {
        totalSubscribers: subscribers.length,
        successCount,
        errorCount,
        errors: errors.slice(0, 10) // Показываем только первые 10 ошибок
      });

    } catch (error) {
      logger.error('❌ Error in morning surveys:', error);
    }
  }

  async sendEveningSurveys() {
    try {
      logger.info('🌙 Starting evening surveys...');

      const SurveyService = require('../services/SurveyService');
      const surveyService = new SurveyService();

      // Получаем список активных подписчиков
      const subscribers = await this.subscriptionService.getActiveSubscribers();
      
      if (!subscribers || subscribers.length === 0) {
        logger.info('No active subscribers for evening surveys');
        return;
      }

      logger.info(`Sending evening surveys to ${subscribers.length} subscribers`);

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const subscriber of subscribers) {
        try {
          const result = await surveyService.sendEveningSurvey(subscriber.chatId);
          
          if (result && result.success) {
            successCount++;
            logger.debug(`✅ Evening survey sent to ${subscriber.chatId}`);
          } else {
            errorCount++;
            errors.push(`Failed to send to ${subscriber.chatId}: ${result?.error || 'Unknown error'}`);
          }
          
          // Задержка между отправками
          await this.delay(200);
          
        } catch (error) {
          logger.error(`Failed to send evening survey to ${subscriber.chatId}:`, error);
          errorCount++;
          errors.push(`Error sending to ${subscriber.chatId}: ${error.message}`);
        }
      }

      logger.info(`🌙 Evening surveys completed: ${successCount} success, ${errorCount} errors`);

      // Отправляем отчет администраторам
      await this.sendAdminReport('evening_surveys', {
        totalSubscribers: subscribers.length,
        successCount,
        errorCount,
        errors: errors.slice(0, 10)
      });

    } catch (error) {
      logger.error('❌ Error in evening surveys:', error);
    }
  }

  async sendWeeklySurveys() {
    try {
      logger.info('📅 Starting weekly surveys...');

      const SurveyService = require('../services/SurveyService');
      const surveyService = new SurveyService();

      // Получаем список активных подписчиков
      const subscribers = await this.subscriptionService.getActiveSubscribers();
      
      if (!subscribers || subscribers.length === 0) {
        logger.info('No active subscribers for weekly surveys');
        return;
      }

      logger.info(`Sending weekly surveys to ${subscribers.length} subscribers`);

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const subscriber of subscribers) {
        try {
          const result = await surveyService.sendWeeklySurvey(subscriber.chatId);
          
          if (result && result.success) {
            successCount++;
            logger.debug(`✅ Weekly survey sent to ${subscriber.chatId}`);
          } else {
            errorCount++;
            errors.push(`Failed to send to ${subscriber.chatId}: ${result?.error || 'Unknown error'}`);
          }
          
          // Задержка между отправками
          await this.delay(200);
          
        } catch (error) {
          logger.error(`Failed to send weekly survey to ${subscriber.chatId}:`, error);
          errorCount++;
          errors.push(`Error sending to ${subscriber.chatId}: ${error.message}`);
        }
      }

      logger.info(`📅 Weekly surveys completed: ${successCount} success, ${errorCount} errors`);

      // Отправляем отчет администраторам
      await this.sendAdminReport('weekly_surveys', {
        totalSubscribers: subscribers.length,
        successCount,
        errorCount,
        errors: errors.slice(0, 10)
      });

    } catch (error) {
      logger.error('❌ Error in weekly surveys:', error);
    }
  }

  async performHealthCheck() {
    try {
      logger.info('🏥 Performing health check...');

      const healthReport = {
        timestamp: new Date().toISOString(),
        services: {},
        database: {},
        telegram: {}
      };

      // Проверяем сервисы
      try {
        const subscriptionCount = await this.subscriptionService.getSubscriberCount();
        healthReport.services.subscriptionService = 'OK';
        healthReport.database.subscribers = subscriptionCount;
      } catch (error) {
        healthReport.services.subscriptionService = 'ERROR';
        logger.error('Subscription service health check failed:', error);
      }

      // Проверяем Telegram API
      try {
        // Здесь можно добавить проверку Telegram API
        healthReport.telegram.status = 'OK';
      } catch (error) {
        healthReport.telegram.status = 'ERROR';
        logger.error('Telegram API health check failed:', error);
      }

      // Отправляем отчет администраторам
      await this.sendAdminReport('health_check', healthReport);

      logger.info('🏥 Health check completed');

    } catch (error) {
      logger.error('❌ Health check failed:', error);
    }
  }

  async collectMonthlyStats() {
    try {
      logger.info('📊 Collecting monthly statistics...');

      const stats = {
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        subscribers: {
          total: await this.subscriptionService.getSubscriberCount(),
          new: await this.subscriptionService.getNewSubscribersThisMonth(),
          active: await this.subscriptionService.getActiveSubscribersCount()
        },
        notifications: {
          sent: await this.subscriptionService.getNotificationsSentThisMonth(),
          delivered: await this.subscriptionService.getNotificationsDeliveredThisMonth()
        },
        usage: {
          totalRequests: await this.getTotalRequestsThisMonth(),
          popularOils: await this.getPopularOilsThisMonth(),
          popularKeywords: await this.getPopularKeywordsThisMonth()
        }
      };

      // Сохраняем статистику
      await this.adminService.saveMonthlyStats(stats);

      // Отправляем отчет администраторам
      await this.sendAdminReport('monthly_stats', stats);

      logger.info('📊 Monthly stats collected and saved');

    } catch (error) {
      logger.error('❌ Failed to collect monthly stats:', error);
    }
  }

  async getNewOilsForWeek() {
    try {
      // Здесь должна быть логика получения новых масел
      // Пока возвращаем пустой массив
      return [];
    } catch (error) {
      logger.error('Error getting new oils:', error);
      return [];
    }
  }

  async getWeeklyArticles() {
    try {
      // Здесь должна быть логика получения статей
      // Пока возвращаем пустой массив
      return [];
    } catch (error) {
      logger.error('Error getting weekly articles:', error);
      return [];
    }
  }

  formatWeeklyMessage(newOils, articles) {
    let message = `🌿 **Еженедельная рассылка ароматерапии** 🌿\n\n`;

    if (newOils.length > 0) {
      message += `🆕 **Новые масла в базе:**\n`;
      newOils.forEach(oil => {
        message += `• ${oil.name} - ${oil.shortDescription}\n`;
      });
      message += `\n`;
    }

    if (articles.length > 0) {
      message += `📚 **Полезные статьи:**\n`;
      articles.forEach(article => {
        message += `• ${article.title}\n`;
      });
      message += `\n`;
    }

    if (newOils.length === 0 && articles.length === 0) {
      message += `💡 **Совет недели:**\n`;
      message += `Попробуйте смешать лаванду с мятой для создания успокаивающего и освежающего аромата. Идеально для вечернего релакса!\n\n`;
    }

    message += `🔍 **Найдите свое идеальное масло:**\n`;
    message += `Просто напишите мне название масла или опишите свое настроение!\n\n`;
    message += `💚 С любовью, ваш арома-помощник`;

    return message;
  }

  async sendAdminReport(type, data) {
    try {
      const admins = await this.adminService.getAdminUsers();
      
      if (!admins || admins.length === 0) {
        logger.warn('No admin users found for report');
        return;
      }

      const reportMessage = this.formatAdminReport(type, data);

      for (const admin of admins) {
        try {
          await this.adminService.sendMessage(admin.chatId, reportMessage);
        } catch (error) {
          logger.error(`Failed to send admin report to ${admin.chatId}:`, error);
        }
      }

      logger.info(`📊 Admin report sent to ${admins.length} admins`);

    } catch (error) {
      logger.error('❌ Failed to send admin report:', error);
    }
  }

  formatAdminReport(type, data) {
    const timestamp = new Date().toLocaleString('ru-RU');
    
    switch (type) {
      case 'weekly_notifications':
        return `📊 **Отчет о еженедельных уведомлениях**\n\n` +
               `📅 Время: ${timestamp}\n` +
               `👥 Всего подписчиков: ${data.totalSubscribers}\n` +
               `✅ Успешно отправлено: ${data.successCount}\n` +
               `❌ Ошибок: ${data.errorCount}\n` +
               `🆕 Новых масел: ${data.newOilsCount}\n` +
               `📚 Статей: ${data.articlesCount}`;

      case 'morning_surveys':
        return `🌅 **Отчет об утренних опросниках**\n\n` +
               `📅 Время: ${timestamp}\n` +
               `👥 Всего подписчиков: ${data.totalSubscribers}\n` +
               `✅ Успешно отправлено: ${data.successCount}\n` +
               `❌ Ошибок: ${data.errorCount}\n` +
               `📊 Процент успеха: ${data.totalSubscribers > 0 ? Math.round((data.successCount / data.totalSubscribers) * 100) : 0}%`;

      case 'evening_surveys':
        return `🌙 **Отчет о вечерних опросниках**\n\n` +
               `📅 Время: ${timestamp}\n` +
               `👥 Всего подписчиков: ${data.totalSubscribers}\n` +
               `✅ Успешно отправлено: ${data.successCount}\n` +
               `❌ Ошибок: ${data.errorCount}\n` +
               `📊 Процент успеха: ${data.totalSubscribers > 0 ? Math.round((data.successCount / data.totalSubscribers) * 100) : 0}%`;

      case 'weekly_surveys':
        return `📅 **Отчет о еженедельных опросниках**\n\n` +
               `📅 Время: ${timestamp}\n` +
               `👥 Всего подписчиков: ${data.totalSubscribers}\n` +
               `✅ Успешно отправлено: ${data.successCount}\n` +
               `❌ Ошибок: ${data.errorCount}\n` +
               `📊 Процент успеха: ${data.totalSubscribers > 0 ? Math.round((data.successCount / data.totalSubscribers) * 100) : 0}%`;

      case 'health_check':
        return `🏥 **Отчет о состоянии системы**\n\n` +
               `📅 Время: ${timestamp}\n` +
               `🔧 Сервисы: ${JSON.stringify(data.services)}\n` +
               `💾 База данных: ${JSON.stringify(data.database)}\n` +
               `📱 Telegram: ${data.telegram.status}`;

      case 'monthly_stats':
        return `📈 **Ежемесячная статистика**\n\n` +
               `📅 Месяц: ${data.month}\n` +
               `👥 Подписчики: ${data.subscribers.total} (новых: ${data.subscribers.new})\n` +
               `📧 Уведомления: ${data.notifications.sent} отправлено, ${data.notifications.delivered} доставлено\n` +
               `🔍 Запросов: ${data.usage.totalRequests}`;

      default:
        return `📊 **Отчет: ${type}**\n\n` +
               `📅 Время: ${timestamp}\n` +
               `📋 Данные: ${JSON.stringify(data, null, 2)}`;
    }
  }

  async getTotalRequestsThisMonth() {
    // Заглушка - здесь должна быть реальная логика
    return 0;
  }

  async getPopularOilsThisMonth() {
    // Заглушка - здесь должна быть реальная логика
    return [];
  }

  async getPopularKeywordsThisMonth() {
    // Заглушка - здесь должна быть реальная логика
    return [];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Методы для ручного запуска опросников (для тестирования)
  async runMorningSurveysNow() {
    logger.info('🌅 Manually running morning surveys...');
    await this.sendMorningSurveys();
  }

  async runEveningSurveysNow() {
    logger.info('🌙 Manually running evening surveys...');
    await this.sendEveningSurveys();
  }

  async runWeeklySurveysNow() {
    logger.info('📅 Manually running weekly surveys...');
    await this.sendWeeklySurveys();
  }

  async runAllSurveysNow() {
    logger.info('📊 Manually running all surveys...');
    await this.sendMorningSurveys();
    await this.delay(1000);
    await this.sendEveningSurveys();
    await this.delay(1000);
    await this.sendWeeklySurveys();
  }

  getStatus() {
    const activeJobs = Array.from(this.jobs.keys());
    const surveyJobs = activeJobs.filter(job => job.includes('survey'));
    const notificationJobs = activeJobs.filter(job => !job.includes('survey'));
    
    return {
      isRunning: this.isRunning,
      activeJobs: activeJobs,
      jobCount: this.jobs.size,
      surveyJobs: surveyJobs,
      notificationJobs: notificationJobs,
      scheduledTasks: {
        morningSurveys: '9:00 daily',
        eveningSurveys: '20:00 daily', 
        weeklySurveys: 'Sunday 18:00',
        weeklyNotifications: 'Mon, Thu 10:00',
        healthCheck: '6:00 daily',
        monthlyStats: '1st of month 9:00'
      }
    };
  }
}

module.exports = NotificationScheduler; 