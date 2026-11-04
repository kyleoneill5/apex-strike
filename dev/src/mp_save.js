// ===== mp_save.js — versioned local save for ALL players + backup code export/import + checksum + owner max profile.
{
const KEY='dm_save',VER=2,SALT='dmn-7f3a';
const sum=s=>{let h=0x811c9dc5;s=SALT+s;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h.toString(36);};
const J=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const OWNER_TITLE='CEO · OWNER',OWNER_EMBLEM='owner_ceo';
const blank=()=>({v:VER,tag:'',prog:{xp:0,lvl:1,p:0,tot:0},stats:{kills:0,deaths:0,wins:0,matches:0,mpKills:0},unlocks:[],loadouts:{},title:'',emblem:'',settings:{},owner:null,t:0});
function migrate(o){if(!o||typeof o!=='object')return blank();
 if(!o.v||o.v<2){const b=blank();b.prog=Object.assign(b.prog,J('dmProg',{}));b.settings=J('milsim_settings',{});b.tag=localStorage.getItem('mp_name')||'';b.stats.best=+(localStorage.getItem('apex_best')||0);return b;}
 const b=Object.assign(blank(),o);b.stats=Object.assign(blank().stats,o.stats);return b;}
const SV={tampered:false};
function read(){const raw=J(KEY,null);if(raw&&raw.d){if(sum(JSON.stringify(raw.d))!==raw.s){console.warn('dm_save checksum mismatch: tampered save ignored');SV.tampered=true;return migrate(null);}return migrate(raw.d);}return migrate(null);}
let D=read();
const isOwnerDev=()=>!!localStorage.getItem('mp_owner_key')&&(!window.__mp||__mp.isOwnerDevice!==false||!(window.MP_OWNER_PUB||localStorage.getItem('MP_OWNER_PUB')));
function ownerAssert(){// owner: always max (10th prestige, rank 70), everything unlocked, exclusive title/emblem. Non-owner: exclusive items stripped.
 const p=window.__prog;
 if(isOwnerDev()){D.prog={xp:0,lvl:70,p:10,tot:Math.max(D.prog.tot||0,1e7),owner:true,title:'GOLD DIAMOND · CEO',emblem:'owner',tier:'diamond',unlocks:{all:true}};D.unlocks=['*'];D.title=OWNER_TITLE;D.emblem=OWNER_EMBLEM;D.isOwner=true;
  if(p&&p.d)Object.assign(p.d,D.prog);localStorage.setItem('dmProg',JSON.stringify(D.prog));}
 else{if(p&&p.d&&p.d.owner){Object.assign(p.d,{owner:false,title:'',emblem:'',tier:'',unlocks:{}});if(p.d.p>=10&&p.d.lvl>=70&&!(D.prog.tot>0)){p.d.p=0;p.d.lvl=1;}}D.prog.owner=false;if(D.title===OWNER_TITLE)D.title='';if(D.emblem===OWNER_EMBLEM)D.emblem='';D.unlocks=D.unlocks.filter(u=>u!=='*');D.isOwner=false;}}
function gather(){const p=window.__prog;D.prog=Object.assign({},p&&p.d?p.d:J('dmProg',D.prog));D.settings=J('milsim_settings',D.settings);D.tag=localStorage.getItem('mp_name')||D.tag;
 const ok=localStorage.getItem('mp_owner_key');if(ok)D.owner=ok;ownerAssert();}
function write(){gather();D.t=Date.now();try{localStorage.setItem(KEY,JSON.stringify({d:D,s:sum(JSON.stringify(D))}));}catch(e){}}
function apply(){localStorage.setItem('dmProg',JSON.stringify(D.prog));const p=window.__prog;if(p&&p.d)Object.assign(p.d,D.prog);
 if(D.settings)localStorage.setItem('milsim_settings',JSON.stringify(D.settings));if(D.tag)localStorage.setItem('mp_name',D.tag);if(D.owner&&!localStorage.getItem('mp_owner_key'))localStorage.setItem('mp_owner_key',D.owner);}
if(!localStorage.getItem('dmProg')||(D.owner&&!localStorage.getItem('mp_owner_key')))apply();
ownerAssert();write();
function exportCode(){write();const j=JSON.stringify(D);return 'DMN2.'+btoa(unescape(encodeURIComponent(j)))+'.'+sum(j);}
function importCode(c){c=String(c||'').replace(/\s+/g,'');const m=c.match(/^DMN2\.([A-Za-z0-9+/=]+)\.([a-z0-9]+)$/);if(!m)return {ok:false,err:'Bad code'};
 let j;try{j=decodeURIComponent(escape(atob(m[1])))}catch(e){return {ok:false,err:'Bad code'}}if(sum(j)!==m[2])return {ok:false,err:'Code damaged'};
 D=migrate(JSON.parse(j));apply();ownerAssert();localStorage.setItem(KEY,JSON.stringify({d:D,s:sum(JSON.stringify(D))}));return {ok:true};}
let lastScore=-1,dirty=false,wasOwner=isOwnerDev();const mark=()=>{dirty=true;};
setInterval(()=>{try{if(typeof score!=='undefined'&&score!==lastScore){lastScore=score;dirty=true;}}catch(e){}const o=isOwnerDev();if(o!==wasOwner){wasOwner=o;dirty=true;}if(dirty){dirty=false;write();}},1000);
setInterval(write,10000);addEventListener('pagehide',write);document.addEventListener('visibilitychange',()=>{if(document.hidden)write();});
if(window.__prog&&__prog.on)__prog.on(()=>mark());
if(window.__mp){__mp.on('k',m=>{if(m.killer===__mp.id){D.stats.kills++;D.stats.mpKills++;}if(m.victim===__mp.id)D.stats.deaths++;mark();});}
Object.assign(SV,{get data(){return D},write,exportCode,importCode,mark,ownerAssert,
 has:id=>D.unlocks.includes('*')||D.unlocks.includes(id),
 matchEnd(won){D.stats.matches++;if(won)D.stats.wins++;write();},kill(){D.stats.kills++;mark();},death(){D.stats.deaths++;mark();},
 unlock(id){if(id==='*'||id===OWNER_TITLE||id===OWNER_EMBLEM)return;if(!D.unlocks.includes(id))D.unlocks.push(id);write();},setLoadout(k,w){D.loadouts[k]=w;write();},
 setTitle(t){if(t===OWNER_TITLE&&!isOwnerDev())return;D.title=t;write();},setEmblem(e){if(e===OWNER_EMBLEM&&!isOwnerDev())return;D.emblem=e;write();},
 panel(el){el.innerHTML='';const row=(t,f)=>{const d=document.createElement('div');d.className='dmLink mpRow';d.textContent=t;if(f)d.onclick=f;el.appendChild(d);return d;};
  row('Copy backup code',async()=>{const c=exportCode();try{await navigator.clipboard.writeText(c);row('Copied');}catch(e){prompt('Backup code',c);}});
  row('Restore from code',()=>{const c=prompt('Paste backup code');if(!c)return;const r=importCode(c);row(r.ok?'Restored':r.err);if(r.ok)setTimeout(()=>location.reload(),600);});}});
window.__save=SV;
}
