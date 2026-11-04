import pw from 'playwright';const [,,url,tag]=process.argv;const b=await pw.chromium.launch({executablePath:'/opt/google/chrome/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errs=[];const out=[];let fails=0;try{
const pg=await b.newPage({viewport:{width:844,height:390},deviceScaleFactor:2,hasTouch:true,isMobile:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
pg.on('pageerror',e=>errs.push('PE '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text().slice(0,150))});
await pg.addInitScript(()=>{try{localStorage.removeItem('dmProg')}catch(e){}});
await pg.goto(url,{waitUntil:'commit',timeout:120000});await pg.waitForFunction(()=>document.getElementById('flPlay'),null,{timeout:300000});await pg.waitForTimeout(6000);
const ins=async(w,h,s)=>pg.evaluate(s=>{const r=document.documentElement.style;const P=s===0;r.setProperty('--sat',P?'59px':'0px');r.setProperty('--sab',P?'34px':'21px');r.setProperty('--sal',P?'0px':s+'px');r.setProperty('--sar',P?'0px':s+'px');window.__milsim.thumb&&__milsim.thumb.layout&&__milsim.thumb.layout();},s);
await ins(844,390,47);
if(process.env.NOSHOT){pg.screenshot=async()=>{};}
const t=async q=>{const e=await pg.$(q);if(!e)throw new Error('missing '+q);await e.evaluate(x=>x.scrollIntoView({block:'center'}));await pg.waitForTimeout(300);const bb=await e.boundingBox();await pg.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);await pg.waitForTimeout(1200);};
const count=()=>pg.evaluate(()=>[...document.querySelectorAll('#menu .dmBtn,#menu .dmLink,#menu .flBack,#menu .flTab,#menu .flGo,#menu .btn,#menu .chip,#mwPrestGo,#touch .tb,#topb>div,#touch #thr')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'}).length);
await pg.evaluate(()=>document.getElementById('menu').scrollTop=0);await pg.waitForTimeout(500);
out.push('home buttons '+await count());await pg.screenshot({path:`progress/c1_${tag}_menu.png`});
await t('#flSet');out.push('settings buttons '+await count());await pg.evaluate(()=>document.getElementById('menu').scrollTop=0);await pg.waitForTimeout(400);await pg.screenshot({path:`progress/c1_owner_prestige.png`});
if(await pg.$('#mwPrestGo')){await t('#mwPrestGo');await pg.screenshot({path:`progress/c1_prestige_confirm.png`});await t('#mwConfirm .y');out.push('after prestige '+await pg.evaluate(()=>JSON.stringify(__prog.d)));}
await t(await pg.$('.dmBack')?'.dmBack':'#flBack');
await t('#flPlay');out.push('pick buttons '+await count());
const tabs=await pg.$$eval('.flTab',x=>x.map(y=>y.dataset.c));const tc=[];
for(const c of tabs){await t(`.flTab[data-c="${c}"]`);tc.push(c+':'+await pg.$$eval('.flCard',x=>x.filter(y=>y.style.display!=='none').length));}out.push('tabs '+tc.join(' '));
await t('.flTab[data-c="fighter"]');await pg.waitForTimeout(1500);await pg.screenshot({path:`progress/c1_${tag}_select.png`});
await t('.flTab[data-c="airdef"]');await pg.waitForTimeout(800);await pg.screenshot({path:`progress/c1_${tag}_airdef.png`});
const cards=await pg.$$eval('.flCard',x=>x.map(y=>y.dataset.k));
await t('.flTab[data-c="fighter"]');await t('#flNext');await t('#flLaunch');
await pg.evaluate(()=>{for(let i=0;i<5;i++)__milsim.step(15);});
await pg.waitForTimeout(800);out.push('hud buttons '+await count());
for(const [n,w,h,s] of [['13/14 844x390',844,390,47],['15/16 Pro',852,393,59],['15 Pro Max',932,430,59],['16 Pro Max',956,440,62],['portrait 390x844',390,844,0],['16 Pro Max portrait',440,956,0]]){
 await pg.setViewportSize({width:w,height:h});await ins(w,h,s);await pg.waitForTimeout(400);await pg.evaluate(()=>{for(let i=0;i<3;i++)__milsim.step(6);window.__mwLay&&__mwLay();});await pg.waitForTimeout(300);
 const r=await pg.evaluate(()=>{const c=__gsafeCheck();const ex=[];const vis=e=>{if(!e)return null;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<0.05)return null;const r=e.getBoundingClientRect();return r.width>0?r:null;};
  const mine=['mwMap','mwKS','mwAmmo','hc'].map(i=>[i,vis(document.getElementById(i))]).filter(x=>x[1]);
  const others=[...document.querySelectorAll('#touch .tb,#bHud,#topb>div,#thr,#joy,#joyZone,#hcards,#hcards .hg,#hr,#gbar,#msg,#mwMap,#nhud .glass')].map(e=>[e.id||e.className,vis(e)]).filter(x=>x[1]);
  const ov=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>0.5&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>0.5;
  for(const [a,ra] of mine){for(const [o,ro] of others)if(o!==a&&ov(ra,ro))ex.push(a+' x '+o);if(ra.left<0||ra.right>innerWidth||ra.top<0||ra.bottom>innerHeight)ex.push('offscreen '+a);}
  return {P:c.P.concat(ex),n:c.n+mine.length};});
 fails+=r.P.length;out.push(`${n} ${w}x${h}: ${r.n} items ${r.P.length?r.P.join('; '):'OK'}`);
 if(w===844)await pg.screenshot({path:`progress/c1_${tag}_jet.png`});if(w===390)await pg.screenshot({path:`progress/c1_${tag}_jet_portrait.png`});}
out.push('OVERLAP FAILS '+fails);
await pg.setViewportSize({width:844,height:390});await ins(844,390,47);
await pg.evaluate(()=>{__milsim.spawn('sub','airbase');for(let i=0;i<4;i++)__milsim.step(6);});await pg.waitForTimeout(1500);await pg.screenshot({path:`progress/c1_${tag}_sub.png`});
let sf=[];for(const k of cards.filter(k=>!k.startsWith('ad_'))){const r=await pg.evaluate(k=>{try{__milsim.spawn(k,'airbase');__milsim.step(4);return 'ok';}catch(e){return 'ERR '+e.message.slice(0,80)}},k);if(r!=='ok')sf.push(k+' '+r);}out.push('spawn '+cards.length+' fails:'+(sf.join(',')||'none'));
}catch(e){out.push('FAIL '+e.message)}finally{out.push('ERR '+(errs.slice(0,6).join(' | ')||'none'));console.log(out.join('\n'));await b.close();}
