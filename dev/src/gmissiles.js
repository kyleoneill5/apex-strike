//GMISSILES-BEGIN  real-scale missile models. Convention: metres, nose points -Z (same as missileMesh), origin at body centre.
const MSL_MODELS=(()=>{
const T=THREE,PI=Math.PI,cache={};
// ---------- canvas skin: base colour, bands, panel lines, rivets, stencils ----------
function skin(key,o){if(cache[key])return cache[key];
 const W=1024,H=2048,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
 const r=document.createElement('canvas');r.width=W;r.height=H;const rx=r.getContext('2d');
 x.fillStyle=o.base;x.fillRect(0,0,W,H);rx.fillStyle=o.rough||'#8a8a8a';rx.fillRect(0,0,W,H);
 // subtle grime / paint variation
 for(let i=0;i<1800;i++){x.fillStyle=`rgba(${o.dirt||'0,0,0'},${Math.random()*0.035})`;const s=4+Math.random()*40;x.fillRect(Math.random()*W,Math.random()*H,s*3,s);}
 // v along the length: 0 = tail, 1 = nose  -> canvas y = (1-v)*H
 const Y=v=>(1-v)*H;
 for(const b of o.bands||[]){x.fillStyle=b.c;x.fillRect(0,Y(b.v1),W,Y(b.v0)-Y(b.v1));if(b.r){rx.fillStyle=b.r;rx.fillRect(0,Y(b.v1),W,Y(b.v0)-Y(b.v1));}}
 x.lineWidth=2.5;
 for(const v of o.rings||[]){x.strokeStyle='rgba(0,0,0,0.55)';x.beginPath();x.moveTo(0,Y(v));x.lineTo(W,Y(v));x.stroke();x.strokeStyle='rgba(255,255,255,0.18)';x.beginPath();x.moveTo(0,Y(v)+2);x.lineTo(W,Y(v)+2);x.stroke();
  if(o.rivets){x.fillStyle='rgba(0,0,0,0.45)';for(let u=0;u<W;u+=W/48){x.beginPath();x.arc(u,Y(v)+7,1.8,0,7);x.fill();x.beginPath();x.arc(u,Y(v)-7,1.8,0,7);x.fill();}}}
 for(const p of o.panels||[]){const [u0,u1,v0,v1]=p;x.strokeStyle='rgba(0,0,0,0.5)';x.lineWidth=2;x.strokeRect(u0*W,Y(v1),(u1-u0)*W,Y(v0)-Y(v1));
  x.fillStyle='rgba(0,0,0,0.5)';for(const [a,b] of [[u0,v0],[u1,v0],[u0,v1],[u1,v1]]){x.beginPath();x.arc(a*W+(a==u0?6:-6),Y(b)+(b==v0?-6:6),2.2,0,7);x.fill();}}
 for(const s of o.text||[]){x.save();x.translate(s.u*W,Y(s.v));x.rotate(PI/2);x.scale(-1,-1);x.fillStyle=s.c||'#111';x.font=`${s.b?'bold ':''}${s.s||28}px "DejaVu Sans Condensed",Arial Narrow,Arial,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(s.t,0,0);x.restore();}
 const mk=cv=>{const t=new T.CanvasTexture(cv);t.colorSpace=cv===c?T.SRGBColorSpace:T.NoColorSpace;t.anisotropy=8;return t;};
 return cache[key]={map:mk(c),rough:mk(r)};}
function mat(c,m=0.2,r=0.5,extra){return new (extra&&extra.clearcoat?T.MeshPhysicalMaterial:T.MeshStandardMaterial)(Object.assign({color:c,metalness:m,roughness:r},extra||{}));}
const glass=()=>new T.MeshPhysicalMaterial({color:0x223040,metalness:0,roughness:0.03,transmission:0.0,clearcoat:1,clearcoatRoughness:0.02,reflectivity:1,sheen:0,iridescence:0.4,transparent:true,opacity:0.92});
// lathe body: pts [[r,y]] y from tail(0) to nose(L); returns mesh with axis on Z, nose -Z, positioned so y=0 at z=+zoff
function lathe(pts,material,seg=48){const g=new T.LatheGeometry(pts.map(p=>new T.Vector2(Math.max(p[0],1e-4),p[1])),seg);const L=pts[pts.length-1][1];
 // remap v to length fraction for skin textures
 const uv=g.attributes.uv,pos=g.attributes.position;for(let i=0;i<uv.count;i++)uv.setY(i,pos.getY(i)/L);
 g.rotateX(-PI/2);g.computeVertexNormals();const m=new T.Mesh(g,material);m.castShadow=m.receiveShadow=true;return m;}
function ogive(R,Ln,y0,n=14,tip=0.0){const a=[];for(let i=0;i<=n;i++){const t=i/n;const rho=(R*R+Ln*Ln)/(2*R);const yy=t*Ln;const r=Math.sqrt(rho*rho-yy*yy)+R-rho;a.push([Math.max(r,tip*(1-t)+0.0005),y0+yy]);}return a;}
// fin: planform (root chord at y, span outward x) -> thin bevelled plate. pts=[[x,y]...]; thick
function fin(pts,th,material){const s=new T.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();
 const g=new T.ExtrudeGeometry(s,{depth:th*0.4,bevelEnabled:true,bevelThickness:th*0.3,bevelSize:Math.min(th*0.9,0.006),bevelSegments:2,curveSegments:2});g.translate(0,0,-th*0.2);
 // plane XY -> span on X, chord on -Z (y->-z)
 g.rotateX(-PI/2);g.computeVertexNormals();const m=new T.Mesh(g,material);m.castShadow=true;return m;}
// place n fins around axis at body radius rb, root leading edge at axial position z (fin pts y measured nose-ward from root trailing edge)
function finSet(G,n,rb,z,pts,th,material,roll=0){const out=[];for(let i=0;i<n;i++){const p=new T.Group();const f=fin(pts,th,material);f.position.x=rb*0.97;p.add(f);p.rotation.z=roll+i*2*PI/n;p.position.z=z;G.add(p);out.push(p);}return out;}
function ring(G,r,w,z,material,seg=48){const m=new T.Mesh(new T.CylinderGeometry(r,r,w,seg,1,true),material);m.rotation.x=PI/2;m.position.z=z;G.add(m);return m;}
function box(G,sx,sy,sz,material,x,y,z){const m=new T.Mesh(new T.BoxGeometry(sx,sy,sz),material);m.position.set(x,y,z);G.add(m);return m;}
function nozzle(G,r0,r1,len,z,inner=0x1a1410){const g=new T.CylinderGeometry(r0,r1,len,40,1,true);g.rotateX(PI/2);
 const o=new T.Mesh(g,mat(0x2a2826,0.7,0.45,{side:T.DoubleSide}));o.position.z=z;G.add(o);
 const ig=new T.CircleGeometry(r0*0.98,32);const ic=new T.Mesh(ig,mat(inner,0.2,0.95));ic.position.z=z-len/2+0.002;G.add(ic);return o;}
function fin0(G){G.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return G;}

// =================== AIM-120C AMRAAM ===================  L 3.66 m, Ø 0.178 m
function aim120(){const G=new T.Group();G.name='AIM-120C';const L=3.66,R=0.089;
 const sk=skin('a120',{base:'#d9dbd8',bands:[{v0:0.60,v1:0.625,c:'#e3b81c'},{v0:0.22,v1:0.245,c:'#7a5230'}],rings:[0.13,0.47,0.6,0.66,0.77,0.84],rivets:1,
  panels:[[0.1,0.18,0.5,0.58],[0.6,0.68,0.5,0.58],[0.3,0.36,0.68,0.75],[0.05,0.12,0.25,0.4]],
  text:[{u:0.25,v:0.42,t:'GUIDED MISSILE AIR INTERCEPT AIM-120C-7',s:24,b:1},{u:0.29,v:0.42,t:'LOT 21  RMD 09/26   DOMINION ORDNANCE',s:18},{u:0.75,v:0.42,t:'WARHEAD WDU-41/B   HE',s:22,b:1},{u:0.25,v:0.18,t:'ROCKET MOTOR WPU-16/B',s:20},{u:0.75,v:0.72,t:'⚠ DANGER  RF EMITTER',s:18,c:'#a01010'}]});
 const body=mat(0xffffff,0.15,0.55,{map:sk.map,roughnessMap:sk.rough});
 const pts=[[0.072,0],[0.085,0.05],[R,0.12],[R,2.92]].concat(ogive(R,0.74,2.92,16,0.004).slice(1));
 const m=lathe(pts,body);m.position.z=L/2;G.add(m);
 // radome cap (slightly different shade, composite)
 const rd=lathe(ogive(R*0.985,0.74,0,16,0.004),mat(0xcfd0cc,0,0.35));rd.position.z=L/2-2.921;G.add(rd);
 const tip=new T.Mesh(new T.SphereGeometry(0.006,8,8),mat(0x333333,0.8,0.3));tip.position.z=-L/2;G.add(tip);
 const fm=mat(0xd2d4d0,0.25,0.5);
 // mid-body wings (clipped delta, span 0.447 total -> 0.18 exposed) ; leading edge ~1.57 m from nose
 finSet(G,4,R,-L/2+1.57,[[0,0],[0,-0.38],[0.135,-0.30],[0.135,-0.24]].map(p=>[p[0],-p[1]]).map(p=>[p[0],-p[1]]),0.008,fm,PI/4);
 // tail control fins (span 0.627)
 const tf=finSet(G,4,R,L/2-0.30,[[0,0],[0.225,-0.045],[0.225,-0.20],[0,-0.30]],0.009,fm,PI/4);
 // fin actuator fairings & hinge
 for(let i=0;i<4;i++){const a=PI/4+i*PI/2;const h=new T.Mesh(new T.CylinderGeometry(0.012,0.012,0.04,10),mat(0x777777,0.8,0.35));h.position.set(Math.cos(a)*(R+0.005),Math.sin(a)*(R+0.005),L/2-0.16);h.rotation.z=a-PI/2;G.add(h);}
 // umbilical / launch hangers (lugs) and wire-tunnel raceway on top
 box(G,0.03,0.025,1.5,mat(0xc6c8c4,0.2,0.6),0,R+0.01,-0.15);
 for(const z of [-0.55,0.35])box(G,0.035,0.03,0.06,mat(0x555555,0.9,0.3),0,R+0.03,z);
 nozzle(G,0.055,0.07,0.08,L/2+0.02);
 G.userData={len:L,diam:0.178,tailFins:tf,nozzleZ:L/2+0.06};return fin0(G);}

// =================== AIM-9X Sidewinder Blk II ===================  L 3.02, Ø 0.127
function aim9x(){const G=new T.Group();G.name='AIM-9X';const L=3.02,R=0.0635;
 const sk=skin('a9x',{base:'#c9cbc8',bands:[{v0:0.78,v1:0.80,c:'#e3b81c'},{v0:0.43,v1:0.45,c:'#7a5230'}],rings:[0.08,0.53,0.72,0.86,0.93],rivets:1,
  panels:[[0.12,0.22,0.6,0.68],[0.62,0.72,0.6,0.68]],
  text:[{u:0.25,v:0.3,t:'AIM-9X-2   GUIDED MISSILE',s:22,b:1},{u:0.75,v:0.3,t:'MK 139 MOD 0 ROCKET MOTOR',s:18},{u:0.25,v:0.66,t:'WDU-17/B ANNULAR BLAST FRAG',s:18},{u:0.75,v:0.66,t:'ACTIVE OPTICAL TARGET DETECTOR',s:16}]});
 const body=mat(0xffffff,0.15,0.55,{map:sk.map,roughnessMap:sk.rough});
 const pts=[[0.05,0],[R,0.04],[R,2.86],[0.058,2.93],[0.045,2.975]];const m=lathe(pts,body);m.position.z=L/2;G.add(m);
 // hemispherical IR dome (sapphire/MgF2)
 const dg=new T.SphereGeometry(0.046,32,16,0,PI*2,0,PI/2);dg.rotateX(-PI/2);const dome=new T.Mesh(dg,glass());dome.position.z=-L/2+0.045;G.add(dome);
 const seek=new T.Mesh(new T.SphereGeometry(0.03,16,12),mat(0x8a6a3a,0.9,0.15));seek.position.z=-L/2+0.06;G.add(seek);
 const fm=mat(0xbfc1be,0.25,0.5);
 // tiny fixed forward strakes (9X has reduced-size fixed wings)
 finSet(G,4,R,-L/2+0.62,[[0,0],[0.035,-0.06],[0.035,-0.30],[0,-0.36]].map(p=>[p[0],-p[1]]).map(p=>[p[0],-p[1]]),0.005,fm,PI/4);
 // tail control fins: low aspect, clipped (span ~0.35 total) 
 const tf=finSet(G,4,R,L/2-0.25,[[0,0],[0.11,-0.08],[0.11,-0.16],[0,-0.25]],0.007,fm,PI/4);
 // jet-vane thrust vector control housing
 for(let i=0;i<4;i++){const a=PI/4+i*PI/2;const v=box(G,0.008,0.03,0.05,mat(0x2c2c2c,0.8,0.4),Math.cos(a)*0.035,Math.sin(a)*0.035,L/2+0.02);v.rotation.z=a;}
 nozzle(G,0.04,0.05,0.05,L/2+0.005);
 box(G,0.02,0.018,0.9,mat(0xb5b7b4,0.2,0.6),0,R+0.008,-0.1);
 G.userData={len:L,diam:0.127,tailFins:tf,nozzleZ:L/2+0.04};return fin0(G);}

// =================== BGM/RGM-109E Tomahawk Blk IV ===================  L 5.56, Ø 0.518, span 2.67
function tomahawk(opt={}){const G=new T.Group();G.name='Tomahawk';const L=5.56,R=0.259;
 const sk=skin('tlam',{base:'#b9bcb8',bands:[{v0:0.92,v1:1,c:'#2a2c2e',r:'#606060'},{v0:0.70,v1:0.72,c:'#e3b81c'},{v0:0.16,v1:0.175,c:'#7a5230'}],rings:[0.12,0.27,0.42,0.58,0.72,0.84,0.92],rivets:1,
  panels:[[0.2,0.3,0.45,0.55],[0.7,0.8,0.45,0.55],[0.05,0.15,0.75,0.82],[0.55,0.65,0.3,0.38]],
  text:[{u:0.25,v:0.55,t:'U.S. NAVY   RGM-109E TOMAHAWK',s:34,b:1},{u:0.27,v:0.55,t:'',s:10},{u:0.75,v:0.55,t:'WDU-36/B  1000 LB CLASS  HE',s:26,b:1},{u:0.25,v:0.33,t:'F107-WR-402 TURBOFAN',s:22},{u:0.75,v:0.8,t:'NO STEP',s:22,c:'#a01010'},{u:0.25,v:0.8,t:'NO STEP',s:22,c:'#a01010'}]});
 const body=mat(0xffffff,0.2,0.5,{map:sk.map,roughnessMap:sk.rough});
 const pts=[[0.17,0],[0.22,0.12],[R,0.38],[R,4.9]].concat(ogive(R,0.66,4.9,14).slice(1)).map(p=>[Math.min(p[0],R),p[1]]);
 // hemispherical-ish blunt nose: end at small radius then cap
 const m=lathe(pts.concat([[0.0005,L]]),body);m.position.z=L/2;G.add(m);
 // flattened lower body (Tomahawk has a flat keel) – a strip
 box(G,0.30,0.02,4.2,mat(0xadb0ac,0.2,0.55),0,-R+0.008,0.15);
 // pop-out ventral NACA inlet scoop
 const ig=new T.BoxGeometry(0.28,0.13,0.62);const inl=new T.Mesh(ig,mat(0xa9aca8,0.2,0.5));inl.position.set(0,-R-0.05,1.55);G.add(inl);
 const mouth=new T.Mesh(new T.PlaneGeometry(0.24,0.1),mat(0x070707,0,1));mouth.position.set(0,-R-0.05,1.239);mouth.rotation.y=PI;G.add(mouth);
 const dep=opt.deployed!==false;
 // wings: deploy from slot in mid-body, straight slender, span 2.67
 const wm=mat(0xbcbfbb,0.2,0.5);const wings=[];
 for(const s of [1,-1]){const w=fin([[0,0],[1.15,0.05],[1.15,0.28],[0,0.36]],0.022,wm);const p=new T.Group();p.add(w);p.position.set(0,0.02,-0.1);p.rotation.z=s>0?0:PI;p.rotation.y=dep?0:(s>0?-1:1)*PI/2*0.98;G.add(p);w.position.x=R*0.7;wings.push(p);}
 // tail: 4 control fins in X (cruciform rotated 45)
 const tf=finSet(G,4,R,L/2-0.42,[[0,0],[0.42,-0.16],[0.42,-0.36],[0,-0.42]].map(p=>[p[0],p[1]]),0.016,wm,PI/4);
 if(!dep)tf.forEach(f=>f.scale.set(0.15,1,1));
 nozzle(G,0.09,0.11,0.12,L/2+0.03);
 // optional Mk 135 booster
 if(opt.booster){const b=lathe([[0.15,0],[R,0.08],[R,0.69]],mat(0x3a3d3a,0.3,0.6));b.position.z=L/2+0.69;G.add(b);nozzle(G,0.12,0.17,0.2,L/2+0.78);}
 G.userData={len:L,diam:0.518,wings,tailFins:tf,deploy(t){/* t 0..1 */wings.forEach((p,i)=>p.rotation.y=(i?1:-1)*PI/2*0.98*(1-t));tf.forEach(f=>f.scale.set(0.15+0.85*t,1,1));},nozzleZ:L/2+0.1};return fin0(G);}

// =================== Hypersonic glide vehicle (wedge-cone HGV, ~Avangard / C-HGB class) ===================  L 5.4
function hgv(){const G=new T.Group();G.name='HGV';const L=5.4;
 const tiles=[];for(let a=0;a<10;a++)for(let b=0;b<24;b++)if(Math.random()<0.45)tiles.push([a/10,(a+1)/10,b/24*0.86,(b+1)/24*0.86]);
 const tps=skin('hgv2',{base:'#1c1d1f',rough:'#a8a8a8',dirt:'130,115,100',bands:[{v0:0.86,v1:1,c:'#3d3a37',r:'#d0d0d0'},{v0:0.0,v1:0.03,c:'#5a5752'}],rings:[0.03,0.17,0.31,0.45,0.59,0.73,0.86],
  panels:tiles,text:[{u:0.25,v:0.5,t:'C/SiC TPS — NO STEP — NO HANDLING W/O GLOVES',s:18,c:'#6c6a66'},{u:0.75,v:0.2,t:'RCS',s:20,c:'#7a7a7a'}]});
 const m0=mat(0xffffff,0.35,0.72,{map:tps.map,roughnessMap:tps.rough});
 const pts=[[0.40,0],[0.44,0.6],[0.42,1.6],[0.30,3.4],[0.12,4.9],[0.035,5.35],[0.0005,L]];
 const m=lathe(pts,m0,72);const pa=m.geometry.attributes.position;for(let i=0;i<pa.count;i++){let y=pa.getY(i);if(y<-0.12)pa.setY(i,-0.12+(y+0.12)*0.15);pa.setX(i,pa.getX(i)*1.25);}m.geometry.computeVertexNormals();m.position.z=L/2;G.add(m);
 const tip=new T.Mesh(new T.SphereGeometry(0.035,16,12),mat(0x5a5048,0.5,0.45,{emissive:0x401000,emissiveIntensity:0.6}));tip.position.z=-L/2+0.05;G.add(tip);
 const fm=mat(0x2b2c2f,0.4,0.6),hm=mat(0x6b6660,0.8,0.35),em=mat(0x46423d,0.3,0.55);
 // chine leading edges (lighter C-C) along the flat belly edges
 for(const s of [1,-1]){const st=fin([[0,0],[0.11,0.25],[0.10,2.4],[0.02,3.9],[0,4.0]],0.012,em);const g=new T.Group();g.add(st);st.position.x=0.36;g.rotation.z=s>0?-0.04:PI+0.04;g.position.z=L/2-0.15;g.position.y=-0.105;G.add(g);}
 // split body-flap elevons with hinge line + actuator fairings
 const flaps=[];for(const s of [1,-1]){const p=new T.Group();p.position.set(s*0.27,-0.1,L/2);const f=box(p,0.36,0.03,0.45,fm,0,0,0.225);flaps.push(p);G.add(p);
  const h=new T.Mesh(new T.CylinderGeometry(0.018,0.018,0.36,12),hm);h.rotation.z=PI/2;p.add(h);
  const af=new T.Mesh(new T.CapsuleGeometry(0.03,0.35,4,10),fm);af.rotation.x=PI/2;af.position.set(s*0.27,0.02,L/2-0.12);G.add(af);}
 // canted aft fins with rudders
 for(const s of [1,-1]){const f=fin([[0,0],[0.32,0.38],[0.32,0.55],[0,0.9]],0.016,fm);const g=new T.Group();g.add(f);f.position.x=0.15;g.rotation.z=PI/2+s*0.5;g.position.z=L/2-0.9;G.add(g);
  // flip chord direction (fin pts y = nose-ward from tail)
  f.rotation.y=0;}
 // RCS thruster clusters
 for(const s of [1,-1])for(const k of [0,1]){const n=new T.Mesh(new T.CylinderGeometry(0.012,0.02,0.03,10,1,true),mat(0x0a0a0a,0.6,0.5,{side:T.DoubleSide}));n.rotation.z=PI/2;n.position.set(s*0.5,0.02+k*0.06,L/2-0.6);G.add(n);}
 // antenna windows on upper surface
 for(const z of [-0.4,0.6]){const w=new T.Mesh(new T.CircleGeometry(0.05,20),mat(0xd8d2c4,0.0,0.7));w.rotation.x=-PI/2;w.position.set(0,0.38-(z+2.7)*0.005,z);G.add(w);}
 // base plate with frame ring, separation fittings
 const bp=new T.Mesh(new T.CircleGeometry(0.4,48),mat(0x111111,0.4,0.8));bp.scale.x=1.25;bp.position.z=L/2+0.001;G.add(bp);
 const br=new T.Mesh(new T.TorusGeometry(0.37,0.02,8,48),hm);br.scale.x=1.25;br.position.z=L/2+0.01;G.add(br);
 for(let i=0;i<4;i++){const a=PI/4+i*PI/2;box(G,0.06,0.06,0.04,hm,Math.cos(a)*0.38,Math.sin(a)*0.2,L/2+0.02);}
 G.userData={len:L,diam:0.88,flaps,tip,glow(k){tip.material.emissiveIntensity=0.6+k*6;m0.emissive=new T.Color(0x701c00);m0.emissiveIntensity=k*0.5;em.emissive=new T.Color(0xff5010);em.emissiveIntensity=k*1.2;}};return fin0(G);}

// =================== Mk 48 ADCAP torpedo ===================  L 5.8, Ø 0.533
function mk48(opt={}){const G=new T.Group();G.name='Mk48 ADCAP';const L=5.8,R=0.2665;
 const war=opt.exercise?'#d86a1c':'#2d3a2f';
 const sk=skin('mk48'+(opt.exercise?'x':''),{base:war,bands:[{v0:0.88,v1:1,c:opt.exercise?'#d86a1c':'#23302a'},{v0:0.70,v1:0.72,c:'#e3b81c'}],rings:[0.15,0.22,0.55,0.70,0.80,0.88],rivets:1,
  panels:[[0.1,0.2,0.3,0.4],[0.6,0.7,0.3,0.4],[0.35,0.42,0.6,0.66]],
  text:[{u:0.25,v:0.45,t:'TORPEDO MK 48 MOD 7 CBASS',s:30,b:1,c:'#e8e8e0'},{u:0.75,v:0.45,t:'WARSHOT  PBXN-103  650 LB',s:26,c:'#e8e8e0'},{u:0.25,v:0.75,t:'GUIDANCE & CONTROL',s:20,c:'#d0d0c8'},{u:0.25,v:0.18,t:'OTTO FUEL II — AFTERBODY',s:20,c:'#d0d0c8'}]});
 const body=mat(0xffffff,0.25,0.4,{map:sk.map,roughnessMap:sk.rough,clearcoat:0.4});
 const pts=[[0.13,0],[0.16,0.25],[0.22,0.6],[R,1.05],[R,5.35]];for(let i=1;i<=10;i++){const a=i/10*PI/2;pts.push([R*Math.cos(a)*1+0.0,5.35+Math.sin(a)*0.45]);}
 const m=lathe(pts,body,64);m.position.z=L/2;G.add(m);
 // sonar nose window (flat-ish acoustic array face)
 const nw=new T.Mesh(new T.SphereGeometry(0.22,32,16,0,PI*2,0,0.65),mat(0x161a18,0.1,0.25));nw.rotation.x=-PI/2;nw.position.z=-L/2+0.43;G.add(nw);
 // pump-jet propulsor: aerofoil-section duct, 9 stator vanes ahead of a 13-blade skewed rotor, conical hub
 const pz=L/2+0.02,duct=[];const ch=0.36;for(let i=0;i<=16;i++){const t=i/16,th=0.022*Math.sin(t*PI)*(1-0.35*t);duct.push([0.175-0.012*t+th,t*ch]);}for(let i=16;i>=0;i--){const t=i/16;duct.push([0.175-0.012*t-0.004,t*ch]);}
 const dg=new T.LatheGeometry(duct.map(p=>new T.Vector2(p[0],p[1])),56);dg.rotateX(PI/2);dg.computeVertexNormals();const dm=new T.Mesh(dg,mat(0x1c231e,0.45,0.38,{side:T.DoubleSide}));dm.position.z=pz-0.18+0.36-0.18;dm.position.z=pz-0.08;G.add(dm);
 const blade=new T.MeshStandardMaterial({color:0xa08a62,metalness:0.95,roughness:0.22,side:T.DoubleSide});
 const stator=new T.Group();for(let i=0;i<9;i++){const p=new T.Group();const b=box(p,0.006,0.115,0.07,mat(0x1c231e,0.5,0.4),0,0.1,0);b.rotation.y=-0.25;p.rotation.z=i*2*PI/9;stator.add(p);}stator.position.z=pz-0.02;G.add(stator);
 const rotor=new T.Group();for(let i=0;i<13;i++){const p=new T.Group();
  const sh=new T.Shape();sh.moveTo(0,0.045);sh.quadraticCurveTo(0.03,0.11,0.012,0.168);sh.lineTo(-0.035,0.165);sh.quadraticCurveTo(-0.03,0.09,-0.03,0.045);sh.closePath();
  const bg=new T.ExtrudeGeometry(sh,{depth:0.004,bevelEnabled:false});bg.rotateY(PI/2-0.55);const b=new T.Mesh(bg,blade);p.add(b);p.rotation.z=i*2*PI/13;rotor.add(p);}
 rotor.position.z=pz+0.1;G.add(rotor);
 const hub=lathe([[0.0005,0],[0.03,0.05],[0.055,0.17],[0.06,0.3]],mat(0x8f7c58,0.9,0.28),32);hub.position.z=pz+0.3;G.add(hub);
 // 4 control surfaces as duct struts (cruciform, with trailing rudders)
 const tf=finSet(G,4,0.135,pz-0.32,[[0,0],[0.06,-0.05],[0.06,-0.3],[0,-0.32]],0.012,mat(0x1f2822,0.4,0.45),0);
 // guidance wire dispenser stub + lifting lugs
 box(G,0.05,0.03,0.12,mat(0x666666,0.9,0.3),0,R+0.01,-0.6);box(G,0.05,0.03,0.12,mat(0x666666,0.9,0.3),0,R+0.01,0.9);
 G.userData={len:L,diam:0.533,rotor,tailFins:tf,spin(dt){rotor.rotation.z+=dt*60;}};return fin0(G);}

// =================== Mk 12A re-entry vehicle ===================  L 1.8, base Ø 0.54
function mk12a(){const G=new T.Group();G.name='Mk12A RV';const L=1.8;
 const sk=skin('rv',{base:'#2b2622',rough:'#c8c8c8',dirt:'150,120,90',rings:[0.15,0.5],text:[{u:0.25,v:0.3,t:'MK 12A',s:40,c:'#8a7a6a'}]});
 const m=lathe([[0.27,0],[0.27,0.04],[0.21,0.4],[0.03,1.74],[0.0005,L]],mat(0xffffff,0.2,0.85,{map:sk.map,roughnessMap:sk.rough}),48);m.position.z=L/2;G.add(m);
 const tip=new T.Mesh(new T.SphereGeometry(0.03,12,10),mat(0x55504a,0.6,0.5));tip.position.z=-L/2+0.04;G.add(tip);
 const base=new T.Mesh(new T.CircleGeometry(0.27,40),mat(0x8a8a86,0.8,0.4));base.position.z=L/2;G.add(base);
 G.userData={len:L,diam:0.54};return fin0(G);}

// =================== LGM-30G Minuteman III ===================  L 18.2, Ø 1.68
function minuteman3(opt={}){const G=new T.Group();G.name='LGM-30G Minuteman III';const L=18.2;
 const sk=skin('mm3',{base:'#e6e6e2',bands:[{v0:0,v1:0.04,c:'#1e1e1e'},{v0:0.40,v1:0.42,c:'#1e1e1e'},{v0:0.62,v1:0.64,c:'#1e1e1e'},{v0:0.75,v1:0.77,c:'#1e1e1e'},{v0:0.93,v1:1,c:'#1e1e1e'}],rings:[0.04,0.1,0.2,0.3,0.4,0.42,0.52,0.62,0.64,0.7,0.75,0.77,0.85,0.93],rivets:1,
  panels:[[0.2,0.3,0.12,0.18],[0.7,0.8,0.12,0.18],[0.45,0.55,0.66,0.72]],
  text:[{u:0.25,v:0.24,t:'UNITED STATES AIR FORCE',s:64,b:1,c:'#151515'},{u:0.75,v:0.24,t:'UNITED STATES AIR FORCE',s:64,b:1,c:'#151515'},{u:0.25,v:0.51,t:'SR19-AJ-1',s:30,c:'#202020'},{u:0.25,v:0.08,t:'M55A1 STAGE 1',s:30,c:'#202020'},{u:0.75,v:0.69,t:'SR73-AJ-1  PSRE',s:26,c:'#202020'},{u:0.5,v:0.88,t:'⚠ RV SECTION',s:26,c:'#a01010'}]});
 const body=mat(0xffffff,0.15,0.55,{map:sk.map,roughnessMap:sk.rough});
 const pts=[[0.84,0],[0.84,7.5],[0.70,7.65],[0.66,11.3],[0.66,13.6],[0.62,13.9]];
 const shroud=opt.shroud!==false;
 if(shroud)pts.push(...ogive(0.62,4.3,13.9,16,0.02).slice(1));else pts.push([0.62,14.0],[0.0005,14.01]);
 const m=lathe(pts,body,64);m.position.z=L/2;G.add(m);
 // raceways (cable tunnels) on stage 1 and 2
 box(G,0.12,0.08,7.2,mat(0xdadad6,0.2,0.6),0,0.85,L/2-3.8);box(G,0.1,0.07,3.4,mat(0xdadad6,0.2,0.6),0,0.7,L/2-9.4);
 // stage 1: four gimballed nozzles
 const nz=[];for(let i=0;i<4;i++){const a=PI/4+i*PI/2;const g=new T.Group();g.position.set(Math.cos(a)*0.42,Math.sin(a)*0.42,L/2);nozzle(g,0.17,0.3,0.55,0.27);G.add(g);nz.push(g);}
 const skirt=ring(G,0.86,0.25,L/2-0.12,mat(0x202020,0.5,0.5,{side:T.DoubleSide}));
 if(!shroud){// PBV bus with three Mk12A RVs
  const bus=lathe([[0.62,0],[0.62,0.6],[0.55,0.75]],mat(0x9a9890,0.7,0.4));bus.position.z=L/2-13.9;G.add(bus);
  for(let i=0;i<3;i++){const a=i*2*PI/3+PI/2;const rv=mk12a();rv.position.set(Math.cos(a)*0.32,Math.sin(a)*0.32,L/2-14.6-0.9);rv.rotation.set(Math.sin(a)*0.06,-Math.cos(a)*0.06,0);G.add(rv);}}
 G.userData={len:L,diam:1.68,nozzles:nz,stages:[{z0:L/2-7.5,z1:L/2},{z0:L/2-11.3,z1:L/2-7.5},{z0:L/2-13.9,z1:L/2-11.3}]};return fin0(G);}

// =================== B61-12 gravity bomb ===================  L 3.6, Ø 0.34 — stubby bomb body, blunt round nose, tail-kit with 4 small fins
function b61(){const G=new T.Group();G.name='B61-12';const L=3.6,R=0.17;
 const sk=skin('b61b',{base:'#bfc2c1',rough:'#4e4e4e',bands:[{v0:0.0,v1:0.27,c:'#a3a7a8'},{v0:0.86,v1:1,c:'#8e9294'},{v0:0.62,v1:0.635,c:'#2a2c2e'}],rings:[0.11,0.27,0.40,0.62,0.635,0.75,0.86],rivets:1,
  panels:[[0.18,0.30,0.44,0.56],[0.68,0.80,0.44,0.56],[0.42,0.47,0.77,0.83],[0.05,0.13,0.15,0.22],[0.55,0.63,0.15,0.22]],
  text:[{u:0.25,v:0.50,t:'B61-12',s:44,b:1,c:'#1a1a1a'},{u:0.28,v:0.50,t:'BOMB, NUCLEAR  DOMINION TEST ARTICLE',s:16,c:'#1a1a1a'},{u:0.75,v:0.50,t:'B61-12',s:44,b:1,c:'#1a1a1a'},{u:0.25,v:0.19,t:'TAIL KIT ASSEMBLY  GPS/INS',s:18,c:'#202020'},{u:0.75,v:0.69,t:'⚠ HANDLE PER NWS',s:20,c:'#a01010'},{u:0.5,v:0.92,t:'RADAR',s:18,c:'#303030'}]});
 const body=mat(0xffffff,0.55,0.42,{map:sk.map,roughnessMap:sk.rough});
 // tail cone 0..0.95, cylinder to 3.08, blunt round nose (ellipsoidal) to 3.6
 const pts=[[0.105,0],[0.112,0.03],[0.125,0.35],[0.15,0.7],[R,0.97],[R,3.08]];for(let i=1;i<=14;i++){const a=i/14*PI/2;pts.push([R*Math.cos(a),3.08+0.52*Math.sin(a)]);}
 const m=lathe(pts,body,64);m.position.z=L/2;G.add(m);
 // tail kit fins: small, low aspect, cruciform (+), mounted on aft cone
 const fm=mat(0xa3a7a8,0.75,0.32);
 const tf=finSet(G,4,0.11,L/2-0.42,[[0,0],[0.115,-0.12],[0.115,-0.36],[0,-0.42]],0.014,fm,0);
 // fin actuator fairings
 for(let i=0;i<4;i++){const a=i*PI/2;const f=new T.Mesh(new T.CapsuleGeometry(0.018,0.2,4,8),fm);f.rotation.x=PI/2;f.position.set(Math.cos(a)*0.125,Math.sin(a)*0.125,L/2-0.2);G.add(f);}
 // tail end cap with plug
 const cap=new T.Mesh(new T.CircleGeometry(0.105,32),mat(0x555a5c,0.8,0.4));cap.position.z=L/2+0.001;G.add(cap);
 // spin-rocket motor ports (two, opposite)
 for(let i=0;i<2;i++){const a=i*PI;const p=new T.Mesh(new T.CylinderGeometry(0.02,0.02,0.04,14),mat(0x101010,0.5,0.6));p.position.set(Math.cos(a)*(R-0.005),Math.sin(a)*(R-0.005),-0.25);p.rotation.z=a+PI/2;G.add(p);}
 // suspension lugs (14in spacing) + sway-brace pads
 for(const z of [-0.18,0.18]){const lug=new T.Mesh(new T.TorusGeometry(0.022,0.007,6,14),mat(0x3a3a3a,0.9,0.3));lug.position.set(0,R+0.024,z);G.add(lug);}
 for(const z of [-0.5,0.5])box(G,0.12,0.006,0.08,mat(0x8a8d8e,0.7,0.4),0,R+0.001,z);
 G.userData={len:L,diam:0.34,tailFins:tf};return fin0(G);}

// =================== AGM-114R Hellfire ===================  L 1.63, Ø 0.178
function hellfire(){const G=new T.Group();G.name='AGM-114R Hellfire';const L=1.63,R=0.089;
 const sk=skin('hf',{base:'#4a5236',dirt:'30,25,10',bands:[{v0:0.58,v1:0.61,c:'#e3b81c'},{v0:0.2,v1:0.23,c:'#7a5230'}],rings:[0.32,0.58,0.75,0.88],rivets:1,
  panels:[[0.1,0.2,0.36,0.5],[0.6,0.7,0.36,0.5]],
  text:[{u:0.25,v:0.45,t:'AGM-114R',s:30,b:1,c:'#f0e070'},{u:0.75,v:0.45,t:'MULTI-PURPOSE WARHEAD',s:20,c:'#f0e070'},{u:0.25,v:0.12,t:'M36E3 MOTOR',s:18,c:'#e8e8d0'}]});
 const body=mat(0xffffff,0.15,0.6,{map:sk.map,roughnessMap:sk.rough});
 const pts=[[0.07,0],[R,0.04],[R,1.45],[0.083,1.52],[0.07,1.56]];const m=lathe(pts,body);m.position.z=L/2;G.add(m);
 // semi-active laser seeker dome (faceted window)
 const dg=new T.SphereGeometry(0.07,8,6,0,PI*2,0,PI/2);dg.rotateX(-PI/2);const d=new T.Mesh(dg,glass());d.position.z=-L/2+0.07;G.add(d);
 const fm=mat(0x464d33,0.2,0.6);
 // forward canards
 finSet(G,4,R,-L/2+0.28,[[0,0],[0.06,-0.03],[0.06,-0.08],[0,-0.11]],0.006,fm,PI/4);
 // long-chord mid wings (span 0.33)
 finSet(G,4,R,-L/2+0.85,[[0,0],[0.075,-0.06],[0.075,-0.52],[0,-0.55]],0.007,fm,PI/4);
 nozzle(G,0.045,0.055,0.05,L/2+0.015);
 for(const z of [-0.25,0.35])box(G,0.03,0.025,0.05,mat(0x333333,0.9,0.3),0,R+0.015,z);
 G.userData={len:L,diam:0.178};return fin0(G);}

// =================== GBU-43/B MOAB ===================  L 9.19, Ø 1.03, ~9,800 kg. Olive drab, yellow HE band, 4 lattice (grid) fins in X.
function moab(){const G=new T.Group();G.name='GBU-43/B MOAB';const L=9.19,R=0.515;
 const sk=skin('moab',{base:'#4d5236',dirt:'25,22,10',bands:[{v0:0.80,v1:0.825,c:'#e3b81c'},{v0:0.0,v1:0.12,c:'#454a30'}],rings:[0.12,0.30,0.48,0.66,0.80,0.825],rivets:1,
  panels:[[0.1,0.2,0.5,0.6],[0.6,0.7,0.5,0.6],[0.2,0.3,0.2,0.27],[0.7,0.8,0.2,0.27],[0.45,0.55,0.7,0.76]],
  text:[{u:0.25,v:0.56,t:'BOMB, GP  GBU-43/B   MASSIVE ORDNANCE AIR BLAST',s:34,b:1,c:'#e8e2b8'},{u:0.29,v:0.56,t:'H-6  18,700 LB  LOT 03  DOMINION',s:24,c:'#e8e2b8'},{u:0.75,v:0.56,t:'GBU-43/B',s:44,b:1,c:'#e8e2b8'},{u:0.25,v:0.2,t:'GPS/INS GUIDANCE  TAIL KIT',s:24,c:'#e8e2b8'},{u:0.75,v:0.2,t:'⚠ GRID FIN — KEEP CLEAR',s:22,c:'#d8c070'},{u:0.5,v:0.4,t:'HOIST HERE',s:20,c:'#e8e2b8'}]});
 const body=mat(0xffffff,0.2,0.62,{map:sk.map,roughnessMap:sk.rough});
 const pts=[[0.40,0],[0.44,0.15],[0.48,0.6],[R,1.2],[R,6.9]].concat(ogive(R,2.29,6.9,20,0.03).slice(1));
 const m=lathe(pts,body,64);m.position.z=L/2;G.add(m);
 const tip=new T.Mesh(new T.SphereGeometry(0.035,12,10),mat(0x3a3e2a,0.3,0.6));tip.position.z=-L/2+0.02;G.add(tip);
 // 4 lattice grid fins in X on short stub arms: frame + internal diagonal lattice
 const fm=mat(0x4a4f34,0.35,0.55),fins=[];
 for(let i=0;i<4;i++){const a=PI/4+i*PI/2;const p=new T.Group();p.rotation.z=a;p.position.z=L/2-0.55;G.add(p);fins.push(p);
  const fr=new T.Group();fr.position.x=R+0.62;p.add(fr);const W=1.05,H=0.7,t=0.025;// grid panel: spans radially (x) W, chord (z) depth H
  const bar=(w,h,d,x,y,z,rz=0)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),fm);b.position.set(x,y,z);b.rotation.z=rz;fr.add(b);};
  bar(W,t,H,0,-0.09,0);bar(W,t,H,0,0.09,0);bar(t,0.2,H,-W/2,0,0);bar(t,0.2,H,W/2,0,0);
  // lattice cells (diamond): diagonal webs viewed head-on
  for(let k=-4;k<=4;k++){bar(0.27,0.012,H,k*0.115,0,0,0.6);bar(0.27,0.012,H,k*0.115,0,0,-0.6);}
  const arm=new T.Mesh(new T.BoxGeometry(0.65,0.08,0.35),fm);arm.position.set(R+0.1,0,0);p.add(arm);}
 // fin actuator housing ring, tail cone cap
 const hr=new T.Mesh(new T.CylinderGeometry(0.43,0.43,0.5,40),mat(0x3c412b,0.4,0.5));hr.rotation.x=PI/2;hr.position.z=L/2-0.5;G.add(hr);
 const cap=new T.Mesh(new T.CircleGeometry(0.40,32),mat(0x2a2d20,0.5,0.6));cap.position.z=L/2+0.001;G.add(cap);
 // lifting lugs (heavy, 2), pallet rails / sway braces along bottom
 for(const z of [-1.2,1.0]){const lug=new T.Mesh(new T.TorusGeometry(0.07,0.025,8,16),mat(0x2e2e2e,0.9,0.3));lug.position.set(0,R+0.08,z);G.add(lug);const b=new T.Mesh(new T.BoxGeometry(0.18,0.06,0.25),mat(0x2e2e2e,0.9,0.3));b.position.set(0,R+0.01,z);G.add(b);}
 for(const s of [1,-1]){const rail=new T.Mesh(new T.BoxGeometry(0.06,0.06,5.0),mat(0x3a3e2a,0.5,0.5));rail.position.set(s*0.3,-R+0.03,-0.2);G.add(rail);}
 G.userData={len:L,diam:1.03,mass:9800,tailFins:fins};return fin0(G);}

// =================== M31A1 GMLRS ===================  L 3.94, Ø 0.227. Olive drab, 4 nose canards, 4 wrap-around tail fins
function gmlrs(){const G=new T.Group();G.name='M31 GMLRS';const L=3.94,R=0.1135;
 const sk=skin('gmlrs',{base:'#4f5638',dirt:'30,25,10',bands:[{v0:0.80,v1:0.82,c:'#e3b81c'},{v0:0.25,v1:0.27,c:'#7a5230'},{v0:0.9,v1:1,c:'#3c4130'}],rings:[0.08,0.5,0.66,0.8,0.9],rivets:1,
  panels:[[0.1,0.2,0.84,0.88],[0.6,0.7,0.84,0.88]],text:[{u:0.25,v:0.55,t:'ROCKET, GMLRS  M31A1  UNITARY',s:26,b:1,c:'#e8e2b8'},{u:0.75,v:0.55,t:'LOT 07  DOMINION',s:22,c:'#e8e2b8'},{u:0.25,v:0.3,t:'ROCKET MOTOR',s:20,c:'#e8e2b8'}]});
 const body=mat(0xffffff,0.15,0.6,{map:sk.map,roughnessMap:sk.rough});
 const m=lathe([[0.09,0],[R,0.05],[R,3.45]].concat(ogive(R,0.49,3.45,14,0.004).slice(1)),body);m.position.z=L/2;G.add(m);
 const fm=mat(0x495033,0.25,0.55);finSet(G,4,R,-L/2+0.62,[[0,0],[0.07,-0.03],[0.07,-0.12],[0,-0.15]],0.006,fm,PI/4);
 const tf=finSet(G,4,R,L/2-0.22,[[0,0],[0.14,-0.04],[0.14,-0.2],[0,-0.22]],0.006,fm,0);
 nozzle(G,0.07,0.09,0.08,L/2+0.02);G.userData={len:L,diam:0.227,tailFins:tf};return fin0(G);}
// =================== PrSM Increment 1 ===================  L 3.96, Ø 0.43 (2 per pod). Light gray, ogive nose, 4 aft control fins
function prsm(){const G=new T.Group();G.name='PrSM';const L=3.96,R=0.215;
 const sk=skin('prsm',{base:'#c9ccc8',bands:[{v0:0.78,v1:0.8,c:'#e3b81c'},{v0:0.3,v1:0.32,c:'#7a5230'}],rings:[0.1,0.45,0.62,0.78],rivets:1,
  panels:[[0.1,0.2,0.66,0.74],[0.6,0.7,0.66,0.74]],text:[{u:0.25,v:0.5,t:'PRECISION STRIKE MISSILE  INC 1',s:28,b:1},{u:0.75,v:0.5,t:'U.S. ARMY   DOMINION',s:24},{u:0.25,v:0.2,t:'SOLID ROCKET MOTOR',s:20}]});
 const body=mat(0xffffff,0.15,0.55,{map:sk.map,roughnessMap:sk.rough});
 const m=lathe([[0.17,0],[R,0.08],[R,2.9]].concat(ogive(R,1.06,2.9,16,0.006).slice(1)),body);m.position.z=L/2;G.add(m);
 const tf=finSet(G,4,R,L/2-0.4,[[0,0],[0.2,-0.12],[0.2,-0.32],[0,-0.4]],0.01,mat(0xb9bcb8,0.25,0.5),PI/4);
 nozzle(G,0.13,0.16,0.12,L/2+0.04);G.userData={len:L,diam:0.43,tailFins:tf};return fin0(G);}

const API={gmlrs,prsm,moab,aim120,aim9x,tomahawk,hgv,mk48,minuteman3,b61,hellfire,mk12a,
 // helper: build a model scaled to fit an existing game length (e.g. missileMesh length), keeping proportions
 make(name,opt,fitLen){const g=API[name](opt);if(fitLen){const s=fitLen/g.userData.len;g.scale.setScalar(s);}return g;}};
return API;})();
window.MSL_MODELS=MSL_MODELS;
//GMISSILES-END
