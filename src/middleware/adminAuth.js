const config = require('../../config');
const logger = require('../utils/logger');

function adminAuth(req, res, next) {
  // Пропускаем не-Telegram запросы
  if (!req.body || (!req.body.message && !req.body.callback_query)) {
    return next();
  }

  const chatId = extractChatId(req.body);
  
  // Проверяем права администратора
  if (isAdmin(chatId)) {
    req.isAdmin = true;
    req.adminChatId = chatId;
    return next();
  }

  // Для админских команд блокируем доступ
  if (isAdminCommand(req.body)) {
    logger.warn('🚫 Unauthorized admin access attempt:', { chatId });
    
    return res.status(200).json({
      error: 'Access denied',
      message: 'У вас нет прав администратора.'
    });
  }

  // Для обычных запросов пропускаем
  return next();
}

function extractChatId(body) {
  return body?.message?.chat?.id || 
         body?.callback_query?.message?.chat?.id ||
         body?.edited_message?.chat?.id ||
         null;
}

function isAdmin(chatId) {
  if (!chatId) return false;
  
  const adminChatIds = config.admin.chatIds || [];
  return adminChatIds.includes(parseInt(chatId));
}

function isAdminCommand(body) {
  const text = body?.message?.text || '';
  const callbackData = body?.callback_query?.data || '';
  
  return text.startsWith('/admin') || 
         text.startsWith('/stats') || 
         text.startsWith('/broadcast') ||
         callbackData.startsWith('admin_');
}

module.exports = adminAuth; 