import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-dev-shm-usage','--no-sandbox']});
const kill=setTimeout(()=>{console.log('TIMEOUT');process.exit(2)},720000);const errs=[];
const ev=async(pg,name,fn)=>{try{const r=await pg.evaluate(fn);console.log(name,JSON.stringify(r).slice(0,1200));}catch(e){console.log(name,'EXC',e.message.slice(0,300));}};
const shot=async(pg,n)=>{try{await pg.waitForTimeout(1500);await pg.screenshot({path:'progress/'+n,timeout:90000});console.log('SHOT',n);}catch(e){console.log('SHOTFAIL',n,e.message.slice(0,100))}};
try{const pg=await b.newPage({viewport:{width:640,height:360}});pg.setDefaultTimeout(240000);
pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,160))});
await pg.goto('http://localhost:8832/test_c2.html',{waitUntil:'commit'});await pg.waitForFunction(()=>window.__milsim&&window.WPF,null,{timeout:400000});
await pg.evaluate(()=>{const t=document.getElementById('tutOk');t&&t.click();});
await ev(pg,'SM3',()=>{const M=__milsim;M.spawn('destroyer');M.setPaused(false);M.step(10);const p=M.player;p.wi=p.weapons.indexOf('SM3');__msl_sm3.launch(p);const o=M.projs.find(q=>q.type==='sm3');window.__c2o=o;const log=[];let last=-1,n=0,maxY=0;
 while(o&&!o.done&&n++<14){M.step(15);maxY=Math.max(maxY,o.pos.y);if(o.ph!==last){last=o.ph;log.push([o.t.toFixed(1),o.ph,Math.round(o.pos.y),Math.round(o.vel.length())]);}}
 return {w:p.weapons,found:!!o,log,altKm:Math.round(maxY/1000),deb:__msl_sm3.debris.length};});
await shot(pg,'c2_sm3_stage.png');
await ev(pg,'SM3b',()=>{const M=__milsim,o=window.__c2o;let n=0,maxY=0;const log=[];let last=o&&o.ph;while(o&&!o.done&&n++<100){M.step(15);maxY=Math.max(maxY,o.pos.y);if(o.ph!==last){last=o.ph;log.push([o.t.toFixed(1),o.ph,Math.round(o.pos.y/1000)+'km',Math.round(o.vel.length())]);}}return {log,maxAltKm:Math.round(maxY/1000),done:o&&o.done};});
await ev(pg,'ICBM',()=>{const M=__milsim;M.spawn('silo');M.setPaused(false);const p=M.player;p.wi=p.weapons.indexOf('ICBM');M.fireWeapon(p);M.step(3);const o=M.projs.find(q=>q.name==='ICBM');for(let i=0;i<14;i++)M.step(30*14);return [o.t|0,o.phase,o.stg];});
await pg.waitForTimeout(2500);
await ev(pg,'MIRV',()=>({bus:!!__mirvlock.bus,locked:__mirvlock.locked.length,boxes:document.querySelectorAll('#mirvLock>div').length}));
await shot(pg,'c2_icbm_bus.png');
await ev(pg,'FP',()=>{__milsim.spawn('infantry');__milsim.setPaused(false);WPF.give('m4a1');__milsim.step(5);return WPF.state();});

console.log('ERR',errs.length,JSON.stringify([...new Set(errs)].slice(0,6)));
}finally{clearTimeout(kill);await b.close();}
