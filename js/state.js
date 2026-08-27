import { CHAPTERS, CHARACTERS } from "./game-data.js";

export const STATE_VERSION = 2;
export const SAVE_KEY = "tofu-bergerdil-save";
const ATTRIBUTE_KEYS = ["joy", "skill", "bonds"];
const CHARACTER_IDS = CHARACTERS.map(({ id }) => id);

export function createState() {
  return {
    version: STATE_VERSION,
    chapter: 0,
    phase: "dialogue",
    dialogueIndex: 0,
    activity: null,
    milestone: null,
    characters: Object.fromEntries(CHARACTERS.map((record) => [record.id, {
      age: record.startingAge,
      level: 1,
      attributes: { ...record.attributes },
      condition: { vitality: 100, sharedPortions: 0, status: "rested" },
      learnedAbilities: [record.startingAbility],
      progression: { experience: 0, arcStage: 0 }
    }])),
    finished: false
  };
}

export function applyEffects(state, effects = {}) {
  for (const id of CHARACTER_IDS) {
    const effect = effects[id];
    if (!effect) continue;
    const character = state.characters[id];
    for (const key of ATTRIBUTE_KEYS) {
      character.attributes[key] = Math.max(0, character.attributes[key] + (effect.attributes?.[key] || 0));
    }
    const vitalityChange = effect.condition?.vitality || 0;
    character.condition.vitality = Math.min(100, Math.max(0, character.condition.vitality + vitalityChange));
    if (vitalityChange < 0) character.condition.sharedPortions += 1;
    character.condition.status = conditionFor(character.condition.vitality);
    const previousLevel = character.level;
    character.progression.experience += effect.progression?.experience || 0;
    character.level = 1 + Math.floor(character.progression.experience / 5);
    const growth = CHARACTERS.find((record) => record.id === id).growth;
    for (const key of ATTRIBUTE_KEYS) {
      character.attributes[key] += growth[key] * (character.level - previousLevel);
    }
    if (effect.learn && !character.learnedAbilities.includes(effect.learn)) character.learnedAbilities.push(effect.learn);
  }
}

export function advanceCharacterProgression(state, chapter) {
  for (const record of CHARACTERS) {
    const character = state.characters[record.id];
    character.age = record.startingAge + chapter.ageOffset;
    character.progression.arcStage = chapter.arcStage;
  }
}

export function saveState(state, storage = localStorage) {
  storage.setItem(SAVE_KEY, JSON.stringify(state));
}

// Version 1 represented one unnamed protagonist, so it cannot be split safely.
// Rejecting it explicitly avoids inventing either character's history.
export function loadState(storage = localStorage, chapters = CHAPTERS) {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw);
    if (state?.version === 1) return null;
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
  if (!Boolean(state && state.version === STATE_VERSION && Array.isArray(chapters) && chapters.length > 0 &&
    Number.isInteger(state.chapter) && state.chapter >= 0 && state.chapter < chapters.length &&
    phases.includes(state.phase) && typeof state.finished === "boolean" && validCharacters(state.characters))) return false;

  const chapter = chapters[state.chapter];
  if (!chapter || !Array.isArray(chapter.dialogue) || !Array.isArray(chapter.activities) ||
      !Array.isArray(chapter.choices) || !isIndexIn(state.dialogueIndex, chapter.dialogue)) return false;
  if (Object.entries(state.characters).some(([id, character]) => {
    const record = CHARACTERS.find((candidate) => candidate.id === id);
    return character.age !== record.startingAge + chapter.ageOffset || character.progression.arcStage !== chapter.arcStage;
  })) return false;

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
    ending: dialogueComplete && state.activity !== null && state.milestone !== null && state.finished && finalChapter
  };
  return Boolean(relationships[state.phase]) && (state.phase === "ending" || !state.finished);
}

function validCharacters(characters) {
  if (!characters || typeof characters !== "object" || Array.isArray(characters) ||
      Object.keys(characters).length !== CHARACTER_IDS.length) return false;
  return CHARACTER_IDS.every((id) => {
    const character = characters[id];
    return character && Number.isInteger(character.age) && character.age >= 0 &&
      Number.isInteger(character.level) && character.level >= 1 &&
      character.attributes && ATTRIBUTE_KEYS.every((key) => Number.isFinite(character.attributes[key]) && character.attributes[key] >= 0) &&
      character.condition && Number.isFinite(character.condition.vitality) && character.condition.vitality >= 0 && character.condition.vitality <= 100 &&
      Number.isInteger(character.condition.sharedPortions) && character.condition.sharedPortions >= 0 &&
      character.condition.status === conditionFor(character.condition.vitality) &&
      Array.isArray(character.learnedAbilities) && character.learnedAbilities.every((ability) => typeof ability === "string" && ability.length > 0) &&
      new Set(character.learnedAbilities).size === character.learnedAbilities.length &&
      character.progression && Number.isInteger(character.progression.experience) && character.progression.experience >= 0 &&
      Number.isInteger(character.progression.arcStage) && character.progression.arcStage >= 0 && character.progression.arcStage < 5 &&
      character.level === 1 + Math.floor(character.progression.experience / 5);
  });
}

function conditionFor(vitality) {
  if (vitality <= 25) return "depleted";
  if (vitality <= 60) return "tired";
  return "rested";
}

function isIndexIn(value, items) {
  return Number.isInteger(value) && value >= 0 && value < items.length;
}
