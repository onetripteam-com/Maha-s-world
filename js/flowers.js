import {store} from './store.js';
import {flowerSVG,flowerHeadSVG,bouquetMarkup,downloadBouquet} from './botanical.js';
import {soundEffect} from './audio.js';
import {move,delay} from './animation.js';
const esc=x=>String(x).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const floristWords={
 rose:'The classic. Yes, it earned that reputation.',peony:'A little dramatic. In the nicest possible way.',sunflower:'Bringing its own sunshine. Very efficient.',tulip:'All neat lines and quiet confidence.',lily:'The elegant one who never needs to announce it.',orchid:'A bit fancy. Completely allowed.',hibiscus:'A little Kerala sunshine has arrived.',lotus:'Taking its own time. Good idea.',jasmine:'Small flower. Entire room changed.',marigold:'The unofficial festival committee is here.',daisy:'The easy-going one. No big introduction.',lavender:'That is a very good excuse to slow down.',iris:'A little colour with opinions.'
};
// The seven live SVG flowers remain selectable; this glass silhouette is
// foreground occlusion for the preview, not a baked-in image or another bouquet.
// It shares the 500×580 viewBox of bouquetMarkup so stems visibly enter the mouth.
const studioVaseMarkup=()=>`<svg class="studio-vase" viewBox="0 0 500 580" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
 <defs><linearGradient id="maha-studio-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d9eee5" stop-opacity=".80"/><stop offset=".32" stop-color="#7eb1a2" stop-opacity=".83"/><stop offset=".72" stop-color="#315f5d" stop-opacity=".94"/><stop offset="1" stop-color="#132f37" stop-opacity=".97"/></linearGradient>
 <linearGradient id="maha-studio-lip" x1="0" y1="0" x2="1" y2=".5"><stop stop-color="#e3f8ed"/><stop offset=".45" stop-color="#9dbeb2"/><stop offset="1" stop-color="#456a69"/></linearGradient></defs>
 <path d="M207 451C210 470 199 481 192 503L182 545C177 567 193 575 219 576H288C313 573 326 561 318 540L306 503C302 486 296 470 301 451Z" fill="url(#maha-studio-glass)" stroke="#d6eee4" stroke-opacity=".65" stroke-width="2.5"/>
 <path d="M209 453Q236 466 299 452" fill="none" stroke="#e8f9ec" stroke-opacity=".65" stroke-width="2.2"/>
 <ellipse cx="254" cy="450" rx="49" ry="10" fill="#1a3c3b" fill-opacity=".81" stroke="url(#maha-studio-lip)" stroke-width="5"/>
 <path d="M205 450Q252 464 302 450" fill="none" stroke="#e2f2e7" stroke-opacity=".74" stroke-width="2.1"/>
 <path d="M206 483Q195 528 199 551M215 477Q212 517 211 546" fill="none" stroke="#f3fff2" stroke-opacity=".22" stroke-width="5" stroke-linecap="round"/>
 <path d="M223 564Q259 570 291 562" fill="none" stroke="#f5fff2" stroke-opacity=".26" stroke-width="3" stroke-linecap="round"/>
 </svg>`;
export function mountFlowers(root,flowers,onDone,onCancel=null){
 let chosen=[],complete=false,disposed=false;const flights=new Set();
 root.innerHTML=`<section class="scene f2-scene" data-source-scene="${['story','kerala','bengaluru'].includes(store.get('roomTheme'))?store.get('roomTheme'):'story'}" aria-label="The flower studio: choose seven blooms">
  <div class="f2-backdrop" aria-hidden="true"></div>
  <div class="f2-layout">
   <div class="f2-preview">
    <div class="f2-header">
     <div class="f2-intro"><span class="eyebrow">MAHA / THE FLOWER STUDIO <span class="f2-edition">A LITTLE ESCAPE · VOL. 07</span></span><h1>Flowers for <em>today.</em></h1><p id="flower-subtitle">Seven little picks. Repeats very welcome.</p></div>
     <div class="f2-status">
      <div class="f2-counter" id="flower-counter" aria-live="polite"><strong>0 <span>of 7</span></strong><span class="f2-counter-caption">STEMS COLLECTED</span></div>
      <div class="f2-status-note"><span id="flower-instruction">Start with whatever catches your eye.</span><small>Seven is the only rule.</small></div>
     </div>
     <div id="flower-steps" class="f2-steps" role="group" aria-label="The seven places in your bouquet; tap a placed flower to remove it"></div>
    </div>
    <div class="f2-stage" id="bouquet-display">
     <span class="f2-empty" id="bouquet-hint">Your bouquet grows here.<span aria-hidden="true">✳</span></span>
     <div class="f2-bouquet" id="bouquet-growing"></div>
     <div class="f2-petals" aria-hidden="true"><i>✿</i><i>✿</i><i>✿</i><i>✿</i><i>✿</i></div>
    </div>
    <span class="f2-caption" aria-hidden="true"><i>✳</i> CHOSEN BY YOU · MADE TO KEEP</span>
   </div>
   <div class="f2-editor" id="flower-bottom">
    <div class="f2-editor-head"><span><small>THE FLOWER BAR</small> Find your seven.</span><span class="f2-editor-hint">13 BLOOMS · REPEATS WELCOME</span></div>
    <div class="f2-browser f2-browser-v2"><div id="flower-rail" class="f2-rail" role="group" aria-label="Thirteen different flowers. Tap more than once to add repeats."></div></div>
    <div class="f2-footer">
     <div class="f2-note" id="meaning-line" aria-live="polite">Pick the ones you like. We'll worry about arranging them.</div>
     <div class="f2-actions"><button type="button" class="f2-action" id="undo-flower" disabled>↶ Undo last</button><button type="button" class="f2-action" id="reset-flowers" disabled>Start over ↻</button><button type="button" class="f2-action f2-exit" id="cancel-flowers" ${store.get('completed')?'':'hidden'}>← Back to room</button></div>
    </div>
   </div>
  </div>
  <div class="f2-final" id="bouquet-final" hidden><span class="eyebrow">SEVEN FLOWERS · MADE BY MAHA</span><h2>One lovely bunch. <span aria-hidden="true">✳</span></h2><p>Handpicked by you. No further approval needed.</p><div class="f2-final-actions"><button class="button button-outline" id="save-bouquet">Save as picture ↓</button><button class="button button-primary" id="carry-bouquet">Take them home ↗</button></div><p class="f2-export-hint" id="export-hint"></p></div>
 </section>`;
 const rail=root.querySelector('#flower-rail'),renderPlace=root.querySelector('#bouquet-growing'),display=root.querySelector('#bouquet-display');
 for(const f of flowers){
  const btn=document.createElement('button');btn.type='button';btn.className='f2-card';btn.dataset.flower=f.id;btn.setAttribute('aria-pressed','false');btn.setAttribute('aria-label',`${f.name}: ${f.meaning}`);
  btn.innerHTML=`<span class="f2-card-index" aria-hidden="true">${String(flowers.indexOf(f)+1).padStart(2,'0')}</span><span class="f2-card-art">${flowerHeadSVG(f.id)}</span><span class="f2-card-meta"><span class="f2-card-name">${esc(f.name)}</span><span class="f2-add" aria-hidden="true">+ ADD</span></span><span class="f2-picked" aria-hidden="true"></span>`;
  btn.addEventListener('click',()=>pick(f,btn));rail.append(btn);
  // Each species has a different silhouette. Fit the SVG artboard to its
  // *actual painted geometry* so petals never disappear behind the card footer.
  // The fallback viewBox still renders if a browser refuses getBBox().
  const svg=btn.querySelector('.flower-head-svg');
  const paint=svg?.querySelector('.flower-head-paint');
  if(svg&&paint){
   try{
    const b=paint.getBBox();
    if(b.width>0&&b.height>0&&Number.isFinite(b.x+b.y)){
     const size=Math.max(84,b.width,b.height)*1.19;
     const cx=b.x+b.width/2,cy=b.y+b.height/2;
     svg.setAttribute('viewBox',[cx-size/2,cy-size/2,size,size].map(n=>Number(n.toFixed(2))).join(' '));
    }
   }catch{/* Initial viewBox remains usable in browsers without SVG geometry measurement. */}
  }
 }
 // Different browsers resolve nested SVG gradients and transforms with
 // different intrinsic boxes. Fit using the ACTUAL painted pixels, not
 // getBBox() alone. This prevents the rose, tulip, sunflower, etc. from
 // being chopped by the card divider on iPhone Safari.
 const fitVisibleBlossoms=()=>{
  for(const card of rail.querySelectorAll('.f2-card')){
   const svg=card.querySelector('.flower-head-svg');
   const paint=svg?.querySelector('.flower-head-paint');
   const area=card.querySelector('.f2-card-art');
   if(!svg||!paint||!area)continue;
   // Reset before re-measuring, including after phone orientation changes.
   svg.style.setProperty('animation','none','important');
   svg.style.setProperty('transform','none','important');
   svg.style.setProperty('transform-origin','center center','important');
   const ar=area.getBoundingClientRect(),sr=svg.getBoundingClientRect(),br=paint.getBoundingClientRect();
   if(ar.width<20||ar.height<20||br.width<1||br.height<1)continue;
   const factor=Math.min(1,(ar.width-16)/br.width,(ar.height-16)/br.height);
   if(!Number.isFinite(factor)||factor<=0)continue;
   const sx=sr.left+sr.width/2,sy=sr.top+sr.height/2;
   const tx=ar.left+ar.width/2-(sx+((br.left+br.right)/2-sx)*factor);
   const ty=ar.top+ar.height/2-(sy+((br.top+br.bottom)/2-sy)*factor);
   svg.style.setProperty('transform',
    'translate3d('+tx.toFixed(2)+'px,'+ty.toFixed(2)+'px,0) scale('+factor.toFixed(4)+')','important');
  }
 };
 fitVisibleBlossoms();
 let resizeCardFrame=0;
 const onCardResize=()=>{
  if(resizeCardFrame)return;
  resizeCardFrame=requestAnimationFrame(()=>{resizeCardFrame=0;if(!disposed)fitVisibleBlossoms()});
 };
 window.addEventListener('resize',onCardResize,{passive:true});
 function update(){
  root.querySelector('#flower-counter').innerHTML=`<strong>${chosen.length} <span>of 7</span></strong><span class="f2-counter-caption">picked by Maha</span>`;
  root.querySelector('#flower-steps').innerHTML=Array.from({length:7},(_,i)=>{const id=chosen[i];const flower=flowers.find(f=>f.id===id);return id?`<button type="button" class="f2-slot is-picked" data-remove-slot="${i}" title="Remove ${esc(flower?.name||'flower')}" aria-label="Remove ${esc(flower?.name||'flower')} from slot ${i+1}"><i aria-hidden="true">✳</i></button>`:`<span class="f2-slot" aria-label="Empty flower slot ${i+1}"><i aria-hidden="true">${String(i+1).padStart(2,'0')}</i></span>`}).join('');
  renderPlace.innerHTML=(chosen.length?bouquetMarkup(chosen,{stage:complete?'final':'preview'}):'')+(!complete?studioVaseMarkup():'');
  // One artboard for both stems and vase: crop excess empty SVG margins
  // without ever changing their shared coordinate system or saved species.
  if(!complete)renderPlace.querySelectorAll(':scope > svg').forEach(svg=>svg.setAttribute('viewBox','40 80 420 500'));
  rail.querySelectorAll('button').forEach(b=>{const count=chosen.filter(id=>id===b.dataset.flower).length;b.setAttribute('aria-pressed',String(count>0));b.disabled=complete;b.querySelector('.f2-picked').textContent=count?`${count} PICKED`:'';b.querySelector('.f2-add').textContent=count?'+ AGAIN':'+ ADD';});
  root.querySelector('#undo-flower').disabled=!chosen.length||complete; root.querySelector('#reset-flowers').disabled=!chosen.length||complete;
  root.querySelector('#bouquet-hint').hidden=chosen.length>0;
  root.querySelector('.f2-preview').dataset.placed=String(chosen.length);
 }
 function updateInstruction(text){root.querySelector('#flower-instruction').textContent=text;}
 // One picked bloom flies from its physical card to its position in the vase.
 // Transient only; does not change the existing bouquet SVG or saved data.
 function flyPick(f,button){
  if(!button||typeof Element.prototype.animate!=='function'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const from=button.getBoundingClientRect();
  const bloom=renderPlace.querySelector('.bouquet-bloom:last-child');
  const to=bloom?.getBoundingClientRect()||display.getBoundingClientRect();
  const orb=document.createElement('div');
  orb.className='f2-flight';orb.setAttribute('aria-hidden','true');
  orb.innerHTML=flowerSVG(f.id);
  const sx=from.left+from.width*.5,sy=from.top+from.height*.43;
  const ex=to.left+to.width*.5,ey=to.top+to.height*.5;
  orb.style.left=(sx-27)+'px';orb.style.top=(sy-39)+'px';
  document.body.append(orb);flights.add(orb);
  const dx=ex-sx,dy=ey-sy;
  const a=orb.animate([
   {transform:'translate3d(0,0,0) rotate(-9deg) scale(.85)',opacity:.94,offset:0},
   {transform:'translate3d('+(dx*.53)+'px,'+(dy*.52-23)+'px,0) rotate(9deg) scale(1.06)',opacity:1,offset:.54},
   {transform:'translate3d('+dx+'px,'+dy+'px,0) rotate(0) scale(.28)',opacity:0,offset:1}
  ],{duration:650,easing:'cubic-bezier(.19,.77,.2,1)',fill:'forwards'});
  a.onfinish=a.oncancel=()=>{orb.remove();flights.delete(orb)};
 }
 function pick(f,button){
  if(complete||chosen.length>=7) return;
  chosen.push(f.id); root.querySelector("#flower-counter").classList.remove("f2-counter-pop"); void root.querySelector("#flower-counter").offsetWidth; root.querySelector("#flower-counter").classList.add("f2-counter-pop"); soundEffect('pick'); update(); const repeats=chosen.filter(id=>id===f.id).length;
  root.querySelector('#meaning-line').textContent=`${String(chosen.length).padStart(2,'0')} / 07 — ${repeats>1?`Another ${f.name.toLowerCase()}? You've made your choice, and I respect it.`:floristWords[f.id]||f.meaning}`;
  flyPick(f,button);
  if(button&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   button.classList.remove('f2-card-pop');void button.offsetWidth;button.classList.add('f2-card-pop');
   const last=renderPlace.querySelector('.bouquet-bloom:last-child');if(last){last.classList.add('bloom-new');setTimeout(()=>last.classList.remove('bloom-new'),900)}
  }
  if(chosen.length===7) finish(); else updateInstruction(`${7-chosen.length} more to go`);
 }
 root.querySelector('#flower-steps').addEventListener('click',event=>{
  const slot=event.target.closest('[data-remove-slot]');
  if(!slot||complete||disposed)return;
  const index=Number(slot.dataset.removeSlot);
  if(!Number.isInteger(index)||index<0||index>=chosen.length)return;
  const removed=chosen.splice(index,1)[0];
  soundEffect('undo');update();
  const flower=flowers.find(f=>f.id===removed);
  root.querySelector('#meaning-line').textContent=`${flower?.name||'That one'} is back on the shelf. You can always pick it again.`;
  updateInstruction(`${7-chosen.length} more to go`);
  rail.querySelector('[data-flower="'+removed+'"]')?.focus({preventScroll:true});
 });
 const cancel=root.querySelector('#cancel-flowers');
 if(onCancel&&cancel&&!cancel.hidden)cancel.addEventListener('click',()=>{if(disposed)return;disposed=true;onCancel()});
 root.querySelector('#undo-flower').addEventListener('click',()=>{
  if(complete||!chosen.length) return;
  chosen.pop(); soundEffect('undo'); update(); root.querySelector('#meaning-line').textContent='Changed your mind? Excellent flower-shop behaviour.';
  updateInstruction(chosen.length?`${7-chosen.length} more to go`:'Choose your flowers');
 });
 root.querySelector('#reset-flowers').addEventListener('click',()=>{
  if(complete) return;
  chosen=[]; soundEffect('undo'); update(); root.querySelector('#meaning-line').textContent='Fresh start. Take your time.'; updateInstruction('Choose your flowers');
 });
 async function finish(){
  complete=true; store.set('flowers',chosen); soundEffect('complete');
  root.querySelector('#flower-rail').classList.add('shelf-out');
  root.querySelector('.f2-intro').classList.add('f2-intro-fade');
  root.querySelector('#flower-bottom').classList.add('f2-editor-exit');
  updateInstruction('Gathering them for you…');
  await delay(250); if(disposed) return;
  renderPlace.innerHTML=bouquetMarkup(chosen,{wrapped:false,stage:'gather'})+studioVaseMarkup();
  renderPlace.querySelectorAll(':scope > svg').forEach(svg=>svg.setAttribute('viewBox','40 80 420 500'));
  display.classList.add('f2-gathering');
  await delay(650); if(disposed) return;
  renderPlace.innerHTML=bouquetMarkup(chosen,{wrapped:true,stage:'final'});
  display.classList.remove('f2-gathering');
  display.classList.add('f2-wrapping');
  // The wrapping paper, ribbon and label arrive in sequence, not one flat pop.
  // CSS owns this gentle reveal and disables it when reduced motion is chosen.
  await delay(matchMedia('(prefers-reduced-motion: reduce)').matches?80:1000); if(disposed) return;
  updateInstruction('All seven, ready to go.');
  root.querySelector('#flower-bottom').hidden=true;
  root.querySelector('.f2-scene').classList.add('is-complete');
  root.querySelector('#bouquet-final').hidden=false;
  const finalPanel=root.querySelector('#bouquet-final');
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)
   await move(finalPanel,{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'},460);
 }
 root.querySelector('#save-bouquet').addEventListener('click',async(e)=>{
  const button=e.currentTarget; button.disabled=true; button.textContent='Making your picture…';
  try{await downloadBouquet(chosen); root.querySelector('#export-hint').textContent='Saved! On iPhone, if the picture opens instead, touch and hold it to save.';}
  catch{root.querySelector('#export-hint').textContent='PNG export was blocked by this browser. Try Safari or Chrome.';}
  finally{if(!disposed){button.disabled=false;button.textContent='Save as picture ↓';}}
 });
 root.querySelector('#carry-bouquet').addEventListener('click',async()=>{
  if(disposed) return;
  const b=root.querySelector('.f2-bouquet');
  await move(b,{transform:'translate3d(0,0,0) scale(1)',opacity:1},{transform:'translate3d(37%, -30%, 0) scale(.28)',opacity:.25},740);
  if(!disposed){disposed=true; onDone(chosen);} 
 });
 update();
 return ()=>{disposed=true;window.removeEventListener('resize',onCardResize);if(resizeCardFrame)cancelAnimationFrame(resizeCardFrame);for(const orb of flights)orb.remove();flights.clear();};
}