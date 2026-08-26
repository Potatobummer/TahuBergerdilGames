import test from "node:test";
import assert from "node:assert/strict";

import { CHAPTERS } from "../js/game-data.js";
import { createState, isValidState, loadState, SAVE_KEY } from "../js/state.js";

function atResult(overrides = {}) {
  return {
    ...createState(),
    dialogueIndex: CHAPTERS[0].dialogue.length - 1,
    phase: "result",
    activity: 0,
    milestone: 0,
    ...overrides
  };
}

function storageFor(state) {
  return { getItem: (key) => key === SAVE_KEY ? JSON.stringify(state) : null };
}

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
  assert.equal(isValidState(atResult({ chapter: finalChapter, phase: "dialogue", finished: true })), false);
  assert.equal(isValidState(atResult({ chapter: finalChapter, finished: true })), false);
});

test("loadState rejects every inconsistent save", () => {
  const invalidStates = [
    atResult({ dialogueIndex: 99 }),
    atResult({ milestone: null }),
    atResult({ activity: -1 }),
    atResult({ milestone: 99 }),
    atResult({ phase: "ending", finished: true }),
    atResult({ chapter: CHAPTERS.length - 1, phase: "dialogue", finished: true })
  ];

  for (const state of invalidStates) assert.equal(loadState(storageFor(state)), null);
});
