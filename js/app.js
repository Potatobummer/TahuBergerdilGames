import { clearState, saveState } from "./state.js";

export const SAVE_SUCCESS_MESSAGE = "Game saved.";
export const SAVE_UNAVAILABLE_MESSAGE = "Saving is unavailable in this browser";

/**
 * Save from a UI event and report what actually happened.
 *
 * Keeping this operation separate from DOM lookup also makes it usable by the
 * different story screens in the application.
 *
 * @param {unknown} state
 * @param {(message: string) => void} displayStatus
 * @returns {{ok: true} | {ok: false, error: unknown}}
 */
export function saveFromUi(state, displayStatus) {
  const result = saveState(state);
  displayStatus(result.ok ? SAVE_SUCCESS_MESSAGE : SAVE_UNAVAILABLE_MESSAGE);
  return result;
}

/**
 * Attach the save control to the current story-state provider.
 *
 * @param {EventTarget} saveButton
 * @param {() => unknown} getCurrentState
 * @param {(message: string) => void} displayStatus
 * @returns {() => void} removes the listener
 */
export function bindSaveListener(saveButton, getCurrentState, displayStatus) {
  const onSave = () => saveFromUi(getCurrentState(), displayStatus);
  saveButton.addEventListener("click", onSave);
  return () => saveButton.removeEventListener("click", onSave);
}

/**
 * Restart the story even if persistent storage is blocked by the browser.
 *
 * @param {() => void} showTitle
 * @returns {{ok: true} | {ok: false, error: unknown}} the clear result
 */
export function restart(showTitle) {
  const result = clearState();
  showTitle();
  return result;
}

/**
 * Attach a restart control. The title transition is deliberately independent
 * of whether deleting the stored save succeeds.
 *
 * @param {EventTarget} restartButton
 * @param {() => void} showTitle
 * @returns {() => void} removes the listener
 */
export function bindRestartListener(restartButton, showTitle) {
  const onRestart = () => restart(showTitle);
  restartButton.addEventListener("click", onRestart);
  return () => restartButton.removeEventListener("click", onRestart);
}
