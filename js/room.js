import {store} from './store.js';
import {flowerSVG,bouquetMarkup} from './botanical.js';
import {kuwaitParts,lightOfDay,dailyLine,greeting} from './time.js';
import {PLACES,isUnlocked,isNew} from './places.js';
import {makePortalSystem} from './portal.js';
import {soundEffect,startSound} from './audio.js';
import {roomStudioMarkup,mountRoomStudio} from './room-studio.js';
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let weatherTimer;
const weatherFor=(date)=>{const d=Math.floor(Date.parse(date+'T00:00:00Z')/86400000);return ['clouds','clear','clear','breeze','rain'][((d%5)+5)%5];};
export function mountRoom(root,{flowers,chosen,lastVisit,visits,onReplay,onNewBouquet}){
 const THEMES=['story','monsoon','sunroom','terracotta','midnight','cosmos'];
 const savedTheme=store.get('roomTheme','story');
 let roomTheme=THEMES.includes(savedTheme)?savedTheme:'story';
 const now=new Date(),parts=kuwaitParts(now),light=lightOfDay(parts.hour),weather=weatherFor(parts.date);
 root.innerHTML=`<section class="scene room-scene light-${light}" data-theme="${roomTheme}" aria-label="Maha's little room">
   <div class="room-canvas"><div class="theme-world-detail" aria-hidden="true"><span class="theme-world-sun"></span><span class="theme-world-horizon"></span><span class="theme-world-ornament"></span></div>
   <div class="room-paint" aria-hidden="true"><img class="room-background" src="./assets/room-back.svg" alt=""><div class="window-sky light-${light} weather-${weather}" id="window-sky"><div class="weather-sun"></div><div class="weather-cloud cloud-one"></div><div class="weather-cloud cloud-two"></div><div class="weather-rain"></div><div class="window-landscape"><svg viewBox="0 0 180 200" preserveAspectRatio="none"><path d="M0 161q26-40 49-15t55-18t76 15v65H0Z" fill="#769988" opacity=".65"/><path d="M0 177q50-38 91-1t89-22v48H0Z" fill="#63857b" opacity=".85"/><path d="M0 194q40-22 97-5t83-9v20H0Z" fill="#607968"/><path d="M127 170v-28m-7 11 7-14 8 14" stroke="#365f59" stroke-width="3" fill="none"/></svg></div></div><img class="room-front" src="./assets/room-front.svg" alt=""><div class="room-theme-accents"><svg class="room-theme-art" viewBox="0 0 400 780" preserveAspectRatio="none" aria-hidden="true">
 <g class="theme-monsoon" fill="none" stroke-linecap="round">
  <path d="M185 46Q175 94 181 145Q188 166 182 203" stroke="#50795b" stroke-width="4" opacity=".63"/>
  <path d="M181 91Q153 64 150 80Q148 101 179 104M183 130Q206 104 209 124Q205 144 181 144M184 171Q162 145 155 160Q159 185 184 185" fill="#739877" stroke="#456c58" stroke-width="1.5" opacity=".7"/>
  <path d="M7 102Q42 123 61 157Q85 196 88 217" stroke="#57775b" stroke-width="3.2" opacity=".42"/>
  <path d="M46 137Q52 99 32 108Q22 125 46 147M65 165Q88 143 95 155Q84 177 70 180" fill="#8da27b" opacity=".66"/>
  <path d="M26 362Q43 349 59 355" stroke="#e9e3bd" stroke-width="3" opacity=".5"/>
 </g>
 <g class="theme-sunroom" fill="none" stroke-linecap="round">
  <path d="M26 319Q41 304 58 316" stroke="#e4ba77" stroke-width="3" opacity=".5"/>
  <path d="M172 125Q191 139 204 163" stroke="#f2d5a2" stroke-width="4" opacity=".72"/>
  <path d="M9 387Q40 370 71 389" stroke="#f9e2b7" stroke-width="5" opacity=".66"/>
  <path d="M131 394Q119 374 138 354" stroke="#739878" stroke-width="2.8"/>
  <path d="M139 363Q123 349 114 354Q115 368 137 370M137 374Q153 356 161 365Q155 380 136 384" fill="#8fb29a" stroke="#70927a" stroke-width="1.4"/>
  <circle cx="140" cy="349" r="9" fill="#e1ad61" stroke="#fbf2c9" stroke-width="2"/>
 </g>
 <g class="theme-terracotta" fill="none" stroke-linecap="round">
  <path d="M10 138Q30 128 49 144" stroke="#f0d6b1" stroke-width="3" opacity=".56"/>
  <path d="M155 216Q170 220 180 238" stroke="#99644c" stroke-width="2"/>
  <path d="M143 218L182 226L174 258L135 250Z" fill="#e6c09c" stroke="#9f6e52" stroke-width="2"/>
  <path d="M143 232Q156 220 171 243" stroke="#ae8062" stroke-width="2"/>
  <circle cx="155" cy="228" r="4" fill="#f4d5a5"/>
  <path d="M173 392V371Q177 363 185 370L189 393Z" fill="#a96449" stroke="#754c42" stroke-width="2"/>
  <path d="M180 367V346M180 354Q164 340 161 352Q166 360 180 360M180 348Q196 331 197 346Q191 355 180 356" stroke="#668568" stroke-width="2.5" fill="#98a47b"/>
 </g>
 </svg></div></div>
   <div class="room-overlay">
     <div class="room-greeting" id="room-greeting"><span class="eyebrow">YOUR LITTLE CORNER OF THE WORLD</span><h1>${esc(greeting(lastVisit,now))}</h1><div class="place-clock">☼ &nbsp;Kuwait <span class="clock-value" id="clock-value">${parts.clock}</span></div></div>
     <button type="button" class="room-bouquet" id="room-bouquet" aria-label="Pick a new bouquet for today">${bouquetMarkup(chosen,{vase:true})}</button><div class="room-vase" aria-hidden="true"><svg viewBox="0 0 110 130"><defs><linearGradient id="vase" x2="1" y2="0"><stop stop-color="#adbea5"/><stop offset=".5" stop-color="#d7d6b3"/><stop offset="1" stop-color="#829e90"/></linearGradient></defs><ellipse cx="55" cy="22" rx="31" ry="10" fill="#668579"/><path d="M23 22Q21 80 39 113Q55 123 71 113Q89 80 87 22Z" fill="url(#vase)" stroke="#779487" stroke-width="3"/><ellipse cx="55" cy="22" rx="33" ry="8" fill="#b1c0a4" stroke="#6f9185" stroke-width="3"/><path d="M44 33Q39 77 47 107" fill="none" stroke="#f7e9cc" stroke-width="4" opacity=".5"/></svg></div>
     <button class="today-card" id="today-card" aria-label="Today's note: ${esc(dailyLine(flowers.today,now))}"><span class="today-label">TODAY, FOR MAHA ✳</span><span class="today-copy">${esc(dailyLine(flowers.today,now))}</span><span class="today-tiny">a note on your sill</span></button>
     <div class="room-evidence" aria-live="polite"><span class="evidence-postcard" id="evidence-postcard" title="Kept Kerala postcard" hidden>KERALA<br>♡</span><span class="evidence-letter" id="evidence-letter" title="Kept a little letter" hidden>✉</span><span class="evidence-leaf" id="evidence-leaf" title="Watered the plant" hidden>❧</span><div class="evidence-stamps" id="evidence-stamps" aria-hidden="true"></div></div>
     <div class="room-objects" id="room-objects"></div>
     <div class="room-bottom-label">tap something curious <span aria-hidden="true">↗</span></div>
     <button type="button" class="replay-opening" id="replay-opening">↶ replay the opening</button><button type="button" class="theme-trigger" id="theme-trigger" aria-label="Change the room theme">✎ Make it yours</button>
   </div>
   </div>
   ${roomStudioMarkup()}
   <div class="theme-backdrop" id="theme-backdrop" hidden>
      <div class="theme-panel" role="dialog" aria-modal="true" aria-labelledby="theme-panel-title">
       <span class="eyebrow">A LITTLE REDECORATING</span>
       <h2 id="theme-panel-title">Which room feels like today?</h2>
       <p class="theme-intro">Six different little universes. Try each one — the room remembers your favourite.</p>
       <div class="theme-options" role="group" aria-label="Room appearance">
        <button type="button" class="theme-option" data-pick-theme="story" aria-pressed="false"><span class="theme-swatch swatch-story" aria-hidden="true"><i></i></span><span><strong>The Little Hideaway</strong><small>Vintage illustrated travel diary</small></span></button>
        <button type="button" class="theme-option" data-pick-theme="monsoon" aria-pressed="false"><span class="theme-swatch swatch-monsoon" aria-hidden="true"><i></i></span><span><strong>Kerala Rain</strong><small>Misty greenhouse in the rain</small></span></button>
        <button type="button" class="theme-option" data-pick-theme="sunroom" aria-pressed="false"><span class="theme-swatch swatch-sunroom" aria-hidden="true"><i></i></span><span><strong>Sunlit Sunday</strong><small>Bright mid-century artist studio</small></span></button>
        <button type="button" class="theme-option" data-pick-theme="terracotta" aria-pressed="false"><span class="theme-swatch swatch-terracotta" aria-hidden="true"><i></i></span><span><strong>Terracotta Travels</strong><small>Warm Mediterranean postcard house</small></span></button>
        <button type="button" class="theme-option" data-pick-theme="midnight" aria-pressed="false"><span class="theme-swatch swatch-midnight" aria-hidden="true"><i></i></span><span><strong>After Hours</strong><small>Neon after-hours city apartment</small></span></button>
        <button type="button" class="theme-option" data-pick-theme="cosmos" aria-pressed="false"><span class="theme-swatch swatch-cosmos" aria-hidden="true"><i></i></span><span><strong>Little Planetarium</strong><small>Celestial observatory among stars</small></span></button>
       </div>
       <button type="button" class="button button-primary theme-done" id="theme-done">This one. Keep it ♡</button>
      </div>
   </div>
   <div class="install-nudge" id="install-nudge" hidden><button class="nudge-close" id="nudge-close" aria-label="Dismiss tip">×</button><span class="eyebrow">A LITTLE SHORTCUT</span><strong>Want this on your home screen?</strong><p>In Safari, tap <b>Share</b> → <b>Add to Home Screen</b>. Turn on <b>Open as Web App</b> if offered, then tap Add.</p></div>
 </section>`;
 const objects=root.querySelector('#room-objects');
 const scene=root.querySelector('.room-scene');
 const portal=makePortalSystem({room:scene,frame:document.querySelector('#app'),visits,lastVisit,onReturn:refreshEvidence});
 const spots=[['music','radio',16,45,16,12],['letters','letter box',9,58,29,12],['movies','projector',45,69,24,11],['travel','suitcase',74,78,23,14],['games','game console',25,89,29,10],['rest','lamp',76,57,20,15],['rest','bed',10,77,38,12],['garden','plant',84,88,16,12]];
 spots.forEach(([id,label,x,y,w,h])=>{
  const b=document.createElement('button'); b.type='button'; b.className=`room-object object-${id} ${isUnlocked(id,visits)?'object-ready':'object-waiting'}`;
  b.style.cssText=`left:${x}%;top:${y}%;width:${w}%;height:${h}%;`;
  b.dataset.place=id;b.title=isUnlocked(id,visits)?`Open ${PLACES[id].name}`:'Still getting ready — you can peek inside';
  b.setAttribute('aria-label',`Visit ${PLACES[id].name} (${label})`);
  b.innerHTML=`<span class="object-hint" aria-hidden="true"></span><span class="object-dot ${isNew(id,visits)?'new-item':''}" aria-hidden="true"></span><span class="sr-only">${esc(label)}</span>`;
  b.addEventListener('click',()=>portal.open(id,b)); objects.append(b);
 });
 function refreshEvidence(){
  root.querySelector('#evidence-postcard').hidden=!store.get('postcardPinned',false);
  root.querySelector('#evidence-letter').hidden=!store.get('keptLetter',false);
  root.querySelector('#evidence-leaf').hidden=!store.get('gardenWatered',false);
  const seen=spots.filter((x,i)=>spots.findIndex(y=>y[0]===x[0])===i).filter(([id])=>store.get('seenPlace:'+id,false));
  const stamps=root.querySelector('#evidence-stamps');const passport=Array.isArray(store.get('passportStamps',[]))?store.get('passportStamps',[]):[];stamps.innerHTML=seen.slice(0,3).map(([id])=>`<span class="wall-stamp stamp-${id}">${PLACES[id].icon}</span>`).join('')+passport.slice(0,3).map(stamp=>`<span class="wall-stamp passport-game-stamp" title="${stamp.id} game won">✦</span>`).join('');
  objects.querySelectorAll('[data-place]').forEach(b=>{b.querySelector('.object-dot').classList.toggle('new-item',isNew(b.dataset.place,visits));});
 }
 refreshEvidence();
 const themeBackdrop=root.querySelector('#theme-backdrop');
 const themeTrigger=root.querySelector('#theme-trigger');
 const themeClose=()=>{themeBackdrop.hidden=true;themeTrigger.focus({preventScroll:true});};
 const themeSync=()=>{root.querySelectorAll('[data-pick-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pickTheme===roomTheme)));};
 themeTrigger.addEventListener('click',()=>{startSound();soundEffect('tap');themeSync();themeBackdrop.hidden=false;root.querySelector(`[data-pick-theme="${roomTheme}"]`)?.focus({preventScroll:true});});
 root.querySelectorAll('[data-pick-theme]').forEach(b=>b.addEventListener('click',()=>{
   roomTheme=b.dataset.pickTheme;store.set('roomTheme',roomTheme);
   root.querySelector('.room-scene').dataset.theme=roomTheme;
    const illustration=root.querySelector('.director-illustration');if(illustration)illustration.src=roomTheme==='story'?'./assets/room-directors-cut.svg':`./assets/room-theme-${roomTheme}.svg`;
   themeSync();soundEffect('pick');
 }));
 const disposeStudio=mountRoomStudio({root,portal,onReplay,onNewBouquet,onTheme:()=>themeTrigger.click()});
 root.querySelector('#theme-done').addEventListener('click',()=>{soundEffect('tap');themeClose();});
 themeBackdrop.addEventListener('click',e=>{if(e.target===themeBackdrop)themeClose();});
 const onEscape=e=>{
   if(e.key==='Escape'){
     if(!themeBackdrop.hidden){themeClose();return;}
   }
   if(e.key==='Tab'&&!themeBackdrop.hidden){
     const tabs=[...themeBackdrop.querySelectorAll('button:not([disabled])')];
     const first=tabs[0],last=tabs[tabs.length-1];
     if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
     else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
   }
 };
 document.addEventListener('keydown',onEscape);
 root.querySelector('#replay-opening').addEventListener('click',()=>{startSound();soundEffect('tap');onReplay();});
 const sill=root.querySelector('#today-card');sill.addEventListener('click',()=>{startSound();portal.open('letters',sill);});
 const bouquet=root.querySelector('#room-bouquet');bouquet.addEventListener('click',()=>{startSound();soundEffect('door');onNewBouquet();});
 const clock=root.querySelector('#clock-value');
 const sky=root.querySelector('#window-sky');let dayAtMount=parts.date, lightAtMount=light;
 const refresh=()=>{
   const current=kuwaitParts();clock.textContent=current.clock;
   const nextLight=lightOfDay(current.hour);
   if(nextLight!==lightAtMount){sky.classList.replace('light-'+lightAtMount,'light-'+nextLight);root.querySelector('.room-scene').classList.replace('light-'+lightAtMount,'light-'+nextLight);lightAtMount=nextLight;}
   if(current.date!==dayAtMount){
     sky.classList.replace('weather-'+weatherFor(dayAtMount),'weather-'+weatherFor(current.date));
     dayAtMount=current.date;
     const line=dailyLine(flowers.today);
     sill.querySelector('.today-copy').textContent=line;sill.setAttribute('aria-label',`Today's note: ${line}`);
   }
 };weatherTimer=setInterval(refresh,60000);
 const ua=navigator.userAgent||'';const onIOS=/iPhone|iPad|iPod/.test(ua)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
 const isStandalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 if(onIOS&&!isStandalone&&visits>=2&&!store.get('installShown',false)){
   store.set('installShown',true);const n=root.querySelector('#install-nudge');n.hidden=false;
   root.querySelector('#nudge-close').addEventListener('click',()=>{n.hidden=true;store.set('installDismissed',true);});
 }
 return ()=>{disposeStudio();portal.destroy();clearInterval(weatherTimer);document.removeEventListener('keydown',onEscape);};
}