/* One-time "put this on your home screen" tip, shared by the Glow Up app and Weighted Walk.
   iPhone/iPad: Safari has no install API, so it shows the Share → Add to Home Screen steps.
   Android/desktop Chrome: uses the real install prompt when the browser offers one.
   Skipped when already running from the home screen, and after the person dismisses it. */
(function () {
  const KEY = "install_tip_dismissed_v1";
  const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  let dismissed = false;
  try { dismissed = localStorage.getItem(KEY) === "1"; } catch (e) { /* ignore */ }
  if (standalone || dismissed) return;

  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  let deferred = null;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; render(); });

  const css = `
  .install-tip{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(72px + env(safe-area-inset-bottom));width:calc(100% - 24px);max-width:456px;background:#24533D;color:#F3F1EC;border-radius:14px;padding:14px 14px 12px;box-shadow:0 12px 40px rgba(0,0,0,.28);z-index:30;font-family:inherit;font-size:14px;line-height:1.45}
  .install-tip b{display:block;font-size:15px;margin-bottom:4px}
  .install-tip ol{margin:6px 0 0 18px;padding:0}
  .install-tip li{margin:2px 0}
  .install-tip .row{display:flex;gap:8px;margin-top:10px}
  .install-tip button{flex:1;border:none;border-radius:10px;padding:10px 12px;font-family:inherit;font-weight:700;font-size:14px;cursor:pointer}
  .install-tip .go{background:#D8B56E;color:#1E2320}
  .install-tip .no{background:rgba(255,255,255,.12);color:#F3F1EC}
  .install-tip .x{position:absolute;top:6px;right:8px;background:none;color:#B9CDBF;font-size:20px;width:32px;flex:none;padding:0}
  .install-tip kbd{display:inline-block;border:1px solid rgba(255,255,255,.35);border-radius:6px;padding:0 6px;font-family:inherit;font-size:13px}
  @media (prefers-color-scheme: dark){.install-tip{background:#F3F1EC;color:#1E2320}.install-tip .no{background:rgba(0,0,0,.08);color:#1E2320}.install-tip .x{color:#5F665F}.install-tip kbd{border-color:rgba(0,0,0,.3)}}`;

  let el = null;
  function dismiss() {
    try { localStorage.setItem(KEY, "1"); } catch (e) { /* ignore */ }
    if (el) el.remove();
  }
  function render() {
    if (el) el.remove();
    el = document.createElement("div");
    el.className = "install-tip";
    el.setAttribute("role", "dialog");
    let body;
    if (isIOS) {
      body = `<b>Keep this app on your phone</b>Works offline, opens like any other app.
        <ol><li>Tap <kbd>Share</kbd> ${isSafari ? "(the square with the arrow, bottom of the screen)" : "in Safari"}</li>
        <li>Scroll and tap <kbd>Add to Home Screen</kbd></li><li>Tap <kbd>Add</kbd></li></ol>
        <div class="row"><button class="no">Got it</button></div>`;
    } else if (deferred) {
      body = `<b>Keep this app on your phone</b>One tap, works offline, opens like any other app.
        <div class="row"><button class="go">Install</button><button class="no">Not now</button></div>`;
    } else {
      body = `<b>Keep this app on your phone</b>In your browser menu <kbd>⋮</kbd> choose <kbd>Install app</kbd> or <kbd>Add to Home screen</kbd>.
        <div class="row"><button class="no">Got it</button></div>`;
    }
    el.innerHTML = `<button class="x" aria-label="Close">×</button>${body}`;
    el.querySelector(".x").addEventListener("click", dismiss);
    el.querySelector(".no").addEventListener("click", dismiss);
    const go = el.querySelector(".go");
    if (go) go.addEventListener("click", async () => {
      if (!deferred) return;
      deferred.prompt();
      const r = await deferred.userChoice.catch(() => null);
      deferred = null;
      if (r && r.outcome === "accepted") dismiss(); else render();
    });
    document.body.appendChild(el);
  }

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
  // Give the page a moment; on Android the install event usually arrives within this window.
  setTimeout(() => { if (!el) render(); }, 2500);
})();
