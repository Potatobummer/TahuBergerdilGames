import { CHAPTERS, CHARACTERS, getEnding } from "./game-data.js";
import { advanceCharacterProgression, applyEffects, clearState, createState, loadState, saveState } from "./state.js";

const screen = document.querySelector("#screen");
const toolbar = document.querySelector("#toolbar");
const saveButton = document.querySelector("#save-button");
const restartButton = document.querySelector("#restart-button");
const saveStatus = document.querySelector("#save-status");
let state = null;

function setScreen(markup) {
  screen.innerHTML = markup;
  screen.querySelector("h2[tabindex='-1']")?.focus();
}

function charactersMarkup() {
  return `<div class="character-panels" aria-label="Character status">${CHARACTERS.map((record) => {
    const character = state.characters[record.id];
    return `<section class="character-panel" aria-labelledby="${record.id}-name">
      <h3 id="${record.id}-name">${record.name}</h3>
      <p class="character-role">${record.role}</p>
      <p>Age ${character.age} · Level ${character.level} · <strong>${character.condition.status}</strong> (${character.condition.vitality}% vitality)</p>
      <ul class="stats" aria-label="${record.name} attributes">
        <li>Joy <strong>${character.attributes.joy}</strong></li>
        <li>Skill <strong>${character.attributes.skill}</strong></li>
        <li>Bonds <strong>${character.attributes.bonds}</strong></li>
      </ul>
      <p class="abilities"><strong>Abilities:</strong> ${character.learnedAbilities.join(", ")}</p>
      <p class="arc-note">${record.arc[character.progression.arcStage]}</p>
    </section>`;
  }).join("")}</div>`;
}

function choiceButton(choice, index, kind) {
  return `<button type="button" class="button" data-${kind}="${index}">
    <span class="choice-title">${choice.label}</span>
    ${choice.detail ? `<span class="choice-detail">${choice.detail}</span>` : ""}
  </button>`;
}

function renderTitle() {
  toolbar.hidden = true;
  const saved = loadState();
  setScreen(`<h2 tabindex="-1">What will you make of a lifetime?</h2>
    <p class="lede">Guide Silken Tofu and Bergie through five chapters of nourishment, sacrifice, boundaries, and renewal. Their choices shape them separately, but neither leaves the other's side.</p>
    <div class="choices">
      <button type="button" class="button" id="start-button">Start a new story</button>
      ${saved ? '<button type="button" class="button button--quiet" id="load-button">Load progress</button>' : ""}
    </div>`);
  document.querySelector("#start-button").addEventListener("click", startGame);
  document.querySelector("#load-button")?.addEventListener("click", () => {
    state = loadState();
    render();
  });
}

function startGame() {
  state = createState();
  render();
}

function render() {
  toolbar.hidden = false;
  saveStatus.textContent = "";
  const chapter = CHAPTERS[state.chapter];
  const heading = `<p class="chapter-label">Chapter ${state.chapter + 1} of ${CHAPTERS.length}</p><h2 tabindex="-1">${chapter.title}</h2>`;

  if (state.phase === "dialogue") {
    setScreen(`${heading}<p class="lede">${chapter.dialogue[state.dialogueIndex]}</p>${charactersMarkup()}
      <button type="button" class="button" id="continue-button">Continue</button>`);
    document.querySelector("#continue-button").addEventListener("click", advanceDialogue);
  } else if (state.phase === "activity") {
    setScreen(`${heading}<p>Choose how the pair spends this chapter. Each friend responds in their own way.</p>${charactersMarkup()}
      <div class="choices">${chapter.activities.map((choice, index) => choiceButton(choice, index, "activity")).join("")}</div>`);
    screen.querySelectorAll("[data-activity]").forEach((button) => button.addEventListener("click", chooseActivity));
  } else if (state.phase === "milestone") {
    setScreen(`${heading}<p class="lede">${chapter.milestone}</p>${charactersMarkup()}
      <div class="choices">${chapter.choices.map((choice, index) => choiceButton(choice, index, "milestone")).join("")}</div>`);
    screen.querySelectorAll("[data-milestone]").forEach((button) => button.addEventListener("click", chooseMilestone));
  } else if (state.phase === "result") {
    const choice = chapter.choices[state.milestone];
    setScreen(`${heading}<p class="lede">${choice.result}</p>${charactersMarkup()}
      <button type="button" class="button" id="next-button">${state.chapter === CHAPTERS.length - 1 ? "See your ending" : "Next chapter"}</button>`);
    document.querySelector("#next-button").addEventListener("click", nextChapter);
  } else {
    renderEnding();
  }
}

function advanceDialogue() {
  const lastLine = CHAPTERS[state.chapter].dialogue.length - 1;
  if (state.dialogueIndex < lastLine) state.dialogueIndex += 1;
  else state.phase = "activity";
  render();
}

function chooseActivity(event) {
  const index = Number(event.currentTarget.dataset.activity);
  state.activity = index;
  applyEffects(state, CHAPTERS[state.chapter].activities[index].effects);
  state.phase = "milestone";
  render();
}

function chooseMilestone(event) {
  const index = Number(event.currentTarget.dataset.milestone);
  state.milestone = index;
  applyEffects(state, CHAPTERS[state.chapter].choices[index].effects);
  state.phase = "result";
  render();
}

function nextChapter() {
  if (state.chapter === CHAPTERS.length - 1) {
    state.finished = true;
    state.phase = "ending";
  } else {
    state.chapter += 1;
    advanceCharacterProgression(state, CHAPTERS[state.chapter]);
    state.phase = "dialogue";
    state.dialogueIndex = 0;
    state.activity = null;
    state.milestone = null;
  }
  render();
}

function renderEnding() {
  const ending = getEnding(state.characters);
  setScreen(`<p class="chapter-label">Silken Tofu &amp; Bergie · Their ending</p><h2 tabindex="-1">${ending.title}</h2>
    <p class="lede">${ending.text}</p>${charactersMarkup()}
    <button type="button" class="button" id="again-button">Play another life</button>`);
  document.querySelector("#again-button").addEventListener("click", restart);
}

function restart() {
  clearState();
  state = null;
  renderTitle();
}

saveButton.addEventListener("click", () => {
  saveState(state);
  saveStatus.textContent = "Saved on this device.";
});

restartButton.addEventListener("click", restart);
renderTitle();
