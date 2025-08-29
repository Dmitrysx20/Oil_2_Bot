/**
 * Утилиты для очистки текста от хештегов и markdown-форматирования
 */

/**
 * Очищает текст от хештегов (###, ##, #, ####)
 * @param {string} text - Исходный текст
 * @returns {string} Очищенный текст
 */
function removeHashtags(text) {
  if (!text) return text;
  
  // Удаляем хештеги (####, ###, ##, #) в начале строк
  return text.replace(/^#{1,4}\s*/gm, '');
}

/**
 * Очищает текст от markdown-форматирования
 * @param {string} text - Исходный текст
 * @returns {string} Очищенный текст
 */
function removeMarkdown(text) {
  if (!text) return text;
  
  return text
    // Удаляем хештеги
    .replace(/^#{1,4}\s*/gm, '')
    // Удаляем жирный текст **текст**
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Удаляем курсив *текст*
    .replace(/\*(.*?)\*/g, '$1')
    // Удаляем код `текст`
    .replace(/`(.*?)`/g, '$1')
    // Удаляем ссылки [текст](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Удаляем лишние пробелы
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * Форматирует текст для Telegram без хештегов
 * @param {string} text - Исходный текст
 * @returns {string} Отформатированный текст
 */
function formatForTelegram(text) {
  if (!text) return text;
  
  // Сначала удаляем хештеги
  let cleaned = removeHashtags(text);
  
  // Заменяем markdown на emoji и простой текст
  cleaned = cleaned
    // Заменяем **текст** на эмодзи + текст
    .replace(/\*\*(.*?)\*\*/g, '🎯 $1')
    // Заменяем *текст* на простой текст
    .replace(/\*(.*?)\*/g, '$1')
    // Добавляем эмодзи к заголовкам
    .replace(/^(Ароматерапия.*?)$/gm, '🌿 $1')
    .replace(/^(Эфирные масла:)$/gm, '🌿 $1')
    .replace(/^(Способы применения.*?)$/gm, '💡 $1')
    .replace(/^(Безопасность.*?)$/gm, '⚠️ $1')
    .replace(/^(Рецепты.*?)$/gm, '🧴 $1')
    .replace(/^(План применения.*?)$/gm, '⏰ $1');
  
  return cleaned.trim();
}

/**
 * Очищает AI-ответ от нежелательного форматирования
 * @param {string} aiResponse - Ответ от AI
 * @returns {string} Очищенный ответ
 */
function cleanAIResponse(aiResponse) {
  if (!aiResponse) return aiResponse;
  
  // Удаляем хештеги и лишнее форматирование
  let cleaned = removeHashtags(aiResponse);
  
  // Убираем лишние переносы строк
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Убираем лишние пробелы в начале строк
  cleaned = cleaned.replace(/^\s+/gm, '');
  
  return cleaned.trim();
}

module.exports = {
  removeHashtags,
  removeMarkdown,
  formatForTelegram,
  cleanAIResponse
};
