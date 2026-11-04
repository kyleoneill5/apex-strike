// ===== Real-time Earth globe (NASA Blue Marble-derived textures, public domain; via three.js examples on jsDelivr) =====
const EARTH={T0:Date.now(),ok:false,tex:'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/'};
const D2R=Math.PI/180;
function gmst(ms){const d=ms/86400000+2440587.5-2451545.0;return ((280.46061837+360.98564736629*d)%360)*D2R;}
function sunECI(ms){const n=ms/86400000+2440587.5-2451545.0;const L=(280.46+0.9856474*n)*D2R,g=(357.528+0.9856003*n)*D2R;const lam=L+(1.915*Math.sin(g)+0.02*Math.sin(2*g))*D2R,eps=23.439*D2R;return V3(Math.cos(lam),Math.cos(eps)*Math.sin(lam),Math.sin(eps)*Math.sin(lam));}
function moonECI(ms){const d=ms/86400000+2440587.5-2451545.0;const L=(218.316+13.176396*d)*D2R,M=(134.963+13.064993*d)*D2R,F=(93.272+13.229350*d)*D2R;
 const lon=L+6.289*D2R*Math.sin(M),lat=5.128*D2R*Math.sin(F),eps=23.439*D2R;const x=Math.cos(lat)*Math.cos(lon),y=Math.cos(lat)*Math.sin(lon),z=Math.sin(lat);return V3(x,y*Math.cos(eps)-z*Math.sin(eps),y*Math.sin(eps)+z*Math.cos(eps));}
const e2t=v=>V3(v.x,v.z,-v.y); // ECI(z-north) -> three frame (y-north)
const llPos=(lat,lon)=>V3(Math.cos(lat)*Math.cos(lon),Math.sin(lat),-Math.cos(lat)*Math.sin(lon));
const KSC={lat:28.608*D2R,lon:-80.604*D2R};const SITES={ksc:{lat:28.608*D2R,lon:-80.604*D2R},starbase:{lat:25.997*D2R,lon:-97.157*D2R}};
const eciFrame=new THREE.Group();oScene.add(eciFrame);const globe=new THREE.Group();eciFrame.add(globe);
function setLaunchFrame(site){if(site){Object.assign(KSC,SITES[site]);EARTH.T0=Date.now();if(EARTH.flag)EARTH.flag.position.copy(llPos(KSC.lat,KSC.lon)).multiplyScalar(RKM+2);}const th=gmst(EARTH.T0);const P=llPos(KSC.lat,KSC.lon+th);const E=V3(-Math.sin(KSC.lon+th),0,-Math.cos(KSC.lon+th)).normalize();const N=new THREE.Vector3().crossVectors(P,E);
 const m=new THREE.Matrix4().set(E.x,E.y,E.z,0,P.x,P.y,P.z,0,-N.x,-N.y,-N.z,0,0,0,0,1);eciFrame.quaternion.setFromRotationMatrix(m);}
setLaunchFrame();
{const L=new THREE.TextureLoader();L.setCrossOrigin('anonymous');const hi=settings.quality!=='low';const ld=(f,srgb)=>new Promise((res,rej)=>L.load(EARTH.tex+f,t=>{if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;res(t);},undefined,rej));
 Promise.all([ld(hi&&!isTouch?'earth_atmos_4096.jpg':'earth_atmos_2048.jpg',1),ld('earth_specular_2048.jpg'),ld('earth_normal_2048.jpg'),ld('earth_lights_2048.png',1)]).then(([day,spec,nrm,lights])=>{
  const mat=new THREE.MeshPhongMaterial({map:day,specularMap:spec,specular:0x445566,shininess:22,normalMap:nrm,normalScale:new THREE.Vector2(0.9,-0.9),emissiveMap:lights,emissive:0xffffff});
  mat.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','vec3 emc=texture2D(emissiveMap,vEmissiveMapUv).rgb;float ndl=dot(normal,directionalLights[0].direction);totalEmissiveRadiance=emc*vec3(1.0,0.82,0.55)*1.8*smoothstep(0.08,-0.22,ndl);');};
  const g=new THREE.Mesh(new THREE.SphereGeometry(RKM,isTouch?128:192,isTouch?96:128),mat);globe.add(g);
  const fl=new THREE.Sprite(new THREE.SpriteMaterial({color:0xff3030,sizeAttenuation:false,depthTest:true}));fl.scale.set(0.012,0.012,1);fl.position.copy(llPos(KSC.lat,KSC.lon)).multiplyScalar(RKM+2);globe.add(fl);EARTH.flag=fl;
  for(const c of earth.children)c.visible=false;EARTH.ok=true;oScene.children.forEach(o=>{if(o.isAmbientLight)o.intensity=0.06;});
  ld('earth_clouds_2048.png',1).then(ct=>{const cm=new THREE.Mesh(new THREE.SphereGeometry(RKM+10,isTouch?96:160,isTouch?64:100),new THREE.MeshLambertMaterial({map:ct,transparent:true,depthWrite:false,opacity:0.95}));globe.add(cm);EARTH.cloud=cm;}).catch(()=>{});
 }).catch(e=>console.info('Earth textures unavailable, procedural fallback'));
 ld('moon_1024.jpg',1).then(t=>{const mo=new THREE.Mesh(new THREE.SphereGeometry(1737*0.35,64,48),new THREE.MeshPhongMaterial({map:t,shininess:1}));oScene.add(mo);EARTH.moon=mo;}).catch(()=>{});}
const sunGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:nukeTex,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,color:0xfff2dd}));sunGlow.scale.setScalar(9000);oScene.add(sunGlow);
const _rrc0=renderRocketCam;
renderRocketCam=function(v,dt){_rrc0(v,dt);const ms=EARTH.T0+v.os.t*1000;const th=gmst(EARTH.T0)+OM.OMEGA*v.os.t;globe.rotation.y=th;
 if(EARTH.cloud)EARTH.cloud.rotation.y+=dt*warp*0.00002;
 const s=e2t(sunECI(ms)).applyQuaternion(eciFrame.quaternion);oSun.position.copy(s).multiplyScalar(100000);oSun.target.position.set(0,0,0);sunGlow.position.copy(s).multiplyScalar(150000);sunGlow.visible=EARTH.ok;
 if(EARTH.moon){const m=e2t(moonECI(ms)).applyQuaternion(eciFrame.quaternion);EARTH.moon.position.copy(m).multiplyScalar(384400*0.35);}
 if(EARTH.ok){karman.visible=v.os.h>60000;}};
window.__earth=EARTH;

const _spawnE=spawn;spawn=function(k,l){const r=_spawnE(k,l);if(player&&player.def.cls==='rocket')setLaunchFrame(player.def.rk==='starship'&&settings.ssPad!=='lc39a'?'starbase':'ksc');return r;};
