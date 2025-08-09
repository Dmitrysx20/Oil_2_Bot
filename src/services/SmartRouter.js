const logger = require('../utils/logger');
const { normalizeText, fixCommonTypos, extractOilName } = require('../utils/textNormalizer');

class SmartRouter {
  constructor() {
    this.ambiguousOils = {
      'мята': ['Мята перечная', 'Мята садовая', 'Мята лимонная'],
      'лаванда': ['Лаванда', 'Лаванда узколистная'],
      'эвкалипт': ['Эвкалипт', 'Эвкалипт лучистый'],
      'ромашка': ['Ромашка римская', 'Ромашка немецкая'],
      'перец': ['Чёрный перец', 'Розовый перец'],
      'шалфей': ['Шалфей мускатный', 'Шалфей испанский']
    };

    this.medicalSymptoms = {
      'головная_боль': ['болит голова', 'головная боль', 'мигрень'],
      'простуда': ['простуда', 'кашель', 'насморк', 'орви'],
      'стресс': ['стресс', 'напряжение', 'тревога', 'беспокойство'],
      'сон': ['бессонница', 'не могу уснуть', 'плохо сплю']
    };

    this.oilDictionary = {
      'лаванда': 'Лаванда',
      'лаванда узколистная': 'Лаванда узколистная',
      'лимон': 'Лимон', 
      'мята': 'Мята перечная',
      'мята перечная': 'Мята перечная',
      'мята садовая': 'Мята садовая',
      'мята лимонная': 'Мята лимонная',
      'эвкалипт': 'Эвкалипт',
      'эфкалипт': 'Эвкалипт',
      'эвкалипт лучистый': 'Эвкалипт лучистый',
      'ромашка': 'Ромашка римская',
      'ромашка римская': 'Ромашка римская',
      'ромашка немецкая': 'Ромашка немецкая',
      'чайное дерево': 'Чайное дерево',
      'розмарин': 'Розмарин',
      'апельсин': 'Апельсин сладкий',
      'апельсин сладкий': 'Апельсин сладкий'
    };
  }

  async routeMessage(telegramUpdate) {
    try {
      logger.info('🧠 Smart Router processing update');
      console.log('📥 Raw update:', JSON.stringify(telegramUpdate, null, 2));
      
      // Проверяем тип обновления - более детальная проверка
      console.log('🔍 Checking for callback_query...');
      console.log('🔍 telegramUpdate.callback_query:', telegramUpdate?.callback_query);
      console.log('🔍 telegramUpdate.hasOwnProperty("callback_query"):', telegramUpdate?.hasOwnProperty('callback_query'));
      
      // Проверяем кастомный формат callback_query (когда data есть в корне объекта)
      if (telegramUpdate?.data && telegramUpdate?.from && telegramUpdate?.message) {
        console.log('🔘 Processing custom callback_query format:', telegramUpdate.data);
        const customCallbackQuery = {
          id: telegramUpdate.id || 'custom_id',
          from: telegramUpdate.from,
          message: telegramUpdate.message,
          data: telegramUpdate.data
        };
        const result = await this.handleCallbackQuery(customCallbackQuery);
        logger.info('🔍 SmartRouter result:', result?.requestType || 'undefined');
        console.log('🔍 Callback result:', JSON.stringify(result, null, 2));
        return result;
      }
      
      const isCallback = telegramUpdate?.callback_query ? true : false;
      console.log('🔍 isCallback:', isCallback);
      
      if (isCallback) {
        console.log('🔘 Processing callback_query:', telegramUpdate.callback_query.data);
        const result = await this.handleCallbackQuery(telegramUpdate.callback_query);
        logger.info('🔍 SmartRouter result:', result?.requestType || 'undefined');
        console.log('🔍 Callback result:', JSON.stringify(result, null, 2));
        return result;
      }
      
      // В режиме polling Telegram передает сообщения напрямую, без обертки message
      // Проверяем, есть ли message в обновлении (webhook формат) или это прямое сообщение (polling формат)
      let message = telegramUpdate.message || telegramUpdate;
      
      // Проверяем, что это действительно текстовое сообщение, а не callback_query
      if (message?.callback_query) {
        console.log('🔘 Processing callback_query from message:', message.callback_query.data);
        const result = await this.handleCallbackQuery(message.callback_query);
        logger.info('🔍 SmartRouter result:', result?.requestType || 'undefined');
        console.log('🔍 Callback result:', JSON.stringify(result, null, 2));
        return result;
      }
      
      console.log('📥 Raw message object:', JSON.stringify(message, null, 2));
      if (!message || !message.chat) {
        console.log('❌ No valid message in update!');
        return {
          requestType: 'error',
          chatId: this.extractChatId(telegramUpdate),
          error: 'No valid message in update'
        };
      }
      
      const result = await this.handleTextMessage(message);
      logger.info('🔍 SmartRouter result:', result?.requestType || 'undefined');
      console.log('🔍 Text result:', JSON.stringify(result, null, 2));
      return result;
      
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

    // Здоровье
    if (callbackData === 'health_issues') {
      return {
        requestType: 'keyword_search',
        chatId: chatId,
        keywords: ['здоровье', 'болезнь', 'симптом'],
        userQuery: 'проблемы со здоровьем',
        isCallbackQuery: true,
        callbackQueryId: callbackQuery.id
      };
    }

    // Музыка
    if (callbackData === 'music_menu') {
      return {
        requestType: 'music_request',
        chatId: chatId,
        userQuery: 'музыка',
        isCallbackQuery: true,
        callbackQueryId: callbackQuery.id
      };
    }

    // Музыка: сохранить предпочтение
    if (callbackData.startsWith('music_save_')) {
      const mood = callbackData.replace('music_save_', '');
      return {
        requestType: 'music_save_preference',
        chatId: chatId,
        mood,
        isCallbackQuery: true,
        callbackQueryId: callbackQuery.id
      };
    }

    // Музыка: обновить рекомендации
    if (callbackData.startsWith('music_refresh_')) {
      const mood = callbackData.replace('music_refresh_', '');
      return {
        requestType: 'music_request',
        chatId: chatId,
        requestedMood: mood,
        userQuery: 'музыка',
        isCallbackQuery: true,
        callbackQueryId: callbackQuery.id
      };
    }

    // Помощь
    if (callbackData === 'help_menu') {
      return {
        requestType: 'help_request',
        chatId: chatId,
        userQuery: 'помощь',
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

    // Подписки: открыть меню подписки
    if (callbackData === 'subscription_menu') {
      return {
        requestType: 'subscription_inquiry',
        chatId: chatId,
        userName: userName,
        isCallbackQuery: true,
        callbackQueryId: callbackQuery.id
      };
    }

    // Подписки: показать детали через существующий обработчик подтверждений
    if (callbackData === 'subscription_details') {
      return {
        requestType: 'subscription_confirmation',
        chatId: chatId,
        userName: userName,
        confirmationType: 'request_details',
        isCallbackQuery: true,
        callbackQueryId: callbackQuery.id
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

    // Подписки - только точные совпадения
    if (callbackData === 'subscribe' || callbackData === 'unsubscribe') {
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

    console.log('📝 Message details:', {
      rawText,
      chatId,
      userName,
      messageKeys: Object.keys(message || {})
    });

    if (!rawText) {
      console.log('❌ Empty text received, chatId:', chatId);
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

    // 6. Поиск конкретных масел (ВЫСОКИЙ ПРИОРИТЕТ)
    const oilResult = this.findOil(normalizedText);
    if (oilResult.result || oilResult.isAmbiguous) {
      if (oilResult.isAmbiguous) {
        return {
          requestType: 'disambiguation',
          chatId: chatId,
          originalQuery: oilResult.query,
          ambiguousKey: oilResult.key,
          options: oilResult.options,
          defaultChoice: oilResult.defaultChoice
        };
      } else {
        return {
          requestType: 'direct_search',
          chatId: chatId,
          oilName: oilResult.result.toLowerCase(),
          normalizedOilName: oilResult.result,
          detectedCommand: 'поиск масла',
          originalText: rawText,
          normalizedText: normalizedText
        };
      }
    }

    // 7. Ключевые слова для общих рекомендаций (только если не найдены конкретные масла)
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
    // Сначала используем систему нормализации для поиска масел
    const extractedOil = extractOilName(normalizedText);
    
    if (extractedOil) {
      // Проверяем неоднозначность
      for (const [ambiguousKey, options] of Object.entries(this.ambiguousOils)) {
        if (extractedOil.toLowerCase() === ambiguousKey) {
          return {
            isAmbiguous: true,
            query: normalizedText,
            key: ambiguousKey,
            options: options,
            defaultChoice: options[0]
          };
        }
      }

      // Если масло найдено и не неоднозначно, возвращаем результат
      return {
        isAmbiguous: false,
        result: extractedOil,
        query: extractedOil
      };
    }

    // Fallback: проверяем прямые совпадения в словаре
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
      'энергия': ['энергия', 'енергия', 'бодрость', 'активность', 'сил', 'нужна энергия', 'нужна енергия', 'хочу энергии', 'для энергии'],
      'спокойствие': ['спокойствие', 'расслабл', 'релакс', 'покой', 'успокоить', 'хочу расслабиться'],
      'сон': ['сон', 'засыпать', 'уснуть', 'для сна', 'хочу спать'],
      'стресс': ['стресс', 'напряжение', 'волнение', 'от стресса'],
      'концентрация': ['концентрация', 'фокус', 'внимание', 'сосредоточ', 'для концентрации']
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
    // В режиме polling Telegram передает сообщения напрямую, без обертки message
    // Проверяем оба формата: webhook (с message) и polling (прямое сообщение)
    return telegramUpdate?.message?.chat?.id || 
           telegramUpdate?.callback_query?.message?.chat?.id || 
           telegramUpdate?.chat?.id ||  // Для режима polling
           'unknown';
  }
}

module.exports = SmartRouter; 