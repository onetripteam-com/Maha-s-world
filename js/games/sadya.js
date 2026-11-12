import {ticker,esc} from './common.js';
import {SADYA_DISHES,SADYA_SPOTS,placeSadya} from './rules.js';
let running=null;
export function start(root,ctx){
 stop();let seconds=76,placed={},mistakes=0,done=false,selected=null,drag=null;
 root.innerHTML=`<div class="mini-game sadya-game"><div class="game-kicker">SADYA SERVICE <span>02 / 03</span></div><h2>Relatives are already seated.</h2><div class="game-status"><span id="sadya-count">0 / 9 served</span><strong id="sadya-timer">01:16</strong><button class="game-cheat-toggle" type="button">Tradition cheat card ↗</button></div>
 <div class="sadya-leaf"><svg aria-hidden="true" viewBox="0 0 330 224" preserveAspectRatio="none"><defs><linearGradient id="leaf-green" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#a1bd6c"/><stop offset="1" stop-color="#4f8858"/></linearGradient></defs><path d="M12 105C77 6 261 5 325 95C295 208 102 239 12 105Z" fill="url(#leaf-green)" stroke="#3b734c" stroke-width="4"/><path d="M12 105Q170 108 325 95" stroke="#dce39a" stroke-opacity=".66" stroke-width="3"/><path d="M83 71l-13-29M139 97l-8-54M202 99l24-59M258 97l37-28M85 141l-20 28M151 119l-14 64M241 110l31 67" fill="none" stroke="#cbdc91" stroke-opacity=".36" stroke-width="2"/></svg>
 ${SADYA_SPOTS.map(s=>`<button class="sadya-slot" type="button" data-slot="${s.id}" style="left:${s.x}%;top:${s.y}%" aria-label="Place ${s.label}"><span class="sadya-slot-art">+</span><span class="sadya-slot-label">${s.id==='rice'?'RICE':s.id==='sambar'?'CURRY':s.id==='payasam'?'SWEET':'·'}</span></button>`).join('')}</div>
 <div class="sadya-message" aria-live="polite">Tap a dish, then its spot. Or drag it onto the leaf.</div>
 <div class="sadya-tray" aria-label="Dishes ready to serve">${SADYA_DISHES.map(d=>`<button class="sadya-dish" type="button" data-dish="${d.id}" aria-label="Pick up ${esc(d.name)}"><i style="--food:${d.color}">${d.emoji}</i><span>${esc(d.name)}</span></button>`).join('')}</div>
 <div class="sadya-actions"><button type="button" class="game-inline-button" data-finish-sadya>Serve what I have ↗</button><span>Different homes have different serving orders ♡</span></div>
 <div class="sadya-cheat" hidden><h3>Tradition, approximately ✿</h3><p>Leaf tip left. Snacks and pickles start at the left. Vegetable sides go across the far/upper half. Rice goes closer to you. Sambar is poured over rice; payasam is the sweet course.</p><p><b>One illustrated example—not a universal rule.</b> Kerala households and regions vary.</p><button type="button">Back to serving ↗</button></div></div>`;
 const count=root.querySelector('#sadya-count'),timer=root.querySelector('#sadya-timer'),message=root.querySelector('.sadya-message'),cheat=root.querySelector('.sadya-cheat');
 const name=id=>SADYA_DISHES.find(d=>d.id===id)?.name||id;
 function pick(id){if(done||ctx.isPaused()||placed[id])return;selected=id;root.querySelectorAll('.sadya-dish').forEach(b=>b.classList.toggle('selected',b.dataset.dish===id));message.textContent=`${name(id)} is waiting for its spot on the leaf.`;ctx.sound('tap');}
 function position(id){if(done||ctx.isPaused()||!selected)return;const dish=selected;if(placeSadya(dish,id,placed)){
  placed[dish]=true;const s=root.querySelector(`[data-slot="${id}"]`);const d=SADYA_DISHES.find(x=>x.id===dish);s.classList.add('served');s.innerHTML=`<span class="sadya-food" style="--food:${d.color}">${d.emoji}</span>`;s.setAttribute('aria-label',`${d.name} correctly served`);
  root.querySelector(`[data-dish="${dish}"]`).disabled=true;root.querySelector(`[data-dish="${dish}"]`).classList.add('served');count.textContent=`${Object.keys(placed).length} / 9 served`;
  message.textContent=['An aunty nodded. Very high praise.','Someone has asked whether you made extra.','Perfect. The banana leaf approves.'][Object.keys(placed).length%3];ctx.sound('correct');if(Object.keys(placed).length===9)finish();
 }else{mistakes++;ctx.sound('wrong');message.textContent=`Not quite where ${name(dish)} goes in this layout. Try again (regional exceptions accepted!).`;sillyShake(id);}
 selected=null;root.querySelectorAll('.sadya-dish.selected').forEach(b=>b.classList.remove('selected'));
 }
 function sillyShake(id){const slot=root.querySelector(`[data-slot="${id}"]`);slot?.classList.add('oops');setTimeout(()=>slot?.classList.remove('oops'),300)}
 let finishRequested=false;function finish(){if(done||finishRequested)return;finishRequested=true;done=true;clockStop();ctx.onFinish(result());}
 root.querySelectorAll('[data-dish]').forEach(b=>{
  b.addEventListener('click',()=>{if(drag?.moved)return;pick(b.dataset.dish)});
  b.addEventListener('pointerdown',e=>{if(ctx.isPaused()||b.disabled)return;drag={id:b.dataset.dish,x:e.clientX,y:e.clientY,moved:false};b.setPointerCapture?.(e.pointerId);});
  b.addEventListener('pointermove',e=>{if(!drag)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>12){drag.moved=true;pick(drag.id);root.classList.add('is-dragging');}});
  b.addEventListener('pointerup',e=>{if(!drag)return;const moved=drag.moved;const id=drag.id;drag=null;root.classList.remove('is-dragging');if(!moved)return;pick(id);const under=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-slot]');if(under)position(under.dataset.slot);else message.textContent='The leaf is over here, chef. Try another spot.';});
  b.addEventListener('pointercancel',()=>{drag=null;root.classList.remove('is-dragging')});
 });
 root.querySelectorAll('[data-slot]').forEach(b=>b.addEventListener('click',()=>position(b.dataset.slot)));
 root.querySelector('.game-cheat-toggle').addEventListener('click',()=>{cheat.hidden=false;ctx.sound('tap')});
 cheat.querySelector('button').addEventListener('click',()=>{cheat.hidden=true});
 root.querySelector('[data-finish-sadya]').addEventListener('click',finish);
 const clockStop=ticker(ctx,dt=>{if(done)return;seconds=Math.max(0,seconds-dt);const v=Math.ceil(seconds);timer.textContent=`${String(Math.floor(v/60)).padStart(2,'0')}:${String(v%60).padStart(2,'0')}`;if(seconds===0)finish()});
 running={stop(){clockStop();},result:()=>{const n=Object.keys(placed).length;const score=Math.max(0,n*100+Math.round(seconds)*2-mistakes*11);return {id:'sadya',score,maxScore:1052,won:n>=7,description:n>=9?'Uncle has announced: “Exactly like home!” Please frame this moment.':n>=7?'Aunties are pleased. Their silence speaks volumes.':'Even the confused pappadam enjoyed the party. Next time: fewer relatives watching.',duration:Math.round(76-seconds)}}};
 return running;
}
export function stop(){running?.stop();running=null;}
export function result(){return running?.result()||null;}