
// Система генерации случайных объектов мира

export function pseudoRandom(seed) {
  let s = seed >>> 0;
  return function() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Типы объектов мира
const objectTypes = [
  'Кристалл', 'Древний артефакт', 'Монолит', 'Портал', 'Туманность', 
  'Аномалия', 'Реликвия', 'Эхо сознания', 'Фрагмент памяти', 'Маяк разума'
];

const materials = [
  'Кристаллический', 'Металлический', 'Органический', 'Энергетический', 
  'Пси-материал', 'Нейропластик', 'Квантовый', 'Биомеханический'
];

const properties = [
  'Излучает слабое свечение', 'Пульсирует с периодичностью', 
  'Реагирует на прикосновение', 'Вибрирует при приближении',
  'Изменяет цвет в зависимости от настроения', 'Проектирует образы',
  'Содержит зашифрованное сообщение', 'Хранит фрагмент воспоминания',
  'Модифицирует гравитацию вокруг себя', 'Усиливает ментальные способности'
];

const locations = [
  'Пещеры разума', 'Плато сознания', 'Долина забвения', 'Пики интуиции',
  'Лабиринт подсознания', 'Острова воспоминаний', 'Равнины эмоций', 'Горизонт смыслов'
];

// Генерация случайного объекта мира
export function generateWorldObject(seed) {
  const rnd = pseudoRandom(seed || Date.now());

  // Выбираем случайные характеристики
  const type = objectTypes[Math.floor(rnd() * objectTypes.length)];
  const material = materials[Math.floor(rnd() * materials.length)];
  const property1 = properties[Math.floor(rnd() * properties.length)];
  let property2 = properties[Math.floor(rnd() * properties.length)];
  // Убедимся, что свойства не повторяются
  while (property2 === property1) {
    property2 = properties[Math.floor(rnd() * properties.length)];
  }
  const location = locations[Math.floor(rnd() * locations.length)];

  // Генерируем размеры
  const size = {
    width: Math.floor(10 + rnd() * 90),  // 10-100
    height: Math.floor(10 + rnd() * 90), // 10-100
    depth: Math.floor(10 + rnd() * 90)   // 10-100
  };

  // Генерируем цвет
  const hue = Math.floor(rnd() * 360);
  const saturation = Math.floor(50 + rnd() * 50);  // 50-100
  const lightness = Math.floor(30 + rnd() * 40);    // 30-70
  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  // Генерируем редкость
  const rarity = Math.floor(rnd() * 100);  // 0-99
  let rarityName;
  if (rarity < 60) rarityName = 'Обычный';
  else if (rarity < 85) rarityName = 'Необычный';
  else if (rarity < 95) rarityName = 'Редкий';
  else rarityName = 'Легендарный';

  // Создаем объект
  return {
    name: `${material} ${type}`,
    properties: [property1, property2],
    location,
    size,
    color,
    rarity: rarityName,
    seed: seed || Date.now()
  };
}

// Форматирование описания объекта для отображения
export function formatWorldObjectDescription(worldObject) {
  return `
${worldObject.name}

Местоположение: ${worldObject.location}

Свойства:
• ${worldObject.properties[0]}
• ${worldObject.properties[1]}

Физические характеристики:
• Ширина: ${worldObject.size.width} единиц
• Высота: ${worldObject.size.height} единиц
• Глубина: ${worldObject.size.depth} единиц

Внешний вид: ${worldObject.color}

Редкость: ${worldObject.rarity}

Код объекта: ${worldObject.seed}
  `.trim();
}
