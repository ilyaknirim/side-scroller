
// Модуль интеграции систем генерации персонажей и объектов мира

import { generateCharacter, formatCharacterDescription } from './character_generator.js';
import { generateWorldObject, formatWorldObjectDescription } from './world_generator.js';

// Генерация связанного набора: персонаж + объект мира + сессия
export function generateWorldSet(seed) {
  const characterSeed = seed || Math.floor(Math.random() * 0xffffffff);
  const worldObjectSeed = (seed || Math.floor(Math.random() * 0xffffffff)) + 1000;

  const character = generateCharacter(characterSeed);
  const worldObject = generateWorldObject(worldObjectSeed);

  return {
    character,
    worldObject,
    seed: seed || Date.now()
  };
}

// Форматирование полного описания набора
export function formatWorldSetDescription(worldSet) {
  return `
=== ПЕРСОНАЖ ===
${formatCharacterDescription(worldSet.character)}

=== ОБЪЕКТ МИРА ===
${formatWorldObjectDescription(worldSet.worldObject)}

=== СВЯЗЬ ===
Персонаж "${worldSet.character.name}" обнаруживает объект "${worldSet.worldObject.name}" в локации "${worldSet.worldObject.location}".
Это событие меняет его судьбу и открывает новые возможности в мире Ноосферы.

Сид генерации: ${worldSet.seed}
  `.trim();
}
