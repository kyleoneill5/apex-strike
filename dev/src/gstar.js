// ===== Detailed Starship / Super Heavy, Mechazilla, Starbase (Pad 1 + Pad 2), LC-39A Starship pad =====
const RAPTOR_MAT=new THREE.MeshStandardMaterial({color:0x6a5a4e,metalness:0.9,roughness:0.42,envMapIntensity:1.2,side:THREE.DoubleSide});
const RAPTOR_IN=new THREE.MeshStandardMaterial({color:0x1a1410,metalness:0.6,roughness:0.6,side:THREE.BackSide});
const ENG_GLOW=new THREE.MeshBasicMaterial({color:0x9fc4ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
function bell(r,l,seg=18){const pts=[];for(let i=0;i<=10;i++){const t=i/10;pts.push(new THREE.Vector2(r*(0.32+0.68*Math.pow(t,0.6)),-l*t));}return new THREE.LatheGeometry(pts,seg);}
const _bellCache={};function raptor(g,x,y,z,r,l,vac){const key=r+'_'+l;const geo=_bellCache[key]||(_bellCache[key]=bell(r,l));const m=new THREE.Mesh(geo,RAPTOR_MAT);m.position.set(x,y,z);g.add(m);
 const ph=add(g,new THREE.CylinderGeometry(r*0.45,r*0.5,l*0.55,10),0x3c3f44,x,y+l*0.28,z);
 for(let k=0;k<4;k++){const ring=new THREE.Mesh(new THREE.TorusGeometry(r*(0.45+0.5*Math.pow((k+1)/5,0.6)),0.025*r,4,18).rotateX(Math.PI/2),RAPTOR_MAT);ring.position.set(x,y-l*(k+1)/5,z);g.add(ring);}
 const gl=new THREE.Mesh(new THREE.CircleGeometry(r*0.95,16).rotateX(Math.PI/2),ENG_GLOW.clone());gl.position.set(x,y-l+0.02,z);g.add(gl);return gl;}
function tileTex(){const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d');x.fillStyle='#141517';x.fillRect(0,0,256,256);
 for(let r=0;r<16;r++)for(let c=0;c<16;c++){const cx=c*16+(r%2)*8,cy=r*16;x.fillStyle=`rgb(${18+Math.random()*14|0},${19+Math.random()*14|0},${21+Math.random()*14|0})`;x.beginPath();for(let i=0;i<6;i++){const a=i/6*Math.PI*2+Math.PI/6;x.lineTo(cx+Math.cos(a)*8.6,cy+Math.sin(a)*8.6);}x.fill();x.strokeStyle='#050505';x.lineWidth=1;x.stroke();}
 if(Math.random()>2)0;const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(10,14);t.colorSpace=THREE.SRGBColorSpace;return t;}
const TILE=new THREE.MeshStandardMaterial({map:tileTex(),roughness:0.9,metalness:0.05});
function gridFin(){const g=new THREE.Group();const m=M(0x2c2e31,{metalness:0.7,roughness:0.5});add(g,new THREE.BoxGeometry(0.3,3.2,4.2),m,0.35,0,0).material=m;
 for(let i=-3;i<=3;i++){add(g,new THREE.BoxGeometry(0.9,3.2,0.06),m,0.9,0,i*0.6).rotation.x=0.6;add(g,new THREE.BoxGeometry(0.9,3.2,0.06),m,0.9,0,i*0.6).rotation.x=-0.6;}
 const fr=new THREE.Mesh(new THREE.BoxGeometry(1,3.4,4.4),new THREE.MeshStandardMaterial({color:0x2c2e31,metalness:0.7,roughness:0.5,wireframe:true}));fr.position.x=0.9;g.add(fr);return g;}
function flap(w,h,root){const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(0,h);s.lineTo(w,h-root);s.lineTo(w,0.3);s.closePath();return new THREE.ExtrudeGeometry(s,{depth:0.35,bevelEnabled:true,bevelThickness:0.1,bevelSize:0.1,bevelSegments:1}).translate(0,0,-0.17);}
starshipModel=function(){const g=new THREE.Group();const s1=new THREE.Group(),s2=new THREE.Group(),fair=new THREE.Group();const st=STEEL();
 // Super Heavy: 71 m, 9 m dia
 add(s1,new THREE.CylinderGeometry(4.5,4.5,69,48),st,0,36.5,0);
 for(let y=4;y<70;y+=1.8){const r=new THREE.Mesh(new THREE.TorusGeometry(4.505,0.04,4,48).rotateX(Math.PI/2),st);r.position.y=y;s1.add(r);}
 add(s1,new THREE.CylinderGeometry(4.5,4.6,2,48),0x2a2b2e,0,1,0); // aft skirt
 add(s1,new THREE.CylinderGeometry(3.6,4.4,1.2,32,1,true),M(0x26282b,DBL),0,-0.2,0);
 for(const a of [0.4,0.4+Math.PI])add(s1,new THREE.BoxGeometry(0.5,60,0.8),0x8e9298,Math.cos(a)*4.6,36,Math.sin(a)*4.6).rotation.y=-a; // chines/raceways
 const glows=[];for(let i=0;i<33;i++){const ring=i<3?0:i<13?1:2;const n=[3,10,20][ring],k=i<3?i:i<13?i-3:i-13;const r=[1.0,2.55,3.95][ring];const a=k/n*Math.PI*2+(ring===1?0.3:0);
  glows.push(raptor(s1,Math.cos(a)*r,-0.2,Math.sin(a)*r,ring===2?0.6:0.62,ring===2?1.6:2.0));}
 // hot-stage ring (vented)
 add(s1,new THREE.CylinderGeometry(4.52,4.52,2.6,48),0x2b2c2f,0,71.8,0);for(let i=0;i<24;i++){const a=i/24*Math.PI*2;add(s1,new THREE.BoxGeometry(0.5,1.6,0.9),0x0a0a0a,Math.cos(a)*4.53,71.8,Math.sin(a)*4.53).rotation.y=-a;}
 const fins=[];for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;const f=new THREE.Group();f.position.set(Math.cos(a)*4.5,66,Math.sin(a)*4.5);f.rotation.y=-a;f.add(gridFin());fins.push(f);s1.add(f);}
 s1.userData={fins,legs:[],glows};
 // Starship: 50 m
 add(s2,new THREE.CylinderGeometry(4.5,4.5,32,48),st,0,73+16,0);for(let y=75;y<105;y+=1.8){const r=new THREE.Mesh(new THREE.TorusGeometry(4.505,0.04,4,48).rotateX(Math.PI/2),st);r.position.y=y;s2.add(r);}
 const nose=new THREE.LatheGeometry(Array.from({length:20},(_,i)=>new THREE.Vector2(4.5*Math.pow(Math.cos(i/19*Math.PI/2),0.85),i/19*18)),48);add(s2,nose,st,0,105,0);
 const hs=new THREE.Mesh(new THREE.CylinderGeometry(4.56,4.56,32,32,1,true,-Math.PI/2,Math.PI),TILE);hs.position.set(0,89,0);s2.add(hs);
 const hsn=new THREE.Mesh(new THREE.LatheGeometry(Array.from({length:20},(_,i)=>new THREE.Vector2(4.56*Math.pow(Math.cos(i/19*Math.PI/2),0.85),i/19*17.5)),32,-Math.PI/2,Math.PI),TILE);hsn.position.y=105;s2.add(hsn);
 const fm=M(0x161719,DBL);for(const sx of [-1,1]){const af=new THREE.Mesh(flap(5.2,9.5,2.5),fm);af.position.set(0,75,sx*4.4);af.rotation.y=sx>0?-Math.PI/2:Math.PI/2;af.position.x=-0.3;s2.add(af);
  const ff=new THREE.Mesh(flap(3.4,6.5,2.2),fm);ff.position.set(-0.3,108,sx*3.6);ff.rotation.y=sx>0?-Math.PI/2:Math.PI/2;ff.rotation.z=0.12;s2.add(ff);}
 add(s2,new THREE.CylinderGeometry(4.5,4.3,1.0,48),0x2a2b2e,0,73.3,0);
 const sglow=[];for(let i=0;i<3;i++){const a=i/3*Math.PI*2;sglow.push(raptor(s2,Math.cos(a)*1.3,72.9,Math.sin(a)*1.3,0.62,2.0));}
 for(let i=0;i<3;i++){const a=i/3*Math.PI*2+Math.PI/3;sglow.push(raptor(s2,Math.cos(a)*3.05,72.9,Math.sin(a)*3.05,1.15,3.3));}
 s2.userData={shield:hs,glows:sglow};g.add(s1,s2,fair);g.userData={s1,s2,fair,s2base:73};return g;};
// ---- Mechazilla / OLIT (rebuilt) ----
const LAT_M=new THREE.MeshStandardMaterial({color:0x5c6064,metalness:0.85,roughness:0.45,envMapIntensity:1});
function latticeTower(h=146,w=9){const g=new THREE.Group();const n=Math.floor(h/6);const cnt=4+n*8+n*8;const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),LAT_M,cnt);let k=0;const o=new THREE.Object3D();
 const put=(x,y,z,sx,sy,sz,rx=0,rz=0)=>{o.position.set(x,y,z);o.rotation.set(rx,0,rz);o.scale.set(sx,sy,sz);o.updateMatrix();im.setMatrixAt(k++,o.matrix);};
 const hw=w/2;for(const dx of[-hw,hw])for(const dz of[-hw,hw])put(dx,h/2,dz,1.0,h,1.0);
 const dl=Math.hypot(w,6),da=Math.atan2(w,6);
 for(let i=0;i<n;i++){const y=i*6+6,ym=y-3;put(0,y,hw,w,0.45,0.45);put(0,y,-hw,w,0.45,0.45);put(hw,y,0,0.45,0.45,w);put(-hw,y,0,0.45,0.45,w);
  const s=i%2?1:-1;put(0,ym,hw,0.3,dl,0.3,0,s*da);put(0,ym,-hw,0.3,dl,0.3,0,-s*da);put(hw,ym,0,0.3,dl,0.3,s*da,0);put(-hw,ym,0,0.3,dl,0.3,-s*da,0);
  put(0,ym,hw,0.25,dl,0.25,0,-s*da);put(0,ym,-hw,0.25,dl,0.25,0,s*da);put(hw,ym,0,0.25,dl,0.25,-s*da,0);put(-hw,ym,0,0.25,dl,0.25,s*da,0);}
 im.count=k;im.castShadow=true;g.add(im);add(g,new THREE.BoxGeometry(w+2,4,w+2),0x6a6e72,0,h+2,0);add(g,new THREE.CylinderGeometry(0.3,0.3,10,6),0x888888,0,h+9,0);return g;}
function olm(){const g=new THREE.Group();const c=M(0x7d8186,{metalness:0.6,roughness:0.5});
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2;add(g,new THREE.BoxGeometry(2.2,20,2.2),c,Math.cos(a)*9,10,Math.sin(a)*9);}
 const ring=new THREE.Mesh(new THREE.TorusGeometry(9,1.3,8,48).rotateX(Math.PI/2),c);ring.position.y=20.5;g.add(ring);add(g,new THREE.CylinderGeometry(10.5,10.5,2,48,1,true),M(0x6d7176,DBL),0,20,0);
 for(let i=0;i<20;i++){const a=i/20*Math.PI*2;add(g,new THREE.BoxGeometry(0.8,1.4,0.8),0x3a3c3f,Math.cos(a)*7.2,21.6,Math.sin(a)*7.2);} // hold-down clamps
 const plate=add(g,new THREE.CylinderGeometry(7,7,0.6,40),0x8a8f94,0,0.6,0);// steel deluge plate
 add(g,new THREE.BoxGeometry(34,0.6,34),0xa7a59f,0,0.0,0);g.scale.y=0.45;return g;}
function chopsticks(h=98){const p=new THREE.Group();const c=M(0x44484c,{metalness:0.8,roughness:0.45});add(p,new THREE.BoxGeometry(11,8,11),c,0,0,0);return p;}
function qdArm(){const g=new THREE.Group();add(g,new THREE.BoxGeometry(18,2.2,2.6),0x55595d,9,0,0);add(g,new THREE.BoxGeometry(2,4,4),0x3e4246,18,0,0);return g;}
function tankFarm(){const g=new THREE.Group();const w=M(0xe6e6e2,{metalness:0.4,roughness:0.35}),st=STEEL();
 for(let i=0;i<8;i++)add(g,new THREE.CylinderGeometry(3.2,3.2,22,24),i%3?st:w,(i%4)*8,11,Math.floor(i/4)*9);
 for(let i=0;i<6;i++)add(g,new THREE.CylinderGeometry(2.4,2.4,24,20).rotateZ(Math.PI/2),w,-30,3,i*6);
 for(let i=0;i<2;i++)add(g,new THREE.SphereGeometry(9,24,16),w,-14+i*20,9,32);
 add(g,new THREE.BoxGeometry(70,0.4,60),0xb5b2a8,0,0.1,15);return g;}
function megaBay(h,w,l){const g=new THREE.Group();add(g,new THREE.BoxGeometry(w,h,l),M(0xd9dbdc,{metalness:0.5,roughness:0.35}),0,h/2,0);add(g,new THREE.BoxGeometry(w*0.6,h*0.85,0.5),0x3a3f45,0,h*0.42,l/2+0.3);return g;}
// rebuild mechazilla in place (keep arm groups for catch logic)
{const arms=mechazilla.userData.arms;mechazilla.clear();mechazilla.add(latticeTower(146,9));const car=chopsticks();car.position.set(4,98,0);mechazilla.add(car);mechazilla.userData.car=car;
 for(const a of arms){a.clear();const m=M(0x3e4246,{metalness:0.8,roughness:0.45});add(a,new THREE.BoxGeometry(28,2.6,1.4),m,14,0,0);add(a,new THREE.BoxGeometry(28,0.5,0.6),0x888c90,14,1.5,0);for(let i=0;i<3;i++)add(a,new THREE.BoxGeometry(1.2,1.2,1.0),0x222222,8+i*7,-1.6,-a.userData.sz*0.9);a.position.y=98;mechazilla.add(a);}
 const qd=qdArm();qd.position.set(4,104,0);mechazilla.add(qd);mechazilla.userData.qd=qd;
 const ol=olm();ol.position.set(20,-9.6,0);mechazilla.add(ol);mechazilla.userData.olm=ol;mechazilla.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});}
// Starbase site group: Pad 1 (live, at PAD) + Pad 2 (decor), tank farm, Mega Bays, beach, Highway 4
const STARBASE=new THREE.Group();scene.add(STARBASE);const PAD2_OFF=V3(-330,0,-210);
{const t2=latticeTower(146,9);t2.position.set(-20,0,0);const p2=new THREE.Group();p2.add(t2);const c2=chopsticks();c2.position.set(-16,98,0);p2.add(c2);
 for(const sz of[-1,1]){const a=new THREE.Group();add(a,new THREE.BoxGeometry(28,2.6,1.4),M(0x3e4246,{metalness:0.8,roughness:0.45}),14,0,0);a.position.set(-16,98,sz*3.5);a.rotation.y=sz*0.6;p2.add(a);}
 const o2=olm();p2.add(o2);add(p2,new THREE.BoxGeometry(14,10,60),0x5d5a55,0,-5,30); // Pad 2 flame trench
 for(let i=0;i<8;i++)add(p2,new THREE.CylinderGeometry(0.4,0.4,8,6).rotateX(Math.PI/2),0x99a0a6,Math.cos(i)*5,1.5,Math.sin(i)*5+10);
 p2.position.copy(PAD2_OFF);p2.userData.isPad2=true;STARBASE.add(p2);STARBASE.userData.p2=p2;
 const tf=tankFarm();tf.position.set(-140,0,-120);STARBASE.add(tf);
 const mb1=megaBay(81,40,60);mb1.position.set(-2600,0,-200);const mb2=megaBay(81,40,60);mb2.position.set(-2600,0,-280);const hb=megaBay(80,30,30);hb.position.set(-2550,0,-80);STARBASE.add(mb1,mb2,hb);
 const road=new THREE.Mesh(new THREE.PlaneGeometry(2800,10).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x2c2c2e,roughness:0.9}));road.position.set(-1300,0.4,-420);STARBASE.add(road);
 const beach=new THREE.Mesh(new THREE.PlaneGeometry(300,3000).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0xd8c79c,roughness:1}));beach.position.set(420,0.3,0);STARBASE.add(beach);
 const sand=new THREE.Mesh(new THREE.CircleGeometry(900,48).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0xcdbb92,roughness:1,}));sand.position.set(-150,0.12,-100);STARBASE.add(sand);
 const marsh=new THREE.Mesh(new THREE.CircleGeometry(1400,48).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x8c8a62,roughness:1}));marsh.position.set(-1200,0.08,700);STARBASE.add(marsh);
 STARBASE.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 STARBASE.position.set(PAD.x,6,PAD.z);STARBASE.visible=false;}
// LC-39A: Falcon 9 pad stays at PAD; Starship tower decor nearby (and live when Starship launches from LC-39A)
const LC39=new THREE.Group();{const t=latticeTower(146,9);t.position.set(-20,0,0);LC39.add(t);LC39.add(olm());LC39.position.set(PAD.x+260,6,PAD.z+180);scene.add(LC39);}
const PADS={sb1:'Starbase Pad 1 (OLP-A)',sb2:'Starbase Pad 2 (OLP-B)',lc39a:'LC-39A Florida'};
function applyPadSite(rk){const sp=settings.ssPad||'sb1';const ss=rk==='starship';STARBASE.visible=ss&&sp!=='lc39a';const p2=STARBASE.userData.p2;
 if(ss&&sp==='sb2'){STARBASE.position.set(PAD.x-PAD2_OFF.x,6,PAD.z-PAD2_OFF.z);p2.position.set(0,0,0);}else{STARBASE.position.set(PAD.x,6,PAD.z);p2.position.copy(PAD2_OFF);}
 LC39.visible=!(ss&&sp==='lc39a');pad.visible=!ss||sp==='lc39a';}
const _setupRM=setupRocketModels;setupRocketModels=function(rk){_setupRM(rk);applyPadSite(rk);if(rk==='starship'){mechazilla.userData.arms.forEach(a=>a.rotation.y=a.userData.sz*0.6);}};
// ---- engine start sequence, Mach diamonds, methalox plume, ground cloud ----
const DIA_MAT=new THREE.SpriteMaterial({map:nukeTex,color:0xbcd6ff,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false});
const diamonds=new THREE.Group();for(let i=0;i<6;i++){const s=new THREE.Sprite(DIA_MAT.clone());s.position.y=-3-i*4.2;s.scale.set(4.5-i*0.35,6,1);diamonds.add(s);}scene.add(diamonds);diamonds.visible=false;
const _updRocketS=updRocket;
updRocket=function(v,dt){_updRocketS(v,dt);const os=v.os;if(!padRocket)return;const sk=os.kind==='starship';const st=os.stage;const ud=padRocket.userData;
 const on=os.launched&&os.engine&&os.stages[st].prop>0;const tl=os.t;const gl=st===0?(ud.s1.userData.glows||[]):(ud.s2.userData.glows||[]);
 for(let i=0;i<gl.length;i++){const lit=on&&(st>0||tl>0.12*(i<3?0:i<13?1:2)+i*0.01||os.h>5);gl[i].material.opacity=lit?0.95:0;gl[i].material.color.setHSL(0.6,0.6,0.75);}
 const h=os.h;diamonds.visible=on&&h<35000&&!rec.shipDS;if(diamonds.visible){const base=st===0?0:73;padRocket.updateMatrixWorld();const p=V3(0,base-2.5,0).applyMatrix4(padRocket.matrixWorld);diamonds.position.copy(p);diamonds.quaternion.copy(padRocket.quaternion);
  const thin=sstep(2000,30000,h);const sc=(sk?1.6:0.55)*(1+thin*2.5);diamonds.scale.setScalar(sc);diamonds.children.forEach((s,i)=>{s.material.opacity=(0.75-i*0.1)*(1-thin*0.7)*(0.85+Math.random()*0.15);s.material.color.setRGB(lerp(0.75,1,i/6),lerp(0.85,0.75,i/6),lerp(1,0.55,i/6));});}
 if(on&&h<400&&sk){for(let k=0;k<5;k++){const a=Math.random()*6.28,r=20+Math.random()*30;smoke.spawn(_t.set(PAD.x+Math.cos(a)*r,10+Math.random()*6,PAD.z+Math.sin(a)*r),Math.cos(a)*(60+Math.random()*60),4+Math.random()*16,Math.sin(a)*(60+Math.random()*60),9,22,26,0.8,0.79,0.77,0.38,0.25,0.5);}
  if(Math.random()<0.6)smoke.spawn(_t.set(PAD.x+rnd(10),8,PAD.z+rnd(10)),rnd(20),40,rnd(20),4,8,10,0.95,0.95,1,0.6,0.5,1);}};
window.__pads={STARBASE,LC39,PADS,applyPadSite};

const _bmS=buildMenu;buildMenu=function(){_bmS();if(menuTab!=='free')return;const m=$('menu');const ch=m.querySelector('.chips');if(!ch)return;const sp=settings.ssPad||'sb1';
 const lbl=document.createElement('div');lbl.className='lbl';lbl.textContent='STARSHIP LAUNCH PAD (Falcon 9 always flies from LC-39A)';const row=document.createElement('div');row.className='chips';
 row.innerHTML=Object.entries(PADS).map(([k,n])=>`<div class="chip ${k===sp?'on':''}" data-pad="${k}">${n}</div>`).join('');ch.after(lbl,row);
 row.querySelectorAll('[data-pad]').forEach(c=>c.onclick=()=>{settings.ssPad=c.dataset.pad;try{saveSettings&&saveSettings();}catch(e){}buildMenu();});};
window.__setPad=p=>{settings.ssPad=p;};
