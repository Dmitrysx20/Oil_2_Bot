#!/usr/bin/env node

const envVars = {
  'NODE_ENV': process.env.NODE_ENV,
  'PORT': process.env.PORT,
  'ENABLE_WEBHOOK': process.env.ENABLE_WEBHOOK,
  'WEBHOOK_URL': process.env.WEBHOOK_URL,
  'TELEGRAM_BOT_TOKEN': process.env.TELEGRAM_BOT_TOKEN ? 'настроен' : 'не настроен',
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY ? 'настроен' : 'не настроен',
  'SUPABASE_URL': process.env.SUPABASE_URL ? 'настроен' : 'не настроен',
  'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY ? 'настроен' : 'не настроен',
  'ADMIN_CHAT_IDS': process.env.ADMIN_CHAT_IDS ? 'настроен' : 'не настроен'
};

console.log('🔧 Проверка переменных окружения:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  console.log(`${status} ${key}: ${value || 'не настроен'}`);
});

console.log('\n📋 Статус webhook:');
console.log(`   ENABLE_WEBHOOK: ${process.env.ENABLE_WEBHOOK === 'true' ? '✅ ВКЛЮЧЕН' : '❌ ОТКЛЮЧЕН'}`);
console.log(`   WEBHOOK_URL: ${process.env.WEBHOOK_URL || 'не настроен'}`);

console.log('\n💡 Рекомендации:');
if (process.env.ENABLE_WEBHOOK !== 'true') {
  console.log('   ⚠️  Установите ENABLE_WEBHOOK=true для активации webhook');
}
if (!process.env.WEBHOOK_URL) {
  console.log('   ⚠️  Установите WEBHOOK_URL для работы webhook');
}
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.log('   ⚠️  Установите TELEGRAM_BOT_TOKEN для работы бота');
} 