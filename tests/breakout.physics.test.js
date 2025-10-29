
// Тест для проверки физики игры Breakout
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
let mockGameState = 'playing';

describe('Breakout Game Physics', () => {
    beforeAll(async () => {
        // Устанавливаем моки
        global.canvas = mockCanvas;
        global.ctx = mockCanvas.getContext();
        global.scoreElement = mockScoreElement;
        global.gameState = mockGameState;
        global.score = 0;

        // Импортируем breakout
        const breakout = await import('../js/games/breakout.js');

        // Инициализируем игру
        breakout.initBreakout(mockCanvas);
        breakout.resetBreakout();

        // Сохраняем ссылки на объекты
        global.paddle = breakout.paddle;
        global.ball = breakout.ball;
        global.bricks = breakout.bricks;
    });

    test('Столкновение мяча со стенами', () => {
        // Сохраняем начальную скорость
        const initialVelocityX = ball.velocityX;
        const initialVelocityY = ball.velocityY;

        // Размещаем мяч у правой стены
        ball.x = GAME_WIDTH - ball.radius - 1;
        ball.update();

        // Проверяем, что скорость по X изменилась (отскок)
        expect(ball.velocityX).toBe(-initialVelocityX);
        expect(ball.velocityY).toBe(initialVelocityY);

        // Размещаем мяч у верхней стены
        ball.x = GAME_WIDTH / 2;
        ball.y = ball.radius + 1;
        ball.velocityX = initialVelocityX;
        ball.velocityY = initialVelocityY;
        ball.update();

        // Проверяем, что скорость по Y изменилась (отскок)
        expect(ball.velocityX).toBe(initialVelocityX);
        expect(ball.velocityY).toBe(-initialVelocityY);
    });

    test('Столкновение мяча с платформой', () => {
        // Размещаем мяч над платформой
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius - 1;
        ball.velocityX = 0;
        ball.velocityY = 5;

        // Сохраняем начальную скорость
        const initialSpeed = ball.speed;

        // Обновляем состояние
        ball.update();

        // Проверяем, что скорость по Y изменилась (отскок вверх)
        expect(ball.velocityY).toBeLessThan(0);
        expect(ball.velocityX).toBe(0);
        expect(ball.speed).toBe(initialSpeed);
    });

    test('Столкновение мяча с платформой под углом', () => {
        // Размещаем мяч над левым краем платформы
        ball.x = paddle.x + paddle.width / 4;
        ball.y = paddle.y - ball.radius - 1;
        ball.velocityX = 0;
        ball.velocityY = 5;

        // Обновляем состояние
        ball.update();

        // Проверяем, что скорость по X изменилась (отскок влево)
        expect(ball.velocityX).toBeLessThan(0);
        expect(ball.velocityY).toBeLessThan(0);

        // Размещаем мяч над правым краем платформы
        ball.x = paddle.x + paddle.width * 3 / 4;
        ball.y = paddle.y - ball.radius - 1;
        ball.velocityX = 0;
        ball.velocityY = 5;

        // Обновляем состояние
        ball.update();

        // Проверяем, что скорость по X изменилась (отскок вправо)
        expect(ball.velocityX).toBeGreaterThan(0);
        expect(ball.velocityY).toBeLessThan(0);
    });

    test('Столкновение мяча с кирпичом', () => {
        // Инициализируем кирпичи
        bricks.init();

        // Размещаем мяч перед первым кирпичом
        const firstBrick = bricks.positions[0][0];
        ball.x = firstBrick.x + bricks.width / 2;
        ball.y = firstBrick.y - ball.radius - 1;
        ball.velocityX = 0;
        ball.velocityY = 5;

        // Сохраняем начальный счет
        const initialScore = parseInt(mockScoreElement.textContent);

        // Обновляем состояние
        ball.update();
        bricks.update();

        // Проверяем, что кирпич был уничтожен
        expect(firstBrick.status).toBe(0);

        // Проверяем, что счет увеличился
        expect(parseInt(mockScoreElement.textContent)).toBe(initialScore + 10);

        // Проверяем, что скорость по Y изменилась (отскок)
        expect(ball.velocityY).toBeLessThan(0);
    });
});
