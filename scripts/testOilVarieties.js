const OilService = require('../src/services/OilService');
const config = require('../config');

console.log('🌿 Тестирование различных видов масел');
console.log('='.repeat(50));

// Инициализация сервиса
const oilService = new OilService();

// Проверка конфигурации
console.log('\n📋 Проверка конфигурации:');
console.log('─'.repeat(30));

if (!config.supabase.url || !config.supabase.key) {
    console.log('⚠️ Supabase credentials not configured - будет использоваться mock режим');
    console.log('💡 Для полного тестирования установите SUPABASE_URL и SUPABASE_ANON_KEY');
} else {
    console.log('✅ Supabase credentials found - будет использоваться реальная база данных');
}

// Тест 1: Поиск различных видов мяты
console.log('\n📋 Тест 1: Поиск различных видов мяты');
console.log('─'.repeat(30));

(async () => {
    const mintVarieties = ['мята перечная', 'мята садовая', 'мята лимонная', 'мята'];
    
    for (const variety of mintVarieties) {
        console.log(`🔍 Поиск: "${variety}"`);
        const result = await oilService.searchOils(variety);
        
        if (result.success) {
            console.log(`   ✅ Найдено ${result.data.length} масел`);
            result.data.forEach((oil, index) => {
                console.log(`      ${index + 1}. ${oil.oil_name}`);
                console.log(`         Эффект: ${oil.emotional_effect}`);
                console.log(`         Применение: ${oil.applications}`);
            });
        } else {
            console.log(`   ❌ Ошибка: ${result.error}`);
        }
        console.log('');
    }
})();

// Тест 2: Сравнение различных видов лаванды
console.log('\n📋 Тест 2: Сравнение различных видов лаванды');
console.log('─'.repeat(30));

(async () => {
    const lavenderVarieties = ['лаванда', 'лаванда узколистная'];
    
    for (const variety of lavenderVarieties) {
        console.log(`🔍 Поиск: "${variety}"`);
        const result = await oilService.searchOils(variety);
        
        if (result.success) {
            console.log(`   ✅ Найдено ${result.data.length} масел`);
            result.data.forEach((oil, index) => {
                console.log(`      ${index + 1}. ${oil.oil_name}`);
                console.log(`         Описание: ${oil.description}`);
                console.log(`         Эмоциональный эффект: ${oil.emotional_effect}`);
                console.log(`         Физический эффект: ${oil.physical_effect}`);
                console.log(`         Безопасность: ${oil.safety_warning}`);
            });
        } else {
            console.log(`   ❌ Ошибка: ${result.error}`);
        }
        console.log('');
    }
})();

// Тест 3: Сравнение различных видов эвкалипта
console.log('\n📋 Тест 3: Сравнение различных видов эвкалипта');
console.log('─'.repeat(30));

(async () => {
    const eucalyptusVarieties = ['эвкалипт', 'эвкалипт лучистый'];
    
    for (const variety of eucalyptusVarieties) {
        console.log(`🔍 Поиск: "${variety}"`);
        const result = await oilService.searchOils(variety);
        
        if (result.success) {
            console.log(`   ✅ Найдено ${result.data.length} масел`);
            result.data.forEach((oil, index) => {
                console.log(`      ${index + 1}. ${oil.oil_name}`);
                console.log(`         Описание: ${oil.description}`);
                console.log(`         Применение: ${oil.applications}`);
                console.log(`         Безопасность: ${oil.safety_warning}`);
            });
        } else {
            console.log(`   ❌ Ошибка: ${result.error}`);
        }
        console.log('');
    }
})();

// Тест 4: Сравнение различных видов ромашки
console.log('\n📋 Тест 4: Сравнение различных видов ромашки');
console.log('─'.repeat(30));

(async () => {
    const chamomileVarieties = ['ромашка римская', 'ромашка немецкая', 'ромашка'];
    
    for (const variety of chamomileVarieties) {
        console.log(`🔍 Поиск: "${variety}"`);
        const result = await oilService.searchOils(variety);
        
        if (result.success) {
            console.log(`   ✅ Найдено ${result.data.length} масел`);
            result.data.forEach((oil, index) => {
                console.log(`      ${index + 1}. ${oil.oil_name}`);
                console.log(`         Описание: ${oil.description}`);
                console.log(`         Эмоциональный эффект: ${oil.emotional_effect}`);
                console.log(`         Физический эффект: ${oil.physical_effect}`);
            });
        } else {
            console.log(`   ❌ Ошибка: ${result.error}`);
        }
        console.log('');
    }
})();

// Тест 5: Поиск по эффектам для разных видов
console.log('\n📋 Тест 5: Поиск по эффектам для разных видов');
console.log('─'.repeat(30));

(async () => {
    const effectTests = [
        { effect: 'сон', description: 'Масла для улучшения сна' },
        { effect: 'стресс', description: 'Масла для снятия стресса' },
        { effect: 'головная боль', description: 'Масла от головной боли' },
        { effect: 'дыхание', description: 'Масла для дыхания' },
        { effect: 'кожа', description: 'Масла для ухода за кожей' }
    ];
    
    for (const test of effectTests) {
        console.log(`🔍 ${test.description}: "${test.effect}"`);
        
        // Поиск по эмоциональному эффекту
        const emotionalResult = await oilService.getOilsByEffect('emotional', test.effect);
        if (emotionalResult.success && emotionalResult.data.length > 0) {
            console.log(`   💭 Эмоциональный эффект (${emotionalResult.data.length} масел):`);
            emotionalResult.data.forEach((oil, index) => {
                console.log(`      ${index + 1}. ${oil.oil_name}`);
            });
        }
        
        // Поиск по физическому эффекту
        const physicalResult = await oilService.getOilsByEffect('physical', test.effect);
        if (physicalResult.success && physicalResult.data.length > 0) {
            console.log(`   💪 Физический эффект (${physicalResult.data.length} масел):`);
            physicalResult.data.forEach((oil, index) => {
                console.log(`      ${index + 1}. ${oil.oil_name}`);
            });
        }
        
        if ((!emotionalResult.success || emotionalResult.data.length === 0) && 
            (!physicalResult.success || physicalResult.data.length === 0)) {
            console.log(`   ❌ Масла с эффектом "${test.effect}" не найдены`);
        }
        console.log('');
    }
})();

// Тест 6: Получение конкретных масел по названию
console.log('\n📋 Тест 6: Получение конкретных масел по названию');
console.log('─'.repeat(30));

(async () => {
    const specificOils = [
        'Мята перечная',
        'Мята садовая', 
        'Мята лимонная',
        'Лаванда узколистная',
        'Эвкалипт лучистый',
        'Ромашка немецкая'
    ];
    
    for (const oilName of specificOils) {
        console.log(`🔍 Получение масла: "${oilName}"`);
        const result = await oilService.getOilByName(oilName);
        
        if (result.success && result.data) {
            console.log(`   ✅ Найдено: ${result.data.oil_name}`);
            console.log(`      Описание: ${result.data.description}`);
            console.log(`      Ключевые слова: ${result.data.keywords}`);
            console.log(`      Применение: ${result.data.applications}`);
            console.log(`      Шутка: ${result.data.joke}`);
        } else {
            console.log(`   ❌ Масло не найдено`);
        }
        console.log('');
    }
})();

// Тест 7: Форматирование сообщений для разных видов
console.log('\n📋 Тест 7: Форматирование сообщений для разных видов');
console.log('─'.repeat(30));

(async () => {
    const testOils = ['Мята перечная', 'Лаванда узколистная', 'Эвкалипт лучистый'];
    
    for (const oilName of testOils) {
        console.log(`📝 Форматирование для: "${oilName}"`);
        const result = await oilService.getOilByName(oilName);
        
        if (result.success && result.data) {
            console.log('   📋 Краткий предпросмотр:');
            console.log(`   ${oilService.formatOilPreview(result.data)}`);
            console.log('\n   📄 Полное сообщение:');
            console.log(oilService.formatOilMessage(result.data));
        } else {
            console.log(`   ❌ Масло не найдено`);
        }
        console.log('\n' + '─'.repeat(40) + '\n');
    }
})();

// Тест 8: Статистика по видам масел
console.log('\n📋 Тест 8: Статистика по видам масел');
console.log('─'.repeat(30));

(async () => {
    const result = await oilService.getAllOils();
    if (result.success) {
        console.log('📊 Статистика по видам масел:');
        
        // Группировка по типам
        const oilTypes = {
            'Мята': result.data.filter(oil => oil.oil_name.toLowerCase().includes('мята')),
            'Лаванда': result.data.filter(oil => oil.oil_name.toLowerCase().includes('лаванда')),
            'Эвкалипт': result.data.filter(oil => oil.oil_name.toLowerCase().includes('эвкалипт')),
            'Ромашка': result.data.filter(oil => oil.oil_name.toLowerCase().includes('ромашка')),
            'Цитрусовые': result.data.filter(oil => oil.oil_name.toLowerCase().includes('апельсин') || oil.oil_name.toLowerCase().includes('лимон')),
            'Другие': result.data.filter(oil => 
                !oil.oil_name.toLowerCase().includes('мята') &&
                !oil.oil_name.toLowerCase().includes('лаванда') &&
                !oil.oil_name.toLowerCase().includes('эвкалипт') &&
                !oil.oil_name.toLowerCase().includes('ромашка') &&
                !oil.oil_name.toLowerCase().includes('апельсин') &&
                !oil.oil_name.toLowerCase().includes('лимон')
            )
        };
        
        Object.entries(oilTypes).forEach(([type, oils]) => {
            if (oils.length > 0) {
                console.log(`   ${type}: ${oils.length} масел`);
                oils.forEach(oil => {
                    console.log(`      - ${oil.oil_name}`);
                });
            }
        });
        
        console.log(`\n📈 Общая статистика:`);
        console.log(`   Всего масел: ${result.data.length}`);
        console.log(`   Уникальных видов: ${new Set(result.data.map(oil => oil.oil_name.split(' ')[0])).size}`);
        console.log(`   Масла с шутками: ${result.data.filter(oil => oil.joke).length}`);
        console.log(`   Масла с предупреждениями: ${result.data.filter(oil => oil.safety_warning).length}`);
    } else {
        console.log(`❌ Ошибка получения статистики: ${result.error}`);
    }
})();

console.log('\n🎉 Тестирование различных видов масел завершено!');
console.log('='.repeat(50)); 