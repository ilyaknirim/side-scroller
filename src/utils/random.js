/**
 * Creates a pseudo-random number generator with a given seed.
 * Returns a function that generates numbers in [0, 1).
 * @param {number} seed - The seed for the generator.
 * @returns {function} A function that returns a pseudo-random number.
 */
export function pseudoRandom(seed) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return function () {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}
