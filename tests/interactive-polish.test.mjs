import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('mobile panorama uses finger tracking plus separate eased release',()=>{
 const js=read('js/pocket-peek.js');
 const css=read('css/experience-polish.css');
 assert.match(js,/setPointerCapture/);
 assert.match(js,/const animateTo=/);
 assert.match(js,/const onCancel=/);
 assert.match(js,/blockClickUntil/);
 assert.match(js,/ResizeObserver/);
 assert.doesNotMatch(js,/stopAt|Math\.round\([^)]*\*4\)/);
 assert.match(css,/room-is-dragging/);
 assert.match(css,/touch-action:pan-y/);
 const newCamera=read('css/arrival-and-kuwait.css');
 assert.match(newCamera,/transition:none!important/);
});
test('all three photographed worlds render the current chosen bouquet, without Kuwait image ghosts',()=>{
 const room=read('js/room-photo-stage.js');
 const petals=read('js/photo-bouquet.js');
 const css=read('css/experience-polish.css');
 assert.match(room,/flowerLayer\.hidden=false/);
 assert.match(room,/photoBloomsMarkup\(chosen,spriteScene\)/);
 assert.doesNotMatch(room,/flowerLayer\.hidden=id!=='story'/);
 assert.match(petals,/maha-stem-neck/);
 assert.doesNotMatch(petals,/<image href=|maha-real-rim/);
 for(const scene of ['story','kerala','bengaluru'])assert.ok(css.includes('data-theme="'+scene+'"'),scene);
});
test('courier is a genuine illustrated whale with four decorative butterflies',()=>{
 const hug=read('js/hug.js');
 for(const p of ['assets/whale-courier.svg','assets/butterfly-courier.svg'])assert.ok(existsSync(new URL('../'+p,import.meta.url)));
 assert.match(hug,/whale-courier\.svg/);
 assert.match(hug,/butterfly-courier\.svg/);
 assert.equal((hug.match(/class="flutter flutter-/g)||[]).length,4);
 assert.match(read('css/experience-polish.css'),/prefers-reduced-motion:reduce/);
});
test('flower picker retains seven unique positions, duplicate selection and a live response',()=>{
 const picker=read('js/flowers.js');
 assert.match(picker,/flower-steps/);
 assert.match(picker,/Array\.from\(\{length:7\}/);
 assert.match(picker,/const repeats=chosen\.filter/);
 assert.match(picker,/floristWords/);
 assert.match(picker,/chosen\.push\(f\.id\)/);
 assert.match(picker,/aria-live="polite"/);
});
test('new assets are listed in offline shell and last in stylesheet order',()=>{
 const html=read('index.html'),sw=read('sw.js');
 assert.ok(html.lastIndexOf('experience-polish.css')>html.lastIndexOf('scene-polish.css'));
 for(const asset of ['experience-polish.css','whale-courier.svg','butterfly-courier.svg'])assert.ok(sw.includes(asset),asset);
});

test('Word Garden belongs to the upper indoor plant, never overlaps the bouquet hotspot',()=>{
 const room=read('js/room-photo-stage.js');
 const placements=[
  ['story',41,12,16,20,43,57],
  ['kerala',43,14,16,21,49,52],
  ['bengaluru',40,12,18,21,46,54]
 ];
 for(const [scene,x,y,w,h,flowerX,flowerY] of placements){
  assert.ok(room.includes('garden:['+x+','+y+','+w+','+h+']'),scene+' should place Garden over upper foliage');
  assert.ok(y+h+10<flowerY,scene+' Garden and vase touch targets need a generous vertical gap');
  assert.ok(flowerX>=0);
 }
 const css=read('css/arrival-and-kuwait.css');
 assert.ok(css.includes('[data-door="garden"] .object-label'));
 assert.ok(css.includes('left:calc(100% + 10px)!important'));
 assert.match(css,/hover:none/);
 assert.ok(room.includes("title:'The indoor palm · word garden'"));
});

test('the three photo rooms never paste legacy photo cutouts over plants or curtains',()=>{
 const room=read('js/room-photo-stage.js');
 const css=read('css/arrival-and-kuwait.css');
 assert.doesNotMatch(room,/className='living-leaf-sway'/,
  'Photo-plane must not mount old image-sampled plant layers');
 assert.match(css,/\.living-photo-plane::before,/);
 assert.match(css,/\.living-leaf-sway::before,/);
 assert.match(css,/\.living-leaf-sway::after\{/);
 assert.match(css,/content:none!important/);
 assert.match(css,/background-image:none!important/);
 assert.match(css,/animation:none!important/);
 // Intentional light gradients remain: the fix must not delete atmosphere.
 assert.match(room,/className='scene-atmosphere'/);
 assert.match(room,/layer\.append\(atmosphere\)/);
});
