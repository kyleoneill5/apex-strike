// ---------- game state ----------
const DEFS={
 fighter:{name:'F-35 Lightning II',desc:'Stealth multirole fighter. Gun, AAM, hypersonic missile, nuclear gravity bomb.',cls:'air',thrust:34,vstall:62,vrot:72,dragK:9e-5,weapons:['GUN','AAM','HYPERSONIC','NUKE']},
 fa18:{name:'F/A-18 Super Hornet',desc:'Carrier-based fighter. Spawns on the carrier deck.',cls:'air',fa18:true,thrust:30,vstall:58,vrot:66,dragK:1e-4,weapons:['GUN','AAM','HYPERSONIC','NUKE']},
 darkstar:{name:'SR-72 Darkstar',desc:'Hypersonic Mach 10 scramjet spyplane. Climb high and go fast!',cls:'air',thrust:95,vstall:95,vrot:92,dragK:5e-6,noRho:true,ceil:32000,col:0x15171a,weapons:['GUN','HYPERSONIC','NUKE']},
 heli:{name:'AH-64 Attack Helicopter',desc:'Hover with throttle ~50%. Gun, rockets, AAM.',cls:'heli',weapons:['GUN','ROCKETS','AAM']},
 destroyer:{name:'Arleigh Burke Destroyer',desc:'Guided-missile destroyer. Gun, SAM, hypersonic, torpedoes.',cls:'ship',maxSpd:16,turn:0.07,camD:190,camH:55,weapons:['GUN','SAM','HYPERSONIC','TORPEDO']},
 carrier:{name:'Nimitz Aircraft Carrier',desc:'Supercarrier. CIWS gun and SAMs. Very slow turning.',cls:'ship',maxSpd:15,turn:0.025,camD:420,camH:120,weapons:['CIWS','SAM']},
 sub:{name:'Ohio-class Submarine',desc:'Dive/surface, torpedoes, hypersonic and SLBM nuclear missile.',cls:'sub',maxSpd:12,turn:0.05,camD:130,camH:30,weapons:['TORPEDO','HYPERSONIC','SLBM']},
 silo:{name:'ICBM Silo',desc:'Launch a Minuteman-style ICBM on a ballistic arc to the enemy range 40 km away.',cls:'silo',weapons:['ICBM']},
 rocket:{name:'Orbital Launch Vehicle',desc:'Two-stage rocket. Real orbital mechanics: reach orbit (7.8 km/s).',cls:'rocket',rk:'rocket',weapons:[]},
 falcon9:{name:'Falcon 9',desc:'9 Merlins. Reach orbit, then fly the booster back: boostback, entry & landing burns onto the drone ship.',cls:'rocket',rk:'falcon9',weapons:[]},
 starship:{name:'Starship + Super Heavy',desc:'33 Raptors, hot staging, chopsticks catch, orbit, belly-flop reentry & flip landing.',cls:'rocket',rk:'starship',weapons:[]},
};
const AMMO={GUN:600,CIWS:2000,AAM:6,SAM:16,HYPERSONIC:4,NUKE:2,ROCKETS:38,TORPEDO:12,SLBM:2,ICBM:3};
const G=9.81;let player=null,paused=true,camMode=0,score=0,simT=0,shake=0,warp=1,msgT=0;
const inp={pitch:0,roll:0,yaw:0,throttle:0,fire:false,firePrev:false,joyActive:false};
const projs=[],targets=[],nukes=[];let camFollow=null,blastCam=null;
function msg(t,dur=3){$('msg').textContent=t;$('msg').style.opacity=1;msgT=dur;}
const fwdOf=(q,o=V3())=>o.set(0,0,-1).applyQuaternion(q),upOf=(q,o=V3())=>o.set(0,1,0).applyQuaternion(q),rightOf=(q,o=V3())=>o.set(1,0,0).applyQuaternion(q);
const _f=V3(),_u=V3(),_r=V3(),_a=V3(),_t=V3(),_q=new THREE.Quaternion(),_e=new THREE.Euler();
function groundAt(x,z){ // returns {h,type}
 const bh=cityH(x,z);if(bh>0)return{h:bh,type:'bldg'};
 const cp=fleetCarrier.position;_t.set(x-cp.x,0,z-cp.z).applyAxisAngle(V3(0,1,0),-fleetCarrier.rotation.y);
 if(fleetCarrier.visible&&Math.abs(_t.x-6)<38&&Math.abs(_t.z+5)<165)return{h:cp.y+21,type:'deck'};
 const h=terrainH(x,z);if(h>0.5)return{h,type:'land'};return{h:0,type:'water',bed:h};}
// ---------- targets ----------
function placeBoat(t,c){for(let k=0;k<30;k++){const a=Math.random()*6.28,r=c.r0+Math.random()*(c.r1-c.r0);const x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r;if(terrainH(x,z)<-15){t.pos.set(x,0,z);return;}}t.pos.set(c.x+c.r1,0,c.z);}
const ZONES=[{x:0,z:0,r0:4500,r1:9000},{x:ENEMY.x,z:ENEMY.z,r0:600,r1:3500}];
function spawnTarget(kind,zone){const t={kind,zone,mesh:kind==='boat'?boat():drone(),pos:V3(),vel:V3(),hdg:Math.random()*6.28,alive:true,resp:0,phase:Math.random()*6.28};
 respawnTarget(t);scene.add(t.mesh);targets.push(t);}
function respawnTarget(t){const c=ZONES[t.zone];t.alive=true;t.mesh.visible=true;if(t.kind==='boat'){placeBoat(t,c);t.spd=6+Math.random()*6;}else{t.cx=c.x+rnd(c.r1);t.cz=c.z+rnd(c.r1);t.R=500+Math.random()*900;t.alt=250+Math.random()*700;t.spd=40+Math.random()*25;}}
for(let i=0;i<9;i++)spawnTarget('boat',0);for(let i=0;i<6;i++)spawnTarget('drone',0);for(let i=0;i<8;i++)spawnTarget('boat',1);for(let i=0;i<3;i++)spawnTarget('drone',1);
function killTarget(t,big){if(!t.alive)return;t.alive=false;t.mesh.visible=false;t.resp=25;explosion(t.pos,t.kind==='boat'?2.5:1.5);score+=t.kind==='boat'?100:150;}
function updTargets(dt){for(const t of targets){if(!t.alive){t.resp-=dt;if(t.resp<=0)respawnTarget(t);continue;}
 if(t.kind==='boat'){const ax=t.pos.x-Math.sin(t.hdg)*200,az=t.pos.z-Math.cos(t.hdg)*200;if(terrainH(ax,az)>-8)t.hdg+=0.6*dt;else t.hdg+=Math.sin(simT*0.1+t.phase)*0.05*dt;
  t.vel.set(-Math.sin(t.hdg)*t.spd,0,-Math.cos(t.hdg)*t.spd);t.pos.addScaledVector(t.vel,dt);t.pos.y=waveH(t.pos.x,t.pos.z,simT)*0.7;t.mesh.position.copy(t.pos);t.mesh.rotation.set(Math.sin(simT+t.phase)*0.04,t.hdg,Math.sin(simT*0.8+t.phase)*0.05);
  if(Math.random()<dt*4)smoke.spawn(_t.copy(t.pos).addScaledVector(t.vel,-1.4).setY(0.5),rnd(1),1,rnd(1),2,3,3,0.9,0.95,1,0.5,0.5,0);}
 else{t.phase+=dt*t.spd/t.R;const x=t.cx+Math.cos(t.phase)*t.R,z=t.cz+Math.sin(t.phase)*t.R;t.vel.set(-Math.sin(t.phase),0,Math.cos(t.phase)).multiplyScalar(t.spd);t.pos.set(x,t.alt+Math.sin(t.phase*3)*20,z);
  t.mesh.position.copy(t.pos);t.mesh.lookAt(_t.copy(t.pos).sub(t.vel));t.mesh.rotateZ(0.4);}}}
function nearestTarget(p,dir,kinds,maxD=12000,cone=0.6){let best=null,bd=1e9;for(const t of targets){if(!t.alive||!kinds.includes(t.kind))continue;_t.copy(t.pos).sub(p);const d=_t.length();if(d>maxD)continue;
 const c=dir?_t.dot(dir)/d:1;if(c<cone)continue;const s=d*(2-c);if(s<bd){bd=s;best=t;}}return best;}
