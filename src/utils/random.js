// Генератор псевдослучайных чисел на основе seed
export function pseudoRandom(seed) {
  let s = seed >>> 0;
  return function() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
