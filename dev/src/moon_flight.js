// ===== moon_flight.js : Apollo-style mission logic (Saturn V ascent -> parking orbit -> TLI -> T&D -> coast/MCC -> LOI -> LM descent -> landing -> optional ascent) =====
// Pure logic, no THREE. Numbers: Saturn V / Apollo 11 press kit & flight evaluation report (see refs/saturnv/sources.txt).
const MFL=(()=>{const P=MPH,G0=P.G0;
const V={ // masses kg, thrust N (vac unless noted), isp s
 sic:{dry:131000,prop:2040000,Tsl:34020000,Tvac:38700000,ispSL:263,ispV:304,n:5},
 inter:{m:4600},sii:{dry:36200,prop:443000,T:5115000,isp:421,n:5},
 sivb:{dry:13500,prop:107500,T:1023000,isp:421},iu:{m:2000},
 les:{m:4200},sla:{m:1800},csm:{dry:11900,prop:18400,T:91200,isp:314},
 lm:{dsDry:2034,dsProp:8248,asDry:2445,asProp:2376,T:45040,isp:311,aT:15570,aIsp:311}};
const TLI_DV=3150,PEL=110000,R0=P.RE+185000;
function create(){const om=P.wE*Math.cos(28.6*Math.PI/180);// pad ground speed 408 m/s (KSC)
 return{t:0,ph:'pad',met:-1,launched:false,om,padA:0,s:{x:P.RE,y:0,vx:0,vy:P.RE*om,t:0},
  pr:{sic:V.sic.prop,sii:V.sii.prop,sivb:V.sivb.prop,csm:V.csm.prop,ds:V.lm.dsProp,as:V.lm.asProp},
  att:{les:1,inter:1,sic:1,sii:1,sivb:1,sla:1,lm:1,csm:1},eng:0,thr:0,thrDir:[1,0],dvUsed:{},events:[],ev:{},q:0,maxQ:0,warpHint:1,auto:true,mcc:null,cue:'',d:null,alpha:null,tli:null};}
function ev(F,k,txt){if(F.ev[k])return false;F.ev[k]=F.t;F.events.push({t:F.t,k,txt});return true;}
function mass(F){const a=F.att,p=F.pr;let m=0;if(a.sic)m+=V.sic.dry+p.sic;if(a.inter)m+=V.inter.m;if(a.sii)m+=V.sii.dry+p.sii;if(a.sivb)m+=V.sivb.dry+p.sivb+V.iu.m;if(a.les)m+=V.les.m;if(a.sla)m+=V.sla.m;if(a.csm)m+=V.csm.dry+p.csm;if(a.lm)m+=V.lm.dsDry+p.ds+V.lm.asDry+p.as;return m;}
function radial(s){const r=Math.hypot(s.x,s.y);return[s.x/r,s.y/r,r];}
// local frame: up u, east e (ccw)
function dirFromPitch(s,pitchDeg){const[ux,uy]=radial(s);const ex=-uy,ey=ux;const p=pitchDeg*Math.PI/180;return[ex*Math.cos(p)+ux*Math.sin(p),ey*Math.cos(p)+uy*Math.sin(p)];}
function burn(F,key,T,isp,thr,dir,dt){if(thr<=0||F.pr[key]<=0){F.eng=0;return[0,0];}const md=T*thr/(isp*G0);const b=Math.min(F.pr[key],md*dt);F.pr[key]-=b;const m=mass(F)+b/2;const a=T*thr/m*(b/(md*dt));F.dvUsed[F.ph]=(F.dvUsed[F.ph]||0)+a*dt;F.eng=thr;F.thrDir=dir;return[a*dir[0],a*dir[1]];}
// ---------- ascent ----------
const PITCH=[[0,90],[12,90],[30,84],[60,72],[90,58],[120,45],[140,36],[162,28]];
function pitchProg(t){for(let i=1;i<PITCH.length;i++)if(t<PITCH[i][0]){const a=PITCH[i-1],b=PITCH[i];return a[1]+(b[1]-a[1])*(t-a[0])/(b[0]-a[0]);}return 28;}
function closedLoopPitch(s,aT,hT){const[ux,uy,r]=radial(s);const vr=s.vx*ux+s.vy*uy,vt=-s.vx*uy+s.vy*ux;const g=P.muE/(r*r);const h=r-P.RE,tau=120;const av=2*(hT-h)/(tau*tau)-2*vr/tau;const need=av+g-vt*vt/r;return Math.asin(Math.max(-0.4,Math.min(0.95,need/Math.max(aT,0.1))))*180/Math.PI;}
function ascent(F,inp,dt){const s=F.s,met=F.met;let ax=0,ay=0;const thr=inp.thr;const[ux,uy,r]=radial(s);const h=r-P.RE;
 // drag vs rotating air
 const rho=h<100000?1.225*Math.exp(-h/7200):0;const wx=s.vx+F.om*s.y,wy=s.vy-F.om*s.x;const va=Math.hypot(wx,wy);F.q=0.5*rho*va*va;if(F.q>F.maxQ){F.maxQ=F.q;F.maxQt=met;}
 const m=mass(F);if(va>1){const D=F.q*(F.att.sic?62:F.att.sii?40:12)/m;ax-=D*wx/va;ay-=D*wy/va;}
 const bias=(inp.sy||0)*8;let a;
 if(F.att.sic){if(met>=135.2)ev(F,'ceco','CENTER ENGINE CUTOFF');const n=met>=135.2?4:5;const p=Math.exp(-h/7200);const T=(V.sic.Tvac+(V.sic.Tsl-V.sic.Tvac)*p)*n/5;
  const dir=dirFromPitch(s,pitchProg(met)+bias);a=burn(F,'sic',T,V.sic.ispV,thr,dir,dt);a[0]*=1;ax+=a[0];ay+=a[1];F.engN=thr>0?n:0;
  if(F.pr.sic<=0){ev(F,'oeco','S-IC CUTOFF');F.att.sic=0;F.sep={t:met};F.events.push({t:F.t,k:'drop',part:'sic'});ev(F,'sicsep','S-IC SEP');}}
 else if(F.att.sii){const gap=met-F.ev.sicsep_met;if(F.ev.sicsep&&F.sicSepMet==null)F.sicSepMet=met;
  if(met-F.sicSepMet<1.7){F.eng=0;F.engN=0;}else{ev(F,'siiign','S-II IGNITION');const n=met>=460.6?4:5;if(n===4)ev(F,'siiceco','S-II CENTER CUTOFF');const m0=mass(F);const aT=V.sii.T*n/5*thr/m0;
   const pit=met-F.sicSepMet<10?pitchProg(162):closedLoopPitch(s,aT,185000);a=burn(F,'sii',V.sii.T*n/5,V.sii.isp,thr,dirFromPitch(s,pit+bias),dt);ax+=a[0];ay+=a[1];F.engN=thr>0?n:0;
   if(met-F.sicSepMet>=29.8&&F.att.inter){F.att.inter=0;ev(F,'inter','INTERSTAGE JETTISON');F.events.push({t:F.t,k:'drop',part:'inter'});}
   if(met-F.sicSepMet>=35.2&&F.att.les){F.att.les=0;ev(F,'les','LES JETTISON');F.events.push({t:F.t,k:'drop',part:'les'});}
   if(F.pr.sii<=0){ev(F,'siioeco','S-II CUTOFF');F.att.sii=0;F.att.inter=0;F.att.les=0;F.siiSepMet=met;F.events.push({t:F.t,k:'drop',part:'sii'});ev(F,'siisep','S-II SEP');}}}
 else{if(met-F.siiSepMet<4){F.eng=0;F.engN=0;}else{ev(F,'sivbign','S-IVB IGNITION');const m0=mass(F);const aT=V.sivb.T*thr/m0;const pit=closedLoopPitch(s,aT,185000);a=burn(F,'sivb',V.sivb.T,V.sivb.isp,thr,dirFromPitch(s,pit+bias),dt);ax+=a[0];ay+=a[1];F.engN=thr>0?1:0;
  const vt=-s.vx*uy+s.vy*ux;const el=P.elems(P.primary(s));if(vt>=Math.sqrt(P.muE/r)*0.9995&&el.pe>150000){F.eng=0;F.engN=0;ev(F,'sivbco','S-IVB CUTOFF - ORBIT');enterParking(F);}}}
 if(F.launched){P.step(s,dt,ax,ay);}
 const rr=Math.hypot(s.x,s.y);if(F.launched&&rr<P.RE-5){F.ph='crashed';ev(F,'crash','VEHICLE LOST');}}
function enterParking(F){F.ph='parking';F.tIns=F.t;const s=F.s;if(F.alpha==null)F.alpha=P.solveTLI(R0,TLI_DV,PEL);
 const el=P.elems(P.primary(s));const n=Math.sqrt(P.muE/Math.pow(el.a,3));const m0=mass(F),ve=V.sivb.isp*G0;F.tliBurn=m0*ve/V.sivb.T*(1-Math.exp(-TLI_DV/ve));
 F.tIgn=F.t+900;const tc=F.tIgn+F.tliBurn/2;const phi=Math.atan2(s.y,s.x)+n*(tc-F.t);P.st.psi0=phi-F.alpha-P.nM*tc;
 F.apT=P.elems({mu:P.muE,R:P.RE,x:R0,y:0,vx:0,vy:Math.sqrt(P.muE/R0)+TLI_DV}).ap;}
function prograde(s,sign=1){const v=Math.hypot(s.vx,s.vy);return[sign*s.vx/v,sign*s.vy/v];}
// ---------- main update ----------
function update(F,inp,dtTotal){const fe=inp.fireEdge;inp.fireEdge=false;
 if(F.ph==='pad'){F.cue='LAUNCH';if(fe||inp.go){F.ph='count';F.met=-8.9;F.cueT=F.t;}}
 let rem=dtTotal;while(rem>1e-9){const dmax=F.ph==='ascent'||F.ph==='count'||F.ph==='tli'||F.ph==='loi'||F.ph==='descent'||F.ph==='lascent'?0.1:F.ph==='td'?0.1:P.maxDt(F.s);const dt=Math.min(rem,dmax);rem-=dt;sub(F,inp,dt);if(F.ph==='crashed'||F.ph==='landed'&&!fe)break;}}
function sub(F,inp,dt){const s=F.s;F.t+=dt;
 const a=inp.auto?autoThr(F):inp.thr;F.thrCmd=a;
 switch(F.ph){
 case 'count':F.met+=dt;F.cue='T'+(F.met<0?'-':'+')+Math.abs(F.met).toFixed(0);if(F.met>-8.9)ev(F,'ign','IGNITION SEQUENCE START');
  {const[ux,uy]=radial(s);F.padA+=F.om*dt;const c=Math.cos(F.padA),sn=Math.sin(F.padA);s.x=P.RE*c;s.y=P.RE*sn;s.vx=-P.RE*F.om*sn;s.vy=P.RE*F.om*c;s.t+=dt;F.engN=a>0?5:0;F.eng=a;
   if(a>0)F.pr.sic-=V.sic.Tsl*a/(V.sic.ispSL*G0)*dt*(F.met<-6?0.3:1);
   if(F.met>=0){if(a>0){F.ph='ascent';F.launched=true;ev(F,'liftoff','LIFTOFF');}else{F.met=0;F.cue='THROTTLE UP';}}}break;
 case 'ascent':F.met+=dt;ascent(F,{thr:a,sy:inp.sy},dt);break;
 case 'parking':P.step(s,dt);{const ti=F.tIgn-F.t;F.cue='TLI';F.cueT=ti;if(a>0&&ti<60){F.ph='tli';ev(F,'tliign','S-IVB RESTART - TLI');}}break;
 case 'tli':{const d=prograde(s);const ac=burn(F,'sivb',V.sivb.T,V.sivb.isp,a,d,dt);F.engN=a>0?1:0;P.step(s,dt,ac[0],ac[1]);const el=P.elems(P.primary(s));F.cue='TLI';F.cueDv=Math.max(0,TLI_DV-(F.dvUsed.tli||0));
  if(el.ap>=F.apT||F.pr.sivb<=0){F.eng=0;F.engN=0;ev(F,'tlico','TLI CUTOFF');F.tTLI=F.t;F.ph='td';F.tdT=0;}}break;
 case 'td':P.step(s,dt);F.tdT+=dt;F.cue='DOCK';if(F.tdT>3&&F.att.sla){F.att.sla=0;ev(F,'sla','SLA PANELS JETTISON');}if(F.tdT>34){ev(F,'dock','DOCKED - LM EXTRACTED');F.att.sivb=0;F.events.push({t:F.t,k:'drop',part:'sivb'});F.ph='coast';}break;
 case 'coast':{P.step(s,dt);if(!F.mcc&&F.t-F.tTLI>26*3600){F.mcc=doMCC(F);}const pr=P.primary(s);const el=P.elems(pr);F.cue=pr.b==='moon'?'LOI':'COAST';
  if(pr.b==='moon'){const m0=mass(F),ve=V.csm.isp*G0;const dvL=el.v-Math.sqrt(P.muM/(el.pe+P.RM));F.loiBurn=m0*ve/V.csm.T*(1-Math.exp(-dvL/ve));F.cueT=el.tPe-F.loiBurn/2;
   if(a>0&&F.cueT<120){F.ph='loi';ev(F,'loiign','LOI BURN');}
   if(el.alt<0){F.ph='crashed';ev(F,'crash','IMPACT');}}}break;
 case 'loi':{const pr=P.primary(s);const d=[-(pr.vx)/Math.hypot(pr.vx,pr.vy),-(pr.vy)/Math.hypot(pr.vx,pr.vy)];const ac=burn(F,'csm',V.csm.T,V.csm.isp,a,d,dt);F.engN=a>0?1:0;P.step(s,dt,ac[0],ac[1]);const el=P.elems(P.primary(s));F.cue='LOI';F.cueDv=null;
  if(el.e<1&&el.ap<=125000){F.eng=0;F.engN=0;ev(F,'loico','LUNAR ORBIT');F.ph='lorbit';F.tLO=F.t;}}break;
 case 'lorbit':P.step(s,dt);F.cue='UNDOCK';if(inp.fireEdge2||inp.go&&F.t-F.tLO>60){startDescent(F);}break;
 case 'descent':descent(F,inp,dt);break;
 case 'landed':if(inp.fireEdge2||F.wantAscent){F.wantAscent=false;F.ph='lascent';F.att.ds=0;ev(F,'asc','ASCENT STAGE LIFTOFF');}break;
 case 'lascent':lascent(F,inp,dt);break;}
 inp.fireEdge2=false;}
function autoThr(F){switch(F.ph){case 'count':case 'ascent':return 1;case 'tli':return 1;case 'loi':return 1;case 'parking':return F.tIgn-F.t<=0?1:0;case 'coast':return F.cueT!=null&&F.cue==='LOI'&&F.cueT<=0?1:0;case 'descent':return F.d?F.d.thrAuto:0;case 'lascent':return 1;default:return 0;}}
function doMCC(F){const s=F.s;const f=dv=>{const v=Math.hypot(s.vx,s.vy);const t={...s,vx:s.vx+dv*s.vx/v,vy:s.vy+dv*s.vy/v};return P.closest(t,5*86400).d-(P.RM+PEL);};
 let x0=0,x1=2,f0=f(x0),f1=f(x1);for(let i=0;i<12&&Math.abs(f1)>500;i++){const x2=x1-f1*(x1-x0)/(f1-f0);x0=x1;f0=f1;x1=Math.max(-150,Math.min(150,x2));f1=f(x1);}
 const v=Math.hypot(s.vx,s.vy);s.vx+=x1*s.vx/v;s.vy+=x1*s.vy/v;const ve=V.csm.isp*G0;F.pr.csm-=mass(F)*(1-Math.exp(-Math.abs(x1)/ve));F.dvUsed.mcc=Math.abs(x1);ev(F,'mcc','MIDCOURSE CORRECTION '+Math.abs(x1).toFixed(1)+' M/S');return{dv:x1,miss:f1};}
// ---------- LM powered descent (flat-local with curvature term) ----------
function terrainH(u){return 0;} // replaced by renderer (site-relative metres downrange)
function startDescent(F){F.att.csm=0;ev(F,'undock','LM UNDOCKED');const rp=P.RM+15000,ra=P.RM+PEL;const vp=Math.sqrt(P.muM*(2/rp-2/(rp+ra)));const vc=Math.sqrt(P.muM/ra);F.dvUsed.doi=vc-Math.sqrt(P.muM*(2/ra-2/(rp+ra)));F.pr.ds-=(V.lm.dsDry+F.pr.ds+V.lm.asDry+F.pr.as)*(1-Math.exp(-F.dvUsed.doi/(V.lm.isp*G0)));ev(F,'doi','DOI '+F.dvUsed.doi.toFixed(1)+' M/S');
 const pr=P.primary(F.s);F.d={x:0,h:15000,vx:vp,vh:0,tgo:640,xt:0,mode:'auto',thrAuto:0.9,pitch:0,th0:Math.atan2(pr.y,pr.x),t0:F.t,tw:0};F.d.xt=vp*F.d.tgo/2;F.ph='descent';ev(F,'pdi','POWERED DESCENT');}
function lmMass(F){return (F.att.ds!==0?V.lm.dsDry+F.pr.ds:0)+V.lm.asDry+F.pr.as;}
function descent(F,inp,dt){const d=F.d,r=P.RM+d.h;const g=P.muM/(r*r)-d.vx*d.vx/r;const m=lmMass(F);const aMax=V.lm.T/m;
 let ax,ah;const u=d.x-d.xt;const hT=d.h-MFL.terrainH(u);
 if(d.tgo>12){const tg=d.tgo;ax=6*(d.xt-d.x)/(tg*tg)-4*d.vx/tg;ah=6*(30-hT)/(tg*tg)-(4*d.vh+2*(-1))/tg+g;d.tgo-=dt;}
 else{ax=-d.vx*0.6-u*0.02;const vT=hT>12?-1.5:-0.7;ah=g+(vT-d.vh)*1.2;}
 let A=Math.hypot(ax,ah);d.thrAuto=Math.min(1,A/aMax);let pitch=Math.atan2(ah,ax);// angle of thrust from +x
 if(inp.manual){d.mode='man';}
 if(inp.fireEdge2&&d.mode==='man'){d.mode='auto';d.tgo=Math.max(12,Math.min(600,(hT)/Math.max(1,-d.vh)*0.8));d.xt=d.x+Math.max(0,d.vx)*d.tgo/2;}
 let thr=d.mode==='auto'?d.thrAuto:inp.thr;if(d.mode==='man'){pitch+=-(inp.sx||0)*0.5;}
 d.pitch=pitch;let T=0;if(thr>0&&F.pr.ds>0){const md=V.lm.T*thr/(V.lm.isp*G0);const b=Math.min(F.pr.ds,md*dt);F.pr.ds-=b;T=V.lm.T*thr*(b/(md*dt));F.dvUsed.pdi=(F.dvUsed.pdi||0)+T/m*dt;}
 F.eng=T>0?thr:0;F.engN=T>0?1:0;d.thr=thr;
 d.vx+=T/m*Math.cos(pitch)*dt;d.vh+=(T/m*Math.sin(pitch)-g)*dt;d.x+=d.vx*dt;d.h+=d.vh*dt;d.tw+=dt;
 const hg=d.h-MFL.terrainH(d.x-d.xt);d.hg=hg;
 if(hg<=0){d.h-=hg;const ok=d.vh>-3&&Math.abs(d.vx)<1.5;d.td={vh:d.vh,vx:d.vx,t:d.tw,prop:F.pr.ds};F.eng=0;F.engN=0;if(ok){F.ph='landed';ev(F,'land','CONTACT - LANDED '+Math.abs(d.vh).toFixed(1)+' M/S');}else{F.ph='crashed';ev(F,'crash','HARD LANDING '+Math.abs(d.vh).toFixed(1)+' M/S');}d.vx=d.vh=0;}}
function lascent(F,inp,dt){const d=F.d,r=P.RM+d.h;const g=P.muM/(r*r)-d.vx*d.vx/r;const m=lmMass(F);const vc=Math.sqrt(P.muM/r);const aT=V.lm.aT/m;
 let pitch;if(d.h-MFL.terrainH(d.x-d.xt)<90)pitch=Math.PI/2;else{const tau=60,av=2*(18000-d.h)/(tau*tau)-2*d.vh/tau;pitch=Math.asin(Math.max(-0.3,Math.min(1,(av+g)/aT)));}
 const thr=inp.auto?1:inp.thr;let T=0;if(thr>0&&F.pr.as>0){const md=V.lm.aT*thr/(V.lm.aIsp*G0);const b=Math.min(F.pr.as,md*dt);F.pr.as-=b;T=V.lm.aT*thr;F.dvUsed.lasc=(F.dvUsed.lasc||0)+T/m*dt;}
 F.eng=T>0?thr:0;F.engN=T>0?1:0;d.pitch=pitch;d.vx+=T/m*Math.cos(pitch)*dt;d.vh+=(T/m*Math.sin(pitch)-g)*dt;d.x+=d.vx*dt;d.h+=d.vh*dt;d.tw+=dt;
 if(d.vx>=vc&&d.h>15000){F.ph='lorbit2';F.eng=0;F.engN=0;ev(F,'ascorb','LUNAR ORBIT INSERTION');}}
return{V,create,update,mass,elems:P.elems,TLI_DV,terrainH,lmMass};})();
if(typeof module!=='undefined')module.exports=MFL;
