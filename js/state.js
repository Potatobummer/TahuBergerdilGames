export const STATE_VERSION = 1;
export const SAVE_KEY = "tahu-bergedil-save";

export function createState() {
  return {
    version: STATE_VERSION,
    chapter: 0,
    phase: "dialogue",
    dialogueIndex: 0,
    activity: null,
    milestone: null,
    stats: { joy: 0, skill: 0, bonds: 0 },
    finished: false
  };
}

export function applyEffects(state, effects = {}) {
  for (const key of ["joy", "skill", "bonds"]) {
    state.stats[key] = Math.max(0, state.stats[key] + (effects[key] || 0));
  }
}

export function saveState(state, storage = localStorage) {
  storage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadState(storage = localStorage) {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw);
    return isValidState(state) ? state : null;
  } catch {
    return null;
  }
}

export function clearState(storage = localStorage) {
  storage.removeItem(SAVE_KEY);
}

function isValidState(state) {
  const phases = ["dialogue", "activity", "milestone", "result", "ending"];
  return Boolean(
    state && state.version === STATE_VERSION &&
    Number.isInteger(state.chapter) && state.chapter >= 0 && state.chapter <= 6 &&
    Number.isInteger(state.dialogueIndex) && state.dialogueIndex >= 0 &&
    phases.includes(state.phase) && typeof state.finished === "boolean" &&
    state.stats && ["joy", "skill", "bonds"].every((key) =>
      Number.isFinite(state.stats[key]) && state.stats[key] >= 0)
  );
}
