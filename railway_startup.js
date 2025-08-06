// 🚂 RAILWAY STARTUP SCRIPT
// Инициализация для Railway с проверкой Supabase

const { checkNodeVersion, diagnoseSupabaseIssues, safeSupabaseConnection } = require('./supabase_upgrade_fix.js');

console.log('🚂 Railway startup initiated...');
console.log(`Environment: ${process.env.RAILWAY_ENVIRONMENT || 'production'}`);
console.log(`Node version: ${process.version}`);

// Проверка версии Node.js
console.log('🔍 Checking Node.js version...');
const nodeVersionOk = checkNodeVersion();

if (!nodeVersionOk) {
  console.error('❌ Node.js version incompatible with Railway');
  process.exit(1);
}

// Диагностика Supabase
console.log('🔍 Running Supabase diagnosis...');
const diagnosis = diagnoseSupabaseIssues();

if (diagnosis.hasErrors) {
  console.error('❌ Critical Supabase issues found:');
  diagnosis.issues.forEach(issue => {
    if (issue.severity === 'error') {
      console.error(`- ${issue.message}`);
    }
  });
  process.exit(1);
}

// Проверка подключения к Supabase
console.log('🔗 Testing Supabase connection...');
safeSupabaseConnection().then(result => {
  if (result.success) {
    console.log('✅ Railway startup completed successfully');
    console.log('🚀 Bot is ready to run on Railway');
    console.log('📊 System status: HEALTHY');
    
    // Логирование метрик запуска
    console.log('📈 Startup metrics:', {
      nodeVersion: process.version,
      environment: process.env.RAILWAY_ENVIRONMENT || 'production',
      supabaseStatus: 'connected',
      timestamp: new Date().toISOString()
    });
  } else {
    console.error('❌ Supabase connection failed:', result.error);
    console.error('Recommendations:');
    result.recommendations.forEach((rec, index) => {
      console.error(`${index + 1}. ${rec}`);
    });
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Railway startup failed:', error);
  process.exit(1);
});

// Экспорт для использования в других модулях
module.exports = {
  nodeVersionOk,
  diagnosis,
  startupTime: new Date().toISOString()
}; 