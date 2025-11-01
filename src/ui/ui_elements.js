// DOM element references
export let menuEl, sessionEl, characterEl, worldsetEl, gameLauncherEl;
export let seedInput, generateBtn, characterBtn, worldsetBtn;
export let sessionText, regenBtn, playBtn, downloadBtn, sendBtn, backBtn;
export let characterText, regenCharacterBtn, downloadCharacterBtn, backCharacterBtn;
export let worldsetText, regenWorldsetBtn, downloadWorldsetBtn, backWorldsetBtn;
export let launchMsg, gameRoot, stopGameBtn;

// Initialize DOM element references
export function initUIElements() {
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
}

// Handle URL seed parameter
export function handleURLSeed() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlSeed = urlParams.get('seed');
  if (urlSeed) {
    seedInput.value = urlSeed;
  }
}

// PWA install prompt handling
export function initPWAInstallPrompt() {
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
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
    }
  });
}
