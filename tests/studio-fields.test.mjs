import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {editableGroups,valueAt,updateTextAt,assertContentShape} from '../js/studio-fields.js';

const read=path=>JSON.parse(readFileSync(new URL('../content/'+path+'.json',import.meta.url),'utf8'));
const kinds=['today','letters','flowers','places','radio','movies','comfort','hug','config'];
const expected={
 today:40,letters:27,flowers:13,places:8,radio:6,movies:4,comfort:4,hug:3,config:1
};
for(const kind of kinds){
 test('Content Studio safely indexes '+kind+' editable copy',()=>{
  const doc=read(kind),groups=editableGroups(kind,doc);
  assert.equal(groups.length,expected[kind]);
  assert.ok(groups.every(group=>group.fields.length>0));
  assert.ok(groups.every(group=>group.fields.every(f=>typeof valueAt(doc,f.path)==='string')));
  assertContentShape(doc,JSON.parse(JSON.stringify(doc)));
 });
}
test('letter pages and cinema captions are editable without changing structural metadata',()=>{
 for(const [kind,predicate] of [
  ['letters',f=>f.label==='Page 1'],
  ['movies',f=>f.label==='Scene 1 caption'],
  ['radio',f=>f.label==='Introduction'],
  ['comfort',f=>f.label==='Suggestion 1'],
  ['hug',f=>f.label==='Hero first line']
 ]){
  const before=read(kind),after=JSON.parse(JSON.stringify(before));
  const chosen=editableGroups(kind,after).flatMap(g=>g.fields).find(predicate);
  assert.ok(chosen,'missing field in '+kind);
  updateTextAt(after,chosen.path,'Revised copy kept private');
  assert.equal(valueAt(after,chosen.path),'Revised copy kept private');
  assertContentShape(before,after);
  assert.notDeepEqual(after,before);
 }
});
test('cannot change letter identity, erase pages or change text into executable objects',()=>{
 const original=read('letters');
 const dropped=JSON.parse(JSON.stringify(original));
 dropped.letters[0].pages.pop();
 assert.throws(()=>assertContentShape(original,dropped),/count changed/);
 const renamed=JSON.parse(JSON.stringify(original));
 renamed.letters[0].id='unexpected';
 assert.throws(()=>assertContentShape(original,renamed),/identity/);
 const wrongType=JSON.parse(JSON.stringify(original));
 wrongType.letters[0].pages[0]={code:'invalid'};
 assert.throws(()=>assertContentShape(original,wrongType),/field type changed/);
});
test('editor refuses to mutate non-text values',()=>{
 const movie=read('movies');
 assert.throws(()=>updateTextAt(movie,['films',0,'duration'],'2'),/not editable text/);
 const original=movie.films[0].duration;
 assert.equal(movie.films[0].duration,original);
});
test('no automatic publisher or remote host is included in Content Studio',()=>{
 const js=readFileSync(new URL('../js/content-studio.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../studio.html',import.meta.url),'utf8');
 assert.ok(js.includes("from './studio-fields.js'"));
 assert.ok(html.includes('studio-preview-after'));
 assert.ok(html.includes('studio-undo'));
 assert.ok(!js.includes('https://raw'));
 assert.ok(!js.includes('Authorization:'));
});
