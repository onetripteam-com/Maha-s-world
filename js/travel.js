/** MAHA / A Passport for Little Escapes.
 * A single scrollable desk; existing local postcard, dream-pin and arcade stamp keys stay intact.
 * The three lived chapters are known. Other atlas places are possibilities, NOT claimed journeys.
 * Zero network calls beyond the static places.json and optional user-supplied local video clips.
 */
import {store} from './store.js';
import {soundEffect,startSound} from './audio.js';
import {takeMedia,releaseMedia,isMediaMuted} from './media-control.js';
import {paintedWorld} from './painted-worlds.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const safe=(s,max=280)=>String(s??'').trim().slice(0,max);
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pictureId={kerala:'kerala',bangalore:'bangalore',kuwait:'kuwait'};
const chapters=[
 {id:'kerala',type:'Home',tag:'Familiar rain & green afternoons',line:'Home in rain, familiar voices, and little details no map can hold.',ticket:'The home chapter'},
 {id:'bangalore',type:'Chapter',tag:'Long student days',line:'The city where student days quietly became their own collection of stories.',ticket:'The student chapter'},
 {id:'kuwait',type:'Now',tag:'A different sky',line:'Evenings beneath a different sky, with stories still being made.',ticket:'The now chapter'}
];
const names={spark:'Tiny Joys',lettersmile:'Compliment Heist',softlanding:'Pocket Sunshine',doctor:'Decode the Doctor',world:'Where in the World',vlog:'Vlog Director',chai:'Chai Maker',sadya:'Sadya Builder',baggage:'Airport Baggage'};
const fallbackArt={kerala:'palms',kuwait:'city',bangalore:'city',munnar:'hills',manali:'mountains',ladakh:'mountains',nepal:'mountains'};
const pageArt=p=>pictureId[p.id]
 ?'<img src="./assets/travel/postcard-'+pictureId[p.id]+'.svg" alt="" loading="lazy" decoding="async">'
 :paintedWorld(fallbackArt[p.id]||'hills');

export function mountTravel(host,{onPostcard=()=>{}}={}){
 let disposed=false,places=[],passportPage=0,passportOpen=matchMedia('(min-width: 760px)').matches,zoomed=false,clip=null,selected=null,modalFocus=null;
 const seen=()=>{const v=store.get('visitedPlaces',[]);return Array.isArray(v)?v:[]};
 const stamps=()=>{const v=store.get('passportStamps',[]);return Array.isArray(v)?v:[]};
 const dreams=()=>{const v=store.get('dreamPins',[]);return (Array.isArray(v)?v:[]).filter(x=>x&&typeof x.name==='string'&&Number.isFinite(x.x)&&Number.isFinite(x.y)).slice(0,25)};
 const findPlace=id=>places.find(p=>p.id===id);
 const stopClip=()=>{if(clip){releaseMedia(clip);clip.remove();clip=null}};
 const stampVisit=p=>{
  const history=seen();if(!history.includes(p.id))store.set('visitedPlaces',[...history,p.id]);
  const all=stamps(),id='travel-'+p.id;
  if(!all.some(s=>s.id===id))store.set('passportStamps',[...all,{id,earnedAt:new Date().toISOString(),score:0}]);
  store.set('postcardPinned',true);store.set('lastPostcard',p.id);
 };
 function header(){
  return '<header class="travel-head"><span class="travel-eyebrow">MAHA · DEPARTURES & DETOURS</span><h1 id="travel-passport-title">A passport for <em>little escapes.</em></h1><p>Places you’ve loved. Places still waiting.</p><span class="travel-head-ornament" aria-hidden="true">✦ · ✈ · ✦</span></header>';
 }
 function navigation(){
  return '<nav class="atlas-tabs travel-index" aria-label="Travel desk sections">'+[
    ['passport','The passport','▧'],['map','The map','⌖'],['postcards','Postcards','✉'],['dreams','Next escapes','✦']
  ].map(([id,label,icon])=>'<button type="button" data-tab="'+id+'" aria-label="Go to '+label+'"><span aria-hidden="true">'+icon+'</span>'+label+'</button>').join('')+'</nav>';
 }
 function passportStamp(s){
  const id=s?.id||'',p=places.find(x=>'travel-'+x.id===id);
  const label=p?.name||names[id]||safe(id.replace(/^travel-/,''),35);
  const when=s?.earnedAt?new Date(s.earnedAt):null;
  const date=when&&!Number.isNaN(when.getTime())?when.toLocaleDateString('en-GB',{month:'short',year:'numeric'}):'UNDATED';
  return '<div class="passport-ink-stamp"><span>MAHA · LITTLE ESCAPE</span><strong>'+esc(label)+'</strong><small>'+(p?'POSTCARD KEPT':'ARCADE CHAPTER')+' · '+esc(date)+'</small></div>';
 }
 function stampPage(items){
  return items.length?'<div class="passport-stamp-grid">'+items.map(passportStamp).join('')+'</div>':
   '<div class="passport-blank-stamp"><span aria-hidden="true">✳</span><p>A little empty space.<br>Every journey starts somewhere.</p></div>';
 }
 function spread(){
  const issued=stamps(),count=Math.max(1,1+Math.ceil(Math.max(0,issued.length-6)/6));
  passportPage=Math.min(Math.max(0,passportPage),count-1);
  const group=issued.slice(passportPage*6,(passportPage+1)*6);
  const first=passportPage===0;
  const left=first?'<div class="passport-identity"><span class="passport-identity-mark" aria-hidden="true">✳</span><span class="passport-identity-kicker">TRAVELLER’S NOTES</span><strong>MAHA</strong><dl><div><dt>Issued by</dt><dd>A Little Escape</dd></div><div><dt>Known for</dt><dd>Collecting stories, not just stamps</dd></div><div><dt>Next chapter</dt><dd>Wherever curiosity leads</dd></div></dl><small>A KEEPSAKE · NOT A TRAVEL DOCUMENT</small></div>':stampPage(group.slice(0,3));
  const right=first
   ?'<div class="passport-greeting"><span>FOR THE TRAVELLER</span><blockquote>“For the places that shaped you, the places that held you, and the ones still calling your name.”</blockquote><svg viewBox="0 0 280 70" aria-hidden="true"><path d="M9 60 61 20 88 41 126 11 164 46 197 24 273 62"/><path d="m15 61 46-34 24 20 41-25 39 31 66 30"/><path d="M18 66h244"/></svg></div>'+(group.length?stampPage(group):'')
   :stampPage(group.slice(3,6));
  return '<div class="passport-spread" data-page="'+passportPage+'" aria-label="Open keepsake passport"><section class="passport-paper passport-left"><div class="passport-page-header"><span>MAHA · LITTLE ESCAPE</span><span>PAGE '+(passportPage*2+1)+'</span></div>'+left+'<div class="passport-page-foot"><span>PLACES & LITTLE STORIES</span><span>✳</span></div></section><span class="passport-spine" aria-hidden="true"></span><section class="passport-paper passport-right"><div class="passport-page-header"><span>YOUR COLLECTION</span><span>PAGE '+(passportPage*2+2)+'</span></div>'+right+'<div class="passport-page-foot"><span>NOT FOR OFFICIAL TRAVEL</span><span>MAHA</span></div></section></div>';
 }
 function passport(){
  return '<section class="travel-hero" id="travel-passport" aria-labelledby="travel-passport-title">'
   +'<div class="travel-hero-copy">'+header()+'<p class="travel-hero-story">A little book for the cities that shaped you, the windows you looked out of, and all the journeys that have not happened yet.</p>'
   +'<p class="travel-handwritten">“For the places that shaped you, and the ones still calling your name.”</p><span class="travel-desk-signature">✳ MADE FOR MAHA</span></div>'
   +'<div class="travel-cover-gallery"><div class="travel-passport-cover-shadow" aria-hidden="true"></div>'
   +'<button type="button" class="travel-passport-cover" data-open-passport aria-expanded="'+passportOpen+'" aria-controls="travel-passport-interior" aria-label="Open or examine Maha’s keepsake passport"><img src="./assets/travel/passport-cover.svg" alt="A dark navy travel passport with embossed golden globe and aeroplane emblem"><span>OPEN PASSPORT ↗</span></button>'
   +'<div class="travel-cover-caption">A little passport.<br>Entirely unofficial. Entirely hers.</div></div>'
   +'<div class="passport-experience"><div class="passport-overline"><span>THE TRAVELLER’S BOOK</span><span>NO OFFICIAL BORDERS</span></div>'
   +'<div class="passport-case" data-passport-case><div id="travel-passport-interior" class="travel-passport-interior" hidden>'+spread()+'</div>'
   +'<div class="travel-closed-note" data-closed-note><span aria-hidden="true">✧</span><p>Open the cover to peek inside.</p></div></div>'
   +'<div class="passport-bottom" data-passport-controls hidden><button type="button" data-passport-prev aria-label="Previous passport spread">← Earlier</button><span role="status" data-passport-status aria-live="polite"></span><button type="button" data-passport-next aria-label="Next passport spread">Next page →</button></div>'
   +'<div class="passport-after"><span><strong data-count-stamps>'+stamps().length+'</strong> little keepsakes</span><span>Postcards and arcade discoveries leave ink on these pages.</span></div></div>'
   +'<span class="travel-hero-postmark" aria-hidden="true">THE SMALL<br>ADVENTURES<br>DEPARTMENT</span></section>';
 }
 function card(p,i){
  const meta=chapters.find(c=>c.id===p.id);
  const saved=seen().includes(p.id);
  return '<button type="button" class="travel-place-card" data-place="'+esc(p.id)+'" aria-label="Read '+esc(p.name)+' postcard"><span class="travel-postcard-frame"><span class="travel-card-picture">'+pageArt(p)+'</span><span class="travel-postmark" aria-hidden="true">✳</span></span><span class="travel-card-type">'+(meta?meta.type:'Explore')+(saved?' · POSTCARD KEPT':'')+'</span><strong>'+esc(p.name)+'</strong><span>'+esc(meta?.line||p.intro)+'</span><small>Open this postcard ↗</small></button>';
 }
 function collections(){
  const main=chapters.map(c=>findPlace(c.id)).filter(Boolean);
  return '<section id="travel-places" class="travel-places" aria-labelledby="travel-places-title"><div class="travel-heading"><div><span class="travel-section-kicker">02 / CHAPTERS ALONG THE WAY</span><h2 id="travel-places-title">Collected <em>along the way.</em></h2><p>Three places woven into different parts of your story.</p></div><div class="travel-mini-seal" aria-hidden="true">✳<span>MAHA<br>TRAVEL</span></div></div><div class="travel-place-cards">'+main.map(card).join('')+'</div></section>';
 }
 function map(){
  const dreamsNow=dreams();
  return '<section id="travel-map" class="travel-map" aria-labelledby="travel-map-title"><div class="travel-heading"><div><span class="travel-section-kicker">03 / ROUTES & DAYDREAMS</span><h2 id="travel-map-title">The map is <em>never finished.</em></h2><p>Known chapters, places to explore, and a few thoughts pinned for later.</p></div><span class="travel-compass" aria-hidden="true">✧</span></div><div class="atlas-wall"><div class="atlas-board '+(zoomed?'is-zoomed':'')+'" data-board><div class="atlas-map-layer"><img class="atlas-watercolor" src="./assets/atlas-region.svg" alt="Illustrated regional map showing Kuwait, the Arabian Peninsula, India and Nepal" loading="lazy" draggable="false"><div class="atlas-routes">'+places.map(p=>'<button type="button" class="atlas-pin '+(chapters.some(c=>c.id===p.id)?'chapter':'possible')+'" data-place="'+esc(p.id)+'" style="left:'+p.x+'%;top:'+p.y+'%;--pin-color:'+esc(p.colors?.[0]||'#895b52')+'" aria-label="Open '+esc(p.name)+' postcard"><span class="atlas-pin-head" aria-hidden="true">✦</span><span class="atlas-pin-name">'+esc(p.name)+'</span></button>').join('')+dreamsNow.map((d,i)=>'<button type="button" class="atlas-pin dream" data-dream="'+i+'" style="left:'+Math.min(93,Math.max(7,d.x))+'%;top:'+Math.min(92,Math.max(8,d.y))+'%" aria-label="View dream destination '+esc(d.name)+'"><span class="atlas-pin-head" aria-hidden="true">♡</span></button>').join('')+'</div></div></div><div class="atlas-map-controls"><span>✳ PIN PLACEMENTS ARE APPROXIMATE</span><button type="button" data-zoom aria-pressed="'+zoomed+'">'+(zoomed?'− Wider map':'+ Look closer')+'</button></div></div><div class="travel-map-legend" aria-label="Map legend"><span><i class="chapter">✦</i> Home & chapters</span><span><i class="possible">✦</i> Places to explore</span><span><i class="dream">♡</i> Your dreams</span></div><div class="atlas-place-tape">'+places.map(p=>'<button type="button" data-place="'+esc(p.id)+'">'+esc(p.name)+' ↗</button>').join('')+'</div><p class="travel-map-note">Kerala, Bengaluru and Kuwait are personal chapters. The other map stops are invitations to explore—not claims that you’ve been there.</p></section>';
 }
 function tickets(){
  const tags=[...chapters.map(c=>({place:c.id,name:findPlace(c.id)?.name||c.id,note:c.ticket})),{place:'',name:'Somewhere next',note:'Destination yet to be decided'}];
  return '<div class="travel-ticket-pocket"><span class="travel-pocket-label">THE TICKET POCKET</span><div class="travel-tickets">'+tags.map((t,i)=>'<button type="button" class="travel-ticket" '+(t.place?'data-place="'+t.place+'"':'data-add-pin')+'><span>✈ A LITTLE ESCAPE</span><strong>'+esc(t.name)+'</strong><small>'+esc(t.note)+'</small><span class="travel-ticket-notch" aria-hidden="true">··········</span></button>').join('')+'</div><div class="travel-pocket-front" aria-hidden="true"><span>✳ ADMIT CURIOSITY</span></div></div>';
 }
 function postcards(){
  const primary=chapters.map(c=>findPlace(c.id)).filter(Boolean);
  return '<section id="travel-postcards" class="travel-keepsakes" aria-labelledby="travel-postcards-title"><div class="travel-heading"><div><span class="travel-section-kicker">04 / PAPER THINGS</span><h2 id="travel-postcards-title">Small things <em>from the road.</em></h2><p>A postcard on one side, a boarding-pass daydream on the other.</p></div></div><div class="travel-ephemera"><div class="travel-postcard-stack">'+primary.map((p,i)=>'<button type="button" data-place="'+esc(p.id)+'" class="travel-postcard-small travel-postcard-small-'+i+'" aria-label="Read the '+esc(p.name)+' postcard"><span>'+pageArt(p)+'</span><small>'+esc(p.name)+' · FLIP TO READ ↗</small></button>').join('')+'<span class="travel-stack-note">The best souvenirs are the stories.</span></div>'+tickets()+'</div></section>';
 }
 function dreamsSection(){
  const all=dreams();
  return '<section id="travel-dreams" class="travel-dreams" aria-labelledby="travel-dreams-title"><div class="travel-heading"><div><span class="travel-section-kicker">05 / THE NEXT PAGE</span><h2 id="travel-dreams-title">Still <em>on the way.</em></h2><p>Not every destination needs a name just yet.</p></div></div><div class="travel-dream-board"><div class="travel-dream-intro"><span aria-hidden="true">✧</span><strong>Someday is a perfectly good beginning.</strong><p>Make a little note of a place you’d like to see. Only this browser remembers it.</p><button type="button" data-add-pin>＋ Add a place to dream about</button></div><div class="travel-dream-list">'+(all.length?all.map((d,i)=>'<button type="button" class="travel-dream-slip" data-dream="'+i+'"><span>♡</span><strong>'+esc(d.name)+'</strong><small>'+esc(d.note||'A dream for another day.')+'</small></button>').join(''):'<div class="travel-dream-empty"><span aria-hidden="true">✳</span><p>One empty page is a good thing.<br>Something interesting might go here.</p></div>')+'</div></div><p class="travel-last-line">Somewhere wonderful. Whenever you feel like going.</p></section>';
 }
 function render(){
  if(disposed)return;
  const scroller=host.closest('.portal-content'),oldScroll=scroller?.scrollTop||0;
  host.innerHTML='<div class="atlas-app travel-desk-v3 travel-desk-v4">'+navigation()+'<div class="atlas-stage">'+passport()+collections()+map()+postcards()+dreamsSection()+'</div><dialog class="travel-modal" aria-label="A travel desk note" data-travel-dialog></dialog></div>';
  if(scroller)scroller.scrollTop=oldScroll;
  setPassport(passportOpen);updatePassportButtons();
 }
 function setPassport(open){
  passportOpen=Boolean(open);
  const wide=matchMedia('(min-width: 760px)').matches;
  const cover=host.querySelector('[data-open-passport]');
  const interior=host.querySelector('#travel-passport-interior');
  const controls=host.querySelector('[data-passport-controls]');
  const note=host.querySelector('[data-closed-note]');
  if(!cover||!interior)return;
  cover.hidden=passportOpen&&!wide;
  cover.setAttribute('aria-expanded',String(passportOpen));
  interior.hidden=!passportOpen;
  if(controls)controls.hidden=!passportOpen;
  if(note)note.hidden=passportOpen;
  host.querySelector('.travel-cover-gallery')?.classList.toggle('is-open',passportOpen);
  host.querySelector('[data-passport-case]')?.classList.toggle('is-open',passportOpen);
 }
 function updatePassportButtons(){
  const all=stamps(),count=Math.max(1,1+Math.ceil(Math.max(0,all.length-6)/6));
  const prev=host.querySelector('[data-passport-prev]'),next=host.querySelector('[data-passport-next]');
  if(prev)prev.disabled=passportPage===0;
  if(next)next.disabled=passportPage>=count-1;
  const status=host.querySelector('[data-passport-status]');
  if(status)status.textContent='SPREAD '+(passportPage+1)+' OF '+count;
 }
 function redrawSpread(){
  const node=host.querySelector('#travel-passport-interior');if(!node)return;
  node.innerHTML=spread();updatePassportButtons();
  const count=host.querySelector('[data-count-stamps]');if(count)count.textContent=String(stamps().length);
 }
 function turnPassport(dir){
  const amount=stamps().length,count=Math.max(1,1+Math.ceil(Math.max(0,amount-6)/6)),next=passportPage+dir;
  if(next<0||next>=count)return;
  passportPage=next;redrawSpread();soundEffect('paper');
 }
 function scrollTo(id){
  const target=host.querySelector('#travel-'+id);
  const scroller=host.closest('.portal-content');
  if(!target||!scroller)return;
  if(id==='passport')setPassport(true);
  // Native WebKit scrollIntoView can scroll a clipped ancestor, trapping Travel.
  // This is the sole scrolling container; keep the section navigation inside it.
  const nav=host.querySelector('.travel-index');
  const offset=target.getBoundingClientRect().top-scroller.getBoundingClientRect().top;
  const top=Math.max(0,scroller.scrollTop+offset-(nav?.offsetHeight||0)-15);
  scroller.scrollTo({top,behavior:reduced()?'auto':'smooth'});
  host.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-current',String(b.dataset.tab===id)));
 }
 function modal(content,focus){
  stopClip();modalFocus=focus||document.activeElement;
  const d=host.querySelector('[data-travel-dialog]');
  if(!d)return;
  d.innerHTML='<button type="button" class="travel-modal-close" data-close-dialog aria-label="Close and return to the travel desk">✕</button>'+content;
  if(!d.open)d.showModal();
  d.addEventListener('close',()=>{stopClip();modalFocus?.focus?.({preventScroll:true});},{once:true});
  d.querySelector('[data-close-dialog]')?.focus({preventScroll:true});
 }
 function openPostcard(p,focus){
  if(!p)return;
  selected=p;startSound();soundEffect('paper');
  const kept=stamps().some(s=>s.id==='travel-'+p.id);
  const allJournal=store.get('travelJournal',{});
  const journal=allJournal&&typeof allJournal==='object'&&!Array.isArray(allJournal)?String(allJournal[p.id]?.note||''):'';

  const isChapter=Boolean(chapters.find(c=>c.id===p.id));
  modal('<div class="travel-postcard-detail"><span class="travel-section-kicker">A LITTLE PAPER JOURNEY · '+(isChapter?'A FAMILIAR CHAPTER':'AN IMAGINED STOP')+'</span><h2>'+esc(p.name)+'</h2><div class="travel-flip-wrap"><div class="travel-flip-card" data-flip-card><div class="travel-flip-front">'+pageArt(p)+'<span>'+esc(p.name)+'</span></div><div class="travel-flip-back"><span>POSTMARK · A LITTLE ESCAPE</span><h3>Dear Maha,</h3><p>'+esc(p.intro)+'</p><strong>'+esc(p.phrase||'')+'</strong><small>'+esc(p.translation||'')+'</small><i>Another little page for your suitcase.</i></div></div></div><div class="travel-detail-buttons"><button type="button" data-flip>↻ Turn postcard over</button><button type="button" data-keep-postcard '+(kept?'disabled':'')+'>'+(kept?'✓ Already in your passport':'♡ Keep this postcard')+'</button></div><div class="travel-vlog-prompt"><span>🎬 AN IDEA FOR A TEN-SECOND VLOG</span><p>'+esc(p.prompt)+'</p></div>'+(p.clip?'<button type="button" data-play-clip>▶ Play this local clip</button>':'')+'<div class="travel-journal-box"><label for="travel-journal-note">My personal travel journal</label><textarea id="travel-journal-note" data-journal-note maxlength="2000" rows="4" placeholder="A detail I want to remember, or a thought for a future visit.">'+esc(journal)+'</textarea><div class="travel-journal-foot"><small>Saved only on this device · never published</small><button type="button" data-save-journal>♡ Save my note</button></div><p data-journal-status role="status"></p></div><p class="travel-detail-foot">Keeping a postcard saves its stamp on this device, not a claim of a real-life visit.</p></div>',focus);
 }
 function openDream(i,focus){
  const d=dreams()[i];if(!d)return;
  modal('<div class="travel-dream-dialog"><span class="travel-section-kicker">A PLACE FOR LATER</span><h2>'+esc(d.name)+'</h2><p>'+esc(d.note||'Somewhere you would like to see.')+'</p><div class="travel-detail-buttons"><button type="button" data-edit-dream="'+i+'">Edit note</button><button type="button" data-delete-dream="'+i+'">Remove this pin</button></div><small>Saved only here · position on the map is illustrative.</small></div>',focus);
 }
 function dreamForm(editIndex=null,focus=null){
  const current=editIndex!==null?dreams()[editIndex]:null;
  modal('<form class="travel-dream-form" data-dream-form data-edit="'+(editIndex??'')+'"><span class="travel-section-kicker">A PLACE TO KEEP IN MIND</span><h2>'+(current?'Edit this someday':'Where would you go?')+'</h2><label>Place name<input name="name" maxlength="55" required autocomplete="off" placeholder="A place you’d love to explore" value="'+esc(current?.name||'')+'"></label><label>A note for later<textarea name="note" maxlength="280" rows="4" placeholder="What calls you there?">'+esc(current?.note||'')+'</textarea></label><p>Private to this browser. Up to 25 places; no login, location tracking or uploads.</p><button type="submit">Save this little dream ↗</button></form>',focus);
  host.querySelector('[data-dream-form] input')?.focus({preventScroll:true});
 }
 function saveDream(form){
  const name=safe(form.elements.name.value,55),note=safe(form.elements.note.value,280);
  if(!name)return;
  const all=dreams(),edit=form.dataset.edit;
  if(edit===''){
   if(all.length>=25){form.querySelector('p').textContent='There is room for 25 places here. Remove an old pin before adding another.';return;}
   const i=all.length;
   all.push({name,note,x:14+(i*23)%72,y:19+(i*19)%64,createdAt:new Date().toISOString()});
  }else{
   const i=Number(edit);if(!all[i])return;all[i]={...all[i],name,note};
  }
  store.set('dreamPins',all);
  host.querySelector('[data-travel-dialog]')?.close();
  soundEffect('pick');render();
  scrollTo('dreams');
 }
 function click(e){
  const button=e.target.closest('button');if(!button||!host.contains(button))return;
  if(button.matches('[data-tab]')){scrollTo(button.dataset.tab);return;}
  if(button.matches('[data-open-passport]')){
   if(passportOpen&&matchMedia('(min-width: 760px)').matches){
    host.querySelector('#travel-passport-interior')?.animate?.(
     [{transform:'perspective(1200px) rotateY(-5deg)',filter:'brightness(.9)'},{transform:'none',filter:'none'}],
     {duration:reduced()?1:370,easing:'ease-out'});
   }else setPassport(true);
   soundEffect('paper');return;
  }
  if(button.matches('[data-passport-prev]')){turnPassport(-1);return;}
  if(button.matches('[data-passport-next]')){turnPassport(1);return;}
  if(button.matches('[data-zoom]')){
   zoomed=!zoomed;host.querySelector('[data-board]')?.classList.toggle('is-zoomed',zoomed);
   button.setAttribute('aria-pressed',String(zoomed));button.textContent=zoomed?'− Wider map':'+ Look closer';return;
  }
  if(button.matches('[data-place]')){openPostcard(findPlace(button.dataset.place),button);return;}
  if(button.matches('[data-dream]')){openDream(Number(button.dataset.dream),button);return;}
  if(button.matches('[data-add-pin]')){dreamForm(null,button);return;}
  if(button.matches('[data-close-dialog]')){host.querySelector('[data-travel-dialog]')?.close();return;}
  if(button.matches('[data-save-journal]')&&selected){
    const field=host.querySelector('[data-journal-note]');
    const all=store.get('travelJournal',{});
    const journal=all&&typeof all==='object'&&!Array.isArray(all)?{...all}:{};
    const note=String(field?.value||'').trim().slice(0,2000);
    if(note)journal[selected.id]={note,updatedAt:new Date().toISOString()};
    else delete journal[selected.id];
    const durable=store.set('travelJournal',journal);
    const status=host.querySelector('[data-journal-status]');
    if(status)status.textContent=durable?'Saved in your travel journal.':'Saved for this session. Use a browser that allows storage to keep this note after closing.';
    soundEffect('paper');return;
  }
  if(button.matches('[data-flip]')){host.querySelector('[data-flip-card]')?.classList.toggle('flipped');soundEffect('paper');return;}
  if(button.matches('[data-keep-postcard]')&&selected){
   stampVisit(selected);redrawSpread();onPostcard(selected.id);soundEffect('complete');
   button.disabled=true;button.textContent='✓ Already in your passport';return;
  }
  if(button.matches('[data-delete-dream]')){
   const all=dreams();all.splice(Number(button.dataset.deleteDream),1);
   store.set('dreamPins',all);host.querySelector('[data-travel-dialog]')?.close();render();return;
  }
  if(button.matches('[data-edit-dream]')){const index=Number(button.dataset.editDream);host.querySelector('[data-travel-dialog]')?.close();dreamForm(index,button);return;}
  if(button.matches('[data-play-clip]')&&selected?.clip){
   if(clip){stopClip();button.textContent='▶ Play this local clip';return;}
   clip=document.createElement('video');clip.src=selected.clip;clip.playsInline=true;clip.muted=isMediaMuted();clip.controls=true;clip.preload='metadata';
   button.after(clip);takeMedia(clip);clip.play().catch(()=>stopClip());button.textContent='Stop clip';return;
  }
 }
 function submit(e){
  if(e.target.matches('[data-dream-form]')){e.preventDefault();saveDream(e.target);}
 }
 const mute=()=>{if(clip)clip.muted=isMediaMuted()};
 host.classList.add('travel-host');host.innerHTML='<p class="atlas-error" role="status">Opening Maha’s travel desk…</p>';
 host.addEventListener('click',click);host.addEventListener('submit',submit);document.addEventListener('maha:mutechange',mute);
 fetch(new URL('../content/places.json',import.meta.url))
  .then(r=>{if(!r.ok)throw Error('Places file unavailable');return r.json()})
  .then(data=>{if(disposed)return;places=Array.isArray(data.places)?data.places:[];render();})
  .catch(err=>{if(!disposed){console.error('Travel desk loading',err);host.innerHTML='<p class="atlas-error" role="alert">The travel desk could not open. Refresh to try again.</p>';}});
 return ()=>{disposed=true;stopClip();host.removeEventListener('click',click);host.removeEventListener('submit',submit);document.removeEventListener('maha:mutechange',mute);host.querySelector('[data-travel-dialog]')?.close();host.innerHTML='';host.classList.remove('travel-host');};
}
