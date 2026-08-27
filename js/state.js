import { ACTIVITIES, CHAPTERS, CHARACTERS, SEASON_EVENTS, SEASONS } from "./game-data.js";

export const STATE_VERSION = 3;
export const SAVE_KEY = "tofu-bergerdil-save";
const ATTRIBUTE_KEYS = ["joy", "skill", "bonds"];
const CHARACTER_IDS = CHARACTERS.map(({ id }) => id);
const ACTIVITY_IDS = ACTIVITIES.map(({ id }) => id);

export function createState() {
  return {
    version: STATE_VERSION,
    chapter: 0,
    phase: "dialogue",
    dialogueIndex: 0,
    season: 0,
    schedule: null,
    lastSeason: null,
    milestone: null,
    characters: Object.fromEntries(CHARACTERS.map((record) => [record.id, {
      age: record.startingAge,
      level: 1,
      attributes: { ...record.attributes },
      condition: { vitality: 100, sharedPortions: 0, status: "rested" },
      learnedAbilities: [record.startingAbility],
      progression: { experience: 0, arcStage: 0 }
    }])),
    resources: { coins: 14, reputation: 0, relationship: 8 },
    seenEvents: [],
    history: [],
    finished: false
  };
}

export function applyEffects(state, effects = {}) {
  for (const id of CHARACTER_IDS) {
    const effect = effects[id];
    if (!effect) continue;
    applyCharacterEffect(state, id, effect);
  }
  applyResources(state, effects.resources);
}

function applyCharacterEffect(state, id, effect = {}) {
  const character = state.characters[id];
  for (const key of ATTRIBUTE_KEYS) {
    character.attributes[key] = Math.max(0, character.attributes[key] + (effect.attributes?.[key] || 0));
  }
  const vitalityChange = effect.condition?.vitality || 0;
  character.condition.vitality = clamp(character.condition.vitality + vitalityChange, 0, 100);
  if (vitalityChange < 0) character.condition.sharedPortions += 1;
  character.condition.status = conditionFor(character.condition.vitality);
  const previousLevel = character.level;
  character.progression.experience += effect.progression?.experience || 0;
  character.level = 1 + Math.floor(character.progression.experience / 5);
  const record = CHARACTERS.find((candidate) => candidate.id === id);
  for (const key of ATTRIBUTE_KEYS) {
    character.attributes[key] += record.growth[key] * (character.level - previousLevel);
  }
  if (effect.learn && !character.learnedAbilities.includes(effect.learn)) character.learnedAbilities.push(effect.learn);
  const levelAbility = id === "silkenTofu"
    ? { 2: "Measured portion", 3: "Soy-milk renewal", 4: "Living starter" }[character.level]
    : { 2: "Garden muster", 3: "Rain-root renewal", 4: "Seed-the-future" }[character.level];
  if (levelAbility && !character.learnedAbilities.includes(levelAbility)) character.learnedAbilities.push(levelAbility);
}

function applyResources(state, changes = {}) {
  state.resources.coins = Math.max(0, state.resources.coins + (changes?.coins || 0));
  state.resources.reputation = clamp(state.resources.reputation + (changes?.reputation || 0), 0, 100);
  state.resources.relationship = clamp(state.resources.relationship + (changes?.relationship || 0), 0, 100);
}

export function canAffordSchedule(state, schedule) {
  return CHARACTER_IDS.every((id) => ACTIVITY_IDS.includes(schedule?.[id])) &&
    state.resources.coins + CHARACTER_IDS.reduce((sum, id) => {
      const activity = ACTIVITIES.find((candidate) => candidate.id === schedule[id]);
      return sum + (activity.resources.coins || 0);
    }, 0) >= 0;
}

export function applySeason(state, schedule) {
  if (!canAffordSchedule(state, schedule)) throw new Error("That schedule costs more coins than the pair has.");
  for (const id of CHARACTER_IDS) {
    if (state.characters[id].condition.vitality <= 15 && schedule[id] !== "rest") {
      throw new Error(`${CHARACTERS.find((record) => record.id === id).name} is depleted and needs to rest.`);
    }
  }

  const before = snapshot(state);
  const summaries = [];
  for (const id of CHARACTER_IDS) {
    const activity = ACTIVITIES.find((candidate) => candidate.id === schedule[id]);
    applyCharacterEffect(state, id, activity.effects);
    applyResources(state, activity.resources);
    applySpecialtyBonus(state, id, activity.id);
    summaries.push({ character: CHARACTERS.find((record) => record.id === id).name, activity: activity.label, icon: activity.icon });
  }

  const plans = CHARACTER_IDS.map((id) => schedule[id]);
  if (plans[0] === plans[1]) applyResources(state, { relationship: plans[0] === "rest" ? 1 : 2 });
  const event = SEASON_EVENTS.find((candidate) => !state.seenEvents.includes(candidate.id) && candidate.when(state, plans));
  if (event) {
    applyEffects(state, event.effects);
    applyResources(state, event.resources);
    state.seenEvents.push(event.id);
  }

  state.schedule = { ...schedule };
  state.lastSeason = {
    chapter: state.chapter,
    season: state.season,
    name: SEASONS[state.season],
    summaries,
    event: event ? { title: event.title, text: event.text } : null,
    changes: diff(before, snapshot(state))
  };
  state.history.push(structuredClone(state.lastSeason));
  state.phase = "seasonResult";
}

function applySpecialtyBonus(state, id, activityId) {
  if (id === "silkenTofu" && activityId === "community") {
    applyCharacterEffect(state, id, { attributes: { bonds: 1 } });
  }
  if (id === "potatoHero" && activityId === "garden") {
    applyCharacterEffect(state, id, { attributes: { skill: 1 } });
  }
}

export function advanceSeason(state) {
  state.schedule = null;
  if (state.season < SEASONS.length - 1) {
    state.season += 1;
    state.phase = "planning";
  } else {
    state.phase = "milestone";
  }
}

export function chooseMilestone(state, index) {
  const choice = CHAPTERS[state.chapter].choices[index];
  if (!choice) throw new Error("Unknown milestone choice.");
  state.milestone = index;
  applyEffects(state, choice.effects);
  state.phase = "result";
}

export function advanceCharacterProgression(state, chapter) {
  for (const record of CHARACTERS) {
    const character = state.characters[record.id];
    character.age = record.startingAge + chapter.ageOffset;
    character.progression.arcStage = chapter.arcStage;
  }
}

export function beginNextChapter(state) {
  if (state.chapter === CHAPTERS.length - 1) {
    state.finished = true;
    state.phase = "ending";
    return;
  }
  state.chapter += 1;
  advanceCharacterProgression(state, CHAPTERS[state.chapter]);
  state.phase = "dialogue";
  state.dialogueIndex = 0;
  state.season = 0;
  state.schedule = null;
  state.lastSeason = null;
  state.milestone = null;
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
  const phases = ["dialogue", "planning", "seasonResult", "milestone", "result", "ending"];
  if (!(state && state.version === STATE_VERSION && Array.isArray(chapters) && chapters.length > 0 &&
    Number.isInteger(state.chapter) && state.chapter >= 0 && state.chapter < chapters.length &&
    phases.includes(state.phase) && Number.isInteger(state.season) && state.season >= 0 && state.season < SEASONS.length &&
    typeof state.finished === "boolean" && validCharacters(state.characters) && validResources(state.resources) &&
    Array.isArray(state.seenEvents) && state.seenEvents.every((id) => typeof id === "string") && Array.isArray(state.history))) return false;

  const chapter = chapters[state.chapter];
  if (!chapter || !Array.isArray(chapter.dialogue) || !Array.isArray(chapter.choices) ||
    !isIndexIn(state.dialogueIndex, chapter.dialogue)) return false;
  if (Object.entries(state.characters).some(([id, character]) => {
    const record = CHARACTERS.find((candidate) => candidate.id === id);
    return !record || character.age !== record.startingAge + chapter.ageOffset || character.progression.arcStage !== chapter.arcStage;
  })) return false;
  if (state.milestone !== null && !isIndexIn(state.milestone, chapter.choices)) return false;
  if (state.schedule !== null && !CHARACTER_IDS.every((id) => ACTIVITY_IDS.includes(state.schedule[id]))) return false;
  if (state.phase === "ending") return state.finished && state.chapter === chapters.length - 1 && state.milestone !== null;
  if (state.finished) return false;
  if (state.phase === "seasonResult") return Boolean(state.schedule && state.lastSeason);
  if (["milestone", "result"].includes(state.phase) && state.season !== SEASONS.length - 1) return false;
  if (state.phase === "result" && state.milestone === null) return false;
  if (["dialogue", "planning", "milestone"].includes(state.phase) && state.milestone !== null) return false;
  return true;
}

function validCharacters(characters) {
  return Boolean(characters && typeof characters === "object" && !Array.isArray(characters) &&
    Object.keys(characters).length === CHARACTER_IDS.length && CHARACTER_IDS.every((id) => {
      const character = characters[id];
      return character && Number.isInteger(character.age) && character.age >= 0 &&
        Number.isInteger(character.level) && character.level >= 1 &&
        character.attributes && ATTRIBUTE_KEYS.every((key) => Number.isFinite(character.attributes[key]) && character.attributes[key] >= 0) &&
        character.condition && Number.isFinite(character.condition.vitality) && character.condition.vitality >= 0 && character.condition.vitality <= 100 &&
        Number.isInteger(character.condition.sharedPortions) && character.condition.sharedPortions >= 0 &&
        character.condition.status === conditionFor(character.condition.vitality) &&
        Array.isArray(character.learnedAbilities) && character.learnedAbilities.every((ability) => typeof ability === "string") &&
        character.progression && Number.isInteger(character.progression.experience) && character.progression.experience >= 0 &&
        Number.isInteger(character.progression.arcStage) && character.progression.arcStage >= 0 && character.progression.arcStage < CHAPTERS.length &&
        character.level === 1 + Math.floor(character.progression.experience / 5);
    }));
}

function validResources(resources) {
  return resources && ["coins", "reputation", "relationship"].every((key) => Number.isFinite(resources[key]) && resources[key] >= 0 && resources[key] <= (key === "coins" ? Infinity : 100));
}

function snapshot(state) {
  return {
    resources: { ...state.resources },
    characters: Object.fromEntries(CHARACTER_IDS.map((id) => [id, {
      vitality: state.characters[id].condition.vitality,
      ...state.characters[id].attributes
    }]))
  };
}

function diff(before, after) {
  const resources = Object.fromEntries(Object.keys(before.resources).map((key) => [key, after.resources[key] - before.resources[key]]));
  const characters = Object.fromEntries(CHARACTER_IDS.map((id) => [id,
    Object.fromEntries(Object.keys(before.characters[id]).map((key) => [key, after.characters[id][key] - before.characters[id][key]]))
  ]));
  return { resources, characters };
}

function conditionFor(vitality) {
  if (vitality <= 25) return "depleted";
  if (vitality <= 60) return "tired";
  return "rested";
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function isIndexIn(value, items) {
  return Number.isInteger(value) && value >= 0 && value < items.length;
}
