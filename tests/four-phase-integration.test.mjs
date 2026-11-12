import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');

test('every arcade module dynamically imported by the real arcade is precached',()=>{
 const arcade=read('js/arcade.js'),sw=read('sw.js');
 for(const name of ['chai','sadya','baggage','doctor','world','vlog']){
  assert.ok(arcade.includes("import('./games/"+name+".js')"),name+' must be loadable');
  assert.ok(sw.includes("'./js/games/"+name+".js'"),name+' must work on first offline game launch');
 }
});
test('the complete service-worker precache list refers to real assets',()=>{
 const sw=read('sw.js');
 const resources=[...sw.matchAll(/'\.\/([^']+)'/g)].map(x=>x[1]);
 for(const file of resources){if(!file)continue;assert.ok(existsSync(new URL(file,root)),file+' missing from precache');}
});
test('each destination retains its original mount function and gets loaded on demand',()=>{
 const portal=read('js/portal.js');
 for(const [id,file,method] of [
  ['letters','letters','mountLetters'],['games','arcade','mountArcade'],['movies','cinema','mountCinema'],
  ['music','radio','mountRadio'],['travel','travel','mountTravel'],['garden','garden','mountGarden'],['rest','rest','mountRest']
 ]){
  assert.ok(portal.includes(id+":()=>import('./"+file+".js')"),id+' should load lazily');
  assert.ok(portal.includes('module.'+method+'('),method+' must retain its lifecycle');
 }
});
test('content studio is local-only and offers validated export',()=>{
 const html=read('studio.html'),js=read('js/content-studio.js');
 assert.ok(html.includes('id="studio-export"'));
 assert.ok(js.includes('function validate(kind,doc)'));
 assert.ok(js.includes("URL.createObjectURL(blob)"));
 assert.ok(!js.includes('fetch(',js.indexOf("$('#studio-export').addEventListener")));
 assert.ok(!js.includes('PUT')&&!js.includes('POST'));
});
test('travel journaling and letter page resume retain existing storage keys',()=>{
 const travel=read('js/travel.js'),letters=read('js/letters.js'),memory=read('js/memory.js');
 assert.ok(travel.includes("store.set('travelJournal',journal)"));
 assert.ok(letters.includes("store.set('letterPage:'+current.id,page)"));
 assert.ok(memory.includes('mountKeepsakeCollection('));
});
