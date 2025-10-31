// Менеджер аудио - управление звуками и музыкой

// Основной класс менеджера аудио
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.isInitialized = false;
    this.volume = 0.5;
    this.muted = false;
    this.sources = new Map();
  }

  // Инициализация аудио контекста
  async init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return false;
    }
  }

  // Воспроизведение звука
  async playSound(soundName, options = {}) {
    if (!this.isInitialized || this.muted) return;

    try {
      // Для минимальной реализации просто создаем простой тон
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(options.frequency || 440, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + (options.duration || 0.2));

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + (options.duration || 0.2));

      this.sources.set(soundName, { oscillator, gainNode });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Остановка звука
  stopSound(soundName) {
    const source = this.sources.get(soundName);
    if (source) {
      try {
        source.oscillator.stop();
      } catch (e) {
        // Already stopped
      }
      this.sources.delete(soundName);
    }
  }

  // Установка громкости
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Установка настроения (для совместимости с тестами)
  setMood(mood) {
    // Простая реализация - регулируем громкость на основе настроения
    this.setVolume(mood);
  }

  // Импульсное событие (для совместимости с тестами)
  pulseEvent() {
    // Простая реализация - ничего не делаем
  }

  // Включение/выключение звука
  setMuted(muted) {
    this.muted = muted;
  }

  // Очистка ресурсов
  destroy() {
    this.sources.forEach(source => {
      try {
        source.oscillator.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.sources.clear();

    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Экспорт по умолчанию
export default AudioManager;
