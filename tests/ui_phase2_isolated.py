"""Sandbox-safe isolated UI exercise: Chromium cannot navigate to localhost here."""
import asyncio,re,json,sys
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'qa-phase2';OUT.mkdir(exist_ok=True)
def prep(p):
 s=(ROOT/p).read_text()
 return '\n'.join(line for line in s.splitlines() if not line.startswith('import ')).replace('export function ','function ').replace('export const ','const ')
JS="""
const save = new Map();
const store={get:(k,d=null)=>save.has(k)?JSON.parse(save.get(k)):d,set:(k,v)=>{save.set(k,JSON.stringify(v));return true;}};
const soundEffect=()=>{};const startSound=()=>{};
"""+prep('js/games/common.js')+'\n'+prep('js/games/rules.js')+'\n'+prep('js/games/phase2-rules.js')
JS+='\nticker=(ctx,fn)=>{const t=setInterval(()=>{if(!ctx.isPaused())fn(.105)},16);return()=>clearInterval(t)};\n'
for g in ('chai','sadya','baggage','doctor','world','vlog'):
 JS+=f'\nconst {g}Mod=(()=>{{\n'+prep(f'js/games/{g}.js')+'\nreturn {start,stop,result};})();\n'
JS+=prep('js/arcade.js').replace("const MODULES={chai:()=>import('./games/chai.js'),sadya:()=>import('./games/sadya.js'),baggage:()=>import('./games/baggage.js'),doctor:()=>import('./games/doctor.js'),world:()=>import('./games/world.js'),vlog:()=>import('./games/vlog.js')};","const MODULES={chai:async()=>chaiMod,sadya:async()=>sadyaMod,baggage:async()=>baggageMod,doctor:async()=>doctorMod,world:async()=>worldMod,vlog:async()=>vlogMod};")
JS+='\nwindow.mahaArcade={mountArcade,store,worldScenes:WORLD_SCENES};'
CSS=(ROOT/'css/style.css').read_text()
HTML=f'''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>{CSS}</style></head><body><div class="app-frame" id="app"><section class="portal-screen" data-place="games"><div class="portal-surface"><div class="portal-place"><button class="portal-back">← Room</button><div class="portal-content" id="arcade-host"></div></div></div></section></div></body></html>'''
async def play(w,h):
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  page=await browser.new_page(viewport={'width':w,'height':h},is_mobile=True,has_touch=True,device_scale_factor=1)
  page.set_default_timeout(6000)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.set_content(HTML)
  await page.evaluate('code=>{(0,eval)(code);window.mahaArcade.mountArcade(document.querySelector("#arcade-host"),{});}',JS)
  assert await page.locator('.arcade-cabinet').count()==1
  assert await page.locator('[data-pip]').count()==6
  await page.screenshot(path=str(OUT/f'cabinet-{w}.png'))
  for label,id in [('Decode the Doctor','doctor'),('Where in the World?','world'),('Vlog Director','vlog')]:
   await page.locator(f'[data-pip="{["doctor","world","vlog"].index(id)+3}"]').click()
   await page.locator('.cabinet-monitor').get_by_text(label,exact=True).wait_for()
   await page.locator('[data-play]').click()
   await page.locator('.mini-game').wait_for(timeout=7000)
   await page.screenshot(path=str(OUT/f'{id}-{w}.png'))
   assert await page.locator('.mini-game').is_visible()
   await page.locator('[data-pause]').click();assert await page.locator('.arcade-pause-curtain').is_visible()
   await page.locator('[data-resume]').click();assert await page.locator('.arcade-pause-curtain').is_hidden()
   if id=='doctor':
    for i in range(5):
     await page.locator('[data-count]').get_by_text(f'{i+1} / 5').wait_for(timeout=6000)
     await page.locator('[data-choice]').nth([0,1,2,0,1][i]).click()
     if i<4: await page.wait_for_timeout(1050)
   elif id=='world':
    # Correct choices discovered from the painted scene. No network.
    for i in range(5):
     await page.locator('[data-round]').get_by_text(f'CLIP {i+1} / 5').wait_for(timeout=6000)
     await page.locator('.world-choices button:not([disabled])').first.wait_for(timeout=6000)
     scene=await page.evaluate('''i=>{const offset=new Date().getDate()%window.mahaArcade.worldScenes.length;return window.mahaArcade.worldScenes[(offset+i)%window.mahaArcade.worldScenes.length].name}''',i)
     await page.get_by_role('button',name=re.compile('· '+re.escape(scene)+'$')).click()
     if i<4: await page.wait_for_timeout(350)
   else:
    # Start with food,sunset,wide,close,walking; swap to correct chronological order.
    # Swap (0,2) -> wide,sunset,food,close,walking
    # Swap (1,4) -> wide,walking,food,close,sunset
    # Swap (2,3) -> wide,walking,close,food,sunset
    for a,b in [(0,2),(1,4),(2,3)]:
     await page.locator(f'[data-index="{a}"]').click()
     await page.locator(f'[data-index="{b}"]').click()
    order=await page.locator('.vlog-shot-name').all_inner_texts()
    assert order==['Wide shot','Walking','Close-up','Food shot','Sunset'],order
    await page.locator('[data-play]').click()
    assert await page.locator('.vlog-cinema').is_visible()
    await page.locator('[data-film-progress]').get_by_text('00 / 20 s').wait_for()
   await page.locator('.arcade-result').wait_for(timeout=13000)
   print(w,id,await page.locator('.arcade-result h2').inner_text(),flush=True)
   assert 'PASSPORT STAMPED' in await page.locator('.arcade-result h2').inner_text()
   await page.locator('[data-cabinets]').click()
   await page.locator('.arcade-cabinet').wait_for()
  flags=await page.evaluate('window.mahaArcade.store.get("gameCompletions",{})')
  assert all(flags.get(k) for k in ('doctor','world','vlog')),flags
  assert not errors, errors
  await browser.close()
  print('ALL PASSED',w,h,flags)
async def main():
 for w,h in (((int(sys.argv[1]),int(sys.argv[2])),) if len(sys.argv)>2 else ((393,852),(402,874),(360,740))):
  await play(w,h)
asyncio.run(main())