// Импорт констант
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';

// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;
tg.expand();

// Элементы DOM
const menuContainer = document.getElementById('menu-container');
const gameContainer = document.getElementById('game-container');
const backButton = document.getElementById('back-button');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const gameOverlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMessage = document.getElementById('overlay-message');
const startButton = document.getElementById('start-button');

// Установка размеров canvas
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Игровые переменные
let currentGame = null;
export let gameState = 'start'; // start, playing, gameover
export let score = 0;
let bestScore = {};
let animationId = null;

// Экспортируем контекст и элементы для использования в других модулях
export { ctx, scoreElement, canvas };

// Загрузка лучших результатов из localStorage
function loadBestScores() {
    const savedScores = localStorage.getItem('gamesBestScores');
    if (savedScores) {
        bestScore = JSON.parse(savedScores);
    } else {
        // Инициализация результатов для всех игр
        bestScore = {
            flappy: 0,
            dino: 0,
            doodle: 0,
            snake: 0,
            breakout: 0,
            '2048': 0
        };
    }
    bestScoreElement.textContent = bestScore[currentGame] || 0;
}

// Сохранение лучших результатов в localStorage
function saveBestScores() {
    localStorage.setItem('gamesBestScores', JSON.stringify(bestScore));
}

// Функция окончания игры
function gameOver() {
    gameState = 'gameover';

    // Получаем текущий счет в зависимости от игры
    let currentScoreValue = score;
    if (currentGame === 'breakout') {
        currentScoreValue = getCurrentScore();
    } else if (currentGame === 'dino') {
        currentScoreValue = getCurrentScoreDino();
    }

    // Обновляем лучший результат
    if (currentScoreValue > bestScore[currentGame]) {
        bestScore[currentGame] = currentScoreValue;
        saveBestScores();
        bestScoreElement.textContent = bestScore[currentGame];
    }

    overlayTitle.textContent = 'Игра окончена!';
    overlayMessage.textContent = `Ваш счёт: ${currentScoreValue}`;
    startButton.textContent = 'Играть снова';
    gameOverlay.style.display = 'flex';
}

// Обработчики событий для меню
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', function() {
        const gameType = this.getAttribute('data-game');
        startGame(gameType);
    });
});

// Обработчик кнопки "назад"
backButton.addEventListener('click', () => {
    gameContainer.style.display = 'none';
    menuContainer.style.display = 'flex';
    currentGame = null;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
});

// Функция запуска игры
function startGame(gameType) {
    currentGame = gameType;
    score = 0;
    scoreElement.textContent = score;

    loadBestScores();

    // Показываем игровой контейнер и скрываем меню
    menuContainer.style.display = 'none';
    gameContainer.style.display = 'block';

    // Устанавливаем заголовок в зависимости от игры
    switch(gameType) {
        case 'flappy':
            overlayTitle.textContent = 'Flappy Bird';
            overlayMessage.textContent = 'Нажмите, чтобы начать';
            setGameOverFlappy(gameOver);
            initFlappyBird();
            break;
        case 'dino':
            overlayTitle.textContent = 'Dino Run';
            overlayMessage.textContent = 'Нажмите, чтобы начать';
            setGameOverDino(gameOver);
            initDinoRun();
            break;
        case 'doodle':
            overlayTitle.textContent = 'Doodle Jump';
            overlayMessage.textContent = 'Нажмите, чтобы начать';
            setGameOverDoodle(gameOver);
            setCurrentGameDoodle('doodle');
            initDoodleJump(canvas);
            break;
        case 'snake':
            overlayTitle.textContent = 'Snake';
            overlayMessage.textContent = 'Нажмите, чтобы начать';
            setGameOverSnake(gameOver);
            initSnake();
            break;
        case 'breakout':
            overlayTitle.textContent = 'Breakout';
            overlayMessage.textContent = 'Нажмите, чтобы начать';
            setGameOverBreakout(gameOver);
            setCurrentGameBreakout('breakout');
            initBreakout(canvas);
            break;
        case '2048':
            overlayTitle.textContent = '2048';
            overlayMessage.textContent = 'Сдвиньте плитки, чтобы начать';
            setGameOver2048(gameOver);
            setCurrentGame2048('2048');
            init2048(canvas);
            break;
    }

    // Показываем оверлей начала игры
    gameOverlay.style.display = 'flex';
    startButton.textContent = 'Начать игру';

    // Запускаем игровой цикл
    gameLoop();
}

// Обработчик кнопки начала игры
startButton.addEventListener('click', () => {
    gameState = 'playing';
    gameOverlay.style.display = 'none';

    // Сброс игры в зависимости от типа
    switch(currentGame) {
        case 'flappy':
            resetFlappyBird();
            break;
        case 'dino':
            resetDinoRun();
            break;
        case 'doodle':
            resetDoodleJump();
            break;
        case 'snake':
            resetSnake();
            break;
        case 'breakout':
            resetBreakout();
            break;
        case '2048':
            reset2048();
            break;
    }
});

// Обработчик нажатий
document.addEventListener('keydown', (e) => {
    if (gameState !== 'playing') return;

    switch(currentGame) {
        case 'flappy':
            if (e.code === 'Space') {
                bird.flap();
            }
            break;
        case 'dino':
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                dino.jump();
            }
            break;
        case 'snake':
            if (e.code === 'ArrowUp' && snake.direction !== 'down') {
                snake.nextDirection = 'up';
            } else if (e.code === 'ArrowDown' && snake.direction !== 'up') {
                snake.nextDirection = 'down';
            } else if (e.code === 'ArrowLeft' && snake.direction !== 'right') {
                snake.nextDirection = 'left';
            } else if (e.code === 'ArrowRight' && snake.direction !== 'left') {
                snake.nextDirection = 'right';
            }
            break;
        case '2048':
            if (e.code === 'ArrowUp') {
                move2048('up');
            } else if (e.code === 'ArrowDown') {
                move2048('down');
            } else if (e.code === 'ArrowLeft') {
                move2048('left');
            } else if (e.code === 'ArrowRight') {
                move2048('right');
            }
            break;
    }
});

// Обработчики касаний для мобильных устройств
canvas.addEventListener('click', () => {
    if (gameState !== 'playing') return;

    switch(currentGame) {
        case 'flappy':
            bird.flap();
            break;
        case 'dino':
            dino.jump();
            break;
        case 'doodle':
            doodle.jump();
            break;
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState !== 'playing') return;

    switch(currentGame) {
        case 'flappy':
            bird.flap();
            break;
        case 'dino':
            dino.jump();
            break;
        case 'doodle':
            doodle.jump();
            break;
    }
});

// Для игры 2048 добавим обработчики свайпов
let touchStartX = 0;
let touchStartY = 0;

// Отдельный обработчик для игры 2048
canvas.addEventListener('touchstart', (e) => {
    if (currentGame !== '2048' || gameState !== 'playing') return;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    if (currentGame !== '2048' || gameState !== 'playing') return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    // Определяем направление свайпа
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            move2048('right');
        } else {
            move2048('left');
        }
    } else {
        if (dy > 0) {
            move2048('down');
        } else {
            move2048('up');
        }
    }
});

// Игровой цикл
function gameLoop() {
    // Очистка canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Выполняем логику и отрисовку для текущей игры
    switch(currentGame) {
        case 'flappy':
            updateFlappyBird();
            drawFlappyBird();
            break;
        case 'dino':
            updateDinoRun();
            drawDinoRun();
            break;
        case 'doodle':
            updateDoodleJump();
            drawDoodleJump();
            break;
        case 'snake':
            updateSnake();
            drawSnake();
            break;
        case 'breakout':
            updateBreakout();
            drawBreakout();
            break;
        case '2048':
            draw2048();
            break;
    }

    // Продолжаем цикл
    animationId = requestAnimationFrame(gameLoop);
}

// Импорты функций для каждой игры
import { initFlappyBird, resetFlappyBird, updateFlappyBird, drawFlappyBird, setGameOver as setGameOverFlappy } from './games/flappyBird.js';
import { initDinoRun, resetDinoRun, updateDinoRun, drawDinoRun, setGameOver as setGameOverDino, getCurrentScore as getCurrentScoreDino } from './games/dinoRun.js';
import { initDoodleJump, resetDoodleJump, updateDoodleJump, drawDoodleJump, setGameOver as setGameOverDoodle, setCurrentGame as setCurrentGameDoodle } from './games/doodleJump.js';
import { initSnake, resetSnake, updateSnake, drawSnake, setGameOver as setGameOverSnake } from './games/snake.js';
import { initBreakout, resetBreakout, updateBreakout, drawBreakout, setGameOver as setGameOverBreakout, setCurrentGame as setCurrentGameBreakout, getCurrentScore } from './games/breakout.js';
import { init2048, reset2048, draw2048, move2048, setGameOver as setGameOver2048, setCurrentGame as setCurrentGame2048 } from './games/game2048.js';
