import {chromium as webkit,devices} from 'playwright';
const SHOT=process.argv[2]==='shot';const b=await webkit.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
try{const ctx=await b.newContext({viewport:{width:640,height:360},deviceScaleFactor:1});const pg=await ctx.newPage();pg.setDefaultTimeout(300000);
pg.on('console',m=>{if(m.type()==='error')errs.push(m.text());});pg.on('pageerror',e=>errs.push('PAGEERR '+e.message+' '+(e.stack||'').slice(0,300)));
await pg.goto('http://localhost:8836/test_c6.html',{waitUntil:'commit'});await pg.waitForFunction(()=>window.__milsim,null,{timeout:300000});
await pg.evaluate(()=>{const t=document.getElementById('tutOk');t&&t.click();});await pg.waitForTimeout(4000);
const ev=(f,a)=>pg.evaluate(f,a),st=n=>ev(n=>__milsim.step(n,1/30),n),log=(...a)=>console.log(...a);
log('mods',await ev(()=>({navy:typeof NAVY_FLEET!=='undefined'?NAVY_FLEET.ships.map(s=>s.kind):null,red:window.__red?__red.E.map(u=>u.kind+(u.k?':'+u.k:'')):null,rules:window.__red&&__red.RULES,tank:!!window.__tank,base:!!window.__base,ppl:!!window.PPL,crew:window.__c6crew})));
const defs=await ev(()=>Object.keys(__c6.DEFS));log('defs',defs.length);
const bad=[];const FROM=process.env.FROM||'';let on=!FROM;for(const k of defs){if(k===FROM)on=true;if(!on)continue;console.log('try',k);const r=await ev(k=>{try{__milsim.setPaused&&__milsim.setPaused(false);if(k==='foot')return 'ok';if(__c6.DEFS[k].tank){__tank.spawnK(k);__milsim.step(5,1/30);return __tank.player?'ok':'notank';}__c6.spawn(k);__milsim.step(5,1/30);return __c6.player&&__c6.player.alive?'ok':'dead';}catch(e){return 'ERR '+e.message}},k);if(r!=='ok')bad.push(k+':'+r);}
log('spawn bad',bad);

log('tank',await ev(()=>{try{__tank.spawnK('abrams');__milsim.step(10,1/30);return [__tank.player&&__tank.player.kind,__tank.V.length,__tank.V.filter(v=>v.side==='red').length];}catch(e){return 'ERR '+e.message}}));
if(SHOT){await st(2);await pg.screenshot({path:'progress/c6_abrams.png'});}
log('base',await ev(()=>{try{__base.spawnAt('afb');__milsim.step(10,1/30);return [__c6.player.kind,__base.props.length,!!__base.nearest()];}catch(e){return 'ERR '+e.message}}));
if(SHOT){await st(2);await pg.screenshot({path:'progress/c6_onfoot.png'});}
log('crew',await ev(()=>window.__c6crew));
await st(300);log('red alive',await ev(()=>__red.E.filter(u=>u.hp>0).length),'redW',await ev(()=>__red.W.length));
}catch(e){console.log('FAIL',e.message);}finally{console.log('ERRORS',errs.length,JSON.stringify(errs.slice(0,12)));await b.close();}
