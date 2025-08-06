#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚨 ЭКСТРЕННАЯ ОЧИСТКА Railway переменных...\n');

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

console.log('\n📊 Текущие переменные (ПЕРЕД очисткой):');
try {
  const variables = execSync('railway variables', { encoding: 'utf8' });
  console.log(variables);
} catch (error) {
  console.log('❌ Ошибка получения переменных:', error.message);
}

console.log('\n🗑️  ПРИНУДИТЕЛЬНАЯ ОЧИСТКА ВСЕХ ПЕРЕМЕННЫХ...\n');

// Расширенный список ВСЕХ возможных переменных
const allPossibleVariables = [
  // Основные переменные
  'NODE_ENV',
  'PORT',
  'NODE_NO_WARNINGS',
  'NODE_OPTIONS',
  
  // API ключи
  'TELEGRAM_BOT_TOKEN',
  'OPENAI_API_KEY',
  'PERPLEXITY_API_KEY', // ПРОБЛЕМНАЯ ПЕРЕМЕННАЯ!
  
  // База данных
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  
  // Администраторы
  'ADMIN_CHAT_IDS',
  
  // Webhook
  'ENABLE_WEBHOOK',
  'WEBHOOK_URL',
  
  // Дополнительные возможные переменные
  'RAILWAY_TOKEN',
  'RAILWAY_PROJECT_ID',
  'RAILWAY_SERVICE_ID',
  'RAILWAY_ENVIRONMENT_ID'
];

console.log('🔍 Удаление переменных...\n');

// Удаляем ВСЕ переменные
let removedCount = 0;
for (const variable of allPossibleVariables) {
  try {
    execSync(`railway variables unset ${variable}`, { stdio: 'ignore' });
    console.log(`✅ Удалена: ${variable}`);
    removedCount++;
  } catch (error) {
    console.log(`ℹ️  Не найдена: ${variable}`);
  }
}

console.log(`\n📊 Удалено переменных: ${removedCount}`);

console.log('\n📋 Установка ТОЛЬКО базовых переменных...\n');

// Устанавливаем ТОЛЬКО базовые переменные
const basicVariables = {
  'NODE_ENV': 'production',
  'PORT': '3000',
  'NODE_NO_WARNINGS': '1',
  'NODE_OPTIONS': '--no-deprecation --no-warnings'
};

let addedCount = 0;
for (const [key, value] of Object.entries(basicVariables)) {
  try {
    execSync(`railway variables set ${key}=${value}`, { stdio: 'ignore' });
    console.log(`✅ Добавлена: ${key}=${value}`);
    addedCount++;
  } catch (error) {
    console.log(`❌ Ошибка добавления ${key}: ${error.message}`);
  }
}

console.log(`\n📊 Добавлено переменных: ${addedCount}`);

console.log('\n📊 Проверка после очистки:');
try {
  const variablesAfter = execSync('railway variables', { encoding: 'utf8' });
  console.log(variablesAfter);
} catch (error) {
  console.log('❌ Ошибка получения переменных:', error.message);
}

console.log('\n🎯 ЭКСТРЕННЫЕ ИНСТРУКЦИИ:');
console.log('1. Перейдите в Railway Dashboard');
console.log('2. Откройте ваш проект');
console.log('3. Перейдите в раздел "Variables"');
console.log('4. УБЕДИТЕСЬ, что переменная PERPLEXITY_API_KEY УДАЛЕНА');
console.log('5. Если она все еще есть - удалите её вручную');
console.log('6. Перезапустите деплой');
console.log('');
console.log('7. После успешной сборки добавьте API ключи:');
console.log('   TELEGRAM_BOT_TOKEN=your_token_here');
console.log('   OPENAI_API_KEY=your_key_here');
console.log('   SUPABASE_URL=your_url_here');
console.log('   SUPABASE_ANON_KEY=your_key_here');
console.log('   ADMIN_CHAT_IDS=123456789,987654321');

console.log('\n⚠️  ВАЖНО: Если PERPLEXITY_API_KEY все еще есть в Railway Dashboard - удалите её вручную!');

console.log('\n✅ Принудительная очистка завершена!');
console.log('🚀 Теперь перезапустите деплой в Railway Dashboard'); 