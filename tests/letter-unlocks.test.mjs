import test from 'node:test';
import assert from 'node:assert/strict';
import {unlocks,unlockStatus,kuwaitDay,quietLetterState,newlyUnlocked} from '../js/letter-unlocks.js';
const n=s=>new Date(s);
test('Kuwait date changes at UTC 21:00, not local device midnight',()=>{
 assert.equal(kuwaitDay(n('2026-10-23T20:59:00Z')),'2026-10-23');
 assert.equal(kuwaitDay(n('2026-10-23T21:01:00Z')),'2026-10-24');
});
test('always/date seals inclusive',()=>{
 assert.equal(unlocks({type:'always'},{}),true);
 assert.equal(unlocks({type:'date',on:'2027-07-07'},{},n('2027-07-06T17:00:00Z')),false);
 assert.equal(unlocks({type:'date',on:'2027-07-07'},{},n('2027-07-06T21:00:01Z')),true);
 assert.equal(unlockStatus({type:'date',on:'2027-07-09'},{},n('2027-07-06T21:02:00Z')).remaining,2);
});
test('visits rules count visits and remain locked until threshold',()=>{
 assert.equal(unlocks({type:'visits',n:5},{visits:4}),false);
 assert.equal(unlocks({type:'visits',n:5},{visits:5}),true);
 assert.equal(unlockStatus({type:'visits',n:5},{visits:2}).remaining,3);
});
test('daysAfterFirstVisit based on Kuwait calendar, not elapsed hours',()=>{
 const state={firstVisitAt:n('2026-10-01T20:50:00Z').getTime()};
 assert.equal(unlocks({type:'daysAfterFirstVisit',n:30},state,n('2026-10-30T20:55:00Z')),false);
 assert.equal(unlocks({type:'daysAfterFirstVisit',n:30},state,n('2026-10-30T21:03:00Z')),true);
});
test('game rule is pure',()=>{
 assert.equal(unlocks({type:'game',id:'chai'},{games:{chai:false}}),false);
 assert.equal(unlocks({type:'game',id:'chai'},{games:{chai:true}}),true);
});
test('quiet letter shows seven days before then moves to openwhen after 14 days',()=>{
 const date='2027-07-07';
 assert.equal(quietLetterState(date,n('2027-06-29T10:00:00Z')).visible,false);
 assert.equal(quietLetterState(date,n('2027-06-30T10:00:00Z')).section,'inbox');
 assert.equal(quietLetterState(date,n('2027-07-22T10:00:00Z')).section,'openWhen');
});
test('newly unlocked list requires 30 days absence',()=>{
 const letters=[{id:'one',unlock:{type:'daysAfterFirstVisit',n:30}},{id:'two',unlock:{type:'always'}}];
 const first=n('2026-08-01T00:00:00Z').getTime(),last=n('2026-08-18T00:00:00Z').getTime(),now=n('2026-10-01T00:00:00Z');
 assert.deepEqual(newlyUnlocked(letters,{firstVisitAt:first,visits:5},last,now).map(x=>x.id),['one']);
});