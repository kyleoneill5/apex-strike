//GSPACE-BEGIN  realistic space environment for the main scene above ~20-30 km: black sky, ESO Milky Way, true-scale NASA Earth, limb glow, hard sunlight, sun disk + flare
{const T=THREE,R=6371000,GEO={lat:40.71*Math.PI/180,lon:-74.0*Math.PI/180},EC=new T.Vector3(0,-R-40,0);
const SP={k:0,saved:null,tex:{}};window.__space=SP;
const ld=(f,srgb)=>{const t=new T.TextureLoader().load('tex/'+f,undefined,undefined,()=>console.info('space tex missing '+f));if(srgb)t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;};
const dayT=ld('earth_day_2k.jpg',1),nightT=ld('earth_night_4k.jpg',1),cloudT=ld('earth_clouds_2k.jpg'),specT=ld('earth_spec_2k.jpg'),mwT=ld('space_milkyway_4k.jpg',1);
cloudT.wrapS=T.RepeatWrapping;
// ECEF basis at the map origin: world +X = east, +Y = up, -Z = north
const U=new T.Vector3(Math.cos(GEO.lat)*Math.cos(GEO.lon),Math.cos(GEO.lat)*Math.sin(GEO.lon),Math.sin(GEO.lat));
const E=new T.Vector3(-Math.sin(GEO.lon),Math.cos(GEO.lon),0),N=new T.Vector3().crossVectors(U,E);
const W2E=new T.Matrix3().set(E.x,U.x,-N.x, E.y,U.y,-N.y, E.z,U.z,-N.z);
const LDV='\n#include <common>\n#include <logdepthbuf_pars_vertex>\n',LDVE='\n#include <logdepthbuf_vertex>\n',LDF='#include <logdepthbuf_pars_fragment>\n',LDFE='\n#include <logdepthbuf_fragment>\n';
const earthMat=new T.ShaderMaterial({uniforms:{day:{value:dayT},night:{value:nightT},cloud:{value:cloudT},spec:{value:specT},sunD:{value:sunDir},w2e:{value:W2E},ctr:{value:EC},cOff:{value:0},fade:{value:0}},
 vertexShader:LDV+'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;\n'+LDVE+'}',
 fragmentShader:LDF+`uniform sampler2D day,night,cloud,spec;uniform vec3 sunD,ctr;uniform mat3 w2e;uniform float cOff,fade;varying vec3 vW;
 const float PI=3.14159265;
 void main(){`+LDFE+`vec3 n=normalize(vW-ctr);vec3 e=normalize(w2e*n);float lat=asin(clamp(e.z,-1.0,1.0)),lon=atan(e.y,e.x);vec2 uv=vec2(lon/(2.0*PI)+0.5,lat/PI+0.5);
  vec3 V=normalize(cameraPosition-vW);float nd=dot(n,sunD);float dayK=smoothstep(-0.12,0.18,nd);
  vec3 dc=texture2D(day,uv).rgb;dc=pow(dc,vec3(1.08))*1.05;
  float cl=texture2D(cloud,uv+vec2(cOff,0.0)).r;cl=smoothstep(0.15,0.9,cl);
  float sea=texture2D(spec,uv).r;
  vec3 col=dc*max(nd,0.0)*2.0;
  vec3 H=normalize(sunD+V);float sp=pow(max(dot(n,H),0.0),70.0)*sea*(1.0-cl)*2.2+pow(max(dot(n,H),0.0),8.0)*sea*0.06;
  col+=vec3(1.0,0.95,0.85)*sp*dayK;
  col=mix(col,vec3(1.0)*(max(nd,0.0)*1.25+0.015),cl*0.92);
  vec3 nl=texture2D(night,uv).rgb;col+=nl*nl*vec3(1.6,1.25,0.85)*(1.0-dayK)*(1.0-cl*0.8);
  float rim=pow(1.0-max(dot(n,V),0.0),3.0);col=mix(col,vec3(0.32,0.56,1.0)*(0.15+max(nd,0.0)),rim*0.3*smoothstep(-0.25,0.2,nd));
  col+=vec3(0.03,0.06,0.12)*max(nd,0.0);
  gl_FragColor=vec4(col,fade);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`,transparent:true,depthWrite:true,fog:false});
const earthS=new T.Mesh(new T.SphereGeometry(R,isTouch?160:256,isTouch?100:160),earthMat);earthS.position.copy(EC);earthS.frustumCulled=false;earthS.visible=false;earthS.renderOrder=-5;scene.add(earthS);
// thin atmospheric limb shell
const atmMat=new T.ShaderMaterial({uniforms:{sunD:{value:sunDir},ctr:{value:EC},fade:{value:0}},side:T.DoubleSide,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,
 vertexShader:LDV+'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;\n'+LDVE+'}',
 fragmentShader:LDF+`uniform vec3 sunD,ctr;uniform float fade;varying vec3 vW;void main(){`+LDFE+`vec3 n=normalize(vW-ctr);vec3 V=normalize(cameraPosition-vW);float f=1.0-abs(dot(n,V));
  float g=pow(f,14.0)*0.45+pow(f,60.0)*1.1;float lit=smoothstep(-0.3,0.35,dot(n,sunD));vec3 c=mix(vec3(0.18,0.4,1.0),vec3(0.55,0.75,1.0),pow(f,20.0));
  gl_FragColor=vec4(c*g*lit*fade,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`});
const atmS=new T.Mesh(new T.SphereGeometry(R+30000,isTouch?128:192,isTouch?80:120),atmMat);atmS.position.copy(EC);atmS.frustumCulled=false;atmS.visible=false;atmS.renderOrder=-4;scene.add(atmS);
// Milky Way panorama (ESO / S. Brunier, CC BY 4.0) - additive, inside the Sky dome
const mwMat=new T.MeshBasicMaterial({map:mwT,side:T.BackSide,depthWrite:false,depthTest:false,fog:false,transparent:true,blending:T.AdditiveBlending,color:0x000000});
const mw=new T.Mesh(new T.SphereGeometry(400000,64,32),mwMat);mw.renderOrder=-10;mw.frustumCulled=false;mw.rotation.set(1.05,0.4,0.6);mw.visible=false;scene.add(mw);
// sun disk, corona & a subtle lens flare
const spr=(c,o={})=>new T.Sprite(new T.SpriteMaterial(Object.assign({map:nukeTex,color:c,blending:T.AdditiveBlending,transparent:true,depthWrite:false,fog:false,opacity:0},o)));
const sunCore=spr(0xffffff),sunHalo=spr(0xfff3e0),sunStar=new T.Group();
const ray=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.translate(128,128);for(let i=0;i<6;i++){x.rotate(Math.PI/6*2);const g=x.createLinearGradient(-128,0,128,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(0.5,'rgba(255,250,235,0.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(-128,-1.2,256,2.4);}return new T.CanvasTexture(c);})();
const sunRay=spr(0xffffff,{map:ray});const ghosts=[[0.5,0x6a9cff,0.08],[0.9,0xffd27a,0.05],[1.3,0x9affc8,0.04],[1.7,0xff8a6a,0.07]].map(([t,c,s])=>{const g=spr(c);g.userData={t,s};return g;});
[sunCore,sunHalo,sunRay,...ghosts].forEach(s=>{s.renderOrder=20;s.frustumCulled=false;scene.add(s);});
// cloud-shadow-free hard light in vacuum
const hemi=scene.children.find(o=>o.isHemisphereLight);
const _fw=new T.Vector3(),_d=new T.Vector3();
const _ue=updEnv;updEnv=function(dt=0.016){_ue(dt);if(SP.camOv){const o=SP.camOv;camera.up.set(0,1,0);camera.position.fromArray(o.p);camera.lookAt(new T.Vector3().fromArray(o.l));if(o.fov&&camera.fov!==o.fov){camera.fov=o.fov;camera.updateProjectionMatrix();}}const cp=camera.position;const k=sstep(20000,32000,cp.y);SP.k=k;const on=k>0.001;
 earthS.visible=atmS.visible=mw.visible=on;
 if(on&&!SP.saved){SP.saved={exp:renderer.toneMappingExposure,sun:sun.intensity,hemi:hemi?hemi.intensity:0,env:scene.environmentIntensity,far:camera.far};}
 if(!on&&SP.saved){if(typeof stars!=='undefined')stars.visible=true;renderer.toneMappingExposure=SP.saved.exp;sun.intensity=SP.saved.sun;if(hemi)hemi.intensity=SP.saved.hemi;scene.environmentIntensity=SP.saved.env;camera.far=Math.max(900000,SP.saved.far);camera.updateProjectionMatrix();SP.saved=null;
  [sunCore,sunHalo,sunRay,...ghosts].forEach(s=>s.material.opacity=0);if(typeof farOcean!=='undefined')farOcean.visible=true;if(typeof cloudDeck!=='undefined')cloudDeck.visible=true;return;}
 if(!on)return;const S0=SP.saved;
 // vacuum: no haze, pure black sky
 if(scene.fog){scene.fog.density*=1-k;scene.fog.color.setRGB(0,0,0);}
 sky.visible=k<0.98;if(k>=0.98)scene.background=new T.Color(0,0,0);
 if(typeof farOcean!=='undefined')farOcean.visible=k<0.5;if(typeof cloudDeck!=='undefined')cloudDeck.visible=k<0.5;if(typeof clouds!=='undefined'&&k>0.5)clouds.visible=false;
 if(camera.far<4.5e6){camera.far=4.5e6;camera.updateProjectionMatrix();}
 earthMat.uniforms.fade.value=k;atmMat.uniforms.fade.value=k;earthMat.uniforms.cOff.value+=dt*0.000004;
 // exposure / hard sunlight
 renderer.toneMappingExposure=T.MathUtils.lerp(S0.exp,0.72,k);sun.intensity=T.MathUtils.lerp(S0.sun,5.2,k);sun.color.setRGB(1,0.98,0.95);if(hemi)hemi.intensity=T.MathUtils.lerp(S0.hemi,0.12,k);scene.environmentIntensity=T.MathUtils.lerp(S0.env,0.35,k);
 // star dimming: bright Earth filling view or the sun in view washes stars out (as a real camera exposes)
 camera.getWorldDirection(_fw);const down=Math.max(0,-_fw.y),sunIn=Math.pow(Math.max(0,_fw.dot(sunDir)),6);
 const dim=k*(1-0.75*sstep(0.1,0.75,down))*(1-0.85*sunIn);mwMat.color.setScalar(0.55*dim);mw.position.copy(cp);
 if(typeof stars!=='undefined')stars.visible=k<0.5;
 // sun: real 0.53 deg disk + corona + rays + ghosts along the flare axis through screen centre
 const D=350000;sunCore.position.copy(cp).addScaledVector(sunDir,D);sunCore.scale.setScalar(D*0.022);sunCore.material.opacity=k;
 sunHalo.position.copy(sunCore.position);sunHalo.scale.setScalar(D*0.16);sunHalo.material.opacity=k*0.55;sunRay.position.copy(sunCore.position);sunRay.scale.setScalar(D*0.35);sunRay.material.opacity=k*0.35;sunRay.material.rotation=0.3;
 const vis=k*Math.max(0,(_fw.dot(sunDir)-0.55)/0.45);for(const g of ghosts){_d.copy(sunDir).lerp(_fw,g.userData.t*2).normalize();g.position.copy(cp).addScaledVector(_d,D*0.5);g.scale.setScalar(D*0.5*g.userData.s);g.material.opacity=vis*0.25;}
};
}
//GSPACE-END
//GSPACE-ASCENT-BEGIN  physically based ascent atmosphere for the rocket/orbit view (oScene, km units)
{const T=THREE;const AS={swapped:false};window.__ascent=AS;
const SUNV=new T.Vector3(1,0,0),CTR=new T.Vector3();
const V='\n#include <common>\n#include <logdepthbuf_pars_vertex>\nvarying vec3 vW;varying vec2 vUv;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;\n#include <logdepthbuf_vertex>\n}';
// Rayleigh (680/550/440 nm, sea-level vertical optical depth) + Mie haze, scale height 8 km / 1.2 km
const SC=`const vec3 BR=vec3(0.058,0.135,0.331);const float BM=0.04;const vec3 SKY=vec3(0.30,0.52,1.0);
vec3 aerial(vec3 col,vec3 n,vec3 V,vec3 L,float hKm,out vec3 tr){float mu=max(dot(n,V),0.06);float air=1.0/mu;
 float fR=1.0-exp(-max(hKm,0.0)/8.0),fM=1.0-exp(-max(hKm,0.0)/1.2);vec3 tau=(BR*fR+BM*fM)*air;tr=exp(-tau);
 float sunH=clamp(dot(n,L)*1.2+0.15,0.0,1.0);float cth=dot(V,-L);float phR=0.75*(1.0+cth*cth);float g=0.76;float phM=(1.0-g*g)/pow(1.0+g*g-2.0*g*cth,1.5)*0.08;
 vec3 ins=(BR*fR*phR+vec3(BM*fM*phM))/(BR*fR+BM*fM+1e-4)*(1.0-tr)*sunH*1.15;ins=mix(ins,ins*SKY*1.6,0.55);return col*tr+ins;}`;
function earthMat(m){return new T.ShaderMaterial({uniforms:{day:{value:m.map},night:{value:m.emissiveMap},spec:{value:m.specularMap},L:{value:SUNV},ctr:{value:CTR},R:{value:RKM}},
 vertexShader:V,fragmentShader:'\n#include <logdepthbuf_pars_fragment>\nuniform sampler2D day,night,spec;uniform vec3 L,ctr;uniform float R;varying vec3 vW;varying vec2 vUv;\n'+SC+`
 void main(){
#include <logdepthbuf_fragment>
 vec3 n=normalize(vW-ctr);vec3 Vv=normalize(cameraPosition-vW);float hKm=length(cameraPosition-ctr)-R;float nd=dot(n,L);
 vec3 dc=texture2D(day,vUv).rgb;float sea=texture2D(spec,vUv).r;
 dc=mix(dc,dc*vec3(0.9,1.0,1.12),sea*0.6);// keep oceans deep blue
 vec3 col=dc*max(nd,0.0)*2.1;vec3 H=normalize(L+Vv);col+=vec3(1.0,0.96,0.88)*pow(max(dot(n,H),0.0),80.0)*sea*1.8*step(0.0,nd);
 col+=pow(texture2D(night,vUv).rgb,vec3(2.0))*vec3(1.6,1.2,0.8)*smoothstep(0.1,-0.2,nd);
 vec3 tr;col=aerial(col,n,Vv,L,hKm,tr);
 float rim=pow(1.0-max(dot(n,Vv),0.0),4.0);col+=vec3(0.25,0.5,1.0)*rim*0.5*smoothstep(-0.2,0.3,nd);
 gl_FragColor=vec4(col,1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>
 }`});}
const limbMat=new T.ShaderMaterial({uniforms:{L:{value:SUNV},ctr:{value:CTR},R:{value:RKM},k:{value:0}},side:T.BackSide,transparent:true,depthWrite:false,blending:T.AdditiveBlending,
 vertexShader:V,fragmentShader:'\n#include <logdepthbuf_pars_fragment>\nuniform vec3 L,ctr;uniform float R,k;varying vec3 vW;\n'+`void main(){
#include <logdepthbuf_fragment>
 vec3 c=cameraPosition-ctr;vec3 d=normalize(vW-cameraPosition);float b=dot(c,d);float p2=dot(c,c)-b*b;float alt=sqrt(max(p2,0.0))-R;// ray's closest altitude
 float hit=step(alt,0.0)*step(b,0.0);float dens=exp(-max(alt,0.0)/7.5);vec3 pn=normalize(c-d*b);float lit=smoothstep(-0.25,0.3,dot(pn,L));
 vec3 col=vec3(0.22,0.48,1.0)*dens*1.6*(1.0-hit)+vec3(0.6,0.8,1.0)*exp(-max(alt,0.0)/2.0)*0.6*(1.0-hit);gl_FragColor=vec4(col*lit*k,1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>
 }`});
const limb=new T.Mesh(new T.SphereGeometry(RKM+90,128,64),limbMat);limb.frustumCulled=false;limb.renderOrder=2;oScene.add(limb);
const _r=renderRocketCam;renderRocketCam=function(v,dt){_r(v,dt);
 if(!AS.swapped&&EARTH.ok){globe.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshPhongMaterial&&o.material.emissiveMap){AS.mat=earthMat(o.material);o.material=AS.mat;AS.swapped=true;}});}
 SUNV.copy(oSun.position).normalize();globe.getWorldPosition(CTR);const h=Math.max(0,v.os.h);
 // sky: Rayleigh zenith radiance falls with the air column above the camera (blue -> navy -> black), never brown
 const col=Math.exp(-h/8000),k=1-col;const bg=oScene.background||(oScene.background=new T.Color());bg.setRGB(0.20*col,0.40*Math.pow(col,0.92),0.85*Math.pow(col,0.8)+0.004);
 limbMat.uniforms.k.value=sstep(15000,60000,h);
 if(AS.look){const rp=oRocket.position,u=rp.clone().sub(CTR).normalize(),t=new T.Vector3(0,0,1).cross(u).normalize();oCam.up.copy(AS.look==='down'?t:u);oCam.position.copy(rp).addScaledVector(u,0.08).addScaledVector(t,0.1);
  const dip=Math.acos(RKM/(RKM+h/1000));oCam.lookAt(AS.look==='down'?CTR:oCam.position.clone().addScaledVector(t,-Math.cos(dip+0.25)).addScaledVector(u,-Math.sin(dip+0.25)));}if(EARTH.cloud)EARTH.cloud.material.color.setScalar(1.1);};}
//GSPACE-ASCENT-END
// launches happen in local daylight (~10:30 solar time at the pad) so the climb-out shows a sunlit blue Earth, not the real-time night side
{const _slf=setLaunchFrame;setLaunchFrame=function(site){_slf(site);if(site){const d=new Date();const lonDeg=KSC.lon*180/Math.PI;const utcH=((10.5-lonDeg/15)%24+24)%24;EARTH.T0=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())+utcH*3600000;_slf();}};
 if(player&&player.def&&player.def.cls==='rocket')setLaunchFrame(player.def.rk==='starship'&&settings.ssPad!=='lc39a'?'starbase':'ksc');}
