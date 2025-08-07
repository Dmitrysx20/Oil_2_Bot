require('dotenv').config();
const TelegramController = require('../src/controllers/TelegramController');
const TelegramService = require('../src/services/TelegramService');
const SmartRouter = require('../src/services/SmartRouter');
const OilSearchService = require('../src/services/OilSearchService');
const AIService = require('../src/services/AIService');
const MusicService = require('../src/services/MusicService');
const SubscriptionService = require('../src/services/SubscriptionService');
const AdminService = require('../src/services/AdminService');
const logger = require('../src/utils/logger');

async function testStartCommand() {
  console.log('🚀 Тестирование команды /start\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Инициализируем все сервисы
    const telegramService = new TelegramService();
    const smartRouter = new SmartRouter();
    const oilSearchService = new OilSearchService();
    const aiService = new AIService();
    const musicService = new MusicService();
    const subscriptionService = new SubscriptionService();
    const adminService = new AdminService();

    // Создаем объект services
    const services = {
      telegramService,
      smartRouter,
      oilSearchService,
      aiService,
      musicService,
      subscriptionService,
      adminService
    };

    // Создаем контроллер
    const telegramController = new TelegramController(services);
    
    // Тестовые данные для команды /start
    const testUpdate = {
      update_id: 1,
      message: {
        message_id: 1,
        from: {
          id: 123456789,
          is_bot: false,
          first_name: 'Test',
          username: 'testuser'
        },
        chat: {
          id: 123456789,
          type: 'private'
        },
        date: Math.floor(Date.now() / 1000),
        text: '/start'
      }
    };

    console.log('📝 Тестовое сообщение:');
    console.log(`   👤 Пользователь: ${testUpdate.message.from.first_name}`);
    console.log(`   💬 Команда: "${testUpdate.message.text}"`);
    console.log(`   🆔 Chat ID: ${testUpdate.message.chat.id}`);

    console.log('\n🔄 Обработка команды /start...');
    
    // Обрабатываем сообщение
    const response = await telegramController.processUpdate(testUpdate);
    
    console.log('\n✅ Результат обработки:');
    console.log(`   📤 Ответ отправлен: ${response ? 'да' : 'нет'}`);
    
    if (response) {
      console.log(`   💬 Текст ответа: ${response.message ? response.message.substring(0, 200) + '...' : 'нет'}`);
      console.log(`   🎹 Клавиатура: ${response.keyboard ? 'есть' : 'нет'}`);
      console.log(`   🆔 Chat ID: ${response.chatId || 'не указан'}`);
      
      if (response.keyboard) {
        console.log(`   📋 Кнопки: ${response.keyboard.length} рядов`);
        response.keyboard.forEach((row, i) => {
          console.log(`      Ряд ${i + 1}: ${row.length} кнопок`);
        });
      }
    }

    console.log('\n🎉 Тест команды /start завершен!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    logger.error('Start command test error:', error);
  }
}

// Запускаем тест
if (require.main === module) {
  testStartCommand().catch(console.error);
}

module.exports = { testStartCommand }; 