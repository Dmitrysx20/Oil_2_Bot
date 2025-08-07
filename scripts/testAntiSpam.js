const { antiSpam, getBlockMessage } = require('../src/middleware/antiSpam');
const logger = require('../src/utils/logger');

async function testAntiSpamSystem() {
  console.log('🛡️ Тестирование системы защиты от спама\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Тест 1: Нормальные сообщения
  console.log('📋 ТЕСТ 1: Нормальные сообщения');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const normalMessages = [
    {
      text: 'Привет! Как дела?',
      description: 'Обычное приветствие'
    },
    {
      text: 'Расскажи про лаванду',
      description: 'Запрос информации о масле'
    },
    {
      text: 'Нужна энергия, что посоветуешь?',
      description: 'Запрос рекомендаций'
    },
    {
      text: 'Спасибо за информацию! 🌿',
      description: 'Благодарность с эмодзи'
    }
  ];
  
  for (const msg of normalMessages) {
    const message = createTestMessage(msg.text, 12345);
    const result = antiSpam.checkMessage(message);
    
    console.log(`📝 "${msg.text}"`);
    console.log(`   ${msg.description}`);
    console.log(`   Результат: ${result.allowed ? '✅ РАЗРЕШЕНО' : '❌ ЗАБЛОКИРОВАНО'}`);
    if (!result.allowed) {
      console.log(`   Причина: ${result.reason}`);
      console.log(`   Сообщение: ${getBlockMessage(result.reason)}`);
    }
    console.log('');
  }
  
  console.log('─'.repeat(60) + '\n');
  
  // Тест 2: Спам-паттерны
  console.log('📋 ТЕСТ 2: Спам-паттерны');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const spamMessages = [
    {
      text: 'BUY NOW!!! EARN MONEY FAST!!! CLICK HERE!!!',
      description: 'Много заглавных букв + спам-ключевые слова'
    },
    {
      text: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      description: 'Повторяющиеся символы'
    },
    {
      text: 'https://spam.com https://fake.com https://scam.com',
      description: 'Много ссылок'
    },
    {
      text: '!@#$%^&*()!@#$%^&*()!@#$%^&*()!@#$%^&*()',
      description: 'Много спецсимволов'
    },
    {
      text: '1234567890123456789012345678901234567890',
      description: 'Много цифр'
    },
    {
      text: '          Слишком много пробелов          ',
      description: 'Много пробелов'
    }
  ];
  
  for (const msg of spamMessages) {
    const message = createTestMessage(msg.text, 12346);
    const result = antiSpam.checkMessage(message);
    
    console.log(`📝 "${msg.text}"`);
    console.log(`   ${msg.description}`);
    console.log(`   Результат: ${result.allowed ? '✅ РАЗРЕШЕНО' : '❌ ЗАБЛОКИРОВАНО'}`);
    if (!result.allowed) {
      console.log(`   Причина: ${result.reason}`);
      console.log(`   Сообщение: ${getBlockMessage(result.reason)}`);
    }
    console.log('');
  }
  
  console.log('─'.repeat(60) + '\n');
  
  // Тест 3: Слишком длинные сообщения
  console.log('📋 ТЕСТ 3: Слишком длинные сообщения');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const longMessage = 'Это очень длинное сообщение '.repeat(50) + 'которое превышает лимит символов';
  const message = createTestMessage(longMessage, 12347);
  const result = antiSpam.checkMessage(message);
  
  console.log(`📝 Длина: ${longMessage.length} символов`);
  console.log(`   Результат: ${result.allowed ? '✅ РАЗРЕШЕНО' : '❌ ЗАБЛОКИРОВАНО'}`);
  if (!result.allowed) {
    console.log(`   Причина: ${result.reason}`);
    console.log(`   Максимальная длина: ${result.maxLength}`);
    console.log(`   Сообщение: ${getBlockMessage(result.reason)}`);
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 4: Слишком много эмодзи
  console.log('📋 ТЕСТ 4: Слишком много эмодзи');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const emojiMessage = 'Привет! 🌿🌺🌸🌼🌻🌹🌷🌱🌲🌳🌴🌵🌾🌿🌺🌸🌼🌻🌹🌷🌱🌲🌳🌴🌵🌾';
  const emojiResult = antiSpam.checkMessage(createTestMessage(emojiMessage, 12348));
  
  console.log(`📝 "${emojiMessage}"`);
  console.log(`   Количество эмодзи: ${(emojiMessage.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length}`);
  console.log(`   Результат: ${emojiResult.allowed ? '✅ РАЗРЕШЕНО' : '❌ ЗАБЛОКИРОВАНО'}`);
  if (!emojiResult.allowed) {
    console.log(`   Причина: ${emojiResult.reason}`);
    console.log(`   Максимум эмодзи: ${emojiResult.maxEmojis}`);
    console.log(`   Сообщение: ${getBlockMessage(emojiResult.reason)}`);
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 5: Автоматизированные сообщения
  console.log('📋 ТЕСТ 5: Автоматизированные сообщения');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const automatedMessages = [
    {
      text: '[SYSTEM] Message sent at 14:30:25',
      description: 'Системное сообщение с временной меткой'
    },
    {
      text: '550e8400-e29b-41d4-a716-446655440000',
      description: 'UUID'
    },
    {
      text: '123456789012345678901234567890',
      description: 'Только цифры'
    },
    {
      text: 'abcabcabcabcabcabcabcabcabcabc',
      description: 'Повторяющийся паттерн'
    }
  ];
  
  for (const msg of automatedMessages) {
    const message = createTestMessage(msg.text, 12349);
    const result = antiSpam.checkMessage(message);
    
    console.log(`📝 "${msg.text}"`);
    console.log(`   ${msg.description}`);
    console.log(`   Результат: ${result.allowed ? '✅ РАЗРЕШЕНО' : '❌ ЗАБЛОКИРОВАНО'}`);
    if (!result.allowed) {
      console.log(`   Причина: ${result.reason}`);
      console.log(`   Сообщение: ${getBlockMessage(result.reason)}`);
    }
    console.log('');
  }
  
  console.log('─'.repeat(60) + '\n');
  
  // Тест 6: Rate limiting
  console.log('📋 ТЕСТ 6: Rate limiting (симуляция)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const testUserId = 12350;
  console.log(`👤 Тестируем пользователя ID: ${testUserId}`);
  
  // Симулируем быстрые сообщения
  for (let i = 1; i <= 12; i++) {
    const message = createTestMessage(`Сообщение ${i}`, testUserId);
    const result = antiSpam.checkMessage(message);
    
    console.log(`   ${i}. "${message.text}" - ${result.allowed ? '✅' : '❌'}`);
    
    if (!result.allowed && result.reason.includes('rate_limit')) {
      console.log(`   🚫 Превышен лимит! Причина: ${result.reason}`);
      console.log(`   ⏰ Повторить через: ${result.retryAfter} секунд`);
      break;
    }
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 7: Разные типы пользователей
  console.log('📋 ТЕСТ 7: Разные типы пользователей');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const userTypes = [
    { id: 802895688, type: 'Админ', description: 'Расширенные лимиты' },
    { id: 123456789, type: 'Новый пользователь', description: 'Строгие лимиты' },
    { id: 987654321, type: 'Обычный пользователь', description: 'Стандартные лимиты' }
  ];
  
  for (const user of userTypes) {
    const message = createTestMessage('Тестовое сообщение', user.id);
    const result = antiSpam.checkMessage(message);
    
    console.log(`👤 ${user.type} (ID: ${user.id})`);
    console.log(`   ${user.description}`);
    console.log(`   Результат: ${result.allowed ? '✅ РАЗРЕШЕНО' : '❌ ЗАБЛОКИРОВАНО'}`);
    console.log('');
  }
  
  console.log('─'.repeat(60) + '\n');
  
  // Статистика системы
  console.log('📊 СТАТИСТИКА СИСТЕМЫ ЗАЩИТЫ:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const stats = antiSpam.getStats();
  console.log(`👥 Всего пользователей: ${stats.totalUsers}`);
  console.log(`🚨 Подозрительных пользователей: ${stats.suspiciousUsers}`);
  console.log(`🚫 Заблокированных пользователей: ${stats.blockedUsers}`);
  
  console.log('\n📋 Настройки лимитов:');
  console.log('   Обычные пользователи:');
  console.log(`     • Сообщений в минуту: ${stats.config.normalLimits.messagesPerMinute}`);
  console.log(`     • Сообщений в час: ${stats.config.normalLimits.messagesPerHour}`);
  console.log(`     • Максимальная длина: ${stats.config.normalLimits.maxMessageLength}`);
  console.log(`     • Максимум эмодзи: ${stats.config.normalLimits.maxEmojisPerMessage}`);
  
  console.log('\n   Новые пользователи:');
  console.log(`     • Сообщений в минуту: ${stats.config.newUserLimits.messagesPerMinute}`);
  console.log(`     • Сообщений в час: ${stats.config.newUserLimits.messagesPerHour}`);
  console.log(`     • Максимальная длина: ${stats.config.newUserLimits.maxMessageLength}`);
  
  console.log('\n   Админы:');
  console.log(`     • Сообщений в минуту: ${stats.config.adminLimits.messagesPerMinute}`);
  console.log(`     • Сообщений в час: ${stats.config.adminLimits.messagesPerHour}`);
  console.log(`     • Максимальная длина: ${stats.config.adminLimits.maxMessageLength}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Рекомендации
  console.log('💡 РЕКОМЕНДАЦИИ ПО ЗАЩИТЕ ОТ СПАМА:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('🛡️ **Многоуровневая защита:**');
  console.log('   • Rate limiting по времени');
  console.log('   • Проверка содержимого сообщений');
  console.log('   • Обнаружение спам-паттернов');
  console.log('   • Анализ подозрительной активности');
  
  console.log('\n🎯 **Типы пользователей:**');
  console.log('   • Админы: расширенные лимиты');
  console.log('   • Новые пользователи: строгие лимиты');
  console.log('   • Обычные пользователи: стандартные лимиты');
  
  console.log('\n🚨 **Автоматические действия:**');
  console.log('   • Временная блокировка за нарушение');
  console.log('   • Уведомления админов о подозрительной активности');
  console.log('   • Автоматическая разблокировка через 24 часа');
  
  console.log('\n✅ Тестирование системы защиты от спама завершено!');
}

// Вспомогательная функция для создания тестового сообщения
function createTestMessage(text, userId) {
  return {
    chat: {
      id: userId
    },
    from: {
      id: userId,
      first_name: 'Тестовый',
      last_name: 'Пользователь',
      username: 'testuser'
    },
    text: text,
    date: Math.floor(Date.now() / 1000)
  };
}

// Запускаем тест
if (require.main === module) {
  testAntiSpamSystem().catch(console.error);
}

module.exports = { testAntiSpamSystem }; 