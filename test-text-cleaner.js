// 🧪 ТЕСТ ОЧИСТКИ ТЕКСТА ОТ ХЕШТЕГОВ
const { removeHashtags, cleanAIResponse, formatForTelegram } = require('./src/utils/text-cleaner');

console.log('🧪 Тестирование очистки текста от хештегов...\n');

// Тестовый текст с хештегами (как в вашем примере)
const testText = `### Ароматерапия при боли в горле

#### Эфирные масла:
1. Эвкалипт (Eucalyptus globulus)
2. Лаванда (Lavandula angustifolia)
3. Мелисса (Melissa officinalis)
4. Чайное дерево (Melaleuca alternifolia)

#### Способы применения и дозировки:

**Ингаляция:**
- Добавьте 2-3 капли эвкалипта в горячую воду
- Дышите паром 5-10 минут
- Повторяйте 2-3 раза в день

**Массаж:**
- Смешайте 1-2 капли масла с 10 мл базового масла
- Массируйте область горла и груди
- Избегайте попадания на слизистые

⚠️ **Меры предосторожности:**
- Не применяйте детям до 6 лет
- При беременности проконсультируйтесь с врачом
- При ухудшении симптомов обратитесь к врачу`;

console.log('📝 Исходный текст:');
console.log('='.repeat(50));
console.log(testText);
console.log('\n');

// Тест 1: Удаление только хештегов
console.log('🔧 Тест 1: Удаление хештегов');
console.log('='.repeat(50));
const cleanedHashtags = removeHashtags(testText);
console.log(cleanedHashtags);
console.log('\n');

// Тест 2: Полная очистка AI-ответа
console.log('🧹 Тест 2: Полная очистка AI-ответа');
console.log('='.repeat(50));
const cleanedAI = cleanAIResponse(testText);
console.log(cleanedAI);
console.log('\n');

// Тест 3: Форматирование для Telegram
console.log('📱 Тест 3: Форматирование для Telegram');
console.log('='.repeat(50));
const telegramFormatted = formatForTelegram(testText);
console.log(telegramFormatted);
console.log('\n');

// Тест 4: Дополнительные примеры
console.log('🎯 Тест 4: Дополнительные примеры');
console.log('='.repeat(50));

const examples = [
  '### Заголовок с хештегом',
  '## Подзаголовок',
  '# Простой заголовок',
  'Обычный текст без хештегов',
  '**Жирный текст** и *курсив*',
  '### Масла для энергии\n\n**Мята перечная** - отличный выбор!'
];

examples.forEach((example, index) => {
  console.log(`Пример ${index + 1}:`);
  console.log(`Исходный: "${example}"`);
  console.log(`Очищенный: "${removeHashtags(example)}"`);
  console.log('---');
});

console.log('\n✅ Тестирование завершено!');
console.log('🎉 Теперь AI-ответы будут без хештегов!');
