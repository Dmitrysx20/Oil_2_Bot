const { normalizeText, fixCommonTypos, extractOilName } = require('../src/utils/textNormalizer');
const logger = require('../src/utils/logger');

// Тестовые случаи с грамматическими ошибками
const testCases = [
  // Лаванда с различными ошибками
  'лавонде',
  'лавонда', 
  'лавандо',
  'лаванде',
  'лаванды',
  'лавандой',
  'лаванду',
  'лаванд',
  
  // Мята с ошибками
  'мят',
  'мяту',
  'мятой',
  
  // Эвкалипт с ошибками
  'евкалипт',
  'евкалипта',
  'эвкалипту',
  'эвкалиптом',
  
  // Лимон с ошибками
  'лимона',
  'лимону',
  'лимоном',
  'лимоны',
  
  // Сложные случаи
  'расскажи про лавонде',
  'что такое лавандо',
  'как использовать мят',
  'помогает ли евкалипт от простуды',
  'эфирное масло лимона',
  
  // Смешанные ошибки
  'лавонде и мят',
  'евкалипт или лавандо',
  'расскажи про лавонде и мят'
];

function testGrammarCorrection() {
  console.log('🔍 Тестирование исправления грамматических ошибок\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  testCases.forEach((testCase, index) => {
    console.log(`📝 Тест ${index + 1}: "${testCase}"`);
    
    // Тестируем исправление опечаток
    const corrected = fixCommonTypos(testCase);
    console.log(`   ✅ Исправлено: "${corrected}"`);
    
    // Тестируем полную нормализацию
    const normalized = normalizeText(testCase);
    console.log(`   🔧 Нормализовано: "${normalized}"`);
    
    // Тестируем извлечение названия масла
    const oilName = extractOilName(testCase);
    if (oilName) {
      console.log(`   🌿 Найдено масло: "${oilName}"`);
    } else {
      console.log(`   ❌ Масло не найдено`);
    }
    
    console.log('');
  });
  
  // Тестируем сложные фразы
  console.log('🔍 Тестирование сложных фраз:\n');
  
  const complexPhrases = [
    'Мне нужна лавонде для сна',
    'Расскажи про мят и евкалипт',
    'Что лучше: лавандо или мят?',
    'Помогает ли лавонде от стресса?'
  ];
  
  complexPhrases.forEach((phrase, index) => {
    console.log(`📝 Сложная фраза ${index + 1}: "${phrase}"`);
    
    const corrected = fixCommonTypos(phrase);
    const normalized = normalizeText(phrase);
    const oilName = extractOilName(phrase);
    
    console.log(`   ✅ Исправлено: "${corrected}"`);
    console.log(`   🔧 Нормализовано: "${normalized}"`);
    if (oilName) {
      console.log(`   🌿 Найдено масло: "${oilName}"`);
    }
    console.log('');
  });
  
  console.log('✅ Тестирование завершено!');
}

// Запускаем тест
if (require.main === module) {
  testGrammarCorrection();
}

module.exports = { testGrammarCorrection }; 