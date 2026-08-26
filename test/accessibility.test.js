import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appSource = await readFile(new URL("../js/app.js", import.meta.url), "utf8");

test("all screen replacement is centralized and focuses the screen heading", () => {
  const innerHtmlAssignments = appSource.match(/screen\.innerHTML\s*=/g) ?? [];

  assert.equal(innerHtmlAssignments.length, 1);
  assert.match(appSource, /screen\.querySelector\("h2\[tabindex='-1'\]"\)\?\.focus\(\)/);
});

test("title, chapter, and ending headings are programmatic focus targets", () => {
  const focusTargets = appSource.match(/<h2 tabindex="-1">/g) ?? [];

  assert.equal(focusTargets.length, 3);
});
