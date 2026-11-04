// ===== GRAPTOR3: SpaceX Raptor 3 (sea-level, 1.3 m exit) and Raptor 3 Vacuum (2.3 m exit) — clean integrated powerhead, fine regen-channel bell, heat tint, hot rim, gimbal actuators. Super Heavy: inner 13 gimbal (+/-15 deg), outer 20 fixed; Ship: 3 SL gimbal, 3 RVac fixed =====
const R3=(()=>{const T=THREE;const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];};
 function chanTex(vac){const W=1024,H=512;const [c,x]=cv(W,H),[b,bx]=cv(W,H);
  // vertical gradient: throat/upper heat tint (straw-gold -> blue-violet) fading to bright machined steel at exit (SL) / dark niobium-ish gray (vac)
  const g=x.createLinearGradient(0,0,0,H);if(vac){g.addColorStop(0,'#8a7a62');g.addColorStop(0.18,'#6a5f74');g.addColorStop(0.35,'#5b5c62');g.addColorStop(1,'#4a4b4f');}else{g.addColorStop(0,'#a08664');g.addColorStop(0.2,'#857a80');g.addColorStop(0.45,'#9a9ea6');g.addColorStop(1,'#c8cbd0');}
  x.fillStyle=g;x.fillRect(0,0,W,H);bx.fillStyle='#808080';bx.fillRect(0,0,W,H);
  const n=vac?160:256;for(let i=0;i<n;i++){const u=i/n*W;x.fillStyle='rgba(0,0,0,0.16)';x.fillRect(u,vac?0:0,1.2,vac?H*0.3:H);bx.fillStyle='#5c5c5c';bx.fillRect(u,0,1.5,vac?H*0.3:H);x.fillStyle='rgba(255,255,255,0.07)';x.fillRect(u+1.5,0,1,vac?H*0.3:H);}
  if(vac){for(let y=H*0.3;y<H;y+=6){x.fillStyle='rgba(0,0,0,0.05)';x.fillRect(0,y,W,1);}} // radiatively cooled thin-wall skirt
  for(let i=0;i<300;i++){x.fillStyle=`rgba(40,30,25,${Math.random()*0.06})`;x.fillRect(Math.random()*W,Math.random()*H,2,10+Math.random()*60);}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=T.RepeatWrapping;t.anisotropy=8;const bt=new T.CanvasTexture(b);bt.wrapS=T.RepeatWrapping;return {t,bt};}
 const C={};const mats=vac=>C[vac?'v':'s']||(C[vac?'v':'s']=(()=>{const {t,bt}=chanTex(vac);return {bell:new T.MeshStandardMaterial({map:t,bumpMap:bt,bumpScale:0.6,metalness:0.88,roughness:vac?0.5:0.32,side:T.DoubleSide,emissive:new T.Color(1,0.38,0.12),emissiveIntensity:0}),
   ph:new T.MeshStandardMaterial({color:0xa9adb3,metalness:0.85,roughness:0.3}),dk:new T.MeshStandardMaterial({color:0x2c2e31,metalness:0.7,roughness:0.45}),
   in:new T.MeshStandardMaterial({color:0x2a1d16,metalness:0.5,roughness:0.7,side:T.BackSide}),rim:new T.MeshBasicMaterial({color:0xff7a30,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false})};})());
 // bell contour (Rao-style): converging section -> throat -> parabolic bell; units relative to exit radius
 function contour(re,L,vac){const rt=re*(vac?0.14:0.27),rc=rt*1.55;const pts=[];const Lc=L*(vac?0.16:0.26);
  pts.push(new T.Vector2(rc,0));pts.push(new T.Vector2(rc,-Lc*0.45));for(let i=0;i<=6;i++){const t=i/6;pts.push(new T.Vector2(rc+(rt-rc)*(0.5-0.5*Math.cos(t*Math.PI)),-Lc*0.45-t*Lc*0.55));}
  const Lb=L-Lc;for(let i=1;i<=24;i++){const t=i/24;const r=rt+(re-rt)*(1-Math.pow(1-t,vac?2.4:1.9));pts.push(new T.Vector2(r,-Lc-t*Lb));}return pts;}
 function build(g,x,y,z,re,L,vac){const M=mats(vac);const piv=new T.Group();piv.position.set(x,y,z);
  const pts=contour(re,L,vac);const bell=new T.Mesh(new T.LatheGeometry(pts,64),M.bell);piv.add(bell);
  const inn=new T.Mesh(new T.LatheGeometry(pts.map(p=>new T.Vector2(p.x*0.985,p.y)),48),M.in);piv.add(inn);
  // exit lip (rolled stiffener) + hot rim glow
  const lip=new T.Mesh(new T.TorusGeometry(re*1.0,re*(vac?0.012:0.03),6,64).rotateX(Math.PI/2),M.ph);lip.position.y=-L;piv.add(lip);
  const rim=new T.Mesh(new T.TorusGeometry(re*0.99,re*0.05,6,48).rotateX(Math.PI/2),M.rim.clone());rim.position.y=-L+0.02;piv.add(rim);
  // regen manifold rings (inlet at bell/skirt joint for vac, aft manifold for SL)
  const m1=new T.Mesh(new T.TorusGeometry(pts[vac?16:14].x*1.02,re*0.035,8,40).rotateX(Math.PI/2),M.ph);m1.position.y=pts[vac?16:14].y;piv.add(m1);
  // Raptor 3 powerhead: clean, integrated, smooth housings over chamber; ox-rich + fuel-rich turbopumps blended in, few lines
  const rc=pts[0].x,PH=L*(vac?0.22:0.42),pr=rc*1.25;
  const dome=new T.Mesh(new T.CylinderGeometry(pr*0.9,pr*1.05,PH,32),M.ph);dome.position.y=PH/2;piv.add(dome);
  const cap=new T.Mesh(new T.SphereGeometry(pr*0.9,24,10,0,Math.PI*2,0,Math.PI/2),M.ph);cap.scale.y=0.45;cap.position.y=PH;piv.add(cap);
  for(const s of[-1,1]){const tp=new T.Mesh(new T.CylinderGeometry(pr*0.42,pr*0.5,PH*0.85,24),M.ph);tp.position.set(s*pr*0.95,PH*0.48,0);piv.add(tp);
   const tc=new T.Mesh(new T.SphereGeometry(pr*0.42,16,8,0,Math.PI*2,0,Math.PI/2),M.ph);tc.scale.y=0.5;tc.position.set(s*pr*0.95,PH*0.9,0);piv.add(tc);}
  // ship #15 plumbing (Raptor 3 keeps it tight to the housings): 2 main propellant ducts turbopump->injector, hot-gas manifold ring, 4 small lines, ignitor/avionics box. Low-poly tubes (39 engines on the stack).
  if(!/noplumb/.test(location.hash)){const Q=(a,b2,c)=>new T.QuadraticBezierCurve3(a,b2,c);const gp=[],gd=[]; // ship #15 plumbing, merged to 2 draw calls per engine
   for(const s of[-1,1]){gp.push(new T.TubeGeometry(Q(new T.Vector3(s*pr*0.95,PH*0.2,0),new T.Vector3(s*pr*1.05,-0.05,s*pr*0.35),new T.Vector3(s*rc*0.55,0.05,rc*0.8)),8,pr*0.14,6,false));}
   gp.push(new T.TorusGeometry(pr*0.78,pr*0.07,6,24).rotateX(Math.PI/2).translate(0,PH*0.12,0));gd.push(new T.BoxGeometry(pr*0.35,PH*0.22,pr*0.25).translate(0,PH*0.55,pr*0.88));
   for(const [arr,mt] of [[gp,M.ph],[gd,M.dk]]){const mg=typeof mergeGeometries==='function'?mergeGeometries(arr.map(g=>g.index?g:g)):null;if(mg){piv.add(new T.Mesh(mg,mt));arr.forEach(g=>g.dispose());}else arr.forEach(g=>piv.add(new T.Mesh(g,mt)));}}
  const band=new T.Mesh(new T.CylinderGeometry(rc*1.08,rc*1.08,0.08,32),M.dk);band.position.y=0.02;piv.add(band);
  // gimbal: thrust-ball at top + two electromechanical TVC actuators at 90 deg
  const ball=new T.Mesh(new T.SphereGeometry(pr*0.32,16,10),M.dk);ball.position.y=PH+pr*0.35;piv.add(ball);
  if(!vac)for(const a of[0,Math.PI/2]){const ac=new T.Mesh(new T.CylinderGeometry(re*0.07,re*0.07,PH*1.1,10),M.dk);ac.position.set(Math.cos(a)*pr*1.05,PH*0.75,Math.sin(a)*pr*1.05);ac.rotation.set(Math.sin(a)*0.35,0,-Math.cos(a)*0.35);piv.add(ac);
   const rod=new T.Mesh(new T.CylinderGeometry(re*0.035,re*0.035,PH*0.6,8),M.ph);rod.position.set(Math.cos(a)*pr*1.25,PH*1.25,Math.sin(a)*pr*1.25);rod.rotation.copy(ac.rotation);piv.add(rod);}
  g.add(piv);piv.userData.bell=1;piv.userData.r3={M,rim};return piv;}
 return {build,mats};})();
{const _rp=raptor;raptor=function(g,x,y,z,r,l,vac){
  const sl=Math.abs(r-0.65)<0.01,rv=Math.abs(r-1.15)<0.01;if(!sl&&!rv)return _rp(g,x,y,z,r,l,vac);
  const rr0=Math.hypot(x,z);const re=sl?(rr0>3.5?0.6:0.65):1.15,L=sl?2.35:4.3;const piv=R3.build(g,x,y,z,re,L,rv);
  const rr=Math.hypot(x,z);piv.userData.fixed=rv||rr>3.5;piv.userData.lim=0.26; // +/-15 deg SL gimbal; outer ring & RVac fixed
  BELLS.push(piv);const gl=new THREE.Mesh(new THREE.CircleGeometry(re*0.95,24).rotateX(Math.PI/2),ENG_GLOW.clone());gl.position.y=-L+0.02;piv.add(gl);return gl;};}
// gimbal + hot-rim behaviour: inner engines track steering (+/-15 deg, actuator-rate limited), fixed engines locked; emissive heat on bells and rims while firing
{const _u=updRocket;const gm={p:0,y:0};updRocket=function(v,dt){_u(v,dt);const os=v.os;if(!padRocket)return;const st=os.stage;const on0=os.launched&&os.engine&&os.stages[st]&&os.stages[st].prop>0;const on=on0;
  const tp=clamp((inp.pitch||0),-1,1)*0.26,ty=clamp((inp.roll||0),-1,1)*0.26;const rate=0.35*dt;gm.p+=clamp(tp-gm.p,-rate,rate);gm.y+=clamp(ty-gm.y,-rate,rate); // ~20 deg/s actuators
  const sg=padRocket.userData['s'+(st+1)];for(const b of BELLS){if(!b.userData.r3||!b.parent)continue;let a=b,mine=false;while(a){if(a===sg){mine=true;break;}a=a.parent;}const on=on0&&mine;if(b.userData.fixed){b.rotation.x=0;b.rotation.z=0;}else{const lm=b.userData.lim||0.26;b.rotation.x=on?clamp(gm.p,-lm,lm):0;b.rotation.z=on?clamp(-gm.y,-lm,lm):0;}
   const M=b.userData.r3;M.rim.material.opacity+=(((on?0.9:0))-M.rim.material.opacity)*Math.min(1,dt*3);M.M.bell.emissiveIntensity+=((on?0.07:0)-M.M.bell.emissiveIntensity)*Math.min(1,dt*1.5);}
  // plume follows mean bell direction
  const p=PL&&PL[st];if(p&&p.visible){p.rotation.x=gm.p*0.6;p.rotation.z=-gm.y*0.6;}};}
