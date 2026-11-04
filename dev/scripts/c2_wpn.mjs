import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const kill=setTimeout(()=>process.exit(2),600000);
try{const pg=await b.newPage({viewport:{width:932,height:430}});pg.setDefaultTimeout(240000);const errs=[];pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text());if(m.type()==='warning'&&m.text().includes('wpn'))errs.push('W '+m.text())});
await pg.goto('http://localhost:8832/test_c2.html',{waitUntil:'commit'});await pg.waitForFunction(()=>window.__milsim&&window.WPF,null,{timeout:240000});
await pg.evaluate(()=>{__milsim.spawn('infantry');__milsim.step(2);});const r={res:[]};
const ids=await pg.evaluate(()=>WPN.list.map(w=>w.id));
for(const id of ids){r.res.push(await pg.evaluate(id=>{const M=__milsim,w=WPN.W[id];WPF.give(id);WPF._S.slot=WPF._S.load.p===id?0:1;WPF._S.cool=0;WPF._S.rel=0;const m0=WPF.state().mag;
  if(w.cls==='sn'||id==='javelin'||id==='stinger'){dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' '}));M.step(6);dispatchEvent(new KeyboardEvent('keyup',{code:'Space',key:' '}));M.step(2);}else WPF.fire();M.step(1);const st=WPF.state();return id+':'+(st.cur===id&&st.mag<m0?'ok':'FAIL '+st.cur+' '+m0+'>'+st.mag);},id));}
Object.assign(r,await pg.evaluate(()=>{const M=__milsim,out={on:WPF.state().on,cnt:WPN.count()};for(const e of WPN.EQUIP){WPF.setLoadout({lethal:e[0]});WPF.throwEquip();}M.step(120);
 WPF.give('m4a1');WPF._S.slot=0;WPF.fire();M.step(2);WPF.cycle();WPF.cycle();M.step(80);out.reloadOK=WPF.state().mag===30;
 WPF._S.ksReady='uav';WPF._S.slot=3;WPF.fire();out.ks=WPF._S.ksReady===null;const S=WPF._S;S.st=1;M.step(60);out.crouchY=+(S.stH).toFixed(2);S.st=2;M.step(60);out.proneY=+(S.stH).toFixed(2);S.st=0;M.inp.fire=false;return out;}));
console.log(JSON.stringify(r));const fails=r.res.filter(x=>x.includes('FAIL'));console.log('weapons fired OK',r.res.length-fails.length,'/',r.res.length,fails);
// other vehicles still spawn
console.log('veh',await pg.evaluate(()=>{const bad=[];for(const k of Object.keys(WPF._defs())){try{__milsim.spawn(k);__milsim.step(5);}catch(e){bad.push(k+':'+e.message);}}__milsim.spawn('infantry');__milsim.step(5);return Object.keys(WPF._defs()).length+' bad '+JSON.stringify(bad)+' footAgain '+WPF.state().on;}));
console.log('ERR',JSON.stringify([...new Set(errs)].slice(0,10)));}finally{clearTimeout(kill);await b.close();}
