// Level generation system
export function generateLevel(seed) {
  return {
    id: `level_${seed}`,
    platforms: [],
    enemies: [],
    collectibles: []
  };
}

export function formatLevelDescription(level) {
  return `Level ${level.id}`;
}
