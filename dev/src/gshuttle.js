// ===== NASA Space Shuttle (STS): to-scale OV-104 orbiter, External Tank, SRBs, LC-39A shuttle-era pad; full flight: SSME start, SRB ignition, roll program, SRB sep T+2:04 w/ parachutes, MECO, ET sep, orbit, entry plasma, glide & landing =====
DEFS.shuttle={name:'Space Shuttle (STS)',desc:'NASA Space Shuttle at LC-39A, to scale. Roll program, SRB sep at T+2:04, MECO, ET sep, orbit, plasma re-entry and runway landing. Fly it or use autopilot.',cls:'silo',weapons:[]};
const SH={built:false};window.__shuttle=()=>SH;SH.S=()=>SHS;
const SH_AW=2048,SH_BH=512,SH_Z0=-19,SH_ZL=38,SH_X0=-12.2,SH_XL=24.4,SH_YT=17,SH_YL=18;
function shCv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];}
function shTex(c,srgb=true,rep=false){const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());if(rep)t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
let _shSeed=12345;const srnd=()=>{_shSeed=(_shSeed*16807)%2147483647;return _shSeed/2147483647;};
// --- orbiter plan geometry (x span, z fore/aft; nose at z=-18.6, tail tip at +18.6) ---
const SH_WING=[[2.5,-8.6],[3.3,-5.0],[4.7,1.0],[11.9,8.25],[11.95,9.6],[11.7,10.75],[3.0,13.7],[2.5,13.7]];
const SH_TAIL=[[6.6,5.3],[15.95,14.95],[18.35,14.95],[18.15,5.3]]; // (z,y) vertical stabilizer
function shProf(z){const d=z+18.6;let w,yb,yt;
 w=d<=0?0.001:d<7?2.62*Math.pow(1-Math.pow(1-d/7,2.2),0.5):d<30?2.62:2.62+(d-30)*0.06;
 yb=d<7?1.15*Math.pow(Math.max(0,1-d/7),1.8):0;
 yt=d<3.5?1.25+2.35*Math.pow(Math.max(d,0)/3.5,0.55):d<6.6?3.6+2.5*sstep(3.5,6.6,d):6.1-0.65*sstep(8.3,11,d);
 const cy=yb+(yt-yb)*0.45;return {w,cy,ht:yt-cy,hb:cy-yb,nt:2.3,nb:5};}
function shPt(z,th,P=shProf(z),out=V3()){const c=Math.cos(th),s=Math.sin(th);const n=s>=0?P.nt:P.nb;const e=2/n;return out.set(P.w*Math.sign(c)*Math.pow(Math.abs(c),e),P.cy+(s>=0?P.ht:P.hb)*Math.sign(s)*Math.pow(Math.abs(s),e),z);}
// loft a surface: rows along z, columns along theta. outward normals.
function shLoft(zs,t0,t1,nt,pf,ptf=shPt){const pos=[],idx=[];const nz=zs.length;
 for(let i=0;i<nz;i++){const P=pf(zs[i]);for(let j=0;j<=nt;j++){const p=ptf(zs[i],t0+(t1-t0)*j/nt,P);pos.push(p.x,p.y,p.z);}}
 for(let i=0;i<nz-1;i++)for(let j=0;j<nt;j++){const a=i*(nt+1)+j,b=a+1,c=a+nt+1,d=c+1;idx.push(a,b,c,b,d,c);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;}
const shRange=(a,b,n,pw=1)=>Array.from({length:n+1},(_,i)=>a+(b-a)*Math.pow(i/n,pw));
// project atlas UVs per triangle from the face normal: top plan / bottom plan / right side / left side bands
function shAtlasUV(g){if(g.index)g=g.toNonIndexed();const p=g.attributes.position,n=p.count,uv=new Float32Array(n*2);const a=V3(),b=V3(),c=V3(),e1=V3(),e2=V3();
 for(let i=0;i<n;i+=3){a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);e1.subVectors(b,a);e2.subVectors(c,a);const fn=e1.cross(e2).normalize();const cx=(a.x+b.x+c.x)/3;
  let band;if(fn.y>0.42)band=0;else if(fn.y<-0.42)band=1;else band=(fn.x+cx*0.02)>=0?2:3;
  for(let k=0;k<3;k++){const q=k===0?a:k===1?b:c;let px,py;
   if(band<2){px=(q.z-SH_Z0)/SH_ZL*SH_AW;py=band*SH_BH+clamp((q.x-SH_X0)/SH_XL,0.004,0.996)*SH_BH;}
   else{const f=(q.z-SH_Z0)/SH_ZL*SH_AW;px=band===2?SH_AW-f:f;py=band*SH_BH+clamp((SH_YT-q.y)/SH_YL,0.004,0.996)*SH_BH;}
   uv[(i+k)*2]=px/SH_AW;uv[(i+k)*2+1]=1-py/(4*SH_BH);}}
 g.setAttribute('uv',new THREE.BufferAttribute(uv,2));return g;}
// ---------- orbiter atlas texture (color + bump) ----------
function shAtlas(){const [c,x]=shCv(SH_AW,SH_BH*4),[bc,bx]=shCv(SH_AW,SH_BH*4);_shSeed=777;
 const SX=SH_AW/SH_ZL,PY=SH_BH/SH_XL,SY=SH_BH/SH_YL;
 const planT=(k,ctx)=>ctx.setTransform(SX,0,0,PY,-SH_Z0*SX,k*SH_BH-SH_X0*PY); // draw in (z,x)
 const sideT=(k,ctx)=>ctx.setTransform(SX,0,0,-SY,0,k*SH_BH+SH_YT*SY);       // draw in (X along view, y)
 const vx=(z,k)=>k===2?SH_ZL-(z-SH_Z0):(z-SH_Z0); // view X metres for side bands
 // tile fill helper in pixel space within current clip
 const tiles=(ctx,b,x0,y0,w,h,tw,th,base,var_,gap)=>{for(let yy=y0;yy<y0+h;yy+=th){const off=(Math.round((yy-y0)/th)%2)*tw*0.5;for(let xx=x0-off;xx<x0+w;xx+=tw){const r=base+(srnd()-0.5)*var_;ctx.fillStyle=`rgb(${r|0},${r|0},${(r+1.5)|0})`;ctx.fillRect(xx,yy,tw-gap,th-gap);
   if(b){b.fillStyle='#9a9a9a';b.fillRect(xx,yy,tw-gap,th-gap);}}}};
 const blankets=(ctx,b,x0,y0,w,h,qw,qh)=>{ctx.fillStyle='#e7e5df';ctx.fillRect(x0,y0,w,h);for(let i=0;i<9000;i++){const r=222+srnd()*22;ctx.fillStyle=`rgba(${r|0},${r-2|0},${r-8|0},0.5)`;ctx.fillRect(x0+srnd()*w,y0+srnd()*h,2+srnd()*10,1+srnd()*4);}
  ctx.strokeStyle='rgba(120,118,110,0.35)';ctx.lineWidth=1;b.strokeStyle='#5a5a5a';b.lineWidth=1.2;for(let xx=x0;xx<x0+w;xx+=qw){ctx.beginPath();ctx.moveTo(xx,y0);ctx.lineTo(xx,y0+h);ctx.stroke();b.beginPath();b.moveTo(xx,y0);b.lineTo(xx,y0+h);b.stroke();}
  for(let yy=y0;yy<y0+h;yy+=qh){ctx.beginPath();ctx.moveTo(x0,yy);ctx.lineTo(x0+w,yy);ctx.stroke();b.beginPath();b.moveTo(x0,yy);b.lineTo(x0+w,yy);b.stroke();}};
 bx.fillStyle='#808080';bx.fillRect(0,0,SH_AW,SH_BH*4);bx.fillStyle='#a0a0a0';bx.fillRect(0,0,SH_AW,SH_BH*4);
 // band backgrounds: white blankets on top/sides, black HRSI below
 for(const k of[0,2,3])blankets(x,bx,0,k*SH_BH,SH_AW,SH_BH,Math.round(0.76*SX),k===0?Math.round(0.76*PY):Math.round(0.76*SY));
 const blackClip=(k,path,isPlan)=>{x.save();bx.save();(isPlan?planT:sideT)(k,x);(isPlan?planT:sideT)(k,bx);x.beginPath();bx.beginPath();path(x);path(bx);x.setTransform(1,0,0,1,0,0);bx.setTransform(1,0,0,1,0,0);x.clip();bx.clip();
  bx.fillStyle='#303030';bx.fillRect(0,k*SH_BH,SH_AW,SH_BH);tiles(x,bx,0,k*SH_BH,SH_AW,SH_BH,isPlan?8:8,isPlan?3:4,26,13,1);x.restore();bx.restore();};
 // bottom: full black tiles
 blackClip(1,ctx=>ctx.rect(SH_Z0,SH_X0,SH_ZL,SH_XL),true);
 // top: black mask around nose & windscreen, black band behind wing leading edges, black OMS pod fronts
 blackClip(0,ctx=>{ctx.moveTo(SH_Z0,SH_X0);ctx.lineTo(-12.2,SH_X0);ctx.lineTo(-12.2,-1.7);ctx.quadraticCurveTo(-11.6,0,-12.2,1.7);ctx.lineTo(-12.2,-SH_X0);ctx.lineTo(SH_Z0,-SH_X0);ctx.closePath();
  for(const s of[-1,1]){const W=SH_WING;ctx.moveTo(W[0][1],s*W[0][0]);for(let i=1;i<=3;i++)ctx.lineTo(W[i][1],s*W[i][0]);ctx.lineTo(W[3][1]+0.9,s*(W[3][0]-0.2));for(let i=2;i>=0;i--)ctx.lineTo(W[i][1]+(i===0?0.6:1.0),s*(W[i][0]+(i===0?0:-0.25)));ctx.closePath();}
  for(const s of[-1,1]){ctx.moveTo(7.0,s*1.0);ctx.lineTo(9.4,s*1.0);ctx.lineTo(9.4,s*3.5);ctx.lineTo(7.0,s*3.5);ctx.closePath();}},true);
 // side bands: lower black, forward window mask, OMS/RCS black areas
 for(const k of[2,3])blackClip(k,ctx=>{ctx.moveTo(vx(SH_Z0,k),-1);const pts=[[-19,3.0],[-16,2.5],[-13.5,1.9],[-9.5,1.05],[16,1.05],[19,1.05]];for(const [z,y] of pts)ctx.lineTo(vx(z,k),y);ctx.lineTo(vx(19,k),-1);ctx.closePath();
  ctx.moveTo(vx(-19,k),3.6);ctx.lineTo(vx(-15.8,k),4.15);ctx.lineTo(vx(-13.9,k),4.35);ctx.lineTo(vx(-11.7,k),4.6);ctx.lineTo(vx(-11.7,k),7);ctx.lineTo(vx(-19,k),7);ctx.closePath();
  ctx.moveTo(vx(7.0,k),4.4);ctx.lineTo(vx(9.6,k),4.4);ctx.lineTo(vx(9.6,k),6.4);ctx.lineTo(vx(7.0,k),6.4);ctx.closePath();
  ctx.moveTo(vx(12.6,k),4.55);ctx.lineTo(vx(14.9,k),4.55);ctx.lineTo(vx(14.9,k),5.75);ctx.lineTo(vx(12.6,k),5.75);ctx.closePath();},false);
 // RCC (reinforced carbon-carbon) light grey: nose cap, wing leading edges, chin panel
 const rcc='#7d7f80';
 for(const k of[0,1]){planT(k,x);x.fillStyle=rcc;x.beginPath();x.ellipse(-18.6,0,0.85,1.6,0,0,7);x.fill();x.strokeStyle=rcc;x.lineCap='round';
  for(const s of[-1,1]){x.lineWidth=0.38;x.beginPath();x.moveTo(SH_WING[1][1],s*(SH_WING[1][0]+0.02));for(let i=2;i<=3;i++)x.lineTo(SH_WING[i][1],s*(SH_WING[i][0]));x.lineTo(SH_WING[4][1]-0.3,s*SH_WING[4][0]);x.stroke();}
  // segment lines on RCC panels
  x.lineWidth=0.025;x.strokeStyle='rgba(30,30,30,.8)';for(const s of[-1,1])for(let t=0;t<1;t+=1/22){const A=SH_WING[2],B=SH_WING[3];const zz=lerp(A[1],B[1],t),xx=lerp(A[0],B[0],t);x.beginPath();x.moveTo(zz-0.2,s*(xx+0.2));x.lineTo(zz+0.2,s*(xx-0.2));x.stroke();}
  x.setTransform(1,0,0,1,0,0);}
 for(const k of[2,3]){sideT(k,x);x.fillStyle=rcc;x.beginPath();x.ellipse(vx(-18.6,k),1.75,0.9,1.0,0,0,7);x.fill();x.setTransform(1,0,0,1,0,0);}
 // windows (dark frames) top band
 planT(0,x);x.fillStyle='#0b0c0e';for(const [z0,z1,x0,x1] of [[-11.6,-10.9,-0.95,-0.15],[-11.6,-10.9,0.15,0.95]]){x.fillRect(z0,x0,z1-z0,x1-x0);}x.setTransform(1,0,0,1,0,0);
 // payload bay door seams / latches / hinge lines, elevon hinges, OMS pod seams
 planT(0,x);x.strokeStyle='rgba(70,70,66,.75)';x.lineWidth=0.05;x.beginPath();x.moveTo(-10.3,0);x.lineTo(7.6,0);x.stroke();
 for(let z=-10.3;z<=7.7;z+=3.58){x.beginPath();x.moveTo(z,-2.5);x.lineTo(z,2.5);x.stroke();}
 for(const s of[-1,1]){x.beginPath();x.moveTo(-10.3,s*2.45);x.lineTo(7.6,s*2.45);x.stroke();x.beginPath();x.moveTo(11.55,s*4.6);x.lineTo(10.0,s*11.6);x.stroke();x.beginPath();x.moveTo(12.4,s*3.1);x.lineTo(11.0,s*7.6);x.stroke();}
 x.setTransform(1,0,0,1,0,0);
 // aft RCS thruster ports & forward RCS (side bands)
 for(const k of[2,3]){sideT(k,x);x.fillStyle='#050505';for(let i=0;i<4;i++)for(let j=0;j<2;j++){x.beginPath();x.ellipse(vx(13.0+i*0.5,k),4.85+j*0.5,0.13,0.17,0,0,7);x.fill();}
  for(let i=0;i<3;i++){x.beginPath();x.ellipse(vx(-17.3+i*0.45,k),2.7,0.12,0.16,0,0,7);x.fill();}
  x.strokeStyle='rgba(20,20,20,.9)';x.lineWidth=0.04;x.strokeRect(vx(-15.2,k)-(k===2?1.6:0),3.0,1.6,0.9); // star tracker / vent doors
  x.setTransform(1,0,0,1,0,0);}
 // left side crew hatch (round) + side windows
 sideT(3,x);x.strokeStyle='#cfcfc7';x.lineWidth=0.06;x.beginPath();x.arc(vx(-10.8,3),3.2,0.52,0,7);x.stroke();x.fillStyle='#0a0b0d';x.beginPath();x.arc(vx(-10.8,3),3.2,0.13,0,7);x.fill();x.setTransform(1,0,0,1,0,0);
 // flag + lettering (pixel-space text with metric scaling)
 const flag=(ctx,w,h,cantonRight)=>{const sw=h/13;for(let i=0;i<13;i++){ctx.fillStyle=i%2?'#f4f4f2':'#b22234';ctx.fillRect(0,i*sw,w,sw+0.01);}ctx.fillStyle='#3c3b6e';const cw=w*0.4,ch=sw*7;ctx.fillRect(cantonRight?w-cw:0,0,cw,ch);
  ctx.fillStyle='#fff';for(let r=0;r<9;r++)for(let q=0;q<(r%2?5:6);q++){const sx=(cantonRight?w-cw:0)+cw*((q+(r%2?1:0.5))/6.2),sy=ch*((r+0.6)/9.6);ctx.beginPath();ctx.arc(sx,sy,ch*0.028,0,7);ctx.fill();}};
 for(const k of[2,3]){const SXp=SX,SYp=SY;// metric scale at band
  const zc=-6.9,fy=3.55; // "United States" centre
  x.save();const X=vx(zc,k)*SXp,Y=k*SH_BH+(SH_YT-fy)*SYp;x.setTransform(SXp/60,0,0,SYp/60,X,Y);x.fillStyle='#111';x.font='bold 64px Helvetica, Arial, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('United States',0,0);x.restore();
  // flag forward of lettering, canton toward the nose
  x.save();const fz=k===2?-11.0:-12.6;const FX=vx(fz,k)*SXp,FY=k*SH_BH+(SH_YT-4.05)*SYp;x.setTransform(SXp,0,0,SYp,FX,FY);flag(x,1.6,1.0,k===2);x.restore();}
 // wing lettering (top band, screen frame: right=+x, up=-z)
 const wingTxt=(zc,xc,draw)=>{x.save();x.setTransform(0,PY,SX,0,(zc-SH_Z0)*SX,(xc-SH_X0)*PY);x.transform(1,0,0,1,0,0);draw();x.restore();};
 // NASA worm on right wing (red)
 wingTxt(6.2,7.4,()=>{x.scale(1/85,1/85);x.translate(-182,-50);x.strokeStyle='#c8102e';x.lineWidth=20;x.lineCap='round';x.lineJoin='round';x.beginPath();
  x.moveTo(10,95);x.lineTo(10,10);x.lineTo(65,90);x.lineTo(65,5);x.moveTo(95,95);x.lineTo(130,5);x.lineTo(165,95);
  x.moveTo(262,14);x.quadraticCurveTo(195,-2,197,28);x.quadraticCurveTo(200,50,230,52);x.quadraticCurveTo(262,56,260,78);x.quadraticCurveTo(255,100,190,90);
  x.moveTo(285,95);x.lineTo(320,5);x.lineTo(355,95);x.stroke();});
 wingTxt(6.0,-7.3,()=>{x.scale(1/70,1/70);x.fillStyle='#111';x.font='bold 100px Helvetica, Arial, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('USA',0,70);x.save();x.translate(-91,-150);x.scale(70,70);flag(x,2.6,1.45,false);x.restore();});
 // bottom: landing gear doors, ET umbilical doors, elevon gaps
 planT(1,x);x.strokeStyle='rgba(120,120,120,.6)';x.lineWidth=0.05;x.strokeRect(-15.0,-0.55,1.9,1.1);for(const s of[-1,1]){x.strokeRect(2.6,s>0?3.6:-5.2,4.2,1.6);x.fillStyle='#c9c6bb';x.fillRect(10.6,s>0?0.8:-2.2,1.5,1.4);}
 for(const s of[-1,1]){x.beginPath();x.moveTo(12.4,s*3.1);x.lineTo(10.9,s*11.6);x.stroke();x.beginPath();x.moveTo(12.0,s*7.3);x.lineTo(12.6,s*7.0);x.stroke();}x.setTransform(1,0,0,1,0,0);
 // tail: rudder/speedbrake split, panel lines (side bands)
 for(const k of[2,3]){sideT(k,x);x.strokeStyle='rgba(80,80,76,.7)';x.lineWidth=0.05;x.beginPath();x.moveTo(vx(15.6,k),5.4);x.lineTo(vx(16.5,k),14.9);x.stroke();x.beginPath();x.moveTo(vx(16.15,k),10.2);x.lineTo(vx(18.25,k),10.2);x.stroke();
  for(let y=6.5;y<14.9;y+=1.6){x.beginPath();x.moveTo(vx(6.6+(y-5.3)*0.973,k),y);x.lineTo(vx(15.6,k),y);x.stroke();}x.setTransform(1,0,0,1,0,0);}
 // grime/weathering: subtle streaks on white, scorching near the black boundary
 for(let i=0;i<1400;i++){const k=srnd()<0.5?0:(srnd()<0.5?2:3);x.fillStyle=`rgba(90,85,75,${0.02+srnd()*0.04})`;x.fillRect(srnd()*SH_AW,k*SH_BH+srnd()*SH_BH,10+srnd()*60,1+srnd()*2);}
 window.__shAtlasC=c;const t=shTex(c),bt=shTex(bc,false);return {map:t,bump:bt,canvas:c};}
// ---------- materials ----------
function shFoam(){const [c,x]=shCv(1024,1024);_shSeed=99;x.fillStyle='#cf7a3c';x.fillRect(0,0,1024,1024);
 for(let i=0;i<5000;i++){const px=srnd()*1024,py=srnd()*1024,r=4+srnd()*38;const g=x.createRadialGradient(px,py,0,px,py,r);const d=srnd()<0.5;g.addColorStop(0,d?'rgba(150,70,30,.14)':'rgba(222,140,70,.2)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(px-r,py-r,2*r,2*r);}
 for(let i=0;i<260;i++){x.strokeStyle=`rgba(90,40,12,${0.05+srnd()*0.08})`;x.lineWidth=1+srnd()*2;const px=srnd()*1024;x.beginPath();x.moveTo(px,0);x.bezierCurveTo(px+rnd(20),340,px+rnd(20),680,px+rnd(14),1024);x.stroke();} // spray-on foam runs
 for(let i=0;i<30000;i++){const v=srnd();x.fillStyle=v<0.5?'rgba(120,55,20,.15)':'rgba(240,170,100,.18)';x.fillRect(srnd()*1024,srnd()*1024,1.5,1.5);} // popcorn texture
 const t=shTex(c,true,true);const [bc,bx]=shCv(512,512);for(let i=0;i<40000;i++){const v=100+srnd()*120|0;bx.fillStyle=`rgb(${v},${v},${v})`;bx.fillRect(srnd()*512,srnd()*512,2+srnd()*3,2+srnd()*3);}return {map:t,bump:shTex(bc,false,true)};}
function shStripes(base,line,n,w=256,h=256,vert=true){const [c,x]=shCv(w,h);x.fillStyle=base;x.fillRect(0,0,w,h);x.fillStyle=line;for(let i=0;i<n;i++){if(vert)x.fillRect(i*w/n,0,Math.max(1,w/n*0.35),h);else x.fillRect(0,i*h/n,w,Math.max(1,h/n*0.35));}return shTex(c,true,true);}
function shSRBTex(){const [c,x]=shCv(512,2048);_shSeed=5;x.fillStyle='#ecebe6';x.fillRect(0,0,512,2048);
 for(let i=0;i<9000;i++){const v=222+srnd()*28|0;x.fillStyle=`rgba(${v},${v},${v-4},.5)`;x.fillRect(srnd()*512,srnd()*2048,3+srnd()*14,1+srnd()*3);}
 // field joints (4) + factory joints, stiffener rings; v=0 bottom of cylinder
 const H=2048,L=37.5;const yv=m=>H-(m/L)*H;x.fillStyle='#3a3a3a';for(const m of[7.4,15.3,23.2,31.1]){x.fillRect(0,yv(m)-6,512,12);x.fillStyle='#8b8b86';x.fillRect(0,yv(m)-12,512,3);x.fillRect(0,yv(m)+9,512,3);x.fillStyle='#3a3a3a';}
 x.fillStyle='rgba(120,120,115,.55)';for(const m of[3.6,11.4,19.3,27.2,35])x.fillRect(0,yv(m)-1,512,2);
 x.fillStyle='#2a2a2a';x.fillRect(250,0,22,H); // systems tunnel shadow strip
 x.fillStyle='#d6d4ce';x.fillRect(254,0,14,H);
 x.save();x.translate(128,yv(26));x.rotate(-Math.PI/2);x.fillStyle='#111';x.font='bold 120px Helvetica, Arial';x.textAlign='center';x.fillText('USA',0,0);x.restore(); // vertical lettering
 x.save();x.translate(400,yv(26));x.rotate(-Math.PI/2);x.fillStyle='#111';x.font='bold 64px Helvetica, Arial';x.textAlign='center';x.fillText('UNITED STATES',0,0);x.restore();
 return shTex(c);}
function shBellTex(){const [c,x]=shCv(512,256);const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#5a4a3c');g.addColorStop(0.5,'#8a7a68');g.addColorStop(1,'#b8b0a2');x.fillStyle=g;x.fillRect(0,0,512,256);
 for(let i=0;i<512;i+=2){x.fillStyle=i%4?'rgba(0,0,0,.22)':'rgba(255,255,255,.12)';x.fillRect(i,0,1,256);} // regenerative coolant tubes (1080 tubes)
 for(const y of[60,130,200]){x.fillStyle='rgba(30,25,20,.6)';x.fillRect(0,y,512,5);}return shTex(c,true,true);}
let SHM=null;function shMats(){if(SHM)return SHM;const A=shAtlas(),F=shFoam();
 SHM={skin:new THREE.MeshStandardMaterial({map:A.map,bumpMap:A.bump,bumpScale:1.2,roughness:0.78,metalness:0.02,side:THREE.DoubleSide}),atlas:A,
  foam:new THREE.MeshStandardMaterial({map:F.map,bumpMap:F.bump,bumpScale:2,roughness:0.95,metalness:0}),
  inter:new THREE.MeshStandardMaterial({map:shStripes('#b0602a','#6e3615',72,1024,64),bumpMap:shStripes('#999','#222',72,1024,64),bumpScale:4,roughness:0.9}),
  srb:new THREE.MeshStandardMaterial({map:shSRBTex(),roughness:0.55,metalness:0.05}),srbW:new THREE.MeshStandardMaterial({color:0xe9e8e3,roughness:0.55}),
  bell:new THREE.MeshStandardMaterial({map:shBellTex(),metalness:0.85,roughness:0.38,side:THREE.FrontSide,envMapIntensity:1.3}),bellIn:new THREE.MeshStandardMaterial({color:0x2a211b,metalness:0.6,roughness:0.55,side:THREE.BackSide}),
  srbNoz:new THREE.MeshStandardMaterial({color:0x3b3835,roughness:0.85,metalness:0.2,side:THREE.DoubleSide}),
  glass:new THREE.MeshStandardMaterial({color:0x07090c,metalness:0.95,roughness:0.04,envMapIntensity:2}),
  blk:new THREE.MeshStandardMaterial({color:0x151617,roughness:0.85}),dark:new THREE.MeshStandardMaterial({color:0x2c2d2f,roughness:0.7,metalness:0.4}),
  steel:new THREE.MeshStandardMaterial({color:0x9aa0a5,metalness:0.85,roughness:0.35}),white:new THREE.MeshStandardMaterial({color:0xe8e7e2,roughness:0.6}),
  rad:new THREE.MeshStandardMaterial({map:shStripes('#d9dce0','#aeb4ba',40,256,256,false),metalness:0.6,roughness:0.3,side:THREE.BackSide}),
  liner:new THREE.MeshStandardMaterial({color:0xd8d6cf,roughness:0.85,side:THREE.BackSide}),
  conc:new THREE.MeshStandardMaterial({color:0xa9a59c,roughness:0.95}),mlp:new THREE.MeshStandardMaterial({color:0x8f9193,roughness:0.8,metalness:0.3}),
  glowB:new THREE.MeshBasicMaterial({color:0xbfd8ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})};return SHM;}
const shM=(o,geo,m,x=0,y=0,z=0)=>{const e=new THREE.Mesh(geo,m);e.position.set(x,y,z);o.add(e);e.castShadow=e.receiveShadow=true;return e;};
// ---------- RS-25 SSME ----------
function shRS25(m){const g=new THREE.Group();const L=3.05,R=1.19;const pts=[];for(let i=0;i<=24;i++){const t=i/24;pts.push(new THREE.Vector2(0.27+(R-0.27)*Math.pow(t,0.62),-L*t));}
 const geo=new THREE.LatheGeometry(pts,48);shM(g,geo,m.bell);shM(g,geo,m.bellIn);
 for(let k=1;k<=5;k++){const t=k/6;const r=0.27+(R-0.27)*Math.pow(t,0.62);shM(g,new THREE.TorusGeometry(r+0.02,0.035,6,48).rotateX(Math.PI/2),m.dark,0,-L*t,0);} // hatband stiffeners
 shM(g,new THREE.TorusGeometry(R+0.01,0.05,6,48).rotateX(Math.PI/2),m.steel,0,-L,0);
 shM(g,new THREE.CylinderGeometry(0.3,0.27,0.5,24),m.steel,0,0.2,0);shM(g,new THREE.CylinderGeometry(0.42,0.35,0.6,24),m.dark,0,0.7,0); // throat/combustion chamber
 for(let i=0;i<3;i++){const a=i/3*6.28;shM(g,new THREE.CylinderGeometry(0.07,0.07,1.6,8),m.steel,Math.cos(a)*0.6,-0.6,Math.sin(a)*0.6).rotation.z=0.3*Math.cos(a);} // feed ducts
 const gl=shM(g,new THREE.CircleGeometry(R*0.97,32).rotateX(Math.PI/2),m.glowB.clone(),0,-L+0.05,0);
 // flame: translucent blue-violet core + Mach diamonds
 const fl=new THREE.Group();fl.position.y=-L;g.add(fl);const fm=new THREE.MeshBasicMaterial({color:0x9db8ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});
 const cone=new THREE.Mesh(new THREE.CylinderGeometry(0.35,R*0.95,14,24,1,true).translate(0,-7,0),fm);fl.add(cone);
 const dm=[];for(let i=0;i<6;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:nukeTex,color:0xd6e4ff,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false,opacity:0}));s.position.y=-1.4-i*2.1;s.scale.set(1.5-i*0.12,1.9,1);fl.add(s);dm.push(s);}
 g.userData={glow:gl,cone,dm,fl};return g;}
// ---------- Orbiter OV-104 ----------
function shOrbiter(m){const o=new THREE.Group();const zs=shRange(-18.6,14.8,90,1).map((z,i)=>i<30?-18.6+(Math.pow(i/30,1.6))*11.2:z);zs.sort((a,b)=>a-b);
 const sill=0.34;const L=(a,b,n)=>shAtlasUV(shLoft(zs.filter(z=>z>=a-1e-6&&z<=b+1e-6),a===b?0:0,0,1,shProf)); // placeholder
 const lower=shAtlasUV(shLoft(zs,Math.PI-sill,2*Math.PI+sill,64,shProf));shM(o,lower,m.skin);
 const fwdZ=zs.filter(z=>z<=-10.3).concat([-10.3]),aftZ=[7.6].concat(zs.filter(z=>z>=7.6));
 shM(o,shAtlasUV(shLoft(fwdZ,sill-0.001,Math.PI-sill+0.001,48,shProf)),m.skin);shM(o,shAtlasUV(shLoft(aftZ,sill-0.001,Math.PI-sill+0.001,48,shProf)),m.skin);
 // payload bay: liner, floor, radiator-lined doors, Canadarm, payload (Spacelab-style module)
 const bz=shRange(-10.3,7.6,12);const bay=new THREE.Group();o.add(bay);
 shM(bay,shLoft(bz,Math.PI-sill,2*Math.PI+sill,40,z=>{const P=shProf(z);return {...P,w:P.w-0.12,ht:P.ht-0.12,hb:P.hb-0.12};}),m.liner);
 const doors=[];for(const s of[1,-1]){const piv=new THREE.Group();const hp=shPt(0,s>0?sill:Math.PI-sill);piv.position.set(hp.x,hp.y,0);o.add(piv);
  const t0=s>0?sill:Math.PI/2,t1=s>0?Math.PI/2:Math.PI-sill;const dg=shAtlasUV(shLoft(bz,t0,t1,24,shProf));dg.translate(-hp.x,-hp.y,0);const d=shM(piv,dg,m.skin);d.material=m.skin;
  const di=shLoft(bz,t0,t1,24,z=>{const P=shProf(z);return{...P,w:P.w-0.04,ht:P.ht-0.04};});di.translate(-hp.x,-hp.y,0);
  if(!di.attributes.uv){const P=di.attributes.position,u=new Float32Array(P.count*2);for(let i=0;i<P.count;i++){u[i*2]=(P.getZ(i)+10.3)/17.9;u[i*2+1]=Math.atan2(P.getY(i),P.getX(i)*s)/Math.PI+0.5;}di.setAttribute('uv',new THREE.BufferAttribute(u,2));} // ship fix: radiator mesh had no UVs -> NaN shading -> bloom blacked the whole orbit view
  const ri=new THREE.Mesh(di,m.rad);piv.add(ri);piv.userData.s=s;doors.push(piv);}
 const arm=new THREE.Group();{const a=m.white,j=m.dark;const sp=shPt(0,Math.PI-sill);arm.position.set(sp.x+0.35,sp.y+0.15,-9.6);
  shM(arm,new THREE.CylinderGeometry(0.19,0.19,6.4,16).rotateX(Math.PI/2),a,0,0,3.4);shM(arm,new THREE.CylinderGeometry(0.19,0.19,7.0,16).rotateX(Math.PI/2),a,0,0,10.3);
  for(const z of[0,0.2,6.7,13.9])shM(arm,new THREE.SphereGeometry(0.28,12,8),j,0,0,z);shM(arm,new THREE.CylinderGeometry(0.2,0.2,0.9,12).rotateX(Math.PI/2),j,0,0,14.5);} o.add(arm);
 {const pl=new THREE.Group();const mod=shM(pl,new THREE.CylinderGeometry(2.03,2.03,7,40).rotateX(Math.PI/2),m.white,0,2.6,-2);for(const z of[-5.5,1.5])shM(pl,new THREE.SphereGeometry(2.03,32,12,0,6.3,0,Math.PI/2).rotateX(z<0?-Math.PI/2:Math.PI/2),m.white,0,2.6,z);
  shM(pl,new THREE.CylinderGeometry(0.5,0.5,4,16).rotateX(Math.PI/2),m.white,0,2.6,-7.5);for(let k=0;k<5;k++)shM(pl,new THREE.TorusGeometry(2.05,0.05,6,40),m.steel,0,2.6,-5+k*1.6);
  for(let i=0;i<4;i++)shM(pl,new THREE.BoxGeometry(0.15,0.15,3.6),m.steel,(i<2?-1:1)*2.0,(i%2?1:3.6),4.4);o.add(pl);}
 // wings (double delta, tapered, 3.5° dihedral) + elevons
 {const sh=new THREE.Shape();const W=SH_WING;sh.moveTo(-W[0][0],-W[0][1]);for(let i=1;i<W.length;i++)sh.lineTo(-W[i][0],-W[i][1]);for(let i=W.length-1;i>=0;i--)sh.lineTo(W[i][0],-W[i][1]);sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth:0.42,bevelEnabled:true,bevelThickness:0.24,bevelSize:0.26,bevelSegments:4,curveSegments:2,steps:1});g.rotateX(-Math.PI/2);
  const p=g.attributes.position;for(let i=0;i<p.count;i++){const ax=Math.abs(p.getX(i));const tp=1-0.72*clamp((ax-2.5)/9.4,0,1);const z=p.getZ(i);const ch=clamp((z+8.6)/22,0,1);p.setY(i,(p.getY(i)-0.21)*tp+0.5+(ax-2.5)*0.061);}
  g.computeVertexNormals();shM(o,shAtlasUV(g),m.skin);}
 // vertical stabilizer + split rudder/speedbrake
 {const sh=new THREE.Shape();const T=SH_TAIL;sh.moveTo(-T[0][0],T[0][1]);for(let i=1;i<T.length;i++)sh.lineTo(-T[i][0],T[i][1]);sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth:0.5,bevelEnabled:true,bevelThickness:0.12,bevelSize:0.12,bevelSegments:3,steps:1});g.rotateY(Math.PI/2);
  const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);const tp=1-0.55*clamp((y-5.3)/9.6,0,1);p.setX(i,(p.getX(i)-0.25)*tp);}g.computeVertexNormals();shM(o,shAtlasUV(g),m.skin);
  shM(o,new THREE.CylinderGeometry(0.16,0.32,1.1,16).rotateX(Math.PI/2),m.dark,0,14.9,18.3);} // drag chute housing
 // OMS pods
 const podP=z=>{const t=(z-7.0)/8.4;const f=t<0.32?Math.sqrt(Math.max(0,1-Math.pow((0.32-t)/0.32,2))):1-0.06*t;return {w:1.12*Math.max(f,0.02),cy:5.2,ht:0.92*Math.max(f,0.02),hb:0.92*Math.max(f,0.02),nt:2.4,nb:2.4};};
 for(const s of[-1,1]){const pg=shLoft(shRange(7.0,15.4,40,1),0,Math.PI*2,40,podP,(z,th,P,out=V3())=>{const q=shPt(z,th,P,out);q.x+=s*2.2;return q;});shM(o,shAtlasUV(pg),m.skin);
  shM(o,new THREE.CircleGeometry(1,32).scale(1.04,0.86,1),m.blk,s*2.2,5.2,15.41);
  const nz=new THREE.LatheGeometry(Array.from({length:12},(_,i)=>new THREE.Vector2(0.17+0.42*Math.pow(i/11,0.7),-1.25*i/11)),32);const n=shM(o,nz,m.bell,s*2.25,5.3,15.4);n.rotation.x=-Math.PI/2+0.12;n.rotation.z=-s*0.1;
  const ni=new THREE.Mesh(nz,m.bellIn);n.add(ni);const og=new THREE.Mesh(new THREE.CircleGeometry(0.58,24).rotateX(Math.PI/2),m.glowB.clone());og.position.y=-1.2;n.add(og);o.userData['oms'+s]=og;}
 // aft heat shield bulkhead + engine dome shields
 {const sh=new THREE.Shape();const P=shProf(14.8);for(let j=0;j<=64;j++){const p=shPt(14.8,j/64*Math.PI*2,P);j?sh.lineTo(p.x,p.y):sh.moveTo(p.x,p.y);}shM(o,new THREE.ShapeGeometry(sh),m.blk,0,0,14.8);}
 const eng=[];for(const [x,y,c] of[[0,4.0,0],[-1.37,1.9,1],[1.37,1.9,2]]){const p=new THREE.Group();p.position.set(x,y,14.95);p.rotation.x=Math.PI/2;o.add(p);const e=shRS25(m);p.add(e);
  shM(o,new THREE.SphereGeometry(0.95,24,10,0,6.29,0,1.2).rotateX(-Math.PI/2),m.blk,x,y,14.7);p.userData.base=p.rotation.clone();eng.push(p);}
 // body flap
 {const g=new THREE.BoxGeometry(6.1,0.5,2.3,6,1,3);shM(o,shAtlasUV(g),m.skin,0,0.45,16.0);}
 // windows: 6 forward, 2 overhead (glossy glass panes sitting on the surface)
 const pane=(z0,z1,t0,t1)=>{const g=shLoft(shRange(z0,z1,3),t0,t1,4,z=>{const P=shProf(z);return{...P,w:P.w+0.025,ht:P.ht+0.025};});shM(o,g,m.glass);};
 for(const [a,b] of[[1.6,1.95],[1.19,1.54],[0.8,1.13],[2.01,2.34],[0.5,0.74],[2.4,2.64]])pane(-14.55,-13.55,a,b);
 for(const [a,b] of[[1.3,1.5],[1.64,1.84]])pane(-11.55,-10.95,a,b);
 // landing gear (stowed until approach)
 const gear=new THREE.Group();o.add(gear);gear.visible=false;for(const [x,z,n] of[[0,-14.0,1],[-3.45,4.9,2],[3.45,4.9,2]]){shM(gear,new THREE.CylinderGeometry(0.16,0.16,2.2,12),m.steel,x,-1.1,z);for(let k=0;k<n;k++)shM(gear,new THREE.CylinderGeometry(0.58,0.58,0.42,24).rotateZ(Math.PI/2),m.blk,x+(n===1?(k?0.3:-0.3):(k?0.33:-0.33)),-2.2,z).geometry;
  if(n===1){shM(gear,new THREE.CylinderGeometry(0.58,0.58,0.32,24).rotateZ(Math.PI/2),m.blk,x+0.3,-2.2,z);shM(gear,new THREE.CylinderGeometry(0.58,0.58,0.32,24).rotateZ(Math.PI/2),m.blk,x-0.3,-2.2,z);}}
 // drag chute (rollout)
 const chute=new THREE.Group();o.add(chute);chute.visible=false;{const [c,x]=shCv(256,64);for(let i=0;i<8;i++){x.fillStyle=i%2?'#f2f2ee':'#e8661e';x.fillRect(i*32,0,32,64);}const cm=new THREE.MeshStandardMaterial({map:shTex(c),side:THREE.DoubleSide,roughness:0.9});
  shM(chute,new THREE.SphereGeometry(6,32,12,0,6.29,0,1.25).rotateX(Math.PI/2),cm,0,5,58);const lm=new THREE.LineBasicMaterial({color:0x888888});const lp=[];for(let i=0;i<16;i++){const a=i/16*6.28;lp.push(0,5,18.6,Math.cos(a)*5.7,5+Math.sin(a)*5.7,56);}const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));chute.add(new THREE.LineSegments(lg,lm));}
 // re-entry plasma sheath (belly/nose shock layer)
 const pm=new THREE.MeshBasicMaterial({color:0xff7a50,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});const pl=new THREE.Mesh(new THREE.SphereGeometry(1,32,16),pm);pl.scale.set(13,2.4,21);pl.position.set(0,-0.6,0);o.add(pl);
 const pm2=pm.clone();const wk=new THREE.Mesh(new THREE.CylinderGeometry(12,4,60,24,1,true).rotateX(Math.PI/2),pm2);wk.position.set(0,1,48);o.add(wk);
 Object.assign(o.userData,{doors,eng,gear,chute,pl,wk});return o;}
// ---------- External Tank ----------
function shET(m){const g=new THREE.Group();const R=4.2;
 shM(g,new THREE.CylinderGeometry(R,R,28.6,64,1,true),m.foam,0,0.9+14.3,0);// LH2 tank barrel
 shM(g,new THREE.SphereGeometry(R,64,16,0,6.29,Math.PI/2,Math.PI/2).scale(1,0.24,1),m.foam,0,0.9,0); // aft dome
 shM(g,new THREE.CylinderGeometry(R+0.03,R+0.03,6.9,64,1,true),m.inter,0,29.5+3.45,0);// intertank (ribbed)
 for(const y of[29.5,36.4])shM(g,new THREE.TorusGeometry(R+0.03,0.08,6,64).rotateX(Math.PI/2),m.foam,0,y,0);
 const og=[];for(let i=0;i<=40;i++){const t=i/40;const r=R*Math.sqrt(Math.max(0,1-Math.pow(t,1.75)))*(t>0.96?0.6:1);og.push(new THREE.Vector2(Math.max(r,0.32),36.4+t*10.0));}og.push(new THREE.Vector2(0.001,46.4));
 shM(g,new THREE.LatheGeometry(og,64),m.foam);// LO2 ogive
 shM(g,new THREE.CylinderGeometry(0.06,0.33,0.6,16),m.dark,0,46.6,0);shM(g,new THREE.CylinderGeometry(0.02,0.02,0.5,6),m.steel,0,47.1,0);// nose cap + lightning rod
 // LO2 feedline, GH2/GO2 press lines, cable tray, ice/frost ramps, PAL ramp
 const z0=R+0.32;shM(g,new THREE.CylinderGeometry(0.22,0.22,30.2,16),m.foam,1.25,15.4,z0);shM(g,new THREE.CylinderGeometry(0.22,0.22,4,16).rotateZ(-0.7),m.foam,2.4,36.0,z0-1.2);
 shM(g,new THREE.CylinderGeometry(0.11,0.11,40,10),m.foam,-1.2,20,R+0.12);shM(g,new THREE.BoxGeometry(0.38,44,0.28),m.foam,-2.4,22,Math.sqrt(R*R-5.76)+0.12).rotation.y=-0.6;
 for(let y=3;y<30;y+=3.2)shM(g,new THREE.BoxGeometry(0.7,0.5,0.55),m.foam,1.25,y,z0-0.05);
 shM(g,new THREE.BoxGeometry(0.5,7,0.6),m.foam,0.4,32.9,R+0.12);
 // orbiter attach: forward bipod, aft crossbeam + umbilicals; SRB attach ring + struts
 for(const s of[-1,1])shM(g,new THREE.CylinderGeometry(0.12,0.12,1.6,8),m.steel,s*0.6,34.6,R+0.6).rotation.x=0.9;
 shM(g,new THREE.BoxGeometry(5.6,0.6,1.2),m.dark,0,4.0,R+0.4);for(const s of[-1,1])shM(g,new THREE.BoxGeometry(1.5,1.4,1.0),m.dark,s*1.35,2.4,R+0.7);
 shM(g,new THREE.TorusGeometry(R+0.05,0.12,8,64).rotateX(Math.PI/2),m.foam,0,5.4,0);
 for(const s of[-1,1]){for(const dy of[-0.6,0,0.6])shM(g,new THREE.CylinderGeometry(0.11,0.11,2.6,8).rotateZ(Math.PI/2),m.steel,s*5.3,5.4+dy,0);shM(g,new THREE.BoxGeometry(1.4,0.9,1.2),m.dark,s*4.8,32.0,0);}
 return g;}
// ---------- Solid Rocket Booster ----------
function shSRB(m){const g=new THREE.Group();const R=1.855; // origin = aft skirt bottom; nozzle below
 shM(g,new THREE.CylinderGeometry(R,R,37.5,48,1,true),m.srb,0,3.0+18.75,0);
 shM(g,new THREE.CylinderGeometry(R,2.6,3.0,48,1,true),m.srbW,0,1.5,0);// aft skirt
 for(let i=0;i<12;i++){const a=i/12*6.28;shM(g,new THREE.BoxGeometry(0.12,2.7,0.35),m.srbW,Math.cos(a)*2.25,1.45,Math.sin(a)*2.25).rotation.y=-a;}
 for(let i=0;i<4;i++){const a=i/4*6.28+0.78;shM(g,new THREE.BoxGeometry(0.55,0.9,0.5),m.srbW,Math.cos(a)*2.5,0.45,Math.sin(a)*2.5).rotation.y=-a;} // hold-down posts
 const np=[];for(let i=0;i<=14;i++){const t=i/14;np.push(new THREE.Vector2(0.75+(1.9-0.75)*Math.pow(t,0.7),0.9-3.4*t));}const noz=shM(g,new THREE.LatheGeometry(np,40),m.srbNoz);
 shM(g,new THREE.TorusGeometry(1.9,0.06,6,40).rotateX(Math.PI/2),m.dark,0,-2.5,0);
 // forward skirt frustum + nose cone (ogive) + BSM nozzles
 const fp=[];for(let i=0;i<=24;i++){const t=i/24;const r=t<0.3?R-(R-1.5)*(t/0.3):1.5*Math.sqrt(Math.max(0,1-Math.pow((t-0.3)/0.7,1.8)));fp.push(new THREE.Vector2(Math.max(r,0.05),40.5+t*5.0));}shM(g,new THREE.LatheGeometry(fp,48),m.srbW);
 for(let i=0;i<4;i++){const a=i/4*6.28+0.4;shM(g,new THREE.CylinderGeometry(0.12,0.16,0.5,10),m.dark,Math.cos(a)*1.6,42.0,Math.sin(a)*1.6).rotation.z=Math.cos(a)*0.8;shM(g,new THREE.CylinderGeometry(0.12,0.16,0.5,10),m.dark,Math.cos(a)*2.45,2.4,Math.sin(a)*2.45).rotation.z=Math.cos(a)*0.8;}
 shM(g,new THREE.TorusGeometry(R+0.04,0.1,6,48).rotateX(Math.PI/2),m.dark,0,16.6,0);// aft ET attach ring
 // flame + exhaust glow
 const fm=new THREE.MeshBasicMaterial({color:0xffd9a0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});
 const fl=new THREE.Mesh(new THREE.CylinderGeometry(1.8,3.6,40,24,1,true).translate(0,-22,0),fm);fl.position.y=-2.5;g.add(fl);
 const core=new THREE.Sprite(new THREE.SpriteMaterial({map:nukeTex,color:0xfff0c8,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false,opacity:0}));core.scale.set(12,30,1);core.position.y=-14;g.add(core);
 g.userData={fl,core};return g;}
function shChutes(){const g=new THREE.Group();const [c,x]=shCv(512,64);for(let i=0;i<16;i++){x.fillStyle=i%2?'#f4f4f0':'#e46a1c';x.fillRect(i*32,0,32,64);}const cm=new THREE.MeshStandardMaterial({map:shTex(c),side:THREE.DoubleSide,roughness:0.95});
 const ln=new THREE.LineBasicMaterial({color:0x777777});for(let i=0;i<3;i++){const a=i/3*6.28;const p=new THREE.Group();p.position.set(Math.cos(a)*15,46,Math.sin(a)*15);p.rotation.set(Math.sin(a)*0.35,0,-Math.cos(a)*0.35);
  shM(p,new THREE.SphereGeometry(18,40,12,0,6.29,0,1.1),cm,0,0,0).position.y=-12;const lp=[];for(let k=0;k<20;k++){const b=k/20*6.28;lp.push(Math.cos(b)*16,-4,Math.sin(b)*16,-Math.cos(a)*14,-40,-Math.sin(a)*14);}const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));p.add(new THREE.LineSegments(lg,ln));g.add(p);}
 g.scale.setScalar(1);return g;}
// ---------- LC-39A (shuttle era): hardstand, MLP, FSS + RSS, crew access arm, GOX vent arm 'beanie cap', lightning mast, water tower, LOX/LH2 spheres ----------
function shPad(m){const g=new THREE.Group();const B=-20.6; // stack coords: ground = B
 shM(g,new THREE.CylinderGeometry(190,215,6,8),m.conc,0,B-3+0.01,0);shM(g,new THREE.BoxGeometry(18,0.3,120),m.blk,0,B+0.08,-50);for(const sx of[-1,1])shM(g,new THREE.BoxGeometry(2,3,120),m.conc,sx*10,B+1.5,-50);// hardstand + flame trench

 {const [c,x]=shCv(512,512);_shSeed=3;x.fillStyle='#9d9990';x.fillRect(0,0,512,512);for(let i=0;i<6000;i++){const v=130+srnd()*60|0;x.fillStyle=`rgba(${v},${v-3},${v-8},.35)`;x.fillRect(srnd()*512,srnd()*512,2+srnd()*8,2+srnd()*8);}
  x.strokeStyle='rgba(60,58,54,.5)';for(let i=0;i<=8;i++){x.beginPath();x.moveTo(i*64,0);x.lineTo(i*64,512);x.stroke();x.beginPath();x.moveTo(0,i*64);x.lineTo(512,i*64);x.stroke();}
  const t=shTex(c,true,true);t.repeat.set(12,12);const pd=new THREE.Mesh(new THREE.CircleGeometry(190,8).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({map:t,roughness:0.95}));pd.position.y=B+0.03;pd.receiveShadow=true;g.add(pd);}
 // Mobile Launcher Platform (49 x 41 x 7.6 m) on six pedestals, SRB exhaust holes, Tail Service Masts
 for(const [x,z] of[[-20,-14],[20,-14],[-20,14],[20,14],[-20,0],[20,0]])shM(g,new THREE.BoxGeometry(3,6,3),m.conc,x,B+3,z);
 const mlp=new THREE.Group();mlp.position.y=B+6;g.add(mlp);shM(mlp,new THREE.BoxGeometry(49,7.6,41,8,2,8),m.mlp,0,3.8,0);
 for(const sd of[-1,1]){for(let i=0;i<8;i++)shM(mlp,new THREE.BoxGeometry(5.2,6.4,0.25),m.dark,-21+i*6,3.8,sd*20.6);for(let i=0;i<7;i++)shM(mlp,new THREE.BoxGeometry(0.25,6.4,5.2),m.dark,sd*24.6,3.8,-17.5+i*5.8);shM(mlp,new THREE.BoxGeometry(49.4,0.5,0.5),m.steel,0,7.3,sd*20.8);shM(mlp,new THREE.BoxGeometry(1.4,0.9,0.4),new THREE.MeshStandardMaterial({color:0x2a5db0,roughness:0.6}),sd*-14,5.5,sd*20.8);}
 for(const x of[-6.6,6.6])shM(mlp,new THREE.BoxGeometry(5.5,0.2,5.5),m.blk,x,7.62,0);shM(mlp,new THREE.BoxGeometry(9,0.2,9),m.blk,0,7.62,6.5);
 for(const s of[-1,1]){shM(mlp,new THREE.BoxGeometry(4.6,9.4,4.6),m.mlp,s*5.8,7.6+4.7,11.5);shM(mlp,new THREE.BoxGeometry(4.8,0.5,4.8),m.dark,s*5.8,17.2,11.5);}
 for(let i=0;i<14;i++)shM(mlp,new THREE.CylinderGeometry(0.3,0.3,3,8),m.steel,-22+i*3.3,9.1,-19.5); // rainbirds (sound suppression)
 // Fixed Service Structure: ~81 m lattice + hammerhead crane + 24 m fiberglass lightning mast
 const fss=new THREE.Group();fss.position.set(-23,B,8.5);g.add(fss);const tw=latticeTower(81,12);fss.add(tw);
 for(let y=6;y<81;y+=6.1)shM(fss,new THREE.BoxGeometry(12.6,0.35,12.6),m.mlp,0,y,0);// floor levels
 shM(fss,new THREE.BoxGeometry(3,3,22),m.mlp,0,84.5,4);shM(fss,new THREE.CylinderGeometry(0.35,0.9,24,10),new THREE.MeshStandardMaterial({color:0xd9d6c9,roughness:0.6}),0,86+12,0);
 {const lp=[0,110,0,-160,B<0?-B*0:0+0,-120,0,110,0,170,0,120];const lg=new THREE.BufferGeometry();const cp=[];for(const e of [[-150,0,-110],[160,0,120]]){for(let i=0;i<24;i++){for(const k of [i/24,(i+1)/24]){cp.push(e[0]*k,110+(e[1]-110)*k-14*Math.sin(Math.PI*k),e[2]*k);}}}lg.setAttribute('position',new THREE.Float32BufferAttribute(cp,3));fss.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x9aa0a6,transparent:true,opacity:0.35,depthWrite:false})));}/*msl: catenary wires sag + thin/faint like photos (was hard black straight lines)*/
 // Orbiter Access Arm with the White Room (to crew hatch on the orbiter's port side, ~ y 30)
 const oaa=new THREE.Group();oaa.position.set(6,30.2-B-1.4,0);fss.add(oaa);{const L=10.2;for(const [y,z] of[[0,-1.2],[0,1.2],[2.6,-1.2],[2.6,1.2]])shM(oaa,new THREE.BoxGeometry(L,0.25,0.25),m.mlp,L/2,y,z);
  for(let i=0;i<=9;i++){shM(oaa,new THREE.BoxGeometry(0.18,2.6,0.18),m.mlp,i*L/9,1.3,1.2);shM(oaa,new THREE.BoxGeometry(0.18,2.6,0.18),m.mlp,i*L/9,1.3,-1.2);}
  shM(oaa,new THREE.BoxGeometry(L,0.12,2.4),m.dark,L/2,0,0);shM(oaa,new THREE.BoxGeometry(L,2.4,0.05),new THREE.MeshStandardMaterial({color:0xcfd2d4,roughness:0.5,transparent:true,opacity:0.55}),L/2,1.3,1.2);
  shM(oaa,new THREE.BoxGeometry(3.4,3.6,3.6),m.white,L+1.3,1.6,0);shM(oaa,new THREE.BoxGeometry(L,0.6,3),m.mlp,L/2,-0.3,0);shM(oaa,new THREE.BoxGeometry(L,0.3,3),m.mlp,L/2,2.8,0);shM(oaa,new THREE.BoxGeometry(4,4.2,4.4),new THREE.MeshStandardMaterial({color:0xf2f2ee,roughness:0.55}),L+1.6,1.6,0);shM(oaa,new THREE.BoxGeometry(0.1,1.6,1.2),m.dark,L+3.65,1.2,0);}
 // GOX vent arm + 'beanie cap' hood on ET nose
 const gox=new THREE.Group();gox.position.set(6,47.2-B+0.6,-4);fss.add(gox);{const dx=17,dz=-4.5;const L=Math.hypot(dx,dz);const a=new THREE.Group();a.rotation.y=-Math.atan2(dz,dx);gox.add(a);
  for(const z of[-0.6,0.6])shM(a,new THREE.BoxGeometry(L-3,0.3,0.3),m.mlp,(L-3)/2,0,z);for(let i=0;i<8;i++)shM(a,new THREE.BoxGeometry(0.2,0.2,1.4),m.mlp,i*(L-3)/7,0,0);
  shM(a,new THREE.CylinderGeometry(0.2,0.2,L-3,8).rotateZ(Math.PI/2),m.white,(L-3)/2,-0.6,0);
  const cap=new THREE.Group();cap.position.set(L-0.4,-0.6,0);a.add(cap);shM(cap,new THREE.SphereGeometry(2.1,32,14,0,6.29,0,1.3),m.white,0,-0.2,0);shM(cap,new THREE.TorusGeometry(2.0,0.15,8,32).rotateX(Math.PI/2),m.dark,0,-0.7,0);
  for(const s of[-1,1])shM(cap,new THREE.CylinderGeometry(0.35,0.35,2.6,12).rotateZ(Math.PI/2),m.white,-2.4,0.4,s*0.9);}
 // Rotating Service Structure (rolled back) with Payload Changeout Room
 const rss=new THREE.Group();rss.position.set(-40,B,-34);rss.rotation.y=0.55;g.add(rss);rss.add(latticeTower(56,14));shM(rss,new THREE.BoxGeometry(14,40,18),m.white,0,34,-15);for(let y=8;y<56;y+=8)shM(rss,new THREE.BoxGeometry(14.5,0.4,14.5),m.mlp,0,y,0);
 shM(rss,new THREE.CylinderGeometry(1.4,1.4,60,16),m.mlp,10,30,10);
 // water tower (sound suppression, 88 m) + LOX & LH2 spheres
 {const w=new THREE.Group();w.position.set(-170,B,-150);g.add(w);for(let i=0;i<6;i++){const a=i/6*6.28;shM(w,new THREE.CylinderGeometry(0.6,0.9,78,8),m.steel,Math.cos(a)*7,39,Math.sin(a)*7);}
  shM(w,new THREE.CylinderGeometry(9,9,10,32),m.white,0,83,0);shM(w,new THREE.SphereGeometry(9,32,10,0,6.29,0,1.2),m.white,0,88,0);}
 for(const [x,z,r] of[[-210,160,11],[230,-150,13]]){shM(g,new THREE.SphereGeometry(r,40,24),m.white,x,B+r+3,z);for(let i=0;i<8;i++){const a=i/8*6.28;shM(g,new THREE.CylinderGeometry(0.4,0.4,r+3,6),m.steel,x+Math.cos(a)*r*0.8,B+(r+3)/2,z+Math.sin(a)*r*0.8);}}
 g.userData={oaa,gox,mlp,fss};return g;}
// ---------- full stack (stack frame: +y up, ET centred, orbiter on +z, ET bottom y=0) ----------
function shBuild(){if(SH.built)return;const m=shMats();
 SH.stack=new THREE.Group();SH.orb=shOrbiter(m);SH.orb.rotation.x=Math.PI/2;SH.orb.position.set(0,19,5.2);SH.stack.add(SH.orb);
 SH.et=shET(m);SH.stack.add(SH.et);SH.srb=[];for(const s of[-1,1]){const b=shSRB(m);b.position.set(s*6.6,-7.0,0);SH.stack.add(b);SH.srb.push(b);}
 SH.pad=shPad(m);SH.site=new THREE.Group();SH.site.add(SH.pad);
 // runway (Shuttle Landing Facility: 4572 x 91 m) created on demand
 {const [c,x]=shCv(256,4096);x.fillStyle='#4b4b4a';x.fillRect(0,0,256,4096);for(let i=0;i<20000;i++){const v=60+Math.random()*30|0;x.fillStyle=`rgba(${v},${v},${v},.5)`;x.fillRect(Math.random()*256,Math.random()*4096,2,2);}
  x.fillStyle='#e8e8e2';for(let y=120;y<3980;y+=60)x.fillRect(126,y,4,34);for(const y0 of[10,3990])for(let i=0;i<12;i++)x.fillRect(14+i*(i<6?17:17)+(i>=6?28:0),y0,9,90);x.font='bold 60px Arial';x.textAlign='center';x.fillText('15',128,200);x.save();x.translate(128,3890);x.rotate(Math.PI);x.fillText('33',0,0);x.restore();
  for(let y=600;y<3500;y+=500){x.fillRect(80,y,10,60);x.fillRect(166,y,10,60);}x.fillRect(4,0,3,4096);x.fillRect(249,0,3,4096);
  const t=shTex(c);const rw=new THREE.Group();const r=new THREE.Mesh(new THREE.PlaneGeometry(91,4572).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({map:t,roughness:0.85}));r.receiveShadow=true;rw.add(r);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(1600,7000).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x5b6b3c,roughness:1}));gr.position.y=-0.15;rw.add(gr);SH.rw=rw;}
 SH.chutes=[shChutes(),shChutes()];SH.built=true;}
let SH_BSIGN=1;
// ---------- flight ----------
const SHU=V3(0,1,0),_sv1=V3(),_sv2=V3(),_sv3=V3(),_sm4=new THREE.Matrix4(),_sq=new THREE.Quaternion();
let SHS=null;
function shPadPos(){if(SH.padPos)return SH.padPos;let best=null;for(let r=900;r<6000&&!best;r+=300)for(let a=0;a<6.28;a+=0.35){const x=PAD.x+Math.cos(a)*r,z=PAD.z+Math.sin(a)*r;let ok=true,hmin=1e9,hmax=-1e9;
  for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){const h=terrainH(x+i*90,z+j*90);hmin=Math.min(hmin,h);hmax=Math.max(hmax,h);}if(hmin>1.5&&hmax-hmin<12&&cityH(x,z)<=0){best=V3(x,hmax,z);break;}}
 SH.padPos=best||V3(PAD.x-1200,6,PAD.z+900);return SH.padPos;}
function shReset(){shBuild();const P=shPadPos();scene.add(SH.site,SH.stack);SH.site.position.set(P.x,P.y+20.6,P.z);SH.stack.position.copy(SH.site.position);SH.stack.quaternion.identity();
 SH.stack.rotation.y=0;if(SH.orb.parent!==SH.stack){SH.stack.add(SH.orb);}SH.orb.position.set(0,19,5.2);SH.orb.rotation.set(Math.PI/2,0,0);
 if(SH.et.parent!==SH.stack)SH.stack.add(SH.et);SH.et.position.set(0,0,0);SH.et.rotation.set(0,0,0);SH.srb.forEach((b,i)=>{if(b.parent!==SH.stack)SH.stack.add(b);b.position.set((i?1:-1)*6.6,-7,0);b.rotation.set(0,0,0);b.userData.fl.material.opacity=0;b.userData.core.material.opacity=0;});
 SH.chutes.forEach(c=>scene.remove(c));scene.remove(SH.rw);const u=SH.orb.userData;u.doors.forEach(d=>d.rotation.z=0);u.gear.visible=false;u.chute.visible=false;u.pl.material.opacity=0;u.wk.material.opacity=0;
 const pu=SH.pad.userData;pu.oaa.rotation.y=0;pu.gox.rotation.y=0;pu.gox.position.y=47.8-(-20.6);
 SHS={ph:'hold',t:-20,pos:SH.stack.position.clone(),vel:V3(),th:90,az:0,roll:-Math.PI/2,auto:true,warp:1,cam:0,q:new THREE.Quaternion(),bank:0,lm:1,sb:0,heat:0,doors:0,deb:[],ev:{},holdT:3,fx:0};}
const shH=()=>{const H=V3(Math.cos(SHS.az),0,-Math.sin(SHS.az));return H;};
function shCall(k,t,d=2.6){if(SHS.ev[k])return;SHS.ev[k]=1;msg(t,d);}
function shGeff(v){const vh2=v.x*v.x+v.z*v.z;return G*(1-vh2/(7800*7800));}
function shCmp(h){return lerp(1,0.05,sstep(15000,70000,h));}
function shStackQ(){const S=SHS,r=S.th*Math.PI/180,H=shH();const d=_sv1.copy(H).multiplyScalar(Math.cos(r)).addScaledVector(SHU,Math.sin(r)).normalize();
 const Z=_sv2.copy(H).multiplyScalar(Math.sin(r)).addScaledVector(SHU,-Math.cos(r)).normalize();const X=_sv3.crossVectors(d,Z).normalize();_sm4.makeBasis(X,d,Z);S.q.setFromRotationMatrix(_sm4);_sq.setFromAxisAngle(SHU,S.roll);S.q.multiply(_sq);return d.clone();}
function shDetach(o){o.updateMatrixWorld();scene.attach(o);}
function shStep(dt,fxOK){const S=SHS;S.t+=dt;const p=S.pos,v=S.vel,h=p.y;const gnd=Math.max(0,groundAt(p.x,p.z).h);const st=GUIDE.stick||{};const ip=clamp((inp.pitch||0)+(st.p||0),-1,1),ir=clamp((inp.roll||0)+(st.r||0),-1,1);
 const rho=1.225*Math.exp(-Math.max(0,h)/7200),sp=v.length();S.mach=sp/(h<11000?340-0.0039*h:295);S.q_dyn=0.5*rho*sp*sp;
 const pu=SH.pad.userData;
 if(S.ph==='hold'){S.t-=dt;if(S.auto){S.holdT-=dt;if(S.holdT<=0)S.ph='count';}return;}
 if(S.ph==='count'||S.ph==='ascent'){const t=S.t;
  // pad ops: access arm and GOX vent hood swing clear
  if(t<0){pu.oaa.rotation.y=-Math.min(1.25,Math.max(0,(t+19)*0.25));if(t>-15){pu.gox.position.y=Math.min(47.8+20.6+3,pu.gox.position.y+dt*1.2);pu.gox.rotation.y=Math.min(1.35,Math.max(0,(t+13)*0.22));}shCall('ct',t<-10?'T-'+Math.ceil(-t)+' s  ·  GO FOR LAUNCH\nAccess arm retracting · GOX vent hood lifting':'',2);}
  if(t>-6.6)shCall('ssme','T-6.6  MAIN ENGINE START\nSSMEs 3-2-1 staggered 120 ms',2.5);
  if(t>-3)shCall('ssup','ALL THREE ENGINES UP AND BURNING',2);
  let aT=0;if(t>=0){aT=t<124?(15.2+8*t/124)*(t>26&&t<60?0.93:1):Math.min(29.4,7.5+21.9*Math.pow((t-124)/380,1.4));}if(S.ph==='ascent'){const cut=!S.auto&&inp.throttle<=0.001;if(cut!==!!S.ssmeCut){S.ssmeCut=cut;msg(cut?(t<124?'SSME CUTOFF - SRBs STILL BURNING':'MECO - ALL ENGINES CUTOFF'):'SSME RELIGHT',1.6);}if(cut){aT=t<124?aT*0.71:0;S.thr=0;}else S.thr=1;}/*msl #14: manual throttle 0 = SSMEs off, SRBs can't shut down*/
  if(t>=0&&S.ph==='count'){S.ph='ascent';shCall('lo','SRB IGNITION — LIFTOFF\nLiftoff of Space Shuttle Atlantis',3);play3D('rocket',null,1,1);for(let k=0;k<60;k++)smoke.spawn(_sv1.set(p.x+rnd(30),gnd+4,p.z-60+rnd(30)),rnd(30),25+Math.random()*30,-40-Math.random()*60,7,18,30,0.92,0.92,0.94,0.6,0.3,0.6);}
  if(S.ph==='ascent'){
   if(t>7&&t<19){S.roll=lerp(-Math.PI/2,0,sstep(7,19,t));shCall('roll','ROLL PROGRAM\nHouston, Atlantis — roll program',2.5);}else if(t>=19)S.roll=0;
   if(t>26)shCall('bkt','THROTTLE DOWN TO 72% — MAX Q',2);if(t>65)shCall('tu','GO AT THROTTLE UP',2);
   let thc;if(S.auto){if(t<7)thc=90;else if(t<124)thc=90-60*Math.pow((t-7)/117,0.75);else{const ge=shGeff(v);const vyT=clamp((112000-h)*0.012,-80,600);thc=Math.asin(clamp((ge+(vyT-v.y)*0.08)/aT,-0.2,0.65))*180/Math.PI;}S.th+=clamp(thc-S.th,-2*dt,2*dt);}
   else if(t>7){S.th=clamp(S.th+ip*5*dt,-10,90);S.az-=ir*0.02*dt;}
   if(t>=124&&SH.srb[0].parent===SH.stack)shSRBSep(fxOK);
   const d=shStackQ();const ge=shGeff(v);
   _sv2.copy(d).multiplyScalar(aT);_sv2.y-=ge;if(sp>1)_sv2.addScaledVector(v,-0.5*rho*sp*1e-5);v.addScaledVector(_sv2,dt);
   const c=shCmp(h);p.x+=v.x*dt*c;p.z+=v.z*dt*c;p.y+=v.y*dt;S.g=aT/G;
   // engine gimbal follows control + small noise; twang
   SH.orb.userData.eng.forEach((e,i)=>{e.rotation.x=Math.PI/2+clamp((thc!==undefined?thc-S.th:ip*2)*0.05,-0.18,0.18)+Math.sin(S.t*3+i)*0.01;e.rotation.z=Math.sin(S.t*2.3+i*2)*0.012;});
   if(p.y<gnd+20.6-0.1&&t>2){shCrash('Vehicle lost');return;}
   const vh=Math.hypot(v.x,v.z);if(t>124&&(vh>=7790||t>560)){S.ph='meco';S.tm=t;shCall('meco','MECO — MAIN ENGINE CUTOFF\n'+(vh/1000).toFixed(2)+' km/s  ·  ALT '+(h/1000).toFixed(0)+' km',3);}
  }else{shStackQ();if(t>-6.6)SH.stack.rotation.x=0;}
  SH.stack.position.copy(p);if(S.ph==='ascent'||S.ph==='meco')SH.stack.quaternion.copy(S.q);
  // twang: stack sways ~0.6 m at the nose on SSME start, back to vertical at T-0
  if(t>-6.6&&t<0){const k=Math.sin(clamp((t+6.6)/6.6,0,1)*Math.PI);SH.stack.quaternion.setFromAxisAngle(V3(1,0,0),k*0.012);}
  S.thr=t>-6.6&&!S.ssmeCut?1:0;S.srbOn=t>=0&&t<124;return;}
 if(S.ph==='meco'){const t=S.t;const ge=shGeff(v);v.y-=ge*dt;p.x+=v.x*dt*shCmp(h);p.z+=v.z*dt*shCmp(h);p.y+=v.y*dt;SH.stack.position.copy(p);S.thr=0;S.srbOn=false;
  if(t>S.tm+18){shETSep();}return;}
 // orbiter-alone phases
 shOrbStep(dt,fxOK,ip,ir,rho,sp,gnd);}
function shSRBSep(fx){const S=SHS;shCall('srbsep','SRB SEPARATION  T+2:04\nBooster separation motors fired',3);
 SH.srb.forEach((b,i)=>{shDetach(b);const s=i?1:-1;const out=V3(s,0,0).applyQuaternion(SH.stack.quaternion);const vel=SHS.vel.clone().addScaledVector(out,14).addScaledVector(V3(0,1,0).applyQuaternion(SH.stack.quaternion),-25);
  S.deb.push({o:b,vel,w:V3(rnd(0.15),rnd(0.1),s*0.25),t:0,kind:'srb',i});b.userData.fl.material.opacity=0;b.userData.core.material.opacity=0;
  for(let k=0;k<40;k++){const y=k<20?44:2.4;const wp=b.localToWorld(V3(s*2,y,0));fire.spawn(wp,out.x*40+rnd(10),rnd(10),out.z*40+rnd(10),0.6,3,10,1,0.85,0.55,1);smoke.spawn(wp,out.x*20+rnd(6),rnd(6),out.z*20+rnd(6),3,4,14,0.9,0.88,0.85,0.6,0.4,0);}});
 play3D('boom',null,0.6,1.2);}
function shETSep(){const S=SHS;const op=SH.orb;op.updateMatrixWorld();const wp=new THREE.Vector3();op.getWorldPosition(wp);const wq=new THREE.Quaternion();op.getWorldQuaternion(wq);
 shDetach(op);shDetach(SH.et);S.deb.push({o:SH.et,vel:S.vel.clone().addScaledVector(V3(0,0,-1).applyQuaternion(SH.stack.quaternion),-1.2),w:V3(0.02,0.01,0.04),t:0,kind:'et'});
 S.pos.copy(wp);S.oq=wq.clone();S.ph='orbit';S.to=S.t;S.bank=Math.PI;S.alpha=0;shCall('etsep','ET SEPARATION\n-Z translation · OMS-2 circularisation',3);}
function shCrash(w){const S=SHS;S.ph='lost';explosion(S.pos,6);for(let k=0;k<80;k++)fire.spawn(S.pos,rnd(60),rnd(60),rnd(60),2,12,30,1,0.7,0.3,1);msg('💥 '+w+'\nRespawning…',3.5);S.lostT=4;SH.stack.visible=false;SH.orb.visible=false;}
function shOrbQ(S,fwd,upv,alpha,bank){const f=_sv1.copy(fwd).normalize();let u=_sv2.copy(upv).addScaledVector(f,-upv.dot(f));if(u.lengthSq()<1e-6)u.set(0,0,1);u.normalize();u.applyAxisAngle(f,bank);
 const r=_sv3.crossVectors(f,u).normalize();f.applyAxisAngle(r,alpha);u.applyAxisAngle(r,alpha);_sm4.makeBasis(r,u,f.clone().negate());return new THREE.Quaternion().setFromRotationMatrix(_sm4);}
function shOrbStep(dt,fxOK,ip,ir,rho,sp,gnd){const S=SHS,p=S.pos,v=S.vel,h=p.y;const vh=Math.hypot(v.x,v.z);const vd=_sv1.copy(v).normalize().clone();const ud=SH.orb.userData;
 const ge=shGeff(v);const acc=V3(0,-ge,0);let tgtQ=null;S.thr=0;S.oms=0;
 if(S.ph==='orbit'){const ot=S.t-S.to;if(ot<6){acc.addScaledVector(vd,0.3);S.oms=1;}if(ot>5)shCall('orb','ORBIT ACHIEVED  ·  '+(h/1000).toFixed(0)+' km  ·  '+(sp/1000).toFixed(2)+' km/s\nPayload bay doors opening',3.5);
  S.doors=clamp(S.doors+(ot>8&&!S.closeDoors?dt*0.06:-dt*0.08),0,1);if(S.bank>0)S.bank=Math.max(0,S.bank-dt*0.2);
  tgtQ=shOrbQ(S,vd,SHU,0,S.bank+ir*0.0);if(S.auto&&ot>70)S.closeDoors=true;if(S.closeDoors&&S.doors<=0.001&&(S.auto||S.deorbitReq)){S.ph='deorbit';S.td=S.t;shCall('deo','DEORBIT BURN — OMS ENGINES\nRetrograde, tail first',3);}
  if(!S.auto&&S.deorbitReq&&S.doors>0)S.closeDoors=true;}
 else if(S.ph==='deorbit'){const tt=S.t-S.td;tgtQ=shOrbQ(S,vd.clone().negate(),SHU.clone().negate(),0,0);if(tt>6&&tt<26){acc.addScaledVector(vd,-7.5);S.oms=1;}if(tt>40){S.ph='entry';shCall('ent','ENTRY INTERFACE — 40° ANGLE OF ATTACK\nRoll reversals to bleed energy',3);}}
 else if(S.ph==='entry'||S.ph==='approach'){const beta=6800-6500*sstep(250,2500,sp),LD=lerp(4.5,1.0,sstep(250,2500,sp));
  let lm=1;if(S.auto){if(S.ph==='entry'){const vyT=-clamp(40+sp*0.006,40,90)*(h>60000?1:0.8);const need=ge+(vyT-v.y)*0.06;const Lm=0.5*rho*sp*sp/beta*LD;const cb=Lm>1e-3?clamp(need/Lm,-1,1):1;const tb=Math.acos(cb)*(S.rrev||1);
     if(Math.abs(S.bank)>1.2&&sp<6000&&!S.rv1){S.rv1=1;}S.bank+=clamp(tb-S.bank,-0.12*dt,0.12*dt);if(sp<5500&&!S.ev.rr1){S.rrev=-1;shCall('rr1','ROLL REVERSAL',1.5);}if(sp<3500&&!S.ev.rr2){S.rrev=1;shCall('rr2','ROLL REVERSAL',1.5);}}
    else{shApproachAP(S,sp,gnd);lm=S.lm;}}
  else{S.bank=clamp(S.bank+ir*0.9*dt,-1.4,1.4);if(Math.abs(ir)<0.05&&S.ph==='approach')S.bank*=1-dt*0.8;lm=clamp(1+ip*1.1,0.1,2.3);S.lm=lm;}
  const q=0.5*rho*sp*sp/beta;const Dm=q*(0.75+0.25*lm*lm)*(1+S.sb*1.2),Lm=q*LD*lm;
  let lu=_sv2.copy(SHU).addScaledVector(vd,-vd.y);if(lu.lengthSq()<1e-6)lu.set(0,1,0);lu.normalize();lu.applyAxisAngle(vd,S.bank);acc.addScaledVector(lu,Lm).addScaledVector(vd,-Dm);
  S.g=Math.hypot(Lm,Dm)/G;const M=S.mach;S.alpha=(S.ph==='entry'?lerp(40,12,1-sstep(1.5,10,M)):clamp(5+lm*4,2,14))*Math.PI/180;
  tgtQ=shOrbQ(S,vd,SHU,S.alpha,S.bank);S.heat=clamp(rho*sp*sp*sp/1.5e7,0,1)*(v.y<0?1:0.5);
  if(S.ph==='entry'&&h<25000&&sp<900){S.ph='approach';shCall('taem','TAEM — TERMINAL AREA ENERGY MANAGEMENT\nHeading for Shuttle Landing Facility, runway 15',3);S.rwFix=false;}
  if(S.ph==='approach')shRunway(S,gnd);}
 else if(S.ph==='landed'){const f=vd;const dec=2.5+(ud.chute.visible?2.5:0);const nv=Math.max(0,sp-dec*dt);if(sp>0.1)v.multiplyScalar(nv/sp);v.y=0;p.addScaledVector(v,dt);p.y=S.gy+2.45;
  S.alpha=Math.max(0,S.alpha-dt*0.06);tgtQ=shOrbQ(S,sp>1?vd:fwdOf(SH.orb.quaternion),SHU,S.alpha,0);if(sp<95&&sp>20)ud.chute.visible=true;if(sp<12)ud.chute.visible=false;if(sp<0.2)shCall('stop','WHEELS STOP\nWelcome home, Atlantis.',6);}
 if(S.ph!=='landed'){v.addScaledVector(acc,dt);const c=shCmp(h);p.x+=v.x*dt*c;p.z+=v.z*dt*c;p.y+=v.y*dt;}
 // attitude: smooth slew
 if(!S.oq)S.oq=SH.orb.quaternion.clone();if(tgtQ)S.oq.slerp(tgtQ,1-Math.exp(-dt*(S.ph==='landed'?6:0.8)));
 // touchdown / ground contact
 if(S.ph==='approach'||S.ph==='entry'){const gh=S.rwOn&&S.rwY!=null?S.rwY:gnd;const clr=ud.gear.visible?2.45:0.2;if(p.y<gh+clr){
   if(v.y>-7&&ud.gear.visible){S.ph='landed';S.gy=gh;p.y=gh+2.45;msg((S.onRw?'MAIN GEAR TOUCHDOWN':'TOUCHDOWN — OFF RUNWAY')+'\nSink '+(-v.y).toFixed(1)+' m/s · '+(sp*1.944).toFixed(0)+' kt',3);v.y=0;}else{shCrash('Hard landing');return;}}}
 ud.doors.forEach(d=>d.rotation.z=d.userData.s*(-S.doors*2.95));}
function shRunway(S,gnd){const p=S.pos,v=S.vel;const H=V3(v.x,0,v.z).normalize();
 if(!S.rwFix){const R=p.y/Math.tan(12*Math.PI/180)+Math.max(0,v.length()-150)*25;const c=p.clone().addScaledVector(H,R);let gy=0;for(let i=-3;i<=3;i++)gy=Math.max(gy,groundAt(c.x+H.x*i*700,c.z+H.z*i*700).h);
  S.rwP=c.setY(gy+0.4);S.rwH=H.clone();S.rwY=gy+0.4;if(p.y<8000){S.rwFix=true;SH.rw.position.copy(S.rwP).addScaledVector(H,2286);SH.rw.rotation.y=Math.atan2(-H.x,-H.z);scene.add(SH.rw);}}
 const rel=_sv3.copy(p).sub(S.rwP);const al=rel.dot(S.rwH),lat=rel.x*S.rwH.z-rel.z*S.rwH.x;S.onRw=S.rwFix&&al>-50&&al<4572&&Math.abs(lat)<46;S.rwOn=S.rwFix&&Math.abs(lat)<800&&al>-800&&al<4800;S.rwDist=-al;S.rwLat=lat;
 if(p.y-S.rwY<500&&S.auto)SH.orb.userData.gear.visible=true;if(!S.auto&&p.y-S.rwY<120)SH.orb.userData.gear.visible=true;}
function shApproachAP(S,sp,gnd){const p=S.pos,v=S.vel;const hA=p.y-(S.rwY||gnd);const dist=S.rwP?Math.max(0,-(_sv3.copy(p).sub(S.rwP).dot(S.rwH))+400):hA/0.2;
 const hgs=dist*Math.tan(12*Math.PI/180);const vyT=hA>140?-sp*Math.sin(12*Math.PI/180)-0.04*(hA-hgs):-Math.max(1.2,hA*0.09);S.lm=clamp((S.lm||1)+((vyT-v.y)*0.05-((S.lm||1)-1)*0.2)*0.5,0.05,2.3);
 S.sb=hA>2000&&sp>200?0.6:hA>300&&sp>170?0.3:0;
 if(S.rwP){const far=dist>9000;const tg=_sv3.copy(S.rwP).addScaledVector(S.rwH,far?-Math.min(dist*0.35,9000):1500).sub(p);tg.y=0;tg.normalize();const vh=V3(v.x,0,v.z).normalize();
  const ang=Math.atan2(vh.x*tg.z-vh.z*tg.x,vh.dot(tg));S.bank=clamp(SH_BSIGN*ang*2.2,-0.9,0.9)*(hA<30?0.2:1);}else S.bank*=0.98;}
// ---------- debris (SRBs w/ parachutes, ET) ----------
function shDebris(dt,fxOK){const S=SHS;for(let i=S.deb.length-1;i>=0;i--){const d=S.deb[i];d.t+=dt;const o=d.o,p=o.position,h=p.y;const rho=1.225*Math.exp(-Math.max(0,h)/7200),sp=d.vel.length();
 if(d.kind==='srb'){if(d.t<2.5&&fxOK){const wp=o.localToWorld(_sv1.set(0,-3,0));smoke.spawn(wp,rnd(5),rnd(5),rnd(5),4,8,20,0.85,0.84,0.82,0.5,0.2,0);} // tail-off
  if(!d.ch&&h<4800&&d.vel.y<0){d.ch=1;const c=SH.chutes[d.i];c.scale.setScalar(0.25);scene.add(c);d.c=c;msg('SRB '+(d.i?'RIGHT':'LEFT')+' — PARACHUTES DEPLOYED',1.5);}
  if(d.c){const tv=h>1900?-60:-23;d.vel.y+=(tv-d.vel.y)*Math.min(1,dt*0.8);d.vel.x*=1-dt*0.5;d.vel.z*=1-dt*0.5;d.c.position.copy(p);d.c.scale.setScalar(Math.min(1,d.c.scale.x+dt*(h>1900?0.15:0.5))*(h>1900?0.45:1));o.quaternion.slerp(_sq.identity(),dt*0.5);}
  else{d.vel.y-=G*dt;if(sp>1)d.vel.addScaledVector(d.vel,-0.5*rho*sp/1500*dt);_sq.setFromEuler(new THREE.Euler(d.w.x*dt,d.w.y*dt,d.w.z*dt));o.quaternion.multiply(_sq);}
  const c=shCmp(h);p.x+=d.vel.x*dt*c;p.z+=d.vel.z*dt*c;p.y+=d.vel.y*dt;const gh=groundAt(p.x,p.z).h;if(p.y<gh+2){if(!d.sp){d.sp=1;splash&&splash(p.clone().setY(0.5),8);msg('SRB SPLASHDOWN — recovery ships Liberty Star / Freedom Star',2);}d.vel.set(0,0,0);p.y=gh+2;if(d.t>99999)0;d.dead=(d.dead||0)+dt;if(d.dead>40){scene.remove(o);if(d.c)scene.remove(d.c);S.deb.splice(i,1);}}}
 else{d.vel.y-=shGeff(d.vel)*dt*1.4;_sq.setFromEuler(new THREE.Euler(d.w.x*dt,d.w.y*dt,d.w.z*dt));o.quaternion.multiply(_sq);const c=shCmp(h);p.x+=d.vel.x*dt*c;p.z+=d.vel.z*dt*c;p.y+=d.vel.y*dt;if(d.t>240){scene.remove(o);S.deb.splice(i,1);}}}}
// ---------- per-frame effects ----------
function shFX(dt){const S=SHS;const sk=S.ph==='count'||S.ph==='ascent';const h=S.pos.y;const thin=sstep(3000,40000,h);
 const ud=SH.orb.userData;ud.eng.forEach((e,i)=>{const u=e.children[0].userData;const on=S.thr&&(S.t>-6.6+i*0.12)&&(S.ph==='count'||S.ph==='ascent');const k=on?Math.min(1,(S.t+6.6-i*0.12)*1.5):0;
  u.glow.material.opacity=k*0.9;u.cone.material.opacity=k*(0.22+0.12*Math.random())*(1-thin*0.4);u.fl.scale.set(1+thin*2.5,1+thin*1.5,1+thin*2.5);u.dm.forEach((d,j)=>{d.material.opacity=k*(0.8-j*0.11)*(1-thin*0.75)*(0.85+0.15*Math.random());});});
 for(const s of[-1,1]){const g=ud['oms'+s];g.material.opacity=S.oms?0.9:0;g.material.color.setRGB(1,0.75,0.5);}
 SH.srb.forEach(b=>{if(b.parent!==SH.stack)return;const on=S.srbOn;const u=b.userData;u.fl.material.opacity=on?0.75+0.25*Math.random():0;u.core.material.opacity=on?1:0;u.fl.scale.set(1+thin*3,1+thin*2.2,1+thin*3);u.core.scale.set(12*(1+thin*2),30*(1+thin),1);
  if(on){const wp=b.localToWorld(_sv1.set(0,-6,0));const dn=_sv2.set(0,-1,0).applyQuaternion(SH.stack.quaternion);
   for(let k=0;k<3;k++)fire.spawn(_sv3.copy(wp).addScaledVector(dn,k*6+rnd(2)),dn.x*90+rnd(12),dn.y*90+rnd(12),dn.z*90+rnd(12),0.45,6+thin*14,14+thin*40,1,0.86,0.55,1,0.2,0,1,0.5,0.15);
   if(h<45000)for(let k=0;k<2;k++)smoke.spawn(_sv3.copy(wp).addScaledVector(dn,20+rnd(6)),rnd(4)+S.vel.x*-0.0,rnd(4),rnd(4),h<8000?40:20,8+thin*20,(h<8000?26:40)+thin*90,0.93,0.92,0.9,h<8000?0.75:0.4,0.04,0.2);}});
 // pad: ground cloud, water deluge steam, flame trench exhaust
 if(sk&&S.t>-6.6&&h-SH.site.position.y<300){const P=SH.site.position;for(let k=0;k<(S.t>0?6:2);k++){const a=Math.random()<0.6?-Math.PI/2+rnd(0.4):Math.random()*6.28;const r=20+Math.random()*30;
   smoke.spawn(_sv1.set(P.x+Math.cos(a)*r*0.4,P.y-19+Math.random()*6,P.z+Math.sin(a)*r),Math.cos(a)*(30+Math.random()*50),6+Math.random()*20,Math.sin(a)*(40+Math.random()*90),12,16,40,0.95,0.95,0.96,0.55,0.25,0.4);}}
 // entry plasma
 const k=S.heat||0;ud.pl.material.opacity=k*0.55;ud.pl.material.color.setRGB(1,0.45+0.25*(1-k),0.35+0.25*(1-k));ud.wk.material.opacity=k*0.22;
 if(k>0.15){const wp=SH.orb.localToWorld(_sv1.set(rnd(4),-1,8+rnd(4)));fire.spawn(wp,rnd(5),rnd(5),rnd(5),0.5,4,14,1,0.5,0.4,0.6*k);}}
// ---------- camera ----------
const _shOff=V3(),_shF=V3();let _shKey='';
function shFocus(){const S=SHS;if(S.cam===3){const d=S.deb.find(x=>x.kind==='srb');if(d)return [d.o.position.clone().add(V3(0,10,0)),70,d];}
 if(SH.orb.parent===SH.stack){SH.stack.updateMatrixWorld();return [SH.stack.localToWorld(V3(0,20,2)),150,null];}SH.orb.updateMatrixWorld();return [SH.orb.localToWorld(V3(0,3,0)),75,null];}
function shCamera(dt){const S=SHS;const [F,D0]=shFocus();camera.up.set(0,1,0);const zoom=FL.zoom||1;
 if(S.cam===1){const P=SH.site.position;const c=_sv1.set(P.x-380,P.y-14,P.z+300);camera.position.copy(c);camera.lookAt(F);const dd=c.distanceTo(F);camera.fov=clamp(2*Math.atan(90/dd)*180/Math.PI/zoom,0.4,60);camera.updateProjectionMatrix();return;}
 if(camera.fov!==60){camera.fov=60;camera.updateProjectionMatrix();}
 if(S.cam===2){const o=SH.orb;o.updateMatrixWorld();camera.position.copy(o.localToWorld(_sv1.set(0.9,6.6,-12.6)));camera.up.copy(upOf(o.getWorldQuaternion(_sq),_sv2));camera.lookAt(o.localToWorld(_sv3.set(0.9,6.4,-60)));return;}
 const vd=S.vel.lengthSq()>4?S.vel.clone().normalize():SHU.clone();const side=V3(-vd.z,0,vd.x);if(side.lengthSq()<1e-4)side.set(0.6,0,0.8);side.normalize();
 const des=_sv1.copy(vd).multiplyScalar(-0.55).addScaledVector(side,0.78).addScaledVector(SHU,0.22).normalize();if(S.ph==='hold'||S.ph==='count')des.set(-0.62,0.05,0.78).normalize();
 const k=_shKey===S.cam+':'+(SH.orb.parent===SH.stack);if(!k){_shOff.copy(des);_shKey=S.cam+':'+(SH.orb.parent===SH.stack);}else _shOff.lerp(des,1-Math.exp(-dt*1.5)).normalize();
 const off=_sv2.copy(_shOff).multiplyScalar(D0);applyFL(off,SHU);off.multiplyScalar(1);camera.position.copy(F).add(off);const gh=groundAt(camera.position.x,camera.position.z).h;if(camera.position.y<gh+3)camera.position.y=gh+3;camera.lookAt(F);
 if(S.thr&&S.pos.y<20000){const sh=(S.srbOn?0.35:0.12)*(1-sstep(0,15000,S.pos.y))*(S.ph==='count'?0.4:1);camera.position.add(V3(rnd(sh),rnd(sh),rnd(sh)));}}
// ---------- HUD ----------
{const css=document.createElement('style');css.textContent=`#shHud{position:fixed;inset:0;pointer-events:none;z-index:7;display:none;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",Helvetica,Arial,sans-serif;color:#eef4ff}
#shInfo{position:absolute;left:calc(12px + env(safe-area-inset-left));top:calc(54px + env(safe-area-inset-top));padding:9px 12px;border-radius:14px;background:rgba(10,14,22,.42);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.12);font:600 12px/1.45 ui-monospace,Menlo,monospace;white-space:pre;letter-spacing:.02em}
#shBtns{position:absolute;right:calc(12px + env(safe-area-inset-right));top:calc(54px + env(safe-area-inset-top));display:flex;flex-direction:column;gap:7px;pointer-events:auto}
#shBtns div{padding:9px 13px;border-radius:13px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);font-weight:600;font-size:13px;text-align:center;min-width:86px;touch-action:manipulation}
#shBtns div.on{background:rgba(90,150,255,.4);border-color:rgba(150,200,255,.6)}`;document.head.appendChild(css);
 const d=document.createElement('div');d.id='shHud';d.innerHTML='<div id="shInfo"></div><div id="shBtns"><div id="shAct">LAUNCH</div><div id="shAP" class="on">AUTOPILOT</div><div id="shWarp">TIME ×1</div><div id="shCam">CAM: CHASE</div></div>';document.body.appendChild(d);
 const on=(id,f)=>$(id).addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(SHS)f();});
 on('shAct',()=>shAction());on('shAP',()=>{SHS.auto=!SHS.auto;msg(SHS.auto?'AUTOPILOT ENGAGED':'MANUAL CONTROL — stick flies the Shuttle',1.5);});
 on('shWarp',()=>{const W=[1,4,10,30,60];SHS.warp=W[(W.indexOf(SHS.warp)+1)%W.length];});on('shCam',()=>{SHS.cam=(SHS.cam+1)%4;if(SHS.cam===3&&!SHS.deb.some(x=>x.kind==='srb'))SHS.cam=0;flRecenter&&flRecenter();});}
SH.act=()=>shAction();function shAction(){const S=SHS;if(S.ph==='hold'){S.ph='count';return;}if(S.ph==='orbit'){S.deorbitReq=true;S.closeDoors=true;msg('Closing payload bay doors for deorbit',2);return;}
 if(S.ph==='approach'||S.ph==='entry'){const g=SH.orb.userData.gear;g.visible=!g.visible;msg(g.visible?'GEAR DOWN':'GEAR UP',1);}}
const SH_PH={hold:'HOLD — T-20 s',count:'TERMINAL COUNT',ascent:'ASCENT',meco:'MECO',orbit:'ORBIT',deorbit:'DEORBIT BURN',entry:'ENTRY',approach:'APPROACH & LANDING',landed:'ROLLOUT',lost:'LOST'};
function shHUD(){const S=SHS;const t=S.t;const mt=(t<0?'T-':'T+')+fmtT(Math.abs(t));const v=S.vel.length(),h=S.pos.y-(S.ph==='approach'||S.ph==='landed'?(S.rwY||0):0);
 let nx='';if(S.ph==='ascent')nx=t<124?'SRB SEP in '+fmtT(124-t):'MECO at 7.8 km/s';if(S.ph==='approach'&&S.rwP)nx='RWY 15  '+(Math.max(0,S.rwDist)/1000).toFixed(1)+' km  '+(S.rwFix?'':'(acquiring)');
 $('shInfo').textContent=`ATLANTIS  STS  ·  ${SH_PH[S.ph]}\nMET ${mt}\nALT ${h>2000?(h/1000).toFixed(1)+' km':Math.round(h)+' m'}   VEL ${v>1000?(v/1000).toFixed(2)+' km/s':Math.round(v)+' m/s'}\nMACH ${S.mach?S.mach.toFixed(1):'0.0'}   ${S.g?S.g.toFixed(1)+' g':''}${S.ph==='entry'?'  α '+Math.round(S.alpha*57.3)+'°  BANK '+Math.round(S.bank*57.3)+'°':''}${S.ph==='ascent'?'  PITCH '+S.th.toFixed(0)+'°':''}\n${nx}`;
 $('shAct').textContent=S.ph==='hold'?'LAUNCH':S.ph==='orbit'?'DEORBIT':(S.ph==='approach'||S.ph==='entry')?'GEAR':'—';$('shAP').className=S.auto?'on':'';$('shWarp').textContent='TIME ×'+S.warp;$('shCam').textContent='CAM: '+['CHASE','TOWER','COCKPIT','BOOSTER'][S.cam];}
// ---------- hooks ----------
{const _sp=spawn;spawn=function(kind,loc){if(kind!=='shuttle'){if(SHS){scene.remove(SH.site,SH.stack,SH.orb,SH.et,SH.rw,...SH.srb,...SH.chutes);SHS=null;$('shHud').style.display='none';camera.fov=60;camera.updateProjectionMatrix();}return _sp(kind,loc);}
 _sp('silo',loc);const v=player;v.kind='shuttle';v.def=DEFS.shuttle;v.weapons=[];v.ammo={};
 if(SHS){[SH.orb,SH.et,...SH.srb,...SH.chutes,SH.rw].forEach(o=>scene.remove(o));}shReset();SH.stack.visible=SH.orb.visible=true;v.mesh.position.copy(SHS.pos);$('shHud').style.display='block';
 msg('SPACE SHUTTLE ATLANTIS — LC-39A\nHold at T-20 s. Tap LAUNCH (autopilot launches in 3 s)',3.5);};}
{const _fw=fireWeapon;fireWeapon=function(v){if(v&&v.kind==='shuttle'){if(SHS)shAction();return false;}return _fw(v);};}
{const _tk=tick;tick=function(dt){_tk(dt);if(!SHS||!player||player.kind!=='shuttle')return;const S=SHS;
 if(S.ph==='lost'){S.lostT-=dt;if(S.lostT<=0)spawn('shuttle');return;}
 const n=Math.max(1,S.warp|0);for(let i=0;i<n;i++){shStep(dt,i===n-1);if(!SHS||S.ph==='lost')break;shDebris(dt,i===n-1);}
 if(SHS&&S.ph!=='lost'){if(SH.orb.parent!==SH.stack){SH.orb.position.copy(S.pos);if(S.oq)SH.orb.quaternion.copy(S.oq);}const [F]=shFocus();player.mesh.position.copy(F);shFX(dt);}};}
{const _uc=updCamera;updCamera=function(dt){if(SHS&&player&&player.kind==='shuttle'){shCamera(dt);return;}_uc(dt);};}
{const _ue=updEnv;let hT=0;updEnv=function(dt=0.016){_ue(dt);if(!SHS||!player||player.kind!=='shuttle')return;hT-=dt;if(hT<=0){hT=0.1;shHUD();}
 try{const S=SHS;const pw=(S.thr&&(S.ph==='count'||S.ph==='ascent'))?1:0;const far=sstep(20000,80000,S.pos.y);if(typeof setLoop==='function'&&!SND.muted){setLoop('rocket',pw*(S.srbOn?1.2:0.8)*(1-far*0.7),S.srbOn?0.8:0.95);setLoop('rocket_deep',pw*(S.srbOn?1.0:0.5)*(1-far*0.8),0.75);setLoop('plasma',(S.heat||0)*0.8,0.8);}}catch(e){}};}
window.__milsim.spawn=spawn;window.__milsim.fireWeapon=fireWeapon;Object.assign(window.__milsim,{shuttle:()=>SHS,SH});
