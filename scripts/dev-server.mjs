/**
 * MAHA private preview: one optimized site, no external host or packages.
 * Keeps all original CSS files untouched and concatenates them in declaration
 * order for this LOCAL preview only. Editing files invalidates the bundle.
 */
import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {readFile,realpath,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {brotliCompressSync,gzipSync,constants} from 'node:zlib';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const BUNDLE_PATH='css/maha-preview-bundle.css';
const TYPES={
 '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8',
 '.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg',
 '.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif',
 '.ico':'image/x-icon','.webmanifest':'application/manifest+json',
 '.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg',
 '.mp4':'video/mp4','.webm':'video/webm','.vtt':'text/vtt; charset=utf-8',
 '.woff':'font/woff','.woff2':'font/woff2'
};
const FORBIDDEN=new Set(['.git','.github','node_modules','scripts','tests','qa']);
const COMPRESSED_TYPES=new Set(['.html','.css','.js','.json','.svg','.vtt','.webmanifest']);
const LONG_CACHE_TYPES=new Set(['.png','.jpg','.jpeg','.webp','.gif','.ico','.woff','.woff2']);
const STYLE_LINK=/<link\s+rel="stylesheet"\s+href="\.\/(css\/[^"]+\.css)"\s*>/g;
const PREVIEW_TAG='<script>window.__MAHA_PRIVATE_PREVIEW__=true;if("serviceWorker"in navigator){navigator.serviceWorker.getRegistration("./").then(function(reg){if(reg)reg.unregister();}).catch(function(){});}</script>';
const within=(root,path)=>path===root||path.startsWith(root+sep);

function encodingFor(req,canCompress){
 if(!canCompress)return null;
 const accept=req.headers['accept-encoding']||'';
 return /\bbr\b/i.test(accept)?'br':/\bgzip\b/i.test(accept)?'gzip':null;
}
function compress(buffer,encoding){
 if(encoding==='br')return brotliCompressSync(buffer,{params:{[constants.BROTLI_PARAM_QUALITY]:4}});
 if(encoding==='gzip')return gzipSync(buffer,{level:4});
 return buffer;
}
function respondBytes(req,res,body,{type,etag,modified,cache,encoding}){
 const headers={
  'Content-Type':type,'Cache-Control':cache,'ETag':etag,
  'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',
  'X-Robots-Tag':'noindex, nofollow','Vary':'Accept-Encoding'
 };
 if(modified)headers['Last-Modified']=modified;
 if(req.headers['if-none-match']===etag){
  res.writeHead(304,headers);res.end();return;
 }
 const result=encoding?compress(body,encoding):body;
 if(encoding)headers['Content-Encoding']=encoding;
 headers['Content-Length']=result.length;
 res.writeHead(200,headers);
 res.end(req.method==='HEAD'?undefined:result);
}

export function createMahaServer({root=ROOT}={}){
 const projectRoot=resolve(root);
 let cachedBundle=null;
 async function getStyles(){
  const html=await readFile(resolve(projectRoot,'index.html'),'utf8');
  const paths=[...html.matchAll(STYLE_LINK)].map(m=>m[1]);
  if(paths.length<2)return null;
  const sourceFiles=await Promise.all(paths.map(async path=>{
   const absolute=resolve(projectRoot,path);
   if(!within(projectRoot,absolute))throw Error('Invalid stylesheet path');
   const real=await realpath(absolute);
   if(!within(projectRoot,real))throw Error('Stylesheet leaves project');
   return {path,real,info:await stat(real)};
  }));
  const signature=paths.join('|')+'|'+sourceFiles.map(x=>x.info.size+':'+x.info.mtimeMs).join('|');
  if(cachedBundle?.signature===signature)return cachedBundle;
  const contents=await Promise.all(sourceFiles.map(x=>readFile(x.real,'utf8')));
  // @import/@charset placement changes meaning when concatenated. In that
  // case use the original independent links rather than risk visual changes.
  if(contents.some(css=>/@(?:import|charset)\b/i.test(css)))return null;
  const joined=contents.map((css,i)=>'/* MAHA PREVIEW: '+paths[i]+' */\n'+css+'\n').join('\n');
  const body=Buffer.from(joined,'utf8');
  const etag='W/"maha-bundle-'+createHash('sha256').update(body).digest('hex').slice(0,24)+'"';
  cachedBundle={signature,body,etag,paths};
  return cachedBundle;
 }
 async function serve(req,res){
  const fail=(code,message)=>{
   res.writeHead(code,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store',
    'X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'});
   res.end(message);
  };
  if(req.method!=='GET'&&req.method!=='HEAD')return fail(405,'Only GET and HEAD are supported.');
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}
  catch{return fail(400,'Invalid URL.');}
  if(pathname.includes('\\')||pathname.includes('\0')||pathname.split('/').some(part=>part==='..'))return fail(403,'Forbidden path.');
  const segments=pathname.split('/').filter(Boolean);
  if(segments.some(part=>part.startsWith('.')||FORBIDDEN.has(part)))return fail(403,'This is a private project file.');
  const relative=segments.length?segments.join('/'):'index.html';
  const candidate=resolve(projectRoot,relative);
  if(!within(projectRoot,candidate))return fail(403,'Forbidden path.');
  const extension=extname(candidate).toLowerCase(),type=TYPES[extension];
  if(!type)return fail(404,'Not a website resource.');
  try{
   if(relative===BUNDLE_PATH){
    const bundle=await getStyles();
    if(!bundle)return fail(404,'Preview stylesheet bundle unavailable.');
    respondBytes(req,res,bundle.body,{type,etag:bundle.etag,cache:'private, no-cache',
     encoding:encodingFor(req,true)});
    return;
   }
   const real=await realpath(candidate);
   if(!within(projectRoot,real))return fail(403,'Forbidden path.');
   const info=await stat(real);
   if(!info.isFile())return fail(404,'Not found.');
   if(relative==='index.html'){
    let html=await readFile(real,'utf8');
    const bundle=await getStyles().catch(()=>null);
    if(bundle){
     let first=true;
     html=html.replace(STYLE_LINK,()=>first?(first=false,'<link rel="stylesheet" href="./'+BUNDLE_PATH+'">'):'');
    }
    html=html.replace('<script type="module"',PREVIEW_TAG+'\n  <script type="module"');
    const body=Buffer.from(html,'utf8');
    const etag='W/"maha-preview-'+createHash('sha256').update(body).digest('hex').slice(0,24)+'"';
    respondBytes(req,res,body,{type,etag,cache:'private, no-cache',
     encoding:encodingFor(req,true)});
    return;
   }
   // Source code and text are revalidated on refresh; heavy photographs can
   // stay in the browser cache during repeated room visits.
   const cache=LONG_CACHE_TYPES.has(extension)?
    'private, max-age=3600, must-revalidate':'private, no-cache';
   const etag='W/"'+info.size+'-'+Math.trunc(info.mtimeMs)+'"';
   const modified=info.mtime.toUTCString();
   const headers={
    'Content-Type':type,'Cache-Control':cache,'ETag':etag,
    'Last-Modified':modified,'X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow'
   };
   if(req.headers['if-none-match']===etag){
    res.writeHead(304,headers);res.end();return;
   }
   const encoding=encodingFor(req,COMPRESSED_TYPES.has(extension));
   if(encoding){
    const bytes=await readFile(real);
    respondBytes(req,res,bytes,{type,etag,modified,cache,encoding});
    return;
   }
   res.writeHead(200,{...headers,'Content-Length':info.size});
   if(req.method==='HEAD'){res.end();return;}
   const stream=createReadStream(real);
   stream.on('error',()=>res.destroy());
   stream.pipe(res);
  }catch(err){
   if(err?.code==='ENOENT'||err?.code==='ENOTDIR')return fail(404,'Not found.');
   console.error('MAHA preview server resource error',err);
   return fail(500,'The preview resource could not be opened.');
  }
 }
 return createServer(serve);
}

const direct=process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url;
if(direct){
 const envPort=Number(process.env.MAHA_PORT||4173);
 if(!Number.isInteger(envPort)||envPort<1024||envPort>65535){
  console.error('Choose MAHA_PORT between 1024 and 65535.');
  process.exitCode=1;
 }else{
  const server=createMahaServer();
  server.on('error',error=>{console.error('Could not open MAHA preview:',error.message);process.exitCode=1;});
  server.listen(envPort,'127.0.0.1',()=>{
   console.log('MAHA private preview:   http://127.0.0.1:'+envPort+'/');
   console.log('Content Atelier:       http://127.0.0.1:'+envPort+'/studio.html');
   console.log('Faster cached photos, compressed assets and a single ordered CSS file.');
   console.log('Only accessible from this Codespace/computer. Ctrl+C stops the server.');
  });
 }
}
