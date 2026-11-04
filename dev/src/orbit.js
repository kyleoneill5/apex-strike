//ORBIT-BEGIN

// ---- Descent / recovery sim (flat 2D near landing target; x = horizontal distance to target, h = height above landing surface) ----
const DS=(()=>{const G0=9.80665,RE=6371000;
function create(o){return Object.assign({t:0,phase:'flip',thr:0,att:90,eng:0,landed:false,crashed:false,events:[],auto:true,q:0,plasma:0,mach:0,leg:false,fins:false},o);}
function mass(s){return s.dry+s.prop;}
function physics(s,dt,lat){const r=RE+s.h;const g=G0*(RE/r)*(RE/r)-s.vx*s.vx/r;const rho=s.h<150000?1.225*Math.exp(-s.h/8500):0;const v=Math.hypot(s.vx,s.vh);
 s.q=0.5*rho*v*v;s.mach=v/(s.h<11000?340-0.0039*s.h:295);const cda=s.mode==='ship'&&(s.phase==='coast'||s.phase==='belly')?s.bellyCdA:s.CdA;
 const m=mass(s);let ax=0,ay=-g;if(v>0.1){const D=s.q*cda/m;ax-=D*s.vx/v;ay-=D*s.vh/v;}
 if(lat){const amax=Math.min(s.mode==='ship'?25:20,s.q*cda*0.4/m);ax+=Math.max(-amax,Math.min(amax,lat));}
 let T=0;if(s.thr>0&&s.eng>0&&s.prop>0){const p=Math.exp(-s.h/8500);const isp=s.ispVac+(s.ispSL-s.ispVac)*Math.min(1,p);const mdot=s.fEng*s.eng*s.thr/(s.ispVac*G0);const b=Math.min(s.prop,mdot*dt);s.prop-=b;T=mdot*isp*G0;
  const a=s.att*Math.PI/180;ax+=T/m*Math.cos(a);ay+=T/m*Math.sin(a);}
 s.vx+=ax*dt;s.vh+=ay*dt;s.x+=s.vx*dt;s.h+=s.vh*dt;s.t+=dt;s.g=Math.hypot(ax,ay+g)/G0;s.plasma=v>1800&&rho>1e-7&&rho<0.05?Math.min(1,(v-1800)/2500)*Math.min(1,rho*2e4):0;}
function impactX(s){const g=G0;const tf=(s.vh+Math.sqrt(Math.max(0,s.vh*s.vh+2*g*Math.max(0,s.h))))/g;return s.x+s.vx*tf;}
function step(s,dt){if(s.landed||s.crashed)return s;const ph=s.phase;let lat=0;const m=mass(s);const aMax=s.fEng*((s.landEngHi&&s.h>1200)?s.landEngHi:s.landEng)/m;
 const gl=G0;
 if(ph==='flip'){s.thr=0;s.eng=0;if(s.t>s.flipT)s.phase=s.mode==='ship'?'coast':(s.boostback?'boostback':'coast'),s.events.push(s.mode==='ship'?'ENTRY INTERFACE':'BOOSTBACK BURN');}
 else if(ph==='boostback'){const xi=impactX(s);s.eng=s.bbEng;s.thr=1;s.att=xi>s.aim?180:0;if(Math.abs(xi-s.aim)<500||s.prop<s.landProp*1.3||(xi>s.aim)!==(s._bbSign??(xi>s.aim))){s.thr=0;s.eng=0;s.phase='coast';s.events.push('BOOSTBACK CUTOFF - GRID FINS DEPLOYED');s.fins=true;}s._bbSign=s._bbSign??(xi>s.aim);}
 else if(ph==='coast'){s.thr=0;s.eng=0;s.att=90;const tgo=Math.max(5,s.h/Math.max(50,-s.vh));lat=-(s.x+s.vx*tgo)/(tgo*tgo)*2;
  if(s.mode==='ship'&&s.h<120000)s.phase='belly';
  if(s.mode==='booster'&&s.entryBurn&&s.vh<0&&s.h<s.entryAlt&&!s.didEntry){s.phase='entry';s.didEntry=true;s.events.push('ENTRY BURN');}
  if(s.mode==='booster'&&s.vh<0&&s.h<40000&&s.phase==='coast')s.phase='aero';}
 else if(ph==='entry'){s.eng=s.entryEng;s.thr=1;const v=Math.hypot(s.vx,s.vh);s.att=Math.atan2(-s.vh,-s.vx)*180/Math.PI;if(v<s.entryV||s.prop<s.landProp*1.2){s.thr=0;s.eng=0;s.phase='coast';s.events.push('ENTRY BURN SHUTDOWN');}}
 else if(ph==='aero'||ph==='belly'){if(s.mode==='ship'&&((s.h<30000&&!s.retarget)||(s.h<6000&&s.retarget===true))){s.x=-predictX(s);if(!s.retarget)s.events.push('TERMINAL GUIDANCE - LANDING ZONE LOCKED');s.retarget=s.retarget?2:true;}s.thr=0;s.eng=0;const tgo=Math.max(3,s.h/Math.max(30,-s.vh));lat=(-s.x/tgo-s.vx)*(s.mode==='ship'?1.2:0.4);
  const v=Math.hypot(s.vx,s.vh);const aLo=s.fEng*s.landEng/m;const dStop=v*v/(2*Math.max(1,aLo*0.6-gl))*1.05+(s.mode==='ship'?150:0);
  if((s.h<=dStop&&s.h<(s.landStartMax||9000))||s.h<(s.mode==='ship'?1500:300)){s.phase='landing';s.events.push(s.mode==='ship'?'FLIP & LANDING BURN':'LANDING BURN');s.leg=true;}}
 else if(ph==='landing'){s.eng=(s.landEngHi&&s.h>1200)?s.landEngHi:s.landEng;const aLow=s.fEng*s.landEng/m;const an=Math.max(1,aLow*0.6-gl);const vd=-Math.max(1.5,Math.sqrt(2*an*Math.max(0,s.h)));
  if(s.auto){const ay=gl+(vd-s.vh)*6;const tg=Math.max(2,s.h/Math.max(5,-s.vh)*1.6);const axL=Math.sqrt(Math.max(0,aMax*aMax-ay*ay))*0.9;const vxd=-Math.max(-40,Math.min(40,s.x*0.15));const ax=Math.max(-axL,Math.min(axL,(vxd-s.vx)*1.2))*(s.h<25?0.3:1);const mag=Math.hypot(ax,ay);
   s.thr=Math.max(s.minThr,Math.min(1,mag/aMax));if((mag/aMax<s.minThr||ay<=0)&&s.vh>vd)s.thr=s.h>300?0:s.minThr;s.att=Math.atan2(Math.max(ay,0.1),ax)*180/Math.PI;}
  if(s.h<60)s.leg=true;}
 if(ph==='landing'&&s.h<2500&&s.assist){const e=-(s.x*0.06+s.vx*0.7);s.vx+=Math.max(-8,Math.min(8,e))*dt;}
 if(s.man){s.thr=s.manThr<0.05?0:Math.max(s.minThr||0.4,s.manThr);s.eng=s.thr>0?(s.h>6000&&s.entryEng?s.entryEng:s.landEng):0;s.att=s.manAtt;lat=s.manLat||0;if(s.h<3000)s.leg=true;}
 physics(s,dt,lat);
 if(s.h<=0){s.h=0;s.td={vx:s.vx,vh:s.vh,x:s.x};const ok=Math.abs(s.vh)<7&&Math.abs(s.vx)<5&&Math.abs(s.x)<s.radius;if(ok){s.landed=true;s.events.push(s.successMsg);}else{s.crashed=true;s.events.push(Math.abs(s.x)>=s.radius?'MISSED THE TARGET - VEHICLE LOST':'HARD LANDING - VEHICLE LOST');}s.vx=s.vh=0;s.thr=0;}
 if(s.prop<=0&&s.phase==='landing'&&!s._fuelMsg){s._fuelMsg=1;s.events.push('OUT OF FUEL!');}
 return s;}
function predictX(s){const c=Object.assign({},s,{events:[],auto:true,x:0,t:Math.max(s.t,s.flipT+1)});c.lat0=1;let n=0;while(!c.landed&&!c.crashed&&n<200000&&c.phase!=='landing'){
  const ph=c.phase;if(ph==='flip'||ph==='coast'||ph==='belly'||ph==='aero'){c.thr=0;c.eng=0;physics(c,0.5,0);if(c.t>c.flipT&&ph==='flip')c.phase='coast';if(c.mode==='ship'&&c.h<120000)c.phase='belly';
   const v=Math.hypot(c.vx,c.vh);if(c.h<(c.mode==='ship'?1500:2500))break;}else break;n++;}return c.x;}
// build descent states from an orbital sep/handover state
function fromOrbit(os,mode,cfg){const r=Math.hypot(os.x,os.y);const h=r-RE;const vs=(os.x*os.vx+os.y*os.vy)/r;const vhI=(os.y*os.vx-os.x*os.vy)/r;const vx=vhI-7.2921159e-5*r;
 const dr=(Math.atan2(os.x,os.y)-7.2921159e-5*os.t)*RE;return Object.assign(create({mode,h,vh:vs,vx,dr}),cfg);}
return {create,step,fromOrbit,predictX,impactX,mass};})();

const OM = (()=>{
const MU=3.986004418e14, RE=6371000, G0=9.80665, OMEGA=7.2921159e-5;
const STAGES0=[
 {name:'S1',dry:25600,prop:395700,fvac:8227e3,ispSL:282,ispVac:311},
 {name:'S2',dry:4000,prop:92670,fvac:981e3,ispSL:300,ispVac:348}];
const PAYLOAD=10000, FAIRING=1900;
const CFG={
 rocket:{stages:STAGES0,payload:PAYLOAD,fairing:FAIRING,area:10.5,target:200000},
 falcon9:{stages:[{name:'B1',dry:25600,prop:411000,reserve:34000,fvac:8227e3,ispSL:282,ispVac:311,engines:9},{name:'S2',dry:4000,prop:111500,fvac:981e3,ispSL:300,ispVac:348,engines:1}],payload:15000,fairing:1900,area:10.5,target:200000,recover:'droneship'},
 starship:{stages:[{name:'SH',dry:200000,prop:3400000,reserve:450000,fvac:80800e3,ispSL:327,ispVac:350,engines:33},{name:'SS',dry:120000,prop:1200000,fvac:14700e3,ispSL:330,ispVac:375,engines:6}],payload:50000,fairing:0,area:63.6,target:200000,recover:'tower',hot:true},
};
function create(kind='rocket'){const c=CFG[kind];
  return {kind,cfg:c,x:0,y:RE,vx:OMEGA*RE,vy:0,t:0,stages:c.stages.map(s=>({...s})),stage:0,fairing:c.fairing>0,payload:c.payload,
    engine:false,throttle:1,pitch:90,cmdPitch:90,auto:true,launched:false,q:0,maxQ:0,gforce:1,mach:0,
    orbit:false,events:[],apo:0,peri:-RE,h:0,vs:0,vh:0,speed:0,landed:true,crashed:false,karman:false,maxQPassed:false,meco:false};
}
function mass(s){let m=s.payload+(s.fairing?s.cfg.fairing:0);for(let i=s.stage;i<s.stages.length;i++)m+=s.stages[i].dry+s.stages[i].prop;return m;}
function elements(s){const r=Math.hypot(s.x,s.y),v2=s.vx*s.vx+s.vy*s.vy;const E=v2/2-MU/r;const hA=s.x*s.vy-s.y*s.vx;
  const e=Math.sqrt(Math.max(0,1+2*E*hA*hA/(MU*MU)));if(E>=0)return{apo:Infinity,peri:(hA*hA/MU)/(1+e)-RE,e,a:Infinity,hA};
  const a=-MU/(2*E);return{apo:a*(1+e)-RE,peri:a*(1-e)-RE,e,a,hA};}
function atmo(h){if(h>150000)return{rho:0,p:0};const rho=1.225*Math.exp(-h/8500);return{rho,p:Math.exp(-h/8500)};}
function sound(h){return h<11000?340-0.0039*h:295;}
function stageSep(s){if(s.stage<s.stages.length-1){s.stage++;s.events.push(s.cfg.hot?'HOT STAGING - SEPARATION':'STAGE SEPARATION');s.sepState={x:s.x,y:s.y,vx:s.vx,vy:s.vy,t:s.t,prop:s.stages[s.stage-1].prop};return true;}return false;}
function step(s,dt){
  const r=Math.hypot(s.x,s.y),h=r-RE;const ux=s.x/r,uy=s.y/r;const ex=uy,ey=-ux; // up, east(horizontal prograde)
  let m=mass(s);let ax=-MU*s.x/(r*r*r),ay=-MU*s.y/(r*r*r);
  // atmosphere-relative velocity
  const vax=s.vx-OMEGA*s.y,vay=s.vy+OMEGA*s.x;const vr=Math.hypot(vax,vay);
  const {rho,p}=atmo(h);const q=0.5*rho*vr*vr;const a_s=sound(h);const M=vr/a_s;
  const cd=M<0.8?0.3:M<1.2?0.3+0.25*(M-0.8)/0.4:Math.max(0.25,0.55-0.08*(M-1.2));
  const area=s.cfg.area;let fx=0,fy=0;
  if(vr>0.01){const D=q*cd*area;fx-=D*vax/vr;fy-=D*vay/vr;}
  // guidance
  if(s.auto&&s.launched&&s.engine)guide(s,h,q);
  // pitch rate limit
  const rate=s.auto?4:12;const dp=s.cmdPitch-s.pitch;s.pitch+=Math.max(-rate*dt,Math.min(rate*dt,dp));
  let thr=0;const st=s.stages[s.stage];
  const rsv=(st&&st.reserve)||0;
  if(s.retro&&st&&st.prop>rsv){const sp=Math.hypot(s.vx,s.vy);const mdot=st.fvac/(st.ispVac*G0)*0.4;st.prop-=mdot*dt;const T=mdot*st.ispVac*G0;fx-=T*s.vx/sp;fy-=T*s.vy/sp;thr=T;}
  else if(s.engine&&st&&st.prop>rsv&&s.throttle>0){
    const isp=st.ispVac+(st.ispSL-st.ispVac)*p;const mdot=st.fvac/(st.ispVac*G0)*s.throttle;
    let burn=mdot*dt;if(burn>st.prop-rsv)burn=st.prop-rsv;st.prop-=burn;thr=mdot*isp*G0;
    const pr=s.pitch*Math.PI/180;const dx=Math.cos(pr)*ex+Math.sin(pr)*ux,dy=Math.cos(pr)*ey+Math.sin(pr)*uy;
    fx+=thr*dx;fy+=thr*dy;if(st.prop<=rsv){s.engine=s.auto?s.engine:false;s.events.push(s.stage===0?'MECO - STAGE 1 DEPLETED':'SECO - FUEL DEPLETED');}
  }
  ax+=fx/m;ay+=fy/m;
  // ground contact
  if(s.landed){const nf=ax*ux+ay*uy;if(nf<=0&&!s.launched){s.vx=OMEGA*s.y;s.vy=-OMEGA*s.x;s.gforce=1;s.q=0;return upd(s,h,q,M);}
    if(nf>0)s.landed=false;}
  s.vx+=ax*dt;s.vy+=ay*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.t+=dt;
  s.gforce=Math.hypot(fx,fy)/m/G0;
  const r2=Math.hypot(s.x,s.y);if(r2<RE&&s.launched){s.crashed=true;s.x=s.x/r2*RE;s.y=s.y/r2*RE;s.vx=s.vy=0;}
  return upd(s,h,q,M);
}
function upd(s,h,q,M){s.h=h;s.q=q;s.mach=M;if(q>s.maxQ)s.maxQ=q;else if(s.maxQ>15000&&!s.maxQPassed&&q<s.maxQ*0.95){s.maxQPassed=true;s.events.push('MAX-Q PASSED '+(s.maxQ/1000).toFixed(1)+' kPa');}
  const r=Math.hypot(s.x,s.y);s.vs=(s.x*s.vx+s.y*s.vy)/r;s.vh=(s.y*s.vx-s.x*s.vy)/r;s.speed=Math.hypot(s.vx,s.vy);
  const el=elements(s);s.apo=el.apo;s.peri=el.peri;s.ecc=el.e;s.a=el.a;
  if(!s.karman&&h>100000){s.karman=true;s.events.push('KÁRMÁN LINE (100 km) - SPACE!');}
  if(s.fairing&&h>110000&&s.cfg.fairing){s.fairing=false;s.events.push('FAIRING JETTISON');}
  if(!s.orbit&&s.peri>100000&&s.launched){s.orbit=true;s.events.push('ORBIT ACHIEVED');}
  return s;}
const TARGET=200000;
function guide(s,h,q){const TARGET=s.cfg.target;
  const st=s.stages[s.stage];
  if(s.stage===0){
    if(h<1200)s.cmdPitch=90;else{const f=Math.min(1,(h-1200)/62000);s.cmdPitch=90-62*Math.pow(f,0.55);}
    s.throttle=q>30000?0.72:1;
    if(st.prop<=(st.reserve||0)){if(!s._sepT)s._sepT=s.t;if(s.t-s._sepT>(s.cfg.hot?0:2)){stageSep(s);s._sepT=0;}}
  }else{
    s.throttle=1;const r=RE+h;const vc=Math.sqrt(MU/r);
    const vsDes=Math.max(-150,Math.min(400,(TARGET-h)*0.012));
    const st2=s.stages[s.stage];const m=mass(s);const aT=st2.fvac/m;
    const need=(vsDes-s.vs)*0.06+(MU/(r*r)-s.vh*s.vh/r);
    let sp=need/aT;sp=Math.max(-0.4,Math.min(0.95,sp));s.cmdPitch=Math.asin(sp)*180/Math.PI;s.pitch=s.cmdPitch;
    if(s.peri>TARGET-25000||(s.vh>vc*1.002&&s.peri>110000)){if(s.engine){s.engine=false;s.meco=true;s.events.push('SECO - ENGINE CUTOFF');}}
  }
}
function launch(s){if(s.launched)return;s.launched=true;s.engine=true;s.events.push('LIFTOFF!');}
return {DS,CFG,MU,RE,G0,OMEGA,create,step,launch,stageSep,elements,mass,PAYLOAD};
})();
//ORBIT-END
