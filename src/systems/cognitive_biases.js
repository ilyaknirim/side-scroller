// Система когнитивных искажений - платформы, меняющие свойства при наблюдении

// Класс для системы когнитивных искажений
export class CognitiveBiasesSystem {
  constructor(maxBiases = 5) {
    this.maxBiases = maxBiases;
    this.biases = [];
    this.observationRadius = 150; // Радиус наблюдения в пикселях
    this.playerPosition = { x: 0, y: 0 };
    this.biasTypes = [
      'confirmation', // Подтверждающее искажение - платформа становится твердее при наблюдении
      'negativity', // Негативное искажение - платформа становится опаснее при наблюдении
      'availability', // Искажение доступности - платформа появляется/исчезает при наблюдении
      'anchoring', // Эффект якоря - платформа "притягивает" игрока при наблюдении
      'illusory', // Иллюзорное искажение - платформа меняет форму при наблюдении
      'bandwagon' // Эффект толпы - платформа следует за другими платформами при наблюдении
    ];
  }

  // Добавление когнитивного искажения
  addBias(platform, type = null, strength = 1) {
    if (this.biases.length >= this.maxBiases) {
      return -1;
    }

    const biasType = type || this.biasTypes[Math.floor(Math.random() * this.biasTypes.length)];

    const bias = {
      platform,
      type: biasType,
      strength: Math.max(0.1, Math.min(2, strength)), // Ограничиваем силу искажения
      isObserved: false,
      originalProperties: {
        width: platform.width || 50,
        height: platform.height || 10,
        color: platform.color || '#ffffff',
        solid: platform.solid !== undefined ? platform.solid : true,
        dangerous: platform.dangerous || false,
        visible: platform.visible !== undefined ? platform.visible : true
      },
      currentProperties: { ...platform },
      lastObservationTime: 0
    };

    this.biases.push(bias);
    return this.biases.length - 1;
  }

  // Обновление позиции игрока
  updatePlayerPosition(x, y) {
    this.playerPosition = { x, y };
  }

  // Проверка, наблюдается ли платформа
  isPlatformObserved(bias) {
    const platform = bias.platform;

    // Проверяем расстояние до игрока
    const distance = Math.sqrt(
      Math.pow(platform.x - this.playerPosition.x, 2) + 
      Math.pow(platform.y - this.playerPosition.y, 2)
    );

    return distance <= this.observationRadius;
  }

  // Применение эффекта когнитивного искажения
  applyBiasEffect(bias) {
    const { platform, type, strength, isObserved, originalProperties } = bias;

    switch (type) {
      case 'confirmation':
        // Подтверждающее искажение - платформа становится твердее при наблюдении
        platform.solid = isObserved ? true : originalProperties.solid * (1 - strength * 0.3);
        platform.color = isObserved ? '#00ff00' : originalProperties.color;
        break;

      case 'negativity':
        // Негативное искажение - платформа становится опаснее при наблюдении
        platform.dangerous = isObserved ? true : originalProperties.dangerous;
        platform.color = isObserved ? '#ff0000' : originalProperties.color;
        break;

      case 'availability':
        // Искажение доступности - платформа появляется/исчезает при наблюдении
        platform.visible = isObserved ? false : true;
        platform.solid = platform.visible;
        break;

      case 'anchoring':
        // Эффект якоря - платформа "притягивает" игрока при наблюдении
        if (isObserved) {
          // Создаем силу притяжения к платформе
          const dx = platform.x - this.playerPosition.x;
          const dy = platform.y - this.playerPosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0) {
            const pullForce = strength * 0.1;
            platform.pullForce = {
              x: (dx / distance) * pullForce,
              y: (dy / distance) * pullForce
            };
          }
        } else {
          platform.pullForce = { x: 0, y: 0 };
        }
        break;

      case 'illusory':
        // Иллюзорное искажение - платформа меняет форму при наблюдении
        if (isObserved) {
          platform.width = originalProperties.width * (1 + strength * 0.3);
          platform.height = originalProperties.height * (1 + strength * 0.3);
        } else {
          platform.width = originalProperties.width;
          platform.height = originalProperties.height;
        }
        break;

      case 'bandwagon':
        // Эффект толпы - платформа следует за другими платформами при наблюдении
        if (isObserved && this.biases.length > 1) {
          // Находим ближайшую платформу
          let nearestBias = null;
          let nearestDistance = Infinity;

          this.biases.forEach(otherBias => {
            if (otherBias !== bias) {
              const dx = otherBias.platform.x - platform.x;
              const dy = otherBias.platform.y - platform.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestBias = otherBias;
              }
            }
          });

          if (nearestBias) {
            // Двигаем платформу в сторону ближайшей
            const dx = nearestBias.platform.x - platform.x;
            const dy = nearestBias.platform.y - platform.y;
            const moveSpeed = strength * 0.05;

            platform.x += dx * moveSpeed;
            platform.y += dy * moveSpeed;
          }
        }
        break;
    }

    // Сохраняем текущие свойства
    bias.currentProperties = { ...platform };
  }

  // Обновление состояния системы
  update(deltaTime) {
    const now = Date.now();

    this.biases.forEach(bias => {
      // Проверяем, наблюдается ли платформа
      const wasObserved = bias.isObserved;
      bias.isObserved = this.isPlatformObserved(bias);

      // Если состояние наблюдения изменилось, записываем время
      if (wasObserved !== bias.isObserved) {
        bias.lastObservationTime = now;
      }

      // Применяем эффект искажения
      this.applyBiasEffect(bias);
    });
  }

  // Получение текущего состояния
  getState() {
    return {
      biases: this.biases.map(bias => ({
        type: bias.type,
        strength: bias.strength,
        isObserved: bias.isObserved,
        platformId: bias.platform.id || 'unknown'
      })),
      observationRadius: this.observationRadius,
      playerPosition: { ...this.playerPosition }
    };
  }

  // Сброс системы
  reset() {
    // Восстанавливаем исходные свойства всех платформ
    this.biases.forEach(bias => {
      const { platform, originalProperties } = bias;

      // Восстанавливаем исходные свойства
      Object.keys(originalProperties).forEach(key => {
        platform[key] = originalProperties[key];
      });

      // Удаляем дополнительные свойства
      if (platform.pullForce) {
        delete platform.pullForce;
      }
    });

    this.biases = [];
  }
}

// Функция для создания системы когнитивных искажений
export function createCognitiveBiasesSystem(maxBiases) {
  return new CognitiveBiasesSystem(maxBiases);
}

// Функция для форматирования статистики когнитивных искажений
export function formatCognitiveBiasesStats(stats) {
  const observedCount = stats.biases.filter(bias => bias.isObserved).length;
  return `Искажений: ${stats.biases.length}/${stats.maxBiases || 5}, Наблюдается: ${observedCount}`;
}

// Функция для создания платформы с когнитивным искажением
export function createBiasedPlatform(x, y, width, height, type, strength) {
  return {
    x, y, width, height,
    color: '#ffffff',
    solid: true,
    dangerous: false,
    visible: true,
    biasType: type,
    biasStrength: strength
  };
}
