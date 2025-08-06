const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async getMoodRecommendation(mood, oils, keywords = []) {
    try {
      const oilsText = oils.map(oil => 
        `${oil.oil_name}: ${oil.emotional_effect}`
      ).join('\n');

      const prompt = `Ты эксперт по ароматерапии. Пользователь ищет эфирные масла для настроения: "${mood}".
      
Доступные масла:
${oilsText}

Ключевые слова: ${keywords.join(', ')}

Дай научно обоснованные рекомендации по выбору 2-3 масел. Включи:
- Почему именно эти масла подходят
- Как их использовать
- Меры предосторожности
- Научные исследования (если есть)

Ответ должен быть дружелюбным и полезным.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Ты эксперт по ароматерапии и эфирным маслам. Даешь научно обоснованные рекомендации."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      return response.choices[0].message.content;
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
      const prompt = `Пользователь просит музыкальные рекомендации: "${request.originalText}"

Дай 3-5 рекомендаций музыки, которая подходит для ароматерапии и расслабления. Включи:
- Названия треков/альбомов
- Исполнителей
- Жанры
- Почему эта музыка подходит

Ответ должен быть дружелюбным и вдохновляющим.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Ты эксперт по музыке для релаксации и ароматерапии."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      });

      return response.choices[0].message.content;
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

module.exports = AIService; 