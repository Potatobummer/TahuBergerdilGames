import { CHAPTERS, getEnding } from "./game-data.js";
import { applyEffects, clearState, createState, loadState, saveState } from "./state.js";

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

function statsMarkup() {
  return `<ul class="stats" aria-label="Your qualities">
    <li>Joy <strong>${state.stats.joy}</strong></li>
    <li>Skill <strong>${state.stats.skill}</strong></li>
    <li>Bonds <strong>${state.stats.bonds}</strong></li>
  </ul>`;
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
    <p class="lede">Grow from an eager seven-year-old into the keeper of a beloved family recipe. Seven chapters and the choices inside them shape who you become.</p>
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
  const heading = `<p class="chapter-label">Chapter ${state.chapter + 1} of ${CHAPTERS.length} · Age ${chapter.age}</p><h2 tabindex="-1">${chapter.title}</h2>`;

  if (state.phase === "dialogue") {
    setScreen(`${heading}<p class="lede">${chapter.dialogue[state.dialogueIndex]}</p>${statsMarkup()}
      <button type="button" class="button" id="continue-button">Continue</button>`);
    document.querySelector("#continue-button").addEventListener("click", advanceDialogue);
  } else if (state.phase === "activity") {
    setScreen(`${heading}<p>Choose how to spend this chapter. You may select one activity.</p>${statsMarkup()}
      <div class="choices">${chapter.activities.map((choice, index) => choiceButton(choice, index, "activity")).join("")}</div>`);
    screen.querySelectorAll("[data-activity]").forEach((button) => button.addEventListener("click", chooseActivity));
  } else if (state.phase === "milestone") {
    setScreen(`${heading}<p class="lede">${chapter.milestone}</p>${statsMarkup()}
      <div class="choices">${chapter.choices.map((choice, index) => choiceButton(choice, index, "milestone")).join("")}</div>`);
    screen.querySelectorAll("[data-milestone]").forEach((button) => button.addEventListener("click", chooseMilestone));
  } else if (state.phase === "result") {
    const choice = chapter.choices[state.milestone];
    setScreen(`${heading}<p class="lede">${choice.result}</p>${statsMarkup()}
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
    state.phase = "dialogue";
    state.dialogueIndex = 0;
    state.activity = null;
    state.milestone = null;
  }
  render();
}

function renderEnding() {
  const ending = getEnding(state.stats);
  setScreen(`<p class="chapter-label">Age 21 · Your ending</p><h2 tabindex="-1">${ending.title}</h2>
    <p class="lede">${ending.text}</p>${statsMarkup()}
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
