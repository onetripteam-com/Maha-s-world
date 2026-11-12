// Future scenes register a matching ID and their own entry point here.
// Example in future module: registerDoor('letters', ({close}) => { ... });
const registry=new Map();
export const roomDoors=[
  {id:'letters',name:'Letters',line:'The postbox is having a little stationery crisis. Letters will arrive here soon.'},
  {id:'music',name:'Music',line:'Radio Maha is tuning its frequencies. Expect excellent questionable DJ commentary.'},
  {id:'movies',name:'Mini movies',line:'The projector is warming up. Popcorn is not included. Outrageous, I know.'},
  {id:'travel',name:'Travel',line:'Passport? Check. Vlog camera? Pending. Adventures are packing their bags.'},
  {id:'games',name:'Games',line:'The console is charging its one very silly brain cell. Games are coming.'},
  {id:'rest',name:'Rest',line:'A cosy corner with zero obligations is being furnished right now.'}
];
export function registerDoor(id,handler,{isNew=false}={}) {
 if(!roomDoors.some(d=>d.id===id))throw new Error(`Unknown room door: ${id}`);
 registry.set(id,{handler,isNew});
 return ()=>registry.delete(id);
}
export function hasNew(id){return Boolean(registry.get(id)?.isNew);}
export function enterDoor(id,context){const destination=registry.get(id);if(destination){destination.handler(context);return true;}return false;}
