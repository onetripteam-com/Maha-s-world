/**
 * MAHA Content Studio field index.
 * Pure functions: no network, storage, DOM, or mutation of original content.
 * Deliberately exposes only human-facing copy; gameplay IDs and media metadata stay untouched.
 */
const field=(doc,path,label)=>{
 const value=path.reduce((obj,key)=>obj?.[key],doc);
 return typeof value==='string'?{path,label,value}:null;
};
const picks=(doc,base,labels)=>labels.map(([key,label])=>field(doc,[...base,key],label)).filter(Boolean);
const arrayTexts=(doc,base,array,label)=>Array.isArray(array)?
 array.map((value,i)=>typeof value==='string'?field(doc,[...base,i],label+' '+(i+1)):null).filter(Boolean):[];
const group=(title,subtitle,fields)=>({title:String(title||'Entry'),subtitle:String(subtitle||''),fields:fields.filter(Boolean)});

export function editableGroups(kind,doc){
 const result=[];
 if(kind==='today'&&Array.isArray(doc)){
  doc.forEach((value,i)=>result.push(group('Daily note '+String(i+1).padStart(2,'0'),'Message '+(i+1),[field(doc,[i],'Message')])));
 }else if(kind==='letters'&&Array.isArray(doc?.letters)){
  doc.letters.forEach((entry,i)=>{
   const base=['letters',i];
   const fields=[
    ...picks(doc,base,[['title','Envelope title'],['preview','Envelope preview']]),
    ...arrayTexts(doc,[...base,'pages'],entry.pages,'Page')
   ];
   result.push(group(entry.title||'Letter '+(i+1),entry.section||'Letter',fields));
  });
 }else if(kind==='flowers'&&Array.isArray(doc)){
  doc.forEach((flower,i)=>{
   const fields=picks(doc,[i],[['name','Flower name'],['meaning','Meaning'],['description','Description']]);
   result.push(group(flower.name||'Flower '+(i+1),'Flower · '+(flower.id||i+1),fields));
  });
 }else if(kind==='places'&&Array.isArray(doc?.places)){
  const top=field(doc,['caption'],'Travel introduction');
  if(top)result.push(group('Travel desk introduction','Collection copy',[top]));
  doc.places.forEach((place,i)=>result.push(group(place.name||'Travel stop '+(i+1),'Postcard · '+(place.id||i+1),
   picks(doc,['places',i],[['name','Place name'],['intro','Postcard message'],['phrase','Local phrase'],['translation','Translation'],['prompt','Vlog prompt']]))));
 }else if(kind==='radio'&&Array.isArray(doc?.stations)){
  const notice=field(doc,['notice'],'Radio notice');
  if(notice)result.push(group('Station desk','General copy',[notice]));
  doc.stations.forEach((station,i)=>result.push(group(station.name||'Station '+(i+1),'HABIBII FM · '+(station.id||i+1),
   picks(doc,['stations',i],[['name','Station name'],['tagline','Tagline'],['introCaption','Introduction']]))));
 }else if(kind==='movies'&&Array.isArray(doc?.films)){
  doc.films.forEach((movie,i)=>{
   const base=['films',i];
   const fields=picks(doc,base,[['title','Film title'],['eyebrow','Poster heading'],['tag','Film tagline']]);
   if(Array.isArray(movie.shots))movie.shots.forEach((shot,j)=>{
    fields.push(...picks(doc,[...base,'shots',j],[['title','Scene '+(j+1)+' title'],['caption','Scene '+(j+1)+' caption']]));
   });
   result.push(group(movie.title||'Film '+(i+1),'Cinema · '+(movie.id||i+1),fields));
  });
 }else if(kind==='comfort'&&doc&&typeof doc==='object'){
  for(const [key,title] of [['shows','Comfort shows'],['snacks','Comfort snacks'],['songs','Comfort songs']]){
   if(Array.isArray(doc[key]))result.push(group(title,'Rest room',arrayTexts(doc,[key],doc[key],'Suggestion')));
  }
  if(doc.voice&&typeof doc.voice==='object'){
   const voice=field(doc,['voice','caption'],'Voice caption');
   if(voice)result.push(group('A gentle voice','Rest room',[voice]));
  }
 }else if(kind==='hug'&&doc&&typeof doc==='object'){
  for(const [key,title] of [['opening','Opening messages'],['no','No-hug responses']]){
   if(Array.isArray(doc[key]))result.push(group(title,'Welcome',arrayTexts(doc,[key],doc[key],'Message')));
  }
  const labels={
   yes:'Hug accepted',closing:'No-hug closing',next:'Next chapter',
   yesButton:'Yes button',noButton:'No button',flowerButton:'Flower button',
   hugPrompt:'Hug prompt',eyebrow:'Postcard eyebrow',heroFirst:'Hero first line',heroSecond:'Hero second line',
   heroEmphasis:'Hero emphasized text',illustrationCaption:'Illustration caption',
   actionQuestion:'Action question',footnote:'Footnote',finalQuestion:'Final question',
   lastNoButton:'Last response button'
  };
  const fields=picks(doc,[],Object.entries(labels));
  if(fields.length)result.push(group('Other welcome copy','Greeting & buttons',fields));
 }else if(kind==='config'&&doc&&typeof doc==='object'){
  result.push(group('Site identity','Configuration',picks(doc,[],[
   ['senderName','Sender display name'],['writeBackSubject','Write-back subject']
  ])));
 }
 return result.filter(x=>x.fields.length);
}
export function valueAt(doc,path){
 return path.reduce((value,key)=>value?.[key],doc);
}
export function updateTextAt(doc,path,nextValue){
 if(!Array.isArray(path)||!path.length||path.some(k=>typeof k!=='string'&&(!Number.isInteger(k)||k<0)))throw Error('Invalid edit path.');
 const current=valueAt(doc,path);
 if(typeof current!=='string')throw Error('This field is not editable text.');
 const parent=valueAt(doc,path.slice(0,-1));
 parent[path.at(-1)]=String(nextValue);
}
export function assertContentShape(original,updated,path='content'){
 if(Array.isArray(original)){
  if(!Array.isArray(updated)||original.length!==updated.length)throw Error(path+': entry count changed.');
  original.forEach((value,i)=>assertContentShape(value,updated[i],path+'['+i+']'));
  return;
 }
 if(original===null){
  if(updated!==null&&typeof updated!=='string')throw Error(path+': unsupported media value.');
  return;
 }
 if(typeof original==='object'){
  if(!updated||typeof updated!=='object'||Array.isArray(updated))throw Error(path+': expected an object.');
  const keys=Object.keys(original);
  if(keys.length!==Object.keys(updated).length||keys.some(k=>!Object.prototype.hasOwnProperty.call(updated,k)))throw Error(path+': fields were added or removed.');
  for(const key of keys){
   if(['id','schemaVersion','version'].includes(key)&&updated[key]!==original[key])throw Error(path+'.'+key+': identity must stay unchanged.');
   assertContentShape(original[key],updated[key],path+'.'+key);
  }
  return;
 }
 if(typeof updated!==typeof original||(typeof original==='number'&&!Number.isFinite(updated))){
  throw Error(path+': field type changed.');
 }
 if(typeof updated==='string'&&updated.length>12000)throw Error(path+': text is too long.');
}
