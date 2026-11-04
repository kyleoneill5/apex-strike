import pw from '/workspace/milsim/node_modules/playwright/index.mjs';
const b=await pw.chromium.launch({channel:'chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const errs=[];try{const pg=await b.newPage({viewport:{width:844,height:390},deviceScaleFactor:1,hasTouch:true,isMobile:true});
pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text().slice(0,200))});
const t0=Date.now();await pg.goto('http://localhost:8831/test_c1.html',{waitUntil:'commit'});
for(let i=0;i<40;i++){await pg.waitForTimeout(3000);const s=await pg.evaluate(()=>({ms:!!window.__milsim,fl:!!document.getElementById('flPlay'),mp:!!window.__mp,menu:document.getElementById('menu')?.style.display}));console.log((Date.now()-t0)/1000|0,JSON.stringify(s));if(s.fl)break;}
await pg.screenshot({path:'/tmp/c1/probe.png'});}finally{console.log('ERR',errs.slice(0,8).join(' | ')||'none');await b.close();}
