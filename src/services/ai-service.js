const OpenAI = require('openai');
const { cleanAIResponse, formatForTelegram } = require('../utils/text-cleaner');

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

ВАЖНО: НЕ используй хештеги (###, ##, #, ####) в ответе. Пиши простым текстом с эмодзи.
НЕ используй markdown-форматирование. Используй обычный текст.

Ответ должен быть дружелюбным и полезным.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Ты эксперт по ароматерапии и эфирным маслам. Даешь научно обоснованные рекомендации. НЕ используй хештеги или markdown в ответах. Пиши простым текстом с эмодзи."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const rawResponse = response.choices[0].message.content;
      return cleanAIResponse(rawResponse);
    } catch (error) {
      console.error('Error getting mood recommendation:', error);
      return `🌿 Рекомендации для настроения: "${mood}"

К сожалению, сейчас не могу дать персональные рекомендации. Попробуйте:

• Лаванда - для расслабления и спокойствия
• Мята - для энергии и концентрации  
• Лимон - для поднятия настроения
• Эвкалипт - для ясности ума

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

ВАЖНО: НЕ используй хештеги (###, ##, #, ####) в ответе. Пиши простым текстом с эмодзи.
НЕ используй markdown-форматирование. Используй обычный текст.

Ответ должен быть дружелюбным и вдохновляющим.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Ты эксперт по музыке для релаксации и ароматерапии. НЕ используй хештеги или markdown в ответах. Пиши простым текстом с эмодзи."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      });

      const rawResponse = response.choices[0].message.content;
      return cleanAIResponse(rawResponse);
    } catch (error) {
      console.error('Error getting music recommendation:', error);
      return `🎵 Музыкальные рекомендации

Вот несколько отличных вариантов для расслабления:

🎧 Классическая музыка:
• Debussy - "Clair de Lune"
• Chopin - "Nocturnes"

🎧 Ambient/Электроника:
• Brian Eno - "Music for Airports"
• Tycho - "Dive"

🎧 Природные звуки:
• Звуки дождя
• Океанские волны
• Лесные птицы

💡 Включите любимую музыку и наслаждайтесь ароматерапией!`;
    }
  }

  async getHealthRecommendation(issue, oils, keywords = []) {
    try {
      const oilsText = oils.map(oil => 
        `${oil.oil_name}: ${oil.physical_effect}`
      ).join('\n');

      const prompt = `Ты эксперт по ароматерапии. Пользователь описывает проблему: "${issue}".
      
Доступные масла:
${oilsText}

Ключевые слова: ${keywords.join(', ')}

Дай научно обоснованные рекомендации по использованию эфирных масел. Включи:
- Конкретные масла для решения проблемы
- Способы применения с точными дозировками
- Меры предосторожности
- Когда обратиться к врачу

ВАЖНО: НЕ используй хештеги (###, ##, #, ####) в ответе. Пиши простым текстом с эмодзи.
НЕ используй markdown-форматирование. Используй обычный текст.

Ответ должен быть практичным и безопасным.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Ты эксперт по ароматерапии. Даешь безопасные и практичные рекомендации. НЕ используй хештеги или markdown в ответах. Пиши простым текстом с эмодзи."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.6
      });

      const rawResponse = response.choices[0].message.content;
      return cleanAIResponse(rawResponse);
    } catch (error) {
      console.error('Error getting health recommendation:', error);
      return `🌿 Рекомендации для: "${issue}"

К сожалению, сейчас не могу дать персональные рекомендации. 

⚠️ Важно: При серьезных симптомах обязательно обратитесь к врачу!

💡 Попробуйте популярные масла:
• Эвкалипт - для дыхательных проблем
• Лаванда - для расслабления
• Мята - для головной боли
• Чайное дерево - для антисептического эффекта`;
    }
  }
}

module.exports = AIService; 