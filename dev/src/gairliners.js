//GAIRLINERS-BEGIN  Boeing 737-800, Boeing 777-300ER, Airbus A320 - true scale (metres), nose -Z, wheels touch y=-2 (gearH).
// Player-flyable (DEFS.b738/b77w/a320) + AI traffic + civil terminal on the west side of the airbase runway. Generic "NEILL AIR" livery.
const AL=(()=>{
const T=THREE,PI=Math.PI;
// ---------------- specs (public dimensions) ----------------
const SPEC={
 b738:{name:'Boeing 737-800',L:39.47,a:1.88,b:2.0,Ln:6.2,Lt:11.6,yc:1.25+2.0,zc:19.2,reg:'N738NG',
  wing:{le:14.6,sweep:27,dih:6,st:[[0,7.9],[1.9,7.2],[5.6,4.45],[16.8,1.25]],t:[0.15,0.15,0.12,0.10],tip:'blended',wl:2.45,y0:-1.0},
  hs:{le:33.2,span:7.15,c0:3.9,c1:1.15,sweep:32,dih:7,y:0.55},vs:{le:29.4,h:8.2,c0:6.8,c1:1.9,sweep:38},
  eng:{type:'cfm7',y:4.9,z:11.2,yo:-1.3,R:1.03,len:4.9,fan:1.55,blades:24,flat:true},
  gear:{nose:5.25,main:20.9,track:5.72,tire:0.57,ntire:0.35,bogie:0},
  win:{s0:6.6,s1:33.0,pitch:0.508,w:0.25,h:0.35,y:0.32,skip:[[15.6,17.5]]},doors:[[3.55,0.86,1.83,'L'],[34.8,0.76,1.83,'L'],[16.0,0.51,0.97,'O'],[16.9,0.51,0.97,'O']],
  thrust:9.5,vstall:62,vrot:74,dragK:1.4e-4,ceil:12500,cock:4.0},
 a320:{name:'Airbus A320',L:37.57,a:1.98,b:2.07,Ln:6.0,Lt:11.0,yc:1.85+2.07,zc:18.2,reg:'N320NG',
  wing:{le:13.4,sweep:27,dih:5.1,st:[[0,7.6],[1.98,6.9],[6.2,4.4],[16.95,1.5]],t:[0.15,0.15,0.12,0.105],tip:'sharklet',wl:2.43,y0:-1.15},
  hs:{le:31.6,span:6.2,c0:3.7,c1:1.3,sweep:30,dih:6,y:0.7},vs:{le:28.2,h:6.7,c0:6.4,c1:2.1,sweep:36},
  eng:{type:'cfm5',y:5.75,z:10.0,yo:-1.45,R:1.18,len:4.45,fan:1.735,blades:36,flat:false},
  gear:{nose:5.07,main:17.7,track:7.59,tire:0.62,ntire:0.38,bogie:0},
  win:{s0:6.4,s1:31.6,pitch:0.533,w:0.24,h:0.33,y:0.35,skip:[[14.2,15.6]]},doors:[[3.4,0.81,1.85,'L'],[33.2,0.81,1.85,'L'],[14.5,0.51,1.01,'O'],[15.25,0.51,1.01,'O']],
  thrust:9.5,vstall:61,vrot:72,dragK:1.4e-4,ceil:12000,cock:3.8},
 b77w:{name:'Boeing 777-300ER',L:73.86,a:3.1,b:3.1,Ln:9.8,Lt:19.5,yc:2.25+3.1,zc:36.0,reg:'N773NG',
  wing:{le:28.6,sweep:33,dih:6,st:[[0,15.0],[3.1,13.6],[10.6,8.3],[30.0,2.6],[32.4,1.0]],t:[0.15,0.15,0.12,0.10,0.10],tip:'raked',y0:-1.7},
  hs:{le:63.4,span:10.8,c0:6.9,c1:2.0,sweep:34,dih:7,y:0.9},vs:{le:57.0,h:10.9,c0:11.6,c1:3.2,sweep:40},
  eng:{type:'ge90',y:9.65,z:22.6,yo:-1.95,R:2.0,len:7.6,fan:3.25,blades:22,flat:false},
  gear:{nose:5.6,main:37.0,track:10.97,tire:0.67,ntire:0.6,bogie:3},
  win:{s0:8.2,s1:66.0,pitch:0.533,w:0.28,h:0.48,y:0.62,skip:[[17.6,19.4],[31.0,33.0],[48.5,50.4]]},doors:[[5.2,1.07,1.88,'L'],[18.0,1.07,1.88,'L'],[31.6,1.07,1.88,'L'],[49.0,1.07,1.88,'L'],[64.6,1.07,1.88,'L']],
  thrust:8.8,vstall:66,vrot:80,dragK:1.25e-4,ceil:13100,cock:6.1}};
// ---------------- fuselage section profile ----------------
function sect(S,s){const L=S.L,a=S.a,b=S.b;let w=a,yt=b,yb=-b;
 if(s<S.Ln){const t=Math.max(0,s/S.Ln);const y0=-0.3*b;const E=(p,e)=>Math.pow(1-Math.pow(1-t,p),e);
  w=a*E(2.3,0.5);yt=y0+(b-y0)*E(2.0,0.52);yb=y0+(-b-y0)*E(1.7,0.55);}
 else if(s>L-S.Lt){const t=(s-(L-S.Lt))/S.Lt;yt=b*(1-0.34*Math.pow(t,1.9));yb=-b+b*1.42*Math.pow(t,1.22);w=a*(1-0.86*Math.pow(t,1.35));}
 return{w,c:(yt+yb)/2,h:(yt-yb)/2};}
function fuseGeo(S){const NR=64,ss=[];for(let i=0;i<=40;i++)ss.push(S.Ln*Math.pow(i/40,1.6));for(let s=S.Ln+0.6;s<S.L-S.Lt;s+=0.8)ss.push(s);for(let i=0;i<=36;i++)ss.push(S.L-S.Lt+S.Lt*i/36);
 const pos=[],uv=[],idx=[];for(const s of ss){const q=sect(S,s);for(let j=0;j<=NR;j++){const f=j/NR*2*PI;pos.push(q.w*Math.sin(f),q.c+q.h*Math.cos(f),s);uv.push(1-s/S.L,1-f/(2*PI));}}
 for(let i=0;i<ss.length-1;i++)for(let j=0;j<NR;j++){const a=i*(NR+1)+j,b=a+NR+1;idx.push(a,b,a+1,b,b+1,a+1);}
 // APU cap
 const q=sect(S,S.L),c0=pos.length/3;pos.push(0,q.c,S.L+0.25);uv.push(0,0.5);const base=(ss.length-1)*(NR+1);for(let j=0;j<NR;j++)idx.push(base+j+1,base+j,c0);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
// ---------------- livery (canvas) ----------------
const NAVY='#0d2347',TEAL='#1aa6b7',GREY='#c4c8cc';
function fuseTex(S){const W=4096,H=1024,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
 const PX=s=>W*(1-s/S.L);const PY=(f)=>H*(f/(2*PI));
 const phi=(s,y,side)=>{const q=sect(S,s);const c=Math.max(-1,Math.min(1,(y-q.c)/q.h));const f=Math.acos(c);return side>0?f:2*PI-f;};
 // base: white top, grey belly with soft split
 x.fillStyle='#f4f5f6';x.fillRect(0,0,W,H);const gb=x.createLinearGradient(0,PY(PI*0.72),0,PY(PI*1.28));gb.addColorStop(0,'#f4f5f6');gb.addColorStop(0.12,GREY);gb.addColorStop(0.88,GREY);gb.addColorStop(1,'#f4f5f6');x.fillStyle=gb;x.fillRect(0,PY(PI*0.72),W,PY(PI*0.56));
 // subtle paint variation
 for(let i=0;i<2500;i++){x.fillStyle=`rgba(0,0,0,${Math.random()*0.02})`;x.fillRect(Math.random()*W,Math.random()*H,8+Math.random()*60,2+Math.random()*6);}
 for(const side of[1,-1]){
  // cheatline: navy + teal stripes below windows, sweeping up at tail
  const band=(y0,y1,col,s0,s1)=>{x.fillStyle=col;x.beginPath();for(let s=s0;s<=s1;s+=0.25){const up=Math.max(0,(s-S.L*0.62)/(S.L*0.38));x.lineTo(PX(s),PY(phi(s,y0+up*up*S.b*1.6,side)));}for(let s=s1;s>=s0;s-=0.25){const up=Math.max(0,(s-S.L*0.62)/(S.L*0.38));x.lineTo(PX(s),PY(phi(s,y1+up*up*S.b*1.6,side)));}x.closePath();x.fill();};
  band(-0.22*S.b,-0.36*S.b,NAVY,S.Ln*0.9,S.L-0.6);band(-0.40*S.b,-0.46*S.b,TEAL,S.Ln*1.0,S.L-0.6);
  // windows
  const wv=S.win;for(let s=wv.s0;s<=wv.s1;s+=wv.pitch){if(wv.skip.some(k=>s>k[0]&&s<k[1]))continue;if(S.doors.some(d=>Math.abs(s-d[0]-d[1]/2)<d[1]/2+0.35))continue;
   const cx=PX(s),cy=PY(phi(s,wv.y,side)),hw=W*wv.w/S.L/2,hh=H*wv.h/(2*PI*S.b)/2;
   x.fillStyle='#9aa0a6';rr(x,cx-hw-2.5,cy-hh-2.5,2*hw+5,2*hh+5,hw*0.9);x.fill();
   const gg=x.createLinearGradient(cx,cy-hh,cx,cy+hh);gg.addColorStop(0,'#0a0f16');gg.addColorStop(0.55,'#1d2a38');gg.addColorStop(1,'#3a4a5c');x.fillStyle=gg;rr(x,cx-hw,cy-hh,2*hw,2*hh,hw*0.85);x.fill();}
  // doors (outline, handle, slide placard) + overwing exits
  for(const [s0,w,h,k] of S.doors){const y0=k==='O'?wv.y-0.45:-0.55*S.b+0.15;const y1=y0+h;const p=[[s0,y0],[s0+w,y0],[s0+w,y1],[s0,y1]].map(([s,y])=>[PX(s),PY(phi(s,y,side))]);
   x.strokeStyle='rgba(40,45,52,0.85)';x.lineWidth=2.4;x.beginPath();p.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.closePath();x.stroke();
   if(k==='O'){const cx=PX(s0+w/2),cy=PY(phi(s0+w/2,wv.y,side)),hw=W*wv.w/S.L/2,hh=H*wv.h/(2*PI*S.b)/2;x.fillStyle='#1b2733';rr(x,cx-hw,cy-hh,2*hw,2*hh,hw*0.8);x.fill();}
   else{const cx=PX(s0+w/2),cy=PY(phi(s0+w/2,y0+h*0.62,side));x.fillStyle='#24303c';rr(x,cx-hw2(W,S,0.33),cy-6,hw2(W,S,0.66),12,4);x.fill();
    const wx=PX(s0+w/2),wy=PY(phi(s0+w/2,y0+h*0.78,side)),hw=W*0.24/S.L/2,hh=H*0.3/(2*PI*S.b)/2;x.fillStyle='#16202a';rr(x,wx-hw,wy-hh,2*hw,2*hh,hw*0.8);x.fill();}}
  // cargo doors (lower lobe)
  for(const s0 of[S.L*0.2,S.L*0.68]){const p=[[s0,-0.62*S.b],[s0+S.b*0.9,-0.62*S.b],[s0+S.b*0.9,-0.18*S.b],[s0,-0.18*S.b]].map(([s,y])=>[PX(s),PY(phi(s,y,side))]);x.strokeStyle='rgba(60,64,70,0.7)';x.lineWidth=2;x.beginPath();p.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.closePath();x.stroke();}
  // titles (left side rotated 180 because UV runs mirrored)
  const txt=(t,s,y,px,col,font)=>{x.save();x.translate(PX(s),PY(phi(s,y,side)));if(side<0)x.rotate(PI);x.scale(1,1.0);x.fillStyle=col;x.font=`${font||'bold'} ${px}px "Helvetica Neue",Arial,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(t,0,0);x.restore();};
  const tp=Math.round(H*0.62*S.b*0.33/(2*PI*S.b)*2.2);
  { // "NEILL AIR" wordmark
   x.save();x.translate(PX(S.L*0.31),PY(phi(S.L*0.31,0.62*S.b,side)));if(side<0)x.rotate(PI);x.font=`900 ${tp}px "Helvetica Neue",Arial,sans-serif`;x.textAlign='center';x.textBaseline='middle';
   const w1=x.measureText('NEILL ').width,w2=x.measureText('AIR').width;x.fillStyle=NAVY;x.fillText('NEILL ',-(w2)/2,0);x.fillStyle=TEAL;x.fillText('AIR',w1/2,0);x.restore();}
  txt(S.reg,S.L*0.80,0.18*S.b,Math.round(tp*0.32),'#22262b','bold');
  txt('NO STEP',S.L*0.02+S.Ln,-0.8*S.b,10,'#555','');
  // panel seams (frames) and stringer lines
  x.strokeStyle='rgba(0,0,0,0.06)';x.lineWidth=1.2;for(let s=1;s<S.L;s+=S.L>60?2.1:1.6){x.beginPath();x.moveTo(PX(s),side>0?0:H/2);x.lineTo(PX(s),side>0?H/2:H);x.stroke();}
  for(const y of[0.85,0.5,-0.05,-0.7]){x.beginPath();for(let s=S.Ln;s<S.L-S.Lt;s+=1)x.lineTo(PX(s),PY(phi(s,y*S.b,side)));x.stroke();}
 }
 // grime: streaks aft of doors/drains, belly soot, APU soot, lower-lobe weathering
 for(const side of[1,-1]){for(const [s0] of S.doors){for(let k=0;k<6;k++){const sx=s0+Math.random()*1.2,y=-0.6*S.b+Math.random()*0.3;const g=x.createLinearGradient(PX(sx),0,PX(sx+2.5+Math.random()*3),0);g.addColorStop(0,'rgba(60,55,50,0.10)');g.addColorStop(1,'rgba(60,55,50,0)');x.fillStyle=g;const yy=PY(phi(sx,y,side));x.fillRect(Math.min(PX(sx),PX(sx+6)),yy-3,Math.abs(PX(sx)-PX(sx+6)),6);}}}
 {const g=x.createLinearGradient(0,PY(PI*0.82),0,PY(PI*1.18));g.addColorStop(0,'rgba(70,64,58,0)');g.addColorStop(0.5,'rgba(70,64,58,0.22)');g.addColorStop(1,'rgba(70,64,58,0)');x.fillStyle=g;x.fillRect(0,PY(PI*0.82),PX(S.Ln),PY(PI*0.36));}
 {const g=x.createLinearGradient(PX(S.L-3),0,PX(S.L),0);g.addColorStop(0,'rgba(30,28,26,0)');g.addColorStop(1,'rgba(30,28,26,0.55)');x.fillStyle=g;x.fillRect(PX(S.L),0,PX(S.L-3)-PX(S.L),H);}
 for(let i=0;i<400;i++){x.fillStyle=`rgba(90,85,78,${Math.random()*0.05})`;const yy=PY(PI*(0.6+Math.random()*0.8));x.fillRect(Math.random()*W,yy,30+Math.random()*120,1+Math.random()*3);}
 // cockpit windshield panes painted in (s,phi) space: front/side/aft per side
 const ck=S.Ln*0.5,cs=S.Ln/6.2*1.2;
 for(const side of[1,-1]){const P=(s,f)=>[PX(s),PY(side>0?f:2*PI-f)];
  const panes=[[[ck-0.10*cs,0.06],[ck+0.18*cs,0.07],[ck+0.30*cs,0.62],[ck-0.32*cs,0.66]],
               [[ck+0.30*cs,0.68],[ck+0.62*cs,0.66],[ck+0.88*cs,1.04],[ck+0.02*cs,1.12]],
               [[ck+0.72*cs,0.70],[ck+1.20*cs,0.72],[ck+1.22*cs,1.02],[ck+1.00*cs,1.05]]];
  S._panes=S._panes||[];S._panes.push(...panes.map(pn=>pn.map(q=>[q[0],side>0?q[1]:2*PI-q[1]])));
  for(const pn of panes){x.beginPath();pn.forEach((q,i)=>{const p=P(q[0],q[1]);i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]);});x.closePath();x.fillStyle='#0b1118';x.fill();x.lineWidth=7;x.strokeStyle='#22272d';x.stroke();}
  // nose radome seam + black anti-glare
  x.strokeStyle='rgba(0,0,0,0.25)';x.lineWidth=2;x.beginPath();x.moveTo(PX(S.Ln*0.24),0);x.lineTo(PX(S.Ln*0.24),H);x.stroke();}
 // ---- gmissiles-style PBR layers: roughness + bump (panel seams, lap joints, rivet rows, stencils, weathering) ----
 const rc=document.createElement('canvas');rc.width=W/2;rc.height=H/2;const r=rc.getContext('2d');const bc=document.createElement('canvas');bc.width=W;bc.height=H;const b=bc.getContext('2d');
 r.fillStyle='#7a7a7a';r.fillRect(0,0,W/2,H/2);b.fillStyle='#808080';b.fillRect(0,0,W,H);
 for(let i=0;i<1500;i++){const v=110+Math.random()*40|0;r.fillStyle=`rgb(${v},${v},${v})`;r.globalAlpha=0.25;r.fillRect(Math.random()*W/2,Math.random()*H/2,10+Math.random()*80,2+Math.random()*10);}r.globalAlpha=1;
 const frameStep=S.L>60?0.533*4:0.508*4;
 for(const side of[1,-1]){
  // circumferential frames / butt joints with double rivet rows
  for(let s=S.Ln*0.6;s<S.L-1;s+=frameStep){const pts=[];for(let f=0.08;f<=PI-0.08;f+=0.02){const ff=side>0?f:2*PI-f;pts.push([PX(s),PY(ff)]);}
   b.strokeStyle='#5a5a5a';b.lineWidth=2;b.beginPath();pts.forEach((q,i)=>i?b.lineTo(q[0],q[1]):b.moveTo(q[0],q[1]));b.stroke();
   x.strokeStyle='rgba(0,0,0,0.07)';x.lineWidth=1.2;x.beginPath();pts.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.stroke();
   for(let i=0;i<pts.length;i+=1){for(const dx of[-4,4]){b.fillStyle='#9a9a9a';b.fillRect(pts[i][0]+dx-1,pts[i][1]-1,2.2,2.2);x.fillStyle='rgba(0,0,0,0.10)';x.fillRect(pts[i][0]+dx-0.8,pts[i][1]-0.8,1.6,1.6);}}}
  // longitudinal lap joints with rivet rows
  for(const y of[0.92,0.7,0.48,0.08,-0.3,-0.62,-0.86]){const pts=[];for(let s=S.Ln*0.7;s<S.L-S.Lt*0.3;s+=0.12)pts.push([PX(s),PY(phi(s,y*S.b,side))]);
   b.strokeStyle='#606060';b.lineWidth=1.6;b.beginPath();pts.forEach((q,i)=>i?b.lineTo(q[0],q[1]):b.moveTo(q[0],q[1]));b.stroke();
   for(let i=0;i<pts.length;i+=2){b.fillStyle='#a0a0a0';b.fillRect(pts[i][0]-1,pts[i][1]+3,2,2);x.fillStyle='rgba(0,0,0,0.08)';x.fillRect(pts[i][0]-0.8,pts[i][1]+3,1.6,1.6);}}
  // door surrounds: deep seams in bump, darker roughness at handles
  for(const [s0,w,h,k] of S.doors){const y0=k==='O'?S.win.y-0.45:-0.55*S.b+0.15;const p=[[s0,y0],[s0+w,y0],[s0+w,y0+h],[s0,y0+h]].map(([sv,y])=>[PX(sv),PY(phi(sv,y,side))]);
   b.strokeStyle='#303030';b.lineWidth=4;b.beginPath();p.forEach((q,i)=>i?b.lineTo(q[0],q[1]):b.moveTo(q[0],q[1]));b.closePath();b.stroke();
   // stencils: exit / rescue markings next to doors
   x.save();x.translate(PX(s0+w/2),PY(phi(s0+w/2,y0+h+0.18,side)));if(side<0)x.rotate(PI);x.fillStyle='#b01818';x.font='bold 11px Arial';x.textAlign='center';x.fillText(k==='O'?'EMERGENCY EXIT':'EXIT',0,0);x.restore();
   x.save();x.translate(PX(s0-0.35),PY(phi(s0-0.35,y0+h*0.5,side)));if(side<0)x.rotate(PI);x.strokeStyle='#d26a00';x.lineWidth=2;x.strokeRect(-9,-9,18,18);x.fillStyle='#d26a00';x.font='bold 7px Arial';x.textAlign='center';x.fillText('PUSH',0,3);x.restore();}
  // windows: glossy in roughness map, recessed in bump
  const wv=S.win;for(let sv=wv.s0;sv<=wv.s1;sv+=wv.pitch){if(wv.skip.some(k=>sv>k[0]&&sv<k[1]))continue;if(S.doors.some(d=>Math.abs(sv-d[0]-d[1]/2)<d[1]/2+0.35))continue;
   const cx=PX(sv),cy=PY(phi(sv,wv.y,side)),hw=W*wv.w/S.L/2,hh=H*wv.h/(2*PI*S.b)/2;r.fillStyle='#141414';r.fillRect(cx/2-hw/2,cy/2-hh/2,hw,hh);b.fillStyle='#4a4a4a';rr(b,cx-hw-2,cy-hh-2,2*hw+4,2*hh+4,hw);b.fill();}
  // small stencils: static ports, drain masts, ground power, "NO STEP"
  const st=(t,sv,y,c,px)=>{x.save();x.translate(PX(sv),PY(phi(sv,y,side)));if(side<0)x.rotate(PI);x.fillStyle=c;x.font=`bold ${px}px Arial`;x.textAlign='center';x.fillText(t,0,0);x.restore();};
  st('STATIC PORT - KEEP CLEAN',S.Ln*0.9,-0.1*S.b,'#a01010',8);st('DO NOT PAINT',S.Ln*0.95,-0.18*S.b,'#a01010',7);st('GRD PWR',S.Ln*1.1,-0.75*S.b,'#333',8);st('CARGO',S.L*0.2+S.b*0.45,-0.4*S.b,'#333',9);st('CARGO',S.L*0.68+S.b*0.45,-0.4*S.b,'#333',9);
  st('NO STEP',S.L*0.5,-0.95*S.b,'#555',8);st('JACK POINT',S.L*0.45,-0.9*S.b,'#a01010',7);
 }
 // weathering: exhaust/hydraulic streaks on lower aft fuselage + belly (rougher)
 for(let i=0;i<220;i++){const sv=S.L*(0.35+Math.random()*0.6),y=-S.b*(0.3+Math.random()*0.65),side=Math.random()<0.5?1:-1;const X0=PX(sv),Y0=PY(phi(sv,y,side)),len=40+Math.random()*180;
  const g=x.createLinearGradient(X0,0,X0-len,0);g.addColorStop(0,'rgba(70,62,52,0.09)');g.addColorStop(1,'rgba(70,62,52,0)');x.fillStyle=g;x.fillRect(X0-len,Y0-1.5,len,3);r.fillStyle='rgba(200,200,200,0.15)';r.fillRect((X0-len)/2,Y0/2-1,len/2,2);}
 const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;t.wrapT=T.RepeatWrapping;
 const tr=new T.CanvasTexture(rc);tr.colorSpace=T.NoColorSpace;tr.anisotropy=8;const tb=new T.CanvasTexture(bc);tb.colorSpace=T.NoColorSpace;tb.anisotropy=8;
 return{map:t,rough:tr,bump:tb};}
function hw2(W,S,m){return W*m/S.L;}
function rr(x,X,Y,w,h,r){r=Math.min(r,w/2,h/2);x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath();}
let _tailTex,_wingTex,_spinTex,_wingTexM;
function tailTex(){if(_tailTex)return _tailTex;const N=1024,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d');
 // u chordwise (0 LE ->1 TE), v span (0 root -> 1 tip). canvas x=u, y=(1-v)
 const g=x.createLinearGradient(0,N,N,0);g.addColorStop(0,'#0a1c3c');g.addColorStop(1,'#123468');x.fillStyle=g;x.fillRect(0,0,N,N);
 // emblem: stylised teal/white swoosh + star
 x.save();x.translate(N*0.52,N*0.5);x.rotate(-0.35);x.fillStyle=TEAL;x.beginPath();x.ellipse(0,0,N*0.36,N*0.12,0,0,2*PI);x.fill();x.fillStyle='#0f2a55';x.beginPath();x.ellipse(N*0.05,-N*0.04,N*0.34,N*0.1,0,0,2*PI);x.fill();x.restore();
 x.fillStyle='#ffffff';x.beginPath();for(let i=0;i<10;i++){const r=i%2?N*0.05:N*0.13,a=-PI/2+i*PI/5;x.lineTo(N*0.5+r*Math.cos(a),N*0.47+r*Math.sin(a));}x.closePath();x.fill();
 x.strokeStyle='rgba(0,0,0,0.18)';x.lineWidth=2;x.beginPath();x.moveTo(N*0.72,0);x.lineTo(N*0.72,N);x.stroke(); // rudder hinge line
 const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return _tailTex=t;}
function wingTex(mir){if(!mir&&_wingTex)return _wingTex;if(mir&&_wingTexM)return _wingTexM;const N=1024,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d');
 x.fillStyle='#c9cdd2';x.fillRect(0,0,N,N);for(let i=0;i<900;i++){x.fillStyle=`rgba(0,0,0,${Math.random()*0.03})`;x.fillRect(Math.random()*N,Math.random()*N,4+Math.random()*30,2+Math.random()*30);}
 // u: 0..0.5 lower surface TE->LE, 0.5..1 upper LE->TE ; v span
 x.strokeStyle='rgba(30,34,40,0.45)';x.lineWidth=2;
 const U=u=>u*N;for(const u of[0.5+0.07,0.5+0.16,0.5-0.07]){x.beginPath();x.moveTo(U(u),0);x.lineTo(U(u),N);x.stroke();} // slat / spar lines
 for(let v=0.04;v<1;v+=0.055){x.beginPath();x.moveTo(U(0.5),N*v);x.lineTo(U(1),N*v);x.globalAlpha=0.35;x.stroke();x.globalAlpha=1;}
 // spoiler panels (upper, aft of rear spar)
 x.fillStyle='rgba(150,155,160,0.55)';for(let i=0;i<7;i++){const v0=0.2+i*0.075;x.fillRect(U(0.84),N*(1-v0-0.07),U(0.08),N*0.068);x.strokeRect(U(0.84),N*(1-v0-0.07),U(0.08),N*0.068);}
 // walkway outline + "NO STEP" hint
 x.strokeStyle='rgba(20,20,20,0.6)';x.lineWidth=3;x.strokeRect(U(0.62),N*0.82,U(0.22),N*0.15);
 // dark leading-edge erosion strip
 const g=x.createLinearGradient(U(0.47),0,U(0.53),0);g.addColorStop(0,'rgba(120,124,128,0)');g.addColorStop(0.5,'rgba(110,114,118,0.6)');g.addColorStop(1,'rgba(120,124,128,0)');x.fillStyle=g;x.fillRect(U(0.47),0,U(0.06),N);
 for(let i=0;i<120;i++){const g=x.createLinearGradient(U(0.7),0,U(1),0);g.addColorStop(0,'rgba(50,45,40,0)');g.addColorStop(1,'rgba(50,45,40,0.12)');x.fillStyle=g;x.fillRect(U(0.7),Math.random()*N,U(0.3),2+Math.random()*8);}
 for(let i=0;i<60;i++){x.fillStyle='rgba(40,40,40,0.5)';const v=Math.random();x.fillRect(U(0.5+0.03+Math.random()*0.4),N*v,3,3);} // fasteners / fuel caps
 // bump + roughness: skin panels, spar/rib rivet rows, fuel-tank access panels
 const bc=document.createElement('canvas');bc.width=bc.height=N;const b=bc.getContext('2d');b.fillStyle='#808080';b.fillRect(0,0,N,N);
 const rc=document.createElement('canvas');rc.width=rc.height=N/2;const r=rc.getContext('2d');r.fillStyle='#8c8c8c';r.fillRect(0,0,N/2,N/2);for(let i=0;i<500;i++){r.fillStyle=`rgba(${Math.random()<0.5?60:200},0,0,0)`;const v=100+Math.random()*80|0;r.fillStyle=`rgba(${v},${v},${v},0.3)`;r.fillRect(Math.random()*N/2,Math.random()*N/2,6+Math.random()*30,2+Math.random()*20);}
 for(const u of[0.07,0.16,0.3,0.45,0.55,0.7,0.84,0.93]){b.strokeStyle='#5a5a5a';b.lineWidth=2;b.beginPath();b.moveTo(U(u),0);b.lineTo(U(u),N);b.stroke();for(let y=0;y<N;y+=6){b.fillStyle='#a6a6a6';b.fillRect(U(u)+3,y,2,2);b.fillRect(U(u)-5,y,2,2);x.fillStyle='rgba(0,0,0,0.07)';x.fillRect(U(u)+3,y,1.5,1.5);}}
 for(let v=0.03;v<1;v+=0.045){b.strokeStyle='#666';b.lineWidth=1.5;b.beginPath();b.moveTo(0,N*v);b.lineTo(N,N*v);b.stroke();for(let u=0;u<N;u+=7){b.fillStyle='#a0a0a0';b.fillRect(u,N*v+3,1.6,1.6);}}
 for(let i=0;i<10;i++){const u=0.2+((i*37)%10)/10*0.18,v=0.1+i*0.08;for(const off of[0,0.5]){b.strokeStyle='#404040';b.lineWidth=2;b.beginPath();b.ellipse(U(u+off*0),N*v,10,6,0,0,2*PI);b.stroke();}}
 for(const v of[0.9,0.5]){x.save();x.fillStyle='#202020';x.font='bold 12px Arial';x.textAlign='center';x.textBaseline='middle';x.translate(U(0.73),N*v);if(mir)x.scale(1,-1);x.fillText('NO STEP',0,0);x.restore();} // left wing geometry is X-mirrored -> flip glyphs so stencil reads correctly
 const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;const tb=new T.CanvasTexture(bc);tb.colorSpace=T.NoColorSpace;tb.anisotropy=8;const tr=new T.CanvasTexture(rc);tr.colorSpace=T.NoColorSpace;
 t.userData={bump:tb,rough:tr};return mir?(_wingTexM=t):(_wingTex=t);}
let _cowlTex={};function cowlTex(base){if(_cowlTex[base])return _cowlTex[base];const W=1024,H=512,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
 // lathe UV: u around circumference, v along profile (0 inlet -> 1 aft)
 x.fillStyle=base;x.fillRect(0,0,W,H);for(let i=0;i<800;i++){x.fillStyle=`rgba(0,0,0,${Math.random()*0.04})`;x.fillRect(Math.random()*W,Math.random()*H,6+Math.random()*40,2+Math.random()*6);}
 const bc=document.createElement('canvas');bc.width=W;bc.height=H;const b=bc.getContext('2d');b.fillStyle='#808080';b.fillRect(0,0,W,H);
 for(const v of[0.18,0.42,0.62]){x.strokeStyle='rgba(0,0,0,0.35)';x.lineWidth=2;x.beginPath();x.moveTo(0,H*v);x.lineTo(W,H*v);x.stroke();b.strokeStyle='#404040';b.lineWidth=3;b.beginPath();b.moveTo(0,H*v);b.lineTo(W,H*v);b.stroke();for(let u=0;u<W;u+=8){b.fillStyle='#b0b0b0';b.fillRect(u,H*v+5,2,2);}}
 for(const u of[0.25,0.75]){x.strokeStyle='rgba(0,0,0,0.3)';x.beginPath();x.moveTo(W*u,H*0.18);x.lineTo(W*u,H*0.62);x.stroke();b.strokeStyle='#404040';b.beginPath();b.moveTo(W*u,H*0.18);b.lineTo(W*u,H*0.62);b.stroke();}
 for(let i=0;i<4;i++){x.fillStyle='rgba(20,20,20,0.6)';x.fillRect(W*0.73-10,H*(0.25+i*0.09),20,10);b.fillStyle='#303030';b.fillRect(W*0.73-10,H*(0.25+i*0.09),20,10);} // fan-cowl latches
 for(const u of[0.0,0.5]){x.save();x.translate(W*(u+0.25),H*0.1);x.fillStyle='#c41a1a';x.fillRect(-70,-12,140,24);x.fillStyle='#fff';x.font='bold 15px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('DANGER  INLET',0,0);x.restore();}
 const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;const tb=new T.CanvasTexture(bc);tb.colorSpace=T.NoColorSpace;return _cowlTex[base]={map:t,bump:tb};}
function spinTex(){if(_spinTex)return _spinTex;const cv=document.createElement('canvas');cv.width=256;cv.height=256;const x=cv.getContext('2d');x.fillStyle='#202327';x.fillRect(0,0,256,256);x.strokeStyle='#f2f2f2';x.lineWidth=14;x.beginPath();x.moveTo(0,256);x.bezierCurveTo(80,170,140,90,256,0);x.stroke();
 const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;return _spinTex=t;}
// ---------------- materials (PBR) ----------------
const MC={};const M=(k,f)=>MC[k]||(MC[k]=f());
const mPaint=S=>M('paint'+S.name,()=>(F=>new T.MeshPhysicalMaterial({map:F.map,roughnessMap:F.rough,bumpMap:F.bump,bumpScale:0.6,roughness:1.0,metalness:0.02,clearcoat:0.3,clearcoatRoughness:0.3,envMapIntensity:0.5,color:0xe9eaeb}))(fuseTex(S)));
const mWing=(mir)=>M(mir?'wingM':'wing',()=>(t=>new T.MeshStandardMaterial({map:t,bumpMap:t.userData.bump,bumpScale:0.5,roughnessMap:t.userData.rough,metalness:0.3,roughness:1.0,envMapIntensity:0.6}))(wingTex(mir)));
const mTail=()=>M('tail',()=>new T.MeshPhysicalMaterial({map:tailTex(),roughness:0.42,metalness:0.03,clearcoat:0.35,clearcoatRoughness:0.25,envMapIntensity:0.55}));
const mCowl=()=>M('cowl',()=>(c=>new T.MeshPhysicalMaterial({map:c.map,bumpMap:c.bump,bumpScale:0.5,color:0xffffff,roughness:0.38,metalness:0.08,clearcoat:0.4,clearcoatRoughness:0.25,envMapIntensity:0.6}))(cowlTex('#10264d')));
const mWhite=()=>M('white',()=>(c=>new T.MeshPhysicalMaterial({map:c.map,bumpMap:c.bump,bumpScale:0.5,color:0xffffff,roughness:0.45,metalness:0.03,clearcoat:0.3,envMapIntensity:0.55}))(cowlTex('#e4e6e8')));
const mLip=()=>M('lip',()=>new T.MeshStandardMaterial({color:0xcfd2d5,metalness:1,roughness:0.3,envMapIntensity:0.7}));
const mDark=()=>M('dark',()=>new T.MeshStandardMaterial({color:0x17181a,metalness:0.3,roughness:0.7,side:T.DoubleSide}));
const mHot=()=>M('hot',()=>new T.MeshStandardMaterial({color:0x6f6152,metalness:0.85,roughness:0.5,side:T.DoubleSide}));
const mTi=()=>M('ti',()=>new T.MeshStandardMaterial({color:0xa6acb3,metalness:1,roughness:0.28,side:T.DoubleSide}));
const mComp=()=>M('comp',()=>new T.MeshStandardMaterial({color:0x2a2d32,metalness:0.35,roughness:0.38,side:T.DoubleSide}));
const mSpin=()=>M('spin',()=>new T.MeshStandardMaterial({map:spinTex(),metalness:0.5,roughness:0.3}));
const mTire=()=>M('tire',()=>new T.MeshStandardMaterial({color:0x121212,roughness:0.92,metalness:0}));
const mHub=()=>M('hub',()=>new T.MeshStandardMaterial({color:0xb9bcc0,metalness:1,roughness:0.32}));
const mChrome=()=>M('chrome',()=>new T.MeshStandardMaterial({color:0xe8e8e8,metalness:1,roughness:0.1}));
const mGearP=()=>M('gearp',()=>new T.MeshStandardMaterial({color:0xd6d8da,metalness:0.3,roughness:0.45}));
const mGrey=()=>M('grey',()=>new T.MeshStandardMaterial({color:0x9ca1a6,metalness:0.5,roughness:0.45}));
const mBlack=()=>M('black',()=>new T.MeshStandardMaterial({color:0x0c0d0f,metalness:0.2,roughness:0.6}));
const mLight=c=>M('l'+c,()=>new T.MeshBasicMaterial({color:c}));
// ---------------- merge helper (fewer draw calls for iPhone) ----------------
function Kit(){const by=new Map();return{add(g,m,mx){g=g.index?g:indexify(g);if(mx)g.applyMatrix4(mx);if(!g.attributes.uv){g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));}if(!g.attributes.normal)g.computeVertexNormals();(by.get(m)||by.set(m,[]).get(m)).push(g);},
 build(parent){for(const [m,gs] of by){const mg=merge(gs);const me=new T.Mesh(mg,m);me.castShadow=me.receiveShadow=true;parent.add(me);}return parent;}};}
function indexify(g){const n=g.attributes.position.count;const a=[];for(let i=0;i<n;i++)a.push(i);g.setIndex(a);return g;}
function merge(gs){let nv=0,ni=0;for(const g of gs){nv+=g.attributes.position.count;ni+=g.index.count;}const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2),I=new Uint32Array(ni);let ov=0,oi=0;
 for(const g of gs){const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;for(let i=0;i<p.count;i++){P[(ov+i)*3]=p.getX(i);P[(ov+i)*3+1]=p.getY(i);P[(ov+i)*3+2]=p.getZ(i);N[(ov+i)*3]=n.getX(i);N[(ov+i)*3+1]=n.getY(i);N[(ov+i)*3+2]=n.getZ(i);U[(ov+i)*2]=u.getX(i);U[(ov+i)*2+1]=u.getY(i);}
  const ix=g.index;for(let i=0;i<ix.count;i++)I[oi+i]=ix.getX(i)+ov;ov+=p.count;oi+=ix.count;}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(P,3));g.setAttribute('normal',new T.BufferAttribute(N,3));g.setAttribute('uv',new T.BufferAttribute(U,2));g.setIndex(new T.BufferAttribute(I,1));g.computeBoundingSphere();return g;}
const MX=(x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz));
// ---------------- lofted airfoil surfaces ----------------
// station: {p:[x,y], ang, z (LE, +aft), c, t}. Surface point: x=p0-sin(ang)*th, y=p1+cos(ang)*th, z=z+xc*c. chord range [x0,x1]
function foil(xc,t,m=0.02){const yt=5*t*(0.2969*Math.sqrt(xc)-0.126*xc-0.3516*xc*xc+0.2843*xc**3-0.1036*xc**4);const yc=xc<0.4?m/0.16*(0.8*xc-xc*xc):m/0.36*(0.2+0.8*xc-xc*xc);return[yc+yt,yc-yt];}
function loft(st,x0=0,x1=1,NP=18,cap=true,camber=0.02){const pos=[],uv=[],idx=[];const xs=[];for(let i=0;i<=NP;i++){const k=i/NP;xs.push(x0+(x1-x0)*(0.5-0.5*Math.cos(PI*k)));}
 const ring=[];for(let i=NP;i>=0;i--)ring.push([xs[i],1,0.5*(1-i/NP)]);for(let i=1;i<=NP;i++)ring.push([xs[i],0,0.5+0.5*i/NP]); // lower TE->LE (wait: first loop upper? see below)
 // ring: i over lower surface TE->LE (u 0..0.5) then upper LE->TE (u 0.5..1)
 const RN=ring.length;st.forEach((S,si)=>{for(const [xc,up,u] of ring){const f=foil(Math.max(xc,1e-4),S.t,camber);const th=(up?f[0]:f[1])*S.c;const sa=Math.sin(S.ang||0),ca=Math.cos(S.ang||0);
  pos.push(S.p[0]-sa*th,S.p[1]+ca*th,S.z+xc*S.c);uv.push(u,S.v!=null?S.v:si/(st.length-1));}});
 // fix: ring first half should be lower surface; flip flag
 for(let si=0;si<st.length;si++)for(let k=0;k<=NP;k++){} 
 for(let si=0;si<st.length-1;si++)for(let k=0;k<RN-1;k++){const a=si*RN+k,b=a+RN;idx.push(a,a+1,b,a+1,b+1,b);}
 const g=new T.BufferGeometry();
 if(cap){const last=(st.length-1)*RN;for(let k=1;k<NP;k++){idx.push(last+k,last+k+1,last+RN-1-k);idx.push(last+k+1,last+RN-2-k,last+RN-1-k);}
  const f0=0;for(let k=1;k<NP;k++){idx.push(f0+k,f0+RN-1-k,f0+k+1);idx.push(f0+k+1,f0+RN-1-k,f0+RN-2-k);}}
 if(x0>0.001){for(let si=0;si<st.length-1;si++){const a=si*RN+NP,b=a+RN;}} // front face of a flap hidden inside wing
 g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
function mirrorX(g){g=g.clone();g.applyMatrix4(new T.Matrix4().makeScale(-1,1,1));const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t;}g.index.needsUpdate=true;g.computeVertexNormals();return g;}
function flipW(g){const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t;}g.index.needsUpdate=true;g.computeVertexNormals();return g;}
// wing stations for one side (right, +x)
function wingStations(S,W){const z0=W.le-S.zc,yb=S.yc-2.0+W.y0,tS=Math.tan(W.sweep*PI/180),tD=Math.tan(W.dih*PI/180);const st=[];const span=W.st[W.st.length-1][0];
 const z1=s=>z0+s*tS; // LE line
 W.st.forEach(([s,c],i)=>{st.push({p:[s,yb+s*tD],ang:0,z:z1(s)+(i===0?-0.4:0),c:c+(i===0?0.4:0),t:W.t[i],v:s/span});});
 if(W.tip==='raked'){const l=st[st.length-1];st[st.length-1]={...l,v:0.95};st.push({p:[l.p[0]+0.15,l.p[1]+0.02],ang:0,z:l.z+l.c*0.92,c:0.22,t:0.08,v:1});}
 if(W.tip==='blended'||W.tip==='sharklet'){const l=st[st.length-1];const r=W.tip==='blended'?0.75:0.45;const n=6;
  for(let k=1;k<=n;k++){const a=k/n*(PI/2-0.22);st.push({p:[l.p[0]+r*Math.sin(a),l.p[1]+r*(1-Math.cos(a))],ang:a,z:l.z+k/n*l.c*0.35,c:l.c*(1-k/n*0.25),t:0.1,v:1});}
  const q=st[st.length-1],a=PI/2-0.22;const h=W.wl-r;st.push({p:[q.p[0]+Math.sin(0.22)*h,q.p[1]+Math.cos(0.22)*h],ang:a,z:q.z+h*(W.tip==='blended'?0.95:0.75),c:q.c*0.42,t:0.09,v:1});}
 return st;}
function lerpSt(st,f){ // station at span fraction of the main (straight) panel
 const n=st.length;let i=0;while(i<n-2&&st[i+1].v<f)i++;const a=st[i],b=st[i+1];const k=(f-a.v)/Math.max(1e-6,b.v-a.v);
 return{p:[a.p[0]+(b.p[0]-a.p[0])*k,a.p[1]+(b.p[1]-a.p[1])*k],ang:0,z:a.z+(b.z-a.z)*k,c:a.c+(b.c-a.c)*k,t:a.t+(b.t-a.t)*k,v:f};}
// ---------------- engines ----------------
function lathePts(pts,seg,flat){const g=new T.LatheGeometry(pts.map(p=>new T.Vector2(Math.max(p[0],1e-3),p[1])),seg);g.rotateX(PI/2); // y->z (aft)
 if(flat){const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),r=Math.hypot(p.getX(i),y);if(y<-0.45*r&&r>0.5){p.setY(i,-0.45*r-(-y-0.45*r)*0.55);}}g.computeVertexNormals();}
 // lathe of rotateX(PI/2): (x, y=r*..., z=prof y). original lathe around Y with profile y->height; after rotate, height -> +z? check: rotateX(+90) maps y->z
 return g;}
function engine(S,lite){const E=S.eng,R=E.R,Ln=E.len,g=new T.Group(),k=Kit();const rf=E.fan/2;
 const ge=E.type==='ge90';
 // nacelle outer cowl (inlet lip -> fan cowl -> thrust-reverser sleeve)
 const cowlLen=Ln*(ge?0.62:0.6);
 const outer=[[R*0.86,0],[R*0.93,0.03*Ln],[R*0.99,0.09*Ln],[R*1.0,0.2*Ln],[R*0.99,0.38*Ln],[R*0.94,cowlLen*0.92],[R*0.88,cowlLen]];
 const lip=[[R*0.80,0.06*Ln],[R*0.80,0.012*Ln],[R*0.83,0.0],[R*0.86,0]];
 const inner=[[rf*1.02,0.2*Ln],[rf*1.04,0.1*Ln],[R*0.82,0.06*Ln]];
 k.add(lathePts(outer,64,E.flat),ge?mWhite():mCowl());k.add(lathePts(lip,64,E.flat),mLip());k.add(lathePts(inner,48,false),mDark());
 // reverser sleeve seam rings
 for(const zz of[0.3,0.43])k.add(new T.TorusGeometry(R*(E.flat?0.99:0.995),0.012,4,64),mBlack(),MX(0,0,zz*Ln));
 // core cowl, nozzle, plug
 const core=[[R*0.62,cowlLen-0.25],[R*0.64,cowlLen],[R*0.6,Ln*0.75],[R*0.5,Ln*0.86],[R*0.44,Ln*0.9]];
 k.add(lathePts(core,48,false),mGrey());
 k.add(lathePts([[R*0.44,Ln*0.9],[R*0.42,Ln*0.92],[R*0.36,Ln*0.92]],40,false),mHot());
 k.add(lathePts([[R*0.36,Ln*0.86],[R*0.32,Ln*0.92],[R*0.2,Ln*0.99],[0.02,Ln*1.04]],32,false),mHot());
 k.add(lathePts([[R*0.86,cowlLen-0.05],[R*0.66,cowlLen-0.05]],48,false),mBlack()); // fan exit annulus (dark)
 // pylon
 const py=new T.Shape();const pz0=Ln*0.25,pz1=Ln+(ge?3.8:2.4),h=-E.yo+(ge?0.2:0.4);py.moveTo(pz0,R*0.92);py.lineTo(pz1,h);py.lineTo(Ln*0.98,R*0.5);py.lineTo(Ln*0.35,R*0.8);py.closePath();
 const pg=new T.ExtrudeGeometry(py,{depth:ge?0.55:0.36,bevelEnabled:true,bevelThickness:0.08,bevelSize:0.08,bevelSegments:2,curveSegments:2});pg.translate(0,0,-(ge?0.275:0.18));pg.rotateY(-PI/2); // shape x->z(aft), y up
 k.add(pg,mWhite(),MX(0,0,0));
 k.build(g);
 // fan (rotating): hub, spinner, blades
 const fan=new T.Group();const fk=Kit();const zf=0.2*Ln;
 fk.add(new T.ConeGeometry(rf*0.36,rf*(ge?0.62:0.5),32,1),mSpin(),MX(0,0,zf-rf*(ge?0.28:0.22),-PI/2,0,0));
 const bladeM=ge?mComp():mTi();const nb=E.blades;
 for(let i=0;i<nb;i++){const bg=new T.BoxGeometry(ge?0.42*rf:0.24*rf,rf*0.66,0.02,1,8,1);bg.translate(0,rf*0.35+rf*0.33,0);const p=bg.attributes.position;
  for(let j=0;j<p.count;j++){const r=p.getY(j),tw=0.95-0.55*(r/rf);const x=p.getX(j),z=p.getZ(j);const ca=Math.cos(tw),sa=Math.sin(tw);let nx=x*ca-z*sa,nz=x*sa+z*ca;if(ge)nx+=Math.pow((r-rf*0.35)/rf,2)*rf*0.35; p.setX(j,nx);p.setZ(j,nz);}
  bg.computeVertexNormals();fk.add(bg,bladeM,MX(0,0,zf,0,0,i/nb*2*PI));}
 fk.add(new T.CylinderGeometry(rf*0.36,rf*0.36,0.3,32,1),mDark(),MX(0,0,zf+0.1,PI/2,0,0));
 fk.build(fan);fan.userData.fan=true;g.add(fan);g.userData.fan=fan;
 // dark backdrop behind fan so inlet never looks see-through
 const bd=new T.Mesh(new T.CircleGeometry(rf*1.02,48),mDark());bd.position.z=zf+0.35;g.add(bd);
 return g;}
// ---------------- landing gear ----------------
function wheel(k,r,w,x,y,z){k.add(new T.CylinderGeometry(r,r,w,32,1),mTire(),MX(x,y,z,0,0,PI/2));k.add(new T.TorusGeometry(r*0.97,w*0.12,8,32),mTire(),MX(x+w*0.5*Math.sign(x||1),y,z,0,PI/2,0));
 k.add(new T.CylinderGeometry(r*0.6,r*0.6,w+0.02,24,1),mHub(),MX(x,y,z,0,0,PI/2));k.add(new T.CylinderGeometry(r*0.18,r*0.18,w+0.08,12,1),mChrome(),MX(x,y,z,0,0,PI/2));}
function gearSet(S){const G=S.gear,yb=S.yc-2.0,out=[];const gy=-2.0; // ground
 // nose gear
 {const g=new T.Group(),k=Kit();const piv=yb-S.b*0.75;g.position.set(0,piv,G.nose-S.zc);const L=piv-gy-G.ntire;
  k.add(new T.CylinderGeometry(0.11,0.13,L*0.6,12),mGearP(),MX(0,-L*0.3,0));k.add(new T.CylinderGeometry(0.075,0.075,L*0.45,12),mChrome(),MX(0,-L*0.72,0));
  k.add(new T.BoxGeometry(0.06,L*0.35,0.25),mGearP(),MX(0,-L*0.6,-0.18,0.25,0,0));k.add(new T.BoxGeometry(0.5,0.12,0.18),mGearP(),MX(0,-L,0));
  wheel(k,G.ntire,0.24,0.24,-L,0);wheel(k,G.ntire,0.24,-0.24,-L,0);k.add(new T.CylinderGeometry(0.035,0.035,L*0.8,6),mGrey(),MX(0,-L*0.45,0.45,-0.45,0,0));k.build(g);g.userData.fold=[-1,0];out.push(g);}
 for(const sx of[1,-1]){const g=new T.Group(),k=Kit();const piv=yb-S.b*0.25;g.position.set(sx*G.track/2,piv,G.main-S.zc);const L=piv-gy-G.tire;
  k.add(new T.CylinderGeometry(0.17,0.19,L*0.62,14),mGearP(),MX(0,-L*0.31,0));k.add(new T.CylinderGeometry(0.12,0.12,L*0.42,14),mChrome(),MX(0,-L*0.75,0));
  k.add(new T.CylinderGeometry(0.06,0.06,L*0.9,8),mGearP(),MX(-sx*0.6,-L*0.35,0,0,0,-sx*0.55)); // side brace
  if(!G.bogie){wheel(k,G.tire,0.4,sx*0.48,-L,0);wheel(k,G.tire,0.4,-sx*0.0001-sx*-0.0001+(-sx)*0.0,-L,0);k.add(new T.CylinderGeometry(0.1,0.1,1.1,10),mGearP(),MX(sx*0.2,-L,0,0,0,PI/2));}
  else{k.add(new T.BoxGeometry(0.28,0.26,2*G.tire*2.2+0.4),mGearP(),MX(0,-L+0.05,0));for(const dz of[-1,0,1])for(const dx of[-0.42,0.42])wheel(k,G.tire,0.5,dx,-L,dz*G.tire*2.2);}
  // gear door on strut
  k.add(new T.BoxGeometry(0.04,L*0.7,1.2),mWhite(),MX(sx*0.3,-L*0.4,0));
  k.build(g);g.userData.fold=[0,sx];out.push(g);}
 // fix duplicated inner wheel for 2-wheel main: offset inner wheel inboard
 return out;}
// ---------------- full aircraft ----------------
function build(kind,opt={}){const S=SPEC[kind];const g=new T.Group();g.name=kind;const lite=!!opt.lite;
 const k=Kit();const yF=S.yc-2.0,z0=-S.zc;
 k.add(fuseGeo(S),mPaint(S),MX(0,yF,z0));
 // wing-body fairing (belly)
 const W=S.wing;{const fl=new T.SphereGeometry(1,40,20);k.add(fl,mPaint(S),MX(0,yF-S.b*0.62,W.le-S.zc+W.st[0][1]*0.45,0,0,0,S.a*1.02,S.b*0.5,W.st[0][1]*0.82));}
 // wings
 const st=wingStations(S,W);const flapCut=0.76;
 const main=loft(st,0,1,20);
 // cut flaps: build main wing with full chord except flap span where chord is reduced
 const mainR=loft(st.map(s=>({...s})),0,1,20);
 k.add(mainR,mWing());k.add(mirrorX(mainR),mWing(true));
 // tail
 const hs=S.hs,tH=Math.tan(hs.sweep*PI/180),dH=Math.tan(hs.dih*PI/180);const hy=yF+hs.y;
 const hst=[{p:[0,hy],z:hs.le-S.zc,c:hs.c0,t:0.11,v:0},{p:[hs.span,hy+hs.span*dH],z:hs.le-S.zc+hs.span*tH,c:hs.c1,t:0.09,v:1}];
 const hg=loft(hst,0,1,14,true,0);k.add(hg,mPaint(S)===null?null:mTail());k.add(mirrorX(hg),mTail());
 const vs=S.vs,tV=Math.tan(vs.sweep*PI/180);const vy=yF+S.b*0.55;
 const vst=[{p:[0,vy-0.4],ang:PI/2,z:vs.le-S.zc-0.6,c:vs.c0+0.6,t:0.12,v:0},{p:[0,vy+vs.h],ang:PI/2,z:vs.le-S.zc+vs.h*tV,c:vs.c1,t:0.1,v:1}];
 const vg=loft(vst,0,1,16,true,0);k.add(vg,mTail());
 // dorsal fin fillet
 {const fs=new T.Shape();fs.moveTo(0,0);fs.lineTo(vs.c0*0.9,0);fs.quadraticCurveTo(vs.c0*0.15,0.15*vs.h,-vs.c0*0.35,0.02);fs.closePath();const fg=new T.ExtrudeGeometry(fs,{depth:0.3,bevelEnabled:true,bevelThickness:0.12,bevelSize:0.12,bevelSegments:3});fg.translate(0,0,-0.15);fg.rotateY(-PI/2);k.add(fg,mTail(),MX(0,vy-0.05,vs.le-S.zc-0.4));}
 // flap track fairings (canoes) under wings
 for(const f of[0.22,0.42,0.6]){const s=lerpSt(st,f);for(const sx of[1,-1])k.add(new T.SphereGeometry(1,12,8),mWing(),MX(sx*s.p[0],s.p[1]-0.18,s.z+s.c*0.95,0,0,0,0.16,0.26,s.c*0.42));}
 // antennas, beacon bases, pitot probes
 for(const [s,up] of[[S.L*0.35,1],[S.L*0.55,1],[S.L*0.45,-1],[S.L*0.25,-1]]){const q=sect(S,s);k.add(new T.BoxGeometry(0.03,0.32,0.38),mGrey(),MX(0,yF+q.c+up*(q.h+0.15),s+z0,up*0.25));}
 for(const sx of[1,-1]){const q=sect(S,S.Ln*0.35);k.add(new T.CylinderGeometry(0.012,0.02,0.22,6),mChrome(),MX(sx*(q.w+0.08),yF+q.c,S.Ln*0.35+z0,0,0,sx*PI/2));}
 // APU exhaust
 k.add(new T.CylinderGeometry(0.14,0.16,0.4,16,1,true),mHot(),MX(0,yF+sect(S,S.L).c,S.L+z0+0.05,PI/2,0,0));
 // windshield: real glass panes + frame tubes following the pane outlines
 if(!S._panes)fuseTex(S);
 {const P3=(sv,f,off)=>{const q=sect(S,sv);const sn=Math.sin(f),cs=Math.cos(f);const nx=sn*q.h,ny=cs*q.w;const nl=Math.hypot(nx,ny)||1;return new T.Vector3(q.w*sn+nx/nl*off,yF+q.c+q.h*cs+ny/nl*off,sv+z0);};
  const glassM=M('wsg',()=>new T.MeshPhysicalMaterial({color:0x0a1016,metalness:0.2,roughness:0.04,clearcoat:1,clearcoatRoughness:0.03,envMapIntensity:1.2}));
  for(const pn of S._panes){const pts=[];const n=6;for(let i=0;i<4;i++){const a=pn[i],b=pn[(i+1)%4];for(let j=0;j<n;j++){const t=j/n;pts.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}
   const ctr=pts.reduce((m,p)=>[m[0]+p[0]/pts.length,m[1]+p[1]/pts.length],[0,0]);const vs=[];const c3=P3(ctr[0],ctr[1],0.012);for(let i=0;i<pts.length;i++){const p1=P3(pts[i][0],pts[i][1],0.012),p2=P3(pts[(i+1)%pts.length][0],pts[(i+1)%pts.length][1],0.012);vs.push(c3.x,c3.y,c3.z,p1.x,p1.y,p1.z,p2.x,p2.y,p2.z);}
   const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(vs,3));gg.computeVertexNormals();
   {const nn=gg.attributes.normal;const o=P3(ctr[0],ctr[1],1).sub(c3);if(nn.getX(0)*o.x+nn.getY(0)*o.y+nn.getZ(0)*o.z<0)flipW(indexify(gg));}
   k.add(gg,glassM);
   const cv=new T.CatmullRomCurve3(pts.map(p=>P3(p[0],p[1],0.02)),true,'catmullrom',0.05);k.add(new T.TubeGeometry(cv,48,0.035*S.a/1.9,6,true),mBlack());}}
 // wing-root fillet (smooth wing-to-body blend)
 for(const sx of[1,-1]){const r=st[1];k.add(new T.SphereGeometry(1,24,12),mPaint(S),MX(sx*(S.a*0.9),r.p[1]+0.05,r.z+r.c*0.5,0,0,0,0.55,0.32*S.a/1.9,r.c*0.55));}
 // vortex generators on upper wing (outboard), static dischargers on trailing edge tips
 for(let f=0.55;f<0.95;f+=0.035){const q=lerpSt(st,f);for(const sx of[1,-1]){k.add(new T.BoxGeometry(0.01,0.045,0.09),mWing(),MX(sx*q.p[0],q.p[1]+q.c*q.t*0.55,q.z+q.c*0.12,0,sx*0.25,0));}}
 for(const f of[0.78,0.86,0.93,0.99]){const q=lerpSt(st,Math.min(f,0.999));for(const sx of[1,-1])k.add(new T.CylinderGeometry(0.008,0.008,0.35,4),mBlack(),MX(sx*q.p[0],q.p[1],q.z+q.c+0.15,PI/2,0,0));}
 // flap track beams (visible under the wing, carry the flaps)
 for(const f of[0.22,0.42,0.6]){const q=lerpSt(st,f);for(const sx of[1,-1]){k.add(new T.BoxGeometry(0.1,0.16,q.c*0.5),mGrey(),MX(sx*q.p[0],q.p[1]-0.12,q.z+q.c*0.85));}}
 // inboard leading-edge krueger / slat seams as raised strips
 for(const sx of[1,-1]){const a=lerpSt(st,0.12),b=lerpSt(st,0.98);const A=new T.Vector3(sx*a.p[0],a.p[1]+a.c*a.t*0.35,a.z+a.c*0.06),B=new T.Vector3(sx*b.p[0],b.p[1]+b.c*b.t*0.35,b.z+b.c*0.06);const d=B.clone().sub(A);const m=new T.Matrix4().lookAt(A,B,new T.Vector3(0,1,0));const cyl=new T.CylinderGeometry(0.012,0.012,d.length(),4);cyl.rotateX(PI/2);cyl.applyMatrix4(m);cyl.translate((A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2);k.add(cyl,mGrey());}
 k.build(g);
 // flaps + ailerons (separate, deflect)
 const flaps=[];
 for(const [f0,f1,isAil] of[[0.06,0.33,0],[0.35,0.72,0],[0.74,0.95,1]]){for(const sx of[1,-1]){const a=lerpSt(st,f0),b=lerpSt(st,f1);
   const fs=[{...a,z:a.z+a.c*0.995,c:a.c*(isAil?0.24:0.28),t:a.t*0.32,v:0},{...b,z:b.z+b.c*0.995,c:b.c*(isAil?0.24:0.28),t:b.t*0.32,v:1}];
   let gg=loft(fs,0,1,10,true,0);if(sx<0)gg=mirrorX(gg);const piv=new T.Group();const P=new T.Vector3(sx*a.p[0],a.p[1],a.z+a.c);const P2=new T.Vector3(sx*b.p[0],b.p[1],b.z+b.c);
   gg.translate(-P.x,-P.y,-P.z+0.0);gg.translate(0,0,-a.c*0.0);const m=new T.Mesh(gg,mWing());m.castShadow=m.receiveShadow=true;piv.position.copy(P);piv.add(m);
   piv.userData.axis=P2.clone().sub(P).normalize();piv.userData.ail=isAil;piv.userData.sx=sx;g.add(piv);flaps.push(piv);}}
 // engines
 const engs=[];const E=S.eng;for(const sx of[1,-1]){const e=engine(S,lite);e.position.set(sx*E.y,yF+W.y0+E.yo+E.y*Math.tan(W.dih*PI/180)*0.6,E.z-S.zc);if(sx<0)e.scale.x=-1;g.add(e);engs.push(e);}
 // gear
 const gear=gearSet(S);for(const gg of gear)g.add(gg);
 // nav / beacon / strobe lights
 const tipR=st[W.tip==='raked'?st.length-1:Math.min(st.length-1,W.st.length-1)];const L={};
 const bulb=(c,x,y,z,r=0.09)=>{const m=new T.Mesh(new T.SphereGeometry(r,10,8),mLight(c));m.position.set(x,y,z);g.add(m);return m;};
 L.red=bulb(0xff2a1a,-tipR.p[0]-0.05,tipR.p[1],tipR.z+0.15);L.green=bulb(0x22ff55,tipR.p[0]+0.05,tipR.p[1],tipR.z+0.15);
 L.bcnT=bulb(0xff1a10,0,yF+S.b+0.12,S.L*0.45+z0,0.12);L.bcnB=bulb(0xff1a10,0,yF-S.b-0.1,S.L*0.5+z0,0.12);
 L.strR=bulb(0xffffff,tipR.p[0]+0.02,tipR.p[1],tipR.z+tipR.c*0.8,0.1);L.strL=bulb(0xffffff,-tipR.p[0]-0.02,tipR.p[1],tipR.z+tipR.c*0.8,0.1);L.tail=bulb(0xffffff,0,yF+sect(S,S.L).c,S.L+z0+0.3,0.08);
 // cockpit interior (for onboard camera)
 if(!lite){const ck=new T.Group(),kk=Kit();const s=S.Ln*0.62,q=sect(S,s);const cy=yF+q.c,cz=s+z0;
  kk.add(new T.BoxGeometry(q.w*1.7,0.5,0.7),mBlack(),MX(0,cy-0.15,cz-0.05));kk.add(new T.BoxGeometry(q.w*1.75,0.08,0.55),mBlack(),MX(0,cy+0.12,cz-0.15)); // panel + glareshield
  for(const sx of[1,-1]){kk.add(new T.BoxGeometry(0.05,0.9,0.05),mBlack(),MX(sx*0.03,cy+0.5,cz-0.35,0.55,0,0));kk.add(new T.BoxGeometry(0.06,0.8,0.06),mBlack(),MX(sx*q.w*0.55,cy+0.45,cz-0.25,0.5,0,-sx*0.5));kk.add(new T.BoxGeometry(0.06,0.7,0.06),mBlack(),MX(sx*q.w*0.86,cy+0.35,cz+0.25,0.3,0,-sx*0.9));}
  kk.add(new T.BoxGeometry(q.w*1.8,0.06,1.4),mBlack(),MX(0,cy+q.h*0.82,cz+0.9));kk.build(ck);
  const dc=document.createElement('canvas');dc.width=512;dc.height=128;const dx=dc.getContext('2d');dx.fillStyle='#000';dx.fillRect(0,0,512,128);
  for(let i=0;i<6;i++){const X=6+i*84;const gr=dx.createLinearGradient(0,10,0,118);gr.addColorStop(0,i%3===0?'#2a6cd6':'#05070a');gr.addColorStop(0.5,i%3===0?'#7a4a20':'#05070a');gr.addColorStop(1,'#05070a');dx.fillStyle=gr;dx.fillRect(X,10,76,108);dx.strokeStyle='#38ff9a';dx.lineWidth=2;if(i%3===1){dx.beginPath();dx.arc(X+38,90,46,PI*1.15,PI*1.85);dx.stroke();}else{dx.strokeStyle='#fff';dx.beginPath();dx.moveTo(X+10,64);dx.lineTo(X+66,64);dx.stroke();}}
  const dt=new T.CanvasTexture(dc);dt.colorSpace=T.SRGBColorSpace;const dsp=new T.Mesh(new T.PlaneGeometry(q.w*1.55,0.38),new T.MeshBasicMaterial({map:dt}));dsp.position.set(0,cy-0.12,cz-0.41);ck.add(dsp);ck.visible=false;g.add(ck);g.userData.ckG=ck;g.userData.cockpit=new T.Vector3(-0.5,cy+0.45,cz+0.75);}
 g.userData.al={kind,S,flaps,engs,gear,L,gearT:1,flapT:0,ph:Math.random()*10};
 g.traverse(o=>{if(o.isMesh&&!(o.material&&o.material.isMeshBasicMaterial)){o.castShadow=o.receiveShadow=true;}});
 return g;}
// ---------------- animation (fans, flaps, gear, lights) ----------------
const _q=new T.Quaternion(),_ax=new T.Vector3();
function animate(m,dt,st){const A=m.userData.al;if(!A)return;A.ph+=dt;
 for(const e of A.engs){const f=e.userData.fan;if(f)f.rotation.z+=dt*(st.n1||0.25)*55*(e.scale.x<0?-1:1);}
 A.flapT+=((st.flap||0)-A.flapT)*Math.min(1,dt*0.6);A.gearT+=((st.gear?1:0)-A.gearT)*Math.min(1,dt*0.7);
 for(const p of A.flaps){const ang=p.userData.ail?(st.roll||0)*0.3*p.userData.sx:A.flapT*0.55;_ax.copy(p.userData.axis);p.quaternion.setFromAxisAngle(_ax,-ang*(p.userData.sx>0?1:-1));p.position.z+=0;}
 for(const gg of A.gear){const [fx,fz]=gg.userData.fold;const r=(1-A.gearT)*PI/2;gg.rotation.set(fx?fx*r:0,0,fz?fz*r*1.0:0);gg.visible=A.gearT>0.03;}
 const L=A.L,t=A.ph;const bcn=(t%1.2)<0.12;L.bcnT.visible=L.bcnB.visible=bcn;const sb=(t%1.1)<0.05||((t%1.1)>0.14&&(t%1.1)<0.19);L.strR.visible=L.strL.visible=sb;}
// ---------------- game hooks ----------------
const KINDS=['b738','a320','b77w'];
for(const k of KINDS){const S=SPEC[k];DEFS[k]={name:S.name,desc:k==='b77w'?'Twin GE90-115B widebody, 73.9 m long. Rotate ~155 kt, cruise Mach 0.84.':k==='a320'?'CFM56-5B narrowbody with sharklets. Rotate ~140 kt, cruise Mach 0.78.':'CFM56-7B narrowbody with blended winglets. Rotate ~145 kt, cruise Mach 0.79.',cls:'air',thrust:S.thrust,vstall:S.vstall,vrot:S.vrot,dragK:S.dragK,ceil:S.ceil,col:0xf2f3f4,weapons:[],maxMach:0.89,airliner:true,role:'Airliner',
  stats:{length_m:S.L,span_m:{b738:35.79,a320:35.8,b77w:64.8}[k],height_m:{b738:12.55,a320:11.76,b77w:18.5}[k],engines:{cfm7:'2x CFM56-7B',cfm5:'2x CFM56-5B',ge90:'2x GE90-115B'}[S.eng.type],cruiseMach:{b738:0.79,a320:0.78,b77w:0.84}[k],ceiling_m:S.ceil,mtow_t:{b738:79,a320:78,b77w:351}[k],seats:{b738:189,a320:180,b77w:396}[k]},
  bars:{speed:k==='b77w'?0.62:0.58,agility:k==='b77w'?0.25:0.35,armor:0.2,firepower:0},
  previewImg:'previews/airliner_'+k+'.jpg',preview:()=>build(k,{lite:true})};}
if(typeof ENG_CHAR!=='undefined')for(const k of KINDS)ENG_CHAR[k]={r:0.62,w:0.55,ab:0.4};
{const _j=jet;jet=function(c,fa18,kind){if(SPEC[kind])return build(kind);return _j(c,fa18,kind);};}
{const _ae=attachExhaust;attachExhaust=function(v){if(v&&SPEC[v.kind]){if(exhMesh&&exhMesh.parent)exhMesh.parent.remove(exhMesh);exhMesh=null;exhFor=v;return;}return _ae(v);};}
{const _ua=updAir;updAir=function(v,dt){_ua(v,dt);if(!SPEC[v.kind]||!v.mesh)return;const sp=v.vel.length();const agl=v.mesh.position.y-groundAt(v.mesh.position.x,v.mesh.position.z).h;
  if(v.alGear==null)v.alGear=true;if(!v.onGround&&agl>60&&v.vel.y>-2)v.alGear=false;if(agl<300&&v.vel.y<-1&&sp<120)v.alGear=true;if(v.onGround)v.alGear=true;
  v.alN1=(v.alN1||0.2)+((0.22+inp.throttle*0.78)-(v.alN1||0.2))*Math.min(1,dt*0.8);
  contrail(v.mesh,dt,1);
  animate(v.mesh,dt,{n1:v.alN1,flap:sp<85?1:sp<115?0.5:0,gear:v.alGear,roll:inp.roll});}}
{const _uc=updCamera;const _cp=new T.Vector3();updCamera=function(dt){_uc(dt);const v=player;if(window.__al)__al.dbgN++;traffic(dt);if(!v||!SPEC[v.kind]||!v.mesh||camFollow||blastCam)return;const S=SPEC[v.kind];
  const ckG=v.mesh.userData.ckG;if(ckG)ckG.visible=camMode===1;if(camMode===1&&v.mesh.userData.cockpit){_cp.copy(v.mesh.userData.cockpit).applyMatrix4(v.mesh.matrixWorld);camera.position.copy(_cp);camera.quaternion.copy(v.mesh.quaternion);return;}
  if(camMode===0){const k=S.L/22;_cp.copy(camera.position).sub(v.mesh.position).multiplyScalar(k);camera.position.copy(v.mesh.position).add(_cp);const gh=groundAt(camera.position.x,camera.position.z).h;if(camera.position.y<gh+2)camera.position.y=gh+2;camera.lookAt(v.mesh.position);}
  if(window.__al&&__al.cam){const c=__al.cam;_cp.set(...c.o).applyMatrix4(v.mesh.matrixWorld);camera.position.copy(_cp);_cp.set(...(c.t||[0,0,0])).applyMatrix4(v.mesh.matrixWorld);camera.up.set(0,1,0);camera.lookAt(_cp);if(c.fov&&camera.fov!==c.fov){camera.fov=c.fov;camera.updateProjectionMatrix();}}};}
// ---------------- contrails (8-13 km, from each engine exhaust) ----------------
const _cw=new T.Vector3();function contrail(m,dt,rate){const y=m.position.y;if(y<8000||y>13500||typeof smoke==='undefined')return;const A=m.userData.al;if(!A)return;const k=Math.min(1,(y-8000)/800);
 for(const e of A.engs){if(Math.random()>rate*k)continue;_cw.set(0,0,A.S.eng.len*1.15).applyMatrix4(e.matrixWorld);smoke.spawn(_cw,Math.random()-0.5,Math.random()-0.5,Math.random()-0.5,9,1.2*A.S.eng.R,5*A.S.eng.R,1,1,1,0.55,0.02,0);}}
// ---------------- AI traffic ----------------
const TR=[];let trInit=false;
function traffic(dt){if(!trInit){trInit=true;const n=GQ.max>=1?6:3;for(let i=0;i<n;i++){const kind=KINDS[i%3];const m=build(kind,{lite:true});const R=9000+i*3500,alt=i<2?10200+i*700:2200+i*1300,sp=200+i*8,dir=i%2?1:-1;
   m.userData.al.gearT=0;animate(m,0.01,{n1:0.8,gear:false});scene.add(m);TR.push({m,R,alt,sp,dir,a:i*1.7,cx:(i-2)*3000,cz:-6000+i*2000});}}
 for(const t of TR){t.a+=t.dir*t.sp/t.R*dt;const x=t.cx+Math.cos(t.a)*t.R,z=t.cz+Math.sin(t.a)*t.R;t.m.position.set(x,t.alt,z);
  const hx=-Math.sin(t.a)*t.dir,hz=Math.cos(t.a)*t.dir;const bank=Math.atan(t.sp*t.sp/(t.R*9.81))*t.dir;t.m.rotation.set(0,Math.atan2(-hx,-hz),0,'YXZ');t.m.rotation.z=-bank*0.9;
  const d=camera.position.distanceTo(t.m.position);t.m.visible=d<40000;if(t.m.visible&&d<8000)animate(t.m,dt,{n1:0.8,gear:false});if(t.m.visible&&d<30000){t.m.updateMatrixWorld();contrail(t.m,dt,0.35);}}}
// ---------------- civil airport: terminal, gates, apron, taxiway, tower, runway markings ----------------
const AP=new T.Group();AP.name='airport';
function rwTex(){const W=256,H=8192,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');const mx=W/60,my=H/3000; // metres -> px; canvas top = north end
 x.fillStyle='#4a4c4f';x.fillRect(0,0,W,H);for(let i=0;i<60000;i++){const v=60+Math.random()*30;x.fillStyle=`rgba(${v},${v},${v+2},0.25)`;x.fillRect(Math.random()*W,Math.random()*H,1+Math.random()*2,1+Math.random()*3);}
 // tyre-rubber deposits in touchdown zones
 for(const c of[400,2600]){const g=x.createLinearGradient(0,(c-250)*my,0,(c+250)*my);g.addColorStop(0,'rgba(20,20,20,0)');g.addColorStop(0.5,'rgba(20,20,20,0.55)');g.addColorStop(1,'rgba(20,20,20,0)');x.fillStyle=g;x.fillRect(W*0.3,(c-250)*my,W*0.4,500*my);}
 const R=(xm,ym,w,h)=>{x.fillRect((xm+30)*mx,ym*my,w*mx,h*my);};x.fillStyle='#f2f2ee';
 R(-29,0,0.9,3000);R(28.1,0,0.9,3000); // edge lines
 for(let y=120;y<2880;y+=50)R(-0.45,y,0.9,30); // centreline 30 m / 20 m gap
 for(const end of[0,1]){const Y=y=>end?3000-y:y;const fl=(xm,y0,w,h)=>R(xm,end?3000-y0-h:y0,w,h);
  for(let i=0;i<8;i++){fl(-28.4+i*3.5,6,1.8,30);fl(1.6+i*3.5,6,1.8,30);} // threshold piano keys (16 stripes)
  fl(-29,2,58,1.2); // threshold bar
  fl(-10.5,400-30,6,45);fl(4.5,400-30,6,45); // aiming point
  for(const [d,n] of[[150,3],[300,2],[450,2],[600,1],[750,1],[900,1]]){if(d===450)continue;for(let k=0;k<n;k++){fl(-14+k*2.4,d,1.8,22);fl(12.2-k*2.4,d,1.8,22);}} // touchdown zone
  // designator
  x.save();const cy=(end?3000-60:60)*my;x.translate(W/2,cy);if(end)x.rotate(0);else x.rotate(PI);x.scale(1,my/mx*0.55);x.fillStyle='#f2f2ee';x.font=`bold ${Math.round(18*mx*2.5)}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(end?'36':'18',0,0);x.restore();}
 const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;t.anisotropy=16;return t;}
function airport(){const gy=6;const k=Kit();const conc=new T.MeshStandardMaterial({color:0x9a9890,roughness:0.85,metalness:0});const asph=new T.MeshStandardMaterial({color:0x3e4043,roughness:0.9});
 // apron concrete with joint grid + yellow lead-in lines (canvas)
 const cv=document.createElement('canvas');cv.width=1024;cv.height=2048;const x=cv.getContext('2d');x.fillStyle='#a19f97';x.fillRect(0,0,1024,2048);for(let i=0;i<20000;i++){const v=140+Math.random()*30;x.fillStyle=`rgba(${v},${v},${v-6},0.3)`;x.fillRect(Math.random()*1024,Math.random()*2048,2,2);}
 x.strokeStyle='rgba(60,60,60,0.35)';x.lineWidth=1;for(let i=0;i<1024;i+=14){x.beginPath();x.moveTo(i,0);x.lineTo(i,2048);x.stroke();}for(let j=0;j<2048;j+=14){x.beginPath();x.moveTo(0,j);x.lineTo(1024,j);x.stroke();}
 const ax=1024/190,az=2048/900; // apron x -120..-310 (190 m), z -450..450
 x.strokeStyle='#e6b800';x.lineWidth=5;for(const gz of GATES){x.beginPath();x.moveTo(0,(gz+450)*az);x.lineTo(1024*0.78,(gz+450)*az);x.stroke();x.fillStyle='#e6b800';x.fillRect(1024*0.78-4,(gz+450)*az-30,8,60);}
 x.beginPath();x.moveTo(1024*0.06,0);x.lineTo(1024*0.06,2048);x.stroke();x.strokeStyle='#c22';x.setLineDash([12,10]);x.beginPath();x.moveTo(1024*0.86,0);x.lineTo(1024*0.86,2048);x.stroke();x.setLineDash([]);
 const at=new T.CanvasTexture(cv);at.colorSpace=T.SRGBColorSpace;at.anisotropy=8;
 const apron=new T.Mesh(new T.PlaneGeometry(190,900).rotateX(-PI/2),new T.MeshStandardMaterial({map:at,roughness:0.85}));apron.position.set(-215,gy+0.17,0);apron.receiveShadow=true;AP.add(apron);
 // taxiway with yellow centreline + edge
 const tc=document.createElement('canvas');tc.width=64;tc.height=1024;const tx=tc.getContext('2d');tx.fillStyle='#3e4043';tx.fillRect(0,0,64,1024);tx.fillStyle='#e6b800';tx.fillRect(31,0,2,1024);tx.fillRect(1,0,1.5,1024);tx.fillRect(61.5,0,1.5,1024);
 const tt=new T.CanvasTexture(tc);tt.colorSpace=T.SRGBColorSpace;tt.wrapT=T.RepeatWrapping;tt.repeat.set(1,6);
 const tw=new T.Mesh(new T.PlaneGeometry(23,2600).rotateX(-PI/2),new T.MeshStandardMaterial({map:tt,roughness:0.9}));tw.position.set(-80,gy+0.16,0);tw.receiveShadow=true;AP.add(tw);
 for(const z of[-1200,-400,400,1200]){const c=new T.Mesh(new T.PlaneGeometry(52,23).rotateX(-PI/2),asph);c.position.set(-56,gy+0.155,z);AP.add(c);}
 // terminal: glass curtain wall + roof + structure
 const gc=document.createElement('canvas');gc.width=2048;gc.height=128;const g2=gc.getContext('2d');const gr=g2.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#6f8aa3');gr.addColorStop(1,'#2b3a48');g2.fillStyle=gr;g2.fillRect(0,0,2048,128);g2.fillStyle='#cfd3d6';for(let i=0;i<2048;i+=16)g2.fillRect(i,0,2,128);g2.fillRect(0,60,2048,3);g2.fillRect(0,0,2048,4);
 for(let i=0;i<300;i++){g2.fillStyle=`rgba(255,240,210,${Math.random()*0.25})`;g2.fillRect(Math.random()*2048,66+Math.random()*50,6,10);}
 const glt=new T.CanvasTexture(gc);glt.colorSpace=T.SRGBColorSpace;const glassM=new T.MeshPhysicalMaterial({map:glt,metalness:0.6,roughness:0.08,clearcoat:1});
 const wall=new T.Mesh(new T.PlaneGeometry(820,16).rotateY(PI/2),glassM);wall.position.set(-322,gy+8,0);AP.add(wall);
 k.add(new T.BoxGeometry(46,16,820),M('term',()=>new T.MeshStandardMaterial({color:0xd9dcdf,roughness:0.6,metalness:0.2})),MX(-346,gy+8,0));
 k.add(new T.BoxGeometry(56,1.6,836),M('roof',()=>new T.MeshStandardMaterial({color:0xeef0f1,roughness:0.4,metalness:0.4})),MX(-344,gy+16.8,0));
 for(let i=0;i<14;i++)k.add(new T.BoxGeometry(6+(i%3)*2,2.4,8),mGrey(),MX(-352+(i%2)*14,gy+18.8,-380+i*58));
 // jet bridges at each gate: rotunda + telescoping tunnel + cab
 for(const gz of GATES){const L=26;k.add(new T.CylinderGeometry(2.4,2.4,5,16),M('term',()=>null),MX(-310,gy+5.5,gz+12));
  k.add(new T.BoxGeometry(L,3.2,3.4),mGrey(),MX(-310+L/2,gy+5.5,gz+9,0,0,0));k.add(new T.BoxGeometry(3,3.6,4),mGrey(),MX(-310+L+1,gy+5.5,gz+8));
  k.add(new T.CylinderGeometry(0.35,0.35,4,8),mChrome(),MX(-310+L-4,gy+2,gz+9));k.add(new T.BoxGeometry(2.4,0.8,1.6),mBlack(),MX(-310+L-4,gy+0.4,gz+9));}
 // control tower
 k.add(new T.CylinderGeometry(4,5.5,58,24),M('term',()=>null),MX(-390,gy+29,560));k.add(new T.CylinderGeometry(9,7,2,24),mGrey(),MX(-390,gy+58,560));
 const cab=new T.Mesh(new T.CylinderGeometry(9.5,8.5,6,8,1,true),new T.MeshPhysicalMaterial({color:0x3a5068,metalness:0.7,roughness:0.05,clearcoat:1,side:T.DoubleSide}));cab.position.set(-390,gy+62,560);AP.add(cab);
 k.add(new T.CylinderGeometry(10.5,10,1.5,8),mWhite(),MX(-390,gy+65.8,560));k.add(new T.CylinderGeometry(0.15,0.15,8,6),mGrey(),MX(-390,gy+70,560));
 // ground service: tug + belt loader + fuel truck per gate (simple)
 for(const gz of GATES){k.add(new T.BoxGeometry(2.4,1.4,4),M('gse',()=>new T.MeshStandardMaterial({color:0xe8b00f,roughness:0.6})),MX(-205,gy+0.9,gz-14));k.add(new T.BoxGeometry(2.5,2.6,9),mWhite(),MX(-245,gy+1.5,gz-18));}
 k.build(AP);
 // parked airliners at gates (nose to terminal = -X)
 GATES.forEach((gz,i)=>{const kind=KINDS[(i+1)%3];const m=build(kind,{lite:true});const S=SPEC[kind];m.position.set(-300+S.zc-S.Ln*0.2+ (S.L>60?0:6),gy+2,gz);m.rotation.y=PI/2;animate(m,0.016,{n1:0,gear:true});AP.add(m);});
 AP.traverse(o=>{if(o.isMesh){o.receiveShadow=true;}});scene.add(AP);
 // upgrade the shared runway surface with full ICAO markings
 scene.traverse(o=>{if(o.isMesh&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters.width===60&&o.geometry.parameters.height===3000){o.material=new T.MeshStandardMaterial({map:rwTex(),roughness:0.88,metalness:0});o.receiveShadow=true;}});}
const GATES=[-330,-200,-70,60,190,320];
try{airport();}catch(e){console.warn('airport',e);}
window.__al={T,SPEC,build,TR,AP,animate,camera,get camMode(){return camMode},dbgN:0};
return{SPEC,build,TR,AP,animate,KINDS};})();
//GAIRLINERS-END
