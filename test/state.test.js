import test from "node:test";
import assert from "node:assert/strict";

import { CHAPTERS, CHARACTERS, SEASONS, getEnding } from "../js/game-data.js";
import {
  advanceSeason, applyEffects, applySeason, beginNextChapter, canAffordSchedule,
  chooseMilestone, createState, isValidState, loadState, SAVE_KEY, STATE_VERSION
} from "../js/state.js";

const balancedPlan = { silkenTofu: "community", potatoHero: "garden" };

function storageFor(state) {
  return { getItem: (key) => key === SAVE_KEY ? JSON.stringify(state) : null };
}

test("creates independent characters and household resources", () => {
  const state = createState();
  assert.equal(state.version, STATE_VERSION);
  assert.deepEqual(Object.keys(state.characters), CHARACTERS.map(({ id }) => id));
  assert.deepEqual(state.resources, { coins: 14, reputation: 0, relationship: 8 });
  assert.equal(state.season, 0);
  assert.deepEqual(state.history, []);
  state.characters.silkenTofu.attributes.joy += 1;
  assert.equal(state.characters.potatoHero.attributes.joy, CHARACTERS[1].attributes.joy);
});

test("applies one season to both characters and records its consequences", () => {
  const state = createState();
  state.phase = "planning";
  applySeason(state, balancedPlan);
  assert.equal(state.phase, "seasonResult");
  assert.equal(state.history.length, 1);
  assert.equal(state.lastSeason.name, SEASONS[0]);
  assert.equal(state.schedule.silkenTofu, "community");
  assert.ok(state.characters.silkenTofu.attributes.bonds > CHARACTERS[0].attributes.bonds);
  assert.ok(state.characters.potatoHero.attributes.skill > CHARACTERS[1].attributes.skill);
  assert.ok(state.resources.reputation > 0);
  assert.equal(isValidState(state), true);
});

test("matching schedules strengthen the partnership and trigger a conditional event once", () => {
  const state = createState();
  state.phase = "planning";
  const relationship = state.resources.relationship;
  applySeason(state, { silkenTofu: "study", potatoHero: "study" });
  assert.equal(state.lastSeason.event.title, "Two rhythms, one chopping board");
  assert.ok(state.resources.relationship >= relationship + 5);
  assert.deepEqual(state.seenEvents, ["kitchen-duet"]);
  advanceSeason(state);
  state.resources.coins += 10;
  applySeason(state, { silkenTofu: "study", potatoHero: "study" });
  assert.notEqual(state.lastSeason.event?.title, "Two rhythms, one chopping board");
});

test("rejects unaffordable schedules and requires rest when depleted", () => {
  const state = createState();
  state.resources.coins = 1;
  assert.equal(canAffordSchedule(state, { silkenTofu: "study", potatoHero: "study" }), false);
  state.resources.coins = 20;
  state.characters.silkenTofu.condition.vitality = 15;
  state.characters.silkenTofu.condition.status = "depleted";
  assert.throws(() => applySeason(state, balancedPlan), /needs to rest/);
  assert.doesNotThrow(() => applySeason(state, { silkenTofu: "rest", potatoHero: "garden" }));
});

test("moves from four seasonal turns to a milestone and the next chapter", () => {
  const state = createState();
  state.dialogueIndex = CHAPTERS[0].dialogue.length - 1;
  state.phase = "planning";
  for (let index = 0; index < SEASONS.length; index += 1) {
    applySeason(state, balancedPlan);
    advanceSeason(state);
  }
  assert.equal(state.phase, "milestone");
  chooseMilestone(state, 0);
  assert.equal(state.phase, "result");
  beginNextChapter(state);
  assert.equal(state.chapter, 1);
  assert.equal(state.season, 0);
  assert.equal(state.phase, "dialogue");
  assert.equal(state.characters.silkenTofu.age, CHARACTERS[0].startingAge + CHAPTERS[1].ageOffset);
});

test("applies direct progression effects and unlocks level abilities", () => {
  const state = createState();
  applyEffects(state, {
    silkenTofu: { attributes: { skill: 3 }, condition: { vitality: -20 }, progression: { experience: 5 } },
    potatoHero: { attributes: { bonds: 2 }, condition: { vitality: -80 }, progression: { experience: 1 } }
  });
  assert.equal(state.characters.silkenTofu.level, 2);
  assert.ok(state.characters.silkenTofu.learnedAbilities.includes("Crisp-edge timing"));
  assert.equal(state.characters.potatoHero.condition.status, "depleted");
});

test("produces the earned fusion ending", () => {
  const state = createState();
  state.resources.relationship = 30;
  state.resources.reputation = 40;
  state.characters.silkenTofu.attributes.skill = 15;
  state.characters.potatoHero.attributes.skill = 15;
  state.milestone = 0;
  const ending = getEnding(state);
  assert.equal(ending.id, "fusion");
  assert.equal(ending.title, "Tofu Bergerdil");
});

test("produces the separate agedashi and hashbrown ending when fusion is not earned", () => {
  const state = createState();
  state.milestone = 1;
  const ending = getEnding(state);
  assert.equal(ending.id, "separate");
  assert.match(ending.title, /Agedashi Silken/);
  assert.match(ending.title, /Hashbrown Bergie/);
});

test("validates version-four saves and rejects older or inconsistent data", () => {
  const state = createState();
  assert.equal(isValidState(state), true);
  assert.deepEqual(loadState(storageFor(state)), state);
  assert.equal(loadState(storageFor({ ...state, version: 2 })), null);
  assert.equal(loadState(storageFor({ ...state, season: 9 })), null);
  assert.equal(loadState(storageFor({ ...state, resources: { ...state.resources, relationship: 101 } })), null);
  assert.equal(loadState(storageFor({ ...state, phase: "result", milestone: null })), null);
});
