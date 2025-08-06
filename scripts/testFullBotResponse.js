const SmartRouter = require('../src/services/SmartRouter');
const OilSearchService = require('../src/services/OilSearchService');
const logger = require('../src/utils/logger');

async function testFullBotResponse() {
  console.log('🤖 Демонстрация работы бота с грамматическими ошибками\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const smartRouter = new SmartRouter();
  const oilSearchService = new OilSearchService();
  
  // Тестируем конкретный случай: "лавонде"
  const testQuery = 'лавонде';
  
  console.log(`👤 Пользователь: "${testQuery}"`);
  console.log(`   📝 (с грамматической ошибкой вместо "лаванда")\n`);
  
  try {
    // Симулируем сообщение от пользователя
    const mockMessage = {
      text: testQuery,
      chat: { id: 12345 },
      from: { first_name: 'Тестовый пользователь' }
    };
    
    // Обрабатываем сообщение через SmartRouter
    const routeResult = await smartRouter.handleTextMessage(mockMessage);
    
    console.log(`🔍 Система распознала:`);
    console.log(`   • Тип запроса: ${routeResult.requestType}`);
    
    if (routeResult.requestType === 'disambiguation') {
      console.log(`   • Найдено масло: ${routeResult.ambiguousKey}`);
      console.log(`   • Варианты: ${routeResult.options.join(', ')}`);
      console.log(`   • По умолчанию: ${routeResult.defaultChoice}\n`);
      
      // Симулируем выбор пользователя (по умолчанию)
      const selectedOil = routeResult.defaultChoice;
      console.log(`🤖 Бот выбирает: "${selectedOil}" (по умолчанию)\n`);
      
      // Получаем информацию о выбранном масле
      const oilInfo = await oilSearchService.searchDirectOil({
        normalizedOilName: selectedOil,
        oilName: selectedOil,
        chatId: 12345
      });
      
      if (oilInfo.action === 'oil_found') {
        console.log(`📋 Ответ бота:`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(oilInfo.message);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
        
        console.log(`✅ Результат:`);
        console.log(`   • Пользователь написал с ошибкой: "${testQuery}"`);
        console.log(`   • Система исправила на: "лаванда"`);
        console.log(`   • Бот предоставил полную информацию о масле`);
        console.log(`   • Пользователь получил полезный ответ несмотря на ошибку`);
        
      } else {
        console.log(`❌ Ошибка при получении информации о масле: ${oilInfo.message}`);
      }
    } else {
      console.log(`   • Детали:`, JSON.stringify(routeResult, null, 2));
    }
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  }
  
  console.log('\n💡 Преимущества системы:');
  console.log('   • Автоматическое исправление грамматических ошибок');
  console.log('   • Понимание различных форм слов (падежи, склонения)');
  console.log('   • Устойчивость к опечаткам и ошибкам ввода');
  console.log('   • Улучшенный пользовательский опыт');
  console.log('   • Снижение количества нераспознанных запросов');
}

// Запускаем тест
if (require.main === module) {
  testFullBotResponse().catch(console.error);
}

module.exports = { testFullBotResponse }; 