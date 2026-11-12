/** Thirteen botanically distinct, lightweight original miniature flowers.
 * Each one is SVG geometry (no emojis, third-party images or fonts).
 * Identical choices still create individual flowers with natural variation.
 */
const n=(v)=>Number(v.toFixed(2));
const flower=(cx,cy,rx,ry,rot,fill,stroke='',opacity=1)=>`<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width=".55"`:''} opacity="${opacity}"/>`;
const P=(count,radX,radY,rx,ry,fill,stroke='',start=0)=>Array.from({length:count},(_,i)=>{
 const a=start+i*360/count,theta=a*Math.PI/180;
 return flower(Math.sin(theta)*radX,-Math.cos(theta)*radY,rx,ry,a,fill,stroke);
}).join('');
const point=(d,fill,stroke)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width=".65" stroke-linejoin="round"/>`;
const seed=(nSeeds,color)=>Array.from({length:nSeeds},(_,j)=>{const a=j*2.3999632,r=Math.sqrt(j/nSeeds)*5.2;return `<circle cx="${n(Math.cos(a)*r)}" cy="${n(Math.sin(a)*r)}" r=".65" fill="${color}"/>`}).join('');
function flowerShape(name,deep,light){
 const inner='<circle r="3.6" fill="#e5b977"/><circle cx="-1.1" cy="-1.2" r="1.1" fill="#fff0ba"/>';
 switch(name){
 case 'rose':return `${P(9,7.1,6.1,4.4,8,deep,light,14)}${P(7,4.3,3.2,3.6,6.2,light,deep,29)}${P(5,2.6,2.2,3.2,4.5,deep,light,25)}<path d="M-3 0Q-6-6-1-5Q4-7 3-2Q6 3 0 4Q-4 4-3 0" fill="${light}" stroke="${deep}" stroke-width=".8"/>`;
 case 'daisy':return `${P(12,6.9,6.9,2.5,7.2,'#f9f8e8','#c3c7ae')}<circle r="5.9" fill="#d9b05b" stroke="#a47c37"/>${seed(22,'#7f6039')}`;
 case 'sunflower':return `${P(17,7.1,7.1,3.4,8.5,'#e3a135','#ac6d2c',7)}<circle r="6.9" fill="#76533c" stroke="#c99043" stroke-width="1.7"/>${seed(35,'#e2a34a')}`;
 case 'tulip':return `${point('M-8 6 Q-12-9 -4-11L0-3L3-12Q10-11 10 3Q6 12 0 11Q-6 12-8 6',deep,light)}${point('M-4 10Q-7 1-3-10L1-3L5-12Q9 3 5 10Z',light,deep)}<path d="M-8 4Q0 7 8 3" fill="none" stroke="${deep}" stroke-width=".8"/>`;
 case 'peony':return `${P(14,7.6,7,4.9,6.2,deep,light,15)}${P(10,5.6,4.9,4.5,6.2,light,deep,18)}${P(7,3.4,2.6,3.5,4.9,deep,light,7)}<circle r="2.3" fill="#ffe4a6"/>`;
 case 'lily':return `${P(6,7.3,7.3,3.8,9.5,'#f9e9d5','#b4a88c',0)}<circle r="3" fill="#d7bc6d"/>${Array.from({length:6},(_,i)=>{const a=i*Math.PI/3;return `<path d="M0 0L${n(Math.sin(a)*7)} ${n(-Math.cos(a)*7)}" stroke="#ae8858" stroke-width=".85"/><circle cx="${n(Math.sin(a)*7)}" cy="${n(-Math.cos(a)*7)}" r="1.4" fill="#9c6e46"/>`}).join('')}`;
 case 'orchid':return `${flower(-7,-6,7.4,5.7,-33,light,deep)}${flower(7,-6,7.4,5.7,33,light,deep)}${flower(-8,3.3,6.7,5.8,44,deep,light)}${flower(8,3.3,6.7,5.8,-44,deep,light)}${point('M-4-1Q-10 7 0 12Q10 7 4-1Q0-4-4-1',light,deep)}<ellipse rx="2.4" ry="3.3" fill="#dbad67"/>`;
 case 'lavender':return `${Array.from({length:9},(_,i)=>{const y=11-i*3;const w=5.1-Math.abs(i-4)*.43;return `${flower(-w/2,y,w/2+1.3,2.35,-23,i%2?deep:light,deep)}${flower(w/2,y,w/2+1.3,2.35,23,i%2?light:deep,light)}`}).join('')}<path d="M0 14V-18" stroke="#61785b" stroke-width=".9"/>`;
 case 'jasmine':return `${P(5,5.5,5.5,3.7,8,'#fff9e7','#e4dfc7',0)}<circle r="3.4" fill="#e7c46c"/>${seed(9,'#b99b52')}`;
 case 'marigold':return `${P(16,8,8,3.2,4.4,'#e09e3f','#bb7029',6)}${P(14,5.2,5.2,3.3,4,'#f7c25c','#cb8c37',14)}${P(10,2.8,2.8,2.4,3.3,'#e29c38','#b57130',9)}<circle r="2.1" fill="#ffd777"/>`;
 case 'hibiscus':return `${P(5,5.8,5.8,7.6,8.6,deep,light,18)}${P(5,3.4,3.4,5.5,5.4,light,deep,18)}<circle r="3.3" fill="#7c373e"/><path d="M-1 0L4 -15" stroke="#eec37c" stroke-width="1.4"/>${Array.from({length:5},(_,i)=>`<circle cx="${1+i*1.3}" cy="${-9-i*1.6}" r="1" fill="#f2d18c"/>`).join('')}`;
 case 'iris':return `${point('M-3 1Q-13-8-3-16Q0-8 0-4Q2-16 6-17Q13-7 3 1Z',light,deep)}${point('M-1 1Q-15-7-16 7Q-7 12 0 5Q4 13 13 8Q17-2 3-2Z',deep,light)}${point('M-4 6L-1-2L2 6Z','#d9b462','#a78e45')}`;
 case 'lotus':return `${P(8,5.7,6.3,3.9,9.3,light,deep,22)}${P(7,4,4.4,3.7,8,deep,light,11)}${point('M-2 8Q-4-6 1-14Q7 1 3 8Z',light,deep)}<circle r="2.2" fill="#e9bf79"/>`;
 default:return `${P(6,5.8,5.4,4.1,7.3,light,deep,15)}${inner}`;
 }
}
export function renderBloomHead(name,deep,light,index=0){
 const type=String(name||'rose');
 const species=['rose','daisy','sunflower','tulip','peony','lily','orchid','lavender','jasmine','marigold','hibiscus','iris','lotus'].includes(type)?type:'rose';
 const angle=(index*19)%26-13;
 const scale=species==='lavender'?.89:species==='lily'?1.03:1;
 const head=`<g data-species="${species}" transform="rotate(${angle}) scale(${scale})">${flowerShape(species,deep,light)}</g>`;
 return head;
}
