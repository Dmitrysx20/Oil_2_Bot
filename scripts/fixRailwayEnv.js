#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Проверка и исправление переменных окружения Railway...\n');

// Проверяем, установлен ли Railway CLI
try {
  execSync('railway --version', { stdio: 'ignore' });
  console.log('✅ Railway CLI установлен');
} catch (error) {
  console.log('❌ Railway CLI не установлен');
  console.log('📦 Установите: npm install -g @railway/cli');
  process.exit(1);
}

// Проверяем, подключен ли проект
try {
  execSync('railway status', { stdio: 'ignore' });
  console.log('✅ Проект подключен к Railway');
} catch (error) {
  console.log('❌ Проект не подключен к Railway');
  console.log('🔗 Подключите: railway link');
  process.exit(1);
}

// Список обязательных переменных
const requiredVariables = {
  'NODE_ENV': 'production',
  'PORT': '3000',
  'NODE_NO_WARNINGS': '1',
  'NODE_OPTIONS': '--no-deprecation --no-warnings',
  'TELEGRAM_BOT_TOKEN': '',
  'OPENAI_API_KEY': '',
  'PERPLEXITY_API_KEY': '',
  'SUPABASE_URL': '',
  'SUPABASE_ANON_KEY': '',
  'ADMIN_CHAT_IDS': '',
  'ENABLE_WEBHOOK': 'false',
  'WEBHOOK_URL': ''
};

console.log('📋 Установка переменных окружения...\n');

// Устанавливаем переменные
for (const [key, value] of Object.entries(requiredVariables)) {
  try {
    if (value) {
      execSync(`railway variables set ${key}=${value}`, { stdio: 'ignore' });
      console.log(`✅ ${key}=${value}`);
    } else {
      console.log(`⚠️  ${key} - требуется установить вручную`);
    }
  } catch (error) {
    console.log(`❌ Ошибка установки ${key}: ${error.message}`);
  }
}

console.log('\n🎯 Рекомендации:');
console.log('1. Установите TELEGRAM_BOT_TOKEN в Railway Dashboard');
console.log('2. Установите OPENAI_API_KEY в Railway Dashboard');
console.log('3. Установите PERPLEXITY_API_KEY в Railway Dashboard');
console.log('4. Установите SUPABASE_URL и SUPABASE_ANON_KEY в Railway Dashboard');
console.log('5. Установите ADMIN_CHAT_IDS в Railway Dashboard');

console.log('\n📊 Проверка текущих переменных:');
try {
  const variables = execSync('railway variables', { encoding: 'utf8' });
  console.log(variables);
} catch (error) {
  console.log('❌ Ошибка получения переменных:', error.message);
}

console.log('\n✅ Настройка завершена!');
console.log('🚀 Перезапустите деплой: railway up'); 