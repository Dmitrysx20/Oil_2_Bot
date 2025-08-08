// Обёртка над твоим AIService, чтобы унифицировать вызов
const AIService = require('../AIService');

class AIAdapter {
  constructor() {
    this.svc = new AIService();
  }

  /**
   * Пытаемся дать AI-рекомендацию. На вход — свободный текст.
   * Возвращаем { ok: true, message } или { ok: false }.
   */
  async tryRecommend({ chatId, text }) {
    const q = (text || '').trim();
    if (!q) return { ok: false };

    const res = await this.svc.getBasicRecommendation({
      keywords: [], // при желании можешь распарсить ключевые и передать
      chatId,
      userQuery: q
    });

    if (!res) return { ok: false };
    if (typeof res === 'string') return { ok: true, message: res };
    if (res.message) return { ok: true, message: res.message };
    return { ok: false };
  }

  /**
   * Базовые рекомендации - прокси к AIService
   */
  async getBasicRecommendation(params) {
    return await this.svc.getBasicRecommendation(params);
  }

  /**
   * Медицинские рекомендации - прокси к AIService
   */
  async getMedicalRecommendation(params) {
    return await this.svc.getMedicalRecommendation(params);
  }
}

module.exports = AIAdapter;
