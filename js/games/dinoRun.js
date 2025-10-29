// Импорт констант и переменных
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { ctx, gameState, scoreElement } from '../main.js';

// Переменная для хранения счета
let currentScore = 0;

// Функция для обновления счета
function updateScore(points = 1) {
    currentScore += points;
    scoreElement.textContent = currentScore;
    return currentScore;
}

// Функция для сброса счета
function resetScore() {
    currentScore = 0;
    scoreElement.textContent = currentScore;
    return currentScore;
}

// Функция для получения текущего счета
export function getCurrentScore() {
    return currentScore;
}

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
        // Тело динозавра с градиентом
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#6ba342');
        gradient.addColorStop(1, '#538d4e');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Голова с закругленными углами
        ctx.fillStyle = '#538d4e';
        ctx.beginPath();
        ctx.arc(this.x + this.width - 5, this.y - 5, 15, Math.PI, Math.PI * 1.5);
        ctx.arc(this.x + this.width - 5, this.y + 15, 15, Math.PI * 1.5, 0);
        ctx.lineTo(this.x + this.width - 5, this.y);
        ctx.closePath();
        ctx.fill();

        // Глаза
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + this.width - 8, this.y - 2, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + this.width - 6, this.y - 1, 2, 0, Math.PI * 2);
        ctx.fill();

        // Ноги с анимацией
        ctx.fillStyle = '#538d4e';
        const legOffset = Math.floor(Date.now() / 100) % 2 === 0 ? 0 : 5;
        
        // Задняя нога
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y + this.height + 5, 5, 0, Math.PI, true);
        ctx.lineTo(this.x + 5, this.y + this.height);
        ctx.lineTo(this.x + 15, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Передняя нога
        ctx.beginPath();
        ctx.arc(this.x + 30, this.y + this.height + 5 - legOffset, 5, 0, Math.PI, true);
        ctx.lineTo(this.x + 25, this.y + this.height);
        ctx.lineTo(this.x + 35, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        // Хвост с изгибом
        ctx.fillStyle = '#538d4e';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 20);
        ctx.quadraticCurveTo(this.x - 15, this.y + 15, this.x - 10, this.y + 5);
        ctx.quadraticCurveTo(this.x - 5, this.y, this.x + 5, this.y + 10);
        ctx.closePath();
        ctx.fill();
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
                updateScore();
            }

            // Удаляем препятствия, которые вышли за экран
            if (this.positions[i].x + this.positions[i].width < 0) {
                this.positions.splice(i, 1);
                i--;
            }
        }
    },

    draw: function() {
        for (let i = 0; i < this.positions.length; i++) {
            const obstacle = this.positions[i];

            // Рисуем кактус с градиентом
            const gradient = ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height);
            gradient.addColorStop(0, '#a0522d');
            gradient.addColorStop(1, '#8b4513');
            ctx.fillStyle = gradient;
            
            // Основной ствол кактуса
            ctx.beginPath();
            ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height, obstacle.width / 2, 0, Math.PI, true);
            ctx.lineTo(obstacle.x, obstacle.y);
            ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
            ctx.closePath();
            ctx.fill();

            // Добавляем ветки кактуса
            if (obstacle.width > 25) {
                // Левая ветка
                ctx.fillStyle = '#8b4513';
                ctx.beginPath();
                ctx.arc(obstacle.x - 5, obstacle.y + 10, 5, 0, Math.PI * 2);
                ctx.fill();
                
                // Колючки на левой ветке
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 1;
                for (let j = 0; j < 5; j++) {
                    const angle = (Math.PI * 2 / 5) * j;
                    const x = obstacle.x - 5 + Math.cos(angle) * 8;
                    const y = obstacle.y + 10 + Math.sin(angle) * 8;
                    
                    ctx.beginPath();
                    ctx.moveTo(obstacle.x - 5, obstacle.y + 10);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
                
                // Правая ветка
                ctx.fillStyle = '#8b4513';
                ctx.beginPath();
                ctx.arc(obstacle.x + obstacle.width + 5, obstacle.y + 15, 5, 0, Math.PI * 2);
                ctx.fill();
                
                // Колючки на правой ветке
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 1;
                for (let j = 0; j < 5; j++) {
                    const angle = (Math.PI * 2 / 5) * j;
                    const x = obstacle.x + obstacle.width + 5 + Math.cos(angle) * 8;
                    const y = obstacle.y + 15 + Math.sin(angle) * 8;
                    
                    ctx.beginPath();
                    ctx.moveTo(obstacle.x + obstacle.width + 5, obstacle.y + 15);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
            }
            
            // Добавляем колючки на основном стволе
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            for (let j = 0; j < obstacle.height; j += 10) {
                // Левая колючка
                ctx.beginPath();
                ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y + j);
                ctx.lineTo(obstacle.x + obstacle.width / 2 - 5, obstacle.y + j - 3);
                ctx.stroke();
                
                // Правая колючка
                ctx.beginPath();
                ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y + j);
                ctx.lineTo(obstacle.x + obstacle.width / 2 + 5, obstacle.y + j - 3);
                ctx.stroke();
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
        // Основная земля с градиентом
        const groundGradient = ctx.createLinearGradient(0, GAME_HEIGHT - this.height, 0, GAME_HEIGHT);
        groundGradient.addColorStop(0, '#d2b48c');
        groundGradient.addColorStop(1, '#8b4513');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, GAME_HEIGHT - this.height, GAME_WIDTH, this.height);

        // Трава с градиентом
        const grassGradient = ctx.createLinearGradient(0, GAME_HEIGHT - this.height, 0, GAME_HEIGHT - this.height + 10);
        grassGradient.addColorStop(0, '#32cd32');
        grassGradient.addColorStop(1, '#228b22');
        ctx.fillStyle = grassGradient;
        ctx.fillRect(0, GAME_HEIGHT - this.height, GAME_WIDTH, 10);
        
        // Добавляем травинки
        ctx.strokeStyle = '#1f5f1f';
        ctx.lineWidth = 1;
        for (let i = 0; i < GAME_WIDTH; i += 15) {
            const grassHeight = 3 + Math.random() * 5;
            const offset = (i + this.offset * 2) % GAME_WIDTH;
            
            ctx.beginPath();
            ctx.moveTo(offset, GAME_HEIGHT - this.height);
            ctx.lineTo(offset, GAME_HEIGHT - this.height - grassHeight);
            ctx.stroke();
        }

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
        // Небо с градиентом
        const skyGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        skyGradient.addColorStop(0, '#87CEEB');  // Светло-голубой
        skyGradient.addColorStop(0.7, '#98D8E8');  // Более светлый голубой
        skyGradient.addColorStop(1, '#F0E68C');  // Светло-желтый у горизонта
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Облака
        ctx.fillStyle = 'white';

        for (let i = 0; i < this.clouds.length; i++) {
            const cloud = this.clouds[i];
            this.drawCloud(cloud.x, cloud.y, cloud.size);
        }
    },

    drawCloud: function(x, y, size) {
        // Рисуем облако с градиентом
        const cloudGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        cloudGradient.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
        ctx.fillStyle = cloudGradient;
        
        // Основная часть облака
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Левая часть облака
        ctx.beginPath();
        ctx.arc(x - size * 0.7, y + size * 0.2, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Правая часть облака
        ctx.beginPath();
        ctx.arc(x + size * 0.7, y + size * 0.2, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Маленькие детали облака
        ctx.beginPath();
        ctx.arc(x - size * 0.4, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x + size * 0.4, y - size * 0.2, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
};

// Функции инициализации и обновления игры
export function initDinoRun() {
    background.init();
    
    // Добавляем обработчики касаний для мобильных устройств
    const canvas = document.getElementById('game-canvas');
    
    canvas.addEventListener('touchstart', (e) => {
        if (gameState !== 'playing') return;
        e.preventDefault();
        dino.jump();
    });
}

export function resetDinoRun() {
    dino.reset();
    obstacles.reset();
    resetScore();
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
