const logger = require('./logger');

// Словарь опечаток
const typoDictionary = {
  'лаванда': 'лаванда',
  'лаванд': 'лаванда',
  'лаванду': 'лаванда',
  'мята': 'мята',
  'мят': 'мята',
  'мятой': 'мята',
  'эвкалипт': 'эвкалипт',
  'эвкалипта': 'эвкалипт',
  'лимон': 'лимон',
  'лимона': 'лимон',
  'чайное дерево': 'чайное дерево',
  'чайного дерева': 'чайное дерево',
  'розмарин': 'розмарин',
  'розмарина': 'розмарин',
  'бергамот': 'бергамот',
  'бергамота': 'бергамот',
  'иланг иланг': 'иланг-иланг',
  'иланг-иланг': 'иланг-иланг',
  'ромашка': 'ромашка',
  'ромашки': 'ромашка',
  'мелисса': 'мелисса',
  'мелиссы': 'мелисса'
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
  const oilNames = Object.values(typoDictionary);
  
  for (const oilName of oilNames) {
    if (normalizedText.includes(oilName.toLowerCase())) {
      return oilName;
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