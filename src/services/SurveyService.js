const logger = require('../utils/logger');
const axios = require('axios');
const config = require('../../config');

class SurveyService {
  constructor() {
    this.surveys = new Map();
    this.suggestions = new Map();
    this.initSurveys();
  }

  initSurveys() {
    // Утренний опросник (9:00)
    this.surveys.set('morning_mood', {
      id: 'morning_mood',
      title: '🌅 Как ваше утреннее настроение?',
      time: '09:00',
      timezone: 'Europe/Moscow',
      questions: [
        {
          id: 'energy_level',
          text: '⚡ Какой у вас уровень энергии?',
          options: [
            { text: '😴 Сонный', value: 'sleepy', oils: ['розмарин', 'лимон', 'мята'] },
            { text: '😊 Бодрый', value: 'energetic', oils: ['апельсин', 'грейпфрут', 'бергамот'] },
            { text: '😌 Спокойный', value: 'calm', oils: ['лаванда', 'ромашка', 'иланг-иланг'] },
            { text: '😤 Напряженный', value: 'stressed', oils: ['лаванда', 'ветивер', 'бергамот'] }
          ]
        },
        {
          id: 'day_plans',
          text: '📋 Что планируете сегодня?',
          options: [
            { text: '💼 Работа/учеба', value: 'work', oils: ['розмарин', 'лимон', 'базилик'] },
            { text: '🏃‍♀️ Спорт/активность', value: 'sport', oils: ['эвкалипт', 'мята', 'пихта'] },
            { text: '😴 Отдых/релакс', value: 'rest', oils: ['лаванда', 'ромашка', 'сандал'] },
            { text: '🎨 Творчество', value: 'creative', oils: ['бергамот', 'иланг-иланг', 'пачули'] }
          ]
        }
      ]
    });

    // Вечерний опросник (20:00)
    this.surveys.set('evening_mood', {
      id: 'evening_mood',
      title: '🌙 Как прошел ваш день?',
      time: '20:00',
      timezone: 'Europe/Moscow',
      questions: [
        {
          id: 'day_experience',
          text: '📊 Как вы оцениваете прошедший день?',
          options: [
            { text: '😊 Отлично!', value: 'great', oils: ['лаванда', 'ромашка', 'сандал'] },
            { text: '😐 Нормально', value: 'ok', oils: ['бергамот', 'иланг-иланг', 'лаванда'] },
            { text: '😔 Устал', value: 'tired', oils: ['лаванда', 'ветивер', 'ромашка'] },
            { text: '😤 Стресс', value: 'stressed', oils: ['лаванда', 'бергамот', 'иланг-иланг'] }
          ]
        },
        {
          id: 'evening_plans',
          text: '🌙 Что планируете на вечер?',
          options: [
            { text: '😴 Ранний сон', value: 'early_sleep', oils: ['лаванда', 'ромашка', 'валериана'] },
            { text: '📚 Чтение/учеба', value: 'reading', oils: ['розмарин', 'лимон', 'базилик'] },
            { text: '🎵 Музыка/медитация', value: 'meditation', oils: ['сандал', 'ладан', 'иланг-иланг'] },
            { text: '💆‍♀️ Массаж/ванна', value: 'self_care', oils: ['лаванда', 'ромашка', 'бергамот'] }
          ]
        }
      ]
    });

    // Еженедельный опросник (воскресенье 18:00)
    this.surveys.set('weekly_review', {
      id: 'weekly_review',
      title: '📅 Недельный обзор ароматерапии',
      time: '18:00',
      day: 'sunday',
      timezone: 'Europe/Moscow',
      questions: [
        {
          id: 'weekly_oils',
          text: '🌿 Какие масла использовали на этой неделе?',
          options: [
            { text: 'Лаванда', value: 'lavender' },
            { text: 'Мята', value: 'mint' },
            { text: 'Лимон', value: 'lemon' },
            { text: 'Розмарин', value: 'rosemary' },
            { text: 'Другие', value: 'other' },
            { text: 'Не использовал', value: 'none' }
          ]
        },
        {
          id: 'weekly_effect',
          text: '✨ Какой эффект заметили?',
          options: [
            { text: '😴 Лучше сплю', value: 'better_sleep' },
            { text: '⚡ Больше энергии', value: 'more_energy' },
            { text: '😌 Меньше стресса', value: 'less_stress' },
            { text: '🤔 Пока не заметил', value: 'no_effect' }
          ]
        }
      ]
    });
  }

  async sendSurvey(chatId, surveyId) {
    try {
      const survey = this.surveys.get(surveyId);
      if (!survey) {
        logger.error('Survey not found:', surveyId);
        return;
      }

      logger.info(`📊 Sending survey ${surveyId} to ${chatId}`);

      const message = this.formatSurveyMessage(survey);
      const keyboard = this.createSurveyKeyboard(survey);

      await this.sendTelegramMessage(chatId, message, keyboard);

      return {
        success: true,
        surveyId: surveyId,
        chatId: chatId
      };

    } catch (error) {
      logger.error('Error sending survey:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  formatSurveyMessage(survey) {
    let message = `${survey.title}\n\n`;
    
    survey.questions.forEach((question, index) => {
      message += `${index + 1}. ${question.text}\n`;
    });

    message += `\n💡 Выберите ответы кнопками ниже. Это поможет мне давать более точные рекомендации!`;
    
    return message;
  }

  createSurveyKeyboard(survey) {
    const keyboard = [];
    
    survey.questions.forEach((question, qIndex) => {
      const row = [];
      question.options.forEach((option, oIndex) => {
        row.push({
          text: option.text,
          callback_data: `survey_${survey.id}_q${qIndex}_${option.value}`
        });
      });
      keyboard.push(row);
    });

    // Добавляем кнопку "Пропустить"
    keyboard.push([{
      text: '⏭️ Пропустить опрос',
      callback_data: `survey_${survey.id}_skip`
    }]);

    return { inline_keyboard: keyboard };
  }

  async handleSurveyResponse(callbackData) {
    try {
      // Парсим callback_data: survey_morning_mood_q0_energetic
      const parts = callbackData.split('_');
      const surveyId = parts[1];
      const questionIndex = parseInt(parts[2].substring(1));
      const answer = parts[3];

      if (answer === 'skip') {
        return this.handleSurveySkip(surveyId);
      }

      const survey = this.surveys.get(surveyId);
      if (!survey) {
        logger.error('Survey not found for response:', surveyId);
        return;
      }

      const question = survey.questions[questionIndex];
      const selectedOption = question.options.find(opt => opt.value === answer);

      logger.info(`📊 Survey response: ${surveyId}, question ${questionIndex}, answer: ${answer}`);

      // Формируем рекомендацию на основе ответа
      const recommendation = this.generateRecommendation(surveyId, questionIndex, selectedOption);

      return {
        success: true,
        surveyId: surveyId,
        questionIndex: questionIndex,
        answer: answer,
        recommendation: recommendation
      };

    } catch (error) {
      logger.error('Error handling survey response:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateRecommendation(surveyId, questionIndex, selectedOption) {
    let recommendation = '';

    if (surveyId === 'morning_mood') {
      if (questionIndex === 0) { // energy_level
        switch (selectedOption.value) {
          case 'sleepy':
            recommendation = `🌅 **Утренний заряд энергии!**

Для бодрости попробуйте:
🌿 **Розмарин** - улучшает концентрацию
🍋 **Лимон** - освежает и бодрит
🌱 **Мята** - стимулирует умственную активность

💡 **Совет:** Смешайте 2 капли лимона + 1 каплю мяты в аромалампе`;
            break;
          case 'energetic':
            recommendation = `⚡ **Отличное настроение!**

Поддержите энергию:
🍊 **Апельсин** - поднимает настроение
🍇 **Грейпфрут** - освежает и бодрит
🍋 **Бергамот** - снимает напряжение

💡 **Совет:** Добавьте 3 капли апельсина в утренний душ`;
            break;
          case 'calm':
            recommendation = `😌 **Спокойное утро - это хорошо!**

Для гармонии:
🌿 **Лаванда** - успокаивает и расслабляет
🌼 **Ромашка** - мягкое расслабляющее действие
🌸 **Иланг-иланг** - снимает напряжение

💡 **Совет:** Начните день с медитации под аромат лаванды`;
            break;
          case 'stressed':
            recommendation = `😤 **Понимаю, стресс с утра - это тяжело**

Для снятия напряжения:
🌿 **Лаванда** - классическое успокаивающее
🌱 **Ветивер** - глубокое расслабление
🍋 **Бергамот** - снимает стресс и тревогу

💡 **Совет:** Сделайте глубокий вдох с 2 каплями лаванды`;
            break;
        }
      }
    } else if (surveyId === 'evening_mood') {
      if (questionIndex === 0) { // day_experience
        switch (selectedOption.value) {
          case 'great':
            recommendation = `😊 **Отличный день!**

Для вечернего релакса:
🌿 **Лаванда** - мягкое успокоение
🌼 **Ромашка** - расслабляющее действие
🌲 **Сандал** - глубокое спокойствие

💡 **Совет:** Примите ванну с 5 каплями лаванды`;
            break;
          case 'ok':
            recommendation = `😐 **Нормальный день - это тоже хорошо!**

Для вечернего настроения:
🍋 **Бергамот** - снимает напряжение
🌸 **Иланг-иланг** - расслабляет
🌿 **Лаванда** - успокаивает

💡 **Совет:** Зажгите аромалампу с бергамотом`;
            break;
          case 'tired':
            recommendation = `😔 **Понимаю, усталость накапливается**

Для восстановления:
🌿 **Лаванда** - помогает расслабиться
🌱 **Ветивер** - глубокое расслабление
🌼 **Ромашка** - мягкое успокоение

💡 **Совет:** Массаж с 3 каплями лаванды в базовом масле`;
            break;
          case 'stressed':
            recommendation = `😤 **Стресс - это серьезно**

Для снятия стресса:
🌿 **Лаванда** - быстрое успокоение
🍋 **Бергамот** - снимает тревогу
🌸 **Иланг-иланг** - расслабляет

💡 **Совет:** Глубокое дыхание с лавандой 5-10 минут`;
            break;
        }
      }
    }

    return recommendation;
  }

  async handleSurveySkip(surveyId) {
    logger.info(`📊 Survey skipped: ${surveyId}`);
    
    return {
      success: true,
      surveyId: surveyId,
      action: 'skipped',
      message: `😊 Хорошо, пропускаем опрос!

🌿 Я всё равно готов помочь с ароматерапией. Просто спросите про любое масло или опишите своё настроение!`
    };
  }

  async sendTelegramMessage(chatId, message, keyboard = null) {
    try {
      const botToken = config.telegram.botToken;
      if (!botToken) {
        logger.error('Telegram bot token not found');
        return;
      }

      const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      };

      if (keyboard) {
        payload.reply_markup = keyboard;
      }

      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        payload
      );

      logger.info('✅ Survey message sent successfully');
      return response.data;

    } catch (error) {
      logger.error('Error sending survey message:', error);
      throw error;
    }
  }

  // Методы для планировщика
  async sendMorningSurvey(chatId) {
    return this.sendSurvey(chatId, 'morning_mood');
  }

  async sendEveningSurvey(chatId) {
    return this.sendSurvey(chatId, 'evening_mood');
  }

  async sendWeeklySurvey(chatId) {
    return this.sendSurvey(chatId, 'weekly_review');
  }

  // Получение списка активных пользователей (заглушка)
  async getActiveSubscribers() {
    // В реальном приложении здесь будет запрос к базе данных
    return [
      { chatId: 123, userName: 'Test User' }
    ];
  }
}

module.exports = SurveyService; 