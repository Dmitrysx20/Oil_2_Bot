#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧹 Очистка и настройка переменных окружения Railway...\n');

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

// Список переменных для удаления (если есть проблемы)
const variablesToRemove = [
  'TELEGRAM_BOT_TOKEN',
  'OPENAI_API_KEY', 
  'PERPLEXITY_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'ADMIN_CHAT_IDS'
];

// Список переменных для установки
const variablesToSet = {
  'NODE_ENV': 'production',
  'PORT': '3000',
  'NODE_NO_WARNINGS': '1',
  'NODE_OPTIONS': '--no-deprecation --no-warnings',
  'ENABLE_WEBHOOK': 'false',
  'WEBHOOK_URL': ''
};

console.log('🗑️  Удаление проблемных переменных...\n');

// Удаляем переменные, которые могут вызывать проблемы
for (const variable of variablesToRemove) {
  try {
    execSync(`railway variables unset ${variable}`, { stdio: 'ignore' });
    console.log(`✅ Удалена переменная: ${variable}`);
  } catch (error) {
    console.log(`ℹ️  Переменная ${variable} не найдена или уже удалена`);
  }
}

console.log('\n📋 Установка базовых переменных...\n');

// Устанавливаем базовые переменные
for (const [key, value] of Object.entries(variablesToSet)) {
  try {
    execSync(`railway variables set ${key}=${value}`, { stdio: 'ignore' });
    console.log(`✅ ${key}=${value}`);
  } catch (error) {
    console.log(`❌ Ошибка установки ${key}: ${error.message}`);
  }
}

console.log('\n🎯 Инструкции по настройке API ключей:');
console.log('1. Перейдите в Railway Dashboard');
console.log('2. Откройте ваш проект');
console.log('3. Перейдите в раздел "Variables"');
console.log('4. Добавьте следующие переменные:');
console.log('');
console.log('   TELEGRAM_BOT_TOKEN=your_telegram_bot_token');
console.log('   OPENAI_API_KEY=your_openai_api_key');
console.log('   PERPLEXITY_API_KEY=your_perplexity_api_key');
console.log('   SUPABASE_URL=your_supabase_url');
console.log('   SUPABASE_ANON_KEY=your_supabase_anon_key');
console.log('   ADMIN_CHAT_IDS=123456789,987654321');
console.log('');

console.log('📊 Проверка текущих переменных:');
try {
  const variables = execSync('railway variables', { encoding: 'utf8' });
  console.log(variables);
} catch (error) {
  console.log('❌ Ошибка получения переменных:', error.message);
}

console.log('\n✅ Очистка завершена!');
console.log('🚀 Теперь перезапустите деплой: railway up');
console.log('💡 После этого добавьте API ключи в Railway Dashboard'); 