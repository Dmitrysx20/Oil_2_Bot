const handleUpdate = require('../src/bot/handler');
const OilSearchAdapter = require('../src/services/adapters/OilSearchAdapter');
const AIAdapter = require('../src/services/adapters/AIAdapter');

// Мок бота
const mockBot = {
  sendMessage: async (chatId, message, options) => {
    console.log(`📤 Бот отправляет сообщение в ${chatId}:`);
    console.log(`   Текст: ${message.substring(0, 100)}...`);
    if (options?.reply_markup?.inline_keyboard) {
      console.log(`   Кнопки: ${options.reply_markup.inline_keyboard.length} кнопок`);
    }
    return { message_id: 1 };
  },
  answerCallbackQuery: async (queryId) => {
    console.log(`✅ Ответ на callback query: ${queryId}`);
    return true;
  }
};

// Сервисы
const services = {
  oilSearch: new OilSearchAdapter(),
  ai: new AIAdapter()
};

async function testMessageHandling() {
  console.log('🧪 Тестирование обработки сообщений...\n');

  const testCases = [
    {
      name: 'Команда /start',
      message: {
        chat: { id: 'test_chat' },
        from: { first_name: 'Тест' },
        text: '/start'
      }
    },
    {
      name: 'Поиск масла "Лаванда"',
      message: {
        chat: { id: 'test_chat' },
        from: { first_name: 'Тест' },
        text: 'Лаванда'
      }
    },
    {
      name: 'Запрос энергии (ИСПРАВЛЕНО)',
      message: {
        chat: { id: 'test_chat' },
        from: { first_name: 'Тест' },
        text: 'Нужна энергия'
      }
    },
    {
      name: 'Запрос спокойствия',
      message: {
        chat: { id: 'test_chat' },
        from: { first_name: 'Тест' },
        text: 'Хочу расслабиться'
      }
    },
    {
      name: 'Медицинский запрос',
      message: {
        chat: { id: 'test_chat' },
        from: { first_name: 'Тест' },
        text: 'Болит голова'
      }
    },
    {
      name: 'Помощь',
      message: {
        chat: { id: 'test_chat' },
        from: { first_name: 'Тест' },
        text: 'Помощь'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 Тест: ${testCase.name}`);
    console.log(`   Входное сообщение: "${testCase.message.text}"`);
    
    try {
      await handleUpdate(mockBot, testCase.message, services);
      console.log('   ✅ Обработка завершена успешно');
    } catch (error) {
      console.log(`   ❌ Ошибка: ${error.message}`);
    }
  }

  console.log('\n✅ Тестирование обработки сообщений завершено!');
}

testMessageHandling().catch(console.error);
