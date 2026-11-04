//WORLD-SPACE-BEGIN  #4 smooth space: MSAA composer for the orbit view (kills the stair-stepped limb), 4k NASA Earth/Moon swap, max anisotropy, dithered atmosphere shaders (no banding)
{const T=THREE,WS={swaps:0,dith:0};window.__wspace=WS;
const pr=()=>Math.min(devicePixelRatio,2);
const mkRT=()=>new T.WebGLRenderTarget(innerWidth*pr(),innerHeight*pr(),{type:T.HalfFloatType,samples:isTouch?4:8});
const oComp=new EffectComposer(renderer,mkRT());oComp.setPixelRatio(pr());const oPass=new RenderPass(oScene,oCam);oComp.addPass(oPass);
if(HIGH)oComp.addPass(new UnrealBloomPass(new T.Vector2(innerWidth/2,innerHeight/2),0.3,0.35,0.97));oComp.addPass(new OutputPass());WS.comp=oComp;
addEventListener('resize',()=>{oComp.setPixelRatio(pr());oComp.setSize(innerWidth,innerHeight);});
const MAXA=renderer.capabilities.getMaxAnisotropy();
const UP={'earth_day_2k.jpg':'tex/earth_day_4k.jpg','moon_lroc_2k.jpg':'tex/moon_lroc_4k.jpg'};const done=new WeakSet();
const DITH='\nfloat wsDith(){return (fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5)/255.0;}\n';

// ISS-look haze tuning for GSPACE-ASCENT (string patches, applied once per material)
const HZ=[['float hit=step(alt,0.0)*step(b,0.0);','float hit=smoothstep(2.0,-6.0,alt)*step(b,0.0);'],
 ['vec3 col=vec3(0.22,0.48,1.0)*dens*1.6*(1.0-hit)+vec3(0.6,0.8,1.0)*exp(-max(alt,0.0)/2.0)*0.6*(1.0-hit);','alt=b>0.0?length(c)-R:alt;float dn=exp(-max(alt,0.0)/6.0);vec3 col=(vec3(0.03,0.20,1.0)*dn*1.35+vec3(0.18,0.42,1.0)*exp(-max(alt,0.0)/1.6)*0.22)*(1.0-hit)*smoothstep(50.0,6.0,alt);'],
 ['float mu=max(dot(n,V),0.06);float air=1.0/mu;','float mu=max(dot(n,V),0.0);float air=min(1.0/max(mu,0.02),7.0)*0.55;'],
 ['vec3 ins=(BR*fR*phR+vec3(BM*fM*phM))/(BR*fR+BM*fM+1e-4)*(1.0-tr)*sunH*1.15;ins=mix(ins,ins*SKY*1.6,0.55);','vec3 ins=(BR*fR*phR+vec3(BM*fM*phM))/(BR*fR+BM*fM+1e-4)*(1.0-tr)*sunH*0.6;ins=mix(ins,ins*SKY*1.15,0.5);'],
 ['vec3 tr;col=aerial(col,n,Vv,L,hKm,tr);','vec3 tr;col=aerial(col,n,Vv,L,hKm,tr);col=mix(vec3(dot(col,vec3(0.299,0.587,0.114))),col,0.72);col*=vec3(1.04,1.0,0.93);'],
 ['float rim=pow(1.0-max(dot(n,Vv),0.0),4.0);col+=vec3(0.25,0.5,1.0)*rim*0.5*','float rim=pow(1.0-max(dot(n,Vv),0.0),6.0);col+=vec3(0.05,0.25,1.0)*rim*0.3*']];
const MWG='vec2 wsg(vec2 g){g.x=fract(g.x+0.5)-0.5;return g;}\n';
function haze(m){if(m&&m.isShaderMaterial&&!m.userData.wsM&&typeof m.fragmentShader==='string'&&m.fragmentShader.includes('vec3 c=texture2D(map,uv)')&&m.fragmentShader.includes('asin(clamp(gl.z')){m.fragmentShader=m.fragmentShader.replace('void main(){',MWG+'void main(){').replace('vec3 c=texture2D(map,uv)','float wsMag=smoothstep(0.15,0.6,fwidth(uv.y)*2048.0);vec3 c=wsMag*textureGrad(map,uv,wsg(dFdx(uv)),wsg(dFdy(uv)))');m.userData.wsM=1;m.needsUpdate=true;WS.mwFix=1;}if(!m||!m.isShaderMaterial||m.userData.wsH||typeof m.fragmentShader!=='string')return;let fs=m.fragmentShader,n=0;for(const [a,b] of HZ)if(fs.includes(a)){fs=fs.replace(a,b);n++;}if(n){m.fragmentShader=fs;m.userData.wsH=1;m.needsUpdate=true;WS.haze=(WS.haze||0)+n;}}
let scanT=0;const REP=new Map();WS.rep=REP;
function fixTex(t){if(!t||!t.isTexture||done.has(t))return;done.add(t);if(t.anisotropy<MAXA){t.anisotropy=MAXA;t.needsUpdate=true;}
 const src=t.image&&t.image.src||'';for(const k in UP)if(src.endsWith(k)){new T.ImageLoader().load(UP[k],img=>{const n=t.clone();n.source=new T.Source(img);n.anisotropy=MAXA;n.needsUpdate=true;done.add(n);REP.set(t,n);WS.swaps++;scanT=0;},undefined,()=>console.info('ws 4k tex missing '+k));}}
function fixMat(m){if(!m)return;haze(m);for(const k of ['map','emissiveMap','specularMap','bumpMap','normalMap']){const r=REP.get(m[k]);if(r){m[k]=r;m.needsUpdate=true;}fixTex(m[k]);}
 if(m.uniforms)for(const k in m.uniforms){const u=m.uniforms[k];const r=REP.get(u.value);if(r)u.value=r;if(u.value&&u.value.isTexture)fixTex(u.value);}
 if(m.isShaderMaterial&&m.transparent&&!m.userData.wsD&&typeof m.fragmentShader==='string'&&/gl_FragColor\s*=/.test(m.fragmentShader)){const fs=m.fragmentShader,i=fs.lastIndexOf('}');
  m.fragmentShader=fs.slice(0,fs.indexOf('void main'))+DITH+fs.slice(fs.indexOf('void main'),i)+'\ngl_FragColor.rgb+=vec3(wsDith());\n}';m.userData.wsD=1;m.needsUpdate=true;WS.dith++;}}
function scan(){oScene.traverse(o=>{const m=o.material;if(Array.isArray(m))m.forEach(fixMat);else fixMat(m);});}

// test/photo look-at: WS.look='moon'|0..3 (planet index: venus,mars,jupiter,saturn order of PL), WS.fov
const _tp=new T.Vector3();WS.tgt=L=>{const F=window.__orbitfx;if(!F)return null;if(L==='moon'){F.moon.updateWorldMatrix(true,false);F.moon.getWorldPosition(_tp);return _tp;}const P=F.planets;P.updateWorldMatrix(true,false);const a=P.geometry.attributes.position;_tp.fromBufferAttribute(a,L).applyMatrix4(P.matrixWorld);return _tp;};
WS.occ=L=>{const t=WS.tgt(L);if(!t)return 1;const ctr=globe.getWorldPosition(new T.Vector3());const d=t.clone().sub(oCam.position).normalize(),c=ctr.sub(oCam.position),b=c.dot(d);const p2=c.lengthSq()-b*b;return b>0&&p2<(RKM+100)*(RKM+100)?1:0;};
const _rfW=renderFrame;renderFrame=function(sc,cam){if(sc!==oScene)return _rfW(sc,cam);
 WS.rf=(WS.rf||0)+1;const n=performance.now();if(n-scanT>1500){scanT=n;try{scan();}catch(e){console.info('ws scan',e.message);}}
 let sv=null;if(WS.look!=null){const t=WS.tgt(WS.look);if(t){WS.lookN=(WS.lookN||0)+1;sv=[cam.quaternion.clone(),cam.fov];cam.lookAt(t);cam.fov=WS.fov||5;cam.updateProjectionMatrix();cam.updateMatrixWorld();WS.dbg={ndc:t.clone().project(cam).toArray().map(v=>+v.toFixed(3)),par:!!cam.parent&&cam.parent.type};}}
 oPass.scene=sc;oPass.camera=cam;oComp.render();if(sv){cam.quaternion.copy(sv[0]);cam.fov=sv[1];cam.updateProjectionMatrix();}};
}
// high-altitude black-sky fix: three Sky box pins z=w (exactly the far plane); with the log depth buffer part of the box is clipped -> black screen regions above ~5 km. Pull it just inside.
{const m=sky.material;if(m.vertexShader.includes('gl_Position.z = gl_Position.w;')){m.vertexShader=m.vertexShader.replace('gl_Position.z = gl_Position.w;','gl_Position.z = gl_Position.w*0.99995;');m.needsUpdate=true;window.__wspace.skyFix=1;}}
//WORLD-SPACE-END
