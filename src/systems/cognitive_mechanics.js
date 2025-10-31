// Когнитивные механики - система рабочей памяти

// Класс для системы рабочей памяти
export class WorkingMemorySystem {
  constructor(capacity = 7) {
    this.capacity = capacity;
    this.items = [];
    this.errors = 0;
  }

  // Добавление элемента в память
  addItem(item) {
    if (this.items.length >= this.capacity) {
      // Удаляем самый старый элемент
      this.items.shift();
      this.errors++;
    }
    this.items.push(item);
  }

  // Проверка наличия элемента
  hasItem(item) {
    return this.items.includes(item);
  }

  // Удаление элемента
  removeItem(item) {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
      return true;
    }
    this.errors++;
    return false;
  }

  // Очистка памяти
  clear() {
    this.items = [];
  }

  // Получение текущего состояния
  getState() {
    return {
      items: [...this.items],
      capacity: this.capacity,
      utilization: this.items.length / this.capacity,
      errors: this.errors
    };
  }
}

// Функция для создания системы рабочей памяти
export function createWorkingMemorySystem(capacity) {
  return new WorkingMemorySystem(capacity);
}

// Функция для форматирования статистики рабочей памяти
export function formatWorkingMemoryStats(stats) {
  return `Capacity: ${stats.capacity}, Items: ${stats.items.length}, Utilization: ${(stats.utilization * 100).toFixed(1)}%, Errors: ${stats.errors}`;
}
