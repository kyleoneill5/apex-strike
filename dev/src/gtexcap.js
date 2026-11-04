// ===== GTEXCAP: touch-device texture budget. Downscale any texture > 1024 px to 1024 (keeps aspect), sweep at load + every 3 s. =====
{const touch=('ontouchstart' in window)||navigator.maxTouchPoints>0;const MAX=1024;const seen=new WeakSet();
 const bytes=t=>{const i=t.image;if(!i||!i.width)return 0;return i.width*i.height*4*(t.generateMipmaps!==false?1.33:1);};
 const scan=(cap)=>{let total=0,n=0,cut=0;const all=new Set();scene.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms)for(const k in m){const t=m[k];if(t&&t.isTexture)all.add(t);}});
  if(scene.background&&scene.background.isTexture)all.add(scene.background);
  for(const t of all){const i=t.image;if(cap&&!seen.has(t)&&i&&i.width&&(i.width>MAX||i.height>MAX)&&!t.isDataTexture&&!t.isCubeTexture&&!t.isCompressedTexture&&!t.userData.keep&&(i instanceof HTMLCanvasElement||i instanceof HTMLImageElement||(typeof ImageBitmap!=='undefined'&&i instanceof ImageBitmap))){
    const s=MAX/Math.max(i.width,i.height);const c=document.createElement('canvas');c.width=Math.max(1,Math.round(i.width*s));c.height=Math.max(1,Math.round(i.height*s));
    try{c.getContext('2d').drawImage(i,0,0,c.width,c.height);t.image=c;t.needsUpdate=true;cut++;}catch(e){}}
   seen.add(t);total+=bytes(t);n++;}
  return {n,cut,MB:Math.round(total/1048576)};};
 window.__texReport=()=>scan(false);
 if(touch){const r=scan(true);window.__texCap0=r;setInterval(()=>{try{scan(true);}catch(e){}},3000);}
}
