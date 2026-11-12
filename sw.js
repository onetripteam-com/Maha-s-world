/* MAHA offline shell. Network-first for code/content prevents stale design after a deploy; local cache remains available offline. */
const VERSION='maha-worlds-v21.1.0';
const BASE=new URL('./',self.location.href).href;
const FILES=[
 './studio.html','./js/content-studio.js','./js/studio-fields.js','./css/content-studio.css','./js/keepsake-collection.js','./css/keepsake-collection.css','./js/memory.js','./css/remembering-home.css','./css/atelier.css','./js/atelier-art.js','./js/atelier-life.js','./js/cinematic-home.js','./css/cinematic-room.css','./css/physical-room.css','./css/worlds-director.css','./css/directors-rebuild.css','./css/wide-worlds.css','./css/bouquet-grounding.css','./css/maha-world-2026.css','./css/room-touch-and-rest.css','./css/living-room-photo.css','./css/room-finishing.css','./css/three-rooms-and-hug.css','./css/scene-polish.css','./css/experience-polish.css','./css/arrival-and-kuwait.css','./css/flora-rebuild.css','./css/postroom-redesign.css','./css/letters-responsive-v2.css','./css/travel-desk-v3.css','./css/travel-desk-v4.css','./assets/travel/desk-walnut.svg','./assets/travel/compass-seal.svg','./assets/travel/passport-cover.svg','./assets/travel/postcard-kerala.svg','./assets/travel/postcard-bangalore.svg','./assets/travel/postcard-kuwait.svg','./assets/letters/ink-sprig.svg','./assets/rooms/maha-kuwait.webp','./assets/whale-courier.svg','./assets/butterfly-courier.svg','./assets/rooms/maha-kerala.webp','./assets/rooms/maha-bengaluru.webp','./assets/rooms/maha-welcome.webp','./js/photo-bouquet.js','./js/room-photo-stage.js','./assets/rooms/maha-living-room.webp','./js/room-moments.js','./assets/atlas-region.svg','./js/physical-room-objects.js','./js/botanical-miniatures.js','./js/pocket-peek.js','./js/original-room-art.js',
 './assets/rooms/originals/manifest.json',
 './assets/rooms/story.webp','./assets/rooms/monsoon.webp','./assets/rooms/sunroom.webp','./assets/rooms/terracotta.webp','./assets/rooms/midnight.webp','./assets/rooms/cosmos.webp','./','./index.html','./css/style.css','./css/refresh.css','./css/new-home.css','./js/main.js','./js/hug.js','./js/flowers.js',
 './js/botanical.js','./js/room.js','./js/new-home.js','./js/home-art.js','./js/room-studio.js','./js/store.js','./js/time.js',
 './js/letters.js','./js/letter-unlocks.js','./content/letters.json','./content/config.json','./assets/letters/handwritten-placeholder.svg','./js/audio.js','./js/animation.js','./js/doors.js',
 './js/arcade.js','./js/games/common.js','./js/games/rules.js',
 './js/games/chai.js','./js/games/sadya.js','./js/games/softlanding.js','./js/games/spark.js','./js/games/lettersmile.js','./js/games/baggage.js',
 './js/games/phase2-rules.js','./js/games/doctor.js','./js/games/world.js','./js/games/vlog.js','./js/places.js','./js/portal.js',
 './js/media-control.js','./js/cinema.js','./js/radio.js','./js/radio-ambience.js','./js/travel.js','./js/garden.js','./js/rest.js','./content/comfort.json',
 './content/movies.json','./content/radio.json','./content/places.json',
 './assets/video/kerala.en.vtt','./assets/video/kerala.ml.vtt',
 './assets/video/kuwait.en.vtt','./assets/video/kuwait.ml.vtt',
 './assets/video/places.en.vtt','./assets/video/places.ml.vtt',
 './assets/video/trailer.en.vtt','./assets/video/trailer.ml.vtt',
 './content/hug.json','./content/flowers.json','./content/today.json',
 './assets/room-back.svg','./assets/room-front.svg','./assets/room-theme-monsoon.svg','./assets/room-theme-sunroom.svg','./assets/room-theme-terracotta.svg','./assets/room-theme-midnight.svg','./assets/room-theme-cosmos.svg','./assets/icon.svg',
 './assets/icon-192.png','./assets/icon-512.png','./assets/apple-touch-icon.png',
 './js/director.js','./js/painted-worlds.js','./js/fm-atmosphere.js',
 './css/directors-cut.css','./css/studio.css','./assets/room-directors-cut.svg',
 './manifest.json'
];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{const c=await caches.open(VERSION);await c.addAll(FILES.map(path=>new URL(path,BASE)));await self.skipWaiting();})());
});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>(k.startsWith('maha-opening-')||k.startsWith('maha-studio-')||k.startsWith('maha-worlds-'))&&k!==VERSION).map(k=>caches.delete(k)));await self.clients.claim();})());});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||!url.href.startsWith(BASE))return;
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION);
  const cached=await cache.match(event.request,{ignoreSearch:true});
  const extension=url.pathname.split('.').pop().toLowerCase();
  // Always revalidate source and content when connected. A stale hero/layout
  // after a deploy is more harmful than a tiny network request.
  const isDocument=event.request.mode==='navigate';
  const updateFirst=isDocument||['html','js','css','json','webmanifest'].includes(extension);
  const readNetwork=async()=>{
   const response=await fetch(event.request);
   if(response.ok)cache.put(event.request,response.clone()).catch(()=>{});
   return response;
  };
  if(!updateFirst&&cached)return cached;
  try {
   const response=await readNetwork();
   if(response.ok)return response;
   return cached||response;
  } catch {
   if(cached)return cached;
   if(isDocument){
    return await cache.match(new URL('./index.html',BASE))||Response.error();
   }
   return Response.error();
  }
 })());
});
