import { ACTIVITIES, CHAPTERS, CHARACTERS, FUSION_REQUIREMENTS, SEASONS, getEnding } from "./game-data.js";
import {
  advanceSeason, applySeason, beginNextChapter, canAffordSchedule, chooseMilestone,
  clearState, createState, loadState, saveState
} from "./state.js";

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

function headingMarkup(chapter) {
  return `<div class="chapter-heading">
    <p class="chapter-label">Chapter ${state.chapter + 1} of ${CHAPTERS.length}</p>
    <h2 tabindex="-1">${chapter.title}</h2>
  </div>`;
}

function chapterArtMarkup(chapter, { compact = false } = {}) {
  return `<figure class="chapter-art ${compact ? "chapter-art--compact" : ""}">
    <img src="assets/images/${chapter.art}" alt="" width="1200" height="800">
  </figure>`;
}

function resourcesMarkup() {
  return `<aside class="resources" aria-label="Household resources">
    <span><b>🪙 ${state.resources.coins}</b> coins</span>
    <span><b>✦ ${state.resources.reputation}</b> reputation</span>
    <span><b>♥ ${state.resources.relationship}</b> partnership</span>
  </aside>`;
}

function seasonsMarkup() {
  return `<ol class="season-track" aria-label="Chapter seasons">${SEASONS.map((season, index) =>
    `<li class="${index < state.season || (index === state.season && state.phase === "seasonResult") ? "complete" : ""} ${index === state.season ? "current" : ""}">
      <span>${index + 1}</span>${season}
    </li>`).join("")}</ol>`;
}

function charactersMarkup({ compact = false } = {}) {
  return `<div class="character-panels ${compact ? "character-panels--compact" : ""}" aria-label="Character status">${CHARACTERS.map((record) => {
    const character = state.characters[record.id];
    return `<section class="character-panel" data-character="${record.id}" aria-labelledby="${record.id}-name">
      <img class="portrait" src="assets/images/${record.id}.webp" alt="" width="160" height="160">
      <div class="character-copy">
        <h3 id="${record.id}-name">${record.name}</h3>
        <p class="character-role">${record.role}</p>
        <p>Age ${character.age} · Level ${character.level} · <strong>${character.condition.status}</strong></p>
        <label class="vitality-label">Vitality <span>${character.condition.vitality}%</span>
          <progress max="100" value="${character.condition.vitality}">${character.condition.vitality}%</progress>
        </label>
        <ul class="stats" aria-label="${record.name} attributes">
          <li>Joy <strong>${character.attributes.joy}</strong></li>
          <li>Skill <strong>${character.attributes.skill}</strong></li>
          <li>Bonds <strong>${character.attributes.bonds}</strong></li>
        </ul>
        ${compact ? "" : `<p class="abilities"><strong>Abilities:</strong> ${character.learnedAbilities.join(", ")}</p>`}
      </div>
    </section>`;
  }).join("")}</div>`;
}

function renderTitle() {
  document.body.classList.remove("playing");
  toolbar.hidden = true;
  const saved = loadState();
  setScreen(`<div class="title-layout">
    <div class="title-art" role="img" aria-label="Silken Tofu and Bergie discover Grandma's unfinished recipe during a storm"></div>
    <div class="title-copy">
      <p class="chapter-label">A cooperative raising story</p>
      <h2 tabindex="-1">What will you make of a lifetime?</h2>
      <p class="lede">Raise Silken Tofu and Bergie across twenty seasons. Help them master their own signature dishes—or earn the trust and skill to complete Grandma's legendary Tofu Bergerdil.</p>
      <div class="choices">
        <button type="button" class="button" id="start-button">Begin a new life</button>
        ${saved ? '<button type="button" class="button button--quiet" id="load-button">Continue saved life</button>' : ""}
      </div>
    </div>
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
  document.body.classList.add("playing");
  toolbar.hidden = false;
  saveStatus.className = "save-indicator";
  saveStatus.textContent = navigator.onLine ? "Progress autosaves · Offline ready" : "Playing offline · Progress autosaves";
  const chapter = CHAPTERS[state.chapter];

  if (state.phase === "dialogue") renderDialogue(chapter);
  else if (state.phase === "planning") renderPlanning(chapter);
  else if (state.phase === "seasonResult") renderSeasonResult(chapter);
  else if (state.phase === "milestone") renderMilestone(chapter);
  else if (state.phase === "result") renderMilestoneResult(chapter);
  else renderEnding();
}

function renderDialogue(chapter) {
  setScreen(`${headingMarkup(chapter)}${resourcesMarkup()}
    ${chapterArtMarkup(chapter)}
    <div class="story-scene"><p class="lede">${chapter.dialogue[state.dialogueIndex]}</p></div>
    ${charactersMarkup({ compact: true })}
    <button type="button" class="button" id="continue-button">Continue</button>`);
  document.querySelector("#continue-button").addEventListener("click", () => {
    if (state.dialogueIndex < chapter.dialogue.length - 1) state.dialogueIndex += 1;
    else state.phase = "planning";
    render();
  });
}

function renderPlanning(chapter) {
  const previousSchedule = [...state.history].reverse().find((entry) => entry.schedule)?.schedule;
  setScreen(`${headingMarkup(chapter)}${resourcesMarkup()}${seasonsMarkup()}
    ${state.chapter === CHAPTERS.length - 1 ? fusionReadinessMarkup() : ""}
    <div class="planning-intro">
      <p class="chapter-label">${SEASONS[state.season]}</p>
      <p>Choose one activity for each friend. Matching plans strengthen their partnership; separate plans can develop them in different ways.</p>
    </div>
    <form id="schedule-form">
      ${previousSchedule ? '<button type="button" class="button button--quiet repeat-button" id="repeat-schedule">Repeat last schedule</button>' : ""}
      <div class="schedule-grid">${CHARACTERS.map(scheduleCard).join("")}</div>
      <p class="form-error" id="schedule-error" role="alert"></p>
      <div class="planning-actions">
        <p class="schedule-preview" id="schedule-preview" aria-live="polite"></p>
        <button type="submit" class="button">Begin ${SEASONS[state.season]}</button>
      </div>
    </form>`);
  const form = document.querySelector("#schedule-form");
  form.addEventListener("submit", submitSchedule);
  form.addEventListener("change", updateSchedulePreview);
  document.querySelector("#repeat-schedule")?.addEventListener("click", () => {
    for (const [id, activity] of Object.entries(previousSchedule)) {
      const input = form.querySelector(`input[name="${id}"][value="${activity}"]:not(:disabled)`);
      if (input) input.checked = true;
    }
    updateSchedulePreview();
  });
  updateSchedulePreview();
}

function activityImpact(activity) {
  const labels = { joy: "Joy", skill: "Skill", bonds: "Bonds" };
  const impacts = Object.entries(activity.effects.attributes || {}).filter(([, value]) => value)
    .map(([key, value]) => `${labels[key]} ${signed(value)}`);
  if (activity.effects.condition?.vitality) impacts.push(`Vitality ${signed(activity.effects.condition.vitality)}`);
  for (const [key, value] of Object.entries(activity.resources || {}).filter(([, amount]) => amount)) {
    impacts.push(`${key[0].toUpperCase() + key.slice(1)} ${signed(value)}`);
  }
  return impacts.map((impact) => `<em>${impact}</em>`).join("");
}

function scheduleCard(record) {
  const character = state.characters[record.id];
  return `<fieldset class="schedule-card" data-character="${record.id}">
    <legend>${record.name}</legend>
    <img class="schedule-portrait" src="assets/images/${record.id}.webp" alt="" width="72" height="72">
    <p class="schedule-status">${character.condition.vitality}% vitality · ${record.id === "silkenTofu" ? "Gifted at community care" : "Gifted in the garden"}</p>
    <div class="activity-list">${ACTIVITIES.map((activity, index) => {
      const forceRest = character.condition.vitality <= 15;
      const needsRest = forceRest && activity.id !== "rest";
      const checked = (forceRest && activity.id === "rest") || (!forceRest && index === 0);
      return `<label class="activity-option ${needsRest ? "disabled" : ""}">
        <input type="radio" name="${record.id}" value="${activity.id}" ${checked ? "checked" : ""} ${needsRest ? "disabled" : ""}>
        <span class="activity-icon" aria-hidden="true">${activity.icon}</span>
        <span><b>${activity.label}</b><small>${activity.detail}</small><span class="activity-impact">${activityImpact(activity)}</span></span>
      </label>`;
    }).join("")}</div>
  </fieldset>`;
}

function fusionReadinessMarkup() {
  const combinedSkill = state.characters.silkenTofu.attributes.skill + state.characters.potatoHero.attributes.skill;
  const averageVitality = Math.round((state.characters.silkenTofu.condition.vitality + state.characters.potatoHero.condition.vitality) / 2);
  const checks = [
    ["Partnership", state.resources.relationship, FUSION_REQUIREMENTS.relationship],
    ["Reputation", state.resources.reputation, FUSION_REQUIREMENTS.reputation],
    ["Combined Skill", combinedSkill, FUSION_REQUIREMENTS.combinedSkill],
    ["Average vitality", averageVitality, FUSION_REQUIREMENTS.averageVitality]
  ];
  return `<aside class="fusion-readiness" aria-label="True ending readiness">
    <div><p class="chapter-label">Tofu Bergerdil readiness</p><p>All four seals are needed for the true fusion.</p></div>
    <ul>${checks.map(([label, value, target]) => `<li class="${value >= target ? "ready" : ""}"><span aria-hidden="true">${value >= target ? "✓" : "◇"}</span> ${label} <b>${value}/${target}</b></li>`).join("")}</ul>
  </aside>`;
}

function updateSchedulePreview() {
  const form = document.querySelector("#schedule-form");
  const preview = document.querySelector("#schedule-preview");
  if (!form || !preview) return;
  const data = new FormData(form);
  const selected = CHARACTERS.map(({ id }) => ACTIVITIES.find((activity) => activity.id === data.get(id)));
  if (selected.some((activity) => !activity)) {
    preview.textContent = "Choose one activity for each friend.";
    return;
  }
  const coinChange = selected.reduce((sum, activity) => sum + (activity.resources.coins || 0), 0);
  const afterCoins = state.resources.coins + coinChange;
  const together = selected[0].id === selected[1].id;
  preview.classList.toggle("is-unaffordable", afterCoins < 0);
  preview.innerHTML = `<strong>${selected.map((activity) => activity.label).join(" + ")}</strong><br>Coins ${signed(coinChange)} → ${afterCoins}${together ? " · Partnership bonus" : ""}${afterCoins < 0 ? " · Choose a cheaper plan" : ""}`;
}

function submitSchedule(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const schedule = Object.fromEntries(CHARACTERS.map(({ id }) => [id, data.get(id)]));
  const error = document.querySelector("#schedule-error");
  if (!schedule.silkenTofu || !schedule.potatoHero) {
    error.textContent = "Choose an activity for both friends.";
    return;
  }
  if (!canAffordSchedule(state, schedule)) {
    error.textContent = "That plan costs more coins than the household has. Choose work, gardening, play, or rest for one friend.";
    return;
  }
  try {
    applySeason(state, schedule);
    autosave("Season complete · Progress saved");
    render();
  } catch (problem) {
    error.textContent = problem.message;
  }
}

function signed(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function changesMarkup(result) {
  const resourceLabels = { coins: "Coins", reputation: "Reputation", relationship: "Partnership" };
  return `<div class="season-changes">
    <ul>${Object.entries(result.changes.resources).filter(([, value]) => value).map(([key, value]) =>
      `<li class="${value > 0 ? "gain" : "loss"}">${resourceLabels[key]} ${signed(value)}</li>`).join("") || "<li>No household change</li>"}</ul>
    ${CHARACTERS.map((record) => `<div><b>${record.name}</b><ul>${Object.entries(result.changes.characters[record.id]).filter(([, value]) => value).map(([key, value]) =>
      `<li class="${value > 0 ? "gain" : "loss"}">${key[0].toUpperCase() + key.slice(1)} ${signed(value)}</li>`).join("") || "<li>No stat change</li>"}</ul></div>`).join("")}
  </div>`;
}

function renderSeasonResult(chapter) {
  const result = state.lastSeason;
  setScreen(`${headingMarkup(chapter)}${resourcesMarkup()}${seasonsMarkup()}
    <p class="chapter-label">${result.name} complete</p>
    <div class="result-activities">${result.summaries.map((summary) =>
      `<p><span aria-hidden="true">${summary.icon}</span> <b>${summary.character}</b> chose ${summary.activity}.</p>`).join("")}</div>
    ${result.event ? `<article class="event-card"><p class="chapter-label">A seasonal event</p><h3>${result.event.title}</h3><p>${result.event.text}</p></article>` : ""}
    ${changesMarkup(result)}
    <button type="button" class="button" id="next-season-button">${state.season === SEASONS.length - 1 ? "Face the chapter milestone" : "Plan the next season"}</button>`);
  document.querySelector("#next-season-button").addEventListener("click", () => {
    advanceSeason(state);
    render();
  });
}

function renderMilestone(chapter) {
  setScreen(`${headingMarkup(chapter)}${resourcesMarkup()}
    ${chapterArtMarkup(chapter, { compact: true })}
    ${state.chapter === CHAPTERS.length - 1 ? fusionReadinessMarkup() : ""}
    <div class="milestone-banner"><p class="chapter-label">Year-end milestone</p><p class="lede">${chapter.milestone}</p></div>
    ${charactersMarkup()}
    <div class="choices">${chapter.choices.map((choice, index) => `<button type="button" class="button choice-button" data-milestone="${index}">
      <span>${choice.label}</span><small>${choice.hint || "The consequences will carry into future seasons."}</small>
    </button>`).join("")}</div>`);
  screen.querySelectorAll("[data-milestone]").forEach((button) => button.addEventListener("click", (event) => {
    chooseMilestone(state, Number(event.currentTarget.dataset.milestone));
    autosave("Milestone chosen · Progress saved");
    render();
  }));
}

function renderMilestoneResult(chapter) {
  const choice = chapter.choices[state.milestone];
  setScreen(`${headingMarkup(chapter)}${resourcesMarkup()}
    <article class="event-card event-card--major"><p class="chapter-label">Your choice reshapes their life</p><p class="lede">${choice.result}</p></article>
    ${charactersMarkup()}
    <button type="button" class="button" id="next-chapter-button">${state.chapter === CHAPTERS.length - 1 ? "See the lives they made" : "Begin the next chapter"}</button>`);
  document.querySelector("#next-chapter-button").addEventListener("click", () => {
    beginNextChapter(state);
    autosave("New chapter · Progress saved");
    render();
  });
}

function renderEnding() {
  const ending = getEnding(state);
  setScreen(`<div class="ending-layout" data-ending="${ending.id}">
    <p class="chapter-label">${ending.eyebrow}</p>
    <h2 tabindex="-1">${ending.title}</h2>
    <figure class="ending-art"><span class="transformation-flare" aria-hidden="true"></span><img src="assets/images/${ending.art}" alt="" width="1200" height="800"></figure>
    <p class="lede">${ending.text}</p>
    ${resourcesMarkup()}
    <p class="ending-recap">A life shaped over ${state.history.length} seasons · Silken level ${state.characters.silkenTofu.level} · Bergie level ${state.characters.potatoHero.level}</p>
    <button type="button" class="button" id="again-button">Raise another life</button>
  </div>`);
  document.querySelector("#again-button").addEventListener("click", restart);
}

function restart() {
  clearState();
  state = null;
  renderTitle();
}

function autosave(message) {
  saveState(state);
  saveStatus.className = "save-indicator";
  saveStatus.textContent = message;
}

saveButton.addEventListener("click", () => {
  saveState(state);
  saveStatus.className = "save-indicator";
  saveStatus.textContent = "Life saved on this device.";
});
restartButton.addEventListener("click", restart);
renderTitle();
