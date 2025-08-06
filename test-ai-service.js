class TestAIService {
  constructor() {
    this.moodRecommendations = {
      'энергия': {
        oils: ['Мята перечная', 'Розмарин', 'Лимон'],
        description: 'Для повышения энергии и концентрации',
        advice: 'Используйте утром для бодрости или днем для концентрации'
      },
      'стресс': {
        oils: ['Лаванда', 'Ромашка', 'Иланг-иланг'],
        description: 'Для расслабления и снятия стресса',
        advice: 'Используйте вечером для расслабления или при необходимости'
      },
      'сон': {
        oils: ['Лаванда', 'Ромашка', 'Ветивер'],
        description: 'Для улучшения качества сна',
        advice: 'Используйте за час до сна для расслабления'
      },
      'концентрация': {
        oils: ['Розмарин', 'Мята', 'Лимон'],
        description: 'Для улучшения концентрации и памяти',
        advice: 'Используйте во время работы или учебы'
      }
    };

    this.musicRecommendations = {
      'расслабление': [
        'Brian Eno - "Music for Airports"',
        'Debussy - "Clair de Lune"',
        'Природные звуки дождя'
      ],
      'энергия': [
        'Tycho - "Dive"',
        'Classical music for focus',
        'Ambient electronic'
      ],
      'медитация': [
        'Tibetan singing bowls',
        'Forest sounds',
        'Ocean waves'
      ]
    };
  }

  async getMoodRecommendation(mood, oils, keywords = []) {
    try {
      // Имитируем задержку API
      await new Promise(resolve => setTimeout(resolve, 100));

      const normalizedMood = mood.toLowerCase();
      let recommendation = null;

      // Ищем подходящую рекомендацию
      for (const [key, value] of Object.entries(this.moodRecommendations)) {
        if (normalizedMood.includes(key)) {
          recommendation = value;
          break;
        }
      }

      if (!recommendation) {
        recommendation = this.moodRecommendations['энергия']; // дефолтная рекомендация
      }

      return `🌿 **Рекомендации для настроения: "${mood}"**

${recommendation.description}

**Рекомендуемые масла:**
${recommendation.oils.map(oil => `• ${oil}`).join('\n')}

**Совет по применению:**
${recommendation.advice}

**Научное обоснование:**
Эфирные масла воздействуют на лимбическую систему мозга, которая отвечает за эмоции и память. Ароматерапия помогает регулировать настроение и снижать уровень стресса.

**Меры предосторожности:**
• Разведите масло в базовом масле перед применением
• Проведите тест на аллергию
• Не используйте при беременности без консультации врача
• Храните в недоступном для детей месте

💡 **Дополнительные советы:**
• Используйте диффузор для ароматерапии
• Применяйте массаж с маслами
• Создайте расслабляющую атмосферу

😊 Наслаждайтесь ароматерапией!`;
    } catch (error) {
      console.error('Error getting mood recommendation:', error);
      return `🌿 **Рекомендации для настроения: "${mood}"**

К сожалению, сейчас не могу дать персональные рекомендации. Попробуйте:

• **Лаванда** - для расслабления и спокойствия
• **Мята** - для энергии и концентрации  
• **Лимон** - для поднятия настроения
• **Эвкалипт** - для ясности ума

💡 Напишите точнее, что вас беспокоит, и я дам более конкретные советы!`;
    }
  }

  async getMusicRecommendation(request) {
    try {
      // Имитируем задержку API
      await new Promise(resolve => setTimeout(resolve, 100));

      const text = request.originalText.toLowerCase();
      let category = 'расслабление'; // дефолтная категория

      if (text.includes('энергия') || text.includes('бодрость')) {
        category = 'энергия';
      } else if (text.includes('медитация') || text.includes('спокойствие')) {
        category = 'медитация';
      }

      const recommendations = this.musicRecommendations[category];

      return `🎵 **Музыкальные рекомендации**

Вот несколько отличных вариантов для ${category}:

${recommendations.map(rec => `🎧 ${rec}`).join('\n')}

**Почему эта музыка подходит:**
• Помогает создать нужную атмосферу
• Синхронизируется с ароматерапией
• Улучшает общий эффект

**Советы по использованию:**
• Включите музыку на фоне
• Используйте вместе с эфирными маслами
• Создайте расслабляющую обстановку

💡 Включите любимую музыку и наслаждайтесь ароматерапией!`;
    } catch (error) {
      console.error('Error getting music recommendation:', error);
      return `🎵 **Музыкальные рекомендации**

Вот несколько отличных вариантов для расслабления:

🎧 **Классическая музыка:**
• Debussy - "Clair de Lune"
• Chopin - "Nocturnes"

🎧 **Ambient/Электроника:**
• Brian Eno - "Music for Airports"
• Tycho - "Dive"

🎧 **Природные звуки:**
• Звуки дождя
• Океанские волны
• Лесные птицы

💡 Включите любимую музыку и наслаждайтесь ароматерапией!`;
    }
  }
}

module.exports = TestAIService; 