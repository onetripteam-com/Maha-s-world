import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {festivalVisible,occasionVisible,annualDay,unlockStatus} from '../js/letter-unlocks.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const notes=JSON.parse(read('content/letters.json')).letters;
const at=s=>new Date(s);
test('every existing typed letter has seven different readable pages',()=>{
 assert.equal(notes.length,27);
 for(const l of notes){
  assert.equal(l.pages.length,7,l.id);
  assert.equal(new Set(l.pages).size,7,l.id);
  assert.ok(l.pages.every(p=>typeof p==='string'&&p.length>=40),l.id);
 }
});
test('birthday is only in Special days, and Open when keeps fourteen notes',()=>{
 const b=notes.find(l=>l.id==='when-birthday');
 assert.equal(b.section,'occasion');
 assert.equal(b.occasion,'birthday');
 assert.deepEqual(b.unlock,{type:'annual',month:7,day:7});
 assert.equal(notes.filter(l=>l.section==='openWhen').length,14);
 assert.equal(notes.filter(l=>l.section==='occasion').length,5);
 assert.equal(notes.filter(l=>l.section==='inbox').length,7);
});
test('July 7 unlock uses Kuwait midnight and repeats annually',()=>{
 const rule={type:'annual',month:7,day:7};
 assert.equal(annualDay(7,7,2027),'2027-07-07');
 assert.equal(unlockStatus(rule,{},at('2027-07-06T20:59:00Z')).open,false);
 assert.equal(unlockStatus(rule,{},at('2027-07-06T21:01:00Z')).open,true);
 assert.equal(unlockStatus(rule,{},at('2027-07-18T12:00:00Z')).open,false);
 assert.equal(unlockStatus(rule,{},at('2028-07-06T12:00:00Z')).open,false);
 assert.equal(unlockStatus(rule,{},at('2028-07-06T21:01:00Z')).open,true);
 assert.equal(occasionVisible(rule,at('2027-06-21T13:00:00Z')),true);
});
test('Christmas remains unlocked across New Year until ten days after',()=>{
 const rule={type:'festival',name:'christmas'};
 assert.equal(unlockStatus(rule,{},at('2026-12-24T20:59:00Z')).open,false);
 assert.equal(unlockStatus(rule,{},at('2026-12-24T21:01:00Z')).open,true);
 assert.equal(unlockStatus(rule,{},at('2027-01-03T12:00:00Z')).open,true);
 assert.equal(unlockStatus(rule,{},at('2027-01-04T21:01:00Z')).open,false);
 assert.equal(festivalVisible('christmas',at('2027-01-03T12:00:00Z')),true);
});
test('When you miss me remains present and the reader shows page progress',()=>{
 const l=notes.find(l=>l.id==='when-missing-me');
 assert.equal(l.title,'When you miss me');
 assert.match(l.pages.join(' '),/signed and witnessed/);
 const ui=read('js/letters.js');
 assert.match(ui,/readerProgress/);
 assert.match(ui,/specialDays\(\)/);
});
