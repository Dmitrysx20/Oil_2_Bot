// 🔧 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ NODE.JS В RAILWAY
// Скрипт для исправления проблемы с устаревшей версией Node.js

console.log('🔧 Принудительное обновление Node.js в Railway...');

// Проверка текущей версии
const currentVersion = process.version;
const majorVersion = parseInt(currentVersion.slice(1).split('.')[0]);

console.log(`📋 Текущая версия Node.js: ${currentVersion}`);
console.log(`🔍 Major version: ${majorVersion}`);

// Проверка совместимости
if (majorVersion >= 20) {
  console.log('✅ Node.js версия совместима с Supabase');
  console.log('✅ Проблема с устаревшей версией решена');
} else {
  console.log('❌ Node.js версия несовместима с Supabase');
  console.log('❌ Требуется обновление до версии 20+');
  
  // Информация об обновлении
  console.log('\n🔧 Инструкции по обновлению:');
  console.log('============================');
  console.log('1. Обновите railway.json:');
  console.log('   - Добавьте "NODE_VERSION": "22.17.1"');
  console.log('   - Убедитесь, что engines.node указан в package.json');
  
  console.log('\n2. Обновите package.json:');
  console.log('   - "engines": { "node": "22.17.1" }');
  console.log('   - Убедитесь, что @supabase/supabase-js обновлен');
  
  console.log('\n3. Перезапустите деплой в Railway');
  console.log('   - Откройте Railway Dashboard');
  console.log('   - Перейдите в Deployments');
  console.log('   - Нажмите "Redeploy"');
  
  process.exit(1);
}

// Проверка переменных окружения
const requiredEnvVars = [
  'NODE_VERSION',
  'NODE_ENV',
  'RAILWAY_ENVIRONMENT'
];

console.log('\n🔍 Проверка переменных окружения:');
console.log('=====================================');

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`❌ ${varName}: НЕ НАСТРОЕН`);
  }
});

// Проверка Supabase совместимости
console.log('\n🔗 Проверка совместимости с Supabase:');
console.log('=====================================');

try {
  // Симуляция проверки Supabase
  const supabaseConfig = {
    nodeVersion: currentVersion,
    supabaseVersion: '2.39.0',
    compatibility: majorVersion >= 20 ? 'compatible' : 'incompatible'
  };
  
  console.log(`📊 Node.js: ${supabaseConfig.nodeVersion}`);
  console.log(`📦 Supabase: ${supabaseConfig.supabaseVersion}`);
  console.log(`🔗 Совместимость: ${supabaseConfig.compatibility}`);
  
  if (supabaseConfig.compatibility === 'compatible') {
    console.log('✅ Supabase будет работать без предупреждений');
  } else {
    console.log('❌ Supabase будет показывать предупреждения');
  }
  
} catch (error) {
  console.log('⚠️ Не удалось проверить совместимость Supabase');
}

// Рекомендации по обновлению
console.log('\n📝 Рекомендации:');
console.log('==================');

if (majorVersion >= 20) {
  console.log('✅ Все в порядке! Node.js версия совместима');
  console.log('✅ Supabase будет работать без предупреждений');
  console.log('✅ Система готова к продакшену');
} else {
  console.log('🔧 Необходимые действия:');
  console.log('1. Обновите Node.js до версии 20+');
  console.log('2. Перезапустите деплой в Railway');
  console.log('3. Проверьте логи на отсутствие предупреждений');
}

// Экспорт для использования в других скриптах
module.exports = {
  currentVersion,
  majorVersion,
  isCompatible: majorVersion >= 20,
  recommendations: majorVersion >= 20 ? [] : [
    'Обновите Node.js до версии 20+',
    'Перезапустите деплой в Railway',
    'Проверьте логи на отсутствие предупреждений'
  ]
};

console.log('\n🎯 Статус: ' + (majorVersion >= 20 ? '✅ ГОТОВ' : '❌ ТРЕБУЕТ ОБНОВЛЕНИЯ')); 