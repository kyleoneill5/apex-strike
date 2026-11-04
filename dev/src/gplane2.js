// ---------- Aircraft detail: animated stabilators/flaperons, retractable gear, cockpit interior ----------
function rigJet(g,kind){if(g.userData.rig)return g;g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert();const surf=[];const bb=new THREE.Box3(),c=new THREE.Vector3(),sz=new THREE.Vector3();
 for(const o of [...g.children]){if(!o.isMesh||!o.geometry)continue;bb.setFromObject(o).applyMatrix4(inv);bb.getCenter(c);bb.getSize(sz);
  const thin=sz.y<0.45&&sz.x>0.8&&sz.x<5;if(!thin||Math.abs(c.x)<1.0)continue;let type=null;
  if(c.z>4.2&&sz.x<4.5)type='stab';else if(c.z>2&&c.z<6&&sz.z<1.2)type='flap';if(!type)continue;
  const piv=new THREE.Group();piv.position.set(0,c.y,bb.min.z);g.add(piv);o.position.sub(piv.position);g.remove(o);piv.add(o);surf.push({piv,type,s:Math.sign(c.x)});}
 // landing gear (nose + 2 mains), oleo struts + tires
 const gear=new THREE.Group();const st=M(0xb8bcc0,{metalness:0.7,roughness:0.35}),ty=M(0x151515,{roughness:0.9});
 const L=kind==='sr71'?1.9:1.45;for(const [x,z,r] of [[0,kind==='sr71'?-9:-5.6,0.3],[-1.6*(kind==='sr71'?2:1),1.2,0.38],[1.6*(kind==='sr71'?2:1),1.2,0.38]]){add(gear,new THREE.CylinderGeometry(0.07,0.09,L,8),st,x,-0.55-L/2,z);
  add(gear,new THREE.CylinderGeometry(r,r,0.22,18).rotateZ(Math.PI/2),ty,x,-0.55-L,z);add(gear,new THREE.CylinderGeometry(r*0.55,r*0.55,0.24,12).rotateZ(Math.PI/2),st,x,-0.55-L,z);
  const door=add(gear,new THREE.BoxGeometry(0.04,0.8,1.4),M(0x6b737c),x+0.3,-0.75,z);}
 g.add(gear);
 // cockpit interior: ejection seat, headrest, glare shield, HUD combiner, MFD glow
 const ck=new THREE.Group();const cz=kind==='sr71'?-9.2:kind==='fa18'?-5.6:kind==='f35'||kind==='fighter'?-2.6:-5.4;ck.position.y=kind==='sr71'?-0.6:kind==='f35'||kind==='fighter'?-0.62:0;add(ck,new THREE.BoxGeometry(0.5,0.7,0.5),0x2a2c2e,0,0.9,cz+0.5);add(ck,new THREE.BoxGeometry(0.4,0.35,0.2),0x3a3a30,0,1.4,cz+0.75);
 add(ck,new THREE.BoxGeometry(0.75,0.12,0.4),0x111214,0,1.08,cz-0.55);const hud=add(ck,new THREE.PlaneGeometry(0.28,0.22),new THREE.MeshBasicMaterial({color:0x66ff99,transparent:true,opacity:0.18,side:THREE.DoubleSide}),0,1.28,cz-0.6);hud.rotation.x=-0.3;
 add(ck,new THREE.PlaneGeometry(0.6,0.18),new THREE.MeshBasicMaterial({color:0x2a6a5a}),0,1.05,cz-0.33).rotation.x=-0.9;g.add(ck);
 g.userData.rig={surf,gear,ext:1};return g;}
{const _j=jet;jet=function(c,fa18,kind){const g=_j(c,fa18,kind);try{rigJet(g,kind||(fa18?'fa18':'f35'));}catch(e){}return g;};}
{const _t=tick;tick=function(dt){_t(dt);const v=player;if(!v||!v.mesh||!v.mesh.userData.rig||v.def.cls!=='air')return;const R=v.mesh.userData.rig;
 const k=1-Math.exp(-dt*8);for(const s of R.surf){const tgt=s.type==='stab'?(-inp.pitch*0.32+inp.roll*0.18*s.s):(inp.roll*0.35*s.s+(v.onGround?0.25:0));s.piv.rotation.x+=(tgt-s.piv.rotation.x)*k;}
 const sp=v.vel?v.vel.length():0;const agl=v.mesh.position.y-groundAt(v.mesh.position.x,v.mesh.position.z).h;const want=v.onGround||(agl<180&&sp<120)?1:0;R.ext+=clamp(want-R.ext,-dt*0.3,dt*0.3);
 R.gear.visible=R.ext>0.02;R.gear.scale.y=Math.max(0.02,R.ext);R.gear.position.y=(1-R.ext)*0.4;};}
