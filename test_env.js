// 🔍 ТЕСТ ПЕРЕМЕННЫХ ОКРУЖЕНИЯ
// Проверка настроек для Railway

console.log('🔍 Проверка переменных окружения...');
console.log('=====================================');

// Основные переменные
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'не установлена'}`);
console.log(`RAILWAY_ENVIRONMENT: ${process.env.RAILWAY_ENVIRONMENT || 'не установлена'}`);
console.log(`PORT: ${process.env.PORT || 'не установлена'}`);

// Supabase переменные
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ настроена' : '❌ не настроена'}`);
console.log(`SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ настроена' : '❌ не настроена'}`);

// Дополнительные переменные
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ настроена' : '❌ не настроена'}`);

// Проверка для Railway
if (process.env.RAILWAY_ENVIRONMENT) {
  console.log('\n🚂 Railway окружение обнаружено!');
  console.log('✅ Приложение должно работать в Railway');
} else {
  console.log('\n💻 Локальное окружение');
  console.log('⚠️ Для тестирования в Railway используйте Railway Dashboard');
}

// Проверка Supabase
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  console.log('\n✅ Supabase переменные настроены');
  console.log('🔗 Можно тестировать подключение к Supabase');
} else {
  console.log('\n❌ Supabase переменные не настроены');
  console.log('🔧 Настройте переменные в Railway Dashboard:');
  console.log('   - SUPABASE_URL');
  console.log('   - SUPABASE_ANON_KEY');
}

console.log('\n=====================================');
console.log('�� Тест завершен'); 