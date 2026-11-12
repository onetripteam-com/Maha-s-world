/** Pure Kuwait-calendar unlocks. `state` is plain data, never reads global storage. */
export const KUWAIT_TIME_ZONE='Asia/Kuwait';
export function kuwaitDay(value=new Date()){
  const d=value instanceof Date?value:new Date(value);
  if(!Number.isFinite(d.getTime()))throw new Error('Invalid date');
  const f=new Intl.DateTimeFormat('en-CA',{timeZone:KUWAIT_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'});
  const p=Object.fromEntries(f.formatToParts(d).map(v=>[v.type,v.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
export function dayNumber(ymd){
 if(typeof ymd!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(ymd))return NaN;
 const [y,m,d]=ymd.split('-').map(Number),date=new Date(Date.UTC(y,m-1,d));
 return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d?date.getTime()/86400000:NaN;
}
export function kuwaitDaysApart(from,to){return dayNumber(to)-dayNumber(from);}
function stateVisits(state){return Number.isFinite(+state?.visits)?Math.max(0,Math.floor(+state.visits)):0;}
function firstDay(state){try{return state?.firstVisitAt?kuwaitDay(state.firstVisitAt):null;}catch{return null;}}
/** Christmas and Easter dates use Kuwait's calendar day; no device locale drift.
 * Malankara churches celebrate Christmas on Dec 25 and, for these dates,
 * Easter according to the Gregorian Paschal calculation. */
export function festivalDay(name,year){
 const y=Math.trunc(Number(year));
 if(!Number.isInteger(y)||y<1900||y>2199)return null;
 if(name==='christmas')return `${y}-12-25`;
 // The principal Thiruvonam day follows Kerala's Malayalam calendar. Exact
 // published dates are maintained here, never extrapolated by adding 365 days.
 if(name==='onam')return ({
  2026:'2026-08-26',2027:'2027-09-12',2028:'2028-09-01',
  2029:'2029-08-22',2030:'2030-09-09',2031:'2031-08-30',
  2032:'2032-09-16',2033:'2033-09-07',2034:'2034-08-28',
  2035:'2035-09-14',2036:'2036-09-03'
 })[y]||null;
 if(name!=='easter')return null;
 const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4;
 const f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30;
 const i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k+700)%7;
 const m=Math.floor((a+11*h+22*l)/451);
 const n=h+l-7*m+114,month=Math.floor(n/31),day=n%31+1;
 return `${y}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}
/** Annual birthday and calendar occasions are separate from everyday moods. */
export function annualDay(month,day,year){
 const m=Math.trunc(Number(month)),d=Math.trunc(Number(day)),y=Math.trunc(Number(year));
 if(!Number.isInteger(m)||!Number.isInteger(d)||!Number.isInteger(y)||m<1||m>12||d<1||d>31)return null;
 const date=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
 return Number.isFinite(dayNumber(date))?date:null;
}
export function occasionDate(rule,year){
 if(rule?.type==='festival')return festivalDay(rule.name,year);
 if(rule?.type==='annual')return annualDay(rule.month,rule.day,year);
 return null;
}
function occasionDates(rule,now){
 const year=Number(kuwaitDay(now).slice(0,4));
 return [year-1,year,year+1].map(y=>occasionDate(rule,y)).filter(Boolean).sort();
}
/** Keep the preview window correct even when Christmas crosses New Year. */
export function occasionVisible(rule,now=new Date(),daysBefore=21,daysAfter=10){
 const today=dayNumber(kuwaitDay(now));
 return occasionDates(rule,now).some(date=>{
  const delta=today-dayNumber(date);
  return delta>=-daysBefore&&delta<=daysAfter;
 });
}
export function festivalVisible(name,now=new Date(),daysBefore=21,daysAfter=10){
 return occasionVisible({type:'festival',name},now,daysBefore,daysAfter);
}
export function unlockStatus(rule,state={},now=new Date()){
 if(!rule||rule.type==='always')return {open:true,label:'Ready to open',remaining:0};
 const today=kuwaitDay(now);const todayN=dayNumber(today);
 switch(rule.type){
  case 'festival':
  case 'annual':{
   const dates=occasionDates(rule,now);
   if(!dates.length)return {open:false,label:'Occasion not configured',remaining:null};
   // Keep a wish open for ten days, even if the year changes.
   if(dates.some(d=>todayN>=dayNumber(d)&&todayN-dayNumber(d)<=10))
    return {open:true,label:'Ready to open',remaining:0};
   const next=dates.find(d=>dayNumber(d)>todayN);
   const label=rule.type==='annual'
    ?(Number(rule.month)===1&&Number(rule.day)===1?'Opens on New Year’s Day':'Opens on your birthday')
    :rule.name==='christmas'?'Opens on Christmas Day'
    :rule.name==='onam'?'Opens on Thiruvonam':'Opens on Easter Sunday';
   return {open:false,label,remaining:next?dayNumber(next)-todayN:null};
  }
  case 'date':{
   const target=dayNumber(rule.on);
   if(!Number.isFinite(target))return {open:false,label:'Date not configured',remaining:null};
   const n=Math.max(0,target-todayN);
   return {open:n===0,label:n===0?'Ready to open':`Opens in ${n} ${n===1?'day':'days'}`,remaining:n};
  }
  case 'visits':{
   const required=Math.max(1,Math.floor(Number(rule.n)||1)),n=Math.max(0,required-stateVisits(state));
   return {open:n===0,label:n===0?'Ready to open':`After ${required} visits · ${n} to go`,remaining:n};
  }
  case 'daysAfterFirstVisit':{
   const started=firstDay(state);
   if(!started)return {open:false,label:'Opens after your first visit',remaining:null};
   const days=Math.max(0,Math.floor(Number(rule.n)||0)),elapsed=kuwaitDaysApart(started,today);
   const n=Math.max(0,days-elapsed);
   return {open:n===0,label:n===0?'Ready to open':`Opens in ${n} ${n===1?'day':'days'}`,remaining:n};
  }
  case 'game':{
   const id=rule.id;
   const finished=Boolean(id&&(state.games?.[id]===true||state[`game:${id}:completed`]===true));
   return {open:finished,label:finished?'Ready to open':`Finish the ${id||'specified'} game`,remaining:null};
  }
  default:return {open:false,label:'Waiting for an unlock rule',remaining:null};
 }
}
export function unlocks(rule,state={},now=new Date()){return unlockStatus(rule,state,now).open;}
export function quietLetterState(date,now=new Date()){
 const target=dayNumber(date);if(!Number.isFinite(target))return {visible:false,section:null};
 const offset=dayNumber(kuwaitDay(now))-target;
 return {visible:offset>=-7,section:offset>14?'openWhen':'inbox',offset};
}
export function newlyUnlocked(letters,state,lastVisit,now=new Date()){
 const old=Number(lastVisit);if(!Number.isFinite(old)||old<=0||new Date(now).getTime()-old<30*86400000)return [];
 const previous={...state,visits:Math.max(0,stateVisits(state)-1)};
 return letters.filter(l=>!unlocks(l.unlock,previous,new Date(old))&&unlocks(l.unlock,state,now));
}