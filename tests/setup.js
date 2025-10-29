
// Глобальные моки для тестов

// Мок для Telegram WebApp
global.Telegram = {
    WebApp: {
        expand: jest.fn(),
        ready: jest.fn(),
        MainButton: {
            text: '',
            isVisible: false,
            onClick: jest.fn(),
            show: jest.fn(),
            hide: jest.fn()
        }
    }
};

// Мок для localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Мок для requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Мок для Canvas API
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn()
    })),
    createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn()
    })),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: '',
    textBaseline: ''
}));

// Мок для addEventListener
global.EventTarget.prototype.addEventListener = jest.fn();
global.EventTarget.prototype.removeEventListener = jest.fn();
