const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
const config = require('../../config');

// Основной rate limiter для всех запросов
const generalRateLimiter = rateLimit({
  windowMs: config.rateLimiting?.windowMs || config.rateLimit?.windowMs || 60 * 1000,
  max: config.rateLimiting?.maxRequests || config.rateLimit?.max || 30,
  
  // Определяем ключ для группировки запросов
  keyGenerator: (req) => {
    // Для Telegram webhook используем chat_id
    const chatId = extractChatId(req.body);
    if (chatId) {
      return `telegram_${chatId}`;
    }
    
    // Fallback на IP
    return req.ip;
  },

  // Пропускаем успешные запросы
  skipSuccessfulRequests: false,
  
  // Пропускаем неудачные запросы
  skipFailedRequests: false,

  // Стандартные заголовки rate limiting
  standardHeaders: true,
  legacyHeaders: false,

  // Обработчик превышения лимита
  handler: (req, res) => {
    const chatId = extractChatId(req.body);
    const userInfo = extractUserInfo(req.body);
    
    logger.warn('🚫 Rate limit exceeded:', { 
      chatId, 
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userInfo
    });

    // Для Telegram возвращаем 200 чтобы не вызвать повторную отправку
    res.status(200).json({ 
      error: 'Rate limit exceeded',
      message: 'Слишком много запросов. Подождите немного.',
      retryAfter: Math.ceil((config.rateLimiting?.windowMs || config.rateLimit?.windowMs || 60 * 1000) / 1000)
    });
  },

  // Кастомное сообщение
  message: {
    error: 'Too Many Requests',
    message: 'Вы отправляете сообщения слишком часто. Подождите немного.'
  }
});

// Строгий rate limiter для админских команд
const adminRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 15, // 15 админских команд в минуту
  
  keyGenerator: (req) => {
    const chatId = extractChatId(req.body);
    return chatId ? `admin_${chatId}` : req.ip;
  },

  // Применяется только к админским запросам
  skip: (req) => {
    return !isAdminRequest(req.body);
  },

  handler: (req, res) => {
    const chatId = extractChatId(req.body);
    
    logger.warn('🚫 Admin rate limit exceeded:', { chatId });

    res.status(200).json({
      error: 'Admin rate limit exceeded',
      message: 'Слишком много админских команд. Подождите минуту.',
      retryAfter: 60
    });
  }
});

// Агрессивный rate limiter для подозрительной активности  
const suspiciousActivityLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 минут
  max: 3, // Только 3 подозрительных запроса за 5 минут
  
  keyGenerator: (req) => {
    const chatId = extractChatId(req.body);
    return chatId ? `suspicious_${chatId}` : `suspicious_${req.ip}`;
  },

  // Применяется только к подозрительным запросам
  skip: (req) => {
    return !isSuspiciousActivity(req.body);
  },

  handler: (req, res) => {
    const chatId = extractChatId(req.body);
    const userInfo = extractUserInfo(req.body);
    
    logger.error('🚨 Suspicious activity rate limit exceeded:', { 
      chatId,
      userInfo,
      body: req.body 
    });

    // Уведомляем админов о подозрительной активности
    notifyAdminsAboutSuspiciousActivity(chatId, userInfo, req.body);

    res.status(200).json({
      error: 'Suspicious activity detected',
      message: 'Обнаружена подозрительная активность. Доступ ограничен.',
      retryAfter: 300
    });
  }
});

// Динамический rate limiter в зависимости от типа пользователя
const dynamicRateLimiter = (req, res, next) => {
  const chatId = extractChatId(req.body);
  const isAdmin = checkIsAdmin(chatId);
  const userType = getUserType(req.body);

  // Для админов - более мягкие ограничения
  if (isAdmin) {
    return adminRateLimiter(req, res, next);
  }

  // Для подозрительных пользователей - строгие ограничения  
  if (userType === 'suspicious') {
    return suspiciousActivityLimiter(req, res, next);
  }

  // Для новых пользователей - чуть более строгие ограничения
  if (userType === 'new') {
    const newUserLimiter = rateLimit({
      windowMs: config.rateLimiting?.windowMs || config.rateLimit?.windowMs || 60 * 1000,
      max: Math.floor((config.rateLimiting?.maxRequests || config.rateLimit?.max || 30) * 0.7), // 70% от обычного лимита
      keyGenerator: (req) => `new_${extractChatId(req.body)}`,
      handler: generalRateLimiter.handler
    });
    
    return newUserLimiter(req, res, next);
  }

  // Обычные пользователи
  return generalRateLimiter(req, res, next);
};

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

function extractChatId(body) {
  return body?.message?.chat?.id || 
         body?.callback_query?.message?.chat?.id ||
         body?.edited_message?.chat?.id ||
         null;
}

function extractUserInfo(body) {
  const user = body?.message?.from || 
               body?.callback_query?.from ||
               body?.edited_message?.from;
               
  return user ? {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username
  } : null;
}

function isAdminRequest(body) {
  const text = body?.message?.text || '';
  const callbackData = body?.callback_query?.data || '';
  
  return text.startsWith('/admin') || 
         text.startsWith('/stats') || 
         text.startsWith('/broadcast') ||
         callbackData.startsWith('admin_');
}

function isSuspiciousActivity(body) {
  const text = body?.message?.text || '';
  
  // Слишком длинные сообщения
  if (text.length > 1000) return true;
  
  // Спам-паттерны
  const spamPatterns = [
    /(.)\1{10,}/, // Повторяющиеся символы
    /(https?:\/\/[^\s]+){3,}/, // Много ссылок
    /[A-Z]{20,}/, // Много заглавных букв
    /[!@#$%^&*()]{10,}/ // Много спецсимволов
  ];
  
  return spamPatterns.some(pattern => pattern.test(text));
}

function checkIsAdmin(chatId) {
  if (!chatId) return false;
  
  const adminChatIds = config.admin.chatIds || [];
  return adminChatIds.includes(parseInt(chatId));
}

function getUserType(body) {
  const user = body?.message?.from || body?.callback_query?.from;
  if (!user) return 'unknown';
  
  // Проверяем дату регистрации (примерно)
  const registrationDate = new Date(user.id * 1000); // Telegram ID содержит timestamp
  const daysSinceRegistration = (Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceRegistration < 7) {
    return 'new';
  }
  
  return 'regular';
}

function notifyAdminsAboutSuspiciousActivity(chatId, userInfo, body) {
  // В реальности здесь будет интеграция с TelegramService
  logger.error('🚨 Suspicious activity detected:', {
    chatId,
    userInfo,
    body: JSON.stringify(body).substring(0, 500)
  });
}

// Экспортируем основной rate limiter
module.exports = dynamicRateLimiter; 