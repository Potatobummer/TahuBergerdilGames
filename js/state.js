export const STORAGE_KEY = "tahu-bergerdil-games-state";

/**
 * Persist the current story state without exposing Web Storage errors to UI code.
 *
 * @param {unknown} state
 * @returns {{ok: true} | {ok: false, error: unknown}}
 */
export function saveState(state) {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

/**
 * Read a saved story. A missing, inaccessible, or malformed save is treated as
 * no save so starting the game never depends on storage being available.
 *
 * @returns {unknown | null}
 */
export function loadState() {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return null;
    }

    return JSON.parse(serializedState);
  } catch {
    return null;
  }
}

/**
 * Remove the saved story without exposing Web Storage errors to UI code.
 *
 * @returns {{ok: true} | {ok: false, error: unknown}}
 */
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}
