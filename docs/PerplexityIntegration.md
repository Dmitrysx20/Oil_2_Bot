# Perplexity API Integration - Интеграция с Perplexity

## Обзор

Проект интегрирован с **Perplexity API** для предоставления умных рекомендаций по ароматерапии. Perplexity используется как основной источник AI-рекомендаций, с fallback на OpenAI и локальные заглушки.

## 🔧 Конфигурация

### Переменные окружения

```bash
# Perplexity API
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# OpenAI API (fallback)
OPENAI_API_KEY=your_openai_api_key_here
```

### Конфигурация в config/index.js

```javascript
perplexity: {
  apiKey: process.env.PERPLEXITY_API_KEY,
  model: 'llama-3.1-sonar-small-128k-online'
},
openai: {
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini',
  maxTokens: 2000
}
```

## 🚀 Использование

### Инициализация

```javascript
const AIService = require('./src/services/AIService');
const aiService = new AIService();
```

### Базовые рекомендации

```javascript
const result = await aiService.getBasicRecommendation({
  keywords: ['энергия', 'бодрость'],
  chatId: 123456789,
  userQuery: 'Нужна энергия'
});

console.log(result.action); // 'ai_recommendation'
console.log(result.aiData.source); // 'perplexity' или 'fallback'
```

### Медицинские рекомендации

```javascript
const result = await aiService.getMedicalRecommendation({
  medicalInfo: { category: 'головная_боль' },
  chatId: 123456789,
  userQuery: 'Болит голова'
});

console.log(result.action); // 'ai_medical_recommendation'
console.log(result.aiData.source); // 'perplexity' или 'fallback'
```

### Прямой вызов Perplexity

```javascript
const response = await aiService.getPerplexityRecommendation(
  'Дай рекомендации по ароматерапии для снятия стресса'
);
```

## 🔄 Логика работы

### Приоритет источников:

1. **Perplexity API** - основной источник
2. **OpenAI API** - резервный источник
3. **Локальные заглушки** - fallback

### Система промптов

#### Базовые рекомендации:
```
Дай рекомендации по ароматерапии для [ключевые слова]. 
Включи конкретные масла, дозировки, способы применения и меры безопасности. 
Ответь на русском языке в формате Markdown.
```

#### Медицинские рекомендации:
```
Дай рекомендации по ароматерапии для [категория]. 
Включи конкретные масла, дозировки, способы применения и меры безопасности. 
Ответь на русском языке.
```

#### Системный промпт:
```
Ты эксперт по ароматерапии и эфирным маслам. 
Давай точные, безопасные и практичные рекомендации. 
Всегда включай дозировки, способы применения и меры безопасности.
```

## 📊 API Endpoints

### Perplexity API

```javascript
POST https://api.perplexity.ai/chat/completions
{
  "model": "llama-3.1-sonar-small-128k-online",
  "messages": [
    {
      "role": "system",
      "content": "Ты эксперт по ароматерапии..."
    },
    {
      "role": "user", 
      "content": "Дай рекомендации..."
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.7
}
```

### OpenAI API (fallback)

```javascript
POST https://api.openai.com/v1/chat/completions
{
  "model": "gpt-4o-mini",
  "messages": [...],
  "max_tokens": 2000,
  "temperature": 0.7
}
```

## 🧪 Тестирование

### Запуск тестов

```bash
# Тест Perplexity интеграции
node scripts/testPerplexity.js

# Проверка переменных окружения
node scripts/checkEnv.js
```

### Что тестируется:

- ✅ Базовые рекомендации
- ✅ Медицинские рекомендации
- ✅ Прямые вызовы Perplexity
- ✅ Fallback на OpenAI
- ✅ Обработка ошибок
- ✅ Форматирование ответов

## 📈 Мониторинг

### Логирование

```javascript
// Успешный запрос
logger.info('🔍 Using Perplexity API for recommendation');
logger.info('✅ Perplexity recommendation received');

// Ошибки
logger.error('❌ Perplexity API error:', error);
logger.warn('Perplexity API key not configured');
```

### Метрики

- `aiData.source` - источник рекомендации
- `aiData.tokensUsed` - использованные токены
- `aiData.type` - тип рекомендации

## 🔒 Безопасность

### API ключи

- Хранятся в переменных окружения
- Не коммитятся в Git
- Проверяются перед использованием

### Обработка ошибок

- Graceful fallback при недоступности API
- Логирование всех ошибок
- Пользовательские сообщения об ошибках

## 📋 Примеры ответов

### Perplexity ответ:

```
🌿 **Рекомендации по ароматерапии для энергии и бодрости:**

**Основные масла:**
• **Розмарин** - улучшает концентрацию и память
• **Мята перечная** - освежает и бодрит
• **Лимон** - поднимает настроение

**Способы применения:**
1. **Диффузор:** 3-4 капли смеси
2. **Массаж:** 2 капли + 10 мл базового масла
3. **Ингаляция:** 1-2 капли, 5-10 минут

**Меры безопасности:**
- Разбавлять базовым маслом
- Тест на аллергию
- Не использовать при беременности
```

### Fallback ответ:

```
⚡ **Для энергии рекомендую:**

🌿 **Мята перечная**
💡 **Применение:**
• **Основной способ:** 2-3 капли + базовое масло
• **Частота:** 2-3 раза в день

⚡ **Быстрый рецепт:**
- Мята перечная: 2 капли
- Базовое масло: 10 мл
- **Применение:** Массаж висков и шеи

⚠️ **Безопасность:**
- Разбавлять базовым маслом
- Тест на чувствительность
```

## 🚀 Развертывание

### Railway

```bash
# Установка переменных окружения
railway variables set PERPLEXITY_API_KEY=your_key
railway variables set OPENAI_API_KEY=your_key
```

### Локальная разработка

```bash
# Создание .env файла
echo "PERPLEXITY_API_KEY=your_key" >> .env
echo "OPENAI_API_KEY=your_key" >> .env
```

## 🔮 Будущие улучшения

### Планируемые функции:

- [ ] Кэширование ответов
- [ ] Персонализация рекомендаций
- [ ] Интеграция с базой данных масел
- [ ] Анализ настроения пользователя
- [ ] Автоматические напоминания
- [ ] Статистика использования

### Оптимизация:

- [ ] Сжатие промптов
- [ ] Параллельные запросы
- [ ] Умное кэширование
- [ ] Rate limiting
- [ ] Retry логика 