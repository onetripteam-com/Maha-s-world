/** Pure, independently testable rules. No DOM, network or timers. */
export const DOCTOR_ROUNDS=[
 {id:'monday',scribble:'Mōñdąy → mŏōn ♧ ☾',prompt:'A very serious scribble about Monday.',answers:['Ask the moon to reschedule Monday','Borrow three elephants for breakfast','Replace your shoes with pineapples'],right:0,hint:'The moon might have an available calendar slot.'},
 {id:'chai',scribble:'cҺąı ÷ ⁷ ≈ bŕəäk ♡',prompt:'A mystery note beside a doodled tea cup.',answers:['File a complaint against the clouds','Take a chai break from world domination','Teach a mango to ride a bicycle'],right:1,hint:'There is a tea cup drawn in the margin.'},
 {id:'plant',scribble:'płąñt ♫ ☺ 2•ṡŏńgṡ',prompt:'Someone has written to a houseplant.',answers:['Send the suitcase to Mars','Become the official Minister of Naps','Sing two dramatic songs to the plant'],right:2,hint:'The houseplant is the audience, not the singer.'},
 {id:'socks',scribble:'sŏćķs ↔ ₹₹? … ☼',prompt:'An utterly unhelpful wardrobe instruction.',answers:['Hold a meeting with your mismatched socks','Invite a volcano to lunch','Paint the airport purple'],right:0,hint:'The socks have asked to speak.'},
 {id:'nap',scribble:'ŋąp + bĕd ♫ ⇢ ✧',prompt:'The final scribble came from a sleepy notebook.',answers:['Buy seven imaginary llamas','Give your pillow a five-star review','Move the mountains to the balcony'],right:1,hint:'A sleepy head and a very comfortable pillow.'}
];
export function doctorScore(correct,secondsRemaining,usedHints=0){return Math.max(0,Math.round(correct*170 + Math.max(0,secondsRemaining)*2-usedHints*25));}
export function doctorWin(correct){return correct>=3;}
export const WORLD_SCENES=[
 {id:'kerala',name:'Kerala',clue:'Backwaters, palms and a canoe whose driver never hurries.',shape:'backwater',sky:['#f0bf84','#abd2ad'],land:'#79976b',detail:'#56876c',choices:['Kerala','Kuwait','Ladakh']},
 {id:'kuwait',name:'Kuwait',clue:'Three famous towers and sea breeze. The shawarma debate continues.',shape:'towers',sky:['#f9d9ad','#e9a47f'],land:'#c5a781',detail:'#7b9eae',choices:['Bengaluru','Kuwait','Manali']},
 {id:'bengaluru',name:'Bengaluru',clue:'Gardens and tech-city streets; the traffic is a supporting character.',shape:'city',sky:['#b9d4c1','#f2c49c'],land:'#698575',detail:'#c48472',choices:['Bengaluru','Munnar','Ladakh']},
 {id:'munnar',name:'Munnar',clue:'Tea hills in Kerala; every curve makes someone want a photo.',shape:'tea',sky:['#c3d8c9','#e5ceab'],land:'#6e9a70',detail:'#507959',choices:['Manali','Munnar','Kuwait']},
 {id:'manali',name:'Manali',clue:'Tall pines and mountain air; the jacket finally has a purpose.',shape:'pine',sky:['#c7d5df','#ead9c4'],land:'#7d978b',detail:'#52736a',choices:['Manali','Kerala','Bengaluru']},
 {id:'ladakh',name:'Ladakh',clue:'High, dry mountains and a horizon that is completely showing off.',shape:'highland',sky:['#a5c8de','#e6cfb0'],land:'#aa907a',detail:'#876f62',choices:['Munnar','Ladakh','Kuwait']}
];
export function worldScore(correct,usedHints=0,wrong=0){return Math.max(0,correct*170-usedHints*35-wrong*9);}
export function worldWin(correct){return correct>=3;}
export const VLOG_ORDER=['wide','walking','close','food','sunset'];
export const VLOG_SHOTS={
 wide:{name:'Wide shot',symbol:'◭',description:'Establishing shot. Set the scene.',palette:['#a7c5bd','#f0c7a0'],place:'The world says hello'},
 walking:{name:'Walking',symbol:'➝',description:'Movement. A little detour.',palette:['#b0c8a8','#d5b38b'],place:'The road is the plot'},
 close:{name:'Close-up',symbol:'✿',description:'A tiny detail worth noticing.',palette:['#d3b3b0','#e7cfad'],place:'Look closer'},
 food:{name:'Food shot',symbol:'◡',description:'Obviously we stopped for snacks.',palette:['#e9bc80','#b77e67'],place:'Priority: something tasty'},
 sunset:{name:'Sunset',symbol:'☀',description:'A soft ending. Roll credits.',palette:['#e3a39e','#8e819e'],place:'One last little glow'}
};
/** 5-position match + neighboring narrative continuity; max 500. */
export function vlogScore(order){
 if(!Array.isArray(order)||order.length!==5||new Set(order).size!==5||!order.every(x=>VLOG_ORDER.includes(x)))return 0;
 const exact=order.filter((id,i)=>id===VLOG_ORDER[i]).length;
 const neighbors=order.slice(0,-1).filter((id,i)=>VLOG_ORDER.indexOf(order[i+1])-VLOG_ORDER.indexOf(id)===1).length;
 return exact*76+neighbors*30;
}
export function vlogWin(order){return vlogScore(order)>=350;}
export function swapShots(order,from,to){if(!Array.isArray(order))return [];if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=order.length||to>=order.length)return [...order];const result=[...order];[result[from],result[to]]=[result[to],result[from]];return result;}