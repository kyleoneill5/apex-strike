// ---------- orbital scene ----------
const RKM=6371;
function earthTex(){const W=1024,H=512,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');const im=x.createImageData(W,H);
 for(let j=0;j<H;j++){const lat=(0.5-j/H)*Math.PI;for(let i=0;i<W;i++){const lon=i/W*Math.PI*2;const cx=Math.cos(lat)*Math.cos(lon),cy=Math.sin(lat),cz=Math.cos(lat)*Math.sin(lon);
  const n=vnoise(cx*2+5,cz*2+cy*1.3+7)*0.55+vnoise(cx*5+1,cy*5+cz*3)*0.3+vnoise(cx*13,cz*13+cy*9)*0.15;const k=(j*W+i)*4;let c;
  if(Math.abs(lat)>1.25)c=[235,240,245];else if(n>0.56){const d=vnoise(cx*9,cy*9+cz*7);c=Math.abs(lat)<0.4&&d>0.55?[200,180,120]:[60+d*50,110+d*30,50];}else{const s=n/0.56;c=[10+s*25,40+s*50,90+s*60];}
  im.data[k]=c[0];im.data[k+1]=c[1];im.data[k+2]=c[2];im.data[k+3]=255;}}x.putImageData(im,0,0);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;}
function cloudTex(){const W=512,H=256,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');const im=x.createImageData(W,H);
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){const n=vnoise(i/18,j/9)*0.6+vnoise(i/6,j/3)*0.4;const k=(j*W+i)*4;im.data[k]=im.data[k+1]=im.data[k+2]=255;im.data[k+3]=n>0.55?(n-0.55)*900:0;}x.putImageData(im,0,0);return new THREE.CanvasTexture(cv);}
oScene.add(new THREE.AmbientLight(0x404858,0.6));const oSun=new THREE.DirectionalLight(0xffffff,2.2);oSun.position.set(0.5,1,0.7);oScene.add(oSun);
const earth=new THREE.Group();oScene.add(earth);
earth.add(new THREE.Mesh(new THREE.SphereGeometry(RKM,isTouch?96:160,isTouch?64:100).rotateX(Math.PI/2),new THREE.MeshPhongMaterial({map:earthTex(),shininess:5,specular:0x050608})));
earth.add(new THREE.Mesh(new THREE.SphereGeometry(RKM+6,64,40).rotateX(Math.PI/2),new THREE.MeshLambertMaterial({map:cloudTex(),transparent:true,depthWrite:false})));
const atmo=new THREE.Mesh(new THREE.SphereGeometry(RKM+90,64,40),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false,
 vertexShader:`varying vec3 vN;varying vec3 vV;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`,fragmentShader:`varying vec3 vN;varying vec3 vV;
#include <common>
#include <logdepthbuf_pars_fragment>
void main(){
#include <logdepthbuf_fragment>
float i=pow(clamp(1.0+dot(vN,vV)*1.0,0.0,1.0),3.0);gl_FragColor=vec4(0.35,0.6,1.0,1.0)*i*0.9;}`}));oScene.add(atmo);
function circleLine(r,col,dash){const pts=[];for(let i=0;i<=256;i++){const a=i/256*Math.PI*2;pts.push(V3(Math.cos(a)*r,Math.sin(a)*r,0));}const g=new THREE.BufferGeometry().setFromPoints(pts);
 const l=new THREE.Line(g,dash?new THREE.LineDashedMaterial({color:col,dashSize:60,gapSize:40,transparent:true,opacity:0.7}):new THREE.LineBasicMaterial({color:col}));if(dash)l.computeLineDistances();return l;}
const karman=circleLine(RKM+100,0x44ddff,true);oScene.add(karman);
const orbitLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({length:361},()=>V3())),new THREE.LineBasicMaterial({color:0xffcc33}));orbitLine.frustumCulled=false;oScene.add(orbitLine);
const oStars=makeStars(150000,3000,1.8);oStars.material.opacity=1;oScene.add(oStars);
let oRocket=null;
const marker=new THREE.Points(new THREE.BufferGeometry().setFromPoints([V3()]),new THREE.PointsMaterial({color:0xff4444,size:8,sizeAttenuation:false,depthTest:false}));oScene.add(marker);
const debris=[];
function resetRocketVisual(){padRocket.visible=true;for(const r of [padRocket,oRocket]){r.userData.s1.visible=r.userData.s2.visible=r.userData.fair.visible=true;}padRocket.position.set(PAD.x,10,PAD.z);padRocket.rotation.set(0,0,0);
 for(const d of debris){d.sc.remove(d.mesh);}debris.length=0;}
function spawnDebris(part,os){const m=oRocket.userData[part].clone();const g=new THREE.Group();g.add(m);g.scale.setScalar(0.001);g.quaternion.copy(oRocket.quaternion);oScene.add(g);oRocket.userData[part].visible=false;padRocket.userData[part].visible=false;
 debris.push({mesh:g,sc:oScene,x:os.x,y:os.y,vx:os.vx-(part==='s1'?8:0)*Math.cos(0),vy:os.vy,t:0,q:oRocket.quaternion.clone(),spin:part==='fair'?0.3:0.05});}
function updDebris(dt){for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.t+=dt;const r=Math.hypot(d.x,d.y);const a=-OM.MU/(r*r*r);d.vx+=a*d.x*dt;d.vy+=a*d.y*dt;
 const h=r-OM.RE;if(h<150000){const rho=1.225*Math.exp(-h/8500);const k=Math.min(0.5,rho*Math.hypot(d.vx,d.vy)*0.0005*dt);d.vx*=1-k;d.vy*=1-k;}
 d.x+=d.vx*dt;d.y+=d.vy*dt;d.mesh.position.set(d.x/1000,d.y/1000,0);d.mesh.rotateZ(d.spin*dt);if(d.t>400||h<0){d.sc.remove(d.mesh);debris.splice(i,1);}}}
function updOrbitLine(os){const pos=orbitLine.geometry.attributes.position;const r=V3(os.x,os.y,0),v=V3(os.vx,os.vy,0);const rl=r.length(),v2=v.lengthSq();
 const ev=r.clone().multiplyScalar(v2-OM.MU/rl).sub(v.clone().multiplyScalar(r.dot(v))).divideScalar(OM.MU);const e=ev.length();const E=v2/2-OM.MU/rl;
 if(E>=0||!os.launched){orbitLine.visible=false;return;}orbitLine.visible=true;const a=-OM.MU/(2*E);const w=Math.atan2(ev.y,ev.x);const p=a*(1-e*e);
 for(let i=0;i<=360;i++){const nu=i/360*Math.PI*2;const rr=p/(1+e*Math.cos(nu))/1000;pos.setXYZ(i,Math.cos(nu+w)*rr,Math.sin(nu+w)*rr,0);}pos.needsUpdate=true;}
let rocketMsgQ=[];
function updRocket(v,dt){const os=v.os;
 if(!settings.advanced&&!os.launched){} 
 if(!os.auto){os.throttle=inp.throttle;os.cmdPitch=clamp(os.cmdPitch+inp.pitch*12*dt,-30,90);}
 const sim=dt*warp;const sub=os.engine||!os.launched?0.02:(os.h<100000?0.1:0.5);let n=Math.ceil(sim/sub);const hs=sim/n;n=Math.min(n,400);
 if(!rec.shipDS)for(let i=0;i<n;i++){OM.step(os,hs);while(os.events.length){const e=os.events.shift();rocketMsgQ.push(e);
  if(e.includes('SEPARATION')){if(!startBooster(v))spawnDebris('s1',os);shake=Math.max(shake,0.5);for(let k=0;k<30;k++)oFire.spawn(oRocket.position,rnd(0.05),rnd(0.05),rnd(0.05),0.6,0.02,0.05,1,0.8,0.5,1);}if(e==='FAIRING JETTISON'&&os.cfg.fairing)spawnDebris('fair',os);if(e==='ORBIT ACHIEVED'){warp=1;}}
  if(os.crashed)break;}
 if(warp>4&&(os.engine||os.retro))warp=1;
 if(os.retro&&os.peri<50000){os.retro=false;rocketMsgQ.push('DEORBIT BURN COMPLETE - coast to entry (use WARP)');}
 if(os.kind==='starship'&&!rec.shipDS&&os.stage===1&&os.orbit&&os.peri<100000&&os.h<120000&&os.vs<0)startShipDescent(v);
 updRecovery(v,sim);
 if(rocketMsgQ.length&&msgT<1.2){const e=rocketMsgQ.shift();msg(e+(e==='ORBIT ACHIEVED'?'\n🛰 Use WARP (T) to orbit the Earth':''),e==='ORBIT ACHIEVED'?6:2.5);}
 if(os.crashed&&v.alive){v.alive=false;v.crashT=5;msg('VEHICLE LOST - IMPACT',4);}
 updDebris(sim);
 // visuals
 const r=Math.hypot(os.x,os.y),ux=os.x/r,uy=os.y/r,ex=uy,ey=-ux,pr=os.pitch*Math.PI/180;const dx=Math.cos(pr)*ex+Math.sin(pr)*ux,dy=Math.cos(pr)*ey+Math.sin(pr)*uy;
 const thrOn=os.engine&&os.stages[os.stage].prop>0&&os.throttle>0;const h=os.h;
 // local
 const th=Math.atan2(os.x,os.y)-OM.OMEGA*os.t;const dr=th*OM.RE;padRocket.position.set(PAD.x+dr,10+Math.max(0,h),PAD.z);padRocket.rotation.set(0,0,-(Math.PI/2-pr));
 const dl=V3(Math.cos(pr),Math.sin(pr),0);const base=padRocket.position.clone().addScaledVector(dl,os.stage===0?-1:padRocket.userData.s2base-1);
 if(thrOn&&h<20000){const pl=1+h/3000;const big=player&&player.os&&player.os.kind==='starship'?2.2:1;for(let k=0;k<6;k++)fire.spawn(_t.copy(base).addScaledVector(dl,-k*4*big),rnd(3)-dl.x*80,-dl.y*80+rnd(3),rnd(3),0.3,6*pl*big,10*pl*big,1,0.85,0.6,1,0,0,1,0.5,0.2);
  if(Math.random()<0.6)smoke.spawn(_t.copy(base).addScaledVector(dl,-14),rnd(6)-dl.x*30,-dl.y*30,rnd(6),h<300?10:6,10,h<300?12:8,0.85,0.85,0.85,0.4,0.25,0);
  if(h<300)for(let k=0;k<2;k++){const a=Math.random()*6.28;smoke.spawn(_t.set(PAD.x+Math.cos(a)*10,12,PAD.z+Math.sin(a)*10),Math.cos(a)*70,6+Math.random()*12,Math.sin(a)*70,6,14,14,0.78,0.76,0.74,0.5,0.35,0);}}
 // orbit
 oRocket.position.set(os.x/1000,os.y/1000,0);oRocket.quaternion.setFromUnitVectors(V3(0,1,0),V3(dx,dy,0));marker.position.copy(oRocket.position);marker.visible=camMode===1;
 earth.rotation.z=-OM.OMEGA*os.t;
 if(thrOn&&h>8000){const vac=1-Math.exp(-h/8500);const bo=_t.set(os.x/1000,os.y/1000,0).addScaledVector(V3(dx,dy,0),os.stage===0?0:0.044);
  for(let k=0;k<3;k++)oFire.spawn(bo,(-dx*0.2+rnd(0.02*vac*3)),(-dy*0.2+rnd(0.02*vac*3)),rnd(0.02*vac*3),0.25+vac*0.3,0.006+vac*0.02,0.02+vac*0.12,1,0.75,0.45,0.9,0,0,0.6,0.5,1);}
 if(Math.random()<0.1)updOrbitLine(os);
 if(!os.launched){$('bCtx').textContent='LAUNCH';}}
function renderRocketCam(v,dt){const os=v.os;const h=os.h;const rp=oRocket.position;const u=V3(os.x,os.y,0).normalize();const pr=os.pitch*Math.PI/180;const e=V3(u.y,-u.x,0);
 const d=e.clone().multiplyScalar(Math.cos(pr)).addScaledVector(u,Math.sin(pr));
 if(camMode===1){oCam.position.set(rp.x*0.35,rp.y*0.35,26000);oCam.up.set(0,1,0);oCam.lookAt(rp.x*0.35,rp.y*0.35,0);}
 else{const dist=0.16+Math.min(0.5,h/1e6);oCam.position.copy(rp).addScaledVector(d,-dist*0.8).addScaledVector(u,dist*0.25).add(V3(0,0,dist*0.6));oCam.up.copy(u);oCam.lookAt(rp.clone().addScaledVector(d,0.03));}
 const k=sstep(15000,90000,h);oScene.background=(oScene.background||new THREE.Color()).setRGB(lerp(0.42,0,k),lerp(0.62,0,k),lerp(0.88,0.01,k));oStars.material.opacity=sstep(30000,90000,h);
 oStars.position.copy(oCam.position);}
