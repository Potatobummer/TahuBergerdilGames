import test from "node:test";
import assert from "node:assert/strict";

import { CHAPTERS, CHARACTERS } from "../js/game-data.js";
import {
  advanceCharacterProgression, applyEffects, createState, isValidState, loadState, SAVE_KEY, STATE_VERSION
} from "../js/state.js";

function atResult(overrides = {}) {
  const state = createState();
  const chapterIndex = overrides.chapter ?? 0;
  state.chapter = chapterIndex;
  if (CHAPTERS[chapterIndex]) advanceCharacterProgression(state, CHAPTERS[chapterIndex]);
  Object.assign(state, {
    dialogueIndex: (CHAPTERS[chapterIndex] ?? CHAPTERS[0]).dialogue.length - 1,
    phase: "result",
    activity: 0,
    milestone: 0,
    ...overrides
  });
  return state;
}

function storageFor(state) {
  return { getItem: (key) => key === SAVE_KEY ? JSON.stringify(state) : null };
}

function clone(value) {
  return structuredClone(value);
}

test("creates independent state for both declarative characters", () => {
  const state = createState();
  assert.equal(state.version, STATE_VERSION);
  assert.deepEqual(Object.keys(state.characters), CHARACTERS.map(({ id }) => id));
  for (const record of CHARACTERS) {
    const character = state.characters[record.id];
    assert.equal(character.age, record.startingAge);
    assert.equal(character.level, 1);
    assert.deepEqual(character.attributes, record.attributes);
    assert.deepEqual(character.learnedAbilities, [record.startingAbility]);
    assert.deepEqual(character.progression, { experience: 0, arcStage: 0 });
  }
  assert.notEqual(state.characters.silkenTofu.attributes, state.characters.potatoHero.attributes);
  const potatoJoy = state.characters.potatoHero.attributes.joy;
  state.characters.silkenTofu.attributes.joy += 1;
  assert.equal(state.characters.potatoHero.attributes.joy, potatoJoy);
});

test("applies individual growth, condition, ability, and progression effects", () => {
  const state = createState();
  applyEffects(state, {
    silkenTofu: { attributes: { skill: 3 }, condition: { vitality: -20 }, progression: { experience: 5 }, learn: "Living starter" },
    potatoHero: { attributes: { bonds: 2 }, condition: { vitality: -80 }, progression: { experience: 1 } }
  });
  assert.equal(state.characters.silkenTofu.attributes.skill, 5);
  assert.equal(state.characters.silkenTofu.level, 2);
  assert.equal(state.characters.silkenTofu.condition.sharedPortions, 1);
  assert.equal(state.characters.silkenTofu.learnedAbilities.at(-1), "Living starter");
  assert.equal(state.characters.potatoHero.attributes.bonds, 3);
  assert.equal(state.characters.potatoHero.condition.status, "depleted");
  assert.equal(state.characters.potatoHero.level, 1);
});

test("validates indexes against the selected chapter's data", () => {
  assert.equal(isValidState(atResult()), true);
  assert.equal(isValidState(atResult({ chapter: CHAPTERS.length })), false);
  assert.equal(isValidState(atResult({ dialogueIndex: CHAPTERS[0].dialogue.length })), false);
  assert.equal(isValidState(atResult({ activity: CHAPTERS[0].activities.length })), false);
  assert.equal(isValidState(atResult({ milestone: -1 })), false);
  assert.equal(isValidState(atResult({ activity: 0.5 })), false);
});

test("requires choices once their phases have occurred", () => {
  assert.equal(isValidState(atResult({ phase: "milestone", activity: null, milestone: null })), false);
  assert.equal(isValidState(atResult({ milestone: null })), false);
  assert.equal(isValidState(atResult({ phase: "activity", activity: 0, milestone: null })), false);
});

test("accepts ending flags only together on the final chapter", () => {
  const finalChapter = CHAPTERS.length - 1;
  assert.equal(isValidState(atResult({ chapter: finalChapter, phase: "ending", finished: true })), true);
  assert.equal(isValidState(atResult({ phase: "ending", finished: true })), false);
  assert.equal(isValidState(atResult({ chapter: finalChapter, phase: "ending", finished: false })), false);
  assert.equal(isValidState(atResult({ chapter: finalChapter, phase: "dialogue", activity: null, milestone: null, finished: true })), false);
});

test("rejects malformed or incomplete character records", () => {
  const mutations = [
    (state) => { delete state.characters.potatoHero; },
    (state) => { state.characters.silkenTofu.age = -1; },
    (state) => { state.characters.silkenTofu.age += 1; },
    (state) => { state.characters.silkenTofu.level = 99; },
    (state) => { state.characters.silkenTofu.attributes.joy = -1; },
    (state) => { state.characters.potatoHero.condition.vitality = 101; },
    (state) => { state.characters.potatoHero.condition.status = "invincible"; },
    (state) => { state.characters.potatoHero.condition.vitality = 20; },
    (state) => { state.characters.potatoHero.learnedAbilities.push(4); },
    (state) => { state.characters.potatoHero.progression.arcStage = 4; }
  ];
  for (const mutate of mutations) {
    const state = clone(atResult());
    mutate(state);
    assert.equal(isValidState(state), false);
  }
});

test("explicitly rejects version-1 and inconsistent saves", () => {
  const versionOne = { version: 1, stats: { joy: 2, skill: 3, bonds: 4 } };
  assert.equal(loadState(storageFor(versionOne)), null);

  const invalidStates = [
    atResult({ dialogueIndex: 99 }),
    atResult({ milestone: null }),
    atResult({ activity: -1 }),
    atResult({ milestone: 99 }),
    atResult({ phase: "ending", finished: true })
  ];
  for (const state of invalidStates) assert.equal(loadState(storageFor(state)), null);
});
