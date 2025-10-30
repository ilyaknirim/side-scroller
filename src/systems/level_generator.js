// Система процедурной генерации уровней с тематическими зонами

import { pseudoRandom } from './proc_gen.js';

// Тематические зоны для уровней
const THEMATIC_ZONES = [
  {
    name: 'Зона размышлений',
    color: '#4a5f7a',
    obstacles: ['мыслительные барьеры', 'ментальные блоки'],
    platforms: ['рефлексивные платформы', 'когнитивные мосты'],
    modifiers: ['замедление времени', 'инверсия восприятия']
  },
  {
    name: 'Эмоциональный ландшафт',
    color: '#a45c7c',
    obstacles: ['эмоциональные барьеры', 'аффективные ловушки'],
    platforms: ['эмпатические мосты', 'чувствительные опоры'],
    modifiers: ['эмоциональные резонансы', 'настроение-зависимость']
  },
  {
    name: 'Поток сознания',
    color: '#6a8caf',
    obstacles: ['ментальные вихри', 'разрывы в потоке'],
    platforms: ['ассоциативные цепи', 'логические переходы'],
    modifiers: ['ускорение мышления', 'туннельное сознание']
  },
  {
    name: 'Памяти лабиринт',
    color: '#8a6b4f',
    obstacles: ['забытые воспоминания', 'ложные образы'],
    platforms: ['мнемонические якоря', 'памятные опоры'],
    modifiers: ['провалы в памяти', 'вспышки прошлого']
  },
  {
    name: 'Интуиции сфера',
    color: '#7d6ba8',
    obstacles: ['интуитивные разрывы', 'неопределенности'],
    platforms: ['интуитивные мосты', 'озарения'],
    modifiers: ['предчувствия', 'инсайт-ускорение']
  }
];

// Генератор уровня на основе параметров
export function generateLevel(seed, options = {}) {
  const rnd = pseudoRandom(seed || Date.now());

  // Определяем количество зон
  const zoneCount = options.zoneCount || (1 + Math.floor(rnd() * 3)); // 1-3 зоны

  // Выбираем зоны
  const selectedZones = [];
  const availableZones = [...THEMATIC_ZONES];

  for (let i = 0; i < zoneCount && availableZones.length > 0; i++) {
    const idx = Math.floor(rnd() * availableZones.length);
    selectedZones.push(availableZones[idx]);
    availableZones.splice(idx, 1);
  }

  // Создаем структуру уровня
  const level = {
    seed: seed || Date.now(),
    name: options.name || generateLevelName(seed),
    zones: [],
    difficulty: options.difficulty || (1 + Math.floor(rnd() * 5)),
    modifiers: options.modifiers || [],
    totalLength: options.totalLength || (2000 + Math.floor(rnd() * 3000))
  };

  // Генерируем каждую зону
  let currentPosition = 0;
  for (let i = 0; i < selectedZones.length; i++) {
    const zone = selectedZones[i];
    const zoneLength = Math.floor(level.totalLength / selectedZones.length);

    // Генерируем секции внутри зоны
    const sections = generateZoneSections(rnd, zone, currentPosition, zoneLength);

    level.zones.push({
      name: zone.name,
      color: zone.color,
      startPosition: currentPosition,
      endPosition: currentPosition + zoneLength,
      sections: sections,
      obstacles: zone.obstacles,
      platforms: zone.platforms,
      modifiers: zone.modifiers
    });

    currentPosition += zoneLength;
  }

  return level;
}

// Генерация имени уровня
function generateLevelName(seed) {
  const rnd = pseudoRandom(seed);
  const prefixes = ['Путь', 'Лабиринт', 'Путешествие', 'Исследование', 'Поиск'];
  const suffixes = ['Разума', 'Сознания', 'Памяти', 'Интуиции', 'Эмоций'];

  const prefix = prefixes[Math.floor(rnd() * prefixes.length)];
  const suffix = suffixes[Math.floor(rnd() * suffixes.length)];

  return `${prefix} ${suffix}`;
}

// Генерация секций внутри зоны
function generateZoneSections(rnd, zone, startPosition, zoneLength) {
  const sections = [];
  const sectionCount = 3 + Math.floor(rnd() * 4); // 3-6 секций на зону
  const sectionLength = Math.floor(zoneLength / sectionCount);

  for (let i = 0; i < sectionCount; i++) {
    const position = startPosition + i * sectionLength;

    // Определяем тип секции
    const sectionTypes = ['платформы', 'препятствия', 'смешанная', 'отдых'];
    const sectionType = sectionTypes[Math.floor(rnd() * sectionTypes.length)];

    // Генерируем элементы секции
    const elements = generateSectionElements(rnd, zone, sectionType, sectionLength);

    sections.push({
      type: sectionType,
      position: position,
      length: sectionLength,
      elements: elements
    });
  }

  return sections;
}

// Генерация элементов секции
function generateSectionElements(rnd, zone, sectionType, sectionLength) {
  const elements = [];
  const elementCount = 2 + Math.floor(rnd() * 5); // 2-6 элементов на секцию

  for (let i = 0; i < elementCount; i++) {
    const position = Math.floor(rnd() * sectionLength);

    let element;
    if (sectionType === 'платформы' || (sectionType === 'смешанная' && rnd() > 0.5)) {
      // Создаем платформу
      const platformType = zone.platforms[Math.floor(rnd() * zone.platforms.length)];
      element = {
        type: 'platform',
        name: platformType,
        position: position,
        width: 40 + Math.floor(rnd() * 80), // 40-120 пикселей
        height: 10 + Math.floor(rnd() * 20), // 10-30 пикселей
        properties: {
          color: zone.color,
          moving: rnd() > 0.7,
          fading: rnd() > 0.8,
          special: rnd() > 0.9
        }
      };
    } else {
      // Создаем препятствие
      const obstacleType = zone.obstacles[Math.floor(rnd() * zone.obstacles.length)];
      element = {
        type: 'obstacle',
        name: obstacleType,
        position: position,
        width: 20 + Math.floor(rnd() * 40), // 20-60 пикселей
        height: 20 + Math.floor(rnd() * 40), // 20-60 пикселей
        properties: {
          color: zone.color,
          moving: rnd() > 0.6,
          damage: rnd() > 0.7,
          special: rnd() > 0.8
        }
      };
    }

    elements.push(element);
  }

  // Сортируем элементы по позиции
  elements.sort((a, b) => a.position - b.position);

  return elements;
}

// Форматирование описания уровня для отображения
export function formatLevelDescription(level) {
  let description = `=== УРОВЕНЬ: ${level.name} ===\n\n`;
  description += `Сложность: ${level.difficulty}/5\n`;
  description += `Длина: ${level.totalLength} единиц\n`;
  description += `Количество зон: ${level.zones.length}\n\n`;

  level.zones.forEach((zone, index) => {
    description += `--- ЗОНА ${index + 1}: ${zone.name} ---\n`;
    description += `Позиция: ${zone.startPosition} - ${zone.endPosition}\n`;
    description += `Цвет: ${zone.color}\n`;
    description += `Типы платформ: ${zone.platforms.join(', ')}\n`;
    description += `Типы препятствий: ${zone.obstacles.join(', ')}\n`;
    description += `Модификаторы: ${zone.modifiers.join(', ')}\n\n`;
  });

  return description;
}
