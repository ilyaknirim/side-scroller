import {
  generateSessionParameters,
  generateSessionName,
  generateMicroStory,
  renderLevelPreview,
} from '../systems/proc_gen.js';
import { generateCharacter } from '../systems/character_generator.js';
import { generateWorldSet } from '../systems/integration.js';
import {
  setCurrentSession,
  setCurrentCharacter,
  setCurrentWorldSet,
  setCurrentSeed,
  getCurrentSession,
  getCurrentCharacter,
  getCurrentWorldSet,
  getCurrentSeed,
  resetState,
} from './state.js';
import {
  menuEl,
  sessionEl,
  characterEl,
  worldsetEl,
  gameLauncherEl,
  seedInput,
  sessionText,
  characterText,
  worldsetText,
  launchMsg,
  gameRoot,
  stopGameBtn,
} from './ui_elements.js';
import { showSession, showCharacter, showWorldSet } from './views.js';
import { downloadFile } from './utils.js';

// Event handlers
export function handleGenerateSession() {
  const seed = seedInput.value ? parseInt(seedInput.value) : null;
  setCurrentSeed(seed);
  const session = generateSessionParameters(seed);
  setCurrentSession(session);
  showSession();
}

export function handleGenerateCharacter() {
  const seed = seedInput.value ? parseFloat(seedInput.value) : Math.random();
  setCurrentSeed(seed);
  const character = generateCharacter(seed);
  setCurrentCharacter(character);
  showCharacter();
}

export function handleGenerateWorldSet() {
  const seed = seedInput.value ? parseFloat(seedInput.value) : Math.random();
  setCurrentSeed(seed);
  const worldSet = generateWorldSet(seed);
  setCurrentWorldSet(worldSet);
  showWorldSet();
}

export function handleRegenerateSession() {
  const session = generateSessionParameters(getCurrentSeed());
  setCurrentSession(session);
  showSession();
}

export function handleRegenerateCharacter() {
  const character = generateCharacter(getCurrentSeed());
  setCurrentCharacter(character);
  showCharacter();
}

export function handleRegenerateWorldSet() {
  const worldSet = generateWorldSet(getCurrentSeed());
  setCurrentWorldSet(worldSet);
  showWorldSet();
}

export function handlePlaySession() {
  const currentSession = getCurrentSession();
  if (!currentSession) return;

  // Show game launcher
  gameLauncherEl.classList.remove('hidden');
  launchMsg.textContent = `Запуск сессии: ${generateSessionName(
    currentSession.theme,
    currentSession.modifiers,
    currentSession.seed
  )}`;

  // Render level preview
  const previewContainer = document.createElement('div');
  previewContainer.style.margin = '10px 0';
  renderLevelPreview(previewContainer, currentSession.level);
  launchMsg.appendChild(previewContainer);

  // For now, just show a placeholder - actual game integration would go here
  gameRoot.innerHTML = '<p>Игра загружается... (демо режим)</p>';
  stopGameBtn.classList.remove('hidden');
}

export function handleStopGame() {
  gameLauncherEl.classList.add('hidden');
  gameRoot.innerHTML = '';
  stopGameBtn.classList.add('hidden');
}

export function handleDownloadSession() {
  const currentSession = getCurrentSession();
  if (!currentSession) return;
  const content = formatSessionText(currentSession);
  downloadFile('session.txt', content);
}

export function handleDownloadCharacter() {
  const currentCharacter = getCurrentCharacter();
  if (!currentCharacter) return;
  const content = formatCharacterDescription(currentCharacter);
  downloadFile('character.txt', content);
}

export function handleDownloadWorldSet() {
  const currentWorldSet = getCurrentWorldSet();
  if (!currentWorldSet) return;
  const content = formatWorldSetDescription(currentWorldSet);
  downloadFile('worldset.txt', content);
}

export function handleSendSession() {
  const currentSession = getCurrentSession();
  if (!currentSession) return;

  // Telegram WebApp integration
  if (window.Telegram && window.Telegram.WebApp) {
    const data = {
      session: currentSession,
      timestamp: Date.now(),
    };
    window.Telegram.WebApp.sendData(JSON.stringify(data));
  } else {
    // Fallback: copy to clipboard
    const content = JSON.stringify(currentSession, null, 2);
    navigator.clipboard.writeText(content).then(() => {
      alert('Данные сессии скопированы в буфер обмена');
    });
  }
}

export function handleBackToMenu() {
  sessionEl.classList.add('hidden');
  characterEl.classList.add('hidden');
  worldsetEl.classList.add('hidden');
  gameLauncherEl.classList.add('hidden');
  menuEl.style.display = 'block';
  resetState();
}

// Helper functions for formatting
function formatSessionText(session) {
  return `Тема: ${session.theme}
Сложность: ${session.difficulty}
Модификаторы: ${session.modifiers.join(', ')}
Seed: ${session.seed}
Уровень: гравитация=${session.level.gravity.toFixed(2)}, зазор=${
    session.level.gap
  }, скорость=${session.level.speed.toFixed(2)}`;
}

function formatCharacterDescription(character) {
  // Import here to avoid circular dependency
  const { formatCharacterDescription } = require('../systems/character_generator.js');
  return formatCharacterDescription(character);
}

function formatWorldSetDescription(worldSet) {
  // Import here to avoid circular dependency
  const { formatWorldSetDescription } = require('../systems/integration.js');
  return formatWorldSetDescription(worldSet);
}
