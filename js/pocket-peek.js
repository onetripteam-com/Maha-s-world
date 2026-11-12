/** Mobile-first room panorama.
 * One image and one hotspot layer move together. Continuous finger tracking,
 * bounded momentum and no position snapping at pointer release. Taps still open
 * portals, but horizontal swipes beginning on a portal become camera gestures.
 */
export function mountPocketPeek(room){
 const stage=room.querySelector('.inhabited-room');
 const left=room.querySelector('#room-pan-left');
 const right=room.querySelector('#room-pan-right');
 const caption=room.querySelector('#room-pan-caption');
 const layer=room.querySelector('.living-photo-plane');
 if(!stage||!left||!right||!layer)return ()=>{};
 const small=matchMedia('(max-width:759px)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let pan=.5,travel=0,drag=null,disposed=false,frame=0,animation=0;
 let blockClickUntil=0;
 const clamp=v=>Math.max(0,Math.min(1,v));
 const measure=()=>{
  travel=Math.max(0,(layer.offsetWidth-stage.clientWidth)/2);
 };
 function paint(){
  if(disposed)return;
  const shift=travel*(1-2*pan);
  room.style.setProperty('--photo-pan-px',shift.toFixed(2)+'px');
  room.style.setProperty('--peek-offset',((pan-.5)*152).toFixed(1)+'px');
  room.dataset.peek=pan<.32?'0':pan>.68?'2':'1';
  left.disabled=!small.matches||pan<=.002;
  right.disabled=!small.matches||pan>=.998;
  if(caption){
   const theme=room.dataset.theme;
   const names=theme==='kerala'?['RAIN AT THE WINDOW','A QUIET AFTERNOON','POSTCARDS FROM KERALA']:theme==='bengaluru'?['THE SOFTER SIDE','A COFFEE BREAK','THINGS WORTH KEEPING']:['YOUR QUIET CORNER','FLOWERS ON THE TABLE','PLACES YOU COULD GO'];
   caption.textContent=pan<.3?names[0]:pan>.7?names[2]:names[1];
  }
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;paint()})};
 const halt=()=>{if(animation)cancelAnimationFrame(animation);animation=0};
 // Camera arrows have a fixed travel distance; finger drags never snap.
 const animateTo=(value,duration=400)=>{
  halt();
  const from=pan,to=clamp(value),start=performance.now();
  if(reduced.matches||!small.matches||Math.abs(to-from)<.0005){
   pan=to;paint();return;
  }
  const tick=now=>{
   if(disposed)return;
   const t=Math.min(1,(now-start)/duration);
   const eased=1-Math.pow(1-t,3);
   pan=from+(to-from)*eased;
   paint();
   if(t<1)animation=requestAnimationFrame(tick);
   else{pan=to;animation=0;paint()}
  };
  animation=requestAnimationFrame(tick);
 };
 const goLeft=()=>animateTo(pan-.25,390);
 const goRight=()=>animateTo(pan+.25,390);
 const onDown=e=>{
  if(disposed||!small.matches||e.isPrimary===false||(e.button!==undefined&&e.button!==0))return;
  if(e.target.closest('input,textarea,select,dialog,a,[role="dialog"]'))return;
  halt();
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,initial:pan,lastX:e.clientX,lastT:performance.now(),velocity:0,active:false};
 };
 const onMove=e=>{
  if(!drag||e.pointerId!==drag.id||!small.matches)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.active){
   if(Math.abs(dx)<9&&Math.abs(dy)<9)return;
   if(Math.abs(dx)<Math.abs(dy)*1.18){drag=null;return}
   drag.active=true;
   layer.classList.add('room-is-dragging');
   try{stage.setPointerCapture?.(e.pointerId)}catch{}
  }
  if(e.cancelable)e.preventDefault();
  const now=performance.now(),dt=Math.max(8,now-drag.lastT);
  const instantaneous=(e.clientX-drag.lastX)/dt;
  drag.velocity=drag.velocity*.62+instantaneous*.38;
  drag.lastX=e.clientX;drag.lastT=now;
  if(travel>0)pan=clamp(drag.initial-dx/(2*travel));
  schedule();
 };
 const onEnd=e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const state=drag;drag=null;
  if(frame){cancelAnimationFrame(frame);frame=0;paint()}
  try{if(stage.hasPointerCapture?.(e.pointerId))stage.releasePointerCapture(e.pointerId)}catch{}
  layer.classList.remove('room-is-dragging');
  if(!state.active){paint();return}
  blockClickUntil=performance.now()+400;
  // A restrained inertial finish, without a jarring quarter-turn snap.
  const lastDelta=Math.max(0,performance.now()-state.lastT);
  const velocity=lastDelta>90?0:state.velocity;
  const momentum=Math.max(-stage.clientWidth*.36,Math.min(stage.clientWidth*.36,velocity*135));
  const target=travel>0?clamp(pan-momentum/(2*travel)):pan;
  const duration=Math.min(480,Math.max(180,220+Math.abs(momentum)*.65));
  animateTo(target,duration);
 };
 const onCancel=()=>{
  drag=null;
  if(frame){cancelAnimationFrame(frame);frame=0}
  layer.classList.remove('room-is-dragging');
  paint();
 };
 const onClickCapture=e=>{
  if(performance.now()<blockClickUntil&&e.target.closest('.living-hit-area')){
   e.preventDefault();e.stopImmediatePropagation();
  }
 };
 const onResize=()=>{measure();paint()};
 const watcher=typeof ResizeObserver!=='undefined'?new ResizeObserver(onResize):null;
 if(watcher)watcher.observe(stage);
 left.addEventListener('click',goLeft);
 right.addEventListener('click',goRight);
 stage.addEventListener('pointerdown',onDown,{passive:true});
 stage.addEventListener('pointermove',onMove,{passive:false});
 stage.addEventListener('pointerup',onEnd,{passive:true});
 stage.addEventListener('pointercancel',onCancel,{passive:true});
 stage.addEventListener('click',onClickCapture,true);
 window.addEventListener('resize',onResize,{passive:true});
 window.visualViewport?.addEventListener('resize',onResize,{passive:true});
 if(small.addEventListener)small.addEventListener('change',onResize);
 else small.addListener(onResize);
 measure();paint();
 return ()=>{
  disposed=true;drag=null;halt();
  if(frame)cancelAnimationFrame(frame);
  watcher?.disconnect();
  left.removeEventListener('click',goLeft);
  right.removeEventListener('click',goRight);
  stage.removeEventListener('pointerdown',onDown);
  stage.removeEventListener('pointermove',onMove);
  stage.removeEventListener('pointerup',onEnd);
  stage.removeEventListener('pointercancel',onCancel);
  stage.removeEventListener('click',onClickCapture,true);
  window.removeEventListener('resize',onResize);
  window.visualViewport?.removeEventListener('resize',onResize);
  if(small.removeEventListener)small.removeEventListener('change',onResize);
  else small.removeListener(onResize);
  room.style.removeProperty('--photo-pan-px');
  room.style.removeProperty('--peek-offset');
 };
}
