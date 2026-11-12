/** Original room image switcher.
 * Only local GitHub Pages assets, guarded by a tracked manifest.
 * No external image request, no tracking, no 404s when art is not yet packaged.
 */
export function mountOriginalRoomArt(room){
 let disposed=false,serial=0;
 const mobile=matchMedia('(max-width:759px)');
 const base=new URL('../assets/rooms/originals/',import.meta.url);
 let manifest=null;
 const promises=new Map();
 async function prepare(){
   try{
     const response=await fetch(new URL('manifest.json',base));
     if(!response.ok)throw Error('manifest '+response.status);
     const value=await response.json();
     if(value?.scenes&&typeof value.scenes==='object')manifest=value;
   }catch{/* Keep fully local current art, no broken image request. */}
   if(!disposed)refresh();
 }
 const key=()=>mobile.matches?'portrait':'wide';
 const preload=(src)=>{
   if(promises.has(src))return promises.get(src);
   const p=new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>resolve(src);
      img.onerror=reject;
      img.src=src;
   });
   promises.set(src,p);
   return p;
 };
 async function refresh(){
   const count=++serial,id=room.dataset.theme,variant=key();
   const allowed=Boolean(manifest?.scenes?.[id]?.[variant]);
   if(!allowed){
     room.dataset.originalArt='false';
     room.style.removeProperty('--original-scene-photo');
     room.style.removeProperty('--peek-limit');
     return;
   }
   const src=new URL(id+'-'+variant+'.webp',base).href;
   try{
     await preload(src);
     if(disposed||serial!==count)return;
     room.dataset.originalArt='true';
     room.style.setProperty('--original-scene-photo',`url("${src}")`);
     room.style.setProperty('--peek-limit',variant==='portrait'?'28px':'76px');
   }catch{
     if(disposed||serial!==count)return;
     room.dataset.originalArt='false';
     room.style.removeProperty('--original-scene-photo');
   }
   for(const button of room.querySelectorAll('[data-world]')){
      const t=button.dataset.world,p=manifest?.scenes?.[t];
      const option=button.querySelector(':scope>span');
      if(!option||!p)continue;
      const available=p[variant]||p.wide||p.portrait;
      if(!available)continue;
      const src=new URL(t+'-'+(p[variant]?variant:p.wide?'wide':'portrait')+'.webp',base).href;
      option.style.backgroundImage=`url("${src}")`;
   }
 }
 const observer=new MutationObserver(records=>{if(records.some(r=>r.attributeName==='data-theme'))refresh()});
 observer.observe(room,{attributes:true,attributeFilter:['data-theme']});
 const onResize=()=>refresh();
 if(mobile.addEventListener)mobile.addEventListener('change',onResize);
 else mobile.addListener(onResize);
 prepare();
 return ()=>{
   disposed=true;serial++;
   observer.disconnect();
   if(mobile.removeEventListener)mobile.removeEventListener('change',onResize);
   else mobile.removeListener(onResize);
   room.style.removeProperty('--original-scene-photo');
 };
}
