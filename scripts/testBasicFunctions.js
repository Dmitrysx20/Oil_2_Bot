const SmartRouter = require('../src/services/SmartRouter');
const OilSearchService = require('../src/services/OilSearchService');
const AIService = require('../src/services/AIService');

async function testBasicFunctions() {
  console.log('🧪 Тестирование основных функций бота...\n');

  // Тест 1: SmartRouter
  console.log('1️⃣ Тестируем SmartRouter...');
  const router = new SmartRouter();
  
  // Тест поиска масла
  const oilResult = router.findOil('лаванда');
  console.log('   Поиск "лаванда":', oilResult.result ? '✅ Найдено' : '❌ Не найдено');
  
  // Тест извлечения ключевых слов
  const keywords = router.extractKeywords('нужна энергия');
  console.log('   Ключевые слова "нужна энергия":', keywords);
  
  // Тест 2: OilSearchService
  console.log('\n2️⃣ Тестируем OilSearchService...');
  const oilSearch = new OilSearchService();
  
  try {
    const searchResult = await oilSearch.searchDirectOil({
      normalizedOilName: 'лаванда',
      chatId: 'test'
    });
    console.log('   Поиск лаванды:', searchResult.message ? '✅ Успешно' : '❌ Ошибка');
  } catch (error) {
    console.log('   ❌ Ошибка поиска:', error.message);
  }
  
  // Тест 3: AIService
  console.log('\n3️⃣ Тестируем AIService...');
  const aiService = new AIService();
  
  try {
    const aiResult = await aiService.getBasicRecommendation({
      keywords: ['спокойствие'],
      chatId: 'test'
    });
    console.log('   AI рекомендация:', aiResult.message ? '✅ Успешно' : '❌ Ошибка');
  } catch (error) {
    console.log('   ❌ Ошибка AI:', error.message);
  }
  
  console.log('\n✅ Тестирование завершено!');
}

testBasicFunctions().catch(console.error);
