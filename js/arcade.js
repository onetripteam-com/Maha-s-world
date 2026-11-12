/** PROMPT C / Phase 1 — the room's one-cabinet-at-a-time arcade. */
import {store} from './store.js';
import {startSound,soundEffect} from './audio.js';
const MODULES={
 chai:()=>import('./games/chai.js'),
 sadya:()=>import('./games/sadya.js'),
 baggage:()=>import('./games/baggage.js'),
 doctor:()=>import('./games/doctor.js'),
 world:()=>import('./games/world.js'),
 vlog:()=>import('./games/vlog.js')
};
const CABINETS=[
 {id:'chai',name:'Chai Maker',marquee:'CHAAYA DEPARTMENT',subtitle:'Pour, simmer and get the spices right',colour:'#b87956',screen:'#453c3a',icon:'☕',accent:'#f5c984',blurb:'Run a tiny chai counter. Hold to pour, stop the boil at the right moment, then add ginger and cardamom on the beat. Complaints from imaginary aunties included.'},
 {id:'sadya',name:'Sadya Builder',marquee:'SADYA SERVICE',subtitle:'Build a feast, one dish at a time',colour:'#6e9476',screen:'#30594c',icon:'✽',accent:'#efdeb5',blurb:'Set out a Kerala sadya on a banana leaf by tapping or dragging nine dishes into the right spots. Regional house rules apply, naturally.'},
 {id:'baggage',name:'Airport Baggage',marquee:'KWI BAGGAGE DESK',subtitle:'Can it all fit in the suitcase?',colour:'#9a7665',screen:'#3a454d',icon:'▤',accent:'#e3c79a',blurb:'Pack the suitcase like a real airport puzzle: rotate shapes, watch the weight limit, save enough room for the jhumkas.'},
 {id:'doctor',name:'Decode the Doctor',marquee:'DR. SQUIGGLE',subtitle:'Certified handwriting chaos',colour:'#9c738c',screen:'#323753',icon:'✎',accent:'#f7c3de',blurb:'Five fake scribbles. A PharmD degree cannot save this pen.'},
 {id:'world',name:'Where in the World?',marquee:'POSTCARD HUNT',subtitle:'Five quick travel mysteries',colour:'#6a9a98',screen:'#284e54',icon:'⌖',accent:'#f4dea5',blurb:'Watch illustrated travel clues, then guess the destination.'},
 {id:'vlog',name:'Vlog Director',marquee:'DIRECTOR MAHA',subtitle:'Five shots · Twenty seconds',colour:'#b68475',screen:'#423c5a',icon:'▣',accent:'#e7d1fa',blurb:'Rearrange the story. Premiere your cinematic masterpiece.'}
];
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const escape=s=>String(s).replace(/[&<>"']/g,v=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]));
export function mountArcade(host,{onStamp=()=>{},autoPlayId=null}={}){
 let index=0,current=null,game=null,disposed=false,paused=false,muted=store.get('arcadeMuted',false)===true,showing='lobby',entryTimer=null;
 host.classList.add('arcade-host');
 const stats=id=>({best:Number(store.get('arcadeBest:'+id,0))||0,stamp:Boolean(store.get('gameCompletions',{})[id])});
 const goodSound=k=>{if(!muted){startSound();soundEffect(k)}};
 const markup=c=>{const a=stats(c.id);return `<div class="arcade-cabinet" style="--cab:${c.colour};--monitor:${c.screen};--neon:${c.accent}">
  <div class="cabinet-top"><div class="cabinet-marquee"><span class="marquee-tiny">MAHA'S VERY UNOFFICIAL</span><strong>${c.marquee}</strong><span class="marquee-star">✦ &nbsp; ✳ &nbsp; ✦</span></div></div>
  <div class="cabinet-bezel"><div class="cabinet-monitor"><div class="scanlines"></div><span class="cabinet-pixel-art">${c.icon}</span><strong>${c.name}</strong><small>${c.subtitle}</small></div></div>
  <div class="cabinet-deck"><span class="cabinet-stick"><i></i></span><span class="cabinet-buttons"><i></i><i></i><i></i></span><span class="cabinet-coin">◉ INSERT</span></div><div class="cabinet-bottom"><span>PLAYER ONE: MAHA</span><span>✦ THE WORLD'S MOST SERIOUS NON-SPORTS</span></div></div>
 <p class="cabinet-description">${c.blurb}</p><p class="arcade-cabinet-score">${a.stamp?'◉ PASSPORT STAMP EARNED':'○ NOT YET STAMPED'} &nbsp;·&nbsp; BEST ${a.best.toLocaleString('en-IN')}</p>`};
 const getIndex=i=>(i+CABINETS.length)%CABINETS.length;
 const renderDossier=c=>{
  const i=CABINETS.findIndex(x=>x.id===c.id),record=stats(c.id);
  return '<span class="arcade-info-kicker">THE COLLECTION · '+String(i+1).padStart(2,'0')+' / 06</span>'+
   '<h2>'+escape(c.name)+'</h2><p>'+escape(c.blurb)+'</p>'+
   '<div class="arcade-info-rule"></div><div class="arcade-info-stats"><span>'+(record.stamp?'✳ PASSPORT STAMPED':'○ A FRESH CABINET')+'</span><strong>BEST '+record.best.toLocaleString('en-IN')+'</strong></div>'+
   '<small>Arrow keys, swipe, or use the cabinet controls. No rankings. No pressure.</small>';
 };
 function lobby(){showing='lobby';paused=false;current=null;host.innerHTML=`<div class="arcade-app arcade-lobby"><div class="arcade-sign"><span class="sign-sparks">✦ ✳ ✦</span> THE SLIGHTLY SILLY ARCADE <small>NO REAL COINS WERE HARMED</small></div><div class="cabinet-switcher"><button class="cabinet-arrow" data-prev type="button" aria-label="Previous cabinet">‹</button><div class="cabinet-stage" id="cabinet-stage" tabindex="0" role="group" aria-label="Arcade cabinet. Swipe to change games.">${markup(CABINETS[index])}</div><button class="cabinet-arrow" data-next type="button" aria-label="Next cabinet">›</button></div><div class="arcade-pips" aria-label="Game ${index+1} of ${CABINETS.length}">${CABINETS.map((c,i)=>`<button type="button" data-pip="${i}" aria-label="See ${c.name}" aria-pressed="${i===index}">${i===index?'●':'○'}</button>`).join('')}</div><button class="arcade-play" type="button" data-play>◉ INSERT COIN & PLAY</button><p class="arcade-footnote">Swipe the cabinet. Six little diversions. Absolutely no pressure.</p><div class="arcade-stamps" aria-label="Passport stamps">${CABINETS.map(c=>`<span class="${stats(c.id).stamp?'earned':''}" title="${c.name}">${c.icon}</span>`).join('')}</div><aside class="arcade-info" aria-live="polite">${renderDossier(CABINETS[index])}</aside></div>`;
  host.querySelector('[data-prev]').addEventListener('click',()=>turn(-1));host.querySelector('[data-next]').addEventListener('click',()=>turn(1));
  host.querySelector('[data-play]').addEventListener('click',()=>launch());host.querySelectorAll('[data-pip]').forEach(b=>b.addEventListener('click',()=>turn(0,+b.dataset.pip)));
  const stage=host.querySelector('.cabinet-stage');let startX=null,startY=null;
  stage.addEventListener('pointerdown',e=>{startX=e.clientX;startY=e.clientY});
  stage.addEventListener('pointerup',e=>{if(startX===null)return;const dx=e.clientX-startX,dy=e.clientY-startY;startX=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))turn(dx<0?1:-1)});
  stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();turn(1)}if(e.key==='ArrowLeft'){e.preventDefault();turn(-1)}if(e.key==='Enter'){e.preventDefault();launch()}});
 }
 function turn(n,absolute){const next=Number.isFinite(absolute)?absolute:getIndex(index+n);if(next===index)return;index=next;goodSound('tap');const stage=host.querySelector('.cabinet-stage');if(!stage)return;const old=stage.firstElementChild;stage.innerHTML=markup(CABINETS[index]);const dossier=host.querySelector('.arcade-info');if(dossier)dossier.innerHTML=renderDossier(CABINETS[index]);stage.classList.remove('cabinet-turn');void stage.offsetWidth;stage.classList.add('cabinet-turn');host.querySelector('.arcade-pips').innerHTML=CABINETS.map((c,i)=>`<button type="button" data-pip="${i}" aria-label="See ${c.name}" aria-pressed="${i===index}">${i===index?'●':'○'}</button>`).join('');host.querySelectorAll('[data-pip]').forEach(b=>b.addEventListener('click',()=>turn(0,+b.dataset.pip))); }
 async function launch(){if(showing!=='lobby'||disposed)return;showing='loading';goodSound('coin');const app=host.querySelector('.arcade-app');app.classList.add('coin-inserting');const coin=document.createElement('span');coin.className='falling-coin';coin.textContent='◉';app.append(coin);await new Promise(r=>entryTimer=setTimeout(r,reduced()?20:570));if(disposed||showing!=='loading')return;await startGame(CABINETS[index].id);}
 async function startGame(id){if(game){game.stop();game=null}showing='playing';paused=false;current=id;host.innerHTML=`<div class="arcade-app arcade-active arcade-active-${id}"><div class="arcade-game-bar"><button type="button" data-cabinets aria-label="Return to arcade cabinets">‹ Cabinets</button><span>◉ ${CABINETS.find(x=>x.id===id).name}</span><button type="button" data-arcade-mute aria-pressed="${muted}" aria-label="${muted?'Enable':'Mute'} arcade game sounds">${muted?'♩':'♫'}</button></div><div class="arcade-game-board" id="arcade-game-board"><p>Warming up the cabinet…</p></div><div class="arcade-control-row"><button type="button" data-pause>Ⅱ Pause</button><button type="button" data-restart>↻ Restart</button></div><div class="arcade-pause-curtain" hidden><strong>PAUSED</strong><span>Even a highly unofficial arcade allows breaks.</span><button type="button" data-resume>▶ Resume</button></div></div>`;
  let mod;
  try { mod=await MODULES[id](); }
  catch(error) {
    if(disposed||showing!=='playing'||current!==id)return;
    console.error('Could not load arcade cabinet',id,error);
    showing='unavailable';
    host.innerHTML='<div class="arcade-app arcade-result" role="alert"><h2>This cabinet needs a moment.</h2><p>The game could not load. Check the connection and try again, or choose another cabinet.</p><div class="arcade-result-buttons"><button type="button" data-retry>↻ Try again</button><button type="button" data-cabinets>Other cabinets →</button></div></div>';
    host.querySelector('[data-retry]').addEventListener('click',()=>startGame(id));
    host.querySelector('[data-cabinets]').addEventListener('click',returnToCabinets);
    return;
  }
  if(disposed||showing!=='playing'||current!==id)return;const board=host.querySelector('#arcade-game-board');
  const handleFinish=r=>{if(disposed||showing!=='playing')return;showResult(r)};
  game=mod.start(board,{isPaused:()=>paused,onFinish:handleFinish,sound:goodSound});
  host.querySelector('[data-cabinets]').addEventListener('click',returnToCabinets);
  host.querySelector('[data-pause]').addEventListener('click',()=>setPause(!paused));host.querySelector('[data-resume]').addEventListener('click',()=>setPause(false));host.querySelector('[data-restart]').addEventListener('click',()=>{goodSound('tap');startGame(id)});
  host.querySelector('[data-arcade-mute]').addEventListener('click',()=>{muted=!muted;store.set('arcadeMuted',muted);const b=host.querySelector('[data-arcade-mute]');b.textContent=muted?'♩':'♫';b.setAttribute('aria-pressed',String(muted));b.setAttribute('aria-label',muted?'Enable arcade game sounds':'Mute arcade game sounds')});
 }
 function setPause(v){paused=v;const curtain=host.querySelector('.arcade-pause-curtain');if(curtain)curtain.hidden=!v;const b=host.querySelector('[data-pause]');if(b)b.textContent=v?'▶ Resume':'Ⅱ Pause';}
 function showResult(r){showing='result';paused=false;const id=current;if(game){game.stop();game=null}const best=Math.max(r.score,Number(store.get('arcadeBest:'+id,0))||0);store.set('arcadeBest:'+id,best);
  if(r.won){const completed={...store.get('gameCompletions',{}),[id]:true};store.set('gameCompletions',completed);store.set('game:'+id+':completed',true);const passport=Array.isArray(store.get('passportStamps',[]))?store.get('passportStamps',[]):[];if(!passport.some(p=>p.id===id)){store.set('passportStamps',[...passport,{id,earnedAt:new Date().toISOString(),score:r.score}])}goodSound('complete');onStamp(id)}else goodSound('undo');
  host.innerHTML=`<div class="arcade-app arcade-result"><span class="arcade-result-top">ARCADE OFFICIAL RESULTS OFFICE</span><span class="arcade-result-medal">${r.won?'✦':'♡'}</span><h2>${r.won?'PASSPORT STAMPED!':'EVERY ATTEMPT COUNTS.'}</h2><div class="arcade-result-score"><span>SCORE</span><strong>${r.score.toLocaleString('en-IN')}</strong><small>PERSONAL BEST · ${best.toLocaleString('en-IN')}</small></div><p class="arcade-result-quote">“${escape(r.description)}”</p>${r.won?'<div class="arcade-stamp-award">✦ One more stamp in your little passport ✦</div>':'<div class="arcade-stamp-award">No shame. Not even from imaginary airport staff.</div>'}<div class="arcade-result-buttons"><button type="button" data-again>↻ One more?</button><button type="button" data-cabinets>Other cabinets →</button></div></div>`;
  host.querySelector('[data-again]').addEventListener('click',()=>startGame(id));host.querySelector('[data-cabinets]').addEventListener('click',returnToCabinets);
 }
 function returnToCabinets(){if(game){game.stop();game=null}clearTimeout(entryTimer);showing='lobby';paused=false;goodSound('tap');lobby()}
 if(autoPlayId&&MODULES[autoPlayId]){index=CABINETS.findIndex(c=>c.id===autoPlayId);startGame(autoPlayId);}else lobby();
 return ()=>{disposed=true;clearTimeout(entryTimer);if(game){game.stop();game=null}host.innerHTML='';host.classList.remove('arcade-host')};
}
