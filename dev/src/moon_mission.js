// ===== moon_mission.js : renders + drives the Moon mission. Entry: window.__moon.start() (menu hook for ui builder). No new buttons. =====
const MOON=(()=>{const T=THREE,P=MPH;let F=null,on=false,warpU=1,camYaw=0.6,camPit=0.15,camD=160,view=0;
const far=new T.Scene(),near=new T.Scene();far.background=new T.Color(0);
const fcam=new T.PerspectiveCamera(55,innerWidth/innerHeight,0.05,3e6),ncam=new T.PerspectiveCamera(55,innerWidth/innerHeight,0.3,60000);
const sunDir=new T.Vector3(0.3,0.25,0.92).normalize();
const sunF=new T.DirectionalLight(0xffffff,3.2);far.add(sunF);far.add(new T.AmbientLight(0x223344,0.08));
const sunN=new T.DirectionalLight(0xfff4e6,3.0);near.add(sunN,sunN.target);const hemi=new T.HemisphereLight(0x9fc4ff,0x404040,0.6);near.add(hemi);
const TX='https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/';const L=new T.TextureLoader();L.setCrossOrigin('anonymous');
const eM=new T.MeshPhongMaterial({color:0x3b6ea8,shininess:18}),earth=new T.Mesh(new T.SphereGeometry(6371,256,128),eM);earth.rotation.x=Math.PI/2;far.add(earth);
const atm=new T.Mesh(new T.SphereGeometry(6371*1.018,256,128),new T.ShaderMaterial({transparent:true,blending:T.AdditiveBlending,side:T.BackSide,depthWrite:false,vertexShader:'varying vec3 n;varying vec3 vp;void main(){n=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);vp=p.xyz;gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 n;varying vec3 vp;void main(){float f=pow(1.0-abs(dot(n,normalize(-vp))),3.0);float dn=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)/255.0;gl_FragColor=vec4(vec3(0.35,0.6,1.0)*f*1.4+dn,1.0);}'}));far.add(atm);
const mM=new T.MeshPhongMaterial({color:0x999999,shininess:2}),moon=new T.Mesh(new T.SphereGeometry(1737.4,192,96),mM);moon.rotation.x=Math.PI/2;far.add(moon);
const ld=(f,cb)=>L.load(TX+f,t=>{t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;cb(t);},undefined,()=>{});
let texOK=false;function loadTex(){if(texOK)return;texOK=true;const em=window.__earth&&__earth.moon;if(em&&em.material.map){mM.map=em.material.map;mM.color.set(0xffffff);mM.needsUpdate=true;}else ld('moon_1024.jpg',t=>{mM.map=t;mM.color.set(0xffffff);mM.needsUpdate=true;});
 ld('earth_atmos_4096.jpg',t=>{eM.map=t;eM.color.set(0xffffff);eM.needsUpdate=true;});}
{const n=isTouch?1500:3000,g=new T.BufferGeometry(),a=new Float32Array(n*3);for(let i=0;i<n;i++){const v=new T.Vector3().randomDirection().multiplyScalar(2.5e6);a.set([v.x,v.y,v.z],i*3);}g.setAttribute('position',new T.BufferAttribute(a,3));var stars=new T.Points(g,new T.PointsMaterial({color:0xffffff,size:Math.max(1.5,devicePixelRatio*1.1),sizeAttenuation:false,transparent:true,opacity:0.9}));far.add(stars);}
const pathG=new T.BufferGeometry();pathG.setAttribute('position',new T.BufferAttribute(new Float32Array(600*3),3));const path=new T.Line(pathG,new T.LineBasicMaterial({color:0x7dff9a,transparent:true,opacity:0.6}));path.frustumCulled=false;far.add(path);
// near-scene objects
let sv,pad,terr,lm,plumes={},debris=[],hl=null,dust=null,VAR='apollo',UPD=null,crew=[];const craft=new T.Group();near.add(craft);
function build(){if(sv)return;sv=MMOD.SaturnV();craft.add(sv);pad=MMOD.Pad();near.add(pad);
 const P5=sv.userData.P;plumes.f1=new T.Group();for(const p of [[0,0],[3.3,0],[-3.3,0],[0,3.3],[0,-3.3]]){const pl=MMOD.Plume(2.0,40,0xffa040);pl.position.set(p[0],-5.6,p[1]);plumes.f1.add(pl);}P5.sic.add(plumes.f1);
 plumes.j2=new T.Group();for(const p of [[0,0],[1.8,0],[-1.8,0],[0,1.8],[0,-1.8]]){const pl=MMOD.Plume(0.9,14,0x8fb8ff,false);pl.position.set(p[0],45,p[1]);plumes.j2.add(pl);}P5.sii.add(plumes.j2);
 plumes.sivb=MMOD.Plume(0.9,16,0x9fc0ff,false);plumes.sivb.position.y=64.3;P5.sivb.add(plumes.sivb);
 plumes.sps=MMOD.Plume(1.1,8,0xc8d8ff,false);plumes.sps.position.y=-2.9;P5.csm.add(plumes.sps);
 lm=P5.lm;plumes.dps=MMOD.Plume(0.7,7,0xd0dcff,false);plumes.dps.position.y=-0.3;lm.userData.ds.add(plumes.dps);plumes.aps=MMOD.Plume(0.35,4,0xd0dcff,false);plumes.aps.position.y=-0.3;lm.userData.as.add(plumes.aps);
 terr=MMOD.Terrain();terr.visible=false;near.add(terr);MFL.terrainH=MMOD.terrainH;}
const hud=document.createElement('div');hud.id='moonHud';hud.style.cssText='position:fixed;inset:0;pointer-events:none;display:none;z-index:6;font:500 12px/1.5 "SF Mono",ui-monospace,Menlo,monospace;color:#e8ffe8;text-shadow:0 1px 2px #000';
hud.innerHTML='<div id="mhP" style="position:absolute;top:calc(8px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);letter-spacing:3px;font-size:13px;color:#9dff8a"></div><div id="mhR" style="position:absolute;top:calc(10px + env(safe-area-inset-top));left:calc(12px + env(safe-area-inset-left));white-space:pre;border-left:2px solid #6c6;padding-left:8px"></div><div id="mhC" style="position:absolute;top:22%;left:50%;transform:translateX(-50%);font-size:15px;letter-spacing:2px;color:#fff"></div><div id="mhE" style="position:absolute;top:30%;left:50%;transform:translateX(-50%);font-size:13px;letter-spacing:2px;color:#cfe;opacity:0;transition:opacity .5s"></div>';document.body.appendChild(hud);
const $m=id=>document.getElementById(id);
const fmtT=s=>{s=Math.max(0,s);const h=s/3600|0,m=(s%3600)/60|0,x=s%60|0;return(h?h+':':'')+String(m).padStart(2,'0')+':'+String(x).padStart(2,'0');};
const km=v=>!isFinite(v)?'---':Math.abs(v)>=1e6?(v/1e3).toFixed(0)+' km':(v/1e3).toFixed(1)+' km';
let fireE=false,thrTouched=false,lastThr=0,evShown=0,evT=0,pathT=0;
// capture existing buttons while mission runs (no new buttons)
addEventListener('pointerdown',e=>{if(!on)return;const id=e.target&&e.target.id;if(id==='bFire'){fireE=true;e.stopImmediatePropagation();}else if(id==='bWpn'){view=(view+1)%3;e.stopImmediatePropagation();}else if(id==='bWarp'){warpU=warpU>=10?1:warpU*(warpU===1?4:2.5);e.stopImmediatePropagation();}},true);
addEventListener('keydown',e=>{if(on&&e.code==='Space')fireE=true;});
addEventListener('wheel',e=>{if(on)camD=Math.max(20,Math.min(5000,camD*(1+Math.sign(e.deltaY)*0.1)));},{passive:true});
let pd=0;addEventListener('touchmove',e=>{if(!on||e.touches.length!==2)return;const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pd)camD=Math.max(20,Math.min(5000,camD*pd/d));pd=d;},{passive:true});addEventListener('touchend',()=>pd=0);
function start(vr){build();loadTex();VAR=vr==='hls'?'hls':'apollo';F=VAR==='hls'?MHLS.create():MFL.create();UPD=VAR==='hls'?MHLS.update:MFL.update;if(VAR==='hls'&&!hl){hl=MMOD.HLS();craft.add(hl);dust=MMOD.Dust();near.add(dust);const H=hl.userData.hls;plumes.sh=MMOD.Plume(4.5,70,0xffb060);plumes.sh.position.y=-2;if(H.s1)H.s1.add(plumes.sh);plumes.rv=MMOD.Plume(1.6,14,0x9fb8ff,false);plumes.rv.position.y=70;H.s2.add(plumes.rv);plumes.lt=new T.Group();for(const q of H.lt){const pl=MMOD.Plume(0.25,5,0xd8e4ff,false);pl.position.copy(q);pl.rotation.z=0;plumes.lt.add(pl);}H.s2.add(plumes.lt);}if(hl){hl.visible=VAR==='hls';const H=hl.userData.hls;if(H.s1){H.s1.visible=true;if(H.s1.parent!==hl)hl.attach(H.s1);}H.elev.position.y=104.8;}sv.visible=VAR!=='hls';evShown=0;on=true;warpU=1;view=0;for(const d of debris)near.remove(d.o);debris=[];const P5=sv.userData.P;
 for(const k of ['sic','inter','sii','sivb','les','csm','lm'])P5[k].visible=true,P5[k].parent!==sv&&sv.attach(P5[k]);P5.sla.forEach(s=>{s.visible=true;if(s.parent!==sv)sv.attach(s);});
 $('menu').style.display='none';hud.style.display='block';for(const id of ['hud','bCtx','bYawL','bYawR','bCam','bGyro'])if($(id))$(id).style.display='none';if($('touch'))$('touch').style.display='';if($('bWarp'))$('bWarp').style.display='block';
 inp.throttle=0;window.__moon.F=F;}
function stop(){on=false;hud.style.display='none';if($('hud'))$('hud').style.display='';}
function drop(part){if(part==='sh'){const o=hl.userData.hls.s1;near.attach(o);debris.push({o,v:new T.Vector3(0,-8,0).applyQuaternion(craft.quaternion),sp:new T.Vector3(0.05,0,0.08),t:0,part});return;}const P5=sv.userData.P;const list=part==='sla'?P5.sla:[P5[part]];for(const o of list){near.attach(o);const dir=new T.Vector3(0,part==='les'?1:-1,0).applyQuaternion(craft.quaternion);
 const vel=dir.multiplyScalar(part==='les'?25:part==='sic'?-0:3);if(part==='sic')vel.copy(new T.Vector3(0,-6,0).applyQuaternion(craft.quaternion));if(part==='inter')vel.copy(new T.Vector3(0,-4,0).applyQuaternion(craft.quaternion));
 const sp=new T.Vector3((Math.random()-.5)*.15,(Math.random()-.5)*.05,(Math.random()-.5)*.15);debris.push({o,v:vel,sp,t:0,part});}}
const tmp=new T.Vector3(),q=new T.Quaternion(),Y=new T.Vector3(0,1,0);
function frame(rdt){if(!F)return;const a=$('menu');if(a&&a.style.display!=='none'&&a.style.display!==''){stop();return;}
 // input
 const k=window.keys||{};if(k.ShiftLeft)inp.throttle=Math.min(1,inp.throttle+rdt);if(k.ControlLeft)inp.throttle=Math.max(0,inp.throttle-rdt);
 const sx=(joy.x||0)+(k.ArrowRight?1:k.ArrowLeft?-1:0),sy=(joy.y||0)+(k.ArrowUp?1:k.ArrowDown?-1:0);
 if(Math.abs(inp.throttle-lastThr)>0.02&&!autoSet)thrTouched=true;
 const fe=fireE;fireE=false;
 const ph0=F.ph;
 // launch press sets throttle to 1 (fix for 'throttle starts at 0 on pad')
 if(F.ph==='pad'&&fe){inp.throttle=1;}
 const auto=window.__moon.autoAll||(!thrTouched&&['count','ascent','tli','loi','lascent','descent'].includes(F.ph)&&!(F.ph==='descent'&&Math.abs(sx)>0.3));
 const I={thr:inp.throttle,sx,sy,auto,fireEdge:fe,fireEdge2:fe&&F.ph!=='pad',manual:F.ph==='descent'&&(thrTouched||Math.abs(sx)>0.3),go:window.__moon.autoAll};
 if(F.ph==='descent'&&fe){thrTouched=false;}
 // warp
 const pr=P.primary(F.s);const el=P.elems(pr);let w=1;
 if(F.ph==='parking')w=F.tIgn-F.t>90?Math.min(100,(F.tIgn-F.t)/4):1;else if(F.ph==='coast'){const tt=F.cue==='LOI'?F.cueT:1e9;w=pr.b==='earth'?(pr.x*pr.x+pr.y*pr.y<4e15?60:4000):(tt>600?Math.min(2000,tt/5):Math.max(1,tt/10));}
 else if(F.ph==='lorbit')w=10;else if(F.ph==='descent')w=F.d&&F.d.hg>2500?5:1;else if(['tli','loi'].includes(F.ph))w=5;
 const wt=w*warpU*(window.__moon.warpX||1);_wt=wt;UPD(F,I,rdt*wt);
 if(auto){autoSet=true;inp.throttle=F.ph==='descent'&&F.d?F.d.thr:F.thrCmd||0;}else autoSet=false;lastThr=inp.throttle;
 if(F.ph==='parking'&&ph0!=='parking')thrTouched=false;if(['parking','coast','lorbit','landed'].includes(F.ph)&&auto===false&&F.eng===0){}
 // events
 while(evShown<F.events.length){const e=F.events[evShown++];if(e.k==='drop')drop(e.part);else{$m('mhE').textContent=e.txt;$m('mhE').style.opacity=1;evT=3;}if(e.k==='sla')drop('sla');}
 evT-=rdt;if(evT<0)$m('mhE').style.opacity=0;
 render(rdt,pr,el);}
let autoSet=false;
function render(rdt,pr,el){const s=F.s,P5=sv.userData.P,ph=F.ph;const inMoon=pr.b==='moon'||['descent','landed','crashed','lascent','lorbit2'].includes(ph)&&F.d;
 // craft absolute position (m) in Earth frame
 const mp=P.moonPos(F.s.t);let cx=s.x,cy=s.y,up=new T.Vector3(s.x,s.y,0).normalize(),dir;
 if(F.d&&['descent','landed','crashed','lascent','lorbit2'].includes(ph)){const d=F.d,th=d.th0+d.x/P.RM,r=P.RM+d.h;cx=mp[0]+r*Math.cos(th);cy=mp[1]+r*Math.sin(th);up.set(Math.cos(th),Math.sin(th),0);const e=new T.Vector3(-up.y,up.x,0);dir=e.clone().multiplyScalar(Math.cos(d.pitch)).add(up.clone().multiplyScalar(Math.sin(d.pitch)));if(ph==='landed'||ph==='crashed')dir=up.clone();}
 else if(ph==='flop'&&F.ds){const d=F.ds;const pa=F.padA+F.om*(F.s.t-(F.ev.liftoff||0));const pu=new T.Vector3(Math.cos(pa),Math.sin(pa),0),pe=new T.Vector3(-pu.y,pu.x,0);cx=P.RE*pu.x+pu.x*d.h+pe.x*d.x;cy=P.RE*pu.y+pu.y*d.h+pe.y*d.x;up.copy(pu);dir=(d.phase==='belly'||d.phase==='coast')?pe.clone().multiplyScalar(-1):pu.clone();}
 else if(['pad','count'].includes(ph)||ph==='ascent'||F.eng>0)dir=['pad','count'].includes(ph)?up.clone():new T.Vector3(F.thrDir[0],F.thrDir[1],0);else dir=new T.Vector3(pr.vx,pr.vy,0).normalize();
 q.setFromUnitVectors(Y,dir);craft.quaternion.slerp(q,Math.min(1,rdt*4));
 // stack visibility per phase
 const lmMode=!!F.d&&['descent','landed','crashed','lascent','lorbit2'].includes(ph);const R0x=i=>4.5+1.6+i*0.8;
 if(VAR==='apollo'){P5.csm.visible=!lmMode;if(lmMode){P5.lm.position.set(0,0,0);P5.lm.rotation.set(0,0,0);P5.lm.scale.setScalar(1);P5.lm.userData.ds.visible=ph!=='lascent'&&ph!=='lorbit2';}
 if(ph==='td'||ph==='coast'||ph==='loi'||ph==='lorbit'){const tt=F.ph==='td'?F.tdT:40;// transposition & docking: CSM pulls ahead, flips, docks to LM, extracts
  const c=P5.csm;if(tt<34){const k=Math.min(1,tt/8),f=Math.min(1,Math.max(0,(tt-8)/8)),b=Math.min(1,Math.max(0,(tt-16)/14));c.position.y=94.1+k*30-b*21.2;c.rotation.z=f*Math.PI;if(f>0.5)c.position.y+=(1-b)*0+0;
   if(tt>30){const e=(tt-30)/4;P5.lm.position.y=86+e*0;}}
  else{c.rotation.z=Math.PI;c.position.y=94.1+30-21.2;}
  if(ph!=='td'){c.position.y=104;c.rotation.z=Math.PI;P5.lm.position.y=96-9.9;}}}
 // plumes
 const th=F.eng;const pv=(p,on,s)=>{p.visible=on&&th>0;if(p.visible){p.scale.set(1,(0.6+0.4*th)*(s||1)*(0.95+Math.random()*0.1),1);}};
 const hAlt=pr.b==='earth'?Math.hypot(s.x,s.y)-P.RE:1e6,vac=Math.min(2.5,1+hAlt/40000);
 if(VAR==='apollo'){pv(plumes.f1,F.att.sic&&ph==='ascent'||ph==='count',vac);pv(plumes.j2,!F.att.sic&&F.att.sii&&F.engN>0,1.5);pv(plumes.sivb,!F.att.sii&&F.att.sivb&&F.engN>0,1.5);pv(plumes.sps,ph==='loi'&&F.engN>0,1);pv(plumes.dps,ph==='descent'&&F.engN>0,1);pv(plumes.aps,ph==='lascent'&&F.engN>0,1);}else{const H=hl.userData.hls;const lt=F.d&&F.d.lt&&ph==='descent';pv(plumes.sh,F.att.sh&&(ph==='ascent'||ph==='count'),vac);pv(plumes.rv,!F.att.sh&&F.engN>0&&!lt,1.3);pv(plumes.lt,lt&&F.engN>0,1);H.plasma.material.opacity=ph==='entry'?0.15+0.55*(F.heat||0):0;if(H.shield&&H.shield.material.emissive){const k=ph==='entry'?(F.heat||0):0;H.shield.material.emissive.setRGB(1.6*k,0.6*k,0.2*k);}
  if(ph==='landed'){F.elT=(F.elT||0)+rdt;H.elev.position.y=104.8-Math.min(1,F.elT/20)*35.6;if(F.elT>20&&!crew.length&&typeof PPL!=='undefined'&&PPL.make){try{for(let i=0;i<2;i++){const c=PPL.make(i?'crew':'owner');if(c){c.position.set(R0x(i),69.4,0);H.s2.add(c);crew.push(c);}}}catch(e){}}crew.forEach((c,i)=>{c.position.x+=rdt*1.0;});}
  dust.visible=ph==='descent'&&F.d&&F.d.hg<80&&F.engN>0;if(dust.visible){const a=dust.geometry.attributes.position.array;const gp=up.clone().multiplyScalar(-F.d.hg);const e2=new T.Vector3(-up.y,up.x,0),n2=new T.Vector3(0,0,1);dust.userData.v.forEach((v,i)=>{v[1]+=rdt*0.6;if(v[1]>1)v[1]-=1;const r=6+v[1]*90;const p=gp.clone().addScaledVector(e2,Math.cos(v[0])*r).addScaledVector(n2,Math.sin(v[0])*r).addScaledVector(up,v[1]*4);a[i*3]=p.x;a[i*3+1]=p.y;a[i*3+2]=p.z;});dust.geometry.attributes.position.needsUpdate=true;dust.material.opacity=0.6*(1-F.d.hg/80);}}
 // debris rel motion (no thrust => drifts back)
 const acc=F.eng>0&&F.thrDir?new T.Vector3(F.thrDir[0],F.thrDir[1],0).multiplyScalar(F.engN?15:0):new T.Vector3();
 for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.t+=rdt;d.v.addScaledVector(acc,-rdt*(F.ph==='ascent'?1:0));d.o.position.addScaledVector(d.v,rdt);d.o.rotation.x+=d.sp.x*rdt;d.o.rotation.z+=d.sp.z*rdt;if(d.t>40||(d.ph0&&d.ph0!==ph&&!(d.ph0==='td'&&ph==='coast'&&d.t<20))){d.o.visible=false;near.remove(d.o);debris.splice(i,1);}else if(!d.ph0)d.ph0=ph;}
 // pad / terrain placement
 const padA=F.padA+(F.launched?F.om*(F.s.t-(F.ev.liftoff||0)):0);
 const padP=new T.Vector3(P.RE*Math.cos(padA),P.RE*Math.sin(padA),0);const hPad=padP.distanceTo(new T.Vector3(cx,cy,0));
 pad.visible=pr.b==='earth'&&hPad<60000;if(pad.visible){pad.position.set(padP.x-cx,padP.y-cy,0);pad.quaternion.setFromUnitVectors(Y,padP.clone().normalize());}
 terr.visible=lmMode&&F.d.h<12000;pad.visible=pad.visible||ph==='flop';if(terr.visible){const d=F.d,ts=d.th0+d.xt/P.RM;const sp=new T.Vector3(mp[0]+P.RM*Math.cos(ts),mp[1]+P.RM*Math.sin(ts),0);terr.position.set(sp.x-cx,sp.y-cy,0);const n=new T.Vector3(Math.cos(ts),Math.sin(ts),0);const e=new T.Vector3(-n.y,n.x,0);const m=new T.Matrix4().makeBasis(e,n,new T.Vector3(0,0,1));terr.quaternion.setFromRotationMatrix(m);}
 // far scene (km, floating origin at craft)
 earth.position.set(-cx/1e3,-cy/1e3,0);atm.position.copy(earth.position);earth.rotation.y=P.wE*F.s.t;moon.position.set((mp[0]-cx)/1e3,(mp[1]-cy)/1e3,0);moon.rotation.y=Math.atan2(mp[1],mp[0])+Math.PI;
 earth.visible=atm.visible=!(pad.visible&&hPad<25000);moon.visible=!(terr.visible&&F.d.h<4000);
 let sd=sunDir;if(lmMode){const e3=new T.Vector3(-up.y,up.x,0);sd=up.clone().multiplyScalar(0.42).addScaledVector(e3,-0.8).add(new T.Vector3(0,0,0.42)).normalize();}sunF.position.copy(sd).multiplyScalar(1e5);sunN.position.copy(sd).multiplyScalar(500);sunN.target.position.set(0,0,0);
 const airy=pad.visible?Math.max(0,1-hPad/45000):0;near.background=null;far.background.setRGB(0.25*airy,0.45*airy,0.8*airy);hemi.intensity=0.15+0.6*airy;stars.visible=airy<0.3;
 // trajectory prediction (every 0.4 s)
 pathT-=rdt;if(pathT<0&&['parking','coast','lorbit','tli','loi','td'].includes(ph)){pathT=0.4;const t={...F.s};const arr=pathG.attributes.position.array;const per=pr.b==='earth'?Math.min(6*86400,2*Math.PI*Math.sqrt(Math.pow(Math.abs(el.a),3)/P.muE)*1.02):2*Math.PI*Math.sqrt(Math.pow(Math.abs(el.a)||2e6,3)/P.muM)*1.02;
  const tot=isFinite(per)&&per>0?per:4*86400,dt=tot/599;const rel=pr.b==='moon';for(let i=0;i<600;i++){let px=t.x,py=t.y;if(rel){const m=P.moonPos(t.t);const m0=P.moonPos(F.s.t);px=t.x-m[0]+m0[0];py=t.y-m[1]+m0[1];}arr[i*3]=(px-cx)/1e3;arr[i*3+1]=(py-cy)/1e3;arr[i*3+2]=0;let r=dt;while(r>0){const h=Math.min(r,P.maxDt(t));P.step(t,h);r-=h;}}
  pathG.attributes.position.needsUpdate=true;}path.visible=['parking','coast','lorbit','tli','loi','td'].includes(ph);
 // camera
 camYaw+=(joy.x||0)*rdt*1.2*(ph==='descent'?0:1);camPit=Math.max(-1.2,Math.min(1.4,camPit+(ph==='descent'||ph==='ascent'?0:(joy.y||0))*rdt));
 const D=lmMode?Math.min(camD,VAR==='hls'?140:60):['pad','count'].includes(ph)?Math.max(camD,180):camD;const e=new T.Vector3(-up.y,up.x,0),nrm=new T.Vector3(0,0,1);
 const look=new T.Vector3(0,VAR==='hls'?(F.att.sh?60:97):lmMode?2:(F.att.sic?55:F.att.sii?80:95),0).applyQuaternion(craft.quaternion);if(view===2)look.set(0,0,0);
 const off=e.clone().multiplyScalar(Math.cos(camYaw)*Math.cos(camPit)).add(nrm.clone().multiplyScalar(Math.sin(camYaw)*Math.cos(camPit))).add(up.clone().multiplyScalar(Math.sin(camPit)));
 ncam.position.copy(look).addScaledVector(off,view===1?D*4:D);if(['pad','count'].includes(ph)||F.met<20)ncam.position.addScaledVector(up,-30);ncam.up.copy(up);ncam.lookAt(look);
 if(lmMode&&terr.visible){const gh=F.d.hg;const lift=Math.max(0,-gh+3);ncam.position.addScaledVector(up,lift);}
 fcam.position.copy(ncam.position).multiplyScalar(1e-3);fcam.quaternion.copy(ncam.quaternion);
 const a=innerWidth/innerHeight;if(ncam.aspect!==a){ncam.aspect=fcam.aspect=a;ncam.updateProjectionMatrix();fcam.updateProjectionMatrix();}
 const sz=renderer.getDrawingBufferSize(_v2);if(!RT||RT.width!==sz.x||RT.height!==sz.y){if(RT)RT.dispose();RT=new T.WebGLRenderTarget(sz.x,sz.y,{samples:4,type:T.HalfFloatType});RT.texture.colorSpace=T.LinearSRGBColorSpace;BQ.material.uniforms.t.value=RT.texture;}
 renderer.setRenderTarget(RT);renderer.autoClear=false;renderer.clear();renderer.render(far,fcam);renderer.clearDepth();renderer.render(near,ncam);renderer.setRenderTarget(null);renderer.render(BS,BC);renderer.autoClear=true;
 // HUD (minimal)
 const P2={pad:'LC-39A',count:'COUNTDOWN',ascent:VAR==='hls'?(F.att.sh?'SUPER HEAVY':'STARSHIP'):F.att.sic?'S-IC':F.att.sii?'S-II':'S-IVB',parking:'EARTH ORBIT',tli:'TLI BURN',td:'TRANSPOSITION',coast:pr.b==='moon'?'LUNAR APPROACH':'TRANSLUNAR COAST',loi:'LOI BURN',lorbit:'LUNAR ORBIT',descent:'POWERED DESCENT',landed:'TRANQUILITY BASE',crashed:'MISSION LOST',lascent:'LM ASCENT',lorbit2:'LUNAR ORBIT',refuel:'PROPELLANT TRANSFER',nri:'NRHO INSERTION',nrho:'NRHO',tei:'TEI BURN',tcoast:'TRANS-EARTH COAST',entry:'LUNAR-RETURN ENTRY',flop:'BELLY-FLOP',done:'LANDED - EARTH'}[ph]||ph;
 $m('mhP').textContent=P2+(wt_()>1.5?'  ▸'+fmtT_w():'');
 if(ph==='flop'&&F.ds){$m('mhR').textContent=`ALT ${(F.ds.h/1e3).toFixed(1)} km\nV/S ${F.ds.vh.toFixed(0)}`;}else if(lmMode){const d=F.d;$m('mhR').textContent=`ALT ${d.hg>1000?(d.hg/1e3).toFixed(1)+' km':d.hg.toFixed(0)+' m'}\nH/S ${d.vx.toFixed(1)}\nV/S ${d.vh.toFixed(1)}\nFUEL ${VAR==='hls'?(F.pr.ship/1000).toFixed(0)+' t':(F.pr.ds/MFL.V.lm.dsProp*100).toFixed(0)+'%'}`;}
 else{const v=pr.b==='earth'&&!F.launched?0:el.v;$m('mhR').textContent=`ALT ${km(el.alt)}\nSPD ${(v/1e3).toFixed(2)} km/s\nAP  ${km(el.ap)}\nPE  ${km(el.pe)}`+(pr.b==='moon'?'\n◐ MOON':'');}
 let c='';if(ph==='pad')c='FIRE ▸ LAUNCH';else if(ph==='parking')c=`TLI ▸ ${fmtT(F.tIgn-F.t)}  Δv 3.15`;else if(ph==='tli')c=`Δv ${((F.cueDv||0)/1e3).toFixed(2)} km/s`;else if(ph==='coast'&&F.cue==='LOI')c=`LOI ▸ ${fmtT(F.cueT)}`;else if(ph==='coast')c=`MOON ▸ ${km(Math.hypot(s.x-mp[0],s.y-mp[1])-P.RM)}`;else if(ph==='lorbit')c='FIRE ▸ UNDOCK';else if(ph==='descent')c=F.d.mode==='auto'?'AUTO':'MANUAL';else if(ph==='landed')c=`${Math.abs(F.d.td.vh).toFixed(1)} m/s ▸ FIRE ASCENT`;else if(ph==='crashed')c='';
 $m('mhC').textContent=c;}
let RT=null;const _v2=new T.Vector2();const BS=new T.Scene(),BC=new T.OrthographicCamera(-1,1,1,-1,0,1);const BQ=new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({uniforms:{t:{value:null}},depthTest:false,depthWrite:false,vertexShader:'varying vec2 u;void main(){u=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:'uniform sampler2D t;varying vec2 u;void main(){vec3 c=texture2D(t,u).rgb;c=c/(1.0+c*0.15);c=pow(max(c,0.0),vec3(1.0/2.2));c+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5)/255.0;gl_FragColor=vec4(c,1.);}'}));BS.add(BQ);
let _wt=1;const wt_=()=>_wt,fmtT_w=()=>'×'+(_wt|0);
const api={sim(sec,ph){const I={thr:1,auto:true,go:true,sx:0,sy:0};let n=0;while(sec>0&&n++<200000){const d=Math.min(sec,['coast','tcoast'].includes(F.ph)?600:['parking','lorbit','nrho','lorbit2'].includes(F.ph)?20:0.5);UPD(F,I,d);sec-=d;if(ph&&ph.includes(F.ph))break;}return F.ph;},start,stop,get on(){return on;},frame,autoAll:false,warpX:1};window.__moon=api;
const _rf=renderFrame;renderFrame=function(sc,cam){if(on){const n=performance.now(),dt=Math.min(0.05,(n-(api._l||n))/1000);api._l=n;try{frame(dt||0.016);}catch(e){console.error(e);stop();}return;}_rf(sc,cam);};
if(/[?&#]moon\b/.test(location.search+location.hash))setTimeout(start,600);
return api;})();
