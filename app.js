/* =========================================================
   SLAORUS MINI — launcher
   Games come ONLY from games.js (edited on GitHub by you).
   Per-browser data (playtime, favorites, settings, streak)
   lives in localStorage under the "slaorus_" prefix.
   ========================================================= */
"use strict";

const BRAND = "Slaorus Mini"; // <-- site name lives here (one line)

/* ---------- storage ---------- */
const store = {
  get(k, d){ try{ const v = localStorage.getItem("slaorus_" + k); return v === null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ localStorage.setItem("slaorus_" + k, JSON.stringify(v)); }
};

let playtime   = store.get("pt", {});     // { gameId: seconds }
let lastPlayed = store.get("lp", {});     // { gameId: timestamp }
let favorites  = store.get("fav", []);    // [ gameId ]
let streak     = store.get("streak", { last: null, count: 0 });
let settings   = store.get("settings", { lib: "gnmath", accent: "#c9c1f2", fx: true, cloak: false });

const dayKey = (d = new Date()) =>
  d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");

/* ---------- daily streak: visiting or playing counts ---------- */
(function(){
  const today = dayKey(), yday = dayKey(new Date(Date.now() - 864e5));
  if (streak.last !== today){
    streak.count = (streak.last === yday) ? streak.count + 1 : 1;
    streak.last = today;
    store.set("streak", streak);
  }
})();

/* ---------- SVG icons (no emojis anywhere) ---------- */
const ICONS = {
  star: f => `<svg viewBox="0 0 24 24" width="15" height="15"><path fill="${f ? "#ffd35c" : "currentColor"}" stroke="${f ? "#a97e00" : "none"}" stroke-width="1" d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/></svg>`,
  crown: `<svg viewBox="0 0 24 24"><path fill="#3d2c00" d="M2.5 8.5l4.7 3.4L12 5l4.8 6.9 4.7-3.4-1.8 10H4.3l-1.8-10zM4.5 20h15v1.8h-15z"/></svg>`,
  clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  flame: `<svg viewBox="0 0 24 24" width="14" height="14"><path fill="#ff8a3d" d="M12 22c-4 0-7-2.9-7-6.8 0-2.5 1.3-4.4 2.7-6C9 7.7 10.4 6 10.8 3.4c2.4 1.6 3.5 3.9 3.3 6.4 1-.5 1.8-1.4 2.1-2.7 1.7 1.8 2.8 4 2.8 6.1 0 3.9-3 6.8-7 6.8z"/></svg>`
};

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const fmtTime = s => {
  s = Math.floor(s);
  if (s < 60) return s + "s";
  const m = Math.floor(s/60), r = s % 60;
  if (m < 60) return r ? m + "m " + r + "s" : m + "m";
  return Math.floor(m/60) + "h " + (m%60) + "m";
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));

/* ---------- games ---------- */
const LIBS = (typeof GAME_LIBRARY !== "undefined") ? GAME_LIBRARY : { gnmath: { games: [] }, lumin: { games: [] } };
function libGames(lib = settings.lib){
  return (LIBS[lib] && LIBS[lib].games || [])
    .slice()
    .sort((a, b) => (a.num || 0) - (b.num || 0))
    .map(g => ({ ...g, id: lib + ":" + (g.num || g.name) }));
}
const allGames = () => Object.keys(LIBS).flatMap(libGames);
const findGame = id => allGames().find(g => g.id === id);

/* ---------- accent ---------- */
const PRESETS = ["#c9c1f2","#b8bdf5","#8ecdf5","#f5b8d0","#9fe8c0","#f5d9a8","#c9aef5"];
function applyAccent(c){
  settings.accent = c;
  document.documentElement.style.setProperty("--accent", c);
  $("accentCurrent").style.background = c;
}

/* ---------- starfield ---------- */
const canvas = $("stars"), ctx = canvas.getContext("2d");
let stars = [];
function initStars(){
  canvas.width = innerWidth; canvas.height = innerHeight;
  stars = Array.from({length: 85}, () => ({
    x: Math.random()*canvas.width, y: Math.random()*canvas.height,
    r: Math.random()*1.3 + .3, p: Math.random()*6.28, s: .5 + Math.random()*1.6
  }));
}
function drawStars(t){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for (const s of stars){
    ctx.globalAlpha = .25 + .75 * Math.abs(Math.sin(t/1000*s.s + s.p));
    ctx.fillStyle = "#ccd5ff";
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawStars);
}
initStars(); addEventListener("resize", initStars);
requestAnimationFrame(drawStars);

/* ---------- rendering ---------- */
const libraryEl = $("library"), chipsEl = $("chips"), searchEl = $("search");
let activeChip = "All";
searchEl.addEventListener("input", render);

function render(){
  document.title = BRAND;
  $("brandName").textContent = BRAND;

  const games = libGames();
  const q = searchEl.value.trim().toLowerCase();
  libraryEl.innerHTML = ""; chipsEl.innerHTML = "";

  // chips (only if any game uses tags)
  const tags = ["All", ...new Set(games.map(g => g.tag).filter(Boolean))];
  if (tags.length > 1){
    if (!tags.includes(activeChip)) activeChip = "All";
    for (const t of tags){
      const c = document.createElement("button");
      c.className = "chip" + (t === activeChip ? " active" : "");
      c.textContent = t;
      c.onclick = () => { activeChip = t; render(); };
      chipsEl.appendChild(c);
    }
  }

  const filtered = games.filter(g =>
    (activeChip === "All" || g.tag === activeChip) &&
    (!q || g.name.toLowerCase().includes(q))
  );

  const section = (title, list, opts = {}) => {
    if (!list.length && !opts.force) return;
    const h = document.createElement("div");
    h.className = "section-title"; h.textContent = title;
    libraryEl.appendChild(h);
    const grid = document.createElement("div");
    grid.className = "grid" + (opts.featured ? " featured" : "");
    if (!list.length){
      const e = document.createElement("div");
      e.className = "empty";
      e.textContent = opts.empty || "Nothing here yet.";
      grid.appendChild(e);
    }
    list.forEach(g => grid.appendChild(makeCard(g)));
    libraryEl.appendChild(grid);
  };

  // FEATURED: isNew games on top
  const news = filtered.filter(g => g.isNew);
  section("Featured", news, { force: news.length > 0, featured: true });

  // RECENTLY PLAYED
  const recent = filtered.filter(g => lastPlayed[g.id])
    .sort((a,b) => lastPlayed[b.id] - lastPlayed[a.id]).slice(0, 6);
  section("Recently Played", recent, { empty: "Play something and it will show up here." });

  // FAVORITES
  const favs = filtered.filter(g => favorites.includes(g.id));
  section("Favorites", favs, { empty: "Tap the star on any game to favorite it." });

  // ALL GAMES (+ crown on #1)
  const topId = topGameId(allGames());
  section("All Games", filtered, { empty: "No games in this library yet." });
  const crownCard = topId ? libraryEl.querySelector(`.card[data-id="${CSS.escape(topId)}"]`) : null;
  if (crownCard && !crownCard.querySelector(".badge-crown")){
    const b = document.createElement("span");
    b.className = "badge-crown";
    b.innerHTML = ICONS.crown + "<span>#1</span>";
    crownCard.insertBefore(b, crownCard.firstChild);
  }
}

function makeCard(g){
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = g.id;

  if (g.isNew){
    const b = document.createElement("span");
    b.className = "badge-new"; b.textContent = "NEW!";
    card.appendChild(b);
  }
  const pt = playtime[g.id] || 0;
  if (pt > 0){
    const t = document.createElement("span");
    t.className = "pt-tag";
    t.innerHTML = ICONS.clock + "<span>" + fmtTime(pt) + "</span>";
    card.appendChild(t);
  }
  if (g.icon){
    const img = document.createElement("img");
    img.className = "thumb"; img.src = g.icon; img.alt = g.name; img.loading = "lazy";
    img.onerror = () => img.replaceWith(fallbackTile(g));
    card.appendChild(img);
  } else card.appendChild(fallbackTile(g));

  const fav = document.createElement("button");
  const on = favorites.includes(g.id);
  fav.className = "fav" + (on ? " on" : "");
  fav.innerHTML = ICONS.star(on);
  fav.title = "Favorite";
  fav.onclick = e => { e.stopPropagation(); toggleFav(g.id); };
  card.appendChild(fav);

  const name = document.createElement("div");
  name.className = "cname"; name.textContent = g.name;
  card.appendChild(name);

  card.onclick = () => openGame(g);
  return card;
}
function fallbackTile(g){
  const d = document.createElement("div");
  d.className = "thumb-fallback";
  d.textContent = (g.name || "?").trim().charAt(0).toUpperCase();
  return d;
}
function toggleFav(id){
  favorites = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
  store.set("fav", favorites);
  render();
}
function topGameId(games){
  let best = null, bt = 0;
  for (const g of games){
    const t = playtime[g.id] || 0;
    if (t > bt){ bt = t; best = g.id; }
  }
  return best;
}

/* ---------- player + playtime ---------- */
let current = null, sessionStart = 0, tick = null;
function openGame(g){
  if (settings.cloak){ cloakOpen(g); return; }
  current = g; sessionStart = Date.now();
  lastPlayed[g.id] = Date.now(); store.set("lp", lastPlayed);
  $("playerName").textContent = g.name;
  $("playerBy").textContent = g.tag ? "by " + g.tag : "";
  const f = $("playerFrame");
  if (g.html != null){ f.removeAttribute("src"); f.srcdoc = g.html; }
  else { f.removeAttribute("srcdoc"); f.src = g.url; }
  $("player").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  clearInterval(tick);
  tick = setInterval(() => {
    $("clockText").textContent = fmtTime((playtime[g.id] || 0) + (Date.now() - sessionStart) / 1000);
  }, 1000);
  render();
}
function cloakOpen(g){
  const w = window.open("about:blank", "_blank");
  if (!w) return alert("Popup blocked — allow popups for cloak mode.");
  const doc = w.document;
  doc.title = g.name;
  if (g.html != null){
    doc.open(); doc.write(g.html); doc.close();
  } else {
    doc.body.innerHTML = "";
    const ifr = doc.createElement("iframe");
    ifr.src = g.url;
    ifr.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:none";
    doc.body.appendChild(ifr);
  }
}
function finalize(){
  if (!current) return;
  const el = Math.floor((Date.now() - sessionStart) / 1000);
  if (el > 0){
    playtime[current.id] = (playtime[current.id] || 0) + el;
    store.set("pt", playtime);
  }
  sessionStart = Date.now();
}
function closePlayer(){
  finalize(); clearInterval(tick);
  const f = $("playerFrame");
  f.srcdoc = ""; f.src = "about:blank";
  $("player").classList.add("hidden");
  document.body.style.overflow = "";
  current = null;
  render();
}
$("closeBtn").onclick = closePlayer;
$("fsBtn").onclick = () => {
  document.fullscreenElement ? document.exitFullscreen() : $("player").requestFullscreen();
};
$("tabBtn").onclick = () => { if (current) cloakTab(current); };
function cloakTab(g){
  const w = window.open("about:blank", "_blank");
  if (!w) return window.open(g.url, "_blank");
  const ifr = w.document.createElement("iframe");
  ifr.src = g.html != null ? "about:blank" : g.url;
  ifr.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:none";
  w.document.body.appendChild(ifr);
  if (g.html != null){ ifr.srcdoc = g.html; }
}
addEventListener("beforeunload", finalize);
document.addEventListener("visibilitychange", () => { if (document.hidden) finalize(); });

/* ---------- random ---------- */
$("randomBtn").onclick = () => {
  const pool = libGames();
  if (!pool.length) return;
  openGame(pool[Math.floor(Math.random() * pool.length)]);
};

/* ---------- stats ---------- */
$("statsBtn").onclick = () => {
  const games = allGames();
  const total = Object.values(playtime).reduce((a, b) => a + b, 0);
  const topId = topGameId(games);
  const top = games.find(g => g.id === topId);
  const sorted = games.slice().sort((a,b) => (playtime[b.id]||0) - (playtime[a.id]||0)).slice(0, 8);
  const max = Math.max(1, ...sorted.map(g => playtime[g.id] || 0));
  $("statsBody").innerHTML = `
    <div class="stat-hero">
      <div class="stat-box"><div class="num">${fmtTime(total)}</div><div class="lbl">Total playtime</div></div>
      <div class="stat-box"><div class="num">${games.length}</div><div class="lbl">Games</div></div>
      <div class="stat-box"><div class="num" style="color:#ff8a3d">${ICONS.flame} ${streak.count}</div><div class="lbl">Day streak</div></div>
    </div>
    ${top ? `<div class="king-box">${ICONS.crown.replace("<svg ", '<svg width="26" height="26" ')}
        <div><div class="king-name">${esc(top.name)}</div>
        <div class="king-sub">#1 most played &mdash; ${fmtTime(playtime[top.id])}</div></div></div>`
      : `<div class="king-box">${ICONS.crown.replace("<svg ", '<svg width="26" height="26" ')}
        <div><div class="king-name">No champion yet</div>
        <div class="king-sub">Play a game to crown your #1</div></div></div>`}
    <div class="setting-label">MOST PLAYED</div>
    ${sorted.length ? sorted.map(g => `
      <div class="bar-row">
        <div class="bar-name">${g.id === topId ? '<span style="color:#ffd35c">#1 </span>' : ""}${esc(g.name)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${((playtime[g.id]||0)/max*100).toFixed(1)}%"></div></div>
        <div class="bar-time">${fmtTime(playtime[g.id] || 0)}</div>
      </div>`).join("") : '<p class="modal-sub">No playtime yet.</p>'}
  `;
  $("statsModal").classList.remove("hidden");
};

/* ---------- settings: library tabs ---------- */
function renderLibTabs(){
  document.querySelectorAll(".lib-tab").forEach(t =>
    t.classList.toggle("sel", t.dataset.lib === settings.lib));
}
document.querySelectorAll(".lib-tab").forEach(t => {
  t.onclick = () => {
    settings.lib = t.dataset.lib;
    store.set("settings", settings);
    renderLibTabs(); render();
  };
});

/* ---------- settings: accent pills ---------- */
function renderPills(){
  const wrap = $("accentPills");
  wrap.innerHTML = "";
  PRESETS.forEach(c => {
    const p = document.createElement("div");
    p.className = "pill" + (c.toLowerCase() === settings.accent.toLowerCase() ? " sel" : "");
    p.style.background = c; p.style.color = c; p.title = c;
    p.onclick = () => { applyAccent(c); syncPicker(c); renderPills(); };
    wrap.appendChild(p);
  });
}

/* ---------- custom color picker ---------- */
const pickCanvas = $("pickCanvas"), pctx = pickCanvas.getContext("2d");
let hsv = { h: 258, s: .6, v: .95 };

function hsvToRgb(h, s, v){
  const f = (n, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
}
const rgbToHex = (r, g, b) => "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
function rgbToHsv(r, g, b){
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d){ if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
  return { h, s: mx ? d / mx : 0, v: mx };
}
function hexToHsv(hex){
  const m = hex.replace("#", "");
  return rgbToHsv(parseInt(m.slice(0,2),16), parseInt(m.slice(2,4),16), parseInt(m.slice(4,6),16));
}
function drawPicker(){
  const W = pickCanvas.width, H = pickCanvas.height;
  pctx.fillStyle = `hsl(${hsv.h},100%,50%)`;
  pctx.fillRect(0, 0, W, H);
  let gr = pctx.createLinearGradient(0, 0, W, 0);
  gr.addColorStop(0, "#fff"); gr.addColorStop(1, "rgba(255,255,255,0)");
  pctx.fillStyle = gr; pctx.fillRect(0, 0, W, H);
  gr = pctx.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "#000");
  pctx.fillStyle = gr; pctx.fillRect(0, 0, W, H);
  const hnd = $("pickHandle");
  hnd.style.left = (hsv.s * 100) + "%";
  hnd.style.top = ((1 - hsv.v) * 100) + "%";
  hnd.style.background = settings.accent;
  const hh = $("hueHandle");
  hh.style.left = (hsv.h / 360 * 100) + "%";
  const [r, g, b] = hsvToRgb(hsv.h, hsv.s, hsv.v);
  if (document.activeElement !== $("rVal")) $("rVal").value = r;
  if (document.activeElement !== $("gVal")) $("gVal").value = g;
  if (document.activeElement !== $("bVal")) $("bVal").value = b;
}
function commitPicker(){
  const [r, g, b] = hsvToRgb(hsv.h, hsv.s, hsv.v);
  applyAccent(rgbToHex(r, g, b));
  renderPills();
  drawPicker();
}
function syncPicker(hex){
  hsv = hexToHsv(hex);
  drawPicker();
}
let picking = false;
function pickFromEvent(e){
  const rect = pickCanvas.getBoundingClientRect();
  hsv.s = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  hsv.v = 1 - Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
  commitPicker();
}
pickCanvas.addEventListener("pointerdown", e => { picking = true; pickCanvas.setPointerCapture(e.pointerId); pickFromEvent(e); });
pickCanvas.addEventListener("pointermove", e => { if (picking) pickFromEvent(e); });
pickCanvas.addEventListener("pointerup", () => picking = false);
let hueing = false;
function hueFromEvent(e){
  const rect = $("hueTrack").getBoundingClientRect();
  hsv.h = Math.min(360, Math.max(0, (e.clientX - rect.left) / rect.width * 360));
  commitPicker();
}
$("hueTrack").addEventListener("pointerdown", e => { hueing = true; $("hueTrack").setPointerCapture(e.pointerId); hueFromEvent(e); });
$("hueTrack").addEventListener("pointermove", e => { if (hueing) hueFromEvent(e); });
$("hueTrack").addEventListener("pointerup", () => hueing = false);
["rVal","gVal","bVal"].forEach((id, i) => {
  $(id).addEventListener("change", () => {
    const vals = ["rVal","gVal","bVal"].map(x => Math.min(255, Math.max(0, parseInt($(x).value) || 0)));
    hsv = rgbToHsv(vals[0], vals[1], vals[2]);
    commitPicker();
  });
});
$("eyedropBtn").onclick = async () => {
  if (!window.EyeDropper) return alert("Eyedropper is not supported in this browser.");
  try {
    const r = await new window.EyeDropper().open();
    syncPicker(r.sRGBHex);
    commitPicker();
  } catch(e){ /* user cancelled */ }
};
$("accentCurrent").onclick = () => {
  $("picker").classList.toggle("hidden");
  if (!$("picker").classList.contains("hidden")){ syncPicker(settings.accent); }
};

/* ---------- settings save / toggles ---------- */
$("saveSettings").onclick = () => {
  settings.fx = $("fxToggle").checked;
  settings.cloak = $("cloakToggle").checked;
  store.set("settings", settings);
  document.body.classList.toggle("nofx", !settings.fx);
  $("settingsModal").classList.add("hidden");
};
$("settingsBtn").onclick = () => {
  $("fxToggle").checked = settings.fx;
  $("cloakToggle").checked = settings.cloak;
  renderLibTabs(); renderPills(); syncPicker(settings.accent);
  $("picker").classList.add("hidden");
  $("settingsModal").classList.remove("hidden");
};

/* ---------- modal close ---------- */
document.querySelectorAll(".closeModal").forEach(b =>
  b.onclick = e => e.target.closest(".modal").classList.add("hidden"));
document.querySelectorAll(".modal").forEach(m =>
  m.addEventListener("click", e => { if (e.target === m) m.classList.add("hidden"); }));
addEventListener("keydown", e => {
  if (e.key === "Escape"){
    document.querySelectorAll(".modal").forEach(m => m.classList.add("hidden"));
    if (!$("player").classList.contains("hidden")) closePlayer();
  }
});

/* ---------- boot ---------- */
applyAccent(settings.accent);
document.body.classList.toggle("nofx", !settings.fx);
renderLibTabs();
renderPills();
render();
