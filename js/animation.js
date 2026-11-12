const reduce=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export function move(element,from,to,duration=600,options={}){
 if(!element)return Promise.resolve();
 if(reduce()) { Object.assign(element.style,to); return Promise.resolve(); }
 if(window.gsap) { return new Promise(resolve=>{window.gsap.fromTo(element,from,{...to,duration:duration/1000,ease:options.ease||'power2.out',onComplete:resolve});}); }
 const anim=element.animate([from,to],{duration,fill:'forwards',easing:options.easing||'cubic-bezier(.22,.78,.21,1)'});
 return anim.finished.catch(()=>{}).then(()=>{Object.assign(element.style,to);anim.cancel();});
}
export const delay=ms=>new Promise(res=>setTimeout(res,reduce()?Math.min(ms,80):ms));
export {reduce};
