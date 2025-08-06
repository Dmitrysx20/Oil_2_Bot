// 🧪 ТЕСТ ДИАГНОСТИКИ SUPABASE
// Проверка всех функций исправления

const { 
  checkNodeVersion, 
  diagnoseSupabaseIssues, 
  safeSupabaseConnection,
  updateSupabaseConfig 
} = require('./supabase_upgrade_fix.js');

console.log('🧪 Запуск тестов диагностики Supabase...\n');

// Тест 1: Проверка версии Node.js
console.log('📋 ТЕСТ 1: Проверка версии Node.js');
const nodeVersionOk = checkNodeVersion();
console.log(`Результат: ${nodeVersionOk ? '✅ Успешно' : '❌ Проблема'}\n`);

// Тест 2: Диагностика проблем
console.log('📋 ТЕСТ 2: Полная диагностика');
const diagnosis = diagnoseSupabaseIssues();
console.log('Результаты диагностики:');
console.log(`- Всего проблем: ${diagnosis.totalIssues}`);
console.log(`- Ошибки: ${diagnosis.hasErrors ? '❌ Есть' : '✅ Нет'}`);
console.log(`- Предупреждения: ${diagnosis.hasWarnings ? '⚠️ Есть' : '✅ Нет'}`);

if (diagnosis.issues.length > 0) {
  console.log('\n📝 Найденные проблемы:');
  diagnosis.issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.type.toUpperCase()}: ${issue.message}`);
    console.log(`   Решение: ${issue.solution}`);
  });
}
console.log('');

// Тест 3: Обновление конфигурации
console.log('📋 ТЕСТ 3: Обновление конфигурации');
try {
  const config = updateSupabaseConfig();
  console.log('✅ Конфигурация обновлена успешно');
  console.log(`- URL: ${config.supabaseUrl}`);
  console.log(`- Timeout: ${config.timeout}ms`);
  console.log(`- Retry attempts: ${config.retryAttempts}`);
} catch (error) {
  console.log(`❌ Ошибка обновления конфигурации: ${error.message}`);
}
console.log('');

// Тест 4: Безопасное подключение (симуляция)
console.log('📋 ТЕСТ 4: Безопасное подключение');
safeSupabaseConnection().then(result => {
  console.log(`Результат: ${result.success ? '✅ Успешно' : '❌ Ошибка'}`);
  console.log(`Сообщение: ${result.message}`);
  
  if (!result.success) {
    console.log('Рекомендации:');
    result.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
}).catch(error => {
  console.log(`❌ Ошибка тестирования: ${error.message}`);
});

console.log('\n🎯 РЕЗЮМЕ ТЕСТОВ:');
console.log(`✅ Node.js версия: ${nodeVersionOk ? 'Совместима' : 'Требует обновления'}`);
console.log(`🔍 Проблемы найдены: ${diagnosis.totalIssues}`);
console.log(`🚀 Готовность к работе: ${diagnosis.hasErrors ? '❌ Требует исправления' : '✅ Готов'}`); 