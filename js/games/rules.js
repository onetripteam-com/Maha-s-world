/** Pure rules for Sadya placement and Airport packing (Node-testable). */
export const SADYA_DISHES=[
 {id:'chips',name:'Banana chips',emoji:'◒',color:'#eac66b',zone:'upper-left'},
 {id:'pappadam',name:'Pappadam',emoji:'◎',color:'#e6bc87',zone:'upper-left'},
 {id:'pachadi',name:'Pachadi',emoji:'✿',color:'#f4d2b8',zone:'upper-middle'},
 {id:'thoran',name:'Thoran',emoji:'❧',color:'#789b60',zone:'upper-middle'},
 {id:'avial',name:'Avial',emoji:'❀',color:'#bdc78a',zone:'upper-right'},
 {id:'rice',name:'Rice',emoji:'◌',color:'#fff3d6',zone:'near-center'},
 {id:'sambar',name:'Sambar',emoji:'≈',color:'#ba784d',zone:'over-rice'},
 {id:'payasam',name:'Payasam',emoji:'◕',color:'#dfb17d',zone:'sweet-course'},
 {id:'pickle',name:'Mango pickle',emoji:'✦',color:'#cc673f',zone:'upper-left'}
];
// Display spot centers are percentages in leaf viewbox. One sample arrangement, not a universal canonical sequence.
export const SADYA_SPOTS=[
 {id:'chips',x:11,y:25,label:'Chips · tip'},
 {id:'pappadam',x:25,y:24,label:'Pappadam · left'},
 {id:'pickle',x:39,y:24,label:'Pickle · upper'},
 {id:'pachadi',x:53,y:23,label:'Pachadi · upper'},
 {id:'thoran',x:66,y:24,label:'Thoran · upper'},
 {id:'avial',x:82,y:26,label:'Avial · upper'},
 {id:'rice',x:46,y:65,label:'Rice · near half'},
 {id:'sambar',x:70,y:68,label:'Sambar · with rice'},
 {id:'payasam',x:86,y:81,label:'Payasam · sweet bowl'}
];
export function placeSadya(id,spotId,already={}){return Boolean(SADYA_SPOTS.find(s=>s.id===id&&s.id===spotId))&&!already[id]}
export const BAG_ITEMS=[
 {id:'jhumkas',name:'Jhumkas',icon:'✧',weight:.5,cells:[[0,0]]},
 {id:'shawl',name:'Kashmir shawl',icon:'≈',weight:1.5,cells:[[0,0],[1,0],[2,0]]},
 {id:'camera',name:'Camera',icon:'▣',weight:2.5,cells:[[0,0],[1,0],[0,1],[1,1]]},
 {id:'snacks',name:'Home snacks',icon:'✿',weight:2,cells:[[0,0],[1,0],[0,1]]},
 {id:'book',name:'One tiny book',icon:'▤',weight:1.5,cells:[[0,0],[0,1],[0,2]]},
 {id:'gifts',name:'Family gifts',icon:'◇',weight:3,cells:[[0,0],[1,0],[2,0],[1,1]]},
 {id:'cooker',name:'Pressure cooker',icon:'◉',weight:6,cells:[[0,0],[1,0],[0,1],[1,1],[0,2],[1,2]]},
 {id:'coconut',name:'Entire coconut?',icon:'◕',weight:5,cells:[[0,0],[1,0],[0,1],[1,1]]}
];
export const BAG_W=5,BAG_H=6,BAG_MAX_KG=14;
export function rotatedCells(cells,rotated){return rotated?cells.map(([x,y])=>[-y,x]).map(([x,y],_,all)=>[x-Math.min(...all.map(c=>c[0])),y]):cells.map(c=>[...c]);}
export function canPack(item,originX,originY,occupied={},rotated=false,currentWeight=0){
 if(!item||currentWeight+item.weight>BAG_MAX_KG)return {ok:false,why:'weight'};
 const shape=rotatedCells(item.cells,rotated);
 if(shape.some(([x,y])=>originX+x<0||originY+y<0||originX+x>=BAG_W||originY+y>=BAG_H))return {ok:false,why:'edge'};
 if(shape.some(([x,y])=>occupied[`${originX+x},${originY+y}`]))return {ok:false,why:'overlap'};
 return {ok:true,cells:shape.map(([x,y])=>[originX+x,originY+y])};
}
export function baggageScore(n,kg,timeLeft){return Math.max(0,Math.round(n*105+Math.min(70,timeLeft)+Math.max(0,BAG_MAX_KG-kg)*6));}