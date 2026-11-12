/** MAHA Studio edition — accessible desktop directory and mobile door drawer.
 * All navigation routes through the original portal, so its back animation,
 * local state and soundscape keep working.
 */
const DESTINATIONS=[
 {id:'letters',num:'01',icon:'✉',title:'The letter box',subtitle:'Words for whichever day this is',tone:'post'},
 {id:'music',num:'02',icon:'♫',title:'Habibii FM',subtitle:'Find your frequency',tone:'radio'},
 {id:'movies',num:'03',icon:'▣',title:'The tiny cinema',subtitle:'A little film, a little escape',tone:'film'},
 {id:'travel',num:'04',icon:'◇',title:'Almost anywhere',subtitle:'Postcards from here and elsewhere',tone:'travel'},
 {id:'games',num:'05',icon:'✦',title:'A silly diversion',subtitle:'No deadlines. No serious business.',tone:'arcade'},
 {id:'garden',num:'06',icon:'❀',title:'The word garden',subtitle:'Plant a thought; watch it grow',tone:'garden'},
 {id:'rest',num:'07',icon:'◡',title:'The quiet corner',subtitle:'The softer side of this place',tone:'quiet'}
];
export function roomStudioMarkup(){
 const doors=DESTINATIONS.map(d=>`<button type="button" class="studio-door" data-studio-door="${d.id}" data-tone="${d.tone}" aria-label="Explore ${d.title}">
    <span class="studio-door-number">${d.num}</span><span class="studio-door-icon" aria-hidden="true">${d.icon}</span>
    <span class="studio-door-text"><strong>${d.title}</strong><small>${d.subtitle}</small></span><span class="studio-door-arrow" aria-hidden="true">↗</span></button>`).join('');
 return `<aside class="room-editorial" aria-label="A note for Maha">
    <div class="editorial-top"><span class="editorial-kicker"><span class="editorial-dot"></span> ONE ROOM. MANY LITTLE WORLDS.</span>
      <h2>Come in,<br><em>Maha.</em></h2><p>Whatever the day has been, this little room isn't going anywhere.</p>
      <div class="editorial-stroke" aria-hidden="true">〰 ✳ 〰</div></div>
    <div class="editorial-foot"><div class="editorial-issue">✳ <span>EDITION 01</span> <i>•</i> MADE TO BE REOPENED</div>
      <p>P.S. Those flowers on the dresser? You can change them whenever you like.</p></div>
   </aside>
   <nav class="room-guide" aria-label="Explore Maha's little worlds">
    <button type="button" class="guide-toggle" aria-controls="studio-doors" aria-expanded="false">
      <span class="guide-toggle-icon" aria-hidden="true">✦</span><span>Explore the room</span><span class="guide-toggle-count">7 places</span><span class="guide-toggle-chevron" aria-hidden="true">⌃</span>
    </button>
    <div class="guide-inner" id="studio-doors">
      <div class="guide-heading"><span class="guide-eyebrow">YOUR LITTLE WORLD / INDEX</span><h2>Choose a door<span aria-hidden="true">.</span></h2><p>Or just tap something curious in the room.</p></div>
      <div class="studio-door-list">${doors}</div>
      <div class="guide-actions"><button type="button" data-studio-action="flowers">❀ Pick new flowers</button><button type="button" data-studio-action="theme">✎ Change the room</button><button type="button" data-studio-action="replay">↶ The beginning</button></div>
    </div>
   </nav>`;
}
export function mountRoomStudio({root,portal,onReplay,onNewBouquet,onTheme}){
 const guide=root.querySelector('.room-guide');
 const toggle=guide?.querySelector('.guide-toggle');
 const inner=guide?.querySelector('.guide-inner');
 if(!guide||!toggle||!inner)return ()=>{};
 const desktop=window.matchMedia('(min-width: 760px) and (min-height: 570px)');
 let open=false;
 function sync(){
  const narrow=!desktop.matches;
  guide.classList.toggle('is-open',narrow&&open);
  toggle.setAttribute('aria-expanded',String(narrow&&open));
  inner.inert=narrow&&!open;
  if(narrow&&!open)inner.setAttribute('aria-hidden','true');else inner.removeAttribute('aria-hidden');
 }
 const onChange=()=>{open=false;sync()};
 const onToggle=()=>{open=!open;sync();if(open)inner.querySelector('[data-studio-door]')?.focus({preventScroll:true})};
 toggle.addEventListener('click',onToggle);
 if(desktop.addEventListener)desktop.addEventListener('change',onChange);
 else desktop.addListener(onChange);
 const buttonFns=[];
 for(const b of guide.querySelectorAll('[data-studio-door]')){
  const handler=()=>{portal.open(b.dataset.studioDoor,b)};
  b.addEventListener('click',handler);buttonFns.push([b,handler]);
 }
 for(const b of guide.querySelectorAll('[data-studio-action]')){
  const handler=()=>{const action=b.dataset.studioAction;
   if(action==='flowers')onNewBouquet();
   if(action==='theme'){open=false;sync();onTheme()}
   if(action==='replay')onReplay();
  };
  b.addEventListener('click',handler);buttonFns.push([b,handler]);
 }
 const onKeys=e=>{if(e.key==='Escape'&&open){open=false;sync();toggle.focus({preventScroll:true});e.stopPropagation()}};
 document.addEventListener('keydown',onKeys);
 sync();
 return ()=>{document.removeEventListener('keydown',onKeys);toggle.removeEventListener('click',onToggle);if(desktop.removeEventListener)desktop.removeEventListener('change',onChange);else desktop.removeListener(onChange);for(const [b,fn] of buttonFns)b.removeEventListener('click',fn)};
}
