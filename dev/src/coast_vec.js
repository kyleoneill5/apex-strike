// Smooth vector shoreline over the 60 m terrain grid. Natural Earth rings are on window.__world.coast
// (game metres / 10). A sand/water ribbon follows the polygon so the coast is not a staircase.
(()=>{const T=THREE,W=window.__world;if(!W||!W.coast)return;
 const sand=new T.MeshStandardMaterial({color:0xc2b48a,roughness:1,metalness:0});
 const wet=new T.MeshStandardMaterial({color:0x1c4a62,roughness:0.35,metalness:0.08});
 function ribbon(ring,halfIn,halfOut,y,mat){const n=ring.length;if(n<8)return null;const pos=[],idx=[],uv=[];
  for(let i=0;i<n;i++){const a=ring[i],b=ring[(i+1)%n],c=ring[(i+n-1)%n];
   const tx=(b[0]-c[0])*10,tz=(b[1]-c[1])*10,L=Math.hypot(tx,tz)||1,nx=-tz/L,nz=tx/L;
   const x=a[0]*10,z=a[1]*10;
   pos.push(x+nx*halfIn,y+0.35,z+nz*halfIn, x-nx*halfOut,y,z-nz*halfOut);
   uv.push(0,i/n,1,i/n);}
  for(let i=0;i<n;i++){const k=i*2,j=((i+1)%n)*2;idx.push(k,k+1,j, j,k+1,j+1);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new T.Mesh(g,mat);m.frustumCulled=false;m.renderOrder=2;m.receiveShadow=true;return m;}
 const g=new T.Group();g.name='coastVec';
 for(const poly of W.coast){const ring=poly[0];if(!ring||ring.length<40)continue;
  const a=ribbon(ring,28,8,2.4,sand),b=ribbon(ring,6,36,1.15,wet);if(a)g.add(a);if(b)g.add(b);}
 scene.add(g);window.__coastVec=g;})();
