import { chromium } from 'playwright';
export async function open(vp,{dsf=1,hash='#hq',touch=false}={}){const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const errs=[];const pg=await b.newPage({viewport:vp,deviceScaleFactor:dsf,hasTouch:touch,isMobile:touch});pg.setDefaultTimeout(300000);pg.on('console',m=>{if((m.type()==='error'||m.type()==='warning')&&!m.text().includes('GPU stall'))errs.push(m.text());});pg.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await pg.goto('http://localhost:8766/'+(process.env.F9HTML||'milsim.html')+''+hash);await pg.waitForFunction(()=>window.__milsim,null,{timeout:120000});await pg.evaluate(()=>document.getElementById('tutOk').click());await pg.waitForTimeout(9000);
 const ev=(f,a)=>pg.evaluate(f,a);
 const T={b,pg,errs,ev,S:(n)=>pg.screenshot({path:`/workspace/milsim/shot_${n}.png`,timeout:300000}),st:(n,dt)=>ev(([n,dt])=>__milsim.step(n,dt||1/30),[n,dt]),
  sp:(k,l)=>ev(([k,l])=>{__milsim.spawn(k,l);__milsim.setPaused(false);},[k,l]),
  fl:(y,p,z)=>ev(([y,p,z])=>{const F=__milsim.FL;F.yaw=y;F.pitch=p;F.zoom=z;F.zoomT=z;F.idle=-1e9;},[y,p,z]),
  hud:(on)=>ev(on=>{const rc=__milsim.dbg.renderer.domElement;for(const e of document.body.querySelectorAll('*')){if(e!==rc&&e.parentElement===document.body&&e.tagName!=='SCRIPT')e.style.visibility=on?'':'hidden';}},on)};
 return T;}
