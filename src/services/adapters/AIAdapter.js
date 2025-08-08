const AIService = require('../AIService');

class AIAdapter {
  constructor() {
    this.svc = new AIService();
  }
  async tryRecommend({ chatId, text }) {
    const res = await this.svc.getBasicRecommendation({
      keywords: [], chatId, userQuery: text
    });
    if (res && res.message) return { ok: true, message: res.message };
    if (typeof res === 'string') return { ok: true, message: res };
    return { ok: false };
  }
}
module.exports = AIAdapter;
