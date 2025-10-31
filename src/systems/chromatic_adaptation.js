// Хроматическая адаптация - влияние цветов на физику

// Класс для хроматической адаптации
export class ChromaticAdaptation {
  constructor() {
    this.colorEffects = new Map([
      ['red', { gravity: 1.2, speed: 0.8 }],
      ['blue', { gravity: 0.8, speed: 1.2 }],
      ['green', { gravity: 1.0, speed: 1.0 }],
      ['yellow', { gravity: 0.9, speed: 1.1 }],
      ['purple', { gravity: 1.1, speed: 0.9 }],
      ['orange', { gravity: 1.0, speed: 1.0 }]
    ]);
  }

  // Получение эффекта цвета
  getColorEffect(color) {
    return this.colorEffects.get(color) || { gravity: 1.0, speed: 1.0 };
  }

  // Применение эффекта цвета к объекту
  applyColorEffect(object, color) {
    const effect = this.getColorEffect(color);
    object.gravityModifier = effect.gravity;
    object.speedModifier = effect.speed;
  }

  // Сброс эффектов
  resetEffects(object) {
    object.gravityModifier = 1.0;
    object.speedModifier = 1.0;
  }

  // Получение доступных цветов
  getAvailableColors() {
    return Array.from(this.colorEffects.keys());
  }
}

// Функция для создания хроматической адаптации
export function createChromaticAdaptation() {
  return new ChromaticAdaptation();
}
