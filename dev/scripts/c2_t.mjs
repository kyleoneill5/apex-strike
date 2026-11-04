import { chromium } from 'playwright';
const MODE=process.argv[2]||'all';const URL=process.argv[3]||'test_c2.html';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-dev-shm-usage','--no-sandbox']});
const kill=setTimeout(()=>{console.log('TIMEOUT');process.exit(2)},900000);const errs=[];
const ev=async(pg,name,fn,arg)=>{try{const r=await pg.evaluate(fn,arg);console.log(name,JSON.stringify(r).slice(0,900));return r;}catch(e){console.log(name,'EXC',e.message.slice(0,300));}};
try{const pg=await b.newPage({viewport:{width:640,height:360}});pg.setDefaultTimeout(200000);
pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
pg.on('crash',()=>console.log('CRASH'));await pg.goto('http://localhost:8832/'+URL+'',{waitUntil:'commit'});await pg.waitForFunction(()=>window.__milsim&&window.WPF&&window.ENGINE_CUT,null,{timeout:400000});
await ev(pg,'mods',()=>({sm3:!!window.__msl_sm3,cut:!!window.ENGINE_CUT,mirv:!!window.__mirvlock,stg:window.__gstaging&&window.__gstaging.AUTO_BURN,wpn:WPN.count(),defs:Object.keys(WPF._defs()).length}));
// vehicles
if(MODE==='all')await ev(pg,'veh',()=>{const bad=[];const ks=Object.keys(WPF._defs());for(const k of ks){try{__milsim.spawn(k);__milsim.setPaused(false);__milsim.step(5);if(!__milsim.player)bad.push(k+':noplayer');}catch(e){bad.push(k+':'+e.message);}}return {n:ks.length,bad};});
// #21 weapons
if(MODE==='all')await ev(pg,'wpn',()=>{const M=__milsim;M.spawn('infantry');M.step(2);let ok=0,fail=[];for(const w of WPN.list){try{WPF.give(w.id);WPF._S.slot=WPF._S.load.p===w.id?0:1;WPF._S.cool=0;WPF._S.rel=0;const m0=WPF.state().mag;
 if(w.cls==='sn'||w.id==='javelin'||w.id==='stinger'){dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' '}));M.step(6);dispatchEvent(new KeyboardEvent('keyup',{code:'Space',key:' '}));M.step(2);}else WPF.fire();M.step(1);const st=WPF.state();(st.cur===w.id&&st.mag<m0)?ok++:fail.push(w.id);}catch(e){fail.push(w.id+':'+e.message)}}
 WPF._S.ksReady='uav';WPF._S.slot=3;WPF.fire();return {ok,n:WPN.list.length,fail,ks:WPF._S.ksReady===null};});
// #27 ICBM auto: real time during boost
if(MODE!=='cut')await ev(pg,'icbm',()=>{const M=__milsim;M.spawn('silo');M.setPaused(false);const p=M.player;p.wi=p.weapons.indexOf('ICBM');const fr=M.fireWeapon(p);M.step(3);
 const o=M.projs.find(q=>q.gs||q.man||/icbm|mm3|minute/i.test(q.name||''));const ts1=window.__gmsl2TS&&__gmsl2TS();const st=[];for(let i=0;i<14;i++){M.step(60*15);st.push([o&&+o.t.toFixed(0),o&&o.phase,o&&o.stg,o&&o.gs&&o.gs.stg,o&&o.man,window.__gmsl2TS&&__gmsl2TS()]);}
 return {fr,name:o&&o.name,boostT:o&&o.boostT,ts1,st,bus:!!__mirvlock.bus,locked:__mirvlock.locked.length,boxes:document.querySelectorAll('#mirvLock>div').length};});
// #14 cutoff
if(MODE!=='icbm')await ev(pg,'cut',()=>{const M=__milsim,r={};for(const k of ['rocket','starship','fighter']){try{M.spawn(k);M.setPaused(false);const p=M.player;M.inp.throttle=1;M.step(60);M.inp.throttle=0;M.step(90);const a=ENGINE_CUT.state(p);M.inp.throttle=0.8;M.step(30);const b2=ENGINE_CUT.state(p);M.step(120);const c=ENGINE_CUT.state(p);r[k]=[a,b2,c];}catch(e){r[k]=e.message}}return r;});
// #7 SM-3
if(MODE!=='icbm')await ev(pg,'sm3',()=>{const M=__milsim;const ks=Object.keys(WPF._defs()).filter(k=>/burke|tico|destroyer|cruiser|ship/i.test(k));M.spawn(ks[0]);M.setPaused(false);const p=M.player;const i=p.weapons.indexOf('SM3');if(i<0)return {ks,w:p.weapons};p.wi=i;M.fireWeapon(p);let mx=0,out=[];for(let j=0;j<40;j++){M.step(60);const o=M.projs.find(q=>/sm/i.test(q.name||'')||q.sm3);if(o){mx=Math.max(mx,o.pos?o.pos.y:o.mesh?o.mesh.position.y:0);} if(j%8==0)out.push(mx|0);}return {ship:ks[0],maxY:mx|0,out,deb:__msl_sm3.debris&&__msl_sm3.debris.length};});
console.log('ERR',errs.length,JSON.stringify([...new Set(errs)].slice(0,8)));
}finally{clearTimeout(kill);await b.close();}
