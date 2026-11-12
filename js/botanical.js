/* MAHA botanical atelier. One composition engine for picking, wrapping, PNG and room vase.
 * Every selected species stays visible as a separate focal bloom. Extra foliage and
 * tiny unopened buds are supporting greenery, not additional selected flowers.
 * Geometry follows a hand-tied spiral: dome-shaped canopy, one binding point. */
const COLORS={
 rose:['#b74f5c','#e38c8a','#f8d6be','#803c4b','#d9ae67'],
 daisy:['#e2d7ba','#fffdf2','#fffaf1','#c3b58d','#deb256'],
 sunflower:['#cc872e','#eab13c','#ffe28a','#a3652c','#5d4530'],
 tulip:['#bf5b59','#e78e80','#f6b9a6','#993f4d','#d9b066'],
 peony:['#c68191','#e6a8b0','#f8d3c5','#9f6079','#f0c47a'],
 lily:['#dac3a5','#f4dfbb','#fff3d6','#b9a08f','#aa643d'],
 orchid:['#a276a4','#c9a1c9','#efccdf','#835786','#bd776d'],
 lavender:['#746a9e','#9f90bc','#c7b5d8','#605a8c','#decba8'],
 jasmine:['#d0c8a9','#f2eed9','#fffff2','#aaa17c','#edca70'],
 marigold:['#ca8230','#e6aa44','#ffd272','#a16b37','#bc7427'],
 hibiscus:['#bd424e','#e46e6f','#f7aea0','#8d374b','#f3d367'],
 iris:['#71689f','#9f98c6','#c5b3d5','#574e8b','#ebbf72'],
 lotus:['#c47f95','#dfa8b2','#f4d4ce','#a15c79','#e4be7b']
};
const flowerSize={rose:63,daisy:54,sunflower:64,tulip:52,peony:73,lily:67,orchid:62,lavender:50,jasmine:51,marigold:54,hibiscus:66,iris:62,lotus:69};
let serial=0;
const n=(v)=>Number(v).toFixed(2);
const seedHash=s=>[...String(s)].reduce((a,c)=>(Math.imul(a,31)+c.charCodeAt(0))|0,987654321)>>>0;
const seeded=s=>{let x=seedHash(s);return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967295;};};
const path=(d,fill,stroke='',sw=1,more='')=>`<path d="${d}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="${sw}"`:''} ${more}/>`;
function defs(uid,id){
 const c=COLORS[id]||COLORS.rose;
 return `<defs>
  <radialGradient id="wash-${uid}" cx=".32" cy=".22" r=".92"><stop stop-color="${c[2]}"/><stop offset=".42" stop-color="${c[1]}"/><stop offset=".82" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[3]}"/></radialGradient>
  <linearGradient id="fold-${uid}" x1="0" y1="0" x2=".92" y2="1"><stop stop-color="${c[3]}" stop-opacity=".54"/><stop offset=".37" stop-color="${c[1]}" stop-opacity=".78"/><stop offset=".72" stop-color="${c[2]}"/><stop offset="1" stop-color="${c[0]}"/></linearGradient>
  <radialGradient id="center-${uid}" cx=".35" cy=".32" r=".8"><stop stop-color="${c[4]}"/><stop offset="1" stop-color="${c[3]}"/></radialGradient>
  <linearGradient id="green-${uid}" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#b4bc91"/><stop offset=".42" stop-color="#799977"/><stop offset="1" stop-color="#4d715a"/></linearGradient>
 </defs>`;
}
function petal(x,y,angle,l,w,uid,idx,{edge=true,heart=false}={}){
 const r=seeded(uid+idx);const skew=(r()-.5)*.13;
 const cp1=n(w*(.73+r()*.16)),cp2=n(w*(.86+r()*.25));
 const tip=n(-l*(.95+r()*.09));
 // A lobed, scalloped edge rather than a pointed clip-art triangle.
 const d=`M0 5 C ${-w*.38} ${-l*.2} ${-cp1} ${-l*.38} ${-cp2} ${-l*.61} Q ${-w*.87} ${-l*.83} ${-w*.4} ${tip} Q 0 ${tip-l*.07} ${w*.36} ${tip} Q ${w*.9} ${-l*.86} ${w*(.87+r()*.08)} ${-l*.63} C ${w*(.92+r()*.1)} ${-l*.37} ${w*.42} ${-l*.18} 0 5 Z`;
 const vein=`M0 1 Q${n((r()-.5)*w*.45)} ${n(-l*.48)} ${n(skew*w)} ${n(-l*.88)}`;
 return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(angle)})">${path(d,`url(#${idx%3?'wash':'fold'}-${uid})`,'#fff4e6',.85,'stroke-opacity=".32"')}${path(vein,'none','#fff8e9',1.5,'stroke-opacity=".24" stroke-linecap="round"')}${edge?path(`M${n(-w*.44)} ${n(-l*.93)} Q0 ${n(-l*1.035)} ${n(w*.38)} ${n(-l*.95)}`,'none','#fff4ea',1.4,'stroke-opacity=".35"'):''}</g>`;
}
function ring(count,radius,length,width,uid,layer=0,angle=0){
 let s='';for(let i=0;i<count;i++){
  const a=i*360/count+angle+(seeded(uid+i+layer)()-.5)*9,rd=a*Math.PI/180;
  const x=Math.sin(rd)*radius,y=-Math.cos(rd)*radius;
  s+=petal(x,y,a,length*(.92+(i%4)*.04),width*(.9+(i%3)*.08),uid,i+layer*33);
 }return s;
}
function center(uid,r=12,points=26){
 let s=`<circle r="${r}" fill="url(#center-${uid})"/>`;
 for(let i=0;i<points;i++){const a=i*2.399963,rad=Math.sqrt((i+.5)/points)*r*.92;s+=`<circle cx="${n(Math.cos(a)*rad)}" cy="${n(Math.sin(a)*rad)}" r="${n(.95+(i%3)*.4)}" fill="${i%3===0?'#f4d58e':'#73553c'}" opacity=".64"/>`;}
 return s;
}
function bloom(id,uid){
 const c=COLORS[id]||COLORS.rose;
 let s='';
 switch(id){
 case 'rose':
  s+=ring(8,16,44,18,uid,0,11)+ring(7,9,34,17,uid,1,26)+ring(5,3,25,14,uid,2,7);
  s+=`<path d="M-13 8Q-20-16-2-17Q17-18 16-2Q17 13 1 13Q-12 10-7-2Q0-11 8-5" fill="none" stroke="${c[3]}" stroke-width="3.9" opacity=".77" stroke-linecap="round"/><path d="M-9 3Q-4-12 9-5" stroke="${c[2]}" stroke-width="2" fill="none" opacity=".64"/>`;
  break;
 case 'peony':
  s+=ring(12,17,46,22,uid,0,3)+ring(10,11,36,19,uid,1,17)+ring(9,6,26,16,uid,2,7)+ring(6,2,17,11,uid,3,12)+center(uid,5,9);break;
 case 'sunflower':
  s+=ring(19,23,48,12,uid,0,7)+ring(20,19,39,10,uid,1,16);
  s+=`<circle r="25" fill="#614630" stroke="#b5833d" stroke-width="3"/>`+center(uid,21,98);break;
 case 'daisy':
  s+=ring(16,15,38,9.8,uid,0,7)+ring(15,13,33,9.2,uid,1,13)+center(uid,15,42);break;
 case 'tulip':
  s+=`<path d="M-31 4Q-38-19-23-48Q-12-39 0-47Q15-39 27-49Q41-18 29 8Q4 29-26 9Z" fill="url(#wash-${uid})" stroke="${c[3]}" stroke-width="1.5"/>`;
  s+=petal(-13,10,-17,50,17,uid,2)+petal(13,9,17,51,17,uid,3)+petal(0,15,1,48,15,uid,4);
  s+=`<path d="M-29 3Q0 19 29 3" fill="none" stroke="${c[3]}" stroke-width="2" opacity=".4"/>`;break;
 case 'lily':
  s+=ring(6,8,61,19,uid,0,8);
  s+=`<circle r="10" fill="#f6d2a6"/>`;
  for(let i=0;i<6;i++){const a=i*Math.PI/3,tx=Math.sin(a)*31,ty=-Math.cos(a)*31;s+=path(`M0 2 Q${n(tx*.25)} ${n(ty*.5)} ${n(tx)} ${n(ty)}`,'none','#996445',1.7)+`<ellipse cx="${n(tx)}" cy="${n(ty)}" rx="3.5" ry="6" transform="rotate(${n(i*60) } ${n(tx)} ${n(ty)})" fill="#b06d35"/>`;}break;
 case 'orchid':
  s+=petal(-21,4,-54,53,24,uid,1)+petal(21,4,54,53,24,uid,2)+petal(-17,-10,-29,49,24,uid,3)+petal(17,-10,29,49,24,uid,4)+petal(0,14,180,34,23,uid,5);
  s+=`<path d="M-19 10Q0-15 20 10Q11 34 0 24Q-11 33-19 10Z" fill="${c[2]}" stroke="${c[3]}" stroke-width="2"/><path d="M-10 11Q0 1 10 11Q5 22-5 22Z" fill="#b77570"/>`;break;
 case 'hibiscus':
  s+=ring(5,17,59,26,uid,0,3);
  s+=`<circle r="12" fill="#983846" opacity=".65"/><path d="M0 0Q17-6 37-35" fill="none" stroke="#bb494d" stroke-width="5" stroke-linecap="round"/>`;
  for(let i=0;i<9;i++){const x=24+(i%3)*6,y=-25-Math.floor(i/3)*7;s+=`<circle cx="${x}" cy="${y}" r="3.3" fill="#f8cd63"/>`;}break;
 case 'lotus':
  s+=ring(8,14,54,19,uid,0,3)+ring(8,8,41,17,uid,1,16)+ring(6,3,30,13,uid,2,15)+center(uid,8,17);break;
 case 'marigold':
  s+=ring(22,13,27,10,uid,0,4)+ring(18,8,21,10,uid,1,11)+ring(15,4,15,9,uid,2,19)+center(uid,6,14);break;
 case 'jasmine':
  s+=ring(8,7,36,13,uid,0,4)+ring(7,4,28,12,uid,1,19)+ring(5,2,17,9,uid,2,37)+center(uid,4,12);s+=`<g fill="#fffde9" stroke="#aaa98a" stroke-width="1"><ellipse cx="34" cy="27" rx="6" ry="10" transform="rotate(30 34 27)"/><ellipse cx="-30" cy="22" rx="5" ry="9" transform="rotate(-25 -30 22)"/></g>`;break;
 case 'lavender':
  s+=`<path d="M0 28Q-4-25 2-64" stroke="#769074" stroke-width="3.3" fill="none"/>`;
  for(let j=0;j<11;j++){const y=19-j*8,r=14-j*.45;s+=`<ellipse cx="${n(-r/2)}" cy="${y}" rx="${n(r*.8)}" ry="${n(5.8+j*.07)}" fill="${j%2?c[1]:c[0]}" stroke="${c[3]}" stroke-opacity=".3" transform="rotate(-35 ${n(-r/2)} ${y})"/><ellipse cx="${n(r/2)}" cy="${y-3}" rx="${n(r*.8)}" ry="${n(5.8+j*.07)}" fill="${j%2?c[0]:c[1]}" stroke="${c[3]}" stroke-opacity=".3" transform="rotate(35 ${n(r/2)} ${y-3})"/>`;}break;
 case 'iris':
  s+=petal(0,-2,0,57,19,uid,0)+petal(-13,4,-51,49,23,uid,1)+petal(13,4,51,49,23,uid,2)+petal(-15,17,-117,36,21,uid,3)+petal(15,17,117,36,21,uid,4);
  s+=`<path d="M-17 8Q0 23 17 8" stroke="${c[4]}" stroke-width="5" fill="none" stroke-linecap="round"/>`;break;
 }
 // Very fine, deliberately imperfect botanical contour and translucent shadow.
 return `${defs(uid,id)}<g class="bloom-paint"><circle cx="3" cy="4" r="${n((flowerSize[id]||62)*.64)}" fill="${c[0]}" opacity=".07"/>${s}</g>`;
}
function leafShape(x,y,angle,length=48,width=19,shade='#708c6c'){
 return `<g transform="translate(${n(x)} ${n(y)}) rotate(${angle})"><path d="M0 0Q${-width*.86} ${-length*.48} 0 ${-length}Q${width*1.13} ${-length*.53} 0 0Z" fill="${shade}" stroke="#4d6956" stroke-opacity=".5" stroke-width="1.6"/><path d="M0 0Q3 ${-length*.46} 0 ${-length*.91}" stroke="#d0d8aa" stroke-opacity=".63" stroke-width="1.35" fill="none"/></g>`;
}
const uid=()=>`m${++serial}`;
/** A centered, head-only specimen for small touch cards.
 * The original stem SVG uses a tall 150×216 artboard and was clipped
 * by the card's footer; an isolated blossom viewBox keeps every petal visible.
 */
export function flowerHeadSVG(id,klass=''){
 const species=Object.prototype.hasOwnProperty.call(COLORS,id)?id:'rose';
 const token=uid();
 return '<svg class="botanical flower-head-svg '+klass+'" viewBox="-90 -90 180 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+species+' flower"><g class="flower-head-paint">'+bloom(species,token)+'</g></svg>';
}
export function flowerSVG(id,klass=''){
 const idd=uid();
 return `<svg class="botanical ${klass}" viewBox="0 0 150 216" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${id} flower"><path d="M75 90Q61 146 79 212" stroke="#69845e" stroke-width="4.5" stroke-linecap="round" fill="none"/>${leafShape(72,158,-53,38,14)}${leafShape(78,177,44,33,13)}<g transform="translate(75 80) scale(.73)">${bloom(id,idd)}</g></svg>`;
}
/* The canopy is a compressed, gently asymmetrical florist's dome, not a horizontal row.
 * Larger flowers occupy the focal area; small varieties are raised for airy movement.
 * Sort by visual layer so the petals physically overlap. */
const SLOTS=[
 {x:150,y:266,s:.96,a:-13},
 {x:208,y:204,s:1.00,a:-8},
 {x:278,y:184,s:1.05,a:5},
 {x:353,y:222,s:.91,a:15},
 {x:383,y:283,s:.84,a:18},
 {x:269,y:286,s:1.04,a:2},
 {x:195,y:323,s:.88,a:-9}
];
const tieX=254,tieY=444;
function fillerSpray(x,y,angle,scale){
 let part=`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})"><path d="M0 48Q7 0 3-47M0 22Q-24-10-31-34M2 1Q24-22 28-43" stroke="#799477" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
 for(const [a,b,r] of [[3,-47,7],[-31,-34,6],[28,-43,7],[-17,-17,6],[18,-23,5],[-2,-13,6]]){
  part+=`<circle cx="${a}" cy="${b}" r="${r+1.5}" fill="#87997a" opacity=".8"/><circle cx="${a-1}" cy="${b-1.5}" r="${r*.76}" fill="#f4eee1"/><circle cx="${a+2}" cy="${b+1}" r="${r*.38}" fill="#d6bea6"/>`;
 }
 return part+'</g>';
}
function paperFold(){
 return `<g class="paper-fold">
 <path class="paper-back" d="M96 327Q122 341 155 344L251 433L346 342Q380 340 408 317L342 555Q270 583 191 554Z" fill="url(#kraftBack)" stroke="#c9af91" stroke-width="3"/>
 <path class="paper-left" d="M97 328Q135 368 257 437L224 563Q133 492 97 328Z" fill="url(#kraftLeft)" stroke="#bea58b" stroke-width="2.4"/>
 <path class="paper-right" d="M407 319Q361 370 254 438L293 566Q379 489 407 319Z" fill="url(#kraftRight)" stroke="#bea58b" stroke-width="2.4"/>
 <path class="paper-edge" d="M100 327Q174 387 253 438Q334 385 405 323" stroke="#faf1da" stroke-opacity=".6" stroke-width="3" fill="none"/>
 </g>`;
}
function ribbon(){
 return `<g class="ribbon-tie"><path d="M209 459Q249 472 298 453L291 478Q246 492 213 477Z" fill="url(#ribbon)"/><path d="M251 463Q206 419 188 447Q185 480 251 463Q300 418 322 442Q324 477 251 463Z" fill="#d28f80" stroke="#a86561" stroke-width="2.8"/><path d="M244 473L211 530L232 522L241 546L256 476M259 473L298 528L280 523L278 550L253 476" fill="#c77b72" stroke="#aa645d" stroke-width="2.4"/><ellipse cx="251" cy="466" rx="12" ry="10" fill="#ad625f"/><path d="M244 463Q251 457 260 466" fill="none" stroke="#e9b3a0" stroke-width="2"/></g>`;
}
function tag(){return `<g class="tag-write"><path d="M297 477L376 485L369 532L288 525Z" fill="#fff9eb" stroke="#af9581" stroke-width="2"/><path d="M291 486Q273 476 255 466" stroke="#aa8a74" stroke-width="2" fill="none"/><circle cx="301" cy="487" r="3.3" fill="#cfab82"/><text x="334" y="506" font-family="Georgia,serif" font-size="15.8" font-style="italic" text-anchor="middle" fill="#785b4b">For Maha</text><path d="M309 515Q335 523 352 515" stroke="#c99281" stroke-width="1.3" fill="none"/></g>`;}
function bouquetDefs(u){return `<defs>
 <linearGradient id="kraftBack" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f6e6d1"/><stop offset=".48" stop-color="#e8ccb0"/><stop offset="1" stop-color="#cbae91"/></linearGradient>
 <linearGradient id="kraftLeft" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f9efdf"/><stop offset=".55" stop-color="#e8d7c2"/><stop offset="1" stop-color="#c8b094"/></linearGradient>
 <linearGradient id="kraftRight" x1="1" y1="0" x2="0" y2="1"><stop stop-color="#fff8e8"/><stop offset=".57" stop-color="#f1dfc8"/><stop offset="1" stop-color="#cbb398"/></linearGradient>
 <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e3a394"/><stop offset="1" stop-color="#ad5d5e"/></linearGradient>
 </defs>`;}
/** Compact, gradient-petalled version of the same botanical artwork used in
 * the flower studio. This replaces the flat-icon flowerheads in photo rooms.
 * Each head still exposes data-species so saved bouquets remain inspectable.
 */
export function photoBloomHead(id,index=0){
 const species=Object.prototype.hasOwnProperty.call(COLORS,id)?id:'rose';
 const stamp='maha-photo-'+species+'-'+index;
 const angle=[-15,7,-4,11,-8,13,-7][index%7];
 const scale=species==='lavender'?.30:species==='sunflower'?.295:species==='peony'?.28:.30;
 return '<g data-species="'+species+'" transform="rotate('+angle+') scale('+scale+')">'+bloom(species,stamp)+'</g>';
}
export function bouquetMarkup(ids,{wrapped=false,stage='preview',vase=false,forExport=false}={}){
 const selected=Array.isArray(ids)?ids.slice(0,7):[];
 const u=uid();
 // Stem ends are deliberately splayed, whereas all stems cross once in the hand.
 const stems=selected.map((id,i)=>{
  const slot=SLOTS[i],lean=(i-3)*6;
  return `<path d="M${slot.x} ${slot.y+24}Q${n(slot.x+lean*.64)} ${n((slot.y+tieY)*.55)} ${tieX} ${tieY}Q${n(tieX+(i-3)*4)} 498 ${n(tieX+(i-3)*8)} 556" fill="none" stroke="${i%2?'#668864':'#59785b'}" stroke-width="${4.4+(i%3)*.5}" stroke-linecap="round"/>`;
 }).join('');
 const backLeaves=[
  leafShape(119,312,-64,88,26,'#718e74'),leafShape(173,318,-29,93,23,'#9eae83'),leafShape(226,295,-8,86,23,'#658767'),
  leafShape(300,306,21,88,24,'#8da17b'),leafShape(368,316,57,95,26,'#79936c'),leafShape(400,343,74,72,20,'#829b7c')
 ].join('');
 const frontLeaves=[leafShape(158,379,-76,72,24,'#628364'),leafShape(222,392,-29,61,20,'#9aaa87'),leafShape(299,398,41,68,23,'#708a6c'),leafShape(362,375,70,64,23,'#829b75')].join('');
 const filler=[fillerSpray(122,190,-24,.78),fillerSpray(356,171,16,.81),fillerSpray(108,308,-34,.71),fillerSpray(400,309,35,.74)].join('');
 // Stable DOM geometry lets all stems animate from dispersed positions to a single grip.
 const blooms=selected.map((id,i)=>{
  const slot=SLOTS[i],sz=flowerSize[id]||60;
  const factor=slot.s*(id==='lavender'?.92:1);
  const extra=(id==='lily'||id==='hibiscus')?0.92:1;
  return `<g class="bouquet-bloom bloom-${i}" style="--delay:${i*105}ms;--arrive-x:${n((slot.x-tieX)*.36)}px;--arrive-y:${n((slot.y-220)*.43+55)}px;--arrive-r:${n(slot.a*1.8)}deg" transform="translate(${slot.x} ${slot.y}) rotate(${slot.a}) scale(${n(factor*extra)})"><g class="bloom-motion">${bloom(id,`${u}-${i}`)}</g></g>`;
 }).join('');
 return `<svg class="bouquet-svg ${stage==='gather'?'is-gathering':''} ${vase?'in-vase':''} ${wrapped&&!vase?'is-wrapped':''}" viewBox="0 0 500 580" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bouquet made with ${selected.join(', ')}">
 ${bouquetDefs(u)}<g class="bouquet-botanical"><g class="stem-fan">${stems}</g><g class="foliage-behind">${backLeaves}${filler}</g><g class="flower-fan">${blooms}</g><g class="foliage-front">${frontLeaves}</g></g>${wrapped&&!vase?`${paperFold()}${ribbon()}${tag()}`:''}
 </svg>`;
}
export function exportBouquetSVG(ids){
 const art=bouquetMarkup(ids,{wrapped:true,stage:'final',forExport:true}).replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><defs><radialGradient id="printPaper"><stop stop-color="#fff9ee"/><stop offset="1" stop-color="#ead9c3"/></radialGradient></defs><rect width="1080" height="1350" fill="url(#printPaper)"/><rect x="56" y="56" width="968" height="1238" rx="25" fill="#f9f0e4" stroke="#dac4ad" stroke-width="3"/><g opacity=".19"><circle cx="198" cy="248" r="163" fill="#f3af9b"/><circle cx="863" cy="371" r="190" fill="#b9c7ae"/></g><text x="540" y="146" font-family="Georgia,serif" fill="#806555" font-size="28" letter-spacing="7" text-anchor="middle">MAHA'S SEVEN FLOWERS</text><g transform="translate(105 120) scale(1.72)">${art}</g><text x="540" y="1235" font-family="Georgia,serif" fill="#9c665d" font-size="37" font-style="italic" text-anchor="middle">Just because.</text></svg>`;
}
export async function downloadBouquet(ids){
 const svg=exportBouquetSVG(ids),url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'})),im=new Image();
 try{
  await new Promise((res,rej)=>{im.onload=res;im.onerror=rej;im.src=url;});
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');ctx.drawImage(im,0,0);
  const png=await new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(Error('PNG export blocked')),'image/png'));
  const link=URL.createObjectURL(png);const a=document.createElement('a');a.href=link;a.download='for-maha-seven-flowers.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(link),30000);return true;
 }finally{URL.revokeObjectURL(url);}
}