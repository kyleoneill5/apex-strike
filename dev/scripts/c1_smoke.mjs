import pw from 'playwright';
const url=process.argv[2]||'http://localhost:8831/test_c1.html';const tag=process.argv[3]||'c1';
const b=await pw.chromium.launch({executablePath:'/opt/google/chrome/chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const errs=[],out=[];
try{
const pg=await b.newPage({viewport:{width:844,height:390},deviceScaleFactor:1,hasTouch:true,isMobile:true});
pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text().slice(0,150))});
pg.on('response',r=>{if(r.status()>=400)errs.push('HTTP '+r.status()+' '+r.url())});
await pg.goto(url,{waitUntil:'commit',timeout:120000});await pg.waitForFunction(()=>document.getElementById('flPlay')&&window.__milsim,null,{timeout:300000});await pg.waitForTimeout(4000);
out.push('load errs '+errs.length);
out.push('apis '+await pg.evaluate(()=>JSON.stringify({mp:!!window.__mp,gm:!!window.__gm,aim:!!window.__aim,mod:!!window.__mod,save:!!window.__save,prog:!!window.__prog,ks:!!window.__mwKS,owner:window.__mp&&__mp.ownerActive,tag:window.__mp&&__mp.tag,rank:window.__prog&&JSON.stringify(__prog.d).slice(0,200)})));
await pg.screenshot({path:`progress/${tag}_menu.png`});
const keys=await pg.evaluate(()=>Object.keys(window.__milsim.VEH||window.__milsim.vehicles||{}));
out.push('vehkeys '+keys.length);
const ks=keys.length?keys:['fighter','f22','f35','b2','sr71','heli','sub','ship','starship','falcon9','shuttle','tank','himars','ufo','tr3b'];
const sf=[];let ok=0;
for(const k of ks){const r=await pg.evaluate(k=>{try{__milsim.spawn(k,k==='starship'||k==='falcon9'||k==='shuttle'?'pad':k==='sub'?'ocean':'airbase');for(const id of['tut','menu'])document.getElementById(id)&&(document.getElementById(id).style.display='none');__milsim.step(3);return 'ok';}catch(e){return 'ERR '+e.message.slice(0,80)}},k);if(r==='ok')ok++;else sf.push(k+' '+r);}
out.push(`spawn ${ok}/${ks.length} fails: ${sf.join(',')||'none'}`);
await pg.evaluate(()=>{__milsim.spawn('fighter','airbase');for(const id of['tut','menu'])document.getElementById(id)&&(document.getElementById(id).style.display='none');__milsim.step(2)});
await pg.waitForTimeout(1500);await pg.screenshot({path:`progress/${tag}_hud.png`});
}catch(e){out.push('FAIL '+e.message.slice(0,200))}finally{await b.close();}
console.log(out.join('\n'));console.log('ERRS',JSON.stringify(errs,null,0));
