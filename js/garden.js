/** MAHA — A Little Escape · original, device-only generative letter garden. */
import {store} from './store.js';
import {soundEffect} from './audio.js';
import {kuwaitParts} from './time.js';
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const colorways={
 marigold:{ground:'#f7efd9',stem:'#5b8563',leaf:'#8ca482',flower:'#dfa443',shadow:'#ae775a',ink:'#465a45'},
 peony:{ground:'#fff0e7',stem:'#6c8d65',leaf:'#a3b28b',flower:'#d78e91',shadow:'#aa7075',ink:'#66554b'},
 mint:{ground:'#eaf3e3',stem:'#557c67',leaf:'#83aa93',flower:'#e5ae8f',shadow:'#ab8976',ink:'#426658'},
 saffron:{ground:'#faf0d6',stem:'#608259',leaf:'#9aab79',flower:'#c97a51',shadow:'#a05b45',ink:'#605044'},
 monsoon:{ground:'#e1eddf',stem:'#527a67',leaf:'#789b83',flower:'#bd715a',shadow:'#8f5e56',ink:'#465c50'}
};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const ease=t=>{t=clamp(t,0,1);return 1-Math.pow(1-t,3)};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const MAX=48;
const DEFAULTS={name:'MAHA',dream:'',release:''};
const itemsText={name:'A name with roots.',dream:'A someday place worth keeping.',release:'No need to carry every thought around.'};
const descriptions={name:'Type any name. Watch it bloom, one letter at a time.',dream:'A destination becomes a tiny forest. Keep it on the Travel map if you like.',release:'Write what you want to put down. Then let the little leaves take it away.'};
// Small deterministic seeds make a glyph's floral ornament its own, even across redraws.
const seedFor=(s,i)=>((s.codePointAt(0)||65)*17+i*91)%997;
function drawPetals(c,x,y,r,fill,shadow,seed,alpha=1){
 c.save();c.globalAlpha*=alpha;
 for(let j=0;j<5;j++){const a=(j*2*Math.PI/5)+seed/150;c.save();c.translate(x,y);c.rotate(a);c.fillStyle=fill;c.strokeStyle=shadow;c.lineWidth=.65;c.beginPath();c.ellipse(0,-r*.60,r*.34,r*.72,0,0,Math.PI*2);c.fill();c.stroke();c.restore()}
 c.fillStyle='#f9e5aa';c.beginPath();c.arc(x,y,Math.max(1.8,r*.18),0,Math.PI*2);c.fill();c.restore();
}
/** Draw a single serif glyph with a physically connected curling stem. */
function paintGlyph(c,plant,x,y,scale,p,now,opts={}){
 const elapsed=now-plant.birth,progress=reduced()?1:ease(elapsed/740);
 const dying=plant.death!=null?clamp((now-plant.death)/700,0,1):0;
 if(dying>=1)return;
 const strength=(1-dying)*progress;
 const swaying=reduced()?0:Math.sin(now/1350+plant.seed*.14)*1.2*strength;
 const h=58*strength,base=8;
 c.save();c.translate(x+swaying+dying*11,y+dying*28);c.rotate(dying*.43);c.scale(scale*(1-dying*.58),scale*(1-dying*.58));c.globalAlpha*=1-dying*.68;
 c.lineCap='round';c.lineJoin='round';c.strokeStyle=dying?mix(p.stem,'#a68b72',dying):p.stem;c.lineWidth=2.45;
 // Grow the stem *out of* the upper terminal of its letter, never as a separate icon.
 c.beginPath();c.moveTo(0,base-13);c.bezierCurveTo(-8,base-25,9,base-h*.65,0,base-h);c.stroke();
 c.fillStyle=dying?'#a99b77':p.leaf;
 for(let j=0;j<2;j++){
  const side=j?1:-1,hy=base-h*(.33+j*.34),size=(j?11:13)*strength;
  c.beginPath();c.moveTo(side,hy+2);c.quadraticCurveTo(side*size*.82,hy-10*strength,side*size,hy-12*strength);c.quadraticCurveTo(side*size*.28,hy-15*strength,side,hy+2);c.fill();
 }
 // The glyph is the pot/base for the flower: letterform + botanical terminal remain connected.
 c.fillStyle=p.ink;c.textAlign='center';c.textBaseline='alphabetic';c.font=`${35*clamp(progress,.65,1)}px Georgia, 'Iowan Old Style', serif`;
 c.fillText(plant.char,0,base+16);
 drawPetals(c,0,base-h,17*strength,dying>0.05?mix(p.flower,'#a99076',dying):p.flower,p.shadow,plant.seed);
 c.restore();
}
function mix(a,b,t){const parse=v=>[1,3,5].map(i=>parseInt(v.slice(i,i+2),16));const x=parse(a),y=parse(b);return '#'+x.map((v,i)=>Math.round(v*(1-t)+y[i]*t).toString(16).padStart(2,'0')).join('')}
function gardenLayout(plants,width,height){
 const step=42,gap=29,margin=19,usable=Math.max(150,width-margin*2),perLine=Math.max(4,Math.floor(usable/step));
 let line=0,column=0;const items=[];
 // Spaces make real gaps. Longer words move to the next botanical row.
 for(const plant of plants){
  if(plant.char===' '){column+=1.15;if(column>=perLine){line++;column=0}items.push(null);continue;}
  if(column>=perLine){line++;column=0}
  items.push({line,column});column++;
 }
 const rows=Math.max(1,line+1),rowHeight=Math.min(101,Math.max(57,(height-110)/rows));
 const extents=Array.from({length:rows},()=>0);
 for(const pos of items)if(pos)extents[pos.line]=Math.max(extents[pos.line],pos.column+1);
 const usedHeight=(rows-1)*rowHeight,firstY=(height-usedHeight)/2+9;
 return items.map(pos=>pos?{x:width/2+(pos.column-(extents[pos.line]-1)/2)*step,y:firstY+pos.line*rowHeight}:null);
}
function backdrop(c,w,h,p,now,staticDraw){
 c.fillStyle=p.ground;c.fillRect(0,0,w,h);
 const haze=c.createRadialGradient(w*.30,h*.12,0,w*.30,h*.12,h*.85);haze.addColorStop(0,'#fffdf4cb');haze.addColorStop(1,'#fffdf400');c.fillStyle=haze;c.fillRect(0,0,w,h);
 // Delicate flowerbed illustration under all alphabet plants.
 c.strokeStyle=p.stem;c.globalAlpha=.20;c.lineWidth=1;
 for(let j=0;j<12;j++){const x=20+j*w/11,hh=h-23-(j*17)%28;c.beginPath();c.moveTo(x,h);c.quadraticCurveTo(x+5,hh+5,x-2,hh);c.stroke()}
 c.globalAlpha=1;c.fillStyle=p.ink;c.textAlign='center';c.font='italic 13px Georgia,serif';c.fillText('a little space for things to grow',w/2,h-18);
}
function paint(c,w,h,plants,p,now){
 backdrop(c,w,h,p,now);
 const positions=gardenLayout(plants,w,h);
 plants.forEach((plant,i)=>{const point=positions[i];if(point&&plant.char!==' ')paintGlyph(c,plant,point.x,point.y,1,p,now)});
}
function persistDream(name){const prev=Array.isArray(store.get('dreamPins'))?store.get('dreamPins'):[];
 if(prev.length>=25)return 'The atlas is full of beautiful maybes (25 pins).';
 if(prev.some(d=>d.name.toLowerCase()===name.toLowerCase()))return 'Already pinned! The map remembers.';
 const i=prev.length;prev.push({name,note:'Planted in Maha’s word garden.',x:15+(i*27)%69,y:18+(i*19)%67,createdAt:new Date().toISOString()});store.set('dreamPins',prev);return 'A little pin is waiting in Travel ♡';
}
export function mountGarden(host){
 host.classList.add('garden-host');let disposed=false,mode='name',theme=store.get('gardenPalette','marigold');if(!colorways[theme])theme='marigold';
 let oldText=DEFAULTS.name,plants=[],ghosts=[],raf=0,resizeRaf=0,resizeObserver=null,sweepTimer=0,lastWidth=0,lastHeight=0,context,canvas,field,stage;
 host.innerHTML=`<section class="wordgarden" aria-label="Grow words into a flower garden">
 <header class="wg-heading"><span class="wg-kicker">THE LITTLE WORD GARDEN · ORIGINAL BOTANICAL TYPE</span><h1>Whatever you type, <em>grows.</em></h1></header>
 <div class="wg-prompts" role="group" aria-label="Garden prompts">
 <button data-mode="name" aria-pressed="true">Type your name</button><button data-mode="dream" aria-pressed="false">Where to next?</button><button data-mode="release" aria-pressed="false">Let it go</button></div>
 <p class="wg-hint" id="wg-hint">${descriptions.name}</p>
 <div class="wg-canvas-wrap" id="wg-canvas-wrap"><canvas id="wg-canvas" aria-label="Illustrated flowers growing from each typed letter"></canvas><button class="wg-focus" id="wg-focus" type="button">✎ Tap here to type · backspace makes flowers wither</button><textarea id="wg-input" class="wg-hidden-input" rows="1" spellcheck="true" autocomplete="off" autocapitalize="sentences" aria-label="Words for the garden; use your keyboard to type" maxlength="${MAX}"></textarea></div>
 <div class="wg-word" aria-live="polite"><span id="wg-visible-word">MAHA</span><small>✿ grown from your letters</small></div>
 <div class="wg-bottom"><div class="wg-palette" aria-label="Garden colors">${Object.keys(colorways).map(k=>`<button type="button" data-palette="${k}" aria-pressed="${k===theme}" title="${k}"><span style="background:${colorways[k].flower}"></span><small>${k}</small></button>`).join('')}</div>
 <div class="wg-actions"><button type="button" data-dream-save hidden>♡ Pin in Travel</button><button type="button" data-release hidden>Let the letters go ↝</button><button type="button" data-export>↓ Save wallpaper</button></div><p class="wg-status" role="status" id="wg-status"></p></div>
 </section>`;
 canvas=host.querySelector('canvas');context=canvas.getContext('2d');stage=host.querySelector('#wg-canvas-wrap');field=host.querySelector('#wg-input');
 const status=host.querySelector('#wg-status'),word=host.querySelector('#wg-visible-word');
 function newPlant(char,i){return {char,birth:performance.now(),death:null,seed:seedFor(char,i)}}
 plants=oldText.split('').map(newPlant);plants.forEach(p=>p.birth-=800);
 function updateText(text){
  text=text.replace(/[\r\n]/g,'').slice(0,MAX);if(text===oldText)return;
  const stamp=performance.now();let prefix=0;
  while(prefix<Math.min(oldText.length,text.length)&&oldText[prefix]===text[prefix])prefix++;
  // Keep matched suffix glyphs in place for iOS autocorrect replacements.
  let suffix=0;while(suffix<Math.min(oldText.length,text.length)-prefix&&oldText[oldText.length-1-suffix]===text[text.length-1-suffix])suffix++;
  plants.forEach((p,i)=>{if(i>=prefix&&i<oldText.length-suffix&&p.death===null)p.death=stamp});
  const prefixPart=plants.slice(0,prefix),suffixPart=suffix?plants.slice(oldText.length-suffix,oldText.length):[];
  const removed=plants.slice(prefix,oldText.length-suffix).filter(p=>p.death!=null);
  const inserted=text.slice(prefix,text.length-suffix).split('').map((ch,i)=>newPlant(ch,prefix+i));
  // Removed characters remain as transient ghost plants for the full 700ms wither.
  ghosts.push(...removed);plants=[...prefixPart,...inserted,...suffixPart];oldText=text;word.textContent=text||'…';
  host.querySelector('[data-dream-save]').hidden=mode!=='dream'||!text.trim();
  host.querySelector('[data-release]').hidden=mode!=='release'||!text.trim();
  status.textContent='';if(text.trim())soundEffect('pick');
 }
 function switchMode(value){mode=value;clearTimeout(sweepTimer);ghosts=[];host.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===value)));
  const text=DEFAULTS[value];oldText=text;plants=text.split('').map(newPlant);field.value=text;word.textContent=text||'…';host.querySelector('#wg-hint').textContent=descriptions[value];
  host.querySelector('[data-dream-save]').hidden=value!=='dream'||!text;
  host.querySelector('[data-release]').hidden=value!=='release'||!text;
  status.textContent=itemsText[value];soundEffect('tap');
 }
 const vv=window.visualViewport;
 function resize(){if(disposed)return;const rect=stage.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,2);
  // The keyboard can reduce visualViewport.height without changing layout viewport in Safari.
  const visibleBottom=vv?vv.offsetTop+vv.height:innerHeight;
  const room=Math.max(155,visibleBottom-rect.top-12);
  const ideal=clamp(host.clientHeight*.42,180,420);
  stage.style.height=Math.min(room,ideal)+'px';
  const width=Math.max(1,stage.clientWidth),height=Math.max(1,stage.clientHeight);
  if(width===lastWidth&&height===lastHeight)return;lastWidth=width;lastHeight=height;
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=width+'px';canvas.style.height=height+'px';context.setTransform(dpr,0,0,dpr,0,0);
 }
 function tick(now){if(disposed)return;ghosts=ghosts.filter(p=>now-p.death<700);
  paint(context,lastWidth,lastHeight,[...plants,...ghosts],colorways[theme],now);
  raf=requestAnimationFrame(tick);
 }
 function clearSweep(kind){
  const now=performance.now();const text=oldText;oldText='';field.value='';word.textContent='…';
  const living=plants.filter(p=>p.death===null);living.forEach((p,i)=>{p.death=now+(reduced()?0:i*62)});ghosts.push(...living);plants=[];
  host.querySelector('[data-dream-save]').hidden=true;host.querySelector('[data-release]').hidden=true;
  if(kind==='release'){sweepTimer=setTimeout(()=>{if(disposed)return;status.textContent='That can stay here for a while. You don’t have to hold it all.';},(reduced()?100:living.length*62)+720)}
  else status.textContent='Fresh soil. Start again whenever.';
 }
 function exportWallpaper(){
  const w=1179,h=2556,off=document.createElement('canvas');off.width=w;off.height=h;const c=off.getContext('2d');const p=colorways[theme];
  c.fillStyle=p.ground;c.fillRect(0,0,w,h);const haze=c.createRadialGradient(320,230,0,500,400,1250);haze.addColorStop(0,'#ffffffa6');haze.addColorStop(1,'#ffffff00');c.fillStyle=haze;c.fillRect(0,0,w,h);
  c.fillStyle=p.ink;c.textAlign='center';c.font='31px Georgia,serif';c.fillText('MAHA’S LITTLE WORD GARDEN',w/2,225);
  const living=plants.filter(p=>p.death===null&&p.char!=='\n');
  c.save();c.translate(65,890);c.scale(2.1,2.1);paint(c,w/2.1,h/3.1,living,p,performance.now()+1500);c.restore();
  c.fillStyle=p.ink;c.font='italic 38px Georgia,serif';c.fillText(oldText||'A quiet patch of earth.',w/2,2025,1060);
  const d=kuwaitParts().date;c.font='25px Georgia,serif';c.fillText('GROWN IN KUWAIT TIME · '+d,w/2,2375);
  const a=document.createElement('a');a.download='maha-word-garden-wallpaper.png';a.href=off.toDataURL('image/png');document.body.append(a);a.click();a.remove();status.textContent='Wallpaper ready. On iPhone, save the image to Photos if it opens in a new tab.';
 }
 const onInput=()=>{if(field.value.includes('\n')){clearSweep();return}updateText(field.value)};
 const onBefore=e=>{if(e.inputType==='insertParagraph'||e.inputType==='insertLineBreak'){e.preventDefault();clearSweep()}};
 const onKeys=e=>{if(e.key==='Enter'){e.preventDefault();clearSweep()}};
 const focus=()=>{field.focus({preventScroll:true})};
 field.addEventListener('input',onInput);field.addEventListener('beforeinput',onBefore);field.addEventListener('keydown',onKeys);
 host.querySelector('#wg-focus').addEventListener('click',focus);canvas.addEventListener('click',focus);
 host.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>switchMode(b.dataset.mode)));
 host.querySelectorAll('[data-palette]').forEach(b=>b.addEventListener('click',()=>{theme=b.dataset.palette;store.set('gardenPalette',theme);host.querySelectorAll('[data-palette]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));soundEffect('tap')}));
 host.querySelector('[data-dream-save]').addEventListener('click',()=>{if(mode==='dream'&&oldText.trim()){status.textContent=persistDream(oldText.trim().slice(0,55));soundEffect('complete')}});
 host.querySelector('[data-release]').addEventListener('click',()=>clearSweep('release'));
 host.querySelector('[data-export]').addEventListener('click',exportWallpaper);
 const scheduleResize=()=>{if(disposed||resizeRaf)return;resizeRaf=requestAnimationFrame(()=>{resizeRaf=0;resize()})};
 if(typeof ResizeObserver!=='undefined'){resizeObserver=new ResizeObserver(scheduleResize);resizeObserver.observe(host)}
 vv?.addEventListener('resize',scheduleResize);vv?.addEventListener('scroll',scheduleResize);window.addEventListener('resize',scheduleResize);
 resize();raf=requestAnimationFrame(tick);
 return ()=>{disposed=true;cancelAnimationFrame(raf);cancelAnimationFrame(resizeRaf);resizeObserver?.disconnect();clearTimeout(sweepTimer);vv?.removeEventListener('resize',scheduleResize);vv?.removeEventListener('scroll',scheduleResize);window.removeEventListener('resize',scheduleResize);host.innerHTML='';host.classList.remove('garden-host')};
}
