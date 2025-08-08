const SmartRouter = require('../src/services/SmartRouter');
const { normalizeText, extractOilName } = require('../src/utils/textNormalizer');

async function testMintProcessing() {
  console.log('🧪 Тестирование обработки "мята"');
  console.log('=====================================');

  // Тестируем textNormalizer
  console.log('\n1. Тестирование textNormalizer:');
  const testTexts = ['мята', 'мят', 'мяту', 'мятой', 'расскажи про мяту', 'что такое мята'];
  
  testTexts.forEach(text => {
    const normalized = normalizeText(text);
    const extracted = extractOilName(text);
    console.log(`   "${text}" -> normalized: "${normalized}", extracted: "${extracted}"`);
  });

  // Тестируем SmartRouter
  console.log('\n2. Тестирование SmartRouter:');
  const smartRouter = new SmartRouter();
  
  const testMessages = [
    { text: 'мята' },
    { text: 'расскажи про мяту' },
    { text: 'что такое мята' },
    { text: 'мят' },
    { text: 'мяту' }
  ];

  for (const message of testMessages) {
    console.log(`\n   Тестируем: "${message.text}"`);
    
    const mockUpdate = {
      message: {
        text: message.text,
        chat: { id: 123456 },
        from: { first_name: 'TestUser' }
      }
    };

    try {
      const result = await smartRouter.routeMessage(mockUpdate);
      console.log(`   Результат:`, {
        requestType: result.requestType,
        oilName: result.oilName,
        normalizedOilName: result.normalizedOilName,
        isAmbiguous: result.isAmbiguous
      });
    } catch (error) {
      console.log(`   Ошибка: ${error.message}`);
    }
  }

  // Тестируем обработку неоднозначности
  console.log('\n3. Тестирование неоднозначности:');
  const ambiguousTest = smartRouter.findOil('мята');
  console.log('   Результат findOil("мята"):', ambiguousTest);
  
  if (ambiguousTest.isAmbiguous) {
    console.log('   Варианты:', ambiguousTest.options);
  }
}

// Запускаем тест
testMintProcessing().catch(console.error);
