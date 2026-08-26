import { CHAPTERS } from "./game-data.js";

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

export function loadState(storage = localStorage, chapters = CHAPTERS) {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw);
    return isValidState(state, chapters) ? state : null;
  } catch {
    return null;
  }
}

export function clearState(storage = localStorage) {
  storage.removeItem(SAVE_KEY);
}

export function isValidState(state, chapters = CHAPTERS) {
  const phases = ["dialogue", "activity", "milestone", "result", "ending"];
  if (!Boolean(
    state && state.version === STATE_VERSION &&
    Array.isArray(chapters) && chapters.length > 0 &&
    Number.isInteger(state.chapter) && state.chapter >= 0 && state.chapter < chapters.length &&
    phases.includes(state.phase) && typeof state.finished === "boolean" &&
    state.stats && ["joy", "skill", "bonds"].every((key) =>
      Number.isFinite(state.stats[key]) && state.stats[key] >= 0)
  )) return false;

  const chapter = chapters[state.chapter];
  if (!chapter || !Array.isArray(chapter.dialogue) || !Array.isArray(chapter.activities) ||
      !Array.isArray(chapter.choices) ||
      !isIndexIn(state.dialogueIndex, chapter.dialogue)) return false;

  const activityIsValid = state.activity === null || isIndexIn(state.activity, chapter.activities);
  const milestoneIsValid = state.milestone === null || isIndexIn(state.milestone, chapter.choices);
  if (!activityIsValid || !milestoneIsValid) return false;

  const dialogueComplete = state.dialogueIndex === chapter.dialogue.length - 1;
  const finalChapter = state.chapter === chapters.length - 1;
  const relationships = {
    dialogue: state.activity === null && state.milestone === null && !state.finished,
    activity: dialogueComplete && state.activity === null && state.milestone === null && !state.finished,
    milestone: dialogueComplete && state.activity !== null && state.milestone === null && !state.finished,
    result: dialogueComplete && state.activity !== null && state.milestone !== null && !state.finished,
    ending: dialogueComplete && state.activity !== null && state.milestone !== null &&
      state.finished && finalChapter
  };

  return relationships[state.phase] && (state.phase === "ending" || !state.finished);
}

function isIndexIn(value, items) {
  return Number.isInteger(value) && value >= 0 && value < items.length;
}
