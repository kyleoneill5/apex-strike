import { chromium } from 'playwright';
const SH=process.argv[2]==='shots';const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const kill=setTimeout(()=>process.exit(2),1200000);
const L=(...a)=>console.log(...a.map(x=>typeof x==='string'?x:JSON.stringify(x)));
try{const pg=await b.newPage({viewport:{width:640,height:360}});pg.setDefaultTimeout(240000);const errs=[];
pg.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200));});pg.on('pageerror',e=>errs.push('PE '+e.message.slice(0,200)));
await pg.goto('http://localhost:8834/'+(process.env.F||'test_c4.html')+'',{waitUntil:'commit',timeout:400000});await pg.waitForFunction(()=>window.__milsim,null,{timeout:400000});
await pg.evaluate(()=>{const t=document.getElementById('tutOk');t&&t.click();});await pg.waitForTimeout(4000);
const ev=(f,a)=>pg.evaluate(f,a);const st=(n,dt)=>ev(([n,dt])=>__milsim.step(n,dt||1/30),[n,dt]);
L('mods',await ev(()=>({ws:!!window.__wspace,wl:!!window.__wland,moon:!!window.__moon,nuke:!!window.NUKE2,world:!!window.__world})));
L('loadErr',errs);
// all vehicles
const K=(process.env.K||'ac130 b2 carrier darkstar destroyer f22 fa18 falcon9 fighter foot heli himars infantry rocket rods saucer shuttle silo sr71 starship sub tr3b').split(' ');
const bad=[];for(const k of (process.env.K==='none'?[]:K)){const e0=errs.length;const r=await ev(k=>{try{__milsim.spawn(k,['starship','falcon9','rocket','shuttle'].includes(k)?'pad':undefined);__milsim.setPaused(false);__milsim.step(5);return !!__milsim.player;}catch(e){return 'X '+e.message}},k);if(r!==true||errs.length>e0)bad.push([k,r,errs.slice(e0)]);}
L('spawn',K.length,'bad',bad);
if(process.env.ONLYSPAWN){L('ERR',[...new Set(errs)]);process.exit(0);}
// US land check
L('land',await ev(()=>{const W=__world;if(!W||!W.th)return 'no th';const pts={kansas:[0,0]};return {th0:W.th(0,0)|0};}));
if(process.env.SKIPORB!=='1'){
// orbit
await ev(()=>{__milsim.spawn('falcon9','pad');__milsim.setPaused(false);});await st(3);await ev(()=>{__milsim.player.os.auto=true;__milsim.ctxAction();});
let i=0;for(;i<80&&!(await ev(()=>__milsim.player.os.orbit));i++)await st(200);
await st(60);L('orbit',i,await ev(()=>{const o=__milsim.player.os;const w=document.getElementById('worbit');return {orbit:o.orbit,h:Math.round(o.h/1000),v:Math.round(Math.hypot(o.vs,o.vh)),txt:w&&w.textContent,samples:__wspace.comp&&__wspace.comp.renderTarget1.samples}}));
const fl=(y,p,z)=>ev(([y,p,z])=>{const F=__milsim.FL;F.yaw=y;F.pitch=p;F.zoom=z;F.zoomT=z;F.idle=-1e9;},[y,p,z]);
if(SH){await fl(2.2,0.05,9000);await st(3);await pg.waitForTimeout(1500);await pg.screenshot({path:'progress/c4_orbit_limb.png'});await pg.waitForTimeout(800);await pg.screenshot({path:'progress/c4_orbit_limb.png'});}
}
// moon
const e1=errs.length;await ev(()=>__moon.start('apollo'));await pg.waitForTimeout(2500);
if(SH){await pg.screenshot({path:'progress/c4_moon_pad.png'});}
for(const [s,p] of [[200,null],[3000,null],[20000,null]]){L('moonsim',await ev(([s,p])=>{try{const r=__moon.sim(s,p);return {r:String(JSON.stringify(r)).slice(0,150),ph:__moon.F.ph};}catch(e){return 'X '+e.message}},[s,p]));}
L('moonEv',await ev(()=>__moon.F.events.filter(e=>e.txt).map(e=>e.txt).slice(0,14)));

L('moonErr',errs.slice(e1));
await ev(()=>{try{__moon.stop&&__moon.stop()}catch(e){}});
// nuke
const e2=errs.length;await ev(()=>{__milsim.spawn('f22');__milsim.step(3);});
const p=await ev(()=>{const c=__milsim.player.mesh.position;return [c.x+6000,0,c.z];});
await ev(p=>NUKE2.det(new THREE.Vector3(...p)),p).catch(async e=>{L('detErr',e.message.slice(0,150));});
await ev(p=>{NUKE2.cam([[p[0]-6500,60,p[2]-1300],[p[0],1500,p[2]]]);},p).catch(e=>L('camErr',e.message.slice(0,100)));
await ev(()=>{const n=Math.round(8/0.04);__milsim.step(n,0.04);});
if(SH){await pg.waitForTimeout(1200);await pg.screenshot({path:'progress/c4_nuke.png'});}
await ev(()=>{const n=Math.round(30/0.04);__milsim.step(n,0.04);});

L('nuke',await ev(()=>NUKE2.L.length),'nukeErr',errs.slice(e2));
L('ERR',[...new Set(errs)]);}finally{clearTimeout(kill);await b.close();}
