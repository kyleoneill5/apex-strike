// ===== detailed naval models (Arleigh Burke DDG, Nimitz CVN, Virginia SSN) =====
const NAVY=0x7d8791,NAVY_D=0x5c6670;
function textTex(txt,col='#e8e8e8',font='bold 90px Arial',w=256,h=128){return decalTex((x)=>{x.fillStyle=col;x.font=font;x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,h/2);},w,h);}
function vlsBlock(g,x,y,z,nx,nz){const m=M(0x4a5056);add(g,new THREE.BoxGeometry(nx*1.4,0.4,nz*1.4),m,x,y,z);for(let i=0;i<nx;i++)for(let k=0;k<nz;k++)add(g,new THREE.BoxGeometry(1.2,0.12,1.2),0x30353a,x+(i-(nx-1)/2)*1.4,y+0.25,z+(k-(nz-1)/2)*1.4);}
function mk45(g,x,y,z){const m=M(NAVY);const b=add(g,new THREE.CylinderGeometry(2.2,3,1.2,16),m,x,y,z);const t=new THREE.Mesh(new THREE.SphereGeometry(2.4,16,10,0,Math.PI*2,0,Math.PI/2),m);t.scale.set(1,0.8,1.4);t.position.set(x,y+0.6,z);g.add(t);add(g,cylZ(0.18,0.22,7,10),0x555b60,x,y+1.3,z-5);}
function ciws(g,x,y,z){add(g,new THREE.CylinderGeometry(1,1.2,1.6,12),0xdedede,x,y,z);const d=add(g,new THREE.CylinderGeometry(0.9,0.9,2.4,14),0xf2f2f2,x,y+2.2,z);const dm=new THREE.Mesh(new THREE.SphereGeometry(0.9,12,8,0,Math.PI*2,0,Math.PI/2),M(0xf2f2f2));dm.position.set(x,y+3.4,z);g.add(dm);add(g,cylZ(0.12,0.12,2.2,6),0x444444,x,y+1.2,z-1.6);}
destroyer=function(){const g=new THREE.Group(),c=NAVY;add(g,hullGeo(10,154,46,11),c,0,-5,0);add(g,hullGeo(10.05,154.2,46,4),0x6a2222,0,-5.4,0);
 add(g,new THREE.BoxGeometry(17,0.3,148),0x5a6168,0,6.05,4);// deck
 // forward superstructure with angled sides
 const ss=new THREE.Mesh(new THREE.CylinderGeometry(6.2,7.6,10,8,1).rotateY(Math.PI/8),M(c));ss.scale.set(1,1,1.6);ss.position.set(0,11,-8);g.add(ss);
 const ss2=new THREE.Mesh(new THREE.CylinderGeometry(4.8,6.2,6,8).rotateY(Math.PI/8),M(c));ss2.scale.set(1,1,1.4);ss2.position.set(0,19,-6);g.add(ss2);
 for(const [sx,sz,ry] of [[1,-1,0.6],[-1,-1,-0.6],[1,1,2.5],[-1,1,-2.5]]){const p=new THREE.Mesh(new THREE.CylinderGeometry(1.9,1.9,0.25,8).rotateX(Math.PI/2),M(0x6d7680));p.position.set(sx*5.6,15,-8+sz*6.5);p.rotation.y=ry;p.rotation.x=-0.25;g.add(p);} // SPY-1 faces
 add(g,new THREE.BoxGeometry(6,1.6,3),glassMat,0,21.2,-12.2);
 // tripod mast + radars
 for(const [x,z] of [[-1.5,-3],[1.5,-3],[0,-0.5]])add(g,new THREE.CylinderGeometry(0.25,0.4,18,6),0x6a7278,x,31,z);
 add(g,new THREE.BoxGeometry(5,0.4,2.5),0x6a7278,0,36,-2);add(g,new THREE.BoxGeometry(3.6,0.3,1.2),0x30353a,0,38,-2).rotation.y=0.6;add(g,new THREE.CylinderGeometry(0.1,0.1,8,4),0x555555,0,43,-2);add(g,new THREE.BoxGeometry(8,0.2,0.2),0x555555,0,40,-2);
 // funnels
 for(const z of [14,30]){add(g,new THREE.BoxGeometry(5,9,6),c,0,11,z);add(g,new THREE.BoxGeometry(4.2,1.6,4.6),0x22262a,0,16.2,z);}
 add(g,new THREE.BoxGeometry(12,7,26),c,0,9.5,22);
 // hangar & flight deck
 add(g,new THREE.BoxGeometry(15,8,16),c,0,10,46);add(g,new THREE.BoxGeometry(13,6,0.3),NAVY_D,0,9,54.1);
 const fd=new THREE.Mesh(new THREE.PlaneGeometry(16,20).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({map:textTex('H','#f0f0f0','bold 110px Arial',256,256),color:0x8a9096,roughness:0.9}));fd.position.set(0,6.25,64);g.add(fd);
 mk45(g,0,6.4,-52);vlsBlock(g,0,6.3,-37,4,6);vlsBlock(g,0,6.3,39,4,6);ciws(g,0,13.6,6.5);ciws(g,0,14,38);
 for(const sx of [-1,1]){add(g,cylZ(0.4,0.4,6,8),0x6a7278,sx*5,9,26).rotation.y=sx*0.3;}// harpoon tubes
 for(const sx of[-1,1])decal(g,textTex('51','#f2f2f2'),6,3,[sx*10.2,3,-55],[0,sx*Math.PI/2,0],0.95);
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;};
sub=function(){const g=new THREE.Group(),c=0x1a1d20;const hm=M(c,{roughness:0.85,metalness:0.1});
 const prof=[[-57,0],[-56,1.6],[-53,3.0],[-49,4.0],[-44,4.9],[-38,5.1],[30,5.1],[38,4.6],[46,3.3],[52,1.9],[55,1.4]];
 g.add(fuse(prof,1,1,hm,32));for(let z=-40;z<30;z+=6){const r=new THREE.Mesh(new THREE.TorusGeometry(5.11,0.04,3,32),M(0x111315));r.position.z=z;g.add(r);}
 // sail
 const sailS=new THREE.Shape();sailS.moveTo(-4.5,0);sailS.quadraticCurveTo(-5.2,4,-3.8,7.6);sailS.lineTo(4.8,7.6);sailS.lineTo(5.6,0);sailS.closePath();
 const sail=new THREE.Mesh(new THREE.ExtrudeGeometry(sailS,{depth:2.4,bevelEnabled:true,bevelSize:0.3,bevelThickness:0.4,bevelSegments:2}).translate(0,0,-1.2).rotateY(Math.PI/2),hm);sail.position.set(0,4.4,-26);g.add(sail);
 for(const [x,h] of [[-0.4,2.8],[0.4,2],[0,3.4]])add(g,new THREE.CylinderGeometry(0.18,0.2,h,8),0x2a2d30,x,12+h/2,-27+x*3);
 for(const s of[-1,1]){const p=wingX([[0,1.6],[s*4,0.8],[s*4,-0.8],[0,-1.4]],0.25,hm);p.position.set(s*1.2,9.5,-26);g.add(p);} // sail planes
 for(const s of[-1,1]){const p=wingX([[0,1],[s*4,0],[s*4,-1.4],[0,-1.6]],0.2,hm);p.position.set(0,0,46);g.add(p);const v=finX([[1,0],[0,s*3.6],[-1.4,s*3.6],[-1.6,0]],0.2,hm);v.position.set(0,0,46);g.add(v);}
 const shroud=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.0,3.2,24,1,true).rotateX(Math.PI/2),M(0x15171a,DBL));shroud.position.z=55.6;g.add(shroud);add(g,new THREE.CylinderGeometry(0.7,0.4,2.6,10).rotateX(Math.PI/2),0x3a3020,0,0,55.6);
 for(let i=0;i<12;i++){const v=add(g,new THREE.BoxGeometry(0.1,1.6,0.6),0x3a3020,0,0,55.6);v.rotation.z=i/12*Math.PI*2;v.position.set(Math.cos(i/12*Math.PI*2)*1.1,Math.sin(i/12*Math.PI*2)*1.1,55.6);}
 for(let i=0;i<12;i++)for(const sx of[-1,1])add(g,new THREE.CylinderGeometry(1.0,1.0,0.14,16),0x22262a,sx*1.3,5.08,-14+i*2.9); // VPM / VLS hatches
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;};
// ---- carrier upgrade (Nimitz-class) ----
function deckTex2(){const W=512,H=2048;const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
 x.fillStyle='#3a3e42';x.fillRect(0,0,W,H);for(let i=0;i<9000;i++){x.fillStyle=`rgba(${Math.random()<0.5?0:255},${Math.random()<0.5?0:255},${Math.random()<0.5?0:255},0.03)`;x.fillRect(Math.random()*W,Math.random()*H,3+Math.random()*10,2);}
 for(let i=0;i<40;i++){x.fillStyle='rgba(0,0,0,0.12)';x.fillRect(150+Math.random()*120,1100+Math.random()*900,6,60+Math.random()*120);} // tire marks
 const px=u=>u/76*W,pz=v=>v/330*H; // deck 76 x 330 (x: -32..44 world, z: -170..160)
 // angled landing area centerline (from stern-left to forward)
 x.save();x.translate(px(30),pz(325));x.rotate(-0.157);x.strokeStyle='#e8e8e8';x.lineWidth=4;x.setLineDash([40,30]);x.beginPath();x.moveTo(0,0);x.lineTo(0,-pz(190));x.stroke();x.setLineDash([]);
 x.strokeStyle='#e8e8e8';x.lineWidth=3;x.strokeRect(-px(12),-pz(190),px(24),pz(190));x.fillStyle='#d0d0d0';for(let i=0;i<4;i++)x.fillRect(-px(12),-pz(78+i*9),px(24),3); // arrestor wires
 x.restore();
 // catapults
 x.strokeStyle='#bbb';x.lineWidth=3;for(const cx of [24,36])x.beginPath(),x.moveTo(px(cx),pz(10)),x.lineTo(px(cx),pz(100)),x.stroke();for(const cx of [8,14])x.beginPath(),x.moveTo(px(cx),pz(110)),x.lineTo(px(cx-3),pz(200)),x.stroke();
 x.strokeStyle='#d8c040';x.lineWidth=3;x.beginPath();x.moveTo(px(60),pz(20));x.lineTo(px(60),pz(300));x.stroke(); // foul line
 x.save();x.translate(px(30),pz(40));x.scale(-1,1);x.fillStyle='#e8e8e8';x.font='bold 160px Arial';x.textAlign='center';x.fillText('68',0,0);x.restore();
 const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
{const g=fleetCarrier;const deck=g.children.find(o=>o.geometry&&o.geometry.parameters&&o.geometry.parameters.width===76);if(deck)deck.material=new THREE.MeshStandardMaterial({map:deckTex2(),roughness:0.8,metalness:0.1});
 const c=0x6e7880;// island details
 add(g,new THREE.BoxGeometry(7,4,26),glassMat,32,37,30);add(g,new THREE.BoxGeometry(9,3,22),c,32,40.5,28);
 const sp=add(g,new THREE.BoxGeometry(5,0.3,2),0x30353a,32,55,30);sp.rotation.y=0.4;add(g,new THREE.CylinderGeometry(2,2,0.4,16),0x30353a,32,58,27);
 add(g,new THREE.CylinderGeometry(0.25,0.25,14,6),0x555555,32,58,32);for(const sx of[-1,1])add(g,new THREE.BoxGeometry(0.3,3,3),0x5a6168,32+sx*4.2,42,22);
 decal(g,textTex('68','#e8e8e8'),8,4,[27.9,36,40],[0,-Math.PI/2,0],0.95);
 // elevators edges, catwalk, CIWS, RAM
 for(const z of [-60,20,60])add(g,new THREE.BoxGeometry(16,0.4,18),0x34383c,46,20.8,z);ciws(g,-30,19,140);ciws(g,40,19,-150);
 // parked aircraft
 for(let i=0;i<7;i++){const a=fa18e(0x8a949c);a.scale.setScalar(1);a.position.set(36,21.6,-120+i*16);a.rotation.y=Math.PI/2+0.5;g.add(a);}
 for(let i=0;i<4;i++){const a=f35(0x6b737c);a.position.set(38,21.6,70+i*17);a.rotation.y=Math.PI/2+0.5;g.add(a);}
 // E-2 Hawkeye-ish (rotodome) and helo
 const e2=new THREE.Group();add(e2,cylZ(1,1.2,17,10),0xb8bcc0);add(e2,new THREE.BoxGeometry(24,0.4,3),0xb8bcc0,0,1,0);add(e2,new THREE.CylinderGeometry(3.6,3.6,0.7,24),0xdedede,0,3.4,1);e2.position.set(30,22.5,100);e2.rotation.y=0.3;g.add(e2);
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});}
// ===== AH-64D Apache (olive drab, tandem cockpit, stub wings + Hellfires, 4-blade rotor, chin gun) =====
heli=function(){const g=new THREE.Group(),od=M(0x4b5320,{roughness:0.8,metalness:0.15}),odD=M(0x4b5320,{roughness:0.8,metalness:0.15,side:THREE.DoubleSide}),dk=M(0x232523);
 const body=fuse([[-7.2,0.05],[-6.8,0.55],[-5.6,0.9],[-3.5,1.05],[-1,1.15],[1.0,1.1],[2.5,0.75],[4.5,0.45],[8.5,0.32],[9.6,0.22]],0.95,1.25,od,20);g.add(body);
 // tandem cockpit (gunner front, pilot rear, stepped)
 const c1=add(g,new THREE.BoxGeometry(1.25,0.9,1.6),glassMat,0,0.75,-4.9);const c2=add(g,new THREE.BoxGeometry(1.3,1.0,1.7),glassMat,0,1.15,-3.2);
 add(g,new THREE.BoxGeometry(1.32,0.08,3.6),dk,0,1.68,-4.0);
 // engine nacelles + exhaust
 for(const s of[-1,1]){add(g,cylZ(0.42,0.42,2.6,12),od,s*1.05,1.35,-0.2);add(g,new THREE.BoxGeometry(0.5,0.4,0.6),dk,s*1.15,1.35,1.2);}
 add(g,new THREE.BoxGeometry(1.6,0.7,2.4),od,0,1.55,-1.2);// rotor pylon fairing
 // stub wings + pylons + Hellfires/rocket pods
 for(const s of[-1,1]){g.add(Object.assign(wingX([[s*0.8,0.6],[s*2.6,0.3],[s*2.6,-0.7],[s*0.8,-0.9]],0.12,od),{}));const w=g.children[g.children.length-1];w.position.set(0,0.35,-1.2);
  for(const x of [1.4,2.3]){add(g,new THREE.BoxGeometry(0.15,0.45,0.6),dk,s*x,0.1,-1.3);
   if(x>2){for(const [dx,dy] of [[-0.15,-0.2],[0.15,-0.2],[-0.15,-0.5],[0.15,-0.5]]){add(g,cylZ(0.09,0.09,1.6,8),M(0xd8d4c0),s*x+dx,dy,-1.3);}}
   else{add(g,cylZ(0.28,0.28,1.6,12),dk,s*x,-0.3,-1.3);}}}
 // chin M230 gun
 add(g,new THREE.SphereGeometry(0.3,10,8),dk,0,-0.55,-4.0);add(g,cylZ(0.06,0.06,1.8,6),dk,0,-0.6,-4.9);
 // landing gear
 for(const s of[-1,1]){add(g,new THREE.BoxGeometry(0.1,0.9,0.1),dk,s*0.9,-0.9,-2.4);add(g,new THREE.CylinderGeometry(0.32,0.32,0.22,12).rotateZ(Math.PI/2),dk,s*0.95,-1.4,-2.4);}
 add(g,new THREE.CylinderGeometry(0.18,0.18,0.12,10).rotateZ(Math.PI/2),dk,0,-0.6,8.2);
 // tail: vertical fin + T-stabilizer
 const fin=finX([[8.6,0],[9.6,2.2],[10.2,2.2],[9.9,0]],0.1,odD);fin.position.set(0,0.25,0);g.add(fin);fin.position.z=0;fin.position.x=0;
 add(g,new THREE.BoxGeometry(3.4,0.08,0.8),od,0,0.35,9.2);
 // Longbow radar dome
 add(g,new THREE.SphereGeometry(0.55,14,10),od,0,3.45,-1.0).scale.set(1,0.55,1);
 const rot=new THREE.Group();rot.position.set(0,2.85,-1.0);for(let i=0;i<4;i++){const b=add(rot,new THREE.BoxGeometry(7.3,0.06,0.5),dk,3.65,0,0);const p=new THREE.Group();p.rotation.y=i*Math.PI/2;p.add(b);rot.add(p);}add(rot,new THREE.CylinderGeometry(0.3,0.35,0.5,10),dk);g.add(rot);g.userData.rotor=rot;
 const tr=new THREE.Group();tr.position.set(0.3,2.1,9.9);for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(0.05,1.4,0.18),dk);b.position.y=0.7;const p=new THREE.Group();p.rotation.x=i*Math.PI/2+(i%2?0.3:0);p.add(b);tr.add(p);}g.add(tr);g.userData.trotor=tr;
 decal(g,RND_LO,1.1,0.55,[1.0,0.7,3.2],[0,Math.PI/2,0],0.8);decal(g,decalTex((x,w,h)=>{x.fillStyle='#1a1a14';x.font='bold 46px Arial';x.textAlign='center';x.fillText('U.S. ARMY',w/2,80);}),2,1,[0.97,0.6,5.5],[0,Math.PI/2,0],0.8);
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;};
