import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const json=name=>JSON.parse(readFileSync(new URL(`content/${name}.json`,root),'utf8'));
const movies=json('movies').films, radio=json('radio').stations,places=json('places');
test('four films last 30 to 45 seconds, every shot follows previous without gaps',()=>{
 assert.equal(movies.length,4);
 for(const f of movies){assert.ok(f.duration>=30&&f.duration<=45);let t=0;for(const s of f.shots){assert.equal(s.at,t);assert.ok(s.duration>0);t+=s.duration}assert.equal(t,f.duration);assert.equal(f.video,null);}
});
test('four films have UTF-8 English and Malayalam VTT cues within timeline',()=>{
 for(const f of movies)for(const lang of ['en','ml']){
  const path=f.vtt[lang].replace(/^\.\//,'');const content=readFileSync(new URL(path,root),'utf8');assert.ok(content.startsWith('WEBVTT'));
  const cues=[...content.matchAll(/(\d\d):(\d\d):(\d\d)\.\d{3}\s+-->\s+(\d\d):(\d\d):(\d\d)\.\d{3}/g)];assert.equal(cues.length,f.shots.length);
  for(let i=0;i<cues.length;i++)assert.equal(Number(cues[i][1])*3600+Number(cues[i][2])*60+Number(cues[i][3]),f.shots[i].at);
 }
});
test('radio has five uniquely tuned stations with no copyrighted hosted streams',()=>{
 assert.equal(radio.length,5);assert.equal(new Set(radio.map(x=>x.frequency)).size,5);
 for(const s of radio){assert.equal(s.introAudio,null);assert.equal(s.ambientAudio,null);assert.equal(s.spotify,null);assert.equal(s.youtube,null);assert.doesNotMatch(s.introCaption,/\[[^\]]+\]/)}
});
test('travel has seven initial postcards including Nepal and six editable destination slots',()=>{
 assert.equal(places.places.length,7);assert.ok(places.places.some(p=>p.id==='nepal'));assert.equal(places.futureSlots.length,6);
 for(const p of places.places){assert.ok(p.x>=0&&p.x<=100);assert.ok(p.y>=0&&p.y<=100);assert.ok(p.prompt.startsWith('Film 10 seconds'));assert.ok(p.phrase);assert.equal(p.clip,null);assert.equal(p.still,null)}
});