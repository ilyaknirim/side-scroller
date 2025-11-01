// Application state management
export let currentSession = null;
export let currentCharacter = null;
export let currentWorldSet = null;
export let currentSeed = null;

// State setters
export function setCurrentSession(session) {
  currentSession = session;
}

export function setCurrentCharacter(character) {
  currentCharacter = character;
}

export function setCurrentWorldSet(worldSet) {
  currentWorldSet = worldSet;
}

export function setCurrentSeed(seed) {
  currentSeed = seed;
}

// State getters
export function getCurrentSession() {
  return currentSession;
}

export function getCurrentCharacter() {
  return currentCharacter;
}

export function getCurrentWorldSet() {
  return currentWorldSet;
}

export function getCurrentSeed() {
  return currentSeed;
}

// Reset all state
export function resetState() {
  currentSession = null;
  currentCharacter = null;
  currentWorldSet = null;
  currentSeed = null;
}
