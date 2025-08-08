require('dotenv').config();
const SmartRouter = require('../src/services/SmartRouter');
const TelegramController = require('../src/controllers/TelegramController');
const TelegramService = require('../src/services/TelegramService');
const OilSearchService = require('../src/services/OilSearchService');
const AIService = require('../src/services/AIService');
const MusicService = require('../src/services/MusicService');
const SubscriptionService = require('../src/services/SubscriptionService');
const AdminService = require('../src/services/AdminService');

async function testStartCommand() {
  console.log('🧪 Тестирование команды /start');
  console.log('==============================');

  // Инициализируем сервисы
  const telegramService = new TelegramService();
  const smartRouter = new SmartRouter();
  const oilSearchService = new OilSearchService();
  const aiService = new AIService();
  const musicService = new MusicService();
  const subscriptionService = new SubscriptionService();
  const adminService = new AdminService();

  const controllerServices = {
    telegramService,
    smartRouter,
    oilSearchService,
    aiService,
    musicService,
    subscriptionService,
    adminService
  };

  const telegramController = new TelegramController(controllerServices);

  // Тестируем обработку команды /start
  const mockUpdate = {
    message: {
      message_id: 1,
      from: {
        id: 123456789,
        is_bot: false,
        first_name: 'TestUser',
        username: 'testuser'
      },
      chat: {
        id: 123456789,
        first_name: 'TestUser',
        type: 'private'
      },
      date: Math.floor(Date.now() / 1000),
      text: '/start'
    }
  };

  try {
    console.log('📝 Тестируем команду /start:');
    console.log('   Исходное сообщение:', mockUpdate.message.text);

    // 1. Тестируем SmartRouter
    console.log('\n1️⃣ SmartRouter:');
    const routeResult = await smartRouter.routeMessage(mockUpdate);
    console.log('   Результат:', {
      requestType: routeResult.requestType,
      chatId: routeResult.chatId,
      userName: routeResult.userName,
      isFirstTime: routeResult.isFirstTime
    });

    // 2. Тестируем TelegramController
    console.log('\n2️⃣ TelegramController:');
    const controllerResult = await telegramController.handleStartCommand(routeResult);
    console.log('   Результат:', {
      chatId: controllerResult.chatId,
      messageLength: controllerResult.message?.length || 0,
      hasKeyboard: !!controllerResult.keyboard
    });

    // 3. Показываем сообщение
    console.log('\n3️⃣ Сообщение:');
    console.log('   Длина:', controllerResult.message?.length || 0);
    console.log('   Начало сообщения:', controllerResult.message?.substring(0, 100) + '...');

    // 4. Проверяем клавиатуру
    console.log('\n4️⃣ Клавиатура:');
    if (controllerResult.keyboard) {
      console.log('   Тип клавиатуры:', controllerResult.keyboard.inline_keyboard ? 'inline_keyboard' : 'other');
      if (controllerResult.keyboard.inline_keyboard) {
        console.log('   Количество кнопок:', controllerResult.keyboard.inline_keyboard.length);
        controllerResult.keyboard.inline_keyboard.forEach((row, i) => {
          row.forEach((button, j) => {
            console.log(`   [${i}][${j}] ${button.text} -> ${button.callback_data}`);
          });
        });
      }
    } else {
      console.log('   ❌ Клавиатура отсутствует');
    }

    console.log('\n🎉 Тестирование завершено успешно!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
    console.error('Stack:', error.stack);
  }
}

// Запускаем тест
testStartCommand().catch(console.error); 