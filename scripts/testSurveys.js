const NotificationScheduler = require('../src/jobs/NotificationScheduler');
const SubscriptionService = require('../src/services/SubscriptionService');
const AdminService = require('../src/services/AdminService');
const logger = require('../src/utils/logger');

async function testSurveys() {
  try {
    logger.info('🧪 Starting survey scheduler test...');

    // Создаем мок-сервисы для тестирования
    const mockSubscriptionService = {
      getActiveSubscribers: async () => [
        { chatId: 123456789, userName: 'Test User 1' },
        { chatId: 987654321, userName: 'Test User 2' }
      ],
      getSubscriberCount: async () => 2,
      getNewSubscribersThisMonth: async () => 0,
      getActiveSubscribersCount: async () => 2,
      getNotificationsSentThisMonth: async () => 0,
      getNotificationsDeliveredThisMonth: async () => 0
    };

    const mockAdminService = {
      getAdminUsers: async () => [
        { chatId: 111111111, userName: 'Admin' }
      ],
      sendMessage: async (chatId, message) => {
        logger.info(`📤 Admin message to ${chatId}: ${message.substring(0, 100)}...`);
        return { success: true };
      },
      saveMonthlyStats: async (stats) => {
        logger.info('📊 Monthly stats saved:', stats);
        return { success: true };
      }
    };

    // Создаем планировщик
    const scheduler = new NotificationScheduler(mockSubscriptionService, mockAdminService);

    // Запускаем планировщик
    scheduler.start();

    // Показываем статус
    const status = scheduler.getStatus();
    logger.info('📊 Scheduler status:', JSON.stringify(status, null, 2));

    // Тестируем ручной запуск опросников
    logger.info('🧪 Testing manual survey execution...');

    // Утренние опросники
    await scheduler.runMorningSurveysNow();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Вечерние опросники
    await scheduler.runEveningSurveysNow();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Еженедельные опросники
    await scheduler.runWeeklySurveysNow();
    await new Promise(resolve => setTimeout(resolve, 2000));

    logger.info('✅ Survey tests completed successfully');

    // Останавливаем планировщик
    scheduler.stop();

  } catch (error) {
    logger.error('❌ Survey test failed:', error);
  }
}

// Запускаем тест
testSurveys(); 