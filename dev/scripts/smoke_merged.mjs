// Smoke + ICBM HUD overlap + MIRV cap on dev/merged.html
import pw from '/tmp/domtest/node_modules/playwright-core/index.js';
const { chromium } = pw;
import fs from 'fs';
const PORT = process.env.PORT || '8841';
const ART = '/opt/cursor/artifacts';
const URL = `http://127.0.0.1:${PORT}/dev/merged.html`;
const SIZES = [[844, 390], [852, 393], [932, 430], [956, 440]];
const log = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); fs.appendFileSync('/tmp/smoke-live.log', s + '\n'); console.log(s); };
fs.mkdirSync(ART, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-gpu-sandbox']
});
const errs = [];
try {
  const page = await browser.newPage({ viewport: { width: 932, height: 430 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  page.setDefaultTimeout(180000);
  page.on('pageerror', e => errs.push('PAGE ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 240000 });
  await page.waitForFunction(() => window.__milsim && window.__c1 && typeof spawn === 'function', null, { timeout: 240000 });
  await page.evaluate(() => { const t = document.getElementById('tutOk'); if (t) t.click(); const m = document.getElementById('menu'); if (m) m.style.display = 'none'; });
  log('mods', await page.evaluate(() => ({
    mp: !!window.__mp, save: !!window.__save, streak: !!window.__streak, aim: !!window.__aim, mod: !!window.__mod, c1: !!window.__c1,
    wpn: !!window.WPN, moon: !!window.__moon, nuke: !!window.NUKE2, sub: !!window.__sub, tank: !!window.__tank, base: !!window.__base,
    ppl: !!window.PPL, navy: typeof NAVY_FLEET !== 'undefined', land: !!window.__wland, c5: !!window.__c5, mirv: !!window.__mirvlock
  })));
  const keys = await page.evaluate(() => Object.keys(DEFS));
  log('vehicles', keys.length, keys.join(','));
  const bad = [];
  for (const k of keys) {
    const e0 = errs.length;
    const r = await page.evaluate(k => {
      try { spawn(k); setPaused(false); return player && player.kind; }
      catch (e) { return 'ERR ' + e.message; }
    }, k);
    const fresh = errs.slice(e0).filter(e => !/favicon/i.test(e));
    if (r !== k || fresh.length) bad.push([k, r, fresh.slice(0, 2)]);
  }
  log('SPAWN_BAD', bad);

  // darkstar specifically
  const ds = await page.evaluate(() => {
    const warns = [];
    const orig = console.warn;
    console.warn = (...a) => { warns.push(a.map(String).join(' ').slice(0, 200)); orig.apply(console, a); };
    let kind = null, err = null;
    try { spawn('darkstar'); kind = player && player.kind; } catch (e) { err = e.message; }
    console.warn = orig;
    return { kind, err, warns };
  });
  log('DARKSTAR', ds);

  // MIRV lock cap + off-screen boxes
  const mirv = await page.evaluate(() => {
    spawn('fighter'); setPaused(false);
    document.getElementById('menu').style.display = 'none';
    const origin = player.mesh.position.clone();
    camera.position.copy(origin).add(new THREE.Vector3(0, 30, 80));
    camera.lookAt(origin);
    camera.updateMatrixWorld(); camera.updateProjectionMatrix();
    const before = targets.length;
    const add = (x, y, z) => { const pos = new THREE.Vector3(x, y, z); const t = { alive: true, pos, mesh: { position: pos } }; targets.push(t); return t; };
    // three in front of the camera (on screen), many far off to the side
    for (let i = 0; i < 3; i++) add(origin.x + (i - 1) * 40, origin.y, origin.z - 200);
    for (let i = 0; i < 24; i++) add(origin.x + 80000, origin.y, origin.z + i * 500);
    const bus = { name: 'ICBM', done: false, owner: player, type: 'ballistic', pos: origin.clone(), tgt: origin.clone(), vel: new THREE.Vector3(0, 1, 0), t: 30, mesh: new THREE.Group() };
    projs.push(bus);
    // tick is on an interval; call by stepping the lock via a synthetic frame wait
    return { before, cap: __mirvlock.cap };
  });
  await page.waitForTimeout(250);
  const mirv2 = await page.evaluate(() => {
    const boxes = [...document.querySelectorAll('#mirvLock > div')].filter(b => b.style.display !== 'none');
    const edge = boxes.filter(b => {
      const x = parseFloat(b.style.left), y = parseFloat(b.style.top);
      return x < 8 || y < 8 || x > innerWidth - 8 || y > innerHeight - 8;
    }).length;
    return { locked: __mirvlock.locked.length, boxes: boxes.length, edge, cap: __mirvlock.cap };
  });
  log('MIRV', mirv, mirv2);

  // ICBM HUD at each landscape size
  const hud = [];
  for (const [w, h] of SIZES) {
    await page.setViewportSize({ width: w, height: h });
    const info = await page.evaluate(() => {
      spawn('fighter'); setPaused(false);
      const menu = document.getElementById('menu'); if (menu) menu.style.display = 'none';
      document.body.classList.remove('hudOff');
      const o = { name: 'ICBM', man: true, done: false, phase: 'bus', type: 'ballistic', bus: { n: 1, dv: 200 },
        pos: player.mesh.position.clone().add(new THREE.Vector3(0, 40000, 0)), vel: new THREE.Vector3(400, 20, 0),
        t: 200, boostT: 10, mesh: new THREE.Group(), owner: player };
      if (!o.mesh.parent) scene.add(o.mesh);
      o.mesh.position.copy(o.pos);
      camFollow = o;
      if (!projs.includes(o)) projs.push(o);
      __milsim.step(3, 1 / 30);
      if (window.__mwLay) __mwLay();
      const vis = e => { if (!e) return null; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return null; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 ? { l: r.left, t: r.top, r: r.right, b: r.bottom, id: e.id || e.className } : null; };
      const hit = (a, b) => a && b && Math.min(a.r, b.r) - Math.max(a.l, b.l) > 1 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 1;
      const cards = vis(document.getElementById('hcards'));
      const bar = vis(document.getElementById('gbar'));
      const buttons = [...document.querySelectorAll('#gbar .gb, #gView')].map(vis).filter(Boolean);
      const others = ['mwMap','hr','topb','bHud','bFire','bWpn','bCtx','bCam','thr','mwAmmo','mwKS'].map(id => vis(document.getElementById(id))).filter(Boolean);
      const overlaps = [];
      if (cards) for (const b of buttons.concat(bar ? [bar] : [])) if (hit(cards, b)) overlaps.push(['hcards', b.id || 'gbar']);
      if (bar) for (const o of others) if (hit(bar, o)) overlaps.push(['gbar', o.id]);
      const cardKids = [...document.querySelectorAll('#hcards .hg')].map(vis).filter(Boolean);
      for (const c of cardKids) for (const b of buttons) if (hit(c, b)) overlaps.push(['card', b.id]);
      return {
        cards: !!cards, bar: !!bar, nBtn: buttons.length, labels: buttons.map(b => (document.getElementById(b.id)?.textContent || b.id || '').slice(0, 24)),
        overlaps, gbar: bar, hcards: cards
      };
    });
    hud.push({ w, h, ...info });
    if (w === 932) await page.screenshot({ path: `${ART}/icbm_hud_932x430.png` });
    log('HUD', w, h, { cards: info.cards, bar: info.bar, nBtn: info.nBtn, labels: info.labels, overlaps: info.overlaps });
  }
  const cleanErr = [...new Set(errs)].filter(e => !/favicon/i.test(e));
  const report = { bad, ds, mirv: mirv2, hud, errs: cleanErr.slice(0, 20) };
  fs.writeFileSync(ART + '/smoke_report.json', JSON.stringify(report, null, 2));
  log('ERRS', cleanErr.slice(0, 15));
  if (bad.length || cleanErr.length || mirv2.locked > 3 || mirv2.boxes > 3 || mirv2.edge || hud.some(h => h.overlaps.length)) process.exitCode = 1;
} catch (e) {
  log('FAIL', e && e.stack || e);
  fs.writeFileSync(ART + '/smoke_report.json', JSON.stringify({ fail: String(e && e.stack || e), errs }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
