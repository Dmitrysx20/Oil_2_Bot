const SmartRouter = require('../src/services/SmartRouter');
const TelegramController = require('../src/controllers/TelegramController');
const TelegramService = require('../src/services/TelegramService');
const OilSearchService = require('../src/services/OilSearchService');
const AIService = require('../src/services/AIService');
const MusicService = require('../src/services/MusicService');
const SubscriptionService = require('../src/services/SubscriptionService');
const AdminService = require('../src/services/AdminService');

async function testMintFullProcessing() {
  console.log('🧪 Полное тестирование обработки "мята"');
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

  // Тестируем разные варианты запроса "мята"
  const testCases = [
    'мята',
    'расскажи про мяту',
    'что такое мята',
    'мят',
    'мяту'
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Тестируем: "${testCase}"`);
    console.log('─'.repeat(50));

    // 1. Создаем mock update
    const mockUpdate = {
      message: {
        text: testCase,
        chat: { id: 123456 },
        from: { first_name: 'TestUser' }
      }
    };

    try {
      // 2. Тестируем SmartRouter
      console.log('1️⃣ SmartRouter:');
      const routeResult = await smartRouter.routeMessage(mockUpdate);
      console.log('   Результат:', {
        requestType: routeResult.requestType,
        chatId: routeResult.chatId,
        originalQuery: routeResult.originalQuery,
        options: routeResult.options,
        isAmbiguous: routeResult.isAmbiguous
      });

      // 3. Тестируем TelegramController
      console.log('\n2️⃣ TelegramController:');
      let controllerResult;
      
      switch (routeResult.requestType) {
        case 'disambiguation':
          controllerResult = await telegramController.handleDisambiguation(routeResult);
          break;
        case 'direct_search':
          controllerResult = await telegramController.handleDirectSearch(routeResult);
          break;
        default:
          console.log(`   Неизвестный тип запроса: ${routeResult.requestType}`);
          continue;
      }

      if (controllerResult) {
        console.log('   Результат контроллера:', {
          chatId: controllerResult.chatId,
          messageLength: controllerResult.message?.length || 0,
          hasKeyboard: !!controllerResult.keyboard,
          keyboardButtons: controllerResult.keyboard?.inline_keyboard?.length || 0
        });

        // Показываем сообщение (обрезаем для читаемости)
        const messagePreview = controllerResult.message?.substring(0, 100) + '...';
        console.log('   Сообщение:', messagePreview);

        if (controllerResult.keyboard?.inline_keyboard) {
          console.log('   Кнопки:');
          controllerResult.keyboard.inline_keyboard.forEach((row, i) => {
            row.forEach((button, j) => {
              console.log(`     [${i}][${j}] ${button.text} -> ${button.callback_data}`);
            });
          });
        }
      }

    } catch (error) {
      console.log(`   ❌ Ошибка: ${error.message}`);
      console.log('   Stack:', error.stack);
    }
  }

  // Тестируем обработку callback query для выбора масла
  console.log('\n🔘 Тестируем обработку выбора масла:');
  console.log('─'.repeat(50));

  const callbackUpdate = {
    callback_query: {
      id: 'test_callback_id',
      data: 'select_oil:Мята перечная',
      message: {
        chat: { id: 123456 },
        message_id: 1
      },
      from: { first_name: 'TestUser' }
    }
  };

  try {
    console.log('1️⃣ SmartRouter (callback):');
    const callbackRouteResult = await smartRouter.routeMessage(callbackUpdate);
    console.log('   Результат:', {
      requestType: callbackRouteResult.requestType,
      oilName: callbackRouteResult.oilName,
      normalizedOilName: callbackRouteResult.normalizedOilName
    });

    console.log('\n2️⃣ TelegramController (callback):');
    const callbackControllerResult = await telegramController.handleDirectSearch(callbackRouteResult);
    
    if (callbackControllerResult) {
      console.log('   Результат:', {
        chatId: callbackControllerResult.chatId,
        messageLength: callbackControllerResult.message?.length || 0,
        hasKeyboard: !!callbackControllerResult.keyboard
      });
    }

  } catch (error) {
    console.log(`   ❌ Ошибка callback: ${error.message}`);
  }
}

// Запускаем тест
testMintFullProcessing().catch(console.error);
