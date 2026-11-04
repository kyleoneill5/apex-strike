// ===== wpn_models2.js (#21 v2): solid, connected ORIGINAL procedural firearms built from side-profile extrusions traced from real
// photos (refs/weapons/photos, sources.txt). Forward=-Z, origin at pistol-grip top. Per-material merge for iPhone draw calls.
import {RoomEnvironment as WpnRoomEnv} from 'three/addons/environments/RoomEnvironment.js';
import {mergeGeometries as wpnMerge} from 'three/addons/utils/BufferGeometryUtils.js';
(()=>{const T=THREE,PI=Math.PI;
 const mk=(c,r,m,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m},o||{}));
 const M={blk:mk(0x1e1f21,.42,.75),park:mk(0x2b2d2f,.6,.55),poly:mk(0x161718,.72,.08),fde:mk(0x9c8664,.78,.05),od:mk(0x4b5139,.8,.1),
  wood:mk(0x7b4526,.5,0),steel:mk(0x9aa0a6,.28,.95),sat:mk(0x8c9096,.33,.92),dark:mk(0x050505,.9,.2),glass:mk(0x182838,.04,.9,{emissive:0x061018}),
  brass:mk(0xb38f3c,.3,.95),red:new T.MeshBasicMaterial({color:0xff2a1a}),gry:mk(0x6a6d66,.7,.2),
  sleeve:mk(0x5b5944,.95,0),sleeve2:mk(0x46453a,.95,0),glove:mk(0x26251f,.78,.02),glovePad:mk(0x3a3a33,.85,.02),skin:mk(0x9a7055,.7,0)};
 let envDone=false;function env(){if(envDone)return;try{const r=window.__milsim&&__milsim.dbg&&__milsim.dbg.renderer;if(!r)return;const pm=new T.PMREMGenerator(r);
   const e=pm.fromScene(new WpnRoomEnv(),.04).texture;for(const k in M)if(M[k].isMeshStandardMaterial){M[k].envMap=e;M[k].envMapIntensity=.55;M[k].needsUpdate=true;}envDone=true;}catch(e){}}
 // profile extrusion: pts [[u,y]] (u forward), width w, centred on x=xo
 function prof(pts,w,m,o={}){const s=new T.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();
  if(o.holes)o.holes.forEach(h=>{const p=new T.Path();h.forEach((q,i)=>i?p.lineTo(q[0],q[1]):p.moveTo(q[0],q[1]));p.closePath();s.holes.push(p);});
  const b=o.b==null?Math.min(.004,w*.18):o.b;const g=new T.ExtrudeGeometry(s,{depth:Math.max(.001,w-2*b),bevelEnabled:b>0,bevelSize:b,bevelThickness:b,bevelSegments:o.lod?1:2,curveSegments:6});
  g.translate(0,0,-(w-2*b)/2);g.rotateY(PI/2);const me=new T.Mesh(g,m);me.position.x=o.x||0;return me;}
 function tube(r,u0,u1,y,m,o={}){const g=new T.CylinderGeometry(o.r1==null?r:o.r1,r,Math.abs(u1-u0),o.seg||16,1,!!o.open);g.rotateX(PI/2);const me=new T.Mesh(g,m);me.position.set(o.x||0,y,-(u0+u1)/2);return me;}
 function bx(w,h,d,m,x,y,u,rx=0){const me=new T.Mesh(new T.BoxGeometry(w,h,d),m);me.position.set(x,y,-u);me.rotation.x=rx;return me;}
 function rail(g,u0,u1,y,w=.022){g.add(bx(w*.75,.006,u1-u0,M.blk,0,y+.003,(u0+u1)/2));for(let u=u0+.005;u<u1-.003;u+=.0105)g.add(bx(w,.004,.0053,M.blk,0,y+.008,u));}
 function railSide(g,u0,u1,y,x,ang){for(let u=u0+.005;u<u1-.003;u+=.0105){const b=bx(.004,.016,.0053,M.blk,x,y,u);b.rotation.z=ang||0;g.add(b);}}
 // ---------- common parts ----------
 const P={
  m4grip:(g,m=M.poly)=>g.add(prof([[-.004,.014],[.03,.014],[.02,-.02],[.006,-.1],[-.03,-.098],[-.026,-.03],[-.018,.014]],.029,m)),
  guard:(g,u0,u1,y)=>{g.add(bx(.012,.005,u1-u0,M.blk,0,y,(u0+u1)/2));g.add(bx(.012,.03,.005,M.blk,0,y+.015,u1));g.add(bx(.004,.022,.006,M.blk,0,y+.016,(u0+u1)/2+.004,.25));},
  stanag:(m=M.blk)=>{const q=new T.Group();q.add(prof([[.047,.0],[.103,.0],[.106,-.06],[.118,-.12],[.135,-.178],[.08,-.19],[.064,-.125],[.052,-.06]],.024,m));q.add(prof([[.077,-.186],[.139,-.174],[.141,-.184],[.079,-.198]],.028,M.poly));return q;},
  ak:(m=M.park)=>{const q=new T.Group();q.add(prof([[.03,.02],[.1,.02],[.112,-.05],[.155,-.14],[.2,-.2],[.145,-.235],[.1,-.175],[.06,-.09],[.035,-.03]],.026,m));for(let i=0;i<4;i++)q.add(prof([[.06+i*.02,-.06-i*.032],[.07+i*.023,-.06-i*.034],[.08+i*.024,-.09-i*.036],[.07+i*.022,-.09-i*.034]],.0275,M.blk,{b:.001}));return q;},
  box:(u0,u1,y0,y1,w=.026,m=M.blk)=>{const q=new T.Group();q.add(prof([[u0,y0],[u1,y0],[u1+.004,y1],[u0+.004,y1]],w,m));q.add(prof([[u0-.003,y1+.004],[u1+.007,y1+.004],[u1+.007,y1-.008],[u0-.003,y1-.008]],w+.004,M.poly));return q;},
  m4stock:(g,u0)=>{g.add(tube(.015,u0,u0-.19,.062,M.blk,{seg:14}));g.add(prof([[u0-.09,.083],[u0-.215,.094],[u0-.235,.092],[u0-.235,-.032],[u0-.215,-.036],[u0-.16,.028],[u0-.09,.042]],.036,M.poly));g.add(prof([[u0-.229,.096],[u0-.24,.096],[u0-.24,-.038],[u0-.229,-.038]],.04,M.glovePad,{b:.002}));},
  flash:(g,u,y,r=.0105)=>{g.add(tube(r,u,u+.05,y,M.blk,{seg:12}));for(let i=0;i<4;i++){const s=bx(.003,.0035,.03,M.dark,Math.cos(i*PI/2)*r*.98,y+Math.sin(i*PI/2)*r*.98,u+.03);g.add(s);}},
 };
 // ---------- hero models ----------
 const H={};
 H.m4a1=(g,o)=>{ // Colt M4A1, RIS handguard, A-frame FSB, flat-top upper (photo: PEO_M4_Carbine_RAS)
  g.add(prof([[-.075,.046],[.125,.046],[.125,.03],[.112,.0],[.108,-.028],[.042,-.028],[.036,.0],[-.012,.006],[-.06,.012],[-.075,.024]],.028,M.blk));
  g.add(prof([[-.082,.045],[.172,.045],[.172,.086],[-.082,.086]],.031,M.blk));g.add(bx(.003,.016,.05,M.dark,.0158,.064,.085));
  g.add(tube(.006,-.005,.01,.072,M.blk,{x:.02,seg:10}));g.add(bx(.03,.009,.02,M.blk,0,.081,-.088));rail(g,-.08,.17,.086);
  g.add(prof([[.11,.097],[.152,.097],[.148,.126],[.128,.126]],.022,M.blk,{b:.0015}));
  g.add(prof([[.168,.033],[.335,.037],[.335,.093],[.168,.097]],.054,M.blk));rail(g,.17,.335,.093,.02);railSide(g,.18,.33,.065,.029);railSide(g,.18,.33,.065,-.029);
  g.add(tube(.031,.163,.176,.065,M.blk,{seg:20}));g.add(tube(.0095,.17,.53,.065,M.blk));
  g.add(prof([[.34,.048],[.372,.048],[.366,.105],[.362,.152],[.354,.156],[.35,.105]],.016,M.blk));g.add(tube(.014,.34,.372,.065,M.blk));g.add(bx(.003,.022,.003,M.blk,0,.162,.358));
  P.flash(g,.528,.065);P.guard(g,.018,.044,-.024);P.m4grip(g);P.m4stock(g,-.082);
  o.mag=P.stanag();o.ironY=.152;o.railY=.095;o.muzzle=.58;o.fg=.27;o.hgY=.035;};
 H.acr=(g,o)=>{ // Remington ACR: monolithic upper, polymer FDE lower, adaptive stock
  g.add(prof([[-.085,.045],[.30,.045],[.322,.056],[.322,.097],[-.085,.099]],.036,M.blk));rail(g,-.08,.32,.099);railSide(g,.2,.31,.07,.02);railSide(g,.2,.31,.07,-.02);
  g.add(prof([[-.075,.046],[.135,.046],[.135,.024],[.112,-.028],[.042,-.028],[.036,.0],[-.075,.014]],.034,M.fde));
  g.add(prof([[.14,.018],[.30,.03],[.30,.049],[.14,.049]],.04,M.fde));g.add(tube(.006,.24,.27,.08,M.blk,{x:-.024,seg:8}));
  g.add(tube(.0095,.3,.47,.071,M.blk));P.flash(g,.468,.071);P.guard(g,.018,.044,-.024);P.m4grip(g);
  g.add(prof([[-.08,.098],[-.31,.09],[-.33,.085],[-.33,-.04],[-.29,-.046],[-.21,.018],[-.13,.03],[-.08,.046]],.04,M.fde,{holes:[[[-.15,.07],[-.27,.066],[-.27,.035],[-.22,.034],[-.17,.04]]]}));
  g.add(prof([[-.325,.09],[-.34,.09],[-.34,-.044],[-.325,-.044]],.044,M.glovePad,{b:.002}));
  o.mag=P.stanag(M.fde);o.ironY=.11;o.railY=.108;o.muzzle=.52;o.fg=.24;o.hgY=.018;};
 H.ak47=(g,o)=>{ // AK-47 (Type II milled): wood furniture, gas tube, banana mag
  g.add(prof([[-.09,.02],[.2,.02],[.2,.076],[-.06,.08],[-.09,.066]],.031,M.blk));g.add(prof([[-.07,.074],[.18,.074],[.18,.084],[-.04,.092],[-.07,.086]],.028,M.blk,{b:.006}));
  g.add(bx(.002,.012,.06,M.dark,.0156,.06,.06));g.add(bx(.012,.006,.035,M.steel,.022,.071,.13));g.add(bx(.006,.012,.04,M.blk,.017,.045,-.02));
  g.add(prof([[.188,.07],[.25,.074],[.25,.102],[.2,.102]],.029,M.blk));
  g.add(prof([[-.09,.075],[-.3,.04],[-.305,.034],[-.305,-.08],[-.292,-.086],[-.09,.022]],.038,M.wood,{b:.006}));g.add(prof([[-.3,.04],[-.31,.04],[-.31,-.086],[-.3,-.086]],.04,M.blk,{b:.001}));
  g.add(prof([[-.012,.022],[.026,.022],[.012,-.03],[-.004,-.094],[-.042,-.09],[-.032,.022]],.03,M.wood,{b:.005}));P.guard(g,.012,.05,-.012);
  g.add(prof([[.25,.026],[.42,.034],[.42,.072],[.25,.072]],.046,M.wood,{b:.008}));g.add(tube(.013,.25,.258,.05,M.blk,{seg:16}));
  g.add(prof([[.25,.078],[.40,.08],[.40,.104],[.25,.104]],.032,M.wood,{b:.009}));g.add(tube(.011,.4,.47,.092,M.blk,{seg:12}));
  g.add(prof([[.46,.05],[.49,.05],[.49,.1],[.46,.1]],.024,M.blk));g.add(tube(.0092,.2,.6,.06,M.blk));
  g.add(prof([[.555,.045],[.585,.045],[.585,.118],[.572,.122]],.022,M.blk,{holes:[[[.562,.09],[.58,.09],[.58,.112],[.565,.112]]]}));g.add(tube(.012,.598,.622,.06,M.blk));
  o.mag=P.ak();o.ironY=.112;o.railY=.098;o.muzzle=.63;o.fg=.33;o.hgY=.028;o.noRail=1;};
 H.interv=(g,o)=>{ // CheyTac M200 Intervention: free-float forearm, long brake, telescoping stock, carry handle
  g.add(prof([[-.12,.02],[.22,.02],[.22,.096],[-.12,.096]],.052,M.blk));rail(g,-.1,.22,.096,.024);
  g.add(tube(.034,.22,.64,.065,M.park,{seg:20}));rail(g,.22,.64,.098,.024);g.add(tube(.013,.62,1.07,.065,M.blk));
  for(let i=0;i<6;i++)g.add(bx(.003,.003,.3,M.dark,Math.cos(i)*.0128,.065+Math.sin(i)*.0128,.85));
  g.add(prof([[1.06,.04],[1.17,.04],[1.17,.09],[1.06,.09]],.046,M.blk,{holes:[[[1.08,.05],[1.1,.05],[1.1,.08],[1.08,.08]],[[1.12,.05],[1.14,.05],[1.14,.08],[1.12,.08]]]}));
  g.add(prof([[.52,.1],[.6,.1],[.59,.142],[.53,.142]],.02,M.blk,{holes:[[[.54,.106],[.58,.106],[.575,.132],[.545,.132]]]}));
  g.add(tube(.007,.45,.8,.03,M.blk,{x:.012,seg:8}));g.add(tube(.007,.45,.8,.03,M.blk,{x:-.012,seg:8}));
  P.m4grip(g);P.guard(g,.018,.046,-.024);
  g.add(tube(.011,-.12,-.45,.085,M.steel,{seg:10}));g.add(tube(.011,-.12,-.45,.03,M.steel,{seg:10}));
  g.add(prof([[-.2,.096],[-.42,.098],[-.42,.122],[-.2,.12]],.032,M.poly,{b:.006}));g.add(prof([[-.43,.104],[-.47,.104],[-.47,-.07],[-.43,-.07]],.05,M.poly,{b:.006}));g.add(bx(.012,.1,.012,M.blk,0,-.03,-.36));
const bh=new T.Mesh(new T.CylinderGeometry(.005,.005,.05,8),M.steel);bh.rotation.z=PI/2.4;bh.position.set(.045,.068,.06);g.add(bh);
  const kn=new T.Mesh(new T.SphereGeometry(.011,12,8),M.blk);kn.position.set(.07,.058,.06);g.add(kn);
  // scope (high-power): rings, turrets, bells
  g.add(tube(.018,-.07,.3,.15,M.blk,{seg:24}));g.add(tube(.025,-.14,-.07,.15,M.blk,{r1:.02,seg:24}));g.add(tube(.033,.3,.4,.15,M.blk,{r1:.019,seg:24}));g.add(tube(.031,.36,.401,.15,M.glass,{seg:24}));
  [0,.2].forEach(u=>{g.add(prof([[u-.012,.096],[u+.012,.096],[u+.012,.15],[u-.012,.15]],.034,M.blk));});
  const tu=new T.Mesh(new T.CylinderGeometry(.014,.014,.03,16),M.blk);tu.position.set(0,.178,-.1);g.add(tu);const tw=tu.clone();tw.rotation.z=PI/2;tw.position.set(.03,.15,-.1);g.add(tw);
  o.mag=P.box(.03,.13,-.06,.02,.042);o.scope=1;o.ironY=.15;o.muzzle=1.18;o.fg=.36;o.hgY=.031;o.noRail=1;};
 H.deagle=(g,o)=>{ // IMI Desert Eagle Mk XIX
  g.add(prof([[-.072,.034],[.17,.034],[.17,.058],[-.072,.058]],.03,M.sat));
  g.add(prof([[-.077,.058],[.192,.058],[.192,.089],[.186,.098],[-.062,.098],[-.077,.088]],.033,M.sat,{b:.003}));
  for(let i=0;i<7;i++)g.add(bx(.034,.022,.0025,M.blk,0,.077,-.06+i*.006));g.add(tube(.0065,.19,.194,.075,M.dark,{seg:12}));
  g.add(bx(.008,.007,.012,M.blk,0,.101,.178));g.add(bx(.016,.008,.01,M.blk,0,.101,-.06));
  g.add(prof([[-.035,.036],[.022,.036],[.004,-.088],[-.048,-.094],[-.072,.0],[-.06,.036]],.036,M.poly,{b:.006}));g.add(prof([[.004,-.088],[-.048,-.094],[-.05,-.1],[.006,-.096]],.033,M.sat,{b:.001}));
  g.add(prof([[.0,-.004],[.064,-.004],[.07,.034],[.062,.034],[.057,.003],[.0,.003]],.012,M.sat,{b:.001}));g.add(bx(.006,.022,.006,M.blk,0,.016,.03,.2));
  g.add(bx(.012,.018,.014,M.sat,0,.088,-.082));g.add(bx(.006,.01,.016,M.sat,.019,.066,-.04));
  o.mag=new T.Group();o.ironY=.104;o.muzzle=.2;o.pistol=1;o.noRail=1;};
 H.ump45=(g,o)=>{ // HK UMP45: polymer receiver, straight .45 mag, side-folding skeleton stock
  g.add(prof([[-.075,.012],[.2,.012],[.228,.028],[.242,.045],[.242,.092],[-.075,.092]],.046,M.poly,{b:.005}));rail(g,-.06,.2,.092);
  g.add(tube(.006,.17,.235,.084,M.blk,{x:-.027,seg:8}));g.add(bx(.003,.016,.05,M.dark,.0236,.066,.06));
  g.add(prof([[-.012,.014],[.03,.014],[.016,-.092],[-.024,-.092],[-.036,.014]],.032,M.poly,{b:.005}));P.guard(g,.018,.05,-.02);
  g.add(prof([[.058,.014],[.122,.014],[.122,-.012],[.058,-.012]],.036,M.poly));g.add(tube(.0105,.24,.31,.062,M.blk));g.add(tube(.014,.3,.325,.062,M.blk));
  g.add(prof([[-.075,.084],[-.33,.078],[-.342,.064],[-.342,-.05],[-.31,-.05],[-.24,.04],[-.075,.046]],.026,M.poly,{holes:[[[-.12,.07],[-.29,.064],[-.3,.0],[-.275,.0],[-.225,.054],[-.12,.058]]]}));
  const q=new T.Group();q.add(prof([[.064,-.006],[.116,-.006],[.13,-.17],[.086,-.172]],.031,M.poly));q.add(prof([[.084,-.166],[.134,-.164],[.136,-.178],[.084,-.18]],.035,M.poly));
  o.mag=q;o.ironY=.112;o.railY=.1;o.muzzle=.33;o.fg=.17;o.hgY=.012;};
 // ---------- generic (rest of arsenal): same connected construction, params from wpn_data ----------
 function generic(w,g,o){const m=w.m,L=m.L,bar=m.bar||.3,cls=w.cls;const furn=m.hg==='wood'||m.stock==='wood'?M.wood:m.hg==='scar'||m.stock==='scar'?M.fde:m.hg==='sa80'||m.hg==='aug'?M.od:M.poly;
  const Y=.065;
  if(m.pistol){const sl=Math.max(.17,L);const met=w.id==='mag44'||w.id==='m9'?M.sat:M.blk;
   g.add(prof([[-.07,.034],[sl-.075,.034],[sl-.075,.056],[-.07,.056]],.028,M.poly));g.add(prof([[-.075,.056],[sl-.06,.056],[sl-.06,.086],[sl-.064,.092],[-.068,.092],[-.075,.086]],.029,met,{b:.003}));
   g.add(tube(.006,sl-.062,sl-.058,.072,M.dark,{seg:10}));g.add(prof([[-.03,.036],[.022,.036],[.002,-.085],[-.045,-.09],[-.066,.0],[-.058,.036]],.033,M.poly,{b:.005}));
   g.add(prof([[0,-.004],[.06,-.004],[.066,.034],[.058,.034],[.053,.003],[0,.003]],.011,M.poly,{b:.001}));
   if(m.rev){g.add(tube(.022,-.01,.04,.06,M.sat,{seg:6}));g.add(tube(.009,.04,.04+bar,.07,M.sat));g.children.splice(1,1);}
   if(m.fgrip||m.burst)g.add(prof([[sl*.45,.034],[sl*.55,.034],[sl*.54,-.03],[sl*.46,-.03]],.022,M.poly));
   if(w.id==='pp2000'||w.id==='tmp')g.add(prof([[.0,.056],[sl*.7,.056],[sl*.7,.1],[.0,.1]],.034,M.poly));
   o.mag=new T.Group();o.ironY=.098;o.muzzle=sl-.055;o.pistol=1;o.noRail=1;return;}
  if(m.bull){// bullpup: action behind grip
   const f=L-bar-.33,r0=-.33;g.add(prof([[r0,-.04],[f,-.0],[f+.02,.03],[f+.02,.1],[r0+.02,.1],[r0,.08]],.05,furn===M.poly?M.poly:furn,{b:.006}));
   g.add(prof([[-.004,.0],[.03,.0],[.02,-.03],[.006,-.1],[-.03,-.098],[-.022,.0]],.03,M.poly));P.guard(g,.0,.045,-.03);
   g.add(bx(.003,.016,.05,M.dark,.026,.07,-.16));g.add(tube(.0095,f,f+bar,Y,M.blk));P.flash(g,f+bar-.01,Y);if(!m.p90)rail(g,-.15,f,.1);
   if(m.p90){g.add(prof([[-.2,.1],[.1,.1],[.1,.128],[-.2,.128]],.05,M.glass,{b:.003}));g.add(prof([[-.12,.128],[.04,.128],[.04,.15],[-.12,.15]],.03,M.poly));}
   const q=m.mag==='box100'?P.box(-.2,-.08,-.12,-.04,.08,M.od):m.mag==='top'?new T.Group():P.stanag();if(m.mag!=='box100'&&m.mag!=='top')q.position.z=.21;
   o.mag=q;o.ironY=m.p90?.15:.125;o.railY=.11;o.muzzle=f+bar+.04;o.fg=f-.08;o.hgY=-.0;return;}
  const sh=cls==='smg'?.7:1;const re=.15*sh+(cls==='sn'?.05:0),hgE=Math.max(re+.06,L-.3-bar*.25)*1,mu=Math.max(hgE+.06,L-.3+(m.stock==='none'?.25:0));
  const recM=cls==='sg'&&furn===M.wood?M.blk:(m.hg==='scar'?M.fde:M.blk);
  g.add(prof([[-.08,.02],[re,.02],[re,.092],[-.08,.092]],.032,recM));if(m.rail||cls==='sn')rail(g,-.07,re,.092);
  g.add(prof([[-.004,.02],[.03,.02],[.02,-.02],[.006,-.096],[-.03,-.094],[-.026,-.03],[-.018,.02]],.029,furn===M.wood&&cls!=='lmg'?M.wood:M.poly));P.guard(g,.018,.046,-.02);
  const hm=m.hg==='wood'?M.wood:m.hg==='quad'?M.blk:furn;g.add(prof([[re-.005,.028],[hgE,.034],[hgE,.096],[re-.005,.096]],m.hg==='quad'?.052:.046,hm,{b:.006}));
  if(m.hg==='quad'){rail(g,re,hgE,.096,.02);railSide(g,re+.01,hgE-.01,Y,.028);railSide(g,re+.01,hgE-.01,Y,-.028);}
  g.add(tube(cls==='sn'||cls==='lmg'?.012:.0095,hgE-.01,mu,Y,M.blk));if(m.brake)g.add(prof([[mu-.02,.045],[mu+.07,.045],[mu+.07,.085],[mu-.02,.085]],.05,M.blk));else P.flash(g,mu-.005,Y);
  if(m.gas)g.add(tube(.01,hgE-.02,hgE+.06,.092,M.blk,{seg:10}));
  if(m.pump||m.mag==='tube'){g.add(tube(.012,re,mu-.03,.035,M.blk));}
  if(m.pump)g.add(prof([[re+.05,.018],[re+.19,.018],[re+.19,.058],[re+.05,.058]],.05,M.poly,{b:.008}));
  if(m.dbl){g.add(tube(.013,re,mu,.06,M.blk,{x:.013}));g.add(tube(.013,re,mu,.06,M.blk,{x:-.013}));}
  if(m.lever)g.add(prof([[-.06,-.01],[.05,-.01],[.05,-.04],[-.03,-.06],[-.06,-.03]],.01,M.steel,{holes:[[[-.04,-.02],[.03,-.02],[.03,-.034],[-.03,-.046]]]}));
  if(m.carry)g.add(prof([[-.04,.092],[re,.092],[re-.01,.13],[-.03,.13]],.022,M.blk,{holes:[[[-.02,.098],[re-.02,.098],[re-.025,.118],[-.02,.118]]]}));
  if(m.bipod){g.add(tube(.006,hgE-.18,hgE-.02,.028,M.blk,{x:.012,seg:8}));g.add(tube(.006,hgE-.18,hgE-.02,.028,M.blk,{x:-.012,seg:8}));}
  if(m.vector){g.add(prof([[-.05,.02],[.14,.02],[.14,-.06],[.0,-.06]],.05,M.poly,{b:.006}));}
  if(m.scope&&!H[w.id]){g.add(tube(.018,-.06,.26,.15,M.blk,{seg:20}));g.add(tube(.03,.26,.34,.15,M.blk,{r1:.019,seg:20}));g.add(tube(.023,-.12,-.06,.15,M.blk,{r1:.018,seg:20}));[0,.18].forEach(u=>g.add(prof([[u-.01,.092],[u+.01,.092],[u+.01,.15],[u-.01,.15]],.03,M.blk)));o.scope=1;}
  // stock
  const st=m.stock;if(st==='coll')P.m4stock(g,-.08);
  else if(st==='fixed')g.add(prof([[-.08,.088],[-.34,.07],[-.35,.062],[-.35,-.07],[-.33,-.075],[-.08,.024]],.04,M.poly,{b:.006}));
  else if(st==='wood')g.add(prof([[-.08,.08],[-.32,.045],[-.325,.04],[-.325,-.08],[-.31,-.086],[-.08,.024]],.038,M.wood,{b:.006}));
  else if(st==='scar'||st==='ebr')g.add(prof([[-.08,.09],[-.3,.088],[-.32,.082],[-.32,-.045],[-.28,-.05],[-.2,.02],[-.08,.04]],.04,furn,{holes:[[[-.14,.07],[-.27,.066],[-.27,.035],[-.2,.04]]]}));
  else if(st==='fold')g.add(prof([[-.08,.084],[-.32,.078],[-.332,.064],[-.332,-.05],[-.3,-.05],[-.23,.04],[-.08,.046]],.026,M.poly,{holes:[[[-.12,.07],[-.28,.064],[-.29,.0],[-.265,.0],[-.22,.054],[-.12,.058]]]}));
  else if(st==='chey'||st==='m82'){g.add(prof([[-.08,.096],[-.4,.1],[-.42,.09],[-.42,-.06],[-.38,-.06],[-.2,.0],[-.08,.02]],.046,M.blk,{holes:[[[-.14,.075],[-.36,.078],[-.36,.0],[-.2,.03]]]}));}
  // magazine
  const mt=m.mag;o.mag=mt==='stanag'?P.stanag():mt==='ak'?P.ak():mt==='box20'?P.box(.04,.11,-.11,.02,.028):mt==='box5'?P.box(.04,.12,-.05,.02,.03):mt==='box100'?P.box(.02,.14,-.12,.0,.08,M.od):
   mt==='drum'?(()=>{const q=new T.Group();const d=tube(.075,0,.06,0,M.blk,{seg:24});d.rotation.set(0,PI/2,0);d.position.set(0,-.08,-.08);q.add(d);return q;})():
   mt==='mp5'?(()=>{const q=new T.Group();q.add(prof([[.05,.02],[.09,.02],[.12,-.08],[.15,-.15],[.11,-.16],[.075,-.08]],.022,M.blk));return q;})():
   mt==='glock'?P.box(.0,.035,-.16,.02,.024):new T.Group();
  if(m.vector)o.mag.position.z=.0;
  o.ironY=m.carry?.13:.125;o.railY=m.rail||cls==='sn'?.1:null;o.muzzle=mu+.05;o.fg=(re+hgE)/2;o.hgY=.028;if(!m.rail&&!m.carry)o.noRail=1;}
 // ---------- merge per material (keep mag separate for reload anim) ----------
 function merge(g){const by=new Map();for(const c of [...g.children]){if(!c.isMesh)continue;c.updateMatrix();const gg=c.geometry.index?c.geometry.toNonIndexed():c.geometry.clone();gg.applyMatrix4(c.matrix);
   ['uv','uv1','uv2'].forEach(a=>gg.deleteAttribute(a));if(!by.has(c.material))by.set(c.material,[]);by.get(c.material).push(gg);g.remove(c);}
  for(const [m,a] of by){const mg=wpnMerge(a,false);if(mg){mg.computeBoundingSphere();g.add(new T.Mesh(mg,m));}}return g;}
 const OLD=WPNM.build;
 function build(w,lod=0){env();if(w.m.ln)return OLD(w,lod);const g=new T.Group(),o={};(H[w.id]?H[w.id](g,o):generic(w,g,o));merge(g);
  const mg=new T.Group();mg.name='mag';if(o.mag){o.mag.traverse(c=>{});mg.add(o.mag);merge(o.mag);}g.add(mg);
  g.userData={muzzle:new T.Vector3(0,o.pistol?.075:.065,-(o.muzzle||.6)),ironY:o.ironY||.12,railY:o.noRail?null:(o.railY||.095),scope:!!o.scope,pistol:!!o.pistol,fg:new T.Vector3(0,o.hgY==null?.03:o.hgY,-(o.fg||.25)),mag:mg,v2:1};return g;}
 const cache={};WPNM.build=build;WPNM.M2=M;
 WPNM.get=function(id,lod=0){const k=id+'_'+lod;if(!cache[k])cache[k]=build(WPN.W[id],lod);const src=cache[k],ud=src.userData;src.userData={};const c=src.clone();src.userData=ud;c.userData=Object.assign({},ud);c.userData.mag=c.getObjectByName('mag');c.userData.muzzle=ud.muzzle?ud.muzzle.clone():new T.Vector3(0,.08,-.6);if(ud.fg)c.userData.fg=ud.fg.clone();return c;};
 // attachments placed on the actual rail / muzzle
 const OLDA=WPNM.attach;
 WPNM.attach=function(g,w,att){const ud=g.userData;if(!ud.v2)return OLDA(g,w,att);const mz=ud.muzzle,ry=ud.railY||(ud.ironY-.02);let sight=null;
  (att||[]).forEach(a=>{
   if(a==='silencer'){g.add(tube(.019,-mz.z-.01,-mz.z+.17,mz.y,M.blk,{seg:20}));ud.muzzle=new T.Vector3(0,mz.y,mz.z-.17);}
   if(a==='reddot'){g.add(prof([[-.03,ry],[.03,ry],[.028,ry+.012],[.02,ry+.044],[-.02,ry+.044],[-.024,ry+.012]],.032,M.blk,{b:.002}));g.add(prof([[-.02,ry+.044],[-.01,ry+.044],[-.01,ry+.05],[-.02,ry+.05]],.03,M.blk));g.add(bx(.0025,.0025,.001,M.red,0,ry+.028,-.012));sight=ry+.028;}
   if(a==='holo'){g.add(prof([[-.05,ry],[.04,ry],[.04,ry+.02],[.03,ry+.055],[.02,ry+.055],[.02,ry+.02],[-.035,ry+.02],[-.035,ry+.05],[-.045,ry+.05]],.04,M.blk,{b:.002}));g.add(bx(.028,.026,.002,M.glass,0,ry+.036,.03));g.add(bx(.004,.004,.001,M.red,0,ry+.036,.031));sight=ry+.036;}
   if(a==='acog'||a==='thermal'){const r=a==='acog'?.017:.024,y=ry+.032;g.add(tube(r,-.07,.08,y,M.blk,{seg:20}));g.add(tube(r+.008,.06,.1,y,M.blk,{r1:r,seg:20}));g.add(prof([[-.04,ry],[.05,ry],[.05,y-r+.004],[-.04,y-r+.004]],.026,M.blk));if(a==='acog')g.add(tube(.003,-.02,.06,y+r+.004,M.red,{seg:6}));sight=y;}
   if(a==='grip'&&!ud.pistol){const u=-ud.fg.z,y=ud.fg.y;g.add(prof([[u-.016,y],[u+.016,y],[u+.012,y-.085],[u-.012,y-.085]],.026,M.poly,{b:.006}));ud.vgrip=1;}
   if(a==='gl'){const u=-ud.fg.z,y=ud.fg.y-.022;g.add(tube(.021,u-.08,u+.13,y,M.blk,{seg:16}));g.add(prof([[u-.1,y-.02],[u-.06,y-.02],[u-.07,y-.07],[u-.1,y-.07]],.02,M.blk));ud.vgrip=1;}
   if(a==='sgatt'){const u=-ud.fg.z,y=ud.fg.y-.018;g.add(tube(.012,u-.06,u+.16,y,M.blk));g.add(prof([[u-.09,y],[u-.03,y],[u-.04,y-.05],[u-.08,y-.05]],.04,M.poly));ud.vgrip=1;}
   if(a==='hb'){const u=-ud.fg.z;g.add(prof([[u-.05,.04],[u+.02,.04],[u+.02,.09],[u-.05,.09]],.012,M.poly,{x:-.034}));g.add(bx(.002,.04,.06,M.glass,-.041,.065,u-.015));}
  });ud.sightY=sight||ud.ironY;return g;};
 // ---------- first-person arms: sleeves, cuffs, gloved hands with knuckle pads & wrapped fingers ----------
 function limb(g,a,b,r0,r1,m,seg=14){const d=new T.Vector3().subVectors(b,a),L=d.length();const c=new T.Mesh(new T.CylinderGeometry(r1,r0,L,seg),m);c.position.copy(a).addScaledVector(d,.5);c.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());g.add(c);return c;}
 function cap(g,a,b,r,m){const d=new T.Vector3().subVectors(b,a),L=d.length();const c=new T.Mesh(new T.CapsuleGeometry(r,Math.max(.001,L),4,10),m);c.position.copy(a).addScaledVector(d,.5);c.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());g.add(c);return c;}
 function hand(g,p,side,wrap){// p = grip contact centre; side +1 right hand, -1 left; wrap: 'grip' vertical grip, 'fg' under handguard
  const V=(x,y,z)=>new T.Vector3(x,y,z).add(p),s=side;
  if(wrap==='grip'){const pal=new T.Mesh(new T.SphereGeometry(.03,14,10),M.glove);pal.scale.set(.75,1.15,.9);pal.position.copy(V(.024*s,-.02,.022));g.add(pal);
   for(let i=0;i<4;i++){const y=-.012-i*.019;cap(g,V(.02*s,y,-.008),V(.004*s,y-.004,-.03),.0085,M.glove);cap(g,V(.004*s,y-.004,-.03),V(-.016*s,y-.006,-.022),.008,M.glove);const k=new T.Mesh(new T.SphereGeometry(.0075,8,6),M.glovePad);k.position.copy(V(.006*s,y-.003,-.034));g.add(k);}
   cap(g,V(.02*s,.005,.01),V(-.012*s,.02,-.01),.0095,M.glove);cap(g,V(-.012*s,.02,-.01),V(-.022*s,.024,-.03),.0088,M.glove);// thumb over the back strap
   const wr=V(.03*s,-.04,.06);limb(g,V(.024*s,-.025,.03),wr,.026,.024,M.glove);return wr;}
  // fore-end support hand: palm under, fingers up the far side, thumb up the near side
  const pal=new T.Mesh(new T.SphereGeometry(.03,14,10),M.glove);pal.scale.set(1.1,.7,1.2);pal.position.copy(V(0,-.016,0));g.add(pal);
  for(let i=0;i<4;i++){const z=-.03+i*.019;cap(g,V(.01,-.02,z),V(.03,.005,z),.0085,M.glove);cap(g,V(.03,.005,z),V(.026,.03,z+.002),.008,M.glove);}
  cap(g,V(-.016,-.02,.02),V(-.03,.01,-.01),.0095,M.glove);cap(g,V(-.03,.01,-.01),V(-.026,.03,-.03),.0088,M.glove);
  const wr=V(-.01,-.045,.05);limb(g,V(0,-.02,.02),wr,.026,.024,M.glove);return wr;}
 function arm(g,wr,elbow,shoulder){const cuff=wr.clone().lerp(elbow,.12);limb(g,wr,cuff,.027,.03,M.glove);limb(g,cuff,cuff.clone().lerp(elbow,.08),.04,.042,M.sleeve2);
  limb(g,cuff,elbow,.04,.05,M.sleeve,16);const e=new T.Mesh(new T.SphereGeometry(.05,14,10),M.sleeve);e.position.copy(elbow);g.add(e);limb(g,elbow,shoulder,.05,.06,M.sleeve,16);}
 WPNM.arms=function(g,opts={}){const ud=g.userData||{};const R=new T.Group(),Lg=new T.Group();R.name='rArm';Lg.name='lArm';
  const gp=new T.Vector3(.0,-.03,.0);const w=hand(R,gp,1,'grip');arm(R,w,new T.Vector3(.12,-.22,.28),new T.Vector3(.3,-.4,.55));
  if(!opts.oneHand){let fp,fw;if(ud.pistol){fp=new T.Vector3(-.03,-.045,.005);const pal=new T.Mesh(new T.SphereGeometry(.03,14,10),M.glove);pal.scale.set(.8,1.1,.9);pal.position.copy(fp);Lg.add(pal);
     for(let i=0;i<4;i++)cap(Lg,new T.Vector3(-.03,-.03-i*.017,-.015),new T.Vector3(.012,-.035-i*.017,-.03),.0085,M.glove);fw=new T.Vector3(-.05,-.08,.06);limb(Lg,fp,fw,.026,.024,M.glove);}
   else{fp=ud.fg?ud.fg.clone():new T.Vector3(0,.03,-.25);if(ud.vgrip){fp.y-=.05;}fw=hand(Lg,fp,-1,ud.vgrip?'grip':'fg');}
   arm(Lg,fw,fw.clone().add(new T.Vector3(-.18,-.2,.22)),fw.clone().add(new T.Vector3(-.3,-.42,.5)));}
  [R,Lg].forEach(a=>{merge(a);g.add(a);});return {R,L:Lg};};
 WPNM.env=env;})();
