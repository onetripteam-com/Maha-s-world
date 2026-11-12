/** Responsive integration QA: a real HTTP site, actual Chromium + WebKit engines. */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {join,resolve,extname} from 'node:path';
import {chromium,webkit} from 'playwright';
const ROOT=resolve('.'),OUT=join(ROOT,'qa','screenshots');
await mkdir(OUT,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.vtt':'text/vtt'};
const server=createServer(async(req,res)=>{
 let raw;try{raw=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return}
 const path=resolve(ROOT,'.'+(raw==='/'?'/index.html':raw));
 if(!path.startsWith(ROOT+'/')&&path!==ROOT){res.writeHead(403);res.end();return}
 try{const bytes=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(bytes)}
 catch{res.writeHead(404);res.end('not found')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const BASE='http://127.0.0.1:'+server.address().port+'/';
const sizes=[[360,740],[393,852],[402,874],[768,1024],[1280,720],[1440,900],[1674,843],[1920,1080]];
const reports=[];let failed=0;
async function run(engine,launcher,w,h){
 const browser=await launcher.launch({headless:true});
 const context=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:engine==='webkit'&&w<760,hasTouch:w<760,reducedMotion:'reduce'});
 await context.addInitScript(()=>{
  localStorage.setItem('maha.escape.v1.completed','true');
  localStorage.setItem('maha.escape.v1.flowers',JSON.stringify(Array(7).fill('rose')));
  localStorage.setItem('maha.escape.v1.visits','3');
 });
 const page=await context.newPage(),errors=[],missing=[];
 page.setDefaultTimeout(12000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(BASE)&&r.status()>=400)missing.push(r.url()+':'+r.status())});
 const key=`${engine}-${w}x${h}`;
 try{
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  await page.locator('.room-scene.new-home').waitFor({timeout:16000});
  assert.ok(await page.locator('.room-heading h1').isVisible());
  assert.equal(await page.locator('[data-door]').count(),7);
  assert.ok(await page.locator('.living-photo-plane .living-photo-image').isVisible(),'Exact original image must be mounted in the live room');
  assert.equal((await page.request.get(new URL('./assets/rooms/maha-kuwait.webp',BASE).href)).status(),200,'New Kuwait photograph must be stored locally');
  await page.waitForFunction(()=>{
   const img=document.querySelector('.living-photo-plane .living-photo-image');
   return img?.getAttribute('src')?.endsWith('/maha-kuwait.webp')&&img.complete&&img.naturalWidth>=1600;
  },null,{timeout:16000});
  assert.equal(await page.locator('.cinematic-room').getAttribute('data-kuwait-photo'),'ready','Live Kuwait scene must use the approved image');
  const photoLayers=await page.locator('.living-photo-plane').evaluate(plane=>({
   oldPlantLayers:plane.querySelectorAll('.living-leaf-sway').length,
   oldCurtainDisplay:getComputedStyle(plane,'::before').display,
   oldCurtainContent:getComputedStyle(plane,'::before').content,
   activePhoto:plane.querySelector('.living-photo-image')?.getAttribute('src')
  }));
  assert.equal(photoLayers.oldPlantLayers,0,'No old-photo leaf mirror may sit over the Kuwait plant');
  assert.ok(photoLayers.oldCurtainDisplay==='none'||photoLayers.oldCurtainContent==='none',
   'Photo-backed curtain cutout must be absent: '+JSON.stringify(photoLayers));
  assert.ok(photoLayers.activePhoto.endsWith('/maha-kuwait.webp'));

  assert.equal(await page.locator('.living-photo-plane .living-hit-area').count(),8,'All seven physical objects plus the real vase must share the same image plane');
  if(w<760){
    assert.ok(await page.locator('#room-pan-left').isVisible());
    assert.ok(await page.locator('#room-pan-right').isVisible());
    const origin=await page.locator('.living-photo-plane').evaluate(el=>getComputedStyle(el).transform);
    await page.locator('#room-pan-right').click();
    await page.waitForFunction(origin=>getComputedStyle(document.querySelector('.living-photo-plane')).transform!==origin,origin,{timeout:3000});
    const after=await page.locator('.living-photo-plane').evaluate(el=>getComputedStyle(el).transform);
    assert.notEqual(origin,after,'Photo should pan when tapping a direction arrow');
    await page.waitForTimeout(440);
    await page.locator('#room-pan-left').click();
    await page.waitForTimeout(440);
  }


  assert.equal(await page.locator('#room-light-trigger').count(),1);
  assert.equal(await page.locator('#room-visit-label').count(),1);
  assert.ok((await page.locator('#room-welcome').innerText()).trim().length>4);

  assert.ok(await page.locator('.identity-flower').isVisible(),'Signature original flower mark must be visible');
  assert.ok(await page.locator('#room-welcome').isVisible(),'Visit-aware welcome must be visible');
  assert.ok(await page.locator('#room-light-trigger').isVisible(),'Room light must sit in the header');
  assert.ok(await page.locator('#sound-toggle').evaluate(el=>el.parentElement===document.querySelector('.app-header')));
  assert.ok(await page.locator('#room-light-trigger').evaluate(el=>el.parentElement?.parentElement===document.querySelector('.app-header')),'Scenes and lighting must be next to sound');
  await page.locator('#room-light-trigger').click();
  await page.locator('[data-light-option="night"]').click();
  assert.equal(await page.locator('.cinematic-room').getAttribute('data-light'),'night','Selecting a light mood must change the real room');
  await page.locator('#room-light-trigger').click();
  await page.locator('[data-light-option="auto"]').click();

  const artManifestResponse=await page.request.get(new URL('./assets/rooms/originals/manifest.json',BASE).href);
  assert.equal(artManifestResponse.status(),200);
  const artManifest=await artManifestResponse.json();
  const variant=w<760?'portrait':'wide';
  const original=artManifest?.scenes?.story?.[variant]===true;
  if(original)await page.waitForFunction(()=>document.querySelector('.cinematic-room')?.dataset.originalArt==='true',{timeout:15000});


  assert.equal(await page.locator('.room-object .physical-object-art').count(),7,'Every scene portal must contain physical art');
  assert.equal(await page.locator('.table-bouquet .real-vase').count(),1,'Bouquet must live in a physical vase');
  assert.ok(await page.locator('.object-movies').isVisible(),'The cinema remains a reachable scene hotspot');
  assert.ok(await page.locator('#room-bouquet').isVisible(),'Photographed vase must remain interactive');
  const gardenSpacing=await page.locator('.living-photo-plane').evaluate(plane=>{
    const g=plane.querySelector('[data-door="garden"]').getBoundingClientRect();
    const v=plane.querySelector('#room-bouquet').getBoundingClientRect();
    const flowers=plane.querySelector('.photographed-vase-flowers').getBoundingClientRect();
    return {gardenBottom:g.bottom,vaseTop:v.top,flowersTop:flowers.top};
  });
  assert.ok(gardenSpacing.gardenBottom+16<gardenSpacing.flowersTop,
    'Word Garden hotspot must be on high leaves, not over the flowers: '+JSON.stringify(gardenSpacing));
  assert.ok(gardenSpacing.gardenBottom+32<gardenSpacing.vaseTop,
    'Word Garden and the real vase must have distinct hit areas: '+JSON.stringify(gardenSpacing));
  if(w>=760){
    await page.locator('[data-door="garden"]').hover();
    const tip=await page.locator('[data-door="garden"] .object-label').evaluate(el=>{
      const r=el.getBoundingClientRect(),s=getComputedStyle(el);
      return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,
        display:s.display,visibility:s.visibility,opacity:s.opacity,position:s.position};
    });
    // CSS intentionally keeps the label at opacity:0 outside hover/focus.
    // Pointer emulation can drop :hover between layout frames; the actual
    // regression here is positioning, not momentary visibility.
    assert.ok(tip.display!=='none'&&tip.position==='absolute'&&
      tip.bottom+10<gardenSpacing.flowersTop&&tip.top<gardenSpacing.gardenBottom,
      'Garden hint must be anchored by upper indoor leaves, never by bouquet: '+JSON.stringify({tip,gardenSpacing}));
    await page.mouse.move(0,0);
  }
  if(w===1440){
    await page.waitForFunction(()=>document.querySelector('.cinematic-room')?.dataset.originalArt==='false');
    assert.ok(await page.locator('.photographed-vase-flowers .photo-blooms').isVisible(),'Seven flowers must grow from photographed vase opening');
    const pot=await page.locator('#room-bouquet').evaluate(el=>{const b=el.getBoundingClientRect(),r=el.closest('.inhabited-room').getBoundingClientRect();return {x:(b.left+b.width/2-r.left)/r.width,y:(b.top+b.height/2-r.top)/r.height};});
    assert.ok(pot.x>.45&&pot.x<.65&&pot.y>.45&&pot.y<.92,'Vase must appear over the actual coffee-table vessel');
  }

  const sticker=await page.locator('.object-movies .object-drawing').evaluate(el=>getComputedStyle(el).display);
  assert.equal(sticker,'none','Avoid pasted-on cartoon art over photographic backgrounds');
  if(w<760){
    assert.ok(await page.locator('#room-pan-left').isVisible(),'The room needs simple navigation arrows');
    assert.ok(await page.locator('#room-pan-right').isVisible(),'The room needs simple navigation arrows');
    await page.locator('#room-pan-right').click();
    await page.waitForFunction(()=>document.querySelector('.cinematic-room')?.dataset.peek==='2');
    await page.waitForTimeout(420);
    await page.locator('#room-pan-left').click();
    await page.waitForFunction(()=>document.querySelector('.cinematic-room')?.dataset.peek==='1');
    await page.waitForTimeout(420);
    await page.locator('#room-pan-left').click();
    await page.waitForFunction(()=>document.querySelector('.cinematic-room')?.dataset.peek==='0');
    await page.waitForTimeout(420);
    await page.locator('#room-pan-right').click();
    await page.waitForFunction(()=>document.querySelector('.cinematic-room')?.dataset.peek==='1');
    await page.waitForTimeout(420);
  }

  if(engine==='chromium'&&w===393){
   await page.emulateMedia({reducedMotion:'no-preference'});
   const duration=await page.locator('.living-photo-plane').evaluate(el=>getComputedStyle(el).transitionDuration);
   assert.equal(duration,'0s','Mobile finger tracking must not have a lagging CSS transition');
   const hotspot=await page.locator('#room-bouquet').boundingBox();
   assert.ok(hotspot&&hotspot.width>15,'Photographed vase must have a physical touch target');
   const x=hotspot.x+hotspot.width*.5,y=hotspot.y+hotspot.height*.37;
   const first=await page.locator('.cinematic-room').evaluate(el=>Number.parseFloat(el.style.getPropertyValue('--photo-pan-px'))||0);
   await page.mouse.move(x,y);
   await page.mouse.down();
   await page.mouse.move(x-93,y,{steps:17});
   await page.waitForTimeout(40);
   const tracking=await page.locator('.cinematic-room').evaluate(el=>Number.parseFloat(el.style.getPropertyValue('--photo-pan-px'))||0);
   assert.ok(Math.abs(tracking-first)>35,'Dragging from a physical room object should move the photograph immediately');
   await page.mouse.up();
   await page.waitForTimeout(470);
   assert.ok(await page.locator('.new-home').isVisible(),'Horizontal swiping must not open the flower portal');
   await page.emulateMedia({reducedMotion:'reduce'});
  }
  assert.equal(await page.locator('.photographed-vase-flowers .photo-flower-heads g[data-species]').count(),7,'Seven selected blooms must appear in the original vase');
  assert.equal(await page.locator('.photographed-vase-flowers svg image').count(),0,
    'Photo-backed flowers must NEVER draw a second photograph of the vase mouth');
  assert.equal(await page.locator('.photographed-vase-flowers svg defs clipPath ellipse').count(),0,
    'Photo-backed flowers must not render a second dark oval vase rim');
  assert.equal(await page.locator('.photographed-vase-flowers svg #maha-stem-neck').count(),1,
    'Only an invisible stem-length boundary is allowed');
  assert.equal(await page.locator('#room-bouquet .real-vase').isVisible(),false,
    'The original photographed ceramic must not have a second synthetic vase on top');
  assert.ok(await page.locator('#room-bouquet').isVisible(),
    'Hiding duplicate vase artwork must not disable the bouquet hotspot');
  // Test the actual SVG rim point in photo coordinates, not only flower count.
  // The Kuwait ceramic mouth is centred at ~830,582 in 1672×941 artwork.
  const seated=await page.locator('.photographed-vase-flowers').evaluate(el=>{
    const svg=el.querySelector('svg');
    const pt=svg.createSVGPoint();pt.x=82;pt.y=108;
    const screen=pt.matrixTransform(svg.getScreenCTM());
    const plane=el.closest('.living-photo-plane').getBoundingClientRect();
    return {x:(screen.x-plane.left)/plane.width,y:(screen.y-plane.top)/plane.height,scene:el.dataset.spriteScene};
  });
  assert.equal(seated.scene,'kuwait','New Kuwait photo must use its own rim compositing');
  assert.ok(Math.abs(seated.x-830/1672)<.013&&Math.abs(seated.y-582/941)<.018,
    'Live flower stems must meet the real Kuwait vase mouth: '+JSON.stringify(seated));
  assert.equal(await page.locator('.room-traces').isVisible(),false,'Avoid meaningless floating postcard labels on photo');
  assert.equal(await page.locator('#room-window').isVisible(),false,'Remove unexplained centre dot');
  assert.equal(await page.locator('.physical-movies').count(),1,'Cinema portal must be an actual screen');
  if(engine==='chromium'&&w===393){
    const flora=await page.evaluate(async()=>{
      const {bouquetObjectMarkup}=await import('./js/physical-room-objects.js');
      const ids=['rose','daisy','sunflower','tulip','peony','lily','orchid','lavender','jasmine','marigold','hibiscus','iris','lotus'];
      return ids.map(id=>{
        const node=document.createElement('div');
        node.innerHTML=bouquetObjectMarkup(Array(7).fill(id));
        return {id,count:node.querySelectorAll('g[data-species="'+id+'"]').length};
      });
    });
    assert.deepEqual(flora.map(x=>x.count),Array(13).fill(7),'All thirteen botanical species must draw seven distinct selected heads');
  }


  assert.ok(await page.locator('.atelier-home').isVisible(),'Atelier should be active');
  assert.equal(await page.locator('.atelier-illustration').count(),0,'No invisible legacy cartoon room markup should be mounted');
  assert.equal(await page.locator('.theme-preview-art').count(),3,'Only Kuwait, Kerala and Bengaluru scenery choices should exist');
  assert.ok(await page.locator('#take-me-anywhere').isVisible(),'surprise portal should be reachable');
  assert.ok(await page.locator('.living-photo-plane .living-photo-image').isVisible(),'Original chosen photo must be visible');
  const photoLoaded=await page.locator('.living-photo-image').evaluate(img=>img.complete&&img.naturalWidth>1500);
  assert.ok(photoLoaded,'The actual original room file must decode in the browser');
  assert.equal(await page.locator('.cinematic-room').getAttribute('data-room-photo-scene'),'original');
  if(w<760){
     const label=await page.locator('.object-movies .object-label').evaluate(el=>getComputedStyle(el).opacity);
     assert.equal(label,'0','The image must not be covered with floating sprite labels');
  }
  assert.equal(await page.locator('#room-window').isVisible(),false,'The old centre-of-room window toggle must not obscure photographed furniture');
  assert.equal(await page.locator('.home-feature-art').count(),0,'No hidden thumbnail vector art should be in the new room');
  const overflow=await page.locator('.new-home').evaluate(el=>el.scrollWidth-el.clientWidth);
  assert.ok(overflow<=5,'horizontal scroll overflow: '+overflow);
  const targets=await page.locator('[data-door]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height,x:r.x,y:r.y,bottom:r.bottom,right:r.right}}));
  for(const r of targets){assert.ok(r.w>=44&&r.h>=44,'comfortable touch target');if(w>=1000)assert.ok(r.right>0&&r.bottom>0&&r.x<w&&r.y<h,'Desktop objects should intersect the photograph viewport')}
  // A hotspot that looks beautiful but is covered by another button is broken.
  const areas=await page.locator('[data-door],#room-bouquet').evaluateAll(elements=>elements.map(el=>{
    const r=el.getBoundingClientRect();
    return {name:el.dataset.door||'bouquet',x:r.left,y:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
  }));
  for(let i=0;i<areas.length;i++)for(let j=i+1;j<areas.length;j++){
    const a=areas[i],b=areas[j];
    const dx=Math.max(0,Math.min(a.right,b.right)-Math.max(a.x,b.x));
    const dy=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y));
    const fraction=dx*dy/Math.min(a.width*a.height,b.width*b.height);
    assert.ok(fraction<.22,'Overlapping room targets: '+a.name+' / '+b.name+' ('+fraction.toFixed(2)+')');
  }

  const frame=await page.locator('#app').boundingBox();
  assert.ok(Math.abs(frame.width-w)<2&&Math.abs(frame.height-h)<2,'home fills viewport: '+JSON.stringify({frame,w,h}));
  if(w>=760){const room=await page.locator('.inhabited-room').boundingBox();assert.ok(room.x<1&&room.y<1&&Math.abs(room.width-w)<2&&Math.abs(room.height-h)<2,'desktop room has no inner panel')}

  await page.screenshot({path:join(OUT,key+'-home.png'),animations:'disabled'});
  await page.locator('#theme-trigger').click();
  await page.locator('#home-world-overlay').waitFor({state:'visible'});
  assert.equal(await page.locator('[data-world]').count(),3);
  for(const [id,photo] of [['kerala','maha-kerala.webp'],['bengaluru','maha-bengaluru.webp']]){
   await page.locator('[data-world="'+id+'"]').click();
   assert.equal(await page.locator('.new-home').getAttribute('data-theme'),id);
   await page.waitForFunction(name=>{const img=document.querySelector('.living-photo-image');return img?.getAttribute('src')?.endsWith(name)&&img.complete&&img.naturalWidth>1000},photo);
   const loaded=true;
   assert.ok(loaded,id+' must render an original locally packaged scene');
   const ghosts=await page.locator('.living-photo-plane').evaluate(plane=>({
    leafCopies:plane.querySelectorAll('.living-leaf-sway').length,
    curtainDisplay:getComputedStyle(plane,'::before').display,
    curtainContent:getComputedStyle(plane,'::before').content
   }));
   assert.equal(ghosts.leafCopies,0,id+' must not reuse copied plant fragments');
   assert.ok(ghosts.curtainDisplay==='none'||ghosts.curtainContent==='none',
     id+' must not reuse the former room curtain photo: '+JSON.stringify(ghosts));

   assert.ok(await page.locator('.photographed-vase-flowers').isVisible(),id+' must keep the live bouquet');
   assert.equal(await page.locator('.photographed-vase-flowers .photo-flower-heads g[data-species]').count(),7,id+' must show seven user-selected blooms');
   assert.equal(await page.locator('.photographed-vase-flowers').getAttribute('data-vase-scene'),id,'Bouquet must follow current scene');
   const plant=await page.locator('.living-photo-plane').evaluate(plane=>{
     const g=plane.querySelector('[data-door="garden"]').getBoundingClientRect();
     const v=plane.querySelector('#room-bouquet').getBoundingClientRect();
     const f=plane.querySelector('.photographed-vase-flowers').getBoundingClientRect();
     return {gardenBottom:g.bottom,vaseTop:v.top,flowersTop:f.top};
   });
   assert.ok(plant.gardenBottom+16<plant.flowersTop&&plant.gardenBottom+32<plant.vaseTop,
     id+' Garden must stay high on leaves, never crowd the bouquet: '+JSON.stringify(plant));
   assert.equal(await page.locator('.photographed-vase-flowers svg image').count(),0,
     id+' must not paste a duplicate photo rim');
   assert.equal(await page.locator('#room-bouquet .real-vase').isVisible(),false,
     id+' must show only its photographed vase');
   await page.screenshot({path:join(OUT,key+'-'+id+'.png'),animations:'disabled'});
   if(id==='kerala')await page.locator('#theme-trigger').click();
  }
  // Switch back to the exact user-approved room before portal testing:
  // switching themes must not strand the semantic room controls.
  await page.locator('#theme-trigger').click();
  await page.locator('[data-world="story"]').click();
  assert.equal(await page.locator('.cinematic-room').getAttribute('data-room-photo-scene'),'original');
  assert.equal(await page.locator('.living-photo-plane .living-hit-area').count(),8);

  await page.locator('[data-door="letters"]').scrollIntoViewIfNeeded();
  await page.locator('[data-door="letters"]').click();
  await page.locator('#portal-screen').waitFor({state:'visible'});
  await page.locator('#portal-screen.portal-arrived').waitFor({state:'visible',timeout:15000});
  await page.locator('.portal-back').click();
  await page.locator('#portal-screen').waitFor({state:'hidden',timeout:16000});
  await page.locator('.remembering-home:not([inert])').waitFor();
  await page.locator('.inhabited-room').scrollIntoViewIfNeeded();
  await page.screenshot({path:join(OUT,key+'-doors.png'),animations:'disabled'});
  // A real DOM portal tap, not a test-name assertion or static markup check.
  await page.locator('#take-me-anywhere').click();
  await page.locator('#portal-screen').waitFor({state:'visible'});
  assert.ok(await page.locator('#portal-screen').getAttribute('data-place'));
  await page.locator('.portal-back').click();
  await page.locator('#portal-screen').waitFor({state:'hidden',timeout:16000});
  if(w===393||w===1440){
   for(const scene of ['letters','music','movies','travel','games','garden','rest']){
     // Scene-specific regression tests check actual geography and cinema controls,
     // not just whether a page is present.

     const door=page.locator('[data-door="'+scene+'"]');
     if(w<760){
       // Mobile scene is a genuinely panoramic room: user must look towards
       // the physical object before touching it, instead of clicking a sticker.
       const desired=scene==='rest'?0:scene==='garden'?1:2;
       for(let n=0;n<3;n++){
         const current=Number(await page.locator('.cinematic-room').getAttribute('data-peek'));
         if(current===desired)break;
         await page.locator(current>desired?'#room-pan-left':'#room-pan-right').click();
         await page.waitForTimeout(445);
       }
     }
     await door.click();
     await page.locator('#portal-screen[data-place="'+scene+'"]').waitFor({state:'visible'});
     await page.locator('#portal-screen.portal-arrived').waitFor({state:'visible',timeout:15000});
     const worldRoot=({letters:".mail-heading",music:".fm-app",movies:".cinema-app",travel:".atlas-app",games:".arcade-app",garden:".wordgarden",rest:".restroom"})[scene];
     await page.locator(worldRoot).waitFor({state:'visible',timeout:15000});
     if(scene==='letters'||scene==='travel'){
      const chrome=await page.locator('#portal-screen').evaluate(el=>{
       const back=el.querySelector('.portal-back').getBoundingClientRect();
       const content=el.querySelector('.portal-content').getBoundingClientRect();
       return {backBottom:back.bottom,contentTop:content.top};
      });
      assert.ok(chrome.backBottom<=chrome.contentTop-2,'Room button must stay above content: '+JSON.stringify(chrome));
     }
     if(w===1440&&['games','garden','letters','music','rest'].includes(scene)){
       const width=await page.locator('#portal-screen .portal-content').evaluate(el=>el.getBoundingClientRect().width);
       assert.ok(width>950,'Desktop '+scene+' must use the actual desktop width, not a 780px phone column: '+width);
       if(scene==='games'){
         assert.ok(await page.locator('.arcade-info').isVisible(),'Desktop arcade game guide must be visible');
         const before=await page.locator('.arcade-info h2').innerText();
         await page.locator('[data-next]').click();
         const after=await page.locator('.arcade-info h2').innerText();
         assert.notEqual(after,before,'Cabinet guide must follow game selection');
       }
       if(scene==='garden'){
         const width=await page.locator('.wg-canvas-wrap').evaluate(el=>el.getBoundingClientRect().width);
         assert.ok(width>700,'Garden should be a spacious writing canvas');
       }
       if(scene==='letters'){
         const columns=await page.locator('.postroom-letter-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns);
         assert.ok(columns.includes(' '),'Letters must have a spacious two-column shelf on PC');
         assert.ok(await page.locator('.postroom-side').isVisible(),'Desktop Letters needs its illustrated writing desk');
       }
     }

     if(w>=1280&&(scene==='travel'||scene==='movies')){
       const contentWidth=await page.locator('#portal-screen .portal-content').evaluate(el=>el.getBoundingClientRect().width);
       assert.ok(contentWidth>=w*.82,'Panoramic '+scene+' must use desktop width, not old 780px cap: '+contentWidth);
     }

     if(scene==='letters'){
       const letterStudio=page.locator('.letterbox-app.postroom');
       await letterStudio.waitFor({state:'visible'});
       assert.equal(await page.locator('.postroom-letter-grid [data-open-letter]').count(),7,'Seven everyday inbox letters should be available');
       await page.locator('[data-tab="openWhen"]').click();
       assert.deepEqual(await page.locator('.when-shelf .when-clip').count(),14,'The fourteen open-when letters must remain available');
       assert.equal(await page.locator('.when-shelf').count(),2,'Open-when messages appear in two curated groups of seven');
       await page.locator('[data-tab="specialDays"]').click();
       assert.equal(await page.locator('.postroom-special-date-grid [data-open-letter]').count(),5,'The calendar shelf contains five chosen occasions');
       await page.locator('[data-tab="inbox"]').click();
       for(const title of ['Letters','Open when…','Saved']){
         assert.ok((await page.locator('.mail-tabs').innerText()).includes(title),'Clear letter shelf: '+title);
       }
       const geometry=await letterStudio.evaluate(el=>{
         const r=el.getBoundingClientRect();
         const tabs=[...el.querySelectorAll('.mail-tabs button')].map(b=>b.getBoundingClientRect());
         return {width:r.width,height:r.height,overflow:el.scrollWidth-el.clientWidth,tabs:tabs.map(t=>({w:t.width,left:t.left,right:t.right}))};
       });
       assert.ok(geometry.overflow<=2&&geometry.tabs.every(t=>t.w>=70),
         'Letters must be phone-friendly with no sideways scrolling: '+JSON.stringify(geometry));
       assert.ok(geometry.height>h-125,
         'The letter shelf must fill the screen vertically, not overflow beneath it: '+JSON.stringify(geometry));
       if(w===393){
         assert.ok(await page.locator('.postroom-side').isHidden(),'The desk must not crowd iPhone letters');
         assert.ok(await page.locator('.postroom-pocket-scene').isVisible(),'Mobile letters must have their own compact envelope art');
         const hero=await page.locator('.mail-heading').evaluate(el=>({height:el.getBoundingClientRect().height,bg:getComputedStyle(el).backgroundColor}));
         assert.ok(hero.height>=150&&hero.height<=220,'Mobile stationery hero must fit comfortably: '+JSON.stringify(hero));
       }
       if(w===1440){
         const structure=await letterStudio.evaluate(el=>{
           const shell=el.getBoundingClientRect(),side=el.querySelector('.postroom-side').getBoundingClientRect();
           const library=el.querySelector('.postroom-library').getBoundingClientRect();
           return {shell:shell.width,side:side.width,library:library.width,edge:Math.abs(side.right-library.left)};
         });
         assert.ok(structure.library>structure.side*1.5 && structure.edge<2,
           'At 100% desktop zoom the reading shelf must be wider than the art, with no panel overlap: '+JSON.stringify(structure));
       }
       await page.screenshot({path:join(OUT,key+'-letters-desk.png'),animations:'disabled'});
       await page.locator('[data-open-letter="hello-from-here"]').click();
       await page.locator('.letter-reader.postroom-reader').waitFor({state:'visible',timeout:7000});
       assert.equal(await page.locator('.reader-progress').getAttribute('aria-valuemax'),'7','Each typed letter has seven deliberate reading pages');
       assert.ok((await page.locator('.reader-intro h1').innerText()).includes('An envelope with your name'),
         'Actual letters must remain readable');
       const readerSize=await page.locator('.postroom-reader').evaluate(el=>({overflow:el.scrollWidth-el.clientWidth,height:el.getBoundingClientRect().height}));
       assert.ok(readerSize.overflow<=2&&readerSize.height>h-125,
         'Opened stationery must use the full reading height rather than leaving blank screen below: '+JSON.stringify({readerSize,h}));
       await page.screenshot({path:join(OUT,key+'-letter-open.png'),animations:'disabled'});
       await page.locator('[data-keep-letter]').click();
       assert.equal(await page.locator('[data-keep-letter]').getAttribute('aria-pressed'),'true','Save letter with original state');
       await page.locator('[data-back-letters]').click();
       await page.locator('[data-tab="keepsakes"]').click();
       assert.ok(await page.locator('[data-open-letter="hello-from-here"]').isVisible(),'Saved shelf must contain kept letter');
       await page.locator('#future-note-text').fill('A little reminder for future Maha.');
       await page.locator('[data-tab="openWhen"]').click();
       assert.equal(await page.locator('.when-clip [data-open-letter]').count(),14,'All Open When moments remain intact');
       await page.screenshot({path:join(OUT,key+'-open-when-desk.png'),animations:'disabled'});
       await page.locator('[data-tab="keepsakes"]').click();
       assert.equal(await page.locator('#future-note-text').inputValue(),'A little reminder for future Maha.',
         'Private note must persist across switching');
       await page.locator('[data-tab="inbox"]').click();
     }
     if(scene==='music'){
       const ambience=page.locator('[data-ambience]');
       assert.ok(await ambience.isVisible(),'FM should expose a real locally playable atmosphere');
       assert.match(await ambience.innerText(),/Hear|Play/i,'Do not offer a dead or missing ambient recording control');
     }
     if(scene==='games'){
       if(w===1440)await page.locator('[data-prev]').click(); // Earlier dossier QA changed to Sadya.
       assert.ok(await page.locator('.cabinet-marquee').innerText().then(s=>s.includes('CHAAYA')),'First arcade cabinet must be playable Chai Maker');
       await page.locator('[data-next]').click();
       assert.ok((await page.locator('.cabinet-marquee').innerText()).includes('SADYA'),'Second cabinet must be Sadya Builder');
       await page.locator('[data-next]').click();
       assert.ok((await page.locator('.cabinet-marquee').innerText()).includes('BAGGAGE'),'Third cabinet must be the suitcase puzzle');
     }
     if(scene==='travel'){
       assert.ok(await page.locator('.travel-head h1').isVisible(),'Travel desk needs its own introduction');
       await page.locator('#portal-screen[data-place="travel"] .portal-content').evaluate(el=>{el.scrollTop=0;});
       await page.screenshot({path:join(OUT,key+'-travel-hero.png'),animations:'disabled'});
       const travelScroll=await page.locator('#portal-screen[data-place="travel"] .portal-content').evaluate(el=>{
        const app=el.querySelector('.atlas-app');
        const scrollable=el.scrollHeight-el.clientHeight;
        const appY=getComputedStyle(app).overflowY;
        const before=el.scrollTop;
        el.scrollTop=Math.min(440,scrollable);
        const after=el.scrollTop;
        return {scrollable,before,after,appY,overflowX:el.scrollWidth-el.clientWidth};
       });
       assert.ok(travelScroll.scrollable>250,'Travel has one scrollable viewport: '+JSON.stringify(travelScroll));
       assert.ok(travelScroll.after>travelScroll.before,'Travel native scrolling responds: '+JSON.stringify(travelScroll));
       assert.ok(!['auto','scroll'].includes(travelScroll.appY),'No nested atlas scroller: '+JSON.stringify(travelScroll));
       assert.ok(travelScroll.overflowX<=3,'Travel never scrolls sideways as a whole: '+JSON.stringify(travelScroll));
       await page.locator('#portal-screen[data-place="travel"] .portal-content').evaluate(el=>{el.scrollTop=0;});
       for(const id of ['kerala','bangalore','kuwait']){
        assert.ok(await page.locator('.travel-place-card[data-place="'+id+'"]').isVisible(),'Illustrated travel chapter: '+id);
       }
       // Navigation must physically move the single scrollport in WebKit and Chromium.
       await page.locator('[data-tab="dreams"]').click();
       await page.waitForFunction(()=>{
         const scroller=document.querySelector('#portal-screen[data-place="travel"] .portal-content');
         return scroller&&scroller.scrollTop>200;
       },null,{timeout:6500});
       await page.locator('[data-tab="passport"]').click();
       await page.waitForFunction(()=>{
         const scroller=document.querySelector('#portal-screen[data-place="travel"] .portal-content');
         return scroller&&scroller.scrollTop<100;
       },null,{timeout:6500});
       assert.ok(await page.locator('.passport-spread').isVisible(),'Travel passport must be a physical two-page book');
       assert.equal(await page.locator('.passport-paper').count(),2,'Passport must have both left and right pages');
       assert.equal((await page.request.get(new URL('./assets/travel/passport-cover.svg',BASE).href)).status(),200,'Offline art must load');
       assert.ok(await page.locator('.travel-dreams [data-add-pin]').isVisible(),'Private dream pins remain usable');
       await page.locator('[data-tab="map"]').click();

       assert.equal(await page.locator('.atlas-board .atlas-watercolor').count(),1,'Travel should display the accurate regional atlas');
       const img=await page.locator('.atlas-board .atlas-watercolor').getAttribute('src');
       assert.ok(img?.includes('atlas-region.svg'),'Travel board must not show the old abstract polygon map');
       assert.equal((await page.request.get(new URL('./assets/atlas-region.svg',BASE).href)).status(),200);
       const coords=await page.locator('.atlas-pin[data-place="kuwait"]').evaluate(el=>({x:parseFloat(el.style.left),y:parseFloat(el.style.top)}));
       assert.ok(coords.x>18&&coords.x<24&&coords.y>29&&coords.y<38,'Kuwait pin must match approximate real regional geography');
       await page.locator('[data-zoom]').click();
       assert.ok(await page.locator('.atlas-board.is-zoomed').isVisible(),'India close-up should zoom map and actual pin layer together');
       await page.locator('[data-zoom]').click();
       assert.equal(await page.locator('.atlas-board.is-zoomed').count(),0,'Atlas should zoom back out');

     }
     if(scene==='rest'){
        assert.ok(await page.locator('.rr-intro').isVisible(),'Quiet room has a human-written introduction');
        assert.ok(await page.locator('.rr-lamp').isVisible(),'Rest is a physical lamp-lit room');
     }
     if(scene==='movies'){
       await page.locator('.cinema-poster').first().click();
       await page.locator('.cinema-screen-wrap').waitFor({state:'visible'});
       const ratio=await page.locator('.cinema-screen-wrap').evaluate(el=>{const r=el.getBoundingClientRect();return r.width/r.height});
       assert.ok(ratio>1.58&&ratio<1.97,'Physical movie screen should be cinematic wide, not a stretched or tiny banner: '+ratio);

       assert.equal(await page.locator('.cinema-side-notes').count(),1,'Cinema needs a screening-side film guide');
       assert.ok(await page.locator('.cinema-chapters [data-chapter]').count()>=3,'Film chapters should be discoverable');
       await page.locator('.cinema-chapters [data-chapter]').nth(1).click();
       const selected=await page.locator('[data-seek]').inputValue();
       assert.ok(parseFloat(selected)>0,'Movie chapter should seek within the film');
     }
     const content=page.locator('#portal-screen .portal-content');
     await content.locator(':scope > *').first().waitFor({state:'visible',timeout:10000});
     await page.screenshot({path:join(OUT,key+'-world-'+scene+'.png'),animations:'disabled'});
     await page.locator('.portal-back').click();
     await page.locator('#portal-screen').waitFor({state:'hidden',timeout:16000});
   }
  }
  if(w===1440||w===1674){
   // Desktop picker: a complete layout must still render the same live vase.
   await page.locator('#room-bouquet').scrollIntoViewIfNeeded();
   await page.locator('#room-bouquet').click();
   await page.locator('.f2-scene').waitFor();
   await page.locator('[data-flower="jasmine"]').click();
   // Regression: the editor used to inherit grid-row:2 from the OLD layout,
   // shrinking the bouquet to 0px and pushing flower cards offscreen.
   const panels=await page.locator('.f2-layout').evaluate(el=>{
     const a=el.querySelector('.f2-preview').getBoundingClientRect();
     const b=el.querySelector('.f2-editor').getBoundingClientRect();
     const self=el.getBoundingClientRect();
     return {preview:{left:a.left,right:a.right,height:a.height},editor:{left:b.left,right:b.right,height:b.height},layout:{left:self.left,right:self.right,height:self.height}};
   });
   assert.ok(panels.editor.left>=panels.preview.right-5&&panels.preview.height>panels.layout.height*.75,
     'Desktop needs two columns without implicit overflow rows: '+JSON.stringify(panels));
   const full=await page.locator('.f2-scene').evaluate(scene=>{
     const s=scene.getBoundingClientRect(),layout=scene.querySelector('.f2-layout').getBoundingClientRect();
     const preview=scene.querySelector('.f2-preview').getBoundingClientRect();
     const editor=scene.querySelector('.f2-editor').getBoundingClientRect();
     return {scene:{x:s.left,width:s.width,right:s.right},layout:{x:layout.left,right:layout.right,width:layout.width},
       preview:{x:preview.left,right:preview.right,width:preview.width},editor:{x:editor.left,right:editor.right,width:editor.width}};
   });
   assert.ok(full.layout.width>full.scene.width*.96&&full.editor.right>full.scene.right-85&&full.preview.width>full.scene.width*.40,
     'Flora Studio must use the WHOLE screen, not only left half: '+JSON.stringify(full));
   await page.screenshot({path:join(OUT,key+'-full-flora-studio.png'),animations:'disabled'});
   const onDesk=await page.locator('.f2-bouquet').evaluate(el=>{
    const bouquet=el.querySelector('.bouquet-svg'),vase=el.querySelector('.studio-vase');
    if(!bouquet||!vase)return {missing:true};
    const spot=svg=>{const pt=svg.createSVGPoint();pt.x=254;pt.y=450;return pt.matrixTransform(svg.getScreenCTM())};
    const a=spot(bouquet),b=spot(vase);
    return {gap:Math.hypot(a.x-b.x,a.y-b.y),height:el.getBoundingClientRect().height,
      panel:el.closest('.f2-preview')?.getBoundingClientRect().height,
      intro:el.closest('.f2-preview')?.querySelector('.f2-header')?.getBoundingClientRect().height,
      editor:document.querySelector('.f2-editor')?.getBoundingClientRect().height};
   });
   assert.ok(!onDesk.missing&&onDesk.gap<6&&onDesk.height>180,
     'Desktop bouquet and vase must share the same rendered coordinates: '+JSON.stringify(onDesk));
   await page.screenshot({path:join(OUT,key+'-flower-vase-desktop.png'),animations:'disabled'});
   await page.locator('#cancel-flowers').click();
   await page.locator('.new-home').waitFor();
  }
  if(w===360||w===393||w===402){
   const flower=w===393?'rose':w===402?'iris':'jasmine';
   await page.locator('#room-bouquet').scrollIntoViewIfNeeded();
   await page.locator('#room-bouquet').click();
   await page.locator('.f2-scene').waitFor();
   assert.ok(await page.locator('.f2-preview').isVisible(),'Live bouquet preview is visible');
   assert.ok(await page.locator('.f2-editor').isVisible(),'Interactive flower palette is visible');
   const geometry=await page.locator('.f2-scene').evaluate(scene=>{
     const box=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right}};
     const overall=box(scene),hero=box(scene.querySelector('.f2-preview'));
     const arrangement=box(scene.querySelector('.f2-stage'));
     const tray=box(scene.querySelector('.f2-editor'));
     return {overall,hero,arrangement,tray,overflow:scene.scrollWidth-scene.clientWidth};
   });
   assert.ok(geometry.arrangement.h>125,'Flower preview needs real mobile space: '+JSON.stringify(geometry));
   assert.ok(geometry.tray.y>=geometry.hero.bottom-2&&geometry.tray.bottom<=geometry.overall.bottom+3,
     'Bouquet and flower tray must not overlap or disappear: '+JSON.stringify(geometry));
   assert.ok(geometry.overflow<=2&&geometry.tray.right<=geometry.overall.right+2,
     'Mobile flower studio must not scroll horizontally: '+JSON.stringify(geometry));
   const cardClipping=await page.locator('.f2-card').evaluateAll(cards=>cards.flatMap(card=>{
     const art=card.querySelector('.f2-card-art')?.getBoundingClientRect();
     const bloom=card.querySelector('.flower-head-svg > g')?.getBoundingClientRect();
     if(!art||!bloom)return [{id:card.dataset.flower,error:'missing SVG geometry'}];
     const margin={left:bloom.left-art.left,right:art.right-bloom.right,
      top:bloom.top-art.top,bottom:art.bottom-bloom.bottom};
     return Object.values(margin).every(v=>v>=-2)?[]:[{id:card.dataset.flower,margin}];
   }));
   assert.deepEqual(cardClipping,[],'All thirteen flower heads must fit inside their cards, including sunflower and tulip');
   await page.screenshot({path:join(OUT,key+'-mobile-flora-before-pick.png'),animations:'disabled'});
   const scrollable=await page.locator('.f2-rail').evaluate(el=>el.scrollHeight>el.clientHeight);
   assert.ok(scrollable,'Thirteen flowers must scroll within the palette, not the page');
   const scrolled=await page.locator('.f2-rail').evaluate(el=>{const before=el.scrollTop;el.scrollTop=el.scrollHeight;const after=el.scrollTop;el.scrollTop=0;return after-before});
   assert.ok(scrolled>70,'Flower rail must scroll vertically on phone: '+scrolled);
   assert.ok(await page.locator('#cancel-flowers').isVisible(),'Returning to the saved bouquet must be possible');
   assert.equal(await page.locator('#flower-steps .f2-slot').count(),7,'Florist must have seven clear slots');
   if(engine==='chromium'&&w===393)await page.emulateMedia({reducedMotion:'no-preference'});
   await page.locator('[data-flower="'+flower+'"]').click();
   if(engine==='chromium'&&w===393){
     const flying=await page.locator('.f2-flight').evaluateAll(items=>items.some(el=>el.getAnimations().length>0));
     assert.ok(flying,'Picking a flower should visibly fly into the preview vase when motion is enabled');
     await page.waitForTimeout(740);
     assert.equal(await page.locator('.f2-flight').count(),0,'Transient flight artwork should clean itself up');
     await page.emulateMedia({reducedMotion:'reduce'});
   }
   assert.equal(await page.locator('#flower-steps .is-picked').count(),1,'One selected flower fills one step');
   // The arrangement and glass vase share their SVG viewBox on iOS and desktop.
   const preview=await page.locator('.f2-bouquet').evaluate(el=>{
    const bouquet=el.querySelector('.bouquet-svg'),vase=el.querySelector('.studio-vase');
    if(!bouquet||!vase)return {missing:true};
    const spot=svg=>{const pt=svg.createSVGPoint();pt.x=254;pt.y=450;return pt.matrixTransform(svg.getScreenCTM())};
    const a=spot(bouquet),b=spot(vase);
    return {gap:Math.hypot(a.x-b.x,a.y-b.y),height:el.getBoundingClientRect().height,
      panel:el.closest('.f2-preview')?.getBoundingClientRect().height,
      intro:el.closest('.f2-preview')?.querySelector('.f2-header')?.getBoundingClientRect().height,
      editor:document.querySelector('.f2-editor')?.getBoundingClientRect().height};
   });
   assert.ok(!preview.missing&&preview.gap<6&&preview.height>70,
    'Chosen flower stems must sit in the preview vase instead of floating: '+JSON.stringify(preview));
   assert.ok((await page.locator('#meaning-line').innerText()).includes('01 / 07'),'Every pick should carry its own line');
   await page.screenshot({path:join(OUT,key+'-flower-picker.png'),animations:'disabled'});
   await page.locator('[data-flower="'+flower+'"]').click();
   assert.equal(await page.locator('#flower-steps .is-picked').count(),2,'Two taps select two actual flower slots');
   await page.locator('[data-remove-slot="0"]').click();
   assert.equal(await page.locator('#flower-steps .is-picked').count(),1,'Tapping a selected slot removes only that stem');
   for(let i=1;i<7;i++)await page.locator('[data-flower="'+flower+'"]').click();
   await page.locator('#carry-bouquet').waitFor({state:'visible',timeout:18000});
   const finished=await page.locator('.f2-scene').evaluate(scene=>{
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
    const header=document.querySelector('.app-header'),card=scene.querySelector('.f2-final');
    return {stage:rect(scene.querySelector('.f2-stage')),card:rect(card),scene:rect(scene),
     cardHeight:card.offsetHeight,headerColor:getComputedStyle(header).backgroundColor,
     bouquetVisible:!!scene.querySelector('.f2-stage .bouquet-svg'),
     viewportOverflow:scene.scrollWidth-scene.clientWidth,
     flowerCardViewBox:scene.querySelector('.f2-card .flower-head-svg')?.getAttribute('viewBox')};
   });
   assert.ok(finished.bouquetVisible,'Completed bouquet must remain visibly rendered in the preview');
   assert.ok(finished.stage.bottom<=finished.card.y+3,
     'The completed action sheet may not cover the floral arrangement: '+JSON.stringify(finished));
   assert.ok(finished.cardHeight<185&&finished.card.bottom<=finished.scene.bottom+1,
     'Finished bouquet controls must fit in a compact mobile dock: '+JSON.stringify(finished));
   const fittedBox=finished.flowerCardViewBox?.split(/\s+/).map(Number)||[];
   assert.ok(fittedBox.length===4&&fittedBox.every(Number.isFinite)&&
      fittedBox[2]>80&&Math.abs(fittedBox[2]-fittedBox[3])<.1,
     'Flower card viewBox must be auto-fitted to the actual petals: '+finished.flowerCardViewBox);
   assert.ok(finished.headerColor.includes('16, 46, 44'),
     'MAHA identity and audio controls need an opaque dark contrast header: '+finished.headerColor);
   assert.ok(finished.viewportOverflow<=2,'Completion UI must not introduce sideways scroll');
   await page.screenshot({path:join(OUT,key+'-finished-bouquet-unobscured.png'),animations:'disabled'});
   await page.locator('#carry-bouquet').click();
   await page.locator('.new-home').waitFor();
   assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('maha.escape.v1.flowers'))),Array(7).fill(flower));
   assert.ok(await page.locator('#room-bouquet').isVisible(),'The selected bouquet hotspot must remain accessible');
   assert.equal(await page.locator('.photographed-vase-flowers .photo-flower-heads g[data-species="'+flower+'"]').count(),7,'Updated flower selection must be reflected in the real room');
  }
  // The installed experience must retain its room and saved bouquet offline.
  // This is a real controlled service-worker reload, not only a mock cache read.
  if(engine==='chromium'&&w===393){
    await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller),null,{timeout:16000});
    await context.setOffline(true);
    try{
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('.room-scene.new-home').waitFor({state:'visible',timeout:12000});
      assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('maha.escape.v1.flowers'))),Array(7).fill('rose'),'Offline reload must preserve her seven selected flowers');
      assert.ok(await page.locator('#room-bouquet').isVisible(),'The flowers in the room should remain accessible offline');
      await page.screenshot({path:join(OUT,key+'-offline-home.png'),animations:'disabled'});
    }finally{await context.setOffline(false);}
  }
  if(engine==='chromium'&&w===393){
    await page.locator('#revisit-hug').click();
    await page.locator('.new-hug .hug-envelope').waitFor({state:'visible'});
    await page.screenshot({path:join(OUT,key+'-whale-hug.png'),animations:'disabled'});
    await page.locator('#hug-open').click();
    assert.ok(await page.locator('#hug-letter').isVisible(),'Original letter must unfold on tap');
    await page.locator('#hug-yes').click();
    assert.ok(await page.locator('#hug-result').isVisible(),'A genuine optional virtual hug should appear');
    await page.locator('#next-flowers').click();
    await page.locator('.room-scene.new-home').waitFor({state:'visible'});
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('maha.escape.v1.flowers'))),Array(7).fill('rose'),'Revisiting hug must not reset saved flowers');
    // Revisit again: a declined hug is an actual branching outcome, not a yes in disguise.
    await page.locator('#revisit-hug').click();
    await page.locator('#hug-open').click();
    await page.locator('[data-hug-no="never"]').click();
    assert.equal(await page.locator('#hug-result').getAttribute('data-outcome'),'no');
    assert.ok((await page.locator('#hug-result-copy').innerText()).includes('Head of Flowers'));
    await page.locator('#next-flowers').click();
    await page.locator('.new-home').waitFor();
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('maha.escape.v1.flowers'))),Array(7).fill('rose'),'Declining hug must never change the bouquet');
  }
  assert.deepEqual(errors,[],'JS errors: '+errors.join('; '));
  assert.deepEqual(missing,[],'Missing assets: '+missing.join('; '));
  reports.push('PASS '+key);
 }catch(err){failed++;reports.push('FAIL '+key+': '+String(err).slice(0,1100))}
 finally{await context.close();await browser.close()}
}
try{
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  for(const [w,h] of sizes)await run(name,engine,w,h);
 }
}finally{await new Promise(resolve=>server.close(resolve))}
console.log(reports.join('\n'));
console.log(`Finished ${reports.length} responsive browser checks; failures=${failed}`);
if(failed)process.exitCode=1;