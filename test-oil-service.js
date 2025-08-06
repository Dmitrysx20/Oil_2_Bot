const OilDatabase = require('./modules/oil-database');

class TestOilService {
  constructor() {
    this.oilDatabase = new OilDatabase();
  }

  async searchOil(oilName) {
    // Мок данные для тестирования
    const mockOils = [
      {
        oil_name: 'Лаванда',
        description: 'Успокаивающее масло с нежным цветочным ароматом',
        emotional_effect: 'Расслабление, спокойствие, улучшение сна',
        physical_effect: 'Снимает головную боль, улучшает кровообращение',
        applications: 'Ароматерапия, массаж, ванны, ингаляции',
        safety_warning: 'Не использовать при беременности и детям до 6 лет',
        joke: 'Лаванда - лучший друг бессонницы!'
      },
      {
        oil_name: 'Мята перечная',
        description: 'Освежающее масло с ментоловым ароматом',
        emotional_effect: 'Бодрость, концентрация, ясность ума',
        physical_effect: 'Улучшает пищеварение, снимает тошноту',
        applications: 'Ингаляции, массаж, ароматерапия',
        safety_warning: 'Не использовать детям до 6 лет',
        joke: 'Мята - природный энергетик без кофеина!'
      }
    ];

    const normalizedName = this.normalizeOilName(oilName);
    return mockOils.find(oil => 
      oil.oil_name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(oil.oil_name.toLowerCase())
    ) || null;
  }

  async getAllOils() {
    return [
      {
        oil_name: 'Лаванда',
        emotional_effect: 'Расслабление, спокойствие'
      },
      {
        oil_name: 'Мята перечная',
        emotional_effect: 'Бодрость, концентрация'
      }
    ];
  }

  normalizeOilName(name) {
    return name.toLowerCase().trim();
  }

  formatOilInfo(oil) {
    if (!oil) return 'Масло не найдено';

    return `🌿 **${oil.oil_name}**

📝 **Описание:**
${oil.description || 'Описание отсутствует'}

💚 **Эмоциональный эффект:**
${oil.emotional_effect || 'Информация отсутствует'}

💪 **Физический эффект:**
${oil.physical_effect || 'Информация отсутствует'}

🔧 **Применение:**
${oil.applications || 'Информация отсутствует'}

⚠️ **Меры предосторожности:**
${oil.safety_warning || 'Проконсультируйтесь с врачом перед использованием'}

😄 **${oil.joke || 'Улыбнитесь! Эфирные масла - это природная аптека!'}**`;
  }

  getSuggestions(query) {
    const suggestions = [
      'лаванда', 'мята', 'лимон', 'эвкалипт', 'ромашка',
      'чайное дерево', 'розмарин', 'бергамот', 'иланг-иланг'
    ];

    return suggestions.filter(s => 
      s.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }

  formatNotFoundMessage(oilName, suggestions) {
    let message = `❌ **Масло "${oilName}" не найдено**

💡 **Возможно, вы искали:**
`;

    suggestions.forEach(suggestion => {
      message += `• ${suggestion}\n`;
    });

    message += `
🔍 **Попробуйте:**
• Написать название масла точнее
• Использовать другие названия
• Написать "помощь" для получения справки`;

    return message;
  }
}

module.exports = TestOilService; 