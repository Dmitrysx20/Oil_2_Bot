// 🚂 БЫСТРЫЙ ТЕСТ RAILWAY ПРИЛОЖЕНИЯ
// Проверка работоспособности после деплоя

const https = require('https');
const http = require('http');

console.log('🚂 Тестирование Railway приложения...');
console.log('=====================================');

// Получаем URL приложения из переменных окружения или используем Railway URL
const appUrl = process.env.RAILWAY_PUBLIC_DOMAIN || 'your-app.railway.app';

console.log(`🔗 Тестируем URL: ${appUrl}`);

// Функция для тестирования HTTP/HTTPS
function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      console.log(`✅ Статус: ${res.statusCode}`);
      console.log(`📊 Заголовки: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📄 Ответ (первые 200 символов): ${data.substring(0, 200)}...`);
        resolve({
          success: true,
          statusCode: res.statusCode,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Ошибка подключения: ${error.message}`);
      resolve({
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      console.log('⏰ Таймаут подключения (10 секунд)');
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout'
      });
    });
  });
}

// Тестируем приложение
async function testRailwayApp() {
  console.log('🔍 Проверка переменных окружения...');
  console.log(`RAILWAY_PUBLIC_DOMAIN: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'не установлена'}`);
  console.log(`PORT: ${process.env.PORT || 'не установлена'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'не установлена'}`);
  
  console.log('\n🌐 Тестирование подключения...');
  
  // Тестируем разные варианты URL
  const testUrls = [
    `https://${appUrl}`,
    `http://${appUrl}`,
    `https://${appUrl}:${process.env.PORT || 3000}`,
    `http://${appUrl}:${process.env.PORT || 3000}`
  ];
  
  for (const url of testUrls) {
    console.log(`\n🔗 Тестируем: ${url}`);
    const result = await testUrl(url);
    
    if (result.success) {
      console.log('✅ Приложение отвечает!');
      break;
    } else {
      console.log(`❌ Не удалось подключиться: ${result.error}`);
    }
  }
  
  console.log('\n=====================================');
  console.log('🎯 Тест завершен');
}

// Запускаем тест
testRailwayApp().catch(error => {
  console.log('❌ Ошибка тестирования:', error.message);
}); 