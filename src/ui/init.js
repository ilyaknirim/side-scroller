import { initUIElements, handleURLSeed, initPWAInstallPrompt } from './ui_elements.js';
import { setupEventListeners } from './event_listeners.js';

// Initialize the application
export function initApp() {
  // Initialize UI elements
  initUIElements();

  // Handle URL seed parameter
  handleURLSeed();

  // Initialize PWA install prompt
  initPWAInstallPrompt();

  // Setup event listeners
  setupEventListeners();
}
