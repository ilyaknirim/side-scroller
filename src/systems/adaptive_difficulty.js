// Адаптивная сложность - отслеживание производительности игрока

// Класс для отслеживания производительности игрока
export class PlayerPerformanceTracker {
  constructor() {
    this.sessions = [];
    this.currentSession = {
      startTime: Date.now(),
      actions: [],
      score: 0,
      mistakes: 0,
    };
  }

  // Запись действия игрока
  recordAction(actionType, success) {
    this.currentSession.actions.push({
      type: actionType,
      success: success,
      timestamp: Date.now(),
    });
    if (!success) {
      this.currentSession.mistakes++;
    }
  }

  // Установка счета
  setScore(score) {
    this.currentSession.score = score;
  }

  // Завершение сессии
  endSession() {
    const endTime = Date.now();
    this.currentSession.duration = endTime - this.currentSession.startTime;
    this.sessions.push({ ...this.currentSession });
    this.currentSession = {
      startTime: Date.now(),
      actions: [],
      score: 0,
      mistakes: 0,
    };
  }

  // Получение статистики производительности
  getPerformanceStats() {
    if (this.sessions.length === 0) {
      return null;
    }

    const totalSessions = this.sessions.length;
    const avgScore = this.sessions.reduce((sum, s) => sum + s.score, 0) / totalSessions;
    const avgMistakes = this.sessions.reduce((sum, s) => sum + s.mistakes, 0) / totalSessions;
    const avgDuration = this.sessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions;

    return {
      totalSessions,
      avgScore: Math.round(avgScore),
      avgMistakes: Math.round(avgMistakes * 100) / 100,
      avgDuration: Math.round(avgDuration),
    };
  }
}

// Функция для создания трекера производительности
export function createPerformanceTracker() {
  return new PlayerPerformanceTracker();
}

// Функция для форматирования статистики производительности
export function formatPerformanceStats(stats) {
  if (!stats) {
    return 'No performance data available';
  }

  return `Sessions: ${stats.totalSessions}\nAvg Score: ${stats.avgScore}\nAvg Mistakes: ${stats.avgMistakes}\nAvg Duration: ${stats.avgDuration}ms`;
}
