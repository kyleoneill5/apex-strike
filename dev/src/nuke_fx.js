//NUKEFX2-BEGIN  (owner: nuke) ultra-realistic nuclear detonation VISUALS. Wraps nukeDetonate AFTER gnukefx.js; damage logic in g4 updNukes untouched.
// Refs: Trinity, Ivy Mike, Castle Bravo, Upshot-Knothole Grable, Crossroads Baker, Starfish Prime (refs/nuke/sources.txt).
const NUKE2=(()=>{const T=THREE;const TOUCH=(typeof isTouch!=='undefined'&&isTouch);
const NV=`float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n3(p);p*=2.07;a*=.5;}return s;}`;
const NOISE=NV+`
float dith(){return (fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5)/160.0;}
vec3 bb(float t){return vec3(smoothstep(0.0,0.32,t),smoothstep(0.18,0.72,t)*0.92,smoothstep(0.55,1.0,t)*0.86)*(0.25+3.4*t*t);}`;
// ---- fireball: fragment-noise roiling surface, blackbody cooling, soot patches, limb darkening, dithered ----
const FBV=`varying vec3 vO,vN,vV;uniform float uT;
${NV}
void main(){vec3 p=position;vec3 nr=normalize(p);float d=fbm(nr*2.4+vec3(0.,-uT*0.35,uT*0.07))+0.55*fbm(nr*6.5+vec3(uT*0.2,-uT*0.5,0.));p*=1.0+(d-.75)*0.42;vO=position;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(p,1.);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}`;
const FBF=`uniform float uT,uTemp,uSoot,uA;varying vec3 vO,vN,vV;
${NOISE}
void main(){float mu=abs(dot(normalize(vN),normalize(vV)));vec3 q=vO*3.2+vec3(0.,-uT*0.7,uT*0.2);float n=fbm(q+1.7*fbm(q*1.3+uT*0.15));float n2=fbm(vO*8.0-vec3(uT*0.4));float cl=1.-abs(2.*n2-1.);
 float t=clamp(uTemp*(0.5+0.6*n+0.25*cl)*(0.55+0.45*pow(mu,0.6))+0.35*uTemp*pow(mu,3.),0.,1.);vec3 c=bb(t)*(1.25+0.5*cl);
 float soot=clamp(smoothstep(0.38,0.18,n)*0.75*(0.4+0.6*uTemp)+smoothstep(0.35,0.75,uSoot+(0.5-n)*0.9),0.,1.);c=mix(c,vec3(0.12,0.05,0.02)*(0.4+n2)+bb(t*0.45)*0.5,soot);
 gl_FragColor=vec4(c+dith(),uA*smoothstep(0.0,0.25,mu+0.15));}`;
function fireball(){const m=new T.ShaderMaterial({uniforms:{uT:{value:0},uTemp:{value:1},uSoot:{value:0},uA:{value:1}},vertexShader:FBV,fragmentShader:FBF,transparent:true,depthWrite:false,fog:false});
 const s=new T.Mesh(new T.IcosahedronGeometry(1,TOUCH?4:5),m);s.frustumCulled=false;s.renderOrder=8;return s;}
// ---- instanced billboard puffs: procedural fbm smoke, fake-sphere sun lighting (sunlit tops, shadowed undersides), internal heat glow ----
const PV=`attribute vec4 iA;attribute vec4 iB;attribute vec2 iC;uniform vec3 uSunV;varying vec2 vU;varying vec4 vB;varying vec2 vC;varying float vL;
void main(){vec4 mv=viewMatrix*vec4(iA.xyz,1.);mv.xy+=position.xy*iA.w;vU=position.xy;vB=iB;vC=iC;vL=0.;gl_Position=projectionMatrix*mv;}`;
const PF=`uniform vec3 uSunV;uniform float uT;varying vec2 vU;varying vec4 vB;varying vec2 vC;
${NOISE}
void main(){float r2=dot(vU,vU);if(r2>1.)discard;float seed=vC.y*37.0;
 float n=fbm(vec3(vU*1.7,seed)+vec3(0.,uT*0.04,0.));float n3b=fbm(vec3(vU*4.3,seed+uT*0.08));float d=smoothstep(1.0,0.2,r2+(n-0.5)*1.1+(n3b-0.5)*0.45);if(d<0.01)discard;
 vec3 nn=normalize(vec3(vU+(n-0.5)*0.6,sqrt(max(0.,1.-r2))));float lit=clamp(dot(nn,uSunV)*0.6+0.45,0.,1.);
 float under=smoothstep(0.3,-0.8,vU.y);vec3 c=vB.rgb*(0.28+0.95*lit)*(1.0-0.35*under*(1.-vC.x));
 float pk=smoothstep(0.42,0.22,n3b);c+=bb(clamp(vC.x*(0.5+0.7*n),0.,1.))*vC.x*1.5*(1.-0.75*pk);c*=1.-0.55*pk*vC.x;gl_FragColor=vec4(c+dith(),d*vB.a);}`;
function puffs(N){const g=new T.InstancedBufferGeometry();const pl=new T.PlaneGeometry(2,2);g.index=pl.index;g.setAttribute('position',pl.getAttribute('position'));
 const A=new Float32Array(N*4),B=new Float32Array(N*4),C=new Float32Array(N*2);
 g.setAttribute('iA',new T.InstancedBufferAttribute(A,4));g.setAttribute('iB',new T.InstancedBufferAttribute(B,4));g.setAttribute('iC',new T.InstancedBufferAttribute(C,2));g.instanceCount=N;
 const m=new T.ShaderMaterial({uniforms:{uSunV:{value:new T.Vector3(0,1,0)},uT:{value:0}},vertexShader:PV,fragmentShader:PF,transparent:true,depthWrite:false,fog:false});
 const me=new T.Mesh(g,m);me.frustumCulled=false;me.renderOrder=7;me.onBeforeRender=(r,s,cam)=>{const sd=(typeof sun!=='undefined'&&sun)?sun.position.clone().normalize():new T.Vector3(0.4,0.8,0.3);m.uniforms.uSunV.value.copy(sd.transformDirection(cam.matrixWorldInverse));};
 return {me,A,B,C,g,N};}
// ---- shells (Wilson cloud / shock dome / space flash), aurora curtains, scorch decal ----
const SHF=`uniform vec3 uCol;uniform float uA,uT;varying vec3 vO,vN,vV;
${NOISE}
void main(){float mu=abs(dot(normalize(vN),normalize(vV)));float n=fbm(vO*4.0+uT*0.2);float rim=pow(1.0-mu,1.6);gl_FragColor=vec4(uCol*(0.8+0.3*n)+dith(),uA*(0.25+rim)*(0.55+0.7*n));}`;
function shell(col,half){const m=new T.ShaderMaterial({uniforms:{uCol:{value:new T.Color(col)},uA:{value:0},uT:{value:0},uTemp:{value:0}},vertexShader:`varying vec3 vO,vN,vV;void main(){vO=position;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}`,fragmentShader:SHF,transparent:true,depthWrite:false,side:T.DoubleSide,fog:false});
 const s=new T.Mesh(new T.SphereGeometry(1,48,half?16:24,0,Math.PI*2,0,half?Math.PI/2:Math.PI),m);s.frustumCulled=false;s.renderOrder=8;return s;}
function aurora(){const g=new T.PlaneGeometry(1,1,48,1);const m=new T.ShaderMaterial({uniforms:{uA:{value:0},uT:{value:0}},vertexShader:`varying vec2 vU;uniform float uT;void main(){vU=uv;vec3 p=position;p.z+=sin(uv.x*9.+uT*0.3)*0.06+sin(uv.x*23.-uT*0.5)*0.02;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
 fragmentShader:`uniform float uA,uT;varying vec2 vU;${NOISE}void main(){float s=fbm(vec3(vU.x*40.,uT*0.15,0.))*fbm(vec3(vU.x*9.,1.,uT*0.05));float v=vU.y;vec3 c=mix(vec3(0.15,1.0,0.45),vec3(1.0,0.15,0.35),smoothstep(0.35,0.95,v));
 float a=uA*s*smoothstep(0.0,0.12,v)*smoothstep(1.0,0.5,v)*smoothstep(0.,0.1,vU.x)*smoothstep(1.,0.9,vU.x);gl_FragColor=vec4(c*1.6+dith(),a);}`,transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,fog:false});
 const me=new T.Mesh(g,m);me.frustumCulled=false;return me;}
function scorch(){const m=new T.ShaderMaterial({uniforms:{uA:{value:0},uT:{value:0}},vertexShader:`varying vec2 vU;void main(){vU=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float uA,uT;varying vec2 vU;${NOISE}void main(){float r=length(vU);float n=fbm(vec3(vU*6.,1.));float a=smoothstep(1.0,0.2,r+(n-0.5)*0.5);vec3 c=mix(vec3(0.05,0.04,0.035),vec3(0.28,0.2,0.13),smoothstep(0.1,0.9,r+n*0.3));
 float ember=smoothstep(0.6,0.0,r)*max(0.,1.-uT/25.)*step(0.62,n);c+=vec3(1.,0.35,0.05)*ember*1.5;gl_FragColor=vec4(c+dith(),a*uA*0.92);}`,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,fog:false});
 const me=new T.Mesh(new T.PlaneGeometry(2,2).rotateX(-Math.PI/2),m);me.renderOrder=2;return me;}
// ---- screen flash (double flash) + EMP HUD flicker ----
const st=document.createElement('style');st.textContent='#nukeFlash{position:fixed;inset:0;pointer-events:none;z-index:60;opacity:0;background:radial-gradient(circle at 50% 45%,#fff 0%,#fffbe8 45%,#ffe9c4 100%)}#nukeEmp{position:fixed;inset:0;pointer-events:none;z-index:59;opacity:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.12) 0 2px,rgba(0,0,0,.18) 2px 4px)}body.nukeEMP>*:not(canvas):not(#nukeFlash):not(#nukeEmp){opacity:.18!important;filter:contrast(1.8) hue-rotate(80deg)}';document.head.appendChild(st);
st.textContent+='#nukeSky,#nukeHalo{position:fixed;inset:0;pointer-events:none;z-index:58;opacity:0;mix-blend-mode:multiply}#nukeHalo{mix-blend-mode:screen}';const SK=document.createElement('div');SK.id='nukeSky';document.body.appendChild(SK);const HA=document.createElement('div');HA.id='nukeHalo';document.body.appendChild(HA);const _sp=new T.Vector3();
const FL=document.createElement('div');FL.id='nukeFlash';document.body.appendChild(FL);const EM=document.createElement('div');EM.id='nukeEmp';document.body.appendChild(EM);
function flashCurve(t){// thermal pulse: sharp first maximum (~ms), minimum, broad second maximum (Glasstone fig 2.10), compressed for play
 return t<0.05?1:t<0.16?Math.max(0.35,1-(t-0.05)*6):t<0.4?0.35+(t-0.16)*2.7:Math.max(0,1-(t-0.4)/2.6);}
let NUKE2_CAM=null;{const _ob=scene.onBeforeRender;scene.onBeforeRender=function(r,sc,cam,...x){if(NUKE2_CAM&&cam===camera){camera.position.set(...NUKE2_CAM[0]);camera.lookAt(...NUKE2_CAM[1]);camera.updateMatrixWorld();}if(cam===camera)try{sky();}catch(_){}if(_ob)return _ob.call(this,r,sc,cam,...x);};}const L=[];const _v=new T.Vector3();
function variantOf(p){if(p.y>60000)return 'space';const g=groundAt(p.x,p.z);const h=Math.max(g.h,0);if(p.y-h>400)return 'air';return g.type==='water'?'ocean':'ground';}
function make(p,variant,k){const N=TOUCH?320:520;const P=puffs(N);scene.add(P.me);const fb=fireball();scene.add(fb);
 const e={p:p.clone(),v:variant,k,t:0,N,P,fb,life:variant==='space'?70:150,boomed:false,Q:[]};
 const gh=Math.max(groundAt(p.x,p.z).h,0);e.gh=gh;
 // particle roles (budgeted)
 for(let i=0;i<N;i++){const r=Math.random();let ty;
  if(variant==='space')ty='deb';else if(variant==='ocean')ty=r<0.3?'col':r<0.6?'cap':r<0.9?'surge':'stem';
  else ty=r<0.46?'cap':r<0.66?'stem':r<0.86?'dust':r<0.92?'pile':'fire';
  e.Q.push({ty,u:Math.random()*6.283,v:Math.random()*6.283,j:Math.random(),q:Math.random(),s:Math.random()});}
 if(variant!=='space'){e.wil=shell(0xf4f6fa,variant!=='air');e.wil.position.copy(p);scene.add(e.wil);
  e.dome=shell(0xffffff,variant!=='air');e.dome.position.copy(p);scene.add(e.dome);}
 if(variant==='ground'||variant==='air'){e.sc=scorch();e.sc.position.set(p.x,gh+2,p.z);scene.add(e.sc);}
 if(variant==='space'){e.au=[];for(let i=0;i<5;i++){const a=aurora();const ang=i*1.25+Math.random()*0.4;a.position.set(p.x+Math.cos(ang)*30000*k,p.y-20000,p.z+Math.sin(ang)*30000*k);a.scale.set(60000*k,40000,1);a.lookAt(p.x,a.position.y,p.z);scene.add(a);e.au.push(a);}}
 e.light=new T.PointLight(0xfff0d8,0,200000*k,1.6);e.light.position.copy(p).setY(p.y+500);scene.add(e.light);
 L.push(e);return e;}
function upd(e,dt){e.t+=dt;const t=e.t,k=e.k,p=e.p,V=e.v,P=e.P;const dc=camera.position.distanceTo(p);
 // 1. flash + bloom-light
 const fc=flashCurve(t);FL.style.opacity=(fc*Math.max(0.25,1-dc/(V==='space'?400000:70000))).toFixed(3);e.light.intensity=fc*(V==='space'?3e7:6e7)*k;
 // 1b. blood-red sky + halo (screen-space, cheap): centered on projected fireball
 if(V!=='space'){e.ga=Math.min(1,t/0.3)*Math.max(0,1-Math.pow(Math.max(0,t-6)/40,0.8))*Math.max(0.2,1-dc/90000);e.skyOn=e.ga>0;}
}
function sky(){const e=L.find(x=>x.ga>0&&x.v!=='space');if(!e)return;{_sp.copy(e.fb.position).project(camera);const vis=_sp.z<1;const sx=(_sp.x*0.5+0.5)*100,sy=(0.5-_sp.y*0.5)*100;const ga=e.ga*(vis?1:0.35);
  const at=`circle at ${sx.toFixed(1)}% ${sy.toFixed(1)}%`;SK.style.background=`radial-gradient(${at},#fff 0,#fff 9%,#ffb070 26%,#d84020 44%,#8a1606 70%,#500804 100%)`;SK.style.opacity=(ga*0.92).toFixed(3);HA.style.background=`radial-gradient(${at},rgba(255,235,190,.5) 0,rgba(255,170,60,.38) 8%,rgba(255,80,20,.22) 20%,rgba(200,30,5,0) 42%)`;HA.style.opacity=ga.toFixed(3);}}
function upd2(e,dt){const t=e.t,k=e.k,p=e.p,V=e.v,P=e.P;const dc=camera.position.distanceTo(p);
 // 7. EMP flicker on HUD (stronger for high-altitude)
 const empT=V==='space'?6:2.5;if(t<empT){const on=Math.random()<0.55*(1-t/empT);document.body.classList.toggle('nukeEMP',on);EM.style.opacity=on?0.7:0.15;}else if(e.empOn!==false){document.body.classList.remove('nukeEMP');EM.style.opacity=0;e.empOn=false;}
 // 3. delayed shake/boom by distance (sound compressed x4 for gameplay)
 if(!e.boomed&&t>dc/(343*4)){e.boomed=true;if(V!=='space'){if(typeof shake!=='undefined')shake=Math.max(shake,4.5*Math.max(0.15,1-dc/40000));if(typeof play3D==='function')try{play3D('boom',_v.copy(camera.position),2.5,0.35,60);play3D('explosion',_v.copy(camera.position),2,0.45,60);}catch(_){}}}
 // 2. fireball
 const Rf=(V==='space'?9000:V==='ocean'?420:650)*k;const grow=t<2.2?Math.pow(t/2.2,0.4):1;
 const temp=t<0.2?1:Math.max(0,1-Math.pow((t-0.2)/(V==='space'?3:V==='ocean'?10:26),0.6));
 const rise=V==='space'?0:t<2.2?0:Math.min(5200*k,4800*k*(1-Math.exp(-(t-2.2)/22)))*(V==='ocean'?0.55:1);
 const capY=(V==='air'?p.y-e.gh:0)+Rf*0.62+rise;// cap height above ground
 const fu=e.fb.material.uniforms;fu.uT.value=t;fu.uTemp.value=temp;fu.uSoot.value=Math.min(1,Math.max(0,(t-3)/12));
 fu.uA.value=V==='space'?Math.max(0,1-t/5):V==='ocean'?(t<45?1:Math.max(0,1-(t-45)/20)):(t<18?1:Math.max(0,1-(t-18)/10));const R=Rf*grow*(V==='space'?1+t*0.6:1);
 e.fb.scale.set(R,R*(t<2.2?1:0.72),R);e.fb.position.set(p.x,V==='space'||V==='air'?p.y+(V==='air'?rise:0):e.gh+(t<2.2?R*0.55:capY),p.z);if(V!=='space'&&t>2.2)e.fb.scale.multiplyScalar(Math.max(0.5,1-(t-2.2)/55));
 // 3. Wilson condensation cloud + shock dome
 if(e.wil){const sr=Math.min(t*1700,9000)*k;e.dome.scale.set(sr,sr*(V==='air'?1:0.6),sr);e.dome.material.uniforms.uA.value=Math.max(0,0.16*(1-t/2.5));e.dome.material.uniforms.uT.value=t;
  const wa=(V==='ocean'?0.85:V==='air'?0.5:0.25)*Math.min(1,Math.max(0,(t-0.5)/0.6))*Math.max(0,1-(t-1)/4);const wr=(1200+t*500)*k;e.wil.scale.set(wr,wr*(V==='air'?1:0.75),wr);e.wil.material.uniforms.uA.value=wa;e.wil.material.uniforms.uT.value=t;e.wil.visible=wa>0.002;e.dome.visible=t<2.5;}
 if(e.sc){const r=Math.min(1,t/1.5)*2600*k*(V==='air'?0.8:1);e.sc.scale.setScalar(r);e.sc.material.uniforms.uA.value=Math.min(1,t/1.5)*(t<e.life-20?1:Math.max(0,(e.life-t)/20));e.sc.material.uniforms.uT.value=t;}
 if(e.au)for(const a of e.au){a.material.uniforms.uA.value=Math.min(1,Math.max(0,(t-1.5)/4))*Math.max(0,1-(t-30)/40)*0.9;a.material.uniforms.uT.value=t;}
 // 4/5. mushroom: toroidal cap, stem, dust skirt, pileus/ice cap, fires, ocean column + base surge
 const fade=t<e.life-30?1:Math.max(0,(e.life-t)/30);const capR=Math.min(2600*k,Rf*0.8+Math.max(0,t-2)*55*k);const tube=capR*0.55;const stemR=Math.min(480*k,140*k+t*14*k);const dark=Math.min(1,Math.max(0,(t-3)/16));const heat=Math.max(0,temp*1.1-0.05);
 const sunW=(typeof sun!=='undefined'&&sun)?sun.position.clone().normalize():_v.set(0.4,0.8,0.3);
 const A=P.A,B=P.B,C=P.C,gy=e.gh;
 for(let i=0;i<e.N;i++){const q=e.Q[i];let x=0,y=0,z=0,s=1,cr=0.5,cg=0.48,cb=0.45,a=0,gl=0;
  if(q.ty==='deb'){const rr=R*(0.85+0.3*q.j);x=Math.cos(q.u)*Math.sin(q.v)*rr;z=Math.sin(q.u)*Math.sin(q.v)*rr;y=p.y+Math.cos(q.v)*rr;s=R*0.18;cr=1;cg=0.55;cb=0.4;gl=Math.max(0,1-t/4)*0.8;a=0.5*Math.max(0,1-t/12);}
  else if(t<2.2&&(q.ty==='cap'||q.ty==='col'&&V!=='ocean')){const rr=R*(0.25+0.7*q.j);x=Math.cos(q.u)*Math.sin(q.v)*rr;z=Math.sin(q.u)*Math.sin(q.v)*rr;y=e.fb.position.y+Math.cos(q.v)*rr*0.8;s=R*(0.3+0.3*q.q);gl=heat*(q.q<0.2?0.3:1.3);cr=0.35;cg=0.16;cb=0.08;a=0.5;}
  else if(q.ty==='cap'){const vv=q.v+t*0.18;const tb=tube*(0.45+0.6*q.j);const rr=capR+Math.cos(vv)*tb;const tur=0.13*Math.sin(q.u*6+t*0.7+q.j*9)+0.09*Math.sin(q.v*5-t*0.45)+0.06*Math.sin(q.u*17+t*1.3);
   x=Math.cos(q.u)*rr*(1+tur);z=Math.sin(q.u)*rr*(1+tur);y=gy+capY+Math.sin(vv)*tb*0.7+(1-q.j)*tube*0.25;s=tube*(0.7+0.6*q.q);
   const ins=Math.max(0,-Math.cos(vv));gl=Math.min(1,heat*1.5*(0.55+0.65*ins)*(1-dark*0.5))*(q.q<0.22?0.25:1);const base=V==='ocean'?0.86:0.3+0.4*dark;cr=base*1.02+0.05;cg=base*0.95;cb=base*0.86;if(V!=='ocean'){cr+=0.1*(1-dark);cg-=0.02;cb-=0.08*(1-dark);}a=0.85*fade;}
  else if(q.ty==='stem'){const top=gy+capY-tube*0.4;const yy=gy+((q.s+t*0.04)%1)*(top-gy);const sr=stemR*(0.35+0.65*q.j)*(1+0.9*Math.max(0,(yy-gy)/(top-gy+1)-0.75)*4);
   x=Math.cos(q.u+t*0.25)*sr;z=Math.sin(q.u+t*0.25)*sr;y=yy;s=stemR*(0.8+0.6*q.q);const ar=V==='air'?Math.min(1,Math.max(0,(t-5)/10)):Math.min(1,Math.max(0,(t-0.8)/1.5));
   cr=0.5+0.1*q.q;cg=0.42+0.08*q.q;cb=0.34+0.06*q.q;if(V==='ocean'){cr=cg=cb=0.85;}gl=heat*(0.85-0.35*(yy-gy)/(top-gy+1))*(q.q<0.25?0.3:1);a=0.8*ar*fade;}
  else if(q.ty==='dust'){const rr=Math.min(t*(V==='air'?900:1100)*k,4200*k)*(0.55+0.45*q.j);x=Math.cos(q.u)*rr;z=Math.sin(q.u)*rr;y=gy+40*k+q.q*260*k*(0.6+t*0.03);s=(300+q.q*380)*k;cr=0.6+q.q*0.1;cg=cr*0.8;cb=cr*0.6;gl=(V==='ground'?0.75:0.35)*heat*(q.q<0.3?0.35:1);y+=Math.sin(q.u*7+t*0.6)*90*k;a=0.75*Math.min(1,t/0.8)*Math.max(0,1-t/70);}
  else if(q.ty==='surge'){const rr=Math.min(400*k+t*260*k,5000*k)*(0.45+0.55*q.j);x=Math.cos(q.u)*rr;z=Math.sin(q.u)*rr;y=gy+20+q.q*(300+t*6)*k;s=(320+q.q*380)*k;cr=cg=0.9;cb=0.93;a=0.7*Math.min(1,Math.max(0,(t-1.5)/2))*fade;}
  else if(q.ty==='col'){const top=Math.min(1900*k,t*700*k);const yy=gy+q.s*top;const sr=(300+q.j*110)*k*(1+0.6*Math.max(0,q.s-0.8)*5);x=Math.cos(q.u)*sr;z=Math.sin(q.u)*sr;y=yy;s=(260+q.q*200)*k;cr=cg=0.93;cb=0.96;a=0.9*fade*Math.min(1,t/0.4);}
  else if(q.ty==='pile'){const rr=capR*(0.2+1.1*q.j);x=Math.cos(q.u)*rr;z=Math.sin(q.u)*rr;y=gy+capY+tube*(1.05+0.12*q.q);s=capR*0.45;cr=cg=0.98;cb=1;a=0.45*Math.min(1,Math.max(0,(t-6)/5))*Math.max(0,1-(t-6)/28);}
  else if(q.ty==='fire'){const rr=2600*k*(0.3+0.8*q.j);x=Math.cos(q.u)*rr;z=Math.sin(q.u)*rr;const fl=0.75+0.25*Math.sin(t*13+q.u*20);y=gy+(30+q.q*40)*k*fl;s=(60+q.q*70)*k*fl;cr=0.25;cg=0.12;cb=0.05;gl=0.9*fl;a=Math.min(1,Math.max(0,(t-1-q.q*3)/1))*Math.max(0,1-t/(80+q.q*40));}
  A[i*4]=(q.ty==='deb'?p.x:p.x)+x;A[i*4+1]=y;A[i*4+2]=p.z+z;A[i*4+3]=s;B[i*4]=cr;B[i*4+1]=cg;B[i*4+2]=cb;B[i*4+3]=a;C[i*2]=gl;C[i*2+1]=q.s;}
 P.g.attributes.iA.needsUpdate=P.g.attributes.iB.needsUpdate=P.g.attributes.iC.needsUpdate=true;P.me.material.uniforms.uT.value=t;}
function kill(e){for(const o of [e.P.me,e.fb,e.wil,e.dome,e.sc,e.light,...(e.au||[])]){if(!o)continue;scene.remove(o);o.geometry&&o.geometry.dispose();o.material&&o.material.dispose();}}
// hide legacy visuals (g4 sprites/particles + gnukefx shells) but keep their objects so g4 damage/cleanup logic runs unchanged
const _prev=nukeDetonate;nukeDetonate=function(p,...a){const v=variantOf(p);const n0=nukes.length,f0=(window.NFX&&NFX.FX)?NFX.FX.length:0;const r=_prev(p,...a);
 try{const n=nukes.length>n0?nukes[nukes.length-1]:null;if(n){n.g.visible=false;n.sm.pts.visible=false;n.fi.pts.visible=false;}
  if(window.NFX&&NFX.FX.length>f0){const f=NFX.FX[NFX.FX.length-1];for(const kk of['fb','fb2','skirt'])if(f[kk])f[kk].visible=false;}
  const fl=document.getElementById('flash');if(fl){fl.style.transition='none';fl.style.opacity=0;}
  const y=a[0]&&a[0].yieldKt?a[0].yieldKt:(window.NUKE_YIELD_KT||1000);const k=Math.min(2.2,Math.max(0.3,Math.pow(y/1000,0.4)));
  const bp=v==='ground'||v==='ocean'?new T.Vector3(p.x,Math.max(groundAt(p.x,p.z).h,0),p.z):p.clone();make(bp,v,k);
  if(camera.far<900000){camera.far=900000;camera.updateProjectionMatrix();}}catch(e){console.warn('nuke_fx',e);}return r;};
const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);try{for(let i=L.length-1;i>=0;i--){const e=L[i];upd(e,dt);upd2(e,dt);if(e.t>e.life){kill(e);L.splice(i,1);}}if(!L.length&&FL.style.opacity!=='0')FL.style.opacity=0;if(!L.some(e=>e.skyOn))SK.style.opacity=HA.style.opacity=0;}catch(e){console.warn('nuke_fx',e);}};
return {L,variantOf,cam:c=>{NUKE2_CAM=c;},det:(p,o)=>nukeDetonate(p,o)};})();
window.NUKE2=NUKE2;
//NUKEFX2-END
