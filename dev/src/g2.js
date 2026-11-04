// ---------- models ----------
const MC={};const M=(c,o={})=>{const k=c+JSON.stringify(o);if(MC[k])return MC[k];const {skin,...rest}=o;
 const m=new THREE.MeshStandardMaterial({color:c,map:skin==='camo'?camoTex:panelTex,normalMap:panelNrm,normalScale:new THREE.Vector2(0.35,0.35),roughness:skin==='camo'?0.8:0.55,metalness:skin==='camo'?0.15:0.35,envMapIntensity:0.8,...rest});return MC[k]=m;};
const glassMat=new THREE.MeshPhysicalMaterial({color:0x4a4a3a,metalness:0.6,roughness:0.06,clearcoat:1,clearcoatRoughness:0.05,envMapIntensity:1.5});
function add(g,geo,c,x=0,y=0,z=0,o){const m=new THREE.Mesh(geo,typeof c==='number'?M(c,o):c);m.position.set(x,y,z);g.add(m);return m;}
const cylZ=(r1,r2,l,s=8)=>new THREE.CylinderGeometry(r1,r2,l,s).rotateX(Math.PI/2); // r1 at -Z? (top->-Z)
const coneF=(r,l,s=8)=>new THREE.ConeGeometry(r,l,s).rotateX(-Math.PI/2); // tip -Z
function flat(pts,dbl=true){const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));return new THREE.ShapeGeometry(s).rotateX(-Math.PI/2);} // (x,fwd)->(x,0,-fwd)
function vflat(pts){const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));return new THREE.ShapeGeometry(s).rotateY(Math.PI/2);} // (fwd,up)->(0,up,-fwd)
const DBL={side:THREE.DoubleSide};
const flameMat=new THREE.MeshBasicMaterial({color:0xff8030,transparent:true,opacity:0.55,blending:THREE.AdditiveBlending,depthWrite:false});
function jet(c=0x6b7681,fa18=false){const g=new THREE.Group();
 add(g,cylZ(fa18?0.8:1.0,1.3,15,8),c,0,0,0);add(g,coneF(fa18?0.8:1.0,5,8),c,0,0,-10);
 const can=add(g,new THREE.SphereGeometry(0.75,10,8),glassMat,0,0.85,-6);can.scale.set(1,0.8,2.6);
 const w=fa18?[[0.9,3],[6.5,-1.5],[6.5,-3.2],[0.9,-4]]:[[1,4],[7,-3],[7,-4.5],[1,-5]];
 add(g,flat(w),M(c,DBL));add(g,flat(w.map(p=>[-p[0],p[1]])),M(c,DBL));
 const hs=[[1,-5.5],[4,-8],[4,-9],[1,-8.6]];add(g,flat(hs),M(c,DBL));add(g,flat(hs.map(p=>[-p[0],p[1]])),M(c,DBL));
 if(fa18){add(g,flat([[0.8,-1],[2,3],[0.8,6]]),M(c,DBL));add(g,flat([[-0.8,-1],[-2,3],[-0.8,6]]),M(c,DBL));}
 for(const sx of [-1,1]){const t=add(g,vflat(fa18?[[-3.5,0],[-6.5,4.2],[-8,4.2],[-7.6,0]]:[[-4,0],[-7,3.6],[-8.6,3.6],[-8.4,0]]),M(c,DBL),sx*1.3,0.5,0);t.rotation.z=-sx*(fa18?0.3:0.42);}
 const fl=new THREE.Group();for(const sx of (fa18?[-0.6,0.6]:[0])){const f=new THREE.Mesh(new THREE.ConeGeometry(fa18?0.5:0.75,1,8).rotateX(Math.PI/2).translate(0,0,0.5),flameMat);f.position.set(sx,0,7.6);fl.add(f);}g.add(fl);g.userData.flame=fl;
 add(g,cylZ(0.25,0.25,3,6),0xdddddd,2.5,-0.4,-1);add(g,cylZ(0.25,0.25,3,6),0xdddddd,-2.5,-0.4,-1);
 return g;}
function heli(){const g=new THREE.Group(),c=M(0x9aa080,{skin:'camo',side:THREE.DoubleSide});const b=add(g,new THREE.SphereGeometry(1.6,10,8),c,0,0,-1);b.scale.set(0.9,1,2.6);
 add(g,cylZ(0.35,0.7,8,6),c,0,0.3,5);const tf=add(g,vflat([[-8,0],[-9.5,2.4],[-10.3,2.4],[-9.6,0]]),c,0,0.3,0);
 const can=add(g,new THREE.SphereGeometry(0.8,8,6),glassMat,0,0.6,-4);can.scale.set(1,0.9,1.6);
 add(g,new THREE.BoxGeometry(5,0.2,1),c,0,-0.2,-0.5);add(g,cylZ(0.3,0.3,2,6),0x333333,2.3,-0.5,-0.5);add(g,cylZ(0.3,0.3,2,6),0x333333,-2.3,-0.5,-0.5);
 add(g,new THREE.BoxGeometry(0.15,1.4,0.15),0x222222,0,1.9,-1);const rot=new THREE.Group();rot.position.set(0,2.6,-1);
 add(rot,new THREE.BoxGeometry(14,0.08,0.5),0x222222);add(rot,new THREE.BoxGeometry(0.5,0.08,14),0x222222);g.add(rot);g.userData.rotor=rot;
 const tr=new THREE.Group();tr.position.set(0.5,1.8,9.6);add(tr,new THREE.BoxGeometry(0.06,2.6,0.25),0x222222);g.add(tr);g.userData.trotor=tr;
 add(g,new THREE.BoxGeometry(0.15,0.15,4.5),0x222222,1.1,-1.6,-1);add(g,new THREE.BoxGeometry(0.15,0.15,4.5),0x222222,-1.1,-1.6,-1);return g;}
function hullGeo(w,l,bowL,h){const s=new THREE.Shape();s.moveTo(-w,-l/2);s.lineTo(w,-l/2);s.lineTo(w,l/2-bowL);s.quadraticCurveTo(w*0.8,l/2-bowL*0.2,0,l/2);s.quadraticCurveTo(-w*0.8,l/2-bowL*0.2,-w,l/2-bowL);s.lineTo(-w,-l/2);
 return new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false}).rotateX(-Math.PI/2);}
function destroyer(){const g=new THREE.Group(),c=0x7a8590;add(g,hullGeo(9,154,40,11),c,0,-5,0);add(g,hullGeo(9.05,154.2,40,4),0x552222,0,-5.4,0);
 add(g,new THREE.BoxGeometry(14,8,30),c,0,10,5);add(g,new THREE.BoxGeometry(11,6,14),c,0,16,0);add(g,new THREE.BoxGeometry(10,5,18),c,0,8.5,40);
 add(g,cylZ(0.8,0.8,4,8),0x444444,0,24,0).rotation.x=Math.PI/2;add(g,new THREE.BoxGeometry(0.5,14,0.5),0x555555,0,24,0);add(g,new THREE.BoxGeometry(8,0.4,0.4),0x555555,0,28,0);
 const t=add(g,new THREE.CylinderGeometry(2.5,3,2.5,10),c,0,7.5,-48);add(g,cylZ(0.25,0.3,7,6),0x555555,0,7.8,-52);
 add(g,new THREE.BoxGeometry(8,1,10),0x555a60,0,6.5,-34);add(g,new THREE.BoxGeometry(7,1,8),0x555a60,0,6.5,28);
 for(const sx of [-1,1])add(g,new THREE.BoxGeometry(0.2,5,5),0x3a4048,sx*7.05,14,8);return g;}
function carrier(){const g=new THREE.Group(),c=0x6e7880;add(g,hullGeo(19,320,60,26),c,0,-6,0);add(g,hullGeo(19.1,320.2,60,6),0x552222,0,-6.6,0);
 const deck=add(g,new THREE.BoxGeometry(76,2,330),0x3c4044,6,20,-5);const tex=deckTex();deck.material=new THREE.MeshStandardMaterial({map:tex,roughness:0.85,metalness:0.1});
 add(g,new THREE.BoxGeometry(8,22,30),c,32,32,30);add(g,new THREE.BoxGeometry(4,12,4),0x555555,32,48,30);add(g,new THREE.BoxGeometry(10,1,1),0x555555,32,50,30);
 add(g,new THREE.BoxGeometry(10,6,16),c,32,45,26);return g;}
function deckTex(){const cv=document.createElement('canvas');cv.width=128;cv.height=512;const x=cv.getContext('2d');x.fillStyle='#3c4044';x.fillRect(0,0,128,512);
 x.strokeStyle='#ddd';x.lineWidth=2;x.setLineDash([12,10]);x.beginPath();x.moveTo(56,512);x.lineTo(56,40);x.stroke();x.beginPath();x.moveTo(40,500);x.lineTo(10,190);x.stroke();
 x.setLineDash([]);x.strokeStyle='#cc4';x.beginPath();x.moveTo(30,505);x.lineTo(30,250);x.stroke();const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;}
function sub(){const g=new THREE.Group(),c=0x22262a;add(g,cylZ(4.5,4.5,80,14),c);const n=add(g,new THREE.SphereGeometry(4.5,14,10),c,0,0,-40);n.scale.z=2;
 add(g,new THREE.ConeGeometry(4.5,22,14).rotateX(Math.PI/2),c,0,0,51);add(g,new THREE.BoxGeometry(2.4,7,13),c,0,6.5,-18);add(g,new THREE.BoxGeometry(9,0.4,3),c,0,7.5,-18);
 add(g,new THREE.BoxGeometry(14,0.4,3),c,0,0,54);add(g,new THREE.BoxGeometry(0.4,12,3),c,0,0,56);for(let i=0;i<6;i++)add(g,new THREE.CylinderGeometry(0.9,0.9,0.3,10),0x33383c,0,4.4,-4+i*4);return g;}
function boat(){const g=new THREE.Group();add(g,hullGeo(3.2,26,8,3),0x8a3a30,0,-1,0);add(g,new THREE.BoxGeometry(4,3,6),0x999999,0,3,2);add(g,new THREE.BoxGeometry(0.4,4,0.4),0x333333,0,6,2);return g;}
function drone(){const g=new THREE.Group(),c=0xaa3322;add(g,cylZ(0.5,0.6,5,6),c);add(g,flat([[0.4,1],[5,-0.5],[5,-1.2],[0.4,-1]]),M(c,DBL));add(g,flat([[-0.4,1],[-5,-0.5],[-5,-1.2],[-0.4,-1]]),M(c,DBL));
 add(g,vflat([[-1.5,0],[-2.6,1.2],[-3,1.2],[-2.6,0]]),M(c,DBL));return g;}
function missileMesh(l=4,r=0.2,c=0xeeeeee){const g=new THREE.Group();add(g,cylZ(r,r,l,6),c);add(g,coneF(r,l*0.25,6),c,0,0,-l*0.62);return g;}
function icbm(s=1){const g=new THREE.Group();add(g,new THREE.CylinderGeometry(1,1,16,10),0xeeeeee,0,8,0);add(g,new THREE.CylinderGeometry(0.9,1,7,10),0xdddddd,0,19.5,0);add(g,new THREE.ConeGeometry(0.9,4,10),0x333333,0,25,0);
 add(g,new THREE.CylinderGeometry(1.01,1.01,1.2,10),0x111111,0,15.8,0);g.scale.setScalar(s);return g;} // +Y up
function rocketModel(){const g=new THREE.Group(),w=0xf0f0f0;const s1=new THREE.Group(),s2=new THREE.Group(),fair=new THREE.Group();
 add(s1,new THREE.CylinderGeometry(1.85,1.85,42,16),w,0,21+1,0);add(s1,new THREE.CylinderGeometry(1.86,1.86,4,16),0x222222,0,44,0);add(s1,new THREE.CylinderGeometry(1.2,1.9,1.5,12),0x333333,0,0.5,0);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;const l=add(s1,new THREE.BoxGeometry(0.4,8,0.6),0x222222,Math.cos(a)*2,5,Math.sin(a)*2);l.rotation.y=-a;}
 add(s1,new THREE.BoxGeometry(0.2,3,4.2),0x222222,0,40,0);
 add(s2,new THREE.CylinderGeometry(1.85,1.85,12,16),w,0,52,0);add(s2,new THREE.CylinderGeometry(0.9,1.4,1.2,12),0x333333,0,45.6,0);
 add(fair,new THREE.CylinderGeometry(2.6,1.85,1.5,16),w,0,58.7,0);add(fair,new THREE.CylinderGeometry(2.6,2.6,7,16),w,0,63,0);add(fair,new THREE.SphereGeometry(2.6,16,8,0,Math.PI*2,0,Math.PI/2),w,0,66.5,0).scale.y=2;
 g.add(s1,s2,fair);g.userData={s1,s2,fair};return g;} // base at y=0, height ~71m
function padModel(){const g=new THREE.Group();add(g,new THREE.BoxGeometry(120,4,120),0x9a9a95,0,2,0);add(g,new THREE.BoxGeometry(14,4.2,60),0x333333,0,2.1,30);
 for(let y=4;y<82;y+=8){add(g,new THREE.BoxGeometry(6,0.6,6),0xb04020,-9,y,0);} for(const dx of[-2.6,2.6])for(const dz of[-2.6,2.6])add(g,new THREE.BoxGeometry(0.5,80,0.5),0xb04020,-9+dx,42,dz);
 for(let y=4;y<82;y+=4)add(g,new THREE.BoxGeometry(5.2,0.2,0.2),0xb04020,-9,y,2.6).rotation.z=0.7;
 add(g,new THREE.BoxGeometry(6,0.6,0.6),0x888888,-5,60,0);add(g,new THREE.CylinderGeometry(1.5,1.5,30,8),0xdddddd,40,15+4,30);add(g,new THREE.SphereGeometry(6,10,8),0xeeeeee,40,10,-30);return g;}
function siloModel(){const g=new THREE.Group();add(g,new THREE.CylinderGeometry(6,7,2,16),0x8a8a85,0,1,0);add(g,new THREE.CylinderGeometry(3.2,3.2,2.1,16),0x111111,0,1.05,0);
 const d=add(g,new THREE.BoxGeometry(7,0.8,7),0x666660,8,2.4,0);g.userData.door=d;add(g,new THREE.BoxGeometry(20,6,12),0x777770,-20,3,10);add(g,new THREE.BoxGeometry(1,0.2,40),0x666666,0,0.3,30);return g;}
function airbase(){const g=new THREE.Group();const cv=document.createElement('canvas');cv.width=64;cv.height=1024;const x=cv.getContext('2d');x.fillStyle='#2b2d2f';x.fillRect(0,0,64,1024);x.fillStyle='#ddd';
 for(let y=20;y<1000;y+=40)x.fillRect(30,y,4,20);for(let i=0;i<6;i++){x.fillRect(4+i*5,4,3,14);x.fillRect(4+i*5,1006,3,14);x.fillRect(36+i*4,4,3,14);x.fillRect(36+i*4,1006,3,14);}
 const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;add(g,new THREE.PlaneGeometry(60,3000).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({map:t,roughness:0.9}),0,6.15,0);
 add(g,new THREE.PlaneGeometry(25,2600).rotateX(-Math.PI/2),0x3a3c3e,90,6.1,0);for(let i=0;i<5;i++){add(g,new THREE.PlaneGeometry(70,25).rotateX(-Math.PI/2),0x3a3c3e,55,6.1,-600+i*300);}
 for(let i=0;i<5;i++){const h=add(g,new THREE.CylinderGeometry(18,18,40,12,1,false,0,Math.PI).rotateZ(Math.PI/2).rotateY(Math.PI/2),0x6a7060,170,6,-600+i*300);}
 add(g,new THREE.BoxGeometry(10,30,10),0xb0b0a8,150,21,500);add(g,new THREE.BoxGeometry(14,5,14),glassMat,150,38,500);
 for(let i=0;i<8;i++)add(g,new THREE.BoxGeometry(30+hash(i,2)*30,8+hash(i,3)*12,25),0x9a968a,230+hash(i,1)*60,10,-900+i*240);return g;}
scene.add(airbase());const pad=padModel();pad.position.set(PAD.x,6,PAD.z);scene.add(pad);const silo=siloModel();silo.position.set(SILO.x,6,SILO.z);scene.add(silo);
const siloMissile=icbm();siloMissile.position.set(SILO.x,-20,SILO.z);scene.add(siloMissile);
const fleetCarrier=carrier();fleetCarrier.position.copy(CARRIER_POS);scene.add(fleetCarrier);
let padRocket=null;
