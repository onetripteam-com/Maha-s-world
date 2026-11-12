import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const data=p=>JSON.parse(read('content/'+p+'.json'));

test('all curated flowers have distinct matching botanical illustrations; no mislabeled orange bloom',()=>{
 const flowers=data('flowers'), botanical=read('js/botanical.js');
 assert.equal(flowers.length,13);
 assert.equal(new Set(flowers.map(f=>f.id)).size,flowers.length);
 assert.ok(flowers.some(f=>f.id==='frangipani'&&f.name==='Frangipani'));
 assert.ok(!flowers.some(f=>/marigold/i.test(f.id+' '+f.name+' '+f.meaning)));
 for(const flower of flowers){
  assert.match(botanical,new RegExp("case '"+flower.id+"':"),flower.name+' needs its own blossom geometry');
  assert.match(botanical,new RegExp("\\b"+flower.id+":\\["),flower.name+' needs its own color palette');
 }
 assert.match(botanical,/Cupped, ruffled rose petals/);
 assert.doesNotMatch(botanical,/ring\(8,16,44,18,uid,0,11\)/);
 assert.match(read('js/main.js'),/frangipani/,'Existing local bouquets should migrate safely');
});

test('world atlas, landmark art and postcard messages cover every stop',()=>{
 const places=data('places').places,ids=places.map(p=>p.id);
 assert.equal(places.length,10);
 assert.ok(ids.includes('alleppey')&&ids.includes('mysore')&&ids.includes('jaipur'));
 assert.match(read('assets/travel/world-atlas.svg'),/NORTH AMERICA/);
 assert.match(read('CREDITS.md'),/Menelabs VectorAtlas/);
 const sw=read('sw.js'),travel=read('js/travel.js');
 assert.match(travel,/world-atlas\.svg/);
 for(const p of places){
  assert.ok(p.postcardBack?.length>50,p.name+' needs its own witty postcard back');
  const art='assets/travel/landmark-'+p.id+'.svg';
  assert.ok(existsSync(new URL('../'+art,import.meta.url)),art+' must exist');
  assert.match(read(art),/viewBox=/);
  assert.ok(sw.includes(art),art+' must be available offline');
  assert.ok(Math.abs(p.x-(p.geo.longitude+180)/3.6)<.02,'Longitude pin mismatch: '+p.id);
  assert.ok(Math.abs(p.y-(57.45-p.geo.latitude*.555))<.02,'Latitude pin mismatch: '+p.id);
 }
 assert.ok(sw.includes('assets/travel/world-atlas.svg'));
});

test('passport, better letter navigation and private dream page are real features',()=>{
 const cover=read('assets/travel/passport-cover.svg');
 assert.match(cover,/Yum/);
 assert.match(cover,/airplane/);
 const portal=read('js/portal.js');
 assert.match(portal,/Back to room/);
 const css=read('css/letters-responsive-v2.css');
 assert.match(css,/portal-back-arrow/);
 assert.match(css,/@media\(max-width:759px\)/);
 const travel=read('js/travel.js');
 assert.match(travel,/data-dream-quick/);
 assert.match(travel,/data-dream-form.*data-dream-quick/);
 assert.match(read('js/studio-fields.js'),/postcardBack/);
});
