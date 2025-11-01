// Система проприоцептивного дрифта - искажение ощущения собственного тела

// Класс для системы проприоцептивного дрифта
export class ProprioceptiveDriftSystem {
  constructor(maxDrift = 2) {
    this.maxDrift = maxDrift;
    this.drifts = [];
    this.playerPosition = { x: 0, y: 0 };
    this.driftTypes = [
      'position', // Смещение воспринимаемой позиции
      'size', // Искажение воспринимаемого размера
      'orientation', // Искажение воспринимаемой ориентации
      'gravity', // Искажение восприятия гравитации
      'momentum', // Искажение восприятия инерции
    ];
  }

  // Добавление проприоцептивного дрифта
  addDrift(drift, type = null, intensity = 1) {
    if (this.drifts.length >= this.maxDrift) {
      return -1;
    }

    const driftType = type || this.driftTypes[Math.floor(Math.random() * this.driftTypes.length)];

    const proprioceptiveDrift = {
      drift,
      type: driftType,
      intensity: Math.max(0.1, Math.min(2, intensity)), // Ограничиваем интенсивность
      isActive: false,
      originalProperties: {
        positionOffset: { x: 0, y: 0 },
        sizeMultiplier: 1,
        rotationAngle: 0,
        gravityDirection: { x: 0, y: 1 },
        momentumMultiplier: 1,
      },
      currentProperties: { ...drift },
      lastDriftTime: 0,
      driftPhase: 0,
    };

    this.drifts.push(proprioceptiveDrift);
    return this.drifts.length - 1;
  }

  // Обновление позиции игрока
  updatePlayerPosition(x, y) {
    this.playerPosition = { x, y };
  }

  // Проверка, активен ли дрифт
  isDriftActive(drift) {
    // Дрифт активен, если игрок находится в определенной зоне
    // Для простоты считаем, что дрифт активен всегда, но можно добавить логику активации
    return true;
  }

  // Применение эффекта проприоцептивного дрифта
  applyDriftEffect(drift) {
    const { drift: driftObj, type, intensity, isActive, originalProperties } = drift;

    switch (type) {
      case 'position':
        // Смещение воспринимаемой позиции
        if (isActive) {
          drift.driftPhase += 0.05 * intensity;
          const offsetX = Math.sin(drift.driftPhase) * 20 * intensity;
          const offsetY = Math.cos(drift.driftPhase * 0.7) * 15 * intensity;

          driftObj.positionOffset = { x: offsetX, y: offsetY };
        } else {
          driftObj.positionOffset = originalProperties.positionOffset;
        }
        break;

      case 'size':
        // Искажение воспринимаемого размера
        if (isActive) {
          drift.driftPhase += 0.03 * intensity;
          const sizeMultiplier = 1 + Math.sin(drift.driftPhase) * 0.3 * intensity;

          driftObj.sizeMultiplier = Math.max(0.5, Math.min(1.5, sizeMultiplier));
        } else {
          driftObj.sizeMultiplier = originalProperties.sizeMultiplier;
        }
        break;

      case 'orientation':
        // Искажение воспринимаемой ориентации
        if (isActive) {
          drift.driftPhase += 0.04 * intensity;
          const rotationAngle = Math.sin(drift.driftPhase) * 15 * intensity;

          driftObj.rotationAngle = rotationAngle;
        } else {
          driftObj.rotationAngle = originalProperties.rotationAngle;
        }
        break;

      case 'gravity':
        // Искажение восприятия гравитации
        if (isActive) {
          drift.driftPhase += 0.02 * intensity;
          const angle = Math.sin(drift.driftPhase) * Math.PI * 0.5 * intensity;

          driftObj.gravityDirection = {
            x: Math.sin(angle),
            y: Math.cos(angle),
          };
        } else {
          driftObj.gravityDirection = originalProperties.gravityDirection;
        }
        break;

      case 'momentum':
        // Искажение восприятия инерции
        if (isActive) {
          drift.driftPhase += 0.06 * intensity;
          const momentumMultiplier = 1 + Math.sin(drift.driftPhase) * 0.5 * intensity;

          driftObj.momentumMultiplier = Math.max(0.5, Math.min(2, momentumMultiplier));
        } else {
          driftObj.momentumMultiplier = originalProperties.momentumMultiplier;
        }
        break;
    }

    // Сохраняем текущие свойства
    drift.currentProperties = { ...driftObj };
  }

  // Обновление состояния системы
  update(deltaTime) {
    const now = Date.now();

    this.drifts.forEach((drift) => {
      // Проверяем, активен ли дрифт
      const wasActive = drift.isActive;
      drift.isActive = this.isDriftActive(drift);

      // Если состояние активности изменилось, записываем время
      if (wasActive !== drift.isActive) {
        drift.lastDriftTime = now;
      }

      // Применяем эффект дрифта
      this.applyDriftEffect(drift);
    });
  }

  // Получение текущего состояния
  getState() {
    return {
      drifts: this.drifts.map((drift) => ({
        type: drift.type,
        intensity: drift.intensity,
        isActive: drift.isActive,
        driftId: drift.drift.id || 'unknown',
      })),
      playerPosition: { ...this.playerPosition },
    };
  }

  // Сброс системы
  reset() {
    // Восстанавливаем исходные свойства всех дрифтов
    this.drifts.forEach((drift) => {
      const { drift: driftObj, originalProperties } = drift;

      // Восстанавливаем исходные свойства
      Object.keys(originalProperties).forEach((key) => {
        driftObj[key] = originalProperties[key];
      });

      // Сбрасываем эффекты
      drift.driftPhase = 0;
    });

    this.drifts = [];
  }

  // Применение трансформации к позиции игрока
  applyToPlayerPosition(position) {
    let transformedPosition = { ...position };

    this.drifts.forEach((drift) => {
      if (!drift.isActive) return;

      const driftObj = drift.drift;

      if (drift.type === 'position' && driftObj.positionOffset) {
        transformedPosition.x += driftObj.positionOffset.x;
        transformedPosition.y += driftObj.positionOffset.y;
      }
    });

    return transformedPosition;
  }

  // Применение трансформации к размеру игрока
  applyToPlayerSize(size) {
    let transformedSize = size;

    this.drifts.forEach((drift) => {
      if (!drift.isActive) return;

      const driftObj = drift.drift;

      if (drift.type === 'size' && driftObj.sizeMultiplier) {
        transformedSize *= driftObj.sizeMultiplier;
      }
    });

    return transformedSize;
  }

  // Применение трансформации к ориентации игрока
  applyToPlayerOrientation(angle) {
    let transformedAngle = angle;

    this.drifts.forEach((drift) => {
      if (!drift.isActive) return;

      const driftObj = drift.drift;

      if (drift.type === 'orientation' && driftObj.rotationAngle) {
        transformedAngle += driftObj.rotationAngle;
      }
    });

    return transformedAngle;
  }

  // Применение трансформации к гравитации
  applyToGravity(gravity) {
    let transformedGravity = { ...gravity };

    this.drifts.forEach((drift) => {
      if (!drift.isActive) return;

      const driftObj = drift.drift;

      if (drift.type === 'gravity' && driftObj.gravityDirection) {
        transformedGravity = { ...driftObj.gravityDirection };
      }
    });

    return transformedGravity;
  }

  // Применение трансформации к инерции
  applyToMomentum(momentum) {
    let transformedMomentum = momentum;

    this.drifts.forEach((drift) => {
      if (!drift.isActive) return;

      const driftObj = drift.drift;

      if (drift.type === 'momentum' && driftObj.momentumMultiplier) {
        transformedMomentum *= driftObj.momentumMultiplier;
      }
    });

    return transformedMomentum;
  }
}

// Функция для создания системы проприоцептивного дрифта
export function createProprioceptiveDriftSystem(maxDrift) {
  return new ProprioceptiveDriftSystem(maxDrift);
}

// Функция для форматирования статистики проприоцептивного дрифта
export function formatProprioceptiveDriftStats(stats) {
  const activeCount = stats.drifts.filter((drift) => drift.isActive).length;
  return `Дрифтов: ${stats.drifts.length}/${stats.maxDrift || 2}, Активно: ${activeCount}`;
}

// Функция для создания проприоцептивного дрифта
export function createProprioceptiveDrift(type, intensity) {
  return {
    type,
    intensity,
    positionOffset: { x: 0, y: 0 },
    sizeMultiplier: 1,
    rotationAngle: 0,
    gravityDirection: { x: 0, y: 1 },
    momentumMultiplier: 1,
  };
}
