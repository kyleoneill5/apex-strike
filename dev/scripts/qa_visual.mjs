// Visual QA for the merged build: C4 orbit/moon/nuke, C6 armor/ships/crews/on-foot/Red fire,
// spawn-name guard, ICBM HUD, MIRV cap, and the submarine surface-detonation check.
import pw from '/tmp/domtest/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;
const ART = '/opt/cursor/artifacts';
const URL = 'http://127.0.0.1:8841/dev/merged.html';
const log = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); fs.appendFileSync('/tmp/qa-live.log', s + '\n'); console.log(s); };
fs.mkdirSync(ART, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-gpu-sandbox']
});
const errs = [];
const shot = (page, name) => page.screenshot({ path: ART + '/' + name + '.png' }).then(() => log('SHOT', name));
try {
  const page = await browser.newPage({ viewport: { width: 932, height: 430 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  page.setDefaultTimeout(180000);
  page.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 220)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 220)); });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 240000 });
  await page.waitForFunction(() => window.__milsim && window.__c1 && window.__red && window.__tank, null, { timeout: 240000 });
  const hide = () => page.evaluate(() => {
    const t = document.getElementById('tutOk'); if (t) t.click();
    for (const id of ['menu','mwCard','mwPrest','mwConfirm']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
    try { __milsim.setPaused(false); } catch (e) {}
  });
  await hide();
  log('ready');

  // ---- invalid vehicle name must not drop the current one ----
  const e0 = errs.length;
  const guard = await page.evaluate(() => {
    spawn('fighter');
    const a = player.kind;
    const r1 = spawn('burke');
    const b = player && player.kind;
    __tank.spawnK('abrams');
    const c = player && player.kind;
    const pl1 = !!__tank.PL;
    const r2 = spawn('not-a-vehicle');
    return { fighter: a, afterBurke: b, sameObj: r1 === player, abrams: c, pl: pl1, afterBad: player && player.kind, pl2: !!__tank.PL, mesh: !!(player && player.mesh) };
  });
  await page.waitForTimeout(400);
  const guardErr = errs.slice(e0).filter(e => !/favicon|vibrate/i.test(e));
  log('GUARD', guard, 'errs', guardErr.length);

  // ---- Red forces engage (30 s of sim), player on foot so the old air/sea gate would fail ----
  const red = await page.evaluate(() => {
    __base.spawnAt('afb');
    __milsim.setPaused(false);
    document.getElementById('menu').style.display = 'none';
    let maxW = 0; const samples = [];
    for (let i = 0; i < 30; i++) {
      __milsim.step(30, 1 / 30);
      maxW = Math.max(maxW, __red.W.length);
      if (i % 5 === 4) samples.push(__red.W.length);
    }
    return { onFoot: player.kind, alive: __red.E.filter(u => u.hp > 0).length, maxW, samples, kinds: __red.W.map(w => w.w).slice(0, 8) };
  });
  log('RED', red);

  // ---- Abrams with AI armor ----
  await page.evaluate(() => { __tank.spawnK('abrams'); __milsim.setPaused(false); document.getElementById('menu').style.display = 'none'; __milsim.step(15, 1 / 30); });
  await hide();
  const tank = await page.evaluate(() => ({ kind: player.kind, n: __tank.V.length, red: __tank.V.filter(v => v.side === 'red').length }));
  log('TANK', tank);
  await shot(page, 'c6_abrams');

  // ---- US ships and deck crews ----
  await page.evaluate(() => { spawn('destroyer'); __milsim.setPaused(false); document.getElementById('menu').style.display = 'none'; __milsim.step(20, 1 / 30); });
  await page.waitForTimeout(1500);
  const navy = await page.evaluate(() => ({ kind: player.kind, ships: (typeof NAVY_FLEET !== 'undefined' ? NAVY_FLEET.ships.length : 0), crew: window.__c6crew || 0, ppl: !!window.__pplReady }));
  log('NAVY', navy);
  await shot(page, 'c6_navy_crews');

  // ---- on-foot enter/exit: aircraft, ship, Abrams (tank exit is the long-press) ----
  const flow = async (k) => page.evaluate(async (k) => {
    try {
      __base.spawnAt(k === 'destroyer' || k === 'sub' ? 'nav' : k === 'armor' ? 'army' : 'afb');
      __milsim.setPaused(false);
      document.getElementById('menu').style.display = 'none';
      __milsim.step(5, 1 / 30);
      const P = __base.props.find(p => k === 'air' ? !['destroyer','sub','heli'].includes(p.kind) && !/abrams|bradley|stryker|jltv|paladin/.test(p.kind) : k === 'armor' ? /abrams|bradley|stryker|jltv/.test(p.kind) : p.kind === k);
      if (!P) return { k, err: 'noprop', kinds: [...new Set(__base.props.map(p => p.kind))] };
      player.mesh.position.copy(P.mesh.position);
      __base.enter(P);
      for (let i = 0; i < 90 && (__base.anim || __base.on); i++) __milsim.step(1, 1 / 30);
      const inV = player.kind;
      if (k === 'armor') {
        player.vel && player.vel.set(0, 0, 0); if (player.tk) player.tk.spd = 0; player.spd = 0; player.onGround = true;
        const el = document.getElementById('bWpn');
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await new Promise(r => setTimeout(r, 800));
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        __milsim.step(5, 1 / 30);
        return { k: P.kind, inV, after: player.kind, onFoot: __base.on };
      }
      player.vel && player.vel.set(0, 0, 0); player.spd = 0; player.onGround = true; player.own = true;
      const ce = __base.canExit();
      const ex = __base.exit();
      __milsim.step(4, 1 / 30);
      return { k: P.kind, inV, canExit: ce, exit: ex, after: player.kind, onFoot: __base.on };
    } catch (e) { return { k, err: e.message }; }
  }, k);
  for (const k of ['air', 'destroyer', 'armor']) log('FLOW', k, await flow(k));
  await hide();
  await shot(page, 'c6_onfoot');

  // ---- sub: third person underwater, surface, ASM detonates at the surface ----
  const sub = await page.evaluate(() => {
    spawn('sub'); __milsim.setPaused(false);
    document.getElementById('menu').style.display = 'none';
    const v = player; v.depth = v.depthT = 80; v.mesh.position.y = -80;
    __milsim.step(10, 1 / 30);
    const ship = __red.E.find(u => u.kind === 'ship' && u.k !== 'boat') || __red.E.find(u => u.kind === 'ship');
    const from = v.mesh.position.clone(); from.y = 12; from.x += 400;
    const alive0 = v.alive; const y0 = v.mesh.position.y;
    __red.fireW(ship, 'cruise', from, v.mesh.position.clone());
    let detY = null, frames = 0;
    for (let i = 0; i < 200 && __red.W.length; i++) { __milsim.step(1, 1 / 30); frames++; const w = __red.W.find(x => x.w === 'cruise'); if (w) detY = w.pos.y; }
    return { alive0, alive1: player.alive, y0: Math.round(y0), y1: Math.round(player.mesh.position.y), frames, lastMissileY: detY, weaponsLeft: __red.W.length, deep: player.mesh.position.y < -18 };
  });
  log('SUB_ASM', sub);
  await page.evaluate(() => {
    player.mesh.position.y = -40; if (player.depth != null) player.depth = player.depthT = 40;
    const p = player.mesh.position;
    camera.position.set(p.x + 35, p.y + 4, p.z + 20);
    camera.lookAt(p);
    __milsim.step(2, 1 / 30);
  });
  await shot(page, 'sub_underwater');
  await page.evaluate(() => {
    player.mesh.position.y = -1; if (player.depth != null) { player.depth = 2; player.depthT = 0; }
    const p = player.mesh.position;
    camera.position.set(p.x + 40, 8, p.z + 30);
    camera.lookAt(p.x, 1, p.z);
    __milsim.step(2, 1 / 30);
  });
  await shot(page, 'sub_surfacing');

  // ---- orbit limb ----
  const orbit = await page.evaluate(() => {
    __milsim.spawn('falcon9', 'pad'); __milsim.setPaused(false);
    document.getElementById('menu').style.display = 'none';
    const p = __milsim.player; p.os.auto = true; try { inp.throttle = 1; } catch (e) {}
    try { __milsim.ctxAction(); } catch (e) {} p.os.auto = true;
    const t0 = performance.now(); let n = 0;
    while (p.os && !p.os.orbit && performance.now() - t0 < 50000 && n < 24000) { __milsim.step(30, 1 / 30); n += 30; }
    const o = p.os || {};
    const cards = (document.getElementById('hcards') || {}).innerText || '';
    return { n, orbit: !!o.orbit, hKm: Math.round((o.h || 0) / 1000), v: Math.round(o.speed || 0), cards: cards.slice(0, 280) };
  });
  log('ORBIT', orbit);
  await page.evaluate(() => { try { const F = __milsim.FL; if (F) { F.yaw = 2.1; F.pitch = 0.2; F.zoom = F.zoomT = 1.6; F.idle = -1e9; } } catch (e) {} __milsim.step(6, 1 / 30); if (window.__mwLay) __mwLay(); });
  await shot(page, 'orbit_limb_932x430');

  // ---- moon pad + a bit of staging ----
  const moon = await page.evaluate(() => {
    try { __moon.stop && __moon.stop(); } catch (e) {}
    __moon.autoAll = true; __moon.start('apollo');
    if (__moon.frame) __moon.frame(0.05);
    return { ph: __moon.F && __moon.F.ph };
  });
  log('MOON_PAD', moon);
  await page.waitForTimeout(300);
  await shot(page, 'moon_apollo_pad');
  const stage = await page.evaluate(() => { const ph = __moon.sim(150); if (__moon.frame) __moon.frame(0.05); const ev = (__moon.F.events || []).filter(e => e.txt).map(e => e.txt); return { ph, ev: ev.slice(0, 10) }; });
  log('MOON_STAGE', stage);
  await shot(page, 'moon_apollo_staging');

  // ---- nuke ----
  const nuke = await page.evaluate(() => {
    try { __moon.stop && __moon.stop(); } catch (e) {}
    __milsim.spawn('f22'); __milsim.setPaused(false);
    document.getElementById('menu').style.display = 'none';
    __milsim.step(4, 1 / 30);
    const c = player.mesh.position; const p = [c.x + 4500, 0, c.z];
    NUKE2.det(new THREE.Vector3(...p));
    try { NUKE2.cam([[p[0] - 5500, 70, p[2] - 900], [p[0], 700, p[2]]]); } catch (e) {}
    __milsim.step(160, 0.04);
    return { n: NUKE2.L.length };
  });
  log('NUKE', nuke);
  await shot(page, 'nuke_detonation');

  // ---- ICBM HUD overlap ----
  await page.setViewportSize({ width: 932, height: 430 });
  const hud = await page.evaluate(() => {
    spawn('fighter'); __milsim.setPaused(false); document.getElementById('menu').style.display = 'none';
    const o = { name: 'ICBM', man: true, done: false, phase: 'bus', type: 'ballistic', bus: { n: 1, dv: 180 },
      pos: player.mesh.position.clone().add(new THREE.Vector3(0, 50000, 0)), vel: new THREE.Vector3(500, 20, 0),
      t: 220, boostT: 5, mesh: new THREE.Group(), owner: player };
    scene.add(o.mesh); camFollow = o; projs.push(o);
    __milsim.step(3, 1 / 30); if (window.__mwLay) __mwLay();
    const vis = e => { if (!e) return null; const cs = getComputedStyle(e); if (cs.display === 'none' || +cs.opacity < 0.05) return null; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 ? r : null; };
    const hit = (a, b) => a && b && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
    const cards = vis(document.getElementById('hcards'));
    const buttons = [...document.querySelectorAll('#gbar .gb,#gView')].map(vis).filter(Boolean);
    const overlaps = [];
    buttons.forEach((b, i) => { if (hit(cards, b)) overlaps.push(i); });
    return { cards: !!cards, nBtn: buttons.length, overlaps, labels: [...document.querySelectorAll('#gbar .gb,#gView .sg')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.textContent.trim().slice(0, 16)) };
  });
  log('HUD', hud);
  await shot(page, 'icbm_hud_932x430');

  const clean = [...new Set(errs)].filter(e => !/favicon|vibrate/i.test(e));
  const report = { guard, guardErr, red, tank, navy, sub, orbit, stage, nuke, hud, errs: clean.slice(0, 15) };
  fs.writeFileSync(ART + '/qa_report.json', JSON.stringify(report, null, 2));
  log('ERRS', clean.slice(0, 8));
  const ok = guard.afterBurke === 'fighter' && guard.afterBad === 'abrams' && guard.mesh && red.maxW > 0 && hud.overlaps.length === 0 && !guardErr.length;
  if (!ok) process.exitCode = 2;
} catch (e) {
  log('FAIL', e && e.stack || e);
  process.exitCode = 1;
} finally { await browser.close(); }
