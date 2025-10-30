
export const MEDITATIONS = [
  'Собери 3 мнемонических якоря в этой сессии.',
  'Держи эмоциональный заряд на среднем уровне 30 секунд.',
  'Найди 2 ассоциативные цепочки подряд.',
  'Не используй перемотку времени более 2 раз.'
];
export function pickMeditation(seed){ const rnd = (s=>()=>{ s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; })(seed||Date.now()); return MEDITATIONS[Math.floor(rnd()*MEDITATIONS.length)]; }
