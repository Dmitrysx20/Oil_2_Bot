const TelegramController = require('../src/controllers/TelegramController');
const SmartRouter = require('../src/services/SmartRouter');
const OilSearchService = require('../src/services/OilSearchService');
const AIService = require('../src/services/AIService');
const MusicService = require('../src/services/MusicService');
const SubscriptionService = require('../src/services/SubscriptionService');
const AdminService = require('../src/services/AdminService');
const TelegramService = require('../src/services/TelegramService');

// Мок для TelegramService
class MockTelegramService {
  async sendResponse(result) {
    console.log('📤 Отправляем ответ:', {
      chatId: result.chatId,
      message: result.message?.substring(0, 100) + '...',
      hasKeyboard: !!result.keyboard,
      requestType: result.requestType
    });
  }

  async answerCallbackQuery(callbackQueryId, text) {
    console.log('✅ Отвечаем на callback:', { callbackQueryId, text });
  }
}

async function testButtons() {
  console.log('🧪 Тестируем кнопки бота...\n');

  // Создаем сервисы
  const telegramService = new MockTelegramService();
  const smartRouter = new SmartRouter();
  const oilSearchService = new OilSearchService();
  const aiService = new AIService();
  const musicService = new MusicService();
  const subscriptionService = new SubscriptionService();
  const adminService = new AdminService();

  const services = {
    telegramService,
    smartRouter,
    oilSearchService,
    aiService,
    musicService,
    subscriptionService,
    adminService
  };

  const controller = new TelegramController(services);

  // Тестовые callback'и
  const testCallbacks = [
    { name: 'Энергия', data: 'need_energy' },
    { name: 'Релакс', data: 'want_relax' },
    { name: 'Здоровье', data: 'health_issues' },
    { name: 'Музыка', data: 'music_menu' },
    { name: 'Помощь', data: 'help_menu' },
    { name: 'Главное меню', data: 'main_menu' },
    { name: 'Подписка', data: 'subscribe' }
  ];

  for (const testCallback of testCallbacks) {
    console.log(`\n🔘 Тестируем кнопку: ${testCallback.name}`);
    
    const mockCallbackQuery = {
      id: `test_${Date.now()}`,
      data: testCallback.data,
      message: {
        chat: { id: 123456789 }
      },
      from: {
        first_name: 'Тест'
      }
    };

    const mockUpdate = {
      callback_query: mockCallbackQuery
    };

    try {
      const result = await controller.processUpdate(mockUpdate);
      console.log(`✅ Результат: ${result.requestType || 'неизвестно'}`);
      console.log(`📝 Сообщение: ${result.message?.substring(0, 50)}...`);
    } catch (error) {
      console.log(`❌ Ошибка: ${error.message}`);
    }
  }

  console.log('\n🎉 Тест завершен!');
}

// Запускаем тест
testButtons().catch(console.error);
