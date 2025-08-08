const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('🔄 Конвертирую Excel файл с маслами в JSON...');

// Читаем Excel файл
const workbook = XLSX.readFile(path.join(__dirname, '../src/data/doterra_120_oils_ru.xlsx'));

// Получаем первый лист
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Конвертируем в JSON
const oils = XLSX.utils.sheet_to_json(worksheet);

console.log(`📊 Найдено ${oils.length} масел`);

// Показываем структуру первого масла
if (oils.length > 0) {
  console.log('📋 Структура данных:');
  console.log(Object.keys(oils[0]));
  console.log('\n🔍 Пример первого масла:');
  console.log(JSON.stringify(oils[0], null, 2));
}

// Сохраняем в JSON файл
const outputPath = path.join(__dirname, '../src/data/essential_oils.json');
fs.writeFileSync(outputPath, JSON.stringify(oils, null, 2));

console.log(`✅ Конвертация завершена! Файл сохранен: ${outputPath}`);
console.log(`📁 Размер файла: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
