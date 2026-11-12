import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SADYA_SPOTS,SADYA_DISHES,placeSadya,BAG_ITEMS,canPack,BAG_MAX_KG,baggageScore,rotatedCells} from '../js/games/rules.js';
import {unlocks} from '../js/letter-unlocks.js';
test('sadya layout follows one explicit nine-dish leaf arrangement',()=>{
 assert.equal(SADYA_SPOTS.length,9);assert.equal(SADYA_DISHES.length,9);
 for(const dish of SADYA_DISHES){assert.equal(placeSadya(dish.id,dish.id,{}),true);assert.equal(placeSadya(dish.id,'nonexistent',{}),false)}
 assert.equal(SADYA_SPOTS.find(x=>x.id==='rice').y>50,true);
 assert.equal(SADYA_SPOTS.find(x=>x.id==='chips').x<50,true);
 assert.equal(placeSadya('rice','rice',{rice:true}),false);
});
test('baggage fitting blocks overweight and overlap',()=>{
 const c=BAG_ITEMS.find(x=>x.id==='cooker'); const a=canPack(c,0,0,{},false,10);
 assert.deepEqual(a,{ok:false,why:'weight'});
 const b=canPack(c,0,0,{},false,0);assert.equal(b.ok,true);
 const k=Object.fromEntries(b.cells.map(([x,y])=>[`${x},${y}`,c.id]));
 assert.deepEqual(canPack(BAG_ITEMS[0],0,0,k,false,0),{ok:false,why:'overlap'});
 assert.deepEqual(canPack(c,4,5,{},false,0),{ok:false,why:'edge'});
 assert.equal(BAG_MAX_KG,14);
});
test('rotations are normalized and score rewards packing',()=>{
 assert.deepEqual(rotatedCells([[0,0],[1,0],[2,0]],true),[[0,0],[0,1],[0,2]]);
 assert.ok(baggageScore(5,8,50)>baggageScore(4,8,50));
});
test('chai stamp unlocks game-rule Letter and is local-only',()=>{
 const rule={type:'game',id:'chai'};
 assert.equal(unlocks(rule,{games:{}},new Date('2027-01-01T11:00:00Z')),false);
 assert.equal(unlocks(rule,{games:{chai:true}},new Date('2027-01-01T11:00:00Z')),true);
});