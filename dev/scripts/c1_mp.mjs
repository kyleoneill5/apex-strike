import {webkit} from 'playwright';
const SRV=process.argv[2]||'';const base='http://localhost:8831/test_c1.html?mptest'+(SRV?'&'+SRV:'');
const b=await (await import('playwright')).chromium.launch({channel:'chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const errs={A:[],B:[]};
const mk=async n=>{const c=await b.newContext({viewport:{width:932,height:430}});const p=await c.newPage();p.on('pageerror',e=>errs[n].push(e.message));p.on('console',m=>{if(m.type()==='error')errs[n].push(m.text())});await p.goto(base,{timeout:240000,waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__mp&&typeof spawnPlayerForTest!=='x',null,{timeout:300000});return p;};
const A=await mk('A'),B=await mk('B');
const sp=(p,k)=>p.evaluate(k=>{const b=[...document.querySelectorAll('*')];window.__mpTest=1;},k);
const code=await A.evaluate(()=>__mp.host()).catch(e=>'ERR '+e);console.log('code',code);
if(String(code).startsWith('ERR')){console.log('ERRS',JSON.stringify(errs));process.exit(1);}
await B.evaluate(c=>__mp.join(c),code);console.log('joined',await B.evaluate(()=>__mp.state));
// spawn fighters via game hook
for(const p of [A,B])await p.evaluate(()=>window.__mpSpawn('fighter'));
await A.evaluate(()=>window.__mpPos(0,800,0));await B.evaluate(()=>window.__mpPos(0,800,-300));
await A.waitForTimeout(1500);
const seen1=await A.evaluate(()=>__mp.players.map(p=>p.kind)+' '+JSON.stringify(__mp._st.remotes.values().next().value?.mesh.position));
await B.evaluate(()=>window.__mpPos(200,900,-300));await A.waitForTimeout(1200);
const seen2=await A.evaluate(()=>JSON.stringify(__mp._st.remotes.values().next().value?.mesh.position));
const seenB=await B.evaluate(()=>JSON.stringify(__mp._st.remotes.values().next().value?.mesh.position));
console.log('A sees B',seen1,'->',seen2,'| B sees A',seenB);
await A.evaluate(()=>__gm.start('ffa'));await A.waitForTimeout(1200);console.log('B mode',await B.evaluate(()=>__gm.state.mode));
// A fires missiles at B until kill
for(let i=0;i<40;i++){const k=await A.evaluate(()=>__mp.kills);if(k>0)break;{const r=await A.evaluate(()=>window.__mpShootAt());if(r)console.log("SHOOTERR",r);}await A.waitForTimeout(250);}
await A.waitForTimeout(800);
const kA=await A.evaluate(()=>({kills:__mp.kills,feed:document.getElementById('kfeed')?.innerText}));
const kB=await B.evaluate(()=>({deaths:__mp.deaths,feed:document.getElementById('kfeed')?.innerText}));
console.log('B sees A as owner',await B.evaluate(()=>__mp.ownerId===[...__mp._st.remotes.keys()][0]),'B feed color',await B.evaluate(()=>getComputedStyle(document.getElementById('kfeed').firstChild||document.body).color));
console.log('A',JSON.stringify(kA),'B',JSON.stringify(kB));

console.log('FFA scores on B',await B.evaluate(()=>JSON.stringify(__gm.state.ps)));
await A.evaluate(()=>__gm.start('tdm'));await A.waitForTimeout(4500);
console.log('TDM teams on B',await B.evaluate(()=>JSON.stringify(__gm.state.teams)),'B hp',await B.evaluate(()=>__mp.hp));
await B.evaluate(()=>window.__mpPos(0,800,-300));await A.evaluate(()=>window.__mpPos(0,800,0));
for(let i=0;i<40;i++){const k=await A.evaluate(()=>__mp.kills);if(k>1)break;{const r=await A.evaluate(()=>window.__mpShootAt());if(r)console.log("SHOOTERR",r);}await A.waitForTimeout(250);}
await A.waitForTimeout(1500);console.log('TDM team score on B',await B.evaluate(()=>JSON.stringify(__gm.state.ts)),'bar',await B.evaluate(()=>document.getElementById('mpBar')?.innerText));
await A.evaluate(()=>__gm.end());await A.waitForTimeout(1500);console.log('end board B',await B.evaluate(()=>document.getElementById('mpBoard')?.innerText.replace(/\n/g,' | ')),'B tot xp',await B.evaluate(()=>__prog.d.tot),'matches',await B.evaluate(()=>__save.data.stats.matches));
await B.evaluate(()=>document.getElementById('mpBoard')?.remove());
// streak
console.log('A streak ready (owner)',await A.evaluate(()=>__streak.ready),'B ready',await B.evaluate(()=>__streak.ready),'B use',await B.evaluate(()=>__streak.use()),'A use',await A.evaluate(()=>__streak.use()));
await B.evaluate(()=>{window.__mpPos(60,40,60)});await A.waitForTimeout(6000);console.log('battery count A',await A.evaluate(()=>__streak.state.bats.length),'B hp after battery',await B.evaluate(()=>__mp.hp));
// owner checks
console.log('owner A',await A.evaluate(()=>__mp.isOwner),'B',await B.evaluate(()=>__mp.isOwner));
console.log('B spawn tr3b ->',await B.evaluate(()=>__mpRaw('tr3b')),'| starship ->',await B.evaluate(()=>__mpRaw('starship')),'| B fighter weapons',await B.evaluate(()=>{__mpRaw('fighter');return __mpWeap()}));
console.log('A spawn tr3b ->',await A.evaluate(()=>__mpRaw('tr3b')));await A.evaluate(()=>__mpRaw('fighter'));
await B.evaluate(()=>{const c=[...__mp._st.conns.values()][0];c.send({t:'s',k:'saucer',n:'hack',p:[0,900,0],q:[0,0,0,1],a:true});c.send({t:'h',to:__mp._st.owner,w:'NUKE',d:999});c.send({t:'k',killer:__mp.id,victim:__mp._st.owner,w:'GUN',p:[0,0,0]});});
await A.waitForTimeout(1500);console.log('after tamper: A sees',await A.evaluate(()=>__mp.players.map(p=>p.kind).join()),'A hp',await A.evaluate(()=>__mp.hp),'A deaths',await A.evaluate(()=>__mp.deaths),'B feed',await B.evaluate(()=>document.getElementById('kfeed')?.innerText));
console.log('aim A',await A.evaluate(()=>__aim.on),'B',await B.evaluate(()=>__aim.on));
console.log('mod open A',await A.evaluate(()=>{const r=__mod.open();__mod.close();return r}),'B',await B.evaluate(()=>__mod.open()),'B mod el',await B.evaluate(()=>!!document.getElementById('mpMod')));
await B.evaluate(()=>{const c=[...__mp._st.conns.values()][0];c.send({t:'mod',cmd:'end',to:'*'});c.send({t:'mod',cmd:'kick',to:__mp._st.owner});c.send({t:'adm',id:__mp.id,on:true});});
await A.waitForTimeout(4000);console.log('after B forged mod: A state',await A.evaluate(()=>__mp.state),'B admin?',await A.evaluate(()=>__mp.admins.length));
await A.evaluate(()=>__mod.cmd('xp',[...__mp._st.remotes.keys()][0],{n:5000}));await A.waitForTimeout(1200);console.log('owner gave B xp, B tot',await B.evaluate(()=>__prog.d.tot));
console.log('owner profile A',await A.evaluate(()=>JSON.stringify([__prog.d,__save.data.title,__save.data.unlocks])),'B',await B.evaluate(()=>JSON.stringify([__prog.d,__save.data.title])));
// save -> reload -> wipe -> restore
await B.evaluate(()=>{__prog.add(777);__save.write();});const before=await B.evaluate(()=>__prog.d.tot);const bcode=await B.evaluate(()=>__save.exportCode());
await B.reload();await B.waitForFunction(()=>window.__save&&window.__prog,null,{timeout:300000});const afterReload=await B.evaluate(()=>__prog.d.tot);
await B.evaluate(()=>localStorage.clear());await B.reload();await B.waitForFunction(()=>window.__save&&window.__prog,null,{timeout:300000});const wiped=await B.evaluate(()=>__prog.d.tot);
const imp=await B.evaluate(c=>__save.importCode(c),bcode);await B.reload();await B.waitForFunction(()=>window.__save&&window.__prog,null,{timeout:300000});const restored=await B.evaluate(()=>__prog.d.tot);
const bad=await B.evaluate(c=>__save.importCode(c.slice(0,-3)+"zzz"),bcode);
await B.evaluate(()=>{const r=JSON.parse(localStorage.getItem('dm_save'));r.d.prog.p=10;localStorage.setItem('dm_save',JSON.stringify(r));localStorage.removeItem('dmProg');});await B.reload();await B.waitForFunction(()=>window.__save,null,{timeout:300000});
console.log('SAVE before',before,'reload',afterReload,'wiped',wiped,'import',JSON.stringify(imp),'restored',restored,'badcode',JSON.stringify(bad),'tamper detected',await B.evaluate(()=>__save.tampered+' p='+__prog.d.p));
await B.close();await A.waitForTimeout(9500);console.log('after B close, A players',await A.evaluate(()=>__mp.players.length),'feed',await A.evaluate(()=>document.getElementById('kfeed')?.innerText));
console.log('ERRS',JSON.stringify(errs));await b.close();
