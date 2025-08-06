/**
 * 🌿 Smart Router - Умный роутер запросов для Арома-Помощника
 * 
 * Этот модуль анализирует входящие сообщения и определяет их тип
 * для правильной маршрутизации к соответствующим обработчикам.
 */

class SmartRouter {
  constructor() {
    this.requestTypes = {
      START_COMMAND: 'start_command',
      HELP_COMMAND: 'help_command',
      MENU_COMMAND: 'menu_command',
      OIL_SEARCH: 'oil_search',
      MOOD_REQUEST: 'mood_request',
      SUBSCRIPTION_INQUIRY: 'subscription_inquiry',
      SUBSCRIPTION_CONFIRMATION: 'subscription_confirmation',
      MUSIC_REQUEST: 'music_request',
      GREETING: 'greeting',
      UNKNOWN: 'unknown',
      ERROR: 'error'
    };

    this.oilKeywords = [
      'лаванда', 'эвкалипт', 'мята', 'лимон', 'апельсин', 'роза', 'жасмин',
      'чайное дерево', 'розмарин', 'герань', 'бергамот', 'иланг', 'пачули',
      'сандал', 'кедр', 'сосна', 'можжевельник', 'лемонграсс', 'базилик',
      'орегано', 'тимьян', 'мелисса', 'ромашка', 'календула', 'шалфей',
      'грейпфрут', 'лайм', 'мандарин', 'нероли', 'петитгрейн', 'ветивер'
    ];

    this.moodKeywords = {
      'стресс': ['стресс', 'напряжение', 'нервы', 'тревог', 'беспокой', 'волнен'],
      'усталость': ['устал', 'усталость', 'сил нет', 'вымотан', 'изможден', 'энергии нет'],
      'грусть': ['грустн', 'печаль', 'тоск', 'депресс', 'уныни', 'плохо на душе'],
      'бессонница': ['не сплю', 'бессонница', 'не засыпаю', 'плохо сплю', 'просыпаюсь'],
      'энергия': ['энергии', 'энергия', 'бодрость', 'активность', 'силы', 'мотивация', 'нужна энергия'],
      'спокойствие': ['спокойствие', 'релакс', 'расслабление', 'умиротворение'],
      'радость': ['радость', 'веселье', 'позитив', 'хорошее настроение', 'счастье']
    };

    this.subscriptionKeywords = [
      'подпис', 'уведомлен', 'рассылк', 'напоминан', 'получать уведомления',
      'отпис', 'отключ уведомления', 'настройк уведомлений'
    ];

    this.musicKeywords = [
      'музыка', 'песня', 'плейлист', 'послушать', 'композиция', 'трек',
      'spotify', 'youtube', 'apple music', 'yandex music', 'включи музыку'
    ];

    this.greetingKeywords = [
      'привет', 'здравствуй', 'добр', 'спасибо', 'благодар'
    ];
  }

  /**
   * Основной метод для анализа входящего сообщения
   * @param {Object} input - Входящие данные от Telegram
   * @returns {Object} Результат анализа с типом запроса и метаданными
   */
  analyzeRequest(input) {
    try {
      // Проверка входных данных
      if (!input || !input.json) {
        return this.createErrorResponse('No input data');
      }

      // Обработка callback queries
      if (input.json.callback_query) {
        return this.handleCallbackQuery(input.json.callback_query);
      }

      // Обработка обычных сообщений
      const rawText = (input.json.message?.text || '').trim();
      const chatId = input.json.message?.chat?.id || 'unknown';
      const userName = input.json.message?.from?.first_name || 'User';

      if (!rawText) {
        return this.createErrorResponse('No text provided', chatId);
      }

      // Нормализация текста
      const normalizedText = this.normalizeText(rawText);

      // Определение типа запроса
      const requestType = this.determineRequestType(rawText, normalizedText);
      const metadata = this.extractMetadata(rawText, normalizedText, requestType);

      return {
        originalText: rawText,
        normalizedText: normalizedText,
        requestType: requestType,
        chatId: chatId,
        userName: userName,
        ...metadata,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('SmartRouter error:', error);
      return this.createErrorResponse('Processing error');
    }
  }

  /**
   * Обработка callback queries
   * @param {Object} callbackQuery - Данные callback query
   * @returns {Object} Результат обработки
   */
  handleCallbackQuery(callbackQuery) {
    const callbackData = callbackQuery.data || '';
    const chatId = callbackQuery.message.chat.id;
    const userName = callbackQuery.from.first_name || 'User';

    return {
      originalText: `callback:${callbackData}`,
      requestType: 'callback_query',
      chatId: chatId,
      userName: userName,
      callbackData: callbackData,
      callbackQueryId: callbackQuery.id
    };
  }

  /**
   * Нормализация текста для анализа
   * @param {string} text - Исходный текст
   * @returns {string} Нормализованный текст
   */
  normalizeText(text) {
    return text.toLowerCase()
      .replace(/[.,!?;:()\\\"]/g, ' ')
      .replace(/\\s+/g, ' ')
      .trim();
  }

  /**
   * Определение типа запроса на основе текста
   * @param {string} rawText - Исходный текст
   * @param {string} normalizedText - Нормализованный текст
   * @returns {string} Тип запроса
   */
  determineRequestType(rawText, normalizedText) {
    // Команды
    if (rawText.startsWith('/')) {
      return this.analyzeCommand(rawText);
    }

    // Поиск масел
    if (this.containsOilKeywords(normalizedText)) {
      return this.requestTypes.OIL_SEARCH;
    }

    // Настроения
    if (this.containsMoodKeywords(normalizedText)) {
      return this.requestTypes.MOOD_REQUEST;
    }

    // Подписки
    if (this.containsSubscriptionKeywords(normalizedText)) {
      return this.requestTypes.SUBSCRIPTION_INQUIRY;
    }

    // Музыка
    if (this.containsMusicKeywords(normalizedText)) {
      return this.requestTypes.MUSIC_REQUEST;
    }

    // Приветствия
    if (this.containsGreetingKeywords(normalizedText)) {
      return this.requestTypes.GREETING;
    }

    return this.requestTypes.UNKNOWN;
  }

  /**
   * Анализ команд
   * @param {string} text - Текст команды
   * @returns {string} Тип команды
   */
  analyzeCommand(text) {
    const command = text.split(' ')[0];
    
    switch (command) {
      case '/start':
        return this.requestTypes.START_COMMAND;
      case '/help':
        return this.requestTypes.HELP_COMMAND;
      case '/menu':
        return this.requestTypes.MENU_COMMAND;
      default:
        return 'unknown_command';
    }
  }

  /**
   * Проверка наличия ключевых слов масел
   * @param {string} text - Текст для проверки
   * @returns {boolean} Результат проверки
   */
  containsOilKeywords(text) {
    return this.oilKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Проверка наличия ключевых слов настроения
   * @param {string} text - Текст для проверки
   * @returns {boolean} Результат проверки
   */
  containsMoodKeywords(text) {
    return Object.values(this.moodKeywords).some(keywords =>
      keywords.some(keyword => text.includes(keyword))
    );
  }

  /**
   * Проверка наличия ключевых слов подписки
   * @param {string} text - Текст для проверки
   * @returns {boolean} Результат проверки
   */
  containsSubscriptionKeywords(text) {
    return this.subscriptionKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Проверка наличия ключевых слов музыки
   * @param {string} text - Текст для проверки
   * @returns {boolean} Результат проверки
   */
  containsMusicKeywords(text) {
    return this.musicKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Проверка наличия ключевых слов приветствия
   * @param {string} text - Текст для проверки
   * @returns {boolean} Результат проверки
   */
  containsGreetingKeywords(text) {
    return this.greetingKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Извлечение метаданных из запроса
   * @param {string} rawText - Исходный текст
   * @param {string} normalizedText - Нормализованный текст
   * @param {string} requestType - Тип запроса
   * @returns {Object} Метаданные
   */
  extractMetadata(rawText, normalizedText, requestType) {
    const metadata = {};

    switch (requestType) {
      case this.requestTypes.OIL_SEARCH:
        metadata.oilName = this.extractOilName(rawText);
        break;

      case this.requestTypes.MOOD_REQUEST:
        metadata.mood = this.extractMood(rawText);
        metadata.keywords = ['настроение', 'эмоции'];
        break;

      case this.requestTypes.SUBSCRIPTION_INQUIRY:
        metadata.keywords = ['подписка'];
        break;

      case this.requestTypes.MUSIC_REQUEST:
        metadata.keywords = ['музыка'];
        break;
    }

    return metadata;
  }

  /**
   * Извлечение названия масла из текста
   * @param {string} text - Исходный текст
   * @returns {string|null} Название масла
   */
  extractOilName(text) {
    const foundOil = this.oilKeywords.find(oil => 
      text.toLowerCase().includes(oil.toLowerCase())
    );
    return foundOil || text;
  }

  /**
   * Извлечение настроения из текста
   * @param {string} text - Исходный текст
   * @returns {string} Описание настроения
   */
  extractMood(text) {
    return text; // Возвращаем исходный текст для дальнейшего анализа
  }

  /**
   * Создание ответа об ошибке
   * @param {string} error - Описание ошибки
   * @param {string} chatId - ID чата
   * @returns {Object} Ответ об ошибке
   */
  createErrorResponse(error, chatId = 'unknown') {
    return {
      originalText: '',
      requestType: this.requestTypes.ERROR,
      chatId: chatId,
      error: error
    };
  }
}

// Экспорт для использования в n8n
module.exports = SmartRouter; 