#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Диагностика и полная очистка переменных окружения Railway...\n');

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

console.log('\n📊 Текущие переменные окружения:');
try {
  const variables = execSync('railway variables', { encoding: 'utf8' });
  console.log(variables);
} catch (error) {
  console.log('❌ Ошибка получения переменных:', error.message);
}

console.log('\n🗑️  ПОЛНАЯ ОЧИСТКА всех переменных окружения...\n');

// Список ВСЕХ возможных переменных для удаления
const allVariables = [
  'NODE_ENV',
  'PORT',
  'NODE_NO_WARNINGS',
  'NODE_OPTIONS',
  'TELEGRAM_BOT_TOKEN',
  'OPENAI_API_KEY',
  'PERPLEXITY_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'ADMIN_CHAT_IDS',
  'ENABLE_WEBHOOK',
  'WEBHOOK_URL'
];

// Удаляем ВСЕ переменные
for (const variable of allVariables) {
  try {
    execSync(`railway variables unset ${variable}`, { stdio: 'ignore' });
    console.log(`✅ Удалена переменная: ${variable}`);
  } catch (error) {
    console.log(`ℹ️  Переменная ${variable} не найдена или уже удалена`);
  }
}

console.log('\n📋 Установка ТОЛЬКО базовых переменных...\n');

// Устанавливаем ТОЛЬКО базовые переменные без API ключей
const basicVariables = {
  'NODE_ENV': 'production',
  'PORT': '3000',
  'NODE_NO_WARNINGS': '1',
  'NODE_OPTIONS': '--no-deprecation --no-warnings'
};

for (const [key, value] of Object.entries(basicVariables)) {
  try {
    execSync(`railway variables set ${key}=${value}`, { stdio: 'ignore' });
    console.log(`✅ ${key}=${value}`);
  } catch (error) {
    console.log(`❌ Ошибка установки ${key}: ${error.message}`);
  }
}

console.log('\n📊 Проверка после очистки:');
try {
  const variablesAfter = execSync('railway variables', { encoding: 'utf8' });
  console.log(variablesAfter);
} catch (error) {
  console.log('❌ Ошибка получения переменных:', error.message);
}

console.log('\n🎯 ИНСТРУКЦИИ ПО НАСТРОЙКЕ:');
console.log('1. Перейдите в Railway Dashboard');
console.log('2. Откройте ваш проект');
console.log('3. Перейдите в раздел "Variables"');
console.log('4. Убедитесь, что остались только эти переменные:');
console.log('   - NODE_ENV=production');
console.log('   - PORT=3000');
console.log('   - NODE_NO_WARNINGS=1');
console.log('   - NODE_OPTIONS=--no-deprecation --no-warnings');
console.log('');
console.log('5. Перезапустите деплой в Railway Dashboard');
console.log('6. После успешной сборки добавьте API ключи ПО ОДНОМУ:');
console.log('');
console.log('   TELEGRAM_BOT_TOKEN=your_token_here');
console.log('   OPENAI_API_KEY=your_key_here');
console.log('   PERPLEXITY_API_KEY=your_key_here');
console.log('   SUPABASE_URL=your_url_here');
console.log('   SUPABASE_ANON_KEY=your_key_here');
console.log('   ADMIN_CHAT_IDS=123456789,987654321');
console.log('');

console.log('⚠️  ВАЖНО: Добавляйте переменные по одной и проверяйте сборку после каждой!');
console.log('💡 Это поможет выявить проблемную переменную.');

console.log('\n✅ Полная очистка завершена!');
console.log('🚀 Теперь перезапустите деплой в Railway Dashboard'); 