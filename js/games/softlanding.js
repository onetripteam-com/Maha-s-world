/* A gentle interactive choose-your-own-comfort game.
 * All outcomes are valid, no timed pressure, no tracking of mood.
 */
const screens=[
 {title:"What kind of tiny escape sounds good?",subtitle:"No diagnosing the day. Just pick a little door.",choices:[["🌙","Something quiet"],["🎈","Something silly"],["🧳","Somewhere else"],["🧸","Something soft"]]},
 {title:"Choose your pocket-sized companion.",subtitle:"There is no correct answer. Not even a secretly correct one.",choices:[["🐈","A cat with zero responsibilities"],["🌻","A sunflower on your side"],["☁️","A cloud on leave"],["🦦","An otter with snacks"]]},
 {title:"One last thing for the road?",subtitle:"You may take the whole day at your own speed.",choices:[["🎶","A favourite song"],["🍪","A biscuit, obviously"],["💌","A note from a friend"],["✨","A little bit of magic"]]}
];
const endings=[
 "You are officially allowed to be unavailable for five minutes. The world can file a complaint.",
 "A tiny celebration has been scheduled in your honour. Dress code: whatever is comfortable.",
 "Your imaginary boarding pass says: destination, somewhere kind. No packing required.",
 "Soft landing approved. Nothing to prove, nothing to catch up on in this little moment."
];
export function start(host,{onFinish,sound,isPaused}){
 let step=0,chosen=[],stopped=false;
 function paint(){
  if(stopped)return;
  const s=screens[step];
  host.innerHTML='<section class="pocket-game"><span class="pocket-step">POCKET SUNSHINE · '+(step+1)+' / 3</span><div class="pocket-sky" aria-hidden="true">☁️　✦　☀️</div><h2>'+s.title+'</h2><p>'+s.subtitle+'</p><div class="pocket-choices">'+s.choices.map((c,i)=>'<button type="button" data-choice="'+i+'"><span>'+c[0]+'</span>'+c[1]+'</button>').join('')+'</div><span class="pocket-small">No timer. No wrong choices. Just a little detour.</span></section>';
  host.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{if(stopped||isPaused())return;chosen.push(Number(b.dataset.choice));sound('pick');step++;if(step<screens.length)paint();else{const lines=[screens[0].choices[chosen[0]][1],screens[1].choices[chosen[1]][1],screens[2].choices[chosen[2]][1]];onFinish({won:true,score:100,description:endings[chosen[0]]+' Your pocket holds '+lines.join(', ').toLowerCase()+'.'});}}));
 }
 paint();return {stop(){stopped=true}};
}
