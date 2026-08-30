/* Vest Walk — weighted vest calculator, 8-week plan and walk log.
   Everything lives in one localStorage blob; the plan is derived on every render
   from profile + sessions (walks are counted, not calendar days). */

const STORAGE_KEY = "glowup90_vest_v1";
const KG_PER_LB = 0.45359237;

/* Load as % of bodyweight and minutes per walk, per plan week. Week 5 holds load on
   purpose; minutes drop whenever the load steps up (add minutes before weight). */
const PLAN = [
  { week: 1, pct: 5.0, minutes: 20, note: "Flat route, easy pace. Full sentences.", indoor: "Treadmill 0–1% incline or walking pad, same minutes." },
  { week: 2, pct: 5.0, minutes: 27, note: "Same load. One gentle hill is fine.", indoor: "Treadmill 1–2% incline for the middle 10 minutes." },
  { week: 3, pct: 6.5, minutes: 25, note: "Load up, minutes down. Keep it flat.", indoor: "Treadmill 1% incline or walking pad." },
  { week: 4, pct: 6.5, minutes: 30, note: "A few short hills on one walk.", indoor: "Treadmill 2–3% incline for 10 of the 30 minutes." },
  { week: 5, pct: 6.5, minutes: 33, note: "Hold week. Same load, a few more minutes. Change the route, not the weight.", indoor: "Treadmill 2% throughout, or walking pad plus 5 minutes of stairs.", hold: true },
  { week: 6, pct: 8.0, minutes: 30, note: "New load, flat routes. Re-tighten the straps before every walk.", indoor: "Treadmill 1% incline." },
  { week: 7, pct: 8.0, minutes: 35, note: "Hills welcome on one walk.", indoor: "Treadmill 2–3% incline for 15 of the 35 minutes." },
  { week: 8, pct: 10.0, minutes: 30, note: "Your week-8 number. Easy pace, flat. The third walk is the finish line.", indoor: "Treadmill 1% incline." },
];
const WALKS_PER_WEEK = 3;
const STEPS = [5.0, 6.5, 8.0, 10.0];   // the load ladder; "drop one step" moves down this list
const VEST_KG = [2, 3, 4, 5, 6, 8, 10, 12];
const VEST_LB = [4, 6, 8, 10, 12, 15, 20, 25];
const PAIN = ["neck", "shoulders", "back", "knees", "feet"];

/* ---------- state ---------- */
function defaultState() {
  return { profile: null, sessions: [], ui: { unit: "kg" } };
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) { /* corrupt or blocked storage: start clean */ }
  return defaultState();
}
function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ } }
let state = loadState();

/* ---------- maths ---------- */
function toKg(v, unit) { return unit === "lb" ? v * KG_PER_LB : v; }
function fmtLoad(kg, unit) {
  return unit === "lb" ? `${(kg / KG_PER_LB).toFixed(1)} lb` : `${kg.toFixed(1)} kg`;
}
function nearestVest(kg, unit) {
  const sizes = unit === "lb" ? VEST_LB : VEST_KG;
  const target = unit === "lb" ? kg / KG_PER_LB : kg;
  // round DOWN to the nearest size people can buy; never above the target
  let pick = sizes[0];
  for (const s of sizes) if (s <= target + 0.01) pick = s;
  return `${pick} ${unit}`;
}
function loadFor(pct) { return state.profile.bodyweightKg * pct / 100; }

/* Plan position is derived from the number of walks logged, not from dates:
   walk 12 ends week 4 whenever it happens. */
function planIndex() { return Math.min(Math.floor(state.sessions.length / WALKS_PER_WEEK), PLAN.length - 1); }
function planDone() { return state.sessions.length >= PLAN.length * WALKS_PER_WEEK; }

/* Pain two walks in a row → the target drops one step until two pain-free walks. */
function currentTargetPct() {
  const base = PLAN[planIndex()].pct;
  const s = state.sessions;
  const n = s.length;
  if (n >= 2 && s[n - 1].pain.length && s[n - 2].pain.length) {
    const i = STEPS.indexOf(base);
    return { pct: STEPS[Math.max(0, i - 1)], dropped: true };
  }
  return { pct: base, dropped: false };
}

/* ---------- calculator ---------- */
const $ = (id) => document.getElementById(id);
let unit = state.ui.unit || "kg";

function setUnit(u) {
  unit = u; state.ui.unit = u; saveState();
  document.querySelectorAll("#unit-seg button").forEach((b) => b.classList.toggle("on", b.dataset.unit === u));
}
document.querySelectorAll("#unit-seg button").forEach((b) => b.addEventListener("click", () => setUnit(b.dataset.unit)));
setUnit(unit);

let lastCalc = null;
function runCalc() {
  const v = parseFloat($("bw").value);
  if (!v || v < 30 || v > 250) { $("bw").focus(); return; }
  const kg = toKg(v, unit);
  const gear = $("gear").value;
  const rows = [
    ["r-start", 5.0], ["r-mid", 6.5], ["r-up", 8.0], ["r-target", 10.0],
  ];
  for (const [id, pct] of rows) {
    const load = kg * pct / 100;
    $(id).textContent = `${fmtLoad(load, unit)}  ·  ${nearestVest(load, unit)} vest`;
  }
  const notes = {
    adjustable: "Adjustable vest: set it to the week-1 number and leave the extra weights in the drawer until week 3.",
    fixed: "Fixed vest: if yours is heavier than the week-1 number, do weeks 1–2 with a backpack and water bottles (0.5 kg / 1.1 lb each) and bring the vest in at the week it matches.",
    none: "No vest: a backpack with 500 ml water bottles, straps pulled high and tight, is a fine way to do weeks 1–2 before spending money.",
  };
  $("r-note").textContent = notes[gear];
  $("calc-result").classList.remove("hidden");
  lastCalc = { kg, unit, gear, display: v };
  track("calc");
  $("calc-result").scrollIntoView({ behavior: "smooth", block: "start" });
}
$("calc-btn").addEventListener("click", runCalc);
$("bw").addEventListener("keydown", (e) => { if (e.key === "Enter") runCalc(); });

/* Share card: a 4:5 PNG with the four numbers, via Web Share where available,
   otherwise a download. */
async function shareCard() {
  if (!lastCalc) return;
  const c = $("share-canvas"), x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 1080, 1350);
  g.addColorStop(0, "#F7D7D7"); g.addColorStop(1, "#FBEFF2");
  x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
  x.fillStyle = "#D07090"; x.font = "700 30px Lato, sans-serif"; x.textAlign = "center";
  x.fillText("HOW HEAVY SHOULD YOUR VEST BE?", 540, 150);
  x.fillStyle = "#2D2A27"; x.font = "italic 400 78px 'Playfair Display', serif";
  x.fillText(`For ${lastCalc.display} ${lastCalc.unit}`, 540, 280);
  const rows = [["Weeks 1–2", 5.0], ["Weeks 3–5", 6.5], ["Weeks 6–7", 8.0], ["Week 8 target", 10.0]];
  let y = 440;
  for (const [lab, pct] of rows) {
    const load = lastCalc.kg * pct / 100;
    x.fillStyle = "#7A6A60"; x.font = "400 34px Lato, sans-serif"; x.textAlign = "left";
    x.fillText(lab, 120, y);
    x.fillStyle = pct === 10 ? "#D07090" : "#2D2A27"; x.font = `900 ${pct === 10 ? 64 : 48}px Lato, sans-serif`; x.textAlign = "right";
    x.fillText(`${fmtLoad(load, lastCalc.unit)}`, 960, y + (pct === 10 ? 8 : 0));
    x.fillStyle = "#A89080"; x.font = "400 26px Lato, sans-serif";
    x.fillText(`≈ ${nearestVest(load, lastCalc.unit)} vest`, 960, y + 40);
    x.strokeStyle = "#F0D6DE"; x.lineWidth = 2; x.beginPath(); x.moveTo(120, y + 70); x.lineTo(960, y + 70); x.stroke();
    y += 170;
  }
  x.fillStyle = "#2D2A27"; x.font = "400 30px Lato, sans-serif"; x.textAlign = "center";
  x.fillText("Add minutes before weight. Cap at 10–15%. Never run in it.", 540, 1180);
  x.fillStyle = "#D07090"; x.font = "700 28px Lato, sans-serif";
  x.fillText("glowup90challenge.com/vest", 540, 1260);
  const blob = await new Promise((r) => c.toBlob(r, "image/png"));
  const file = new File([blob], "my-vest-plan.png", { type: "image/png" });
  track("share");
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: "My weighted vest plan", text: "How heavy should your vest be? glowup90challenge.com/vest" }); return; } catch (e) { /* cancelled */ }
  }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "my-vest-plan.png"; a.click();
}
$("share-btn").addEventListener("click", shareCard);

/* ---------- safety gate + start ---------- */
$("start-btn").addEventListener("click", () => {
  if (!lastCalc) return;
  if (state.profile && state.sessions.length) { switchView("today"); return; }
  $("safety-overlay").classList.remove("hidden");
});
document.querySelectorAll("#safety-list input").forEach((cb) => cb.addEventListener("change", () => {
  const any = [...document.querySelectorAll("#safety-list input")].some((c) => c.checked);
  $("safety-msg").textContent = any
    ? "That does not mean no. It means the starting load and the schedule may need adjusting by someone who can see you walk. Talk to a doctor or physio before week 1, and start with the backpack option if in doubt."
    : "Nothing ticked? Good. First walk: 15 minutes at your week-1 load, then take it off and see how your shoulders feel tomorrow.";
}));
$("safety-cancel").addEventListener("click", () => $("safety-overlay").classList.add("hidden"));
$("safety-ok").addEventListener("click", () => {
  const flags = [...document.querySelectorAll("#safety-list input")].filter((c) => c.checked).length;
  state.profile = { bodyweightKg: lastCalc.kg, unit: lastCalc.unit, gear: lastCalc.gear, startDate: today(), safetyFlags: flags };
  state.sessions = [];
  saveState();
  track("start");
  $("safety-overlay").classList.add("hidden");
  switchView("today");
});

/* ---------- today ---------- */
function today() { return new Date().toISOString().slice(0, 10); }
let effort = 3;

function renderToday() {
  const el = $("today-content");
  if (!state.profile) {
    el.innerHTML = `<h1>No plan <em>yet</em></h1><p class="intro">Run the calculator first; your 8-week plan starts from that number.</p><button class="btn btn-primary" onclick="switchView('calc')">Go to the calculator</button>`;
    return;
  }
  const u = state.profile.unit;
  if (planDone()) {
    el.innerHTML = `<div class="card done-card"><div class="big-emoji">🏁</div><h3>24 walks. 10% of you, carried.</h3><p>Most people never get here because they started at 10%. Stay at this load and add minutes, hills or a fourth walk. Want more load: +1% every 2 weeks, stop at 12–15%.</p><button class="btn btn-secondary" onclick="switchView('progress')">See the whole log</button></div>`;
    return;
  }
  const idx = planIndex(), wk = PLAN[idx], t = currentTargetPct();
  const load = loadFor(t.pct);
  const walkNo = state.sessions.length + 1;
  const inWeek = (state.sessions.length % WALKS_PER_WEEK) + 1;
  const lastToday = state.sessions.length && state.sessions[state.sessions.length - 1].date === today();
  el.innerHTML = `
    <div class="today-head">
      <div class="eyebrow">week ${wk.week} · walk ${inWeek} of 3 · #${walkNo} of 24</div>
      <div class="load">${fmtLoad(load, u)}</div>
      <div class="mins">≈ ${nearestVest(load, u)} vest · ${wk.minutes} minutes</div>
      ${t.dropped ? `<span class="badge warn">dropped a step: pain on the last two walks</span>` : (wk.hold ? `<span class="badge">hold week</span>` : "")}
    </div>
    <div class="card card-pink"><p><b>${wk.note}</b></p><p class="tiny">Indoor: ${wk.indoor}</p></div>
    ${lastToday ? `<div class="card"><p class="tiny">You already logged a walk today. Rest day tomorrow, then walk ${walkNo}. Logging another one now is allowed but the plan works better with a day between walks.</p></div>` : ""}
    <div class="card">
      <h4>Log this walk</h4>
      <div class="row" style="margin-bottom:10px">
        <label class="field" style="flex:1"><span>Load (${u})</span><input type="number" id="s-load" inputmode="decimal" step="0.5" value="${u === "lb" ? (load / KG_PER_LB).toFixed(1) : load.toFixed(1)}"></label>
        <label class="field" style="flex:1"><span>Minutes</span><input type="number" id="s-min" inputmode="numeric" value="${wk.minutes}"></label>
        <label class="field" style="flex:1"><span>km (optional)</span><input type="number" id="s-km" inputmode="decimal" step="0.1" placeholder="–"></label>
      </div>
      <div class="field"><span>Effort · 1 easy · 3 could talk · 5 too hard</span>
        <div class="effort" id="effort">${[1,2,3,4,5].map((n) => `<button data-e="${n}" class="${n === effort ? "on" : ""}">${n}</button>`).join("")}</div></div>
      <div class="field"><span>Any aches?</span>
        <div class="pills">${PAIN.map((p) => `<label class="pill-chk"><input type="checkbox" value="${p}"> ${p}</label>`).join("")}</div></div>
      <button id="save-walk" class="btn btn-primary">Save walk ${walkNo}</button>
    </div>`;
  el.querySelectorAll("#effort button").forEach((b) => b.addEventListener("click", () => {
    effort = +b.dataset.e; el.querySelectorAll("#effort button").forEach((x) => x.classList.toggle("on", x === b));
  }));
  $("save-walk").addEventListener("click", () => {
    const rawLoad = parseFloat($("s-load").value);
    const loadKg = toKg(isNaN(rawLoad) ? 0 : rawLoad, u);
    const minutes = parseInt($("s-min").value, 10) || wk.minutes;
    const km = parseFloat($("s-km").value);
    const pain = [...el.querySelectorAll(".pill-chk input:checked")].map((c) => c.value);
    state.sessions.push({ date: today(), week: wk.week, loadKg: +loadKg.toFixed(2), minutes, km: isNaN(km) ? null : km, effort, pain });
    saveState();
    track("walk");
    if (navigator.vibrate) navigator.vibrate(30);
    renderHeader();
    const n = state.sessions.length;
    const msg = n % WALKS_PER_WEEK === 0 && !planDone()
      ? `Week ${wk.week} done. ${PLAN[planIndex()].pct > wk.pct ? "Next week the load steps up and the minutes come down." : PLAN[planIndex()].hold ? "Next week holds the load on purpose." : "Same load next week, a few more minutes."}`
      : `Walk ${n} logged. ${pain.length ? "Aches noted; two in a row and the plan drops a step for you." : "Rest day tomorrow."}`;
    el.innerHTML = `<div class="card done-card"><div class="big-emoji">${n % WALKS_PER_WEEK === 0 ? "🎉" : "✅"}</div><h3>${msg}</h3><button class="btn btn-secondary" onclick="renderToday()">Back to today</button></div>`;
  });
}

/* ---------- progress ---------- */
function renderProgress() {
  const el = $("progress-content");
  if (!state.profile) { el.innerHTML = `<h1>Nothing <em>logged yet</em></h1><p class="intro">Your walks show up here once you start the plan.</p>`; return; }
  const u = state.profile.unit, s = state.sessions;
  const totalMin = s.reduce((a, x) => a + x.minutes, 0);
  const maxKg = Math.max(loadFor(10), ...s.map((x) => x.loadKg));
  const weeksDone = Math.floor(s.length / WALKS_PER_WEEK);
  el.innerHTML = `
    <h1>Your <em>progress</em></h1>
    <div class="stat-row">
      <div class="stat"><div class="v">${s.length}</div><div class="l">walks</div></div>
      <div class="stat"><div class="v">${weeksDone}</div><div class="l">weeks done</div></div>
      <div class="stat"><div class="v">${totalMin}</div><div class="l">minutes</div></div>
      <div class="stat"><div class="v">${s.length ? fmtLoad(s[s.length - 1].loadKg, u).replace(/\s.*/, "") : "–"}</div><div class="l">last load ${u}</div></div>
    </div>
    <div class="card"><h4>Load per walk</h4>
      <div class="bars">${Array.from({ length: 24 }, (_, i) => {
        const x = s[i]; if (!x) return `<div class="bar" style="height:3px;background:var(--rule)"></div>`;
        const h = Math.max(6, Math.round(100 * x.loadKg / maxKg));
        return `<div class="bar ${x.pain.length ? "pain" : ""} ${i === s.length - 1 ? "today" : ""}" style="height:${h}px" title="${x.date}"></div>`;
      }).join("")}</div>
      <p class="tiny" style="margin-top:6px">Target at week 8: ${fmtLoad(loadFor(10), u)}. Orange bars had aches.</p></div>
    <div class="card"><h4>Walks</h4>
      <ul class="log-list">${s.slice().reverse().map((x, i) => `<li><span><b>#${s.length - i}</b> · ${fmtLoad(x.loadKg, u)} · ${x.minutes} min${x.km ? ` · ${x.km} km` : ""}</span><span>${x.date}${x.pain.length ? " · " + x.pain.join(", ") : ""}</span></li>`).join("") || "<li><span>No walks yet</span></li>"}</ul></div>
    <div class="btn-row"><button id="csv-btn" class="btn btn-secondary">Export CSV</button><button id="etsy-btn" class="btn btn-secondary">Printable plan</button></div>`;
  $("csv-btn").addEventListener("click", () => {
    const rows = [["walk", "date", "week", `load_${u}`, "minutes", "km", "effort", "pain"]];
    s.forEach((x, i) => rows.push([i + 1, x.date, x.week, u === "lb" ? (x.loadKg / KG_PER_LB).toFixed(1) : x.loadKg.toFixed(1), x.minutes, x.km ?? "", x.effort, x.pain.join("|")]));
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "vest-walks.csv"; a.click();
  });
  $("etsy-btn").addEventListener("click", () => window.open($("etsy-link").href, "_blank"));
}

/* ---------- guide bits ---------- */
$("ics-btn").addEventListener("click", () => {
  // Three weekly slots (Mon/Wed/Fri 18:00 local) as a single recurring event each.
  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date(); d.setHours(18, 0, 0, 0);
  const stamp = (dt) => `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
  const days = ["MO", "WE", "FR"];
  const ev = days.map((day, i) => `BEGIN:VEVENT\r\nUID:vestwalk-${day}-${Date.now()}@glowup90challenge.com\r\nDTSTAMP:${stamp(new Date())}\r\nDTSTART:${stamp(d)}\r\nDURATION:PT40M\r\nRRULE:FREQ=WEEKLY;BYDAY=${day};COUNT=8\r\nSUMMARY:Vest walk\r\nDESCRIPTION:Check today's load at glowup90challenge.com/vest\r\nEND:VEVENT`).join("\r\n");
  const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Small Wins Club//Vest Walk//EN\r\n${ev}\r\nEND:VCALENDAR\r\n`;
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "vest-walks.ics"; a.click();
  track("ics");
});
$("reset-btn").addEventListener("click", () => {
  if (!confirm("Wipe the plan and every logged walk on this device?")) return;
  state = defaultState(); saveState(); renderHeader(); switchView("calc");
});

/* ---------- nav ---------- */
function renderHeader() {
  const n = state.sessions.length;
  $("streak-pill").textContent = state.profile ? `🚶 ${n} walk${n === 1 ? "" : "s"}` : "🚶 0 walks";
}
function switchView(view) {
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("hidden", v.id !== `view-${view}`));
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  if (view === "today") renderToday();
  if (view === "progress") renderProgress();
  $("main").scrollTo(0, 0);
  if (location.hash !== `#${view}`) history.replaceState(null, "", `#${view}`);
}
document.querySelectorAll(".tab-btn").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.view)));

/* Lightweight event counter. GoatCounter is free and privacy-friendly; until Tim creates
   the account the calls are no-ops. Set GOATCOUNTER to e.g. "https://glowup90.goatcounter.com/count". */
const GOATCOUNTER = "";
function track(event) {
  if (!GOATCOUNTER) return;
  try {
    const img = new Image();
    img.src = `${GOATCOUNTER}?p=${encodeURIComponent("/vest/" + event)}&t=${encodeURIComponent("vest " + event)}&r=${encodeURIComponent(document.referrer)}`;
  } catch (e) { /* ignore */ }
}

/* ---------- boot ---------- */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("../service-worker.js").catch(() => {});
renderHeader();
const first = (location.hash || "#calc").slice(1);
switchView(["calc", "today", "progress", "guide"].includes(first) ? (first !== "calc" && !state.profile ? "calc" : first) : "calc");
if (state.profile) {
  // returning user: prefill the calculator with their weight so the card can be re-shared
  $("bw").value = state.profile.unit === "lb" ? (state.profile.bodyweightKg / KG_PER_LB).toFixed(1) : state.profile.bodyweightKg.toFixed(1);
  setUnit(state.profile.unit);
  $("gear").value = state.profile.gear;
  runCalc();
}
track("view");
