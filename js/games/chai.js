import {ticker,clamp,esc} from './common.js';
let running=null;
export function start(root,ctx){
 stop();let stage='milk',milk=0,boil=0,beat=0,hold=false,done=false,score=0,elapsed=0,spices=0,ignoreClickUntil=0;
 const TARGET=68;
 root.innerHTML=`<div class="mini-game chai-game"><div class="game-kicker">THE CHAAYA DEPARTMENT <span>01 / 03</span></div><h2>One perfectly dramatic chai.</h2><p class="game-direction" id="chai-message">Hold the button. Stop pouring at the dotted line.</p>
 <div class="chai-stage"><div class="chai-steam">⌇ &nbsp;⌇ &nbsp;⌇</div><div class="chai-glass"><div class="chai-liquid" id="chai-liquid"></div><span class="chai-target" aria-hidden="true"></span></div><div class="chai-gauge"><span>0</span><div class="chai-gauge-track"><div id="chai-meter"></div><i></i></div><span>100%</span></div></div>
 <div class="chai-steps"><span class="is-on">1. POUR</span><span>2. BOIL</span><span>3. SPICES</span></div>
 <div class="chai-beat" id="chai-beat" hidden><div class="beat-track"><span id="beat-dot"></span><i></i></div><span>Hit the golden beat, not your phone.</span></div>
 <div class="chai-action-row"><button class="game-big-button" id="chai-action" type="button">HOLD TO POUR ☕</button></div><p class="game-micro" id="chai-progress">The aunties are observing. Naturally.</p></div>`;
 const action=root.querySelector('#chai-action'),meter=root.querySelector('#chai-meter'),liquid=root.querySelector('#chai-liquid'),message=root.querySelector('#chai-message'),progress=root.querySelector('#chai-progress'),beatEl=root.querySelector('#chai-beat');
 const steps=[...root.querySelector('.chai-steps').children];
 const step=(next,body)=>{stage=next;steps.forEach((el,i)=>el.classList.toggle('is-on',i==={milk:0,boil:1,ginger:2,cardamom:2}[next]));message.textContent=body;};
 const complete=()=>{if(done)return;done=true;hold=false;stopClock();progress.textContent='The verdict is in. Please maintain a straight face.';ctx.onFinish(result())};
 const miss=()=>{if(stage==='milk'){hold=false;score+=Math.max(0,Math.round(37-Math.abs(TARGET-milk)*1.25));step('boil','Watch the bubbles. Tap at the amber boil mark (roughly 72%).');action.textContent='STOP THE BOIL ●';ctx.sound('tap');}
 else if(stage==='boil'){score+=Math.max(0,Math.round(36-Math.abs(72-boil)*1.08));step('ginger','Ginger first! Tap when the bouncing dot meets the gold line.');action.textContent='ADD GINGER ✧';beatEl.hidden=false;ctx.sound('tap');}
 else if(stage==='ginger'||stage==='cardamom'){const distance=Math.abs(beat-72);score+=Math.max(0,Math.round(14-distance*.37));spices++;ctx.sound(distance<17?'correct':'tap');if(stage==='ginger'){step('cardamom','Cardamom next. Yes, there is an exam for spices now.');action.textContent='ADD CARDAMOM ✿';}else complete();}}
 const down=e=>{if(ctx.isPaused()||done||stage!=='milk')return;hold=true;action.setPointerCapture?.(e.pointerId);action.classList.add('is-held');ctx.sound('pour')};
 const up=e=>{if(!hold)return;hold=false;ignoreClickUntil=performance.now()+220;action.classList.remove('is-held');if(!ctx.isPaused())miss()};
 action.addEventListener('pointerdown',down);action.addEventListener('pointerup',up);action.addEventListener('pointercancel',up);
 action.addEventListener('click',e=>{if(ctx.isPaused()||done||stage==='milk'||performance.now()<ignoreClickUntil)return;miss()});
 const stopClock=ticker(ctx,dt=>{if(done)return;elapsed+=dt;if(elapsed>=72){complete();return;}if(stage==='milk'){if(hold){milk=clamp(milk+dt*23,0,100);meter.style.width=`${milk}%`;liquid.style.height=`${milk}%`;progress.textContent=`${Math.round(milk)}% milk · target ${TARGET}%`;if(milk>=100){hold=false;miss();}}}
 else if(stage==='boil'){boil=clamp(boil+dt*14,0,100);meter.style.width=`${boil}%`;progress.textContent=`Boiling ${Math.round(boil)}%`;if(boil>=100)miss();}
 else{beat=(beat+dt*105)%100;root.querySelector('#beat-dot').style.left=`${beat}%`;progress.textContent=`Spices added: ${spices}/2`;}});
 running={stop(){hold=false;stopClock();},result:()=>({id:'chai',score:Math.round(score),maxScore:101,won:score>=60,description:score>=87?'Five stars. Auntie has asked for the recipe.':score>=60?'Quite lovely. Someone still said “a little less milk.”':'Customer review: chai has personality. We respect that.',duration:Math.round(elapsed)})};
 return running;
}
export function stop(){running?.stop();running=null;}
export function result(){return running?.result()||null;}