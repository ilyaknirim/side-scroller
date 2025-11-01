// Система эмоциональных барьеров - визуальные преграды, меняющие цвет и форму

// Класс для системы эмоциональных барьеров
export class EmotionalBarriersSystem {
  constructor(maxBarriers = 5) {
    this.maxBarriers = maxBarriers;
    this.barriers = [];
    this.playerPosition = { x: 0, y: 0 };
    this.emotionRadius = 200; // Радиус эмоционального влияния
    this.emotionTypes = [
      'joy', // Радость - барьер становится ярче и менее плотным
      'sadness', // Грусть - барьер становится темнее и более плотным
      'anger', // Гнев - барьер становится краснее и более острым
      'fear', // Страх - барьер становится дрожащим и менее стабильным
      'surprise', // Удивление - барьер пульсирует
      'disgust', // Отвращение - барьер становится более вязким
    ];
  }

  // Добавление эмоционального барьера
  addBarrier(barrier, emotion = null, intensity = 1) {
    if (this.barriers.length >= this.maxBarriers) {
      return -1;
    }

    const emotionType =
      emotion || this.emotionTypes[Math.floor(Math.random() * this.emotionTypes.length)];

    const emotionalBarrier = {
      barrier,
      emotion: emotionType,
      intensity: Math.max(0.1, Math.min(2, intensity)), // Ограничиваем интенсивность
      isAffected: false,
      originalProperties: {
        color: barrier.color || '#ffffff',
        opacity: barrier.opacity || 1,
        width: barrier.width || 50,
        height: barrier.height || 10,
        shape: barrier.shape || 'rectangle',
        solid: barrier.solid !== undefined ? barrier.solid : true,
        damage: barrier.damage || 0,
      },
      currentProperties: { ...barrier },
      lastEmotionTime: 0,
      pulsePhase: 0,
      shakeOffset: { x: 0, y: 0 },
    };

    this.barriers.push(emotionalBarrier);
    return this.barriers.length - 1;
  }

  // Обновление позиции игрока
  updatePlayerPosition(x, y) {
    this.playerPosition = { x, y };
  }

  // Проверка, находится ли барьер в зоне эмоционального влияния
  isBarrierAffected(barrier) {
    const barrierObj = barrier.barrier;

    // Проверяем расстояние до игрока
    const distance = Math.sqrt(
      Math.pow(barrierObj.x - this.playerPosition.x, 2) +
        Math.pow(barrierObj.y - this.playerPosition.y, 2)
    );

    return distance <= this.emotionRadius;
  }

  // Применение эмоционального эффекта
  applyEmotionEffect(barrier) {
    const { barrier: barrierObj, emotion, intensity, isAffected, originalProperties } = barrier;

    switch (emotion) {
      case 'joy':
        // Радость - барьер становится ярче и менее плотным
        if (isAffected) {
          barrierObj.color = this.lightenColor(originalProperties.color, 0.5 * intensity);
          barrierObj.opacity = Math.max(0.3, originalProperties.opacity - 0.4 * intensity);
          barrierObj.solid = originalProperties.solid && intensity < 1.5;
        } else {
          barrierObj.color = originalProperties.color;
          barrierObj.opacity = originalProperties.opacity;
          barrierObj.solid = originalProperties.solid;
        }
        break;

      case 'sadness':
        // Грусть - барьер становится темнее и более плотным
        if (isAffected) {
          barrierObj.color = this.darkenColor(originalProperties.color, 0.5 * intensity);
          barrierObj.opacity = Math.min(1, originalProperties.opacity + 0.3 * intensity);
          barrierObj.damage = originalProperties.damage + intensity;
        } else {
          barrierObj.color = originalProperties.color;
          barrierObj.opacity = originalProperties.opacity;
          barrierObj.damage = originalProperties.damage;
        }
        break;

      case 'anger':
        // Гнев - барьер становится краснее и более острым
        if (isAffected) {
          barrierObj.color = this.addColorTint(
            originalProperties.color,
            '#ff0000',
            0.7 * intensity
          );
          barrierObj.shape = 'triangle';
          barrierObj.damage = originalProperties.damage + 2 * intensity;
        } else {
          barrierObj.color = originalProperties.color;
          barrierObj.shape = originalProperties.shape;
          barrierObj.damage = originalProperties.damage;
        }
        break;

      case 'fear':
        // Страх - барьер становится дрожащим и менее стабильным
        if (isAffected) {
          // Добавляем дрожание
          barrier.shakeOffset.x = (Math.random() - 0.5) * 5 * intensity;
          barrier.shakeOffset.y = (Math.random() - 0.5) * 5 * intensity;
          barrierObj.solid = originalProperties.solid && intensity < 0.8;
          barrierObj.opacity = Math.max(0.5, originalProperties.opacity - 0.2 * intensity);
        } else {
          barrier.shakeOffset.x = 0;
          barrier.shakeOffset.y = 0;
          barrierObj.solid = originalProperties.solid;
          barrierObj.opacity = originalProperties.opacity;
        }
        break;

      case 'surprise':
        // Удивление - барьер пульсирует
        if (isAffected) {
          barrier.pulsePhase += 0.1 * intensity;
          const pulseFactor = 1 + 0.3 * Math.sin(barrier.pulsePhase);
          barrierObj.width = originalProperties.width * pulseFactor;
          barrierObj.height = originalProperties.height * pulseFactor;
        } else {
          barrierObj.width = originalProperties.width;
          barrierObj.height = originalProperties.height;
        }
        break;

      case 'disgust':
        // Отвращение - барьер становится более вязким
        if (isAffected) {
          barrierObj.color = this.addColorTint(
            originalProperties.color,
            '#8b4513',
            0.5 * intensity
          );
          barrierObj.slowdown = 0.5 + 0.5 * intensity; // Замедление игрока при контакте
        } else {
          barrierObj.color = originalProperties.color;
          delete barrierObj.slowdown;
        }
        break;
    }

    // Сохраняем текущие свойства
    barrier.currentProperties = { ...barrierObj };
  }

  // Осветление цвета
  lightenColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 255) + amount * 255);
    const g = Math.min(255, ((num >> 8) & 255) + amount * 255);
    const b = Math.min(255, (num & 255) + amount * 255);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  // Затемнение цвета
  darkenColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, ((num >> 16) & 255) - amount * 255);
    const g = Math.max(0, ((num >> 8) & 255) - amount * 255);
    const b = Math.max(0, (num & 255) - amount * 255);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
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

    this.barriers.forEach((barrier) => {
      // Проверяем, находится ли барьер в зоне эмоционального влияния
      const wasAffected = barrier.isAffected;
      barrier.isAffected = this.isBarrierAffected(barrier);

      // Если состояние влияния изменилось, записываем время
      if (wasAffected !== barrier.isAffected) {
        barrier.lastEmotionTime = now;
      }

      // Применяем эмоциональный эффект
      this.applyEmotionEffect(barrier);
    });
  }

  // Получение текущего состояния
  getState() {
    return {
      barriers: this.barriers.map((barrier) => ({
        emotion: barrier.emotion,
        intensity: barrier.intensity,
        isAffected: barrier.isAffected,
        barrierId: barrier.barrier.id || 'unknown',
      })),
      emotionRadius: this.emotionRadius,
      playerPosition: { ...this.playerPosition },
    };
  }

  // Сброс системы
  reset() {
    // Восстанавливаем исходные свойства всех барьеров
    this.barriers.forEach((barrier) => {
      const { barrier: barrierObj, originalProperties } = barrier;

      // Восстанавливаем исходные свойства
      Object.keys(originalProperties).forEach((key) => {
        barrierObj[key] = originalProperties[key];
      });

      // Удаляем дополнительные свойства
      if (barrierObj.slowdown !== undefined) {
        delete barrierObj.slowdown;
      }

      // Сбрасываем эффекты
      barrier.pulsePhase = 0;
      barrier.shakeOffset = { x: 0, y: 0 };
    });

    this.barriers = [];
  }
}

// Функция для создания системы эмоциональных барьеров
export function createEmotionalBarriersSystem(maxBarriers) {
  return new EmotionalBarriersSystem(maxBarriers);
}

// Функция для форматирования статистики эмоциональных барьеров
export function formatEmotionalBarriersStats(stats) {
  const affectedCount = stats.barriers.filter((barrier) => barrier.isAffected).length;
  return `Барьеров: ${stats.barriers.length}/${
    stats.maxBarriers || 5
  }, Под влиянием: ${affectedCount}`;
}

// Функция для создания эмоционального барьера
export function createEmotionalBarrier(x, y, width, height, emotion, intensity) {
  return {
    x,
    y,
    width,
    height,
    color: '#ffffff',
    opacity: 1,
    shape: 'rectangle',
    solid: true,
    damage: 0,
    emotion,
    intensity,
  };
}
