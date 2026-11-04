//GSAUCER-BEGIN  Bob Lazar S-4 "Sport Model". CLAIMS ONLY. Every feature tagged with its source key from refs/saucer/sources.txt.
// 40 ft x 15 ft (12.19 m x 4.57 m) [GOOD][K89]. Origin = belly bottom centre; disc sits on its belly, no legs [BLC].
const SAUCER=(()=>{const T=THREE,PI=Math.PI,D=12.19,R=D/2,HT=4.57;
function cvs(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;}
const tx=(c,s)=>{const t=new T.CanvasTexture(c);t.colorSpace=s?T.SRGBColorSpace:T.NoColorSpace;t.anisotropy=8;t.wrapS=t.wrapT=T.RepeatWrapping;return t;};
// seamless, no rivets/fasteners [G97][IUFOC15]; "made of wax, heated up, then cooled" -> soft low-frequency mottling only; unpolished stainless colour [BLC]
let SK=null;function skin(){if(SK)return SK;const W=1024;
 const blot=(x,n,a,b)=>{for(let i=0;i<n;i++){const r=40+Math.random()*220,px=Math.random()*W,py=Math.random()*W,g=x.createRadialGradient(px,py,0,px,py,r);const v=a+Math.random()*(b-a)|0;g.addColorStop(0,`rgba(${v},${v},${v+3},0.10)`);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(px-r,py-r,2*r,2*r);}};
 const col=cvs(W,W,x=>{x.fillStyle='#8c8f91';x.fillRect(0,0,W,W);blot(x,260,110,170);blot(x,120,60,90);});
 const rg=cvs(W,W,x=>{x.fillStyle='#9a9a9a';x.fillRect(0,0,W,W);blot(x,300,120,200);});
 return SK={map:tx(col,1),rough:tx(rg,0)};}
let M=null;function mats(){if(M)return M;const s=skin();M={
 hull:new T.MeshPhysicalMaterial({color:0xffffff,map:s.map,roughnessMap:s.rough,metalness:0.85,roughness:0.5,envMapIntensity:1.0,clearcoat:0.05}),
 sensor:new T.MeshPhysicalMaterial({color:0x1a1c1e,metalness:0.3,roughness:0.15,clearcoat:0.8}), // porthole-like orientation sensors, "not portholes" [BLC][G97]
 pewter:new T.MeshStandardMaterial({color:0x4a4c4f,metalness:0.7,roughness:0.55,side:T.DoubleSide}), // interior "dark pewter colour" quote
 amp:new T.MeshStandardMaterial({color:0x0c0c0d,metalness:0.4,roughness:0.6}), // "black cylindrical objects" [K89]
 reactor:new T.MeshStandardMaterial({color:0x6a6c70,metalness:0.8,roughness:0.35,emissive:0x202224,emissiveIntensity:0}),
 corona:new T.MeshBasicMaterial({color:0x7a6cff,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide})};return M;}
// lathe profile (r,y): shallow convex belly, thin rim lip with ridges [K89 "slim thin disk with ridges"][G97 "sleek thin 50s saucer"], upper dome with archway level [BLC][SKETCH], cap
function profile(){const P=[];const rim=1.55; // rim height above belly
 const add=(r,y)=>P.push(new T.Vector2(Math.max(0.001,r),y));
 add(0,0);for(let i=1;i<=16;i++){const t=i/16;add(R*0.97*t,rim*Math.pow(t,2.2)*0.98);} // belly
 add(R,rim);add(R*0.995,rim+0.06);add(R*0.97,rim+0.07);add(R*0.965,rim+0.13);add(R*0.94,rim+0.15);add(R*0.935,rim+0.21); // ridged lip
 for(let i=1;i<=14;i++){const t=i/14;add(R*0.93-(R*0.93-R*0.48)*t,rim+0.21+1.35*Math.sin(t*PI/2)*0.9);} // upper shell
 for(let i=1;i<=12;i++){const t=i/12;add(R*0.48*Math.cos(t*PI/2),rim+1.43+1.45*Math.sin(t*PI/2));} // archway dome [SKETCH]
 return P;}
function build(){const G=new T.Group(),Mt=mats(),A={};const P=profile(),top=P[P.length-1].y;
 const hull=new T.Mesh(new T.LatheGeometry(P,128),Mt.hull);G.add(hull);
 // archway ribs on the upper dome: centre-level walls "divided into archways" [BLC], arches drawn in [SKETCH]
 const nA=6;for(let i=0;i<nA;i++){const a=i/nA*2*PI;const arch=new T.Mesh(new T.TorusGeometry(1.15,0.07,8,32,PI),Mt.hull);arch.position.set(Math.cos(a)*R*0.62,1.55+0.85,Math.sin(a)*R*0.62);arch.rotation.y=-a+PI/2;arch.rotation.x=-0.42;G.add(arch);}
 // top cap + "small appendage that sticks out at the top" (waveguide) [JRE][SKETCH]; HT clamps to 15 ft
 const cap=new T.Mesh(new T.SphereGeometry(0.9,32,12,0,2*PI,0,PI/2),Mt.hull);cap.scale.y=0.35;cap.position.y=top-0.05;G.add(cap);
 const spike=new T.Mesh(new T.CylinderGeometry(0.025,0.06,HT-top-0.25,10),Mt.hull);spike.position.y=top+(HT-top-0.25)/2+0.2;G.add(spike);
 // dark sensor patches on the upper level [SKETCH][BLC][G97]
 for(let i=0;i<3;i++){const a=i*2*PI/3+PI/6;const s=new T.Mesh(new T.SphereGeometry(0.38,24,12,0,2*PI,0,PI/2),Mt.sensor);s.scale.y=0.3;const rr=R*0.38;s.position.set(Math.cos(a)*rr,1.55+1.43+0.95,Math.sin(a)*rr);s.lookAt(s.position.clone().multiplyScalar(3).setY(30));s.rotateX(PI/2);G.add(s);}
 // entry hatch on upper half, bottom of door wraps the centre lip [BLC]; honeycomb collapsing hatch [DOC18]: subtle hex relief, no seams beyond the door outline
 {const hx=new T.Group();const a=PI*0.5;hx.position.set(Math.cos(a)*R*0.93,1.55+0.5,Math.sin(a)*R*0.93);hx.lookAt(0,1.9,0);G.add(hx);
  for(let i=-2;i<=2;i++)for(let j=0;j<3;j++){const c=new T.Mesh(new T.CylinderGeometry(0.12,0.12,0.012,6),Mt.hull);c.rotation.x=PI/2;c.position.set(i*0.22+(j%2)*0.11,j*0.19-0.12,-0.03);hx.add(c);}}
 // little American flag "stuck on it" [IUFOC15]
 {const f=cvs(96,50,(x,w,h)=>{for(let i=0;i<13;i++){x.fillStyle=i%2?'#fff':'#b22234';x.fillRect(0,i*h/13,w,h/13+1);}x.fillStyle='#3c3b6e';x.fillRect(0,0,w*0.4,h*7/13);});
  const fl=new T.Mesh(new T.PlaneGeometry(0.3,0.16),new T.MeshStandardMaterial({map:tx(f,1),roughness:0.7,polygonOffset:true,polygonOffsetFactor:-2}));const a=PI*0.5+0.35;fl.position.set(Math.cos(a)*R*0.86,1.55+0.45,Math.sin(a)*R*0.86);fl.lookAt(fl.position.clone().multiplyScalar(2).setY(2.6));G.add(fl);}
 // INTERIOR (3 levels) [BLC]: lower = 3 gravity amplifiers (24 in dia [BLC]; emitters 2 ft x 4 ft black cylinders hanging down [K89]) at 120 deg [SKETCH plan];
 // centre = reactor 24 in sq base x 2.5 in + 16 in dome, centred between amplifiers [BLC]; tiny seats 18 in / back 24 in [BLC]; ceiling 4.5 ft [BLC]; hex floor [DOC18]
 const IN=new T.Group();IN.visible=false;G.add(IN);A.interior=IN;
 const floor=new T.Mesh(new T.CylinderGeometry(R*0.6,R*0.6,0.05,6),Mt.pewter);floor.position.y=1.3;IN.add(floor);
 const ceil=new T.Mesh(new T.CylinderGeometry(R*0.6,R*0.6,0.03,6),Mt.pewter);ceil.position.y=1.3+1.37;IN.add(ceil);
 const rb=new T.Mesh(new T.BoxGeometry(0.61,0.064,0.61),Mt.reactor);rb.position.y=1.36;IN.add(rb);
 const rd=new T.Mesh(new T.SphereGeometry(0.203,24,12,0,2*PI,0,PI/2),Mt.reactor);rd.position.y=1.39;IN.add(rd);A.reactor=rd;
 const wg=new T.Mesh(new T.CylinderGeometry(0.05,0.05,top-1.6,10),Mt.pewter);wg.position.y=1.6+(top-1.6)/2;IN.add(wg); // waveguide to top [JRE]
 for(let i=0;i<3;i++){const a=i*2*PI/3+PI/2,rr=1.7;const box=new T.Mesh(new T.BoxGeometry(0.9,0.5,0.6),Mt.amp);box.position.set(Math.cos(a)*rr,1.0,Math.sin(a)*rr);box.rotation.y=-a;IN.add(box); // "larger rectangular gravity amplifiers" [K89]
  const em=new T.Mesh(new T.CylinderGeometry(0.305,0.305,1.22,24),Mt.amp);em.position.set(Math.cos(a)*rr,0.75-0.6+0.6,Math.sin(a)*rr);em.userData.a=a;IN.add(em);(A.amps=A.amps||[]).push(em);
  const st=new T.Group();const b=a+PI/3;st.position.set(Math.cos(b)*R*0.48,1.33,Math.sin(b)*R*0.48);st.rotation.y=-b-PI/2;IN.add(st);
  const seat=new T.Mesh(new T.BoxGeometry(0.46,0.06,0.4),Mt.pewter);seat.position.y=0.457;st.add(seat);const back=new T.Mesh(new T.BoxGeometry(0.46,0.61,0.05),Mt.pewter);back.position.set(0,0.3,0.2);st.add(back);
  const con=new T.Mesh(new T.BoxGeometry(0.6,0.5,0.25),Mt.pewter);con.position.set(0,0.25,-0.45);st.add(con);}
 // corona discharge: "bluish" / "purple-blue" glow at the BOTTOM on liftoff, gone by 5-10 ft [JRE][IUFOC15]
 const cor=new T.Mesh(new T.SphereGeometry(R*0.9,48,12,0,2*PI,PI*0.62,PI*0.38),Mt.corona);cor.position.y=1.2;G.add(cor);A.corona=cor;
 const cl=UFO_TOUCH?{intensity:0}:new T.PointLight(0x8070ff,0,25,2);if(cl.isLight){cl.position.y=-0.5;G.add(cl);}A.cl=cl;
 G.traverse(o=>{if(o.isMesh&&o!==cor){o.castShadow=true;o.receiveShadow=true;}});G.userData.saucer=A;A.t=0;return G;}
function animate(G,dt,st){const A=G.userData.saucer;if(!A)return;A.t+=dt;const agl=st.agl==null?99:st.agl,on=st.power?1:0;
 const c=on&&agl<3.05?(1-agl/3.05)*(0.75+0.25*Math.sin(A.t*40)*Math.random()):0; // ~10 ft cut-off [IUFOC15]
 A.corona.material.opacity=c*0.55;A.cl.intensity=c*80;A.interior.visible=!!st.cut;
 A.reactor.material.emissiveIntensity=on?0.6:0;}
return{build,animate,R,HT,D};})();
window.__saucer={SAUCER,cut:false};
DEFS.saucer={name:'S-4 "Sport Model" (Lazar claim)',desc:'Bob Lazar\'s claimed S-4 disc: ~40 ft x 15 ft, seamless unpolished metal, element-115 reactor, 3 gravity amplifiers. Unverified.',cls:'air',thrust:30,vstall:1,vrot:1,dragK:1e-5,ceil:40000,col:0x8c8f91,weapons:['AAM'],maxMach:9,role:'Experimental',noRho:true,
 stats:{span_m:12.19,height_m:4.57,engines:'claimed element-115 reactor + 3 gravity amplifiers',status:'unverified claim'},bars:{speed:1,agility:1,armor:0.4,firepower:0.1},preview:()=>SAUCER.build()};
if(typeof AMMO!=='undefined'&&!AMMO.AAM)DEFS.saucer.weapons=Object.keys(AMMO).slice(0,1);
if(typeof ENG_CHAR!=='undefined')ENG_CHAR.saucer={r:0.1,w:0.15,ab:0};
{const _j=jet;jet=function(c,f,kind){if(kind==='saucer'){const g=SAUCER.build();g.userData.flame=null;const w=new THREE.Group();g.position.y=-2;w.add(g);w.userData.inner=g;w.userData.ufoRoot='saucer';return w;}return _j(c,f,kind);};}
{const _ae=attachExhaust;attachExhaust=function(v){if(v&&v.kind==='saucer'){if(exhMesh&&exhMesh.parent)exhMesh.parent.remove(exhMesh);exhMesh=null;exhFor=v;return;}return _ae(v);};}
// Flight [BLC][DLR][ABELL]: OMICRON (<=70 m/s): level hover on one amplifier, other two bias it laterally -> instant sideways moves, slight takeoff wobble.
// DELTA (full stick held 0.6 s): all three focused on destination -> disc rolls BELLY TOWARD direction of travel (tilt eases in through ~45 deg transition), very high speed.
{const _ua=updAir,_t=new THREE.Vector3(),_ax=new THREE.Vector3(),_q=new THREE.Quaternion(),_qy=new THREE.Quaternion(),_up=new THREE.Vector3(0,1,0);const cl=(a,b,c)=>Math.max(b,Math.min(c,a));
 updAir=function(v,dt){if(v.kind!=='saucer')return _ua(v,dt);UFOFLY(v,dt,{hover:2,vmax:90,top:1800,climb:30,tilt:true});
  SAUCER.animate(v.mesh.userData.inner,dt,{power:!v.onGround||inp.throttle>0.52,agl:Math.max(0,v.agl-2),cut:__saucer.cut});};}
{const _uc=updCamera,_cp=new THREE.Vector3();updCamera=function(dt){_uc(dt);const v=player;if(!v||v.kind!=='saucer'||!v.mesh||camFollow||blastCam||camMode!==0||window.__studio||window.__testCam)return;
  _cp.copy(camera.position).sub(v.mesh.position);const d=_cp.length();if(d>45||d<25){_cp.multiplyScalar((d>45?45:25)/Math.max(d,1e-3));camera.position.copy(v.mesh.position).add(_cp);const gh=groundAt(camera.position.x,camera.position.z).h;if(camera.position.y<gh+1.5)camera.position.y=gh+1.5;camera.lookAt(v.mesh.position);}};}
//GSAUCER-END
