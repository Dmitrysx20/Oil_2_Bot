const AIService = require('../src/services/AIService');
const logger = require('../src/utils/logger');

async function testPerplexity() {
  try {
    logger.info('🔍 Starting Perplexity API test...');

    const aiService = new AIService();

    // Тестируем базовые рекомендации
    logger.info('\n🤖 Testing basic recommendations...');
    
    const basicResult = await aiService.getBasicRecommendation({
      keywords: ['энергия', 'бодрость'],
      chatId: 123456789,
      userQuery: 'Нужна энергия'
    });

    logger.info(`✅ Basic recommendation result: ${basicResult.action}`);
    logger.info(`📱 Message preview: ${basicResult.message.substring(0, 100)}...`);
    logger.info(`🔧 Source: ${basicResult.aiData?.source}`);

    // Тестируем медицинские рекомендации
    logger.info('\n🏥 Testing medical recommendations...');
    
    const medicalResult = await aiService.getMedicalRecommendation({
      medicalInfo: { category: 'головная_боль' },
      chatId: 123456789,
      userQuery: 'Болит голова'
    });

    logger.info(`✅ Medical recommendation result: ${medicalResult.action}`);
    logger.info(`📱 Message preview: ${medicalResult.message.substring(0, 100)}...`);
    logger.info(`🔧 Source: ${medicalResult.aiData?.source}`);

    // Тестируем прямой вызов Perplexity
    logger.info('\n🔍 Testing direct Perplexity call...');
    
    const perplexityResponse = await aiService.getPerplexityRecommendation(
      'Дай краткую рекомендацию по ароматерапии для снятия стресса. Включи 2-3 масла и способы применения.'
    );

    if (perplexityResponse) {
      logger.info('✅ Perplexity response received');
      logger.info(`📱 Response preview: ${perplexityResponse.substring(0, 200)}...`);
    } else {
      logger.warn('⚠️ Perplexity response is null (API key might not be configured)');
    }

    // Тестируем OpenAI как fallback
    logger.info('\n🤖 Testing OpenAI fallback...');
    
    const openaiResponse = await aiService.getOpenAIRecommendation(
      'Дай краткую рекомендацию по ароматерапии для улучшения сна. Включи 2-3 масла и способы применения.'
    );

    if (openaiResponse) {
      logger.info('✅ OpenAI response received');
      logger.info(`📱 Response preview: ${openaiResponse.substring(0, 200)}...`);
    } else {
      logger.warn('⚠️ OpenAI response is null (API key might not be configured)');
    }

    logger.info('\n✅ Perplexity API test completed successfully!');

  } catch (error) {
    logger.error('❌ Perplexity API test failed:', error);
  }
}

// Запускаем тест
testPerplexity(); 