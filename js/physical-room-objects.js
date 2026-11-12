import {renderBloomHead} from './botanical-miniatures.js';
/** Original, code-drawn physical props: no icon library, stock images or image API.
 * Every object is actual illuminated, textured SVG artwork in the scene.
 * The vase reflects the seven flowers saved in this browser, including repeats.
 */
const E=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const G=(id)=>`<defs>
 <linearGradient id="${id}wood" x2="1" y2="1"><stop stop-color="#795642"/><stop offset=".3" stop-color="#bd8763"/><stop offset=".7" stop-color="#473025"/><stop offset="1" stop-color="#251d19"/></linearGradient>
 <linearGradient id="${id}steel" x2="0" y2="1"><stop stop-color="#fff5d4"/><stop offset=".23" stop-color="#b6a58a"/><stop offset=".65" stop-color="#665846"/><stop offset="1" stop-color="#e2c7a3"/></linearGradient>
 <linearGradient id="${id}glass" x2="0" y2="1"><stop stop-color="#d6ded0" stop-opacity=".82"/><stop offset=".4" stop-color="#99b7ab" stop-opacity=".34"/><stop offset=".8" stop-color="#476b60" stop-opacity=".62"/><stop offset="1" stop-color="#243f3b" stop-opacity=".95"/></linearGradient>
 <linearGradient id="${id}screen" x2="0" y2="1"><stop stop-color="#f2cca0"/><stop offset=".42" stop-color="#ac7e7f"/><stop offset=".8" stop-color="#4c5964"/><stop offset="1" stop-color="#232f38"/></linearGradient>
 <linearGradient id="${id}lamp" x2="0" y2="1"><stop stop-color="#fffde8"/><stop offset=".45" stop-color="#f8d19e"/><stop offset="1" stop-color="#87513d"/></linearGradient>
 <radialGradient id="${id}glow"><stop stop-color="#ffe6b6" stop-opacity=".96"/><stop offset=".5" stop-color="#f1be87" stop-opacity=".3"/><stop offset="1" stop-color="#e6a36e" stop-opacity="0"/></radialGradient>
 <filter id="${id}shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
 </defs>`;
const shapes={
 letters:id=>`<ellipse cx="82" cy="132" rx="60" ry="6" fill="#040706" opacity=".4" filter="url(#${id}shadow)"/>
 <path d="M21 111V61Q22 52 32 52H131Q143 53 143 64V111Q143 118 135 118H27Q21 117 21 111Z" fill="url(#${id}wood)" stroke="#c9a17e" stroke-width="2"/>
 <path d="M32 62L81 96L132 62" fill="none" stroke="#dfb994" stroke-width="3"/>
 <path d="M37 45L122 35L130 93L44 102Z" fill="#e7d2b6" stroke="#aa8b66" stroke-width="2"/>
 <path d="M46 53L109 45M47 60L112 52M49 67L98 60" fill="none" stroke="#a89270" opacity=".6" stroke-width="1.8"/>
 <path d="M27 78L80 109L138 74" fill="none" stroke="#d8b18a" stroke-width="2"/>
 <circle cx="82" cy="93" r="13" fill="#a84f40" stroke="#e2ab84" stroke-width="1.3"/>
 <path d="M75 93Q81 83 88 93Q82 102 75 93Z" fill="#f1b5a4"/>
 <path d="M32 105H130" stroke="#f9ddab" stroke-opacity=".5"/>`,
 music:id=>`<ellipse cx="82" cy="132" rx="61" ry="6" fill="#080b09" opacity=".5" filter="url(#${id}shadow)"/>
 <rect x="20" y="42" width="125" height="80" rx="15" fill="url(#${id}wood)" stroke="#d6ab80" stroke-width="2"/>
 <rect x="29" y="52" width="82" height="57" rx="7" fill="#29221d" stroke="#ba9b73" stroke-width="2"/>
 <path d="M38 60H101M38 68H101M38 76H101M38 84H101M38 92H101M38 100H101" stroke="#7d6048" stroke-width="3" stroke-linecap="round"/>
 <path d="M46 52V109M59 52V109M72 52V109M85 52V109M98 52V109" stroke="#312820" stroke-width="1.5"/>
 <rect x="117" y="52" width="20" height="15" rx="3" fill="#f6d496" stroke="#51382d"/>
 <path d="M121 60H133M127 54V64" stroke="#8c5e37" stroke-width="1"/>
 <circle cx="126" cy="83" r="9" fill="url(#${id}steel)" stroke="#554137" stroke-width="2"/>
 <circle cx="126" cy="105" r="7" fill="url(#${id}steel)" stroke="#554137" stroke-width="2"/>
 <path d="M40 41L26 24Q23 20 26 16" stroke="#e4cba5" stroke-width="3" fill="none"/>
 <circle cx="126" cy="83" r="2" fill="#483529"/>`,
 movies:id=>`<ellipse cx="82" cy="134" rx="66" ry="5" fill="#070808" opacity=".6" filter="url(#${id}shadow)"/>
 <path d="M13 22H150Q155 22 155 29V102Q155 108 149 108H14Q9 108 9 102V28Q9 22 13 22Z" fill="#242220" stroke="#967f68" stroke-width="3"/>
 <rect x="17" y="30" width="130" height="68" rx="2" fill="url(#${id}screen)"/>
 <path d="M17 74Q52 45 85 68T147 55V98H17Z" fill="#354a48" opacity=".64"/><path d="M17 91Q55 73 84 81T147 75V98H17Z" fill="#1a3137" opacity=".83"/>
 <circle cx="99" cy="50" r="10" fill="#ffedc4" opacity=".82"/>
 <rect x="76" y="108" width="10" height="16" fill="#71685b"/><path d="M52 124H111L118 128H46Z" fill="url(#${id}steel)"/>
 <rect x="118" y="114" width="31" height="11" rx="4" fill="#c3b6a2" stroke="#70634c"/><circle cx="137" cy="119" r="3" fill="#f9e7ce"/>`,
 travel:id=>`<ellipse cx="80" cy="131" rx="64" ry="7" fill="#070806" opacity=".5" filter="url(#${id}shadow)"/>
 <path d="M60 36V20Q60 13 68 13H99Q107 13 107 21V36" fill="none" stroke="#a88a61" stroke-width="7"/>
 <rect x="33" y="37" width="102" height="87" rx="13" fill="url(#${id}wood)" stroke="#e5bb91" stroke-width="2.5"/>
 <rect x="42" y="45" width="84" height="72" rx="7" fill="#956549" opacity=".45"/>
 <path d="M55 39V121M114 39V121" stroke="#e0a96d" stroke-width="8" opacity=".94"/>
 <path d="M47 47H121M47 112H121" stroke="#513a2b" stroke-width="3"/>
 <rect x="74" y="74" width="21" height="22" rx="4" fill="url(#${id}steel)" stroke="#564437" stroke-width="1.2"/>
 <path d="M79 84L84 90L90 82" stroke="#614a35" stroke-width="2.5" fill="none"/>
 <rect x="45" y="121" width="12" height="7" rx="3" fill="#34302d"/><rect x="113" y="121" width="12" height="7" rx="3" fill="#34302d"/>
 <path d="M118 48L137 49L135 72L116 71Z" fill="#f2ddba" stroke="#a68b70"/><circle cx="127" cy="53" r="2" fill="#b8745b"/>
 <path d="M122 60H132M122 64H129" stroke="#bb9f77" stroke-width="1.5"/>`,
 games:id=>`<ellipse cx="84" cy="135" rx="48" ry="5" fill="#020506" opacity=".65" filter="url(#${id}shadow)"/>
 <path d="M38 13H122L132 72L125 134H34L28 71Z" fill="#372f35" stroke="#bb8975" stroke-width="3"/>
 <path d="M41 24H119L124 73H36Z" fill="#111e27" stroke="#aa8f7c" stroke-width="2"/>
 <path d="M42 66L65 39L80 56L104 32L119 63" fill="none" stroke="#e9b282" stroke-width="3" opacity=".8"/>
 <circle cx="101" cy="38" r="6" fill="#ffe1a2"/><path d="M37 79H123L116 108H44Z" fill="#a88465" stroke="#d3b099" stroke-width="2"/>
 <path d="M67 79V97" stroke="#18191a" stroke-width="5"/><circle cx="67" cy="78" r="8" fill="#d25a51" stroke="#f5ae83" stroke-width="1.8"/>
 <circle cx="96" cy="91" r="5" fill="#efbd78"/><circle cx="109" cy="86" r="5" fill="#bd6962"/>
 <path d="M46 109H116L120 127H39Z" fill="#352d2e"/><path d="M43 119H116" stroke="#70534a" stroke-width="2"/>
 <circle cx="71" cy="118" r="2" fill="#f9c980"/>`,
 garden:id=>`<ellipse cx="80" cy="134" rx="42" ry="7" fill="#050906" opacity=".53" filter="url(#${id}shadow)"/>
 <path d="M52 81L60 123Q81 137 107 123L114 81Z" fill="url(#${id}wood)" stroke="#d1a97f" stroke-width="2"/>
 <ellipse cx="83" cy="83" rx="31" ry="7" fill="#322820" stroke="#c3a082" stroke-width="2"/>
 <path d="M83 87Q84 48 72 20M84 80Q92 45 110 26M82 78Q67 53 49 43M85 72Q105 73 126 59" fill="none" stroke="#486a42" stroke-width="4" stroke-linecap="round"/>
 <path d="M74 31Q48 4 46 36Q60 52 74 31ZM79 55Q93 21 117 26Q119 49 79 55ZM74 70Q47 48 39 61Q41 82 74 70ZM92 70Q116 47 129 62Q123 81 92 70Z" fill="#4d784d" stroke="#aac28a" stroke-width="1.6"/>
 <path d="M72 33Q64 31 53 30M97 48Q107 38 115 32M61 66L46 62M108 66L122 62" fill="none" stroke="#d3e2a3" stroke-width="1.5" opacity=".65"/>
 <path d="M72 19Q50 4 53 14Q66 31 72 19ZM84 44Q83 13 98 17Q107 31 84 44Z" fill="#77a866" stroke="#b7d19a"/>`,
 rest:id=>`<ellipse cx="78" cy="132" rx="56" ry="6" fill="#090a09" opacity=".53" filter="url(#${id}shadow)"/>
 <path d="M49 24Q78 10 105 24L97 71H58Z" fill="url(#${id}lamp)" stroke="#f4d8aa" stroke-width="2"/>
 <ellipse cx="77" cy="74" rx="27" ry="6" fill="#ffe1b2" opacity=".82"/>
 <path d="M77 73V121" stroke="url(#${id}steel)" stroke-width="6"/><ellipse cx="77" cy="122" rx="24" ry="7" fill="url(#${id}steel)"/>
 <circle cx="76" cy="75" r="53" fill="url(#${id}glow)" opacity=".26"/>
 <path d="M101 109Q133 76 149 103L142 125H112Z" fill="#8c6958" stroke="#d4a98a" stroke-width="2"/>
 <path d="M109 112Q122 100 144 108" fill="none" stroke="#e4bd92" stroke-width="3" opacity=".7"/>`
};
const flowerHues={
 rose:['#ac4459','#dc8189'],peony:['#e2a1a4','#f5c7bb'],sunflower:['#d69b2d','#f9d36b'],tulip:['#b2566c','#eb8490'],lily:['#efdfb9','#fff1d1'],orchid:['#9f7aaa','#d7b3d6'],hibiscus:['#ce5862','#fa8a73'],lotus:['#d393a2','#efccd3'],jasmine:['#e7dfba','#fff6df'],marigold:['#da873b','#f1c35c'],daisy:['#e7d9b8','#f4f3e5'],lavender:['#8478a6','#b9acd9'],iris:['#536b9d','#a3afdc']
};
export function bouquetObjectMarkup(chosen=[]){
 const safe=Array.isArray(chosen)?chosen.slice(0,7):[];
 const flowers=Array.from({length:7},(_,i)=>safe[i]||'rose');
 const id='physical-vase-';
 const petals=flowers.map((name,i)=>{
  const [dark,light]=flowerHues[name]||flowerHues.rose;
  const x=30+i*16.1, y=51+Math.abs(3-i)*5+(i%2)*-5;
  const stem=`<path d="M88 122Q${x+4} 92 ${x} ${y+1}" fill="none" stroke="#4d7252" stroke-width="2.9"/>`;
  const head=renderBloomHead(name,dark,light,i);
  const leafY=94+(i%3)*2;
  const leaf=`<path d="M${x+6} ${leafY}Q${x+15} ${leafY-12} ${x+21} ${leafY-16}Q${x+22} ${leafY-3} ${x+6} ${leafY}Z" fill="#60835b" stroke="#adc5a1" stroke-width=".65" opacity=".91"/>`;
  return stem+leaf+`<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)})">${head}</g>`;
 }).join('');
 return `<svg class="physical-object-art real-vase" viewBox="0 0 165 150" aria-hidden="true" focusable="false">${G(id)}
 <ellipse cx="84" cy="140" rx="44" ry="5" fill="#080d0e" opacity=".42" filter="url(#${id}shadow)"/><g class="live-flowers">${petals}</g><g class="vase-glass">
 <path d="M60 84Q57 105 64 134Q83 148 105 134Q111 102 106 84Z" fill="url(#${id}glass)" stroke="#dbe8da" stroke-opacity=".85" stroke-width="1.5"/>
 <ellipse cx="83" cy="85" rx="23" ry="5" fill="#d4e1dc" fill-opacity=".55" stroke="#ecf5dc" stroke-width="1.5"/>
 <path d="M70 92Q65 118 73 132" stroke="#f0ffeb" stroke-width="3" opacity=".48" fill="none"/>
 <path d="M98 96Q102 118 97 134" stroke="#385b55" stroke-width="4" opacity=".28" fill="none"/>
 </g></svg>`;
}
export function physicalObjectMarkup(type){
 const id='physical-'+E(type)+'-';
 const art=shapes[type];
 if(!art)return '';
 return `<svg class="physical-object-art physical-${E(type)}" viewBox="0 0 165 150" aria-hidden="true" focusable="false">${G(id)}${art(id)}</svg>`;
}
