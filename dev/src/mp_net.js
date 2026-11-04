// ===== mp_net.js — DOMINION online multiplayer (P2P WebRTC via PeerJS public broker) =====
// Star topology: host relays. Up to 5 players (host + 4). No new buttons: UI builder calls __mp.panel(el) inside a menu view.
{
const MP_MAX=5,SEND_HZ=15,INTERP=0.12,PFX='dominion-mp-';
const q=new URLSearchParams(location.search);
const srvOpt=(()=>{const s=q.get('mpsrv')||window.MP_SERVER;if(!s)return {};const [h,p]=s.split(':');return {host:h,port:+(p||9000),path:'/',secure:false};})();
// ---- owner (Kyle) rules ----
// OWNER_PUB: pin Kyle's iPhone public key. Do not invent one.
// Until a pin is set, the room HOST is the owner (any host).
// Set the pin before hosting, in any of these ways (the value is the string from __mp.ownerPub() on his phone):
//   1. window.MP_OWNER_PUB = '<spki-base64>'   (inline script before this module, or the console before Host)
//   2. localStorage.setItem('MP_OWNER_PUB', '<spki-base64>')
//   3. ?mpowner=<encodeURIComponent(spki-base64)>
// A peer becomes owner only when their stored mp_owner_key public half matches the pin.
function ownerPubPin(){try{const q=new URLSearchParams(location.search).get('mpowner');if(q)return q;}catch(e){}
 try{const s=localStorage.getItem('MP_OWNER_PUB');if(s)return s;}catch(e){}
 return (typeof window.MP_OWNER_PUB==='string'&&window.MP_OWNER_PUB)||'';}
const OWNER_KINDS=new Set(['tr3b','saucer','sr71','darkstar','silo','rods','shuttle','rocket','falcon9','starship','saturn','saturnv','lander','b2']);
const OWNER_W=new Set(['NUKE','TACNUKE','ICBM','SLBM','MIRV','ROD']);
const ownerOnly=k=>{const d=(typeof DEFS!=='undefined'&&DEFS[k])||{};return OWNER_KINDS.has(k)||d.cls==='rocket'||/saturn|lander|orion|dragon|capsule|space|orbit/i.test(k)||(d.weapons||[]).length&&d.weapons.every(w=>OWNER_W.has(w));};
const EDGE={dmgOut:1.25,dmgIn:0.75};
const enc=b=>btoa(String.fromCharCode(...new Uint8Array(b))),dec=t=>Uint8Array.from(atob(t),c=>c.charCodeAt(0));
async function ownerKey(create){let j=localStorage.getItem('mp_owner_key');if(!j&&!create)return null;
 if(!j){const kp=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);j=JSON.stringify({pub:enc(await crypto.subtle.exportKey('spki',kp.publicKey)),priv:await crypto.subtle.exportKey('jwk',kp.privateKey)});localStorage.setItem('mp_owner_key',j);}
 const o=JSON.parse(j);const pin=ownerPubPin();if(pin&&o.pub!==pin)return null;o.k=await crypto.subtle.importKey('jwk',o.priv,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);return o;}
async function verifyOwner(pub,sig,nonce){const pin=ownerPubPin();if(!pin||pub!==pin)return false;try{const k=await crypto.subtle.importKey('spki',dec(pub),{name:'ECDSA',namedCurve:'P-256'},false,['verify']);return await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},k,dec(sig),new TextEncoder().encode(nonce));}catch(e){return false;}}
const st={admins:new Set(),owner:null,isOwner:false,nonces:new Map(),state:'off',code:null,host:false,me:null,name:(localStorage.getItem('mp_name')||'P'+Math.floor(100+Math.random()*900)),peer:null,conns:new Map(),remotes:new Map(),hp:100,kills:0,deaths:0,err:null,cbs:[]};
const emit=()=>{for(const f of st.cbs)try{f(st)}catch(e){}};
const loadLib=()=>window.Peer?Promise.resolve():new Promise((res,rej)=>{const s=document.createElement('script');s.src=window.MP_PEERJS_URL||'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';s.onload=res;s.onerror=()=>rej(new Error('PeerJS load failed'));document.head.appendChild(s);});
const code4=()=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c='';for(let i=0;i<5;i++)c+=A[Math.floor(Math.random()*A.length)];return c;};
// ---- remote avatars (reuse in-game builders, light) ----
function avatarMesh(kind){if(window.__mpAvatar){try{const a=__mpAvatar(kind);if(a){const c=document.createElement('canvas');c.width=256;c.height=64;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));sp.scale.set(40,10,1);sp.position.y=12;sp.userData.cv=c;a.add(sp);a.userData.tag=sp;return a;}}catch(e){}}const d=(typeof DEFS!=='undefined'&&DEFS[kind])||{cls:'air'};let m;
 try{if(d.cls==='heli')m=heli();else if(kind==='sub'||d.cls==='sub')m=sub();else if(d.cls==='ship')m=destroyer();else m=jet(0x7d4a3a,false,kind);}catch(e){m=new THREE.Mesh(new THREE.BoxGeometry(8,3,16),new THREE.MeshStandardMaterial({color:0xaa4433}));}
 const c=document.createElement('canvas');c.width=256;c.height=64;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));sp.scale.set(40,10,1);sp.position.y=d.cls==='ship'||d.cls==='sub'?40:12;sp.userData.cv=c;m.add(sp);m.userData.tag=sp;return m;}
function setTag(r,ph=0){const own=r.id===st.owner,adm=!own&&st.admins.has(r.id),nm=cleanName(r.name,r.id),c=r.mesh.userData.tag.userData.cv,x=c.getContext('2d');x.clearRect(0,0,256,64);x.font='700 26px system-ui';x.textAlign='center';
 x.fillStyle=own?'rgba(6,14,24,.82)':'rgba(0,0,0,.55)';x.fillRect(12,8,232,48);
 if(own){// GOLD + DIAMOND: rich gold text, diamond-white shimmer sweep, white diamond set in gold
  const k=ph%1,g=x.createLinearGradient(0,0,256,0);g.addColorStop(0,'#b8862b');g.addColorStop(Math.max(0,k-.07),'#f3cf6a');g.addColorStop(k,'#ffffff');g.addColorStop(Math.min(1,k+.07),'#f3cf6a');g.addColorStop(1,'#c9962f');
  x.strokeStyle='#d4af37';x.lineWidth=2.5;x.strokeRect(13.5,9.5,229,45);x.fillStyle=g;x.fillText('OWNER · '+nm,138,41);
  x.beginPath();x.moveTo(30,17);x.lineTo(41,26);x.lineTo(30,47);x.lineTo(19,26);x.closePath();x.fillStyle='#eaf8ff';x.fill();x.strokeStyle='#d4af37';x.lineWidth=2.5;x.stroke();
  const sp=(Math.sin(ph*9)+1)/2;x.fillStyle=`rgba(255,255,255,${.4+.6*sp})`;x.fillRect(27,22,3,3);x.fillRect(200+30*k,12,2,2);}
 else{x.fillStyle=adm?'#c9ced6':'#9bd14a';x.fillText(adm?'ADMIN · '+nm:nm,128,41);if(adm){x.strokeStyle='#aab2bc';x.lineWidth=2;x.strokeRect(13.5,9.5,229,45);}}
 r.mesh.userData.tag.material.map.needsUpdate=true;
 // elite kit: owner only (ppl builder's ppl_ownerAvatar, if present in build)
 const fa=typeof ppl_ownerAvatar==='function'?ppl_ownerAvatar:window.ppl_ownerAvatar;
 if(own&&fa&&!r.mesh.userData.elite){try{const a=fa();if(a){a.position.y=r.mesh.userData.tag.position.y*0.55;r.mesh.add(a);r.mesh.userData.elite=a;}}catch(e){}}
 if(!own&&r.mesh.userData.elite){r.mesh.remove(r.mesh.userData.elite);r.mesh.userData.elite=null;}r.mesh.userData.tag.material.map.needsUpdate=true;}
function remoteFor(id,kind,name){let r=st.remotes.get(id);if(r&&r.kind!==kind){scene.remove(r.mesh);r=null;}
 if(!r){r={id,kind,name:name||id.slice(-4),buf:[],mesh:avatarMesh(kind),alive:true};scene.add(r.mesh);st.remotes.set(id,r);setTag(r);}
 else if(name&&r.name!==name){r.name=name;setTag(r);}return r;}
function dropRemote(id,why){const r=st.remotes.get(id);if(!r)return;scene.remove(r.mesh);st.remotes.delete(id);if(why&&typeof killFeed==='function')killFeed(r.name+' '+why);emit();}
// ---- messaging ----
function sendAll(m,except){for(const [id,c] of st.conns)if(id!==except)try{c.send(m)}catch(e){}}
function out(m){m.from=m.from||st.me;sendAll(m);} // host: to all; client: only conn is host, host relays
function onMsg(c,m){if(!m||!m.t)return;if(st.host){m.from=c.peer;if(!hostFilter(c,m))return;sendAll(m,c.peer);}handle(m);}
// host authority: joiners cannot spawn/fire owner-only items; damage computed here (owner edge)
function hostFilter(c,m){const own=m.from===st.owner;
 if(m.t==='auth'){verifyOwner(m.pub,m.sig,st.nonces.get(c.peer)).then(ok=>{if(ok){st.owner=c.peer;sendAll({t:'own',id:c.peer,from:st.me});handle({t:'own',id:c.peer});}});return false;}
 if(m.t==='s'&&!own&&ownerOnly(m.k)){try{c.send({t:'deny',k:m.k,from:st.me})}catch(e){}return false;}
 if(m.t==='f'&&!own&&OWNER_W.has(m.w))return false;
 if(m.t==='h'){if(!own&&OWNER_W.has(m.w))return false;if(window.__gm&&!__gm.allowHit(m.from,m.to))return false;m.d=dmgFor(m.from,m.to,m.w);if(m.to===st.me){handle(m);return false;}}
 if(m.t==='k'&&m.victim!==m.from)return false;
 if(m.aim&&!own)return false; // non-owner claiming aim assist
 if((m.t==='mod'||m.t==='adm')&&!own)return false; // only owner may issue mod commands
 if(m.t==='id'){c.__dev=m.dev;if(bans().includes(m.dev)){try{c.send({t:'kick',to:m.dev,ban:1,from:st.me})}catch(e){}setTimeout(()=>c.close(),300);}return false;}
 if(frozen.has(m.from)&&(m.t==='f'||m.t==='h'))return false;if(m.t==='gm'&&m.from!==st.me)return false;if(m.t==='own'||m.t==='deny'||m.t==='full')return false;return true;}
function dmgFor(from,to,w){let d=DMG[w]??40;if(from===st.owner)d*=EDGE.dmgOut;if(to===st.owner)d*=EDGE.dmgIn;return Math.round(d*10)/10;}
const ons={};function handle(m){const now=performance.now()/1000;for(const f of ons[m.t]||[])try{f(m)}catch(e){console.warn(e)}
 switch(m.t){
 case 's':{const r=remoteFor(m.from,m.k,m.n);r.buf.push({t:now,p:m.p,q:m.q,a:m.a});if(r.buf.length>8)r.buf.shift();r.alive=m.a;r.mesh.visible=m.a!==false;r.lastT=now;if(m.p&&m.p.length===3)r.mesh.position.set(+m.p[0],+m.p[1],+m.p[2]);if(m.q&&m.q.length===4)r.mesh.quaternion.set(+m.q[0],+m.q[1],+m.q[2],+m.q[3]);if(m.x!==undefined&&window.__mpExtraIn)try{__mpExtraIn(r,m.x)}catch(e){}break;}
 case 'f':{remoteFire(m);break;}
 case 'h':{if(m.to===st.me)takeHit(m);break;}
 case 'k':{const kn=(m.killer===st.owner?'OWNER ':'')+cleanName(nameOf(m.killer),m.killer),vn=cleanName(nameOf(m.victim),m.victim);if(m.killer===st.me){st.kills++;try{if(typeof score!=='undefined')score+=250;}catch(e){}if(typeof hitTick==='function')hitTick(true);}
   if(typeof killFeed==='function')killFeed(kn+'  ['+(m.w||'')+']  '+vn);{const e=document.getElementById('kfeed')?.firstChild;if(e){if(m.killer===st.owner){e.classList.add('mpDia');const d=document.createElement('span');d.className='dia';d.textContent='◆ ';e.prepend(d);}else if(st.admins.has(m.killer))e.classList.add('mpSil');}}const r=st.remotes.get(m.victim);if(r&&typeof explosion==='function')explosion(V3(...m.p),1.6);emit();break;}
 case 'adm':if(m.from===st.owner||(st.host&&m.from===st.me&&st.isOwner)){m.on?st.admins.add(m.id):st.admins.delete(m.id);for(const r of st.remotes.values())setTag(r);emit();}break;
 case 'own':st.owner=m.id;st.isOwner=m.id===st.me;for(const r of st.remotes.values())setTag(r);emit();break;
 case 'hello':if(!st.host){st.nonces.set('host',m.nonce);ownerKey(false).then(async o=>{if(!o)return;const sig=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},o.k,new TextEncoder().encode(m.nonce));out({t:'auth',pub:o.pub,sig:enc(sig)});});}break;
 case 'deny':if(player&&ownerOnly(player.kind))try{spawn('fighter');setPaused(false);}catch(e){}if(typeof killFeed==='function')killFeed('Owner only');break;
 case 'kick':if(!st.host&&m.from===[...st.conns.keys()][0]){st.err=m.ban?'Banned':'Kicked';leave();}break;
 case 'bye':dropRemote(m.from,'left');break;
 case 'full':st.err='Room full';leave();break;}}
const RESV=()=>[...(window.MP_RESERVED||['kyle','kyleoneill','kyleoneill5','dominion','owner','ceo','admin'])].sort((a,b)=>b.length-a.length);
const cleanName=(n,id)=>{n=String(n||'Player');if(id&&id===st.owner)return n.trim().slice(0,12)||'Player';const raw=n.trim();for(const r of RESV())if(raw.toLowerCase()===r)return 'Player';let s=n;for(const r of RESV())s=s.replace(new RegExp(r,'ig'),'');s=s.replace(/[^A-Za-z0-9 _.-]/g,'').trim().slice(0,12);return s||'Player';};
const DEV=localStorage.getItem('mp_dev')||(()=>{const d=crypto.randomUUID();localStorage.setItem('mp_dev',d);return d;})();
const bans=()=>{try{return JSON.parse(localStorage.getItem('mp_bans')||'[]')}catch(e){return []}};const frozen=new Set();
const nameOf=id=>id===st.me?st.name:(st.remotes.get(id)?.name||'Player');
// ---- local fire / hits ----
const tracked=new Set();
function remoteFire(m){try{const g=new THREE.Mesh(new THREE.SphereGeometry(m.w==='GUN'||m.w==='CIWS'?0.5:1.2,6,4),new THREE.MeshBasicMaterial({color:0xffc070}));g.position.set(...m.p);scene.add(g);const v=V3(...m.v);let life=m.w==='GUN'||m.w==='CIWS'?1.2:6;
 const f=(dt)=>{g.position.addScaledVector(v,dt);life-=dt;if(life<=0){scene.remove(g);return false;}return true;};fx.push(f);}catch(e){}}
const fx=[];
function takeHit(m){if(!player||!player.alive||st.hp<=0)return;st.hp-=(+m.d>0&&+m.d<=200?+m.d:0);if(typeof shake!=='undefined')try{shake=Math.max(shake,0.4)}catch(e){}
 if(window.__modGod&&st.isOwner){st.hp=100;emit();return;}if(st.hp<=0){st.deaths++;const p=player.mesh.position;out({t:'k',killer:m.from,victim:st.me,w:m.w,p:[p.x,p.y,p.z]});handle({t:'k',killer:m.from,victim:st.me,w:m.w,p:[p.x,p.y,p.z]});
  if(typeof explosion==='function')explosion(p.clone(),1.6);const rs=()=>{if(window.__gm&&!__gm.canRespawn()){setTimeout(rs,1000);return;}st.hp=100;try{if(st.state==='on'&&player)spawn(player.kind);}catch(e){}};setTimeout(rs,3000);}emit();}
const DMG={SAMSTREAK:60,CRAM:6,GUN:4,CIWS:3,'25MM':5,'40MM':12,'105MM':45,ROCKETS:20,AAM:60,SAM:60,HYPERSONIC:100,TORPEDO:100,GMLRS:80,PRSM:100};
function hookFire(){if(typeof fireWeapon!=='function'||fireWeapon.__mp)return;const _f=fireWeapon;
 fireWeapon=function(v){const n0=projs.length,r=_f.apply(this,arguments);
  if(st.state==='on'&&v===player)for(let i=n0;i<projs.length;i++){const o=projs[i];o.__mpw=v.weapons[v.wi];o.__mpP=o.pos.clone();tracked.add(o);
   if(i===n0)out({t:'f',w:o.__mpw,p:[o.pos.x,o.pos.y,o.pos.z],v:[o.vel.x,o.vel.y,o.vel.z]});
   if(o.vel&&o.vel.lengthSq()>1){const dir=o.vel.clone().normalize();const far=o.pos.clone().addScaledVector(dir,o.type==='bullet'?250:600);
    for(const rm of st.remotes.values()){if(!rm.alive)continue;const rd=(DEFS[rm.kind]||{}).cls;const rad=rd==='ship'||rd==='sub'?90:36;
     const to=rm.mesh.position.clone().sub(player.mesh.position);const dist=to.length();const aimed=o.type==='bullet'&&dist>1&&dist<120&&dir.angleTo(to)<1.0;
     if(aimed||segDist(player.mesh.position,far,rm.mesh.position)<rad){const w=o.__mpw;if(window.__gm&&!__gm.allowHit(st.me,rm.id))break;const h={t:'h',to:rm.id,w,from:st.me};if(st.host)h.d=dmgFor(st.me,rm.id,w);out(h);o.life=0;tracked.delete(o);break;}}}}
  return r;};fireWeapon.__mp=1;}
function segDist(a,b,p){const abx=b.x-a.x,aby=b.y-a.y,abz=b.z-a.z,L2=abx*abx+aby*aby+abz*abz;let t=0;if(L2>1e-4)t=Math.max(0,Math.min(1,((p.x-a.x)*abx+(p.y-a.y)*aby+(p.z-a.z)*abz)/L2));const x=a.x+abx*t-p.x,y=a.y+aby*t-p.y,z=a.z+abz*t-p.z;return Math.sqrt(x*x+y*y+z*z);}
function checkHits(){for(const o of tracked){if(!projs.includes(o)||o.life<=0){tracked.delete(o);continue;}
 const a=o.__mpP||o.pos;
 for(const r of st.remotes.values()){if(!r.alive)continue;const d=DEFS[r.kind]||{},rad=(d.cls==='ship'||d.cls==='sub')?70:22;
  if(segDist(a,o.pos,r.mesh.position)<rad){const w=o.__mpw;if(window.__gm&&!__gm.allowHit(st.me,r.id))break;{const h={t:'h',to:r.id,w,from:st.me};if(st.host)h.d=dmgFor(st.me,r.id,w);out(h);}tracked.delete(o);o.life=0;if(typeof hitTick==='function')hitTick(false);break;}}
 o.__mpP=o.pos.clone();}}
function hookSpawn(){if(typeof spawn!=='function'||spawn.__mp)return;const _s=spawn;spawn=function(k,...a){if(st.state==='on'&&!st.isOwner&&ownerOnly(k))k='fighter';const r=_s.call(this,k,...a);
  if(st.state==='on'&&!st.isOwner&&player&&player.weapons){player.weapons=player.weapons.filter(w=>!OWNER_W.has(w));if(!player.weapons.length)player.weapons=['GUN'];player.wi=0;if(player.ammo.GUN==null)player.ammo.GUN=AMMO.GUN||500;}return r;};spawn.__mp=1;}
{const cs=document.createElement('style');cs.textContent=`@keyframes mpShim{0%{background-position:150% 0}100%{background-position:-50% 0}}
#kfeed div.mpDia{color:#f3cf6a!important;border-right:3px solid #d4af37!important;background:linear-gradient(100deg,rgba(26,18,4,.8) 30%,rgba(235,248,255,.38) 45%,rgba(26,18,4,.8) 60%)!important;background-size:250% 100%!important;animation:mpShim 2.4s linear infinite,kf 4s forwards!important;text-shadow:0 0 5px rgba(255,215,120,.55),0 0 2px rgba(235,248,255,.9)}
#kfeed div.mpDia .dia{color:#eaf8ff;-webkit-text-stroke:1px #d4af37;text-shadow:0 0 6px #fff}
#kfeed div.mpSil{color:#d6dae0!important;border-right:3px solid #aab2bc!important}`;document.head.appendChild(cs);}
let shimT=0;
// ---- loop ----
let lastSend=0;const _q=new THREE.Quaternion();
function loop(){requestAnimationFrame(loop);const now=performance.now()/1000;hookSpawn();if(st.state!=='on')return;hookFire();
 const hold=window.__mpHold||(player&&player._hold);if(hold&&player&&player.mesh){player._hold=hold;player.mesh.position.copy(hold);if(player.vel)player.vel.set(0,0,0);player.onGround=false;player.alive=true;}
 if(player&&player.mesh&&now-lastSend>1/SEND_HZ){lastSend=now;const p=player.mesh.position,qq=player.mesh.quaternion;out({t:'s',k:player.kind,n:st.name,p:[+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)],q:[qq.x,qq.y,qq.z,qq.w].map(x=>+x.toFixed(4)),a:!!player.alive&&st.hp>0,x:window.__mpExtraOut?__mpExtraOut(player):undefined});}
 for(const r of st.remotes.values()){const b=r.buf;if(!b.length)continue;const B=b[b.length-1];if(B.p)r.mesh.position.set(+B.p[0],+B.p[1],+B.p[2]);if(B.q&&B.q.length===4)r.mesh.quaternion.set(+B.q[0],+B.q[1],+B.q[2],+B.q[3]);
  if(now-(r.lastT||now)>20)dropRemote(r.id,'timed out');}
 checkHits();if(now-shimT>0.1){shimT=now;const o=st.remotes.get(st.owner);if(o)setTag(o,(now*0.4)%1.4);}const dt=1/60;for(let i=fx.length-1;i>=0;i--)if(!fx[i](dt))fx.splice(i,1);}
requestAnimationFrame(loop);
setInterval(()=>{if(st.state!=='on'||!player||!player.mesh)return;const h=window.__mpHold;if(h){player.mesh.position.copy(h);if(player.vel)player.vel.set(0,0,0);}const p=player.mesh.position,qq=player.mesh.quaternion;out({t:'s',k:player.kind,n:st.name,p:[+p.x.toFixed(1),+p.y.toFixed(1),+p.z.toFixed(1)],q:[qq.x,qq.y,qq.z,qq.w].map(x=>+x.toFixed(3)),a:!!player.alive&&st.hp>0});},200);
// ---- connection lifecycle ----
function wire(c){c.on('data',m=>onMsg(c,m));c.on('close',()=>{st.conns.delete(c.peer);if(st.host){dropRemote(c.peer,'left');sendAll({t:'bye',from:c.peer});}else{st.err='Host left';leave();}emit();});c.on('error',()=>{});}
async function host(){await leave();st.err=null;st.state='connecting';emit();await loadLib();const code=code4();
 return new Promise((res,rej)=>{const p=new Peer(PFX+code,srvOpt);st.peer=p;
  p.on('open',async id=>{st.me=id;st.code=code;st.host=true;await ownerKey(true).catch(()=>null);ownerDev=!!(await ownerKey(false).catch(()=>null));const pin=ownerPubPin();const ok=pin?!!(await ownerKey(false).catch(()=>null)):true;st.owner=ok?id:null;st.isOwner=ok;st.state='on';emit();res(code);});
  p.on('connection',c=>{if(st.conns.size>=MP_MAX-1){c.on('open',()=>{c.send({t:'full'});setTimeout(()=>c.close(),300);});return;}c.on('open',()=>{st.conns.set(c.peer,c);const n=crypto.randomUUID();st.nonces.set(c.peer,n);c.send({t:'hello',nonce:n,from:st.me});if(st.owner)c.send({t:'own',id:st.owner,from:st.me});emit();});wire(c);});
  p.on('disconnected',()=>{try{p.reconnect()}catch(e){}});
  p.on('error',e=>{st.err=e.type==='unavailable-id'?'Code taken, retry':(e.type||'error');if(st.state==='connecting'){st.state='off';emit();rej(e);}});});}
async function join(code){code=String(code||'').trim().toUpperCase();if(!code)throw new Error('code');await leave();st.err=null;st.state='connecting';emit();await loadLib();
 return new Promise((res,rej)=>{const p=new Peer(undefined,srvOpt);st.peer=p;
  p.on('open',id=>{st.me=id;const c=p.connect(PFX+code,{reliable:true});wire(c);const to=setTimeout(()=>{if(st.state!=='on'){st.err='Room not found';leave();rej(new Error('timeout'));}},12000);
   c.on('open',()=>{clearTimeout(to);st.conns.set(c.peer,c);c.send({t:'id',dev:DEV});st.code=code;st.host=false;st.state='on';emit();res(code);});});
  p.on('error',e=>{st.err=e.type==='peer-unavailable'?'Room not found':(e.type||'error');st.state='off';emit();rej(e);});});}
async function leave(){if(st.peer){try{out({t:'bye'})}catch(e){}const p=st.peer;st.peer=null;setTimeout(()=>{try{p.destroy()}catch(e){}},150);}
 for(const id of [...st.remotes.keys()])dropRemote(id);st.conns.clear();st.owner=null;st.isOwner=false;st.state='off';st.code=null;st.host=false;st.hp=100;emit();}
addEventListener('pagehide',()=>{try{out({t:'bye'})}catch(e){}});
{const pin=()=>{const h=window.__mpHold;if(!h||!player||!player.mesh)return;player._hold=h;player.mesh.position.copy(h);if(player.vel)player.vel.set(0,0,0);player.onGround=false;};
 const _gh=window.gameHook;window.gameHook=function(dt){pin();if(_gh)_gh(dt);pin();};}
// ---- menu panel (rendered INSIDE an existing menu view by ui builder; menu rows, not HUD buttons) ----
function panel(el){el.innerHTML='';const css='font:600 18px var(--mw-f,system-ui);letter-spacing:.06em;text-transform:uppercase;color:#f2f2ea;padding:9px 16px;min-height:46px;border-left:3px solid transparent;cursor:pointer';
 const row=(t,f)=>{const d=document.createElement('div');d.className='dmLink mpRow';d.style.cssText=css;d.textContent=t;if(f)d.onclick=f;el.appendChild(d);return d;};
 const draw=()=>{el.innerHTML='';
  if(st.state==='on'){row((st.host?'Room ':'Joined ')+st.code+'  ·  '+(st.remotes.size+1)+'/'+MP_MAX);if(window.__gm)__gm.panel(el);row('Leave',()=>leave());}
  else if(st.state==='connecting')row('Connecting…');
  else{row('Host game',()=>host().catch(()=>{}));const j=row('Join with code',()=>{const c=prompt('Room code');if(c)join(c).catch(()=>{});});if(st.err)row(st.err).style.color='#d9433a';}};
 st.cbs=st.cbs.filter(f=>f.__el!==el);const cb=()=>draw();cb.__el=el;st.cbs.push(cb);draw();}
let ownerDev=null;ownerKey(false).then(o=>{ownerDev=!!o;emit();}).catch(()=>{ownerDev=false;});
window.__mp={hit(to,w){if(st.state!=='on'||!st.remotes.has(to))return false;if(window.__gm&&!__gm.allowHit(st.me,to))return false;const h={t:'h',to,w,from:st.me};if(st.host)h.d=dmgFor(st.me,to,w);out(h);return true;},hideAirDefense:()=>st.state==='on',_handleSelf:m=>handle(Object.assign({from:st.me},m)),send:m=>out(m),on:(t,f)=>{(ons[t]=ons[t]||[]).push(f);},get isOwnerDevice(){return !!ownerDev},get dev(){return DEV},bans,frozen,conns:()=>st.conns,
 setAdmin(id,on){if(!st.isOwner)return;const m={t:'adm',id,on:!!on};out(m);handle(Object.assign({from:st.me},m));},get admins(){return [...st.admins]},hostKick(id,ban){const c=st.conns.get(id);if(!c)return;if(ban&&c.__dev){const b=bans();b.push(c.__dev);localStorage.setItem('mp_bans',JSON.stringify(b));}try{c.send({t:'kick',ban:ban?1:0,from:st.me})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},300);},
 get ownerActive(){return st.state==='on'?st.isOwner:!!ownerDev},allowed:k=>st.state!=='on'||st.isOwner||!ownerOnly(k),ownerOnly,get isOwner(){return st.isOwner},get ownerId(){return st.owner},async ownerPub(){const o=await ownerKey(true);return o&&o.pub;},host,join,leave,panel,get state(){return st.state},get code(){return st.code},get isHost(){return st.host},get id(){return st.me},get players(){return [...st.remotes.values()].map(r=>({id:r.id,name:r.name,kind:r.kind}))},get hp(){return st.hp},get kills(){return st.kills},get deaths(){return st.deaths},get err(){return st.err},setName(n){st.name=(ownerDev||st.isOwner)?(String(n||'').trim().slice(0,12)||'Player'):cleanName(n);localStorage.setItem('mp_name',st.name);},onChange(f){st.cbs.push(f);},_st:st};
}
// test hooks (only with ?mptest)
if(location.search.includes('mptest')){window.__mpSpawn=k=>{mission=null;spawn(k,'airbase');setPaused(false);};
 window.__mpRaw=(k)=>{mission=null;const f=spawn.__mp?null:0;spawn(k,'airbase');setPaused(false);return player.kind;};window.__mpPos=(x,y,z)=>{player.mesh.position.set(x,y,z);player.vel.set(0,0,0);player.onGround=false;player.alive=true;const h=new THREE.Vector3(x,y,z);player._hold=h;window.__mpHold=h;try{const qq=player.mesh.quaternion;__mp.send({t:'s',k:player.kind,p:[x,y,z],q:[qq.x,qq.y,qq.z,qq.w],a:true});}catch(e){}};
 window.__mpWeap=()=>player.weapons.join(',');window.__mpPP=()=>player.mesh.position.toArray().map(Math.round);window.__mpFire1=()=>{try{player.wi=0;player.ammo.GUN=999;player.cool=0;fireWeapon(player);return 'ok';}catch(e){return e.message+' | '+e.stack}};window.__mpShootAt=()=>{try{const r=__mp._st.remotes.values().next().value;if(!r)return 'no-remote';player.mesh.lookAt(r.mesh.position);const w=player.weapons.includes('HYPERSONIC')?'HYPERSONIC':'GUN';player.wi=player.weapons.indexOf(w);player.ammo[w]=999;player.cool=0;fireWeapon(player);return w;}catch(e){return e.message+' | '+(e.stack||'').slice(0,800)}};}
