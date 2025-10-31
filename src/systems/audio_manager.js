// Аудио менеджер - управление звуками и музыкой

export default class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterVolume = 0.5;
    this.isMuted = false;
    this.sounds = new Map();
    this.music = null;
  }

  // Инициализация аудио контекста
  async init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  // Воспроизведение звука
  async playSound(soundName, options = {}) {
    if (!this.audioContext || this.isMuted) return;

    try {
      const buffer = this.sounds.get(soundName);
      if (!buffer) {
        console.warn(`Sound '${soundName}' not loaded`);
        return;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = (options.volume || 1) * this.masterVolume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start(0);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Установка громкости
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  // Включение/выключение звука
  setMuted(muted) {
    this.isMuted = muted;
  }

  // Очистка ресурсов
  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.sounds.clear();
  }

  // Установка настроения для адаптивного саундскейпа
  setMood(mood) {
    // Метод для интеграции с adaptive_soundscape
    // mood - значение от 0 до 1
    this.mood = mood;
  }

  // Импульсное событие (например, для эффектов)
  pulseEvent() {
    // Метод для импульсных звуковых эффектов
  }
}
