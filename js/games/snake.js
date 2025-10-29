// Размеры сетки и ячейки
const GRID_SIZE = 20;
const CELL_SIZE = GAME_WIDTH / GRID_SIZE;

// Змейка
export const snake = {
    body: [{x: 10, y: 10}],
    direction: 'right',
    nextDirection: 'right',
    growing: false,

    draw: function() {
        ctx.fillStyle = '#4CAF50';

        for (let i = 0; i < this.body.length; i++) {
            const segment = this.body[i];

            // Голова змейки
            if (i === 0) {
                ctx.fillStyle = '#388E3C';
                ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2);

                // Глаза
                ctx.fillStyle = 'white';

                if (this.direction === 'right') {
                    ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - 8, segment.y * CELL_SIZE + 4, 4, 4);
                    ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - 8, segment.y * CELL_SIZE + CELL_SIZE - 8, 4, 4);
                } else if (this.direction === 'left') {
                    ctx.fillRect(segment.x * CELL_SIZE + 4, segment.y * CELL_SIZE + 4, 4, 4);
                    ctx.fillRect(segment.x * CELL_SIZE + 4, segment.y * CELL_SIZE + CELL_SIZE - 8, 4, 4);
                } else if (this.direction === 'up') {
                    ctx.fillRect(segment.x * CELL_SIZE + 4, segment.y * CELL_SIZE + 4, 4, 4);
                    ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - 8, segment.y * CELL_SIZE + 4, 4, 4);
                } else if (this.direction === 'down') {
                    ctx.fillRect(segment.x * CELL_SIZE + 4, segment.y * CELL_SIZE + CELL_SIZE - 8, 4, 4);
                    ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - 8, segment.y * CELL_SIZE + CELL_SIZE - 8, 4, 4);
                }
            } 
            // Тело змейки
            else {
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2);
            }
        }
    },

    update: function() {
        // Обновляем направление
        this.direction = this.nextDirection;

        // Определяем новую позицию головы
        const head = {...this.body[0]};

        switch(this.direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }

        // Проверка на столкновение со стенами
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            gameOver();
            return;
        }

        // Проверка на столкновение с телом
        for (let i = 0; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                gameOver();
                return;
            }
        }

        // Добавляем новую голову
        this.body.unshift(head);

        // Проверяем, съела ли змейка еду
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            this.growing = true;
            food.generate();
        } else {
            this.growing = false;
        }

        // Если змейка не растет, удаляем хвост
        if (!this.growing) {
            this.body.pop();
        }
    },

    reset: function() {
        this.body = [{x: 10, y: 10}];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.growing = false;
    }
};

// Еда
export const food = {
    x: 15,
    y: 10,

    draw: function() {
        ctx.fillStyle = '#F44336';
        ctx.beginPath();
        ctx.arc(
            this.x * CELL_SIZE + CELL_SIZE / 2,
            this.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    },

    generate: function() {
        // Генерируем новую позицию для еды
        let validPosition = false;

        while (!validPosition) {
            this.x = Math.floor(Math.random() * GRID_SIZE);
            this.y = Math.floor(Math.random() * GRID_SIZE);

            // Проверяем, что еда не появилась на змейке
            validPosition = true;
            for (let i = 0; i < snake.body.length; i++) {
                if (this.x === snake.body[i].x && this.y === snake.body[i].y) {
                    validPosition = false;
                    break;
                }
            }
        }
    },

    reset: function() {
        this.x = 15;
        this.y = 10;
    }
};

// Фон
export const background = {
    draw: function() {
        // Темный фон
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Сетка
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;

        for (let i = 0; i <= GRID_SIZE; i++) {
            // Вертикальные линии
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, GAME_HEIGHT);
            ctx.stroke();

            // Горизонтальные линии
            ctx.beginPath();
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(GAME_WIDTH, i * CELL_SIZE);
            ctx.stroke();
        }
    }
};

// Таймер для обновления змейки
let snakeTimer = 0;
const SNAKE_SPEED = 100; // Миллисекунды между обновлениями

// Функции инициализации и обновления игры
export function initSnake() {
    // Инициализация при необходимости
}

export function resetSnake() {
    snake.reset();
    food.reset();
    food.generate();
    score = 0;
    scoreElement.textContent = score;
    snakeTimer = 0;
}

export function updateSnake() {
    if (gameState === 'playing') {
        // Обновляем змейку с определенной скоростью
        snakeTimer += 16; // Примерно 60 FPS

        if (snakeTimer >= SNAKE_SPEED) {
            snake.update();
            snakeTimer = 0;
        }
    }
}

export function drawSnake() {
    // Отрисовка фона
    background.draw();

    // Отрисовка еды
    food.draw();

    // Отрисовка змейки
    snake.draw();
}
