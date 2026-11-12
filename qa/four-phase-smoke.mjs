/** Browser smoke checks for the additive four-phase features. */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium,webkit} from 'playwright';

const ROOT=resolve('.');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.vtt':'text/vtt'};
const server=createServer(async(req,res)=>{
 let raw;try{raw=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return;}
 const path=resolve(ROOT,'.'+(raw==='/'?'/index.html':raw));
 if(!path.startsWith(ROOT+'/')&&path!==ROOT){res.writeHead(403);res.end();return;}
 try{const bytes=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(bytes);}
 catch{res.writeHead(404);res.end('not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const BASE='http://127.0.0.1:'+server.address().port+'/';
async function run(engine,name){
 const browser=await engine.launch({headless:true});
 try{
  const context=await browser.newContext({viewport:{width:393,height:852},acceptDownloads:true,reducedMotion:'reduce'});
  await context.addInitScript(()=>{
   localStorage.setItem('maha.escape.v1.completed','true');
   localStorage.setItem('maha.escape.v1.flowers',JSON.stringify(Array(7).fill('rose')));
   localStorage.setItem('maha.escape.v1.visits','3');
   localStorage.setItem('maha.escape.v1.keptLetters',JSON.stringify(['sample-letter']));
  });
  const page=await context.newPage(),errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  page.setDefaultTimeout(15000);
  await page.goto(BASE+'studio.html',{waitUntil:'domcontentloaded'});
  await page.locator('#studio-entries [data-index="0"]').waitFor({timeout:20000});
  const input=page.locator('#studio-entries [data-index="0"]');
  await input.fill('A small note for a different day.');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('maha.studio.draft.today'))[0]),'A small note for a different day.');
  const dl=page.waitForEvent('download');
  await page.locator('#studio-export').click();
  assert.equal((await dl).suggestedFilename(),'today.json');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#studio-entries [data-index="0"]').waitFor();
  assert.equal(await page.locator('#studio-entries [data-index="0"]').inputValue(),'A small note for a different day.');
  // Guided copy editing works without touching IDs, unlock rules or gameplay.
  await page.locator('[data-category="letters"]').click();
  const letterPage=page.locator('#studio-entries [data-edit-key="0-2"]');
  await letterPage.waitFor();
  const originalLetterPage=await letterPage.inputValue();
  await letterPage.fill('A new local draft page. This has not changed MAHA.');
  assert.equal(await page.locator('#studio-preview-after').innerText(),'A new local draft page. This has not changed MAHA.');
  assert.equal(await page.locator('#studio-preview-before').innerText(),originalLetterPage);
  await page.locator('#studio-undo').click();
  assert.equal(await page.locator('#studio-entries [data-edit-key="0-2"]').inputValue(),originalLetterPage);
  await page.locator('[data-category="movies"]').click();
  const scene=page.locator('#studio-entries [data-edit-key="0-4"]');
  await scene.waitFor();
  await scene.fill('A freshly edited movie caption.');
  assert.equal(await page.locator('#studio-preview-after').innerText(),'A freshly edited movie caption.');
  await page.locator('[data-category="hug"]').click();
  await page.locator('#studio-entries [data-edit-key="0-0"]').fill('Hello from your private studio.');
  assert.equal(await page.locator('#studio-preview-after').innerText(),'Hello from your private studio.');
  assert.equal(await page.locator('#studio-target-path').innerText(),'content/hug.json');
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  await page.locator('.room-scene.new-home').waitFor({timeout:20000});
  await page.locator('#home-menu-trigger').click();
  await page.locator('#memory-trigger').click();
  await page.locator('.keepsake-collection').waitFor();
  const text=await page.locator('.keepsake-collection').innerText();
  assert.match(text,/seven flowers/i);
  assert.match(text,/letters worth keeping/i);
  assert.deepEqual(errors,[],name+' JavaScript errors: '+errors.join('; '));
  await context.close();
  console.log(name+': Content Atelier draft/export, keepsake collection, no browser errors — PASS');
 }finally{await browser.close();}
}
try{await run(chromium,'Chromium');await run(webkit,'WebKit');}
finally{server.close();}
