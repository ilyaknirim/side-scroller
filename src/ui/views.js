import { generateSessionName, generateMicroStory } from '../systems/proc_gen.js';
import { formatCharacterDescription } from '../systems/character_generator.js';
import { formatWorldSetDescription } from '../systems/integration.js';
import { getCurrentSession, getCurrentCharacter, getCurrentWorldSet } from './state.js';
import {
  menuEl,
  sessionEl,
  characterEl,
  worldsetEl,
  sessionText,
  characterText,
  worldsetText,
} from './ui_elements.js';

// UI functions
export function showSession() {
  const currentSession = getCurrentSession();
  if (!currentSession) return;

  const sessionName = generateSessionName(
    currentSession.theme,
    currentSession.modifiers,
    currentSession.seed
  );
  const microStory = generateMicroStory(
    currentSession.theme,
    currentSession.modifiers,
    currentSession.seed
  );

  sessionText.textContent = `Название: ${sessionName}\n\n${formatSessionText(
    currentSession
  )}\n\nИстория: ${microStory}`;

  menuEl.style.display = 'none';
  sessionEl.classList.remove('hidden');
}

export function showCharacter() {
  const currentCharacter = getCurrentCharacter();
  if (!currentCharacter) return;

  characterText.textContent = formatCharacterDescription(currentCharacter);

  menuEl.style.display = 'none';
  characterEl.classList.remove('hidden');
}

export function showWorldSet() {
  const currentWorldSet = getCurrentWorldSet();
  if (!currentWorldSet) return;

  worldsetText.textContent = formatWorldSetDescription(currentWorldSet);

  menuEl.style.display = 'none';
  worldsetEl.classList.remove('hidden');
}

function formatSessionText(session) {
  return `Тема: ${session.theme}
Сложность: ${session.difficulty}
Модификаторы: ${session.modifiers.join(', ')}
Seed: ${session.seed}
Уровень: гравитация=${session.level.gravity.toFixed(2)}, зазор=${
    session.level.gap
  }, скорость=${session.level.speed.toFixed(2)}`;
}
