// ===== SR-71A Blackbird v4: lofted blended chine body from measured 3-view (32.74 m x 16.94 m) =====
// Frame: nose -Z, s = distance from nose (m), z = s - 16.37. Chine/wing reference plane y=0.
const SR={L:32.74,NX:4.35,NY:0.33};
{
const lerpT=(t,s)=>{if(s<=t[0][0])return t[0][1];for(let i=1;i<t.length;i++)if(s<=t[i][0]){const a=t[i-1],b=t[i],u=(s-a[0])/(b[0]-a[0]);const k=u*u*(3-2*u);return a[1]+(b[1]-a[1])*(0.35*u+0.65*k);}return t[t.length-1][1];};
// planform half-width of the sharp chine / wing edge
const W=[[0,0],[0.6,0.15],[1.5,0.44],[3,0.92],[4.8,1.36],[7.5,1.72],[10.2,1.89],[13,1.94],[16.4,1.96],[17.5,2.6],[18.5,3.35],[19.6,4.55],[21,5.42],[22.5,5.75],[23.9,6.05],[26.5,7.3],[29.1,8.47],[29.95,8.47],[30.12,2.3],[31.2,1.25],[32.2,0.45],[32.74,0.02]];
const BF=[[0,0],[1,0.16],[2.5,0.36],[5,0.6],[8,0.8],[11,0.88],[16,0.9],[25,0.86],[29,0.74],[31,0.5],[32.74,0.02]];   // fuselage body half-width
const HF=[[0,0],[1,0.12],[2.5,0.3],[5,0.55],[7,0.82],[9,1.02],[12,1.18],[18,1.2],[25,1.05],[29,0.8],[31,0.5],[32.74,0.02]]; // height above chine plane
const DB=[[0,0],[1,0.09],[3,0.25],[6,0.42],[10,0.52],[18,0.54],[26,0.46],[30,0.3],[32.74,0.02]]; // depth below
const TW=[[0,0.0],[3,0.05],[10,0.08],[17,0.14],[22,0.16],[28,0.12],[30,0.1],[32.74,0.01]];  // chine/wing thickness at root
const pn=(a,b,p=4)=>Math.pow(Math.pow(Math.max(a,0),p)+Math.pow(Math.max(b,0),p),1/p);
SR.top=(x,s)=>{x=Math.abs(x);const w=lerpT(W,s),bf=lerpT(BF,s),q=Math.min(1,x/Math.max(w,1e-3));const e=1-q;
 const f=x<bf?lerpT(HF,s)*Math.pow(1-(x/bf)**2,0.62):0;const wg=lerpT(TW,s)*Math.pow(e,0.9)*(1-0.4*q);return pn(f,wg)*Math.min(1,e*14)+SR.droop(x);};
SR.bot=(x,s)=>{x=Math.abs(x);const w=lerpT(W,s),bf=lerpT(BF,s),q=Math.min(1,x/Math.max(w,1e-3));const e=1-q;
 const f=x<bf*1.25?lerpT(DB,s)*Math.pow(Math.max(0,1-(x/(bf*1.25))**2),0.8):0;const wg=lerpT(TW,s)*0.55*Math.pow(e,0.9);return SR.droop(x)-pn(f,wg,3)*Math.min(1,e*14);};
SR.droop=x=>x>5.6?-0.11*((x-5.6)/2.9)**2:0;   // outer-wing conical camber / tip droop
SR.W=s=>lerpT(W,s);SR.BF=s=>lerpT(BF,s);
// ---- skin textures: panel/rivet normal map + streaky roughness (4 m tile) ----
function srTex(){const N=1024,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d');x.fillStyle='#808080';x.fillRect(0,0,N,N);
 let sd=7;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
 x.strokeStyle='#4e4e4e';x.lineWidth=2.6;for(let i=0;i<8;i++){const yy=i*128+((i*37)%19);x.beginPath();x.moveTo(0,yy);x.lineTo(N,yy);x.stroke();}
 for(let i=0;i<8;i++)for(let j=0;j<5;j++){const xx=j*205+r()*60,y0=i*128;x.beginPath();x.moveTo(xx,y0);x.lineTo(xx,y0+128);x.stroke();}
 x.fillStyle='#a2a2a2';for(let i=0;i<8;i++)for(let k=0;k<N;k+=8){for(const o of[6,-6]){x.beginPath();x.arc(k,i*128+o,1.3,0,7);x.fill();}}for(let j=0;j<5;j++)for(let k=0;k<N;k+=8){x.beginPath();x.arc(j*205+30,k,1.1,0,7);x.fill();}
 for(let i=0;i<40;i++){x.strokeStyle='#707070';x.lineWidth=1.2;const a=r()*N,b=r()*N;x.strokeRect(a,b,30+r()*70,20+r()*40);} // access panels
 const d=x.getImageData(0,0,N,N).data,out=x.createImageData(N,N),o=out.data;const H=(i,j)=>d[(((j+N)%N)*N+((i+N)%N))*4]/255;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const dx=(H(i+1,j)-H(i-1,j))*3,dy=(H(i,j+1)-H(i,j-1))*3;const l=Math.hypot(dx,dy,1);const k=(j*N+i)*4;o[k]=(-dx/l*0.5+0.5)*255;o[k+1]=(dy/l*0.5+0.5)*255;o[k+2]=(1/l*0.5+0.5)*255;o[k+3]=255;}
 x.putImageData(out,0,0);const nt=new THREE.CanvasTexture(cv);nt.wrapS=nt.wrapT=THREE.RepeatWrapping;nt.anisotropy=8;
 const c2=document.createElement('canvas');c2.width=c2.height=512;const y=c2.getContext('2d');y.fillStyle='#8a8a8a';y.fillRect(0,0,512,512);
 for(let i=0;i<900;i++){const g=100+r()*90|0;y.fillStyle=`rgba(${g},${g},${g},0.18)`;y.fillRect(r()*512,r()*512,1+r()*3,20+r()*120);} // chordwise streaks (fuel seep / wear)
 const rt=new THREE.CanvasTexture(c2);rt.wrapS=rt.wrapT=THREE.RepeatWrapping;return [nt,rt];}
let SRMAT=null;function srMat(){if(SRMAT)return SRMAT;const [nt,rt]=srTex();
 const m=new THREE.MeshPhysicalMaterial({color:0x14161d,metalness:0.55,roughness:0.5,roughnessMap:rt,normalMap:nt,normalScale:new THREE.Vector2(0.75,0.75),clearcoat:0.25,clearcoatRoughness:0.45,sheen:0.35,sheenRoughness:0.5,sheenColor:new THREE.Color(0x2c3850),envMapIntensity:1.0,side:THREE.FrontSide});
 m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vLP;varying vec3 vXd;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLP=position;vXd=normalize((modelViewMatrix*vec4(1.,0.,0.,0.)).xyz);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vLP;varying vec3 vXd;').replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
  {float ax=abs(vLP.x);float s=vLP.z+16.37;float wing=smoothstep(2.0,2.6,ax)*(1.-smoothstep(0.7,1.25,abs(ax-4.35)))*step(17.2,s)*step(s,29.9);
   wing=max(wing,smoothstep(5.3,5.6,ax)*step(19.,s));float c=cos(vLP.x*52.36);normal=normalize(normal+vXd*c*0.12*wing);}`)
  .replace('#include <color_fragment>',`#include <color_fragment>
  {float s=vLP.z+16.37;float heat=smoothstep(20.,30.5,s)*smoothstep(3.0,3.4,abs(vLP.x))*(1.-smoothstep(5.4,5.9,abs(vLP.x)));float hs=fract(sin(dot(floor(vec2(vLP.x*6.,s*0.6)),vec2(12.9,78.2)))*43758.);diffuseColor.rgb*=1.0-0.12*smoothstep(0.6,1.,hs)*smoothstep(0.,0.5,fract(s*0.6));vec3 iri=mix(vec3(0.20,0.14,0.08),vec3(0.10,0.11,0.22),0.5+0.5*sin(s*2.3+vLP.x*3.));diffuseColor.rgb=mix(diffuseColor.rgb,iri,heat*0.5);}`);};
 return SRMAT=m;}
function lathe(prof,seg,mat){const pts=prof.map(([s,r])=>new THREE.Vector2(Math.max(r,1e-3),s));const g=new THREE.LatheGeometry(pts,seg).rotateX(Math.PI/2);g.computeVertexNormals();return new THREE.Mesh(g,mat);} // y->+z
SR.lathe=lathe;SR.srMat=srMat;
sr71M=function(){const g=new THREE.Group();g.name='SR-71A';const m=srMat();const Z0=-16.37;
 // ---- blended body + chines + wing: upper & lower lofted sheets (crisp chine edge) ----
 const S=[];for(let i=0;i<=220;i++){const t=i/220;S.push(32.74*(t<0.5?0.5*Math.pow(2*t,1.25):t));}
 [17.4,18.5,19.6,29.95,30.05,30.12].forEach(v=>S.push(v));S.sort((a,b)=>a-b);
 const NU=56,U=[];for(let j=0;j<=NU;j++){U.push(j/NU);}
 const pos=[],uv=[],idx=[];const xs=(s,u)=>{const w=SR.W(s),bf=Math.min(SR.BF(s)*1.35,w*0.7);return u<0.5?bf*(u/0.5):bf+(w-bf)*Math.pow((u-0.5)/0.5,1.0);};
 for(const side of[1,-1]){const base=pos.length/3;const cols=2*NU+1;
  for(const s of S){for(let k=0;k<cols;k++){const u=Math.abs(k-NU)/NU,sg=k<NU?-1:1;const x=sg*xs(s,u)*(1);const y=side>0?SR.top(x,s):SR.bot(x,s);pos.push(x,y,s+Z0);uv.push(x/4,s/4);}}
  for(let i=0;i<S.length-1;i++)for(let k=0;k<cols-1;k++){const a=base+i*cols+k,b=a+cols;if(side>0)idx.push(a,a+1,b,a+1,b+1,b);else idx.push(a,b,a+1,a+1,b,b+1);}}
 const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));bg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));bg.setIndex(idx);bg.computeVertexNormals();
 const body=new THREE.Mesh(bg,m);g.add(body);
 // ---- nacelles: half-buried in the wing, conical inlet spikes, ejector nozzles ----
 const tm=new THREE.MeshPhysicalMaterial({color:0x2a2b2f,metalness:0.8,roughness:0.38,clearcoat:0.2});const ej=new THREE.MeshStandardMaterial({color:0x3a3029,metalness:0.85,roughness:0.5,side:THREE.DoubleSide});
 const dark=new THREE.MeshStandardMaterial({color:0x050505,roughness:0.9,side:THREE.DoubleSide});
 for(const sx of[-1,1]){const n=new THREE.Group();n.position.set(sx*SR.NX,SR.NY,Z0);g.add(n);
  const shell=lathe([[18.75,0.70],[18.5,0.76],[18.42,0.8],[18.6,0.84],[19.5,0.9],[21,0.95],[23,0.98],[26,0.99],[28.4,0.96],[29.6,0.9]],48,m);n.add(shell);
  n.add(lathe([[18.75,0.7],[20.5,0.6],[21.5,0.3]],32,dark));
  const sp=lathe([[16.55,0.0],[16.9,0.07],[17.6,0.22],[18.3,0.38],[18.9,0.5],[19.3,0.56],[19.6,0.5]],40,tm);n.add(sp);
  n.add(lathe([[29.55,0.9],[29.75,0.92],[30.15,0.9]],40,ej));
  // J58 ejector: 24 free-floating blow-in flaps, corrugated liner, heat-blued/straw metal with soot
  {const hot=SR.hot||(SR.hot=new THREE.MeshPhysicalMaterial({color:0x8a7e70,metalness:0.9,roughness:0.42,iridescence:0.8,iridescenceIOR:1.8,iridescenceThicknessRange:[250,700],emissive:0xff5a1a,emissiveIntensity:0,side:THREE.DoubleSide}));
   for(let k=0;k<24;k++){const a=k/24*Math.PI*2;const f=new THREE.Mesh(new THREE.BoxGeometry(0.24,0.03,0.62),hot);f.position.set(Math.cos(a)*0.87,Math.sin(a)*0.87,30.45);f.rotation.z=a+Math.PI/2;f.rotation.order='ZXY';f.rotateX(0.06);n.add(f);}
   const lc=document.createElement('canvas');lc.width=256;lc.height=32;const lx=lc.getContext('2d');for(let i=0;i<256;i++){const v=60+50*Math.sin(i/256*Math.PI*2*48);lx.fillStyle=`rgb(${v+30},${v+10},${v})`;lx.fillRect(i,0,1,32);}const lt=new THREE.CanvasTexture(lc);
   const liner=lathe([[29.7,0.78],[30.6,0.8]],64,new THREE.MeshStandardMaterial({map:lt,color:0xffffff,metalness:0.7,roughness:0.6,emissive:0xff3a08,emissiveMap:lt,emissiveIntensity:0,side:THREE.BackSide}));n.add(liner);SR.liner=SR.liner||[];SR.liner.push(liner.material);}{const ab=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.05,8,32),new THREE.MeshStandardMaterial({color:0x3a2a20,emissive:0xff5a10,emissiveIntensity:0.6,metalness:0.7,roughness:0.5}));ab.position.z=29.95;n.add(ab);const ab2=ab.clone();ab2.scale.setScalar(0.55);ab2.position.z=29.9;n.add(ab2);for(let k=0;k<8;k++){const sp=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.5,0.06),ab.material);const a=k/8*Math.PI*2;sp.position.set(Math.cos(a)*0.38,Math.sin(a)*0.38,29.95);sp.rotation.z=a+Math.PI/2;n.add(sp);}}n.add(lathe([[30.6,0.86],[29.9,0.55],[29.8,0.0]],32,dark));
  // nacelle bypass doors / louvers (thin dark bands) and an outboard chine strake
  for(const zz of[22.2,23.4])n.add(lathe([[zz,0.985],[zz+0.08,0.99]],48,dark));
  // all-moving rudder, canted 15 deg inward, on nacelle top
  const fm=srMat();const fp=[[-(26.0+Z0),0],[-(28.25+Z0),3.15],[-(30.75+Z0),3.15],[-(30.35+Z0),0]];
  const fg=new THREE.Group();fg.position.set(sx*(SR.NX-0.1),SR.NY+0.9,0);fg.rotation.z=sx*0.27;g.add(fg);
  const fin=finX(fp,0.13,fm);fin.material=fm;fg.add(fin);
  const fb=lathe([[25.6,0.0],[26.4,0.16],[29.6,0.16],[30.5,0.05]],12,m);fb.scale.set(1,0.6,1);fb.position.set(0,0.05,Z0);fg.add(fb); // pivot fairing
  for(const f of[1,-1])decal(fg,SR_NUM,1.5,0.62,[f*0.085,1.25,30.0+Z0-0.9],[0,f*Math.PI/2,0],0.9);
 }
 // ---- tandem cockpit: pointed windscreen + pilot canopy, RSO canopy, spine ----
 const cg=new THREE.MeshPhysicalMaterial({color:0x2a3038,metalness:0.1,roughness:0.03,clearcoat:1,clearcoatRoughness:0.02,transparent:true,opacity:0.42,envMapIntensity:2.0,depthWrite:false});
 const can=(s0,s1,r,h,mat)=>{const L=s1-s0;const prof=[];for(let i=0;i<=14;i++){const t=i/14;prof.push([s0+L*t,r*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.15)*0.5+ (t>0.87?0:0)),0.7)*(t>0.87?Math.max(0.6,1-(t-0.87)*3):1)]);}
  const me=lathe(prof,28,mat);me.scale.set(1,h/r,1);me.position.set(0,SR.top(0,(s0+s1)/2)-0.12,Z0);return me;};
 g.add(can(6.0,8.4,0.42,0.42,cg));g.add(can(8.6,9.9,0.4,0.3,cg));
 const fr=new THREE.MeshStandardMaterial({color:0x101114,metalness:0.6,roughness:0.5});
 for(const s of[6.95,8.42,8.6,9.9]){const t=new THREE.Mesh(new THREE.TorusGeometry(0.4,0.035,6,24,Math.PI),fr);t.position.set(0,SR.top(0,s)-0.1,s+Z0);t.scale.y=s<8.5?1.02:0.78;g.add(t);}
 // cockpit interiors (pilot + RSO): seats, headrests, panels, helmets
 const im=new THREE.MeshStandardMaterial({color:0x1b1c1e,roughness:0.8}),hm=new THREE.MeshStandardMaterial({color:0xd8d4c8,roughness:0.5}),pm=new THREE.MeshStandardMaterial({color:0x2c3a2e,emissive:0x0a2a14,roughness:0.6});
 for(const [s0,hh] of[[7.6,0.0],[9.4,-0.06]]){const y0=SR.top(0,s0);add(g,new THREE.BoxGeometry(0.5,0.55,0.45),im,0,y0-0.05+hh,s0+Z0+0.25);add(g,new THREE.SphereGeometry(0.15,12,8),hm,0,y0+0.33+hh,s0+Z0+0.1);add(g,new THREE.BoxGeometry(0.62,0.22,0.14),pm,0,y0+0.12+hh,s0+Z0-0.55).rotation.x=-0.5;}
 for(const s of[6.4,7.0,7.6,8.1,9.0,9.5]){const t=new THREE.Mesh(new THREE.TorusGeometry(0.4,0.022,6,24,Math.PI),fr);t.position.set(0,SR.top(0,s)-0.1,s+Z0);t.scale.set(s<8.5?1:0.96,s<8.5?1.02:0.76,1);g.add(t);}
 {const sp=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,3.9,6).rotateX(Math.PI/2),fr);sp.position.set(0,SR.top(0,8)+0.3,8+Z0);g.add(sp);}
 // aerial refueling receptacle (dorsal, aft of RSO) + blade antennas + access panels
 {const rr=add(g,new THREE.BoxGeometry(0.34,0.03,0.9),new THREE.MeshStandardMaterial({color:0x08090a,roughness:0.9}),0,SR.top(0,12.2)+0.012,12.2+Z0);
  add(g,new THREE.BoxGeometry(0.4,0.01,1.0),new THREE.MeshStandardMaterial({color:0x9a9a9a,roughness:0.6}),0,SR.top(0,12.2)+0.004,12.2+Z0);}
 for(const [s,yy,hgt] of[[14.5,1,0.35],[20,1,0.28],[11,-1,0.3],[17,-1,0.32]]){const y=yy>0?SR.top(0,s):SR.bot(0,s);const b=new THREE.Mesh(new THREE.BoxGeometry(0.03,hgt,0.5),fr);b.geometry.translate(0,yy*hgt/2,0);b.position.set(0,y,s+Z0);b.rotation.x=yy*0.25;g.add(b);}
 for(const [x,s,w,l] of[[0.5,16,0.5,0.8],[-0.5,19,0.45,0.6],[1.4,22,0.6,0.9],[-1.4,22,0.6,0.9],[0.3,26,0.4,0.7]]){const pnl=new THREE.Mesh(new THREE.PlaneGeometry(w,l).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x111318,roughness:0.62,metalness:0.5,polygonOffset:true,polygonOffsetFactor:-2}));pnl.position.set(x,SR.top(x,s)+0.008,s+Z0);g.add(pnl);
  const ed=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w,l).rotateX(-Math.PI/2)),new THREE.LineBasicMaterial({color:0x050506}));ed.position.copy(pnl.position);ed.position.y+=0.004;g.add(ed);}
 // pitot boom
 add(g,new THREE.CylinderGeometry(0.02,0.04,1.4,8).rotateX(Math.PI/2),fr,0,0.0,Z0-0.6);
 // markings: white star-and-bar (low-vis), U.S. AIR FORCE, red tail numbers
 for(const f of[1,-1]){decal(g,SR_STAR,1.9,0.95,[f*6.7,SR.top(6.7,26.6)+0.03,26.6+Z0],[-Math.PI/2,0,0],0.85);
  const sx=1.3,ss=13.5;const dd=decal(g,SR_USAF,3.2,0.4,[f*sx,SR.top(sx,ss)+0.03,ss+Z0],[-Math.PI/2,0,f>0?-Math.PI/2:Math.PI/2],0.75);}
 g.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;}});return g;};
}
var SR_STAR=decalTex((x,w,h)=>{x.save();x.scale(4,4);x.clearRect(0,0,256,128);x.fillStyle='#e8e8e8';x.fillRect(20,52,216,26);x.beginPath();x.arc(128,64,46,0,7);x.fill();x.fillStyle='#1a1c22';x.beginPath();x.arc(128,64,40,0,7);x.fill();
 x.fillStyle='#e8e8e8';x.beginPath();for(let i=0;i<10;i++){const r=i%2?15:40,a=-Math.PI/2+i*Math.PI/5;x.lineTo(128+r*Math.cos(a),64+r*Math.sin(a));}x.fill();x.restore();},1024,512);
var SR_USAF=decalTex((x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#d8d8d8';x.font='bold 104px Arial';x.textAlign='center';x.fillText('U.S. AIR FORCE',w/2,92);},1024,128);
var SR_NUM=decalTex((x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#c41a1a';x.font='bold 140px Arial';x.textAlign='center';x.fillText('17972',w/2,172);x.fillStyle='#d8d8d8';x.font='bold 44px Arial';x.fillText('U.S. AIR FORCE',w/2,52);},512,220);
