/** One room. Seven destinations. Same-document, state-preserving portals. */
import {PLACES,placeCSSVars,placeMarkup,isUnlocked,visitPlace} from './places.js';
import {store} from './store.js';
import {startSound,soundEffect,setAudioPlace} from './audio.js';
import {reduce} from './animation.js';








const MODULE_LOADERS={
 letters:()=>import('./letters.js'),
 games:()=>import('./arcade.js'),
 movies:()=>import('./cinema.js'),
 music:()=>import('./radio.js'),
 travel:()=>import('./travel.js'),
 garden:()=>import('./garden.js'),
 rest:()=>import('./rest.js')
};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function rectInFrame(el,frame){const a=el.getBoundingClientRect(),f=frame.getBoundingClientRect();return {x:a.left-f.left,y:a.top-f.top,width:Math.max(1,a.width),height:Math.max(1,a.height),fw:f.width,fh:f.height};}
const escapedName=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
function animate(el,frames,options){if(!el?.animate)return Promise.resolve();const animation=el.animate(frames,{fill:'both',...options});return animation.finished.catch(()=>{}).finally(()=>animation.cancel());}
function gsapTween(el,props,duration){return new Promise(resolve=>window.gsap.to(el,{...props,duration:duration/1000,ease:'power3.inOut',onComplete:resolve}));}

export function makePortalSystem({room,frame,visits,lastVisit,onReturn}){
 let active=null,busy=false,pendingClose=false,destroyed=false,lastSource=null,lastFocus=null,unmountPlace=()=>{},nextArcadeId=null;
 const portal=document.createElement('section');portal.className='portal-screen';portal.id='portal-screen';portal.hidden=true;portal.setAttribute('aria-label','A different place');
 portal.innerHTML='<div class="portal-surface" id="portal-surface"></div>';
 frame.append(portal);
 const surface=portal.querySelector('.portal-surface');
 const canView=()=>typeof document.startViewTransition==='function'&&!reduce();
 async function writeScreen(place,locked){
  portal.dataset.place=place.id;portal.style.cssText=placeCSSVars(place);
  portal.setAttribute('aria-label',place.name);
  unmountPlace();unmountPlace=()=>{};
  surface.innerHTML=`<button class="portal-back" type="button" aria-label="Back to Maha’s room"><span class="portal-back-arrow" aria-hidden="true">←</span><span class="portal-back-copy"><strong>${place.id==='letters'?'Back to room':'Room'}</strong>${place.id==='letters'?'<small>MAHA’S LITTLE ESCAPE</small>':''}</span></button><div class="portal-place" data-metaphor="${place.metaphor}" data-sound="${place.sound}" data-texture="${place.theme.texture}"><div class="portal-content">${placeMarkup(place.id,{locked})}</div></div>`;
  portal.querySelector('.portal-back').addEventListener('click',close);
  let module=null;
  if(MODULE_LOADERS[place.id]){
    try{module=await MODULE_LOADERS[place.id]();}
    catch(error){
      console.error('Could not open MAHA destination',place.id,error);
      const target=portal.querySelector('.portal-content');
      target.innerHTML='<div class="mail-loading" role="alert"><h2>A little hiccup.</h2><p>This part of the room could not load. Return to the room and try again while online.</p></div>';
      return;
    }
  }
  if(place.id==='letters'){
   const target=portal.querySelector('.portal-content');
   target.innerHTML='<div class="mail-loading">Delivering letters…</div>';
   unmountPlace=module.mountLetters(target,{visits,lastVisit,onKeep:()=>onReturn?.('letters'),onPlay:()=>navigate('games')});
  } else if(place.id==='games'){
   const target=portal.querySelector('.portal-content');
   target.innerHTML='<div class="mail-loading">The arcade lights are warming up…</div>';
   unmountPlace=module.mountArcade(target,{onStamp:()=>onReturn?.('games'),autoPlayId:nextArcadeId});nextArcadeId=null;
  } else if(place.id==='movies'){
   unmountPlace=module.mountCinema(portal.querySelector('.portal-content'));
  } else if(place.id==='music'){
   unmountPlace=module.mountRadio(portal.querySelector('.portal-content'));
  } else if(place.id==='travel'){
   unmountPlace=module.mountTravel(portal.querySelector('.portal-content'),{onPostcard:()=>onReturn?.('travel')});
  } else if(place.id==='garden'){
   unmountPlace=module.mountGarden(portal.querySelector('.portal-content'));
  } else if(place.id==='rest'){
   unmountPlace=module.mountRest(portal.querySelector('.portal-content'),{onPlay:()=>{const choices=['spark','lettersmile','baggage','doctor','world','vlog'];nextArcadeId=choices[Math.floor(Math.random()*choices.length)];navigate('games')}});
  } else {
   portal.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>action(button)));
  }
 }
 async function morphFallback(opening,source){
  const rect=rectInFrame(source,frame);
  const scaleX=rect.width/rect.fw,scaleY=rect.height/rect.fh;
  // Transform a full-frame surface from the actual tapped hit-area rectangle.
  const transform=`translate(${rect.x}px,${rect.y}px) scale(${scaleX},${scaleY})`;
  const shell=document.createElement('div');shell.className='portal-morph';shell.style.cssText=placeCSSVars(PLACES[active]);shell.innerHTML=`<span>${PLACES[active].icon}</span>`;frame.append(shell);
  const duration=reduce()?110:430;
  shell.style.transform=opening?transform:'none';
  if(opening){portal.hidden=false;portal.style.opacity='0';}
  const origin={transform:opening?transform:'none',opacity:1};
  const target={transform:opening?'none':transform,opacity:opening?1:0.9};
  const motion=window.gsap&&!reduce()?gsapTween(shell,target,duration):animate(shell,[origin,target],{duration,easing:'cubic-bezier(.21,.75,.22,1)'});
  const fade=animate(opening?room:portal,[{opacity:1},{opacity:0}],{duration:reduce()?110:220,easing:'ease-out'});
  await Promise.all([motion,fade]);
  if(opening){room.classList.add('room-portal-away');portal.style.opacity='1';}
  else{room.classList.remove('room-portal-away');portal.hidden=true;portal.style.opacity='';}
  shell.remove();
 }
 async function viewTransition(opening,source){
  const name='maha-portal-object';
  const target=opening?source:surface;
  const destination=opening?surface:source;
  target.style.viewTransitionName=name;
  portal.dataset.transition=opening?'enter':'exit';
  const transition=document.startViewTransition(()=>{
   target.style.viewTransitionName='none';
   room.classList.toggle('room-portal-away',opening);
   portal.hidden=!opening;
   destination.style.viewTransitionName=name;
  });
  try{await transition.finished;}catch{}finally{target.style.viewTransitionName='';destination.style.viewTransitionName='';delete portal.dataset.transition;}
 }
 function animateArrival(id){
  // Arrival is a portal state, not dependent on a particular decorative element.
  // Stateful destinations may replace their entry artwork with a real application.
  portal.classList.add('portal-arrived');
  const target=portal.querySelector('.portal-entry');
  if(!target||reduce())return;
  // Each metaphor has its own signature gesture; only compositor-friendly properties.
  const from={
   post:'translateY(-28px) rotate(-7deg) scale(.86)',
   radio:'rotate(-28deg) scale(.72)',
   cinema:'scaleX(.48) scaleY(.89)',
   travel:'rotateX(37deg) rotate(-8deg) scale(.84)',
   arcade:'translateY(34px) scale(.84)',
   rest:'scale(.65) translateY(-14px)',
   garden:'translateY(38px) scaleY(.28)'
  }[id]||'scale(.88)';
  animate(target,[{opacity:.45,transform:from},{opacity:1,transform:'none'}],{duration:reduce()?100:245,easing:'cubic-bezier(.2,.9,.3,1)'});
 }
 async function open(id,source,intent){
  if(destroyed||busy||active||!PLACES[id]||!source)return;
  room.inert=true;busy=true;pendingClose=false;active=id;lastSource=source;lastFocus=document.activeElement;
  const place=PLACES[id],locked=!isUnlocked(id,visits);
  startSound();soundEffect('door');await writeScreen(place,locked);
  if(intent){const note=document.createElement('p');note.className='portal-intent';note.textContent=intent;surface.querySelector('.portal-place').prepend(note);}
  source.classList.add('portal-selected');
  const native=canView();
  try{if(native)await viewTransition(true,source);else await morphFallback(true,source);}catch(e){console.warn('Portal transition fallback',e);room.classList.add('room-portal-away');portal.hidden=false;}
  source.classList.remove('portal-selected');
  visitPlace(id);setAudioPlace(place.sound);
  portal.querySelector('.portal-back')?.focus({preventScroll:true});
  animateArrival(id);
  busy=false;
  // Back can be tapped before the opening transition finishes.
  if(pendingClose){pendingClose=false;void close();}
 }
 async function close(){
  if(!active||destroyed)return;
  if(busy){pendingClose=true;return;}
  busy=true;
  const target=lastSource;
  portal.classList.remove('portal-arrived');
  try{if(canView())await viewTransition(false,target);else await morphFallback(false,target);}catch(e){console.warn('Reverse transition fallback',e);room.classList.remove('room-portal-away');portal.hidden=true;}
  unmountPlace();unmountPlace=()=>{};
  setAudioPlace('room');
  room.inert=false;const old=active;active=null;busy=false;onReturn?.(old);lastFocus?.focus({preventScroll:true});
 }
 async function navigate(placeId){
  if(!active||busy)return;
  await close();
  const source=room.querySelector(`.room-object[data-place="${placeId}"]`);
  if(source)await open(placeId,source);
 }
 function action(button){
  const name=button.dataset.action;
  startSound();soundEffect(name==='arcade-beep'?'arcade':'pick');
  if(name==='keep-letter'){store.set('keptLetter',true);button.textContent='✓ Kept in your room';}
  else if(name==='pin-postcard'){store.set('postcardPinned',true);button.textContent='✓ Postcard pinned in your room';}
  else if(name==='water-plant'){store.set('gardenWatered',true);button.textContent='✓ Watered today';portal.querySelector('.garden-plant')?.classList.add('garden-grown');}
  else if(name==='tune-radio'){button.textContent='Found a new imaginary station ↗';portal.querySelector('.radio-dial')?.classList.toggle('dial-tuned');}
  else if(name==='arcade-beep'){const lines=['Achievement unlocked: exceptional button pressing.','Points: 0. Confidence: 100.','No refunds on imaginary coins.'];const i=Number(store.get('arcadeClicks',0));portal.querySelector('.arcade-joke').textContent=lines[i%lines.length];store.set('arcadeClicks',i+1);}
  else if(name==='dim-lamp'){portal.querySelector('.rest-lamp')?.classList.toggle('lamp-dimmed');button.textContent=button.textContent.includes('Dim')?'Turn the lamp up ↗':'Dim the lamp ↗';}
 }
 const onKey=e=>{if(e.key==='Escape'&&active){if(portal.querySelector('dialog[open]'))return;e.preventDefault();close();}};
 document.addEventListener('keydown',onKey);
 return {open,close,get active(){return active;},destroy(){destroyed=true;unmountPlace();document.removeEventListener('keydown',onKey);portal.remove();setAudioPlace('room');}};
}
