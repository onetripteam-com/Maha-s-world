import test from 'node:test';import assert from 'node:assert/strict';
globalThis.window={get localStorage(){throw Error('private')}};
const {validateMemories}=await import('../js/memory.js');
test('valid keepsakes retain repeated flowers and notes',()=>{const data={flowers:Array(7).fill('jasmine'),dreamPins:[{name:'A place',x:30,y:40}],futureNote:'My note'};assert.deepEqual(Object.fromEntries(validateMemories({format:'maha-keepsakes',version:1,data})),data)});
test('reject malformed or unsafe backups before writing anything',()=>{for(const raw of [{},{format:'maha-keepsakes',version:2,data:{}},{format:'maha-keepsakes',version:1,data:{flowers:['rose']}},{format:'maha-keepsakes',version:1,data:{dreamPins:[null]}},{format:'maha-keepsakes',version:1,data:JSON.parse('{"__proto__":{}}')}])assert.throws(()=>validateMemories(raw));});
