// Система частиц - создание и управление частицами

// Функция для создания эмиттера частиц
export function createParticleEmitter(options = {}) {
  const particles = [];
  const defaults = {
    maxParticles: 100,
    emissionRate: 10,
    lifetime: 2000,
    size: 2,
    speed: 50,
    color: '#ffffff',
    gravity: 0,
    ...options
  };

  let lastEmission = 0;

  const emitter = {
    x: 0,
    y: 0,
    ...defaults,

    // Установка позиции
    setPosition(x, y) {
      this.x = x;
      this.y = y;
    },

    // Создание частицы
    createParticle() {
      const angle = Math.random() * Math.PI * 2;
      const speed = this.speed * (0.5 + Math.random() * 0.5);

      return {
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: this.lifetime,
        maxLife: this.lifetime,
        size: this.size * (0.5 + Math.random() * 0.5),
        color: this.color,
        gravity: this.gravity
      };
    },

    // Эмиссия частиц
    emit(count = 1) {
      for (let i = 0; i < count; i++) {
        if (particles.length < this.maxParticles) {
          particles.push(this.createParticle());
        }
      }
    },

    // Обновление частиц
    update(deltaTime) {
      // Эмиссия новых частиц
      const now = Date.now();
      if (now - lastEmission > 1000 / this.emissionRate) {
        this.emit();
        lastEmission = now;
      }

      // Обновление существующих частиц
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        // Применение гравитации
        particle.vy += particle.gravity * deltaTime;

        // Обновление позиции
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Уменьшение жизни
        particle.life -= deltaTime * 1000;

        // Удаление мертвых частиц
        if (particle.life <= 0) {
          particles.splice(i, 1);
        }
      }
    },

    // Отрисовка частиц
    render(ctx) {
      particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    },

    // Очистка всех частиц
    clear() {
      particles.length = 0;
    },

    // Получение количества частиц
    getParticleCount() {
      return particles.length;
    }
  };

  return emitter;
}
