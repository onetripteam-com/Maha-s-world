import {store} from './store.js';

const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const getArray=key=>{const value=store.get(key,[]);return Array.isArray(value)?value:[];};
export function keepsakeItems(){
 const items=[];
 const flowers=getArray('flowers');
 if(flowers.length===7)items.push({type:'flowers',icon:'✿',title:'The seven flowers',detail:'Your bouquet of '+flowers.map(x=>escapeHTML(x)).join(', ')+'.'});
 const letters=getArray('keptLetters');
 if(letters.length)items.push({type:'letters',icon:'✉',title:'Letters worth keeping',detail:letters.length+' '+(letters.length===1?'letter':'letters')+' saved in your letter box.'});
 if(String(store.get('futureNote','')||'').trim())items.push({type:'note',icon:'♡',title:'A note for another day',detail:'Your private future note is tucked into Letters.'});
 const stamps=getArray('passportStamps');
 if(stamps.length)items.push({type:'stamps',icon:'✦',title:'Passport of discoveries',detail:stamps.length+' '+(stamps.length===1?'stamp':'stamps')+' from postcards and play.'});
 const visited=getArray('visitedPlaces');
 if(visited.length)items.push({type:'postcards',icon:'⌖',title:'Postcards you kept',detail:visited.map(x=>escapeHTML(x)).join(' · ')});
 const dreams=getArray('dreamPins');
 if(dreams.length)items.push({type:'dreams',icon:'☼',title:'Places for someday',detail:dreams.slice(-6).map(x=>escapeHTML(x?.name||'Somewhere')).join(' · ')});
 const wins=store.get('gameCompletions',{});
 if(wins&&typeof wins==='object'&&!Array.isArray(wins)){
  const list=Object.entries(wins).filter(([,won])=>won===true).map(([id])=>escapeHTML(id));
  if(list.length)items.push({type:'arcade',icon:'♢',title:'Small arcade victories',detail:list.length+' games completed: '+list.join(', ')+'.'});
 }
 const memories=store.get('travelJournal',{});
 if(memories&&typeof memories==='object'&&!Array.isArray(memories)){
  const saved=Object.values(memories).filter(x=>x&&typeof x.note==='string'&&x.note.trim());
  if(saved.length)items.push({type:'journal',icon:'❧',title:'Your travel journal',detail:saved.length+' personal '+(saved.length===1?'page':'pages')+' waiting in Travel.'});
 }
 return items;
}
export function mountKeepsakeCollection(host){
 host.innerHTML='<section class="keepsake-collection" aria-labelledby="keepsake-title"><span class="room-eyebrow">THE LITTLE THINGS THAT LAST</span><h3 id="keepsake-title">A room full of <em>stories.</em></h3><p>Everything here comes from experiences you have actually saved in this browser. There is no streak or deadline.</p><div class="keepsake-collection-grid" data-keepsakes></div><p class="keepsake-privacy">Private to this browser. Back up your keepsakes before clearing browser data.</p></section>';
 const grid=host.querySelector('[data-keepsakes]');
 const items=keepsakeItems();
 if(!items.length){grid.innerHTML='<p class="keepsake-empty">Your room has a little space for stories yet to come. No rush.</p>';return;}
 // All user-sourced values are escaped in keepsakeItems before insertion.
 grid.innerHTML=items.map(item=>'<article class="keepsake-tile"><span class="keepsake-tile-icon" aria-hidden="true">'+item.icon+'</span><div><strong>'+item.title+'</strong><p>'+item.detail+'</p></div></article>').join('');
}
