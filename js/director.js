/** MAHA Director's Cut: visual continuity, souvenirs and original soundscapes.
 * Pure enhancement: every original game, envelope and page remains independently usable.
 */
import {paintedWorld} from './painted-worlds.js';
const root=document.querySelector('#app');
let scheduled=false,lastRoom=null,helloShown=false;
const safeRead=(key,fallback)=>{try{const s=localStorage.getItem('maha.escape.v1.'+key);return s===null?fallback:JSON.parse(s)}catch{return fallback}};
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const iconMark=()=>{
 const room=root?.querySelector('.room-scene');if(!room||room.classList.contains('new-home'))return;
 if(room!==lastRoom){lastRoom=room;helloShown=false;}
 if(!room.classList.contains('director-room')){
  const paint=room.querySelector('.room-paint');if(!paint)return;
  const image=document.createElement('img');image.className='director-illustration';image.alt='';image.setAttribute('aria-hidden','true');image.src=room.dataset.theme==='story'?'./assets/room-directors-cut.svg':`./assets/room-theme-${room.dataset.theme}.svg`;
  image.addEventListener('error',()=>{room.classList.remove('director-room');image.remove()}, {once:true});
  paint.querySelector('.room-theme-accents')?.before(image);
  for(const cls of ['director-vignette','director-lightwash']){const el=document.createElement('div');el.className=cls;el.setAttribute('aria-hidden','true');paint.append(el);}
  room.classList.add('director-room');
  const labels={music:'Radio',letters:'Letters',movies:'Cinema',travel:'Travel',games:'Arcade',garden:'Garden',rest:'Quiet Corner'};
  room.querySelectorAll('.room-object').forEach(button=>{if(button.querySelector('.director-spot-label'))return;const s=document.createElement('span');s.className='director-spot-label';s.textContent=labels[button.dataset.place]||'Explore';s.setAttribute('aria-hidden','true');button.append(s)});
 }
 const souvenirs=room.querySelector('.director-souvenirs')||document.createElement('div');
 souvenirs.className='director-souvenirs';souvenirs.setAttribute('aria-hidden','true');
 if(!souvenirs.isConnected)room.querySelector('.room-overlay')?.append(souvenirs);
 const kept=safeRead('keptLetters',[]),played=safeRead('gameCompletions',{}),dreams=safeRead('dreamPins',[]);
 const states={
  note:Array.isArray(kept)&&kept.length>0,
  postcard:Boolean(safeRead('postcardPinned',false)),
  garden:Boolean(safeRead('gardenWatered',false)),
  stamp:Object.values(played||{}).some(Boolean),
  dream:Array.isArray(dreams)&&dreams.length>0
 };
 const symbols={note:'✉',postcard:'KERALA',garden:'❧',stamp:'✷',dream:'✦'};
 for(const [type,has] of Object.entries(states)){
  const existing=souvenirs.querySelector(`[data-souvenir="${type}"]`);
  if(has&&!existing){const el=document.createElement('span');el.className=`director-souvenir ${type}`;el.dataset.souvenir=type;el.textContent=symbols[type];souvenirs.append(el)}
  if(!has&&existing)existing.remove();
 }
 if(!helloShown&&!safeRead('directorWelcomeSeen',false)){
  helloShown=true;
  try{localStorage.setItem('maha.escape.v1.directorWelcomeSeen',JSON.stringify(true))}catch{}
  const note=document.createElement('div');note.className='director-hello';note.textContent='Go on, touch something. The room has stories.';room.querySelector('.room-overlay')?.append(note);
  if(!reduced())setTimeout(()=>note.remove(),7400);
 }
};
const filmMood=name=>name.includes('Kerala')?'kerala':name.includes('Kuwait')?'kuwait':name.includes('Places')?'places':'trailer';
const storyKinds={kerala:['palms','chai','road','rain','palms'],kuwait:['sun','city','chai','sun','moon'],places:['city','hills','road','mountains','sun','stars'],trailer:['stars','camera','road','stars','camera','stars']};
function images(){
 const cinema=root.querySelector('.cinema-host');
 if(cinema){
  const frame=cinema.querySelector('.cinema-painted');
  if(frame&&!frame.querySelector('.director-frame')){
   const title=cinema.querySelector('.cinema-projector-head span')?.textContent||'';
   const kind=filmMood(title);const shots=storyKinds[kind];const start=Number(frame.dataset.shot)||0;
   const idx=kind==='trailer'?start===0?0:Math.max(0,Math.min(shots.length-1,Math.ceil((start-1)/6))):
    kind==='places'?Math.min(shots.length-1,Math.floor(start/7)):
    Math.min(shots.length-1,Math.floor(start/7));
   const el=document.createElement('div');el.innerHTML=paintedWorld(shots[idx]||'hills');frame.prepend(el.firstElementChild);
  }
  cinema.querySelectorAll('.cinema-poster-art').forEach(el=>{
   if(el.querySelector('.director-frame'))return;
   const name=el.closest('.cinema-poster')?.querySelector('strong')?.textContent||'';
   el.insertAdjacentHTML('afterbegin',paintedWorld(storyKinds[filmMood(name)][0]));
  });
 }
 root.querySelectorAll('.atlas-postcard .postcard-art').forEach(el=>{
  if(el.querySelector('.director-frame'))return;
  const name=el.closest('.atlas-card-front')?.querySelector('h2')?.textContent?.toLowerCase()||'';
  const type=name.includes('kerala')?'palms':name.includes('kuwait')?'sun':name.includes('bengaluru')?'city':name.includes('munnar')?'hills':name.includes('manali')||name.includes('ladakh')||name.includes('nepal')?'mountains':'lake';
  el.insertAdjacentHTML('afterbegin',paintedWorld(type));
 });
}
function scan(){scheduled=false;if(!root)return;iconMark();images();}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(scan)}}
if(root){const observer=new MutationObserver(m=>{if(m.some(x=>x.type==='childList'))schedule()});observer.observe(root,{subtree:true,childList:true});schedule();}
