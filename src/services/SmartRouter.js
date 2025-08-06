const logger = require('../utils/logger');
const { normalizeText, fixCommonTypos } = require('../utils/textNormalizer');

class SmartRouter {
  constructor() {
    this.ambiguousOils = {
      'мята': ['Мята перечная', 'Мята садовая'],
      'перец': ['Чёрный перец', 'Розовый перец'],
      'шалфей': ['Шалфей мускатный', 'Шалфей испанский'],
      'эвкалипт': ['Эвкалипт', 'Лимонный эвкалипт']
    };

    this.medicalSymptoms = {
      'головная_боль': ['болит голова', 'головная боль', 'мигрень'],
      'простуда': ['простуда', 'кашель', 'насморк', 'орви'],
      'стресс': ['стресс', 'напряжение', 'тревога', 'беспокойство'],
      'сон': ['бессонница', 'не могу уснуть', 'плохо сплю']
    };

    this.oilDictionary = {
      'лаванда': 'Лаванда',
      'лимон': 'Лимон', 
      'мята': 'Мята перечная',
      'эвкалипт': 'Эвкалипт',
      'чайное дерево': 'Чайное дерево'
    };
  }

  async routeMessage(telegramUpdate) {
    try {
      logger.info('🧠 Smart Router processing update');
      
      // Проверяем тип обновления
      const isCallback = telegramUpdate?.callback_query ? true : false;
      
      if (isCallback) {
        return await this.handleCallbackQuery(telegramUpdate.callback_query);
      }
      
      return await this.handleTextMessage(telegramUpdate.message);
      
    } catch (error) {
      logger.error('Smart Router error:', error);
      return {
        requestType: 'error',
        chatId: this.extractChatId(telegramUpdate),
        error: error.message
      };
    }
  }

  async handleCallbackQuery(callbackQuery) {
    const callbackData = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const userName = callbackQuery.from.first_name;

    logger.info('🔘 Callback received:', callbackData);

    // Обработка выбора масел из неоднозначных вариантов
    if (callbackData.startsWith('select_oil:')) {
      const selectedOil = callbackData.replace('select_oil:', '');
      return {
        requestType: 'direct_search',
        chatId: chatId,
        oilName: selectedOil.toLowerCase(),
        normalizedOilName: selectedOil,
        detectedCommand: 'выбор из вариантов',
        isCallbackQuery: true,
        callbackQueryId: callbackQuery.id
      };
    }

    // Кнопки быстрого доступа
    if (callbackData === 'need_energy') {
      return {
        requestType: 'keyword_search',
        chatId: chatId,
        keywords: ['энергия'],
        userQuery: 'нужна энергия',
        isCallbackQuery: true,
        callbackQueryId: callbackQuery.id
      };
    }

    if (callbackData === 'want_relax') {
      return {
        requestType: 'keyword_search',
        chatId: chatId,
        keywords: ['спокойствие'],
        userQuery: 'хочу расслабиться',
        isCallbackQuery: true,
        callbackQueryId: callbackQuery.id
      };
    }

    // Главное меню
    if (callbackData === 'main_menu' || callbackData.startsWith('main_menu_')) {
      return {
        requestType: 'start_command',
        chatId: chatId,
        userQuery: 'главное меню',
        isCallbackQuery: true,
        callbackQueryId: callbackQuery.id,
        isFirstTime: false
      };
    }

    // Админские callback
    if (callbackData.startsWith('admin_')) {
      return {
        requestType: 'admin_callback',
        chatId: chatId,
        adminAction: callbackData,
        callbackQueryId: callbackQuery.id
      };
    }

    // Подписки
    if (callbackData.includes('subscribe') || callbackData.includes('unsubscribe')) {
      return {
        requestType: 'subscription_management',
        chatId: chatId,
        userName: userName,
        subscriptionAction: callbackData,
        callbackQueryId: callbackQuery.id
      };
    }

    // Неизвестный callback
    return {
      requestType: 'unknown_callback',
      chatId: chatId,
      callbackData: callbackData,
      callbackQueryId: callbackQuery.id
    };
  }

  async handleTextMessage(message) {
    const rawText = (message?.text || '').trim();
    const chatId = message?.chat?.id;
    const userName = message?.from?.first_name;

    if (!rawText) {
      return {
        requestType: 'empty_message',
        chatId: chatId,
        error: 'No text provided'
      };
    }

    logger.info('💬 Processing text:', rawText);

    const correctedText = fixCommonTypos(rawText);
    const normalizedText = normalizeText(correctedText);

    // 1. Команды бота
    if (rawText.startsWith('/')) {
      return this.handleBotCommand(rawText, chatId, userName);
    }

    // 2. ПРИОРИТЕТ: Подтверждения подписки
    const confirmationResult = this.checkSubscriptionConfirmation(normalizedText);
    if (confirmationResult) {
      return {
        requestType: 'subscription_confirmation',
        chatId: chatId,
        userName: userName,
        confirmationType: confirmationResult.type,
        matchedPattern: confirmationResult.pattern,
        originalText: rawText,
        normalizedText: normalizedText
      };
    }

    // 3. Медицинские запросы (высокий приоритет)
    const medicalResult = this.checkMedicalSymptoms(normalizedText);
    if (medicalResult.isMedical) {
      return {
        requestType: 'keyword_search',
        chatId: chatId,
        keywords: this.getMedicalKeywords(medicalResult.category),
        userQuery: rawText,
        medicalInfo: {
          category: medicalResult.category,
          symptom: medicalResult.symptom,
          type: medicalResult.type
        }
      };
    }

    // 4. Запросы подписок (после подтверждений)
    if (this.isSubscriptionRequest(normalizedText)) {
      return {
        requestType: 'subscription_inquiry',
        chatId: chatId,
        userName: userName,
        keyword: this.extractSubscriptionKeyword(normalizedText),
        originalText: rawText,
        normalizedText: normalizedText
      };
    }

    // 5. Музыкальные запросы
    const musicResult = this.checkMusicRequest(normalizedText);
    if (musicResult.isMusic) {
      return {
        requestType: 'music_request',
        chatId: chatId,
        userName: userName,
        musicKeyword: musicResult.keyword,
        requestedMood: musicResult.mood,
        timeOfDay: new Date().getHours() < 12 ? 'morning' : 'evening'
      };
    }

    // 6. Поиск конкретных масел
    const oilResult = this.findOil(normalizedText);
    if (oilResult.isAmbiguous) {
      return {
        requestType: 'disambiguation',
        chatId: chatId,
        originalQuery: oilResult.query,
        ambiguousKey: oilResult.key,
        options: oilResult.options,
        defaultChoice: oilResult.defaultChoice
      };
    } else if (oilResult.result) {
      return {
        requestType: 'direct_search',
        chatId: chatId,
        oilName: oilResult.query,
        normalizedOilName: oilResult.result,
        detectedCommand: 'простое название'
      };
    }

    // 7. Ключевые слова для общих рекомендаций
    const keywords = this.extractKeywords(normalizedText);
    if (keywords.length > 0) {
      return {
        requestType: 'keyword_search',
        chatId: chatId,
        keywords: keywords,
        userQuery: rawText
      };
    }

    // 8. Приветствия
    if (this.isGreeting(normalizedText)) {
      return {
        requestType: 'greeting',
        chatId: chatId,
        greetingType: this.getGreetingType(normalizedText)
      };
    }

    // 9. Default - неопознанный запрос
    return {
      requestType: 'unknown',
      chatId: chatId,
      originalText: rawText,
      normalizedText: normalizedText,
      needsHumanAnalysis: true
    };
  }

  handleBotCommand(rawText, chatId, userName) {
    const command = rawText.split(' ')[0];
    
    switch (command) {
      case '/start':
        return {
          requestType: 'start_command',
          chatId: chatId,
          userName: userName,
          isFirstTime: rawText === '/start'
        };
        
      case '/help':
        return {
          requestType: 'help_command',
          chatId: chatId
        };

      case '/admin':
      case '/stats':
      case '/broadcast':
      case '/users':
        return {
          requestType: 'admin_command',
          chatId: chatId,
          command: command
        };

      default:
        return {
          requestType: 'unknown_command',
          chatId: chatId,
          command: command
        };
    }
  }

  checkSubscriptionConfirmation(normalizedText) {
    const confirmationPatterns = [
      { pattern: 'да подписаться', type: 'confirm_subscribe' },
      { pattern: 'да, подписаться', type: 'confirm_subscribe' },
      { pattern: 'да отписаться', type: 'confirm_unsubscribe' },
      { pattern: 'расскажи подробнее', type: 'request_details' },
      { pattern: 'настройки времени', type: 'time_settings' },
      { pattern: 'не сейчас', type: 'cancel_action' }
    ];

    for (const { pattern, type } of confirmationPatterns) {
      if (normalizedText.includes(pattern)) {
        return { type, pattern };
      }
    }
    
    return null;
  }

  checkMedicalSymptoms(normalizedText) {
    // Проверяем паттерны медицинских вопросов
    const medicalQuestionPatterns = [
      'какое масло при', 'какие масла при', 'что помогает от', 'масло от'
    ];

    for (const pattern of medicalQuestionPatterns) {
      if (normalizedText.includes(pattern)) {
        return {
          isMedical: true,
          type: 'medical_question',
          pattern: pattern,
          category: 'общий_вопрос'
        };
      }
    }

    // Проверяем конкретные симптомы
    for (const [category, symptoms] of Object.entries(this.medicalSymptoms)) {
      for (const symptom of symptoms) {
        if (normalizedText.includes(symptom)) {
          return {
            isMedical: true,
            type: 'symptom',
            symptom: symptom,
            category: category
          };
        }
      }
    }

    return { isMedical: false };
  }

  getMedicalKeywords(category) {
    const categoryKeywords = {
      'головная_боль': ['головная боль', 'мигрень'],
      'простуда': ['простуда', 'дыхательная система'],
      'стресс': ['стресс', 'эмоциональное здоровье'],
      'сон': ['сон', 'бессонница', 'расслабление']
    };
    
    return categoryKeywords[category] || ['здоровье'];
  }

  isSubscriptionRequest(normalizedText) {
    const subscriptionKeywords = [
      'подпис', 'уведомлен', 'рассылк', 'отпис', 'настройки времени'
    ];
    
    return subscriptionKeywords.some(keyword => normalizedText.includes(keyword));
  }

  extractSubscriptionKeyword(normalizedText) {
    const keywords = ['подпис', 'уведомлен', 'рассылк', 'отпис'];
    return keywords.find(keyword => normalizedText.includes(keyword)) || 'подпис';
  }

  checkMusicRequest(normalizedText) {
    const musicKeywords = [
      'музыка', 'песня', 'плейлист', 'послушать', 'spotify', 'youtube'
    ];
    
    const foundKeyword = musicKeywords.find(keyword => normalizedText.includes(keyword));
    if (!foundKeyword) {
      return { isMusic: false };
    }

    // Определяем настроение
    let mood = null;
    if (normalizedText.includes('расслабл') || normalizedText.includes('спокой')) {
      mood = 'расслабляющая';
    } else if (normalizedText.includes('энерг') || normalizedText.includes('бодр')) {
      mood = 'энергичная';
    } else if (normalizedText.includes('сон')) {
      mood = 'для сна';
    }

    return {
      isMusic: true,
      keyword: foundKeyword,
      mood: mood
    };
  }

  findOil(normalizedText) {
    // Проверяем неоднозначность
    for (const [ambiguousKey, options] of Object.entries(this.ambiguousOils)) {
      if (normalizedText.includes(ambiguousKey)) {
        return {
          isAmbiguous: true,
          query: normalizedText,
          key: ambiguousKey,
          options: options,
          defaultChoice: options[0]
        };
      }
    }

    // Проверяем прямые совпадения
    for (const [searchTerm, oilName] of Object.entries(this.oilDictionary)) {
      if (normalizedText.includes(searchTerm)) {
        return {
          isAmbiguous: false,
          result: oilName,
          query: searchTerm
        };
      }
    }

    return { isAmbiguous: false, result: null };
  }

  extractKeywords(normalizedText) {
    const keywordMap = {
      'энергия': ['энергия', 'бодрость', 'активность', 'сил'],
      'спокойствие': ['спокойствие', 'расслабл', 'релакс', 'покой'],
      'сон': ['сон', 'засыпать', 'уснуть'],
      'стресс': ['напряжение', 'волнение'],
      'концентрация': ['фокус', 'внимание', 'сосредоточ']
    };

    const foundKeywords = [];
    for (const [mainKeyword, synonyms] of Object.entries(keywordMap)) {
      for (const synonym of synonyms) {
        if (normalizedText.includes(synonym)) {
          foundKeywords.push(mainKeyword);
          break;
        }
      }
    }

    return foundKeywords;
  }

  isGreeting(normalizedText) {
    const greetings = ['привет', 'здравствуй', 'добр', 'спасибо'];
    return greetings.some(greeting => normalizedText.includes(greeting));
  }

  getGreetingType(normalizedText) {
    if (normalizedText.includes('спасибо')) return 'thanks';
    if (normalizedText.includes('привет')) return 'hello';
    return 'general';
  }

  extractChatId(telegramUpdate) {
    return telegramUpdate?.message?.chat?.id || 
           telegramUpdate?.callback_query?.message?.chat?.id || 
           'unknown';
  }
}

module.exports = SmartRouter; 