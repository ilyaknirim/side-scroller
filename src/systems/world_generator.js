// Генератор миров - создание объектов мира

// Псевдослучайная функция
export function pseudoRandom(seed) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return function() {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

// Функция для генерации объекта мира
export function generateWorldObject(seed = Math.random()) {
  const types = ['tree', 'rock', 'building', 'vehicle', 'creature', 'artifact'];
  const materials = ['wood', 'stone', 'metal', 'crystal', 'organic', 'energy'];

  const rnd = pseudoRandom(seed);
  const type = types[Math.floor(rnd() * types.length)];
  const material = materials[Math.floor(rnd() * materials.length)];

  return {
    id: `obj_${Math.floor(seed * 10000)}`,
    type,
    material,
    seed,
    size: Math.floor(rnd() * 100) + 10,
    rarity: Math.floor(rnd() * 5) + 1,
    properties: [
      rnd() > 0.5 ? 'interactive' : null,
      rnd() > 0.7 ? 'destructible' : null,
      rnd() > 0.8 ? 'movable' : null
    ].filter(Boolean)
  };
}

// Функция для форматирования описания объекта мира
export function formatWorldObjectDescription(worldObject) {
  const props = worldObject.properties.join(', ');
  return `${worldObject.material} ${worldObject.type} (size: ${worldObject.size}, rarity: ${worldObject.rarity}${props ? ', ' + props : ''}) seed: ${worldObject.seed}`;
}
