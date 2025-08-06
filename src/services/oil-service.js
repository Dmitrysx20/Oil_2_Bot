const OilDatabase = require('../../modules/oil-database');
const { createClient } = require('@supabase/supabase-js');

class OilService {
  constructor() {
    this.oilDatabase = new OilDatabase();
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  async searchOil(oilName) {
    try {
      const normalizedName = this.normalizeOilName(oilName);
      
      const { data, error } = await this.supabase
        .from('oils')
        .select('*')
        .ilike('oil_name', `%${normalizedName}%`)
        .limit(1);

      if (error) {
        console.error('Supabase error:', error);
        return null;
      }

      if (data && data.length > 0) {
        return data[0];
      }

      return null;
    } catch (error) {
      console.error('Error searching oil:', error);
      return null;
    }
  }

  async getAllOils() {
    try {
      const { data, error } = await this.supabase
        .from('oils')
        .select('*');

      if (error) {
        console.error('Supabase error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting all oils:', error);
      return [];
    }
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

module.exports = OilService; 