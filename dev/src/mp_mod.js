// ===== mp_mod.js — OWNER-ONLY mod menu. No new buttons: opened by ui builder's owner-only 'MOD' row (__mod.open) or 3-finger long-press.
{
const OK=()=>!!(window.__mp&&__mp.ownerActive);
const M={god:false,inf:true,speed:1,tod:null,fog:1,enemyFreeze:false,enemyMul:1,muted:new Set()};window.__modGod=false;
// --- game hooks (installed lazily) ---
function hooks(){
 if(typeof crash==='function'&&!crash.__mod){const _c=crash;crash=function(){if(M.god&&OK()&&player){player.vel&&player.vel.multiplyScalar(0);return;}return _c.apply(this,arguments);};crash.__mod=1;}
 if(typeof tick==='function'&&!tick.__mod){const _t=tick;tick=function(dt){return _t(dt*(OK()?M.speed:1));};tick.__mod=1;}}
const fr=new Map();
function perFrame(){hooks();if(!OK()){M.god=false;window.__modGod=false;return;}window.__modGod=M.god;
 if(player&&M.inf){for(const w of player.weapons)if(AMMO[w]!=null&&player.ammo[w]<AMMO[w])player.ammo[w]=AMMO[w];if(player.fuel!=null)player.fuel=player.fuelMax||1e9;if(player.ammo)player.cool=Math.min(player.cool||0,simT+0.05);}
 if(M.fog!==1&&scene.fog&&scene.fog.density!=null)scene.fog.density*=M.fog;
 if(M.tod!=null&&typeof sunDir!=='undefined'){const el=(M.tod/24)*2*Math.PI-Math.PI/2;sunDir.setFromSphericalCoords(1,Math.PI/2-Math.sin(el)*1.2,0.6);try{skyU.sunPosition.value.copy(sunDir);sun.position.copy(sunDir).multiplyScalar(1e4);}catch(e){}}
 for(const t of targets){if(M.enemyFreeze&&t.vel){if(!fr.has(t))fr.set(t,t.pos.clone());t.pos.copy(fr.get(t));t.vel.set(0,0,0);}else fr.delete(t);}
 window.__modEnemyMul=M.enemyMul;}
(function loop(){requestAnimationFrame(loop);try{perFrame()}catch(e){}})();
// --- multiplayer commands (clients obey ONLY the owner; host also refuses to relay non-owner 'mod') ---
let frozenMe=false;
if(window.__mp)__mp.on('mod',m=>{if(m.from!==__mp.ownerId)return; // reject non-owner
 const me=__mp.id,forMe=m.to===me||m.to==='*';
 if(__mp.isHost&&(m.cmd==='kick'||m.cmd==='ban'))__mp.hostKick(m.to,m.cmd==='ban');
 if(__mp.isHost&&m.cmd==='freeze'){m.on?__mp.frozen.add(m.to):__mp.frozen.delete(m.to);}
 if(!forMe)return;
 if(m.cmd==='freeze')frozenMe=!!m.on;
 if(m.cmd==='xp'&&window.__prog){const d=__prog.d;if(m.n>0)__prog.add(m.n);else{d.xp=Math.max(0,d.xp+m.n);}window.__save&&__save.write();}
 if(m.cmd==='mode'){settings.loc=m.map||settings.loc;window.__mpMode=m.mode;try{spawn(player?player.kind:'fighter',settings.loc);}catch(e){}}
 if(m.cmd==='end'){window.__save&&__save.matchEnd(false);if(typeof killFeed==='function')killFeed('Match over');setTimeout(()=>__mp.leave(),3000);}});
(function fz(){requestAnimationFrame(fz);if(frozenMe&&player&&player.vel){player.vel.set(0,0,0);player.cool=1e9;}else if(player&&player.cool===1e9)player.cool=0;})();
const cmd=(c,to,x={})=>{if(!OK())return;const m=Object.assign({t:'mod',cmd:c,to},x);__mp.send(m);__mp._st&&0;if(to==='*'||to===__mp.id)(__mp._handleSelf||(()=>{}))(m);
 if(__mp.isHost&&(c==='kick'||c==='ban'))__mp.hostKick(to,c==='ban');if(__mp.isHost&&c==='freeze')m.on?__mp.frozen.add(to):__mp.frozen.delete(to);};
// --- panel (MW2 skin: left stacked list, green/white highlight) ---
let el=null;
const css=`#mpMod{position:fixed;inset:0;z-index:60;background:linear-gradient(90deg,rgba(5,6,5,.94),rgba(5,6,5,.6) 55%,rgba(5,6,5,.2));font-family:var(--mw-f,system-ui);color:#f2f2ea;padding:calc(14px + env(safe-area-inset-top)) 20px 14px calc(26px + env(safe-area-inset-left));overflow:auto;-webkit-overflow-scrolling:touch}
#mpMod h3{margin:0 0 8px;font-size:20px;letter-spacing:.12em;color:#f3cf6a}#mpMod .sec{font-size:11px;letter-spacing:.3em;color:#9bd14a;margin:10px 0 2px}
#mpMod .r{width:min(380px,92vw);display:flex;justify-content:space-between;align-items:center;min-height:40px;padding:6px 12px;border-left:3px solid transparent;font-weight:700;font-size:15px;letter-spacing:.06em;text-transform:uppercase}
#mpMod .r:active,#mpMod .r.on{background:linear-gradient(90deg,rgba(155,209,74,.9),rgba(155,209,74,0));color:#0b0e08;border-left-color:#fff}#mpMod .r small{font-weight:500;opacity:.75}
#mpMod input[type=range]{width:150px;accent-color:#9bd14a}#mpMod select{background:#111;color:#f2f2ea;border:1px solid #444;font:inherit;font-size:13px}`;
function open(){if(!OK())return false;if(!document.getElementById('mpModCss')){const s=document.createElement('style');s.id='mpModCss';s.textContent=css;document.head.appendChild(s);}
 if(!el){el=document.createElement('div');el.id='mpMod';document.body.appendChild(el);}el.style.display='block';draw();try{setPaused(true)}catch(e){}return true;}
function close(){if(el)el.style.display='none';try{if(player)setPaused(false)}catch(e){}}
function draw(){if(!OK()){close();return;}el.innerHTML='<h3>◆ MOD</h3>';
 const sec=t=>{const d=document.createElement('div');d.className='sec';d.textContent=t;el.appendChild(d);};
 const row=(t,f,on,extra)=>{const d=document.createElement('div');d.className='r'+(on?' on':'');d.innerHTML=`<span>${t}</span>`;if(extra)d.appendChild(extra);if(f)d.onclick=e=>{if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return;f();draw();};el.appendChild(d);};
 const slider=(min,max,step,val,f)=>{const i=document.createElement('input');i.type='range';i.min=min;i.max=max;i.step=step;i.value=val;i.oninput=()=>f(+i.value);return i;};
 const sel=(opts,f)=>{const s=document.createElement('select');s.innerHTML='<option>—</option>'+opts.map(o=>`<option value="${o[0]}">${o[1]}</option>`).join('');s.onchange=()=>{if(s.value!=='—')f(s.value);s.value='—';};return s;};
 row('Resume',close);
 sec('PLAYER');row('God mode',()=>M.god=!M.god,M.god);row('Infinite ammo / fuel',()=>M.inf=!M.inf,M.inf);
 row('Aimbot',()=>{if(window.__aim)__aim.on=!__aim.on;},window.__aim&&__aim.on);
 row('Spawn vehicle',null,0,sel(Object.keys(DEFS).map(k=>[k,DEFS[k].name||k]),k=>{mission=null;spawn(k,settings.loc||'airbase');close();}));
 row('Add weapon',null,0,sel(Object.keys(AMMO).map(k=>[k,k]),w=>{if(player&&!player.weapons.includes(w)){player.weapons.push(w);player.ammo[w]=AMMO[w];}}));
 row('Teleport',null,0,sel([['0,8,1300','Airbase'],['0,25,6500','Carrier'],['0,10000,0','10 km'],['0,400000,0','Orbit 400 km'],['5000,300,-8000','City']],v=>{if(!player)return;const [x,y,z]=v.split(',').map(Number);player.mesh.position.set(x,y,z);player.onGround=false;close();}));
 sec('WORLD');row('Game speed <small>'+M.speed+'x</small>',null,0,slider(0.1,3,0.1,M.speed,v=>{M.speed=v;}));
 row('Time of day',null,0,slider(0,24,0.5,M.tod??12,v=>{M.tod=v;}));row('Weather / fog',null,0,slider(0.2,6,0.2,M.fog,v=>{M.fog=v;}));
 row('Enemy count / difficulty',null,0,slider(0,3,0.25,M.enemyMul,v=>{M.enemyMul=v;}));row('Freeze enemies',()=>M.enemyFreeze=!M.enemyFreeze,M.enemyFreeze);
 row('Air Defense Battery <small>killstreak</small>',()=>{if(window.__streak){__streak.grant();__streak.use();close();}});
 sec('PROFILE');row('+10 000 XP',()=>window.__prog&&__prog.add(10000));row('Max rank / prestige',()=>window.__save&&__save.ownerAssert());row('Unlock everything',()=>window.__save&&(__save.ownerAssert(),__save.write()));
 if(window.__mp&&__mp.state==='on'){sec('MATCH');
  for(const p of __mp.players){const s=sel([['kick','Kick'],['ban','Ban'],['mute','Mute'],['freeze','Freeze'],['unfreeze','Unfreeze'],['xp+','+5000 XP'],['xp-','−5000 XP'],['admin','Admin (silver)']],a=>{
    if(a==='mute'){M.muted.has(p.id)?M.muted.delete(p.id):M.muted.add(p.id);}else if(a==='freeze'||a==='unfreeze')cmd('freeze',p.id,{on:a==='freeze'});else if(a.startsWith('xp'))cmd('xp',p.id,{n:a==='xp+'?5000:-5000});else if(a==='admin')__mp.setAdmin(p.id,!__mp.admins.includes(p.id));else cmd(a,p.id);});
   row(p.name+(M.muted.has(p.id)?' <small>muted</small>':''),null,0,s);}
  row('Mode / map',null,0,sel((window.__gm?Object.entries(__gm.MODES).map(([k,v])=>[k+'|airbase',v.n]):[['tdm|airbase','TDM']]),v=>{const [mode,map]=v.split('|');cmd('mode','*',{mode,map});}));
  row('End match',()=>cmd('end','*'));}}
// mute: hide muted players' kill-feed lines and name tags locally (no chat/voice exists yet)
setInterval(()=>{if(!window.__mp||!__mp._st)return;for(const r of __mp._st.remotes.values())if(r.mesh.userData.tag)r.mesh.userData.tag.visible=!M.muted.has(r.id);},500);
// hidden gesture: three-finger long-press (650 ms)
let lp=null;addEventListener('touchstart',e=>{if(e.touches.length===3&&OK()){clearTimeout(lp);lp=setTimeout(()=>open(),650);}else if(e.touches.length!==3)clearTimeout(lp);},{passive:true});
addEventListener('touchend',()=>clearTimeout(lp),{passive:true});addEventListener('touchcancel',()=>clearTimeout(lp),{passive:true});
window.__mod={open,close,get visible(){return OK()},state:M,cmd};
}
