/** One active owned media element. No autoplay. Browser-local only. */
import {setAudioDucked} from './audio.js';
let current=null;
export function takeMedia(element){
 if(current&&current!==element){try{current.pause()}catch{}}
 current=element;setAudioDucked(true);
}
export function releaseMedia(element){
 if(!element||current===element){if(current){try{current.pause()}catch{}}current=null;setAudioDucked(false)}
}
export function isMediaMuted(){try{return JSON.parse(localStorage.getItem('maha.escape.v1.muted')||'true')===true}catch{return false}}
