// Система когнитивных механик, включая рабочую память

import { pseudoRandom } from './proc_gen.js';

// Класс для управления системой рабочей памяти
export class WorkingMemorySystem {
  constructor(gameContainer, options = {}) {
    this.container = gameContainer;
    this.options = {
      sequenceLength: options.sequenceLength || 4, // Длина последовательности для запоминания
      displayTime: options.displayTime || 3000, // Время отображения последовательности (мс)
      inputTime: options.inputTime || 10000, // Время для ввода последовательности (мс)
      symbolTypes: options.symbolTypes || ['circle', 'square', 'triangle', 'star'], // Типы символов
      colors: options.colors || ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'], // Цвета символов
      difficulty: options.difficulty || 1, // Уровень сложности
      ...options
    };

    // Состояние системы
    this.currentSequence = [];
    this.playerInput = [];
    this.isDisplayingSequence = false;
    this.isWaitingForInput = false;
    this.score = 0;
    this.attempts = 0;
    this.successes = 0;

    // Создаем UI для системы рабочей памяти
    this.createUI();

    // Генерируем начальную последовательность
    this.generateSequence();
  }

  // Создание UI для системы рабочей памяти
  createUI() {
    // Создаем контейнер для UI
    this.uiContainer = document.createElement('div');
    this.uiContainer.className = 'working-memory-ui';
    this.uiContainer.style.position = 'absolute';
    this.uiContainer.style.top = '10px';
    this.uiContainer.style.left = '10px';
    this.uiContainer.style.padding = '10px';
    this.uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.uiContainer.style.borderRadius = '8px';
    this.uiContainer.style.color = 'white';
    this.uiContainer.style.zIndex = '1000';
    this.uiContainer.style.display = 'none'; // Изначально скрыт

    // Создаем заголовок
    this.titleElement = document.createElement('div');
    this.titleElement.textContent = 'Рабочая память';
    this.titleElement.style.fontWeight = 'bold';
    this.titleElement.style.marginBottom = '10px';
    this.uiContainer.appendChild(this.titleElement);

    // Создаем контейнер для отображения последовательности
    this.sequenceContainer = document.createElement('div');
    this.sequenceContainer.className = 'sequence-display';
    this.sequenceContainer.style.display = 'flex';
    this.sequenceContainer.style.gap = '10px';
    this.sequenceContainer.style.marginBottom = '10px';
    this.uiContainer.appendChild(this.sequenceContainer);

    // Создаем контейнер для ввода игрока
    this.inputContainer = document.createElement('div');
    this.inputContainer.className = 'input-display';
    this.inputContainer.style.display = 'flex';
    this.inputContainer.style.gap = '10px';
    this.inputContainer.style.marginBottom = '10px';
    this.uiContainer.appendChild(this.inputContainer);

    // Создаем контейнер для кнопок ввода
    this.buttonsContainer = document.createElement('div');
    this.buttonsContainer.className = 'input-buttons';
    this.buttonsContainer.style.display = 'grid';
    this.buttonsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
    this.buttonsContainer.style.gap = '5px';
    this.uiContainer.appendChild(this.buttonsContainer);

    // Создаем кнопки для ввода
    this.createInputButtons();

    // Создаем элемент для отображения счета
    this.scoreElement = document.createElement('div');
    this.scoreElement.textContent = `Счет: ${this.score} | Попытки: ${this.attempts} | Успехи: ${this.successes}`;
    this.uiContainer.appendChild(this.scoreElement);

    // Добавляем UI в контейнер игры
    this.container.appendChild(this.uiContainer);
  }

  // Создание кнопок для ввода
  createInputButtons() {
    // Создаем кнопки для каждого типа символа и цвета
    for (let i = 0; i < this.options.symbolTypes.length; i++) {
      for (let j = 0; j < this.options.colors.length; j++) {
        const symbolType = this.options.symbolTypes[i];
        const color = this.options.colors[j];

        const button = document.createElement('button');
        button.className = 'input-button';
        button.style.width = '40px';
        button.style.height = '40px';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.backgroundColor = color;
        button.style.cursor = 'pointer';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';

        // Создаем символ внутри кнопки
        const symbol = document.createElement('div');
        symbol.style.width = '20px';
        symbol.style.height = '20px';
        symbol.style.backgroundColor = 'white';

        // Применяем форму символа
        switch (symbolType) {
          case 'circle':
            symbol.style.borderRadius = '50%';
            break;
          case 'square':
            symbol.style.borderRadius = '0';
            break;
          case 'triangle':
            symbol.style.width = '0';
            symbol.style.height = '0';
            symbol.style.borderLeft = '10px solid transparent';
            symbol.style.borderRight = '10px solid transparent';
            symbol.style.borderBottom = `20px solid white`;
            symbol.style.backgroundColor = 'transparent';
            break;
          case 'star':
            symbol.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
            break;
        }

        button.appendChild(symbol);

        // Добавляем обработчик клика
        button.addEventListener('click', () => {
          this.handleInput(symbolType, color);
        });

        this.buttonsContainer.appendChild(button);
      }
    }
  }

  // Генерация новой последовательности
  generateSequence() {
    const rnd = pseudoRandom(Date.now());
    this.currentSequence = [];

    // Генерируем последовательность заданной длины
    for (let i = 0; i < this.options.sequenceLength; i++) {
      const symbolType = this.options.symbolTypes[Math.floor(rnd() * this.options.symbolTypes.length)];
      const color = this.options.colors[Math.floor(rnd() * this.options.colors.length)];

      this.currentSequence.push({ type: symbolType, color: color });
    }
  }

  // Отображение последовательности игроку
  displaySequence() {
    this.isDisplayingSequence = true;
    this.playerInput = [];

    // Очищаем контейнер для ввода
    this.inputContainer.innerHTML = '';

    // Отображаем заголовок
    this.titleElement.textContent = 'Запомните последовательность';

    // Отображаем символы последовательности
    this.sequenceContainer.innerHTML = '';

    this.currentSequence.forEach((item) => {
      // Создаем элемент для символа
      const symbolElement = document.createElement('div');
      symbolElement.style.width = '30px';
      symbolElement.style.height = '30px';
      symbolElement.style.backgroundColor = item.color;
      symbolElement.style.display = 'flex';
      symbolElement.style.alignItems = 'center';
      symbolElement.style.justifyContent = 'center';

      // Создаем символ
      const symbol = document.createElement('div');
      symbol.style.width = '15px';
      symbol.style.height = '15px';
      symbol.style.backgroundColor = 'white';

      // Применяем форму символа
      switch (item.type) {
        case 'circle':
          symbol.style.borderRadius = '50%';
          break;
        case 'square':
          symbol.style.borderRadius = '0';
          break;
        case 'triangle':
          symbol.style.width = '0';
          symbol.style.height = '0';
          symbol.style.borderLeft = '7.5px solid transparent';
          symbol.style.borderRight = '7.5px solid transparent';
          symbol.style.borderBottom = `15px solid white`;
          symbol.style.backgroundColor = 'transparent';
          break;
        case 'star':
          symbol.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
          break;
      }

      symbolElement.appendChild(symbol);
      this.sequenceContainer.appendChild(symbolElement);
    });

    // Показываем UI
    this.uiContainer.style.display = 'block';

    // Через заданное время скрываем последовательность и ждем ввода
    setTimeout(() => {
      this.hideSequenceAndWaitForInput();
    }, this.options.displayTime);
  }

  // Скрытие последовательности и ожидание ввода
  hideSequenceAndWaitForInput() {
    this.isDisplayingSequence = false;
    this.isWaitingForInput = true;

    // Скрываем последовательность
    this.sequenceContainer.innerHTML = '';

    // Обновляем заголовок
    this.titleElement.textContent = 'Повторите последовательность';

    // Устанавливаем таймер для ввода
    this.inputTimeout = setTimeout(() => {
      this.checkInput();
    }, this.options.inputTime);
  }

  // Обработка ввода игрока
  handleInput(symbolType, color) {
    if (!this.isWaitingForInput) return;

    // Добавляем ввод игрока
    this.playerInput.push({ type: symbolType, color: color });

    // Отображаем введенный символ
    const inputSymbol = document.createElement('div');
    inputSymbol.style.width = '30px';
    inputSymbol.style.height = '30px';
    inputSymbol.style.backgroundColor = color;
    inputSymbol.style.display = 'flex';
    inputSymbol.style.alignItems = 'center';
    inputSymbol.style.justifyContent = 'center';

    // Создаем символ
    const symbol = document.createElement('div');
    symbol.style.width = '15px';
    symbol.style.height = '15px';
    symbol.style.backgroundColor = 'white';

    // Применяем форму символа
    switch (symbolType) {
      case 'circle':
        symbol.style.borderRadius = '50%';
        break;
      case 'square':
        symbol.style.borderRadius = '0';
        break;
      case 'triangle':
        symbol.style.width = '0';
        symbol.style.height = '0';
        symbol.style.borderLeft = '7.5px solid transparent';
        symbol.style.borderRight = '7.5px solid transparent';
        symbol.style.borderBottom = `15px solid white`;
        symbol.style.backgroundColor = 'transparent';
        break;
      case 'star':
        symbol.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
        break;
    }

    inputSymbol.appendChild(symbol);
    this.inputContainer.appendChild(inputSymbol);

    // Проверяем ввод, если достигнута нужная длина
    if (this.playerInput.length === this.currentSequence.length) {
      clearTimeout(this.inputTimeout);
      this.checkInput();
    }
  }

  // Проверка ввода игрока
  checkInput() {
    this.isWaitingForInput = false;
    this.attempts++;

    // Проверяем правильность ввода
    let isCorrect = true;
    if (this.playerInput.length !== this.currentSequence.length) {
      isCorrect = false;
    } else {
      for (let i = 0; i < this.currentSequence.length; i++) {
        if (this.currentSequence[i].type !== this.playerInput[i].type ||
            this.currentSequence[i].color !== this.playerInput[i].color) {
          isCorrect = false;
          break;
        }
      }
    }

    if (isCorrect) {
      this.successes++;
      this.score += this.currentSequence.length * 10 * this.options.difficulty;
      this.titleElement.textContent = 'Правильно! + ' + (this.currentSequence.length * 10 * this.options.difficulty) + ' очков';

      // Увеличиваем сложность
      if (this.successes % 3 === 0) {
        this.options.sequenceLength = Math.min(8, this.options.sequenceLength + 1);
        this.options.displayTime = Math.max(2000, this.options.displayTime - 200);
      }
    } else {
      this.titleElement.textContent = 'Неправильно! Попробуйте еще раз.';

      // Уменьшаем сложность
      if (this.attempts > 3 && this.successes === 0) {
        this.options.sequenceLength = Math.max(3, this.options.sequenceLength - 1);
        this.options.displayTime = Math.min(5000, this.options.displayTime + 200);
      }
    }

    // Обновляем счет
    this.scoreElement.textContent = `Счет: ${this.score} | Попытки: ${this.attempts} | Успехи: ${this.successes}`;

    // Через некоторое время скрываем UI и генерируем новую последовательность
    setTimeout(() => {
      this.uiContainer.style.display = 'none';
      this.generateSequence();
    }, 2000);
  }

  // Получение текущего счета
  getScore() {
    return {
      score: this.score,
      attempts: this.attempts,
      successes: this.successes,
      successRate: this.attempts > 0 ? Math.round((this.successes / this.attempts) * 100) : 0,
      difficulty: this.options.difficulty,
      sequenceLength: this.options.sequenceLength
    };
  }

  // Очистка ресурсов
  destroy() {
    if (this.inputTimeout) {
      clearTimeout(this.inputTimeout);
      this.inputTimeout = null;
    }

    if (this.container.contains(this.uiContainer)) {
      this.container.removeChild(this.uiContainer);
    }
  }
}

// Функция для создания системы рабочей памяти
export function createWorkingMemorySystem(gameContainer, options) {
  return new WorkingMemorySystem(gameContainer, options);
}

// Форматирование статистики рабочей памяти для отображения
export function formatWorkingMemoryStats(stats) {
  return `
=== СТАТИСТИКА РАБОЧЕЙ ПАМЯТИ ===

Счет: ${stats.score}
Попытки: ${stats.attempts}
Успехи: ${stats.successes}
Процент успеха: ${stats.successRate}%
Уровень сложности: ${stats.difficulty}
Длина последовательности: ${stats.sequenceLength}

${stats.successRate > 70
  ? 'Отличная рабочая память! Вы легко запоминаете сложные последовательности.'
  : stats.successRate > 40
  ? 'Неплохая рабочая память! Продолжайте тренироваться для улучшения.'
  : 'Рабочая память требует развития. Регулярные тренировки помогут улучшить результат.'}
  `.trim();
}
