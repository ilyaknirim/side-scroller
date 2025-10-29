// Импорт констант и переменных
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { ctx, score, gameState, scoreElement } from '../main.js';

// Глобальная переменная для canvas
let gameCanvas;

// Объявляем currentGame, так как он импортируется динамически
let currentGame;

// Функция gameOver будет определена в main.js, но нам нужно объявить ее здесь
let gameOver;
export function setGameOver(fn) { gameOver = fn; }

// Функция для установки currentGame
export function setCurrentGame(game) { currentGame = game; }

// Платформа
export const paddle = {
    x: GAME_WIDTH / 2 - 40,
    y: GAME_HEIGHT - 30,
    width: 80,
    height: 10,
    speed: 8,

    draw: function() {
        // Добавляем эффект градиента для платформы
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#1a3a52');
        gradient.addColorStop(1, '#0f1f2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },

    update: function() {
        // Движение платформы
        if (this.movingLeft) {
            this.x -= this.speed;
        } else if (this.movingRight) {
            this.x += this.speed;
        }

        // Ограничение движения платформы
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > GAME_WIDTH) {
            this.x = GAME_WIDTH - this.width;
        }
    },

    moveLeft: function() {
        this.movingLeft = true;
    },

    moveRight: function() {
        this.movingRight = true;
    },

    stopMovingLeft: function() {
        this.movingLeft = false;
    },

    stopMovingRight: function() {
        this.movingRight = false;
    },

    reset: function() {
        this.x = GAME_WIDTH / 2 - 40;
        this.y = GAME_HEIGHT - 30;
        this.movingLeft = false;
        this.movingRight = false;
    }
};

// Мяч
export const ball = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 50,
    radius: 6,
    velocityX: 4,
    velocityY: -4,
    speed: 4,

    draw: function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#e94560';
        ctx.fill();

        // Добавляем блик
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, this.radius / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6b7a';
        ctx.fill();
    },

    update: function() {
        // Движение мяча
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Столкновение со стенами
        if (this.x + this.radius > GAME_WIDTH || this.x - this.radius < 0) {
            this.velocityX = -this.velocityX;
        }

        if (this.y - this.radius < 0) {
            this.velocityY = -this.velocityY;
        }

        // Столкновение с платформой
        if (
            this.y + this.radius > paddle.y &&
            this.y - this.radius < paddle.y + paddle.height &&
            this.x > paddle.x &&
            this.x < paddle.x + paddle.width
        ) {
            // Вычисляем угол отскока в зависимости от точки попадания на платформу
            const collidePoint = this.x - (paddle.x + paddle.width / 2);
            const normalizedPoint = collidePoint / (paddle.width / 2);
            const bounceAngle = normalizedPoint * Math.PI / 4;

            // Устанавливаем новую скорость
            this.velocityX = this.speed * Math.sin(bounceAngle);
            this.velocityY = -this.speed * Math.cos(bounceAngle);

            // Предотвращаем многократные столкновения с платформой
            this.y = paddle.y - this.radius;
        }

        // Проверка на падение мяча
        if (this.y - this.radius > GAME_HEIGHT) {
            gameOver();
        }
    },

    reset: function() {
        this.x = GAME_WIDTH / 2;
        this.y = GAME_HEIGHT - 50;
        const angle = Math.random() * Math.PI / 2 + Math.PI / 4;
        this.velocityX = this.speed * Math.cos(angle);
        this.velocityY = -this.speed * Math.sin(angle);
    }
};

// Кирпичи
export const bricks = {
    rows: 5,
    cols: 8,
    width: 30,
    height: 15,
    padding: 5,
    offsetTop: 60,
    offsetLeft: 25,
    positions: [],

    init: function() {
        // Инициализация массива кирпичей
        for (let r = 0; r < this.rows; r++) {
            this.positions[r] = [];
            for (let c = 0; c < this.cols; c++) {
                // Определяем цвет кирпича в зависимости от ряда
                let color;
                switch(r) {
                    case 0:
                        color = '#e74c3c';
                        break;
                    case 1:
                        color = '#e67e22';
                        break;
                    case 2:
                        color = '#f1c40f';
                        break;
                    case 3:
                        color = '#2ecc71';
                        break;
                    case 4:
                        color = '#3498db';
                        break;
                }

                this.positions[r][c] = {
                    x: c * (this.width + this.padding) + this.offsetLeft,
                    y: r * (this.height + this.padding) + this.offsetTop,
                    status: 1,
                    color: color
                };
            }
        }
    },

    draw: function() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const brick = this.positions[r][c];

                if (brick.status === 1) {
                    ctx.fillStyle = brick.color;
                    ctx.fillRect(brick.x, brick.y, this.width, this.height);

                    // Добавляем градиент
                    const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + this.height);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(brick.x, brick.y, this.width, this.height);
                }
            }
        }
    },

    update: function() {
        // Флаг для отслеживания столкновения на текущем кадре
        let collisionDetected = false;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const brick = this.positions[r][c];

                if (brick.status === 1) {
                    // Проверка столкновения мяча с кирпичом
                    if (
                        ball.x + ball.radius > brick.x &&
                        ball.x - ball.radius < brick.x + this.width &&
                        ball.y + ball.radius > brick.y &&
                        ball.y - ball.radius < brick.y + this.height
                    ) {
                        // Если уже было столкновение на этом кадре, пропускаем
                        if (collisionDetected) continue;

                        // Определяем сторону столкновения
                        const ballCenterX = ball.x;
                        const ballCenterY = ball.y;
                        const brickCenterX = brick.x + this.width / 2;
                        const brickCenterY = brick.y + this.height / 2;

                        const diffX = ballCenterX - brickCenterX;
                        const diffY = ballCenterY - brickCenterY;

                        // Изменяем направление мяча в зависимости от стороны столкновения
                        if (Math.abs(diffX) > Math.abs(diffY)) {
                            ball.velocityX = -ball.velocityX;
                        } else {
                            ball.velocityY = -ball.velocityY;
                        }

                        // Убираем кирпич
                        brick.status = 0;
                        collisionDetected = true;

                        // Увеличиваем счет
                        score += 10;
                        scoreElement.textContent = score;

                        // Проверяем, не разбиты ли все кирпичи
                        let allBricksDestroyed = true;
                        for (let i = 0; i < this.rows; i++) {
                            for (let j = 0; j < this.cols; j++) {
                                if (this.positions[i][j].status === 1) {
                                    allBricksDestroyed = false;
                                    break;
                                }
                            }
                            if (!allBricksDestroyed) break;
                        }

                        // Если все кирпичи разбиты, начинаем новый уровень
                        if (allBricksDestroyed) {
                            this.init();
                            ball.speed += 0.5;
                            ball.reset();
                        }
                    }
                }
            }
        }
    },

    reset: function() {
        this.init();
    }
};

// Фон
export const background = {
    draw: function() {
        // Градиентный фон
        const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Добавляем эффект звезд
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 30; i++) {
            const x = (i * 73) % GAME_WIDTH;
            const y = (i * 37) % GAME_HEIGHT;
            const size = (i % 3) + 1;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

// Функции инициализации и обновления игры
export function initBreakout(canvasElement) {
    // Проверяем наличие canvas
    if (!canvasElement) {
        console.error('Canvas element is missing for Breakout game');
        return;
    }

    // Сохраняем canvas для использования в обработчиках событий
    gameCanvas = canvasElement;
    bricks.init();

    // Настраиваем обработчики событий
    setupEventListeners();
}

// Функция для настройки обработчиков событий
function setupEventListeners() {
    // Управление касанием для мобильных устройств
    let touchStartX = null;

    gameCanvas.addEventListener('touchstart', (e) => {
        if (currentGame !== 'breakout' || gameState !== 'playing') return;

        e.preventDefault(); // Предотвращаем стандартное поведение
        touchStartX = e.touches[0].clientX;
    });

    gameCanvas.addEventListener('touchmove', (e) => {
        if (currentGame !== 'breakout' || gameState !== 'playing' || touchStartX === null) return;

        e.preventDefault();

        const touchX = e.touches[0].clientX;
        const diffX = touchX - touchStartX;

        // Двигаем платформу в зависимости от движения пальца
        if (diffX > 10) {
            paddle.moveRight();
        } else if (diffX < -10) {
            paddle.moveLeft();
        }

        touchStartX = touchX;
    });

    gameCanvas.addEventListener('touchend', (e) => {
        if (currentGame !== 'breakout' || gameState !== 'playing') return;

        e.preventDefault(); // Предотвращаем стандартное поведение
        paddle.stopMovingLeft();
        paddle.stopMovingRight();
        touchStartX = null;
    });
}

export function resetBreakout() {
    paddle.reset();
    ball.reset();
    ball.speed = 4;
    bricks.reset();
    score = 0;
    scoreElement.textContent = score;

    // Отрисовываем фон сразу после сброса, чтобы избежать голубого экрана
    background.draw();
}

export function updateBreakout() {
    if (gameState === 'playing') {
        paddle.update();
        ball.update();
        bricks.update();
    }
}

export function drawBreakout() {
    // Отрисовка фона
    background.draw();

    // Отрисовка кирпичей
    bricks.draw();

    // Отрисовка платформы
    paddle.draw();

    // Отрисовка мяча
    ball.draw();
}

// Обработчики управления для Breakout
document.addEventListener('keydown', (e) => {
    if (currentGame !== 'breakout' || gameState !== 'playing') return;

    if (e.code === 'ArrowLeft') {
        paddle.moveLeft();
    } else if (e.code === 'ArrowRight') {
        paddle.moveRight();
    }
});

document.addEventListener('keyup', (e) => {
    if (currentGame !== 'breakout' || gameState !== 'playing') return;

    if (e.code === 'ArrowLeft') {
        paddle.stopMovingLeft();
    } else if (e.code === 'ArrowRight') {
        paddle.stopMovingRight();
    }
});

// Обработчики событий добавлены в setupEventListeners()
