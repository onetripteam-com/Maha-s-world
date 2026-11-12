/** HABIBII FM · Original offline atmospheric soundscapes.
 * Synthesized locally from filtered noise and very quiet oscillators.
 * Nothing copyrighted, downloaded, recorded, tracked or auto-played.
 */
const PROFILES={
 rain:{low:130,high:1400,noise:.34,hum:87,drift:.13},
 road:{low:80,high:510,noise:.23,hum:110,drift:.08},
 malayalam:{low:150,high:650,noise:.13,hum:146.83,drift:.05},
 chai:{low:300,high:2150,noise:.20,hum:196,drift:.12},
 night:{low:70,high:370,noise:.17,hum:82.41,drift:.03}
};
export function makeRadioAtmosphere(){
 let ac=null,source=null,filterLo=null,filterHi=null,master=null,hum=null,humGain=null,lfo=null,lfoGain=null,id=null,generation=0;
 const C=window.AudioContext||window.webkitAudioContext;
 const stop=()=>{
   generation++;
   try{source?.stop()}catch{}try{hum?.stop()}catch{}try{lfo?.stop()}catch{}
   for(const n of [source,filterLo,filterHi,master,hum,humGain,lfo,lfoGain])try{n?.disconnect()}catch{}
   source=filterLo=filterHi=master=hum=humGain=lfo=lfoGain=null;
   const old=ac;ac=null;id=null;old?.close().catch(()=>{});
 };
 const start=async station=>{
   stop();if(!C)return false;
   const ticket=generation;
   const profile=PROFILES[station]||PROFILES.night;
   try{
     ac=new C();const context=ac;await context.resume();
     // A station change can cancel a pending AudioContext resume on iOS.
     if(ticket!==generation)return false;
     const duration=ac.sampleRate*3;
     const buffer=ac.createBuffer(1,duration,ac.sampleRate),array=buffer.getChannelData(0);
     // Deterministic low-level noise prevents a short audible click at loop end.
     let seed=301+station.length*29;for(let i=0;i<duration;i++){
       seed=(seed*1664525+1013904223)>>>0;
       const ramp=Math.min(1,i/3200,(duration-i-1)/3200);
       array[i]=((seed/4294967295)*2-1)*Math.max(0,ramp);
     }
     source=ac.createBufferSource();source.buffer=buffer;source.loop=true;
     filterHi=ac.createBiquadFilter();filterHi.type='highpass';filterHi.frequency.value=profile.low;
     filterLo=ac.createBiquadFilter();filterLo.type='lowpass';filterLo.frequency.value=profile.high;
     master=ac.createGain();master.gain.value=0;master.connect(ac.destination);
     source.connect(filterHi).connect(filterLo).connect(master);
     hum=ac.createOscillator();hum.type='sine';hum.frequency.value=profile.hum;
     humGain=ac.createGain();humGain.gain.value=.004;
     hum.connect(humGain).connect(master);
     lfo=ac.createOscillator();lfo.type='sine';lfo.frequency.value=profile.drift;
     lfoGain=ac.createGain();lfoGain.gain.value=.004;
     lfo.connect(lfoGain).connect(master.gain);
     source.start();hum.start();lfo.start();
     master.gain.setTargetAtTime(Math.min(.05,profile.noise*.09),ac.currentTime,.45);
     id=station;
     return true;
   }catch{if(ticket===generation)stop();return false;}
 };
 return {start,stop,get active(){return id!==null},get station(){return id}};
}
