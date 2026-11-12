import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Travel has one native vertical scroll area, without clipped overflow traps',()=>{
 const css=read('css/travel-desk-v4.css');
 assert.match(css,/portal-place>\.portal-content/);
 assert.match(css,/overflow-y:auto!important/);
 assert.match(css,/touch-action:pan-y!important/);
 assert.match(css,/position:absolute!important/);
 assert.match(css,/height:auto!important;min-height:100%/);
 assert.match(css,/overflow:visible!important/);
});
test('Section navigation scrolls portal content explicitly, not hidden ancestors',()=>{
 const js=read('js/travel.js');
 assert.match(js,/closest\('\.portal-content'\)/);
 assert.match(js,/scroller\.scrollTo\(\{top/);
 assert.doesNotMatch(js,/\.scrollIntoView\(/);
 assert.match(js,/scrollTo\('dreams'\)/);
});
test('Cover and open spread preserve local stamps, dream pins and postcard saving',()=>{
 const js=read('js/travel.js');
 assert.match(js,/travel-cover-gallery/);
 assert.match(js,/passport-greeting/);
 assert.match(js,/travel-desk-v4/);
 assert.match(js,/stampVisit\(selected\);redrawSpread\(\);/);
 assert.match(js,/travel-map-legend/);
 assert.match(js,/visitedPlaces/);
 assert.match(js,/dreamPins/);
});
test('V4 hand-authored paper and wood assets are cached offline',()=>{
 const css=read('css/travel-desk-v4.css');
 for(const p of ['assets/travel/desk-walnut.svg','assets/travel/compass-seal.svg']){
  assert.match(read(p),/<svg/);
  assert.ok(css.includes(p.split('/').pop()),p);
  assert.ok(read('sw.js').includes(p),p);
 }
 const html=read('index.html');
 assert.ok(html.indexOf('travel-desk-v4.css')>html.indexOf('travel-desk-v3.css'));
 assert.match(css,/@media\(max-width:759px\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
