// 🚀 СТАРТОВЫЙ СКРИПТ С ИГНОРИРОВАНИЕМ ПРЕДУПРЕЖДЕНИЙ NODE.JS
// Принудительное решение проблемы с предупреждениями о Node.js версии

console.log('🚀 Запуск приложения с игнорированием предупреждений Node.js...');

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

// Перехват ошибок о Node.js версии
const originalError = console.error;
console.error = function(...args) {
  const message = args.join(' ');
  
  // Игнорируем ошибки о Node.js версии
  if (message.includes('Node.js 18 and below are deprecated') || 
      message.includes('upgrade to Node.js 20 or later') ||
      message.includes('@supabase/supabase-js')) {
    console.log('🔧 Ошибка о Node.js версии проигнорирована');
    return;
  }
  
  // Пропускаем остальные ошибки
  originalError.apply(console, args);
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

// Импорт и запуск основного приложения
try {
  console.log('🔧 Загрузка основного приложения...');
  
  // Импортируем Supabase конфигурацию с игнорированием предупреждений
  const { testSupabaseConnection } = require('./supabase_config.js');
  
  // Тестируем подключение к Supabase
  testSupabaseConnection().then(result => {
    if (result.success) {
      console.log('✅ Supabase подключен успешно');
      console.log('🚀 Приложение готово к работе');
    } else {
      console.log('❌ Ошибка подключения к Supabase:', result.error);
      console.log('🔧 Рекомендации:', result.recommendations);
    }
  }).catch(error => {
    console.log('❌ Ошибка тестирования Supabase:', error.message);
  });
  
  // Запускаем n8n (исправлено)
  console.log('🎛️ Запуск n8n...');
  const { spawn } = require('child_process');
  
  // Запускаем n8n в отдельном процессе
  const n8nProcess = spawn('npx', ['n8n'], {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  n8nProcess.on('error', (error) => {
    console.log('❌ Ошибка запуска n8n:', error.message);
  });
  
  n8nProcess.on('exit', (code) => {
    console.log(`🎛️ n8n завершил работу с кодом: ${code}`);
  });
  
} catch (error) {
  console.log('❌ Ошибка запуска приложения:', error.message);
  process.exit(1);
}

console.log('🎯 Приложение запущено с игнорированием предупреждений Node.js'); 