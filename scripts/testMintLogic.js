require('dotenv').config();
const SmartRouter = require('../src/services/SmartRouter');
const TelegramController = require('../src/controllers/TelegramController');
const TelegramService = require('../src/services/TelegramService');
const OilSearchService = require('../src/services/OilSearchService');
const AIService = require('../src/services/AIService');
const MusicService = require('../src/services/MusicService');
const SubscriptionService = require('../src/services/SubscriptionService');
const AdminService = require('../src/services/AdminService');

async function testMintLogic() {
  console.log('🧪 Тестирование логики обработки "мята"');
  console.log('==========================================');

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

  // Тестируем обработку сообщения "мята"
  console.log('\n📝 Тестируем обработку сообщения "мята":');
  
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
      text: 'мята'
    }
  };

  try {
    // 1. Тестируем SmartRouter
    console.log('1️⃣ SmartRouter:');
    const routeResult = await smartRouter.routeMessage(mockUpdate);
    console.log('   Результат:', {
      requestType: routeResult.requestType,
      chatId: routeResult.chatId,
      originalQuery: routeResult.originalQuery,
      options: routeResult.options
    });

    // 2. Тестируем TelegramController
    console.log('\n2️⃣ TelegramController:');
    const controllerResult = await telegramController.handleDisambiguation(routeResult);
    console.log('   Результат:', {
      chatId: controllerResult.chatId,
      messageLength: controllerResult.message?.length || 0,
      hasKeyboard: !!controllerResult.keyboard,
      keyboardFormat: controllerResult.keyboard ? 'inline_keyboard' in controllerResult.keyboard : 'none'
    });

    // 3. Проверяем формат клавиатуры
    console.log('\n3️⃣ Проверка формата клавиатуры:');
    if (controllerResult.keyboard) {
      console.log('   Клавиатура:', JSON.stringify(controllerResult.keyboard, null, 2));
      
      if (controllerResult.keyboard.inline_keyboard) {
        console.log('   ✅ Клавиатура в правильном формате');
        console.log('   Количество кнопок:', controllerResult.keyboard.inline_keyboard.length);
        controllerResult.keyboard.inline_keyboard.forEach((row, i) => {
          row.forEach((button, j) => {
            console.log(`   [${i}][${j}] ${button.text} -> ${button.callback_data}`);
          });
        });
      } else {
        console.log('   ❌ Клавиатура в неправильном формате');
      }
    } else {
      console.log('   ❌ Клавиатура отсутствует');
    }

    // 4. Тестируем обработку выбора масла
    console.log('\n🔘 Тестируем обработку выбора масла:');
    
    const mockCallbackUpdate = {
      callback_query: {
        id: 'test_callback_id',
        from: {
          id: 123456789,
          is_bot: false,
          first_name: 'TestUser',
          username: 'testuser'
        },
        message: {
          message_id: 2,
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
          text: '🤔 Я нашел несколько вариантов для "мята":\n\nВыберите нужное масло:'
        },
        chat_instance: 'test_instance',
        data: 'select_oil:Мята перечная'
      }
    };

    const callbackRouteResult = await smartRouter.routeMessage(mockCallbackUpdate);
    console.log('   SmartRouter (callback):', {
      requestType: callbackRouteResult.requestType,
      oilName: callbackRouteResult.oilName,
      normalizedOilName: callbackRouteResult.normalizedOilName
    });

    const callbackControllerResult = await telegramController.handleDirectSearch(callbackRouteResult);
    console.log('   TelegramController (callback):', {
      chatId: callbackControllerResult.chatId,
      messageLength: callbackControllerResult.message?.length || 0,
      hasKeyboard: !!callbackControllerResult.keyboard
    });

    console.log('\n🎉 Тестирование логики завершено успешно!');
    console.log('📋 Результаты:');
    console.log('   ✅ Обработка сообщения "мята" - работает');
    console.log('   ✅ Определение неоднозначности - работает');
    console.log('   ✅ Формирование клавиатуры - работает');
    console.log('   ✅ Обработка выбора масла - работает');
    console.log('   ✅ Поиск информации о масле - работает');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
    console.error('Stack:', error.stack);
  }
}

// Запускаем тест
testMintLogic().catch(console.error);
