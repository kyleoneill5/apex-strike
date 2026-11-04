// Render checks the C4 handoff could not: orbit limb + 7.8 km/s class readout,
// Apollo pad and staging, nuke detonation. Also ICBM HUD overlap and MIRV cap.
import pw from '/tmp/domtest/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;
const ART = '/opt/cursor/artifacts';
const URL = 'http://127.0.0.1:8841/dev/merged.html';
const log = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); fs.appendFileSync('/tmp/c4-live.log', s + '\n'); console.log(s); };
fs.mkdirSync(ART, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-gpu-sandbox']
});
const errs = [];
try {
  const page = await browser.newPage({ viewport: { width: 932, height: 430 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  page.setDefaultTimeout(180000);
  page.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 240)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 240)); });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 240000 });
  await page.waitForFunction(() => window.__milsim && window.__moon && window.NUKE2 && window.__c1, null, { timeout: 240000 });
  await page.evaluate(() => { const m = document.getElementById('menu'); if (m) m.style.display = 'none'; const t = document.getElementById('tutOk'); if (t) t.click(); });
  log('ready', await page.evaluate(() => ({ moon: !!__moon.start, nuke: typeof NUKE2.det, ws: !!__wspace, land: !!__wland })));

  // ---- orbit ----
  const orbit = await page.evaluate(() => {
    __milsim.spawn('falcon9', 'pad');
    __milsim.setPaused(false);
    document.getElementById('menu').style.display = 'none';
    const p = __milsim.player;
    p.os.auto = true;
    try { inp.throttle = 1; } catch (e) {}
    try { __milsim.ctxAction(); } catch (e) {}
    p.os.auto = true;
    const t0 = performance.now();
    let n = 0;
    while (p.os && !p.os.orbit && performance.now() - t0 < 70000 && n < 30000) { __milsim.step(25, 1 / 30); n += 25; }
    const o = p.os || {};
    const cards = document.getElementById('hcards') ? document.getElementById('hcards').innerText : '';
    const hl = document.getElementById('hl') ? document.getElementById('hl').textContent : '';
    return { n, ms: Math.round(performance.now() - t0), orbit: !!o.orbit, h: Math.round((o.h || 0) / 1000), v: Math.round(o.speed || Math.hypot(o.vs || 0, o.vh || 0)), cards: cards.slice(0, 400), hl: (hl || '').slice(0, 300) };
  });
  log('ORBIT', orbit);
  await page.evaluate(() => {
    try { const F = __milsim.FL; if (F) { F.yaw = 2.2; F.pitch = 0.15; F.zoom = 2.2; F.zoomT = 2.2; F.idle = -1e9; } } catch (e) {}
    __milsim.step(8, 1 / 30);
    if (window.__mwLay) __mwLay();
  });
  await page.screenshot({ path: ART + '/orbit_limb_932x430.png' });
  log('SHOT orbit_limb_932x430.png');

  // ---- moon pad + staging ----
  const pad = await page.evaluate(() => {
    try { __moon.stop && __moon.stop(); } catch (e) {}
    __moon.autoAll = true;
    __moon.start('apollo');
    __moon.frame && __moon.frame(0.05);
    return { on: __moon.on, ph: __moon.F && __moon.F.ph };
  });
  log('PAD', pad);
  await page.waitForTimeout(400);
  await page.screenshot({ path: ART + '/moon_apollo_pad.png' });
  const stage = await page.evaluate(() => {
    const ph = __moon.sim(160);
    __moon.frame && __moon.frame(0.05);
    const ev = (__moon.F && __moon.F.events || []).filter(e => e.txt).map(e => e.txt);
    return { ph, ev: ev.slice(0, 12) };
  });
  log('STAGE', stage);
  await page.waitForTimeout(300);
  await page.screenshot({ path: ART + '/moon_apollo_staging.png' });

  // ---- nuke ----
  const nuke = await page.evaluate(() => {
    try { __moon.stop && __moon.stop(); } catch (e) {}
    __milsim.spawn('f22');
    __milsim.setPaused(false);
    document.getElementById('menu').style.display = 'none';
    __milsim.step(5, 1 / 30);
    const c = __milsim.player.mesh.position;
    const p = [c.x + 5000, 0, c.z];
    NUKE2.det(new THREE.Vector3(p[0], p[1], p[2]));
    try { NUKE2.cam([[p[0] - 6000, 80, p[2] - 1200], [p[0], 900, p[2]]]); } catch (e) {}
    __milsim.step(180, 0.04);
    return { n: NUKE2.L.length, ph: 'det' };
  });
  log('NUKE', nuke);
  await page.waitForTimeout(300);
  await page.screenshot({ path: ART + '/nuke_detonation.png' });

  // ---- foot spawn ----
  const foot = await page.evaluate(() => {
    try { const k = spawn('foot'); return { kind: player && player.kind, ok: !!(player && player.mesh) }; }
    catch (e) { return { err: e.message }; }
  });
  log('FOOT', foot);

  // ---- MIRV cap, real meshes so the sim keeps running ----
  const mirv = await page.evaluate(() => {
    spawn('fighter'); __milsim.setPaused(false);
    document.getElementById('menu').style.display = 'none';
    const origin = player.mesh.position.clone();
    camera.position.copy(origin).add(new THREE.Vector3(0, 40, 120));
    camera.lookAt(origin); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
    const made = [];
    const add = (x, y, z) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(4, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffee66 }));
      mesh.position.set(x, y, z); scene.add(mesh);
      const t = { alive: true, pos: mesh.position, mesh, kind: 'drone', vel: new THREE.Vector3(), hdg: 0, resp: 0, phase: 0, spd: 0, R: 1, cx: x, cz: z, alt: y };
      targets.push(t); made.push(t); return t;
    };
    for (let i = 0; i < 3; i++) add(origin.x + (i - 1) * 30, origin.y + 10, origin.z - 180);
    for (let i = 0; i < 20; i++) add(origin.x + 90000, origin.y, origin.z + i * 400);
    const bus = { name: 'ICBM', done: false, owner: player, type: 'ballistic', pos: origin.clone(), tgt: origin.clone(), vel: new THREE.Vector3(10, 1, 0), t: 30, boostT: 1, mesh: new THREE.Group(), sep: false };
    scene.add(bus.mesh); projs.push(bus);
    return made.length;
  });
  await page.waitForTimeout(300);
  const mirv2 = await page.evaluate(() => {
    const boxes = [...document.querySelectorAll('#mirvLock > div')].filter(b => b.style.display !== 'none' && b.getBoundingClientRect().width > 0);
    const edge = boxes.filter(b => { const x = b.getBoundingClientRect().left, y = b.getBoundingClientRect().top; return x < 4 || y < 4 || x > innerWidth - 20 || y > innerHeight - 20; }).length;
    return { locked: __mirvlock.locked.length, boxes: boxes.length, edge, cap: __mirvlock.cap };
  });
  log('MIRV', mirv, mirv2);
  await page.evaluate(() => { for (const t of targets) if (t.pos && Math.abs(t.pos.x) > 50000) t.alive = false; });

  // ---- ICBM HUD overlap at landscape sizes ----
  const sizes = [[844, 390], [852, 393], [932, 430], [956, 440]];
  const hud = [];
  for (const [w, h] of sizes) {
    await page.setViewportSize({ width: w, height: h });
    const info = await page.evaluate(() => {
      spawn('fighter'); __milsim.setPaused(false);
      document.getElementById('menu').style.display = 'none';
      document.body.classList.remove('hudOff');
      const o = { name: 'ICBM', man: true, done: false, phase: 'bus', type: 'ballistic', bus: { n: 1, dv: 200 },
        pos: player.mesh.position.clone().add(new THREE.Vector3(0, 40000, -200)), vel: new THREE.Vector3(400, 30, 0),
        t: 200, boostT: 10, mesh: new THREE.Group(), owner: player };
      if (!o.mesh.parent) scene.add(o.mesh);
      o.mesh.position.copy(o.pos);
      camFollow = o;
      if (!projs.includes(o)) projs.push(o);
      __milsim.step(4, 1 / 30);
      if (window.__mwLay) __mwLay();
      const vis = e => { if (!e) return null; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return null; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 ? { l: r.left, t: r.top, r: r.right, b: r.bottom, id: e.id || '' } : null; };
      const hit = (a, b) => a && b && Math.min(a.r, b.r) - Math.max(a.l, b.l) > 2 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 2;
      const cards = vis(document.getElementById('hcards'));
      const buttons = [...document.querySelectorAll('#gbar .gb,#gView')].map(vis).filter(Boolean);
      const overlaps = [];
      for (const b of buttons) if (hit(cards, b)) overlaps.push(b.id || 'gView');
      const labels = [...document.querySelectorAll('#gbar .gb,#gView .sg')].filter(e => getComputedStyle(e).display !== 'none').map(e => (e.textContent || '').trim().slice(0, 18));
      return { cards: !!cards, nBtn: buttons.length, labels, overlaps };
    });
    hud.push({ w, h, ...info });
    if (w === 932) await page.screenshot({ path: ART + '/icbm_hud_932x430.png' });
    log('HUD', w, h, info);
  }
  const clean = [...new Set(errs)].filter(e => !/favicon/i.test(e) && !/navigator\.vibrate/i.test(e));
  const report = { orbit, pad, stage, nuke, foot, mirv: mirv2, hud, errs: clean.slice(0, 20) };
  fs.writeFileSync(ART + '/c4_visual_report.json', JSON.stringify(report, null, 2));
  log('ERRS', clean.slice(0, 12));
  const hudBad = hud.some(x => x.overlaps.length || !x.cards);
  if (hudBad || (mirv2.locked > 3) || (mirv2.boxes > 3) || mirv2.edge || foot.err || foot.kind !== 'foot') process.exitCode = 2;
} catch (e) {
  log('FAIL', e && e.stack || e);
  process.exitCode = 1;
} finally { await browser.close(); }
