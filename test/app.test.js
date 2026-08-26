import assert from "node:assert/strict";
import test from "node:test";

import {
  restart,
  saveFromUi,
  SAVE_UNAVAILABLE_MESSAGE,
} from "../js/app.js";

test("save UI reports unavailable storage instead of success", () => {
  globalThis.localStorage = {
    setItem() {
      throw new Error("blocked");
    },
  };
  let message;

  const result = saveFromUi({ scene: 1 }, (nextMessage) => {
    message = nextMessage;
  });

  assert.equal(result.ok, false);
  assert.equal(message, SAVE_UNAVAILABLE_MESSAGE);
});

test("restart returns to the title when clearing storage fails", () => {
  globalThis.localStorage = {
    removeItem() {
      throw new Error("blocked");
    },
  };
  let titleShown = false;

  const result = restart(() => {
    titleShown = true;
  });

  assert.equal(result.ok, false);
  assert.equal(titleShown, true);
});
