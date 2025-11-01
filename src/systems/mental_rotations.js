// Mental Rotations System - ментальные вращения
// Переворот пространства в уме

export class MentalRotationsSystem {
  constructor(maxRotation = 180, rotationSpeed = 30) {
    this.maxConcurrentRotations = 3;
    this.rotationSpeed = rotationSpeed; // degrees per second
    this.rotationAccuracy = 0.95; // how accurate the mental rotation is
    this.cognitiveCost = 15; // attention points per rotation
    this.rotationTime = 2.0; // seconds to complete a rotation
    this.currentRotations = 0;
    this.maxRotation = maxRotation;
    this.rotationAxis = 'y';
    this.targetRotation = 0;
    this.currentRotation = 0;
    this.isRotating = false;
    this.rotationComplexity = 1.0;
    this.rotationHistory = [];
  }

  // Начать ментальное вращение объекта
  startRotation(targetAngle, axis = 'y', complexity = 1.0) {
    if (this.currentRotations >= this.maxConcurrentRotations) {
      return false; // Maximum rotations reached
    }

    // Clamp target angle to maxRotation limits
    this.targetRotation = Math.max(-this.maxRotation, Math.min(this.maxRotation, targetAngle));
    this.rotationAxis = axis;
    this.rotationComplexity = complexity;
    this.currentRotation = 0;
    this.isRotating = true;

    this.currentRotations++;

    // Add to rotation history
    this.rotationHistory.push({
      from: 0,
      to: this.targetRotation,
      axis: this.rotationAxis,
      complexity: this.rotationComplexity,
      startTime: Date.now(),
    });

    return true;
  }

  // Обновить вращения (вызывать каждый кадр)
  update(deltaTime) {
    if (this.isRotating) {
      const rotationAmount = this.rotationSpeed * deltaTime;
      this.currentRotation += rotationAmount;

      // Check if we've reached the target
      if (Math.abs(this.currentRotation - this.targetRotation) < 1.0) {
        this.currentRotation = this.targetRotation;
        this.isRotating = false;
        this.currentRotations--;
      }
    }
  }

  // Получить текущее состояние вращения
  getState() {
    return {
      currentRotation: this.currentRotation,
      targetRotation: this.targetRotation,
      isRotating: this.isRotating,
      rotationAxis: this.rotationAxis,
      rotationComplexity: this.rotationComplexity,
      currentRotations: this.currentRotations,
      maxRotation: this.maxRotation,
      rotationHistory: this.rotationHistory,
      progress: this.currentRotation / this.targetRotation || 0,
    };
  }

  // Применить ментальное вращение к реальному объекту
  applyToPoint(point, axis = this.rotationAxis) {
    const angle = this.currentRotation;
    const cos = Math.cos((angle * Math.PI) / 180);
    const sin = Math.sin((angle * Math.PI) / 180);

    // Transform point based on rotation axis
    switch (axis) {
      case 'x':
        // Rotation around X axis
        const y = point.y;
        const z = point.z;
        point.y = y * cos - z * sin;
        point.z = y * sin + z * cos;
        break;

      case 'y':
        // Rotation around Y axis
        const x = point.x;
        const z2 = point.z;
        point.x = x * cos + z2 * sin;
        point.z = -x * sin + z2 * cos;
        break;

      case 'z':
      default:
        // Rotation around Z axis (2D rotation)
        const x2 = point.x;
        const y2 = point.y;
        point.x = x2 * cos - y2 * sin;
        point.y = x2 * sin + y2 * cos;
        break;
    }

    return point;
  }

  // Получить матрицу преобразования
  getTransformMatrix() {
    const angle = this.currentRotation;
    const cos = Math.cos((angle * Math.PI) / 180);
    const sin = Math.sin((angle * Math.PI) / 180);

    switch (this.rotationAxis) {
      case 'x':
        return `rotateX(${angle}deg)`;
      case 'y':
        return `rotateY(${angle}deg)`;
      case 'z':
      default:
        return `rotateZ(${angle}deg)`;
    }
  }

  // Получить 3D матрицу преобразования
  get3DTransformMatrix() {
    const angle = this.currentRotation;
    const cos = Math.cos((angle * Math.PI) / 180);
    const sin = Math.sin((angle * Math.PI) / 180);

    switch (this.rotationAxis) {
      case 'x':
        return [
          [1, 0, 0],
          [0, cos, -sin],
          [0, sin, cos],
        ];
      case 'y':
        return [
          [cos, 0, sin],
          [0, 1, 0],
          [-sin, 0, cos],
        ];
      case 'z':
      default:
        return [
          [cos, -sin, 0],
          [sin, cos, 0],
          [0, 0, 1],
        ];
    }
  }

  // Рассчитать точность ментального вращения
  calculateAccuracy() {
    // Accuracy decreases with number of concurrent rotations
    const loadPenalty = Math.max(0, this.currentRotations - 1) * 0.05;
    return Math.max(0.7, this.rotationAccuracy - loadPenalty);
  }

  // Получить статистику системы
  getSystemStats() {
    return {
      activeRotations: this.currentRotations,
      maxRotations: this.maxConcurrentRotations,
      rotationSpeed: this.rotationSpeed,
      averageAccuracy: this.calculateAccuracy(),
      totalRotations: this.rotationHistory.length,
    };
  }

  // Сбросить систему
  reset() {
    this.currentRotations = 0;
    this.currentRotation = 0;
    this.isRotating = false;
    this.targetRotation = 0;
    this.rotationAxis = 'y';
    this.rotationComplexity = 1.0;
    this.rotationHistory = [];
  }

  // Улучшить способности
  upgradeRotationSpeed(amount = 30) {
    this.rotationSpeed += amount;
  }

  upgradeMaxRotations(amount = 1) {
    this.maxConcurrentRotations += amount;
  }

  upgradeAccuracy(amount = 0.05) {
    this.rotationAccuracy = Math.min(0.99, this.rotationAccuracy + amount);
  }
}

// Easing function for smooth rotation
MentalRotationsSystem.prototype.easeInOutCubic = function (t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Функция создания системы ментальных вращений
export function createMentalRotationsSystem(maxRotation = 180, rotationSpeed = 30) {
  return new MentalRotationsSystem(maxRotation, rotationSpeed);
}

// Получить состояние системы
export function getState(system) {
  return {
    currentRotations: system.currentRotations,
    maxRotation: system.maxRotation,
    rotationAxis: system.rotationAxis,
    targetRotation: system.targetRotation,
    currentRotation: system.currentRotation,
    isRotating: system.isRotating,
    rotationComplexity: system.rotationComplexity,
  };
}

// Рассчитать сложность вращения
export function calculateRotationComplexity(system, angle) {
  return (Math.abs(angle) / system.maxRotation) * system.rotationComplexity;
}

// Создать задачу вращения
export function createMentalRotationTask(angle, axis = 'y', complexity = 1.0) {
  const axes = ['x', 'y', 'z'];
  const randomAxis = axes[Math.floor(Math.random() * axes.length)];
  const randomAngle = Math.floor(Math.random() * 360) - 180;
  const randomComplexity = Math.random() * 2 + 0.5;

  if (angle === undefined) {
    return {
      targetAngle: randomAngle,
      axis: randomAxis,
      complexity: randomComplexity,
      hint: `Вращение на ${randomAngle}° вокруг оси ${randomAxis}`,
    };
  }

  return {
    targetAngle: angle,
    axis,
    complexity,
    hint: `Вращение на ${angle}° вокруг оси ${axis}`,
  };
}

// Форматирование статистики ментальных вращений
export function formatMentalRotationStats(system) {
  const stats = system.getSystemStats();
  return `Вращение: ${stats.activeRotations}/${stats.maxRotations}, Ось: ${system.rotationAxis}, Сложность: ${system.rotationComplexity}`;
}
