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

/* All 90 daily quotes, extracted from the PDF planner source
   (planner-90day-preview.html + planner-90day-part2.html through part5b.html). */
const DAY_QUOTES = [
  "She believed she could, so she did. Also, she had an iced coffee.",
  "Day 2. You came back. That's already more than most people ever do.",
  "Three days in. Your brain is already starting to rewire. Keep going.",
  "Consistency isn't a feeling — it's a decision you make before the alarm goes off.",
  "Five days. You're officially more consistent than your past self. That version of you is impressed.",
  "Day 6. One more sleep and you'll have your first complete week. You're doing the thing.",
  "Day 7. Last day of Week 1. She showed up all week — obviously fuelled by iced coffee.",
  "Day 8. Week 2 starts now. You already proved you can do this.",
  "Building something real takes time. You're in the building phase right now.",
  "Ten days. Double digits. This is starting to feel like yours.",
  "The person you're becoming doesn't have an off switch. Keep going.",
  "Not every day feels like a win. Show up anyway — that's what this is about.",
  "Thirteen days in. Your routines are starting to feel automatic. That's the science working.",
  "Day 14. Two full weeks. You've officially proved you can do this.",
  "Week 3. You're not the same person who started this. Keep becoming her.",
  "The habits that were hard are becoming second nature. That's the whole point.",
  "Halfway through Week 3. You've made it further than most people ever will.",
  "Consistency compounds. Every day you show up multiplies everything that came before it.",
  "Almost three weeks done. Some days are harder than others. That's the point of this challenge.",
  "Day 20. One more sleep and you hit a big milestone. Look how close you are.",
  "Day 21. Three weeks. Science says this is when habits start forming. You're there.",
  "Day 22. You've done this for three full weeks. It's not a phase anymore.",
  "Momentum builds quietly. You won't notice it until you look back and see how far you've come.",
  "Day 24. Almost a month in. Your future self will thank you for every single day you showed up.",
  "You're past the point where most people stop. That's your real advantage now.",
  "Day 26. Four days from a full month. You are so close — don't lose it now.",
  "What you build in private shows up in public. Every quiet day of showing up counts.",
  "Day 28. Four complete weeks. You've already proved something to yourself.",
  "One more day. That's all it ever takes. And tomorrow you get to do it again.",
  "Day 30. A full month. Stop and actually feel how far you've come. You earned this.",
  "Month 2 starts now. You showed up for 30 days. Do it again — and watch what compounds.",
  "The second month always feels different. You know what you're doing now. Trust it.",
  "Progress isn't always visible. It's happening beneath the surface — trust the process.",
  "Halfway through Week 5. Still here. Still showing up. That's the whole story.",
  "Day 35. Five complete weeks. This is who you are now. Own it.",
  "Day 36. The beginning of Month 2. You know what you're doing now — trust it.",
  "Every time you choose yourself, you grow a little stronger. Keep choosing.",
  "Day 38. You're not relying on motivation anymore. You're relying on discipline — and it's stronger.",
  "The habits you build now become the defaults you live by. Build them well.",
  "Day 40. Forty mornings of deciding to show up. That's not effort anymore — that's identity.",
  "Discipline is just consistency with a better name. You've been building both for six weeks.",
  "Day 42. Six complete weeks. You've outlasted the version of yourself that quit before.",
  "Day 43. Week 7. The halfway point is almost here. Don't slow down now.",
  "You're building a version of yourself your Day 1 self couldn't have imagined. Keep going.",
  "Day 45. Halfway. This is the exact moment most people stop. You are still here.",
  "Day 46. More days in than out. You started the second half stronger than you started the first.",
  "You didn't come this far to only come this far. Keep moving.",
  "The woman you are becoming is worth every hard morning.",
  "49 days of choosing yourself. That's not a streak — that's who you are now.",
  "Day 50. Past the halfway mark. The second half of this challenge belongs to you.",
  "Your future self is already grateful for the work you're doing today.",
  "52 days. You're in territory most people never enter. Own every step of it.",
  "Progress isn't always visible. But it's always happening. Keep trusting the process.",
  "Every routine you keep becomes part of who you are. You're building something permanent.",
  "The hard days are building the strongest version of you. Lean into them.",
  "Eight weeks. If you can sustain anything for 8 weeks, you can sustain it forever.",
  "Day 57. Nine weeks in. Your habits have become your defaults. You don't have to fight for them anymore.",
  "She didn't quit when it got hard. She got harder. That's you.",
  "The finish line is counting down. Tomorrow is Day 60. One day at a time.",
  "60 days. Two thirds done. Two months of keeping your word to yourself — that's extraordinary.",
  "The final third is where the real transformation cements itself. You're right in the middle of it.",
  "Less than a month left. You've built something real. Don't stop now.",
  "63 days of keeping your word to yourself. That's not a habit — that's character.",
  "The final stretch begins. Use everything you've built — you're ready.",
  "Day 65. 25 days left. You've already won the hard part — the middle. Now finish the last chapter.",
  "Research says 66 days to form a habit. You just crossed the threshold. These routines are permanent now.",
  "67 days. Your habits are automatic now. You don't have to fight yourself anymore — just keep going.",
  "Three weeks left. Each morning is a gift you give yourself. Open it.",
  "69 days in. The person you are today would genuinely inspire the person who started on Day 1.",
  "Day 70. Ten complete weeks. This is proof — solid, undeniable proof — of what you can do.",
  "You've made 71 decisions to show up. That's 71 times you chose yourself. Keep choosing.",
  "The finish line is close enough to feel. Don't look back now. Eyes forward.",
  "Day 73. Your consistency at this point is extraordinary. Most people never make it here.",
  "Run your own race. The only person you're competing with is yesterday's version of you.",
  "Day 75. Just 15 more. You've built something most people only dream about. Finish it.",
  "You're not the same person who started this. You're better — and you know it.",
  "Day 77. The final two weeks. Everything from here is bonus momentum. Finish strong.",
  "Less than two weeks left. Your routines are yours now. Nothing can take them away.",
  "Picture who you are on Day 90. She's almost here. Just keep doing what you've been doing.",
  "80 days in. You've outlasted every doubt that said you couldn't do this. 10 more.",
  "Nine days left. Your habits are now your default. You are not fighting them anymore — just living them.",
  "Day 82. Eight more mornings. You are this close. Make each one count.",
  "You've earned this finish line. Don't slow down in the last 100 metres.",
  "Day 84. Week 12 complete. One final week stands between you and finishing something extraordinary.",
  "One week left. Seven mornings to close out something extraordinary. Start them right.",
  "Day 86. You've been doing this longer than most people ever try. Four days left.",
  "The last few days are where you cement who you've become. Show up like you know who you are now.",
  "Day 88. Two days left. The finish line is right there. Take it.",
  "Tomorrow is Day 90. You made it to the last day. One more morning — then it's yours forever.",
  "90 days. Not sometimes, not almost — you actually did it. Every single day counts. This is who you are now."
];

function buildDays() {
  const days = [];
  for (let d = 1; d <= 90; d++) {
    const week = Math.min(13, Math.ceil(d / 7));
    const quote = DAY_QUOTES[d - 1];
    const celebration = CELEBRATION_DAYS.includes(d) ? { week, headline: WEEK_HEADLINES[week] } : null;
    days.push({ day: d, week, quote, celebration });
  }
  return days;
}
const DAYS = buildDays();

/* ── STATE ────────────────────────────────────────────────────────── */
const STORAGE_KEY = "glowup90_state_v1";

function emptyPinSet() {
  return {
    task: Array(TASK_DEFAULTS.length + TASK_BLANK_COUNT).fill(false),
    health: Array(HEALTH_DEFAULTS.length + HEALTH_BLANK_COUNT).fill(false),
    detox: Array(DETOX_DEFAULTS.length + DETOX_BLANK_COUNT).fill(false),
    night: Array(NIGHT_DEFAULTS.length + NIGHT_BLANK_COUNT).fill(false)
  };
}
function emptyPinLabels() {
  return {
    task: Array(TASK_DEFAULTS.length + TASK_BLANK_COUNT).fill(""),
    health: Array(HEALTH_DEFAULTS.length + HEALTH_BLANK_COUNT).fill(""),
    detox: Array(DETOX_DEFAULTS.length + DETOX_BLANK_COUNT).fill(""),
    night: Array(NIGHT_DEFAULTS.length + NIGHT_BLANK_COUNT).fill("")
  };
}
function defaultState() {
  return { currentDay: 1, days: {}, graceDaysUsed: 0, pins: emptyPinSet(), pinnedLabels: emptyPinLabels() };
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const s = raw ? JSON.parse(raw) : defaultState();
    if (!s.pins) s.pins = emptyPinSet();
    if (!s.pinnedLabels) s.pinnedLabels = emptyPinLabels();
    return s;
  } catch (e) {
    return defaultState();
  }
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

function buildLabels(defaults, blankCount, kind) {
  const labels = [...defaults, ...Array(blankCount).fill("")];
  return labels.map((label, i) => (state.pins[kind][i] && state.pinnedLabels[kind][i] ? state.pinnedLabels[kind][i] : label));
}

function freshDayState() {
  return {
    nonNegText: "",
    nonNegDone: false,
    tasks: Array(TASK_DEFAULTS.length + TASK_BLANK_COUNT).fill(false),
    taskLabels: buildLabels(TASK_DEFAULTS, TASK_BLANK_COUNT, "task"),
    health: Array(HEALTH_DEFAULTS.length + HEALTH_BLANK_COUNT).fill(false),
    healthLabels: buildLabels(HEALTH_DEFAULTS, HEALTH_BLANK_COUNT, "health"),
    detox: Array(DETOX_DEFAULTS.length + DETOX_BLANK_COUNT).fill(false),
    detoxLabels: buildLabels(DETOX_DEFAULTS, DETOX_BLANK_COUNT, "detox"),
    night: Array(NIGHT_DEFAULTS.length + NIGHT_BLANK_COUNT).fill(false),
    nightLabels: buildLabels(NIGHT_DEFAULTS, NIGHT_BLANK_COUNT, "night"),
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
let viewingDay = state.currentDay;

function goPrevDay() {
  viewingDay = Math.max(1, viewingDay - 1);
  renderToday();
}
function goNextDay() {
  viewingDay = Math.min(state.currentDay, viewingDay + 1);
  renderToday();
}
function jumpToToday() {
  viewingDay = state.currentDay;
  renderToday(true);
}

function nudgeHonesty() {
  const el = document.querySelector(".honesty-options");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}
function nudgeNonNeg() {
  const el = document.querySelector(".non-neg");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}

function finishDay(useGrace) {
  const d = state.currentDay;
  const ds = getDayState(d);

  if (!useGrace && !ds.nonNegText.trim()) {
    nudgeNonNeg();
    return;
  }
  if (!useGrace && !ds.honesty) {
    nudgeHonesty();
    return;
  }

  const dayInfo = DAYS[d - 1];
  const finishedQuote = dayInfo.quote;

  if (useGrace) {
    if (state.graceDaysUsed >= 3) return;
    ds.status = "grace";
    state.graceDaysUsed++;
  } else {
    ds.status = "done";
  }
  if (d < 90) state.currentDay = d + 1;
  saveState();

  if (dayInfo.celebration) {
    haptic([20, 40, 20, 40, 30]);
    showTransition({
      emoji: "🎉",
      eyebrow: `Week ${dayInfo.celebration.week} Complete`,
      headline: dayInfo.celebration.headline,
      sub: "You did it — a full week of showing up. That's the whole game."
    });
    setTimeout(fireConfetti, 150);
  } else if (useGrace) {
    haptic(20);
    const left = 3 - state.graceDaysUsed;
    showTransition({
      emoji: "🕊️",
      eyebrow: "Grace Day Used",
      headline: "That's what it's for.",
      sub: `${left} grace day${left === 1 ? "" : "s"} left. See you tomorrow.`
    });
  } else {
    haptic(20);
    showTransition({
      emoji: "✓",
      eyebrow: `Day ${d} Complete`,
      headline: finishedQuote,
      sub: d < 90 ? "One more day closer. See you tomorrow." : "You did all 90. Incredible."
    });
  }
}

function showTransition({ emoji, eyebrow, headline, sub }) {
  document.getElementById("transition-emoji").textContent = emoji;
  document.getElementById("transition-eyebrow").textContent = eyebrow;
  document.getElementById("transition-headline").textContent = headline;
  document.getElementById("transition-sub").textContent = sub;
  document.getElementById("transition-overlay").classList.remove("hidden");
}

/* ── FEEL: HAPTICS + CONFETTI ─────────────────────────────────────── */
function haptic(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function fireConfetti() {
  const card = document.querySelector(".celebration-card");
  if (!card) return;
  const colors = ["#F2B8B8", "#E89898", "#C5D9C0", "#DFD0C0", "#6FA377"];
  for (let i = 0; i < 16; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = 50 + (Math.random() * 70 - 35) + "%";
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--dx", Math.round(Math.random() * 180 - 90) + "px");
    piece.style.setProperty("--rot", Math.round(Math.random() * 360) + "deg");
    piece.style.animationDelay = (Math.random() * 0.15).toFixed(2) + "s";
    card.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

/* ── RENDER: TODAY VIEW ───────────────────────────────────────────── */
function renderToday(fade) {
  const d = viewingDay;
  const isToday = d === state.currentDay;
  const dayInfo = DAYS[d - 1];
  const ds = getDayState(d);
  const score = dayScore(d);

  const pinBtn = (kind, i) =>
    `<button class="pin-btn ${state.pins[kind][i] ? "pinned" : ""}" data-pin="${kind}" data-index="${i}" title="Pin: keep this line every day"></button>`;

  const taskRows = ds.taskLabels
    .map(
      (label, i) => `
    <div class="task-row">
      <input type="checkbox" data-check="task" data-index="${i}" ${ds.tasks[i] ? "checked" : ""}>
      <input type="text" data-label="task" data-index="${i}" value="${escapeAttr(label)}" placeholder="Add a task...">
      ${pinBtn("task", i)}
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
      ${pinBtn(kind, i)}
    </div>`
      )
      .join("");

  const doneMark = (checks, labels) => (sectionDone(checks, labels) ? '<span class="done-check">✓ done</span>' : "");

  const graceLeft = 3 - state.graceDaysUsed;
  const graceDisabled = graceLeft <= 0 || ds.status !== "today";
  const finishDisabled = ds.status !== "today";

  const viewingBanner = !isToday
    ? `<div class="viewing-banner">📖 Viewing Day ${d} <button data-action="jump-today">Jump to Today →</button></div>`
    : "";

  const completedPct = Math.round(((state.currentDay - 1) / 90) * 100);

  const actionRow = isToday
    ? `
    <div class="action-row">
      <button class="btn btn-secondary" data-action="grace" ${graceDisabled ? "disabled" : ""}>
        Use a Grace Day<span class="grace-count">${graceLeft} left</span>
      </button>
      <button class="btn btn-primary" data-action="finish" ${finishDisabled ? "disabled" : ""}>
        ${ds.status === "today" ? "Finish Day →" : d < 90 ? "Day Complete ✓" : "Challenge Complete 🎉"}
      </button>
    </div>`
    : "";

  document.getElementById("today-content").innerHTML = `
    <div class="day-header">
      <div class="day-nav">
        <button class="day-nav-arrow" data-nav="prev" ${d <= 1 ? "disabled" : ""}>‹</button>
        <div class="day-num-wrap">
          <div class="day-num">${String(d).padStart(2, "0")}</div>
          <div class="day-total">/ 90 · Week ${dayInfo.week}</div>
        </div>
        <button class="day-nav-arrow" data-nav="next" ${d >= state.currentDay ? "disabled" : ""}>›</button>
      </div>
      <div class="rating-wrap">
        <div class="rating-badge">${ratingEmoji(score)}</div>
        <span class="rating-score">${score}/4</span>
      </div>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:${completedPct}%"></div></div>
    <div class="progress-label">${completedPct}% through your 90 days</div>
    ${viewingBanner}

    <div class="non-neg">
      <input type="checkbox" data-check="nonNeg" ${ds.nonNegDone ? "checked" : ""}>
      <div class="non-neg-body" style="flex:1">
        <h4>My non-negotiable for today ${isToday ? '<span class="required-mark">*required</span>' : ""}</h4>
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

    <p class="honesty-q">Did I do today what I told myself I would do? ${isToday ? '<span class="required-mark">*required</span>' : ""}</p>
    <div class="honesty-options">
      <button class="honesty-btn ${ds.honesty === "yes" ? "selected" : ""}" data-honesty="yes">Yes — I kept my word.</button>
      <button class="honesty-btn ${ds.honesty === "not-fully" ? "selected" : ""}" data-honesty="not-fully">Not fully — honestly.</button>
    </div>

    ${actionRow}
  `;

  if (fade) {
    const el = document.getElementById("today-content");
    el.classList.remove("fade-in");
    void el.offsetWidth;
    el.classList.add("fade-in");
  }
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
  if (view === "today") viewingDay = state.currentDay;
  document.querySelectorAll(".view").forEach((el) => el.classList.add("hidden"));
  document.getElementById(`view-${view}`).classList.remove("hidden");
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  render();
}

function render(fade) {
  renderHeader();
  if (activeView === "today") renderToday(fade);
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
    haptic(10);
    const ds = getDayState(viewingDay);
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

  const pinBtn = e.target.closest("[data-pin]");
  if (pinBtn) {
    haptic(10);
    const kind = pinBtn.dataset.pin;
    const i = Number(pinBtn.dataset.index);
    const ds = getDayState(viewingDay);
    const nowPinned = !state.pins[kind][i];
    state.pins[kind][i] = nowPinned;
    if (nowPinned) state.pinnedLabels[kind][i] = ds[kind + "Labels"][i];
    saveState();
    render();
    return;
  }

  const honestyBtn = e.target.closest("[data-honesty]");
  if (honestyBtn) {
    const ds = getDayState(viewingDay);
    ds.honesty = honestyBtn.dataset.honesty;
    saveState();
    renderToday();
    return;
  }

  const navBtn = e.target.closest("[data-nav]");
  if (navBtn && !navBtn.disabled) {
    if (navBtn.dataset.nav === "prev") goPrevDay();
    if (navBtn.dataset.nav === "next") goNextDay();
    return;
  }

  const jumpBtn = e.target.closest('[data-action="jump-today"]');
  if (jumpBtn) {
    jumpToToday();
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
    const ds = getDayState(viewingDay);
    const kind = labelInput.dataset.label;
    const i = Number(labelInput.dataset.index);
    ds[kind + "Labels"][i] = labelInput.value;
    if (state.pins[kind][i]) state.pinnedLabels[kind][i] = labelInput.value;
    saveState();
    return;
  }
  const field = e.target.closest("[data-field]");
  if (field) {
    const ds = getDayState(viewingDay);
    ds[field.dataset.field] = field.value;
    saveState();
    return;
  }
});

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});

document.getElementById("transition-close").addEventListener("click", () => {
  document.getElementById("transition-overlay").classList.add("hidden");
  viewingDay = state.currentDay;
  render(true);
});

document.getElementById("reset-progress").addEventListener("click", () => {
  const sure = confirm("This will erase all your progress and start over from Day 1. Are you sure?");
  if (!sure) return;
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  viewingDay = 1;
  switchView("today");
});

/* ── PWA: SERVICE WORKER ──────────────────────────────────────────── */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

/* ── INIT ─────────────────────────────────────────────────────────── */
switchView("today");
