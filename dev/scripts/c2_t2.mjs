import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-dev-shm-usage','--no-sandbox']});
const kill=setTimeout(()=>{console.log('TIMEOUT');process.exit(2)},720000);const errs=[];
const ev=async(pg,name,fn)=>{try{const r=await pg.evaluate(fn);console.log(name,JSON.stringify(r).slice(0,1200));}catch(e){console.log(name,'EXC',e.message.slice(0,300));}};
try{const pg=await b.newPage({viewport:{width:640,height:360}});pg.setDefaultTimeout(240000);
pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,160))});
await pg.goto('http://localhost:8832/test_c2.html',{waitUntil:'commit'});await pg.waitForFunction(()=>window.__milsim&&window.WPF,null,{timeout:400000});
await pg.evaluate(()=>{const t=document.getElementById('tutOk');t&&t.click();});
await ev(pg,'CUTOFF',()=>{const M=__milsim;M.spawn('falcon9');M.setPaused(false);M.step(5);const v=M.player;const os=v.os;os.auto=false;M.inp.throttle=1;if(M.ctxAction)M.ctxAction();os.launched||(os.launched=true,os.engine=true);M.step(60);
 const h0=os.h,p0=os.stages[os.stage].prop;M.inp.throttle=0;M.step(30);const c=ENGINE_CUT.state(v);const p1=os.stages[os.stage].prop;M.inp.throttle=1;M.step(10);const r=ENGINE_CUT.state(v);M.step(40);const r2=ENGINE_CUT.state(v);
 M.spawn('f22');M.setPaused(false);M.inp.throttle=0;M.step(20);return {h0:Math.round(h0),cut:c,propUsedWhileCut:Math.round(p0-p1),relight:r,after:r2,jetSpd:Math.round(M.player.spd||M.player.vel&&M.player.vel.length()||0)};});
await ev(pg,'SM3',()=>{const M=__milsim;M.spawn('destroyer');M.setPaused(false);M.step(10);const p=M.player;p.wi=p.weapons.indexOf('SM3');M.fireWeapon(p);const o=M.projs.find(q=>q.type==='sm3');const log=[];let last=-1,n=0,maxY=0;
 while(o&&!o.done&&n++<120){M.step(15);maxY=Math.max(maxY,o.pos.y);if(o.ph!==last){last=o.ph;log.push([o.t.toFixed(1),o.ph,Math.round(o.pos.y),Math.round(o.vel.length())]);}}
 return {found:!!o,log,maxAltKm:Math.round(maxY/1000),deb:__msl_sm3.debris.length};});
await ev(pg,'ICBM',()=>{const M=__milsim;M.spawn('silo');M.setPaused(false);const p=M.player;p.wi=p.weapons.indexOf('ICBM');M.fireWeapon(p);M.step(3);const o=M.projs.find(q=>q.name==='ICBM');const st=[];
 for(let i=0;i<16;i++){M.step(30*15);st.push([+o.t.toFixed(0),o.phase,o.stg,!!o.man,window.__gmsl2TS&&__gmsl2TS()]);}return {st,bus:!!__mirvlock.bus,locked:__mirvlock.locked.length};});
console.log('ERR',errs.length,JSON.stringify([...new Set(errs)].slice(0,6)));
}finally{clearTimeout(kill);await b.close();}
