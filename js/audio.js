import {store} from './store.js';
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let context, master, tick, active=false, chordIndex=0;
const chords=[[220,277.18,329.63],[196,246.94,293.66],[174.61,220,261.63],[196,261.63,329.63]];
let muted=store.get('muted',true) === true;
function init() {
  if(!AudioContextClass) return false;
  if(!context) { context=new AudioContextClass(); master=context.createGain(); master.gain.value=0; master.connect(context.destination); }
  if(context.state==='suspended') context.resume().catch(()=>{});
  return true;
}
function tone(frequency,at,length,volume=0.015,type='sine',channel='ambient') {
  if(!context||!master) return;
  const oscillator=context.createOscillator(),envelope=context.createGain();
  oscillator.type=type; oscillator.frequency.setValueAtTime(frequency,at);
  envelope.gain.setValueAtTime(0.00001,at);
  envelope.gain.exponentialRampToValueAtTime(Math.max(volume*(Number(store.get(channel==='effects'?'effectsVolume':'ambientVolume',65))/65),0.00001),at+Math.min(length*0.34,1.25));
  envelope.gain.exponentialRampToValueAtTime(0.00001,at+length);
  oscillator.connect(envelope).connect(master); oscillator.start(at);oscillator.stop(at+length+0.04);
  oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect();};
}
function pad() {
  if(!context || muted || document.hidden) return;
  let at=context.currentTime+0.03;
  const notes=currentPlace==='room'?chords[chordIndex%chords.length].map(f=>f/2):PLACE_INTERVALS[currentPlace].map(r=>({room:110,paper:146.83,radio:98,cinema:87.31,travel:130.81,arcade:164.81,rest:87.31,garden:110}[currentPlace]||110)*r);
  notes.forEach((f,i)=>tone(f,at+i*0.08,7.5,currentPlace==='arcade'?.055:.09,'sine'));
  chordIndex++;
}
function updateButton() {
  const b=document.querySelector('#sound-toggle'); if(!b)return;
  b.setAttribute('aria-pressed',String(muted)); b.setAttribute('aria-label',muted?'Unmute sound':'Mute sound');
  b.querySelector('span').textContent=muted?'♩':'♫'; b.classList.toggle('is-muted',muted);
}
export function startSound(){ if(active||muted||!init())return;active=true;master.gain.setTargetAtTime(0.15,context.currentTime,0.6);pad();tick=setInterval(pad,6200); }
export function soundEffect(kind='tap') {
  if(muted||!active||!context||context.state!=='running') return;
  const now=context.currentTime;
  const sets={tap:[[440,0],[659,.09]],pick:[[523,0],[659,.09],[784,.2]],undo:[[523,0],[349,.12]],complete:[[392,0],[523,.15],[659,.3],[784,.5]],door:[[349,0],[440,.13]],arcade:[[523,0],[784,.08],[1046,.16]],coin:[[784,0],[523,.09],[392,.19]],pour:[[293.66,0],[329.63,.09]],correct:[[523,0],[659,.09],[784,.2]],wrong:[[311,0],[244,.16]],alarm:[[220,0],[176,.1],[220,.2],[176,.3]]};
  (sets[kind]||sets.tap).forEach(([n,d])=>tone(n,now+d,0.28,0.055,'sine','effects'));
}
export function initAudioUI() {
  updateButton();
  document.querySelector('#sound-toggle')?.addEventListener('click',()=>{
    muted=!muted;store.set('muted',muted); updateButton();document.dispatchEvent(new CustomEvent('maha:mutechange',{detail:{muted}}));
    if(muted){ if(master&&context)master.gain.setTargetAtTime(0,context.currentTime,0.05); }
    else {if(!active)startSound();else if(master&&context)master.gain.setTargetAtTime(ducked?.035:0.15,context.currentTime,0.15); soundEffect('tap');}
  });
  document.addEventListener('visibilitychange',()=>{if(!master||!context)return;master.gain.setTargetAtTime((document.hidden||muted)?0:(ducked?.035:0.15),context.currentTime,0.16);});
}

// The place changes its ambient voicing; nothing plays until a real user gesture.
let currentPlace='room';
const PLACE_INTERVALS={room:[1,1.25,1.5],paper:[1,1.333,1.666],radio:[1,1.2,1.5],cinema:[1,1.25,1.75],travel:[1,1.333,1.5],arcade:[1,1.5,2],rest:[1,1.25,1.5],garden:[1,1.2,1.6]};
export function setAudioPlace(place='room'){
 currentPlace=PLACE_INTERVALS[place]?place:'room';
 if(!context||muted||!active||document.hidden)return;
 const root={room:196,paper:220,radio:164.81,cinema:146.83,travel:196,arcade:246.94,rest:174.61,garden:220}[currentPlace];
 const now=context.currentTime+.07;
 PLACE_INTERVALS[currentPlace].forEach((ratio,i)=>tone(root*ratio,now+i*.12,2.7,currentPlace==='rest'?.015:.025,'sine'));
}

/** Clip playback softens the locally synthesized pad; single-media arbiter owns pause. */
let ducked=false;
export function setAudioDucked(value){ducked=Boolean(value);if(master&&context&&!muted)master.gain.setTargetAtTime(ducked?.035:.15,context.currentTime,.12);}
export function radioStatic(){
 if(muted||!active||!context||!master||context.state!=='running')return;
 const length=.18,sample=context.sampleRate,buffer=context.createBuffer(1,Math.floor(sample*length),sample),data=buffer.getChannelData(0);
 for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
 const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;gain.gain.value=.095;source.connect(gain).connect(master);source.start();source.onended=()=>{source.disconnect();gain.disconnect()};
}

export function setAudioLevels(){ /* Gains are read on every new voice. */ }
