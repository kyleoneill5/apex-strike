// ===== moon_hls.js : Starship HLS (returnable, Kyle variant) mission logic. Super Heavy ascent -> orbit -> tanker refuel -> TLI -> NRHO (planar approx) -> Orion crew transfer -> descent (Raptor braking, high-mounted landing thrusters final) -> surface/elevator -> ascent -> TEI -> 11 km/s entry -> belly-flop/flip/landing burn via ship_ DS+gstarflop -> pad landing =====
const MHLS=(()=>{const P=MPH,G0=P.G0;
const V={sh:{dry:275000,prop:3400000,Tsl:74400000,Tvac:80000000,ispSL:327,ispV:347},
 ship:{dry:120000,dryHLS:120000,prop:1560000,T:14700000,isp:375,lt:{T:2400000,isp:330}}};
// planar NRHO stand-in: lunar orbit 3,000 x 40,000 km altitude (real NRHO ~3,000 x 70,000 km, out of plane)
const NRHO_PE=3000e3,NRHO_AP=40000e3;
function ev(F,k,txt){if(F.ev[k])return false;F.ev[k]=F.t;F.events.push({t:F.t,k,txt});return true;}
function mass(F){return (F.att.sh?V.sh.dry+F.pr.sh:0)+V.ship.dryHLS+F.pr.ship;}
function radial(x,y){const r=Math.hypot(x,y);return[x/r,y/r,r];}
function dirP(s,p){const[ux,uy]=radial(s.x,s.y);const a=p*Math.PI/180;return[-uy*Math.cos(a)+ux*Math.sin(a),ux*Math.cos(a)+uy*Math.sin(a)];}
function burn(F,key,T,isp,thr,dir,dt){if(thr<=0||F.pr[key]<=0){F.eng=0;return[0,0];}const md=T*thr/(isp*G0),b=Math.min(F.pr[key],md*dt);F.pr[key]-=b;const a=T*thr*(b/(md*dt))/(mass(F)+b/2);F.dvUsed[F.ph]=(F.dvUsed[F.ph]||0)+a*dt;F.eng=thr;F.thrDir=dir;return[a*dir[0],a*dir[1]];}
function clPitch(s,aT,hT,R,mu){const[ux,uy,r]=radial(s.x,s.y);const vr=s.vx*ux+s.vy*uy,vt=-s.vx*uy+s.vy*ux;const tau=120,av=2*(hT-(r-R))/(tau*tau)-2*vr/tau;return Math.asin(Math.max(-0.4,Math.min(0.95,(av+mu/(r*r)-vt*vt/r)/Math.max(aT,0.1))))*180/Math.PI;}
const PITCH=[[0,90],[10,90],[40,78],[80,60],[120,45],[160,32]];const pp=t=>{for(let i=1;i<PITCH.length;i++)if(t<PITCH[i][0]){const a=PITCH[i-1],b=PITCH[i];return a[1]+(b[1]-a[1])*(t-a[0])/(b[0]-a[0]);}return 32;};
function create(){const F=MFL.create();F.variant='hls';F.pr={sh:V.sh.prop,ship:V.ship.prop};F.att={sh:1,ship:1};return F;}
function closestEarth(s0,tmax){const s={...s0};let best=1e20,tEnd=s.t+tmax;while(s.t<tEnd){P.step(s,P.maxDt(s)*2);const r=Math.hypot(s.x,s.y);if(r<best)best=r;else if(r<5e7&&r>best*1.02)break;}return best-P.RE;}
function update(F,inp,dtT){const fe=inp.fireEdge;inp.fireEdge=false;if(F.ph==='pad'){F.cue='LAUNCH';if(fe||inp.go){F.ph='count';F.met=-5;}}
 let rem=dtT;while(rem>1e-9){const fast=['parking','coast','lorbit','nrho','tcoast','lorbit2'].includes(F.ph);const dt=Math.min(rem,fast?P.maxDt(F.s):0.1);rem-=dt;sub(F,inp,dt);if(['crashed','done'].includes(F.ph))break;}inp.fireEdge2=false;}
function sub(F,inp,dt){const s=F.s;F.t+=dt;const a=inp.auto?1:inp.thr;F.thrCmd=a;
 switch(F.ph){
 case 'count':F.met+=dt;F.padA+=F.om*dt;{const c=Math.cos(F.padA),sn=Math.sin(F.padA);s.x=P.RE*c;s.y=P.RE*sn;s.vx=-P.RE*F.om*sn;s.vy=P.RE*F.om*c;s.t+=dt;}F.eng=a;F.engN=a>0?33:0;if(F.met>=0&&a>0){F.ph='ascent';F.launched=true;ev(F,'liftoff','LIFTOFF');}break;
 case 'ascent':{F.met+=dt;const[ux,uy,r]=radial(s.x,s.y);const h=r-P.RE;let ax=0,ay=0;const rho=h<100000?1.225*Math.exp(-h/7200):0;const wx=s.vx+F.om*s.y,wy=s.vy-F.om*s.x,va=Math.hypot(wx,wy);F.q=0.5*rho*va*va;if(F.q>F.maxQ){F.maxQ=F.q;F.maxQt=F.met;}if(va>1){const D=F.q*60/mass(F);ax-=D*wx/va;ay-=D*wy/va;}
  if(F.att.sh){const p=Math.exp(-h/7200);const T=V.sh.Tvac+(V.sh.Tsl-V.sh.Tvac)*p;const ac=burn(F,'sh',T,V.sh.ispV,a,dirP(s,pp(F.met)),dt);ax+=ac[0];ay+=ac[1];F.engN=a>0?33:0;if(F.pr.sh<=V.sh.prop*0.1){F.att.sh=0;F.events.push({t:F.t,k:'drop',part:'sh'});ev(F,'hot','HOT STAGING');}}
  else{const aT=V.ship.T*a/mass(F);const ac=burn(F,'ship',V.ship.T,V.ship.isp,a,dirP(s,clPitch(s,aT,200000,P.RE,P.muE)),dt);ax+=ac[0];ay+=ac[1];F.engN=a>0?6:0;const vt=-s.vx*uy+s.vy*ux;const el=P.elems(P.primary(s));if(vt>=Math.sqrt(P.muE/r)*0.9995&&el.pe>150000){F.eng=0;F.engN=0;ev(F,'seco','SECO - EARTH ORBIT');F.ph='refuel';F.rT=0;F.prAfterAscent=F.pr.ship;}}
  P.step(s,dt,ax,ay);if(Math.hypot(s.x,s.y)<P.RE-5){F.ph='crashed';ev(F,'crash','VEHICLE LOST');}}break;
 case 'refuel':P.step(s,dt);F.rT+=dt;F.cue='REFUEL';if(F.rT>2)ev(F,'tank','TANKER DOCKED');if(F.rT>4){const fill=Math.min(V.ship.prop-F.pr.ship,25000*dt*10);F.pr.ship+=fill;}// abbreviated: ~10 tanker flights compressed
  if(F.rT>4&&F.pr.ship>=V.ship.prop-1){ev(F,'full','PROPELLANT TRANSFER COMPLETE '+((V.ship.prop-F.prAfterAscent)/1000).toFixed(0)+' t');F.ph='parking';F.alpha=MFL._hlsAlpha||(MFL._hlsAlpha=P.solveTLI(P.RE+200000,3150,NRHO_PE));const el=P.elems(P.primary(s));const n=Math.sqrt(P.muE/Math.pow(el.a,3));F.tliBurn=mass(F)*V.ship.isp*G0/V.ship.T*(1-Math.exp(-3150/(V.ship.isp*G0)));F.tIgn=F.t+900;const tc=F.tIgn+F.tliBurn/2;P.st.psi0=Math.atan2(s.y,s.x)+n*(tc-F.t)-F.alpha-P.nM*tc;F.apT=P.elems({mu:P.muE,R:P.RE,x:P.RE+200000,y:0,vx:0,vy:Math.sqrt(P.muE/(P.RE+200000))+3150}).ap;}break;
 case 'parking':P.step(s,dt);F.cue='TLI';F.cueT=F.tIgn-F.t;if(a>0&&F.cueT<30){F.ph='tli';ev(F,'tliign','TLI BURN');}break;
 case 'tli':{const v=Math.hypot(s.vx,s.vy);const ac=burn(F,'ship',V.ship.T,V.ship.isp,a,[s.vx/v,s.vy/v],dt);F.engN=a>0?3:0;P.step(s,dt,ac[0],ac[1]);if(P.elems(P.primary(s)).ap>=F.apT){F.eng=0;F.engN=0;ev(F,'tlico','TLI CUTOFF');F.tTLI=F.t;F.ph='coast';}}break;
 case 'coast':{P.step(s,dt);if(!F.mcc&&F.t-F.tTLI>26*3600){const f=dv=>{const v=Math.hypot(s.vx,s.vy);return P.closest({...s,vx:s.vx+dv*s.vx/v,vy:s.vy+dv*s.vy/v},5*86400).d-(P.RM+NRHO_PE);};let x0=0,x1=2,f0=f(0),f1=f(2);for(let i=0;i<12&&Math.abs(f1)>2000;i++){const x2=x1-f1*(x1-x0)/(f1-f0);x0=x1;f0=f1;x1=Math.max(-150,Math.min(150,x2));f1=f(x1);}const v=Math.hypot(s.vx,s.vy);s.vx+=x1*s.vx/v;s.vy+=x1*s.vy/v;F.dvUsed.mcc=Math.abs(x1);F.mcc={dv:x1};ev(F,'mcc','MIDCOURSE '+Math.abs(x1).toFixed(1)+' M/S');}
  const pr=P.primary(s);if(pr.b==='moon'){const el=P.elems(pr);F.cue='NRHO';F.cueT=el.tPe-60;if(a>0&&F.cueT<60){F.ph='nri';ev(F,'nri','NRHO INSERTION');}if(el.alt<0){F.ph='crashed';ev(F,'crash','IMPACT');}}}break;
 case 'nri':{const pr=P.primary(s);const v=Math.hypot(pr.vx,pr.vy);const ac=burn(F,'ship',V.ship.T,V.ship.isp,a,[-pr.vx/v,-pr.vy/v],dt);F.engN=a>0?3:0;P.step(s,dt,ac[0],ac[1]);const el=P.elems(P.primary(s));if(el.e<1&&el.ap<=NRHO_AP){F.eng=0;F.engN=0;ev(F,'nrho','NRHO ACHIEVED');F.ph='nrho';F.tN=F.t;}}break;
 case 'nrho':P.step(s,dt);F.cue='ORION';if(F.t-F.tN>600&&!F.ev.orion){ev(F,'orion','ORION DOCKED - CREW TRANSFER');}if(F.ev.orion&&(inp.fireEdge2||inp.go&&F.t-F.tN>1200))startDescent(F);break;
 case 'descent':descent(F,inp,dt);break;
 case 'landed':F.surfT=(F.surfT||0)+dt;if(F.surfT>1)ev(F,'elev','ELEVATOR DOWN - CREW EGRESS');if(inp.fireEdge2||(inp.go&&F.surfT>30)){F.ph='lascent';ev(F,'asc','LUNAR LIFTOFF');}break;
 case 'lascent':lascent(F,inp,dt);break;
 case 'lorbit2':P.step(s,dt);if(!F.teiPlan)F.teiPlan=planTEI(F);F.cue='TEI';F.cueT=F.teiPlan.t-F.t;if(F.cueT<=0){F.ph='tei';ev(F,'tei','TRANS-EARTH INJECTION');}break;
 case 'tei':{const pr=P.primary(s);const v=Math.hypot(pr.vx,pr.vy);const ac=burn(F,'ship',V.ship.T,V.ship.isp,a,[pr.vx/v,pr.vy/v],dt);F.engN=a>0?3:0;P.step(s,dt,ac[0],ac[1]);const p2=P.primary(s),el=P.elems(p2);if(F.pr.ship<=0){F.ph='crashed';ev(F,'dry','OUT OF PROPELLANT');}
  if(el.e>1&&Math.sqrt(Math.max(0,el.v*el.v-2*P.muM/el.r))>=F.teiPlan.vinf){F.eng=0;F.engN=0;ev(F,'teico','TEI CUTOFF');F.ph='tcoast';F.tTEI=F.t;}}break;
 case 'tcoast':{P.step(s,dt);if(!F.mcc2&&F.t-F.tTEI>2*3600){const f=dv=>{const v=Math.hypot(s.vx,s.vy);return closestEarth({...s,vx:s.vx+dv*s.vx/v,vy:s.vy+dv*s.vy/v},5*86400)-60000;};let x1=0,bm=1e30,pv=null,px=0;for(let x=-400;x<=400;x+=8){const fx=f(x);if(isFinite(fx)&&Math.abs(fx)<bm){bm=Math.abs(fx);x1=x;}if(pv!==null&&isFinite(fx)&&isFinite(pv)&&Math.sign(fx)!==Math.sign(pv)){let lo=px,hi=x,fl=pv;for(let i=0;i<25;i++){const m=(lo+hi)/2,fm=f(m);if(Math.sign(fm)===Math.sign(fl)){lo=m;fl=fm;}else hi=m;}x1=(lo+hi)/2;break;}pv=fx;px=x;}const f1=f(x1);const v=Math.hypot(s.vx,s.vy);s.vx+=x1*s.vx/v;s.vy+=x1*s.vy/v;F.dvUsed.mcc2=Math.abs(x1);F.mcc2={dv:x1,miss:f1};ev(F,'mcc2','RETURN CORRECTION '+Math.abs(x1).toFixed(1)+' M/S');}
  const h=Math.hypot(s.x,s.y)-P.RE;F.cue='ENTRY';if(h<120000&&F.mcc2){F.ph='entry';F.vEI=Math.hypot(s.vx,s.vy);ev(F,'ei','ENTRY INTERFACE '+(F.vEI/1000).toFixed(1)+' KM/S');F.peakT=0;F.maxG=0;}}break;
 case 'entry':entry(F,dt);break;
 case 'flop':{const d=F.ds;DS.step(d,dt);F.dsH=d.h;F.eng=d.thr&&d.eng?d.thr:0;F.engN=d.eng||0;if(d.landed||d.crashed){F.ph=d.landed?'done':'crashed';ev(F,'end',d.landed?'TOUCHDOWN - EARTH':'LOST ON LANDING');F.dsTd={vh:d.vh,vx:d.vx,x:d.x};}}break;}}
function planTEI(F){const s0={...F.s};const per=2*Math.PI*Math.sqrt(Math.pow(P.elems(P.primary(s0)).a,3)/P.muM);let best={m:1e30,t:0};const s={...s0};
 const tryIt=(st,dv)=>{const pr=P.primary(st);const v=Math.hypot(pr.vx,pr.vy);return closestEarth({...st,vx:st.vx+dv*pr.vx/v,vy:st.vy+dv*pr.vy/v},6*86400);};
 for(let i=0;i<72;i++){const m=Math.abs(tryIt(s,850)-60000);if(m<best.m)best={m,t:s.t,st:{...s}};let r=per/72;while(r>0){const h=Math.min(r,P.maxDt(s));P.step(s,h);r-=h;}}
 let lo=800,hi=1100;const st=best.st;const f=dv=>tryIt(st,dv)-60000;let fl=f(lo);for(let i=0;i<25;i++){const m=(lo+hi)/2,fm=f(m);if(Math.sign(fm)===Math.sign(fl)){lo=m;fl=fm;}else hi=m;}
 const dv=(lo+hi)/2;const v0=Math.hypot(P.primary(st).vx,P.primary(st).vy);const r=Math.hypot(P.primary(st).x,P.primary(st).y);const v1=v0+dv;const vinf=Math.sqrt(Math.max(0,v1*v1-2*P.muM/r));
 const burnT=mass(F)*V.ship.isp*G0/(V.ship.T)*(1-Math.exp(-dv/(V.ship.isp*G0)));return{t:best.t-burnT/2+(best.t-burnT/2<F.t?per:0),dv,vinf,miss:best.m};}
function startDescent(F){const rp=P.RM+15000,ra=P.RM+NRHO_AP;const pr=P.primary(F.s);const el=P.elems(pr);const vNow=Math.sqrt(P.muM*(2/ra-1/((P.RM*2+NRHO_PE+NRHO_AP)/2)));const vNew=Math.sqrt(P.muM*(2/ra-2/(rp+ra)));F.dvUsed.nrhoDep=vNow-vNew;F.pr.ship-=mass(F)*(1-Math.exp(-F.dvUsed.nrhoDep/(V.ship.isp*G0)));ev(F,'dep','NRHO DEPARTURE '+F.dvUsed.nrhoDep.toFixed(0)+' M/S');
 const vp=Math.sqrt(P.muM*(2/rp-2/(rp+ra)));F.d={x:0,h:15000,vx:vp,vh:0,tgo:420,xt:0,mode:'auto',thr:0,pitch:0,th0:Math.atan2(pr.y,pr.x),tw:0,lt:false};F.d.xt=vp*F.d.tgo/2;F.ph='descent';ev(F,'pdi','BRAKING BURN - RAPTORS');}
function descent(F,inp,dt){const d=F.d,r=P.RM+d.h;const g=P.muM/(r*r)-d.vx*d.vx/r;const m=mass(F);const u=d.x-d.xt;const hT=d.h-MFL.terrainH(u);
 if(!d.lt&&hT<250&&Math.hypot(d.vx,d.vh)<40){d.lt=true;ev(F,'lt','LANDING THRUSTERS');}
 const Tm=d.lt?V.ship.lt.T:V.ship.T,isp=d.lt?V.ship.lt.isp:V.ship.isp;// Raptor vac ~40% deep throttle for braking
 let ax,ah;if(d.tgo>12){const tg=d.tgo;ax=6*(d.xt-d.x)/(tg*tg)-4*d.vx/tg;ah=6*(40-hT)/(tg*tg)-(4*d.vh-2)/tg+g;d.tgo-=dt;}else{ax=-d.vx*0.6-u*0.02;ah=g+((hT>15?-1.5:-0.8)-d.vh)*1.2;}
 if(inp.manual)d.mode='man';if(inp.fireEdge2&&d.mode==='man'){d.mode='auto';d.tgo=Math.max(12,Math.min(400,hT/Math.max(1,-d.vh)*0.8));d.xt=d.x+Math.max(0,d.vx)*d.tgo/2;}
 const A=Math.hypot(ax,ah);let thr=d.mode==='auto'?Math.min(1,A*m/Tm):inp.thr;let pitch=Math.atan2(ah,ax);if(d.mode==='man')pitch-= (inp.sx||0)*0.5;d.pitch=d.lt?Math.PI/2+Math.max(-0.4,Math.min(0.4,pitch-Math.PI/2)):pitch;
 let T=0;if(thr>0&&F.pr.ship>0){const md=Tm*thr/(isp*G0),b=Math.min(F.pr.ship,md*dt);F.pr.ship-=b;T=Tm*thr;F.dvUsed.descent=(F.dvUsed.descent||0)+T/m*dt;}
 F.eng=T>0?thr:0;F.engN=T>0?(d.lt?24:3):0;d.thr=thr;const pa=d.lt?Math.atan2(ah,ax):pitch;
 d.vx+=T/m*Math.cos(pa)*dt;d.vh+=(T/m*Math.sin(pa)-g)*dt;d.x+=d.vx*dt;d.h+=d.vh*dt;d.tw+=dt;const hg=d.h-MFL.terrainH(d.x-d.xt);d.hg=hg;
 if(hg<=0){d.h-=hg;const ok=d.vh>-3&&Math.abs(d.vx)<1.5;d.td={vh:d.vh,vx:d.vx,t:d.tw,prop:F.pr.ship};F.eng=0;F.engN=0;F.ph=ok?'landed':'crashed';ev(F,'land',ok?'TOUCHDOWN '+Math.abs(d.vh).toFixed(1)+' M/S':'HARD LANDING '+Math.abs(d.vh).toFixed(1)+' M/S');d.vx=d.vh=0;}}
function lascent(F,inp,dt){const d=F.d,r=P.RM+d.h;const g=P.muM/(r*r)-d.vx*d.vx/r;const m=mass(F);const Tm=V.ship.T*0.4;const aT=Tm/m;const vc=Math.sqrt(P.muM/r);
 let pitch=d.h-MFL.terrainH(d.x-d.xt)<150?Math.PI/2:Math.asin(Math.max(-0.3,Math.min(1,(2*(20000-d.h)/3600-2*d.vh/60+g)/aT)));const thr=inp.auto?1:inp.thr;let T=0;
 if(thr>0&&F.pr.ship>0){const md=Tm*thr/(V.ship.isp*G0),b=Math.min(F.pr.ship,md*dt);F.pr.ship-=b;T=Tm*thr;F.dvUsed.lascent=(F.dvUsed.lascent||0)+T/m*dt;}
 F.eng=T>0?thr:0;F.engN=T>0?3:0;d.pitch=pitch;d.vx+=T/m*Math.cos(pitch)*dt;d.vh+=(T/m*Math.sin(pitch)-g)*dt;d.x+=d.vx*dt;d.h+=d.vh*dt;d.tw+=dt;
 if(d.vx>=vc&&d.h>15000){// convert to Moon-centred inertial state for TEI
  const mp=P.moonPos(F.s.t);const th=d.th0+d.x/P.RM;const ux=Math.cos(th),uy=Math.sin(th);F.s.x=mp[0]+r*ux;F.s.y=mp[1]+r*uy;F.s.vx=mp[2]+d.vh*ux-d.vx*uy;F.s.vy=mp[3]+d.vh*uy+d.vx*ux;F.eng=0;F.engN=0;F.ph='lorbit2';F.tLO2=F.t;ev(F,'lo2','LUNAR ORBIT');F.d=null;}}
// Earth entry: planar, exponential atmosphere, belly CdA 500 m^2, lift L/D up to 0.35 modulated to cap g and avoid skip-out
function entry(F,dt){const s=F.s;const[ux,uy,r]=radial(s.x,s.y);const h=r-P.RE;const wx=s.vx+F.om*s.y,wy=s.vy-F.om*s.x,v=Math.hypot(wx,wy);const rho=1.225*Math.exp(-h/7200);const m=mass(F);const q=0.5*rho*v*v;const D=q*500/m;
 const vr=s.vx*ux+s.vy*uy;let LD=0.35;const want=h>75000?-60:-20;let lift=Math.max(-1,Math.min(1,(want-vr)*0.05));if(D/G0>3.5)lift=1;const L=D*LD*lift;
 const ax=-D*wx/v+L*ux,ay=-D*wy/v+L*uy;P.step(s,dt,ax,ay);F.q=q;F.gNow=Math.hypot(ax,ay)/G0;F.maxG=Math.max(F.maxG,F.gNow);F.heat=Math.min(1,Math.sqrt(rho)*Math.pow(v/7000,3)*1.5);F.vNow=v;
 if(h>130000&&vr>0){F.ph='crashed';ev(F,'skip','SKIPPED OUT');}
 if(h<20000){const vt=-wx*uy+wy*ux;F.ds=DS.create(Object.assign({},SHIPCFG,{dry:V.ship.dryHLS,mode:'ship',phase:'belly',h,vh:Math.min(-50,vr),vx:150,x:-2000,prop:Math.min(F.pr.ship,40000),auto:true,man:false,manThr:0,manAtt:90,manLat:0,assist:true}));F.ph='flop';ev(F,'flop','BELLY-FLOP - '+(v).toFixed(0)+' M/S');}}
return{V,create,update,mass,NRHO_PE,NRHO_AP};})();
if(typeof module!=='undefined')module.exports=MHLS;
