// Универсальная шина обработки сообщений через TelegramController
const TelegramController = require('../src/controllers/TelegramController');
const TelegramService = require('../src/services/TelegramService');
const SmartRouter = require('../src/services/SmartRouter');
const OilSearchService = require('../src/services/OilSearchService');
const AIService = require('../src/services/AIService');
const MusicService = require('../src/services/MusicService');
const SubscriptionService = require('../src/services/SubscriptionService');
const AdminService = require('../src/services/AdminService');

module.exports = async function handleUpdate(bot, update, services) {
  try {
    // Инициализируем все сервисы
    const telegramService = new TelegramService();
    const smartRouter = new SmartRouter();
    const oilSearchService = new OilSearchService();
    const aiService = new AIService();
    const musicService = new MusicService();
    const subscriptionService = new SubscriptionService();
    const adminService = new AdminService();

    // Создаем объект services для контроллера
    const controllerServices = {
      telegramService,
      smartRouter,
      oilSearchService,
      aiService,
      musicService,
      subscriptionService,
      adminService
    };

    // Создаем контроллер
    const telegramController = new TelegramController(controllerServices);
    
    // Обрабатываем обновление через контроллер
    const response = await telegramController.processUpdate(update);
    
    if (response && response.message) {
      // Отправляем ответ
      await bot.sendMessage(
        response.chatId, 
        response.message, 
        { 
          parse_mode: 'Markdown',
          reply_markup: response.keyboard ? {
            inline_keyboard: response.keyboard
          } : undefined
        }
      );
      
      // Отвечаем на callback_query если есть
      if (update.callback_query && response.callbackQueryId) {
        await bot.answerCallbackQuery(response.callbackQueryId);
      }
    }
  } catch (error) {
    console.error('HandleUpdate error:', error);
    
    // Fallback ответ
    const chatId = update.message?.chat?.id || update.callback_query?.message?.chat?.id;
    if (chatId) {
      await bot.sendMessage(
        chatId, 
        '😔 Произошла ошибка при обработке запроса. Попробуйте позже.'
      );
      
      // Отвечаем на callback_query если есть
      if (update.callback_query) {
        await bot.answerCallbackQuery(update.callback_query.id);
      }
    }
  }
};
