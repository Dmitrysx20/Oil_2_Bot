const logger = require('../utils/logger');
const config = require('../../config');

class AntiSpamProtection {
  constructor() {
    // Хранилище для отслеживания активности пользователей
    this.userActivity = new Map();
    this.suspiciousUsers = new Set();
    this.blockedUsers = new Set();
    
    // Настройки защиты
    this.config = {
      // Лимиты для обычных пользователей
      normalLimits: {
        messagesPerMinute: 10,
        messagesPerHour: 100,
        messagesPerDay: 500,
        maxMessageLength: 1000,
        maxEmojisPerMessage: 20,
        maxLinksPerMessage: 3
      },
      
      // Лимиты для новых пользователей (более строгие)
      newUserLimits: {
        messagesPerMinute: 5,
        messagesPerHour: 50,
        messagesPerDay: 200,
        maxMessageLength: 500,
        maxEmojisPerMessage: 10,
        maxLinksPerMessage: 1
      },
      
      // Лимиты для админов (более мягкие)
      adminLimits: {
        messagesPerMinute: 30,
        messagesPerHour: 300,
        messagesPerDay: 1000,
        maxMessageLength: 2000,
        maxEmojisPerMessage: 50,
        maxLinksPerMessage: 10
      },
      
      // Настройки блокировки
      blocking: {
        suspiciousThreshold: 5, // Количество подозрительных действий для блокировки
        blockDuration: 24 * 60 * 60 * 1000, // 24 часа в миллисекундах
        autoUnblock: true
      }
    };
    
    // Очистка старых данных каждые 10 минут
    setInterval(() => this.cleanupOldData(), 10 * 60 * 1000);
  }

  // Основная функция проверки
  checkMessage(message) {
    const chatId = message?.chat?.id;
    const userId = message?.from?.id;
    const text = message?.text || '';
    const timestamp = Date.now();

    if (!chatId || !userId) {
      return { allowed: false, reason: 'invalid_message' };
    }

    // Проверяем, не заблокирован ли пользователь
    if (this.blockedUsers.has(userId)) {
      return { allowed: false, reason: 'user_blocked' };
    }

    // Получаем тип пользователя
    const userType = this.getUserType(userId, message);
    const limits = this.config[`${userType}Limits`];

    // Проверяем активность пользователя
    const activity = this.getUserActivity(userId);
    
    // Проверяем лимиты
    const limitCheck = this.checkLimits(activity, limits, timestamp);
    if (!limitCheck.allowed) {
      return limitCheck;
    }

    // Проверяем содержимое сообщения
    const contentCheck = this.checkContent(text, limits);
    if (!contentCheck.allowed) {
      return contentCheck;
    }

    // Проверяем на спам-паттерны
    const spamCheck = this.checkSpamPatterns(text, userId);
    if (!spamCheck.allowed) {
      return spamCheck;
    }

    // Проверяем на подозрительную активность
    const suspiciousCheck = this.checkSuspiciousActivity(message, userId);
    if (!suspiciousCheck.allowed) {
      return suspiciousCheck;
    }

    // Обновляем активность пользователя
    this.updateUserActivity(userId, timestamp);

    return { allowed: true };
  }

  // Проверка лимитов сообщений
  checkLimits(activity, limits, timestamp) {
    const minuteAgo = timestamp - 60 * 1000;
    const hourAgo = timestamp - 60 * 60 * 1000;
    const dayAgo = timestamp - 24 * 60 * 60 * 1000;

    const messagesLastMinute = activity.filter(time => time > minuteAgo).length;
    const messagesLastHour = activity.filter(time => time > hourAgo).length;
    const messagesLastDay = activity.filter(time => time > dayAgo).length;

    if (messagesLastMinute > limits.messagesPerMinute) {
      return { 
        allowed: false, 
        reason: 'rate_limit_minute',
        retryAfter: 60 - Math.floor((timestamp - minuteAgo) / 1000)
      };
    }

    if (messagesLastHour > limits.messagesPerHour) {
      return { 
        allowed: false, 
        reason: 'rate_limit_hour',
        retryAfter: 3600 - Math.floor((timestamp - hourAgo) / 1000)
      };
    }

    if (messagesLastDay > limits.messagesPerDay) {
      return { 
        allowed: false, 
        reason: 'rate_limit_day',
        retryAfter: 86400 - Math.floor((timestamp - dayAgo) / 1000)
      };
    }

    return { allowed: true };
  }

  // Проверка содержимого сообщения
  checkContent(text, limits) {
    // Проверка длины сообщения
    if (text.length > limits.maxMessageLength) {
      return { 
        allowed: false, 
        reason: 'message_too_long',
        maxLength: limits.maxMessageLength
      };
    }

    // Проверка количества эмодзи
    const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
    if (emojiCount > limits.maxEmojisPerMessage) {
      return { 
        allowed: false, 
        reason: 'too_many_emojis',
        maxEmojis: limits.maxEmojisPerMessage
      };
    }

    // Проверка количества ссылок
    const linkCount = (text.match(/https?:\/\/[^\s]+/g) || []).length;
    if (linkCount > limits.maxLinksPerMessage) {
      return { 
        allowed: false, 
        reason: 'too_many_links',
        maxLinks: limits.maxLinksPerMessage
      };
    }

    return { allowed: true };
  }

  // Проверка спам-паттернов
  checkSpamPatterns(text, userId) {
    const spamPatterns = [
      // Повторяющиеся символы
      { pattern: /(.)\1{10,}/, reason: 'repeated_characters' },
      
      // Много заглавных букв
      { pattern: /[A-ZА-Я]{20,}/, reason: 'excessive_caps' },
      
      // Много спецсимволов
      { pattern: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{10,}/, reason: 'excessive_symbols' },
      
      // Спам-слова
      { pattern: /(buy|buy now|click here|free money|earn money|make money|work from home|get rich|investment|crypto|bitcoin|forex|casino|poker|bet|gambling)/i, reason: 'spam_keywords' },
      
      // Слишком много цифр
      { pattern: /\d{15,}/, reason: 'excessive_numbers' },
      
      // Слишком много пробелов
      { pattern: /\s{10,}/, reason: 'excessive_spaces' }
    ];

    for (const { pattern, reason } of spamPatterns) {
      if (pattern.test(text)) {
        this.markSuspiciousActivity(userId, reason);
        return { allowed: false, reason: `spam_pattern_${reason}` };
      }
    }

    return { allowed: true };
  }

  // Проверка подозрительной активности
  checkSuspiciousActivity(message, userId) {
    const text = message?.text || '';
    const user = message?.from;
    
    // Проверяем возраст аккаунта
    if (user) {
      const accountAge = Date.now() - (user.id * 1000);
      const daysOld = accountAge / (1000 * 60 * 60 * 24);
      
      // Если аккаунт очень новый и отправляет много сообщений
      if (daysOld < 1) {
        const activity = this.getUserActivity(userId);
        if (activity.length > 5) {
          this.markSuspiciousActivity(userId, 'new_account_spam');
          return { allowed: false, reason: 'new_account_spam' };
        }
      }
    }

    // Проверяем на автоматизированные сообщения
    if (this.isAutomatedMessage(text)) {
      this.markSuspiciousActivity(userId, 'automated_message');
      return { allowed: false, reason: 'automated_message' };
    }

    return { allowed: true };
  }

  // Проверка на автоматизированные сообщения
  isAutomatedMessage(text) {
    const automatedPatterns = [
      // Сообщения с точным временем
      /\d{2}:\d{2}:\d{2}/,
      
      // Сообщения с системными метками
      /\[.*\]/,
      
      // Сообщения с UUID
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
      
      // Сообщения только из цифр и символов
      /^[\d\s\-\+\(\)\[\]\{\}\.\,\!\@\#\$\%\^\&\*]+$/,
      
      // Сообщения с повторяющимися паттернами
      /(.{3,})\1{3,}/
    ];

    return automatedPatterns.some(pattern => pattern.test(text));
  }

  // Получение типа пользователя
  getUserType(userId, message) {
    // Проверяем, является ли пользователь админом
    const adminChatIds = config.admin.chatIds || [];
    if (adminChatIds.includes(parseInt(userId))) {
      return 'admin';
    }

    // Проверяем возраст аккаунта
    const user = message?.from;
    if (user) {
      const accountAge = Date.now() - (user.id * 1000);
      const daysOld = accountAge / (1000 * 60 * 60 * 24);
      
      if (daysOld < 7) {
        return 'newUser';
      }
    }

    return 'normal';
  }

  // Получение активности пользователя
  getUserActivity(userId) {
    if (!this.userActivity.has(userId)) {
      this.userActivity.set(userId, []);
    }
    return this.userActivity.get(userId);
  }

  // Обновление активности пользователя
  updateUserActivity(userId, timestamp) {
    const activity = this.getUserActivity(userId);
    activity.push(timestamp);
    
    // Ограничиваем историю до последних 1000 сообщений
    if (activity.length > 1000) {
      activity.splice(0, activity.length - 1000);
    }
  }

  // Отметка подозрительной активности
  markSuspiciousActivity(userId, reason) {
    this.suspiciousUsers.add(userId);
    
    // Если подозрительная активность превышает порог, блокируем пользователя
    const suspiciousCount = this.getSuspiciousActivityCount(userId);
    if (suspiciousCount >= this.config.blocking.suspiciousThreshold) {
      this.blockUser(userId, reason);
    }
    
    logger.warn('🚨 Suspicious activity detected:', { userId, reason });
  }

  // Получение количества подозрительных действий
  getSuspiciousActivityCount(userId) {
    // В реальной реализации здесь будет подсчет из базы данных
    return this.suspiciousUsers.has(userId) ? 1 : 0;
  }

  // Блокировка пользователя
  blockUser(userId, reason) {
    this.blockedUsers.add(userId);
    
    // Автоматическая разблокировка через указанное время
    if (this.config.blocking.autoUnblock) {
      setTimeout(() => {
        this.unblockUser(userId);
      }, this.config.blocking.blockDuration);
    }
    
    logger.error('🚫 User blocked:', { userId, reason });
    
    // Уведомляем админов
    this.notifyAdminsAboutBlockedUser(userId, reason);
  }

  // Разблокировка пользователя
  unblockUser(userId) {
    this.blockedUsers.delete(userId);
    this.suspiciousUsers.delete(userId);
    logger.info('✅ User unblocked:', { userId });
  }

  // Уведомление админов о заблокированном пользователе
  notifyAdminsAboutBlockedUser(userId, reason) {
    const adminChatIds = config.admin.chatIds || [];
    
    const message = `🚫 Пользователь заблокирован за спам:
👤 ID: ${userId}
🚨 Причина: ${reason}
⏰ Время: ${new Date().toLocaleString('ru-RU')}`;

    // В реальной реализации здесь будет отправка через TelegramService
    logger.info('📢 Admin notification:', message);
  }

  // Очистка старых данных
  cleanupOldData() {
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    // Очищаем старую активность
    for (const [userId, activity] of this.userActivity.entries()) {
      const filteredActivity = activity.filter(time => time > dayAgo);
      if (filteredActivity.length === 0) {
        this.userActivity.delete(userId);
      } else {
        this.userActivity.set(userId, filteredActivity);
      }
    }

    logger.debug('🧹 Cleaned up old activity data');
  }

  // Получение статистики защиты
  getStats() {
    return {
      totalUsers: this.userActivity.size,
      suspiciousUsers: this.suspiciousUsers.size,
      blockedUsers: this.blockedUsers.size,
      config: this.config
    };
  }
}

// Создаем экземпляр защиты
const antiSpam = new AntiSpamProtection();

// Middleware функция
function antiSpamMiddleware(req, res, next) {
  // Пропускаем не-Telegram запросы
  if (!req.body || (!req.body.message && !req.body.callback_query)) {
    return next();
  }

  const message = req.body.message || req.body.callback_query?.message;
  if (!message) {
    return next();
  }

  // Проверяем сообщение
  const checkResult = antiSpam.checkMessage(message);
  
  if (!checkResult.allowed) {
    const chatId = message.chat?.id;
    const userId = message.from?.id;
    
    logger.warn('🚫 Message blocked by anti-spam:', {
      chatId,
      userId,
      reason: checkResult.reason,
      retryAfter: checkResult.retryAfter
    });

    // Возвращаем сообщение об ошибке
    return res.status(200).json({
      error: 'Message blocked',
      reason: checkResult.reason,
      message: getBlockMessage(checkResult.reason),
      retryAfter: checkResult.retryAfter
    });
  }

  next();
}

// Получение сообщения о блокировке
function getBlockMessage(reason) {
  const messages = {
    'rate_limit_minute': 'Слишком много сообщений в минуту. Подождите немного.',
    'rate_limit_hour': 'Слишком много сообщений в час. Подождите час.',
    'rate_limit_day': 'Слишком много сообщений в день. Попробуйте завтра.',
    'message_too_long': 'Сообщение слишком длинное. Сократите его.',
    'too_many_emojis': 'Слишком много эмодзи в сообщении.',
    'too_many_links': 'Слишком много ссылок в сообщении.',
    'spam_pattern_repeated_characters': 'Обнаружен спам-паттерн: повторяющиеся символы.',
    'spam_pattern_excessive_caps': 'Обнаружен спам-паттерн: много заглавных букв.',
    'spam_pattern_excessive_symbols': 'Обнаружен спам-паттерн: много спецсимволов.',
    'spam_pattern_spam_keywords': 'Обнаружены спам-ключевые слова.',
    'spam_pattern_excessive_numbers': 'Обнаружен спам-паттерн: много цифр.',
    'spam_pattern_excessive_spaces': 'Обнаружен спам-паттерн: много пробелов.',
    'new_account_spam': 'Новый аккаунт отправляет слишком много сообщений.',
    'automated_message': 'Обнаружено автоматизированное сообщение.',
    'user_blocked': 'Ваш аккаунт заблокирован за нарушение правил.',
    'invalid_message': 'Некорректное сообщение.'
  };

  return messages[reason] || 'Сообщение заблокировано системой защиты от спама.';
}

module.exports = {
  antiSpamMiddleware,
  antiSpam,
  getBlockMessage
}; 