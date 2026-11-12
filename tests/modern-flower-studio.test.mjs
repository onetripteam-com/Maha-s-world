import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('approved real Kuwait scene is present, optimised and offline-ready',()=>{
 const file=new URL('../assets/rooms/maha-kuwait.webp',import.meta.url);
 const bytes=readFileSync(file);
 assert.ok(bytes.length>80_000&&bytes.length<1_000_000,'reasonably sized crisp photograph');
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 assert.equal(bytes.toString('ascii',8,12),'WEBP');
 const stage=read('js/room-photo-stage.js');
 assert.match(stage,/image\.src=generatedKuwait/);
 assert.match(stage,/maha-kuwait\.webp/);
 assert.match(stage,/flowers:\[43,57,14,27\]/);
 const sw=read('sw.js');
 assert.ok(sw.includes("'./assets/rooms/maha-kuwait.webp'"),'available offline');
});
test('modern editor follows selected room instead of baking in fake clickable imagery',()=>{
 const studio=read('css/flora-rebuild.css');
 assert.match(studio,/data-source-scene="kerala"/);
 assert.match(studio,/data-source-scene="bengaluru"/);
 assert.match(studio,/--f2-photo:url\('\.\.\/assets\/rooms\/maha-kuwait\.webp'\)/);
 assert.match(studio,/\.f2-backdrop/);
 assert.match(studio,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(studio,/\.f2-card:active/);
 assert.match(studio,/prefers-reduced-motion:reduce/);
 const html=read('index.html');
 assert.ok(html.includes('flora-rebuild.css')&&!html.includes('atelier-photo.css'));
});
test('flower builder keeps all seven slots and allows precise touch removal and cancellation',()=>{
 const js=read('js/flowers.js');
 assert.match(js,/chosen\.push\(f\.id\)/);
 assert.match(js,/Array\.from\(\{length:7\}/);
 assert.match(js,/data-remove-slot/);
 assert.match(js,/chosen\.splice\(index,1\)/);
 assert.match(js,/onCancel/);
 assert.match(js,/f2-exit/);
 assert.match(js,/bouquetMarkup\(chosen/);
 assert.match(js,/downloadBouquet\(chosen\)/);
 assert.match(js,/store\.set\('flowers',chosen\)/);
 const main=read('js/main.js');
 assert.match(main,/sceneRoom\(previous\)/);
});
