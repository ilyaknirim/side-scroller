import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

// Объекты игры
export let paddle = {
  x: GAME_WIDTH/2 - 40,
  y: GAME_HEIGHT - 30,
  width: 80,
  height: 10,
  dx: 0
};

export let ball = {
  x: GAME_WIDTH/2,
  y: GAME_HEIGHT - 50,
  radius: 6,
  speed: 4,
  dx: 4,
  dy: -4,
  get velocityX() { return this.dx; },
  set velocityX(value) { this.dx = value; },
  get velocityY() { return this.dy; },
  set velocityY(value) { this.dy = value; },
  update: function() {
    this.x += this.dx;
    this.y += this.dy;
  }
};

export let bricks = {
  rows: 5,
  cols: 8,
  width: 30,
  height: 10,
  padding: 5,
  offsetTop: 30,
  offsetLeft: 15,
  positions: [],
  init: function() {
    this.positions = [];
    for (let r = 0; r < this.rows; r++) {
      this.positions[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.positions[r][c] = { 
          x: c * (this.width + this.padding) + this.offsetLeft,
          y: r * (this.height + this.padding) + this.offsetTop,
          status: 1
        };
      }
    }
  },
  update: function() {
    // Метод для обновления состояния кирпичей
    // Реализация зависит от потребностей игры
  }
};

// Фон игры
export let background = {
  draw: function() {
    ctx.fillStyle = '#071229';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }
};

// Инициализация игры
export function initBreakout(canvas) {
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;

  // Инициализация кирпичей
  bricks.init();
}

// Сброс игры
export function resetBreakout() {
  paddle.x = GAME_WIDTH/2 - 40;
  ball.x = GAME_WIDTH/2;
  ball.y = GAME_HEIGHT - 50;
  ball.speed = 4;
  ball.dx = 4;
  ball.dy = -4;
  score = 0;
  if (scoreElement) scoreElement.textContent = score;

  // Сброс кирпичей
  bricks.init();
}

// Обновление состояния игры
export function updateBreakout() {
  // Движение платформы
  paddle.x += paddle.dx;

  // Ограничение движения платформы
  if (paddle.x < 0) {
    paddle.x = 0;
  } else if (paddle.x + paddle.width > GAME_WIDTH) {
    paddle.x = GAME_WIDTH - paddle.width;
  }

  // Движение мяча
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Столкновение мяча со стенами
  if (ball.x + ball.radius > GAME_WIDTH || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }

  // Столкновение мяча с потолком
  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  // Столкновение мяча с платформой
  if (
    ball.y + ball.radius > paddle.y && 
    ball.y - ball.radius < paddle.y + paddle.height &&
    ball.x > paddle.x && 
    ball.x < paddle.x + paddle.width
  ) {
    // Изменение направления в зависимости от точки столкновения
    let collidePoint = ball.x - (paddle.x + paddle.width / 2);
    collidePoint = collidePoint / (paddle.width / 2);
    let angle = collidePoint * Math.PI / 3;

    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);
  }

  // Обновление кирпичей
  for (let r = 0; r < bricks.rows; r++) {
    for (let c = 0; c < bricks.cols; c++) {
      let brick = bricks.positions[r][c];
      if (brick.status === 1) {
        if (
          ball.x + ball.radius > brick.x && 
          ball.x - ball.radius < brick.x + bricks.width &&
          ball.y + ball.radius > brick.y && 
          ball.y - ball.radius < brick.y + bricks.height
        ) {
          ball.dy = -ball.dy;
          brick.status = 0;
          score += 10;
          if (scoreElement) scoreElement.textContent = score;
        }
      }
    }
  }

  // Проверка проигрыша
  if (ball.y + ball.radius > GAME_HEIGHT) {
    if (gameOverCallback) gameOverCallback();
  }
}

// Отрисовка игры
export function drawBreakout() {
  // Отрисовка фона
  background.draw();

  // Отрисовка платформы
  ctx.fillStyle = '#aaa';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // Отрисовка мяча
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#fc3';
  ctx.fill();
  ctx.closePath();

  // Отрисовка кирпичей
  for (let r = 0; r < bricks.rows; r++) {
    for (let c = 0; c < bricks.cols; c++) {
      if (bricks.positions[r][c].status === 1) {
        let brickX = bricks.positions[r][c].x;
        let brickY = bricks.positions[r][c].y;
        ctx.fillStyle = '#6cf';
        ctx.fillRect(brickX, brickY, bricks.width, bricks.height);
      }
    }
  }
}

// Функция для установки колбэка окончания игры
export let gameOverCallback;
export function setGameOverBreakout(callback) {
  gameOverCallback = callback;
}

// Функция для получения текущего счета
export function getCurrentScore() {
  return score;
}

// Функция для установки текущей игры
export function setCurrentGameBreakout(game) {
  // Эта функция может использоваться для отслеживания текущей игры
  // Реализация зависит от потребностей приложения
}
