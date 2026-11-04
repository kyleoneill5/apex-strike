import pw from '/workspace/milsim/node_modules/playwright/index.mjs';import fs from 'fs';
const b=await pw.chromium.launch({channel:'chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
globalThis.errs=[];globalThis.b=b;
globalThis.mk=async(url,vp={width:640,height:360})=>{const pg=await b.newPage({viewport:vp,deviceScaleFactor:1,hasTouch:true,isMobile:true});pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/vibrate/.test(m.text()))errs.push('CE '+m.text().slice(0,200)+' @'+JSON.stringify(m.location()).slice(0,120))});await pg.goto(url,{waitUntil:'commit'});return pg;};
globalThis.A=await mk('http://localhost:8831/test_c1b.html');
console.log('ready');let n=0;
for(;;){await new Promise(r=>setTimeout(r,500));const f='/tmp/c1/cmd'+n+'.mjs';if(!fs.existsSync(f))continue;n++;
 try{const code=fs.readFileSync(f,'utf8');const fn=new (Object.getPrototypeOf(async function(){}).constructor)(code);const r=await fn();fs.writeFileSync(f+'.out',String(r)+'\nERRS '+JSON.stringify(errs));}catch(e){fs.writeFileSync(f+'.out','EXC '+e.stack);}}
