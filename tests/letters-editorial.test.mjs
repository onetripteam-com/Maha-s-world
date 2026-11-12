import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const letters=JSON.parse(read('content/letters.json')).letters;
test('the main shelf has exactly seven complete, distinctive everyday notes',()=>{
 const inbox=letters.filter(l=>l.section==='inbox');
 assert.equal(inbox.length,7);
 for(const l of inbox){assert.ok(l.pages.length>=2,l.id);assert.ok(l.pages.every(p=>p.length>40),l.id);}
 assert.ok(inbox.find(l=>l.id==='five-visits'));
 assert.ok(inbox.find(l=>l.id==='handwritten-thirty'));
 assert.ok(inbox.find(l=>l.id==='a-day-in-2027'));
});
test('the 30-day letter is finished and promises no missing handwritten asset',()=>{
 const letter=letters.find(l=>l.id==='handwritten-thirty');
 assert.equal(letter.unlock.type,'daysAfterFirstVisit');
 assert.equal(letter.unlock.n,30);
 assert.doesNotMatch(letter.pages.join(' '),/promise of better stationery|\[ADD|placeholder/i);
});
test('fixed future date and major festival rules remain untouched',()=>{
 const future=letters.find(l=>l.id==='a-day-in-2027');
 assert.deepEqual(future.unlock,{type:'date',on:'2027-07-07'});
 assert.deepEqual(letters.find(l=>l.id==='christmas-for-maha').unlock,{type:'festival',name:'christmas'});
 assert.deepEqual(letters.find(l=>l.id==='easter-for-maha').unlock,{type:'festival',name:'easter'});
});
test('open when has two curated groups of seven, with future additions visible',()=>{
 const js=read('js/letters.js');
 assert.equal(letters.filter(l=>l.section==='openWhen').length,14);
 const names=[...js.matchAll(/'when-(?:tired|miss-home|nervous|cant-sleep|overthinking|stuck|forgot-yourself|great-news|laugh|finished-big|raining|change-scene|first-vlog|missing-me)'/g)].map(m=>m[0].slice(1,-1));
 assert.equal(new Set(names).size,14);
 assert.match(js,/More for another day/);
 assert.ok(!letters.some(l=>l.section==='openWhen'&&l.id==='when-birthday'));
 assert.deepEqual(letters.find(l=>l.id==='when-birthday').unlock,{type:'annual',month:7,day:7});
});
test('reader labels centre Maha and public site has no admin token',()=>{
 const js=read('js/letters.js');
 assert.match(js,/A LITTLE NOTE FOR MAHA/);
 assert.match(js,/A LITTLE NOTE, JUST FOR YOU/);
 assert.doesNotMatch(js,/FROM \$\{esc\(config.senderName/);
 assert.match(read('README.md'),/GitHub/);
});
