/** A real-browser check of the optimized, loopback-only development preview. */
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {createMahaServer} from '../scripts/dev-server.mjs';

const server=createMahaServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port+'/';
try{
 for(const [label,engine] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await engine.launch({headless:true});
  try{
   const context=await browser.newContext({viewport:{width:393,height:852},reducedMotion:'reduce'});
   await context.addInitScript(()=>{
    localStorage.setItem('maha.escape.v1.completed','true');
    localStorage.setItem('maha.escape.v1.flowers',JSON.stringify(Array(7).fill('rose')));
    localStorage.setItem('maha.escape.v1.visits','3');
   });
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(base,{waitUntil:'domcontentloaded'});
   assert.equal(response.status(),200);
   await page.locator('.room-scene.new-home').waitFor({timeout:20000});
   assert.equal(await page.locator('link[rel="stylesheet"]').count(),1,'Styles must load from one ordered preview bundle.');
   assert.equal(await page.locator('[data-door]').count(),7,'All original interactive room destinations remain.');
   assert.ok(await page.locator('.room-heading h1').isVisible());
   assert.equal(await page.evaluate(()=>window.__MAHA_PRIVATE_PREVIEW__),true);
   assert.equal(await page.evaluate(async()=>{
    if(!('serviceWorker' in navigator))return false;
    return Boolean(await navigator.serviceWorker.getRegistration('./'));
   }),false,'Private preview must not install a heavy service worker.');
   const style=await page.locator('.room-scene').evaluate(el=>getComputedStyle(el).getPropertyValue('display'));
   assert.ok(style&&style!=='none','Private preview must preserve its original styling.');
   const css=await context.request.get(base+'css/maha-preview-bundle.css');
   assert.equal(css.status(),200);
   assert.deepEqual(errors,[],label+' runtime errors: '+errors.join('; '));
   await context.close();
   console.log(label+': private optimized preview and seven destinations — PASS');
  }finally{await browser.close();}
 }
}finally{
 await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
}
