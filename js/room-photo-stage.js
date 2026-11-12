import {photoBloomsMarkup} from './photo-bouquet.js';
/** Direct manipulation of Maha's own original room illustration.
 * Every portal is positioned over the exact physical object in the one
 * full-bleed scene. Buttons stay semantic, focusable and part of existing portal
 * system. The photo and hotspots share one aspect-ratio-locked canvas.
 */
export function mountLivingRoomPhoto(room,chosen=[]){
 const stage=room.querySelector('.inhabited-room');
 if(!stage)return ()=>{};
 const layer=document.createElement('div');
 layer.className='living-photo-plane';
 layer.setAttribute('aria-label','Explore the objects in this room');
 const image=document.createElement('img');
 image.className='living-photo-image';
 image.alt='';
 image.draggable=false;
 image.decoding='async';
 const generatedKuwait='./assets/rooms/maha-kuwait.webp';
 const originalKuwait='./assets/rooms/maha-living-room.webp';
 let kuwaitMissing=false;
 image.src=generatedKuwait;
 image.addEventListener('error',()=>{
  // The approved photo is optional until its WebP has been uploaded to the repo.
  if(!kuwaitMissing&&image.getAttribute('src')===generatedKuwait){
   kuwaitMissing=true;
   image.src=originalKuwait;
   return;
  }
  room.dataset.roomPhoto='unavailable';
 });
 image.addEventListener('load',()=>{
  room.dataset.roomPhoto='ready';
  room.dataset.kuwaitPhoto=image.getAttribute('src')===generatedKuwait?'ready':'fallback';
  if(room.dataset.theme==='story')syncFlowers('story');
 });
 layer.append(image);
 const flowerLayer=document.createElement('div');
 flowerLayer.className='photographed-vase-flowers';
 flowerLayer.innerHTML=photoBloomsMarkup(chosen);
 layer.append(flowerLayer);
 // Do not add the legacy photo-sampled leaf layer. It reused an older
 // room photograph, creating translucent duplicate foliage over Kuwait.
 // The real photograph already contains the leaves in their proper position.
 const atmosphere=document.createElement('div');
 atmosphere.className='scene-atmosphere';
 atmosphere.setAttribute('aria-hidden','true');
 layer.append(atmosphere);
 // Move the existing semantic controls, never clone them; event listeners,
 // references, saved bouquet and reverse portal transitions remain intact.
 const portals=[...stage.querySelectorAll('.room-object[data-door],#room-bouquet')];
 for(const control of portals)layer.append(control);
 stage.insertBefore(layer,stage.querySelector('#room-traces'));
 const areas={
  rest:{x:2,y:43,w:35,h:45,title:'The sofa · somewhere to rest'},
  garden:{x:41,y:12,w:16,h:20,title:'The indoor palm · word garden'},
  movies:{x:87,y:5,w:13,h:29,title:'The projector screen · cinema'},
  travel:{x:60,y:17,w:26,h:22,title:'The travel wall · passport & map'},
  letters:{x:67,y:39,w:17,h:17,title:'The letter desk · letters'},
  music:{x:88,y:43,w:12,h:18,title:'The radio · Habibii FM'},
  games:{x:60,y:77,w:16,h:15,title:'The handheld game console · arcade'},
  flowers:{x:51,y:59,w:12,h:20,title:'The vase · A few flowers for whatever today brings'}
 };
 for(const [id,area] of Object.entries(areas)){
  const btn=id==='flowers'?room.querySelector('#room-bouquet'):room.querySelector('[data-door="'+id+'"]');
  if(btn&&id!=='flowers'){
    const sublines={
      rest:'The world can wait a minute.',
      garden:'Some words deserve to grow.',
      movies:'One seat. Your kind of stories.',
      travel:'Every postcard has somewhere to take you.',
      letters:'There are words worth keeping.',
      music:'Find a song for the day you had.',
      games:'A little silliness, on purpose.'
    };
    const label=btn.querySelector('.object-label');
    if(label)label.innerHTML='<strong>'+label.textContent.replace('↗','').trim()+'</strong><small>'+sublines[id]+'</small>';
  }

  if(!btn)continue;
  btn.classList.add('living-hit-area');
  btn.style.setProperty('--object-x',area.x+'%');
  btn.style.setProperty('--object-y',area.y+'%');
  btn.style.setProperty('--object-w',area.w+'%');
  btn.style.setProperty('--object-h',area.h+'%');
  btn.setAttribute('aria-label',area.title);
  btn.title=area.title;
 }
 const oldImage=room.querySelector('.cinematic-photo');
 const sceneImages={story:'maha-kuwait.webp',kerala:'maha-kerala.webp',bengaluru:'maha-bengaluru.webp'};
 const placements={story:{flowers:[43,57,14,27],garden:[41,12,16,20],letters:[64,35,20,21],music:[87,42,13,20],games:[61,76,17,18],travel:[61,13,25,24],movies:[86,4,14,33],rest:[0,39,38,51]},kerala:{rest:[0,43,39,43],garden:[43,14,16,21],movies:[84,7,16,38],travel:[62,13,24,29],letters:[65,36,19,23],music:[88,41,12,20],games:[59,72,20,20],flowers:[49,52,17,32]},bengaluru:{rest:[0,46,41,42],garden:[40,12,18,21],movies:[84,5,16,37],travel:[60,15,24,28],letters:[64,39,19,23],music:[88,43,12,18],games:[59,70,23,23],flowers:[46,54,19,30]}};
 function syncFlowers(id){
  // The old photo rim cutout must not be pasted into a new Kuwait vase.
  const spriteScene=id==='story'&&room.dataset.kuwaitPhoto==='ready'?'kuwait':id;
  if(flowerLayer.dataset.vaseScene!==id||flowerLayer.dataset.spriteScene!==spriteScene){
   flowerLayer.innerHTML=photoBloomsMarkup(chosen,spriteScene);
   flowerLayer.dataset.vaseScene=id;
   flowerLayer.dataset.spriteScene=spriteScene;
  }
 }
 function setTheme(){
  const active=Boolean(sceneImages[room.dataset.theme]);
  const id=sceneImages[room.dataset.theme]?room.dataset.theme:'story';
  const src=id==='story'&&kuwaitMissing?originalKuwait:'./assets/rooms/'+sceneImages[id];
  if(image.getAttribute('src')!==src)image.src=src;
  const region=placements[id];
  for(const [name,coords] of Object.entries(region)){
    const btn=name==='flowers'?room.querySelector('#room-bouquet'):room.querySelector('[data-door="'+name+'"]');
    if(!btn)continue;
    ['--object-x','--object-y','--object-w','--object-h'].forEach((key,i)=>btn.style.setProperty(key,coords[i]+'%'));
  }
  // A bouquet is a living souvenir: it must appear in all three rooms.
  flowerLayer.hidden=false;
  syncFlowers(id);
  flowerLayer.setAttribute('aria-hidden','true');
  // In other themes, the SAME buttons must return to the scene root.
  // Hiding their parent would otherwise make all portals disappear.
  for(const control of portals){
    if(active&&control.parentElement!==layer)layer.append(control);
    if(!active&&control.parentElement!==stage)stage.append(control);
  }
  layer.hidden=!active;
  room.dataset.roomPhotoScene=active?'original':'other';
  if(active&&oldImage)oldImage.style.visibility='hidden';
  else if(oldImage)oldImage.style.removeProperty('visibility');
 }
 const observer=new MutationObserver(setTheme);
 observer.observe(room,{attributes:true,attributeFilter:['data-theme']});
 setTheme();
 return ()=>{
  observer.disconnect();
  if(oldImage)oldImage.style.removeProperty('visibility');
  for(const b of portals){b.classList.remove('living-hit-area');b.style.removeProperty('--object-x');b.style.removeProperty('--object-y');b.style.removeProperty('--object-w');b.style.removeProperty('--object-h');stage.append(b);}
  layer.remove();
 };
}
