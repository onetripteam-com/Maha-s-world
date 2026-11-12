import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sceneMoment,automaticLight} from '../js/room-moments.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('three real-world scenes change their copy with Kuwait-local time',()=>{
 const periods=['morning','afternoon','dusk','night'];
 for(const scene of ['story','kerala','bengaluru']){
  const lines=periods.map(period=>sceneMoment(period,scene));
  assert.equal(new Set(lines.map(x=>x.placeLine)).size,4);
  assert.ok(lines.every(x=>x.invitation&&x.placeLine));
 }
 assert.equal(automaticLight(4),'night');
 assert.equal(automaticLight(9),'daylight');
 assert.equal(automaticLight(14),'golden');
 assert.equal(automaticLight(19),'evening');
});
test('all three photographs use a shared light exposure without losing scene-specific grading',()=>{
 const css=read('css/scene-polish.css');
 for(const light of ['daylight','golden','evening','night','lamplight'])assert.ok(css.includes('data-light="'+light+'"'),light);
 for(const scene of ['story','kerala','bengaluru'])assert.ok(css.includes('data-theme="'+scene+'"'),scene);
 assert.match(css,/--scene-exposure/);
 assert.match(css,/max-width:960px/);
 const index=read('index.html');
 assert.ok(index.lastIndexOf('scene-polish.css')>index.lastIndexOf('three-rooms-and-hug.css'));
});
test('Garden measures on resize instead of during every paint frame',()=>{
 const js=read('js/garden.js');
 assert.match(js,/ResizeObserver/);
 assert.match(js,/scheduleResize/);
 assert.doesNotMatch(js,/function tick\(now\)\{if\(disposed\)return;resize\(\)/);
});
test('Radio owns audio and Rest persists calm settings without autoplay',()=>{
 const director=read('js/director.js'),radio=read('js/radio.js'),rest=read('js/rest.js');
 assert.doesNotMatch(director,/stopImmediatePropagation/);
 assert.match(radio,/radioLastStation/);
 for(const key of ['restLamp','restRainVolume','restComfortTab'])assert.ok(rest.includes(key),key);
 assert.match(rest,/rainArmed=false/);
});
