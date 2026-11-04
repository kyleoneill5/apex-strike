//WORLD-LAND2-BEGIN  NASA Blue Marble (July) satellite colour on the US terrain, finer far LOD (smooth coasts), ocean seam fix, real cloud fields
{const T=THREE,W=window.__world,WL={};window.__wland=WL;
// tex/us_sat_bmng.jpg (NASA Blue Marble crop) was not in the crew handoff. Set window.__US_SAT
// to that path once the file is next to the site root; until then vertex colours stay on and we do not 404.
const SAT_URL=window.__US_SAT||'';
if(W&&W.mat&&SAT_URL){const sat=new T.TextureLoader().load(SAT_URL,undefined,undefined,()=>console.info('us sat missing'));sat.colorSpace=T.SRGBColorSpace;sat.anisotropy=renderer.capabilities.getMaxAnisotropy();
 const m=W.mat;const U={uSat:{value:sat},uGeo:{value:new T.Vector4(W.L0,W.A0,W.K,W.C)},uEI:{value:new T.Vector3(ENEMY.x,ENEMY.z,5000)}};WL.U=U;
 m.onBeforeCompile=s=>{Object.assign(s.uniforms,U);
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;uniform sampler2D uSat;uniform vec4 uGeo;uniform vec3 uEI;')
   .replace('#include <color_fragment>',`
  {float lon=uGeo.x+vWP.x/(uGeo.z*uGeo.w),lat=uGeo.y-vWP.z/uGeo.z;vec2 su=vec2((lon+127.5)/70.0,1.0-(60.7-lat)/45.7);
   vec3 sc=texture2D(uSat,su).rgb*2.4;float ei=smoothstep(uEI.z,uEI.z-800.0,length(vWP.xz-uEI.xy));
   vec3 fn=cross(dFdx(vWP),dFdy(vWP));float slope=clamp(1.0-abs(fn.y)/max(length(fn),1e-6),0.0,1.0);float sh=smoothstep(2.5,6.0,vWP.y);// soft shore: sand band blends into sat colour
   vec3 sand=vec3(0.40,0.36,0.27);vec3 land=mix(sand,sc,sh);land=mix(land,vColor.rgb*1.1,clamp(smoothstep(0.35,0.7,slope)*0.5,0.0,0.5));
   diffuseColor.rgb*=max(mix(land,vColor.rgb,ei),vec3(0.0));}`);};
 m.customProgramCacheKey=()=>'wland2';m.needsUpdate=true;WL.sat=1;}
// ocean: the 60 km Water square + far ring met in a visible circle at 30 km -> scale both with camera height so the seam sits inside the fog
WL.seam=()=>{const s=Math.min(12,Math.max(1,camera.position.y/1000));ocean.scale.set(s,1,s);farOcean.visible=s<1.4;};
// clouds: hide the cotton-puff sprites from altitude, reshape the deck into domain-warped cumulus fields
if(typeof cloudDeck!=='undefined'&&cloudDeck.material){const cm=cloudDeck.material;const a='float d=fb(p);float cov=smoothstep(0.6,0.86,d);';
 if(cm.fragmentShader.includes(a)){cm.fragmentShader=cm.fragmentShader.replace(a,'vec2 q=vec2(fb(p*0.45+3.1),fb(p*0.45+7.7));float d=fb(p*1.7+q*1.3)*0.62+fb(p*6.5+q*2.0)*0.38;float cov=smoothstep(0.5,0.68,d)*smoothstep(0.35,0.55,fb(p*0.22+11.0));');cm.needsUpdate=true;WL.clouds=1;}}
WL.probe=()=>{const rt=new T.WebGLRenderTarget(64,32);renderer.setRenderTarget(rt);renderer.clear();renderer.render(scene,camera);const b=new Uint8Array(64*32*4);renderer.readRenderTargetPixels(rt,0,0,64,32,b);renderer.setRenderTarget(null);rt.dispose();let blk=0;for(let i=0;i<64*32;i++)if(b[i*4]+b[i*4+1]+b[i*4+2]<15)blk++;return {blk,of:2048,cam:camera.position.toArray().map(Math.round)};};
WL.probeImg=(w=384,h=192,P,Lk)=>{const cam=camera.clone();if(P){cam.position.set(...P);cam.lookAt(...Lk);cam.aspect=w/h;cam.updateProjectionMatrix();cam.updateMatrixWorld();}const rt=new T.WebGLRenderTarget(w,h,{samples:4});renderer.setRenderTarget(rt);renderer.clear();renderer.render(scene,cam);const b=new Uint8Array(w*h*4);renderer.readRenderTargetPixels(rt,0,0,w,h,b);renderer.setRenderTarget(null);rt.dispose();
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),d=x.createImageData(w,h);for(let j=0;j<h;j++)for(let i=0;i<w;i++){const s=((h-1-j)*w+i)*4,t=(j*w+i)*4;for(let k=0;k<3;k++)d.data[t+k]=Math.min(255,Math.pow(b[s+k]/255,1/2.2)*255);d.data[t+3]=255;}x.putImageData(d,0,0);return c.toDataURL();};
WL.noSat=()=>{const m=W.mat;m.onBeforeCompile=()=>{};m.customProgramCacheKey=()=>'wland2off';m.needsUpdate=true;};
WL.shot=(w=512,h=240)=>{renderFrame(scene,camera);const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(renderer.domElement,0,0,w,h);return c.toDataURL();};
const _ueL=updEnv;updEnv=function(dt){_ueL(dt);try{WL.seam();if(typeof clouds!=='undefined'&&clouds){const y=camera.position.y;if(y>=2600){if(clouds.visible){clouds.visible=false;WL.hid=1;}}else if(WL.hid){clouds.visible=true;WL.hid=0;}}}catch(e){}};
}
//WORLD-LAND2-END
