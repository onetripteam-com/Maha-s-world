import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.window={get localStorage(){throw Error('blocked')}};
const {store}=await import('../js/store.js');
const {keepsakeItems}=await import('../js/keepsake-collection.js');
test('keepsake collection is derived from existing saved records',()=>{
 store.set('flowers',Array(7).fill('jasmine'));
 store.set('keptLetters',['letter-1']);
 store.set('gameCompletions',{chai:true,sadya:false});
 const items=keepsakeItems();
 assert.ok(items.some(x=>x.type==='flowers'));
 assert.ok(items.some(x=>x.type==='letters'));
 assert.ok(items.some(x=>x.type==='arcade'));
});
test('user notes are escaped instead of inserted as HTML',()=>{
 store.set('dreamPins',[{name:'<img src=x onerror=alert(1)>',x:20,y:20}]);
 assert.ok(keepsakeItems().find(x=>x.type==='dreams').detail.includes('&lt;img'));
});
