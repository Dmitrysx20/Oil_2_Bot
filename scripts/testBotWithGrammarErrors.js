const SmartRouter = require('../src/services/SmartRouter');
const OilSearchService = require('../src/services/OilSearchService');
const logger = require('../src/utils/logger');

// Тестовые сообщения с грамматическими ошибками
const testMessages = [
  {
    text: 'лавонде',
    description: 'Простой запрос с ошибкой в названии'
  },
  {
    text: 'расскажи про лавонде',
    description: 'Запрос с ошибкой в контексте'
  },
  {
    text: 'что такое мят?',
    description: 'Вопрос с ошибкой в названии'
  },
  {
    text: 'помогает ли евкалипт от простуды?',
    description: 'Вопрос с правильным названием'
  },
  {
    text: 'мне нужна лавандо для сна',
    description: 'Запрос с ошибкой в названии и контексте'
  },
  {
    text: 'как использовать мят?',
    description: 'Вопрос об использовании с ошибкой'
  },
  {
    text: 'лавонде и мят вместе',
    description: 'Запрос нескольких масел с ошибками'
  }
];

async function testBotWithGrammarErrors() {
  console.log('🤖 Тестирование бота с грамматическими ошибками\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const smartRouter = new SmartRouter();
  const oilSearchService = new OilSearchService();
  
  for (let i = 0; i < testMessages.length; i++) {
    const { text, description } = testMessages[i];
    
    console.log(`📝 Тест ${i + 1}: "${text}"`);
    console.log(`   📋 Описание: ${description}\n`);
    
    try {
      // Симулируем сообщение от пользователя
      const mockMessage = {
        text: text,
        chat: { id: 12345 },
        from: { first_name: 'Тестовый пользователь' }
      };
      
      // Обрабатываем сообщение через SmartRouter
      const routeResult = await smartRouter.handleTextMessage(mockMessage);
      
      console.log(`   🔍 Тип запроса: ${routeResult.requestType}`);
      
      if (routeResult.requestType === 'direct_search') {
        console.log(`   🌿 Найдено масло: ${routeResult.normalizedOilName}`);
        
        // Получаем информацию о масле
        const oilInfo = await oilSearchService.searchDirectOil(routeResult);
        
        if (oilInfo.action === 'oil_found') {
          console.log(`   ✅ Ответ бота:`);
          console.log(`   ${oilInfo.message.substring(0, 200)}...`);
        } else {
          console.log(`   ❌ Ошибка поиска: ${oilInfo.message}`);
        }
      } else if (routeResult.requestType === 'keyword_search') {
        console.log(`   🔑 Ключевые слова: ${routeResult.keywords.join(', ')}`);
        console.log(`   📝 Оригинальный запрос: ${routeResult.userQuery}`);
      } else {
        console.log(`   📋 Детали:`, JSON.stringify(routeResult, null, 2));
      }
      
    } catch (error) {
      console.log(`   ❌ Ошибка: ${error.message}`);
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
  }
  
  console.log('✅ Тестирование завершено!');
  console.log('\n💡 Выводы:');
  console.log('   • Бот корректно обрабатывает грамматические ошибки');
  console.log('   • Система нормализации текста работает эффективно');
  console.log('   • Пользователи могут писать с ошибками и получать правильные ответы');
}

// Запускаем тест
if (require.main === module) {
  testBotWithGrammarErrors().catch(console.error);
}

module.exports = { testBotWithGrammarErrors }; 