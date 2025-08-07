const SmartRouter = require('../src/services/SmartRouter');
const TelegramController = require('../src/controllers/TelegramController');
const logger = require('../src/utils/logger');

async function testMenuVariations() {
  console.log('🏠 Тестирование различных вариантов меню\n');
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
  
  // Тест 1: Первый запуск (/start)
  console.log('📱 ТЕСТ 1: Первый запуск (/start)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const firstTimeMessage = {
    text: '/start',
    chat: { id: 12345 },
    from: { first_name: 'Новый пользователь' }
  };
  
  const firstTimeRoute = await smartRouter.handleTextMessage(firstTimeMessage);
  const firstTimeResponse = await telegramController.handleStartCommand(firstTimeRoute);
  
  console.log('📋 Сообщение:');
  console.log(firstTimeResponse.message.substring(0, 200) + '...');
  console.log('\n🔘 Кнопки:');
  firstTimeResponse.keyboard.inline_keyboard.forEach((row, i) => {
    console.log(`   Ряд ${i + 1}: ${row.map(b => b.text).join(' | ')}`);
  });
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 2: Повторный запуск (главное меню)
  console.log('📱 ТЕСТ 2: Повторный запуск (главное меню)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const repeatMessage = {
    text: '/start',
    chat: { id: 12345 },
    from: { first_name: 'Существующий пользователь' }
  };
  
  const repeatRoute = await smartRouter.handleTextMessage(repeatMessage);
  repeatRoute.isFirstTime = false; // Симулируем повторный запуск
  const repeatResponse = await telegramController.handleStartCommand(repeatRoute);
  
  console.log('📋 Сообщение:');
  console.log(repeatResponse.message);
  console.log('\n🔘 Кнопки:');
  repeatResponse.keyboard.inline_keyboard.forEach((row, i) => {
    console.log(`   Ряд ${i + 1}: ${row.map(b => b.text).join(' | ')}`);
  });
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 3: Меню помощи (/help)
  console.log('📱 ТЕСТ 3: Меню помощи (/help)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const helpMessage = {
    text: '/help',
    chat: { id: 12345 },
    from: { first_name: 'Пользователь' }
  };
  
  const helpRoute = await smartRouter.handleTextMessage(helpMessage);
  const helpResponse = await telegramController.handleHelpCommand(helpRoute);
  
  console.log('📋 Сообщение:');
  console.log(helpResponse.message.substring(0, 200) + '...');
  console.log('\n🔘 Кнопки:');
  helpResponse.keyboard.inline_keyboard.forEach((row, i) => {
    console.log(`   Ряд ${i + 1}: ${row.map(b => b.text).join(' | ')}`);
  });
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Сравнение меню
  console.log('📊 СРАВНЕНИЕ МЕНЮ:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('🎯 Первый запуск:');
  console.log('   • Длинное приветственное сообщение');
  console.log('   • Объяснение возможностей бота');
  console.log('   • Примеры использования');
  console.log('   • 6 кнопок в 3 рядах');
  
  console.log('\n🔄 Повторный запуск:');
  console.log('   • Краткое сообщение "Главное меню"');
  console.log('   • Те же 6 кнопок в 3 рядах');
  console.log('   • Более лаконичный интерфейс');
  
  console.log('\n❓ Меню помощи:');
  console.log('   • Подробная справка по использованию');
  console.log('   • Примеры запросов');
  console.log('   • Те же 6 кнопок в 3 рядах');
  
  console.log('\n💡 Особенности:');
  console.log('   • Все меню используют одинаковую структуру кнопок');
  console.log('   • Кнопки адаптируются под контекст');
  console.log('   • Система обработки грамматических ошибок работает везде');
  console.log('   • Интеграция с AI и музыкальными сервисами');
}

// Запускаем тест
if (require.main === module) {
  testMenuVariations().catch(console.error);
}

module.exports = { testMenuVariations }; 