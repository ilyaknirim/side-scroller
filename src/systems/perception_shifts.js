// Сдвиги восприятия - инверсия восприятия и туннельное зрение

// Класс для инверсии восприятия
export class PerceptionInversion {
  constructor() {
    this.active = false;
    this.inversionStartTime = 0;
    this.duration = 2000; // 2 секунды
  }

  // Активация инверсии
  activate() {
    this.active = true;
    this.inversionStartTime = Date.now();
  }

  // Деактивация инверсии
  deactivate() {
    this.active = false;
  }

  // Проверка активности
  isActive() {
    if (this.active && Date.now() - this.inversionStartTime > this.duration) {
      this.deactivate();
    }
    return this.active;
  }

  // Применение эффекта инверсии к координатам
  applyInversion(x, y, canvasWidth, canvasHeight) {
    if (!this.isActive()) return { x, y };

    return {
      x: canvasWidth - x,
      y: canvasHeight - y
    };
  }
}

// Класс для туннельного зрения
export class TunnelVision {
  constructor() {
    this.intensity = 0; // 0-1
    this.centerX = 0;
    this.centerY = 0;
  }

  // Установка интенсивности
  setIntensity(intensity) {
    this.intensity = Math.max(0, Math.min(1, intensity));
  }

  // Установка центра фокуса
  setFocus(centerX, centerY) {
    this.centerX = centerX;
    this.centerY = centerY;
  }

  // Применение эффекта туннельного зрения
  applyTunnelVision(x, y, canvasWidth, canvasHeight) {
    if (this.intensity === 0) return 1; // Полная видимость

    const distance = Math.sqrt(
      Math.pow(x - this.centerX, 2) + Math.pow(y - this.centerY, 2)
    );
    const maxDistance = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight) / 2;

    // Чем дальше от центра, тем меньше видимость
    const visibility = Math.max(0, 1 - (distance / maxDistance) * this.intensity);
    return visibility;
  }
}

// Функция для создания инверсии восприятия
export function createPerceptionInversion() {
  return new PerceptionInversion();
}
