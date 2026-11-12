import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const data=p=>JSON.parse(read(p));

test('new letter desk uses clear shelves without mutating saved progress keys',()=>{
 const js=read('js/letters.js');
 const css=read('css/postroom-redesign.css');
 assert.match(js,/class="letterbox-app postroom"/);
 assert.match(js,/class="postroom-side"/);
 assert.match(js,/\['inbox','Letters'/);
 assert.match(js,/\['openWhen','Open when…'/);
 assert.match(js,/\['specialDays','Special days'/);
 assert.match(js,/\['keepsakes','Saved'/);
 for(const name of ['lettersTab','keptLetters','futureNote','readLetter:'])assert.ok(js.includes(name),name);
 assert.match(js,/tabScroll\[activeTab\]/);
 assert.match(js,/class="letter-reader postroom-reader"/);
 assert.match(js,/data-open-letter/);
 assert.match(js,/data-toggle-transcript/);
 assert.match(css,/\.postroom-letter-grid/);
 assert.match(css,/\.postroom-desk-envelope/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(js,/Your long-distance nuisance/);
 assert.equal(data('content/config.json').senderName,'Your friend');
});

test('all published letters retain complete pages and their unlock rules',()=>{
 const letters=data('content/letters.json').letters;
 assert.equal(letters.length,27);
 assert.equal(new Set(letters.map(l=>l.id)).size,27);
 assert.ok(letters.every(l=>l.pages?.length>=2));
 assert.ok(letters.every(l=>l.preview?.length>=23&&!l.preview.includes('...')));
 assert.ok(letters.every(l=>l.unlock?.type));
 assert.equal(letters.filter(l=>l.section==='openWhen').length,14);
 assert.equal(letters.filter(l=>l.section==='inbox').length,7);
 assert.equal(letters.filter(l=>l.section==='quiet').length,1);
 assert.equal(letters.filter(l=>l.section==='occasion').length,5);
 assert.match(read('js/letters.js'),/quietVariant\(letters,config,now\(\)\)/);
});

test('new postroom CSS is last, available offline and supports phones',()=>{
 const index=read('index.html'),sw=read('sw.js'),css=read('css/postroom-redesign.css');
 assert.ok(index.indexOf('postroom-redesign.css')>index.indexOf('flora-rebuild.css'));
 assert.ok(sw.includes("'./css/postroom-redesign.css'"));
 assert.ok(sw.includes("'./assets/letters/ink-sprig.svg'"));
 assert.match(css,/ink-sprig\.svg/);
 assert.match(css,/postroom-reader-signoff/);
 assert.match(css,/@media\(max-width:759px\)/);
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/\.mail-tabs button/);
 assert.match(css,/\.reader-paper/);
 assert.match(css,/\.reader-pagination/);
 assert.match(css,/\.future-note textarea/);
});
