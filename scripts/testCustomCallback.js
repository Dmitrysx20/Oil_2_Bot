const SmartRouter = require('../src/services/SmartRouter');

async function testCustomCallback() {
  console.log('🧪 Тестируем кастомный формат callback_query...\n');

  const smartRouter = new SmartRouter();

  // Тестовый объект в кастомном формате (как в логах)
  const customCallbackUpdate = {
    "id": "3448410725686409053",
    "from": {
      "id": 802895688,
      "is_bot": false,
      "first_name": "Дмитрий 😎",
      "username": "DimKlimsx",
      "language_code": "ru",
      "is_premium": true
    },
    "message": {
      "message_id": 109,
      "from": {
        "id": 7567815990,
        "is_bot": true,
        "first_name": "Aromatic Nstory",
        "username": "Aromatic_Nstory_bot"
      },
      "chat": {
        "id": 802895688,
        "first_name": "Дмитрий 😎",
        "username": "DimKlimsx",
        "type": "private"
      },
      "date": 1754686554,
      "text": "Тестовое сообщение",
      "reply_markup": {
        "inline_keyboard": []
      }
    },
    "chat_instance": "-1125785953931926063",
    "data": "music_menu"
  };

  console.log('📥 Тестовый объект:', JSON.stringify(customCallbackUpdate, null, 2));
  console.log('\n🔍 Проверяем условия:');
  console.log('telegramUpdate?.data:', customCallbackUpdate?.data);
  console.log('telegramUpdate?.from:', !!customCallbackUpdate?.from);
  console.log('telegramUpdate?.message:', !!customCallbackUpdate?.message);
  console.log('Условие выполняется:', !!(customCallbackUpdate?.data && customCallbackUpdate?.from && customCallbackUpdate?.message));

  try {
    const result = await smartRouter.routeMessage(customCallbackUpdate);
    console.log('\n✅ Результат:', result?.requestType);
    console.log('📝 Детали:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('\n❌ Ошибка:', error.message);
  }

  console.log('\n🎉 Тест завершен!');
}

// Запускаем тест
testCustomCallback().catch(console.error);
