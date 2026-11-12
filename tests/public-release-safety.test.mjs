import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {join, extname} from 'node:path';
import {fileURLToPath} from 'node:url';

// Fail safely if material from the former private repository or credential-like
// strings accidentally enters content that could be served by GitHub Pages.
// This is NOT a substitute for a human review of private letters and images.
const root=fileURLToPath(new URL('../',import.meta.url));
const scannedRootFiles=['index.html','studio.html','sw.js','manifest.json','README.md','CREDITS.md'];
const scannedDirectories=['js','css','content','assets'];
const textTypes=new Set(['.js','.mjs','.css','.json','.html','.svg','.vtt','.txt','.md']);
const legacyPattern=/Habibiii|rawcdn\.githack\.com|onetripteam-com\.github\.io\/Habibiii/ig;
const sensitivePattern=/github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|-----BEGIN [\w ]*PRIVATE KEY-----|sk-[A-Za-z0-9]{30,}/ig;
const emailPattern=/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
function visit(dir,files=[]){
 for(const entry of readdirSync(dir,{withFileTypes:true})){
  if(entry.isSymbolicLink())continue;
  const path=join(dir,entry.name);
  if(entry.isDirectory())visit(path,files);
  else if(textTypes.has(extname(path).toLowerCase()))files.push(path);
 }
 return files;
}
test('public-facing MAHA source never links to the retired private repository or ships credential patterns',()=>{
 const files=[...scannedRootFiles.map(path=>join(root,path)),...scannedDirectories.flatMap(path=>visit(join(root,path)))];
 assert.ok(files.length>80,'All website code and text should be included in the publication scan');
 const violations=[];
 for(const path of files){
  const src=readFileSync(path,'utf8');
  const relative=path.slice(root.length);
  const old=src.match(legacyPattern);
  const secrets=src.match(sensitivePattern);
  const emails=src.match(emailPattern);
  if(old?.length)violations.push(relative+': old repository/CDN references');
  if(secrets?.length)violations.push(relative+': credential-like value');
  if(emails?.length)violations.push(relative+': email address; manually review before public release');
 }
 assert.deepEqual(violations,[],'Review these source files before publishing');
});
