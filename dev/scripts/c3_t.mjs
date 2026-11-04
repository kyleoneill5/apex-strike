import { chromium as webkit } from 'playwright-core';import fs from 'fs';
const b=await webkit.launch({executablePath:'/opt/google/chrome/chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const errs=[];
try{const pg=await b.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});pg.setDefaultTimeout(240000);
pg.on('console',m=>{if(m.type()==='error')errs.push(m.text());});pg.on('pageerror',e=>errs.push('PAGEERR '+e.message));
await pg.goto('http://localhost:8833/test_c3.html');await pg.waitForFunction(()=>window.__milsim&&window.__sub,null,{timeout:180000});
await pg.evaluate(()=>{const t=document.getElementById('tutOk');if(t)t.click();});
const ev=(f,a)=>pg.evaluate(f,a);const st=n=>ev(n=>__milsim.step(n,1/30),n);const out={};
const snap=async n=>{if(process.argv[2]!=='shots')return;const u=await ev(()=>{__milsim.step(1,1/30);return __milsim.dbg.renderer.domElement.toDataURL('image/jpeg',0.88);});fs.writeFileSync('/workspace/milsim/progress/'+n+'_c3.jpg',Buffer.from(u.split(',')[1],'base64'));};
const lc=()=>ev(()=>{const L=__sub.SUBX.lc,p=__milsim.player;return L?{ph:L.phase,t:+L.t.toFixed(2),my:+L.o.pos.y.toFixed(1),sy:+p.mesh.position.y.toFixed(1),cy:+__sub.cam.y.toFixed(1)}:null;});
await ev(()=>{__milsim.spawn('sub');});await st(10);
await ev(()=>{const v=__milsim.player;v.depth=v.depthT=30;v.mesh.position.y=-30;});await st(60);
out.fire=await ev(()=>{const v=__milsim.player;v.wi=v.weapons.indexOf('HYPERSONIC');return __sub.fire(v);});
await st(14);await snap('sub_launch3p_hatch');await st(14);await snap('sub_launch3p_hatch2');await st(19);out.a=await lc();await snap('sub_launch3p_tube');await st(12);await snap('sub_launch3p_rise');
await st(13);out.b=await lc();
await st(16);await snap('sub_launch3p_breach');await st(10);await snap('sub_launch3p_breach2');await st(14);out.c=await lc();
await st(30);await snap('sub_launch3p_climb');await st(30);out.d=await lc();
await st(80);out.e=await lc();
// SLBM
await st(100);out.slbm=await ev(()=>{const v=__milsim.player;v.wi=v.weapons.indexOf('SLBM');return __sub.fire(v);});await st(20);out.s1=await lc();await snap('sub_launch3p_slbm');
// depth
await ev(()=>{__milsim.spawn('sub');});await st(10);
await ev(()=>{const v=__milsim.player;v.depthT=420;});await st(1800);out.deep=await ev(()=>{const p=__milsim.player;return [p.depth,p.depthT,__sub.terrainH(p.mesh.position.x,p.mesh.position.z)]});out.px=await ev(()=>{__milsim.step(1,1/30);const c=__milsim.dbg.renderer.domElement,t=document.createElement('canvas');t.width=64;t.height=32;const x=t.getContext('2d');x.drawImage(c,0,0,64,32);const d=x.getImageData(0,0,64,32).data;let s=0;for(let i=0;i<d.length;i+=4)s+=d[i]+d[i+1]+d[i+2];return s/(d.length/4*3);});await snap('sub_underwater_420m');
await ev(()=>{const v=__milsim.player;v.depthT=60;v.depth=60;v.mesh.position.y=-60});await st(60);await snap('sub_underwater_60m');
if(process.argv[2]!=='shots')out.veh=await ev(()=>{const bad=[];for(const k of __gsubKeys()){try{__milsim.spawn(k);__milsim.step(3,1/30);}catch(e){bad.push(k+':'+e.message);}}return [__gsubKeys().length,bad];}).catch(e=>'x '+e.message);
console.log(JSON.stringify(out));}finally{console.log('ERR',JSON.stringify([...new Set(errs)].slice(0,15)));await b.close();}
