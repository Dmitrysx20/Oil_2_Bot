#!/usr/bin/env node

const AIService = require('../src/services/AIService');
const logger = require('../src/utils/logger');

async function testAIRecommendations() {
  console.log('🤖 Тестирование AI рекомендаций...\n');

  const aiService = new AIService();

  // Тест 1: Базовые рекомендации
  console.log('📋 Тест 1: Базовые рекомендации');
  console.log('Вопрос: "как успокоить мужа"');
  
  const basicResult = await aiService.getBasicRecommendation({
    keywords: ['успокоить', 'муж', 'спокойствие'],
    chatId: 123456789,
    userQuery: 'как успокоить мужа'
  });

  console.log('\n📱 Результат:');
  console.log('Действие:', basicResult.action);
  console.log('Источник:', basicResult.aiData?.source);
  console.log('Сообщение:');
  console.log(basicResult.message);
  console.log('\n' + '─'.repeat(50));

  // Тест 2: Медицинские рекомендации
  console.log('\n📋 Тест 2: Медицинские рекомендации');
  console.log('Категория: "стресс"');
  
  const medicalResult = await aiService.getMedicalRecommendation({
    medicalInfo: { category: 'стресс' },
    chatId: 123456789,
    userQuery: 'как успокоить мужа'
  });

  console.log('\n📱 Результат:');
  console.log('Действие:', medicalResult.action);
  console.log('Источник:', medicalResult.aiData?.source);
  console.log('Сообщение:');
  console.log(medicalResult.message);
  console.log('\n' + '─'.repeat(50));

  // Тест 3: Проверка с разными ключевыми словами
  console.log('\n📋 Тест 3: Разные ключевые слова');
  
  const keywords = [
    ['успокоить', 'муж'],
    ['спокойствие', 'семья'],
    ['стресс', 'отношения'],
    ['расслабление', 'партнер']
  ];

  for (const keywordSet of keywords) {
    console.log(`\nКлючевые слова: ${keywordSet.join(', ')}`);
    
    const result = await aiService.getBasicRecommendation({
      keywords: keywordSet,
      chatId: 123456789,
      userQuery: 'как успокоить мужа'
    });

    console.log('Источник:', result.aiData?.source);
    console.log('Краткое сообщение:', result.message.substring(0, 100) + '...');
  }

  console.log('\n✅ Тестирование завершено!');
}

// Запуск теста
testAIRecommendations().catch(error => {
  console.error('❌ Ошибка тестирования:', error);
  process.exit(1);
}); 