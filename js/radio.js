/** HABIBII FM: local oscillator crackle; optional self-recorded AAC files only. */
import {store} from './store.js';
import {startSound,soundEffect,radioStatic} from './audio.js';
import {takeMedia,releaseMedia,isMediaMuted} from './media-control.js';
import {makeRadioAtmosphere} from './radio-ambience.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const legalURL=url=>{try{const p=new URL(url);return ['https:','http:'].includes(p.protocol)?p.href:null}catch{return null}};
export function mountRadio(host){
 let stations=[],index=0,audio=null,mode='',disposed=false;
 const atmosphere=makeRadioAtmosphere();
 host.classList.add('radio-host');
 const stop=()=>{atmosphere.stop();if(audio){releaseMedia(audio);audio.src='';audio.remove();audio=null}mode='';};
 const mute=()=>{if(audio)audio.muted=isMediaMuted();if(isMediaMuted()&&atmosphere.active){atmosphere.stop();mode='';updatePlayer();}};document.addEventListener('maha:mutechange',mute);
 function playLocal(src,type){if(!src)return;stop();const el=new Audio();el.preload='none';el.muted=isMediaMuted();el.src=src;el.loop=type==='ambient';audio=el;mode=type;takeMedia(el);el.play().then(()=>updatePlayer()).catch(()=>{stop();host.querySelector('.radio-audio-state').textContent='Audio unavailable. The voice caption is still here.';updatePlayer()});el.addEventListener('ended',()=>{if(audio===el){releaseMedia(el);audio=null;mode='';updatePlayer()}})}
 function updatePlayer(){const b=host.querySelector('[data-audio]');if(b)b.textContent=audio&&mode==='intro'?'Ⅱ Pause voice intro':(stations[index]?.introAudio?'▶ Hear my introduction':'◌ Voice caption only');const amb=host.querySelector('[data-ambience]');if(amb)amb.textContent=mode==='ambient'?'Ⅱ Stop atmosphere':(stations[index]?.ambientAudio?'▶ Play recorded atmosphere':'▶ Hear this place')}
 function switchStation(n){if(!stations.length)return;stop();index=(n+stations.length)%stations.length;store.set('radioLastStation',stations[index].id);startSound();radioStatic();soundEffect('tap');render()}
 function render(){const s=stations[index];if(!s)return;const angle=-71+index*(142/(stations.length-1));host.innerHTML=`<div class="fm-app" style="--fm1:${esc(s.colors[0])};--fm2:${esc(s.colors[1])}"><div class="fm-head"><span>✳ HABIBII FM</span><span>KUWAIT ↔ EVERYWHERE</span></div><h1>A frequency<br><em>for every mood.</em></h1><div class="fm-radio portal-entry"><div class="fm-speaker" aria-hidden="true"></div><div class="fm-face"><div class="fm-frequency"><span>FM</span><strong>${esc(s.frequency)}</strong><small>${esc(s.name)}</small></div><div class="fm-dial" style="--needle:${angle}deg" aria-hidden="true"><div class="fm-needle"></div><div class="fm-knob">◉</div></div></div><div class="fm-radio-base">✳ YOU'RE TUNED IN ✳</div></div><div class="fm-tune"><button data-prev type="button" aria-label="Previous station">‹</button><label><span>TURN THE DIAL · STATION ${index+1} / ${stations.length}</span><input type="range" min="0" max="${stations.length-1}" step="1" value="${index}" data-slider aria-label="Choose radio station"></label><button data-next type="button" aria-label="Next station">›</button></div><div class="fm-station"><span>ON AIR · ${esc(s.name.toUpperCase())}</span><h2>${esc(s.tagline)}</h2><p class="fm-intro">${esc(s.introCaption)}</p><p class="radio-audio-state" aria-live="polite">${s.introAudio?'Recorded voice is ready.':'A little atmosphere is ready. Press play to hear this place.'}</p></div><div class="fm-audio"><button type="button" data-audio>${s.introAudio?'▶ Hear my introduction':'◌ Voice caption only'}</button><button type="button" data-ambience>${s.ambientAudio?'▶ Play recorded atmosphere':'▶ Hear this place'}</button></div><div class="fm-links"><a ${legalURL(s.spotify)?`href="${esc(legalURL(s.spotify))}" target="_blank" rel="noopener noreferrer"`:'aria-disabled="true" tabindex="-1"'}>↗ Spotify playlist</a><a ${legalURL(s.youtube)?`href="${esc(legalURL(s.youtube))}" target="_blank" rel="noopener noreferrer"`:'aria-disabled="true" tabindex="-1"'}>↗ YouTube playlist</a></div><p class="fm-credit">No rush. The radio is happy to keep you company.</p></div>`;
  host.querySelector('[data-prev]').addEventListener('click',()=>switchStation(index-1));host.querySelector('[data-next]').addEventListener('click',()=>switchStation(index+1));host.querySelector('[data-slider]').addEventListener('change',e=>{const n=+e.target.value;if(n!==index)switchStation(n)});
  host.querySelector('[data-audio]').addEventListener('click',()=>{startSound();if(audio&&mode==='intro'){stop();updatePlayer();return;}if(s.introAudio)playLocal(s.introAudio,'intro')});host.querySelector('[data-ambience]').addEventListener('click',async()=>{
     if(mode==='ambient'){stop();updatePlayer();host.querySelector('.radio-audio-state').textContent='The room is quiet again.';return;}
     if(isMediaMuted()){host.querySelector('.radio-audio-state').textContent='Unmute sound at the top, then press play here.';return;}
     startSound();
     if(s.ambientAudio){playLocal(s.ambientAudio,'ambient');return;}
     stop();
     const ok=await atmosphere.start(s.id);
     if(disposed)return;
     mode=ok?'ambient':'';
     host.querySelector('.radio-audio-state').textContent=ok?'A little original ambience, made right here in your browser.':'This browser could not start its sound engine.';
     updatePlayer();
   });
  let startX=null;const radio=host.querySelector('.fm-radio');radio.addEventListener('pointerdown',e=>startX=e.clientX);radio.addEventListener('pointerup',e=>{if(startX===null)return;const diff=e.clientX-startX;startX=null;if(Math.abs(diff)>48)switchStation(index+(diff<0?1:-1))});
 }
 fetch('./content/radio.json').then(r=>{if(!r.ok)throw Error('Manifest missing');return r.json()}).then(data=>{if(disposed)return;stations=data.stations||[];const remember=stations.findIndex(s=>s.id===store.get('radioLastStation'));index=remember>=0?remember:0;render()}).catch(()=>{if(!disposed)host.innerHTML='<p class="fm-error">The station list got lost in the static. Please reload.</p>'});
 return ()=>{disposed=true;stop();document.removeEventListener('maha:mutechange',mute);host.classList.remove('radio-host');host.innerHTML=''};
}