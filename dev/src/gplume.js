// ===== GPLUME: Starship/Raptor webcast-match extras: plume glow light, altitude plume blow-out, liftoff ground cloud + deluge steam (OLP), flicker =====
{const _u=updRocket;const _vacC=new THREE.Color(0.55,0.62,0.95);const L=new THREE.PointLight(0xffb070,0,900,1.6);const L2=new THREE.PointLight(0xffc890,0,400,1.8);
 updRocket=function(v,dt){const sk0=v.os&&v.os.kind==='starship';const fs0=fire.spawn;
  if(sk0)fire.spawn=window.__noFire?function(){}:function(p,vx,vy,vz,life,s0,s1,r,g,b,a,...rest){return fs0.call(fire,p,vx,vy,vz,life,s0,s1,1,0.6+Math.random()*0.12,0.34,(a==null?1:a)*0.14,...rest);}; // methalox afterburn: orange-white, translucent so the blue-violet core shows
  try{_u(v,dt);}finally{fire.spawn=fs0;}const os=v.os;if(!padRocket)return;const sk=os.kind==='starship',f9=os.kind==='falcon9';const st=os.stage;
  const on=os.launched&&os.engine&&os.stages[st]&&os.stages[st].prop>0;const h=os.h||0;const vac=sstep(3000,60000,h);
  if(L.parent!==padRocket){padRocket.add(L);padRocket.add(L2);}
  const base=sk?(st?69.6:-2.2):(st?44.6:-0.3);L.position.set(0,base-(sk?30:12),0);L2.position.set(0,base-4,0);
  const fl=0.85+Math.random()*0.3;const I=on?(sk?(st?1.2e4:5e4):2.5e4)*fl*(1-vac*0.8):0;L.intensity=I;L2.intensity=I*0.25;L.distance=sk?1400:700;
  // at altitude the plume blows out into a huge, faint bell
  if(on&&(sk||f9)){const p=PL[st];if(p){const wb=sk?THREE.NormalBlending:THREE.AdditiveBlending;if(p.material.blending!==wb){p.material.blending=wb;p.material.needsUpdate=true;}{const dt=!sk||h<1500;if(p.material.depthTest!==dt){p.material.depthTest=dt;p.material.depthWrite=false;p.material.needsUpdate=true;}}/* near pad: depth-test so the tower occludes the plume; at altitude skip it (far terrain/haze clipped the lower half) *//* starship plume: far terrain/haze depth-clipped its lower half */}if(p&&p.visible){const va=sstep(8000,40000,h);const k=(sk?1.8:1)+va*(sk?7:4);if(sk)p.scale.y*=1.6;p.scale.x*=k;p.scale.z*=k;p.scale.y*=1+va*1.5;const M=p.material;if(M.userData.op0===undefined){M.userData.op0=M.opacity;M.userData.c0=M.color?M.color.clone():null;}M.opacity=M.userData.op0*(1-0.6*va); // ship #15: vacuum plume fades to a faint, wide bell
   if(M.userData.c0){M.color.copy(M.userData.c0).lerp(_vacC,va*0.55);}}}
  // liftoff: massive ground cloud (dust/exhaust, brown-gray) + deluge steam (white) rolling outward
  if(on&&sk&&h<450&&typeof PAD!=='undefined'){const P=padRocket.position;const n=window.isTouch||(window.matchMedia&&matchMedia('(pointer:coarse)').matches)?(Math.random()<0.5?1:0):(h<150?3:1); // PREVIEW5: iOS overdraw cap
   for(let k=0;k<n;k++){const a=Math.random()*6.28,r=35+Math.random()*90,sp=25+Math.random()*45;const w=Math.random()<0.5; // one rolling bank: low, wide, outside the plume column
    smoke.spawn(_t.set(P.x+Math.cos(a)*r,P.y-h+2+Math.random()*5,P.z+Math.sin(a)*r),Math.cos(a)*sp,2+Math.random()*6,Math.sin(a)*sp,26,55,60,w?0.93:0.8,w?0.92:0.76,w?0.9:0.7,0.13,0.1,0.7);}}};}
window.__plDbg=()=>{const p=PL[0],q=PL[1];return {v0:p.visible,v1:q.visible,par:p.parent&&p.parent.type,s:p.scale.toArray().map(x=>+x.toFixed(1)),pos:p.position.toArray(),uI:p.material.uniforms.uI.value,bl:p.material.blending,dia:diamonds.visible,frag:p.material.fragmentShader.includes('core3')};};
window.__plSolo=(on)=>{diamonds.visible=!on&&diamonds.visible;window.__noFire=on;};
