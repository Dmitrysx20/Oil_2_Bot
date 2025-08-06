require('dotenv').config();
const axios = require('axios');
const config = require('../config');

async function testHealthCheck() {
  console.log('🏥 Тестирование health check...');
  
  try {
    const response = await axios.get('http://localhost:3000/health');
    console.log('✅ Health check работает:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health check не работает:', error.message);
    return false;
  }
}

async function testWebhookEndpoint() {
  console.log('\n🔗 Тестирование webhook endpoint...');
  
  try {
    const response = await axios.post('http://localhost:3000/webhook/telegram', {
      update_id: 123456,
      message: {
        message_id: 1,
        chat: { id: 123456 },
        text: 'test'
      }
    });
    console.log('✅ Webhook endpoint работает:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Webhook endpoint не работает:', error.message);
    return false;
  }
}

async function testTelegramAPI() {
  console.log('\n🤖 Тестирование Telegram API...');
  
  const botToken = config.telegram.botToken;
  if (!botToken) {
    console.log('❌ TELEGRAM_BOT_TOKEN не настроен');
    return false;
  }

  try {
    const response = await axios.get(`https://api.telegram.org/bot${botToken}/getMe`);
    if (response.data.ok) {
      const bot = response.data.result;
      console.log('✅ Telegram API работает:');
      console.log(`   👤 Имя: ${bot.first_name}`);
      console.log(`   📝 Username: @${bot.username}`);
      console.log(`   🆔 ID: ${bot.id}`);
      return true;
    } else {
      console.log('❌ Telegram API ошибка:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Telegram API не работает:', error.message);
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔧 Проверка переменных окружения...');
  
  const requiredVars = [
    'TELEGRAM_BOT_TOKEN',
    'OPENAI_API_KEY',
    'PERPLEXITY_API_KEY',
    'SUPABASE_URL'
  ];

  const optionalVars = [
    'WEBHOOK_URL',
    'SUPABASE_ANON_KEY',
    'ADMIN_CHAT_IDS',
    'ENABLE_WEBHOOK'
  ];

  console.log('📋 Обязательные переменные:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`   ❌ ${varName}: не настроена`);
    }
  }

  console.log('\n📋 Опциональные переменные:');
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`   ⚠️  ${varName}: не настроена`);
    }
  }
}

async function testServices() {
  console.log('\n🔧 Тестирование сервисов...');
  
  try {
    // Тестируем импорт сервисов
    const SmartRouter = require('../src/services/SmartRouter');
    const TelegramService = require('../src/services/TelegramService');
    const OilSearchService = require('../src/services/OilSearchService');
    const AIService = require('../src/services/AIService');
    const MusicService = require('../src/services/MusicService');
    const SubscriptionService = require('../src/services/SubscriptionService');
    const AdminService = require('../src/services/AdminService');
    
    console.log('✅ Все сервисы импортируются успешно');
    
    // Тестируем создание экземпляров
    const smartRouter = new SmartRouter();
    const telegramService = new TelegramService();
    
    console.log('✅ Сервисы создаются успешно');
    
    return true;
  } catch (error) {
    console.log('❌ Ошибка при тестировании сервисов:', error.message);
    return false;
  }
}

async function testRailwayDeployment() {
  console.log('\n🚂 Проверка Railway деплоя...');
  
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('⚠️  WEBHOOK_URL не настроен');
    return false;
  }

  try {
    const response = await axios.get(`${webhookUrl}/health`, { timeout: 5000 });
    console.log('✅ Railway приложение работает:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Railway приложение недоступно:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Запуск всех тестов...\n');
  
  const results = {
    healthCheck: await testHealthCheck(),
    webhookEndpoint: await testWebhookEndpoint(),
    telegramAPI: await testTelegramAPI(),
    services: await testServices(),
    railwayDeployment: await testRailwayDeployment()
  };

  await testEnvironmentVariables();

  console.log('\n📊 Результаты тестов:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (const [test, result] of Object.entries(results)) {
    const status = result ? '✅' : '❌';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}: ${result ? 'РАБОТАЕТ' : 'НЕ РАБОТАЕТ'}`);
  }

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📈 Итого: ${passedTests}/${totalTests} тестов прошли успешно`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Все тесты прошли! Приложение готово к работе!');
  } else {
    console.log('⚠️  Некоторые тесты не прошли. Проверьте настройки.');
  }
}

// Запуск тестов
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testHealthCheck,
  testWebhookEndpoint,
  testTelegramAPI,
  testEnvironmentVariables,
  testServices,
  testRailwayDeployment,
  runAllTests
}; 