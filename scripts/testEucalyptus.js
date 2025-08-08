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

async function testEucalyptus() {
  console.log('🌿 Тестирование поиска эвкалипта\n');
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
    
    // Тестовые сценарии для эвкалипта
    const testScenarios = [
      {
        name: 'Поиск эвкалипта',
        text: 'эфкалипт',
        description: 'Проверка поиска эвкалипта (с опечаткой)'
      },
      {
        name: 'Поиск эвкалипта правильное написание',
        text: 'эвкалипт',
        description: 'Проверка поиска эвкалипта (правильное написание)'
      },
      {
        name: 'Поиск эвкалипта после контекста',
        text: 'Хочу расслабиться, покажи эвкалипт',
        description: 'Проверка поиска эвкалипта в контексте'
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
        if (response && response.message) {
          console.log(`   💬 Текст ответа: ${response.message.substring(0, 100)}...`);
        }
        console.log(`   🎹 Клавиатура: ${response && response.keyboard ? 'есть' : 'нет'}`);
        console.log(`   🆔 Chat ID: ${response ? response.chatId : 'N/A'}`);
        console.log('──────────────────────────────────────────────────');
        
      } catch (error) {
        console.log('❌ Ошибка при обработке:', error.message);
        console.log('──────────────────────────────────────────────────');
      }
    }

    console.log('\n🎉 Тест эвкалипта завершен!');

  } catch (error) {
    console.error('❌ Ошибка в тесте:', error);
  }
}

testEucalyptus();
