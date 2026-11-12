const ZONE='Asia/Kuwait';
export function kuwaitParts(date=new Date()) {
  const f=new Intl.DateTimeFormat('en-GB',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  const p=Object.fromEntries(f.formatToParts(date).map(x=>[x.type,x.value]));
  return {date:`${p.year}-${p.month}-${p.day}`,hour:Number(p.hour),minute:Number(p.minute),clock:`${p.hour}:${p.minute}`};
}
export function lightOfDay(hour) { return hour < 6 || hour >= 20 ? 'night' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'dusk'; }
export function dailyLine(lines,date=new Date()) {
  const p=kuwaitParts(date);
  const day=Math.floor(Date.parse(`${p.date}T00:00:00Z`)/86400000);
  return lines[((day%lines.length)+lines.length)%lines.length];
}
export function greeting(lastVisit,date=new Date()) {
  const p=kuwaitParts(date); const light=lightOfDay(p.hour);
  let lead={morning:'Morning, Habibii.', afternoon:'Afternoon, Dr. Maha.', dusk:'Evening, explorer.', night:'Up late, Maha?'}[light];
  if (!lastVisit || !Number.isFinite(Number(lastVisit))) return `${lead} Make yourself at home.`;
  const days=Math.floor((Date.now()-Number(lastVisit))/86400000);
  if (days>=2) return `It’s been ${days} days. Welcome back, Habibii.`;
  if (days===1) return `Back again? I like your timing, Maha.`;
  return `${lead} Look who’s back.`;
}
export const KUWAIT_ZONE=ZONE;
