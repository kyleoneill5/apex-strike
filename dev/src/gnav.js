// ===== v4 models: lofted F-35A, flared Arleigh Burke hull + deckhouse, lighter carrier =====
const lerpS=(t,s)=>{if(s<=t[0][0])return t[0][1];for(let i=1;i<t.length;i++)if(s<=t[i][0]){const a=t[i-1],b=t[i],u=(s-a[0])/(b[0]-a[0]),k=u*u*(3-2*u);return a[1]+(b[1]-a[1])*(0.35*u+0.65*k);}return t[t.length-1][1];};
// generic blended-body loft: W planform edge, BF body half-width, HF height above chine, DB depth below, TW wing thickness
function loftHF(D,mat,Z0,NS=160,NU=40){const pn=(a,b,p)=>Math.pow(Math.pow(Math.max(a,0),p)+Math.pow(Math.max(b,0),p),1/p);
 const top=(x,s)=>{x=Math.abs(x);const w=lerpS(D.W,s),bf=lerpS(D.BF,s),q=Math.min(1,x/Math.max(w,1e-3)),e=1-q;const f=x<bf?lerpS(D.HF,s)*Math.pow(1-(x/bf)**2,0.6):0;return pn(f,lerpS(D.TW,s)*Math.pow(e,0.9),4)*Math.min(1,e*14);};
 const bot=(x,s)=>{x=Math.abs(x);const w=lerpS(D.W,s),bf=lerpS(D.BF,s)*1.2,q=Math.min(1,x/Math.max(w,1e-3)),e=1-q;const f=x<bf?lerpS(D.DB,s)*Math.pow(Math.max(0,1-(x/bf)**2),0.7):0;return -pn(f,lerpS(D.TW,s)*0.6*Math.pow(e,0.9),3)*Math.min(1,e*14);};
 const L=D.L,S=[];for(let i=0;i<=NS;i++){const t=i/NS;S.push(L*(t<0.5?0.5*Math.pow(2*t,1.3):t));}(D.extra||[]).forEach(v=>S.push(v));S.sort((a,b)=>a-b);
 const pos=[],uv=[],idx=[];const xs=(s,u)=>{const w=lerpS(D.W,s),bf=Math.min(lerpS(D.BF,s)*1.3,w*0.75);return u<0.5?bf*u/0.5:bf+(w-bf)*(u-0.5)/0.5;};
 for(const side of[1,-1]){const base=pos.length/3,cols=2*NU+1;for(const s of S)for(let k=0;k<cols;k++){const u=Math.abs(k-NU)/NU,x=(k<NU?-1:1)*xs(s,u);pos.push(x,(side>0?top(x,s):bot(x,s))+(D.yoff||0),s+Z0);uv.push(x/3,s/3);}
  for(let i=0;i<S.length-1;i++)for(let k=0;k<cols-1;k++){const a=base+i*cols+k,b=a+cols;if(side>0)idx.push(a,a+1,b,a+1,b+1,b);else idx.push(a,b,a+1,a+1,b,b+1);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.userData.top=top;return m;}
const latheZ=(prof,seg,mat)=>{const g=new THREE.LatheGeometry(prof.map(([s,r])=>new THREE.Vector2(Math.max(r,1e-3),s)),seg).rotateX(Math.PI/2);g.computeVertexNormals();return new THREE.Mesh(g,mat);};
// ---- F-35A Lightning II: 15.7 m long, 10.7 m span ----
f35=function(c){const g=new THREE.Group();const Z0=-7.85;
 const ram=new THREE.MeshPhysicalMaterial({color:0x464b50,roughness:0.7,metalness:0.2,normalMap:panelNrm,normalScale:new THREE.Vector2(0.3,0.3),envMapIntensity:0.6});
 const D={L:15.7,extra:[11.95,12.05,12.3,15.05],
  W:[[0,0],[0.4,0.08],[1,0.3],[2.5,0.62],[4,0.9],[5.5,1.38],[7,1.95],[7.4,2.12],[9.7,5.35],[11.0,5.35],[11.6,3.4],[12.0,2.2],[12.3,2.15],[13.8,3.45],[14.6,3.45],[15.1,1.55],[15.7,0.62]],
  BF:[[0,0],[0.8,0.3],[2,0.55],[4,0.85],[6,1.25],[8,1.35],[12,1.25],[14,0.92],[15.7,0.62]],
  HF:[[0,0],[0.8,0.22],[2,0.45],[3.5,0.7],[6,1.15],[9,1.1],[12,0.85],[15.7,0.6]],
  DB:[[0,0],[0.8,0.2],[2,0.4],[4,0.62],[8,0.95],[12,0.75],[15.7,0.6]],
  TW:[[0,0.02],[4,0.05],[8,0.16],[11,0.14],[12.2,0.06],[13.5,0.07],[15.7,0.04]]};
 const body=loftHF(D,ram,Z0,170,40);g.add(body);const top=body.userData.top;
 // DSI caret intakes with bumps
 const dk=new THREE.MeshStandardMaterial({color:0x0a0b0c,roughness:0.9,side:THREE.DoubleSide});
 for(const sx of[-1,1]){const lip=latheZ([[5.2,0.0],[5.25,0.45],[5.6,0.55],[6.6,0.6],[8,0.5],[9,0.0]],20,ram);lip.scale.set(0.62,0.9,1);lip.position.set(sx*1.22,0.12,Z0);g.add(lip);
  const mo=new THREE.Mesh(new THREE.CircleGeometry(0.42,20),dk);mo.scale.set(0.56,0.86,1);mo.position.set(sx*1.22,0.12,5.27+Z0);mo.rotation.y=Math.PI;g.add(mo);
  // canted twin tails (25 deg out) and stabilators handled by loft
  const fg=new THREE.Group();fg.position.set(sx*1.15,0.55,0);fg.rotation.z=-sx*0.44;g.add(fg);
  fg.add(finX([[-(11.9+Z0),0],[-(13.65+Z0),2.1],[-(14.55+Z0),2.1],[-(14.7+Z0),0]],0.09,ram));}
 // nozzle: serrated-look petals, ceramic tiles
 const nz=latheZ([[15.2,0.62],[15.7,0.6],[16.35,0.5]],24,new THREE.MeshStandardMaterial({color:0x3a3632,metalness:0.8,roughness:0.45,side:THREE.DoubleSide}));g.add(nz);nz.position.z=Z0;
 {const nc=latheZ([[16.3,0.5],[15.9,0.3],[15.85,0]],16,dk);nc.position.z=Z0;g.add(nc);}
 // one-piece canopy, gold-tinted
 const cg=new THREE.MeshPhysicalMaterial({color:0x6a5a30,metalness:0.5,roughness:0.05,clearcoat:1,envMapIntensity:1.8});
 const cp=latheZ([[3.0,0],[3.3,0.25],[3.9,0.44],[4.8,0.5],[5.6,0.45],[6.3,0.28],[6.7,0]],24,cg);cp.scale.set(1,0.78,1);cp.position.set(0,top(0,4.8)-0.12,Z0);g.add(cp);
 add(g,new THREE.CylinderGeometry(0.015,0.03,0.6,6).rotateX(Math.PI/2),0x222222,0,0,Z0-0.25);
 decal(g,textTex('AF','#2c3034','bold 80px Arial'),0.9,0.45,[1.0,0.6,13.2+Z0],[0,Math.PI/2+0.44,0],0.6);
 g.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;}});return g;};
// ---- Arleigh Burke: flared, sheered hull (154 m x 20 m) ----
{const _d=destroyer;destroyer=function(){const g=_d();
 g.children.filter(o=>o.geometry&&(o.geometry.type==='ExtrudeGeometry'||(o.geometry.type==='BoxGeometry'&&o.geometry.parameters.depth===148))).forEach(o=>g.remove(o));
 const zs=[],NZ=90,NV=14;for(let i=0;i<=NZ;i++)zs.push(-77+154*i/NZ);
 const hb=z=>{const t=(z+77)/154;return t<0.32?10*Math.pow(Math.sin(t/0.32*Math.PI/2),1.25):t>0.9?10-(t-0.9)/0.1*1.1:10;};
 const deckY=z=>6.1+Math.pow(Math.max(0,-z-50),1.5)*0.016,keel=z=>{const t=(z+77)/154;return t<0.05?-6+ (0.05-t)*40:-6;};
 const pos=[],col=[],idx=[];const cG=new THREE.Color(NAVY),cR=new THREE.Color(0x6a2222),cB=new THREE.Color(0x1a1a1a);
 for(const z of zs){const b=hb(z),ky=keel(z),dy=deckY(z);for(let j=0;j<=2*NV;j++){const t=Math.abs(j-NV)/NV,sx=j<NV?-1:1;const y=ky+(dy-ky)*(1-t);
   const vt=1-t;const flare=0.82+0.18*vt+(z<-40?0.08*vt*vt*Math.min(1,(-40-z)/30):0);const bil=Math.pow(Math.min(1,vt/0.25),0.5);const x=sx*b*flare*(vt<0.25?bil:1);
   pos.push(x,y,z);const c=y<-1.6?cR:y<-0.9?cB:cG;col.push(c.r,c.g,c.b);}}
 const C=2*NV+1;for(let i=0;i<NZ;i++)for(let j=0;j<C-1;j++){const a=i*C+j,b=a+C;idx.push(a,b,a+1,a+1,b,b+1);}
 // deck cap
 const db=pos.length/3;for(const z of zs){const b=hb(z),dy=deckY(z);for(const sx of[-1,1]){pos.push(sx*b*(z<-40?1+0.08*Math.min(1,(-40-z)/30):1),dy,z);col.push(0.36,0.39,0.42);}}
 for(let i=0;i<NZ;i++){const a=db+i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
 // transom
 const tb=pos.length/3;for(let j=0;j<=2*NV;j++){const k=NZ*C+j;pos.push(pos[k*3],pos[k*3+1],pos[k*3+2]);col.push(col[k*3],col[k*3+1],col[k*3+2]);}pos.push(0,2,77);col.push(cG.r,cG.g,cG.b);
 for(let j=0;j<2*NV;j++)idx.push(tb+j,tb+j+1,tb+2*NV+1);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setIndex(idx);geo.computeVertexNormals();
 const hm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.6,metalness:0.3,map:panelTex,normalMap:panelNrm,normalScale:new THREE.Vector2(0.3,0.3),side:THREE.DoubleSide});
 const hull=new THREE.Mesh(geo,hm);hull.castShadow=hull.receiveShadow=true;g.add(hull);
 // replace octagonal superstructure with raked deckhouse (flat sloped faces carrying the SPY-1 arrays)
 g.children.filter(o=>o.geometry&&o.geometry.type==='CylinderGeometry'&&o.geometry.parameters.radialSegments===8&&o.geometry.parameters.height>=6&&o.geometry.parameters.radiusTop>3).forEach(o=>g.remove(o));
 const frust=(w0,l0,w1,l1,h)=>{const G=new THREE.BoxGeometry(1,h,1,1,1,1);const p=G.attributes.position;for(let i=0;i<p.count;i++){const top=p.getY(i)>0;p.setX(i,p.getX(i)*(top?w1:w0));p.setZ(i,p.getZ(i)*(top?l1:l0));}G.computeVertexNormals();return G;};
 const sm=M(0x98a1a9,{roughness:0.7,metalness:0.15});add(g,frust(16,30,12.5,24,9),sm,0,10.6,-6);add(g,frust(12,20,9.5,15,6),sm,0,18.1,-7);add(g,frust(9,12,7.5,9,3),sm,0,22.6,-9);
 const spy=M(0x4a525a,{roughness:0.45,metalness:0.4});for(const [sx,sz] of[[1,-1],[-1,-1],[1,1],[-1,1]]){const p=new THREE.Mesh(new THREE.CylinderGeometry(2.25,2.25,0.25,8).rotateX(Math.PI/2).rotateZ(Math.PI/8),spy);
  const yaw=sz<0?(sx>0?-Math.PI/4:Math.PI/4):(sx>0?-3*Math.PI/4:3*Math.PI/4);p.position.set(sx*5.6,18.4,-7+sz*6.6);p.rotation.order='YXZ';p.rotation.y=yaw+Math.PI;p.rotation.x=0.18;g.add(p);}
 add(g,new THREE.BoxGeometry(7.2,1.3,0.3),glassMat,0,23.4,-13.6).rotation.x=-0.3;
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;};}
// lighter haze-gray carrier hull/island (real Nimitz haze gray)
{const map={0x6e7880:0x9ba4ac,0x7d8791:0xa1aab2,0x5c6670:0x858e96};const done=new Map();fleetCarrier.traverse(o=>{if(!o.isMesh||!o.material||!o.material.color)return;const h=o.material.color.getHex();if(map[h]){if(!done.has(o.material)){const m=o.material.clone();m.color.setHex(map[h]);done.set(o.material,m);}o.material=done.get(o.material);}});}
