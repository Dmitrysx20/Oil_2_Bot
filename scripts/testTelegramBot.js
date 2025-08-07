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

async function testTelegramBot() {
  console.log('🤖 Тестирование Telegram бота\n');
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
    
    // Тестовые сценарии
    const testScenarios = [
      {
        name: 'Приветствие',
        text: 'Привет',
        description: 'Проверка обработки приветствия'
      },
      {
        name: 'Поиск масла',
        text: 'Лаванда',
        description: 'Проверка поиска конкретного масла'
      },
      {
        name: 'Запрос помощи',
        text: '/help',
        description: 'Проверка команды помощи'
      },
      {
        name: 'Музыкальный запрос',
        text: 'Хочу энергичную музыку',
        description: 'Проверка музыкальных рекомендаций'
      },
      {
        name: 'Общий запрос',
        text: 'Нужна энергия',
        description: 'Проверка AI рекомендаций'
      }
    ];

    for (const scenario of testScenarios) {
      console.log(`\n📋 ТЕСТ: ${scenario.name}`);
      console.log(`   📝 Описание: ${scenario.description}`);
      console.log(`   💬 Текст: "${scenario.text}"`);
      
      // Создаем тестовое обновление
      const testUpdate = {
        update_id: Math.floor(Math.random() * 1000),
        message: {
          message_id: Math.floor(Math.random() * 1000),
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
          text: scenario.text
        }
      };

      console.log('🔄 Обработка сообщения...');
      
      try {
        // Обрабатываем сообщение
        const response = await telegramController.processUpdate(testUpdate);
        
        console.log('✅ Результат:');
        console.log(`   📤 Ответ отправлен: ${response ? 'да' : 'нет'}`);
        
        if (response) {
          console.log(`   💬 Текст ответа: ${response.message ? response.message.substring(0, 80) + '...' : 'нет'}`);
          console.log(`   🎹 Клавиатура: ${response.keyboard ? 'есть' : 'нет'}`);
          console.log(`   🆔 Chat ID: ${response.chatId || 'не указан'}`);
        }
      } catch (error) {
        console.log(`❌ Ошибка: ${error.message}`);
      }
      
      console.log('─'.repeat(50));
    }

    console.log('\n🎉 Все тесты завершены!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    logger.error('Telegram bot test error:', error);
  }
}

// Запускаем тест
if (require.main === module) {
  testTelegramBot().catch(console.error);
}

module.exports = { testTelegramBot }; 