// C3 checks on the merged build: console errors, every vehicle, ship defense kills,
// IDAS kill at periscope depth, underwater + breach screenshots.
import pw from '/tmp/domtest/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;
const ART = '/opt/cursor/artifacts';
const log = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); fs.appendFileSync('/tmp/c3v-live.log', s + '\n'); console.log(s); };
fs.mkdirSync(ART, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-gpu-sandbox']
});
const errs = [];
try {
  const page = await browser.newPage({ viewport: { width: 932, height: 430 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  page.setDefaultTimeout(180000);
  page.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  page.on('response', r => { if (r.status() >= 400 && !/favicon/i.test(r.url())) errs.push('HTTP' + r.status() + ' ' + r.url().slice(0, 140)); });
  await page.goto('http://127.0.0.1:8841/dev/merged.html', { waitUntil: 'domcontentloaded', timeout: 240000 });
  await page.waitForFunction(() => window.__milsim && window.__sub && window.__rfW && window.__adf, null, { timeout: 240000 });
  await page.evaluate(() => { const t = document.getElementById('tutOk'); if (t) t.click(); document.getElementById('menu').style.display = 'none'; __milsim.setPaused(false); });
  log('mods', await page.evaluate(() => ({ sub: !!__sub.SUBX, adf: !!__adf, rf: !!__rfW })));

  const keys = await page.evaluate(() => Object.keys(DEFS));
  const bad = [];
  for (const k of keys) {
    const e0 = errs.length;
    const r = await page.evaluate(k => { try { spawn(k); __milsim.setPaused(false); __milsim.step(2, 1 / 30); return player && player.kind; } catch (e) { return 'ERR ' + e.message; } }, k);
    const fresh = errs.slice(e0).filter(e => !/favicon|vibrate/i.test(e));
    if (r !== k || fresh.length) bad.push([k, r, fresh.slice(0, 1)]);
  }
  log('SPAWN', keys.length, 'bad', bad);

  // Breach: cold launch from 30 m, shoot the air phase.
  await page.evaluate(() => {
    spawn('sub'); __milsim.setPaused(false); document.getElementById('menu').style.display = 'none';
    const v = player; v.depth = v.depthT = 30; v.mesh.position.y = -30;
    __milsim.step(20, 1 / 30);
    v.wi = v.weapons.indexOf('HYPERSONIC');
    __sub.fire(v);
  });
  await page.evaluate(() => __milsim.step(30, 1 / 30));
  const tube = await page.evaluate(() => { const L = __sub.SUBX.lc; return L && { ph: L.phase, y: +player.mesh.position.y.toFixed(1), my: L.o && +L.o.pos.y.toFixed(1) }; });
  log('TUBE', tube);
  await page.screenshot({ path: ART + '/sub_launch_tube.png' });
  await page.evaluate(() => __milsim.step(50, 1 / 30));
  const breach = await page.evaluate(() => { const L = __sub.SUBX.lc; return L && { ph: L.phase, y: L.o && +L.o.pos.y.toFixed(1), cam: +__sub.cam.y.toFixed(1) }; });
  log('BREACH', breach);
  await page.screenshot({ path: ART + '/sub_launch_breach.png' });

  // IDAS at periscope (1 m): put the inbound cruise close so the interceptor can kill it.
  const idas = await page.evaluate(() => {
    spawn('sub'); __milsim.setPaused(false);
    const v = player; v.depth = v.depthT = 1; v.mesh.position.y = -1; __ead.hp = 100;
    const R = __rfW(); R.W.length = 0; __adf.I.length = 0; __adf.samT = 0;
    const k0 = __adf.kills;
    const p = v.mesh.position.clone();
    R.fireW('cruise', p.clone().add(new THREE.Vector3(1600, 40, 0)), p.clone().setY(2));
    let n = 0, sams = 0;
    for (; n < 700 && (R.W.length || __adf.I.length); n++) { __milsim.step(1, 1 / 30); sams = Math.max(sams, __adf.I.length); if (__adf.kills > k0 && !R.W.length) break; }
    return { y: +v.mesh.position.y.toFixed(1), alive: v.alive, hp: __ead.hp, sams, kills: __adf.kills - k0, frames: n, left: R.W.length };
  });
  log('IDAS', idas);

  // Destroyer layered defense vs an inbound cruise.
  const ship = await page.evaluate(() => {
    spawn('destroyer'); __milsim.setPaused(false); document.getElementById('menu').style.display = 'none';
    __milsim.step(10, 1 / 30);
    const v = player; __ead.hp = 100;
    const R = __rfW(); R.W.length = 0; __adf.I.length = 0; __adf.vls = 0; __adf.ramT = 0;
    const k0 = __adf.kills;
    const p = v.mesh.position.clone();
    R.fireW('cruise', p.clone().add(new THREE.Vector3(8000, 25, 0)), p);
    let n = 0, kinds = {};
    for (; n < 900 && R.W.length; n++) {
      __milsim.step(1, 1 / 30);
      for (const i of __adf.I) kinds[i.kind] = (kinds[i.kind] || 0) + 1;
      if (__adf.kills > k0 && !R.W.length) break;
    }
    return { hp: __ead.hp, alive: v.alive, kills: __adf.kills - k0, frames: n, left: R.W.length, kinds };
  });
  log('SHIP_AD', ship);

  const clean = [...new Set(errs)].filter(e => !/favicon|vibrate/i.test(e));
  fs.writeFileSync(ART + '/c3_verify.json', JSON.stringify({ bad, tube, breach, idas, ship, errs: clean.slice(0, 12) }, null, 2));
  log('ERRS', clean.slice(0, 8));
  if (bad.length || clean.length || !idas.kills || !ship.kills) process.exitCode = 2;
} catch (e) {
  log('FAIL', e && e.stack || e);
  process.exitCode = 1;
} finally { await browser.close(); }
