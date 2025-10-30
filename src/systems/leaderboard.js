
export function saveScore(gameId, score, meta){ const key='noosphere_scores_'+gameId; const arr=JSON.parse(localStorage.getItem(key)||'[]'); arr.push({ts:Date.now(),score,meta}); arr.sort((a,b)=>b.score-a.score); while(arr.length>10) arr.pop(); localStorage.setItem(key, JSON.stringify(arr)); }
export function loadScores(gameId){ return JSON.parse(localStorage.getItem('noosphere_scores_'+gameId)||'[]'); }
