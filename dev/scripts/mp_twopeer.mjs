// Two-peer proof for DOMINION multiplayer. Chromium + local relay.
import pw from '/tmp/domtest/node_modules/playwright-core/index.js';
const { chromium } = pw;
import fs from 'fs';
const PORT = process.env.PORT || '8841';
const RELAY = process.env.RELAY || '8931';
const ART = '/opt/cursor/artifacts';
const URL = `http://127.0.0.1:${PORT}/dev/test_mp.html?mptest&mprelay=ws://127.0.0.1:${RELAY}`;
const TAGS = ['kyle','kyleoneill','kyleoneill5','dominion','owner','ceo','admin'];
const log = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); fs.appendFileSync('/tmp/mp-live.log', s + '\n'); console.log(s); };
fs.mkdirSync(ART, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-gpu-sandbox']
});
const errs = { A: [], B: [] };
const shot = async (page, name) => {
  const p = `${ART}/${name}.png`;
  await page.screenshot({ path: p });
  log('SHOT', p);
};
try {
  const mk = async (n) => {
    const ctx = await browser.newContext({ viewport: { width: 932, height: 430 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    page.setDefaultTimeout(180000);
    page.on('pageerror', e => errs[n].push('PAGE ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs[n].push(m.text().slice(0, 300)); });
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 180000 });
    await page.waitForFunction(() => window.__mp && window.__c1 && typeof spawn === 'function', null, { timeout: 240000 });
    await page.evaluate(() => { const m = document.getElementById('menu'); if (m) m.style.display = 'none'; const t = document.getElementById('tutOk'); if (t) t.click(); });
    return page;
  };
  log('loading A');
  const A = await mk('A');
  log('loading B');
  const B = await mk('B');
  const code = await A.evaluate(() => __mp.host());
  log('HOST', code, 'state', await A.evaluate(() => __mp.state), 'owner', await A.evaluate(() => __mp.isOwner));
  if (!code || String(code).startsWith('ERR')) throw new Error('host failed ' + code);
  await B.evaluate(c => __mp.join(c), code);
  await B.waitForFunction(() => __mp.state === 'on', null, { timeout: 20000 });
  log('JOINED', await B.evaluate(() => ({ state: __mp.state, code: __mp.code, host: __mp.isHost, owner: __mp.isOwner, players: __mp.players.length })));
  await A.evaluate(() => __c1.open());
  await B.evaluate(() => __c1.open());
  await A.waitForTimeout(400);
  await shot(A, 'mp_peer_a_room');
  await shot(B, 'mp_peer_b_room');
  const room = await A.evaluate(() => document.getElementById('c1Net')?.innerText || '');
  const roomB = await B.evaluate(() => document.getElementById('c1Net')?.innerText || '');
  log('ROOM_A', room.replace(/\n/g, ' | '));
  log('ROOM_B', roomB.replace(/\n/g, ' | '));
  await A.evaluate(() => document.getElementById('c1MP')?.remove());
  await B.evaluate(() => document.getElementById('c1MP')?.remove());

  // reserved tags: non-owner blocked, owner allowed
  const tagB = await B.evaluate(tags => {
    const out = {};
    for (const t of tags) { __mp.setName(t); out[t] = localStorage.getItem('mp_name'); }
    __mp.setName('Raven');
    out.kept = localStorage.getItem('mp_name');
    return out;
  }, TAGS);
  const tagA = await A.evaluate(() => { __mp.setName('kyle'); return localStorage.getItem('mp_name'); });
  log('TAGS_B', tagB);
  log('TAG_A_OWNER', tagA);

  // streak before any kills: owner ready, joiner not
  const streak0 = {
    A: await A.evaluate(() => ({ ready: __streak.ready, kills: __streak.kills, owner: __mp.isOwner })),
    B: await B.evaluate(() => ({ ready: __streak.ready, kills: __streak.kills, owner: __mp.isOwner }))
  };
  log('STREAK0', streak0);

  // aimbot + mod + ufo gates
  const gates = await B.evaluate(async () => {
    __aim.on = true;
    const aim = __aim.on;
    const mod = __mod.open();
    const tr3b = __mpRaw('tr3b');
    const ss = __mpRaw('starship');
    const saucer = __mpRaw('saucer');
    __mpRaw('fighter');
    return { aim, mod, tr3b, ss, saucer, modEl: !!document.getElementById('mpMod') && getComputedStyle(document.getElementById('mpMod')).display !== 'none' };
  });
  const gatesA = await A.evaluate(() => {
    __aim.on = true;
    const aim = __aim.on;
    const mod = __mod.open();
    if (mod) __mod.close();
    const tr3b = __mpRaw('tr3b');
    __mpRaw('fighter');
    return { aim, mod, tr3b };
  });
  log('GATES_B', gates);
  log('GATES_A', gatesA);

  // positions + a real kill
  await A.evaluate(() => { __mpSpawn('fighter'); setPaused(false); __mpPos(0, 800, 0); document.getElementById('menu').style.display = 'none'; });
  await B.evaluate(() => { __mpSpawn('fighter'); setPaused(false); __mpPos(0, 800, -40); document.getElementById('menu').style.display = 'none'; });
  await A.waitForTimeout(1800);
  const seen = await A.evaluate(() => {
    const r = [...__mp._st.remotes.values()][0];
    return r ? { kind: r.kind, p: r.mesh.position.toArray().map(n => Math.round(n)) } : null;
  });
  const seenB = await B.evaluate(() => {
    const r = [...__mp._st.remotes.values()][0];
    return r ? { kind: r.kind, p: r.mesh.position.toArray().map(n => Math.round(n)) } : null;
  });
  log('A_SEES_B', seen, 'B_SEES_A', seenB);

  const shoot = await A.evaluate(async () => {
    setPaused(false);
    const r = [...__mp._st.remotes.values()][0];
    if (!r) return 'no-remote';
    player.wi = player.weapons.indexOf('GUN');
    player.ammo.GUN = 9999;
    let fired = 0;
    for (let n = 0; n < 70 && __mp.kills < 1; n++) {
      __mpPos(0, 800, 0);
      player.mesh.lookAt(r.mesh.position);
      player.cool = 0;
      fireWeapon(player);
      fired++;
      await new Promise(res => requestAnimationFrame(res));
    }
    return { fired, kills: __mp.kills, hpRemote: null };
  });
  log('SHOOT', shoot);
  await B.evaluate(() => { __mpPos(0, 800, -40); });
  await A.waitForTimeout(600);
  const kA = await A.evaluate(() => ({ kills: __mp.kills, feed: document.getElementById('kfeed')?.innerText || '' }));
  const kB = await B.evaluate(() => ({ deaths: __mp.deaths, hp: __mp.hp, feed: document.getElementById('kfeed')?.innerText || '' }));
  log('KILL_A', kA);
  log('KILL_B', kB);
  await shot(A, 'mp_peer_a_killfeed');
  await shot(B, 'mp_peer_b_killfeed');

  // pad B's streak to 6 then 7 using host-authoritative kill messages (the real kill above is #1)
  const streakMid = await A.evaluate(() => {
    const bid = [...__mp._st.remotes.keys()][0];
    // B's own death zeroed the streak. Credit six kills (still under the 7 threshold).
    for (let i = 0; i < 6; i++) __mp.send({ t: 'k', killer: bid, victim: 'bot' + i, w: 'GUN', p: [0, 0, 0] });
    return bid;
  });
  await B.waitForTimeout(500);
  const at6 = await B.evaluate(() => ({ kills: __streak.kills, ready: __streak.ready }));
  await A.evaluate(bid => { __mp.send({ t: 'k', killer: bid, victim: 'bot9', w: 'GUN', p: [0, 0, 0] }); }, streakMid);
  await B.waitForTimeout(400);
  const at7 = await B.evaluate(() => ({ kills: __streak.kills, ready: __streak.ready, need: __streak.NEED }));
  const ownerStill = await A.evaluate(() => __streak.ready);
  log('STREAK_B', { at6, at7, ownerStill });

  // backup code
  const save = await B.evaluate(async () => {
    __prog.add(777);
    __save.write();
    const before = __prog.d.tot;
    const code = __save.exportCode();
    return { before, code };
  });
  await B.evaluate(() => localStorage.clear());
  await B.reload({ waitUntil: 'domcontentloaded' });
  await B.waitForFunction(() => window.__save && window.__prog, null, { timeout: 180000 });
  const wiped = await B.evaluate(() => __prog.d.tot);
  const imp = await B.evaluate(c => __save.importCode(c), save.code);
  await B.reload({ waitUntil: 'domcontentloaded' });
  await B.waitForFunction(() => window.__save && window.__prog, null, { timeout: 180000 });
  const restored = await B.evaluate(() => __prog.d.tot);
  const bad = await B.evaluate(c => __save.importCode(c.slice(0, -3) + 'zzz'), save.code);
  log('SAVE', { before: save.before, wiped, imp, restored, bad, codeLen: save.code.length });

  const report = {
    code, roomA: room, roomB: roomB, tagB, tagA, streak0, gates, gatesA, seen, seenB, kA, kB, at6, at7, ownerStill,
    save: { before: save.before, wiped, imp, restored, bad },
    errs: { A: [...new Set(errs.A)].filter(e => !/favicon/i.test(e)).slice(0, 12), B: [...new Set(errs.B)].filter(e => !/favicon/i.test(e)).slice(0, 12) }
  };
  fs.writeFileSync(ART + '/mp_report.json', JSON.stringify(report, null, 2));
  log('REPORT_WRITTEN');
  log('ERRS', report.errs);
} catch (e) {
  log('FAIL', e && e.stack || e);
  fs.writeFileSync(ART + '/mp_report.json', JSON.stringify({ fail: String(e && e.stack || e), errs }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
