// Импорт констант и переменных
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { ctx, score, gameState, scoreElement } from '../main.js';

// Глобальная переменная для canvas
let gameCanvas;

// Функция gameOver будет определена в main.js, но нам нужно объявить ее здесь
let gameOver;
export function setGameOver(fn) { gameOver = fn; }

// Персонаж Doodle
export const doodle = {
    x: GAME_WIDTH / 2 - 15,
    y: GAME_HEIGHT - 150,
    width: 30,
    height: 30,
    velocityX: 0,
    velocityY: 0,
    gravity: 0.5,
    jumpPower: -12,
    moveSpeed: 5,
    onPlatform: false,

    draw: function() {
        // Тело
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();

        // Глаза
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - 5, this.y + this.height/2 - 5, 4, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/2 + 5, this.y + this.height/2 - 5, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - 5, this.y + this.height/2 - 5, 2, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/2 + 5, this.y + this.height/2 - 5, 2, 0, Math.PI * 2);
        ctx.fill();

        // Нос
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y + this.height/2);
        ctx.lineTo(this.x + this.width/2 + 3, this.y + this.height/2 + 5);
        ctx.lineTo(this.x + this.width/2 - 3, this.y + this.height/2 + 5);
        ctx.closePath();
        ctx.fill();
    },

    update: function() {
        // Применяем гравитацию
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // Движение по горизонтали
        this.x += this.velocityX;

        // Проверка на платформы
        this.onPlatform = false;

        // Телепортация по краям экрана
        if (this.x < 0) {
            this.x = GAME_WIDTH - this.width;
        } else if (this.x + this.width > GAME_WIDTH) {
            this.x = 0;
        }

        // Если падает слишком низко, игра окончена
        if (this.y > GAME_HEIGHT) {
            gameOver();
        }
    },

    jump: function() {
        this.velocityY = this.jumpPower;
    },

    moveLeft: function() {
        this.velocityX = -this.moveSpeed;
    },

    moveRight: function() {
        this.velocityX = this.moveSpeed;
    },

    stopMoving: function() {
        this.velocityX = 0;
    },

    reset: function() {
        this.x = GAME_WIDTH / 2 - 15;
        this.y = GAME_HEIGHT - 150;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onPlatform = false;
    }
};

// Платформы
export const platforms = {
    positions: [],
    width: 70,
    height: 10,
    speed: 2,
    maxPositions: 8,
    lastPlatformY: GAME_HEIGHT - 100,

    generate: function() {
        const minDistance = 50;
        const maxDistance = 100;
        const distance = minDistance + Math.random() * (maxDistance - minDistance);

        const y = this.lastPlatformY - distance;
        const x = Math.random() * (GAME_WIDTH - this.width);

        // Определяем тип платформы
        const type = Math.random() < 0.1 ? 'moving' : 'normal';

        this.positions.push({
            x: x,
            y: y,
            width: this.width,
            height: this.height,
            type: type,
            direction: Math.random() < 0.5 ? 1 : -1,
            moveSpeed: 1 + Math.random(),
            initialX: x
        });

        this.lastPlatformY = y;
    },

    update: function() {
        // Добавляем новые платформы
        while (this.positions.length < this.maxPositions || 
               this.positions[this.positions.length - 1].y > 50) {
            this.generate();
        }

        // Обновляем позиции платформ
        for (let i = 0; i < this.positions.length; i++) {
            const platform = this.positions[i];

            // Движущиеся платформы
            if (platform.type === 'moving') {
                platform.x += platform.moveSpeed * platform.direction;

                if (platform.x <= 0 || platform.x + platform.width >= GAME_WIDTH) {
                    platform.direction *= -1;
                }
            }

            // Удаляем платформы, которые вышли за экран
            if (platform.y > GAME_HEIGHT) {
                this.positions.splice(i, 1);
                i--;
            }
        }

        // Проверяем, стоит ли персонаж на платформе
        for (let i = 0; i < this.positions.length; i++) {
            const platform = this.positions[i];

            // Проверка столкновения с платформой
            if (doodle.x < platform.x + platform.width &&
                doodle.x + doodle.width > platform.x &&
                doodle.y + doodle.height > platform.y &&
                doodle.y + doodle.height < platform.y + platform.height + doodle.velocityY &&
                doodle.velocityY > 0) {

                // Прыгаем с платформы
                doodle.jump();
                doodle.onPlatform = true;

                // Двигаем платформу вместе с персонажем, если он высоко
                if (doodle.y < GAME_HEIGHT / 2) {
                    const moveDistance = GAME_HEIGHT / 2 - doodle.y;
                    doodle.y = GAME_HEIGHT / 2;

                    // Двигаем все платформы вниз
                    for (let j = 0; j < this.positions.length; j++) {
                        this.positions[j].y += moveDistance;

                        // Увеличиваем счет при успешном прыжке
                        if (j === i) {
                            score++;
                            scoreElement.textContent = score;
                        }
                    }
                }

                break;
            }
        }
    },

    draw: function() {
        for (let i = 0; i < this.positions.length; i++) {
            const platform = this.positions[i];

            // Цвет зависит от типа платформы
            if (platform.type === 'moving') {
                ctx.fillStyle = '#e74c3c';
            } else {
                ctx.fillStyle = '#2ecc71';
            }

            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

            // Добавляем тень
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(platform.x, platform.y + platform.height - 2, platform.width, 2);
        }
    },

    reset: function() {
        this.positions = [];
        this.lastPlatformY = GAME_HEIGHT - 100;

        // Создаем начальные платформы
        for (let i = 0; i < 5; i++) {
            const y = GAME_HEIGHT - 100 - i * 80;
            const x = i === 0 ? GAME_WIDTH / 2 - this.width / 2 : Math.random() * (GAME_WIDTH - this.width);

            this.positions.push({
                x: x,
                y: y,
                width: this.width,
                height: this.height,
                type: i === 0 ? 'normal' : Math.random() < 0.1 ? 'moving' : 'normal',
                direction: Math.random() < 0.5 ? 1 : -1,
                moveSpeed: 1 + Math.random(),
                initialX: x
            });

            this.lastPlatformY = y;
        }
    }
};

// Фон
export const background = {
    draw: function() {
        // Градиентный фон
        const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        gradient.addColorStop(0, '#2c3e50');
        gradient.addColorStop(1, '#3498db');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Звезды
        ctx.fillStyle = 'white';
        for (let i = 0; i < 50; i++) {
            const x = (i * 73) % GAME_WIDTH;
            const y = (i * 37) % (GAME_HEIGHT / 2);
            const size = (i % 3) + 1;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

// Функции инициализации и обновления игры
export function initDoodleJump(canvasElement) {
    // Сохраняем canvas для использования в обработчиках событий
    gameCanvas = canvasElement;

    // Настраиваем обработчики событий
    setupEventListeners();
}

// Функция для настройки обработчиков событий
function setupEventListeners() {
    // Обработчики касаний для управления Doodle
    gameCanvas.addEventListener('touchmove', (e) => {
        if (currentGame !== 'doodle' || gameState !== 'playing') return;

        const rect = gameCanvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const canvasWidth = rect.width;

        // Определяем направление движения в зависимости от позиции касания
        if (touchX < canvasWidth / 2) {
            doodle.moveLeft();
        } else {
            doodle.moveRight();
        }
    });

    gameCanvas.addEventListener('touchend', () => {
        if (currentGame !== 'doodle' || gameState !== 'playing') return;

        doodle.stopMoving();
    });

    // Для управления с клавиатуры
    document.addEventListener('keydown', (e) => {
        if (currentGame !== 'doodle' || gameState !== 'playing') return;

        if (e.code === 'ArrowLeft') {
            doodle.moveLeft();
        } else if (e.code === 'ArrowRight') {
            doodle.moveRight();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (currentGame !== 'doodle' || gameState !== 'playing') return;

        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            doodle.stopMoving();
        }
    });
}

export function resetDoodleJump() {
    doodle.reset();
    platforms.reset();
    score = 0;
    scoreElement.textContent = score;
}

export function updateDoodleJump() {
    if (gameState === 'playing') {
        doodle.update();
        platforms.update();
    }
}

export function drawDoodleJump() {
    // Отрисовка фона
    background.draw();

    // Отрисовка платформ
    platforms.draw();

    // Отрисовка персонажа
    doodle.draw();
}

// Обработчики событий добавлены в setupEventListeners()
