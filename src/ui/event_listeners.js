import {
  handleGenerateSession,
  handleGenerateCharacter,
  handleGenerateWorldSet,
  handleRegenerateSession,
  handleRegenerateCharacter,
  handleRegenerateWorldSet,
  handlePlaySession,
  handleStopGame,
  handleDownloadSession,
  handleDownloadCharacter,
  handleDownloadWorldSet,
  handleSendSession,
  handleBackToMenu,
} from './event_handlers.js';
import {
  generateBtn,
  characterBtn,
  worldsetBtn,
  regenBtn,
  playBtn,
  downloadBtn,
  sendBtn,
  backBtn,
  regenCharacterBtn,
  downloadCharacterBtn,
  backCharacterBtn,
  regenWorldsetBtn,
  downloadWorldsetBtn,
  backWorldsetBtn,
  stopGameBtn,
} from './ui_elements.js';

export function setupEventListeners() {
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
}
