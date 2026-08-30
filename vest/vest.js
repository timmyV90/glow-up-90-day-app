/* Weighted Walk — vest calculator, 8-week plan and walk log.
   One localStorage blob; the plan position is derived from walks logged, not dates. */

const STORAGE_KEY = "glowup90_vest_v1";
const KG_PER_LB = 0.45359237;

/* Load as % of bodyweight and minutes per walk, per plan week. Week 5 holds the load on
   purpose; minutes drop whenever the load steps up (add minutes before weight). */
const PLAN = [
  { week: 1, pct: 5.0, minutes: 20, note: "Flat route, easy pace. Full sentences.", indoor: "Treadmill 0–1% or walking pad, same minutes." },
  { week: 2, pct: 5.0, minutes: 27, note: "Same load. One gentle hill is fine.", indoor: "Treadmill 1–2% for the middle 10 minutes." },
  { week: 3, pct: 6.5, minutes: 25, note: "Load up, minutes down. Keep it flat.", indoor: "Treadmill 1% or walking pad." },
  { week: 4, pct: 6.5, minutes: 30, note: "A few short hills on one walk.", indoor: "Treadmill 2–3% for 10 of the 30 minutes." },
  { week: 5, pct: 6.5, minutes: 33, note: "Hold week. Change the route, not the weight.", indoor: "Treadmill 2% throughout, or add 5 minutes of stairs.", hold: true },
  { week: 6, pct: 8.0, minutes: 30, note: "New load, flat routes. Re-tighten the straps.", indoor: "Treadmill 1%." },
  { week: 7, pct: 8.0, minutes: 35, note: "Hills welcome on one walk.", indoor: "Treadmill 2–3% for 15 of the 35 minutes." },
  { week: 8, pct: 10.0, minutes: 30, note: "Your week-8 number. Easy pace, flat.", indoor: "Treadmill 1%." },
];
const STEPS = [5.0, 6.5, 8.0, 10.0];
const VEST_KG = [2, 3, 4, 5, 6, 8, 10, 12];
const VEST_LB = [4, 6, 8, 10, 12, 15, 20, 25];
const PAIN = ["neck", "shoulders", "back", "knees", "feet"];

/* ---------- state ---------- */
function defaultState() { return { profile: null, sessions: [], ui: { unit: "kg" } }; }
function loadState() {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return Object.assign(defaultState(), JSON.parse(raw)); } catch (e) { /* blocked storage */ }
  return defaultState();
}
function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ } }
let state = loadState();

/* ---------- maths ---------- */
function toKg(v, unit) { return unit === "lb" ? v * KG_PER_LB : v; }
function fmtLoad(kg, unit) { return unit === "lb" ? `${(kg / KG_PER_LB).toFixed(1)} lb` : `${kg.toFixed(1)} kg`; }
function nearestVest(kg, unit) {
  const sizes = unit === "lb" ? VEST_LB : VEST_KG;
  const target = unit === "lb" ? kg / KG_PER_LB : kg;
  let pick = sizes[0];
  for (const s of sizes) if (s <= target + 0.01) pick = s;   // round down, never above target
  return `${pick} ${unit}`;
}
function loadFor(pct) { return state.profile.bodyweightKg * pct / 100; }
function perWeek() { return (state.profile && state.profile.walksPerWeek) || 3; }
function planIndex() { return Math.min(Math.floor(state.sessions.length / perWeek()), PLAN.length - 1); }
function planDone() { return state.sessions.length >= PLAN.length * perWeek(); }

/* Pain two walks in a row → the target drops one step until two pain-free walks. */
function currentTargetPct() {
  const base = PLAN[planIndex()].pct;
  const s = state.sessions, n = s.length;
  if (n >= 2 && s[n - 1].pain.length && s[n - 2].pain.length) {
    return { pct: STEPS[Math.max(0, STEPS.indexOf(base) - 1)], dropped: true };
  }
  return { pct: base, dropped: false };
}

/* ---------- intake + calculator ---------- */
const $ = (id) => document.getElementById(id);
let unit = state.ui.unit || "kg";
let wpw = 3;

function setUnit(u) {
  unit = u; state.ui.unit = u; saveState();
  document.querySelectorAll("#unit-seg button").forEach((b) => b.classList.toggle("on", b.dataset.unit === u));
}
function setWpw(n) {
  wpw = n;
  document.querySelectorAll("#wpw-seg button").forEach((b) => b.classList.toggle("on", +b.dataset.n === n));
}
document.querySelectorAll("#unit-seg button").forEach((b) => b.addEventListener("click", () => setUnit(b.dataset.unit)));
document.querySelectorAll("#wpw-seg button").forEach((b) => b.addEventListener("click", () => setWpw(+b.dataset.n)));
setUnit(unit);

let lastCalc = null;
function runCalc() {
  const v = parseFloat($("bw").value);
  if (!v || v < 30 || v > 250) { $("bw").focus(); return; }
  const age = parseInt($("age").value, 10) || null;
  const kg = toKg(v, unit);
  const gear = $("gear").value;
  const show = (pct) => `${fmtLoad(kg * pct / 100, unit)}`;
  $("r-start").textContent = show(5.0);
  $("r-mid").textContent = show(6.5);
  $("r-up").textContent = show(8.0);
  $("r-target").textContent = show(10.0);
  $("r-for").textContent = `${v} ${unit}${age ? ` · ${age}` : ""} · ${wpw}×/week`;
  const vest = nearestVest(kg * 5 / 100, unit);
  const notes = {
    adjustable: `Set the vest to ${vest} and leave the rest in the drawer until week 3.`,
    fixed: `Nearest vest size: ${vest}. Heavier than that? Do weeks 1–2 with a backpack and water bottles.`,
    none: `Weeks 1–2: a backpack with 500 ml bottles (0.5 kg each), straps high and tight. Buy a ${vest} vest after.`,
  };
  $("r-note").textContent = notes[gear] + (age && age >= 60 ? " Over 60: hold each load an extra week if it still feels heavy." : "");
  $("calc-result").classList.remove("hidden");
  lastCalc = { kg, unit, gear, display: v, age, wpw };
  track("calc");
  $("calc-result").scrollIntoView({ behavior: "smooth", block: "start" });
}
$("calc-btn").addEventListener("click", runCalc);
$("bw").addEventListener("keydown", (e) => { if (e.key === "Enter") runCalc(); });

/* Share card: 4:5 PNG, Web Share where available, else download. */
async function shareCard() {
  if (!lastCalc) return;
  const c = $("share-canvas"), x = c.getContext("2d");
  x.fillStyle = "#1E2320"; x.fillRect(0, 0, 1080, 1350);
  x.fillStyle = "#9AA097"; x.font = "600 30px Inter, sans-serif"; x.textAlign = "center";
  x.fillText("HOW HEAVY SHOULD YOUR VEST BE?", 540, 150);
  x.fillStyle = "#F3F1EC"; x.font = "700 60px Sora, sans-serif";
  x.fillText(`For ${lastCalc.display} ${lastCalc.unit}`, 540, 250);
  x.fillStyle = "#2F6B4F"; x.fillRect(120, 320, 840, 4);
  const rows = [["Weeks 1–2 · start", 5.0], ["Weeks 3–5", 6.5], ["Weeks 6–7", 8.0], ["Week 8 · target", 10.0]];
  let y = 450;
  for (const [lab, pct] of rows) {
    x.fillStyle = "#9AA097"; x.font = "500 32px Inter, sans-serif"; x.textAlign = "left"; x.fillText(lab, 120, y);
    x.fillStyle = pct === 10 ? "#D8B56E" : "#F3F1EC"; x.font = `800 ${pct === 10 ? 72 : 54}px Sora, sans-serif`; x.textAlign = "right";
    x.fillText(fmtLoad(lastCalc.kg * pct / 100, lastCalc.unit), 960, y + 6);
    y += 170;
  }
  x.fillStyle = "#9AA097"; x.font = "500 28px Inter, sans-serif"; x.textAlign = "center";
  x.fillText("Minutes before weight · never run in it", 540, 1170);
  x.fillStyle = "#F3F1EC"; x.font = "700 30px Sora, sans-serif";
  x.fillText("glowup90challenge.com/vest", 540, 1250);
  const blob = await new Promise((r) => c.toBlob(r, "image/png"));
  const file = new File([blob], "my-vest-plan.png", { type: "image/png" });
  track("share");
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: "My weighted vest plan", text: "glowup90challenge.com/vest" }); return; } catch (e) { /* cancelled */ }
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
    ? "Not a no. Ask a doctor or physio before week 1, and start with the backpack option if in doubt."
    : "Nothing ticked? First walk: 15 minutes at your start load, then take it off and see how your shoulders feel tomorrow.";
}));
$("safety-cancel").addEventListener("click", () => $("safety-overlay").classList.add("hidden"));
$("safety-ok").addEventListener("click", () => {
  const flags = [...document.querySelectorAll("#safety-list input")].filter((c) => c.checked).length;
  state.profile = { bodyweightKg: lastCalc.kg, unit: lastCalc.unit, gear: lastCalc.gear, age: lastCalc.age,
                    walksPerWeek: lastCalc.wpw, startDate: today(), safetyFlags: flags };
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
    el.innerHTML = `<h1>No plan yet</h1><p class="lede">Run the calculator first.</p><button class="btn btn-primary" onclick="switchView('calc')">Go to Start</button>`;
    return;
  }
  const u = state.profile.unit, n = perWeek();
  if (planDone()) {
    el.innerHTML = `<div class="card done-card"><div class="big">🏁</div><h3>${PLAN.length * n} walks. 10% of you, carried.</h3><p class="tiny">Stay at 10% and add minutes, hills or a walk. More load: +1% every 2 weeks, stop at 12–15%.</p><button class="btn btn-secondary" style="margin-top:12px" onclick="switchView('progress')">See the log</button></div>`;
    return;
  }
  const idx = planIndex(), wk = PLAN[idx], t = currentTargetPct();
  const load = loadFor(t.pct);
  const walkNo = state.sessions.length + 1;
  const inWeek = (state.sessions.length % n) + 1;
  el.innerHTML = `
    <div class="today-head">
      <span class="eyebrow">Week ${wk.week} · walk ${inWeek} of ${n}</span>
      <div class="today-load">${fmtLoad(load, u)}</div>
      <div class="today-sub">${nearestVest(load, u)} vest · ${wk.minutes} min</div>
      ${t.dropped ? `<span class="badge warn">dropped a step · aches twice</span>` : (wk.hold ? `<span class="badge">hold week</span>` : "")}
    </div>
    <p class="today-note">${wk.note}</p>
    <details class="indoor"><summary>Indoors today?</summary><p>${wk.indoor}</p></details>
    <button id="open-log" class="btn btn-primary">Log walk ${walkNo}</button>
    <div id="log-form" class="card hidden" style="margin-top:12px">
      <div class="row" style="margin-bottom:10px">
        <label class="field" style="flex:1"><span>Load (${u})</span><input type="number" id="s-load" inputmode="decimal" step="0.5" value="${u === "lb" ? (load / KG_PER_LB).toFixed(1) : load.toFixed(1)}"></label>
        <label class="field" style="flex:1"><span>Min</span><input type="number" id="s-min" inputmode="numeric" value="${wk.minutes}"></label>
        <label class="field" style="flex:1"><span>km</span><input type="number" id="s-km" inputmode="decimal" step="0.1" placeholder="–"></label>
      </div>
      <div class="field"><span>Effort · 1 easy → 5 too hard</span>
        <div class="effort" id="effort">${[1,2,3,4,5].map((k) => `<button data-e="${k}" class="${k === effort ? "on" : ""}">${k}</button>`).join("")}</div></div>
      <div class="field"><span>Aches</span>
        <div class="pills">${PAIN.map((p) => `<label class="pill-chk"><input type="checkbox" value="${p}"> ${p}</label>`).join("")}</div></div>
      <button id="save-walk" class="btn btn-primary">Save</button>
    </div>`;
  $("open-log").addEventListener("click", () => { $("log-form").classList.remove("hidden"); $("open-log").classList.add("hidden"); });
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
    const count = state.sessions.length;
    const weekDone = count % n === 0 && !planDone();
    const next = PLAN[planIndex()];
    const msg = weekDone
      ? `Week ${wk.week} done. ${next.pct > wk.pct ? "Load steps up next week." : next.hold ? "Next week holds the load." : "Same load, a few more minutes."}`
      : `Walk ${count} saved.${pain.length ? " Aches noted." : ""}`;
    el.innerHTML = `<div class="card done-card"><div class="big">${weekDone ? "🎉" : "✓"}</div><h3>${msg}</h3><button class="btn btn-secondary" style="margin-top:12px" onclick="renderToday()">Back</button></div>`;
  });
}

/* ---------- progress ---------- */
function renderProgress() {
  const el = $("progress-content");
  if (!state.profile) { el.innerHTML = `<h1>Nothing logged yet</h1><p class="lede">Walks show up here once you start.</p>`; return; }
  const u = state.profile.unit, s = state.sessions, n = perWeek(), total = PLAN.length * n;
  const totalMin = s.reduce((a, x) => a + x.minutes, 0);
  const maxKg = Math.max(loadFor(10), ...s.map((x) => x.loadKg));
  el.innerHTML = `
    <h1>Progress</h1>
    <div class="stat-row">
      <div class="stat"><div class="v">${s.length}</div><div class="l">walks</div></div>
      <div class="stat"><div class="v">${Math.floor(s.length / n)}</div><div class="l">weeks</div></div>
      <div class="stat"><div class="v">${totalMin}</div><div class="l">minutes</div></div>
      <div class="stat"><div class="v">${s.length ? fmtLoad(s[s.length - 1].loadKg, u).replace(/\s.*/, "") : "–"}</div><div class="l">last ${u}</div></div>
    </div>
    <div class="card"><h2 style="margin-top:0">Load per walk</h2>
      <div class="bars">${Array.from({ length: total }, (_, i) => {
        const x = s[i]; if (!x) return `<div class="bar"></div>`;
        const h = Math.max(6, Math.round(100 * x.loadKg / maxKg));
        return `<div class="bar ${x.pain.length ? "pain" : "done"} ${i === s.length - 1 ? "today" : ""}" style="height:${h}px"></div>`;
      }).join("")}</div>
      <p class="tiny">Target ${fmtLoad(loadFor(10), u)} at week 8. Orange = aches.</p></div>
    <div class="card"><h2 style="margin-top:0">Walks</h2>
      <ul class="log-list">${s.slice().reverse().map((x, i) => `<li><span><b>#${s.length - i}</b> · ${fmtLoad(x.loadKg, u)} · ${x.minutes} min${x.km ? ` · ${x.km} km` : ""}</span><span>${x.date}${x.pain.length ? " · " + x.pain.join(", ") : ""}</span></li>`).join("") || "<li><span>No walks yet</span></li>"}</ul></div>
    <div class="btn-row"><button id="csv-btn" class="btn btn-secondary">Export CSV</button><button id="etsy-btn" class="btn btn-secondary">Printable plan</button></div>`;
  $("csv-btn").addEventListener("click", () => {
    const rows = [["walk", "date", "week", `load_${u}`, "minutes", "km", "effort", "pain"]];
    s.forEach((x, i) => rows.push([i + 1, x.date, x.week, u === "lb" ? (x.loadKg / KG_PER_LB).toFixed(1) : x.loadKg.toFixed(1), x.minutes, x.km ?? "", x.effort, x.pain.join("|")]));
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" })); a.download = "vest-walks.csv"; a.click();
  });
  $("etsy-btn").addEventListener("click", () => window.open($("etsy-link").href, "_blank"));
}

/* ---------- guide tools ---------- */
$("ics-btn").addEventListener("click", () => {
  const n = perWeek();
  const byday = { 2: ["MO", "TH"], 3: ["MO", "WE", "FR"], 4: ["MO", "TU", "TH", "SA"], 5: ["MO", "TU", "WE", "FR", "SA"] }[n] || ["MO", "WE", "FR"];
  const pad = (k) => String(k).padStart(2, "0");
  const d = new Date(); d.setHours(18, 0, 0, 0);
  const stamp = (dt) => `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
  const ev = byday.map((day) => `BEGIN:VEVENT\r\nUID:weightedwalk-${day}-${Date.now()}@glowup90challenge.com\r\nDTSTAMP:${stamp(new Date())}\r\nDTSTART:${stamp(d)}\r\nDURATION:PT40M\r\nRRULE:FREQ=WEEKLY;BYDAY=${day};COUNT=8\r\nSUMMARY:Weighted walk\r\nDESCRIPTION:Today's load: glowup90challenge.com/vest\r\nEND:VEVENT`).join("\r\n");
  const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Small Wins Club//Weighted Walk//EN\r\n${ev}\r\nEND:VCALENDAR\r\n`;
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "weighted-walks.ics"; a.click();
  track("ics");
});
$("reset-btn").addEventListener("click", () => {
  if (!confirm("Wipe the plan and every logged walk on this device?")) return;
  state = defaultState(); saveState(); renderHeader(); switchView("calc");
});

/* ---------- nav ---------- */
function renderHeader() {
  const n = state.sessions.length;
  $("streak-pill").textContent = `${n} walk${n === 1 ? "" : "s"}`;
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

/* Event counter. GoatCounter is free; until Tim sets GOATCOUNTER the calls are no-ops. */
const GOATCOUNTER = "";
function track(event) {
  if (!GOATCOUNTER) return;
  try { new Image().src = `${GOATCOUNTER}?p=${encodeURIComponent("/vest/" + event)}&t=${encodeURIComponent("vest " + event)}&r=${encodeURIComponent(document.referrer)}`; } catch (e) { /* ignore */ }
}

/* ---------- boot ---------- */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("../service-worker.js").catch(() => {});
renderHeader();
if (state.profile) {
  $("bw").value = state.profile.unit === "lb" ? (state.profile.bodyweightKg / KG_PER_LB).toFixed(1) : state.profile.bodyweightKg.toFixed(1);
  if (state.profile.age) $("age").value = state.profile.age;
  setUnit(state.profile.unit); setWpw(state.profile.walksPerWeek || 3);
  $("gear").value = state.profile.gear;
  runCalc();
}
const first = (location.hash || "#calc").slice(1);
const wanted = ["calc", "today", "progress", "guide"].includes(first) ? first : "calc";
switchView(state.profile ? (wanted === "calc" && state.sessions.length ? "today" : wanted) : (wanted === "guide" ? "guide" : "calc"));
track("view");
