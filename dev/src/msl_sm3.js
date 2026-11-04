// ===== MSL_SM3 (msl builder): RIM-161 SM-3 Block IIA, ship-launched exo-atmospheric hit-to-kill interceptor from the Arleigh Burke forward Mk 41 VLS.
// Model y-up, tail at y=0, L 6.55 m, dia 0.533 m (21 in). Stack: Mk 72 booster (4 canted nozzles, TVC) | steering control section w/ 4 clipped-delta tail fins
// | Mk 104 DTRM 2nd stage | Mk 136 TSRM 3rd stage (dual pulse) | clamshell nosecone | kinetic warhead.
// KW ATTACH POINT (owned by 'wh' builder): set window.SM3_KW = () => THREE.Group (y-up, base at y=0, ~0.6 m long, <=0.24 m radius). Mounted at userData.kwMount. =====
(()=>{const T=THREE,PI=Math.PI;if(typeof DEFS==='undefined'||!DEFS.destroyer)return;
 const R=0.2665,L=6.55,STN=[0,1.72,4.30,5.25,L];// station y: booster | S2 | S3 | nose
 const cache={};
 function skin(key,bands,text){if(cache[key])return cache[key];const W=512,H=1024,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  x.fillStyle='#e9eae5';x.fillRect(0,0,W,H);for(let i=0;i<500;i++){x.fillStyle=`rgba(60,55,45,${Math.random()*0.04})`;x.fillRect(Math.random()*W,Math.random()*H,10+Math.random()*60,3+Math.random()*10);}
  for(const [v0,v1,col] of bands){x.fillStyle=col;x.fillRect(0,(1-v1)*H,W,(v1-v0)*H);}
  x.strokeStyle='rgba(0,0,0,0.45)';x.lineWidth=2;for(const v of [0.02,0.98]){x.beginPath();x.moveTo(0,(1-v)*H);x.lineTo(W,(1-v)*H);x.stroke();}
  for(const [u0,u1,v0,v1] of [[0.1,0.18,0.3,0.45],[0.6,0.68,0.55,0.7]]){x.strokeRect(u0*W,(1-v1)*H,(u1-u0)*W,(v1-v0)*H);}
  for(const t of text){x.save();x.translate(t[0]*W,(1-t[1])*H);x.rotate(-PI/2);x.fillStyle=t[3]||'#151515';x.font=`bold ${t[2]}px "DejaVu Sans Condensed",Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(t[4],0,0);x.restore();}
  const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=8;return cache[key]=tx;}
 const mat=(c,m=0.2,r=0.5,e)=>new T.MeshStandardMaterial(Object.assign({color:c,metalness:m,roughness:r},e||{}));
 const lathe=(pts,m,seg=40,ps=0,pl=PI*2)=>{const g=new T.LatheGeometry(pts.map(p=>new T.Vector2(Math.max(p[0],1e-4),p[1])),seg,ps,pl);const uv=g.attributes.uv,pos=g.attributes.position;const y0=pts[0][1],y1=pts[pts.length-1][1];for(let i=0;i<uv.count;i++)uv.setY(i,(pos.getY(i)-y0)/(y1-y0));g.computeVertexNormals();return new T.Mesh(g,m);};
 const cyl=(r0,r1,h,m,seg=24)=>new T.Mesh(new T.CylinderGeometry(r0,r1,h,seg,1,true),m);
 function fin(G,y0,root,tip,span,th,m){const s=new T.Shape();s.moveTo(0,0);s.lineTo(0,root);s.lineTo(span,root*0.5+tip*0.5);s.lineTo(span,root*0.5-tip*0.5);s.closePath();
  const geo=new T.ExtrudeGeometry(s,{depth:th,bevelEnabled:true,bevelThickness:th*0.3,bevelSize:0.004,bevelSegments:1});geo.translate(0,0,-th/2);
  for(let i=0;i<4;i++){const f=new T.Mesh(geo,m);const p=new T.Group();f.position.x=R*0.98;p.add(f);p.rotation.y=PI/4+i*PI/2;p.position.y=y0;G.add(p);}}
 function raceway(G,y0,y1,a){const b=new T.Mesh(new T.BoxGeometry(0.07,y1-y0,0.045),mat(0xdedfd9,0.15,0.6));b.position.set(Math.cos(a)*(R+0.018),(y0+y1)/2,Math.sin(a)*(R+0.018));b.rotation.y=-a;G.add(b);}
 function sm3(){const G=new T.Group();G.name='RIM-161 SM-3 Block IIA';
  // --- Mk 72 booster
  const B=new T.Group();B.name='Mk72';const bm=mat(0xffffff,0.15,0.55,{map:skin('sm3b',[[0,0.05,'#2a2a28'],[0.1,0.24,'#1b1b1a'],[0.93,1,'#1d1d1c']],[[0.25,0.5,30,'#202020','MK 72 MOD 1 BOOSTER'],[0.75,0.55,22,'#a01010','DANGER  ROCKET MOTOR']])});
  B.add(lathe([[0.25,0],[R,0.07],[R,1.72]],bm));
  const sk=cyl(R+0.006,R+0.006,0.12,mat(0x262624,0.5,0.5,{side:T.DoubleSide}));sk.position.y=0.06;B.add(sk);
  const ac=new T.Mesh(new T.CircleGeometry(0.25,32),mat(0x3a3836,0.6,0.6));ac.rotation.x=PI/2;ac.position.y=0.002;B.add(ac);
  const nz=[];for(let i=0;i<4;i++){const a=PI/4+i*PI/2;const g=new T.Group();g.position.set(Math.cos(a)*0.12,0,Math.sin(a)*0.12);g.rotation.set(Math.sin(a)*0.12,0,-Math.cos(a)*0.12);
   const n=cyl(0.09,0.045,0.24,mat(0x2c2a28,0.75,0.4,{side:T.DoubleSide}),20);n.position.y=-0.12;g.add(n);const th=cyl(0.04,0.04,0.05,mat(0x111110,0.3,0.9),12);th.position.y=-0.005;g.add(th);B.add(g);nz.push(g);}
  raceway(B,0.12,1.66,0);G.add(B);
  // --- steering control section + Mk 104 DTRM
  const S2=new T.Group();S2.name='Mk104';S2.position.y=STN[1];const s2m=mat(0xffffff,0.15,0.55,{map:skin('sm3s2',[[0,0.012,'#3b3b39'],[0.985,1,'#3b3b39']],[[0.25,0.6,26,'#151515','U.S. NAVY'],[0.75,0.6,26,'#151515','SM-3 BLK IIA'],[0.25,0.35,16,'#202020','MK 104 MOD 0  DTRM'],[0.5,0.18,14,'#202020','STEERING CONTROL SECTION']])});
  S2.add(lathe([[R,0],[R,STN[2]-STN[1]]],s2m));fin(S2,0.05,0.62,0.22,0.36,0.02,mat(0xd9dad5,0.25,0.5));
  for(let i=0;i<4;i++){const a=PI/4+i*PI/2;const f=new T.Mesh(new T.CapsuleGeometry(0.025,0.4,4,8),mat(0xcfd0cb,0.2,0.5));f.position.set(Math.cos(a)*(R+0.012),0.36,Math.sin(a)*(R+0.012));S2.add(f);}// actuator fairings
  raceway(S2,0.7,2.5,0);G.add(S2);
  // --- Mk 136 TSRM
  const S3=new T.Group();S3.name='Mk136';S3.position.y=STN[2];const s3m=mat(0xffffff,0.15,0.55,{map:skin('sm3s3',[[0,0.03,'#2b2b29'],[0.96,1,'#2b2b29']],[[0.25,0.5,18,'#202020','MK 136 TSRM'],[0.75,0.5,14,'#202020','DUAL PULSE']])});
  S3.add(lathe([[R,0],[R,STN[3]-STN[2]]],s3m));raceway(S3,0.05,0.9,0);
  const n3=cyl(0.03,0.15,0.18,mat(0x2c2a28,0.75,0.4,{side:T.DoubleSide}),20);n3.position.y=-0.06;n3.visible=false;S3.add(n3);// TSRM nozzle, exposed after 2nd-stage sep
  G.add(S3);
  // --- kinetic warhead mount (inside nosecone)
  const KM=new T.Group();KM.name='kwMount';KM.position.y=STN[3]+0.05;
  const kwf=window.SM3_KW;let kw=null;try{kw=typeof kwf==='function'?kwf():null;}catch(e){kw=null;}
  if(!kw){kw=new T.Group();const k=lathe([[0.19,0],[0.19,0.42],[0.15,0.5],[0.0,0.55]],mat(0x8c8a84,0.7,0.35));kw.add(k);const sw=new T.Mesh(new T.SphereGeometry(0.06,16,8),mat(0x223344,0.1,0.05));sw.position.y=0.5;kw.add(sw);kw.userData.placeholder=true;}
  KM.add(kw);G.add(KM);
  // --- clamshell nosecone (two halves)
  const nm=mat(0xffffff,0.15,0.5,{map:skin('sm3n',[[0.9,1,'#5c5d5a']],[])});const op=[];const Ln=L-STN[3];const og=[];for(let i=0;i<=14;i++){const t=i/14;const rho=(R*R+Ln*Ln)/(2*R);const yy=t*Ln;og.push([Math.max(Math.sqrt(rho*rho-yy*yy)+R-rho,0.012*(1-t)+0.0005),yy]);}
  const nose=new T.Group();nose.name='nose';nose.position.y=STN[3];for(let s=0;s<2;s++){const h=new T.Group();h.add(lathe(og,nm,24,s*PI,PI));const sm=new T.Mesh(new T.BoxGeometry(0.012,Ln*0.85,0.012),mat(0x444442,0.6,0.5));sm.position.set(0,Ln*0.42,(s?-1:1)*0.001);nose.add(h);op.push(h);}
  const tip=new T.Mesh(new T.SphereGeometry(0.014,10,6),mat(0x777,0.8,0.3));tip.position.y=Ln;nose.add(tip);G.add(nose);
  // missile-grade detail pass (refs/sm3/compare.png, launch_maya.jpg): dark stage-joint rings w/ bolt heads, umbilical connector, ordnance band, antenna blades
  {const jm=mat(0x3b3c3a,0.55,0.45),bolt=mat(0x8a8b86,0.8,0.3);for(const [y,PG] of [[STN[1],B],[STN[2],S2],[STN[3],S3]]){const r=cyl(R+0.004,R+0.004,0.035,jm,40);const yl=y-PG.position.y;r.position.y=yl;PG.add(r);
    for(let i=0;i<16;i++){const a=i/16*PI*2;const bh=new T.Mesh(new T.CylinderGeometry(0.008,0.008,0.006,6),bolt);bh.rotation.z=PI/2;bh.rotation.y=-a;bh.position.set(Math.cos(a)*(R+0.007),yl,Math.sin(a)*(R+0.007));PG.add(bh);}}
   const ob=cyl(R+0.002,R+0.002,0.05,mat(0xc9a227,0.2,0.6),40);ob.position.y=0.55;S3.add(ob);// yellow HE/live band
   const um=new T.Mesh(new T.BoxGeometry(0.06,0.11,0.035),mat(0x2a2a29,0.4,0.6));um.position.set(R+0.02,0.25,0);S2.add(um);
   for(const a of [PI/2,-PI/2]){const bl=new T.Mesh(new T.BoxGeometry(0.004,0.07,0.05),mat(0x1d1d1c,0.3,0.7));bl.position.set(Math.cos(a)*(R+0.03),0.3,Math.sin(a)*(R+0.03));bl.rotation.y=-a;S3.add(bl);}}
  G.traverse(c=>{if(c.isMesh){c.castShadow=false;}});
  G.userData={len:L,diam:2*R,parts:{B,S2,S3,nose,KM,kw},halves:op,nz,n3,stn:STN};return G;}
 window.MSL_SM3=sm3;
 // ---------------- flight ----------------
 AMMO.SM3=4;if(!DEFS.destroyer.weapons.includes('SM3'))DEFS.destroyer.weapons.splice(DEFS.destroyer.weapons.indexOf('SAM')+1,0,'SM3');
 const PH=[{n:'MK 72 BOOST',burn:6,a:88},{n:'MK 104 BOOST',burn:12,a:95,coast:2.4},{n:'MK 136 PULSE 1',burn:8,a:140,coast:2.4},{n:'MK 136 PULSE 2',burn:6,a:140,coast:1.8}];
 const _v=new T.Vector3(),_w=new T.Vector3(),_q=new T.Quaternion(),UP=new T.Vector3(0,1,0);const debris=[];
 function threat(o){let best=null,bd=1e9;for(const q of projs){if(q===o||q.done||q.type!=='ballistic'||(q.owner===o.owner))continue;const d=q.pos.distanceTo(o.pos);if(d<bd&&d<1.3e6){bd=d;best=q;}}return best;}
 function satTarget(o){// test satellite crossing overhead (no live ballistic threat): ~7.6 km/s at 160 km, track timed to meet the interceptor
  const g=new T.Group();const bus=new T.Mesh(new T.BoxGeometry(1.6,1.6,2.4),mat(0xc9a640,0.9,0.35));g.add(bus);for(const s of[-1,1]){const p=new T.Mesh(new T.BoxGeometry(5,0.05,1.6),mat(0x1a2a55,0.4,0.3));p.position.x=s*3.4;g.add(p);}
  const dir=new T.Vector3(Math.random()-0.5,0,Math.random()-0.5).normalize();const meet=o.pos.clone().add(new T.Vector3(dir.z*30000,160000,-dir.x*30000));const vel=dir.clone().multiplyScalar(7600);
  const s={type:'sat',pos:meet.clone().addScaledVector(vel,-62),vel,mesh:g,life:200,owner:null,sat:true,name:'TARGET SAT'};g.position.copy(s.pos);const f=camFollow;addProj(s);camFollow=f;return s;}
 function shed(o,part,dv){part.updateMatrixWorld(true);const wp=part.getWorldPosition(new T.Vector3()),wq=part.getWorldQuaternion(new T.Quaternion());part.parent.remove(part);part.position.copy(wp);part.quaternion.copy(wq);scene.add(part);
  debris.push({m:part,v:o.vel.clone().add(dv),w:new T.Vector3((Math.random()-0.5)*0.8,(Math.random()-0.5)*0.4,(Math.random()-0.5)*0.8),t:0});}
 function retail(o,y){const M=o.mesh;for(const c of [...M.children])c.position.y-=y;o.pos.addScaledVector(_v.set(0,1,0).applyQuaternion(M.quaternion),y);M.position.copy(o.pos);}
 function launch(v){const M=sm3();const P=v.mesh.localToWorld(new T.Vector3(1.4,6.2,-37));M.position.copy(P);
  const o={type:'sm3',pos:P.clone(),vel:new T.Vector3(0,30,0),life:260,mesh:M,owner:v,t:0,ph:0,burn:0,coast:0,dir:new T.Vector3(0,1,0),sm3:true,name:'SM-3 IIA',tg:null};
  o.tg=threat(o)||satTarget(o);
  for(let k=0;k<60;k++)smoke.spawn(P,(Math.random()-0.5)*14,4+Math.random()*16,(Math.random()-0.5)*14,4,6,22,0.96,0.96,0.97,0.85,0.4,0);// VLS exhaust plenum cloud (cf. JS Maya photo)
  for(let k=0;k<16;k++)fire.spawn(P,(Math.random()-0.5)*6,Math.random()*8,(Math.random()-0.5)*6,0.3,2,5,1,0.8,0.5,1);
  addProj(o);if(v===player){camFollow=o;}msg(o.tg&&o.tg.sat?'SM-3 IIA AWAY - TARGET SAT 160 km':'SM-3 IIA AWAY - BALLISTIC TRACK',2);if(typeof sfx==='function')sfx('missile');return o;}
 const _fw=fireWeapon;fireWeapon=function(v){const w=v.weapons&&v.weapons[v.wi];if(w!=='SM3')return _fw(v);if(!(v.ammo[w]>0)||simT<(v.cool||0))return false;v.cool=simT+3;v.ammo[w]--;launch(v);return true;};
 function guide(o){const tg=o.tg;if(!tg||tg.done)return _v.copy(o.vel).normalize();const r=_w.copy(tg.pos).sub(o.pos);const dist=r.length();const sp=Math.max(o.vel.length(),800);
  const tgo=dist/Math.max(800,sp+Math.max(0,-r.dot(tg.vel||UP)/dist));const aim=_v.copy(tg.pos).addScaledVector(tg.vel||_v.set(0,0,0),tgo);
  const vg=aim.sub(o.pos).divideScalar(Math.max(tgo,2)).sub(o.vel);vg.y+=G*Math.min(tgo,30)*0.5;return vg.normalize();}
 function kill(o,tg){o.done=true;tg.done=true;tg.life=0;const p=tg.pos.clone();for(let k=0;k<40;k++)fire.spawn(p,(Math.random()-0.5)*200,(Math.random()-0.5)*200,(Math.random()-0.5)*200,0.6,10,40,1,0.9,0.7,1);
  for(let k=0;k<30;k++)smoke.spawn(p,(Math.random()-0.5)*120,(Math.random()-0.5)*120,(Math.random()-0.5)*120,8,10,60,0.85,0.85,0.85,0.5,0,0);if(typeof explosion==='function')explosion(p,3);
  msg('HIT-TO-KILL - '+(tg.sat?'SATELLITE':'BALLISTIC TARGET')+' DESTROYED',3);if(camFollow===o)camFollow=null;}
 const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);
  for(const q of projs){if(q.type==='sat'&&!q.done){q.pos.addScaledVector(q.vel,dt);q.mesh.position.copy(q.pos);q.mesh.rotation.y+=dt*0.1;}}
  for(const o of projs){if(o.type!=='sm3'||o.done)continue;o.t+=dt;const U=o.mesh.userData,P=U.parts;const h=o.pos.y;
   if(o.tg&&o.tg.done&&!o.kw)o.tg=threat(o)||o.tg;
   if(o.coast>0){o.coast-=dt;if(o.coast<=0){for(let k=0;k<12;k++)fire.spawn(o.pos,(Math.random()-0.5)*6-o.dir.x*30,(Math.random()-0.5)*6-o.dir.y*30,(Math.random()-0.5)*6-o.dir.z*30,0.3,2,5,1,0.85,0.55,1);msg(PH[o.ph].n,1.2);}}
   else if(o.ph<PH.length){const S=PH[o.ph];const want=o.t<1.6?UP:guide(o);const rate=o.ph===0?0.5:0.35;const ang=o.dir.angleTo(want);if(ang>1e-4){_w.crossVectors(o.dir,want).normalize();o.dir.applyAxisAngle(_w,Math.min(ang,rate*dt)).normalize();}
    o.vel.addScaledVector(o.dir,S.a*dt);o.burn+=dt;
    const rho=1.225*Math.exp(-h/8500);const n=o.ph===0?4:3;for(let k=0;k<n;k++){const b=_v.copy(o.pos).addScaledVector(o.dir,-0.4-k*1.2);fire.spawn(b,(Math.random()-0.5)*2-o.dir.x*40,(Math.random()-0.5)*2-o.dir.y*40,(Math.random()-0.5)*2-o.dir.z*40,0.25,1.2+h/12000,2.5+h/5000,1,0.8,0.45,1,0,0,1,0.3,0.1);}
    if(rho>0.02&&Math.random()<0.8)smoke.spawn(_v.copy(o.pos).addScaledVector(o.dir,-4),(Math.random()-0.5)*2,(Math.random()-0.5)*2,(Math.random()-0.5)*2,h<20000?14:5,2+h/4000,5+h/1500,0.94,0.94,0.96,0.5,0.03,0);
    if(o.burn>=S.burn){o.burn=0;o.ph++;
     if(o.ph===1){shed(o,P.B,_w.copy(o.dir).multiplyScalar(-8));retail(o,U.stn[1]);msg('MK 72 BURNOUT - BOOSTER SEP',1.4);}
     else if(o.ph===2){shed(o,P.S2,_w.copy(o.dir).multiplyScalar(-8));retail(o,U.stn[2]-U.stn[1]);U.n3.visible=true;msg('MK 104 BURNOUT - 2ND STAGE SEP',1.4);}
     else if(o.ph===3){// exo-atmospheric: clamshell nosecone jettison between TSRM pulses
      for(const [i,hh] of U.halves.entries()){const s=i?-1:1;const side=_w.set(0,0,s).applyQuaternion(o.mesh.quaternion);hh.visible=true;P.nose.visible=true;shed(o,hh,side.multiplyScalar(6).addScaledVector(o.dir,-2));}P.nose.visible=false;msg('TSRM PULSE 1 OUT - NOSECONE JETTISON',1.4);}
     else if(o.ph===4){// KW separation: TSRM drops, KW flies on alone
      shed(o,P.S3,_w.copy(o.dir).multiplyScalar(-5));retail(o,U.stn[3]-U.stn[2]+0.05);o.kw=true;o.divert=900;msg('KW SEPARATION - IR SEEKER ACQUIRING',1.6);}
     if(o.ph<PH.length)o.coast=PH[o.ph].coast||0;}}
   if(o.kw&&o.tg&&!o.tg.done&&o.divert>0){// DACS lateral divert toward predicted miss
    const want=guide(o);const lat=_w.copy(want).multiplyScalar(o.vel.length()).sub(o.vel);const l=lat.length();if(l>0.5){const a=Math.min(l,60*dt,o.divert);o.vel.addScaledVector(lat.normalize(),a);o.divert-=a;if(Math.random()<0.5)fire.spawn(o.pos,-lat.x*15,-lat.y*15,-lat.z*15,0.08,0.3,0.6,1,0.9,0.7,1);}}
   o.vel.y-=G*dt;if(h<40000){const rho=1.225*Math.exp(-h/8500);o.vel.multiplyScalar(1-Math.min(0.2,rho*o.vel.length()*0.000004*dt));}
   const pv=_v.copy(o.pos);o.pos.addScaledVector(o.vel,dt);o.mesh.position.copy(o.pos);o.mesh.quaternion.setFromUnitVectors(UP,o.ph<PH.length&&o.coast<=0?o.dir:_w.copy(o.vel).normalize());if(o.ph>=PH.length)o.dir.copy(o.vel).normalize();
   o.mach=o.vel.length()/295;
   const tg=o.tg;if(tg&&!tg.done&&o.t>8){const r=_w.copy(tg.pos).sub(o.pos);const rel=new T.Vector3().copy(tg.vel||new T.Vector3()).sub(o.vel);const tc=Math.max(-dt,Math.min(0,-r.dot(rel)/Math.max(rel.lengthSq(),1)));if(r.addScaledVector(rel,tc).length()<(o.kw?30:12))kill(o,tg);}
   if(o.pos.y<groundAt(o.pos.x,o.pos.z).h-2&&o.t>5){o.done=true;splash&&splash(o.pos,2);}}
  for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.t+=dt;d.v.y-=G*dt;d.m.position.addScaledVector(d.v,dt);d.m.rotation.x+=d.w.x*dt;d.m.rotation.y+=d.w.y*dt;d.m.rotation.z+=d.w.z*dt;
   if(d.t<1.2&&Math.random()<0.5)smoke.spawn(d.m.position,0,0,0,1.2,1,3,0.9,0.9,0.92,0.35,0.05,0);if(d.t>90||d.m.position.y<-5){scene.remove(d.m);debris.splice(i,1);}}};
 window.__msl_sm3={launch,debris,PH,model:sm3};})();
