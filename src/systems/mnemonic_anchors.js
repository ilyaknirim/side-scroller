// Система мнемонических якорей - временные точки сохранения состояния

// Класс для управления мнемоническими якорями
export class MnemonicAnchors {
  constructor(gameContainer, options = {}) {
    this.container = gameContainer;
    this.options = {
      maxAnchors: options.maxAnchors || 3, // Максимум якорей одновременно
      anchorDuration: options.anchorDuration || 10000, // Длительность действия якоря (мс)
      anchorRadius: options.anchorRadius || 30, // Радиус действия якоря
      visualFeedback: options.visualFeedback !== false, // Визуальная индикация якорей
      ...options
    };

    // Текущее состояние
    this.anchors = [];
    this.anchorIdCounter = 0;

    // Создаем UI для индикации якорей
    if (this.options.visualFeedback) {
      this.createAnchorIndicator();
    }
  }

  // Создание индикатора якорей
  createAnchorIndicator() {
    // Создаем контейнер для индикатора
    this.indicatorContainer = document.createElement('div');
    this.indicatorContainer.className = 'mnemonic-anchors-indicator';
    this.indicatorContainer.style.position = 'absolute';
    this.indicatorContainer.style.top = '10px';
    this.indicatorContainer.style.left = '10px';
    this.indicatorContainer.style.padding = '8px';
    this.indicatorContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.indicatorContainer.style.borderRadius = '8px';
    this.indicatorContainer.style.color = 'white';
    this.indicatorContainer.style.zIndex = '1000';
    this.indicatorContainer.style.fontSize = '12px';

    // Создаем список якорей
    this.anchorList = document.createElement('div');
    this.anchorList.style.marginTop = '5px';

    // Создаем заголовок
    const title = document.createElement('div');
    title.textContent = `Мнемонические якоря (0/${this.options.maxAnchors})`;
    title.style.marginBottom = '5px';

    // Собираем индикатор
    this.indicatorContainer.appendChild(title);
    this.indicatorContainer.appendChild(this.anchorList);
    this.container.appendChild(this.indicatorContainer);
  }

  // Создание нового якоря
  createAnchor(x, y, gameState) {
    // Проверяем, не превышен ли лимит якорей
    if (this.anchors.length >= this.options.maxAnchors) {
      // Удаляем самый старый якорь
      const oldestAnchor = this.anchors.shift();
      this.removeAnchorVisual(oldestAnchor.id);
    }

    // Создаем новый якорь
    const anchorId = ++this.anchorIdCounter;
    const anchor = {
      id: anchorId,
      x: x,
      y: y,
      gameState: JSON.parse(JSON.stringify(gameState)), // Глубокое копирование состояния
      createdAt: Date.now(),
      expiresAt: Date.now() + this.options.anchorDuration
    };

    // Добавляем якорь в список
    this.anchors.push(anchor);

    // Создаем визуальное представление якоря
    if (this.options.visualFeedback) {
      this.createAnchorVisual(anchor);
    }

    // Обновляем индикатор
    this.updateIndicator();

    // Уведомляем слушателей о создании якоря
    this.notifyEventListeners('anchorCreated', anchor);

    // Устанавливаем таймер для удаления якоря
    setTimeout(() => this.removeAnchor(anchorId), this.options.anchorDuration);

    return anchorId;
  }

  // Создание визуального представления якоря
  createAnchorVisual(anchor) {
    // Создаем элемент якоря
    const anchorElement = document.createElement('div');
    anchorElement.className = 'mnemonic-anchor';
    anchorElement.id = `anchor-${anchor.id}`;
    anchorElement.style.position = 'absolute';
    anchorElement.style.left = `${anchor.x - this.options.anchorRadius}px`;
    anchorElement.style.top = `${anchor.y - this.options.anchorRadius}px`;
    anchorElement.style.width = `${this.options.anchorRadius * 2}px`;
    anchorElement.style.height = `${this.options.anchorRadius * 2}px`;
    anchorElement.style.borderRadius = '50%';
    anchorElement.style.border = '2px solid rgba(255, 255, 255, 0.8)';
    anchorElement.style.backgroundColor = 'rgba(100, 200, 255, 0.3)';
    anchorElement.style.pointerEvents = 'none';
    anchorElement.style.zIndex = '100';
    anchorElement.style.animation = 'pulse 2s infinite';

    // Добавляем пульсирующую анимацию
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.1); opacity: 0.5; }
        100% { transform: scale(1); opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);

    // Добавляем элемент в контейнер
    this.container.appendChild(anchorElement);
  }

  // Удаление визуального представления якоря
  removeAnchorVisual(anchorId) {
    const anchorElement = document.getElementById(`anchor-${anchorId}`);
    if (anchorElement && this.container.contains(anchorElement)) {
      this.container.removeChild(anchorElement);
    }
  }

  // Удаление якоря
  removeAnchor(anchorId) {
    // Находим индекс якоря
    const index = this.anchors.findIndex(anchor => anchor.id === anchorId);

    if (index !== -1) {
      // Удаляем якорь из списка
      const removedAnchor = this.anchors.splice(index, 1)[0];

      // Удаляем визуальное представление
      this.removeAnchorVisual(anchorId);

      // Обновляем индикатор
      this.updateIndicator();

      // Уведомляем слушателей об удалении якоря
      this.notifyEventListeners('anchorRemoved', removedAnchor);

      return removedAnchor;
    }

    return null;
  }

  // Проверка, находится ли точка в зоне действия якоря
  isPointInAnchorZone(x, y) {
    for (const anchor of this.anchors) {
      const distance = Math.sqrt(
        Math.pow(x - anchor.x, 2) + Math.pow(y - anchor.y, 2)
      );

      if (distance <= this.options.anchorRadius) {
        return anchor;
      }
    }

    return null;
  }

  // Загрузка состояния из якоря
  loadFromAnchor(anchorId) {
    // Находим якорь
    const anchor = this.anchors.find(a => a.id === anchorId);

    if (anchor) {
      // Удаляем якорь после использования
      this.removeAnchor(anchorId);

      // Уведомляем слушателей о загрузке состояния
      this.notifyEventListeners('anchorLoaded', anchor.gameState);

      return anchor.gameState;
    }

    return null;
  }

  // Обновление индикатора якорей
  updateIndicator() {
    if (!this.options.visualFeedback) return;

    // Обновляем заголовок с количеством якорей
    const title = this.indicatorContainer.querySelector('div');
    title.textContent = `Мнемонические якоря (${this.anchors.length}/${this.options.maxAnchors})`;

    // Обновляем список якорей
    this.anchorList.innerHTML = '';

    // Добавляем каждый якорь в список
    this.anchors.forEach(anchor => {
      const anchorItem = document.createElement('div');
      anchorItem.style.marginBottom = '3px';
      anchorItem.style.fontSize = '11px';

      // Вычисляем время до истечения якоря
      const timeLeft = Math.max(0, anchor.expiresAt - Date.now());
      const secondsLeft = Math.ceil(timeLeft / 1000);

      // Определяем цвет в зависимости от времени
      let color = '#4ecdc4'; // Бирюзовый
      if (timeLeft < 3000) { // Менее 3 секунд
        color = '#ff6b6b'; // Красный
      } else if (timeLeft < 7000) { // Менее 7 секунд
        color = '#ff9f40'; // Оранжевый
      }

      anchorItem.style.color = color;
      anchorItem.innerHTML = `Якорь #${anchor.id}: ${secondsLeft}с`;

      // Добавляем обработчик клика для загрузки состояния
      anchorItem.style.cursor = 'pointer';
      anchorItem.addEventListener('click', () => {
        this.loadFromAnchor(anchor.id);
      });

      this.anchorList.appendChild(anchorItem);
    });
  }

  // Обновление состояния всех якорей
  update() {
    const now = Date.now();

    // Проверяем, не истекло ли время действия якорей
    for (let i = this.anchors.length - 1; i >= 0; i--) {
      if (this.anchors[i].expiresAt <= now) {
        this.removeAnchor(this.anchors[i].id);
      }
    }

    // Обновляем индикатор
    this.updateIndicator();
  }

  // Добавление слушателя событий
  addEventListener(callback) {
    if (!this.eventListeners) {
      this.eventListeners = [];
    }
    this.eventListeners.push(callback);
  }

  // Удаление слушателя событий
  removeEventListener(callback) {
    if (this.eventListeners) {
      const index = this.eventListeners.indexOf(callback);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    }
  }

  // Уведомление слушателей о событиях
  notifyEventListeners(eventType, data) {
    if (this.eventListeners) {
      this.eventListeners.forEach(callback => {
        try {
          callback(eventType, data);
        } catch (error) {
          console.error('Error in mnemonic anchors event listener:', error);
        }
      });
    }
  }

  // Очистка ресурсов
  destroy() {
    // Удаляем все визуальные элементы якорей
    for (const anchor of this.anchors) {
      this.removeAnchorVisual(anchor.id);
    }

    // Удаляем индикатор
    if (this.indicatorContainer && this.container.contains(this.indicatorContainer)) {
      this.container.removeChild(this.indicatorContainer);
    }

    // Очищаем список якорей
    this.anchors = [];
    this.eventListeners = [];
  }
}

// Функция для создания системы мнемонических якорей
export function createMnemonicAnchors(gameContainer, options) {
  return new MnemonicAnchors(gameContainer, options);
}
