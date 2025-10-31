// Мнемонические якоря - временные точки сохранения состояния

// Класс для управления мнемоническими якорями
export class MnemonicAnchors {
  constructor(maxAnchors = 3) {
    this.maxAnchors = maxAnchors;
    this.anchors = [];
  }

  // Создание якоря
  createAnchor(state, label = 'Anchor') {
    const anchor = {
      id: Date.now().toString(),
      label,
      state: JSON.parse(JSON.stringify(state)), // Глубокая копия
      timestamp: Date.now()
    };

    this.anchors.push(anchor);

    // Ограничение количества якорей
    if (this.anchors.length > this.maxAnchors) {
      this.anchors.shift(); // Удаляем самый старый
    }

    return anchor.id;
  }

  // Восстановление состояния из якоря
  restoreAnchor(anchorId) {
    const anchor = this.anchors.find(a => a.id === anchorId);
    if (anchor) {
      return JSON.parse(JSON.stringify(anchor.state)); // Глубокая копия
    }
    return null;
  }

  // Получение списка якорей
  getAnchors() {
    return [...this.anchors];
  }

  // Удаление якоря
  removeAnchor(anchorId) {
    this.anchors = this.anchors.filter(a => a.id !== anchorId);
  }

  // Очистка всех якорей
  clearAnchors() {
    this.anchors = [];
  }
}

// Функция для создания системы мнемонических якорей
export function createMnemonicAnchors(maxAnchors) {
  return new MnemonicAnchors(maxAnchors);
}
