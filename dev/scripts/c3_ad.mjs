// Short #28 destroyer intercept + a breach frame. Fresh page, no 30-vehicle sweep.
import pw from '/tmp/domtest/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;
const ART = '/opt/cursor/artifacts';
const log = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); fs.appendFileSync('/tmp/c3ad-live.log', s + '\n'); console.log(s); };
const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-gpu-sandbox']
});
const errs = [];
try {
  const page = await browser.newPage({ viewport: { width: 932, height: 430 }, hasTouch: true, isMobile: true });
  page.setDefaultTimeout(120000);
  page.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  await page.goto('http://127.0.0.1:8841/dev/merged.html', { waitUntil: 'domcontentloaded', timeout: 240000 });
  await page.waitForFunction(() => window.__milsim && window.__sub && window.__rfW && window.__adf, null, { timeout: 200000 });
  await page.evaluate(() => { const t = document.getElementById('tutOk'); if (t) t.click(); document.getElementById('menu').style.display = 'none'; __milsim.setPaused(false); });
  log('ready');
  const breach = await page.evaluate(() => {
    spawn('sub'); __milsim.setPaused(false); document.getElementById('menu').style.display = 'none';
    const v = player; v.depth = v.depthT = 25; v.mesh.position.y = -25; __milsim.step(8, 1 / 30);
    v.wi = v.weapons.indexOf('HYPERSONIC'); __sub.fire(v);
    let best = null;
    for (let i = 0; i < 160; i++) {
      __milsim.step(1, 1 / 30);
      const L = __sub.SUBX.lc;
      const y = L && L.o ? L.o.pos.y : -99;
      if (!best || (y > 2 && y < 40)) best = { i, ph: L && L.phase, y: +y.toFixed(1), cam: +__sub.cam.y.toFixed(1) };
      if (y > 8 && y < 35) break;
    }
    return best;
  });
  log('BREACH', breach);
  await page.screenshot({ path: ART + '/sub_launch_breach.png' });
  const ship = await page.evaluate(() => {
    spawn('destroyer'); __milsim.setPaused(false); document.getElementById('menu').style.display = 'none';
    __milsim.step(5, 1 / 30);
    __ead.hp = 100; const R = __rfW(); R.W.length = 0; __adf.I.length = 0; __adf.vls = 0; __adf.ramT = 0;
    const k0 = __adf.kills; const p = player.mesh.position.clone();
    R.fireW('cruise', p.clone().add(new THREE.Vector3(2500, 20, 0)), p);
    let n = 0; const kinds = {};
    for (; n < 280 && R.W.length; n++) {
      __milsim.step(1, 1 / 30);
      for (const i of __adf.I) kinds[i.kind] = 1;
      if (__adf.kills > k0) break;
    }
    return { hp: __ead.hp, alive: player.alive, kills: __adf.kills - k0, frames: n, left: R.W.length, kinds };
  });
  log('SHIP', ship);
  const clean = [...new Set(errs)].filter(e => !/favicon|vibrate/i.test(e));
  log('ERRS', clean.slice(0, 6));
  fs.writeFileSync(ART + '/c3_ad.json', JSON.stringify({ breach, ship, errs: clean.slice(0, 8) }, null, 2));
  if (!ship.kills) process.exitCode = 2;
} catch (e) { log('FAIL', e && e.stack || e); process.exitCode = 1; }
finally { await browser.close(); }
