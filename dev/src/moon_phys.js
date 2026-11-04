// ===== moon_phys.js : Earth-Moon mission physics (real constants, planar restricted 3-body, Earth-centred frame) =====
const MPH=(()=>{
const muE=3.986004418e14,muM=4.9048695e12,RE=6371000,RM=1737400,aM=384400000,G0=9.80665;
const nM=Math.sqrt((muE+muM)/(aM*aM*aM)),SOI=66100000,wE=7.2921159e-5;
const st={psi0:0};
function moonPos(t,o){const a=st.psi0+nM*t;o=o||[0,0,0,0];o[0]=aM*Math.cos(a);o[1]=aM*Math.sin(a);o[2]=-aM*nM*Math.sin(a);o[3]=aM*nM*Math.cos(a);return o;}
const _m=[0,0,0,0];
// accel on craft in Earth-centred frame incl. indirect term
function grav(x,y,t,out){moonPos(t,_m);const r2=x*x+y*y,r=Math.sqrt(r2),dx=x-_m[0],dy=y-_m[1],d2=dx*dx+dy*dy,d=Math.sqrt(d2),rm3=aM*aM*aM;
 out[0]=-muE*x/(r2*r)-muM*(dx/(d2*d)+_m[0]/rm3);out[1]=-muE*y/(r2*r)-muM*(dy/(d2*d)+_m[1]/rm3);return out;}
const k=[[0,0],[0,0],[0,0],[0,0]],ga=[0,0];
// RK4 step; s={x,y,vx,vy,t}; ax,ay = extra (thrust) accel
function step(s,dt,ax=0,ay=0){const x=s.x,y=s.y,vx=s.vx,vy=s.vy,t=s.t;
 grav(x,y,t,ga);const a1x=ga[0]+ax,a1y=ga[1]+ay;
 grav(x+vx*dt/2,y+vy*dt/2,t+dt/2,ga);const a2x=ga[0]+ax,a2y=ga[1]+ay;const v2x=vx+a1x*dt/2,v2y=vy+a1y*dt/2;
 grav(x+v2x*dt/2,y+v2y*dt/2,t+dt/2,ga);const a3x=ga[0]+ax,a3y=ga[1]+ay;const v3x=vx+a2x*dt/2,v3y=vy+a2y*dt/2;
 grav(x+v3x*dt,y+v3y*dt,t+dt,ga);const a4x=ga[0]+ax,a4y=ga[1]+ay;const v4x=vx+a3x*dt,v4y=vy+a3y*dt;
 s.x+=dt/6*(vx+2*v2x+2*v3x+v4x);s.y+=dt/6*(vy+2*v2y+2*v3y+v4y);s.vx+=dt/6*(a1x+2*a2x+2*a3x+a4x);s.vy+=dt/6*(a1y+2*a2y+2*a3y+a4y);s.t+=dt;return s;}
function maxDt(s){moonPos(s.t,_m);const r=Math.hypot(s.x,s.y),d=Math.hypot(s.x-_m[0],s.y-_m[1]);return Math.max(0.5,0.006*Math.min(Math.sqrt(r*r*r/muE),Math.sqrt(d*d*d/muM)));}
// 2-body elements relative to the dominant body
function primary(s){moonPos(s.t,_m);const dx=s.x-_m[0],dy=s.y-_m[1];if(Math.hypot(dx,dy)<SOI)return{b:'moon',mu:muM,R:RM,x:dx,y:dy,vx:s.vx-_m[2],vy:s.vy-_m[3]};return{b:'earth',mu:muE,R:RE,x:s.x,y:s.y,vx:s.vx,vy:s.vy};}
function elems(p){const r=Math.hypot(p.x,p.y),v2=p.vx*p.vx+p.vy*p.vy,h=p.x*p.vy-p.y*p.vx,E=v2/2-p.mu/r,a=-p.mu/(2*E);
 const ex=(p.vy*h)/p.mu-p.x/r,ey=(-p.vx*h)/p.mu-p.y/r,e=Math.hypot(ex,ey);const rp=a*(1-e),ra=e<1?a*(1-e):0;
 const pe=(h*h/p.mu)/(1+e)-p.R,ap=e<1?a*(1+e)-p.R:Infinity;
 // time to periapsis (elliptic or hyperbolic)
 let tPe=NaN;const rv=p.x*p.vx+p.y*p.vy;
 if(e<1&&e>1e-6){const n=Math.sqrt(p.mu/(a*a*a));const cE=(1-r/a)/e,sE=rv/(e*Math.sqrt(p.mu*a));const EA=Math.atan2(sE,cE);let M=EA-e*Math.sin(EA);tPe=((2*Math.PI-M)%(2*Math.PI))/n;}
 else if(e>1){const n=Math.sqrt(p.mu/(-a*-a*-a));const cH=(1-r/a)/e,sH=rv/(e*Math.sqrt(-p.mu*a));const H=Math.asinh(sH);const M=e*Math.sinh(H)-H;tPe=-M/n;}
 return{a,e,pe,ap,h,r,v:Math.sqrt(v2),tPe,alt:r-p.R};}
// coast propagation returning closest lunar approach
function closest(s0,tmax){const s={...s0};let best=1e20,bt=0,tEnd=s.t+tmax;while(s.t<tEnd){const dt=maxDt(s)*2;step(s,dt);moonPos(s.t,_m);const d=Math.hypot(s.x-_m[0],s.y-_m[1]);if(d<best){best=d;bt=s.t;}else if(d<SOI&&d>best*1.05)break;if(Math.hypot(s.x,s.y)<RE)break;}return{d:best,t:bt};}
// find relative craft-moon phase angle for an impulsive prograde TLI from circular LEO hitting periselene target
function solveTLI(r0,dv,peT){const v0=Math.sqrt(muE/r0);const f=al=>{st.psi0=0;const s={x:r0*Math.cos(al),y:r0*Math.sin(al),vx:-(v0+dv)*Math.sin(al),vy:(v0+dv)*Math.cos(al),t:0};return closest(s,6*86400).d-(RM+peT);};
 let prev=null,pa=0,res=null;for(let deg=100;deg<=260;deg+=1){const al=deg*Math.PI/180,v=f(al);if(prev!==null&&Math.sign(v)!==Math.sign(prev)&&Math.abs(v)<5e7&&Math.abs(prev)<5e7){let lo=pa,hi=al,flo=prev;for(let i=0;i<30;i++){const m=(lo+hi)/2,fm=f(m);if(Math.sign(fm)===Math.sign(flo)){lo=m;flo=fm;}else hi=m;}res=(lo+hi)/2;break;}prev=v;pa=al;}
 return res;}// craft angle - moon angle at burn (moon at angle 0 frame => craft at al)
return{muE,muM,RE,RM,aM,nM,SOI,wE,G0,st,moonPos,grav,step,maxDt,primary,elems,closest,solveTLI};})();
if(typeof module!=='undefined')module.exports=MPH;
