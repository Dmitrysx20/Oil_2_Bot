require('dotenv').config();
const SmartRouter = require('../src/services/SmartRouter');

async function testMintDebug() {
  console.log('🔍 Отладка обработки "мята"');
  console.log('============================');

  const smartRouter = new SmartRouter();

  // Тестируем обработку сообщения "мята"
  const mockMessage = {
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
  };

  console.log('📝 Исходное сообщение:');
  console.log('   text:', mockMessage.text);
  console.log('   chatId:', mockMessage.chat?.id);
  console.log('   userName:', mockMessage.from?.first_name);

  try {
    // Тестируем handleTextMessage напрямую
    console.log('\n🔍 Тестируем handleTextMessage:');
    const result = await smartRouter.handleTextMessage(mockMessage);
    console.log('   Результат:', result);

    // Тестируем routeMessage
    console.log('\n🔍 Тестируем routeMessage:');
    const routeResult = await smartRouter.routeMessage(mockMessage);
    console.log('   Результат:', routeResult);

    // Тестируем findOil напрямую
    console.log('\n🔍 Тестируем findOil:');
    const oilResult = smartRouter.findOil('мята');
    console.log('   Результат:', oilResult);

  } catch (error) {
    console.error('❌ Ошибка:', error);
    console.error('Stack:', error.stack);
  }
}

// Запускаем тест
testMintDebug().catch(console.error);
