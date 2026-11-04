//GNUKEFX-BEGIN  photoreal detonation layer (wraps nukeDetonate/updNukes) + MOAB conventional blast + impact camera (hold -> smooth blend back).
const NFX=(()=>{const T=THREE;
// ---------- volumetric-looking fireball: fbm-displaced sphere, blackbody colour by temperature, limb darkening ----------
const FB_VS=`uniform float uT,uSeed;varying vec3 vN,vP;varying float vH;
float h(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n3(p);p*=2.03;a*=.5;}return s;}
void main(){vec3 p=position;float d=fbm(normalize(p)*3.0+vec3(0,-uT*0.35,uSeed));vH=d;p*=1.0+(d-.5)*0.38;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(p,1.);vP=mv.xyz;gl_Position=projectionMatrix*mv;}`;
const FB_FS=`uniform float uTemp,uAlpha,uSmoke;varying vec3 vN,vP;varying float vH;
vec3 bb(float t){ // approx blackbody 0..1 (800K..7000K)
 return clamp(vec3(1.0, smoothstep(0.05,0.65,t)*0.95+0.05*t, smoothstep(0.45,1.0,t)),0.,1.);}
void main(){float mu=abs(dot(normalize(vN),normalize(-vP)));float limb=pow(mu,0.45);
 float t=clamp(uTemp*(0.75+vH*0.6)*(0.55+0.45*limb),0.,1.);vec3 c=bb(t)*(0.4+3.2*t*t);
 vec3 smoke=vec3(0.23,0.2,0.18)*(0.6+0.5*vH);c=mix(c,smoke,clamp(uSmoke*(1.2-vH),0.,1.));
 gl_FragColor=vec4(c,uAlpha*(0.65+0.35*limb));}`;
function fireball(r,seed=Math.random()*10){const m=new T.ShaderMaterial({uniforms:{uT:{value:0},uSeed:{value:seed},uTemp:{value:1},uAlpha:{value:1},uSmoke:{value:0}},vertexShader:FB_VS,fragmentShader:FB_FS,transparent:true,depthWrite:false,fog:false});
 const s=new T.Mesh(new T.IcosahedronGeometry(1,5),m);s.scale.setScalar(r);s.frustumCulled=false;s.renderOrder=5;return s;}
function noCull(o){o.traverse(c=>{c.frustumCulled=false;if(c.material){c.material.fog=false;}});}
const FX=[];// live effects updated each frame (never culled, never removed on camera switch)
// ---------- NUCLEAR ----------
const _nd=nukeDetonate;nukeDetonate=function(p,...a){const gp=groundPoint(p);const r=_nd(gp,...a);const n=nukes[nukes.length-1];
 try{if(n){noCull(n.g);for(const ps of[n.sm,n.fi]){ps.pts.frustumCulled=false;if(ps.pts.material)ps.pts.material.fog=false;}
  const fb=fireball(30);fb.position.copy(gp);scene.add(fb);const fb2=fireball(30);fb2.position.copy(gp);scene.add(fb2);fb2.material.uniforms.uSeed.value+=3;
  const sky=new T.HemisphereLight(0xfff3dd,0x6a4a30,0);scene.add(sky);
  const skirt=new T.Mesh(new T.RingGeometry(0.55,1,96).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0xcbbba0,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide,fog:false}));skirt.position.copy(gp).setY(gp.y+30);skirt.frustumCulled=false;scene.add(skirt);
  FX.push({kind:'nuke',n,fb,fb2,sky,skirt,p:gp.clone(),t:0,life:90});
  if(camera.far<900000){camera.far=900000;camera.updateProjectionMatrix();}}
  // impact camera: replace the hard-cut blastCam with hold + blend (longer for nukes)
  if(blastCam){blastCam=null;}IC.start(gp,true);}catch(e){console.warn('nukefx',e);}return r;};
function updNuke(f,dt){const t=f.t,n=f.n;const fbR=t<2?650*Math.sqrt(t/2):650+t*6;const rise=t<2?fbR*0.7:Math.min(3400,fbR*0.7+(t-2)*170);
 // fireball: white (t<.3) -> yellow -> orange -> dull red; rises into the cap and gets swallowed by smoke
 const temp=t<0.25?1:Math.max(0,1-Math.pow((t-0.25)/9,0.6));const sm=Math.min(1,Math.max(0,(t-5)/14));
 for(const [fb,k] of [[f.fb,1],[f.fb2,0.82]]){const u=fb.material.uniforms;u.uT.value=t+k;u.uTemp.value=temp*k;u.uSmoke.value=sm;u.uAlpha.value=t<40?1:Math.max(0,1-(t-40)/30);
  const R=t<2.2?fbR*0.62*k:Math.min(950,fbR*0.6+Math.max(0,t-2)*30)*0.55*k;fb.scale.set(R,R*(t<2.2?1:0.62),R);fb.position.set(f.p.x,f.p.y+(t<2.2?fbR*0.6:rise),f.p.z);fb.rotation.y+=dt*0.05*k;}
 f.sky.intensity=t<0.15?14:Math.max(0,14*Math.exp(-(t-0.15)*1.6))+Math.max(0,1.2*(1-t/20));f.sky.color.setHSL(0.09-Math.min(0.08,t*0.01),1,0.75);
 const sr=Math.min(3500,180+t*240);f.skirt.scale.setScalar(sr);f.skirt.material.opacity=0.55*Math.min(1,t/1.5)*Math.max(0,1-t/45);}
// ---------- MOAB: conventional (no mushroom) ----------
function moabBlast(p0){const p=groundPoint(p0).add(new T.Vector3(0,4,0));
 const fb=fireball(10);fb.position.copy(p);scene.add(fb);const fb2=fireball(10);fb2.position.copy(p);fb2.material.uniforms.uSeed.value+=5;scene.add(fb2);
 const ring=new T.Mesh(new T.RingGeometry(0.8,1,96).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0xd8c8a8,transparent:true,opacity:0.7,depthWrite:false,side:T.DoubleSide,fog:false}));ring.position.copy(p);ring.frustumCulled=false;scene.add(ring);
 const shock=new T.Mesh(new T.SphereGeometry(1,40,16,0,Math.PI*2,0,Math.PI/2),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.2,depthWrite:false,side:T.DoubleSide,fog:false}));shock.position.copy(p);shock.frustumCulled=false;scene.add(shock);
 const pl=new T.PointLight(0xffc080,3e6,6000,2);pl.position.copy(p).setY(p.y+80);scene.add(pl);
 const cr=new T.Mesh(new T.CircleGeometry(150,48).rotateX(-Math.PI/2),new T.MeshStandardMaterial({color:0x2f2820,roughness:1,transparent:true,opacity:0.85,polygonOffset:true,polygonOffsetFactor:-4}));cr.position.copy(p).setY(p.y-3.7);scene.add(cr);
 explosion(p,6);
 FX.push({kind:'moab',fb,fb2,ring,shock,pl,p:p.clone(),t:0,life:70});
 msg('MOAB DETONATION  ~11 t TNT  |  blast radius ~1 km',3.5);
 const dc=camera.position.distanceTo(p);if(typeof shake!=='undefined')shake=Math.max(shake,3.2*Math.max(0.15,1-dc/8000));
 const fl=document.getElementById('flash');if(fl){fl.style.transition='none';fl.style.opacity=Math.max(0.15,0.6-dc/20000);requestAnimationFrame(()=>{fl.style.transition='opacity 1.2s';fl.style.opacity=0;});}
 if(typeof play3D==='function'){play3D('boom',p.clone(),2,0.42,5000);play3D('explosion',p.clone(),2,0.5,5000);play3D('debris',p.clone(),1.2,0.8,1500);}
 for(const t of targets){if(t.alive&&t.pos&&t.pos.distanceTo(p)<1100)killTarget(t,true);}
 if(typeof BLD!=='undefined'&&typeof damageBuilding==='function'){for(const b of BLD){const d=Math.hypot(b.x-p.x,b.z-p.z);if(d<900)damageBuilding(b,d<300?1:0.8*(1-d/900)+0.2,'moab');}}
 IC.start(p,false,5);}
function updMoab(f,dt){const t=f.t;const R=t<0.6?160*Math.sqrt(t/0.6):160+t*4;const temp=t<0.1?1:Math.max(0,1-Math.pow((t-0.1)/2.2,0.7));const sm=Math.min(1,Math.max(0,(t-0.8)/3));
 for(const [fb,k] of [[f.fb,1],[f.fb2,0.8]]){const u=fb.material.uniforms;u.uT.value=t*2+k;u.uTemp.value=temp*k;u.uSmoke.value=sm;u.uAlpha.value=t<6?1:Math.max(0,1-(t-6)/20);
  const r=R*k*(t<1?1:1+(t-1)*0.04);fb.scale.set(r,r*0.75,r);fb.position.set(f.p.x,f.p.y+r*0.35+Math.max(0,t-1)*9,f.p.z);}
 // ground-hugging dust shock, condensation dome, light falloff, smoke column (no mushroom)
 const rr=60+t*420;f.ring.scale.setScalar(Math.min(rr,2500));f.ring.material.opacity=0.65*Math.max(0,1-t/7);
 f.shock.scale.set(rr*0.9,rr*0.45,rr*0.9);f.shock.material.opacity=Math.max(0,0.22*(1-t/0.9));f.pl.intensity=Math.max(0,3e6*Math.exp(-t*2.5));
 if(t<6&&Math.random()<dt*40){const a=Math.random()*6.28;smoke.spawn(f.p,Math.cos(a)*(120+Math.random()*80),3+Math.random()*6,Math.sin(a)*(120+Math.random()*80),8,25,60,0.62,0.55,0.45,0.7,0.6,0.5);}
 if(t>0.5&&t<14&&Math.random()<dt*25)smoke.spawn(_t.copy(f.p).add(new T.Vector3(rnd(60),40+Math.random()*80,rnd(60))),rnd(10),18+Math.random()*16,rnd(10),18,40,90,0.24,0.22,0.2,0.85,0.02,0.2);}
// ---------- small-yield tactical nuke (game-only HIMARS option): scaled fireball, small mushroom, shock ring ----------
function smallNuke(p0){const p=groundPoint(p0);const fb=fireball(20);fb.position.copy(p);scene.add(fb);const fb2=fireball(20);fb2.position.copy(p);fb2.material.uniforms.uSeed.value+=7;scene.add(fb2);
 const ring=new T.Mesh(new T.RingGeometry(0.9,1,96).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0xeef2ff,transparent:true,opacity:0.6,depthWrite:false,side:T.DoubleSide,fog:false}));ring.position.copy(p).setY(p.y+3);ring.frustumCulled=false;scene.add(ring);
 const sky=new T.HemisphereLight(0xfff3dd,0x6a4a30,0);scene.add(sky);
 FX.push({kind:'small',fb,fb2,ring,sky,p:p.clone(),t:0,life:60});msg('☢ TACTICAL NUCLEAR DETONATION (~0.3 kt)',3.5);
 const dc=camera.position.distanceTo(p);const fl=document.getElementById('flash');if(fl){fl.style.transition='none';fl.style.opacity=Math.max(0.25,0.9-dc/30000);requestAnimationFrame(()=>{fl.style.transition='opacity 2s';fl.style.opacity=0;});}
 if(typeof shake!=='undefined')shake=Math.max(shake,3*Math.max(0.15,1-dc/12000));
 if(typeof play3D==='function'){play3D('nuke',p.clone(),1.4,1.0,4000);play3D('boom',p.clone(),1.8,0.5,4000);}
 for(const t of targets){if(t.alive&&t.pos&&t.pos.distanceTo(p)<700)killTarget(t,true);}
 if(typeof BLD!=='undefined'&&typeof damageBuilding==='function'){for(const b of BLD){const d=Math.hypot(b.x-p.x,b.z-p.z);if(d<600)damageBuilding(b,d<220?1:0.9*(1-d/600)+0.1,'nuke');}}
 IC.start(p,true,5);}
function updSmall(f,dt){const t=f.t;const fbR=t<1.2?160*Math.sqrt(t/1.2):160+t*2;const rise=t<1.2?fbR*0.6:Math.min(900,fbR*0.6+(t-1.2)*45);
 const temp=t<0.15?1:Math.max(0,1-Math.pow((t-0.15)/6,0.6));const sm=Math.min(1,Math.max(0,(t-3)/9));
 for(const [fb,k] of [[f.fb,1],[f.fb2,0.8]]){const u=fb.material.uniforms;u.uT.value=t+k;u.uTemp.value=temp*k;u.uSmoke.value=sm;u.uAlpha.value=t<30?1:Math.max(0,1-(t-30)/25);
  const R=(t<1.2?fbR*0.62:Math.min(260,fbR*0.6+(t-1.2)*8))*k;fb.scale.set(R,R*(t<1.2?1:0.6),R);fb.position.set(f.p.x,f.p.y+(t<1.2?fbR*0.55:rise),f.p.z);}
 // stem + toroidal cap from smoke particles; ground skirt
 if(t>1&&t<20&&Math.random()<dt*30){const a=Math.random()*6.28;smoke.spawn(_t.copy(f.p).add(new T.Vector3(rnd(25),rise*Math.random(),rnd(25))),rnd(4),10,rnd(4),12,30,60,0.5,0.44,0.38,0.8,0.02,0.2);
  smoke.spawn(_t.copy(f.p).add(new T.Vector3(Math.cos(a)*120,rise+rnd(30),Math.sin(a)*120)),Math.cos(a)*12,6,Math.sin(a)*12,18,50,110,0.55,0.48,0.42,0.85,0.02,0.2);}
 if(t<5&&Math.random()<dt*35){const a=Math.random()*6.28;smoke.spawn(f.p,Math.cos(a)*(140+Math.random()*90),4,Math.sin(a)*(140+Math.random()*90),8,25,55,0.62,0.55,0.45,0.7,0.6,0.5);}
 const rr=40+t*520;f.ring.scale.setScalar(Math.min(rr,4000));f.ring.material.opacity=0.6*Math.max(0,1-t/6);
 f.sky.intensity=t<0.12?8:Math.max(0,8*Math.exp(-(t-0.12)*2));}
// ---------- impact camera: hold on the exact impact point, then blend back to the jet ----------
const IC={a:null,start(p,nuke,hold){this.a={p:p.clone(),t:0,hold:hold||(nuke?6:3.2),blend:1.6,nuke,from:camera.position.clone(),q0:null};}};
function groundPoint(p){const g=groundAt(p.x,p.z);const h=Math.max(g.h,g.type==='water'?0:g.h);return new T.Vector3(p.x,Math.abs(p.y-h)<400?h:p.y,p.z);}
const _lp=new T.Vector3(),_q=new T.Quaternion(),_tq=new T.Quaternion();
const _uc=updCamera;updCamera=function(dt){_uc(dt);const a=IC.a;if(!a)return;if(camFollow&&!camFollow.done){IC.a=null;return;}
 a.t+=dt;const S=a.nuke?9000:350;const dir=_lp.set(a.from.x-a.p.x,0,a.from.z-a.p.z);if(dir.lengthSq()<1)dir.set(1,0,1);dir.normalize();
 const hp=new T.Vector3().copy(a.p).addScaledVector(dir,S).setY(a.p.y+(a.nuke?900:120));const look=new T.Vector3(a.p.x,a.p.y+(a.nuke?1600:60),a.p.z);
 const m=new T.Matrix4().lookAt(hp,look,new T.Vector3(0,1,0));_tq.setFromRotationMatrix(m);
 if(a.t<a.hold){camera.position.copy(hp);camera.quaternion.copy(_tq);}
 else{const k=Math.min(1,(a.t-a.hold)/a.blend),e=k*k*(3-2*k);// smoothstep blend from hold pose to the live chase pose computed by the game
  const gp=camera.position.clone(),gq=camera.quaternion.clone();camera.position.copy(hp).lerp(gp,e);camera.quaternion.copy(_tq).slerp(gq,e);if(k>=1)IC.a=null;}};
// detect end of any player-guided projectile (missile, hyper, torpedo, ballistic RV, rods, moab) followed by the camera
let lastF=null,lastPos=new T.Vector3(),lastType='';
const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);
 try{if(camFollow&&camFollow.pos){lastF=camFollow;lastPos.copy(camFollow.pos);lastType=camFollow.type;}
  else if(lastF){if(!IC.a&&player&&lastF.owner===player&&lastType!=='ballistic'){IC.start(groundPoint(lastPos),false);}lastF=null;}
  for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.t+=dt;if(f.kind==='nuke')updNuke(f,dt);else if(f.kind==='small')updSmall(f,dt);else updMoab(f,dt);
   if(f.t>f.life){for(const k of['fb','fb2','sky','skirt','ring','shock','pl']){const o=f[k];if(o){scene.remove(o);o.geometry&&o.geometry.dispose();}}FX.splice(i,1);}}}catch(e){console.warn('nukefx',e);}};
return {fireball,moabBlast,smallNuke,IC,FX};})();
window.NFX=NFX;window.MOAB_BLAST=NFX.moabBlast;
//GNUKEFX-END
