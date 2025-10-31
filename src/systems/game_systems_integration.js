// Интеграция игровых систем - объединение различных компонентов

// Класс для интеграции игровых систем
export class GameSystemsIntegration {
  constructor() {
    this.systems = new Map();
    this.initialized = false;
  }

  // Регистрация системы
  registerSystem(name, system) {
    this.systems.set(name, system);
    return this;
  }

  // Получение системы
  getSystem(name) {
    return this.systems.get(name);
  }

  // Инициализация всех систем
  async init() {
    const initPromises = Array.from(this.systems.values())
      .filter((system) => typeof system.init === 'function')
      .map((system) => system.init());

    await Promise.all(initPromises);
    this.initialized = true;
    return this;
  }

  // Обновление всех систем
  update(deltaTime) {
    if (!this.initialized) return;

    this.systems.forEach((system) => {
      if (typeof system.update === 'function') {
        system.update(deltaTime);
      }
    });
  }

  // Очистка всех систем
  destroy() {
    this.systems.forEach((system) => {
      if (typeof system.destroy === 'function') {
        system.destroy();
      }
    });
    this.systems.clear();
    this.initialized = false;
  }

  // Получение состояния всех систем
  getState() {
    const state = {};
    this.systems.forEach((system, name) => {
      if (typeof system.getState === 'function') {
        state[name] = system.getState();
      }
    });
    return state;
  }
}

// Функция для создания интеграции игровых систем
export function createGameSystemsIntegration() {
  return new GameSystemsIntegration();
}
