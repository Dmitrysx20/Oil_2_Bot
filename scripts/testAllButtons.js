const SmartRouter = require('../src/services/SmartRouter');

async function testAllButtons() {
  console.log('🧪 Тестируем все кнопки...\n');

  const smartRouter = new SmartRouter();

  const testButtons = [
    { name: 'Энергия', data: 'need_energy' },
    { name: 'Релакс', data: 'want_relax' },
    { name: 'Здоровье', data: 'health_issues' },
    { name: 'Музыка', data: 'music_menu' },
    { name: 'Помощь', data: 'help_menu' },
    { name: 'Главное меню', data: 'main_menu' },
    { name: 'Подписка', data: 'subscribe' }
  ];

  for (const button of testButtons) {
    console.log(`\n🔘 Тестируем кнопку: ${button.name}`);
    
    const customCallbackUpdate = {
      "id": "test_" + Date.now(),
      "from": {
        "id": 802895688,
        "is_bot": false,
        "first_name": "Тест",
        "username": "test_user"
      },
      "message": {
        "message_id": 1,
        "from": {
          "id": 7567815990,
          "is_bot": true,
          "first_name": "Aromatic Nstory",
          "username": "Aromatic_Nstory_bot"
        },
        "chat": {
          "id": 802895688,
          "first_name": "Тест",
          "username": "test_user",
          "type": "private"
        },
        "date": 1754686554,
        "text": "Тестовое сообщение",
        "reply_markup": {
          "inline_keyboard": []
        }
      },
      "chat_instance": "test_instance",
      "data": button.data
    };

    try {
      const result = await smartRouter.routeMessage(customCallbackUpdate);
      console.log(`✅ Результат: ${result?.requestType}`);
      console.log(`📝 Детали: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.log(`❌ Ошибка: ${error.message}`);
    }
  }

  console.log('\n🎉 Тест всех кнопок завершен!');
}

// Запускаем тест
testAllButtons().catch(console.error);
