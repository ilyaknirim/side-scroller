// Система локальных временных полей - области с разным течением времени

// Класс для системы локальных временных полей
export class TemporalFieldsSystem {
  constructor(maxFields = 4) {
    this.maxFields = maxFields;
    this.fields = [];
    this.playerPosition = { x: 0, y: 0 };
    this.fieldTypes = [
      'slowdown', // Замедление времени
      'speedup', // Ускорение времени
      'reversal', // Обратное течение времени
      'stasis', // Остановка времени
      'oscillation', // Колебательное течение времени
    ];
  }

  // Добавление временного поля
  addField(field, type = null, intensity = 1) {
    if (this.fields.length >= this.maxFields) {
      return -1;
    }

    const fieldType = type || this.fieldTypes[Math.floor(Math.random() * this.fieldTypes.length)];

    const temporalField = {
      field,
      type: fieldType,
      intensity: Math.max(0.1, Math.min(2, intensity)), // Ограничиваем интенсивность
      isAffected: false,
      radius: field.radius || 100,
      originalProperties: {
        color: field.color || '#ffffff',
        opacity: field.opacity || 0.3,
        timeScale: field.timeScale || 1,
        pulsePhase: field.pulsePhase || 0,
      },
      currentProperties: { ...field },
      lastFieldTime: 0,
      timeOffset: 0,
    };

    this.fields.push(temporalField);
    return this.fields.length - 1;
  }

  // Обновление позиции игрока
  updatePlayerPosition(x, y) {
    this.playerPosition = { x, y };
  }

  // Проверка, находится ли игрок в поле
  isPlayerAffected(field) {
    const fieldObj = field.field;

    // Проверяем расстояние до игрока
    const distance = Math.sqrt(
      Math.pow(fieldObj.x - this.playerPosition.x, 2) +
        Math.pow(fieldObj.y - this.playerPosition.y, 2)
    );

    return distance <= field.radius;
  }

  // Применение эффекта временного поля
  applyFieldEffect(field, deltaTime) {
    const { field: fieldObj, type, intensity, isAffected, originalProperties } = field;

    switch (type) {
      case 'slowdown':
        // Замедление времени
        if (isAffected) {
          fieldObj.timeScale = Math.max(0.1, originalProperties.timeScale - 0.5 * intensity);
          fieldObj.color = this.addColorTint(originalProperties.color, '#0000ff', 0.5 * intensity);
          fieldObj.opacity = Math.min(0.8, originalProperties.opacity + 0.3 * intensity);
        } else {
          fieldObj.timeScale = originalProperties.timeScale;
          fieldObj.color = originalProperties.color;
          fieldObj.opacity = originalProperties.opacity;
        }
        break;

      case 'speedup':
        // Ускорение времени
        if (isAffected) {
          fieldObj.timeScale = Math.min(3, originalProperties.timeScale + 1 * intensity);
          fieldObj.color = this.addColorTint(originalProperties.color, '#ff0000', 0.5 * intensity);
          fieldObj.opacity = Math.min(0.8, originalProperties.opacity + 0.3 * intensity);
        } else {
          fieldObj.timeScale = originalProperties.timeScale;
          fieldObj.color = originalProperties.color;
          fieldObj.opacity = originalProperties.opacity;
        }
        break;

      case 'reversal':
        // Обратное течение времени
        if (isAffected) {
          fieldObj.timeScale = -Math.abs(originalProperties.timeScale) * intensity;
          fieldObj.color = this.addColorTint(originalProperties.color, '#800080', 0.5 * intensity);
          fieldObj.opacity = Math.min(0.8, originalProperties.opacity + 0.3 * intensity);
        } else {
          fieldObj.timeScale = originalProperties.timeScale;
          fieldObj.color = originalProperties.color;
          fieldObj.opacity = originalProperties.opacity;
        }
        break;

      case 'stasis':
        // Остановка времени
        if (isAffected) {
          fieldObj.timeScale = 0;
          fieldObj.color = this.addColorTint(originalProperties.color, '#808080', 0.7 * intensity);
          fieldObj.opacity = Math.min(0.9, originalProperties.opacity + 0.4 * intensity);
        } else {
          fieldObj.timeScale = originalProperties.timeScale;
          fieldObj.color = originalProperties.color;
          fieldObj.opacity = originalProperties.opacity;
        }
        break;

      case 'oscillation':
        // Колебательное течение времени
        field.pulsePhase += 0.05 * intensity;
        const oscillation = Math.sin(field.pulsePhase);

        if (isAffected) {
          fieldObj.timeScale = originalProperties.timeScale * (1 + oscillation * intensity);
          fieldObj.color = this.addColorTint(
            originalProperties.color,
            '#00ff00',
            0.5 * intensity * Math.abs(oscillation)
          );
          fieldObj.opacity = Math.min(
            0.8,
            originalProperties.opacity + 0.3 * intensity * Math.abs(oscillation)
          );
        } else {
          fieldObj.timeScale = originalProperties.timeScale;
          fieldObj.color = originalProperties.color;
          fieldObj.opacity = originalProperties.opacity;
        }
        break;
    }

    // Сохраняем текущие свойства
    field.currentProperties = { ...fieldObj };

    // Возвращаем модифицированное время
    return deltaTime * fieldObj.timeScale;
  }

  // Добавление цветового оттенка
  addColorTint(baseColor, tintColor, amount) {
    const base = parseInt(baseColor.replace('#', ''), 16);
    const tint = parseInt(tintColor.replace('#', ''), 16);

    const r = Math.round(((base >> 16) & 255) * (1 - amount) + ((tint >> 16) & 255) * amount);
    const g = Math.round(((base >> 8) & 255) * (1 - amount) + ((tint >> 8) & 255) * amount);
    const b = Math.round((base & 255) * (1 - amount) + (tint & 255) * amount);

    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  // Обновление состояния системы
  update(deltaTime) {
    const now = Date.now();
    let modifiedDeltaTime = deltaTime;

    this.fields.forEach((field) => {
      // Проверяем, находится ли игрок в поле
      const wasAffected = field.isAffected;
      field.isAffected = this.isPlayerAffected(field);

      // Если состояние влияния изменилось, записываем время
      if (wasAffected !== field.isAffected) {
        field.lastFieldTime = now;
      }

      // Применяем эффект поля
      const fieldModifiedTime = this.applyFieldEffect(field, deltaTime);

      // Если игрок находится в поле, используем модифицированное время
      if (field.isAffected) {
        modifiedDeltaTime = fieldModifiedTime;
      }
    });

    return modifiedDeltaTime;
  }

  // Получение текущего состояния
  getState() {
    return {
      fields: this.fields.map((field) => ({
        type: field.type,
        intensity: field.intensity,
        isAffected: field.isAffected,
        radius: field.radius,
        fieldId: field.field.id || 'unknown',
      })),
      playerPosition: { ...this.playerPosition },
    };
  }

  // Сброс системы
  reset() {
    // Восстанавливаем исходные свойства всех полей
    this.fields.forEach((field) => {
      const { field: fieldObj, originalProperties } = field;

      // Восстанавливаем исходные свойства
      Object.keys(originalProperties).forEach((key) => {
        fieldObj[key] = originalProperties[key];
      });

      // Сбрасываем эффекты
      field.pulsePhase = 0;
      field.timeOffset = 0;
    });

    this.fields = [];
  }
}

// Функция для создания системы локальных временных полей
export function createTemporalFieldsSystem(maxFields) {
  return new TemporalFieldsSystem(maxFields);
}

// Функция для форматирования статистики временных полей
export function formatTemporalFieldsStats(stats) {
  const affectedCount = stats.fields.filter((field) => field.isAffected).length;
  return `Полей: ${stats.fields.length}/${stats.maxFields || 4}, Под влиянием: ${affectedCount}`;
}

// Функция для создания временного поля
export function createTemporalField(x, y, radius, type, intensity) {
  return {
    x,
    y,
    radius,
    color: '#ffffff',
    opacity: 0.3,
    timeScale: 1,
    pulsePhase: 0,
    type,
    intensity,
  };
}
