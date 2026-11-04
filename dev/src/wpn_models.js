// ===== wpn_models.js (#21): ORIGINAL procedural 3D models of the real firearms (proportions from real photos, refs/weapons/sources.txt).
// Shared materials + geometry cache; two LODs (viewmodel detail / world low). Forward = -Z, origin at grip.
const WPNM=(()=>{const T=THREE;
 const M={blk:new T.MeshStandardMaterial({color:0x17181a,roughness:.55,metalness:.6}),park:new T.MeshStandardMaterial({color:0x2a2c2e,roughness:.75,metalness:.35}),
  poly:new T.MeshStandardMaterial({color:0x1d1e1f,roughness:.85,metalness:.05}),fde:new T.MeshStandardMaterial({color:0x8a7656,roughness:.85,metalness:.05}),
  od:new T.MeshStandardMaterial({color:0x4a5038,roughness:.8,metalness:.1}),wood:new T.MeshStandardMaterial({color:0x6b3d1e,roughness:.6,metalness:.0}),
  steel:new T.MeshStandardMaterial({color:0x8d9196,roughness:.3,metalness:.95}),glass:new T.MeshStandardMaterial({color:0x223344,roughness:.05,metalness:.9,emissive:0x0a1420}),
  red:new T.MeshBasicMaterial({color:0xff2020}),gry:new T.MeshStandardMaterial({color:0x6a6d66,roughness:.7,metalness:.2}),brass:new T.MeshStandardMaterial({color:0xb08d3a,roughness:.35,metalness:.9})};
 const G={};const box=(w,h,d)=>G['b'+w+h+d]||(G['b'+w+h+d]=new T.BoxGeometry(w,h,d));const cyl=(r1,r2,l,s=14)=>G['c'+r1+r2+l+s]||(G['c'+r1+r2+l+s]=new T.CylinderGeometry(r1,r2,l,s));
 function P(g,m,x,y,z,rx=0,ry=0,rz=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);return o;}
 const tubeZ=(r,l,m,x,y,z,s)=>P(cyl(r,r,l,s),m,x,y,z,Math.PI/2);
 function build(w,lod=0){const m=w.m,g=new T.Group(),add=o=>{g.add(o);return o;};const D=lod?6:14;
  const body=w.cls==='sg'&&m.stock==='wood'||m.hg==='wood'?M.blk:m.hg==='scar'||m.stock==='scar'?M.fde:m.hg==='sa80'||m.hg==='aug'?M.od:M.blk;
  const L=m.L,bar=m.bar||.3;
  if(m.ln){// launchers
   const tm=m.ln==='rpg'?M.steel:m.ln==='at4'?M.od:M.od;add(tubeZ(m.tube,L,tm,0,.08,-L*.35,D));
   if(m.ln==='rpg'){add(P(cyl(.045,.08,.4,D),M.od,0,.08,-L*.85-.2,Math.PI/2));add(P(cyl(.04,.04,.25,D),M.wood,0,.08,-L*.05,Math.PI/2));add(P(cyl(.06,.06,.12,D),M.steel,0,.08,L*.12,Math.PI/2));}
   if(m.ln==='jav'){add(P(box(.2,.16,.26),M.od,-.14,.1,-.15));add(P(cyl(.05,.05,.08,D),M.glass,-.14,.12,-.3,Math.PI/2));}
   if(m.ln==='stinger'){add(P(box(.04,.18,.04),M.od,0,.24,-L*.55));add(P(box(.3,.02,.02),M.od,0,.33,-L*.55));}
   if(m.ln==='m79'){g.children.length=0;add(tubeZ(.025,.36,M.steel,0,.06,-.3,D));add(P(box(.05,.07,.3),M.wood,0,.04,-.05));add(P(box(.045,.1,.3),M.wood,0,0,.25,.15));}
   add(P(box(.03,.12,.05),M.poly,0,-.04,0,.2));return g;}
  const sc=m.sc||1,bl=Math.max(.08,L-bar);// body length
  const rz=m.bull?-.05:-.15; // receiver centre
  // receiver
  add(P(box(.05*sc,.07*sc,bl*(m.bull?.85:.55)),body,0,.06,rz-(m.bull?bl*.1:0)));
  if(m.pistol){g.children.length=0;add(P(box(.032,.035,L),M.blk,0,.07,-L*.4));add(P(box(.03,.03,L*.9),M.park,0,.035,-L*.38));
   if(m.rev){add(P(cyl(.022,.022,.05,6),M.steel,0,.055,-.04,Math.PI/2));add(tubeZ(.009,bar,M.steel,0,.072,-.07-bar/2,D));}
   if(m.burst||m.fgrip)add(P(box(.02,.06,.02),M.poly,0,0,-L*.6));
   if(w.id==='pp2000'||w.id==='tmp')add(P(box(.03,.06,.1),M.poly,0,.05,-L*.5));}
  // barrel + muzzle
  const bz=rz-bl*(m.bull?.4:.28)-(m.pistol?0:.0);
  if(!m.pistol){const br=w.cls==='sn'?.011:w.cls==='lmg'?.012:.0085;
   if(m.dbl){add(tubeZ(.013,bar,M.steel,-.013,.07,bz-bar/2,D));add(tubeZ(.013,bar,M.steel,.013,.07,bz-bar/2,D));}
   else add(tubeZ(br,bar,M.steel,0,.08,bz-bar/2,D));
   add(P(cyl(br*1.6,br*1.6,.05,D),M.blk,0,.08,bz-bar-.02,Math.PI/2));if(m.brake)add(P(box(.05,.03,.09),M.blk,0,.08,bz-bar-.05));
   if(m.gas)add(tubeZ(.007,bar*.55,M.steel,0,.105,bz-bar*.28,D));if(m.pump||m.mag==='tube')add(tubeZ(.011,bar*.85,M.blk,0,.05,bz-bar*.43,D));
   if(m.pump)add(P(box(.05,.045,.14),M.poly,0,.045,bz-bar*.3));if(m.lever)add(P(box(.012,.04,.12),M.steel,0,-.01,.05));}
  // handguard
  if(m.hg&&!m.bull){const hm=m.hg==='wood'?M.wood:m.hg==='scar'||m.hg==='acr'?(m.hg==='scar'?M.fde:M.poly):M.park;const hl=Math.min(bar*.75,.32);add(P(box(.056,.06,hl),hm,0,.075,bz-hl/2+.01));
   if(m.hg==='quad'&&!lod)for(const [x,y] of [[0,.11],[.032,.075],[-.032,.075],[0,.04]])add(P(box(x?.006:.026,x?.026:.006,hl),M.blk,x,y,bz-hl/2+.01));}
  if(m.bull&&m.hg){const hm=m.hg==='sa80'?M.blk:M.od;add(P(box(.06,.07,.2),hm,0,.07,bz+.05));}
  // top rail / carry handle / scope
  if(m.rail&&!lod)for(let i=0;i<8;i++)add(P(box(.024,.008,.012),M.blk,0,.1,rz+.06-i*.025));
  if(m.carry||m.handle==='famas')add(P(box(.02,.035,m.bull?.38:.18),M.blk,0,.115,rz-(m.bull?.08:0)));
  if(m.p90){add(P(box(.06,.03,.3),M.glass,0,.115,-.16));}
  if(m.scope){add(tubeZ(.017,.3,M.blk,0,.135,rz-.02,D));add(P(cyl(.025,.017,.06,D),M.blk,0,.135,rz-.2,Math.PI/2));add(P(cyl(.023,.017,.05,D),M.blk,0,.135,rz+.15,Math.PI/2));add(P(cyl(.024,.024,.004,D),M.glass,0,.135,rz-.231,Math.PI/2));}
  // grip
  add(P(box(.03,.09*sc,.04),M.poly,0,-.005,m.bull?.02:0,.25));if(m.fgrip||m.vector)add(P(box(.026,.08,.03),M.poly,0,.0,bz+.06));
  // magazine
  const mz=m.bull?.1:rz+.02;
  ({stanag:()=>add(P(box(.024,.15,.065),M.blk,0,-.03,mz,-.15)),box20:()=>add(P(box(.026,.12,.07),M.blk,0,-.02,mz)),ak:()=>add(P(box(.024,.18,.07),M.brass.color?M.park:M.park,0,-.04,mz-.01,-.35)),
   mp5:()=>add(P(box(.022,.16,.04),M.blk,0,-.02,mz-.06,-.3)),glock:()=>add(P(box(.022,.14,.034),M.blk,0,-.03,mz+.05)),top:()=>add(P(box(.05,.025,.3),M.glass,0,.105,-.15)),
   grip:()=>{},box100:()=>add(P(box(.07,.1,.1),M.od,.05,-.01,mz)),drum:()=>add(P(cyl(.07,.07,.05,D),M.blk,0,-.04,mz,0,0,Math.PI/2)),box5:()=>add(P(box(.024,.07,.08),M.blk,0,0,mz)),tube:()=>{},none:()=>{}}[m.mag]||(()=>{}))();
  // stock
  const sz=m.bull?.0:.04;const st=m.stock;
  if(st==='coll'){add(tubeZ(.014,.2,M.blk,0,.06,sz+.1,D));add(P(box(.04,.08,.07),M.poly,0,.04,sz+.2));}
  else if(st==='fixed'){add(P(box(.04,.09,.26),w.id==='fal'?M.poly:M.poly,0,.03,sz+.14,-.08));}
  else if(st==='wood'){add(P(box(.04,.1,.3),M.wood,0,.01,sz+.16,-.15));}
  else if(st==='scar'||st==='ebr'){add(P(box(.04,.085,.24),body,0,.04,sz+.14));add(P(box(.02,.02,.08),M.blk,0,.1,sz+.2));}
  else if(st==='fold'){add(P(box(.012,.07,.24),M.blk,.03,.04,sz+.12));}
  else if(st==='chey'||st==='m82'){add(P(box(.045,.1,.3),M.blk,0,.03,sz+.17));add(P(box(.02,.05,.1),M.blk,0,.1,sz+.17));}
  if(m.bull){add(P(box(.055,.09,.06),body,0,.05,.2));}
  if(m.vector){add(P(box(.05,.12,.16),M.poly,0,.02,-.1));}
  if(m.bipod&&!lod){add(P(box(.008,.12,.008),M.blk,.02,0,bz-bar*.6,0,0,.25));add(P(box(.008,.12,.008),M.blk,-.02,0,bz-bar*.6,0,0,-.25));}
  if(m.hg==='aug'){add(P(box(.02,.06,.03),M.od,0,0,bz+.02));}
  g.userData.muzzle=new T.Vector3(0,.08,(m.pistol?-L*.85:bz-bar-.05));return g;}
 function equip(id){const g=new T.Group();const m={frag:[cyl(.032,.032,.08,12),M.od],semtex:[box(.05,.05,.1),M.gry],knife:[box(.008,.02,.2),M.steel],ti:[cyl(.012,.012,.12,8),M.red],shield:[box(.45,.6,.03),M.gry],claymore:[box(.22,.08,.04),M.od],c4:[box(.12,.06,.04),M.gry],flash:[cyl(.025,.025,.12,12),M.blk],stun:[cyl(.03,.03,.1,12),M.gry],smoke:[cyl(.032,.032,.12,12),M.od]}[id];
  if(m)g.add(new T.Mesh(m[0],m[1]));if(id==='frag')g.add(P(box(.012,.03,.04),M.steel,0,.05,0));return g;}
 const cache={};function get(id,lod=0){const k=id+lod;if(!cache[k])cache[k]=build(WPN.W[id],lod);return cache[k].clone();}
 function attach(g,w,att){(att||[]).forEach(a=>{const mz=g.userData.muzzle||new T.Vector3(0,.08,-.6);
  if(a==='silencer')g.add(tubeZ(.02,.18,M.blk,0,mz.y,mz.z-.08,12));
  if(a==='reddot'){g.add(P(box(.03,.03,.05),M.blk,0,.13,-.12));g.add(P(box(.003,.003,.001),M.red,0,.135,-.145));}
  if(a==='holo'){g.add(P(box(.04,.045,.08),M.blk,0,.135,-.12));g.add(P(box(.03,.025,.002),M.glass,0,.14,-.165));}
  if(a==='acog'||a==='thermal'){g.add(tubeZ(a==='acog'?.018:.025,.15,M.blk,0,.135,-.1,12));}
  if(a==='grip')g.add(P(box(.026,.08,.03),M.poly,0,.0,mz.z+.28));
  if(a==='gl')g.add(tubeZ(.022,.22,M.blk,0,.02,mz.z+.25,12));if(a==='sgatt')g.add(tubeZ(.012,.25,M.blk,0,.025,mz.z+.25,10));
  if(a==='hb')g.add(P(box(.05,.035,.06),M.glass,-.035,.06,-.3));
  if(a==='xmags')g.children.forEach(o=>{});});return g;}
 return {M,build,get,equip,attach};})();
window.WPNM=WPNM;
