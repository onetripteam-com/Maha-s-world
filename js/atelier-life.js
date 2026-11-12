/** Original, lightweight room ambience. No network, no analytics, no external state. */
export function mountAtelierLife(room){
 const scene=room.querySelector('.inhabited-room');
 if(!scene)return ()=>{};
 const spotlight=document.createElement('div');
 spotlight.className='atelier-followlight';
 spotlight.setAttribute('aria-hidden','true');
 scene.append(spotlight);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
 let last={x:50,y:50},pending=0,alive=true;
 const paint=()=>{
  pending=0;
  if(!alive||reduced.matches||!fine.matches)return;
  spotlight.style.setProperty('--light-x',last.x+'%');
  spotlight.style.setProperty('--light-y',last.y+'%');
 };
 const onMove=e=>{
  if(reduced.matches||!fine.matches)return;
  const r=scene.getBoundingClientRect();
  if(!r.width||!r.height)return;
  last={x:Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100)),y:Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100))};
  if(!pending)pending=requestAnimationFrame(paint);
 };
 const onLeave=()=>{spotlight.style.removeProperty('--light-x');spotlight.style.removeProperty('--light-y');};
 scene.addEventListener('pointermove',onMove,{passive:true});
 scene.addEventListener('pointerleave',onLeave);
 return ()=>{alive=false;if(pending)cancelAnimationFrame(pending);scene.removeEventListener('pointermove',onMove);scene.removeEventListener('pointerleave',onLeave);spotlight.remove()};
}
