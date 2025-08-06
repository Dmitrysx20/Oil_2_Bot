// 🚀 УПРОЩЕННЫЙ СТАРТОВЫЙ СКРИПТ
// Только проверка Supabase подключения без запуска n8n

console.log('🚀 Запуск упрощенного приложения...');

// Принудительное игнорирование предупреждений
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
process.env.SUPPRESS_DEPRECATION_WARNINGS = 'y';

// Перехват предупреждений о Node.js версии
const originalWarn = console.warn;
console.warn = function(...args) {
  const message = args.join(' ');
  
  // Игнорируем предупреждения о Node.js версии
  if (message.includes('Node.js 18 and below are deprecated') || 
      message.includes('upgrade to Node.js 20 or later') ||
      message.includes('@supabase/supabase-js')) {
    console.log('🔧 Предупреждение о Node.js версии проигнорировано');
    return;
  }
  
  // Пропускаем остальные предупреждения
  originalWarn.apply(console, args);
};

// Логирование информации о системе
console.log('📊 Информация о системе:');
console.log(`   Node.js версия: ${process.version}`);
console.log(`   Платформа: ${process.platform}`);
console.log(`   Архитектура: ${process.arch}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   RAILWAY_ENVIRONMENT: ${process.env.RAILWAY_ENVIRONMENT || 'production'}`);

// Проверка версии Node.js
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion >= 20) {
  console.log('✅ Node.js версия совместима с Supabase');
} else {
  console.log('⚠️ Node.js версия ниже 20, но предупреждения будут проигнорированы');
}

// Импорт и проверка Supabase
try {
  console.log('🔧 Загрузка Supabase конфигурации...');
  
  // Импортируем Supabase конфигурацию
  const { testSupabaseConnection } = require('./supabase_config.js');
  
  // Тестируем подключение к Supabase
  testSupabaseConnection().then(result => {
    if (result.success) {
      console.log('✅ Supabase подключен успешно');
      console.log('🚀 Приложение готово к работе');
      console.log('💡 Для запуска n8n используйте команду: npx n8n');
    } else {
      console.log('❌ Ошибка подключения к Supabase:', result.error);
      console.log('🔧 Рекомендации:', result.recommendations);
    }
  }).catch(error => {
    console.log('❌ Ошибка тестирования Supabase:', error.message);
  });
  
} catch (error) {
  console.log('❌ Ошибка запуска приложения:', error.message);
  process.exit(1);
}

console.log('🎯 Приложение запущено успешно'); 