
// Тест для проверки интерфейса игры Breakout
import { GAME_WIDTH, GAME_HEIGHT } from '../js/constants.js';

// Мокаем canvas и контекст
const mockCanvas = {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    addEventListener: jest.fn(),
    getContext: jest.fn(() => ({
        clearRect: jest.fn(),
        fillRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        createLinearGradient: jest.fn(() => ({
            addColorStop: jest.fn()
        })),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0
    }))
};

// Мокаем DOM элементы
const mockScoreElement = {
    textContent: '0'
};

// Мокаем gameState
let mockGameState = 'start';

describe('Breakout Game Interface', () => {
    beforeAll(() => {
        // Устанавливаем моки
        global.canvas = mockCanvas;
        global.ctx = mockCanvas.getContext();
        global.scoreElement = mockScoreElement;
        global.gameState = mockGameState;
        global.score = 0;
    });

    test('Инициализация игры Breakout', async () => {
        // Динамический импорт модуля breakout
        const breakout = await import('../js/games/breakout.js');

        // Проверяем, что модуль экспортирует нужные объекты
        expect(breakout.paddle).toBeDefined();
        expect(breakout.ball).toBeDefined();
        expect(breakout.bricks).toBeDefined();
        expect(breakout.background).toBeDefined();

        // Проверяем начальные позиции платформы
        expect(breakout.paddle.x).toBe(GAME_WIDTH / 2 - 40);
        expect(breakout.paddle.y).toBe(GAME_HEIGHT - 30);
        expect(breakout.paddle.width).toBe(80);
        expect(breakout.paddle.height).toBe(10);

        // Проверяем начальные позиции мяча
        expect(breakout.ball.x).toBe(GAME_WIDTH / 2);
        expect(breakout.ball.y).toBe(GAME_HEIGHT - 50);
        expect(breakout.ball.radius).toBe(6);

        // Проверяем параметры кирпичей
        expect(breakout.bricks.rows).toBe(5);
        expect(breakout.bricks.cols).toBe(8);
    });

    test('Отрисовка фона', async () => {
        const breakout = await import('../js/games/breakout.js');

        // Вызываем функцию отрисовки фона
        breakout.background.draw();

        // Проверяем, что был вызван метод fillRect для отрисовки фона
        expect(mockCanvas.getContext().fillRect).toHaveBeenCalledWith(0, 0, GAME_WIDTH, GAME_HEIGHT);
    });

    test('Сброс игры Breakout', async () => {
        const breakout = await import('../js/games/breakout.js');

        // Изменяем состояние игры
        breakout.paddle.x = 100;
        breakout.ball.x = 200;
        breakout.ball.speed = 5;

        // Вызываем функцию сброса
        breakout.resetBreakout();

        // Проверяем, что состояние сбросилось
        expect(breakout.paddle.x).toBe(GAME_WIDTH / 2 - 40);
        expect(breakout.ball.x).toBe(GAME_WIDTH / 2);
        expect(breakout.ball.speed).toBe(4);
        expect(mockScoreElement.textContent).toBe('0');
    });
});
