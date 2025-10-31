// Интеграция новых игровых систем в демо-игры

import { createChromaticAdaptation } from './chromatic_adaptation.js';
import { createProprioceptiveDrift } from './proprioceptive_drift.js';
import { createMnemonicAnchors } from './mnemonic_anchors.js';

// Класс для управления интеграцией систем
export class GameSystemsIntegration {
  constructor(gameContainer, options = {}) {
    this.container = gameContainer;
    this.options = {
      enableChromaticAdaptation: options.enableChromaticAdaptation !== false,
      enableProprioceptiveDrift: options.enableProprioceptiveDrift !== false,
      enableMnemonicAnchors: options.enableMnemonicAnchors !== false,
      ...options
    };

    // Системы
    this.chromaticAdaptation = null;
    this.proprioceptiveDrift = null;
    this.mnemonicAnchors = null;

    // Инициализируем системы
    this.initializeSystems();
  }

  // Инициализация систем
  initializeSystems() {
    // Хроматическая адаптация
    if (this.options.enableChromaticAdaptation) {
      this.chromaticAdaptation = createChromaticAdaptation(this.container, {
        transitionSpeed: 0.03,
        colorChangeInterval: 12000,
        dominantColorDetection: true
      });
    }

    // Проприоцептивный дрифт
    if (this.options.enableProprioceptiveDrift) {
      this.proprioceptiveDrift = createProprioceptiveDrift(this.container, {
        driftSpeed: 0.0015,
        maxDrift: 0.4,
        recoverySpeed: 0.002,
        activeTime: 8000,
        inactiveTime: 4000,
        visualFeedback: true
      });
    }

    // Мнемонические якоря
    if (this.options.enableMnemonicAnchors) {
      this.mnemonicAnchors = createMnemonicAnchors(this.container, {
        maxAnchors: 3,
        anchorDuration: 15000,
        anchorRadius: 30,
        visualFeedback: true
      });
    }
  }

  // Применение модификаторов к игровым параметрам
  applyModifiers(baseParams) {
    let modifiedParams = { ...baseParams };

    // Применяем хроматическую адаптацию
    if (this.chromaticAdaptation) {
      this.chromaticAdaptation.update();
      const physicsModifiers = this.chromaticAdaptation.getCurrentPhysicsModifiers();

      // Применяем модификаторы к параметрам
      modifiedParams.speed = (modifiedParams.speed || 2) * physicsModifiers.speedMultiplier;
      modifiedParams.gravity = (modifiedParams.gravity || 0.5) * physicsModifiers.gravityMultiplier;
      modifiedParams.jumpHeight = (modifiedParams.jumpHeight || 10) * physicsModifiers.jumpMultiplier;
    }

    // Применяем проприоцептивный дрифт
    if (this.proprioceptiveDrift) {
      this.proprioceptiveDrift.update();

      // Сохраняем функцию для применения дрифта к вводу
      modifiedParams.applyDrift = (inputX, inputY) => {
        return this.proprioceptiveDrift.applyDrift(inputX, inputY);
      };

      // Сохраняем уровень дрифта для визуальных эффектов
      modifiedParams.driftLevel = this.proprioceptiveDrift.getDriftLevel();
    }

    // Применяем мнемонические якоря
    if (this.mnemonicAnchors) {
      this.mnemonicAnchors.update();

      // Сохраняем функции для работы с якорями
      modifiedParams.createAnchor = (x, y, gameState) => {
        return this.mnemonicAnchors.createAnchor(x, y, gameState);
      };

      modifiedParams.isPointInAnchorZone = (x, y) => {
        return this.mnemonicAnchors.isPointInAnchorZone(x, y);
      };

      modifiedParams.loadFromAnchor = (anchorId) => {
        return this.mnemonicAnchors.loadFromAnchor(anchorId);
      };
    }

    return modifiedParams;
  }

  // Обновление активности игрока
  updateActivity() {
    if (this.proprioceptiveDrift) {
      this.proprioceptiveDrift.updateActivity();
    }
  }

  // Очистка ресурсов
  destroy() {
    if (this.chromaticAdaptation) {
      this.chromaticAdaptation.destroy();
    }

    if (this.proprioceptiveDrift) {
      this.proprioceptiveDrift.destroy();
    }

    if (this.mnemonicAnchors) {
      this.mnemonicAnchors.destroy();
    }
  }
}

// Функция для создания интеграции систем
export function createGameSystemsIntegration(gameContainer, options) {
  return new GameSystemsIntegration(gameContainer, options);
}
