// ===== mp_modes.js — MW2-style MP game modes, host-authoritative. Host picks mode inside the Multiplayer menu (__gm.panel) or owner mod menu.
{
const MODES={ffa:{n:'Free-for-All',score:30,time:600,team:false},tdm:{n:'Team Deathmatch',score:75,time:600,team:true},
 dom:{n:'Domination',score:200,time:600,team:true},sd:{n:'Search & Destroy',score:4,time:900,team:true,oneLife:true,round:150},
 hq:{n:'Headquarters',score:250,time:600,team:true},ctf:{n:'Capture the Flag',score:3,time:900,team:true},
 asb:{n:'Air/Sea Battle',score:50,time:600,team:true,veh:['air','ship','sub','heli']},coop:{n:'Co-op vs Red Coalition',score:3000,time:900,team:true,coop:true}};
const FLAGS=[[-1500,0,0],[0,0,1500],[1500,0,0]],BASES=[[-3000,0,2000],[3000,0,2000]],SITE=[0,0,3000],R=350;
const G={mode:null,t:0,teams:{},ps:{},ts:[0,0],own:[-1,-1,-1],hq:0,flags:[{at:null,by:null},{at:null,by:null}],bomb:{planted:false,t:0,prog:0},dead:{},over:false,round:1,rt:0};
const mp=()=>window.__mp,isHost=()=>mp()&&mp().isHost&&mp().state==='on';
const ids=()=>[mp().id,...mp().players.map(p=>p.id)];
const posOf=id=>{if(id===mp().id)return player&&player.mesh&&player.mesh.position;const r=mp()._st.remotes.get(id);return r&&r.mesh.position;};
const d2=(p,q)=>p?Math.hypot(p.x-q[0],p.z-q[2]):1e9;
const team=id=>G.teams[id]??0,M=()=>MODES[G.mode]||null;
function assign(){const l=ids();l.forEach((id,i)=>{if(G.teams[id]==null){const c=[0,0];for(const k in G.teams)c[G.teams[k]]++;G.teams[id]=c[0]<=c[1]?0:1;}});}
function start(mode){if(!isHost()||!MODES[mode])return;Object.assign(G,{mode,t:MODES[mode].time,teams:{},ps:{},ts:[0,0],own:[-1,-1,-1],hq:0,flags:[{at:null,by:null},{at:null,by:null}],bomb:{planted:false,t:0,prog:0},dead:{},over:false,round:1,rt:MODES[mode].round||0});assign();push();}
function add(id,n){G.ps[id]=(G.ps[id]||0)+n;if(M()&&M().team)G.ts[team(id)]+=0;} // per-player points for scoreboard
function tscore(tm,n){G.ts[tm]+=n;}
function end(){if(G.over)return;G.over=true;push();}
function push(){const m={t:'gm',g:snap()};mp().send(m);recv(m.g);}
const snap=()=>({mode:G.mode,t:Math.round(G.t),teams:G.teams,ps:G.ps,ts:G.ts,own:G.own,hq:G.hq,flags:G.flags,bomb:G.bomb,dead:G.dead,over:G.over,round:G.round});
// host: kills -> score
function onKill(m){if(!isHost()||!M()||G.over)return;const md=M(),k=m.killer,v=m.victim;add(k,md.team?1:1);
 if(G.mode==='ffa'){if((G.ps[k]||0)>=md.score)end();}
 else if(G.mode==='tdm'||G.mode==='asb'){tscore(team(k),1);if(G.ts[team(k)]>=md.score)end();}
 else if(G.mode==='sd'){G.dead[v]=1;checkSD();}
 else if(G.mode==='dom'||G.mode==='hq')tscore(team(k),5);push();}
function checkSD(){const alive=[0,0];for(const id of ids())if(!G.dead[id])alive[team(id)]++;if(!alive[1]&&!G.bomb.planted)roundWin(0);else if(!alive[0]&&!G.bomb.planted)roundWin(1);}
function roundWin(tm){G.ts[tm]++;if(G.ts[tm]>=M().score){end();return;}G.round++;G.dead={};G.bomb={planted:false,t:0,prog:0};G.rt=M().round;push();}
let acc=0;
function hostTick(dt){if(!isHost()||!M()||G.over)return;assign();G.t-=dt;acc+=dt;
 if(G.mode==='coop'&&G.ts[0]>=M().score)return end();
 if(G.t<=0)return end();
 const tick1=acc>=1;if(tick1)acc=0;
 if(G.mode==='dom'&&tick1){FLAGS.forEach((f,i)=>{const n=[0,0];for(const id of ids())if(d2(posOf(id),f)<R)n[team(id)]++;if(n[0]&&!n[1])G.own[i]=0;else if(n[1]&&!n[0])G.own[i]=1;});for(const o of G.own)if(o>=0)tscore(o,1);}
 if(G.mode==='hq'&&tick1){if(Math.floor(G.t/60)!==G._hz){G._hz=Math.floor(G.t/60);G.hq=(G.hq+1)%3;}const f=FLAGS[G.hq],n=[0,0];for(const id of ids())if(d2(posOf(id),f)<R)n[team(id)]++;if(n[0]&&!n[1])tscore(0,2);else if(n[1]&&!n[0])tscore(1,2);}
 if(G.mode==='ctf'){for(const tm of [0,1]){const fl=G.flags[tm],eb=BASES[tm],mb=BASES[1-tm];
   if(!fl.by){for(const id of ids())if(team(id)!==tm&&d2(posOf(id),eb)<R){fl.by=id;break;}}
   else{const p=posOf(fl.by);if(!p||G.dead[fl.by]){fl.by=null;}else if(d2(p,mb)<R){tscore(1-tm,1);fl.by=null;if(G.ts[1-tm]>=M().score)end();}}}}
 if(G.mode==='sd'){G.rt-=dt;const b=G.bomb;
   if(!b.planted){let a=false;for(const id of ids())if(team(id)===0&&!G.dead[id]&&d2(posOf(id),SITE)<R)a=true;b.prog=a?b.prog+dt:0;if(b.prog>=5){b.planted=true;b.t=45;b.prog=0;}if(G.rt<=0)roundWin(1);}
   else{b.t-=dt;let d=false;for(const id of ids())if(team(id)===1&&!G.dead[id]&&d2(posOf(id),SITE)<R)d=true;b.prog=d?b.prog+dt:0;if(b.prog>=5)roundWin(1);else if(b.t<=0){if(typeof explosion==='function')explosion(V3(SITE[0],5,SITE[2]),3);roundWin(0);}}}
 if(tick1)push();}
// clients receive state
let shown=false;
function recv(g){const was=G.over;Object.assign(G,g);if(!mp())return;hud();if(G.over&&!was&&!shown){shown=true;award();board();}if(!G.over)shown=false;}
if(window.__mp){__mp.on('gm',m=>recv(m.g));__mp.on('k',onKill);}
// co-op: AI kills count for the players' team
{const iv=setInterval(()=>{if(typeof killTarget!=='function')return;clearInterval(iv);const _k=killTarget;killTarget=function(t,b){const was=t.alive;const r=_k.apply(this,arguments);if(was&&!t.alive&&G.mode==='coop'&&!G.over&&mp()&&mp().state==='on'){if(isHost())tscore(0,t.def&&t.def.score||150);else mp().send({t:'gmai',n:t.def&&t.def.score||150});}return r;};},500);}
if(window.__mp)__mp.on('gmai',m=>{if(isHost()&&G.mode==='coop')tscore(0,Math.min(+m.n||0,500));});
// rules used by mp_net
function allowHit(a,b){if(!M())return true;if(M().coop)return false;if(M().team&&team(a)===team(b))return false;return true;}
function canRespawn(){if(!M()||G.over)return true;if(G.mode==='sd')return !G.dead[mp().id];return true;}
// XP awards -> saved progress/prestige
function award(){const me=mp().id,md=M();const won=md.team?G.ts[team(me)]>G.ts[1-team(me)]:Object.entries(G.ps).sort((a,b)=>b[1]-a[1])[0]?.[0]===me;
 const xp=500+(G.ps[me]||0)*100+(won?1000:0);if(window.__prog)__prog.add(xp);if(window.__save){__save.matchEnd(won);}G._xp=xp;G._won=won;}
// minimal HUD: one top-centre line, no overlap with minimap (top-left) / kill feed (right)
let bar=null;function hud(){if(!M()){if(bar)bar.style.display='none';return;}if(!bar){bar=document.createElement('div');bar.id='mpBar';bar.style.cssText='position:fixed;top:calc(6px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:8;pointer-events:none;font:700 13px var(--mw-f,system-ui);letter-spacing:.08em;color:#f2f2ea;background:rgba(10,12,9,.55);padding:3px 12px;white-space:nowrap';document.body.appendChild(bar);}
 bar.style.display='block';const mm=Math.max(0,Math.floor(G.t/60)),ss=String(Math.max(0,Math.floor(G.t%60))).padStart(2,'0');const me=mp().id;
 const sc=M().team?`<span style="color:#9bd14a">${G.ts[team(me)]}</span> – <span style="color:#d9433a">${G.ts[1-team(me)]}</span>`:`${G.ps[me]||0} / ${M().score}`;
 const ex=G.mode==='dom'?' '+['A','B','C'].map((l,i)=>`<span style="color:${G.own[i]<0?'#aaa':G.own[i]===team(me)?'#9bd14a':'#d9433a'}">${l}</span>`).join(''):G.mode==='sd'&&G.bomb.planted?' BOMB '+Math.ceil(G.bomb.t):'';
 bar.innerHTML=`${G.mode.toUpperCase()} ${sc} ${mm}:${ss}${ex}`;}
setInterval(()=>{if(M()&&!isHost()&&!G.over){G.t=Math.max(0,G.t-1);hud();}},1000);
// end-of-match scoreboard
function board(){let b=document.getElementById('mpBoard');if(!b){b=document.createElement('div');b.id='mpBoard';document.body.appendChild(b);}
 const rows=[mp().id,...mp().players.map(p=>p.id)].map(id=>({id,n:id===mp().id?'You':(mp().players.find(p=>p.id===id)||{}).name,s:G.ps[id]||0,t:team(id)})).sort((a,b)=>b.s-a.s);
 b.style.cssText='position:fixed;inset:0;z-index:55;background:rgba(5,6,5,.88);font-family:var(--mw-f,system-ui);color:#f2f2ea;padding:calc(20px + env(safe-area-inset-top)) 30px;';
 b.innerHTML=`<div style="font:700 26px var(--mw-f,system-ui);letter-spacing:.1em;color:${G._won?'#9bd14a':'#d9433a'}">${G._won?'VICTORY':'DEFEAT'}</div><div style="letter-spacing:.2em;font-size:12px;opacity:.7">${M().n.toUpperCase()}${M().team?'  '+G.ts[0]+' – '+G.ts[1]:''}  ·  +${G._xp} XP</div>`+
  rows.map(r=>`<div style="display:flex;justify-content:space-between;width:min(420px,90vw);padding:6px 10px;margin-top:3px;background:${r.id===mp().id?'rgba(155,209,74,.25)':'rgba(255,255,255,.05)'};border-left:3px solid ${M().team?(r.t===team(mp().id)?'#9bd14a':'#d9433a'):'#fff'}"><span>${(r.id===mp().ownerId?'◆ ':'')+r.n}</span><span>${r.s}</span></div>`).join('');
 b.onclick=()=>b.remove();setTimeout(()=>b.remove(),12000);}
// ASB vehicles only
setInterval(()=>{if(G.mode==='asb'&&player&&DEFS[player.kind]&&!MODES.asb.veh.includes(DEFS[player.kind].cls)&&!(mp()&&mp().isOwner)){try{spawn('fighter');}catch(e){}}},1000);
let last=performance.now();(function loop(){requestAnimationFrame(loop);const n=performance.now(),dt=Math.min(.1,(n-last)/1000);last=n;try{hostTick(dt);if(isHost()&&M())hud();}catch(e){console.warn(e)}})();
// mode-select rows for the existing Multiplayer menu view (host only)
function panel(el){if(!isHost())return;const s=document.createElement('select');s.className='dmLink mpRow';s.innerHTML='<option value="">Mode</option>'+Object.entries(MODES).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join('');s.onchange=()=>{if(s.value)start(s.value);};el.appendChild(s);}
if(window.__mp)__mp.on('mod',m=>{if(m.from===__mp.ownerId&&m.cmd==='mode'&&m.mode&&isHost())start(m.mode);if(m.from===__mp.ownerId&&m.cmd==='end'&&isHost())end();});
window.__gm={MODES,start,end,panel,allowHit,canRespawn,get state(){return G},team};
}
