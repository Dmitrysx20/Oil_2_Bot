// Обёртка над твоим OilSearchService с единым интерфейсом
const OilSearchService = require('../OilSearchService');

class OilSearchAdapter {
  constructor() {
    this.svc = new OilSearchService();
  }

  /**
   * Пытаемся ответить как «масло».
   * Возвращаем { ok: true, message } если нашли, иначе { ok: false }.
   */
  async tryAnswer(text, chatId) {
    const q = (text || '').toLowerCase().trim();
    if (!q) return { ok: false };

    // Если у тебя есть метод типа searchDirectOil — используем его
    const res = await this.svc.searchDirectOil({
      normalizedOilName: q,
      chatId
    });

    if (res && res.message) return { ok: true, message: res.message };
    return { ok: false };
  }
}

module.exports = OilSearchAdapter;

