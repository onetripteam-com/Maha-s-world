/** New MAHA flowers, travel and responsive letter UI browser smoke. */
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {createMahaServer} from '../scripts/dev-server.mjs';

const server=createMahaServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port+'/';
try{
 for(const [name,engine,width,height] of [['Chromium phone',chromium,393,852],['WebKit desktop',webkit,1280,800]]){
  const browser=await engine.launch({headless:true});
  try{
   const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
   await context.addInitScript(()=>{
    localStorage.setItem('maha.escape.v1.completed','true');
    localStorage.setItem('maha.escape.v1.flowers',JSON.stringify(Array(7).fill('rose')));
    localStorage.setItem('maha.escape.v1.visits','3');
   });
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.setDefaultTimeout(20000);
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await page.locator('.room-scene.new-home').waitFor();

   await page.locator('[data-door="letters"]').first().click();
   await page.locator('#portal-screen.portal-arrived[data-place="letters"]').waitFor();
   assert.equal((await page.locator('.portal-back .portal-back-copy strong').innerText()).trim(),'Back to room');
   const size=await page.locator('.portal-back').evaluate(el=>({height:el.getBoundingClientRect().height,width:el.getBoundingClientRect().width}));
   assert.ok(size.height>=44&&size.width>=95,'Accessible room navigation on '+name);
   await page.locator('.portal-back').click();
   await page.locator('#portal-screen').waitFor({state:'hidden'});

   await page.locator('[data-door="travel"]').first().click();
   await page.locator('#portal-screen.portal-arrived[data-place="travel"]').waitFor();
   await page.locator('#travel-map .atlas-watercolor').waitFor();
   assert.match(await page.locator('#travel-map .atlas-watercolor').getAttribute('src'),/world-atlas\.svg/);
   const kuwait=await page.locator('.atlas-pin[data-place="kuwait"]').evaluate(el=>({x:parseFloat(el.style.left),y:parseFloat(el.style.top)}));
   assert.ok(kuwait.x>62&&kuwait.x<65&&kuwait.y>40&&kuwait.y<43);
   assert.equal(await page.locator('.atlas-pin[data-place]').count(),10);
   // Close destinations no longer stack eight tiny targets on top of each
   // other. A geographic cluster exposes eight accessible postcard choices.
   const regional=page.locator('[data-open-region="india"]');
   assert.equal(await regional.getAttribute('aria-expanded'),'false');
   await regional.click();
   assert.equal(await regional.getAttribute('aria-expanded'),'true');
   assert.equal(await page.locator('#travel-india-stops [data-place]').count(),8);
   await page.locator('#travel-india-stops [data-place="alleppey"]').click();
   await page.locator('dialog.travel-modal[open]').waitFor();
   await page.locator('dialog [data-flip]').click();
   assert.match(await page.locator('dialog .travel-flip-back').innerText(),/Chief Snack Inspector/i);
   await page.locator('dialog [data-close-dialog]').click();
   await page.locator('dialog.travel-modal[open]').waitFor({state:'hidden'});
   await page.locator('#travel-india-stops [data-close-region]').click();
   assert.equal(await regional.getAttribute('aria-expanded'),'false');
   assert.equal((await page.request.get(base+'assets/travel/landmark-mysore.svg')).status(),200);
   await page.locator('[data-tab="map"]').click();
   await page.locator('.atlas-place-tape [data-place="mysore"]').click();
   const dialog=page.locator('dialog.travel-modal[open]');
   await dialog.waitFor();
   await page.locator('dialog [data-flip]').click();
   assert.match(await page.locator('dialog .travel-flip-card').getAttribute('class'),/flipped/);
   assert.match(await page.locator('dialog .travel-flip-back').innerText(),/electricity bill/i);
   await page.locator('dialog [data-close-dialog]').click();
   await dialog.waitFor({state:'hidden'});

   await page.locator('[data-tab="dreams"]').click();
   await page.locator('[data-dream-quick] [name="name"]').fill('The Moon');
   await page.locator('[data-dream-quick] [name="note"]').fill('An incredibly unreasonable but wonderful picnic.');
   await page.locator('[data-dream-quick] button[type="submit"]').click();
   await page.locator('.travel-dream-slip').filter({hasText:'The Moon'}).waitFor();
   assert.deepEqual(errors,[],name+' JavaScript errors: '+errors.join('; '));
   await context.close();
   console.log(name+': world atlas, new landmarks, letter back navigation, postcard flip and dream diary — PASS');
  }finally{await browser.close();}
 }
}finally{await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()))}
