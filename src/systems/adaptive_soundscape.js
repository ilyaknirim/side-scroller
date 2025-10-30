// Система адаптивного саундскейпа, меняющегося в реальном времени

import audioManager from './audio_manager.js';

// Параметры аудио-среды
const SOUNDSCAPE_PARAMS = {
  // Базовые частоты для разных настроений
  baseFrequencies: {
    calm: 220,      // A3
    focused: 440,    // A4
    excited: 880,   // A5
    tense: 110,     // A2
    mysterious: 165 // E3
  },

  // Скорость переходов между состояниями (0-1)
  transitionSpeed: 0.1,

  // Параметры генерации звуков
  oscillatorTypes: ['sine', 'square', 'sawtooth', 'triangle'],

  // Параметры фильтров
  filterTypes: ['lowpass', 'highpass', 'bandpass', 'notch'],
  baseFilterFrequency: 1000,
  filterQFactor: 5,

  // Параметры реверберации
  reverbWetLevel: 0.3,
  reverbDryLevel: 0.7,
  reverbRoomSize: 0.5,

  // Параметры амплитудной огибающей
  envelopeAttack: 0.1,
  envelopeDecay: 0.2,
  envelopeSustain: 0.7,
  envelopeRelease: 0.5
};

// Класс для управления адаптивным саундскейпом
export class AdaptiveSoundscape {
  constructor(audioContext) {
    this.audioContext = audioContext || audioManager.getContext();
    this.enabled = true;

    // Текущее состояние
    this.currentMood = 'calm';
    this.targetMood = 'calm';
    this.moodTransition = 0;

    // Создаем узлы аудио-графа
    this.setupAudioGraph();

    // Параметры генерации
    this.baseFrequency = SOUNDSCAPE_PARAMS.baseFrequencies.calm;
    this.targetFrequency = this.baseFrequency;

    // Источники звука
    this.oscillators = [];
    this.gainNodes = [];
    this.filterNodes = [];

    // Запускаем генерацию
    this.initializeOscillators();
    this.start();
  }

  // Настройка аудио-графа
  setupAudioGraph() {
    // Создаем мастер-узел усиления
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.2; // Низкая громкость для фонового звука

    // Создаем узел фильтра
    this.masterFilter = this.audioContext.createBiquadFilter();
    this.masterFilter.type = SOUNDSCAPE_PARAMS.filterTypes[0];
    this.masterFilter.frequency.value = SOUNDSCAPE_PARAMS.baseFilterFrequency;
    this.masterFilter.Q.value = SOUNDSCAPE_PARAMS.filterQFactor;

    // Создаем узел реверберации (упрощенная реализация)
    this.convolver = this.audioContext.createConvolver();
    this.createReverbImpulse();

    // Создаем узлы микширования для реверберации
    this.wetGain = this.audioContext.createGain();
    this.wetGain.gain.value = SOUNDSCAPE_PARAMS.reverbWetLevel;

    this.dryGain = this.audioContext.createGain();
    this.dryGain.gain.value = SOUNDSCAPE_PARAMS.reverbDryLevel;

    // Соединяем узлы
    this.masterGain.connect(this.dryGain);
    this.masterGain.connect(this.convolver);
    this.convolver.connect(this.wetGain);

    this.dryGain.connect(this.masterFilter);
    this.wetGain.connect(this.masterFilter);

    this.masterFilter.connect(this.audioContext.destination);
  }

  // Создание импульсной характеристики для реверберации
  createReverbImpulse() {
    const length = this.audioContext.sampleRate * SOUNDSCAPE_PARAMS.reverbRoomSize;
    const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }

    this.convolver.buffer = impulse;
  }

  // Инициализация генераторов тона
  initializeOscillators() {
    const oscillatorCount = 3;

    for (let i = 0; i < oscillatorCount; i++) {
      // Создаем генератор
      const oscillator = this.audioContext.createOscillator();
      oscillator.type = SOUNDSCAPE_PARAMS.oscillatorTypes[i % SOUNDSCAPE_PARAMS.oscillatorTypes.length];

      // Устанавливаем частоту (гармоники основной частоты)
      const harmonic = i + 1;
      oscillator.frequency.value = this.baseFrequency * harmonic;

      // Создаем узел усиления для этого генератора
      const gain = this.audioContext.createGain();
      gain.gain.value = 1 / (i + 1); // Уменьшаем громкость высших гармоник

      // Создаем узел фильтра для этого генератора
      const filter = this.audioContext.createBiquadFilter();
      filter.type = SOUNDSCAPE_PARAMS.filterTypes[i % SOUNDSCAPE_PARAMS.filterTypes.length];
      filter.frequency.value = SOUNDSCAPE_PARAMS.baseFilterFrequency * (i + 1);
      filter.Q.value = SOUNDSCAPE_PARAMS.filterQFactor;

      // Соединяем узлы
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      // Сохраняем ссылки
      this.oscillators.push(oscillator);
      this.gainNodes.push(gain);
      this.filterNodes.push(filter);

      // Запускаем генератор
      oscillator.start();
    }
  }

  // Запуск саундскейпа
  start() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.updateInterval = setInterval(() => this.update(), 50); // Обновляем 20 раз в секунду
  }

  // Остановка саундскейпа
  stop() {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    clearInterval(this.updateInterval);

    // Плавно затухаем
    this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
  }

  // Обновление состояния саундскейпа
  update() {
    if (!this.enabled) return;

    // Обновляем переход настроения
    if (this.currentMood !== this.targetMood) {
      this.moodTransition += SOUNDSCAPE_PARAMS.transitionSpeed;

      if (this.moodTransition >= 1) {
        this.currentMood = this.targetMood;
        this.moodTransition = 0;
      }
    }

    // Интерполируем частоту между текущим и целевым настроением
    const currentFreq = SOUNDSCAPE_PARAMS.baseFrequencies[this.currentMood];
    const targetFreq = SOUNDSCAPE_PARAMS.baseFrequencies[this.targetMood];
    this.targetFrequency = currentFreq + (targetFreq - currentFreq) * this.moodTransition;

    // Плавно переходим к целевой частоте
    this.baseFrequency += (this.targetFrequency - this.baseFrequency) * SOUNDSCAPE_PARAMS.transitionSpeed;

    // Обновляем параметры генераторов
    this.updateOscillators();
  }

  // Обновление параметров генераторов
  updateOscillators() {
    for (let i = 0; i < this.oscillators.length; i++) {
      const oscillator = this.oscillators[i];
      const filter = this.filterNodes[i];

      // Обновляем частоту
      const harmonic = i + 1;
      oscillator.frequency.exponentialRampToValueAtTime(
        this.baseFrequency * harmonic, 
        this.audioContext.currentTime + 0.1
      );

      // Обновляем фильтр
      const filterFreq = SOUNDSCAPE_PARAMS.baseFilterFrequency * (i + 1) * 
                         (this.currentMood === 'focused' ? 1.5 : 1);
      filter.frequency.exponentialRampToValueAtTime(
        filterFreq,
        this.audioContext.currentTime + 0.1
      );
    }

    // Обновляем мастер-фильтр
    const masterFilterFreq = SOUNDSCAPE_PARAMS.baseFilterFrequency * 
                            (this.currentMood === 'mysterious' ? 0.7 : 1);
    this.masterFilter.frequency.exponentialRampToValueAtTime(
      masterFilterFreq,
      this.audioContext.currentTime + 0.1
    );
  }

  // Изменение настроения саундскейпа
  setMood(mood) {
    if (!SOUNDSCAPE_PARAMS.baseFrequencies[mood]) return;

    this.targetMood = mood;
    this.moodTransition = 0;
  }

  // Реакция на игровые события
  onGameEvent(eventType, data) {
    if (!this.enabled) return;

    switch (eventType) {
      case 'death':
        // Резкое изменение при смерти
        this.setMood('tense');
        // Добавляем резкий звук
        this.playStinger(110, 'square', 0.1);
        break;

      case 'success':
        // Позитивное изменение при успехе
        this.setMood('excited');
        // Добавляем позитивный звук
        this.playStinger(880, 'sine', 0.05);
        break;

      case 'powerup':
        // Изменение при получении усиления
        this.setMood('focused');
        // Добавляем звук усиления
        this.playStinger(440, 'triangle', 0.05);
        break;

      case 'danger':
        // Напряженное настроение при опасности
        this.setMood('tense');
        break;

      case 'calm':
        // Возвращение к спокойствию
        this.setMood('calm');
        break;
    }
  }

  // Проигрывание короткого звукового сигнала
  playStinger(frequency, type, duration) {
    if (!this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // Настраиваем огибающую
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    // Соединяем узлы
    oscillator.connect(gain);
    gain.connect(this.masterGain);

    // Запускаем и останавливаем
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Включение/выключение саундскейпа
  setEnabled(enabled) {
    this.enabled = enabled;

    if (enabled && !this.isPlaying) {
      this.start();
    } else if (!enabled && this.isPlaying) {
      this.stop();
    }
  }
}

// Функция для создания саундскейпа
export function createSoundscape(audioContext) {
  return new AdaptiveSoundscape(audioContext);
}
