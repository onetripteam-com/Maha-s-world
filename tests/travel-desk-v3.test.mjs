import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const data=p=>JSON.parse(read(p));
test('travel is a responsive passport desk with real interactions',()=>{
 const travel=read('js/travel.js'),css=read('css/travel-desk-v3.css');
 for(const s of ['travel-passport','travel-places','travel-map','travel-postcards','travel-dreams'])
  assert.ok(travel.includes(s),s);
 for(const name of ['travel-passport-cover','passport-spread','passport-paper','atlas-board','atlas-watercolor','travel-place-card','travel-ticket-pocket','travel-postcard-detail','travel-dream-form'])
  assert.ok(travel.includes(name),name);
 assert.match(css,/@media\(max-width:759px\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/\.portal-back/);
});
test('art is original self-contained SVG, cached for offline and last in CSS order',()=>{
 for(const name of ['passport-cover.svg','postcard-kerala.svg','postcard-bangalore.svg','postcard-kuwait.svg']){
  const path='assets/travel/'+name;
  assert.ok(existsSync(new URL('../'+path,import.meta.url)),path);
  const svg=read(path);
  assert.match(svg,/<svg/);
  assert.match(svg,/viewBox=/);
  assert.doesNotMatch(svg,/href="https?:\/\//);
  assert.ok(read('sw.js').includes(path),path);
 }
 const html=read('index.html');
 assert.ok(html.includes('travel-desk-v4.css'));
 assert.ok(read('sw.js').includes('assets/travel/desk-walnut.svg'));
 assert.ok(read('sw.js').includes('assets/travel/compass-seal.svg'));
 assert.ok(html.lastIndexOf('travel-desk-v3.css')>html.lastIndexOf('letters-responsive-v2.css'));
 assert.ok(html.lastIndexOf('travel-desk-v4.css')>html.lastIndexOf('travel-desk-v3.css'));
 assert.ok(read('sw.js').includes('css/travel-desk-v3.css'));
});
test('original local progress, clip handling and geographic atlas are preserved',()=>{
 const travel=read('js/travel.js');
 for(const name of ['dreamPins','passportStamps','visitedPlaces','lastPostcard','postcardPinned'])
  assert.ok(travel.includes(name),name);
 assert.match(travel,/takeMedia/);assert.match(travel,/releaseMedia/);
 assert.match(travel,/maha:mutechange/);assert.match(travel,/world-atlas\.svg/);assert.match(travel,/data-zoom/);
 const p=data('content/places.json').places;
 assert.equal(p.length,10);
 for(const place of p){assert.ok(place.x>0&&place.x<100&&place.y>0&&place.y<100);assert.ok(place.geo&&typeof place.geo.longitude==='number');}
 for(const id of ['alleppey','mysore','jaipur'])assert.ok(p.find(x=>x.id===id)?.postcardBack);
});
test('unverified trips are not falsely claimed, dream notes remain local',()=>{
 const travel=read('js/travel.js');
 assert.match(travel,/NOT claimed journeys/);
 assert.match(travel,/not claims that you’ve been there/);
 assert.match(travel,/Private to this browser/);
 assert.doesNotMatch(travel,/localStorage\.clear\(/);
});

test('Escape respects an open native postcard dialog before closing the whole portal',()=>{
 const portal=read('js/portal.js');
 assert.match(portal,/portal\.querySelector\('dialog\[open\]'\)/);
});
