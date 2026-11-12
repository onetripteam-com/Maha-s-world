import {store} from './store.js';
import {kuwaitParts} from './time.js';
import {copyForRoom,sceneMoment,LIGHT_CHOICES,automaticLight} from './room-moments.js';
import {makePortalSystem} from './portal.js';
import {mountAtelierLife} from './atelier-life.js';
import {mountCinematicHome} from './cinematic-home.js';
import {mountPocketPeek} from './pocket-peek.js';
import {mountOriginalRoomArt} from './original-room-art.js';
import {mountLivingRoomPhoto} from './room-photo-stage.js';
import {physicalObjectMarkup,bouquetObjectMarkup} from './physical-room-objects.js';
import {mountMemoryTools} from './memory.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const worlds=[['story','Kuwait'],['kerala','Kerala'],['bengaluru','Bangalore']];
const objects=[['letters','Letters','A little post for any day'],['music','Habibii FM','Find your frequency'],['movies','Cinema','One seat. All yours.'],['travel','Travel','Where shall we go?'],['games','Arcade','Highly unserious business'],['garden','Word garden','Let a thought grow'],['rest','Rest','No plans required']];
export function mountRoom(root,{chosen,visits,lastVisit,onReplay,onNewBouquet}){
 let theme=store.get('roomTheme','story');if(!worlds.some(w=>w[0]===theme)){theme=theme==='monsoon'?'kerala':'story';store.set('roomTheme',theme)}
 const context=copyForRoom(visits);
 let light=store.get('roomLight','auto');if(!LIGHT_CHOICES.some(x=>x.id===light))light='auto';
 const effectiveLight=()=>light==='auto'?automaticLight(kuwaitParts().hour):light;
 const flowerWhispers=['A few flowers, just because.','A little colour for today.','Some days simply need flowers.','No occasion necessary.','A fresh bunch, a fresh little moment.'];
 const flowerWhisper=flowerWhispers[(Math.max(1,visits)-1)%flowerWhispers.length];
 root.innerHTML=`<section class="scene room-scene new-home remembering-home atelier-home cinematic-room" data-theme="${theme}" data-light="${effectiveLight()}" aria-label="Maha’s home"><div class="home-shell"><header class="room-heading"><div><span class="room-eyebrow" id="room-visit-label">${esc(context.label)}</span><h1 id="room-welcome">${esc(context.heading)}</h1><p id="room-welcome-copy">${esc(context.body)}</p></div></header>
 <div class="room-top-controls" role="group" aria-label="Room atmosphere"><button id="theme-trigger" type="button" aria-haspopup="dialog" aria-label="Choose a room scene" title="Scenes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="8.5" cy="9" r="1.5"/><path d="m5.5 17 5-5 3.2 3.1 2.8-2.6 3 3.5"/></svg></button><button id="room-light-trigger" type="button" aria-haspopup="dialog" aria-label="Adjust room lighting" title="Lighting"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 18h6m-5 3h4M8.1 14.9A6.5 6.5 0 1 1 15.9 15c-.9.7-1.4 1.7-1.5 2.4h-4.8c-.1-.8-.6-1.7-1.5-2.5Z"/><path d="M12 2v1M3.4 11H2M22 11h-1.4M5.1 4.5l1 1M18.9 4.5l-1 1"/></svg></button></div>
 <div class="inhabited-room"><div id="home-art" hidden aria-hidden="true"></div><div class="cinematic-photo" aria-hidden="true"></div><div class="cinematic-lens" aria-hidden="true"></div><div class="cinematic-grain" aria-hidden="true"></div><button type="button" id="room-window" class="window-whisper" aria-label="Change the view through the window" title="Try the window"><span>↺ the sky</span></button><nav class="room-pan-controls" aria-label="Explore the room"><button type="button" id="room-pan-left" aria-label="Look left">←</button><span id="room-pan-caption" aria-live="polite">SWIPE TO EXPLORE</span><button type="button" id="room-pan-right" aria-label="Look right">→</button></nav><span class="room-address">MAHA’S PLACE · <span id="clock-value">${kuwaitParts().clock}</span> KUWAIT TIME · <span id="room-scene-label">KUWAIT</span></span>
 ${objects.map(([id,name,sub])=>`<button type="button" class="room-object living-object object-${id}" data-place="${id}" data-door="${id}" aria-label="${name}: ${sub}"><span class="object-drawing">${physicalObjectMarkup(id)}</span><span class="object-label">${name} <i>↗</i></span></button>`).join('')}
 <button id="room-bouquet" class="table-bouquet" aria-label="Change your seven flowers">${bouquetObjectMarkup(chosen)}<span>${esc(flowerWhisper)}</span></button><div id="room-traces" class="room-traces" aria-live="polite"></div><span class="atelier-inscription" aria-hidden="true">Small things, kept close.</span><div class="cinematic-note" aria-hidden="true"><b id="room-aside-label">A LITTLE NOTE FOR THIS HOUR</b><span id="room-aside-copy">${esc(context.aside)}</span></div><div class="cinematic-discovery" aria-hidden="true">TAP WHAT YOU SEE<br>THIS ROOM HAS STORIES</div><span class="cinematic-issue" aria-hidden="true">A little place. Always here.</span></div>
 <div class="room-dock"><span class="room-invitation">A little escape. Pick anything.</span><button type="button" id="take-me-anywhere" class="serendipity">Pick for me ✦</button><button id="revisit-hug" type="button" aria-label="Open your letter and virtual hug again">A little hug ♡</button><button id="home-menu-trigger" aria-haspopup="dialog">Explore ☰</button></div></div><dialog id="home-menu" class="home-picker home-menu"><form method="dialog"><button class="picker-close" aria-label="Close home menu">✕</button></form><span class="room-eyebrow">MAKE YOURSELF AT HOME</span><h2>Where would you like to go?</h2><nav class="room-shortcuts" aria-label="Explore Maha’s home">${objects.map(([id,name])=>`<button data-visit="${id}">${name} ↗</button>`).join('')}</nav>
 <section class="room-margin"><span class="room-eyebrow">HOW SHALL WE SPEND A MOMENT?</span><div class="mood-actions"><button data-mood="games" data-line="No talent required. A little silliness will do.">Make me smile</button><button data-mood="rest" data-line="You can put everything down for a minute.">A softer moment</button><button data-mood="travel" data-line="A small detour? No packing required.">Somewhere else</button></div><p id="mood-line" role="status">No right order. No catching up. This place is yours.</p></section>
 <footer class="room-footer"><p>Same little home.<br><em>Whatever kind of day.</em></p><div><button id="memory-trigger">Your keepsakes & backups ↗</button><button id="replay-opening">Replay the beginning ↶</button><small>Saved on this browser. No account, no sending.</small></div></footer></dialog>
 <dialog id="room-light-overlay" class="home-picker room-light-picker"><form method="dialog"><button class="picker-close" aria-label="Close lighting menu">✕</button></form><span class="room-eyebrow">SET THE FEELING</span><h2>How should the light fall?</h2><div class="room-light-options" role="group" aria-label="Room lighting">${LIGHT_CHOICES.map(x=>`<button type="button" data-light-option="${x.id}" aria-pressed="${light===x.id}"><i aria-hidden="true"></i><strong>${x.name}</strong><small>${x.hint}</small></button>`).join('')}</div><p>These are lighting moods, not screen brightness controls.</p></dialog>
 <dialog id="home-world-overlay" class="home-picker"><form method="dialog"><button class="picker-close" aria-label="Close scenery selection">✕</button></form><span class="room-eyebrow">FAMILIAR THINGS. A DIFFERENT VIEW.</span><h2>Where are we today?</h2><div class="home-world-choices">${worlds.map(([id,name])=>`<button data-world="${id}" aria-pressed="${id===theme}"><span data-theme="${id}" class="theme-preview-art" aria-hidden="true"></span><strong>${name}</strong></button>`).join('')}</div></dialog></section>`;
 const room=root.querySelector('.new-home');
 const menu=root.querySelector('#home-menu');root.querySelector('#home-menu-trigger').onclick=()=>menu.showModal();
 const openFromMenu=(id,source,line)=>{menu.close();portal.open(id,root.querySelector('#home-menu-trigger'),line)};
 const refresh=()=>{const kept=store.get('keptLetters',[]),dreams=store.get('dreamPins',[]),wins=store.get('gameCompletions',{});
 const travelNote=room.querySelector('.object-travel .object-label small');
 if(travelNote)travelNote.textContent=store.get('postcardPinned')
   ? 'That postcard made it onto the wall. Open it again.'
   : 'Every postcard has somewhere to take you.';
root.querySelector('#room-traces').innerHTML=`${store.get('postcardPinned')?'<button class="trace-postcard" data-trace="travel">See the postcard you pinned ↗</button>':''}${Array.isArray(kept)&&kept.length?`<button class="trace-letter" data-trace="letters">${kept.length} kept ${kept.length===1?'letter':'letters'} ✉</button>`:''}${Array.isArray(dreams)&&dreams.length?`<button class="trace-tag" data-trace="travel">Next someday: ${esc(dreams.at(-1).name)}</button>`:''}${Object.values(wins||{}).some(Boolean)?'<button class="trace-star" data-trace="games" aria-label="Your arcade souvenir">✷</button>':''}`;root.querySelectorAll('[data-trace]').forEach(b=>b.onclick=()=>portal.open(b.dataset.trace,b));};
 const portal=makePortalSystem({room,frame:document.querySelector('#app'),visits,lastVisit,onReturn:refresh});refresh();
 root.querySelectorAll('[data-door]').forEach(b=>b.onclick=()=>portal.open(b.dataset.door,b));
 root.querySelector('#take-me-anywhere').onclick=()=>{
   // A meaningful suggestion for this hour rather than a random roulette.
   const p=copyForRoom(visits).period;
   const picks={morning:'garden',afternoon:'games',dusk:'music',night:'rest'};
   const id=picks[p]||'letters';
   const door=root.querySelector('[data-door="'+id+'"]');
   if(door)portal.open(id,door);
 };
 // A small tactile delight: the window changes its imaginary weather.
 // No geolocation, API, tracking or stored user data is involved.
 const skyModes=['natural','rain','night'];let skyIndex=0;
 const windowButton=root.querySelector('#room-window');
 windowButton.onclick=()=>{skyIndex=(skyIndex+1)%skyModes.length;room.dataset.sky=skyModes[skyIndex];windowButton.setAttribute('aria-label','Window view: '+skyModes[skyIndex]+'. Tap to change.');};
 root.querySelectorAll('[data-visit]').forEach(b=>b.onclick=()=>openFromMenu(b.dataset.visit,b));
 root.querySelectorAll('[data-mood]').forEach(b=>b.onclick=()=>{root.querySelector('#mood-line').textContent=b.dataset.line;openFromMenu(b.dataset.mood,b,b.dataset.line)});
 root.querySelector('#room-bouquet').onclick=onNewBouquet;root.querySelector('#replay-opening').onclick=()=>{menu.close();onReplay()};root.querySelector('#revisit-hug').onclick=onReplay;
 const lighting=root.querySelector('#room-light-overlay');
 const lightButton=root.querySelector('#room-light-trigger');
 lightButton.onclick=()=>lighting.showModal();
 const updateLight=()=>{room.dataset.light=effectiveLight();lightButton.setAttribute('aria-label','Room lighting: '+(LIGHT_CHOICES.find(x=>x.id===light)?.name||light)+'. Change lighting');root.querySelectorAll('[data-light-option]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.lightOption===light)));};
 root.querySelectorAll('[data-light-option]').forEach(b=>b.onclick=()=>{light=b.dataset.lightOption;store.set('roomLight',light);updateLight();lighting.close()});
 updateLight();
 const refreshMoments=()=>{
   const now=copyForRoom(visits);
   const moment=sceneMoment(now.period,theme);
   root.querySelector('.room-invitation').textContent=moment.invitation;
   root.querySelector('.cinematic-issue').textContent=moment.placeLine;
   root.querySelector('#room-scene-label').textContent=({story:'KUWAIT',kerala:'KERALA',bengaluru:'BENGALURU'})[theme]||'KUWAIT';
   root.querySelector('#room-visit-label').textContent=now.label;
   root.querySelector('#room-welcome').textContent=now.heading;
   root.querySelector('#room-welcome-copy').textContent=now.body;
   root.querySelector('#room-aside-copy').textContent=now.aside;
   if(light==='auto')updateLight();
 };
 refreshMoments();
 const picker=root.querySelector('#home-world-overlay');root.querySelector('#theme-trigger').onclick=()=>picker.showModal();
 root.querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>{theme=b.dataset.world;store.set('roomTheme',theme);room.dataset.theme=theme;refreshMoments();/* Update in place without resetting the bouquet. */root.querySelectorAll('[data-world]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));picker.close()});
 // Group the scene and lighting controls beside Sound in the real header.
 const appHeader=document.querySelector(".app-header");
 const roomToolbar=room.querySelector(".room-top-controls");
 const soundButton=appHeader?.querySelector("#sound-toggle");
 if(appHeader&&roomToolbar&&soundButton)appHeader.insertBefore(roomToolbar,soundButton);
 const disposeLivingPhoto=mountLivingRoomPhoto(room,chosen);const disposeLife=mountAtelierLife(room);const disposeCinema=mountCinematicHome(room);const disposePeek=mountPocketPeek(room);const disposeOriginalArt=mountOriginalRoomArt(room);const disposeMemory=mountMemoryTools(root);const timer=setInterval(()=>{root.querySelector('#clock-value').textContent=kuwaitParts().clock;refreshMoments()},60000);
 return ()=>{clearInterval(timer);roomToolbar?.remove();disposeLivingPhoto();disposeOriginalArt();disposePeek();disposeCinema();disposeLife();disposeMemory();portal.destroy()};
}
