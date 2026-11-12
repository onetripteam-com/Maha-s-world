import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createMahaServer} from '../scripts/dev-server.mjs';

test('private preview merges the real MAHA CSS byte-for-byte in original order',async()=>{
 const original=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const paths=[...original.matchAll(/<link\s+rel="stylesheet"\s+href="\.\/(css\/[^"]+\.css)"\s*>/g)].map(m=>m[1]);
 assert.ok(paths.length>20,'MAHA should retain its original independent CSS files');
 const server=createMahaServer();
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const root='http://127.0.0.1:'+server.address().port;
  const home=await fetch(root+'/');
  const html=await home.text();
  assert.equal(home.status,200);
  assert.match(html,/__MAHA_PRIVATE_PREVIEW__/);
  assert.equal([...html.matchAll(/<link\s+rel="stylesheet"/g)].length,1);
  assert.match(html,/\.\/css\/maha-preview-bundle\.css/);
  const response=await fetch(root+'/css/maha-preview-bundle.css',{headers:{'Accept-Encoding':'br'}});
  assert.equal(response.status,200);
  assert.equal(response.headers.get('content-encoding'),'br');
  const combined=await response.text();
  const originalParts=await Promise.all(paths.map(path=>readFile(new URL('../'+path,import.meta.url),'utf8')));
  const exact=originalParts.map((css,i)=>'/* MAHA PREVIEW: '+paths[i]+' */\n'+css+'\n').join('\n');
  assert.equal(combined,exact,'Every selector and cascade override must be preserved exactly.');
  const sourceBytes=Buffer.byteLength(exact,'utf8');
  const encodedBytes=Number(response.headers.get('content-length'));
  assert.ok(sourceBytes>500000);
  assert.ok(encodedBytes<sourceBytes,'Brotli should reduce the tunneled transfer.');
  const etag=response.headers.get('etag');
  assert.equal((await fetch(root+'/css/maha-preview-bundle.css',{headers:{'If-None-Match':etag}})).status,304);
  assert.match((await fetch(root+'/assets/rooms/maha-kuwait.webp',{method:'HEAD'})).headers.get('cache-control'),/max-age=3600/);
 }finally{
  await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
 }
});
