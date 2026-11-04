import { chromium } from 'playwright-core';
const URL='http://localhost:8833/test_c3.html';const MODE=process.argv[2]||'ad';
const b=await chromium.launch({executablePath:'/opt/google/chrome/chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const errs=[];const out={};
try{const pg=await b.newPage({viewport:{width:640,height:360},hasTouch:true,isMobile:true});pg.setDefaultTimeout(240000);
pg.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,160));});pg.on('pageerror',e=>errs.push('PAGEERR '+e.message));
pg.on('response',r=>{if(r.status()>=400)errs.push('HTTP'+r.status()+' '+r.url());});
await pg.goto(URL);await pg.waitForFunction(()=>window.__milsim&&window.__rfW,null,{timeout:200000});
await pg.evaluate(()=>{const t=document.getElementById('tutOk');if(t)t.click();});
const ev=(f,a)=>pg.evaluate(f,a);const st=n=>ev(n=>__milsim.step(n,1/30),n);
if(MODE==='ad'){await ev(()=>{__milsim.spawn('sub');});await st(10);
const r26=async(depth)=>{await ev(d=>{const v=__milsim.player;v.depth=v.depthT=d;v.mesh.position.y=-d;__ead.hp=100;__rfW().W.length=0;__adf.I.length=0;__adf.samT=0;},depth);await st(30);
 return ev(()=>{const v=__milsim.player,p=v.mesh.position.clone();const R=__rfW();const k0=__adf.kills;R.fireW('cruise',p.clone().add({x:4000,y:60,z:0}),p);let miny=1e9,sams=0,n=0;
  for(let i=0;i<450&&R.W.length;i++){__milsim.step(1,1/30);n++;if(R.W[0])miny=Math.min(miny,R.W[0].pos.y);sams=Math.max(sams,__adf.I.length);}
  return {subY:+v.mesh.position.y.toFixed(1),alive:v.alive,hp:__ead.hp,minMslY:+miny.toFixed(1),sams,kills:__adf.kills-k0};});};
out.deep60=await r26(60);console.log("D60",JSON.stringify(out.deep60));out.surf1=await r26(1);console.log("S1",JSON.stringify(out.surf1));out.deep300=await r26(300);console.log("D300",JSON.stringify(out.deep300));
await ev(()=>{__milsim.spawn('destroyer');});await st(20);
out.ship=await ev(()=>{const v=__milsim.player;__ead.hp=100;const p=v.mesh.position.clone();const R=__rfW();R.W.length=0;const k0=__adf.kills;
 R.fireW('cruise',p.clone().add({x:20000,y:30,z:0}),p);let n=0;for(let i=0;i<4000&&R.W.length;i++){__milsim.step(1,1/30);n++;}
 return {cls:v.def&&v.def.cls,hp:__ead.hp,alive:v.alive,kills:__adf.kills-k0,secs:(n/30).toFixed(1)};});
console.log('PART',JSON.stringify(out));}
if(MODE==='veh'){out.keys=await ev(()=>typeof __gsubKeys==='function'?__gsubKeys():null);
out.veh=[];for(const k of (out.keys||[])){out.veh.push(await ev(k=>{try{__milsim.spawn(k);__milsim.step(3,1/30);return k+':'+(__milsim.player&&__milsim.player.mesh?'ok':'nomesh');}catch(e){return k+':ERR '+e.message;}},k));console.log('V',out.veh.at(-1));}}
}catch(e){out.err=String(e);}finally{out.errs=[...new Set(errs)];console.log(JSON.stringify(out));await b.close();}
