// Визуальные эффекты - инициализация визуальной системы

// Функция для инициализации визуалов
export function initVisuals(canvas) {
  if (!canvas) {
    console.error('Canvas element is required for visuals initialization');
    return null;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not get 2D context from canvas');
    return null;
  }

  const visuals = {
    canvas,
    ctx,
    effects: new Map(),
    animationFrame: null,

    // Добавление эффекта
    addEffect(name, effect) {
      this.effects.set(name, effect);
    },

    // Удаление эффекта
    removeEffect(name) {
      this.effects.delete(name);
    },

    // Отрисовка всех эффектов
    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.effects.forEach(effect => {
        if (typeof effect.render === 'function') {
          effect.render(this.ctx);
        }
      });
    },

    // Запуск анимации
    startAnimation() {
      const animate = () => {
        this.render();
        this.animationFrame = requestAnimationFrame(animate);
      };
      animate();
    },

    // Остановка анимации
    stopAnimation() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    },

    // Очистка
    destroy() {
      this.stopAnimation();
      this.effects.clear();
    }
  };

  return visuals;
}
