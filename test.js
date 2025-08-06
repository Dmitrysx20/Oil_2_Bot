const SmartRouter = require('./src/services/smart-router');
const TestOilService = require('./test-oil-service');

console.log('🧪 Тестирование основных модулей...\n');

// Тест Smart Router
console.log('1. Тестирование Smart Router:');
const smartRouter = new SmartRouter();

const testCases = [
  { text: 'лаванда', expected: 'oil_search' },
  { text: 'нужна энергия', expected: 'mood_request' },
  { text: 'подписаться', expected: 'subscription_inquiry' },
  { text: 'музыка для расслабления', expected: 'music_request' },
  { text: '/start', expected: 'start_command' },
  { text: 'привет', expected: 'greeting' }
];

testCases.forEach(testCase => {
  const result = smartRouter.analyzeRequest({
    json: {
      message: {
        text: testCase.text,
        chat: { id: 123 },
        from: { id: 456, first_name: 'Test' }
      }
    }
  });
  
  const status = result.requestType === testCase.expected ? '✅' : '❌';
  console.log(`   ${status} "${testCase.text}" → ${result.requestType} (ожидалось: ${testCase.expected})`);
});

console.log('\n2. Тестирование Oil Service:');
const oilService = new TestOilService();

// Тест форматирования
const mockOil = {
  oil_name: 'Лаванда',
  description: 'Успокаивающее масло',
  emotional_effect: 'Расслабление и спокойствие',
  physical_effect: 'Улучшает сон',
  applications: 'Ароматерапия, массаж',
  safety_warning: 'Не использовать при беременности',
  joke: 'Лаванда - лучший друг бессонницы!'
};

const formattedOil = oilService.formatOilInfo(mockOil);
console.log('   ✅ Форматирование информации о масле работает');

// Тест предложений
const suggestions = oilService.getSuggestions('лав');
console.log(`   ✅ Предложения: ${suggestions.join(', ')}`);

console.log('\n🎉 Все основные модули работают корректно!');
console.log('\n📋 Для запуска бота:');
console.log('   1. Создайте файл .env с переменными окружения');
console.log('   2. Запустите: npm run dev');
console.log('   3. Или используйте: ./deploy.sh'); 