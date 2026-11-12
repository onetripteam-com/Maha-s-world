import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {roomStudioMarkup} from '../js/room-studio.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('seven reachable desktop and mobile destinations, no fake dead doors',()=>{
 const html=roomStudioMarkup();const ids=['letters','music','movies','travel','games','garden','rest'];
 for(const id of ids)assert.match(html,new RegExp('data-studio-door="'+id+'"'));
 assert.equal((html.match(/class="studio-door"/g)||[]).length,7);
 assert.match(html,/aria-expanded="false"/);
 assert.match(html,/data-studio-action="theme"/);
 assert.match(html,/data-studio-action="flowers"/);
 assert.match(html,/data-studio-action="replay"/);
});
test('wide desktop layout preserves original room coordinates and routes through portal',()=>{
 const c=read('css/studio.css'),room=read('js/room.js');
 assert.match(c,/aspect-ratio:400\s*\/\s*780/);
 assert.match(c,/grid-column:2;grid-row:1/);
 assert.match(c,/@media\(min-width:760px\)/);
 assert.match(room,/roomStudioMarkup\(\)/);
 assert.match(room,/mountRoomStudio/);
 assert.match(room,/disposeStudio\(\)/);
});
test('themes have real illustrated previews, including all five new worlds',()=>{
 const c=read('css/studio.css'),sw=read('sw.js');
 for(const name of ['story','monsoon','sunroom','terracotta','midnight','cosmos']){
  assert.match(c,new RegExp('swatch-'+name+'\\{background-image:url'));
 }
 for(const name of ['monsoon','sunroom','terracotta','midnight','cosmos'])assert.match(sw,new RegExp('room-theme-'+name+'.svg'));
});
test('mobile drawer handles resize and focus invisibility',()=>{
 const code=read('js/room-studio.js'),css=read('css/studio.css');
 assert.match(code,/inner\.inert=narrow&&!open/);
 assert.match(code,/addEventListener\('change'/);
 assert.match(code,/portal\.open\(b\.dataset\.studioDoor,b\)/);
 assert.match(css,/@media\(max-width:759px\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
