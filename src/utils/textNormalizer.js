const logger = require('./logger');

// Словарь опечаток и грамматических форм
const typoDictionary = {
  // Лаванда и варианты с ошибками
  'лавонда': 'лаванда',
  'лавонде': 'лаванда',
  'лавандо': 'лаванда',
  'лаванде': 'лаванда',
  'лаванды': 'лаванда',
  'лавандой': 'лаванда',
  'лаванду': 'лаванда',
  'лаванд': 'лаванда',
  
  // Мята и варианты с ошибками
  'мят': 'мята',
  'мяту': 'мята',
  'мятой': 'мята',
  
  // Эвкалипт и варианты с ошибками
  'евкалипт': 'эвкалипт',
  'ефкалипт': 'эвкалипт',
  'евкалипта': 'эвкалипт',
  'евкалипту': 'эвкалипт',
  'евкалиптом': 'эвкалипт',
  'эвкалипта': 'эвкалипт',
  'эвкалипту': 'эвкалипт',
  'эвкалиптом': 'эвкалипт',
  'эфкалипт': 'эвкалипт',
  'эфкалипта': 'эвкалипт',
  'эфкалипту': 'эвкалипт',
  'эфкалиптом': 'эвкалипт',
  
  // Лимон и варианты с ошибками
  'лимона': 'лимон',
  'лимону': 'лимон',
  'лимоном': 'лимон',
  'лимоны': 'лимон',
  
  // Чайное дерево и варианты с ошибками
  'чайного дерева': 'чайное дерево',
  'чайному дереву': 'чайное дерево',
  'чайным деревом': 'чайное дерево',
  'чайные деревья': 'чайное дерево',
  
  // Розмарин и варианты с ошибками
  'розмарина': 'розмарин',
  'розмарину': 'розмарин',
  'розмарином': 'розмарин',
  'розмарины': 'розмарин',
  
  // Бергамот и варианты с ошибками
  'бергамота': 'бергамот',
  'бергамоту': 'бергамот',
  'бергамотом': 'бергамот',
  'бергамоты': 'бергамот',
  
  // Иланг-иланг и варианты с ошибками
  'иланг иланг': 'иланг-иланг',
  'иланг-иланга': 'иланг-иланг',
  'иланг-илангу': 'иланг-иланг',
  'иланг-илангом': 'иланг-иланг',
  
  // Ромашка и варианты с ошибками
  'ромашки': 'ромашка',
  'ромашку': 'ромашка',
  'ромашкой': 'ромашка',
  'ромашке': 'ромашка',
  'ромашками': 'ромашка',
  
  // Мелисса и варианты с ошибками
  'мелиссы': 'мелисса',
  'мелиссу': 'мелисса',
  'мелиссой': 'мелисса',
  'мелиссе': 'мелисса',
  
  // Апельсин и варианты с ошибками
  'апельсина': 'апельсин',
  'апельсину': 'апельсин',
  'апельсином': 'апельсин',
  'апельсины': 'апельсин',
  'апельсинами': 'апельсин'
};

// Словарь нормализации
const normalizationDictionary = {
  'эфирное масло': 'масло',
  'эфирные масла': 'масла',
  'аромамасло': 'масло',
  'аромамасла': 'масла',
  'расскажи про': 'расскажи о',
  'расскажи о': 'расскажи о',
  'что такое': 'что такое',
  'как использовать': 'как применять',
  'как применять': 'как применять',
  'для чего': 'для чего',
  'от чего': 'от чего',
  'помогает от': 'помогает при',
  'помогает при': 'помогает при'
};

function normalizeText(text) {
  if (!text) return '';
  
  let normalized = text.toLowerCase().trim();
  
  // Исправляем опечатки
  normalized = fixCommonTypos(normalized);
  
  // Нормализуем фразы
  normalized = normalizePhrases(normalized);
  
  // Убираем лишние пробелы
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  logger.debug('Text normalization:', { original: text, normalized });
  
  return normalized;
}

function fixCommonTypos(text) {
  let corrected = text;
  
  // Проходим по словарю опечаток
  for (const [typo, correct] of Object.entries(typoDictionary)) {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    corrected = corrected.replace(regex, correct);
  }
  
  // Исправляем общие опечатки
  corrected = corrected
    .replace(/ё/g, 'е')
    .replace(/йо/g, 'ё')
    .replace(/щ/g, 'ш')
    .replace(/ъ/g, 'ь')
    .replace(/э/g, 'е');
  
  return corrected;
}

function normalizePhrases(text) {
  let normalized = text;
  
  // Проходим по словарю нормализации
  for (const [phrase, normalizedPhrase] of Object.entries(normalizationDictionary)) {
    const regex = new RegExp(phrase, 'gi');
    normalized = normalized.replace(regex, normalizedPhrase);
  }
  
  return normalized;
}

function extractKeywords(text) {
  const keywords = [];
  const normalizedText = normalizeText(text);
  
  // Ключевые слова для поиска
  const keywordPatterns = [
    { pattern: /энерг|бодр|актив/, keyword: 'энергия' },
    { pattern: /спокой|релакс|расслаб/, keyword: 'спокойствие' },
    { pattern: /сон|засыпа|уснуть/, keyword: 'сон' },
    { pattern: /стресс|напряж|волнен/, keyword: 'стресс' },
    { pattern: /концентрац|фокус|вниман/, keyword: 'концентрация' },
    { pattern: /головн|мигрен/, keyword: 'головная боль' },
    { pattern: /простуда|кашель|насморк/, keyword: 'простуда' },
    { pattern: /боль|болит/, keyword: 'боль' }
  ];
  
  for (const { pattern, keyword } of keywordPatterns) {
    if (pattern.test(normalizedText)) {
      keywords.push(keyword);
    }
  }
  
  return [...new Set(keywords)]; // Убираем дубли
}

function isOilName(text) {
  const normalizedText = normalizeText(text);
  const oilNames = Object.values(typoDictionary);
  
  return oilNames.some(oilName => 
    normalizedText.includes(oilName.toLowerCase())
  );
}

function extractOilName(text) {
  const normalizedText = normalizeText(text);
  
  // Список основных названий масел (без грамматических форм)
  const mainOilNames = [
    'лаванда', 'мята', 'эвкалипт', 'лимон', 'чайное дерево', 
    'розмарин', 'бергамот', 'иланг-иланг', 'ромашка', 'мелисса', 'апельсин',
    'эфкалипт', 'туя', 'базилик', 'берёза', 'чёрный перец', 'чёрная ель',
    'пижма голубая', 'кардамон', 'кассия', 'кедр', 'семена сельдерея',
    'кинза', 'кора корицы', 'цитронелла', 'шалфей мускатный', 'гвоздика',
    'копайба', 'кориандр', 'кипарис', 'пихта дугласа', 'фенхель',
    'ладан', 'герань', 'имбирь'
  ];
  
  // Сначала ищем исправленные названия
  for (const oilName of mainOilNames) {
    if (normalizedText.includes(oilName.toLowerCase())) {
      return oilName;
    }
  }
  
  // Если не найдено, ищем в оригинальном тексте
  for (const [typo, correct] of Object.entries(typoDictionary)) {
    if (normalizedText.includes(typo.toLowerCase())) {
      return correct;
    }
  }
  
  return null;
}

module.exports = {
  normalizeText,
  fixCommonTypos,
  normalizePhrases,
  extractKeywords,
  isOilName,
  extractOilName
}; 