import {ticker} from './common.js';
import {BAG_ITEMS,BAG_W,BAG_H,BAG_MAX_KG,canPack,rotatedCells,baggageScore} from './rules.js';
let running=null;
export function start(root,ctx){
 stop();let remaining=80,packed={},occupied={},kg=0,selected=null,rotated=false,drag=null,done=false,errors=0;
 root.innerHTML=`<div class="mini-game baggage-game"><div class="game-kicker">KWI DEPARTURES <span>03 / 03</span></div><h2>Kuwait baggage negotiations.</h2><div class="game-status"><span id="bag-count">0 items packed</span><strong id="bag-timer">01:20</strong></div><div class="bag-scale"><span>CHECKED BAG · LIMIT ${BAG_MAX_KG}KG</span><strong id="bag-weight">0.0 kg</strong><div class="weight-track"><div id="bag-weight-fill"></div></div></div>
 <div class="suitcase-scene"><span class="suitcase-handle-shape"></span><div class="suitcase-grid" id="suitcase-grid">${Array.from({length:BAG_W*BAG_H},(_,i)=>`<button type="button" data-x="${i%BAG_W}" data-y="${Math.floor(i/BAG_W)}" aria-label="Suitcase row ${1+Math.floor(i/BAG_W)} column ${1+(i%BAG_W)}"></button>`).join('')}</div><span class="suitcase-latch latch-left"></span><span class="suitcase-latch latch-right"></span></div>
 <p class="bag-message" aria-live="polite">Tap an item, then a square inside the suitcase. Dragging works too.</p>
 <div class="bag-tray">${BAG_ITEMS.map(i=>`<button type="button" class="bag-item" data-item="${i.id}" aria-label="Select ${i.name}, ${i.weight} kilograms"><span class="bag-item-art">${i.icon}</span><span class="bag-item-copy"><b>${i.name}</b><small>${i.weight} kg</small></span></button>`).join('')}</div>
 <div class="bag-actions"><button class="game-inline-button" data-rotate type="button">↻ Rotate item</button><button class="game-inline-button" data-pack type="button">Close suitcase ✓</button></div></div>`;
 const status=root.querySelector('#bag-count'),weight=root.querySelector('#bag-weight'),fill=root.querySelector('#bag-weight-fill'),msg=root.querySelector('.bag-message'),grid=root.querySelector('#suitcase-grid');
 function pick(id){if(done||ctx.isPaused()||packed[id])return;selected=id;rotated=false;clearPreview();root.querySelectorAll('[data-item]').forEach(b=>b.classList.toggle('selected',b.dataset.item===id));msg.textContent=`${BAG_ITEMS.find(i=>i.id===id).name}: tap a suitcase square to place it. ↻ rotates.`;ctx.sound('tap');}
 function clearPreview(){grid.querySelectorAll('.bag-preview').forEach(cell=>cell.classList.remove('bag-preview','bag-preview-no'));}
 function preview(x,y){clearPreview();if(!selected)return;const item=BAG_ITEMS.find(i=>i.id===selected);const check=canPack(item,x,y,occupied,rotated,kg);const cells=check.ok?check.cells:rotatedCells(item.cells,rotated).map(([dx,dy])=>[x+dx,y+dy]);for(const [cx,cy] of cells){const cell=grid.querySelector(`[data-x="${cx}"][data-y="${cy}"]`);if(cell)cell.classList.add('bag-preview',...(check.ok?[]:['bag-preview-no']));}}
 function alarm(){root.querySelector('.bag-scale').classList.remove('overweight');void root.querySelector('.bag-scale').offsetWidth;root.querySelector('.bag-scale').classList.add('overweight');ctx.sound('alarm');}
 function pack(x,y){clearPreview();if(done||ctx.isPaused()||!selected)return;const item=BAG_ITEMS.find(i=>i.id===selected);const check=canPack(item,x,y,occupied,rotated,kg);
  if(!check.ok){errors++;msg.textContent=check.why==='weight'?'OVERWEIGHT! Airport says no. Not even for “just one coconut.”':check.why==='overlap'?'That seat is occupied. Try another corner.':'The suitcase has edges, unfortunately.';if(check.why==='weight')alarm();else ctx.sound('wrong');return;}
  check.cells.forEach(([cx,cy],i)=>{occupied[`${cx},${cy}`]=item.id;const cell=grid.querySelector(`[data-x="${cx}"][data-y="${cy}"]`);cell.classList.add('packed');cell.style.setProperty('--item-color',['#bf866a','#7a9e9d','#e8be78','#9fb18b','#a18b9f','#e2aa81','#c18669','#89a78c'][BAG_ITEMS.indexOf(item)]);cell.textContent=i===0?item.icon:'';cell.title=item.name;});
  packed[item.id]=true;kg+=item.weight;status.textContent=`${Object.keys(packed).length} items packed`;weight.textContent=`${kg.toFixed(1)} kg`;fill.style.width=`${kg/BAG_MAX_KG*100}%`;root.querySelector(`[data-item="${item.id}"]`).disabled=true;root.querySelector(`[data-item="${item.id}"]`).classList.add('packed');msg.textContent=`${item.name} made it. ${Math.round(BAG_MAX_KG-kg)} kg left. Suspiciously efficient.`;selected=null;root.querySelectorAll('.bag-item.selected').forEach(b=>b.classList.remove('selected'));ctx.sound('correct');if(Object.keys(packed).length>=7)finish();
 }
 function finish(){if(done)return;done=true;clockStop();ctx.onFinish(result());}
 root.querySelectorAll('[data-item]').forEach(b=>{
  b.addEventListener('click',()=>{if(drag?.moved)return;pick(b.dataset.item)});
  b.addEventListener('pointerdown',e=>{if(ctx.isPaused()||b.disabled)return;drag={id:b.dataset.item,x:e.clientX,y:e.clientY,moved:false};b.setPointerCapture?.(e.pointerId);});
  b.addEventListener('pointermove',e=>{if(drag&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>13){drag.moved=true;root.classList.add('is-dragging')}});
  b.addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;root.classList.remove('is-dragging');if(!d.moved)return;pick(d.id);const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-x][data-y]');if(target)pack(+target.dataset.x,+target.dataset.y)});
  b.addEventListener('pointercancel',()=>{drag=null;root.classList.remove('is-dragging')});
 });
 grid.querySelectorAll('button').forEach(b=>{b.addEventListener('click',()=>pack(+b.dataset.x,+b.dataset.y));b.addEventListener('pointerenter',()=>preview(+b.dataset.x,+b.dataset.y));});grid.addEventListener('pointerleave',clearPreview);
 root.querySelector('[data-rotate]').addEventListener('click',()=>{if(selected&&!ctx.isPaused()){rotated=!rotated;clearPreview();ctx.sound('tap');msg.textContent=`Rotated ${BAG_ITEMS.find(i=>i.id===selected).name}. Try another space.`;}});
 root.querySelector('[data-pack]').addEventListener('click',finish);
 const clockStop=ticker(ctx,dt=>{if(done)return;remaining=Math.max(0,remaining-dt);const v=Math.ceil(remaining);root.querySelector('#bag-timer').textContent=`${String(Math.floor(v/60)).padStart(2,'0')}:${String(v%60).padStart(2,'0')}`;if(!remaining)finish()});
 running={stop(){clockStop()},result:()=>{const n=Object.keys(packed).length,score=baggageScore(n,kg,remaining);return {id:'baggage',score,maxScore:900,won:n>=5,description:n>=6?'Kuwait airport has waved you through. That has never happened this fast.':n>=5?'Baggage accepted. Please explain how the jhumkas got priority.':'The suitcase had a very emotional journey. We will repack together.',duration:Math.round(80-remaining)}}};
 return running;
}
export function stop(){running?.stop();running=null;}
export function result(){return running?.result()||null;}