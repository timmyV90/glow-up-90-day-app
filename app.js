/* ── DEFAULTS (identical every day, ported from the PDF planner) ────── */
const TASK_DEFAULTS   = ["Wake up", "Shower", "Skincare routine", "Haircare routine", "Take morning medicines"];
const TASK_BLANK_COUNT = 11;

const HEALTH_DEFAULTS = ["Drink 3L water", "10k steps", "No junk food"];
const HEALTH_BLANK_COUNT = 3;

const DETOX_DEFAULTS  = ["Screen-free morning", "No mindless scrolling"];
const DETOX_BLANK_COUNT = 4;

const NIGHT_DEFAULTS  = ["Lay out tomorrow's clothes", "Prepare medicines", "Drink water before bed", "Read before sleep"];
const NIGHT_BLANK_COUNT = 2;

/* ── WEEK CELEBRATION HEADLINES (ported from the PDF's week-opener pages) ── */
const WEEK_HEADLINES = {
  1:  "The beginning of everything. Just start.",
  2:  "Day 8. You came back. That matters more than Day 1.",
  3:  "Halfway through the first month. Your body is already adapting.",
  4:  "You're building real momentum now. Don't stop.",
  5:  "Month 1 done. Look what you've built.",
  6:  "The middle is where most people quit. You're still here.",
  7:  "Halfway. You are not the same person who started.",
  8:  "Past halfway. The end is closer than the beginning.",
  9:  "60 days soon. Your habits are yours now.",
  10: "30 days left. This is your final push.",
  11: "You've done 70 days. That's extraordinary.",
  12: "15 days left. Finish what you started.",
  13: "The final week. Make it count. You've already won."
};

const CELEBRATION_DAYS = [7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84, 90];

/* Days 1-7: real quotes from the PDF source. Days 8-90: placeholder quotes,
   replaced with real per-day quotes in Phase B. */
const DAY_1_TO_7_QUOTES = [
  "She believed she could, so she did. Also, she had an iced coffee.",
  "Day 2. You came back. That's already more than most people ever do.",
  "Three days in. Your brain is already starting to rewire. Keep going.",
  "Consistency isn't a feeling — it's a decision you make before the alarm goes off.",
  "Five days. You're officially more consistent than your past self. That version of you is impressed.",
  "Day 6. One more sleep and you'll have your first complete week. You're doing the thing.",
  "Day 7. Last day of Week 1. She showed up all week — obviously fuelled by iced coffee."
];

function buildDays() {
  const days = [];
  for (let d = 1; d <= 90; d++) {
    const week = Math.min(13, Math.ceil(d / 7));
    const quote = d <= 7 ? DAY_1_TO_7_QUOTES[d - 1] : `Day ${d}. Keep showing up — that's the whole game.`;
    const celebration = CELEBRATION_DAYS.includes(d) ? { week, headline: WEEK_HEADLINES[week] } : null;
    days.push({ day: d, week, quote, celebration });
  }
  return days;
}
const DAYS = buildDays();

/* ── STATE ────────────────────────────────────────────────────────── */
const STORAGE_KEY = "glowup90_state_v1";

function defaultState() {
  return { currentDay: 1, days: {}, graceDaysUsed: 0 };
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultState();
  } catch (e) {
    return defaultState();
  }
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

function freshDayState() {
  return {
    nonNegText: "",
    nonNegDone: false,
    tasks: Array(TASK_DEFAULTS.length + TASK_BLANK_COUNT).fill(false),
    taskLabels: [...TASK_DEFAULTS, ...Array(TASK_BLANK_COUNT).fill("")],
    health: Array(HEALTH_DEFAULTS.length + HEALTH_BLANK_COUNT).fill(false),
    healthLabels: [...HEALTH_DEFAULTS, ...Array(HEALTH_BLANK_COUNT).fill("")],
    detox: Array(DETOX_DEFAULTS.length + DETOX_BLANK_COUNT).fill(false),
    detoxLabels: [...DETOX_DEFAULTS, ...Array(DETOX_BLANK_COUNT).fill("")],
    night: Array(NIGHT_DEFAULTS.length + NIGHT_BLANK_COUNT).fill(false),
    nightLabels: [...NIGHT_DEFAULTS, ...Array(NIGHT_BLANK_COUNT).fill("")],
    honesty: null,
    status: "today" // "today" | "done" | "grace"
  };
}
function getDayState(d) {
  if (!state.days[d]) state.days[d] = freshDayState();
  return state.days[d];
}

/* section is "done" when every non-empty-labeled item in it is checked;
   blank/unused slots never block completion */
function sectionDone(checks, labels) {
  return labels.every((label, i) => label.trim() === "" || checks[i]);
}
function dayScore(d) {
  const ds = getDayState(d);
  const flags = [
    ds.nonNegDone,
    sectionDone(ds.health, ds.healthLabels),
    sectionDone(ds.detox, ds.detoxLabels),
    sectionDone(ds.night, ds.nightLabels)
  ];
  return flags.filter(Boolean).length;
}
function ratingEmoji(score) {
  if (score >= 4) return "🏆";
  if (score >= 3) return "🔥";
  if (score >= 2) return "✅";
  return "❌";
}
function currentStreak() {
  let streak = 0;
  for (let d = state.currentDay - 1; d >= 1; d--) {
    const ds = state.days[d];
    if (ds && (ds.status === "done" || ds.status === "grace")) streak++;
    else break;
  }
  return streak;
}
function weekComplete(week) {
  const start = (week - 1) * 7 + 1;
  const end = Math.min(90, week * 7);
  for (let d = start; d <= end; d++) {
    const ds = state.days[d];
    if (!ds || (ds.status !== "done" && ds.status !== "grace")) return false;
  }
  return true;
}

/* ── ACTIONS ──────────────────────────────────────────────────────── */
function finishDay(useGrace) {
  const d = state.currentDay;
  const ds = getDayState(d);

  if (useGrace) {
    if (state.graceDaysUsed >= 3) return;
    ds.status = "grace";
    state.graceDaysUsed++;
  } else {
    ds.status = "done";
  }

  const dayInfo = DAYS[d - 1];
  if (d < 90) state.currentDay = d + 1;
  saveState();
  render();

  if (dayInfo.celebration) {
    showCelebration(dayInfo.celebration);
  } else {
    pulse();
  }
}

function pulse() {
  const card = document.querySelector(".day-header");
  if (!card) return;
  card.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.04)" }, { transform: "scale(1)" }],
    { duration: 320, easing: "ease-out" }
  );
}

function showCelebration(celebration) {
  document.getElementById("celebration-week").textContent = `Week ${celebration.week} Complete`;
  document.getElementById("celebration-headline").textContent = celebration.headline;
  document.getElementById("celebration-overlay").classList.remove("hidden");
}

/* ── RENDER: TODAY VIEW ───────────────────────────────────────────── */
function renderToday() {
  const d = state.currentDay;
  const dayInfo = DAYS[d - 1];
  const ds = getDayState(d);
  const score = dayScore(d);

  const taskRows = ds.taskLabels
    .map(
      (label, i) => `
    <div class="task-row">
      <input type="checkbox" data-check="task" data-index="${i}" ${ds.tasks[i] ? "checked" : ""}>
      <input type="text" data-label="task" data-index="${i}" value="${escapeAttr(label)}" placeholder="Add a task...">
    </div>`
    )
    .join("");

  const sectionRows = (checks, labels, kind) =>
    labels
      .map(
        (label, i) => `
    <div class="item-row">
      <input type="checkbox" data-check="${kind}" data-index="${i}" ${checks[i] ? "checked" : ""}>
      <input type="text" data-label="${kind}" data-index="${i}" value="${escapeAttr(label)}" placeholder="Add your own...">
    </div>`
      )
      .join("");

  const doneMark = (checks, labels) => (sectionDone(checks, labels) ? '<span class="done-check">✓ done</span>' : "");

  const graceLeft = 3 - state.graceDaysUsed;
  const graceDisabled = graceLeft <= 0 || ds.status !== "today";
  const finishDisabled = ds.status !== "today";

  document.getElementById("today-content").innerHTML = `
    <div class="day-header">
      <div>
        <div class="day-num">${String(d).padStart(2, "0")}</div>
        <div class="day-total">/ 90 · Week ${dayInfo.week}</div>
      </div>
      <div>
        <div class="rating-badge">${ratingEmoji(score)}</div>
        <span class="rating-score">${score}/4 today</span>
      </div>
    </div>

    <div class="non-neg">
      <input type="checkbox" data-check="nonNeg" ${ds.nonNegDone ? "checked" : ""}>
      <div class="non-neg-body" style="flex:1">
        <h4>My non-negotiable for today</h4>
        <input type="text" data-field="nonNegText" value="${escapeAttr(ds.nonNegText)}" placeholder="The ONE thing you'll absolutely do...">
      </div>
    </div>

    <div class="section-title"><span>✧</span> Today's Tasks</div>
    ${taskRows}

    <div class="section-title"><span>♡</span> Health ${doneMark(ds.health, ds.healthLabels)}</div>
    ${sectionRows(ds.health, ds.healthLabels, "health")}

    <div class="section-title"><span>✦</span> Digital Detox ${doneMark(ds.detox, ds.detoxLabels)}</div>
    ${sectionRows(ds.detox, ds.detoxLabels, "detox")}

    <div class="section-title"><span>♡</span> Night Routine ${doneMark(ds.night, ds.nightLabels)}</div>
    ${sectionRows(ds.night, ds.nightLabels, "night")}

    <div class="quote-zone">
      <p><span class="quote-marks">❝</span> ${escapeHtml(dayInfo.quote)} <span class="quote-marks">❞</span></p>
    </div>

    <p class="honesty-q">Did I do today what I told myself I would do?</p>
    <div class="honesty-options">
      <button class="honesty-btn ${ds.honesty === "yes" ? "selected" : ""}" data-honesty="yes">Yes — I kept my word.</button>
      <button class="honesty-btn ${ds.honesty === "not-fully" ? "selected" : ""}" data-honesty="not-fully">Not fully — honestly.</button>
    </div>

    <div class="action-row">
      <button class="btn btn-secondary" data-action="grace" ${graceDisabled ? "disabled" : ""}>
        Use a Grace Day<span class="grace-count">${graceLeft} left</span>
      </button>
      <button class="btn btn-primary" data-action="finish" ${finishDisabled ? "disabled" : ""}>
        ${ds.status === "today" ? "Finish Day →" : d < 90 ? "Day Complete ✓" : "Challenge Complete 🎉"}
      </button>
    </div>
  `;
}

/* ── RENDER: JOURNEY VIEW ─────────────────────────────────────────── */
function renderJourney() {
  const dots = DAYS.map((info) => {
    const ds = state.days[info.day];
    let cls = "dot";
    if (info.day === state.currentDay) cls += " current";
    else if (ds && ds.status === "done") cls += " done";
    else if (ds && ds.status === "grace") cls += " grace";
    if (info.celebration) cls += " celebration";
    return `<div class="${cls}">${info.day}</div>`;
  }).join("");

  const badges = Object.entries(WEEK_HEADLINES)
    .map(([week, headline]) => {
      const w = Number(week);
      const complete = weekComplete(w);
      return `
      <div class="badge-item ${complete ? "" : "badge-locked"}">
        <div class="badge-emoji">${complete ? "🏅" : "🔒"}</div>
        <div class="badge-text">
          <strong>Week ${w} Complete</strong>
          <span>${escapeHtml(headline)}</span>
        </div>
      </div>`;
    })
    .join("");

  document.getElementById("journey-content").innerHTML = `
    <div class="journey-intro">
      <h1>Your Journey</h1>
      <p>90 days. 13 weeks. A celebration at the end of every single one. Every circle is one day — watch yourself build something real.</p>
    </div>
    <div class="dot-grid">${dots}</div>
    <div class="badges-title">✧ Badges</div>
    ${badges}
  `;
}

/* ── RENDER: HEADER + TABS ────────────────────────────────────────── */
function renderHeader() {
  document.getElementById("streak-pill").textContent = `🔥 ${currentStreak()}`;
}

let activeView = "today";
function switchView(view) {
  activeView = view;
  document.querySelectorAll(".view").forEach((el) => el.classList.add("hidden"));
  document.getElementById(`view-${view}`).classList.remove("hidden");
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  render();
}

function render() {
  renderHeader();
  if (activeView === "today") renderToday();
  if (activeView === "journey") renderJourney();
}

/* ── HELPERS ──────────────────────────────────────────────────────── */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str) {
  return escapeHtml(str);
}

/* ── EVENT DELEGATION ─────────────────────────────────────────────── */
document.getElementById("main").addEventListener("click", (e) => {
  const check = e.target.closest("[data-check]");
  if (check) {
    const d = state.currentDay;
    const ds = getDayState(d);
    const kind = check.dataset.check;
    if (kind === "nonNeg") {
      ds.nonNegDone = check.checked;
    } else {
      const i = Number(check.dataset.index);
      ds[kind][i] = check.checked;
    }
    saveState();
    render();
    return;
  }

  const honestyBtn = e.target.closest("[data-honesty]");
  if (honestyBtn) {
    const ds = getDayState(state.currentDay);
    ds.honesty = honestyBtn.dataset.honesty;
    saveState();
    renderToday();
    return;
  }

  const actionBtn = e.target.closest("[data-action]");
  if (actionBtn && !actionBtn.disabled) {
    if (actionBtn.dataset.action === "finish") finishDay(false);
    if (actionBtn.dataset.action === "grace") finishDay(true);
    return;
  }
});

document.getElementById("main").addEventListener("input", (e) => {
  const labelInput = e.target.closest("[data-label]");
  if (labelInput) {
    const ds = getDayState(state.currentDay);
    const kind = labelInput.dataset.label;
    const i = Number(labelInput.dataset.index);
    ds[kind + "Labels"][i] = labelInput.value;
    saveState();
    return;
  }
  const field = e.target.closest("[data-field]");
  if (field) {
    const ds = getDayState(state.currentDay);
    ds[field.dataset.field] = field.value;
    saveState();
    return;
  }
});

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});

document.getElementById("celebration-close").addEventListener("click", () => {
  document.getElementById("celebration-overlay").classList.add("hidden");
});

/* ── PWA: SERVICE WORKER ──────────────────────────────────────────── */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

/* ── INIT ─────────────────────────────────────────────────────────── */
switchView("today");
