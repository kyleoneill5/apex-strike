import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const kill=setTimeout(()=>process.exit(2),240000);
try{const ctx=await b.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await pg.goto('http://localhost:'+(8832)+'/test_c2.html');await pg.waitForFunction(()=>window.__milsim&&window.__mirvlock,null,{timeout:180000});
await pg.evaluate(()=>{const t=document.getElementById('tutOk');t&&t.click();});
const r1=await pg.evaluate(()=>{const M=__milsim;M.spawn('silo');M.setPaused(false);const p=M.player;p.wi=p.weapons.indexOf('ICBM');const fr=M.fireWeapon(p);M.step(5);return {fr,kind:p.def&&p.def.cls,w:p.weapons,wi:p.wi,ammo:p.ammo,names:M.projs.map(q=>q.name),bus:!!__mirvlock.bus,locked:__mirvlock.locked.length,boxes:document.querySelectorAll('#mirvLock>div').length};});
console.log('afterLaunch',JSON.stringify(r1));
// make boxes visible: tap the first visible ones via touch
await pg.waitForTimeout(800);console.log('dbg',await pg.evaluate(()=>JSON.stringify({n:__milsim.projs.map(q=>[q.name,q.done,q.life]),raf:window.__mlT})));console.log('state',await pg.evaluate(()=>JSON.stringify({bus:!!__mirvlock.bus,locked:__mirvlock.locked.length,boxes:document.querySelectorAll('#mirvLock>div').length})));
const vis=await pg.$$eval('#mirvLock>div',d=>d.map((e,i)=>[i,e.style.display,e.getBoundingClientRect().x,e.getBoundingClientRect().y]));console.log('vis',JSON.stringify(vis.slice(0,6)));
const els=await pg.$$('#mirvLock>div');let tapped=0;
for(const e of els){if(tapped>=2)break;if(await e.isVisible()){await e.tap({force:true});tapped++;}}
if(!tapped){await pg.evaluate(()=>{const L=__mirvlock;L.sel.add(L.locked[0]);L.sel.add(L.locked[1]);});console.log('no visible boxes; selected programmatically');}
const s1=await pg.evaluate(()=>__mirvlock.sel.size);console.log('selected',s1,'tapped',tapped);
if(tapped){await els.find(Boolean);}
await pg.waitForTimeout(300);await pg.screenshot({path:'/workspace/milsim/progress/mirv_lock.png'});
const r2=await pg.evaluate(()=>{const M=__milsim;const sel=[...__mirvlock.sel];const bb=M.projs.find(q=>q.name==='ICBM');const out={};
 for(let i=0;i<3;i++){const m=bb.mesh.clone();bb.mesh.parent.add(m);const p=bb.tgt.clone();p.y=60000;p.x-=20000;m.position.copy(p);M.projs.push({type:'ballistic',pos:p,vel:p.clone().set(300,-50,0),life:1800,mesh:m,owner:bb.owner,t:1e4,boostT:0,apex:0,name:'RV-'+(i+1),mach:0,sep:true,rv:true,gsAim:bb.tgt.clone(),hw:false});}
 const rv=()=>M.projs.filter(q=>q.name&&q.name.startsWith('RV-'));
 M.step(2);out.assigned=rv().map(q=>q.mlTarget?sel.indexOf(q.mlTarget):'none');
 const d0=rv().map(q=>q.mlTarget?Math.round(Math.hypot(q.pos.x-q.mlTarget.pos.x,q.pos.z-q.mlTarget.pos.z)):-1);
 let last=[];for(let k=0;k<200;k++){M.step(30);const r=rv();if(!r.length)break;last=r.map(q=>q.mlTarget?Math.round(Math.hypot(q.pos.x-q.mlTarget.pos.x,q.pos.z-q.mlTarget.pos.z))+'@'+Math.round(q.pos.y):-1);}
 out.d0=d0;out.lastBeforeImpact=last;out.selN=sel.length;return out;});
console.log('rvs',JSON.stringify(r2));
console.log('ERR',JSON.stringify([...new Set(errs)].slice(0,8)));}finally{clearTimeout(kill);await b.close();}
