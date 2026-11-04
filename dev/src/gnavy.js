// ===== GNAVY: US Navy task group (Ford CVN-78, Burke Flt III DDG-125, Tico CG-70, Zumwalt DDG-1000, LCS-2, America LHA-6) + VLS launch-point API. Refs: refs/navy_*/ =====
const NAVYX=(()=>{const T=THREE,PI=Math.PI;
 const C={};const cvs=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;};
 const tex=(c,srgb=true,rx=1,ry=1)=>{const t=new T.CanvasTexture(c);if(srgb)t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=8;return t;};
 let SEED=1;const rr=()=>{SEED=(SEED*16807)%2147483647;return SEED/2147483647;};
 // ---- weathered haze-gray plating: panel seams, weld lines, rust streaks from scuppers, salt bleaching; key by paint ----
 function plate(key,base,o={}){if(C[key])return C[key];SEED=o.seed||11;const W=1024,H=512;
  const c=cvs(W,H,(x)=>{x.fillStyle=base;x.fillRect(0,0,W,H);
   for(let i=0;i<4000;i++){x.fillStyle=`rgba(${rr()<.5?'0,0,0':'255,255,255'},${rr()*0.035})`;const s=4+rr()*40;x.fillRect(rr()*W,rr()*H,s,s*0.5);}
   x.strokeStyle='rgba(0,0,0,0.16)';x.lineWidth=1.2;for(let i=0;i<=16;i++){x.beginPath();x.moveTo(i*W/16,0);x.lineTo(i*W/16,H);x.stroke();}for(let j=0;j<=6;j++){x.beginPath();x.moveTo(0,j*H/6);x.lineTo(W,j*H/6);x.stroke();}
   x.strokeStyle='rgba(255,255,255,0.05)';for(let i=0;i<=16;i++){x.beginPath();x.moveTo(i*W/16+1.5,0);x.lineTo(i*W/16+1.5,H);x.stroke();}
   if(o.rust!==false)for(let i=0;i<70;i++){const X=rr()*W,Y=rr()*H*0.6,L=20+rr()*120,g=x.createLinearGradient(0,Y,0,Y+L);g.addColorStop(0,`rgba(110,58,28,${0.25+rr()*0.3})`);g.addColorStop(1,'rgba(110,58,28,0)');x.fillStyle=g;x.fillRect(X,Y,1.5+rr()*3,L);}
   for(let i=0;i<25;i++){x.fillStyle=`rgba(230,230,225,${rr()*0.06})`;x.beginPath();x.ellipse(rr()*W,rr()*H,20+rr()*80,8+rr()*20,0,0,7);x.fill();}});
  const r=cvs(256,128,(x,w,h)=>{x.drawImage(c,0,0,w,h);const d=x.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){const v=d.data[i];const q=160+((v-128)*0.6|0);d.data[i]=d.data[i+1]=d.data[i+2]=q;}x.putImageData(d,0,0);});
  return C[key]={c,map:()=>tex(c,true),rough:()=>tex(r,false)};}
 function pmat(key,base,rx,ry,o={}){const k=key+rx+'_'+ry+(o.metal||'');if(C['m'+k])return C['m'+k];const P=plate(key,base,o);const m=new T.MeshStandardMaterial({map:P.map(),roughnessMap:P.rough(),roughness:o.r??0.82,metalness:o.metal??0.25,color:0xffffff});m.map.repeat.set(rx,ry);m.roughnessMap.repeat.set(rx,ry);return C['m'+k]=m;}
 // hull side: antifouling red below waterline, black boot-top, weathered gray above; v=0 keel .. 1 deck, wl = waterline fraction
 function hullMat(key,base,wl,len,o={}){const k='h'+key+wl.toFixed(2);if(C[k])return C[k];SEED=o.seed||29;const W=2048,H=256;
  const c=cvs(W,H,(x)=>{x.drawImage(plate(key+'p',base,o).c,0,0,W,H);const yw=H*(1-wl);x.fillStyle=o.bottom||'#5a2420';x.fillRect(0,yw,W,H-yw);x.fillStyle='#16181a';x.fillRect(0,yw-H*0.035,W,H*0.05);
   for(let i=0;i<300;i++){x.fillStyle=`rgba(0,0,0,${rr()*0.05})`;x.fillRect(rr()*W,yw+rr()*(H-yw),10+rr()*60,2);}
   for(let i=0;i<70;i++){const X=rr()*W,L2=yw*(0.2+rr()*0.55),gr=x.createLinearGradient(0,0,0,L2);const a=0.08+rr()*0.2;gr.addColorStop(0,`rgba(96,48,20,${a})`);gr.addColorStop(0.5,`rgba(110,60,28,${a*0.5})`);gr.addColorStop(1,'rgba(110,60,28,0)');x.fillStyle=gr;x.fillRect(X,0,1+rr()*2.5,L2);if(rr()<0.35){x.fillStyle=`rgba(70,35,15,${a})`;x.fillRect(X-2,0,5,3);}}
   {const gr=x.createLinearGradient(0,yw-H*0.16,0,yw-H*0.035);gr.addColorStop(0,'rgba(60,62,50,0)');gr.addColorStop(1,'rgba(60,62,50,0.35)');x.fillStyle=gr;x.fillRect(0,yw-H*0.16,W,H*0.125);}
   for(let i=0;i<40;i++){x.fillStyle=`rgba(40,42,44,${rr()*0.12})`;x.fillRect(rr()*W,rr()*yw*0.8,30+rr()*120,4+rr()*14);}
   // waterline grime + rust weeps under scuppers
   const g=x.createLinearGradient(0,yw-H*0.12,0,yw);g.addColorStop(0,'rgba(60,62,55,0)');g.addColorStop(1,'rgba(60,62,55,0.35)');x.fillStyle=g;x.fillRect(0,yw-H*0.12,W,H*0.12);
   for(let i=0;i<55;i++){const X=rr()*W,L=10+rr()*H*0.5;const gg=x.createLinearGradient(0,4,0,4+L);gg.addColorStop(0,'rgba(120,60,25,0.55)');gg.addColorStop(1,'rgba(120,60,25,0)');x.fillStyle=gg;x.fillRect(X,4,2+rr()*3,L);x.fillStyle='#222';x.fillRect(X-2,2,6,3);}
   if(o.draft)for(let d=1;d<=Math.floor(o.draft);d++){const y=H-(d/(o.D+o.draft))*H;x.fillStyle='rgba(240,240,240,0.8)';x.font='bold 9px Arial';x.fillText(String(d*3),W-20,y);x.fillText(String(d*3),14,y);}});
  return C[k]=new T.MeshStandardMaterial({map:tex(c,true),roughness:0.78,metalness:0.22,side:T.DoubleSide});}
 const S=(c,r=0.6,m=0.3)=>C['s'+c+r+m]||(C['s'+c+r+m]=new T.MeshStandardMaterial({color:c,roughness:r,metalness:m}));
 const GLS=new T.MeshStandardMaterial({color:0x10181e,roughness:0.08,metalness:0.9});
 const mesh=(g,geo,m,x=0,y=0,z=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o;};
 const box=(g,w,h,l,m,x,y,z)=>mesh(g,new T.BoxGeometry(w,h,l),m,x,y+h/2,z);
 // truncated pyramid (angled stealth deckhouse): bottom w,l top w*tw,l*tl
 function frustum(w,h,l,tw,tl,tz=0){const g=new T.BoxGeometry(w,h,l,1,1,1);const p=g.attributes.position;for(let i=0;i<p.count;i++){if(p.getY(i)>0){p.setX(i,p.getX(i)*tw);p.setZ(i,p.getZ(i)*tl+tz);}}g.translate(0,h/2,0);g.computeVertexNormals();return g;}
 // ---- lofted hull: stations bow(-L/2)->stern(+L/2); returns geometry with uv (u along, v keel->deck) ----
 function loft(o){const L=o.L,B=o.B/2,D=o.D,Tq=o.T,N=48,M=9,pos=[],uv=[],idx=[];
  const hb=t=>{const bow=o.bowLen||0.3;let k=t<bow?Math.pow(Math.sin(t/bow*PI/2),o.bowPow||0.75):1;if(t>1-(o.sternLen||0.12))k*=1-(1-(o.sternW??0.92))*((t-(1-(o.sternLen||0.12)))/(o.sternLen||0.12));return B*Math.max(k,0.002);};
  for(let i=0;i<=N;i++){const t=i/N;let z=-L/2+t*L;const b=hb(t);const sheer=(o.sheer||0)*Math.pow(Math.max(0,1-t/0.4),2);const keel=t<0.12?Tq*(0.25+0.75*t/0.12):(t>0.9?Tq*(1-0.55*(t-0.9)/0.1):Tq);
   for(let j=0;j<=M;j++){const s=j/M;// s=0 deck edge, 1 keel centre
    let x,y;const fl=o.flare||0;if(s<0.4){const k=s/0.4;y=(D+sheer)*(1-k);x=b*(1+fl*(1-k)*(t<0.35?1.6:1));}else{const a=(s-0.4)/0.6*PI/2;x=b*Math.cos(a)*(o.vee?1-0.35*Math.sin(a):1);y=-keel*Math.sin(a);}
    let zz=z;if(t<0.06&&o.rake)zz+=o.rake*(y/(D+Tq))*(1-t/0.06);
    pos.push(x,y,zz);uv.push(t*(o.uRep||6),(y+Tq)/(D+Tq+sheer));}}
  const R=M+1;for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*R+j,b2=a+R;idx.push(a,b2,a+1,a+1,b2,b2+1);}
  // mirror port side
  const n=pos.length/3;for(let k=0;k<n;k++){pos.push(-pos[k*3],pos[k*3+1],pos[k*3+2]);uv.push(uv[k*2],uv[k*2+1]);}
  for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=n+i*R+j,b2=a+R;idx.push(a,a+1,b2,a+1,b2+1,b2);}
  // transom
  const s0=N*R;for(let j=0;j<M;j++){idx.push(s0+j,s0+j+1,n+s0+j,n+s0+j,s0+j+1,n+s0+j+1);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  g.userData={hb,L,D};return g;}
 function deckGeo(o,hb,y,w=1){const s=new T.Shape();const N=40;for(let i=0;i<=N;i++){const t=i/N;s[i?'lineTo':'moveTo'](hb(t)*(1+(o.flare||0))*w,-(-o.L/2+t*o.L));}for(let i=N;i>=0;i--){const t=i/N;s.lineTo(-hb(t)*(1+(o.flare||0))*w,-(-o.L/2+t*o.L));}
  return new T.ShapeGeometry(s).rotateX(-PI/2).translate(0,y,0);}
 function hull(g,o,key,base,detail){const geo=loft(o);const m=hullMat(key,base,o.T/(o.D+o.T),o.L,{D:o.D,draft:detail?o.T/3:0});const h=new T.Mesh(geo,m);g.add(h);
  const dk=new T.Mesh(deckGeo(o,geo.userData.hb,o.D+0.02),o.deckMat||pmat('deck','#4a4f53',8,2,{rust:false,r:0.95,metal:0.05}));g.add(dk);g.userData.hb=geo.userData.hb;g.userData.O=o;return h;}
 // ---- hull-number decal (shadowed white, or low-vis dark) ----
 function numMat(txt,col='#f4f4f0',shadow=true){const k='n'+txt+col;if(C[k])return C[k];const c=cvs(512,256,(x,w,h)=>{x.font='bold 200px "Arial Black", Arial';x.textAlign='center';x.textBaseline='middle';if(shadow){x.fillStyle='rgba(0,0,0,0.75)';x.fillText(txt,w/2+10,h/2+8);}x.fillStyle=col;x.fillText(txt,w/2,h/2);// salt wear
   x.globalCompositeOperation='destination-out';for(let i=0;i<300;i++){x.fillStyle=`rgba(0,0,0,${Math.random()*0.5})`;x.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*6,1+Math.random()*3);}});
  const t=tex(c,true);t.wrapS=t.wrapT=T.ClampToEdgeWrapping;return C[k]=new T.MeshStandardMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,roughness:0.7});}
 function hullNum(g,txt,z,y,hb,L,size,col,shadow){const t=(z+L/2)/L;const O=g.userData.O||{};const D=O.D||8;const fl=O.flare||0;const yy=Math.min(Math.max(y,0),D);const x=hb(t)*(1+fl*(yy/D)*(t<0.35?1.6:1))+0.18;for(const s of[-1,1]){const p=mesh(g,new T.PlaneGeometry(size*txt.length*0.62+size*0.3,size),numMat(txt,col,shadow),s*x,y,z);const fk=(1+fl*(yy/D)*(t<0.35?1.6:1));const dx=(hb(Math.min(t+0.01,1))-hb(Math.max(t-0.01,0)))*fk/(0.02*L);p.rotation.y=Math.atan2(s,-dx);p.translateZ(0.25);if(p.material){p.material.polygonOffset=true;p.material.polygonOffsetFactor=-2;}}}
 // ---- weapon & sensor parts ----
 const vlsTex=(()=>{const c=cvs(256,512,(x,w,h)=>{x.fillStyle='#3d4247';x.fillRect(0,0,w,h);const cw=w/2,ch=h/4;for(let i=0;i<2;i++)for(let j=0;j<4;j++){const X=i*cw,Y=j*ch;x.fillStyle='#50565c';x.fillRect(X+6,Y+6,cw-12,ch-12);x.strokeStyle='#23272b';x.lineWidth=4;x.strokeRect(X+10,Y+10,cw-20,ch-20);x.fillStyle='#2a2e32';x.beginPath();x.arc(X+cw/2,Y+ch/2,6,0,7);x.fill();x.fillStyle='rgba(120,60,25,0.25)';x.fillRect(X+12,Y+ch-22,cw-24,6);}
  x.fillStyle='#e6c02a';x.fillRect(0,0,w,3);x.fillRect(0,h-3,w,3);});return tex(c,true);})();
 // Mk41 VLS: modules of 8 cells (2x4); returns local cell centres (top) for the launch API
 function mk41(g,x,y,z,modsX,modsZ,detail,cells){const cw=1.1,cl=1.1;const W=modsX*2*cw,Lz=modsZ*4*cl;box(g,W+0.6,0.35,Lz+0.6,S(0x42474c,0.8,0.3),x,y,z);
  if(detail){const m=new T.MeshStandardMaterial({map:vlsTex.clone(),roughness:0.75,metalness:0.35});m.map.repeat.set(modsX,modsZ);m.map.needsUpdate=true;const p=mesh(g,new T.PlaneGeometry(W,Lz).rotateX(-PI/2),m,x,y+0.37,z);p.material.polygonOffset=true;p.material.polygonOffsetFactor=-2;}
  const n0=modsX*2*modsZ*4;let lid=null,hin=null,q=new T.Matrix4();if(detail){lid=new T.InstancedMesh(new T.BoxGeometry(cw*0.82,0.07,cl*0.82),S(0x4b5157,0.7,0.35),n0);hin=new T.InstancedMesh(new T.BoxGeometry(cw*0.7,0.09,0.08),S(0x2a2e32,0.6,0.5),n0);g.add(lid);g.add(hin);}let ii=0;
  for(let i=0;i<modsX*2;i++)for(let k=0;k<modsZ*4;k++){const cx=x-W/2+cw*(i+0.5),cz=z-Lz/2+cl*(k+0.5);cells.push(new T.Vector3(cx,y+0.38,cz));if(lid){q.makeTranslation(cx,y+0.41,cz);lid.setMatrixAt(ii,q);q.makeTranslation(cx,y+0.43,cz-cl*0.38);hin.setMatrixAt(ii,q);ii++;}}}
 // Mk45 Mod 4 5in/62: faceted stealth shield
 function mk45(g,x,y,z,detail,c=0x7d868e){const m=S(c,0.6,0.3);const t=new T.Group();t.position.set(x,y,z);g.add(t);mesh(t,new T.CylinderGeometry(2.6,3.0,0.7,detail?20:8),m,0,0.35,0);
  mesh(t,frustum(4.4,2.4,6.2,0.62,0.7,0.6),m,0,0.7,0.2);if(detail){mesh(t,new T.CylinderGeometry(0.34,0.34,0.8,12).rotateX(PI/2),S(0x555b60),0,1.6,-2.7);}const b=mesh(t,new T.CylinderGeometry(0.13,0.19,7.8,detail?12:5).rotateX(PI/2),S(0x5a6066,0.5,0.5),0,1.6,-6.4);if(detail){mesh(t,new T.CylinderGeometry(0.2,0.2,0.35,12).rotateX(PI/2),S(0x3d4246,0.5,0.5),0,1.6,-10.2);mesh(t,new T.CylinderGeometry(0.42,0.28,0.6,12).rotateX(PI/2),S(0x3a3f43,0.9,0.05),0,1.6,-2.65);for(const sx of[-1,1])mesh(t,new T.BoxGeometry(0.04,1.0,4.8),S(0x5d666e),sx*1.62,1.25,0.4);mesh(t,new T.BoxGeometry(0.5,0.3,0.6),S(0x5d666e),0,2.45,1.6);}t.userData.barrel=b;return t;}
 // Phalanx CIWS Block 1B (R2-D2 radome, 6-barrel M61, FLIR)
 function ciws(g,x,y,z,detail,ry=0){const t=new T.Group();t.position.set(x,y,z);t.rotation.y=ry;g.add(t);const w=S(0xe8e8e4,0.5,0.15);mesh(t,new T.CylinderGeometry(1.1,1.3,1.4,detail?14:6),S(0xcfd0cc),0,0.7,0);mesh(t,new T.BoxGeometry(1.8,1.2,1.6),w,0,1.9,0);
  mesh(t,new T.CylinderGeometry(0.85,0.85,2.2,detail?16:6),w,0,3.6,0.3);mesh(t,new T.SphereGeometry(0.85,detail?16:6,8,0,PI*2,0,PI/2),w,0,4.7,0.3);
  if(detail){const bm=S(0x2c2f31,0.45,0.7);for(let b=0;b<6;b++){const a=b/6*PI*2;mesh(t,new T.CylinderGeometry(0.045,0.045,1.9,6).rotateX(PI/2),bm,Math.cos(a)*0.13,2.2+Math.sin(a)*0.13,-1.7);}mesh(t,new T.CylinderGeometry(0.2,0.2,0.12,12).rotateX(PI/2),bm,0,2.2,-2.45);mesh(t,new T.CylinderGeometry(0.24,0.24,0.5,12).rotateX(PI/2),bm,0,2.2,-0.85);mesh(t,new T.BoxGeometry(0.45,0.45,0.7),S(0x2c2f31),0.9,2.5,-0.6);}return t;}
 // RAM Mk49 21-cell launcher / SeaRAM (11 cell + radome)
 function ram(g,x,y,z,detail,sea=false){const t=new T.Group();t.position.set(x,y,z);g.add(t);mesh(t,new T.CylinderGeometry(1,1.2,1.2,10),S(0xd8d8d4),0,0.6,0);const bx=mesh(t,new T.BoxGeometry(1.8,1.6,2.8),S(0xd8d8d4,0.5,0.2),0,2,0);bx.rotation.x=-0.35;
  if(detail){const c=cvs(64,64,(x2)=>{x2.fillStyle='#ccc';x2.fillRect(0,0,64,64);x2.fillStyle='#333';for(let i=0;i<4;i++)for(let j=0;j<4;j++){x2.beginPath();x2.arc(10+i*15,10+j*15,5.5,0,7);x2.fill();}});const f=mesh(t,new T.PlaneGeometry(1.7,1.5),new T.MeshStandardMaterial({map:tex(c),roughness:.6}),0,2.45,-1.42);f.rotation.x=-0.35;}
  if(sea)mesh(t,new T.SphereGeometry(0.6,10,8),S(0xeeeeea),0,3.2,0.8);return t;}
 function mast(g,x,y,z,h,detail,c){const m=S(c,0.6,0.35);const t=new T.Group();t.position.set(x,y,z);g.add(t);mesh(t,new T.CylinderGeometry(0.35,0.9,h,6),m,0,h/2,0);
  if(detail){for(const [yy,w] of[[h*0.62,9],[h*0.82,6]]){mesh(t,new T.BoxGeometry(w,0.18,0.3),m,0,yy,0);for(const s of[-1,1])mesh(t,new T.CylinderGeometry(0.03,0.03,2.2,4),S(0x333333),s*w*0.42,yy-1.1,0);}
   mesh(t,new T.CylinderGeometry(0.06,0.06,6,5),S(0x333333),0,h+3,0);mesh(t,new T.CylinderGeometry(0.5,0.5,0.6,10),S(0xdddddd),0,h*0.72,-0.8);mesh(t,new T.BoxGeometry(3.4,0.35,1.1),S(0x30353a),0,h*0.9,0).rotation.y=0.5;
   // US ensign at gaff
   const fl=mesh(t,new T.PlaneGeometry(3,1.6),flagMat('us'),1.6,h*0.66,1);fl.rotation.y=PI/2;}return t;}
 function flagMat(k){if(C['f'+k])return C['f'+k];const c=cvs(190,100,(x,w,h)=>{if(k==='us'){for(let i=0;i<13;i++){x.fillStyle=i%2?'#fff':'#b22234';x.fillRect(0,i*h/13,w,h/13+1);}x.fillStyle='#3c3b6e';x.fillRect(0,0,w*0.4,h*7/13);x.fillStyle='#fff';for(let i=0;i<9;i++)for(let j=0;j<(i%2?5:6);j++)x.fillRect(4+j*12+(i%2?6:0),3+i*5.6,2,2);}});
  return C['f'+k]=new T.MeshStandardMaterial({map:tex(c),side:T.DoubleSide,roughness:0.8});}
 // flat array face (SPY-6 / SPY-1 / SPY-3) with T/R tile texture
 const spyTex=(()=>{const c=cvs(256,256,(x,w,h)=>{x.fillStyle='#5e676f';x.fillRect(0,0,w,h);x.strokeStyle='rgba(30,34,38,0.55)';for(let i=0;i<=32;i++){x.lineWidth=i%4?0.6:1.6;x.beginPath();x.moveTo(i*8,0);x.lineTo(i*8,h);x.stroke();x.beginPath();x.moveTo(0,i*8);x.lineTo(w,i*8);x.stroke();}for(let i=0;i<300;i++){x.fillStyle=`rgba(${Math.random()<.5?'0,0,0':'255,255,255'},0.05)`;x.fillRect((Math.random()*32|0)*8,(Math.random()*32|0)*8,8,8);}x.strokeStyle='#3a4046';x.lineWidth=8;x.strokeRect(4,4,w-8,h-8);x.fillStyle='#2b3035';for(let i=0;i<12;i++){x.fillRect(4+i*21,2,3,3);x.fillRect(4+i*21,h-5,3,3);}});return tex(c);})();
 const spyM=new T.MeshStandardMaterial({map:spyTex,roughness:0.55,metalness:0.3,polygonOffset:true,polygonOffsetFactor:-3});
 function spy(g,x,y,z,s,ry,tilt=0.22,oct=false){const geo=oct?new T.CircleGeometry(s/2,8):new T.PlaneGeometry(s,s);const p=mesh(g,geo,spyM,x,y,z);p.rotation.order='YXZ';p.rotation.y=ry;p.rotation.x=-tilt;const fr=mesh(g,new T.BoxGeometry(s+0.5,s+0.5,0.35),S(0x6d767e),x,y,z);fr.rotation.copy(p.rotation);fr.translateZ(-0.2);return p;}
 function railing(g,o,hb,y,detail){if(!detail)return;const pts=[];const N=24;const m=S(0x8a9096,0.5,0.4);const posG=new T.CylinderGeometry(0.03,0.03,1.05,3);const n=N*2;const im=new T.InstancedMesh(posG,m,n*3);let k=0;const q=new T.Matrix4();
  for(const s of[-1,1])for(let i=0;i<N;i++){const t=0.05+i/N*0.9;const x=s*hb(t)*(1+(o.flare||0))*0.98;const z=-o.L/2+t*o.L;q.makeTranslation(x,y+0.52,z);im.setMatrixAt(k++,q);}
  im.count=k;g.add(im);}
 function boat(g,x,y,z){const m=S(0xe0dfd8);mesh(g,new T.CapsuleGeometry(1.0,5,4,8).rotateX(PI/2),m,x,y,z);mesh(g,new T.BoxGeometry(1.2,0.8,1.6),S(0x2a2e32),x,y+1,z-0.5);}

 // ---- funnel top: exhaust uptakes, soot cap, side louvres ----
 const SOOT=S(0x141516,0.95,0.05),PIPE=S(0x2a2c2e,0.7,0.5);
 function stackTop(g,x,y,z,w,l,h){box(g,w,0.5,l,SOOT,x,y-0.2,z);for(const [dx,dz] of[[-0.22,-0.22],[0.22,-0.22],[-0.22,0.22],[0.22,0.22]]){const r=Math.min(w,l)*0.13;mesh(g,new T.CylinderGeometry(r,r,1.6,10),PIPE,x+dx*w,y+0.8,z+dz*l);mesh(g,new T.CylinderGeometry(r*1.15,r*1.15,0.25,10),SOOT,x+dx*w,y+1.65,z+dz*l);}
  if(h)for(const sx of[-1,1])for(let i=0;i<4;i++)box(g,0.12,0.35,l*0.6,SOOT,x+sx*(w/2+0.02),y-h*0.35-i*0.6,z);}
 // ---- superstructure clutter: doors, vents, ladders, whips, life rafts, RHIBs (ray-cast onto real faces) ----
 const DOOR=S(0x5c646b,0.6,0.35),DOORF=S(0x3b4146,0.7,0.3),VENT=S(0x2e3338,0.85,0.2),RAFT=S(0xe9e6dc,0.6,0.05),WHIP=S(0x1f2224,0.5,0.5),RHIB=S(0x3a3f44,0.8,0.1),RHIBT=S(0x22262a,0.9,0.05);
 const _rc=new T.Raycaster();
 function stick(g,obj,ox,oy,oz,dir,item){_rc.set(new T.Vector3(ox,oy,oz),dir);const h=_rc.intersectObject(obj,false)[0];if(!h)return null;const n=h.face.normal.clone().transformDirection(obj.matrixWorld);if(Math.abs(n.y)>0.75)return null;item.position.copy(h.point).addScaledVector(n,0.04);item.lookAt(h.point.clone().add(n));g.add(item);return item;}
 function clutter(g){const O=g.userData.O;if(!O||g.userData.cls==='LHA')return;const D=O.D;g.updateMatrixWorld(true);let rs=7;const R1=()=>{rs=(rs*16807)%2147483647;return rs/2147483647;};
  const cand=[];g.children.forEach(o=>{if(!o.isMesh||o.material===GLS||!o.geometry||o.geometry.type!=='BoxGeometry')return;o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().translate(o.position);const sz=b.getSize(new T.Vector3());if(b.min.y>=D-0.5&&sz.x>4&&sz.y>2.4&&sz.z>4&&sz.x<45)cand.push([o,b,sz]);});
  for(const [o,b,sz] of cand.slice(0,8)){const c=b.getCenter(new T.Vector3());
   for(const sx of[-1,1]){const nd=sz.z>14?2:1;for(let i=0;i<nd;i++){const z=c.z+(i-(nd-1)/2)*sz.z*0.45+(R1()-0.5)*2;const d=new T.Group();mesh(d,new T.BoxGeometry(1.0,2.0,0.06),DOORF,0,0,0);mesh(d,new T.BoxGeometry(0.86,1.86,0.1),DOOR,0,0,0.03);mesh(d,new T.BoxGeometry(0.06,0.14,0.12),WHIP,0.32,0,0.09);if(!(g.userData.cls==='DDG1000'&&Math.abs(z-c.z)>sz.z*0.3))stick(g,o,sx*60,b.min.y+1.35,z,new T.Vector3(-sx,0,0),d);}
    const v=new T.Group();mesh(v,new T.BoxGeometry(1.6,0.8,0.12),VENT,0,0,0);for(let k=0;k<5;k++)mesh(v,new T.BoxGeometry(1.5,0.05,0.16),DOORF,0,-0.3+k*0.15,0.02);stick(g,o,sx*60,b.min.y+sz.y*0.62,c.z+sz.z*0.3*sx,new T.Vector3(-sx,0,0),v);}
   // ladder on the aft face
   const ld=new T.Group();const hh=Math.min(sz.y,6);for(const lx of[-0.25,0.25])mesh(ld,new T.BoxGeometry(0.06,hh,0.06),WHIP,lx,0,0.2);for(let k=0;k<hh/0.35;k++)mesh(ld,new T.BoxGeometry(0.5,0.04,0.04),WHIP,0,-hh/2+k*0.35,0.2);stick(g,o,c.x+sz.x*0.3,b.min.y+hh/2,b.max.z+60,new T.Vector3(0,0,-1),ld);
   for(const sx of[-1,1]){const w=mesh(g,new T.CylinderGeometry(0.03,0.06,5+R1()*3,4),WHIP,c.x+sx*sz.x*0.4,b.max.y+3,b.min.z+1.2);w.rotation.z=sx*0.08;}}
  if(g.userData.cls==='DDG1000')return;// real Zumwalt: rafts/RHIBs are housed inside (stealth), keep sides clean
  // life-raft canisters in racks along both deck edges
  const hb=g.userData.hb,fl=O.flare||0;for(const sx of[-1,1])for(let i=0;i<5;i++){const t=0.42+i*0.035;const x=sx*(hb(t)*(1+fl)-0.9),z=-O.L/2+t*O.L;box(g,1.0,0.12,1.9,DOORF,x,D+0.02,z);for(const dz of[-0.45,0.45]){const r=mesh(g,new T.CapsuleGeometry(0.32,0.45,4,10),RAFT,x,D+0.55,z+dz);r.rotation.x=PI/2;}}
  // RHIBs in davits on the largest deckhouse
  const big=cand.sort((a,b)=>b[2].x*b[2].z-a[2].x*a[2].z)[0];if(big){const [o,b,sz]=big;const c=b.getCenter(new T.Vector3());for(const sx of[-1,1]){const x=sx*(sz.x/2+1.8),y=b.min.y+3.2;const r=new T.Group();r.position.set(c.x+x,y,c.z+sz.z*0.15);g.add(r);mesh(r,new T.CapsuleGeometry(0.85,5.2,4,12).rotateX(PI/2),RHIB,0,0,0);mesh(r,new T.BoxGeometry(1.4,0.5,6.4),RHIBT,0,-0.45,0);mesh(r,new T.BoxGeometry(1.0,0.9,1.2),S(0xd8d6cc),0,0.8,-0.6);mesh(r,new T.BoxGeometry(0.9,0.06,0.9),WHIP,0,1.28,-0.6);
    for(const dz of[-2.4,2.4]){const a=mesh(g,new T.BoxGeometry(0.22,0.22,2.6),DOORF,c.x+sx*(sz.x/2+0.9),y+2.2,c.z+sz.z*0.15+dz);a.rotation.y=PI/2;mesh(g,new T.BoxGeometry(0.22,2.6,0.22),DOORF,c.x+sx*(sz.x/2+0.2),y+1.0,c.z+sz.z*0.15+dz);}}}}
 // ---- Ford island sensors: SPN-46/43 approach radars, satcom domes, whips ----
 function fordIsland(g,x,y,z){const W=S(0xe6e6e0,0.5,0.1);mesh(g,new T.SphereGeometry(1.6,16,10),W,x-3,y+19,z+4);mesh(g,new T.SphereGeometry(1.6,16,10),W,x+3,y+19,z+4);mesh(g,new T.CylinderGeometry(0.4,0.6,3,8),S(0x7b848c),x,y+17,z+10);
  const sp=new T.Group();sp.position.set(x,y+18.8,z+10);g.add(sp);mesh(sp,new T.BoxGeometry(5,1.6,0.3),S(0xd0d0cc,0.6,0.2),0,0,0);mesh(sp,new T.BoxGeometry(0.3,1.6,1.2),S(0x5a6066),0,0,0.6);g.userData.spn=sp;
  for(const dz of[-6,0])mesh(g,new T.CylinderGeometry(1.1,1.1,1.6,14),W,x+5.2,y+11,z+dz);
  for(let i=0;i<6;i++)mesh(g,new T.CylinderGeometry(0.03,0.05,6,4),WHIP,x-4+i*1.6,y+19,z-4);}

 // ---- draw-call reduction: bake static small parts into one mesh per material ----
 function mergeStatic(g){if(typeof mergeGeometries!=='function')return 0;g.updateMatrixWorld(true);const inv=new T.Matrix4().copy(g.matrixWorld).invert();
  const keep=new Set();g.traverse(o=>{for(const v of Object.values(o.userData||{}))if(v&&v.isObject3D)v.traverse(c=>keep.add(c));});
  const ok=o=>{let p=o.parent;while(p&&p!==g){if(keep.has(p)||Object.keys(p.userData||{}).length||p.isLOD)return false;p=p.parent;}return !!p;};
  const by=new Map(),rm=[];g.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||keep.has(o)||Array.isArray(o.material)||o.material.transparent||Object.keys(o.userData).length||!ok(o))return;
   const pc=o.geometry.attributes.position.count;if(pc>4000)return;let ge=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
   for(const k of Object.keys(ge.attributes))if(!['position','normal','uv'].includes(k))ge.deleteAttribute(k);if(!ge.attributes.normal)ge.computeVertexNormals();if(!ge.attributes.uv)ge.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(ge.attributes.position.count*2),2));
   ge.morphAttributes={};ge.applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));const key=o.material;if(!by.has(key))by.set(key,{a:[],cs:o.castShadow});by.get(key).a.push(ge);rm.push(o);});
  let n=0;for(const [m,{a}] of by){if(a.length<2){continue;}let mg=null;try{mg=mergeGeometries(a,false);}catch(e){mg=null;}if(!mg)continue;const o=new T.Mesh(mg,m);o.castShadow=!m.transparent;o.receiveShadow=true;o.userData.merged=a.length;g.add(o);n++;
   for(const r of rm)if(r.material===m){r.parent&&r.parent.remove(r);}}
  // drop now-empty plain groups
  const empty=[];g.traverse(o=>{if(o!==g&&o.isGroup&&!o.children.length&&!Object.keys(o.userData).length&&!keep.has(o))empty.push(o);});empty.forEach(o=>o.parent&&o.parent.remove(o));return n;}
 function finish(g){g.traverse(o=>{if(o.isMesh&&!o.material.transparent){o.castShadow=true;o.receiveShadow=true;}});return g;}
 const HG='#7b848c',HGD=0x6d767e,HGc=0x7b848c;
 // ======== Arleigh Burke Flight III (DDG-125) ========
 function burke(detail=true,o2={}){const g=new T.Group(),cells=[];const base=o2.base||HG,c=o2.c||HGc;const O={L:155,B:20,D:7.2,T:6.4,flare:0.08,sheer:2.0,bowLen:0.33,rake:-6,uRep:5};hull(g,O,'bk'+base,base,detail);const hb=g.userData.hb;const sm=pmat('ss'+base,base,3,1);
  // fwd superstructure (angled), bridge, SPY-6 deckhouse
  mesh(g,frustum(15,7,26,0.82,0.86),sm,0,O.D,-12);mesh(g,frustum(12,6.5,18,0.8,0.8),sm,0,O.D+7,-10);mesh(g,frustum(8,3,10,0.85,0.8),sm,0,O.D+13.5,-11);
  box(g,10.6,1.4,0.3,GLS,0,O.D+9.6,-19.1);
  for(const [sx,sz,ry] of[[1,-1,PI*0.25],[-1,-1,-PI*0.25],[1,1,PI*0.75],[-1,1,-PI*0.75]])spy(g,sx*5.5,O.D+10.4,-10+sz*7.6,4.4,Math.atan2(sx,sz),0.2);
  // mast (raked, steel FIII)
  const ms=mast(g,0,O.D+16.5,-6,20,detail,c);ms.rotation.x=0.12;
  // funnels with exhaust soot
  for(const z of[12,30]){mesh(g,frustum(6,8,7,0.8,0.8),sm,0,O.D,z);if(detail)stackTop(g,0,O.D+8,z,4.8,5.6,8);else box(g,4,0.6,5,S(0x1c1e20,0.9,0.1),0,O.D+8,z);}
  mesh(g,frustum(13,6,30,0.9,0.92),sm,0,O.D,21);
  // hangars + flight deck
  mesh(g,frustum(17,6.6,18,0.92,0.95),sm,0,O.D,47);box(g,6,5,0.2,S(HGD,0.7,0.3),-3.6,O.D,56.1);box(g,6,5,0.2,S(HGD,0.7,0.3),3.6,O.D,56.1);
  if(detail){const fd=new T.CanvasTexture(cvs(256,256,(x,w,h)=>{x.fillStyle='#4a4f53';x.fillRect(0,0,w,h);x.strokeStyle='#e8e8e8';x.lineWidth=3;x.beginPath();x.arc(128,128,80,0,7);x.stroke();x.strokeStyle='#d8c040';x.beginPath();x.moveTo(128,0);x.lineTo(128,256);x.stroke();}));fd.colorSpace=T.SRGBColorSpace;mesh(g,new T.PlaneGeometry(17,21).rotateX(-PI/2),new T.MeshStandardMaterial({map:fd,roughness:0.95,polygonOffset:true,polygonOffsetFactor:-2}),0,O.D+0.05,66);}
  mk45(g,0,O.D,-56,detail,c);mk41(g,0,O.D,-41,2,2,detail,cells);mk41(g,0,O.D+0.1,37.5,2,4,detail,cells);// 32 fwd + 64 aft
  ciws(g,0,O.D+6.6,47,detail);if(detail){ciws(g,0,O.D+6.8,-21.5,detail);for(const s of[-1,1]){boat(g,s*7.4,O.D+5,20);mesh(g,new T.CylinderGeometry(0.4,0.4,4,8).rotateX(PI/2),S(0x6a7278),s*6.8,O.D+0.8,30).rotation.y=s*0.4;}}
  railing(g,O,hb,O.D,detail);hullNum(g,'125',-54,O.D-2.5,hb,O.L,4.2);
  g.userData.vls=cells;g.userData.cls='DDG';g.userData.L=O.L;g.userData.B=O.B;return finish(g);}
 // ======== Ticonderoga CG-70 Lake Erie ========
 function tico(detail=true){const g=new T.Group(),cells=[];const O={L:173,B:16.8,D:7.6,T:6.8,flare:0.1,sheer:2.4,bowLen:0.34,rake:-7,uRep:6};hull(g,O,'tc',HG,detail);const hb=g.userData.hb;const sm=pmat('ss'+HG,HG,3,1);
  // forward deckhouse (tall, SPY-1B fwd+stbd), aft deckhouse (SPY-1B aft+port), 3 stacks, 2 lattice tripod masts
  box(g,14,9,32,sm,0,O.D,-20);box(g,11,5,16,sm,0,O.D+9,-24);box(g,9.4,1.4,0.3,GLS,0,O.D+11.6,-32.1);
  spy(g,0,O.D+7,-36.2,4,PI,0.25);spy(g,7.1,O.D+7,-14,4,PI/2,0.25);
  box(g,12,8,26,sm,0,O.D,26);spy(g,0,O.D+6,39.2,4,0,0.25);spy(g,-6.1,O.D+6,30,4,-PI/2,0.25);
  for(const z of[-6,4,14]){box(g,4.4,7,5,sm,0,O.D+8,z);if(detail)stackTop(g,0,O.D+15,z,4.4,5,7);else box(g,3.6,0.5,4,S(0x1c1e20,0.9,0.1),0,O.D+15,z);}
  for(const z of[-18,20]){const lm=S(0x707a82,0.6,0.4);for(const [x,dz] of[[-2,1.5],[2,1.5],[0,-1.5]]){const l=mesh(g,new T.CylinderGeometry(0.2,0.35,18,5),lm,x*0.7,O.D+(z<0?14:8)+9,z+dz);l.rotation.z=-x*0.05;}
   if(detail){for(let k=0;k<4;k++)box(g,5-k,0.15,0.2,lm,0,O.D+(z<0?14:8)+4+k*4,z);mesh(g,new T.BoxGeometry(6.5,0.5,1.4),S(0x30353a),0,O.D+(z<0?14:8)+19,z).rotation.y=0.3;mesh(g,new T.CylinderGeometry(0.06,0.06,6,4),S(0x333333),0,O.D+(z<0?14:8)+22,z);const fl=mesh(g,new T.PlaneGeometry(3,1.6),flagMat('us'),1.6,O.D+24,z+1);fl.rotation.y=PI/2;}}
  mk45(g,0,O.D,-66,detail);mk45(g,0,O.D,62,detail).rotation.y=PI;mk41(g,0,O.D,-50,2,2,detail,cells);mk41(g,0,O.D,49,2,2,detail,cells);// 61+61 (shown as 64+64 incl. strikedown cranes)
  ciws(g,6,O.D+9,-16,detail,0);ciws(g,-5,O.D+8,34,detail,PI);
  if(detail)for(const s of[-1,1]){boat(g,s*6.2,O.D+8.5,4);for(let k=0;k<4;k++)mesh(g,new T.CylinderGeometry(0.35,0.35,4.4,8).rotateX(PI/2),S(0x6a7278),s*3,O.D+8.6,40+k*0.8).rotation.y=s*0.5;}
  railing(g,O,hb,O.D,detail);hullNum(g,'70',-62,O.D-2.6,hb,O.L,4.4);g.userData.vls=cells;g.userData.cls='CG';g.userData.L=O.L;g.userData.B=O.B;return finish(g);}
 // ======== Zumwalt DDG-1000 (tumblehome, inverted bow, composite deckhouse, PVLS) ========
 function zumwalt(detail=true){const g=new T.Group(),cells=[];const base='#5f666c';const O={L:190,B:24.6,D:8.2,T:8.4,flare:-0.16,bowLen:0.32,bowPow:0.9,rake:12,uRep:6,sternW:0.97};hull(g,O,'zw',base,detail);const hb=g.userData.hb;
  const dh=pmat('zdh','#676e74',2,1,{rust:false,r:0.7,metal:0.15});
  mesh(g,frustum(18.6,14,46,0.66,0.86,1.5),dh,0,O.D,8);mesh(g,frustum(12,4.6,24,0.75,0.8,1),dh,0,O.D+14,10);
  // SPY-3 flush faces + windows strip
  for(const s of[-1,1])spy(g,s*6.9,O.D+11,-4,4,s*PI/2,0.22);spy(g,0,O.D+11,-11.5,3.6,PI,0.33);box(g,9,0.6,0.3,GLS,0,O.D+13.2,-13.4);
  mesh(g,frustum(20,5.5,26,0.9,0.85),pmat('zh','#5f666c',2,1),0,O.D,52);// hangar
  // 2x AGS turrets fwd (stealth)
  for(const z of[-38,-56]){const t=new T.Group();t.position.set(0,O.D+(z>-40?1.2:0),z);g.add(t);mesh(t,frustum(7.8,2.6,8.4,0.7,0.72,-0.6),S(0x5f666c,0.7,0.2),0,0,0);if(detail)mesh(t,new T.CylinderGeometry(0.3,0.3,1.2,8),S(0x4a5055),0,1.6,-2.2);}
  // peripheral Mk57 PVLS (80 cells: 20 modules x 4, along deck edges)
  for(const s of[-1,1])for(const [z0,n] of[[-46,4],[30,6]])for(let k=0;k<n;k++){const z=z0+k*4.6;const t=(z+O.L/2)/O.L;const x=s*(hb(t)*(1+O.flare)-1.7);box(g,2.6,0.25,4.4,S(0x565d63,0.8,0.25),x,O.D,z);for(const dx of[-0.6,0.6])for(const dz of[-1.1,1.1])cells.push(new T.Vector3(x+dx,O.D+0.28,z+dz));if(detail){const l=mesh(g,new T.PlaneGeometry(2.4,4.2).rotateX(-PI/2),new T.MeshStandardMaterial({map:vlsTex,roughness:0.75,polygonOffset:true,polygonOffsetFactor:-2}),x,O.D+0.27,z);}}
  hullNum(g,'1000',-60,O.D-3.4,hb,O.L,3.6,'#3b4045',false);g.userData.vls=cells;g.userData.cls='DDG1000';g.userData.L=O.L;g.userData.B=O.B;return finish(g);}
 // ======== Independence LCS-2 (trimaran) ========
 function lcs(detail=true){const g=new T.Group();const base='#8c9399';const O={L:127,B:8.6,D:9,T:4.3,flare:0.0,bowLen:0.4,bowPow:0.85,rake:6,uRep:4,vee:true};hull(g,O,'lc',base,detail);
  for(const s of[-1,1]){const am=new T.Mesh(loft({L:86,B:3.2,D:6.5,T:1.8,bowLen:0.45,rake:5,uRep:3}),hullMat('lca',base,0.2,86,{}));am.position.set(s*12.2,2.5,18);g.add(am);}
  const sm=pmat('lcss',base,3,1,{metal:0.35});
  box(g,31.6,4,104,sm,0,6,10);// cross-deck (wide box over trimaran)
  mesh(g,frustum(28,6,52,0.8,0.82,2),sm,0,10,-6);mesh(g,frustum(16,4.6,22,0.8,0.8),sm,0,16,-12);box(g,12,1.2,0.3,GLS,0,18.2,-23.5);
  // integrated mast
  const mt=mesh(g,frustum(4.4,15,4.4,0.5,0.5),sm,0,20.6,-10);if(detail){mesh(g,new T.SphereGeometry(1.6,14,10),S(0xe0e0dc),0,37.5,-10);mesh(g,new T.BoxGeometry(3.4,1.4,0.5),S(0x30353a),0,35.4,-10);mesh(g,new T.CylinderGeometry(0.06,0.06,4,4),S(0x333333),0,40,-10);const fl=mesh(g,new T.PlaneGeometry(2.6,1.4),flagMat('us'),1.4,31,-9);fl.rotation.y=PI/2;}
  // 57mm Mk110 fwd, SeaRAM on hangar roof
  {const t=new T.Group();t.position.set(0,9,-46);g.add(t);mesh(t,frustum(3.6,2,4.4,0.6,0.7),S(0x8c9399,0.6,0.3),0,0,0);mesh(t,new T.CylinderGeometry(0.09,0.12,4,8).rotateX(PI/2),S(0x555b60),0,1.1,-3.6);}
  ram(g,0,16,16,detail,true);
  // flight deck markings (huge)
  if(detail){const fd=new T.CanvasTexture(cvs(256,256,(x,w,h)=>{x.fillStyle='#4a4f53';x.fillRect(0,0,w,h);x.strokeStyle='#e8e8e8';x.lineWidth=3;for(const yy of[80,180]){x.beginPath();x.arc(128,yy,46,0,7);x.stroke();}x.strokeStyle='#d8c040';x.beginPath();x.moveTo(128,0);x.lineTo(128,256);x.stroke();}));fd.colorSpace=T.SRGBColorSpace;mesh(g,new T.PlaneGeometry(31,40).rotateX(-PI/2),new T.MeshStandardMaterial({map:fd,roughness:0.95,polygonOffset:true,polygonOffsetFactor:-2}),0,10.02,40);}
  hullNum(g,'2',-50,6.5,g.userData.hb,O.L,4.5);g.userData.vls=[];g.userData.cls='LCS';g.userData.L=O.L;g.userData.B=31.6;return finish(g);}
 // flight-deck texture (carrier/LHA)
 function fdTex(W,L,kind,num){const k='fd'+kind;if(C[k])return C[k];const c=cvs(512,2048,(x,w,h)=>{x.fillStyle='#3a3e42';x.fillRect(0,0,w,h);for(let i=0;i<9000;i++){x.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},${Math.random()<.5?0:255},0.03)`;x.fillRect(Math.random()*w,Math.random()*h,3+Math.random()*10,2);}
  for(let i=0;i<60;i++){x.fillStyle='rgba(0,0,0,0.12)';x.fillRect(w*0.3+Math.random()*w*0.3,h*0.5+Math.random()*h*0.45,6,60+Math.random()*120);}
  x.strokeStyle='#e8e8e8';x.lineWidth=4;
  if(kind==='cv'){x.save();x.translate(w*0.42,h*0.98);x.rotate(-0.157);x.setLineDash([40,30]);x.beginPath();x.moveTo(0,0);x.lineTo(0,-h*0.6);x.stroke();x.setLineDash([]);x.strokeRect(-w*0.15,-h*0.6,w*0.3,h*0.6);x.fillStyle='#ccc';for(let i=0;i<3;i++)x.fillRect(-w*0.15,-h*(0.2+i*0.03),w*0.3,4);x.restore();
   x.strokeStyle='#bbb';x.lineWidth=3;for(const cx of[0.6,0.75])x.beginPath(),x.moveTo(w*cx,h*0.02),x.lineTo(w*cx,h*0.3),x.stroke();for(const cx of[0.25,0.33])x.beginPath(),x.moveTo(w*cx,h*0.33),x.lineTo(w*(cx-0.05),h*0.6),x.stroke();x.strokeStyle='#d8c040';x.beginPath();x.moveTo(w*0.82,h*0.05);x.lineTo(w*0.82,h*0.92);x.stroke();
   // ramp rounddown red/white, deck-edge white line, elevator outlines, JBD panels, tyre scuffs, centre-line lights, foul line
   for(let i=0;i<16;i++){x.fillStyle=i%2?'#e8e8e8':'#b02020';x.fillRect(i*w/16,h-14,w/16,14);}
   x.strokeStyle='rgba(232,232,232,0.85)';x.lineWidth=3;x.strokeRect(4,4,w-8,h-8);
   x.strokeStyle='#d8c040';x.lineWidth=3;for(const [ex,ey] of[[0.86,0.4],[0.86,0.55],[0.08,0.78]]){x.setLineDash([12,8]);x.strokeRect(w*ex-30,h*ey,60,70);}x.setLineDash([]);
   x.fillStyle='#4a4f52';for(const [cx,cy] of[[0.6,0.29],[0.75,0.29],[0.27,0.58]]){x.fillRect(w*cx-18,h*cy,36,10);}
   x.save();x.translate(w*0.42,h*0.98);x.rotate(-0.157);for(let i=0;i<220;i++){x.fillStyle=`rgba(10,10,10,${0.06+Math.random()*0.1})`;x.fillRect((Math.random()-0.5)*w*0.18,-h*(0.15+Math.random()*0.3),2+Math.random()*3,30+Math.random()*80);}x.fillStyle='#f0f0e0';for(let i=0;i<30;i++)x.fillRect(-2,-h*0.6+i*h*0.02,4,6);x.restore();
   x.strokeStyle='#c8382c';x.lineWidth=4;x.setLineDash([16,10]);x.beginPath();x.moveTo(w*0.05,h*0.62);x.lineTo(w*0.62,h*0.48);x.stroke();x.setLineDash([]);}
  else{x.setLineDash([30,24]);x.beginPath();x.moveTo(w*0.45,h*0.02);x.lineTo(w*0.45,h*0.98);x.stroke();x.setLineDash([]);for(let i=0;i<9;i++){x.beginPath();x.arc(w*0.2,h*(0.08+i*0.1),24,0,7);x.stroke();x.fillStyle='#e8e8e8';x.font='bold 22px Arial';x.fillText(String(i+1),w*0.2-6,h*(0.08+i*0.1)+8);}}
  x.save();x.translate(w*0.45,h*0.06);x.fillStyle='#e8e8e8';x.font='bold 150px Arial';x.textAlign='center';x.fillText(num,0,0);x.restore();});const t=tex(c,true);t.wrapS=t.wrapT=T.ClampToEdgeWrapping;return C[k]=new T.MeshStandardMaterial({map:t,roughness:0.85,metalness:0.1});}
 function deckShape(pts){const s=new T.Shape();pts.forEach((p,i)=>s[i?'lineTo':'moveTo'](p[0],-p[1]));return s;}
 function fdMesh(g,pts,y,th,mat,side){const s=deckShape(pts);const geo=new T.ExtrudeGeometry(s,{depth:th,bevelEnabled:false}).rotateX(-PI/2).translate(0,y-th,0);
  // planar uv over xz bbox
  geo.computeBoundingBox();const bb=geo.boundingBox,p=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)-bb.min.x)/(bb.max.x-bb.min.x),1-(p.getZ(i)-bb.min.z)/(bb.max.z-bb.min.z));
  const m=new T.Mesh(geo,[mat,side]);g.add(m);return m;}
 // parked aircraft as instanced proxies: one prototype per type is baked into one geometry per material, then one InstancedMesh per material covers every parked copy
 const PROTO={};
 function proto(kind,make){if(PROTO[kind]!==undefined)return PROTO[kind];let a;try{a=make();}catch(e){return PROTO[kind]=null;}a.updateMatrixWorld(true);const inv=new T.Matrix4().copy(a.matrixWorld).invert();const by=new Map();
  a.traverse(o=>{if(!o.isMesh||!o.visible||o.isSkinnedMesh||Array.isArray(o.material)||o.material.transparent||o.material.blending!==T.NormalBlending)return;let p=o;let vis=true;while(p){if(!p.visible)vis=false;if(p.parent&&p.parent.isLOD&&p.parent.levels[0].object!==p)vis=false;p=p.parent;}if(!vis)return;let ge=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();for(const k of Object.keys(ge.attributes))if(!['position','normal','uv'].includes(k))ge.deleteAttribute(k);if(!ge.attributes.normal)ge.computeVertexNormals();if(!ge.attributes.uv)ge.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(ge.attributes.position.count*2),2));ge.morphAttributes={};ge.applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));
   if(!by.has(o.material))by.set(o.material,[]);by.get(o.material).push(ge);});
  const parts=[];for(const [m,arr] of by){let mg=null;try{mg=arr.length>1?mergeGeometries(arr,false):arr[0];}catch(e){}if(mg)parts.push([mg,m]);}return PROTO[kind]=parts;}
 function instAC(g,kind,make,mats){const parts=proto(kind,make);if(!parts||!mats.length)return;for(const [ge,m] of parts){const im=new T.InstancedMesh(ge,m,mats.length);mats.forEach((q,i)=>im.setMatrixAt(i,q));im.castShadow=false;im.receiveShadow=true;im.userData.parked=kind;g.add(im);}}
 function parked(g,n,x0,z0,dz,y,ry,kind){if(typeof fa18e!=='function')return;const mats=[];for(let i=0;i<n;i++)mats.push(new T.Matrix4().compose(new T.Vector3(x0,y,z0+i*dz),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),ry),new T.Vector3(1,1,1)));
  const k=kind==='f35'&&typeof f35==='function'?'f35':'fa18';instAC(g,k,()=>k==='f35'?f35(0x6b737c):fa18e(0x8a949c),mats);}
 // ======== Gerald R. Ford CVN-78 ========
 function ford(detail=true){const g=new T.Group();const O={L:317,B:41,D:13,T:12,flare:0.15,sheer:1.5,bowLen:0.22,rake:-10,uRep:10,sternW:0.95};hull(g,O,'fd',HG,detail);const sm=pmat('ss'+HG,HG,4,1);
  // hangar sponson body + flight deck (angled deck to port, 78 m wide)
  box(g,58,8,262,sm,4,O.D,18);
  const pts=[[-10,-168],[12,-168],[28,-150],[36,-120],[39,-40],[39,150],[24,165],[-14,165],[-39,150],[-39,40],[-30,-20],[-22,-90],[-18,-150]];
  fdMesh(g,pts,O.D+10,2.2,fdTex(78,333,'cv','78'),sm);
  for(const z of[-60,-20])box(g,16,0.6,20,S(0x34383c,0.9,0.1),45,O.D+9.6,z);box(g,16,0.6,20,S(0x34383c,0.9,0.1),-45,O.D+9.6,110);
  // island (smaller, aft, with EASR/SPY-3 flat faces)
  const iy=O.D+10;mesh(g,frustum(12,10,26,0.9,0.85),sm,32,iy,62);mesh(g,frustum(10,6,16,0.9,0.8),sm,32,iy+10,60);box(g,9.6,2,0.3,GLS,32,iy+13,52);box(g,0.3,2,12,GLS,27.3,iy+13,60);
  for(const [x,z,ry] of[[32,51.4,PI],[37.1,60,PI/2],[26.9,60,-PI/2],[32,68.8,0]])spy(g,x,iy+7.5,z,3.6,ry,0.18);
  const ms=mast(g,32,iy+16,61,18,detail,HGc);if(detail)fordIsland(g,32,iy,56);
  ram(g,-36,O.D+6,150,detail);ram(g,36,O.D+6,-140,detail);ciws(g,-34,O.D+6,-138,detail);ciws(g,30,O.D+6,150,detail);
  if(detail){parked(g,8,30,-150,14,iy+0.2,PI/2+0.5,'fa18');parked(g,5,-28,80,16,iy+0.2,-PI/2+0.4,'f35');}
  hullNum(g,'78',-140,O.D-1,g.userData.hb,O.L,6);
  g.userData.vls=[];g.userData.cls='CVN';g.userData.L=O.L;g.userData.B=78;return finish(g);}
 // ======== America LHA-6 ========
 function america(detail=true){const g=new T.Group();const O={L:257,B:32,D:12,T:7.9,flare:0.12,sheer:1.2,bowLen:0.22,rake:-8,uRep:8,sternW:0.98};hull(g,O,'am',HG,detail);const sm=pmat('ss'+HG,HG,4,1);
  box(g,36,7,236,sm,0,O.D,10);const pts=[[-12,-128],[12,-128],[18,-118],[18.5,128],[-18.5,128],[-18,-118]];fdMesh(g,pts,O.D+9,2,fdTex(36,257,'lha','6'),sm);
  box(g,15,0.6,18,S(0x34383c,0.9,0.1),25,O.D+8.4,70);box(g,15,0.6,18,S(0x34383c,0.9,0.1),-25,O.D+8.4,0);
  const iy=O.D+9;mesh(g,frustum(10,9,48,0.9,0.9),sm,13,iy,-6);mesh(g,frustum(8,7,28,0.9,0.8),sm,13,iy+9,-10);box(g,7.6,2,0.3,GLS,13,iy+12,-24);
  const ms=mast(g,13,iy+16,-8,16,detail,HGc);if(detail){mesh(g,new T.BoxGeometry(5,3.4,0.5),S(0x3a4046),13,iy+17.5,-16).rotation.y=0.4;mesh(g,new T.BoxGeometry(7,1.8,0.6),S(0x3a4046),13,iy+28,-4).rotation.y=-0.6;}
  ram(g,17,O.D+5,-122,detail);ram(g,-17,O.D+5,124,detail);ciws(g,-17,O.D+5,-120,detail);ciws(g,17,O.D+5,124,detail);
  if(detail&&typeof heli==='function'){{const mats=[];for(let i=0;i<4;i++)mats.push(new T.Matrix4().compose(new T.Vector3(-6,iy+1.5,-90+i*26),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),PI/2),new T.Vector3(1.6,1.6,1.6)));instAC(g,'heli',()=>heli(),mats);}parked(g,5,-6,40,15,iy+0.2,PI/2,'f35');}
  hullNum(g,'6',-110,O.D-1,g.userData.hb,O.L,6);g.userData.vls=[];g.userData.cls='LHA';g.userData.L=O.L;g.userData.B=36;return finish(g);}
 // LOD wrapper: full detail near, simplified far (no small parts, no parked aircraft)
 function lod(fn,args=[]){const L=new T.LOD();const hi=fn(true,...args);try{clutter(hi);}catch(e){console.warn('clutter',e);}try{hi.userData.mergedMats=mergeStatic(hi);}catch(e){console.warn('merge',e);}const lo=fn(false,...args);lo.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});L.addLevel(hi,0);L.addLevel(lo,1400);const far=new T.Group();L.addLevel(far,16000);L.userData=Object.assign({},hi.userData);L.userData.hi=hi;return L;}
 return {burke,tico,zumwalt,lcs,ford,america,lod,ciws,mk45,mk41,flagMat,numMat,hullNum,pmat,plate};})();

// ---- US task group placement + VLS launch-point API (for the SM-3 'msl' builder) ----
const NAVY_FLEET=(()=>{const T=THREE;const ships=[];if(typeof scene==='undefined')return {ships};
 const C0=(typeof CARRIER_POS!=='undefined'?CARRIER_POS:new T.Vector3(2500,0,8500));
 const wet=(x,z)=>typeof terrainH!=='function'||terrainH(x,z)<-15;
 const spec=[['ford',1500,700,0],['burke',-700,-900,0],['tico',900,-1400,0],['zumwalt',-1600,600,0],['lcs',-500,1700,0],['america',2600,2200,0]];
 for(const [k,dx,dz,ry] of spec){let x=C0.x+dx,z=C0.z+dz;for(let t=0;t<12&&!wet(x,z);t++){x+=400;z+=600;}
  let m;try{m=NAVYX.lod(NAVYX[k]);}catch(e){console.warn('navy',k,e);continue;}m.position.set(x,0,z);m.rotation.y=ry;m.userData.kind=k;scene.add(m);ships.push({m,kind:k,ph:Math.random()*6.28,hp:k==='ford'||k==='america'?8:4});}
 const _w=new T.Vector3();
 // API: NAVY_VLS.ships() -> ships with VLS; .nearest(pos,cls?) ; .cell(ship,i) -> {pos:Vector3 world, dir:Vector3 up, index}; .next(ship) round-robin; .open(ship,i) flash hatch
 const VLS={ships:()=>ships.filter(s=>s.m.userData.vls&&s.m.userData.vls.length),
  nearest(p,cls){let b=null,bd=1e18;for(const s of VLS.ships()){if(cls&&s.m.userData.cls!==cls)continue;const d=s.m.position.distanceToSquared(p);if(d<bd){bd=d;b=s;}}return b;},
  cell(s,i){const c=s.m.userData.vls;const k=((i%c.length)+c.length)%c.length;s.m.updateMatrixWorld(true);const pos=c[k].clone().applyMatrix4(s.m.matrixWorld);const dir=new T.Vector3(0,1,0).applyQuaternion(s.m.getWorldQuaternion(new T.Quaternion()));return {pos,dir,index:k,ship:s};},
  next(s){s._vi=(s._vi||0)+1;return VLS.cell(s,s._vi*7);},
  open(s,i){const c=VLS.cell(s,i);try{if(typeof fire!=='undefined')for(let k=0;k<8;k++)fire.spawn(c.pos,rnd(4),6+rnd(4),rnd(4),0.4,3,4,1,0.8,0.4,1);}catch(e){}return c;}};
 window.NAVY_VLS=VLS;
 const tick=dt=>{const t=(typeof simT!=='undefined'?simT:performance.now()/1000);for(const s of ships){const L=s.m.userData.L||150;s.m.position.y=Math.sin(t*0.5+s.ph)*0.3*(150/L);s.m.rotation.x=Math.sin(t*0.37+s.ph)*0.006;s.m.rotation.z=Math.sin(t*0.29+s.ph)*0.012*(150/L);}};
 {const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);try{tick(dt);}catch(e){}};}
 window.__navy={pick:()=>{const rc=new T.Raycaster();rc.setFromCamera(new T.Vector2(0,0),camera);const h=rc.intersectObjects(scene.children,true)[0];if(!h)return "none";const r=[];let o=h.object;while(o){r.push((o.type||"")+":"+(o.geometry?o.geometry.type:"")+":"+(o.userData.kind||o.userData.cls||"")+":"+(o.material&&o.material.color?o.material.color.getHexString():""));o=o.parent;}return h.distance.toFixed(0)+" "+r.join(" < ");},ships,NAVYX,shot:(L)=>{camera.position.set(L[0],L[1],L[2]);camera.lookAt(L[3],L[4],L[5]);camera.updateMatrixWorld();renderer.render(scene,camera);},lw:(o,v)=>{o.updateMatrixWorld(true);const p=o.localToWorld(new T.Vector3(v[0],v[1],v[2]));return [p.x,p.y,p.z];},wp:(o)=>{o.updateMatrixWorld(true);const p=o.getWorldPosition(new T.Vector3());return [p.x,p.y,p.z];}};return {ships};})();
