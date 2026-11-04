// ===== GNANFIX (wh, Oct 21): shared black-block bug. A NaN/Inf pixel from the scene/N8AO pass gets smeared by SMAA/bloom into big black blocks.
// Fix: one tiny sanitize pass right after the first (render or N8AO) pass: NaN->0, Inf/huge->clamped HDR (64), negatives->0. Cost: 1 fullscreen texture fetch.
{const SanShader={uniforms:{tDiffuse:{value:null}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);bvec4 n=isnan(c);if(any(n)||any(isinf(c)))c=vec4(0.,0.,0.,1.);gl_FragColor=vec4(clamp(c.rgb,0.,64.),clamp(c.a,0.,1.));}'};
 const san=new ShaderPass(SanShader);san.__nanfix=true;window.__nanfix=san;
 const fitC=(C,san)=>{const P=C.passes;const i=P.indexOf(san);if(i!==1){if(i>=0)P.splice(i,1);P.splice(1,0,san);}};
 const hook=(C,san)=>{if(!C||C.__nanHooked)return;C.__nanHooked=1;fitC(C,san);const _r=C.render.bind(C);C.render=function(dt){fitC(C,san);return _r(dt);};};
 hook(composer,san);
 // 2nd guard right before OutputPass: cinematic grain/vignette can push rgb < 0 and OutputPass's sRGB pow() turns that into NaN (black). Clamp here too.
 {const san2=new ShaderPass(SanShader);san2.__nanfix2=true;window.__nanfix2=san2;const fit2=()=>{const P=composer.passes;const o=P.findIndex(p=>p.constructor&&p.constructor.name==='OutputPass');const i=P.indexOf(san2);if(o>=0&&i!==o-1){if(i>=0)P.splice(i,1);const o2=P.findIndex(p=>p.constructor&&p.constructor.name==='OutputPass');P.splice(o2,0,san2);}};
  const _r2=composer.render.bind(composer);composer.render=function(dt){fit2();return _r2(dt);};}
 if(typeof WS!=='undefined'&&WS&&WS.comp)hook(WS.comp,new ShaderPass(SanShader));}
