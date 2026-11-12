import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Garden uses real input events and visualViewport rather than keydown to grow glyphs',()=>{
 const x=read('js/garden.js');assert.match(x,/addEventListener\('input',onInput\)/);assert.match(x,/window\.visualViewport/);assert.match(x,/maxlength="\$\{MAX\}"/);assert.match(read('css/style.css'),/font-size:16px/);assert.match(x,/growth|elapsed|progress/);
});
test('Garden creates wallpaper at iPhone native pixels and Kuwait date',()=>{
 const x=read('js/garden.js');assert.match(x,/w=1179,h=2556/);assert.match(x,/kuwaitParts\(\)\.date/);assert.match(x,/image\/png/);assert.match(x,/gardenPalette/);
});
test('Garden shares Travel dream pin local format and does not persist Let it go phrases',()=>{
 const x=read('js/garden.js');assert.match(x,/store\.get\('dreamPins'/);assert.match(x,/store\.set\('dreamPins'/);assert.doesNotMatch(x,/store\.set\(['"]release/);
});
test('Rest is opt-in synthetic local audio respecting mute and mutual exclusion',()=>{
 const x=read('js/rest.js');assert.match(x,/audioContext\.createBuffer/);assert.match(x,/isMediaMuted\(\)/);assert.match(x,/takeMedia\(voice\)/);assert.match(x,/stopRain\(\);voiceBusy=true/);assert.match(x,/maha:mutechange/);assert.match(x,/rainArmed/);
});
test('Rest preserves four-four-six breathing rhythm without claims or streaks',()=>{
 const x=read('js/rest.js');assert.match(x,/\['Inhale',4000\],\['Hold',4000\],\['Exhale',6000\]/);assert.match(x,/cancelAnimationFrame\(raf\)/);assert.doesNotMatch(x,/streak/i);
});
test('Comfort content has own-voice placeholder, with no external audio or copyrighted tracks',()=>{
 const x=JSON.parse(read('content/comfort.json'));for(const k of ['shows','snacks','songs'])assert.ok(Array.isArray(x[k])&&x[k].length>0);assert.equal(x.voice.src,'');assert.equal(x.rain.src,'');
});
test('Rest routes random mini game into six-cabinet arcade',()=>{
 const portal=read('js/portal.js'),arcade=read('js/arcade.js');assert.match(portal,/nextArcadeId=choices\[Math\.floor\(Math\.random\(\)\*choices\.length\)\]/);assert.match(arcade,/autoPlayId/);
});
test('Service worker pre-caches new offline places and data',()=>{
 const sw=read('sw.js');for(const p of ['js/garden.js','js/rest.js','content/comfort.json'])assert.ok(sw.includes(p),p);
});
