// ===== GWH: Kyle fix #16 - missile-grade warheads + easy flight (builder 'wh') =====
// 1) MSL_MODELS.hgv -> Dark Eagle / LRHW Common Hypersonic Glide Body (biconic, ablative TPS, 4 aft flaps, separation interface, plasma sheath)
// 2) WH.kw()  -> SM-3 Block IIA kinetic warhead module (sapphire seeker window, IR sensor/dewar housing, 4 divert + 6 ACS DACS thrusters w/ puffs)
//    Attach API: WH.fitSM3(root) swaps root.userData.kw contents (GMSL2_SM3 frame: base y=5.27, +Y nose). Auto-applied to every 'sm3' projectile.
//    WH.kw() returns Group (origin=KW base, +Y=fwd, len 0.66, R 0.2) with userData {len,diam,puff(axis:Vector3 local,k),update(dt),seekerGlow(k)}
// 3) Easy flight for 'hyper' and SM-3 KW: smoothed stick, capped turn rates, auto-stabilize/re-home on release, aim reticle. No new buttons.
(()=>{const T=THREE,PI=Math.PI;
 // NaN/Inf guard: bloom smears any NaN fragment into black blocks (seen over ocean env); sanitize every GWH fragment
 const SAN=m=>{m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n{vec4 _c=gl_FragColor;if(any(isnan(_c))||any(isinf(_c)))_c=vec4(0.,0.,0.,_c.a==_c.a?_c.a:1.);gl_FragColor=vec4(min(_c.rgb,vec3(64.)),clamp(_c.a,0.,1.));}');};m.customProgramCacheKey=()=>'gwhsan';return m;};
 const M=(c,r,m,o)=>SAN(new T.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m},o||{})));
 // ---------- textures (built once) ----------
 function tpsTex(){const W=1024,H=512,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  // u = around, v = nose(1)->base(0) ; carbon-carbon / ablator: dark grey-brown with char gradient toward nose
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a2522');g.addColorStop(0.35,'#3b3530');g.addColorStop(0.7,'#4a4540');g.addColorStop(1,'#56524c');x.fillStyle=g;x.fillRect(0,0,W,H);
  for(let i=0;i<5000;i++){const v=Math.random();x.fillStyle=`rgba(${20+v*40|0},${16+v*30|0},${12+v*24|0},${0.08+Math.random()*0.12})`;x.fillRect(Math.random()*W,Math.random()*H,1+Math.random()*3,1+Math.random()*2);}
  // ablation streaks flowing aft (downwards in v), heavier on windward belly (u ~0.5)
  for(let i=0;i<420;i++){const u=Math.random()*W,wind=Math.exp(-Math.pow((u/W-0.5)/0.2,2));const y0=Math.random()*H*0.6,len=40+Math.random()*260;
   const lg=x.createLinearGradient(0,y0,0,y0+len);lg.addColorStop(0,`rgba(10,8,6,${0.25+wind*0.45})`);lg.addColorStop(1,'rgba(10,8,6,0)');x.fillStyle=lg;x.fillRect(u,y0,1+Math.random()*2.5,len);}
  // heat-tint (bluish/bronze) near nose
  const ht=x.createLinearGradient(0,0,0,H*0.25);ht.addColorStop(0,'rgba(140,90,60,0.35)');ht.addColorStop(1,'rgba(140,90,60,0)');x.fillStyle=ht;x.fillRect(0,0,W,H*0.25);
  // TPS segment joints (rings) + longitudinal tile/panel seams
  x.strokeStyle='rgba(0,0,0,0.55)';x.lineWidth=2;for(const v of[0.16,0.33,0.5,0.62,0.74,0.86]){x.beginPath();x.moveTo(0,v*H);x.lineTo(W,v*H);x.stroke();}
  x.lineWidth=1.2;for(let k=0;k<16;k++){const u=k/16*W;x.beginPath();x.moveTo(u,H*0.33);x.lineTo(u,H);x.stroke();}
  x.fillStyle='rgba(0,0,0,0.5)';for(const v of[0.62,0.86])for(let u=0;u<W;u+=W/48){x.beginPath();x.arc(u,v*H+5,1.6,0,7);x.fill();}
  // stencils (top side u~0)
  x.save();x.font='bold 15px "DejaVu Sans Condensed",Arial Narrow,sans-serif';x.fillStyle='rgba(180,170,150,0.55)';x.translate(W*0.02,H*0.8);x.fillText('C-HGB  DO NOT STEP',0,0);x.restore();
  x.save();x.font='13px "DejaVu Sans Condensed",sans-serif';x.fillStyle='rgba(200,190,170,0.45)';x.translate(W*0.97,H*0.92);x.rotate(PI);x.fillText('LIFT PT',0,0);x.restore();
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;t.wrapS=T.RepeatWrapping;return t;}
 function goldTex(){const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.fillStyle='#a8873a';x.fillRect(0,0,256,128);
  for(let i=0;i<90;i++){x.strokeStyle=`rgba(${Math.random()<0.5?90:255},${Math.random()<0.5?60:220},20,${0.15+Math.random()*0.25})`;x.lineWidth=1+Math.random()*3;x.beginPath();const y=Math.random()*128;x.moveTo(0,y);for(let u=0;u<=256;u+=32)x.lineTo(u,y+(Math.random()-0.5)*14);x.stroke();}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=T.RepeatWrapping;return t;}
 let TX=null;const tex=()=>TX||(TX={tps:tpsTex(),gold:goldTex()});
 function lathe(pts,mat,seg=56){const g=new T.LatheGeometry(pts.map(p=>new T.Vector2(Math.max(p[0],1e-4),p[1])),seg);const L=pts[pts.length-1][1]-pts[0][1];
  const uv=g.attributes.uv,pos=g.attributes.position;for(let i=0;i<uv.count;i++)uv.setY(i,(pos.getY(i)-pts[0][1])/L);g.computeVertexNormals();{const n=g.attributes.normal.array;for(let i=0;i<n.length;i+=3){const l=Math.hypot(n[i],n[i+1],n[i+2]);if(!(l>1e-6)){n[i]=0;n[i+1]=1;n[i+2]=0;}else{n[i]/=l;n[i+1]/=l;n[i+2]/=l;}}}return new T.Mesh(g,mat);}
 const glowSpr=(()=>{let tx;return(col,s)=>{if(!tx){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.3,'rgba(255,255,255,0.5)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);tx=new T.CanvasTexture(c);}
  const sp=new T.Sprite(new T.SpriteMaterial({map:tx,color:col,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,fog:false}));sp.scale.setScalar(s);return sp;};})();

 // ================= Dark Eagle C-HGB =================
 // Public dims: LRHW AUR ~0.88 m (34.5 in) dia; C-HGB is a biconic (Sandia AHW lineage). Glide body modeled L 3.5 m, base R 0.40 m (inside the 0.88 m booster shroud).
 const HL=3.5,HR=0.40;
 function hgv(){const G=new T.Group();G.name='Dark Eagle C-HGB';const X=tex();
  const tpsM=M(0xffffff,0.82,0.18,{map:X.tps}),capM=M(0x4a3e36,0.55,0.3,{emissive:0xff5a1a,emissiveIntensity:0}),metal=M(0x8d8f92,0.35,0.85),dark=M(0x1a1b1d,0.6,0.5),flapM=M(0x34302c,0.7,0.3,{map:X.tps});
  const body=new T.Group();body.rotation.x=-PI/2;body.position.z=HL/2;G.add(body);// local +Y = nose (-Z world-model)
  // biconic: blunt spherical nosetip (r 25mm), fore-cone ~6.5 deg, cone break at 1.9 m from nose, aft cone ~3.5 deg flare, aft skirt
  const y=(d)=>HL-d,pts=[[HR,y(3.5)],[HR,y(3.38)],[0.385,y(3.30)],[0.30,y(1.92)],[0.296,y(1.88)],[0.09,y(0.12)],[0.06,y(0.05)],[0.035,y(0.012)],[0.0005,y(0)]];
  pts.sort((a,b)=>a[1]-b[1]);const hull=lathe(pts,tpsM,64);body.add(hull);
  const cap=new T.Mesh(new T.SphereGeometry(0.036,20,14),capM);cap.position.y=HL-0.03;body.add(cap);// C-C nosetip
  // cone-break joint ring + aft TPS joint
  const ring=(r,yy,w,m)=>{const q=new T.Mesh(new T.CylinderGeometry(r,r,w,64,1,true),m);q.position.y=yy;body.add(q);return q;};
  ring(0.299,y(1.9),0.03,metal);ring(0.386,y(3.30),0.02,metal);
  // separation interface: aft adapter ring w/ 12 frangible-bolt bosses, umbilical connector block, base heat shield
  ring(HR+0.006,0.04,0.08,M(0x6e6c68,0.4,0.8));for(let i=0;i<12;i++){const a=i/12*2*PI;const b=new T.Mesh(new T.CylinderGeometry(0.014,0.014,0.03,8),metal);b.rotation.z=PI/2;b.position.set(Math.cos(a)*(HR+0.012),0.04,Math.sin(a)*(HR+0.012));b.lookAt(0,0.04,0);b.rotateX(PI/2);body.add(b);}
  const base=new T.Mesh(new T.CircleGeometry(HR,48),M(0x2a2724,0.9,0.2));base.rotation.x=PI/2;base.position.y=0.001;body.add(base);
  const bh=new T.Mesh(new T.TorusGeometry(HR*0.7,0.012,6,40),dark);bh.rotation.x=PI/2;bh.position.y=0.004;body.add(bh);
  const umb=new T.Mesh(new T.BoxGeometry(0.09,0.16,0.05),M(0x5b5d60,0.5,0.7));umb.position.set(0,0.1,HR+0.01);body.add(umb);
  const umbP=new T.Mesh(new T.CylinderGeometry(0.018,0.018,0.04,10),dark);umbP.rotation.x=PI/2;umbP.position.set(0,0.06,HR+0.04);body.add(umbP);
  // 4 aft control flaps (cruciform, X), hinge line at skirt, flap actuator fairings
  const flaps=[];for(let i=0;i<4;i++){const a=PI/4+i*PI/2;const p=new T.Group();p.rotation.y=-a;const piv=new T.Group();piv.position.set(0.37,0.2,0);p.add(piv);
   const s=new T.Shape();s.moveTo(0,0);s.lineTo(0.13,0);s.lineTo(0.13,0.2);s.lineTo(0,0.3);s.closePath();const fg=new T.ExtrudeGeometry(s,{depth:0.02,bevelEnabled:true,bevelThickness:0.005,bevelSize:0.005,bevelSegments:1});fg.translate(0,-0.30,-0.01);
   const f=new T.Mesh(fg,flapM);f.rotation.z=-0.06;piv.add(f);const hg=new T.Mesh(new T.CylinderGeometry(0.012,0.012,0.04,8),metal);hg.position.set(0.01,0,0);piv.add(hg);
   const fair=new T.Mesh(new T.CapsuleGeometry(0.03,0.36,3,8),tpsM);fair.position.set(0.36,0.45,0);p.add(fair);body.add(p);flaps.push(piv);}
  // flush air-data / RCS ports
  for(let i=0;i<4;i++){const a=i*PI/2;const r=0.2;const d=new T.Mesh(new T.CircleGeometry(0.01,10),dark);d.position.set(Math.cos(a)*r*1.01,HL-1.0,Math.sin(a)*r*1.01);d.lookAt(Math.cos(a)*3,HL-1.0,Math.sin(a)*3);body.add(d);}
  // ---- plasma sheath: additive shell + nose shock glow + wake ----
  const shM=new T.MeshBasicMaterial({color:0xff7a30,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,side:T.BackSide,fog:false});SAN(shM);
  const sheath=lathe(pts.map(p=>[p[0]*1.12+0.02,p[1]]),shM,32);body.add(sheath);
  const shM2=new T.MeshBasicMaterial({color:0xc8b0ff,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,fog:false});SAN(shM2);
  const wake=new T.Mesh(new T.ConeGeometry(HR*1.1,6,24,1,true),shM2);wake.rotation.x=PI;wake.position.y=-3;body.add(wake);
  const nose=glowSpr(0xffb070,1.4);nose.position.y=HL;body.add(nose);const halo=glowSpr(0xff6a2a,5);halo.position.y=HL*0.55;body.add(halo);
  G.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});
  let gk=0;
  G.userData={len:HL,diam:HR*2,flaps,glow(k){gk+=(k-gk)*0.15;const f=gk;shM.opacity=f*0.55;shM2.opacity=f*0.22;nose.material.opacity=Math.min(1,f*1.3);nose.scale.setScalar(0.8+f*1.6);halo.material.opacity=f*0.35;capM.emissiveIntensity=f*2.2;},
   flap(p,y){for(let i=0;i<4;i++){const s=(i<2?1:-1);flaps[i].rotation.z=Math.max(-0.35,Math.min(0.35,p*0.3*(i%2?1:-1)+y*0.3*s));}}};
  return G;}

 // ================= SM-3 Block IIA kinetic warhead =================
 const KL=0.66,KR=0.2;
 function kw(){const G=new T.Group();G.name='SM-3 IIA KW';const X=tex();
  const blk=M(0x26282b,0.55,0.55),metal=M(0x9fa2a6,0.3,0.85),gold=M(0xd8c9a0,0.38,0.9,{map:X.gold}),blackA=M(0x111214,0.85,0.2);
  // main structure: octagonal avionics bus wrapped in gold MLI, aft propellant tank dome
  const bus=new T.Mesh(new T.CylinderGeometry(KR*0.97,KR,0.26,8),gold);bus.position.y=0.2;G.add(bus);
  const tank=new T.Mesh(new T.SphereGeometry(KR*0.92,24,12,0,2*PI,PI/2,PI/2),M(0x7d8085,0.35,0.8));tank.position.y=0.07;G.add(tank);
  const aft=new T.Mesh(new T.CylinderGeometry(KR,KR*0.92,0.07,32),blk);aft.position.y=0.035;G.add(aft);
  // IR sensor housing: cryo-cooled FPA dewar + optics barrel w/ sunshade baffles, seeker window (sapphire) at front
  const hous=new T.Mesh(new T.CylinderGeometry(0.135,0.17,0.14,28),blk);hous.position.y=0.4;G.add(hous);
  const dewar=new T.Mesh(new T.CylinderGeometry(0.04,0.04,0.12,14),metal);dewar.rotation.z=PI/2;dewar.position.set(0.14,0.33,0);G.add(dewar);
  const cool=new T.Mesh(new T.TorusGeometry(0.15,0.008,6,24),metal);cool.rotation.x=PI/2;cool.position.y=0.47;G.add(cool);
  const barrel=new T.Mesh(new T.CylinderGeometry(0.105,0.12,0.14,28,1,true),M(0x1b1c1e,0.4,0.6,{side:T.DoubleSide}));barrel.position.y=0.54;G.add(barrel);
  for(const yy of[0.5,0.56,0.6]){const b=new T.Mesh(new T.TorusGeometry(0.108,0.006,6,28),blackA);b.rotation.x=PI/2;b.position.y=yy;G.add(b);}
  const winM=new T.MeshPhysicalMaterial({color:0x3a5c7a,roughness:0.03,metalness:0.1,transmission:0,clearcoat:1,clearcoatRoughness:0.02,emissive:0x112233,emissiveIntensity:0.4});SAN(winM);
  const win=new T.Mesh(new T.SphereGeometry(0.1,28,14,0,2*PI,0,PI*0.42),winM);win.position.y=0.585;G.add(win);
  const ret=new T.Mesh(new T.TorusGeometry(0.1,0.01,8,32),metal);ret.rotation.x=PI/2;ret.position.y=0.61;G.add(ret);
  const optic=new T.Mesh(new T.CircleGeometry(0.05,20),M(0x0c1a26,0.1,0.6,{emissive:0x3355aa,emissiveIntensity:0.2}));optic.rotation.x=-PI/2;optic.position.y=0.6;G.add(optic);
  // star tracker + RF link antennas
  const st=new T.Mesh(new T.BoxGeometry(0.05,0.06,0.05),blk);st.position.set(-0.12,0.42,0.09);G.add(st);
  for(const a of[0.6,3.7]){const p=new T.Mesh(new T.BoxGeometry(0.05,0.05,0.006),M(0xd8d6cf,0.6,0.1));p.position.set(Math.cos(a)*KR,0.24,Math.sin(a)*KR);p.lookAt(Math.cos(a)*3,0.24,Math.sin(a)*3);G.add(p);}
  // DACS: 4 divert thrusters radial at CG (y 0.2), 6 ACS pairs aft (y 0.06)
  const puffs=[],nozG=new T.CylinderGeometry(0.022,0.042,0.075,14,1,true),nozM=M(0x3a3634,0.45,0.75,{side:T.DoubleSide});
  const addThr=(a,yy,sc,kind)=>{const g=new T.Group();g.position.set(Math.cos(a)*KR*0.98,yy,Math.sin(a)*KR*0.98);g.lookAt(Math.cos(a)*5,yy,Math.sin(a)*5);
   const n=new T.Mesh(nozG,nozM);n.rotation.x=PI/2;n.position.z=0.03*sc;n.scale.setScalar(sc);g.add(n);
   const vb=new T.Mesh(new T.BoxGeometry(0.05*sc,0.05*sc,0.04*sc),metal);vb.position.z=-0.01;g.add(vb);
   const pf=glowSpr(kind?0xdde6ff:0xbfd4ff,0.5*sc);pf.position.z=0.12*sc;g.add(pf);const pc=glowSpr(0xffffff,0.25*sc);pc.position.z=0.07*sc;g.add(pc);
   G.add(g);puffs.push({g,pf,pc,dir:new T.Vector3(Math.cos(a),0,Math.sin(a)),k:0,kind});};
  for(let i=0;i<4;i++)addThr(i*PI/2,0.2,1,0);for(let i=0;i<6;i++)addThr(PI/6+i*PI/3,0.06,0.5,1);
  G.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});
  G.userData={len:KL,diam:KR*2,puffs,
   puff(axis,k){// axis: desired local accel direction (thrusters fire opposite)
    for(const p of puffs){if(p.kind)continue;const d=-p.dir.dot(axis);if(d>0.35)p.k=Math.max(p.k,Math.min(1,k*d));}},
   acs(k){for(const p of puffs)if(p.kind&&Math.random()<0.25)p.k=Math.max(p.k,k);},
   seekerGlow(k){optic.material.emissiveIntensity=0.2+k*1.5;},
   update(dt){for(const p of puffs){p.k=Math.max(0,p.k-dt*6);const f=p.k*(0.75+Math.random()*0.25);p.pf.material.opacity=f;p.pc.material.opacity=f;p.pf.scale.setScalar((p.kind?0.25:0.5)*(0.6+f*1.4));}}};
  return G;}
 function fitSM3(root){const U=root&&root.userData;if(!U||!U.kw||U.whKW)return null;const g=U.kw;for(const c of[...g.children])g.remove(c);const k=kw();k.position.y=5.27;g.add(k);U.whKW=k;return k;}

 window.WH={T,hgv,kw,fitSM3,KW_LEN:KL,HGV_LEN:HL};
 if(window.MSL_MODELS)MSL_MODELS.hgv=hgv;

 // ================= easy flight =================
 const S={p:0,y:0,wp:0,wy:0,rel:0,o:null};const _q=new T.Quaternion(),_v=new T.Vector3(),_r=new T.Vector3(),_u=new T.Vector3(0,1,0),_w=new T.Vector3(),_pv=new Map();WH.S=S;
 const isEasy=o=>o&&!o.done&&(o.type==='hyper'||(o.type==='sm3'&&o.ph==='kw'));
 const expo=x=>Math.sign(x)*(0.35*Math.abs(x)+0.65*x*x);
 {const _ri=readInput;readInput=function(dt){_ri(dt);const o=camFollow;if(!isEasy(o)){S.o=null;return;}
  let rp,ry;if(o.type==='hyper'&&window.__guide){const s=__guide.stick;rp=s.p;ry=s.r+s.y;s.p=s.r=s.y=0;}else{rp=inp.pitch;ry=inp.roll+inp.yaw;inp.pitch=inp.roll=inp.yaw=0;}
  rp=Math.max(-1,Math.min(1,rp));ry=Math.max(-1,Math.min(1,ry));
  if(S.o!==o){S.o=o;S.p=S.y=S.wp=S.wy=0;S.rel=9;}
  const k=Math.min(1,dt*9);S.p+=(expo(rp)-S.p)*k;S.y+=(expo(ry)-S.y)*k;// smoothed, expo-shaped
  if(Math.abs(rp)+Math.abs(ry)>0.04)S.rel=0;else S.rel+=dt;};}
 function step(dt){const o=S.o;if(!isEasy(o))return;const sp=o.vel.length();if(sp<1)return;
  const hy=o.type==='hyper';const cap=hy?0.42:0.0;// rad/s cap (hyper); KW steers by lateral divert accel
  // commanded rate approaches stick with 0.18 s lag -> no snapping; released -> rates decay to 0 (auto-stabilize)
  const a=Math.min(1,dt/0.18);S.wp+=(S.p*cap-S.wp)*a;S.wy+=(S.y*cap-S.wy)*a;
  const dir=_v.copy(o.vel).divideScalar(sp);_r.crossVectors(dir,_u);if(_r.lengthSq()<1e-6)_r.set(1,0,0);_r.normalize();
  if(hy){if(S.wy)o.vel.applyAxisAngle(_u,-S.wy*dt);if(S.wp){// pitch with flight-path limits
     const fpa=Math.asin(Math.max(-1,Math.min(1,dir.y)));const lim=S.wp>0?(fpa<1.2):(fpa>-1.3);if(lim)o.vel.applyAxisAngle(_r,S.wp*dt);}
   // auto-stabilize: released 0.6 s -> resume homing on the target the stick overrode
   if(S.rel>0.6&&!o.tg&&o._tg&&o._tg.alive){o.tg=o._tg;}
   const u=o.msl;if(u&&u.flap)u.flap(S.p,S.y);}
  else{// SM-3 KW: stick adds divert accel (<=30 m/s^2) on top of auto-homing
   const up2=_w.crossVectors(_r,dir).normalize();const ax=S.y*30,ay=S.p*30;if(Math.abs(ax)+Math.abs(ay)>0.3){o.vel.addScaledVector(_r,ax*dt).addScaledVector(up2,ay*dt);o.vel.setLength(sp);}}}
 {const _tick=tick;tick=function(dt){_tick(dt);try{step(dt);}catch(e){console.warn('wh',e);}};}
 // SM-3 hookup: swap in the detailed KW, drive DACS puffs from actual lateral velocity change
 {const _ap=addProj;addProj=function(o){if(o&&o.type==='hyper'&&o.turn>0.5)o.turn=0.5;// gentler auto-homing turn (was 1.0 rad/s)
  if(o&&o.type==='sm3'&&o.mesh)try{fitSM3(o.mesh);}catch(e){console.warn('wh fit',e);}return _ap(o);};}
 const _lq=new T.Quaternion();
 {const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);if(!(dt>0))return;
  for(const o of projs){if(o.type!=='sm3'||!o.mesh)continue;const U=o.mesh.userData;const k=U&&U.whKW;if(!k)continue;
   if(o.ph==='kw'){const pv=_pv.get(o);if(pv){const dv=_w.copy(o.vel).sub(pv);const d=_v.copy(o.vel).normalize();dv.addScaledVector(d,-dv.dot(d));const acc=dv.length()/dt;
     if(acc>2){k.updateMatrixWorld();k.getWorldQuaternion(_lq).invert();dv.normalize().applyQuaternion(_lq);k.userData.puff(dv,Math.min(1,acc/25));}k.userData.acs(0.6);k.userData.seekerGlow(1);}
    _pv.set(o,(pv||new T.Vector3()).copy(o.vel));}
   k.userData.update(dt);}
  for(const o of _pv.keys())if(o.done)_pv.delete(o);};}
 // ---------- aim indicator: flight-path pipper + target diamond (DOM, 2 nodes, no buttons) ----------
 const css=document.createElement('style');css.textContent=`#whPip,#whTgt{position:fixed;left:0;top:0;pointer-events:none;z-index:29;display:none;will-change:transform}
#whPip{width:44px;height:44px;margin:-22px 0 0 -22px;border:2px solid rgba(120,255,170,.95);border-radius:50%;box-shadow:0 0 6px rgba(120,255,170,.6)}
#whPip:before,#whPip:after{content:'';position:absolute;background:rgba(120,255,170,.95)}#whPip:before{left:50%;top:-9px;width:2px;height:62px;margin-left:-1px;clip-path:polygon(0 0,100% 0,100% 14%,0 14%,0 86%,100% 86%,100% 100%,0 100%)}
#whPip:after{top:50%;left:-9px;height:2px;width:62px;margin-top:-1px;clip-path:polygon(0 0,14% 0,14% 100%,0 100%,0 0,86% 0,100% 0,100% 100%,86% 100%)}
#whTgt{width:30px;height:30px;margin:-15px 0 0 -15px;border:2px solid rgba(255,90,70,.95);transform-origin:center}
#whTgt i{position:absolute;top:34px;left:50%;transform:translateX(-50%) rotate(-45deg);font:600 11px/1 "DejaVu Sans Condensed",Arial Narrow,sans-serif;color:#ff8a70;white-space:nowrap;font-style:normal;text-shadow:0 0 3px #000}`;document.head.appendChild(css);
 const pip=document.createElement('div');pip.id='whPip';const tg=document.createElement('div');tg.id='whTgt';tg.innerHTML='<i></i>';document.body.append(pip,tg);const tgl=tg.firstChild;
 const pr=new T.Vector3();let lastTxt='';
 const place=(el,p,extra)=>{pr.copy(p).project(camera);if(pr.z>1){el.style.display='none';return false;}
  const W=innerWidth,H=innerHeight;const x=Math.max(20,Math.min(W-20,(pr.x+1)/2*W)),y=Math.max(20,Math.min(H-20,(1-pr.y)/2*H));el.style.display='block';el.style.transform=`translate3d(${x}px,${y}px,0)${extra||''}`;return true;};
 {const _uc=updCamera;updCamera=function(dt){_uc(dt);const o=camFollow;if(!isEasy(o)||(typeof blastCam!=='undefined'&&blastCam)){pip.style.display=tg.style.display='none';return;}
  const sp=o.vel.length();const d=_v.copy(o.vel).divideScalar(sp||1);let tgo=o.type==='hyper'?3:2;
  if(o.type==='hyper'&&d.y<-0.02){const h=o.pos.y-(typeof groundAt==='function'?Math.max(0,groundAt(o.pos.x,o.pos.z).h):0);tgo=Math.min(12,h/(-d.y*sp));}
  place(pip,_r.copy(o.pos).addScaledVector(o.vel,Math.max(0.5,tgo)));
  const t=o.tg||o._tg;if(t&&(t.alive!==false)&&!t.done&&t.pos){if(place(tg,t.pos,' rotate(45deg)')){const km=(t.pos.distanceTo(o.pos)/1000).toFixed(1)+' km';if(km!==lastTxt){tgl.textContent=km;lastTxt=km;}tg.style.borderColor=o.tg?'rgba(255,90,70,.95)':'rgba(255,200,80,.9)';}}else tg.style.display='none';};}
})();
