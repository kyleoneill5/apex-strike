// ===== C6_WIRE c6_wire.js (Nov 3): PPL deck crews on US + Red ships. No core edits.
window.__c6={DEFS,spawn:k=>spawn(k),get player(){return player}};
(()=>{if(typeof THREE==='undefined'||!window.PPL||!PPL.crew)return;const T=THREE;const rc=new T.Raycaster();
 function deck(m,fx,fz){m.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(m);const p=new T.Vector3(fx,0,fz).applyMatrix4(m.matrixWorld);
  rc.set(new T.Vector3(p.x,bb.max.y+5,p.z),new T.Vector3(0,-1,0));rc.far=bb.max.y+20;const h=rc.intersectObject(m,true).find(x=>x.object.visible&&x.point.y>0.5);if(!h)return null;return m.worldToLocal(h.point.clone());}
 function man(m,L,kind,n){const at=[];for(let i=0;i<n*3&&at.length<n;i++){const q=deck(m,(Math.random()-0.5)*L*0.12,(Math.random()*0.8-0.5)*L);if(q)at.push(q);}
  if(!at.length)return 0;const s=1/(m.scale.x||1);try{PPL.crew(m,{n:at.length,pose:'stand',kind,at,scale:s});}catch(e){console.warn('c6 crew',e);return 0;}return at.length;}
 const go=()=>{let n=0;try{if(typeof NAVY_FLEET!=='undefined')for(const s of NAVY_FLEET.ships)n+=man(s.m,s.m.userData.L||150,'crew',4);}catch(e){console.warn(e);}
  try{if(window.__red)for(const u of __red.E)if(u.kind==='ship'&&u.mesh)n+=man(u.mesh,u.L||120,'enemy',3);}catch(e){console.warn(e);}window.__c6crew=n;};
 setTimeout(()=>PPL.onReady(go),1500);})();
