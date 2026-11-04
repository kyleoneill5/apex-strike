// ===== c1_glue.js — C1 (Nov 3): wires MP/save/mod into the MW2 menu (no new HUD buttons; menu rows only), gamer tags, MP air-defense tab hide.
{
const $=id=>document.getElementById(id);
// Weapons fire along local -Z. Stock lookAt was leaving that axis pointed 180° away
// from the point (guns flew backwards and missed a peer 40 m ahead).
{const _look=THREE.Object3D.prototype.lookAt;
 THREE.Object3D.prototype.lookAt=function(x,y,z){if(this.isCamera)return _look.apply(this,arguments);
  const tgt=x&&x.isVector3?x:new THREE.Vector3(+x,+y,+z);
  const dir=tgt.clone().sub(this.getWorldPosition(new THREE.Vector3()));
  if(dir.lengthSq()<1e-8)return this;dir.normalize();
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,-1),dir);
  if(this.parent){const pq=new THREE.Quaternion();this.parent.getWorldQuaternion(pq);q.premultiply(pq.invert());}
  this.quaternion.copy(q);return this;};}
if(window.__mp&&!('active' in __mp))Object.defineProperty(__mp,'active',{get:()=>__mp.state==='on'});
const reapply=()=>{try{window.__uiCards&&__uiCards.apply();}catch(e){}};
if(window.__mp&&__mp.onChange)__mp.onChange(reapply);
const css=document.createElement('style');css.textContent=`#c1MP{position:fixed;inset:0;z-index:9000;background:linear-gradient(90deg,rgba(6,9,6,.94),rgba(6,9,6,.78) 55%,rgba(6,9,6,.35));display:flex;flex-direction:column;padding:calc(var(--sat,0px) + 18px) 18px 18px calc(var(--sal,0px) + 26px);overflow:auto;font-family:var(--mw-f,system-ui);color:#f2f2ea}
#c1MP h2{margin:0 0 4px;font:700 30px var(--mw-f,system-ui);letter-spacing:.08em;text-transform:uppercase}
#c1MP .sub{font:500 13px var(--mw-f,system-ui);letter-spacing:.14em;color:rgba(242,242,234,.55);text-transform:uppercase;margin-bottom:12px}
#c1MP .col{max-width:420px;display:flex;flex-direction:column;gap:2px}
#c1MP .dmLink,#c1MP .mpRow{font:600 19px var(--mw-f,system-ui)!important;letter-spacing:.06em;text-transform:uppercase;color:#f2f2ea!important;padding:9px 16px!important;min-height:44px;box-sizing:border-box;border-left:3px solid transparent;cursor:pointer;text-align:left;background:none}
#c1MP .dmLink:active,#c1MP .mpRow:active{background:linear-gradient(90deg,rgba(155,209,74,.92),rgba(155,209,74,0))!important;color:#0b0e08!important;border-left-color:#fff}
#c1MP .sec{font:600 12px var(--mw-f,system-ui);letter-spacing:.2em;color:#9bd14a;margin:12px 0 2px 16px;text-transform:uppercase}
#c1MP .tagv{color:#9bd14a}#c1MP .own{background:linear-gradient(90deg,#fff6c8,#e7b955 40%,#bfe8ff);-webkit-background-clip:text;background-clip:text;color:transparent}`;
document.head.appendChild(css);
function open(){if($('c1MP'))return;const o=document.createElement('div');o.id='c1MP';
 const own=!!(window.__mp&&__mp.ownerActive);const name=localStorage.getItem('mp_name')||'Player';
 o.innerHTML=`<h2>Multiplayer</h2><div class="sub">Private match · up to 4 friends · room code</div><div class="col"><div class="sec">Gamer tag</div><div class="dmLink" id="c1Tag">${own?'<span class="own">OWNER</span> ':''}<span class="tagv"></span></div><div class="sec">Match</div><div id="c1Net"></div><div class="sec">Progress</div><div id="c1Save"></div><div class="dmLink" id="c1Back" style="margin-top:10px">◂ Back</div></div>`;
 o.querySelector('.tagv').textContent=name;
 document.body.appendChild(o);
 $('c1Tag').onclick=()=>{const n=prompt('Gamer tag (max 12)',localStorage.getItem('mp_name')||'');if(n==null)return;__mp.setName(n);const v=localStorage.getItem('mp_name');o.querySelector('.tagv').textContent=v;try{if(window.__save){__save.data.tag=v;__save.write();}}catch(e){}if(v.toLowerCase()!==String(n).trim().slice(0,12).toLowerCase())alert('That tag is reserved. Saved as '+v);};
 try{__mp.panel($('c1Net'));}catch(e){console.warn(e)}
 try{window.__save&&__save.panel($('c1Save'));}catch(e){console.warn(e)}
 $('c1Back').onclick=()=>o.remove();}
window.__c1={open};
addEventListener('pointerdown',()=>{window.__tapOK=1;},{once:true,capture:true});
// Live bindings for tests and other pages. Module scope is not on window.
try{window.THREE=window.THREE||THREE;}catch(e){}
try{window.DEFS=DEFS;}catch(e){}
try{Object.defineProperty(window,'spawn',{configurable:true,get(){return spawn;}});}catch(e){}
try{Object.defineProperty(window,'player',{configurable:true,get(){return player;}});}catch(e){}
try{Object.defineProperty(window,'projs',{configurable:true,get(){return projs;}});}catch(e){}
try{Object.defineProperty(window,'targets',{configurable:true,get(){return targets;}});}catch(e){}
try{Object.defineProperty(window,'camera',{configurable:true,get(){return camera;}});}catch(e){}
try{Object.defineProperty(window,'scene',{configurable:true,get(){return scene;}});}catch(e){}
try{Object.defineProperty(window,'camFollow',{configurable:true,get(){return camFollow;},set(v){camFollow=v;}});}catch(e){}
try{Object.defineProperty(window,'fireWeapon',{configurable:true,get(){return fireWeapon;}});}catch(e){}
try{window.setPaused=setPaused;}catch(e){}
try{const _uc=updCamera;updCamera=function(dt){_uc(dt);const S=window.__shotCam;if(S&&S.p&&S.at){camera.up.set(0,1,0);camera.position.set(S.p[0],S.p[1],S.p[2]);camera.lookAt(S.at[0],S.at[1],S.at[2]);return;}
 // Third-person follow: sit aft-quarter of the tail so the nozzle stays in frame beside the plume.
 const o=camFollow;if(o&&o.pos&&!o.done&&!o.rv&&(o.type==='ballistic'||o.type==='sm3')){const d=(o.vel&&o.vel.lengthSq()>4)?o.vel.clone().normalize():((o.dir&&o.dir.lengthSq()>0.2)?o.dir.clone().normalize():new THREE.Vector3(0,1,0));
  const side=new THREE.Vector3(-d.z,0,d.x);if(side.lengthSq()<1e-4)side.set(1,0,0);side.normalize();const alt=Math.max(0,o.pos.y);
  const len=o.type==='sm3'?7:(o.gs&&o.gs.stg?11:16);const dist=Math.max(10,len*0.85)+Math.min(14,alt/2500);
  const coasting=(o.gs&&o.gs.coast>0)||(o.type==='sm3'&&o.coast>0);
  camera.up.set(0,1,0);camera.fov=48;camera.updateProjectionMatrix();
  camera.position.copy(o.pos).addScaledVector(d,-dist*0.42).addScaledVector(side,dist*0.95).add(new THREE.Vector3(0,dist*0.02,0));
  camera.lookAt(o.pos.clone().addScaledVector(d,coasting?-2.4:len*0.16));}
 else if(player&&player.def&&player.def.cls==='rocket'&&player.os&&player.os.launched&&player.os.engine&&typeof padRocket!=='undefined'&&padRocket){const h=Math.max(0,player.os.h);const up=new THREE.Vector3(0,1,0).applyQuaternion(padRocket.quaternion);const base=padRocket.position.clone();
  const dist=36+Math.min(40,h/500);const side=new THREE.Vector3(-0.9,0.06,0.35).normalize();camera.up.set(0,1,0);camera.position.copy(base).addScaledVector(side,dist).addScaledVector(up,2);camera.lookAt(base.clone().addScaledVector(up,8));}
};}catch(e){}
function reg(){if(!window.__mwMenu)return false;__mwMenu.add('mwMP','Multiplayer',open);if(window.__mod)__mwMenu.add('mwMod','Mod menu',()=>__mod.open(),{ownerOnly:true});return true;}
if(!reg()){let n=0;const t=setInterval(()=>{if(reg()||++n>40)clearInterval(t);},250);}
}
