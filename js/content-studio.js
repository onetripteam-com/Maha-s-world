import {editableGroups,valueAt,updateTextAt,assertContentShape} from './studio-fields.js';
/**
 * MAHA Content Atelier. Client-side authoring only:
 * no network writes, accounts, telemetry or publishing permissions.
 * Export the validated JSON and deploy it through the existing reviewed workflow.
 */
const collections={
 today:{path:'content/today.json',title:'Daily notes',description:'Little notes for ordinary days.',fields:[]},
 letters:{path:'content/letters.json',title:'Letters',description:'The letter box, moods and special days.',fields:['title','preview','ps','malayalam']},
 flowers:{path:'content/flowers.json',title:'Flowers',description:'All thirteen original flower species and their meanings.',fields:['name','meaning','wittyMeaning','description','malayalam']},
 places:{path:'content/places.json',title:'Travel places',description:'Travel cards, postcards and dream destinations.',fields:['name','intro','phrase','translation','prompt']},
 radio:{path:'content/radio.json',title:'Radio',description:'The five stations and their written introductions.',fields:['name','intro','description','caption','blurb']},
 movies:{path:'content/movies.json',title:'Cinema',description:'Four illustrated films and their poster descriptions.',fields:['title','description','tagline','synopsis']},
 comfort:{path:'content/comfort.json',title:'Rest & comforts',description:'Warm suggestions, optional voice captions and rain copy.',fields:[]},
 hug:{path:'content/hug.json',title:'Opening copy',description:'Words in the original welcome experience.',fields:[]},
 config:{path:'content/config.json',title:'Site configuration',description:'Sender name, optional contact, and date settings.',fields:[]}
};
const $=selector=>document.querySelector(selector);
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const copy=x=>JSON.parse(JSON.stringify(x));
const view={category:'today',data:new Map(),original:new Map(),dirty:new Set(),query:'',visibleCount:12,fieldMap:new Map(),activePreview:null,history:new Map()};
const status=(s,isError=false)=>{const node=$('#studio-status');node.textContent=s;node.style.color=isError?'#a23d35':'#755c50';};
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const entriesFor=(kind,source)=>{
 if(kind==='today')return source;
 if(kind==='letters')return source.letters;
 if(kind==='flowers'||kind==='hug')return source;
 if(kind==='places')return source.places;
 if(kind==='radio')return source.stations;
 if(kind==='movies')return source.films;
 return null;
};
function validate(kind,doc){
 if(view.original.has(kind))assertContentShape(view.original.get(kind),doc);
 if(kind==='today' || kind==='flowers'){if(!Array.isArray(doc)||!doc.length)throw Error('This collection must remain a populated array.');}
 else if(!isObject(doc))throw Error('The collection must be a JSON object.');
 if(kind==='letters'&&!Array.isArray(doc.letters))throw Error('The letter list is missing.');
 if(kind==='places'&&!Array.isArray(doc.places))throw Error('The place list is missing.');
 if(kind==='radio'&&!Array.isArray(doc.stations))throw Error('The radio stations are missing.');
 if(kind==='movies'&&!Array.isArray(doc.films))throw Error('The cinema films are missing.');
 const old=entriesFor(kind,view.original.get(kind));
 const now=entriesFor(kind,doc);
 if(Array.isArray(old)&&Array.isArray(now)){
  if(now.length!==old.length)throw Error('Keep the '+old.length+' original entries. Add/remove content through a reviewed application update instead.');
  if(kind==='today'||kind==='hug'){if(!now.every(x=>typeof x==='string'||isObject(x)))throw Error('Invalid text entry.');}
  else if(old.every(x=>isObject(x)&&'id' in x)){
   const a=old.map(x=>x.id),b=now.map(x=>x?.id);
   if(a.some((id,i)=>id!==b[i])||new Set(b).size!==b.length)throw Error('Original IDs and entry order must be preserved.');
  }
 }
 const serialized=JSON.stringify(doc);
 if(!serialized||serialized.length>500000)throw Error('The content file is too large.');
 return true;
}
async function load(kind){
 if(view.data.has(kind))return;
 const cfg=collections[kind],response=await fetch('./'+cfg.path,{cache:'no-cache'});
 if(!response.ok)throw Error('Could not open '+cfg.path+' (HTTP '+response.status+'). Serve this project via HTTPS or a local HTTP server.');
 const data=await response.json();view.original.set(kind,copy(data));
 let draft=null;
 try{const saved=localStorage.getItem('maha.studio.draft.'+kind);if(saved)draft=JSON.parse(saved);}catch{}
 if(draft){try{validate(kind,draft);}catch{draft=null;}}
 view.data.set(kind,draft||data);
 if(draft)view.dirty.add(kind);
}
function save(kind){
 const key='maha.studio.draft.'+kind;
 const clean=JSON.stringify(view.data.get(kind))===JSON.stringify(view.original.get(kind));
 if(clean)view.dirty.delete(kind);else view.dirty.add(kind);
 document.querySelector('[data-category="'+kind+'"]')?.classList.toggle('has-draft',!clean);
 try{
  if(clean)localStorage.removeItem(key);
  else localStorage.setItem(key,JSON.stringify(view.data.get(kind)));
  return true;
 }catch{return false;}
}
function countChanged(kind){
 const original=view.original.get(kind),draft=view.data.get(kind);
 if(!original||!draft)return 0;
 return editableGroups(kind,draft).reduce((total,entry)=>total+entry.fields.filter(item=>valueAt(original,item.path)!==valueAt(draft,item.path)).length,0);
}
function rememberUndo(kind){
 if(!view.history.has(kind))view.history.set(kind,copy(view.data.get(kind)));
 $('#studio-undo').disabled=!view.history.has(kind);
}
function updatePreview(){
 const key=view.activePreview,selected=key&&view.fieldMap.get(key);
 const preview=$('#studio-preview');
 if(!selected){preview.hidden=true;return;}
 const kind=view.category,current=valueAt(view.data.get(kind),selected.path);
 const original=valueAt(view.original.get(kind),selected.path);
 preview.hidden=false;
 $('#studio-preview-title').textContent=selected.title+' · '+selected.label;
 $('#studio-preview-before').textContent=String(original??'');
 $('#studio-preview-after').textContent=String(current??'');
 $('#studio-preview-note').textContent=current===original?'Unchanged from the original.':'Local draft differs from the original.';
}
function displayRows(){
 const kind=view.category,doc=view.data.get(kind),root=$('#studio-entries');
 const groups=editableGroups(kind,doc);
 const query=view.query.trim().toLocaleLowerCase();
 const found=groups.map((entry,index)=>({...entry,index}))
  .filter(entry=>!query||[entry.title,entry.subtitle,...entry.fields.map(f=>f.value)].join(' ').toLocaleLowerCase().includes(query));
 $('#studio-count').textContent=found.length+' of '+groups.length+' entries';
 $('#studio-changed').textContent=countChanged(kind)+' text fields changed';
 $('#studio-undo').disabled=!view.history.has(kind);
 view.fieldMap=new Map();
 if(!found.length){
  root.innerHTML='<p class="studio-entry">No matching entries. Try a different search.</p>';
  $('#studio-show-more').hidden=true;view.activePreview=null;updatePreview();return;
 }
 const shown=found.slice(0,view.visibleCount);
 root.innerHTML=shown.map((entry,visibleIndex)=>{
  const fieldHTML=entry.fields.map((item,index)=>{
   const key=entry.index+'-'+index;
   view.fieldMap.set(key,{path:item.path,title:entry.title,label:item.label});
   const original=valueAt(view.original.get(kind),item.path);
   const changed=original!==item.value;
   const id='studio-edit-'+entry.index+'-'+index;
   const attr=kind==='today'?' data-index="'+entry.index+'"':'';
   return '<label for="'+id+'">'+esc(item.label)+(changed?' <span class="studio-field-modified">Edited</span>':'')+'</label>'+
    '<textarea id="'+id+'" data-edit-key="'+key+'"'+attr+' maxlength="12000" spellcheck="true" rows="'+(item.value.length>230?5:3)+'">'+esc(item.value)+'</textarea>';
  }).join('');
  const edits=entry.fields.filter(item=>valueAt(view.original.get(kind),item.path)!==item.value).length;
  return '<details class="studio-entry" data-entry="'+entry.index+'" '+(visibleIndex===0?'open':'')+'>'+
   '<summary><span><strong>'+esc(entry.title)+'</strong><small>'+esc(entry.subtitle)+'</small></span><span class="studio-entry-count" data-edit-count>'+edits+' changed</span></summary>'+
   '<div class="studio-entry-fields">'+fieldHTML+'</div></details>';
 }).join('');
 const remaining=found.length-view.visibleCount;
 $('#studio-show-more').hidden=remaining<=0;
 $('#studio-show-more').textContent='Show '+Math.min(12,remaining)+' more entries ('+remaining+' left)';
 if(!view.fieldMap.has(view.activePreview))view.activePreview=view.fieldMap.keys().next().value||null;
 updatePreview();
}
function refreshEditor(){
 const kind=view.category,cfg=collections[kind],data=view.data.get(kind);
 $('#studio-title').textContent=cfg.title;$('#studio-description').textContent=cfg.description;
 const pathIndicator=$('#studio-target-path');if(pathIndicator)pathIndicator.textContent=cfg.path;
 $('#studio-json').value=JSON.stringify(data,null,2);
 $('#studio-search').value=view.query;
 document.querySelectorAll('[data-category]').forEach(btn=>{
  btn.classList.toggle('has-draft',view.dirty.has(btn.dataset.category));if(btn.dataset.category===kind)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');});
 displayRows();
 status((view.dirty.has(kind)?'Local draft saved. ':'')+'Export JSON when ready. The website has not been changed.');
}
let navigationTicket=0;
async function navigate(kind){
 if(!collections[kind])return;
 const ticket=++navigationTicket;
 const config=collections[kind];
 view.category=kind;
 view.activePreview=null;
 view.fieldMap.clear();
 // Remove fields from the previous collection immediately, so a quick click
 // cannot accidentally edit or preview an unrelated collection.
 $('#studio-entries').innerHTML='<p class="studio-entry" role="status">Opening '+esc(config.title)+'…</p>';
 $('#studio-count').textContent='Loading…';
 $('#studio-preview').hidden=true;
 $('#studio-export').disabled=true;
 $('#studio-reset').disabled=true;
 $('#studio-apply').disabled=true;
 $('#studio-target-path').textContent=config.path;
 document.querySelectorAll('[data-category]').forEach(btn=>{
  if(btn.dataset.category===kind)btn.setAttribute('aria-current','page');
  else btn.removeAttribute('aria-current');
 });
 status('Opening '+config.title+'…');
 try{
  await load(kind);
  // Fetches may finish out of order. Only the most recent navigation may
  // replace the editor, preventing stale collection content from appearing.
  if(ticket!==navigationTicket)return;
  view.query='';
  view.visibleCount=12;
  refreshEditor();
  $('#studio-export').disabled=false;
  $('#studio-reset').disabled=false;
  $('#studio-apply').disabled=false;
 }catch(err){
  if(ticket!==navigationTicket)return;
  $('#studio-entries').innerHTML='<p class="studio-entry" role="alert">This collection could not be opened. Select it again to retry.</p>';
  status(err.message,true);
 }
}
$('#studio-nav').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b)navigate(b.dataset.category);});
$('#studio-entries').addEventListener('focusin',e=>{
 const key=e.target.dataset.editKey;
 if(key&&view.fieldMap.has(key)){view.activePreview=key;updatePreview();}
});
$('#studio-entries').addEventListener('input',e=>{
 const control=e.target,key=control.dataset.editKey,field=view.fieldMap.get(key);
 if(!field)return;
 const kind=view.category,doc=view.data.get(kind);
 rememberUndo(kind);
 updateTextAt(doc,field.path,control.value);
 const durable=save(kind);
 const changed=countChanged(kind);
 $('#studio-changed').textContent=changed+' text fields changed';
 const badge=control.closest('.studio-entry')?.querySelector('[data-edit-count]');
 if(badge){
  const group=editableGroups(kind,doc).find(entry=>entry.title===field.title);
  if(group)badge.textContent=group.fields.filter(item=>valueAt(view.original.get(kind),item.path)!==item.value).length+' changed';
 }
 $('#studio-json').value=JSON.stringify(doc,null,2);
 view.activePreview=key;updatePreview();
 status(durable?'Your draft is saved on this device. Export JSON when ready.':'Browser storage is unavailable. Export JSON now to avoid losing your changes.',!durable);
});
$('#studio-search').addEventListener('input',e=>{view.query=e.target.value;view.visibleCount=12;displayRows();});
$('#studio-show-more').addEventListener('click',()=>{view.visibleCount+=12;displayRows();});
$('#studio-undo').addEventListener('click',()=>{
 const kind=view.category,previous=view.history.get(kind);
 if(!previous)return;
 view.data.set(kind,previous);view.history.delete(kind);const durable=save(kind);refreshEditor();
 status(durable?'Reverted session edits. Your earlier local draft is preserved.':'Session edits reverted, but storage is blocked. Export JSON before closing.',!durable);
});
$('#studio-apply').addEventListener('click',()=>{
 try{const data=JSON.parse($('#studio-json').value);validate(view.category,data);rememberUndo(view.category);view.data.set(view.category,data);save(view.category);refreshEditor();status('JSON validated and applied to your local draft.');}
 catch(err){status('Could not apply JSON: '+err.message,true);}
});
$('#studio-export').addEventListener('click',()=>{
 try{
  const kind=view.category,doc=view.data.get(kind);validate(kind,doc);
  const blob=new Blob([JSON.stringify(doc,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=collections[kind].path.split('/').pop();document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  status('Validated JSON exported. Review the file before replacing the original in a private, tested deployment.');
 }catch(err){status('Export blocked: '+err.message,true);}
});
$('#studio-reset').addEventListener('click',()=>{
 if(!confirm('Discard the local changes to '+collections[view.category].title+' and restore the repository version?'))return;
 const kind=view.category;view.data.set(kind,copy(view.original.get(kind)));view.dirty.delete(kind);view.history.delete(kind);
 try{localStorage.removeItem('maha.studio.draft.'+kind);}catch{}
 refreshEditor();status('Local changes reverted. The deployed site was never modified.');
});
$('#studio-import').addEventListener('click',()=>$('#studio-file').click());
$('#studio-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  if(file.size>500000)throw Error('Choose a JSON file smaller than 500 KB.');
  const doc=JSON.parse(await file.text());validate(view.category,doc);
  rememberUndo(view.category);view.data.set(view.category,doc);save(view.category);refreshEditor();status('JSON imported and validated locally.');
 }catch(err){status('Import rejected: '+err.message,true);}
 finally{e.target.value='';}
});
navigate('today');
