// Универсальная шина обработки сообщений через TelegramController
const TelegramController = require('../controllers/TelegramController');
const TelegramService = require('../services/TelegramService');
const SmartRouter = require('../services/SmartRouter');
const OilSearchService = require('../services/OilSearchService');
const AIService = require('../services/AIService');
const MusicService = require('../services/MusicService');
const SubscriptionService = require('../services/SubscriptionService');
const AdminService = require('../services/AdminService');

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

    // Нормализуем входящее обновление к формату Telegram API
    // - Событие message: { message: <Message> }
    // - Событие callback_query: { callback_query: <CallbackQuery> }
    let normalizedUpdate = update;
    if (update && update.data && update.message && !update.callback_query) {
      // node-telegram-bot-api передает callbackQuery объектом без обертки update
      normalizedUpdate = { callback_query: update };
    } else if (update && update.message_id && update.chat && !update.message) {
      // node-telegram-bot-api передает message объектом без обертки update
      normalizedUpdate = { message: update };
    }

    // Обрабатываем обновление через контроллер
    const response = await telegramController.processUpdate(normalizedUpdate);
    
    console.log('🔍 Response from controller:', JSON.stringify(response, null, 2));
    
    if (response && response.message) {
      // Отправляем ответ
      const messageOptions = {
        parse_mode: 'Markdown'
      };
      
      // Правильно обрабатываем клавиатуру
      if (response.keyboard) {
        if (response.keyboard.inline_keyboard) {
          // Клавиатура уже в правильном формате
          messageOptions.reply_markup = response.keyboard;
        } else {
          // Клавиатура в старом формате, оборачиваем в inline_keyboard
          messageOptions.reply_markup = {
            inline_keyboard: response.keyboard
          };
        }
      }
      
      console.log('📤 Sending message to chatId:', response.chatId);
      
      if (!response.chatId) {
        console.error('❌ chatId is undefined!');
        return;
      }
      
      await bot.sendMessage(
        response.chatId, 
        response.message, 
        messageOptions
      );
      
      // Отвечаем на callback_query если есть
      if (update.callback_query && response.callbackQueryId) {
        await bot.answerCallbackQuery(response.callbackQueryId);
      }
    }
  } catch (error) {
    console.error('HandleUpdate error:', error);
    
    // Fallback ответ
    const chatId = (update.message?.chat?.id)
      || (update.callback_query?.message?.chat?.id)
      || (update.chat?.id);
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
