// ---------- Naval detail pass: Arleigh Burke, Nimitz, Ohio; SR-71 skin ----------
function gridTex(w,h,cols,rows,bg,cell,line,rep=1){return canvasTex(w,h,(x)=>{x.fillStyle=bg;x.fillRect(0,0,w,h);const cw=w/cols,rh=h/rows;for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){x.fillStyle=cell;x.fillRect(i*cw+2,j*rh+2,cw-4,rh-4);x.strokeStyle=line;x.lineWidth=1;x.strokeRect(i*cw+4,j*rh+4,cw-8,rh-8);}},true,rep);}
const VLS_TEX=gridTex(256,320,8,10,'#4a5058','#5c636b','#2c3036');
const hullNo=(t,col='#f2f2f2',sh=true)=>decalTex((x,w,h)=>{x.font='bold 96px Arial Black, Arial';x.textAlign='center';if(sh){x.fillStyle='rgba(0,0,0,.6)';x.fillText(t,w/2+4,h-22);}x.fillStyle=col;x.fillText(t,w/2,h-26);},512,128);
{const _d=destroyer;destroyer=function(){const g=_d();for(const s of[-1,1]){add(g,new THREE.CapsuleGeometry(1.0,4.5,4,10).rotateX(Math.PI/2),0xd8d0b8,s*7.4,12,20);add(g,new THREE.BoxGeometry(0.2,1.6,0.2),0x444444,s*7.4,13.2,18.4);}
 const vl=(z)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(5.4,8.2).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({map:VLS_TEX,roughness:0.7,metalness:0.3,polygonOffset:true,polygonOffsetFactor:-2}));p.position.set(0,6.66,z);g.add(p);};vl(-37);vl(39);return g;};}
{const _s=sub;const tile=canvasTex(512,512,(x,w,h)=>{x.fillStyle='#1b1e20';x.fillRect(0,0,w,h);const n=16;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const v=24+Math.floor(hash(i,j)*14);x.fillStyle=`rgb(${v},${v+3},${v+5})`;x.fillRect(i*w/n+1,j*h/n+1,w/n-2,h/n-2);if(hash(j,i)<0.04){x.fillStyle='#0d0f10';x.fillRect(i*w/n+1,j*h/n+1,w/n-2,h/n-2);}}},true,6);
 const tileN=normalFrom(tile.userData.cv,2.5,6);const subMat=new THREE.MeshStandardMaterial({color:0x9aa0a4,map:tile,normalMap:tileN,roughness:0.85,metalness:0.1});
 sub=function(){const g=_s();g.traverse(o=>{if(o.isMesh&&o.material&&o.material.color&&o.material.color.getHex()===0x1a1d20)o.material=subMat;});
  // 24 Trident tube hatches (2x12), sail-mounted planes detail, masts, propulsor shroud
  for(let i=0;i<12;i++)for(const s of[-1,1]){add(g,new THREE.CylinderGeometry(0.85,0.85,0.18,16),M(0x2a2f33,{roughness:0.7}),s*1.15,4.45,-4+i*3.3);}
  add(g,new THREE.BoxGeometry(2.2,0.6,12.4),subMat,0,10.2,-18).position.y=10.1;for(const [x,h] of[[0.5,3],[-0.4,2.4],[0,3.6]])add(g,new THREE.CylinderGeometry(0.15,0.2,h,8),0x1a1c1e,x,10.2+h/2,-20+x*4);
  const shroud=new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.4,3,20,1,true).rotateX(Math.PI/2),M(0x1e2124,{side:THREE.DoubleSide}));shroud.position.set(0,0,59);g.add(shroud);
  return g;};}
// SR-71: titanium panel lines, chine/wing corrugation, iridescent heat staining near nozzles & spikes
{const _sr=sr71M;const mat=new THREE.MeshStandardMaterial({color:0x0f1012,roughness:0.78,metalness:0.35});
 mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vLP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLP=position;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vLP;').replace('#include <color_fragment>',`#include <color_fragment>
  {vec3 p=vLP;float pl=max(smoothstep(0.035,0.0,abs(fract(p.z*0.55)-0.5)-0.465),smoothstep(0.03,0.0,abs(fract(p.x*0.8+0.5)-0.5)-0.47));diffuseColor.rgb*=1.0-pl*0.35;
   float cor=0.5+0.5*sin(p.x*22.0);diffuseColor.rgb*=0.95+0.05*cor;
   float heat=smoothstep(5.0,13.0,p.z)*(0.6+0.4*smoothstep(0.6,1.2,abs(p.y)+abs(p.x)*0.2));vec3 iri=mix(vec3(0.22,0.16,0.09),vec3(0.12,0.12,0.24),0.5+0.5*sin(p.z*3.0+p.x*2.0));diffuseColor.rgb=mix(diffuseColor.rgb,iri,heat*0.55);
   float streak=smoothstep(0.6,1.0,sin(p.x*9.0+sin(p.z*0.7)*2.))*smoothstep(-2.0,10.0,p.z)*0.12;diffuseColor.rgb+=vec3(0.05,0.045,0.04)*streak;}`).replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor-smoothstep(5.0,13.0,vLP.z)*0.3,0.2,1.);');};
 sr71M=function(){const g=_sr();g.traverse(o=>{if(o.isMesh&&o.material&&o.material.color&&o.material.color.getHex()===0x101113&&!o.material.transparent){const s=o.material.side;o.material=s===THREE.DoubleSide?(mat.userData.d||(mat.userData.d=Object.assign(mat.clone(),{side:THREE.DoubleSide}))):mat;}});return g;};}
{const _ue=updEnv;updEnv=function(dt){_ue(dt);const t=simT;if(player&&player.mesh&&player.mesh.userData.spin)player.mesh.userData.spin.rotation.y=t*2;};}
