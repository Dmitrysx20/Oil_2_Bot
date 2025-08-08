// Оборачиваем твой OilSearchService в единый интерфейс
const OilSearchService = require('../OilSearchService');

class OilSearchAdapter {
  constructor() {
    this.svc = new OilSearchService();
  }
  async tryAnswer(text, chatId) {
    // твоя логика: прямой поиск/нормализация
    const res = await this.svc.searchDirectOil({
      normalizedOilName: text.toLowerCase(),
      chatId
    });
    if (res && res.message) return { ok: true, message: res.message };
    return { ok: false };
  }
}
module.exports = OilSearchAdapter;
