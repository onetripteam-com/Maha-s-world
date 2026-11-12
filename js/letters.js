/** The Post Office: paper envelopes, data-driven letters, and device-only keepsakes. */
import {store} from './store.js';
import {soundEffect,startSound} from './audio.js';
import {unlockStatus,unlocks,newlyUnlocked,quietLetterState,kuwaitDay,occasionVisible} from './letter-unlocks.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const byId=(letters,id)=>letters.find(l=>l.id===id);
const niceDate=value=>{try{return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kuwait'}).format(new Date(`${value}T12:00:00Z`));}catch{return value||'';}};
function quietVariant(letters,config,now){
 const quiet=quietLetterState(config.quietLetterDate,now);
 return letters.filter(l=>l.section!=='quiet'||quiet.visible).map(l=>l.section==='quiet'?{...l,section:quiet.section}:l);
}
function paragraphs(lines){return (Array.isArray(lines)?lines:[lines]).map(s=>`<p>${esc(s)}</p>`).join('');}
function bookmark(state,id){return Array.isArray(state)&&state.includes(id);}
function renderAvatar(){return `<span class="sender-avatar" aria-hidden="true"><svg viewBox="0 0 42 42"><circle cx="21" cy="21" r="20" fill="#f0d4a8" stroke="#b97d5b"/><path d="M9 28Q13 20 18 25M24 25Q30 21 34 29" fill="none" stroke="#754c3c" stroke-width="1.8"/><path d="M13 16q2-3 6 0m6 0q2-3 5 0" stroke="#754c3c" stroke-width="2" fill="none"/><path d="M17 24q4 5 9-1" fill="none" stroke="#a9644e" stroke-width="2"/><path d="M6 11q8-15 25-6M10 5q15-6 26 6" fill="none" stroke="#7e8b67" stroke-width="2.4" stroke-linecap="round"/></svg></span>`;}
function envelopeIcon(sealed){return `<span class="mail-envelope ${sealed?'with-seal':''}" aria-hidden="true"><span class="mail-flap"></span><span class="mail-insert"></span><span class="mail-front"></span>${sealed?'<span class="mail-wax">✶</span>':''}</span>`;}
const moodNames={tired:'Running on empty','miss-home':'Missing home','great-news':'Something wonderful','nervous':'A big day ahead','cant-sleep':'Wide awake',overthinking:'Too many thoughts',laugh:'Need a laugh',stuck:'Feeling stuck','finished-big':'You did the thing',raining:'Rainy day','change-scene':'A different view','first-vlog':'Your first vlog','forgot-yourself':'A little unsure','missing-me':'Missing a friend'};
export function mountLetters(host,{visits=1,lastVisit=null,onPlay=()=>{},onKeep=()=>{},onExit=()=>{}}={}){
 let disposed=false,activeTab=store.get('lettersTab','inbox'),current=null,page=0,asText=false,zoom=1,letters=[],config={senderName:'Your friend',senderEmail:null,quietLetterDate:null};
 const tabScroll={inbox:0,openWhen:0,specialDays:0,keepsakes:0};
 if(!['inbox','openWhen','specialDays','keepsakes'].includes(activeTab))activeTab='inbox';
 const asState=()=>({visits,firstVisitAt:store.get('firstVisitAt',null),games:store.get('gameCompletions',{})});
 const now=()=>new Date();
 host.innerHTML=`<div class="mail-loading" role="status">Sorting very important stationery…</div>`;
 const list=()=>quietVariant(letters,config,now());
 const allKept=()=>store.get('keptLetters',[]);

 function postIcon(kind){
  const d={
   letters:'M4 7.5 12 12l8-4.5M4 7.5 12 13l8-5.5M5 6h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z',
   when:'M12 2.8v2.2m0 14v2.2M2.8 12H5m14 0h2.2M5.4 5.4 7 7m10 10 1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6M12 8.5v4.1l2.5 1.5M12 8a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z',
   saved:'M6.5 4h11v16l-5.5-3.6L6.5 20V4',
   day:'M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z M8 13h3m3 0h2m-8 4h3'
  }[kind]||'';
  return `<svg class="postroom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
 }
 function header(){
  const available=list().filter(l=>l.section==='inbox'&&unlockStatus(l.unlock,asState(),now()).open).length;
  return `<header class="mail-heading"><div class="mail-postmark"><span class="postroom-mark" aria-hidden="true">✳</span> A SMALL COLLECTION OF LETTERS <span class="postroom-edition">NO. 01 — FOR MAHA</span></div>
   <div class="mail-header-row"><div class="postroom-title-copy"><h1>Letters, <em>for you.</em></h1><p>Some things are nicer to open slowly.</p></div>
    <span class="postroom-pocket-scene" aria-hidden="true"><i class="pocket-sheet"></i><i class="pocket-envelope"></i><i class="pocket-wax">M</i></span><span class="mail-mini-stamp" aria-hidden="true"><span>MAHA</span><svg viewBox="0 0 56 56" fill="none"><path d="M28 9c-5 8-7 12-7 17a7 7 0 0 0 14 0c0-5-2-9-7-17ZM13 24c8 2 12 4 15 8M43 24c-8 2-12 4-15 8M13 42c8-7 14-8 15-8m15 8c-8-7-14-8-15-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="28" cy="31" r="5" fill="currentColor"/></svg><small>WITH CARE</small></span>
   </div></header>`;
 }
 function tabs(){
  const saved=list().filter(l=>bookmark(allKept(),l.id)).length;
  const options=[['inbox','Letters',list().filter(l=>l.section==='inbox').length,'letters'],['openWhen','Open when…',null,'when'],['specialDays','Special days',null,'day'],['keepsakes','Saved',saved,'saved']];
  return `<nav class="mail-tabs" aria-label="Choose a letter shelf">${options.map(([id,label,count,icon])=>`<button type="button" data-tab="${id}" ${activeTab===id?'aria-current="page"':''} aria-label="${esc(label)}${count===null?'':', '+count}">${postIcon(icon)}<span class="postroom-tab-name">${label}</span>${count===null?'':`<span class="postroom-tab-count" aria-hidden="true">${count}</span>`}</button>`).join('')}</nav>`;
 }
 function itemMarkup(l){
  const state=asState(),read=store.get('readLetter:'+l.id,false),isKept=bookmark(allKept(),l.id);const status=(l.section==='occasion'&&isKept)?{open:true,label:'Ready to open'}:unlockStatus(l.unlock,state,now()),open=status.open;
  const number=String(Math.max(1,list().findIndex(x=>x.id===l.id)+1)).padStart(2,'0');
  const label=open?(read?'Read':'New'):'Sealed';
  const mood=l.section==='openWhen'?moodNames[l.id.replace('when-','')]:null;
  return `<button class="mail-row postroom-letter ${open?'is-available':'is-sealed'} ${read?'is-read':''}" data-open-letter="${esc(l.id)}" type="button" aria-label="${esc(l.title)}. ${open?(read?'Already read':'Ready to open'):status.label}">
    <span class="postroom-letter-index" aria-hidden="true">NO. ${number}</span>
    ${envelopeIcon(!open)}
    <span class="mail-row-words"><span class="mail-sender">${l.section==='occasion'?'A SMALL WISH FOR THE DAY':mood?'FOR A DAY LIKE THIS':'A LITTLE NOTE, JUST FOR YOU'}</span>
      <strong class="mail-subject">${esc(l.title)}</strong><span class="mail-preview">${esc(l.preview||'A little note, just for you.')}</span>
      <span class="mail-status ${open?read?'status-read':'status-new':'status-locked'}">${open?(read?'Opened before':'<i class="marigold-dot"></i> Ready to open'):'<span aria-hidden="true">✳</span> '+esc(status.label)}</span>
    </span><span class="mail-row-edge" aria-hidden="true">${isKept?'SAVED':'↗'}</span>
  </button>`;
 }
 function awayShelf(){
  const unlocked=newlyUnlocked(list(),asState(),lastVisit,now());
  const gone=lastVisit&&now().getTime()-Number(lastVisit)>=30*86400000;
  if(!gone)return '';
  const line=unlocked.length?`These seals broke while you were away: ${unlocked.map(x=>x.title).join(' · ')}`:'The envelopes waited. No new seals yet, but the kettle is on.';
  return `<aside class="away-shelf" aria-label="While you were away"><span class="away-shelf-icon" aria-hidden="true">✉</span><div><strong>While you were away…</strong><p>${esc(line)}</p></div></aside>`;
 }

 function inbox(){
  const items=list().filter(l=>l.section==='inbox');
  return `<section class="mail-inbox-list" aria-label="Letters waiting for Maha">${awayShelf()}<div class="mail-section-caption"><div><span class="postroom-section-kicker">THE LETTER SHELF / 01</span><h2>Little notes, <em>big or small.</em></h2><p>No need for a special occasion.</p></div><span class="postroom-section-count">${items.length} letters</span></div><div class="postroom-letter-grid">${items.map(itemMarkup).join('')}</div></section>`;
 }
 function specialDays(){
  const notes=list().filter(l=>l.section==='occasion');
  return `<section class="mail-inbox-list postroom-special-days" aria-label="Letters for special days"><div class="mail-section-caption"><div><span class="postroom-section-kicker">THE CALENDAR SHELF / 03</span><h2>A day <em>of its own.</em></h2><p>A few envelopes have dates on them. They open on their special day, using Kuwait time. No need to wait here.</p></div></div><div class="postroom-special-date-grid">${notes.map(l=>`<div class="postroom-special-wrap ${occasionVisible(l.unlock,now())?'is-near':''}"><span class="postroom-special-date">${l.occasion==='birthday'?'07 JUL':l.occasion==='christmas'?'25 DEC':l.occasion==='newyear'?'01 JAN':l.occasion==='onam'?'ONAM':'EASTER'}</span>${itemMarkup(l)}</div>`).join('')}</div><p class="mail-draft-note">Until their day arrives, the words stay inside the envelope.</p></section>`;
 }
 function openWhen(){
  const items=list().filter(l=>l.section==='openWhen');
  // Deliberately curated in two easy-to-browse sets of seven. Any future
  // additions still appear under "More for another day" rather than vanish.
  const shelves=[
   {name:'For the slower days',hint:'When the day calls for a softer minute.',ids:['when-tired','when-miss-home','when-nervous','when-cant-sleep','when-overthinking','when-stuck','when-forgot-yourself']},
   {name:'For the days with stories',hint:'Little wins, odd moments, big smiles and everything between.',ids:['when-great-news','when-laugh','when-finished-big','when-raining','when-change-scene','when-first-vlog','when-missing-me']}
  ];
  const used=new Set(shelves.flatMap(s=>s.ids));
  const extras=items.filter(l=>!used.has(l.id));
  const section=(name,hint,group,index)=>`<section class="when-shelf" aria-label="${esc(name)}"><div class="when-shelf-heading"><div><span class="postroom-section-kicker">THE MOMENT SHELF / ${String(index).padStart(2,'0')}</span><h3>${esc(name)}</h3><p>${esc(hint)}</p></div><span class="when-shelf-flourish" aria-hidden="true">✳</span></div><div class="when-bundle">${group.map((l,i)=>`<div class="when-clip"><span class="when-symbol" aria-hidden="true">${String(i+1).padStart(2,'0')}</span>${itemMarkup(l)}</div>`).join('')}</div></section>`;
  return `<section class="when-collection" aria-label="Letters for different moments"><div class="mail-section-caption"><div><span class="postroom-section-kicker">OPEN WHEN…</span><h2>For a day <em>like this.</em></h2><p>No right mood. No right order. Pick whatever feels like today.</p></div></div>${shelves.map((s,i)=>section(s.name,s.hint,s.ids.map(id=>items.find(l=>l.id===id)).filter(Boolean),i+1)).join('')}${extras.length?section('More for another day','A few more notes, in case you need one.',extras,3):''}<p class="mail-draft-note">These are yours to open whenever you like.</p></section>`;
 }
 function keepsakes(){
  const selected=list().filter(l=>bookmark(allKept(),l.id));
  return `<section class="mail-keepsakes" aria-label="Your saved letters"><div class="mail-section-caption"><div><span class="postroom-section-kicker">THE KEEPSAKE SHELF / 03</span><h2>The ones <em>you kept.</em></h2><p>Saved here on this device, for another day.</p></div><span class="postroom-section-count">${selected.length} saved</span></div>
   <div class="postroom-letter-grid">${selected.length?selected.map(itemMarkup).join(''):'<div class="mail-keepsake-empty"><span aria-hidden="true">✳</span><h3>A little space for your favourites.</h3><p>When a letter feels worth keeping, open it and tap Save. It will be here.</p></div>'}</div>
   <div class="future-note"><span class="future-note-pin" aria-hidden="true">✳</span><span class="postroom-section-kicker">ONE FROM YOU, TO YOU</span><h2>A note for another day</h2><p>Write anything you want future Maha to remember. Only this device keeps it.</p><label class="sr-only" for="future-note-text">A private note to future Maha</label><textarea id="future-note-text" rows="4" placeholder="Dear future Maha, remember…">${esc(store.get('futureNote',''))}</textarea><span class="future-save-indicator" role="status">Automatically saved on this device</span></div></section>`;
 }
 // Hide unfinished email settings; enable the button only when there is a real address.
 function footer(){
  const active=Boolean(config.senderEmail&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.senderEmail));
  return active?`<div class="mail-footer"><button type="button" class="mail-writeback" data-writeback>✍ Write back ↗</button></div>`:'';
 }

 function renderList(){
  current=null;
  const savedPosition=tabScroll[activeTab]||0;
  host.innerHTML=`<div class="letterbox-app postroom" data-shelf="${activeTab}">
   <aside class="postroom-side" aria-hidden="true"><div class="postroom-side-top"><span class="postroom-side-num">THE LITTLE ESCAPE / VOL. 01</span><span class="postroom-side-spark">✳</span></div><div class="postroom-side-art"><span class="postroom-side-halo"></span><span class="postroom-desk-letter"></span><span class="postroom-desk-envelope"><i></i></span><span class="postroom-desk-seal">M</span><span class="postroom-desk-flower">✳</span></div><div class="postroom-side-bottom"><span class="postroom-side-title">A little postbox<br><i>with your name on it.</i></span><p>For ordinary days, silly stories, and the things that don't fit in a text.</p><span class="postroom-side-rule"></span><span class="postroom-side-foot">MAHA’S POSTBOX · KEPT WITH CARE</span></div></aside>
   <section class="postroom-library" aria-label="Maha's letters">${header()}${tabs()}<div class="mail-scroll" id="mail-scroll">${activeTab==='inbox'?inbox():activeTab==='openWhen'?openWhen():activeTab==='specialDays'?specialDays():keepsakes()}</div>${footer()}</section>
  </div>`;
  bindList();
  const scroll=host.querySelector('#mail-scroll');if(scroll)scroll.scrollTop=savedPosition;
 }
 function bindList(){
  host.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.tab===activeTab)return;tabScroll[activeTab]=host.querySelector('#mail-scroll')?.scrollTop||0;activeTab=b.dataset.tab;store.set('lettersTab',activeTab);soundEffect('paper');renderList();}));
  host.querySelectorAll('[data-open-letter]').forEach(b=>b.addEventListener('click',()=>openEnvelope(b.dataset.openLetter,b)));
  host.querySelector('[data-go-play]')?.addEventListener('click',onPlay);
  host.querySelector('[data-writeback]')?.addEventListener('click',writeBack);
  host.querySelector('#future-note-text')?.addEventListener('input',e=>{store.set('futureNote',e.currentTarget.value);});
 }
 function writeBack(){
  if(!config.senderEmail||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.senderEmail)){
   const note=host.querySelector('.mail-footer span');if(note)note.textContent='Add senderEmail in content/config.json first.';return;
  }
  const subject=encodeURIComponent(config.writeBackSubject||'A little letter back from Maha');
  window.location.href=`mailto:${encodeURIComponent(config.senderEmail)}?subject=${subject}`;
 }
 async function openEnvelope(id,button){
  const l=byId(list(),id);if(!l)return;
  const status=(l.section==='occasion'&&bookmark(allKept(),l.id))?{open:true}:unlockStatus(l.unlock,asState(),now());
  if(!status.open){
   button.classList.remove('mail-shake');void button.offsetWidth;button.classList.add('mail-shake');
   const el=button.querySelector('.mail-status');if(el)el.setAttribute('aria-live','polite');soundEffect('undo');return;
  }
  if(current||disposed)return;
  tabScroll[activeTab]=host.querySelector('#mail-scroll')?.scrollTop||0;
  current=l;page=Math.max(0,Math.min((l.kind==='handwritten'?(l.images?.length||1):(l.pages?.length||1))-1,Number(store.get('letterPage:'+l.id,0))||0));asText=false;zoom=1;store.set('readLetter:'+l.id,true);soundEffect('paper');
  button.classList.add('mail-opening');
  await new Promise(r=>setTimeout(r,window.matchMedia('(prefers-reduced-motion: reduce)').matches?65:590));
  if(disposed||current!==l)return;renderReader();
 }
 function totalPages(){return current?.kind==='handwritten'?(asText?(current.transcriptionPages?.length||1):(current.images?.length||1)):(current?.pages?.length||1);}
 function handwrittenPage(){
  const src=current.images?.[page];
  return `<div class="handwritten-sheet"><div class="handwritten-controls"><button type="button" data-toggle-transcript aria-pressed="${asText}">${asText?'View handwriting':'Read as text'}</button><span>${asText?'Typed transcription':'Pinch or double tap to zoom'}</span></div>
    ${asText?`<div class="handwritten-transcript letter-verse">${paragraphs([current.transcriptionPages?.[page]||'[ADD YOUR TRANSCRIPTION HERE.]'])}</div>`:`<div class="handwriting-viewport" id="handwriting-viewport"><img src="${esc(src||'')}" alt="Handwritten page ${page+1}: ${esc(current.title)}" loading="lazy" decoding="async" class="handwriting-image"/><div class="handwriting-fallback" hidden>Paper page not found. Put the scan in <code>assets/letters/</code>, or choose Read as text.</div></div><div class="handwriting-zoom"><button data-zoom-out type="button" aria-label="Zoom out">−</button><button data-zoom-reset type="button" aria-label="Reset zoom">Reset</button><button data-zoom-in type="button" aria-label="Zoom in">+</button></div>`}
   </div>`;
 }
 function readerPage(){return current.kind==='handwritten'?handwrittenPage():`<article class="letter-verse">${paragraphs([current.pages?.[page]||''])}</article>`;}
 function readerFoot(){const last=page===totalPages()-1;return `<div class="reader-pagination"><button data-prev-page type="button" ${page===0?'disabled':''} aria-label="Previous page">← Earlier</button><span class="reader-page-index">${page+1} / ${totalPages()}</span><button data-next-page type="button" ${last?'disabled':''} aria-label="Next page">Next →</button></div>`;}
 function readerProgress(){return `<div class="reader-progress" role="progressbar" aria-label="Page of this letter" aria-valuemin="1" aria-valuemax="${totalPages()}" aria-valuenow="${page+1}"><span class="reader-progress-label">PAGE ${String(page+1).padStart(2,'0')} / ${String(totalPages()).padStart(2,'0')}</span><span class="reader-progress-bars" aria-hidden="true">${Array.from({length:totalPages()},(_,i)=>`<i class="${i<=page?'is-read':''}"></i>`).join('')}</span></div>`;}

 function renderReader(){
  if(!current)return;
  const kept=bookmark(allKept(),current.id),last=page===totalPages()-1;
  host.innerHTML=`<div class="letter-reader postroom-reader">
   <div class="reader-navigation"><button type="button" data-back-letters><span aria-hidden="true">←</span> Back to letters</button><span class="reader-privacy">A NOTE, ONLY FOR MAHA <span aria-hidden="true">✳</span></span></div>
   <div class="postroom-reader-stage"><div class="postroom-paper-shadow" aria-hidden="true"></div>
   <div class="reader-paper"><span class="reader-tape" aria-hidden="true"></span>
    <div class="reader-intro"><span class="reader-dateline">${current.date?esc(niceDate(current.date))+' · ':''}A LITTLE NOTE FOR MAHA</span><h1>${esc(current.title)}</h1>${current.draft?'<span class="reader-draft">A LETTER STILL BEING WRITTEN</span>':''}</div>
    ${readerProgress()}<div class="reader-page" id="reader-page">${readerPage()}</div>
    ${last&&current.kind!=='handwritten'?(current.malayalam?`<p class="reader-malayalam">${esc(current.malayalam)}</p>`:'')+(current.ps?`<p class="reader-postscript"><strong>P.S.</strong> ${esc(current.ps)}</p>`:''):''}
    <div class="postroom-reader-signoff" aria-hidden="true"><span>✳</span> END OF THIS PAGE</div>
   </div></div>
   <div class="reader-bottom">${readerFoot()}<button class="reader-heart ${kept?'is-kept':''}" data-keep-letter type="button" aria-pressed="${kept}"><span class="postroom-bookmark-icon" aria-hidden="true">${postIcon('saved')}</span><span class="postroom-save-label">${kept?'Saved':'Save letter'}</span></button></div>
  </div>`;
  bindReader();
 }
 function bindReader(){
  host.querySelector('[data-back-letters]')?.addEventListener('click',()=>{if(current)store.set('letterPage:'+current.id,page);soundEffect('paper');renderList();});
  host.querySelector('[data-keep-letter]')?.addEventListener('click',()=>{
   const kept=allKept();const next=kept.includes(current.id)?kept.filter(x=>x!==current.id):[...kept,current.id];store.set('keptLetters',next);store.set('keptLetter',next.length>0);onKeep();soundEffect('pick');
   const b=host.querySelector('[data-keep-letter]');b.classList.toggle('is-kept',next.includes(current.id));b.setAttribute('aria-pressed',String(next.includes(current.id)));const label=b.querySelector('.postroom-save-label');if(label)label.textContent=next.includes(current.id)?'Saved':'Save letter';
  });
  host.querySelector('[data-prev-page]')?.addEventListener('click',()=>pageTurn(-1));
  host.querySelector('[data-next-page]')?.addEventListener('click',()=>pageTurn(1));
  // Horizontal swipes turn the pages; vertical reading scroll is untouched.
  const paper=host.querySelector('.reader-paper');let swipeX=null,swipeY=null;
  paper?.addEventListener('touchstart',e=>{if(e.touches.length!==1){swipeX=swipeY=null;return;}swipeX=e.touches[0].clientX;swipeY=e.touches[0].clientY;},{passive:true});
  paper?.addEventListener('touchend',e=>{if(swipeX===null||!e.changedTouches.length)return;
   const dx=e.changedTouches[0].clientX-swipeX,dy=e.changedTouches[0].clientY-swipeY;swipeX=swipeY=null;
   if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.35)pageTurn(dx<0?1:-1);
  },{passive:true});
  host.querySelector('[data-toggle-transcript]')?.addEventListener('click',()=>{asText=!asText;page=0;zoom=1;renderReader();});
  const image=host.querySelector('.handwriting-image'),viewport=host.querySelector('.handwriting-viewport');
  image?.addEventListener('error',()=>{image.hidden=true;const fallback=host.querySelector('.handwriting-fallback');if(fallback)fallback.hidden=false;});
  const applyZoom=()=>{if(image)image.style.transform=`scale(${zoom})`;};
  host.querySelector('[data-zoom-in]')?.addEventListener('click',()=>{zoom=Math.min(4,zoom+.5);applyZoom();});
  host.querySelector('[data-zoom-out]')?.addEventListener('click',()=>{zoom=Math.max(1,zoom-.5);applyZoom();});
  host.querySelector('[data-zoom-reset]')?.addEventListener('click',()=>{zoom=1;applyZoom();});
  image?.addEventListener('dblclick',()=>{zoom=zoom===1?2:1;applyZoom();});
  if(viewport){let distance=0,initialZoom=1;const measure=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
   viewport.addEventListener('touchstart',e=>{if(e.touches.length===2){distance=measure(e.touches);initialZoom=zoom;}},{passive:true});
   viewport.addEventListener('touchmove',e=>{if(e.touches.length===2&&distance){e.preventDefault();zoom=Math.max(1,Math.min(4,initialZoom*measure(e.touches)/distance));applyZoom();}},{passive:false});
   viewport.addEventListener('touchend',e=>{if(e.touches.length<2)distance=0;},{passive:true});
  }
 }
 function pageTurn(direction){if(!current)return;const next=page+direction;if(next<0||next>=totalPages())return;soundEffect('paper');const turn=host.querySelector('.reader-paper');turn?.classList.add(direction>0?'page-turn-forward':'page-turn-back');setTimeout(()=>{if(disposed||!current)return;page=next;store.set('letterPage:'+current.id,page);renderReader();},window.matchMedia('(prefers-reduced-motion: reduce)').matches?20:185);}
 Promise.all([
  fetch(new URL('../content/letters.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('letters.json unavailable');return r.json();}),
  fetch(new URL('../content/config.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('config.json unavailable');return r.json();})
 ]).then(([payload,cfg])=>{if(disposed)return;letters=Array.isArray(payload.letters)?payload.letters:[];config={...config,...cfg};renderList();}).catch(err=>{if(disposed)return;console.error('Post office loading error',err);host.innerHTML='<div class="mail-loading">The post has gone astray. Refresh to try again.</div>';});
 return ()=>{disposed=true;};
}