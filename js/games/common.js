/** Tiny game utilities; no dependencies and all clock advancement stops when paused. */
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function ticker(ctx,fn){
 let id=0,last=0,live=true;
 const loop=t=>{if(!live)return;const delta=last?Math.min((t-last)/1000,.06):0;last=t;if(!ctx.isPaused())fn(delta);id=requestAnimationFrame(loop)};
 id=requestAnimationFrame(loop);
 return ()=>{live=false;cancelAnimationFrame(id)};
}
export function finishOnce(ctx,id,getResult){let finished=false;return ()=>{if(finished)return;finished=true;ctx.onFinish({...getResult(),id});};}
export function listen(target,event,fn,opts){target.addEventListener(event,fn,opts);return ()=>target.removeEventListener(event,fn,opts)}