// Система лидерборда - сохранение и загрузка очков

// Функция для сохранения очка
export function saveScore(score, playerName = 'Anonymous') {
  try {
    const scores = loadScores();
    scores.push({ score, playerName, timestamp: Date.now() });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(scores.slice(0, 10))); // Топ 10
    return true;
  } catch (error) {
    console.error('Error saving score:', error);
    return false;
  }
}

// Функция для загрузки очков
export function loadScores() {
  try {
    const scores = localStorage.getItem('leaderboard');
    return scores ? JSON.parse(scores) : [];
  } catch (error) {
    console.error('Error loading scores:', error);
    return [];
  }
}
