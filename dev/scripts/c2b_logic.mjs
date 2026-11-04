import { chromium as webkit } from 'playwright';
const b=await webkit.launch({executablePath:'/usr/bin/google-chrome',args:['--disable-dev-shm-usage','--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const pg=await (await b.newContext({viewport:{width:640,height:300}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await pg.goto('http://localhost:8832/test_c2.html',{waitUntil:'commit'});await pg.waitForFunction(()=>window.__milsim&&window.__msl_sm3,null,{timeout:400000});
await pg.evaluate(()=>{const t=document.getElementById('tutOk');t&&t.click();});
const sm=await pg.evaluate(()=>{const M=__milsim;M.spawn('destroyer');M.setPaused(false);M.step(10);const p=M.player;p.wi=p.weapons.indexOf('SM3');M.fireWeapon(p);const o=M.projs.find(q=>q.type==='sm3');const log=[];let last=-1,minR=1e12,n=0;
 while(!o.done&&n++<9000){M.step(1);if(o.ph!==last){last=o.ph;log.push([o.t.toFixed(1),o.ph,Math.round(o.pos.y),Math.round(o.vel.length())]);}if(o.tg)minR=Math.min(minR,o.tg.pos.distanceTo(o.pos));}
 return {log,done:o.done,t:o.t.toFixed(1),alt:Math.round(o.pos.y),minR:Math.round(minR),kill:!!(o.tg&&o.tg.done),deb:__msl_sm3.debris.length};});
console.log('SM3 vs sat',JSON.stringify(sm));
// vs enemy ICBM: launch an ICBM from far away aimed at the ship, then fire SM-3 at ~60s
const sb=await pg.evaluate(()=>{const M=__milsim,p=M.player;const T=__gstaging.T;const e={def:{cls:'silo'},mesh:new T.Object3D()};const s=p.mesh.position.clone().add(new T.Vector3(-300000,0,0));
 const icbm={type:'ballistic',pos:s.clone().setY(50),vel:new T.Vector3(0,25,0),life:900,mesh:new T.Group(),owner:e,t:0,tgt:p.mesh.position.clone(),boostT:70,apex:80000,name:'ICBM',mach:0,man:false};M.projs.push(icbm);
 let n=0;while(icbm.t<150&&n++<9000)M.step(1);p.ammo.SM3=4;p.cool=0;M.fireWeapon(p);const o=M.projs.find(q=>q.type==='sm3'&&!q.done);let minR=1e12;n=0;
 while(o&&!o.done&&n++<9000){M.step(1);minR=Math.min(minR,icbm.pos.distanceTo(o.pos));}
 return {tg:o&&o.tg===icbm,icbmAlt:Math.round(icbm.pos.y),kill:icbm.done,minR:Math.round(minR),t:o&&o.t.toFixed(1)};});
console.log('SM3 vs ICBM',JSON.stringify(sb));
// cutoff: falcon9 manual
const co=await pg.evaluate(()=>{const M=__milsim;M.spawn('falcon9');M.setPaused(false);M.step(5);const v=M.player;const os=v.os;os.auto=false;M.inp.throttle=1;if(M.ctxAction)M.ctxAction();os.launched||(os.launched=true,os.engine=true);M.step(150);
 const h0=os.h,p0=os.stages[os.stage].prop;M.inp.throttle=0;M.step(60);const c=ENGINE_CUT.state(v);const p1=os.stages[os.stage].prop;M.inp.throttle=1;M.step(15);const r=ENGINE_CUT.state(v);M.step(40);const r2=ENGINE_CUT.state(v);
 return {h0:Math.round(h0),cut:c,propUsedWhileCut:Math.round(p0-p1),relight:r,after:r2,engine:os.engine};});
console.log('CUTOFF',JSON.stringify(co));
const sp=await pg.evaluate(()=>{const M=__milsim;const out={};for(const k of Object.keys(DEFS)){try{M.spawn(k);M.step(3);out[k]=!!(M.player&&M.player.alive!==false);}catch(e){out[k]='ERR '+e.message;}}return out;});
const bad=Object.entries(sp).filter(([k,v])=>v!==true);console.log('SPAWN',Object.keys(sp).length,'bad',JSON.stringify(bad));
console.log('ERR',JSON.stringify([...new Set(errs)].slice(0,8)));}finally{await b.close();}
