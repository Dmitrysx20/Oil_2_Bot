// 🔑 ПРОВЕРКА API КЛЮЧЕЙ В RAILWAY
// Скрипт для проверки настроенных переменных окружения

console.log('🔑 Проверка API ключей в Railway...\n');

// Проверка переменных окружения
const requiredVars = {
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'BOT_TOKEN': process.env.BOT_TOKEN,
  'ADMIN_CHAT_ID': process.env.ADMIN_CHAT_ID,
  'NODE_ENV': process.env.NODE_ENV,
  'RAILWAY_ENVIRONMENT': process.env.RAILWAY_ENVIRONMENT
};

console.log('📋 Проверка переменных окружения:');
console.log('=====================================');

let missingVars = [];
let validVars = [];

Object.entries(requiredVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${key.includes('KEY') || key.includes('TOKEN') ? '***' + value.slice(-4) : value}`);
    validVars.push(key);
  } else {
    console.log(`❌ ${key}: НЕ НАСТРОЕН`);
    missingVars.push(key);
  }
});

console.log('\n📊 Результаты проверки:');
console.log('========================');

if (missingVars.length === 0) {
  console.log('🎉 Все API ключи настроены правильно!');
  console.log('✅ Система готова к работе');
} else {
  console.log(`⚠️  Найдено ${missingVars.length} отсутствующих переменных:`);
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  
  console.log('\n🔧 Инструкции по настройке:');
  console.log('============================');
  
  if (missingVars.includes('SUPABASE_URL') || missingVars.includes('SUPABASE_ANON_KEY')) {
    console.log('1. Supabase API ключи:');
    console.log('   - Откройте Supabase Dashboard');
    console.log('   - Settings → API');
    console.log('   - Скопируйте Project URL и anon public key');
  }
  
  if (missingVars.includes('BOT_TOKEN')) {
    console.log('2. Telegram Bot Token:');
    console.log('   - Найдите @BotFather в Telegram');
    console.log('   - /mybots → выберите бота → API Token');
  }
  
  console.log('\n3. Добавьте переменные в Railway Dashboard:');
  console.log('   - Откройте ваш проект в Railway');
  console.log('   - Variables → Add Variable');
}

// Проверка формата ключей
console.log('\n🔍 Проверка формата ключей:');
console.log('============================');

if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('supabase.co')) {
  console.log('⚠️  SUPABASE_URL не похож на валидный URL Supabase');
}

if (process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_ANON_KEY.startsWith('eyJ')) {
  console.log('⚠️  SUPABASE_ANON_KEY не похож на валидный JWT токен');
}

if (process.env.BOT_TOKEN && !process.env.BOT_TOKEN.includes(':')) {
  console.log('⚠️  BOT_TOKEN не похож на валидный токен Telegram бота');
}

// Проверка подключения к Supabase (если ключи есть)
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  console.log('\n🔗 Тестирование подключения к Supabase...');
  
  // Импортируем функции проверки
  try {
    const { safeSupabaseConnection } = require('./supabase_upgrade_fix.js');
    
    safeSupabaseConnection().then(result => {
      if (result.success) {
        console.log('✅ Подключение к Supabase успешно');
      } else {
        console.log('❌ Ошибка подключения к Supabase:', result.error);
      }
    }).catch(error => {
      console.log('❌ Ошибка тестирования Supabase:', error.message);
    });
  } catch (error) {
    console.log('⚠️  Не удалось импортировать функции проверки Supabase');
  }
}

// Итоговая сводка
console.log('\n📈 Итоговая сводка:');
console.log('===================');
console.log(`✅ Настроено переменных: ${validVars.length}/${Object.keys(requiredVars).length}`);
console.log(`❌ Отсутствует переменных: ${missingVars.length}`);
console.log(`🌍 Environment: ${process.env.RAILWAY_ENVIRONMENT || 'production'}`);
console.log(`💻 Node.js: ${process.version}`);

if (missingVars.length === 0) {
  console.log('\n🎯 Статус: ГОТОВ К РАБОТЕ');
  console.log('🚀 Все API ключи настроены, система готова к запуску');
} else {
  console.log('\n🎯 Статус: ТРЕБУЕТ НАСТРОЙКИ');
  console.log('🔧 Необходимо добавить отсутствующие переменные окружения');
}

// Экспорт для использования в других скриптах
module.exports = {
  requiredVars,
  missingVars,
  validVars,
  isValid: missingVars.length === 0
}; 