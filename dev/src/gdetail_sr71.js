//GDETAIL_SR71 – SR-71A detail pass: planform panel map + weathering (fuel seep, soot, wear), stencils, J58 nozzle iris/petals/stiffeners
{const T=THREE,Z0=-16.37;const lathe=(...q)=>SR.lathe(...q);
 // planform map: x in [-8.6,8.6] -> u, s in [0,32.74] -> v. R: panel-line darkness, G: weathering grime, B: wear/polish
 const PW=2048,PH=4096,PX=x=>(x/8.6*0.5+0.5)*PW,PY=s=>s/32.74*PH;
 const pc=document.createElement('canvas');pc.width=PW;pc.height=PH;const x=pc.getContext('2d');x.fillStyle='rgb(0,0,0)';x.fillRect(0,0,PW,PH);let sd=11;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
 x.lineCap='round';
 const ln=(x0,s0,x1,s1,w=2.4,a=0.95)=>{x.strokeStyle=`rgba(255,0,0,${a})`;x.lineWidth=w;x.beginPath();x.moveTo(PX(x0),PY(s0));x.lineTo(PX(x1),PY(s1));x.stroke();};
 x.globalCompositeOperation='lighter';
 // fuselage stations (frames) and longerons, mirrored
 for(let s=1.2;s<31.5;s+=0.92+((s*7)%3)*0.1){const w=Math.min(SR.BF(s)*1.3,SR.W(s)*0.7);ln(-w,s,w,s,2.2,0.8);}
 for(const f of[1,-1]){for(const k of[0.35,0.7])for(let s=1;s<31;s+=0.6)ln(f*SR.BF(s)*k,s,f*SR.BF(s+0.6)*k,s+0.6,2,0.7);
  for(let s=0.5;s<30;s+=0.4)ln(f*SR.W(s)*0.985,s,f*SR.W(s+0.4)*0.985,s+0.4,2.5,0.9); // chine edge seam
  // wing: chordwise corrugation-bay seams + spanwise spar lines
  for(let xx=2.3;xx<8.4;xx+=0.62){const s0=17.2+(xx-2)*1.05;ln(f*xx,Math.max(17.2,s0),f*xx,29.9,2.2,0.85);}
  for(const s of[21,23.5,26,28.4])ln(f*2.2,s,f*Math.min(8.4,SR.W(s)*0.98),s,2.2,0.8);
  // fuel tank access panels (dense rows of fasteners) + small hatches
  for(let i=0;i<70;i++){const xx=0.3+r()*5.5,s=10+r()*19;if(xx>SR.W(s)*0.95)continue;const w=0.25+r()*0.6,l=0.3+r()*0.9;x.strokeStyle='rgba(255,0,0,0.75)';x.lineWidth=1.8;x.strokeRect(PX(f*xx)-(f<0?w*PW/17.2:0),PY(s),w*PW/17.2,l*PH/32.74);
   x.fillStyle='rgba(255,0,0,0.5)';for(let k=0;k<l*10;k++){x.fillRect(PX(f*xx)-2,PY(s+k*0.1),3,3);}}}
 // G: weathering – chordwise fuel-seep streaks on the wing, soot aft of the nacelles, grime along chines
 for(let i=0;i<2600;i++){const f=r()<0.5?1:-1,xx=2+r()*6.3,s=17+r()*13;if(xx>SR.W(s))continue;x.fillStyle=`rgba(0,${30+r()*70|0},0,0.25)`;x.fillRect(PX(f*xx),PY(s),1.5+r()*3,PH*(0.004+r()*0.02));}
 for(const f of[1,-1]){const g=x.createRadialGradient(PX(f*4.35),PY(30.4),10,PX(f*4.35),PY(30.4),PW*0.09);g.addColorStop(0,'rgba(0,160,0,0.9)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,PY(27),PW,PH);}
 for(let i=0;i<500;i++){const s=2+r()*28,f=r()<0.5?1:-1;x.fillStyle='rgba(0,60,0,0.3)';x.fillRect(PX(f*SR.W(s)*0.95),PY(s),6+r()*18,4+r()*10);}
 // B: polished wear on walkway, around the canopy and the refuelling receptacle
 for(const f of[1,-1]){x.fillStyle='rgba(0,0,90,1)';x.fillRect(PX(f*0.55)-12,PY(10),24,PY(6.5));}
 {const g=x.createRadialGradient(PX(0),PY(12.2),5,PX(0),PY(12.2),120);g.addColorStop(0,'rgba(0,0,140,1)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,PY(11),PW,PY(3));}
 x.globalCompositeOperation='source-over';
 const PT=new T.CanvasTexture(pc);PT.anisotropy=8;PT.colorSpace=T.NoColorSpace;
 // patch SR material: panel lines darken + roughen, grime darkens/mattes, wear polishes
 const patchSR=(m)=>{if(!m||m.userData.srD)return;m.userData.srD=1;const prev=m.onBeforeCompile||(()=>{});
  m.onBeforeCompile=(sh,rd)=>{prev(sh,rd);sh.uniforms.pMap={value:PT};sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D pMap;')
   .replace('#include <color_fragment>','#include <color_fragment>\n vec4 PM=texture2D(pMap,vec2(vLP.x/8.6*0.5+0.5,(vLP.z+16.37)/32.74));diffuseColor.rgb*=1.0-0.55*PM.r;diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.035,0.033,0.03),PM.g*0.6);diffuseColor.rgb+=vec3(0.012,0.014,0.02)*PM.b;')
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n {vec4 PM2=texture2D(pMap,vec2(vLP.x/8.6*0.5+0.5,(vLP.z+16.37)/32.74));roughnessFactor=clamp(roughnessFactor+0.25*PM2.r+0.3*PM2.g-0.25*PM2.b,0.08,1.);}')
   .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n {vec2 pu=vec2(vLP.x/8.6*0.5+0.5,(vLP.z+16.37)/32.74);float e=1.0/2048.;float a=texture2D(pMap,pu+vec2(e,0.)).r-texture2D(pMap,pu-vec2(e,0.)).r;float b=texture2D(pMap,pu+vec2(0.,e*0.5)).r-texture2D(pMap,pu-vec2(0.,e*0.5)).r;normal=normalize(normal-0.35*(a*vXd+b*normalize(cross(vXd,normal))));}');};
  m.customProgramCacheKey=()=>'sr71d';m.needsUpdate=true;};
 // stencils
 const st=(f,w,h)=>decalTex(f,w,h);
 const NOSTEP=st((x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='#c8362a';x.lineWidth=6;x.strokeRect(8,8,w-16,h-16);x.fillStyle='#c8362a';x.font='bold 64px Arial';x.textAlign='center';x.fillText('NO STEP',w/2,h/2+22);},512,128);
 const DANGER=st((x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#c8231d';x.beginPath();x.moveTo(w/2,8);x.lineTo(w-8,h-8);x.lineTo(8,h-8);x.fill();x.fillStyle='#fff';x.font='bold 34px Arial';x.textAlign='center';x.fillText('DANGER',w/2,h-40);x.font='bold 18px Arial';x.fillText('INLET SPIKE',w/2,h-18);},256,256);
 const RESCUE=st((x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#d23a22';x.beginPath();x.moveTo(20,h/2-16);x.lineTo(w-90,h/2-16);x.lineTo(w-90,h/2-40);x.lineTo(w-20,h/2);x.lineTo(w-90,h/2+40);x.lineTo(w-90,h/2+16);x.lineTo(20,h/2+16);x.fill();x.fillStyle='#fff';x.font='bold 22px Arial';x.fillText('RESCUE',30,h/2+8);x.font='14px Arial';x.fillStyle='#d23a22';x.fillText('CANOPY JETTISON — PULL HANDLE',20,h-6);},512,128);
 const WALK=st((x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='rgba(205,60,40,0.95)';x.lineWidth=5;x.beginPath();x.moveTo(6,10);x.lineTo(w-6,10);x.moveTo(6,h-10);x.lineTo(w-6,h-10);x.stroke();},1024,64);
 const SMALL=st((x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#bdbdbd';x.font='bold 22px monospace';['JP-7 ONLY','FUEL  1250 PSI MAX','NITROGEN — INERT','GROUND HERE ⏚','LOX SERVICING'].forEach((t,i)=>x.fillText(t,10,30+i*30));},512,170);
 const EJECT=st((x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#e4b500';x.beginPath();x.moveTo(w/2,6);x.lineTo(w-6,h-6);x.lineTo(6,h-6);x.fill();x.fillStyle='#d01818';x.beginPath();x.moveTo(w/2,26);x.lineTo(w-26,h-18);x.lineTo(26,h-18);x.fill();x.fillStyle='#fff';x.font='bold 22px Arial';x.textAlign='center';x.fillText('EJECTION',w/2,h-34);x.fillText('SEAT',w/2,h-12+0);},256,256);
 const _m=sr71M;sr71M=function(){const g=_m();{let big=null,bn=0;g.traverse(o=>{if(o.isMesh&&o.geometry.attributes.position.count>bn&&o.material.onBeforeCompile&&String(o.material.onBeforeCompile).includes('vLP')){bn=o.geometry.attributes.position.count;big=o;}});if(big)g.traverse(o=>{if(o.isMesh&&o.material===big.material)patchSR(o.material);});}const dk=(t,w,h,p,rt,o=0.9)=>decal(g,t,w,h,p,rt,o);
  for(const f of[1,-1]){
   dk(NOSTEP,1.3,0.32,[f*3.6,SR.top(3.6,22)+0.03,22+Z0],[-Math.PI/2,0,0]);dk(NOSTEP,1.3,0.32,[f*6.2,SR.top(6.2,25.5)+0.03,25.5+Z0],[-Math.PI/2,0,0]);dk(NOSTEP,1.1,0.28,[f*1.4,SR.top(1.4,24)+0.03,24+Z0],[-Math.PI/2,0,0]);
   dk(DANGER,0.42,0.42,[f*(SR.NX-0.95),SR.NY+0.15,18.9+Z0],[0,f*Math.PI/2,0],0.95);
   dk(RESCUE,1.0,0.25,[f*0.47,SR.top(0.47,7.2)-0.05,7.2+Z0],[0,f*Math.PI/2,0],0.95);
   dk(EJECT,0.26,0.26,[f*0.5,SR.top(0.5,8.9)-0.12,8.9+Z0],[0,f*Math.PI/2,0],0.95);
   dk(WALK,6.5,0.4,[f*0.55,SR.top(0.55,13.2)+0.03,13.2+Z0],[-Math.PI/2,0,Math.PI/2],0.8);
   dk(SMALL,0.9,0.3,[f*1.1,SR.bot(1.1,15)-0.03,15+Z0],[Math.PI/2,0,0],0.8);dk(SMALL,0.8,0.27,[f*1.7,SR.top(1.7,19.5)+0.03,19.5+Z0],[-Math.PI/2,0,f*Math.PI/2],0.75);}
  {const RL=new THREE.LineBasicMaterial({color:0xc8402c});for(const f of[1,-1]){const pts=[];const path=[[2.3,18.2],[3.2,20.0],[3.3,27.8],[2.5,29.6]];const path2=[[5.4,21.5],[5.6,25.0],[7.6,28.3],[7.9,29.4],[5.6,29.4]];
   for(const P of[path,path2]){const v=[];for(let i=0;i<P.length-1;i++){for(let k=0;k<=10;k++){const t=k/10,xx=P[i][0]+(P[i+1][0]-P[i][0])*t,ss=P[i][1]+(P[i+1][1]-P[i][1])*t;v.push(new THREE.Vector3(f*xx,SR.top(f*xx,ss)+0.02,ss+Z0));}}g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(v),RL));}}}
  // J58 nozzle: converging iris petals, nacelle boat-tail stiffeners, heat-tinted shroud, soot ring
  const heatC=document.createElement('canvas');heatC.width=64;heatC.height=256;const hx=heatC.getContext('2d');const hg=hx.createLinearGradient(0,0,0,256);hg.addColorStop(0,'#1a1c22');hg.addColorStop(0.45,'#3b3226');hg.addColorStop(0.65,'#6d5b3a');hg.addColorStop(0.8,'#4b4f6e');hg.addColorStop(1,'#1b1716');hx.fillStyle=hg;hx.fillRect(0,0,64,256);for(let i=0;i<300;i++){hx.fillStyle=`rgba(0,0,0,${Math.random()*0.25})`;hx.fillRect(Math.random()*64,Math.random()*256,1+Math.random()*2,8+Math.random()*30);}
  const heatT=new T.CanvasTexture(heatC);heatT.colorSpace=T.SRGBColorSpace;
  const shroud=new T.MeshPhysicalMaterial({map:heatT,metalness:0.9,roughness:0.42,iridescence:0.5,iridescenceIOR:1.6,iridescenceThicknessRange:[200,600]});
  const petal=SR.hot||new T.MeshStandardMaterial({color:0x8a7e70,metalness:0.9,roughness:0.42});const stiff=new T.MeshStandardMaterial({color:0x111216,metalness:0.7,roughness:0.5});
  for(const sx of[-1,1]){const n=new T.Group();n.position.set(sx*SR.NX,SR.NY,Z0);g.add(n);
   n.add(lathe([[28.3,0.968],[29.2,0.935],[29.56,0.905]],64,shroud));
   for(let k=0;k<36;k++){const a=k/36*Math.PI*2;const b=new T.Mesh(new T.BoxGeometry(0.03,0.025,1.3),stiff);b.position.set(Math.cos(a)*0.955,Math.sin(a)*0.955,28.85);b.rotation.z=a;n.add(b);}
   for(let k=0;k<16;k++){const a=(k+0.5)/16*Math.PI*2;const p=new T.Mesh(new T.CylinderGeometry(0.05,0.12,0.55,3,1,true),petal);p.rotation.x=Math.PI/2;const pv=new T.Group();pv.rotation.z=a;p.position.set(0.5,0,29.72);p.rotation.z=Math.PI/2;p.scale.set(1,1,0.25);pv.add(p);n.add(pv);}
   const sootM=new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.55,side:T.DoubleSide,depthWrite:false});n.add(lathe([[30.25,0.905],[30.6,0.87]],48,sootM));
   // inlet: bleed-slot ring + spike translation track lines
   for(let k=0;k<28;k++){const a=k/28*Math.PI*2;const sl=new T.Mesh(new T.BoxGeometry(0.06,0.012,0.22),stiff);sl.position.set(Math.cos(a)*0.83,Math.sin(a)*0.83,18.95);sl.rotation.z=a;n.add(sl);}}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;};
}
