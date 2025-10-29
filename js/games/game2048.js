// Размеры сетки и ячейки
const GRID_SIZE = 4;
const CELL_SIZE = GAME_WIDTH / GRID_SIZE;
const CELL_MARGIN = 5;
const TILE_SIZE = CELL_SIZE - CELL_MARGIN * 2;

// Цвета для плиток
const TILE_COLORS = {
    0: '#cdc1b4',
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
    4096: '#3c3a32',
    8192: '#3c3a32'
};

// Цвет текста для плиток
const TEXT_COLORS = {
    2: '#776e65',
    4: '#776e65',
    8: '#f9f6f2',
    16: '#f9f6f2',
    32: '#f9f6f2',
    64: '#f9f6f2',
    128: '#f9f6f2',
    256: '#f9f6f2',
    512: '#f9f6f2',
    1024: '#f9f6f2',
    2048: '#f9f6f2',
    4096: '#f9f6f2',
    8192: '#f9f6f2'
};

// Игровое поле
export const grid = {
    cells: [],

    init: function() {
        // Инициализация пустого поля
        this.cells = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            this.cells[i] = [];
            for (let j = 0; j < GRID_SIZE; j++) {
                this.cells[i][j] = 0;
            }
        }

        // Добавляем две начальные плитки
        this.addRandomTile();
        this.addRandomTile();
    },

    addRandomTile: function() {
        // Находим пустые ячейки
        const emptyCells = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (this.cells[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }

        // Если есть пустые ячейки, добавляем новую плитку
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90% шанс на плитку 2, 10% на плитку 4
            this.cells[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
        }
    },

    draw: function() {
        // Рисуем фон поля
        ctx.fillStyle = '#bbada0';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_WIDTH);

        // Рисуем ячейки и плитки
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                const x = j * CELL_SIZE + CELL_MARGIN;
                const y = i * CELL_SIZE + CELL_MARGIN;
                const value = this.cells[i][j];

                // Рисуем ячейку
                ctx.fillStyle = TILE_COLORS[0];
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

                // Если ячейка не пуста, рисуем плитку
                if (value !== 0) {
                    // Рисуем плитку
                    ctx.fillStyle = TILE_COLORS[value] || TILE_COLORS[8192];
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

                    // Рисуем значение
                    ctx.fillStyle = TEXT_COLORS[value] || '#f9f6f2';
                    ctx.font = value < 100 ? 'bold 32px Arial' : value < 1000 ? 'bold 28px Arial' : 'bold 24px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(value, x + TILE_SIZE / 2, y + TILE_SIZE / 2);
                }
            }
        }
    },

    moveLeft: function() {
        let moved = false;

        for (let i = 0; i < GRID_SIZE; i++) {
            // Сдвигаем все плитки влево
            const row = this.cells[i].filter(val => val !== 0);

            // Объединяем одинаковые плитки
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    row.splice(j + 1, 1);

                    // Обновляем счет
                    score += row[j];
                    scoreElement.textContent = score;
                }
            }

            // Добавляем пустые ячейки справа
            while (row.length < GRID_SIZE) {
                row.push(0);
            }

            // Проверяем, изменилось ли поле
            for (let j = 0; j < GRID_SIZE; j++) {
                if (this.cells[i][j] !== row[j]) {
                    moved = true;
                }
                this.cells[i][j] = row[j];
            }
        }

        return moved;
    },

    moveRight: function() {
        let moved = false;

        for (let i = 0; i < GRID_SIZE; i++) {
            // Сдвигаем все плитки вправо
            const row = this.cells[i].filter(val => val !== 0);

            // Объединяем одинаковые плитки
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    row.splice(j - 1, 1);

                    // Обновляем счет
                    score += row[j];
                    scoreElement.textContent = score;
                }
            }

            // Добавляем пустые ячейки слева
            while (row.length < GRID_SIZE) {
                row.unshift(0);
            }

            // Проверяем, изменилось ли поле
            for (let j = 0; j < GRID_SIZE; j++) {
                if (this.cells[i][j] !== row[j]) {
                    moved = true;
                }
                this.cells[i][j] = row[j];
            }
        }

        return moved;
    },

    moveUp: function() {
        let moved = false;

        for (let j = 0; j < GRID_SIZE; j++) {
            // Собираем столбец
            const column = [];
            for (let i = 0; i < GRID_SIZE; i++) {
                if (this.cells[i][j] !== 0) {
                    column.push(this.cells[i][j]);
                }
            }

            // Объединяем одинаковые плитки
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    column.splice(i + 1, 1);

                    // Обновляем счет
                    score += column[i];
                    scoreElement.textContent = score;
                }
            }

            // Добавляем пустые ячейки снизу
            while (column.length < GRID_SIZE) {
                column.push(0);
            }

            // Обновляем столбец
            for (let i = 0; i < GRID_SIZE; i++) {
                if (this.cells[i][j] !== column[i]) {
                    moved = true;
                }
                this.cells[i][j] = column[i];
            }
        }

        return moved;
    },

    moveDown: function() {
        let moved = false;

        for (let j = 0; j < GRID_SIZE; j++) {
            // Собираем столбец
            const column = [];
            for (let i = 0; i < GRID_SIZE; i++) {
                if (this.cells[i][j] !== 0) {
                    column.push(this.cells[i][j]);
                }
            }

            // Объединяем одинаковые плитки
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    column.splice(i - 1, 1);

                    // Обновляем счет
                    score += column[i];
                    scoreElement.textContent = score;
                }
            }

            // Добавляем пустые ячейки сверху
            while (column.length < GRID_SIZE) {
                column.unshift(0);
            }

            // Обновляем столбец
            for (let i = 0; i < GRID_SIZE; i++) {
                if (this.cells[i][j] !== column[i]) {
                    moved = true;
                }
                this.cells[i][j] = column[i];
            }
        }

        return moved;
    },

    checkGameOver: function() {
        // Проверяем, есть ли пустые ячейки
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (this.cells[i][j] === 0) {
                    return false;
                }
            }
        }

        // Проверяем, есть ли возможные слияния
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                const current = this.cells[i][j];

                // Проверяем соседей
                if (i > 0 && this.cells[i - 1][j] === current) return false;
                if (i < GRID_SIZE - 1 && this.cells[i + 1][j] === current) return false;
                if (j > 0 && this.cells[i][j - 1] === current) return false;
                if (j < GRID_SIZE - 1 && this.cells[i][j + 1] === current) return false;
            }
        }

        return true;
    },

    checkWin: function() {
        // Проверяем, есть ли плитка 2048
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (this.cells[i][j] === 2048) {
                    return true;
                }
            }
        }

        return false;
    },

    reset: function() {
        this.init();
    }
};

// Функции для управления игрой
export function init2048() {
    grid.init();
}

export function reset2048() {
    grid.reset();
    score = 0;
    scoreElement.textContent = score;
}

export function draw2048() {
    // Отрисовка игрового поля
    grid.draw();
}

export function move2048(direction) {
    let moved = false;

    switch(direction) {
        case 'left':
            moved = grid.moveLeft();
            break;
        case 'right':
            moved = grid.moveRight();
            break;
        case 'up':
            moved = grid.moveUp();
            break;
        case 'down':
            moved = grid.moveDown();
            break;
    }

    // Если поле изменилось, добавляем новую плитку
    if (moved) {
        grid.addRandomTile();

        // Проверяем условия окончания игры
        if (grid.checkWin()) {
            gameState = 'gameover';
            overlayTitle.textContent = 'Победа!';
            overlayMessage.textContent = `Вы достигли 2048! Счет: ${score}`;
            startButton.textContent = 'Играть снова';
            gameOverlay.style.display = 'flex';
        } else if (grid.checkGameOver()) {
            gameState = 'gameover';
            overlayTitle.textContent = 'Игра окончена!';
            overlayMessage.textContent = `Счет: ${score}`;
            startButton.textContent = 'Играть снова';
            gameOverlay.style.display = 'flex';
        }
    }
}
