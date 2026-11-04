//GB2-BEGIN  Northrop Grumman B-2A Spirit - true scale: span 52.4 m, length 21.0 m, height 5.2 m. Nose -Z, wheels touch y=-2 (gearH).
// Material/texture/lighting approach mirrors gmissiles.js: canvas albedo + roughness map (grime, panel lines, fastener rows, stencils), MeshStandard PBR, gmissiles-style mat()/glass().
const B2=(()=>{
const T=THREE,PI=Math.PI,HS=26.2,ZN=-10.5,TAN=Math.tan(33*PI/180),Y0=0.95;
// ---------- planform: 33 deg leading edge, double-W sawtooth trailing edge ----------
// TE vertices measured from USAF plan-view photo (refs/b2/B2PlanView.jpg): centre, inner notch, mid apex, outer notch, outer apex, tip
const TE=[[0,9.3],[4.1,7.1],[6.9,8.4],[13.8,4.7],[22.3,10.5],[26.2,ZN+HS*TAN]];
const zLE=x=>ZN+Math.abs(x)*TAN;
const zTE=x=>{x=Math.abs(x);for(let i=1;i<TE.length;i++)if(x<=TE[i][0]){const a=TE[i-1],b=TE[i],u=(x-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*u;}return TE[TE.length-1][1];};
const afl=t=>t<=0||t>=1?0:Math.pow(t,0.75)*Math.pow(1-t,1.5)/0.2388; // sharp beak LE, knife TE
const bS=(t,a,b)=>{const s=(t-a)/(b-a);return s<=0||s>=1?0:Math.pow(s,0.5)*Math.pow(1-s,1.5)/0.2165;};
const bN=t=>t<=0||t>=1?0:Math.pow(t,1.15)*Math.pow(1-t,1.6)/0.1543; // beak: slow rise from the sharp nose
const ZI=-4.4; // intake face station (plan-view photo)
// smooth continuous blended centre body; low cockpit bump; nacelle hoods that rise sharply at the intake then fair aft into the exhaust trough
function prof(x,t){const ax=Math.abs(x),za=zLE(x),c=zTE(x)-za,f=afl(t),z=za+c*t;const wt=c*0.034*f,wb=c*0.021*f;
 const Bt=ax<7.5?Math.pow(1-(ax/7.5)**2,2):0,body=1.25*Bt*bN(t);
 const ck=ax<1.9?Math.pow(Math.cos(ax/1.9*PI/2),2)*0.4*bS(t,0.07,0.45):0;
 let ng=0;if(Math.abs(ax-4.9)<2.1&&z>ZI){const lat=Math.pow(Math.cos((ax-4.9)/2.1*PI/2),1.6);const r=Math.min(1,(z-ZI)/0.7);const d=z<1?1:Math.max(0,1-(z-1)/5.5);ng=0.62*lat*Math.sqrt(r)*d*d*(3-2*d)/Math.max(d,1e-3)*d;}
 const Bb=ax<13.8?Math.pow(1-ax/13.8,1.5):0,belly=0.8*Bb*bN(t);
 return[wt+body+ck+ng+Y0,-(wb+belly)+Y0];}
function H(x,z,top){const a=zLE(x),b=zTE(x);const t=Math.min(0.999,Math.max(0.001,(z-a)/(b-a)));return prof(x,t)[top?0:1];}
// ---------- skin textures (gmissiles skin() technique, painted in planform UV space) ----------
const TW=2048,TH=1024,PX=x=>(x/(2*HS)+0.5)*TW,PZ=z=>(z-ZN)/21*TH;
function b2Skin(){const c=document.createElement('canvas');c.width=TW;c.height=TH;const x=c.getContext('2d');const r=document.createElement('canvas');r.width=TW;r.height=TH;const rx=r.getContext('2d');
 x.fillStyle='#565d67';x.fillRect(0,0,TW,TH);rx.fillStyle='#bcbcbc';rx.fillRect(0,0,TW,TH);
 for(let i=0;i<2600;i++){x.fillStyle=`rgba(${Math.random()<0.5?'30,34,40':'110,118,128'},${Math.random()*0.03})`;const s=6+Math.random()*50;x.fillRect(Math.random()*TW,Math.random()*TH,s*2.5,s);}
 // chordwise exhaust/fluid streaks + fine grain
 for(let i=0;i<500;i++){const xx=Math.random()*TW,y=Math.random()*TH;x.fillStyle=`rgba(20,20,22,${Math.random()*0.05})`;x.fillRect(xx,y,1+Math.random()*3,30+Math.random()*160);}
 const line=(pts,col,w,ctx=x)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(PX(a),PZ(b)):ctx.moveTo(PX(a),PZ(b)));ctx.stroke();};
 const both=(f)=>{f(1);f(-1);};
 // RAM tape: LE band, spanwise panel seams, chordwise seams (slightly lighter, smoother)
 both(s=>{for(const off of[0.55,2.3])line([[0,ZN+off],[s*HS,zLE(HS)+off]],'rgba(118,126,136,0.45)',7);line([[0,ZN+0.55],[s*HS,zLE(HS)+0.55]],'rgba(175,175,175,1)',7,rx);
  for(const xs of[2.7,7.3,9.8,13.5,17.2,21,24]){line([[s*xs,zLE(xs)+0.3],[s*xs,zTE(xs)-0.2]],'rgba(30,34,40,0.4)',2);line([[s*xs+s*0.08,zLE(xs)+0.3],[s*xs+s*0.08,zTE(xs)-0.2]],'rgba(120,128,138,0.3)',5);}
  for(const zs of[-5,-1,3,6]){const x0=Math.max(0.3,(zs-ZN)/TAN+0.4);const x1=Math.min(HS-1,(()=>{let q=x0;while(q<HS&&zTE(q)>zs+0.4)q+=0.1;return q;})());if(x1>x0)line([[s*x0,zs],[s*x1,zs]],'rgba(18,18,20,0.5)',2);}
  // fastener rows along seams
  x.fillStyle='rgba(15,15,17,0.5)';for(const xs of[2.7,7.3,13.5,21])for(let z=zLE(xs)+0.4;z<zTE(xs)-0.3;z+=0.18){x.beginPath();x.arc(PX(s*xs)+s*5,PZ(z),1.3,0,7);x.fill();}
  // TE elevon hinge lines (outer three segments)
  for(let i=2;i<TE.length-1;i++){const a=TE[i],b=TE[i+1];line([[s*a[0],a[1]-1.4],[s*b[0],b[1]-1.4]],'rgba(10,10,12,0.75)',2.6);}
  line([[s*TE[0][0],TE[0][1]-1.6],[s*TE[1][0],TE[1][1]-1.4]],'rgba(10,10,12,0.7)',2.4); // GLAS beaver tail
});
 // centerline + crew hatch outline
 line([[0,ZN+0.3],[0,10.3]],'rgba(15,15,17,0.45)',2);x.strokeStyle='rgba(12,12,14,0.6)';x.lineWidth=2;x.strokeRect(PX(-0.45),PZ(-5.6),PX(0.45)-PX(-0.45),PZ(-4.7)-PZ(-5.6));
 const mk=(cv,s)=>{const t=new T.CanvasTexture(cv);t.colorSpace=s?T.SRGBColorSpace:T.NoColorSpace;t.anisotropy=8;return t;};return{map:mk(c,1),rough:mk(r,0)};}
function mat(c,m=0.2,r=0.5,extra){return new (extra&&extra.clearcoat?T.MeshPhysicalMaterial:T.MeshStandardMaterial)(Object.assign({color:c,metalness:m,roughness:r},extra||{}));}
const glass=()=>new T.MeshPhysicalMaterial({color:0x0c1218,envMapIntensity:1.3,metalness:0,roughness:0.05,clearcoat:1,clearcoatRoughness:0.03,iridescence:0.35});
let SK=null,M=null;
function mats(){if(M)return M;SK=b2Skin();M={skin:mat(0xffffff,0.12,0.62,{map:SK.map,roughnessMap:SK.rough,envMapIntensity:0.9}),
 deck:mat(0x77736c,0.55,0.55),deckDark:mat(0x4f4b45,0.6,0.5),hole:mat(0x060607,0.2,0.95),duct:mat(0x16171a,0.4,0.7,{side:T.DoubleSide}),lip:mat(0x2e3135,0.4,0.5,{side:T.DoubleSide}),
 door:mat(0xffffff,0.12,0.62,{side:T.DoubleSide,map:SK.map,envMapIntensity:0.9}),well:mat(0x8a8d90,0.3,0.6,{side:T.DoubleSide}),strut:mat(0xb8bcc0,0.85,0.28),chrome:mat(0xe0e2e4,1,0.12),tyre:mat(0x161616,0,0.9),hub:mat(0x9a9ea2,0.7,0.4),
 frame:mat(0x3a4048,0.2,0.6),glass:glass(),bay:mat(0xb4b8bc,0.2,0.55,{side:T.DoubleSide,emissive:0x2a2c30}),lamp:mat(0xffffff,0.2,0.1,{emissive:0x666650}),nav:mat(0xff2020,0,0.3,{emissive:0x660000})};return M;}
// ---------- conforming overlays: any planform polygon draped onto the skin ----------
function drape(pts,top,off,material,div=10){ // tessellated overlay: fine grid clipped to polygon, every vertex sampled on the skin
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const[a,b]of pts){x0=Math.min(x0,a);x1=Math.max(x1,a);z0=Math.min(z0,b);z1=Math.max(z1,b);}
 const st=Math.max(0.05,Math.min(0.2,Math.max(x1-x0,z1-z0)/24));const inP=(x,z)=>{let c=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,zi]=pts[i],[xj,zj]=pts[j];if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))c=!c;}return c;};
 const nx=Math.ceil((x1-x0)/st),nz=Math.ceil((z1-z0)/st),pos=[],uv=[],idx=[];const V=(x,z)=>{pos.push(x,H(x,z,top)+(top?off:-off),z);uv.push(x/(2*HS)+0.5,(z-ZN)/21);return pos.length/3-1;};
 const id=new Map();const g=(i,j)=>{const k=i*10000+j;if(!id.has(k))id.set(k,V(x0+Math.min(x1-x0,i*st),z0+Math.min(z1-z0,j*st)));return id.get(k);};
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const cx=x0+(i+0.5)*st,cz=z0+(j+0.5)*st;if(!inP(cx,cz))continue;const a=g(i,j),b=g(i+1,j),c=g(i,j+1),d=g(i+1,j+1);if(top)idx.push(a,c,b,b,c,d);else idx.push(a,b,c,b,d,c);}
 const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(pos,3));ge.setAttribute('uv',new T.Float32BufferAttribute(uv,2));ge.setIndex(idx);ge.computeVertexNormals();
 const m=new T.Mesh(ge,material);m.castShadow=m.receiveShadow=true;return m;}
function dquad(p,top,off,material,n=12){const pos=[],uv=[],idx=[];for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){const u=i/n,v=j/n;
  const x=(p[0][0]*(1-u)+p[1][0]*u)*(1-v)+(p[3][0]*(1-u)+p[2][0]*u)*v,z=(p[0][1]*(1-u)+p[1][1]*u)*(1-v)+(p[3][1]*(1-u)+p[2][1]*u)*v;pos.push(x,H(x,z,top)+off,z);uv.push(u,v);}
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+1,c=a+n+1,d=c+1;idx.push(a,b,c,b,d,c);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const m=new T.Mesh(g,material);m.material.side=T.DoubleSide;return m;}
const grid=(x0,x1,z0,z1,n=8)=>{const a=[];for(let i=0;i<=n;i++)a.push([x0+(x1-x0)*i/n,z0]);for(let i=0;i<=n;i++)a.push([x1,z0+(z1-z0)*i/n]);for(let i=n;i>=0;i--)a.push([x0+(x1-x0)*i/n,z1]);for(let i=n;i>=0;i--)a.push([x0,z0+(z1-z0)*i/n]);return a;};
// ---------- airframe surface ----------
function airframe(){const xs=[];for(let x=0;x<=HS+1e-6;){xs.push(x);x+=x<3?0.15:x<8?0.2:0.35;}for(const b of TE)xs.push(b[0]);xs.push(HS-0.05);
 const XS=[...new Set(xs.map(v=>Math.min(HS,+v.toFixed(3))))].sort((a,b)=>a-b);const AX=[...XS.slice(1).reverse().map(v=>-v),...XS];
 const NT=56,ts=[];for(let j=0;j<=NT;j++){const u=j/NT;ts.push(u<0.5?0.5*Math.pow(2*u,1.8):1-0.5*Math.pow(2*(1-u),1.4));}
 const pos=[],uv=[],idx=[];const W=AX.length;
 for(const top of[1,0]){const base=pos.length/3;for(const t of ts)for(const x of AX){const a=zLE(x),b=zTE(x);const z=a+(b-a)*t;const pr=prof(x,t);pos.push(x,Math.abs(x)>=HS-1e-3?Y0:pr[top?0:1],z);uv.push(x/(2*HS)+0.5,(z-ZN)/21);}
  for(let j=0;j<NT;j++)for(let i=0;i<W-1;i++){const a=base+j*W+i,b=a+1,c=a+W,d=c+1;if(top)idx.push(a,c,b,b,c,d);else{const xm=(AX[i]+AX[i+1])/2,zm=pos[a*3+2];const inBay=Math.abs(xm)>0.62&&Math.abs(xm)<2.48&&zm>-3.35&&zm<2.55;if(!inBay)idx.push(a,b,c,b,d,c);}}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const m=new T.Mesh(g,mats().skin);m.castShadow=m.receiveShadow=true;return m;}
// sawtooth-edged gear door (LO serrations fore/aft), stiffener ribs, hinge & actuator
function sawDoor(L,Hh){const Mt=mats();const sh=new T.Shape();const n=3,z0=-L/2,z1=L/2;sh.moveTo(z0,0);for(let i=0;i<=n*2;i++)sh.lineTo(z0+(i%2?0.35:0),-Hh*i/(n*2));
 for(let i=n*2;i>=0;i--)sh.lineTo(z1-(i%2?0.35:0),-Hh*i/(n*2));sh.closePath();
 const g=new T.ExtrudeGeometry(sh,{depth:0.05,bevelEnabled:false});g.rotateY(PI/2);g.translate(0,Hh/2,0);const m=new T.Mesh(g,Mt.door);
 for(let k=0;k<4;k++){const rb=new T.Mesh(new T.BoxGeometry(0.06,Hh*0.8,0.05),Mt.well);rb.position.set(0.05,0,-L/2+0.6+k*(L-1.2)/3);m.add(rb);}
 const hg=new T.Mesh(new T.CylinderGeometry(0.04,0.04,L*0.9,8).rotateX(PI/2),Mt.strut);hg.position.set(0.04,Hh/2,0);m.add(hg);
 const ac=new T.Mesh(new T.CylinderGeometry(0.035,0.035,Hh*0.7,8),Mt.chrome);ac.position.set(0.12,Hh*0.15,L*0.2);ac.rotation.z=0.3;m.add(ac);return m;}
function sawDoor(L,Hh){const Mt=mats();const sh=new T.Shape();const n=3,z0=-L/2,z1=L/2;sh.moveTo(z0,0);for(let i=0;i<=n*2;i++)sh.lineTo(z0+(i%2?0.35:0),-Hh*i/(n*2));
 for(let i=n*2;i>=0;i--)sh.lineTo(z1-(i%2?0.35:0),-Hh*i/(n*2));sh.closePath();
 const g=new T.ExtrudeGeometry(sh,{depth:0.05,bevelEnabled:false});g.rotateY(PI/2);g.translate(0,Hh/2,0);const m=new T.Mesh(g,Mt.door);
 for(let k=0;k<4;k++){const rb=new T.Mesh(new T.BoxGeometry(0.06,Hh*0.8,0.05),Mt.well);rb.position.set(0.05,0,-L/2+0.6+k*(L-1.2)/3);m.add(rb);}
 const hg=new T.Mesh(new T.CylinderGeometry(0.04,0.04,L*0.9,8).rotateX(PI/2),Mt.strut);hg.position.set(0.04,Hh/2,0);m.add(hg);return m;}
// ---------- model ----------
function build(){const G=new T.Group();G.name='B-2A Spirit';const Mt=mats();G.add(airframe());const A={elev:[],drag:[],gear:[],doors:[],bay:[],bayDoors:[]};
 for(const s of[1,-1]){
  // serrated top intake (S-duct), splitter lip, boundary-layer slot, auxiliary inlet doors
  const xi0=s*3.0,xi1=s*6.8,zi=ZI;const saw=[];const n=6;for(let i=0;i<=n;i++)saw.push([xi0+(xi1-xi0)*i/n,zi-0.25+(i%2?-0.45:0)]);
  G.add(drape([...saw,...saw.slice().reverse().map(([a,b])=>[a,b-0.18])],1,0.02,Mt.lip,6)); // serrated boundary-layer splitter slot
  G.add(drape([...saw,[xi1,zi],[xi0,zi]],1,0.012,Mt.hole,8));
  {const sh=new T.Shape();const w=1.9;sh.moveTo(-w,0);for(let k=0;k<=24;k++){const a=PI*k/24;sh.lineTo(-Math.cos(a)*w,Math.pow(Math.sin(a),0.7)*0.6);}sh.lineTo(w,0);
   const op=new T.Mesh(new T.ShapeGeometry(sh,16),Mt.hole);op.position.set(s*4.9,H(s*4.9,zi-0.05,1)-0.02,zi+0.05);G.add(op);
   const hood=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([...Array(25)].map((_,k)=>{const a=PI*k/24;return V3(-Math.cos(a)*1.95,Math.pow(Math.sin(a),0.7)*0.62,0);})),48,0.05,8,false),Mt.lip);}
  for(const xa of[3.7,6.1]){const d=drape(grid(s*(xa-0.4),s*(xa+0.4),zi+2.6,zi+3.2,4),1,0.02,Mt.door);G.add(d);G.add(drape(grid(s*(xa-0.4),s*(xa+0.4),zi+2.6,zi+3.2,4),1,0.008,Mt.hole));
   d.geometry.translate(0,0,-(zi+2.6));d.position.z=zi+2.6;d.rotation.x=0.35;d.position.y=0.02;}
  // recessed exhaust trench + heat-tolerant aft deck (lighter ceramic tiles)
  const ze0=3.4,ze1=4.6;G.add(drape(grid(s*3.4,s*6.4,ze0,ze1,8),1,0.01,Mt.hole));
  for(let k=0;k<5;k++)G.add(drape(grid(s*(3.5+k*0.6),s*(3.5+k*0.6+0.08),ze0+0.05,ze1-0.05,2),1,0.02,Mt.deckDark));
  G.add(drape([[s*3.2,ze1],[s*6.6,ze1],[s*7.0,8.1],[s*5.6,7.6],[s*4.2,6.9],[s*3.0,7.2]],1,0.015,Mt.deck,10));
  for(let k=0;k<12;k++)G.add(drape(grid(s*3.3,s*6.5,ze1+0.18*k+0.15,ze1+0.18*k+0.17,6),1,0.02,Mt.deckDark,2));
  G.add(drape(grid(s*3.3,s*6.5,ze0-0.3,ze0,8),1,0.03,Mt.lip));
  for(let i=0;i<TE.length-2;i++){const a=TE[i],b=TE[i+1];G.add(drape([[s*a[0],a[1]-0.02],[s*b[0],b[1]-0.02],[s*b[0],b[1]-0.22],[s*a[0],a[1]-0.22]],1,0.008,Mt.frame,4));}
  // elevons on the W segments; split drag-rudder (upper/lower) on the outboard segment
  for(let i=1;i<TE.length-2;i++){const a=TE[i],b=TE[i+1];const outb=i===3;
   const poly=[[s*a[0],a[1]-0.02],[s*b[0],b[1]-0.02],[s*b[0],b[1]-1.4],[s*a[0],a[1]-1.4]];
   if(!outb){const e=drape(poly,1,0.006,Mt.skin,6);e.userData.hx=[s*a[0],a[1]-1.4,s*b[0],b[1]-1.4];G.add(e);A.elev.push(e);}
   else for(const top of[1,0]){const hx=[s*(a[0]+0.6),a[1]-1.4,s*(b[0]-0.6),b[1]-1.4];
    const pl=[[s*(a[0]+0.6),a[1]-0.05],[s*(b[0]-0.6),b[1]-0.05],[s*(b[0]-0.6),b[1]-1.4],[s*(a[0]+0.6),a[1]-1.4]];
    const piv=new T.Group();const p0=V3(hx[0],H(hx[0],hx[1],top),hx[1]),p1=V3(hx[2],H(hx[2],hx[3],top),hx[3]);piv.position.copy(p0);piv.userData.axis=p1.clone().sub(p0).normalize();piv.userData.dir=top?1:-1;piv.userData.s=s;
    const d=drape(pl,top,0.02,Mt.skin,6);d.position.sub(p0);piv.add(d);G.add(piv);A.drag.push(piv);}}
  // gear: main 4-wheel bogie, oleo strut, side brace, doors with tail number
  const gx=s*6.2,gz=1.2;const mg=new T.Group();mg.position.set(gx,H(gx,gz,0),gz);G.add(mg);const L=mg.position.y+2-0.62;
  const st=new T.Mesh(new T.CylinderGeometry(0.17,0.17,L*0.6,16),Mt.strut);st.position.y=-L*0.3;mg.add(st);const ol=new T.Mesh(new T.CylinderGeometry(0.12,0.12,L*0.5,16),Mt.chrome);ol.position.y=-L*0.72;mg.add(ol);
  const br=new T.Mesh(new T.CylinderGeometry(0.06,0.06,L*0.9,8),Mt.strut);br.position.set(-s*0.5,-L*0.45,0.7);br.rotation.set(-0.5,0,s*0.45);mg.add(br);
  const bog=new T.Mesh(new T.BoxGeometry(0.3,0.22,1.9),Mt.strut);bog.position.y=-L;mg.add(bog);
  for(const wz of[-0.72,0.72])for(const wx of[-0.48,0.48]){const w=new T.Mesh(new T.CylinderGeometry(0.62,0.62,0.42,28).rotateZ(PI/2),Mt.tyre);w.position.set(wx,-L,wz);mg.add(w);const h=new T.Mesh(new T.CylinderGeometry(0.34,0.34,0.44,18).rotateZ(PI/2),Mt.hub);h.position.copy(w.position);mg.add(h);
   for(let k=0;k<4;k++){const g2=new T.Mesh(new T.TorusGeometry(0.62,0.025,4,28).rotateY(PI/2),Mt.hub);g2.position.set(wx+(k-1.5)*0.09,-L,wz);g2.scale.set(1,0.98,0.98);mg.add(g2);}}
  A.gear.push(mg);
  // gear well + doors (hinged at outer edge, hanging vertical)
  G.add(drape(grid(gx-1.0,gx+1.0,gz-2.0,gz+2.2,4),0,0.02,Mt.hole));
  for(const sd of[-1,1]){const dr=sawDoor(4.0,1.6);dr.position.set(gx+sd*1.02,H(gx,gz,0)-0.8,gz+0.1);G.add(dr);A.doors.push(dr);
   const num=new T.Mesh(new T.PlaneGeometry(2.6,0.55),new T.MeshStandardMaterial({map:NUM,transparent:true,roughness:0.6,polygonOffset:true,polygonOffsetFactor:-2}));num.position.set(sd*0.035,0.1,0);num.rotation.y=sd*PI/2;dr.add(num);}
  // bomb bay (one per side of the centerline): doors open as two leaves, rotary launcher with 8 B61-12 (gmissiles model)
  const bx=s*1.55,bz0=-3.4,bz1=2.6;
  const by=H(bx,(bz0+bz1)/2,0);
  const box=new T.Mesh(new T.BoxGeometry(1.9,1.3,6.0,1,1,1),mats().bay);box.position.set(bx,by+0.55,(bz0+bz1)/2);box.material=mats().bay;box.geometry.scale(-1,1,1);G.add(box);A.bay.push(box);
  const rl=new T.Group();rl.position.set(bx,by+0.55,(bz0+bz1)/2);G.add(rl);A.bay.push(rl);const sp=new T.Mesh(new T.CylinderGeometry(0.16,0.16,5.8,16).rotateX(PI/2),Mt.strut);rl.add(sp);
  for(let k=0;k<8;k++){const a=k/8*2*PI;const bm=typeof MSL_MODELS!=='undefined'?MSL_MODELS.make('b61'):new T.Mesh(new T.CylinderGeometry(0.17,0.17,3.6),Mt.strut);bm.position.set(Math.cos(a)*0.42,Math.sin(a)*0.42,0);bm.scale.multiplyScalar(0.9);rl.add(bm);}
  rl.userData.spin=1;const bl=new T.PointLight(0xfff2dd,40,12,1.2);bl.position.set(bx,by+0.2,(bz0+bz1)/2);G.add(bl);A.bay.push(bl);
  for(const sd of[-1,1]){const pv=new T.Group();pv.position.set(bx+sd*0.95,by-0.02,(bz0+bz1)/2);G.add(pv);const dl=new T.Mesh(new T.BoxGeometry(0.95,0.05,6.0),Mt.door);dl.position.x=-sd*0.475;pv.add(dl);pv.userData.sd=sd;A.bayDoors.push(pv);}
  // nav light, low-vis roundel upper-left/lower-right, faint USAF
  const rd=new T.Mesh(new T.PlaneGeometry(2.6,1.3),new T.MeshStandardMaterial({map:ROUND,transparent:true,roughness:0.6,polygonOffset:true,polygonOffsetFactor:-3,depthWrite:false}));
  const rx0=s*18.5,rz0=zLE(18.5)+2.7;rd.position.set(rx0,H(rx0,rz0,s>0?0:1)+(s>0?-0.04:0.04),rz0);rd.rotation.x=s>0?PI/2:-PI/2;G.add(rd);
  const us=new T.Mesh(new T.PlaneGeometry(4.2,0.5),new T.MeshStandardMaterial({map:USAF,transparent:true,roughness:0.6,polygonOffset:true,polygonOffsetFactor:-3,depthWrite:false}));const ux=s*12.5,uz=zLE(12.5)+3.2;
  us.position.set(ux,H(ux,uz,1)+0.03,uz);us.rotation.set(-PI/2,0,s>0?-0.57:0.57);G.add(us);}
 // crew compartment: 4-pane windscreen (2 front, 2 side), frames, crew hatch
 const panes=[[[-1.05,-7.9],[-0.05,-8.05],[-0.05,-7.25],[-1.0,-7.15]],[[0.05,-8.05],[1.05,-7.9],[1.0,-7.15],[0.05,-7.25]],[[-1.75,-7.55],[-1.12,-7.85],[-1.07,-7.12],[-1.65,-6.85]],[[1.12,-7.85],[1.75,-7.55],[1.65,-6.85],[1.07,-7.12]]];
 for(const p of panes){const cx=p.reduce((a,q)=>a+q[0],0)/4,cz=p.reduce((a,q)=>a+q[1],0)/4;G.add(dquad(p.map(([a,b])=>[cx+(a-cx)*1.2,cz+(b-cz)*1.2]),1,0.025,Mt.frame));G.add(dquad(p,1,0.045,Mt.glass));}
 
 // nose gear: twin wheel, doors w/ tail number
 {const nz=-4.6;const ng=new T.Group();ng.position.set(0,H(0,nz,0),nz);G.add(ng);const L=ng.position.y+2-0.45;
  const st=new T.Mesh(new T.CylinderGeometry(0.13,0.13,L*0.65,14),Mt.strut);st.position.y=-L*0.32;ng.add(st);const ol=new T.Mesh(new T.CylinderGeometry(0.09,0.09,L*0.45,14),Mt.chrome);ol.position.y=-L*0.75;ng.add(ol);
  for(const wx of[-0.3,0.3]){const w=new T.Mesh(new T.CylinderGeometry(0.45,0.45,0.3,24).rotateZ(PI/2),Mt.tyre);w.position.set(wx,-L,0);ng.add(w);const h=new T.Mesh(new T.CylinderGeometry(0.24,0.24,0.32,16).rotateZ(PI/2),Mt.hub);h.position.copy(w.position);ng.add(h);}
  const lt=new T.Mesh(new T.CylinderGeometry(0.1,0.1,0.12,12).rotateX(PI/2),Mt.lamp);lt.position.set(0,-L*0.55,-0.25);ng.add(lt);A.gear.push(ng);
  G.add(drape(grid(-0.6,0.6,nz-1.4,nz+1.4,4),0,0.02,Mt.hole));
  for(const sd of[-1,1]){const dr=sawDoor(2.8,1.2);dr.position.set(sd*0.62,H(0,nz,0)-0.6,nz);G.add(dr);A.doors.push(dr);
   const num=new T.Mesh(new T.PlaneGeometry(2.2,0.5),new T.MeshStandardMaterial({map:NUM,transparent:true,roughness:0.6,polygonOffset:true,polygonOffsetFactor:-2}));num.position.set(sd*0.035,0,0);num.rotation.y=sd*PI/2;dr.add(num);}}
 G.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 G.userData.b2=A;A.gearT=1;A.bayT=0;return G;}
const NUM=decalTex((x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='rgba(150,154,160,0.85)';x.font='bold 64px Arial';x.textAlign='center';x.fillText('AF 82-1066',w/2,58);x.font='bold 30px Arial';x.fillText('509 BW',w/2,108);},512,120);
const ROUND=rndlTex(true);
const USAF=decalTex((x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='rgba(78,82,88,0.85)';x.font='bold 92px Arial';x.textAlign='center';x.fillText('U.S. AIR FORCE',w/2,96);},1024,120);
const _q=new T.Quaternion();
function animate(G,dt,st){const A=G.userData.b2;if(!A)return;A.gearT+=((st.gear?1:0)-A.gearT)*Math.min(1,dt*0.7);A.bayT+=((st.bay?1:0)-A.bayT)*Math.min(1,dt*1.5);
 for(const g of A.gear){g.scale.y=Math.max(0.02,A.gearT);g.visible=A.gearT>0.05;}for(const d of A.doors){d.visible=A.gearT>0.05;d.scale.y=Math.max(0.02,A.gearT);}
 for(const b of A.bay)b.visible=A.bayT>0.02;for(const p of A.bayDoors)p.rotation.z=p.userData.sd*A.bayT*1.45;
 for(const p of A.drag){const a=(st.drag||0)*0.6+Math.max(0,(st.yaw||0)*p.userData.s)*0.5;_q.setFromAxisAngle(p.userData.axis,-a*p.userData.dir*p.userData.s);p.quaternion.copy(_q);}}
return{build,animate,H,zLE,zTE,HS};})();
window.__b2={B2,cam:null,bay:false,drag:0};
// ---------------- game hooks ----------------
DEFS.b2={name:'B-2A Spirit',desc:'Stealth strategic bomber. 4x F118 turbofans, 52.4 m span. Rotary launchers carry 16 B61-12.',cls:'air',thrust:16,vstall:72,vrot:82,dragK:5e-5,ceil:15200,col:0x3d4045,weapons:['NUKE'],maxMach:0.95,role:'Bomber',
 stats:{length_m:21.0,span_m:52.4,height_m:5.2,engines:'4x GE F118-GE-100',cruiseMach:0.85,ceiling_m:15200,mtow_t:170.6},bars:{speed:0.55,agility:0.3,armor:0.5,firepower:1},preview:()=>B2.build()};
if(typeof ENG_CHAR!=='undefined')ENG_CHAR.b2={r:0.55,w:0.6,ab:0};
{const _j=jet;jet=function(c,f,kind){if(kind==='b2')return B2.build();return _j(c,f,kind);};}
{const _ae=attachExhaust;attachExhaust=function(v){if(v&&v.kind==='b2'){if(exhMesh&&exhMesh.parent)exhMesh.parent.remove(exhMesh);exhMesh=null;exhFor=v;return;}return _ae(v);};}
{const _fw=fireWeapon;fireWeapon=function(v){if(v&&v.kind==='b2')v.b2Bay=3.5;return _fw(v);};}
{const _ua=updAir;updAir=function(v,dt){_ua(v,dt);if(v.kind!=='b2'||!v.mesh)return;const p=v.mesh.position;const agl=p.y-groundAt(p.x,p.z).h;
  if(v.b2Gear==null)v.b2Gear=true;if(!v.onGround&&agl>50&&v.vel.y>-2)v.b2Gear=false;if(agl<250&&v.vel.y<-1&&v.vel.length()<110)v.b2Gear=true;if(v.onGround)v.b2Gear=true;v.b2Bay=Math.max(0,(v.b2Bay||0)-dt);
  B2.animate(v.mesh,dt,{gear:v.b2Gear,bay:__b2.bay||v.b2Bay>0,drag:__b2.drag||(inp.throttle<0.1&&!v.onGround?1:0),yaw:inp.yaw||0});}}
{const _uc=updCamera;const _cp=new THREE.Vector3();updCamera=function(dt){_uc(dt);const v=player;if(!v||v.kind!=='b2'||!v.mesh||camFollow||blastCam)return;
  if(camMode===0){_cp.copy(camera.position).sub(v.mesh.position).multiplyScalar(2.4);camera.position.copy(v.mesh.position).add(_cp);const gh=groundAt(camera.position.x,camera.position.z).h;if(camera.position.y<gh+2)camera.position.y=gh+2;camera.lookAt(v.mesh.position);}
  if(__b2.cam){const c=__b2.cam;_cp.set(...c.o).applyMatrix4(v.mesh.matrixWorld);camera.position.copy(_cp);_cp.set(...(c.t||[0,0,0])).applyMatrix4(v.mesh.matrixWorld);camera.up.set(0,1,0);camera.lookAt(_cp);if(c.fov&&camera.fov!==c.fov){camera.fov=c.fov;camera.updateProjectionMatrix();}}};}
//GB2-END
