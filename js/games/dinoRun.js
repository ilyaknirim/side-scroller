// Импорт констант и переменных
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { ctx, score, gameState, scoreElement } from '../main.js';

// Функция gameOver будет определена в main.js, но нам нужно объявить ее здесь
let gameOver;
export function setGameOver(fn) { gameOver = fn; }

// Динозавр
export const dino = {
    x: 50,
    y: GAME_HEIGHT - 100,
    width: 40,
    height: 50,
    jumping: false,
    jumpVelocity: 0,
    gravity: 0.6,
    jumpPower: -12,

    draw: function() {
        ctx.fillStyle = '#538d4e';

        // Тело динозавра
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Голова
        ctx.fillRect(this.x + this.width - 15, this.y - 15, 20, 20);

        // Глаза
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + this.width - 10, this.y - 10, 5, 5);
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + this.width - 8, this.y - 8, 2, 2);

        // Ноги
        ctx.fillStyle = '#538d4e';
        const legOffset = Math.floor(Date.now() / 100) % 2 === 0 ? 0 : 5;
        ctx.fillRect(this.x + 5, this.y + this.height, 8, 15 + legOffset);
        ctx.fillRect(this.x + 25, this.y + this.height, 8, 15 - legOffset);

        // Хвост
        ctx.fillRect(this.x - 10, this.y + 10, 15, 8);
    },

    update: function() {
        if (this.jumping) {
            this.jumpVelocity += this.gravity;
            this.y += this.jumpVelocity;

            if (this.y >= GAME_HEIGHT - 100) {
                this.y = GAME_HEIGHT - 100;
                this.jumping = false;
                this.jumpVelocity = 0;
            }
        }
    },

    jump: function() {
        if (!this.jumping) {
            this.jumping = true;
            this.jumpVelocity = this.jumpPower;
        }
    },

    reset: function() {
        this.y = GAME_HEIGHT - 100;
        this.jumping = false;
        this.jumpVelocity = 0;
    }
};

// Препятствия
export const obstacles = {
    positions: [],
    width: 20,
    minWidth: 20,
    maxWidth: 40,
    minHeight: 30,
    maxHeight: 60,
    speed: 5,
    maxPositions: 3,
    lastObstacleX: GAME_WIDTH,

    generate: function() {
        // Генерируем препятствие на случайном расстоянии от предыдущего
        const minDistance = 200;
        const maxDistance = 400;
        const distance = minDistance + Math.random() * (maxDistance - minDistance);

        const x = this.lastObstacleX + distance;
        const width = this.minWidth + Math.random() * (this.maxWidth - this.minWidth);
        const height = this.minHeight + Math.random() * (this.maxHeight - this.minHeight);

        this.positions.push({
            x: x,
            width: width,
            height: height,
            y: GAME_HEIGHT - height - 40, // 40 - высота земли
            passed: false
        });

        this.lastObstacleX = x;
    },

    update: function() {
        // Добавляем новые препятствия
        if (this.positions.length === 0 || 
            this.positions[this.positions.length - 1].x < GAME_WIDTH - 200) {
            this.generate();
        }

        // Обновляем позиции препятствий
        for (let i = 0; i < this.positions.length; i++) {
            this.positions[i].x -= this.speed;

            // Проверяем, пролетел ли динозавр препятствие
            if (!this.positions[i].passed && this.positions[i].x + this.positions[i].width < dino.x) {
                this.positions[i].passed = true;
                score++;
                scoreElement.textContent = score;
            }

            // Удаляем препятствия, которые вышли за экран
            if (this.positions[i].x + this.positions[i].width < 0) {
                this.positions.splice(i, 1);
                i--;
            }
        }
    },

    draw: function() {
        ctx.fillStyle = '#8b4513';

        for (let i = 0; i < this.positions.length; i++) {
            const obstacle = this.positions[i];

            // Рисуем кактус
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

            // Добавляем ветки кактуса
            if (obstacle.width > 25) {
                ctx.fillRect(obstacle.x - 10, obstacle.y + 10, 10, 15);
                ctx.fillRect(obstacle.x + obstacle.width, obstacle.y + 15, 10, 15);
            }
        }
    },

    checkCollision: function() {
        for (let i = 0; i < this.positions.length; i++) {
            const obstacle = this.positions[i];

            if (dino.x < obstacle.x + obstacle.width &&
                dino.x + dino.width > obstacle.x &&
                dino.y < obstacle.y + obstacle.height &&
                dino.y + dino.height > obstacle.y) {
                return true;
            }
        }

        return false;
    },

    reset: function() {
        this.positions = [];
        this.lastObstacleX = GAME_WIDTH;
    }
};

// Земля
export const ground = {
    height: 40,
    offset: 0,

    draw: function() {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(0, GAME_HEIGHT - this.height, GAME_WIDTH, this.height);

        // Трава
        ctx.fillStyle = '#228b22';
        ctx.fillRect(0, GAME_HEIGHT - this.height, GAME_WIDTH, 10);

        // Линии на земле для создания эффекта движения
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;

        for (let i = this.offset; i < GAME_WIDTH + 20; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, GAME_HEIGHT - 30);
            ctx.lineTo(i + 20, GAME_HEIGHT - 30);
            ctx.stroke();
        }

        // Обновляем смещение для эффекта движения
        this.offset = (this.offset - obstacles.speed) % 40;
    }
};

// Фон
export const background = {
    clouds: [],
    maxClouds: 3,

    init: function() {
        // Инициализируем облака
        for (let i = 0; i < this.maxClouds; i++) {
            this.clouds.push({
                x: Math.random() * GAME_WIDTH,
                y: Math.random() * (GAME_HEIGHT / 2),
                size: 15 + Math.random() * 20,
                speed: 0.5 + Math.random() * 1
            });
        }
    },

    update: function() {
        // Обновляем позиции облаков
        for (let i = 0; i < this.clouds.length; i++) {
            this.clouds[i].x -= this.clouds[i].speed;

            // Если облако вышло за экран, перемещаем его вправо
            if (this.clouds[i].x + this.clouds[i].size < 0) {
                this.clouds[i].x = GAME_WIDTH + this.clouds[i].size;
                this.clouds[i].y = Math.random() * (GAME_HEIGHT / 2);
            }
        }
    },

    draw: function() {
        // Небо
        ctx.fillStyle = '#f7f7f7';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Облака
        ctx.fillStyle = 'white';

        for (let i = 0; i < this.clouds.length; i++) {
            const cloud = this.clouds[i];
            this.drawCloud(cloud.x, cloud.y, cloud.size);
        }
    },

    drawCloud: function(x, y, size) {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.arc(x + size, y, size * 0.8, 0, Math.PI * 2);
        ctx.arc(x - size, y, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
};

// Функции инициализации и обновления игры
export function initDinoRun() {
    background.init();
}

export function resetDinoRun() {
    dino.reset();
    obstacles.reset();
    score = 0;
    scoreElement.textContent = score;
}

export function updateDinoRun() {
    if (gameState === 'playing') {
        dino.update();
        obstacles.update();
        background.update();

        // Проверка столкновений
        if (obstacles.checkCollision()) {
            gameOver();
        }
    }
}

export function drawDinoRun() {
    // Отрисовка фона
    background.draw();

    // Отрисовка земли
    ground.draw();

    // Отрисовка препятствий
    obstacles.draw();

    // Отрисовка динозавра
    dino.draw();
}
