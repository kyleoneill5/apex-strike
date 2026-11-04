// Finish the shots the first pass missed: ICBM HUD overlap, a longer climb toward
// orbital speed with the horizon in frame, an ASM that dies at the surface, and a closer deck.
import pw from '/tmp/domtest/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;
const ART = '/opt/cursor/artifacts';
const log = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); fs.appendFileSync('/tmp/fu-live.log', s + '\n'); console.log(s); };
const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-gpu-sandbox']
});
const errs = [];
try {
  const page = await browser.newPage({ viewport: { width: 932, height: 430 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  page.setDefaultTimeout(180000);
  page.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 180)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 180)); });
  await page.goto('http://127.0.0.1:8841/dev/merged.html', { waitUntil: 'domcontentloaded', timeout: 240000 });
  await page.waitForFunction(() => window.__milsim && window.__c1 && window.__red, null, { timeout: 240000 });
  await page.evaluate(() => { const t = document.getElementById('tutOk'); if (t) t.click(); document.getElementById('menu').style.display = 'none'; __milsim.setPaused(false); try { settings.autoFollow = false; } catch (e) {} });
  log('ready');

  const hud = await page.evaluate(() => {
    spawn('fighter'); __milsim.setPaused(false); document.getElementById('menu').style.display = 'none';
    const o = { name: 'ICBM', man: true, done: false, phase: 'bus', type: 'ballistic', bus: { n: 1, dv: 180 },
      pos: player.mesh.position.clone().add(new THREE.Vector3(0, 80000, 0)), vel: new THREE.Vector3(1200, -40, 0),
      tgt: player.mesh.position.clone(), t: 200, boostT: 5, mach: 4, mesh: new THREE.Group(), owner: player };
    scene.add(o.mesh); o.mesh.position.copy(o.pos); camFollow = o; projs.push(o);
    __milsim.step(4, 1 / 30); if (window.__mwLay) __mwLay();
    const vis = e => { if (!e) return null; const cs = getComputedStyle(e); if (cs.display === 'none' || +cs.opacity < 0.05) return null; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 ? { l: r.left, t: r.top, r: r.right, b: r.bottom, id: e.id || e.textContent.trim().slice(0, 14) } : null; };
    const hit = (a, b) => a && b && Math.min(a.r, b.r) - Math.max(a.l, b.l) > 2 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 2;
    const cards = vis(document.getElementById('hcards'));
    const buttons = [...document.querySelectorAll('#gbar .gb,#gView')].map(vis).filter(Boolean);
    const overlaps = buttons.filter(b => hit(cards, b)).map(b => b.id);
    const also = ['mwMap','hr','topb','bFire','bWpn'].map(id => vis(document.getElementById(id))).filter(Boolean);
    const bar = vis(document.getElementById('gbar'));
    const barHits = also.filter(o => hit(bar, o)).map(o => o.id);
    return { cards: !!cards, labels: [...document.querySelectorAll('#gbar .gb,#gView .sg')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.textContent.trim().slice(0, 16)), overlaps, barHits };
  });
  log('HUD', hud);
  await page.screenshot({ path: ART + '/icbm_hud_932x430.png' });

  // ASM: one cruise, no other weapons, sub deep. Step until it dies and record the y it died at.
  const asm = await page.evaluate(() => {
    __red.W.splice(0).forEach(w => { try { scene.remove(w.mesh); } catch (e) {} });
    spawn('sub'); __milsim.setPaused(false); document.getElementById('menu').style.display = 'none';
    player.mesh.position.set(0, -60, 4000); player.depth = player.depthT = 60;
    const ship = __red.E.find(u => u.kind === 'ship');
    const from = new THREE.Vector3(800, 20, 4000);
    __red.fireW(ship, 'cruise', from, new THREE.Vector3(0, -60, 4000));
    const id = __red.W[__red.W.length - 1];
    let minY = 999, diedAt = null, n = 0;
    for (; n < 900; n++) {
      const before = __red.W.includes(id);
      if (before) minY = Math.min(minY, id.pos.y);
      __milsim.step(1, 1 / 30);
      if (before && !__red.W.includes(id)) { diedAt = minY; break; }
    }
    return { alive: player.alive, depth: Math.round(player.mesh.position.y), minY: +minY.toFixed(1), diedAt, frames: n };
  });
  log('ASM', asm);

  // closer look at a fleet ship so deck crew can read
  const crew = await page.evaluate(() => {
    const ships = window.__navy && __navy.ships;
    if (!ships || !ships.length) return { n: 0 };
    const s = ships[0];
    const p = s.m.position;
    camera.position.set(p.x + 40, 18, p.z + 30);
    camera.lookAt(p.x, 12, p.z);
    __milsim.step(2, 1 / 30);
    return { n: ships.length, kind: s.kind, crew: window.__c6crew || 0 };
  });
  log('CREW_CAM', crew);
  await page.screenshot({ path: ART + '/c6_deck_crew.png' });

  // keep climbing the Falcon and look back at the limb
  const orbit = await page.evaluate(() => {
    try { settings.autoFollow = false; } catch (e) {}
    __milsim.spawn('falcon9', 'pad'); __milsim.setPaused(false);
    document.getElementById('menu').style.display = 'none';
    const p = __milsim.player; p.os.auto = true; inp.throttle = 1; try { __milsim.ctxAction(); } catch (e) {} p.os.auto = true; inp.throttle = 1;
    const t0 = performance.now(); let n = 0; let best = 0;
    while (p.os && !p.os.orbit && performance.now() - t0 < 150000 && n < 20000) {
      __milsim.step(40, 1 / 30); n += 40; best = Math.max(best, p.os.speed || 0);
    }
    camFollow = null;
    const os = p.os;
    // look toward Earth from the vehicle
    const pos = p.mesh.position.clone();
    camera.position.copy(pos).add(new THREE.Vector3(0, 40, 180));
    camera.lookAt(pos.x, pos.y - 400, pos.z);
    camera.near = 1; camera.far = 5e6; camera.updateProjectionMatrix();
    __milsim.step(2, 1 / 30);
    const cards = document.getElementById('hcards') ? document.getElementById('hcards').innerText : '';
    return { n, ms: Math.round(performance.now() - t0), orbit: !!os.orbit, hKm: Math.round(os.h / 1000), v: Math.round(os.speed || best), best: Math.round(best), cards: cards.replace(/\n/g, ' | ').slice(0, 240) };
  });
  log('ORBIT2', orbit);
  await page.screenshot({ path: ART + '/orbit_limb_932x430.png' });
  fs.writeFileSync(ART + '/followup_report.json', JSON.stringify({ hud, asm, crew, orbit, errs: [...new Set(errs)].filter(e => !/favicon|vibrate/i.test(e)).slice(0, 10) }, null, 2));
} catch (e) {
  log('FAIL', e && e.stack || e);
  process.exitCode = 1;
} finally { await browser.close(); }
