// Птица
export const bird = {
    x: 50,
    y: 150,
    width: 34,
    height: 24,
    gravity: 0.5,
    lift: -8,
    velocity: 0,
    draw: function() {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.width/2, this.height/2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Глаз
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y - 5, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();

        // Клюв
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.moveTo(this.x + 15, this.y);
        ctx.lineTo(this.x + 25, this.y + 2);
        ctx.lineTo(this.x + 15, this.y + 5);
        ctx.closePath();
        ctx.fill();

        // Крыло
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.ellipse(this.x - 5, this.y + 5, 12, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();
    },
    update: function() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Ограничение движения птицы
        if (this.y + this.height/2 > GAME_HEIGHT - 40) {
            this.y = GAME_HEIGHT - 40 - this.height/2;
            this.velocity = 0;
            gameOver();
        }

        if (this.y - this.height/2 < 0) {
            this.y = this.height/2;
            this.velocity = 0;
        }
    },
    flap: function() {
        this.velocity = this.lift;
    },
    reset: function() {
        this.y = 150;
        this.velocity = 0;
    }
};

// Трубы
export const pipes = {
    positions: [],
    width: 52,
    gap: 120,
    speed: 2,
    maxPositions: 3,

    generate: function() {
        const minHeight = 50;
        const maxHeight = GAME_HEIGHT - this.gap - minHeight - 40; // 40 - высота земли
        const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

        this.positions.push({
            x: GAME_WIDTH,
            topHeight: height,
            passed: false
        });
    },

    update: function() {
        // Добавляем новые трубы
        if (this.positions.length === 0 || 
            this.positions[this.positions.length - 1].x < GAME_WIDTH - 200) {
            this.generate();
        }

        // Обновляем позиции труб
        for (let i = 0; i < this.positions.length; i++) {
            this.positions[i].x -= this.speed;

            // Проверяем, пролетела ли птица трубу
            if (!this.positions[i].passed && this.positions[i].x + this.width < bird.x) {
                this.positions[i].passed = true;
                score++;
                scoreElement.textContent = score;
            }

            // Удаляем трубы, которые вышли за экран
            if (this.positions[i].x + this.width < 0) {
                this.positions.splice(i, 1);
                i--;
            }
        }
    },

    draw: function() {
        ctx.fillStyle = '#2ECC40';

        for (let i = 0; i < this.positions.length; i++) {
            const pipe = this.positions[i];

            // Верхняя труба
            ctx.fillRect(pipe.x, 0, this.width, pipe.topHeight);
            ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, this.width + 10, 30);

            // Нижняя труба
            const bottomY = pipe.topHeight + this.gap;
            const bottomHeight = GAME_HEIGHT - bottomY - 40; // 40 - высота земли

            ctx.fillRect(pipe.x, bottomY, this.width, bottomHeight);
            ctx.fillRect(pipe.x - 5, bottomY, this.width + 10, 30);
        }
    },

    checkCollision: function() {
        for (let i = 0; i < this.positions.length; i++) {
            const pipe = this.positions[i];

            // Проверка столкновения с верхней трубой
            if (bird.x + bird.width/2 > pipe.x && 
                bird.x - bird.width/2 < pipe.x + this.width) {
                if (bird.y - bird.height/2 < pipe.topHeight) {
                    return true;
                }

                // Проверка столкновения с нижней трубой
                const bottomY = pipe.topHeight + this.gap;
                if (bird.y + bird.height/2 > bottomY) {
                    return true;
                }
            }
        }

        return false;
    },

    reset: function() {
        this.positions = [];
    }
};

// Земля
export const ground = {
    height: 40,
    draw: function() {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, GAME_HEIGHT - this.height, GAME_WIDTH, this.height);

        // Трава
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, GAME_HEIGHT - this.height, GAME_WIDTH, 10);
    }
};

// Фон
export const background = {
    draw: function() {
        // Небо
        ctx.fillStyle = '#70c5ce';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Облака
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        // Облако 1
        this.drawCloud(50, 100, 30);

        // Облако 2
        this.drawCloud(150, 60, 25);

        // Облако 3
        this.drawCloud(250, 120, 35);
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
export function initFlappyBird() {
    // Инициализация при необходимости
}

export function resetFlappyBird() {
    bird.reset();
    pipes.reset();
    score = 0;
    scoreElement.textContent = score;
}

export function updateFlappyBird() {
    if (gameState === 'playing') {
        bird.update();
        pipes.update();

        // Проверка столкновений
        if (pipes.checkCollision()) {
            gameOver();
        }
    }
}

export function drawFlappyBird() {
    // Отрисовка фона
    background.draw();

    // Отрисовка земли
    ground.draw();

    // Отрисовка труб
    pipes.draw();

    // Отрисовка птицы
    bird.draw();
}
