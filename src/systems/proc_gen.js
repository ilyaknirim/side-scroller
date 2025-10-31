import { pseudoRandom } from '../utils/random.js';
export function generateSessionParameters(seed, opts = {}) {
  const rnd = pseudoRandom(seed || Date.now());
  const themes = [
    'Поток сознания',
    'Хроногнозия',
    'Семантические сети',
    'Метакогниция',
    'Аффективный ландшафт',
    'Перцептуальные сдвиги',
  ];
  const modifiers = [
    'Инверсия восприятия',
    'Туннельное зрение',
    'Хроматическая адаптация',
    'Рабочая память',
    'Разделение внимания',
    'Когнитивная нагрузка',
    'Ментальные вращения',
    'Когнитивные искажения',
    'Эмоциональные барьеры',
    'Локальные временные поля',
    'Проприоцептивный дрифт',
    'Мнемонические якоря',
  ];
  const theme = opts.theme || themes[Math.floor(rnd() * themes.length)];
  const difficulty = opts.difficulty || 1 + Math.floor(rnd() * 5);
  const modCount = 1 + Math.floor(rnd() * 3);
  const mods = [];
  const used = new Set();
  while (mods.length < modCount) {
    const m = modifiers[Math.floor(rnd() * modifiers.length)];
    if (!used.has(m)) {
      used.add(m);
      mods.push(m);
    }
  }
  const level = {
    gravity: 0.5 + rnd() * 1.2 * (1 + (difficulty - 1) * 0.15),
    gap: Math.round(80 + (rnd() * 160) / difficulty),
    speed: 2 + rnd() * 3 * (1 + (difficulty - 1) * 0.2),
    colorSeed: Math.floor(rnd() * 360),
  };
  return { seed: seed || Date.now(), theme, difficulty, modifiers: mods, level };
}
export const CHAOTIC_MODIFIERS = [
  'Инверсия управления',
  'Гравитационные всплески',
  'Телепорт-хаос',
  'Дрейф платформ',
  'Туннельное зрение',
];

export function generateSessionName(theme, modifiers, seed) {
  const titles = ['Поток', 'Эхо', 'Зазеркалье', 'Катарсис', 'Резонанс', 'Хаос'];
  const t = titles[seed % titles.length] || titles[0];
  return `${t} — ${theme}`;
}

export function applyMoodFromModifiers(modifiers) {
  // returns 0..1 mood intensity (higher - more intense)
  let mood = 0.2;
  modifiers.forEach((m) => {
    if (m.includes('Инверсия') || m.includes('Гравита')) mood += 0.2;
    if (m.includes('Аффектив') || m.includes('Эмоцион')) mood += 0.15;
    if (m.includes('Телепорт') || m.includes('Дрейф')) mood += 0.1;
  });
  return Math.min(1, mood);
}

export function renderLevelPreview(container, level) {
  // create small canvas preview (mini-map) for level params
  const w = 240,
    h = 80;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.style.borderRadius = '6px';
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  // background based on colorSeed
  const hue = level && level.colorSeed ? level.colorSeed % 360 : 200;
  ctx.fillStyle = `hsl(${hue} 60% 8%)`;
  ctx.fillRect(0, 0, w, h);
  // draw ground/obstacles as simple shapes using seed
  const rnd = pseudoRandom(level && level.seed ? level.seed : Date.now());
  for (let i = 0; i < 8; i++) {
    const x = i * (w / 8) + 6;
    const hgt = 10 + Math.floor(rnd() * 40);
    ctx.fillStyle = `hsl(${(hue + i * 12) % 360} 70% 40%)`;
    ctx.fillRect(x, h - hgt - 8, w / 8 - 10, hgt);
  }
  // attach
  container.appendChild(canvas);
  return canvas;
}

export function generateMicroStory(theme, modifiers, seed) {
  const intros = ['Сегодня ты —', 'Ночь шепчет:', 'Перед тобой —'];
  const roles = [
    'исследователь памяти',
    'архитектор сновидений',
    'скиталец мыслей',
    'хранитель якорей',
  ];
  const verbs = ['ищет', 'переплетает', 'откладывает', 'воскрешает'];
  const objs = ['воспоминания', 'ассоциации', 'эмоции', 'узлы смысла'];
  const rnd = pseudoRandom(seed || Date.now());
  const intro = intros[Math.floor(rnd() * intros.length)];
  const role = roles[Math.floor(rnd() * roles.length)];
  const verb = verbs[Math.floor(rnd() * verbs.length)];
  const obj = objs[Math.floor(rnd() * objs.length)];
  return `${intro} ${role}, который ${verb} ${obj}. Тема: ${theme}. Модификаторы: ${modifiers.join(
    ', '
  )}`;
}
