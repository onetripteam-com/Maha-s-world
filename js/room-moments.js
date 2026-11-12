/** Contextual copy for Maha's room. No network, no personal profiling.
 * Uses local visit count and Kuwait-local time, never random on render.
 */
import {kuwaitParts} from './time.js';
const lines={
 morning:[
  ['Morning, Maha.','The day can start slowly. There is no attendance to mark.','A little sunshine is enough for the first page.'],
  ['You found your way back.','The kettle is imaginary. The good company is not.','A fresh morning, the same familiar corner.'],
  ['Another morning, another small detour.','Pick the thing you feel like. There are no assignments here.','You can start with the flowers, or with absolutely nothing.'],
  ['A quiet morning looks good on this place.','Something nice might be hiding among the ordinary things.','Today gets its own little chapter.']
 ],
 afternoon:[
  ['Hello again, Maha.','You can take a detour. The day will survive.','A tiny break from the very official business of living.'],
  ['Back for the afternoon shift?','Relax. This job has no manager and no deadlines.','A room for the in-between hours.'],
  ['A little daylight left to borrow.','Maybe a postcard. Maybe a ridiculous game. Your call.','The afternoon can have a subplot.'],
  ['A familiar place, a different afternoon.','Pick something small. Stay for as long as you like.','This hour deserves more than scrolling.']
 ],
 dusk:[
  ['Evening, explorer.','Come as you are. Leave the world outside for a minute.','Some evenings are better with a little detour.'],
  ['You made it back before the lights went low.','The radio is still here. So are your letters.','A sunset never asks how productive you were.'],
  ['The evening has started its slow song.','There is no good way or bad way to spend five minutes here.','Tonight has room for something good.'],
  ['Maha, the lamps are on.','Choose a place. No complicated plans required.','A good evening has tiny surprises.']
 ],
 night:[
  ['Still awake, Maha?','You can leave the day at the door for now.','A quiet corner is still a kind of adventure.'],
  ['The night shift is extremely unofficial.','No catching up necessary. Nothing here is in a rush.','A little light for a late hour.'],
  ['Look who found the night-time entrance.','Maybe one letter, maybe a little music, maybe just the lamp.','The city can carry on without you for a minute.'],
  ['The room remembered to leave a light on.','You needn’t be any particular version of yourself here.','A small good thing before tomorrow.']
 ]
};
export function copyForRoom(visits,date=new Date()){
 const {hour,minute}=kuwaitParts(date);
 const period=hour<5||hour>=21?'night':hour<12?'morning':hour<17?'afternoon':'dusk';
 const day=Number(kuwaitParts(date).date.replaceAll('-',''));
 const n=Math.max(1,Math.trunc(Number(visits)||1));
 const choices=lines[period];
 // First, second, third visits are deliberately different. Following visits
 // rotate by visit and local day so the room does not go stale for years.
 const ix=n<=3?n-1:((n+day)%choices.length+choices.length)%choices.length;
 const [heading,body,aside]=choices[ix];
 const label=n===1?'A FIRST LITTLE HELLO':n===2?'WELCOME BACK':n===3?'YOUR THIRD LITTLE DETOUR':'ANOTHER DAY, ANOTHER DOOR';
 return {period,heading,body,aside,label,clock:{hour,minute}};
}
export const LIGHT_CHOICES=[
 {id:'auto',name:'Kuwait time',hint:'Follow the day'},
 {id:'daylight',name:'Daylight',hint:'Clear and airy'},
 {id:'golden',name:'Golden hour',hint:'Warm and gentle'},
 {id:'evening',name:'Evening',hint:'Soft light'},
 {id:'night',name:'Night',hint:'Low and cosy'},
 {id:'lamplight',name:'Lamplight',hint:'Just the warm corners'}
];
export function automaticLight(hour){
 return hour<6||hour>=21?'night':hour<11?'daylight':hour<17?'golden':'evening';
}

/** Kuwait-local time changes the welcome; each scene keeps its own character. */
export function sceneMoment(period,scene){
 const invitation={
  morning:'A morning-sized escape. Choose your first little detour.',
  afternoon:'A tiny break in the middle of everything. Pick a door.',
  dusk:'The evening edition of your little escape is open.',
  night:'A quieter little escape. No hurry, no homework.'
 }[period]||'Your little escape, whenever you need it.';
 const scenes={
  story:{morning:'Kuwait wakes in soft Gulf light.',afternoon:'Warm city light, and a corner of your own.',dusk:'The Gulf catches the last gold of the day.',night:'The Kuwait skyline glows after dark.'},
  kerala:{morning:'Fresh leaves, a soft sky, and Kerala mornings.',afternoon:'A green little pause between the showers.',dusk:'The palms settle into the evening.',night:'Rain on the leaves. Everything else can wait.'},
  bengaluru:{morning:'Bengaluru opens its windows to a new day.',afternoon:'A Bangalore afternoon, with room for a detour.',dusk:'The city lights arrive, one by one.',night:'A quiet corner above a city still awake.'}
 };
 return {invitation,placeLine:scenes[scene]?.[period]||'A little place. Always here.'};
}
