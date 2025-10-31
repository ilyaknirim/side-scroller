// Система ментальных вращений - переворот пространства в уме

// Класс для системы ментальных вращений
export class MentalRotationsSystem {
  constructor(maxRotation = 180, rotationSpeed = 30) {
    this.maxRotation = maxRotation; // Максимальный угол вращения в градусах
    this.rotationSpeed = rotationSpeed; // Скорость вращения в градусах/сек
    this.currentRotation = 0; // Текущий угол вращения
    this.targetRotation = 0; // Целевой угол вращения
    this.isRotating = false;
    this.rotationAxis = 'y'; // Ось вращения: 'x', 'y' или 'z'
    this.rotationHistory = [];
    this.rotationComplexity = 1; // Сложность вращения
  }

  // Начать вращение до указанного угла
  startRotation(targetAngle, axis = 'y', complexity = 1) {
    this.targetRotation = Math.min(this.maxRotation, Math.max(-this.maxRotation, targetAngle));
    this.rotationAxis = axis;
    this.rotationComplexity = complexity;
    this.isRotating = true;

    // Записываем в историю
    this.rotationHistory.push({
      timestamp: Date.now(),
      from: this.currentRotation,
      to: this.targetRotation,
      axis: axis,
      complexity: complexity
    });

    // Ограничиваем историю
    if (this.rotationHistory.length > 10) {
      this.rotationHistory.shift();
    }
  }

  // Обновление состояния системы
  update(deltaTime) {
    if (!this.isRotating) return;

    // Рассчитываем шаг вращения
    const step = this.rotationSpeed * (deltaTime / 1000) * this.rotationComplexity;

    // Определяем направление вращения
    const direction = this.targetRotation > this.currentRotation ? 1 : -1;

    // Обновляем текущий угол
    this.currentRotation += direction * step;

    // Проверяем, достигли ли цели
    if ((direction > 0 && this.currentRotation >= this.targetRotation) ||
        (direction < 0 && this.currentRotation <= this.targetRotation)) {
      this.currentRotation = this.targetRotation;
      this.isRotating = false;
    }
  }

  // Получение текущего состояния
  getState() {
    return {
      currentRotation: this.currentRotation,
      targetRotation: this.targetRotation,
      isRotating: this.isRotating,
      rotationAxis: this.rotationAxis,
      rotationComplexity: this.rotationComplexity,
      rotationHistory: [...this.rotationHistory],
      progress: this.isRotating ? 
        Math.abs(this.currentRotation - this.targetRotation) / 
        Math.abs(this.rotationHistory[this.rotationHistory.length - 1].to - 
                  this.rotationHistory[this.rotationHistory.length - 1].from) : 
        1
    };
  }

  // Сброс системы
  reset() {
    this.currentRotation = 0;
    this.targetRotation = 0;
    this.isRotating = false;
    this.rotationAxis = 'y';
    this.rotationComplexity = 1;
    this.rotationHistory = [];
  }

  // Получение матрицы преобразования для CSS
  getTransformMatrix() {
    const rad = (this.currentRotation * Math.PI) / 180;

    switch (this.rotationAxis) {
      case 'x':
        return `rotateX(${this.currentRotation}deg)`;
      case 'y':
        return `rotateY(${this.currentRotation}deg)`;
      case 'z':
        return `rotateZ(${this.currentRotation}deg)`;
      default:
        return `rotateY(${this.currentRotation}deg)`;
    }
  }

  // Получение матрицы преобразования для 3D-графики
  get3DTransformMatrix() {
    const rad = (this.currentRotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    switch (this.rotationAxis) {
      case 'x':
        return [
          1, 0, 0, 0,
          0, cos, -sin, 0,
          0, sin, cos, 0,
          0, 0, 0, 1
        ];
      case 'y':
        return [
          cos, 0, sin, 0,
          0, 1, 0, 0,
          -sin, 0, cos, 0,
          0, 0, 0, 1
        ];
      case 'z':
        return [
          cos, -sin, 0, 0,
          sin, cos, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1
        ];
      default:
        return [
          cos, 0, sin, 0,
          0, 1, 0, 0,
          -sin, 0, cos, 0,
          0, 0, 0, 1
        ];
    }
  }

  // Применение вращения к точке
  applyToPoint(point) {
    const matrix = this.get3DTransformMatrix();
    const x = point.x;
    const y = point.y;
    const z = point.z || 0;

    return {
      x: x * matrix[0] + y * matrix[1] + z * matrix[2] + matrix[3],
      y: x * matrix[4] + y * matrix[5] + z * matrix[6] + matrix[7],
      z: x * matrix[8] + y * matrix[9] + z * matrix[10] + matrix[11]
    };
  }
}

// Функция для создания системы ментальных вращений
export function createMentalRotationsSystem(maxRotation, rotationSpeed) {
  return new MentalRotationsSystem(maxRotation, rotationSpeed);
}

// Функция для форматирования статистики ментальных вращений
export function formatMentalRotationsStats(stats) {
  return `Вращение: ${stats.currentRotation.toFixed(1)}°, Ось: ${stats.rotationAxis}, Сложность: ${stats.rotationComplexity}`;
}

// Функция для создания задачи ментального вращения
export function createMentalRotationTask(targetAngle, axis, complexity) {
  const axes = ['x', 'y', 'z'];

  return {
    targetAngle: targetAngle !== undefined ? targetAngle : (Math.random() * 180 - 90),
    axis: axis || axes[Math.floor(Math.random() * axes.length)],
    complexity: complexity !== undefined ? complexity : 1 + Math.random() * 2,
    hint: `Представьте вращение объекта вокруг оси ${axis || 'Y'} на ${Math.abs(targetAngle || 90).toFixed(0)}°`
  };
}
