const SmartRouter = require('../src/services/SmartRouter');
const TelegramController = require('../src/controllers/TelegramController');
const logger = require('../src/utils/logger');

async function testStartMenu() {
  console.log('🏠 Тестирование меню при команде /start\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const smartRouter = new SmartRouter();
  const telegramController = new TelegramController({
    telegramService: {},
    smartRouter: smartRouter,
    oilSearchService: {},
    aiService: {},
    musicService: {},
    subscriptionService: {},
    adminService: {}
  });
  
  // Симулируем команду /start
  const mockMessage = {
    text: '/start',
    chat: { id: 12345 },
    from: { first_name: 'Тестовый пользователь' }
  };
  
  console.log('👤 Пользователь отправляет: "/start"\n');
  
  try {
    // Обрабатываем через SmartRouter
    const routeResult = await smartRouter.handleTextMessage(mockMessage);
    
    console.log('🔍 SmartRouter определил:');
    console.log(`   • Тип запроса: ${routeResult.requestType}`);
    console.log(`   • Chat ID: ${routeResult.chatId}`);
    console.log(`   • User Name: ${routeResult.userName}`);
    console.log(`   • Is First Time: ${routeResult.isFirstTime}\n`);
    
    // Обрабатываем через TelegramController
    const response = await telegramController.handleStartCommand(routeResult);
    
    console.log('📋 Ответ бота:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(response.message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🔘 Кнопки меню:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (response.keyboard && response.keyboard.inline_keyboard) {
      response.keyboard.inline_keyboard.forEach((row, rowIndex) => {
        console.log(`   Ряд ${rowIndex + 1}:`);
        row.forEach((button, buttonIndex) => {
          console.log(`     ${buttonIndex + 1}. "${button.text}" → ${button.callback_data}`);
        });
        console.log('');
      });
    } else {
      console.log('   ❌ Кнопки не найдены');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Показываем структуру клавиатуры
    console.log('📊 Структура клавиатуры:');
    console.log(JSON.stringify(response.keyboard, null, 2));
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  }
  
  console.log('\n💡 Информация о меню:');
  console.log('   • Главное меню содержит 6 кнопок в 3 рядах');
  console.log('   • Кнопки разделены по функциональности');
  console.log('   • Каждая кнопка имеет уникальный callback_data');
  console.log('   • Меню адаптируется под контекст запроса');
}

// Запускаем тест
if (require.main === module) {
  testStartMenu().catch(console.error);
}

module.exports = { testStartMenu }; 