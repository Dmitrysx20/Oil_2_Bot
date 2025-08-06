const axios = require('axios');
const config = require('../../config');
const logger = require('../utils/logger');

class TelegramService {
  constructor() {
    this.apiUrl = config.telegram.apiUrl;
    this.botToken = config.telegram.botToken;
    this.axios = axios.create({
      baseURL: `${this.apiUrl}${this.botToken}/`,
      timeout: 10000
    });
  }

  async sendMessage(chatId, text, keyboard = null) {
    try {
      const payload = {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      };

      if (keyboard) {
        payload.reply_markup = {
          inline_keyboard: keyboard
        };
      }

      const response = await this.axios.post('sendMessage', payload);
      logger.info('Message sent:', { chatId, messageLength: text.length });
      return response.data;

    } catch (error) {
      logger.error('Send message error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendResponse(response) {
    try {
      const { chatId, message, keyboard } = response;
      
      if (!chatId || !message) {
        logger.warn('Invalid response format:', response);
        return;
      }

      await this.sendMessage(chatId, message, keyboard);

    } catch (error) {
      logger.error('Send response error:', error);
    }
  }

  async answerCallbackQuery(queryId, text) {
    try {
      await this.axios.post('answerCallbackQuery', {
        callback_query_id: queryId,
        text: text
      });
    } catch (error) {
      logger.error('Answer callback error:', error);
    }
  }
}

module.exports = TelegramService; 