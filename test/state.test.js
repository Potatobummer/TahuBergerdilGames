import assert from "node:assert/strict";
import test from "node:test";

import { clearState, loadState, saveState, STORAGE_KEY } from "../js/state.js";

function storage(overrides = {}) {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    ...overrides,
  };
}

test("state can be saved, loaded, and cleared", () => {
  let value = null;
  globalThis.localStorage = storage({
    getItem: (key) => (key === STORAGE_KEY ? value : null),
    setItem: (key, nextValue) => {
      assert.equal(key, STORAGE_KEY);
      value = nextValue;
    },
    removeItem: () => {
      value = null;
    },
  });

  assert.deepEqual(saveState({ scene: 2 }), { ok: true });
  assert.deepEqual(loadState(), { scene: 2 });
  assert.deepEqual(clearState(), { ok: true });
  assert.equal(loadState(), null);
});

test("storage exceptions are converted to safe results", () => {
  const unavailable = new Error("storage unavailable");
  globalThis.localStorage = storage({
    getItem: () => {
      throw unavailable;
    },
    setItem: () => {
      throw unavailable;
    },
    removeItem: () => {
      throw unavailable;
    },
  });

  assert.deepEqual(saveState({ scene: 2 }), { ok: false, error: unavailable });
  assert.equal(loadState(), null);
  assert.deepEqual(clearState(), { ok: false, error: unavailable });
});

test("invalid saved JSON is treated as no save", () => {
  globalThis.localStorage = storage({ getItem: () => "not json" });
  assert.equal(loadState(), null);
});
