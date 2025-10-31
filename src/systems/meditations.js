// Система медитаций - мини-цели для сессий

// Список доступных медитаций
export const MEDITATIONS = [
  {
    id: 'focus',
    title: 'Focus Meditation',
    description: 'Maintain concentration for 30 seconds',
    duration: 30,
    reward: 'clarity',
  },
  {
    id: 'breath',
    title: 'Breath Awareness',
    description: 'Follow your breathing pattern',
    duration: 60,
    reward: 'calm',
  },
  {
    id: 'mindfulness',
    title: 'Mindful Observation',
    description: 'Observe thoughts without judgment',
    duration: 45,
    reward: 'awareness',
  },
  {
    id: 'gratitude',
    title: 'Gratitude Practice',
    description: "Reflect on three things you're grateful for",
    duration: 90,
    reward: 'positivity',
  },
  {
    id: 'body_scan',
    title: 'Body Scan',
    description: 'Systematically relax each part of your body',
    duration: 120,
    reward: 'relaxation',
  },
];

// Функция для выбора медитации
export function pickMeditation(seed = Math.random()) {
  const index = Math.floor(seed * MEDITATIONS.length);
  return MEDITATIONS[index];
}
