import { generateSessionParameters, generateSessionName, generateMicroStory, renderLevelPreview } from '../systems/proc_gen.js';
import { generateCharacter, formatCharacterDescription } from '../systems/character_generator.js';
import { generateWorldSet, formatWorldSetDescription } from '../systems/integration.js';

// State management
let currentSession = null;
let currentCharacter = null;
let currentWorldSet = null;
let currentSeed = null;

// DOM elements
let menuEl, sessionEl, characterEl, worldsetEl, gameLauncherEl;
let seedInput, generateBtn, characterBtn, worldsetBtn;
let sessionText, regenBtn, playBtn, downloadBtn, sendBtn, backBtn;
let characterText, regenCharacterBtn, downloadCharacterBtn, backCharacterBtn;
let worldsetText, regenWorldsetBtn, downloadWorldsetBtn, backWorldsetBtn;
let launchMsg, gameRoot, stopGameBtn;

// Initialize the application
export function initApp() {
  // Get DOM elements
  menuEl = document.getElementById('menu');
  sessionEl = document.getElementById('session');
  characterEl = document.getElementById('character');
  worldsetEl = document.getElementById('worldset');
  gameLauncherEl = document.getElementById('game-launcher');

  seedInput = document.getElementById('seed-input');
  generateBtn = document.getElementById('generate-btn');
  characterBtn = document.getElementById('character-btn');
  worldsetBtn = document.getElementById('worldset-btn');

  sessionText = document.getElementById('session-text');
  regenBtn = document.getElementById('regen-btn');
  playBtn = document.getElementById('play-btn');
  downloadBtn = document.getElementById('download-btn');
  sendBtn = document.getElementById('send-btn');
  backBtn = document.getElementById('back-btn');

  characterText = document.getElementById('character-text');
  regenCharacterBtn = document.getElementById('regen-character-btn');
  downloadCharacterBtn = document.getElementById('download-character-btn');
  backCharacterBtn = document.getElementById('back-character-btn');

  worldsetText = document.getElementById('worldset-text');
  regenWorldsetBtn = document.getElementById('regen-worldset-btn');
  downloadWorldsetBtn = document.getElementById('download-worldset-btn');
  backWorldsetBtn = document.getElementById('back-worldset-btn');

  launchMsg = document.getElementById('launch-msg');
  gameRoot = document.getElementById('game-root');
  stopGameBtn = document.getElementById('stop-game');

  // Event listeners
  generateBtn.addEventListener('click', handleGenerateSession);
  characterBtn.addEventListener('click', handleGenerateCharacter);
  worldsetBtn.addEventListener('click', handleGenerateWorldSet);

  regenBtn.addEventListener('click', handleRegenerateSession);
  playBtn.addEventListener('click', handlePlaySession);
  downloadBtn.addEventListener('click', handleDownloadSession);
  sendBtn.addEventListener('click', handleSendSession);
  backBtn.addEventListener('click', handleBackToMenu);

  regenCharacterBtn.addEventListener('click', handleRegenerateCharacter);
  downloadCharacterBtn.addEventListener('click', handleDownloadCharacter);
  backCharacterBtn.addEventListener('click', handleBackToMenu);

  regenWorldsetBtn.addEventListener('click', handleRegenerateWorldSet);
  downloadWorldsetBtn.addEventListener('click', handleDownloadWorldSet);
  backWorldsetBtn.addEventListener('click', handleBackToMenu);

  stopGameBtn.addEventListener('click', handleStopGame);

  // Handle URL seed parameter
  const urlParams = new URLSearchParams(window.location.search);
  const urlSeed = urlParams.get('seed');
  if (urlSeed) {
    seedInput.value = urlSeed;
  }

  // PWA install prompt
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('install-btn');
    installBtn.style.display = 'block';
    installBtn.addEventListener('click', () => {
      installBtn.style.display = 'none';
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
      });
    });
  });
}

// Event handlers
function handleGenerateSession() {
  const seed = seedInput.value ? parseInt(seedInput.value) : null;
  currentSeed = seed;
  currentSession = generateSessionParameters(seed);
  showSession();
}

function handleGenerateCharacter() {
  const seed = seedInput.value ? parseFloat(seedInput.value) : Math.random();
  currentSeed = seed;
  currentCharacter = generateCharacter(seed);
  showCharacter();
}

function handleGenerateWorldSet() {
  const seed = seedInput.value ? parseFloat(seedInput.value) : Math.random();
  currentSeed = seed;
  currentWorldSet = generateWorldSet(seed);
  showWorldSet();
}

function handleRegenerateSession() {
  currentSession = generateSessionParameters(currentSeed);
  showSession();
}

function handleRegenerateCharacter() {
  currentCharacter = generateCharacter(currentSeed);
  showCharacter();
}

function handleRegenerateWorldSet() {
  currentWorldSet = generateWorldSet(currentSeed);
  showWorldSet();
}

function handlePlaySession() {
  if (!currentSession) return;

  // Show game launcher
  gameLauncherEl.classList.remove('hidden');
  launchMsg.textContent = `Запуск сессии: ${generateSessionName(currentSession.theme, currentSession.modifiers, currentSession.seed)}`;

  // Render level preview
  const previewContainer = document.createElement('div');
  previewContainer.style.margin = '10px 0';
  renderLevelPreview(previewContainer, currentSession.level);
  launchMsg.appendChild(previewContainer);

  // For now, just show a placeholder - actual game integration would go here
  gameRoot.innerHTML = '<p>Игра загружается... (демо режим)</p>';
  stopGameBtn.classList.remove('hidden');
}

function handleStopGame() {
  gameLauncherEl.classList.add('hidden');
  gameRoot.innerHTML = '';
  stopGameBtn.classList.add('hidden');
}

function handleDownloadSession() {
  if (!currentSession) return;
  const content = formatSessionText(currentSession);
  downloadFile('session.txt', content);
}

function handleDownloadCharacter() {
  if (!currentCharacter) return;
  const content = formatCharacterDescription(currentCharacter);
  downloadFile('character.txt', content);
}

function handleDownloadWorldSet() {
  if (!currentWorldSet) return;
  const content = formatWorldSetDescription(currentWorldSet);
  downloadFile('worldset.txt', content);
}

function handleSendSession() {
  if (!currentSession) return;

  // Telegram WebApp integration
  if (window.Telegram && window.Telegram.WebApp) {
    const data = {
      session: currentSession,
      timestamp: Date.now()
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

function handleBackToMenu() {
  sessionEl.classList.add('hidden');
  characterEl.classList.add('hidden');
  worldsetEl.classList.add('hidden');
  gameLauncherEl.classList.add('hidden');
  menuEl.style.display = 'block';
  currentSession = null;
  currentCharacter = null;
  currentWorldSet = null;
}

// UI functions
function showSession() {
  if (!currentSession) return;

  const sessionName = generateSessionName(currentSession.theme, currentSession.modifiers, currentSession.seed);
  const microStory = generateMicroStory(currentSession.theme, currentSession.modifiers, currentSession.seed);

  sessionText.textContent = `Название: ${sessionName}\n\n${formatSessionText(currentSession)}\n\nИстория: ${microStory}`;

  menuEl.style.display = 'none';
  sessionEl.classList.remove('hidden');
}

function showCharacter() {
  if (!currentCharacter) return;

  characterText.textContent = formatCharacterDescription(currentCharacter);

  menuEl.style.display = 'none';
  characterEl.classList.remove('hidden');
}

function showWorldSet() {
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
Уровень: гравитация=${session.level.gravity.toFixed(2)}, зазор=${session.level.gap}, скорость=${session.level.speed.toFixed(2)}`;
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Render function (for potential future use)
export function render() {
  // Currently not used, but available for future enhancements
}

// Update function (for potential future use)
export function update() {
  // Currently not used, but available for future enhancements
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
