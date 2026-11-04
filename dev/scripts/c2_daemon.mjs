import { chromium } from 'playwright';import fs from 'fs';
const b=await chromium.launch({channel:'chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let pg,errs=[];async function mk(){if(pg)try{await pg.close()}catch(e){};pg=await b.newPage({viewport:{width:640,height:360}});pg.setDefaultTimeout(400000);pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});}
async function load(){await mk();errs=[];await pg.goto('http://localhost:8832/test_c2.html?'+Date.now(),{waitUntil:'commit'});await pg.waitForFunction(()=>window.__milsim&&window.WPF,null,{timeout:300000});await pg.evaluate(()=>{const t=document.getElementById('tutOk');t&&t.click();});console.log('LOADED');}
await load();
for(;;){const fs_=fs.readdirSync('c2q').filter(f=>f.endsWith('.js')||f.endsWith('.shot')||f==='RELOAD'||f==='QUIT').sort();
 for(const f of fs_){const p='c2q/'+f;const code=fs.readFileSync(p,'utf8');fs.unlinkSync(p);let out='';
  try{if(f==='QUIT'){await b.close();process.exit(0);}
   if(f==='RELOAD'){await load();out='reloaded';}
   else if(f.endsWith('.shot')){for(const line of code.split('\n').filter(Boolean)){const i=line.indexOf('|');const name=line.slice(0,i),js=line.slice(i+1);if(js.startsWith('VP ')){const [w,h]=js.slice(3).split('x');await pg.setViewportSize({width:+w,height:+h});continue;}await pg.evaluate(js);await pg.waitForTimeout(500);await pg.screenshot({path:'progress/'+name});out+='shot '+name+'\n';}}
   else out=JSON.stringify(await pg.evaluate(code));}catch(e){out='THROW '+e.message.split('\n')[0];}
  fs.writeFileSync('c2r/'+f+'.out',out+'\nERR '+JSON.stringify([...new Set(errs)].slice(0,10)));errs=[];}
 await new Promise(r=>setTimeout(r,300));}
