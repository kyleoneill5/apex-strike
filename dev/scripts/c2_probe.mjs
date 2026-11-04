import { chromium } from 'playwright';import fs from 'fs';
const b=await chromium.launch({channel:'chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const pg=await b.newPage({viewport:{width:+(process.env.W||640),height:+(process.env.H||360)}});pg.setDefaultTimeout(300000);const errs=[];pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await pg.goto('http://localhost:8832/test_c2.html',{waitUntil:'commit'});await pg.waitForFunction(()=>window.__milsim&&window.WPF,null,{timeout:300000});
await pg.evaluate(()=>{const t=document.getElementById('tutOk');t&&t.click();});
for(const f of process.argv.slice(2)){const code=fs.readFileSync(f,'utf8');
 if(f.endsWith('.shot')){for(const line of code.split('\n').filter(Boolean)){const [name,js]=line.split('|');await pg.evaluate(js);await pg.waitForTimeout(400);await pg.screenshot({path:'progress/'+name});console.log('shot',name);}}
 else{try{console.log(f,JSON.stringify(await pg.evaluate(code)));}catch(e){console.log(f,'THROW',e.message.split('\n')[0]);}}}
console.log('ERR',JSON.stringify([...new Set(errs)].slice(0,10)));}finally{await b.close();}
