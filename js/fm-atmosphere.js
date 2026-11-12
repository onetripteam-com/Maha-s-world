/** Locally synthesised sound beds. Never downloads tracks; only starts on tap. */
export class FMAtmosphere{
 constructor(frequency){this.key=String(frequency||'88.3');this.context=null;this.nodes=[];this.running=false;}
 play(){
  if(this.running)return;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw new Error('Audio unavailable');
  const c=this.context=new AC();void c.resume();this.running=true;
  const bus=c.createGain();bus.gain.value=.001;bus.connect(c.destination);bus.gain.setTargetAtTime(.40,c.currentTime,.75);this.bus=bus;
  const noise=c.createBuffer(1,c.sampleRate*3,c.sampleRate),data=noise.getChannelData(0);
  for(let i=0;i<data.length;i++){const r=Math.random()*2-1;data[i]=r*.32;}
  const source=c.createBufferSource();source.buffer=noise;source.loop=true;this.nodes.push(source);
  const low=c.createBiquadFilter(),soft=c.createGain();
  low.type='lowpass';low.frequency.value=({ '88.3':1250,'91.7':450,'94.5':880,'97.2':820,'103.1':300})[this.key]||900;
  soft.gain.value=({'88.3':.075,'91.7':.035,'94.5':.028,'97.2':.028,'103.1':.018})[this.key]||.025;
  source.connect(low).connect(soft).connect(bus);source.start();
  const frequencies=({'88.3':[174.61,220,261.63],'91.7':[130.81,164.81,196],'94.5':[146.83,185,220],'97.2':[196,246.94,293.66],'103.1':[110,146.83,164.81]})[this.key]||[174.61,220,261.63];
  frequencies.forEach((note,i)=>{
    const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type=i===0?'sine':'triangle';o.frequency.value=note/2;f.type='lowpass';f.frequency.value=410;
    g.gain.value=.0045/(i+1);o.connect(f).connect(g).connect(bus);o.start();this.nodes.push(o);
  });
  // Distinct atmospheres: rain detail, road-low drone, kettle warmth, or hushed night.
  if(this.key==='88.3'){
    const hi=c.createBiquadFilter(),rain=c.createGain();hi.type='highpass';hi.frequency.value=900;rain.gain.value=.015;source.connect(hi).connect(rain).connect(bus);
  }
  if(this.key==='91.7'){
    const drift=c.createOscillator(),depth=c.createGain();drift.frequency.value=.13;drift.type='sine';depth.gain.value=.008;drift.connect(depth).connect(soft.gain);drift.start();this.nodes.push(drift);
  }
 }
 stop(){if(!this.context)return;try{this.bus.gain.setTargetAtTime(0,this.context.currentTime,.05)}catch{}this.nodes.forEach(n=>{try{n.stop(this.context.currentTime+.13)}catch{}});const c=this.context;this.context=null;this.nodes=[];this.running=false;setTimeout(()=>c.close().catch(()=>{}),240)}
}