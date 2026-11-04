// ===== weak enemy air defence: slow low-g SAMs, flares, 3-hit damage, long reload, early warning, light AAA =====
const EAD={hp:100,flareT:0,flares:30,reload:0,aaaT:0,warn:0};window.__ead=EAD;
spawnSAM=function(from){if(!player||!player.mesh)return;const p=player.mesh.position;const a=Math.random()*6.28;const o=from?from.clone():V3(p.x+Math.cos(a)*6000,0,p.z+Math.sin(a)*6000);
 msg('⚠ RWR: SAM LAUNCH - TAP FLARES',2.5);EAD.warn=2.5;sfx('missile',0.5);
 setTimeout(()=>{if(!player)return;const mesh=missileMesh(5,0.3,0xaa2222);mesh.position.copy(o);scene.add(mesh);eMissiles.push({pos:o.clone(),vel:V3(0,200,0),mesh,life:14});},1500);};
updSAMs=function(dt){for(let i=eMissiles.length-1;i>=0;i--){const e=eMissiles[i];e.life-=dt;const pp=e.decoy||player.mesh.position;const dir=e.vel.clone().normalize();const want=pp.clone().sub(e.pos).normalize();
 const ang=dir.angleTo(want);if(ang>1e-4)dir.lerp(want,Math.min(1,0.55*dt/ang)).normalize();const sp=Math.min(620,e.vel.length()+140*dt);e.vel.copy(dir).multiplyScalar(sp);e.pos.addScaledVector(e.vel,dt);
 e.mesh.position.copy(e.pos);e.mesh.lookAt(_t.copy(e.pos).sub(dir));smoke.spawn(_t.copy(e.pos).addScaledVector(dir,-3),rnd(1),rnd(1),rnd(1),2,2,3,0.9,0.9,0.9,0.5);
 if(!e.decoy&&EAD.flareT>0&&e.pos.distanceTo(player.mesh.position)<3000&&Math.random()<0.85){e.decoy=player.mesh.position.clone().add(V3(rnd(80),-60,rnd(80)));msg('MISSILE DECOYED BY FLARES',1.2);}
 let dead=e.life<=0||(e.decoy&&e.pos.distanceTo(e.decoy)<20);if(!e.decoy&&player.alive&&e.pos.distanceTo(player.mesh.position)<18){eadHit(34,'SAM HIT');dead=true;}
 if(dead){explosion(e.pos,1.2);scene.remove(e.mesh);eMissiles.splice(i,1);}}};
function eadHit(d,why){EAD.hp-=d;shake=Math.max(shake,0.6);msg(why+' - HULL '+Math.max(0,Math.round(EAD.hp))+'%',1.5);if(EAD.hp<=0){EAD.hp=100;crash('SHOT DOWN');}}
function eadFlares(){if(!player||EAD.flares<=0)return;EAD.flares--;EAD.flareT=2.5;const p=player.mesh.position;for(let k=0;k<10;k++)fire.spawn(p,rnd(60),-20+rnd(30),rnd(60),2.5,3,1,1,0.9,0.5,1);sfx('ui',0.6);}
addEventListener('keydown',e=>{if(e.code==='KeyV')eadFlares();});
{const b=document.createElement('div');b.className='tb';b.id='bFlr';b.textContent='FLR';b.style.cssText='right:calc(268px + env(safe-area-inset-right));bottom:calc(182px + env(safe-area-inset-bottom));width:62px;height:62px';$('touch').appendChild(b);
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('pr');eadFlares();});b.addEventListener('pointerup',()=>b.classList.remove('pr'));}
{const _gh=window.gameHook;window.gameHook=function(dt){_gh(dt);if(!player||!player.mesh)return;EAD.flareT=Math.max(0,EAD.flareT-dt);EAD.reload-=dt;
 const air=player.def.cls==='air'||player.def.cls==='heli';if(!air||mission||settings.enemies===false)return;const p=player.mesh.position;const dE=Math.hypot(p.x-ENEMY.x,p.z-ENEMY.z);
 if(dE<7000&&p.y<9000&&EAD.reload<=0&&eMissiles.length<1){EAD.reload=28;spawnSAM(ENEMY.clone().add(V3(rnd(600),5,rnd(600))));}
 if(dE<3000&&p.y<3000){EAD.aaaT-=dt;if(EAD.aaaT<=0){EAD.aaaT=0.12;const o=ENEMY.clone().add(V3(rnd(400),5,rnd(400)));const d=p.clone().sub(o);const L=d.length();d.normalize();
  for(let k=0;k<3;k++)fire.spawn(_t.copy(o).addScaledVector(d,L*(0.3+Math.random()*0.7)).add(V3(rnd(60),rnd(60),rnd(60))),d.x*400,d.y*400,d.z*400,0.4,1.2,0,1,0.8,0.3,1);
  if(Math.random()<0.015)eadHit(2,'AAA');}}};}
{const _bm=buildMenu;buildMenu=function(){_bm();const m=$('menu');const rows=m.querySelectorAll('.row');const row=rows[rows.length-1];if(!row)return;
 const add=(id,txt,f)=>{const b=document.createElement('div');b.className='btn';b.id=id;b.textContent=txt;b.onclick=()=>{f();buildMenu();};row.appendChild(b);};
 add('mAlt','Altitude hold: '+(settings.altHold!==false?'ON':'OFF'),()=>{settings.altHold=settings.altHold===false;saveSettings();});
 add('mEnemy','Enemy fire: '+(settings.enemies!==false?'ON':'OFF'),()=>{settings.enemies=settings.enemies===false;saveSettings();});
 add('mFpv','Auto FPV: '+(settings.fpvAuto?'ON':'OFF'),()=>{settings.fpvAuto=!settings.fpvAuto;saveSettings();});
 tapify(m);};}
