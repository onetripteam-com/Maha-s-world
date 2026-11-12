/** Original illustrated micro-cinema stills. No stock footage or network dependencies. */
let serial=0;
const profiles={
 palms:['#315c55','#9bc4b1','#efc795','#376d59','#214d49'],
 rain:['#405c68','#9db8ac','#d4b9a1','#547b73','#314d56'],
 chai:['#8d6654','#e6bea0','#faf0c8','#9a7252','#53473b'],
 road:['#526874','#b2bca9','#ecc69d','#63816c','#3b5b59'],
 sun:['#b16d64','#e6b593','#f7daab','#bb8076','#785968'],
 moon:['#283e5c','#65768b','#f0d8b2','#435768','#273e4b'],
 hills:['#537d77','#a9c5b0','#e9dca9','#628e79','#375f62'],
 mountains:['#5b778c','#c5d2c9','#ecddc6','#81989b','#516b7a'],
 city:['#627080','#c7ab9b','#f4d5a3','#8f8290','#555d73'],
 stars:['#343953','#756786','#e7bcba','#4c5973','#2c3b54'],
 camera:['#735d73','#c79d96','#ecceb2','#8f758d','#554a6c'],
 lake:['#547b78','#b5c2a8','#f5d9ae','#537a79','#346166']
};
const mountains='<path d="M-20 209Q48 135 92 161Q136 75 186 158Q251 106 331 188v100H-20Z"/>';
const trees='<path d="M13 266q23-49 48-89 7 36 27 61 17-48 47-82 14 45 30 68 35-59 60-82 20 55 44 84 14-21 45-48v112H13Z"/>';
const shapes={
 palms:`<g class="drifting" stroke="#285f4e" stroke-linecap="round" fill="none" stroke-width="6"><path d="M43 271Q93 178 116 62M247 278Q217 162 211 75"/></g><g fill="#355f52" class="near-ground"><path d="M117 69q-51-40-98-5 56-12 97 21Q76 38 44 21q43 11 76 57Q119 26 139 11q-10 40-19 67 39-53 93-42-46 22-90 53 67-17 109 17-55-8-110-13ZM211 82q-49-30-83-11 41-6 80 23-20-48-51-66 37 15 54 48Q216 39 241 28q-15 21-24 55 34-43 75-36-34 17-68 43 44-6 84 24-46-14-87-14Z"/></g><path d="M0 226q76-38 160-13t150-7v64H0Z" fill="#6c9a78" opacity=".84"/>`,
 rain:`<g class="drifting" fill="#dae5d7" opacity=".77"><ellipse cx="89" cy="70" rx="77" ry="22"/><ellipse cx="143" cy="61" rx="59" ry="25"/><ellipse cx="221" cy="91" rx="72" ry="20"/></g><g stroke="#d8e4db" stroke-width="1.5" stroke-linecap="round" opacity=".61">${Array.from({length:31},(_,i)=>`<path d="M${(i*41)%309} ${18+(i*19)%132}l-7 22"/>`).join('')}</g><path d="M0 176q93-35 156-2 86-35 154-5v96H0Z" fill="#759988" opacity=".7"/>`,
 chai:`<g class="drifting" fill="none" stroke="#fff2dc" stroke-width="5" stroke-linecap="round" opacity=".7"><path d="M119 118q-18-26 4-42t0-33m43 72q-21-27-1-48t5-28m39 80q-16-20-3-37t0-23"/></g><ellipse cx="162" cy="232" rx="119" ry="19" fill="#7a5c48" opacity=".32"/><path d="M67 129h172l-17 96q-68 36-138 0Z" fill="#faf0d8" stroke="#bc896a" stroke-width="7"/><path d="M238 142q63-17 42 45-10 28-46 21" fill="none" stroke="#f5e8d1" stroke-width="12"/><ellipse cx="154" cy="131" rx="84" ry="23" fill="#946c50" stroke="#f5e8d1" stroke-width="8"/><ellipse cx="154" cy="131" rx="69" ry="14" fill="#b78967"/>`,
 road:`<path d="M-20 157Q67 96 136 147 219 79 330 142v130H-20Z" fill="#759886"/><path d="M-10 219Q70 158 136 208 213 142 324 198v80H-10Z" fill="#4c786e"/><path d="M122 270Q162 188 151 125h36Q184 200 259 270Z" fill="#d8c5a8"/><path d="M174 143q0 40 16 76M205 243l10 26" fill="none" stroke="#fff4d6" stroke-width="4" stroke-dasharray="11 13"/>`,
 sun:`<path d="M-10 196q73-23 155 3 59-37 172-12v83H-10Z" fill="#98796d" opacity=".6"/><path d="M-10 225q94-27 162 5 95-42 160-4v44H-10Z" fill="#b88c75"/><path d="M0 240q112-12 154 17t156 0" fill="none" stroke="#f1d0a4" stroke-width="3"/>`,
 moon:`<g fill="#f7e5c5" opacity=".8"><circle cx="37" cy="42" r="2"/><circle cx="271" cy="37" r="2"/><circle cx="254" cy="121" r="1.9"/><circle cx="72" cy="107" r="1"/><circle cx="211" cy="56" r="1.7"/></g><path d="M0 188q73-51 161-7t149-2v100H0Z" fill="#526c6b"/><path d="M0 213q93-44 160-3t150-6v75H0Z" fill="#344e58"/>`,
 hills:`<path d="M-10 181Q60 98 121 180q79-122 162-2l39-18v110H-10Z" fill="#93ac8a"/><path d="M-10 209Q69 132 133 202q71-91 187-12v90H-10Z" fill="#5c8a70"/><path d="M-10 246q95-56 171-12t164-6v55H-10Z" fill="#3e6c60"/><g fill="none" stroke="#cbe3b6" opacity=".6" stroke-width="3"><path d="M-10 218q90-64 142-8m42-12q71-64 133-3M-10 259q85-46 157-14m31-7q66-41 133 3"/></g>`,
 mountains:`<path d="M-10 240 81 71l62 116 44-137 123 189v40H-10Z" fill="#889b9c"/><path d="M80 72 54 123 81 110l26 18ZM185 52l-27 82 31-17 33 26Z" fill="#f6f0db"/><path d="M-10 251 75 182l57 49 91-69 91 91v30H-10Z" fill="#577b7f"/><path d="M-10 258q80-27 144 0t180-8v30H-10Z" fill="#456a75"/>`,
 city:`<g fill="#6f7c82"><rect x="9" y="129" width="47" height="119"/><rect x="66" y="100" width="54" height="148"/><rect x="123" y="146" width="48" height="102"/><rect x="174" y="84" width="65" height="164"/><rect x="246" y="118" width="60" height="130"/></g><g fill="#eecfa0" opacity=".68">${Array.from({length:31},(_,i)=>`<rect x="${16+(i%8)*35}" y="${125+Math.floor(i/8)*27}" width="8" height="12"/>`).join('')}</g><path d="M0 236h310v34H0Z" fill="#53646d"/>`,
 stars:`<g fill="#fff1d5" opacity=".9">${Array.from({length:41},(_,i)=>`<circle cx="${12+(i*77)%290}" cy="${13+(i*51)%199}" r="${i%7===0?2.5:1}"/>`).join('')}</g><path d="M0 228q81-37 165-10t145-5v57H0Z" fill="#515a75"/>`,
 camera:`<ellipse cx="161" cy="237" rx="120" ry="15" fill="#503949" opacity=".27"/><rect x="51" y="100" width="214" height="129" rx="17" fill="#615566" stroke="#e9c7ad" stroke-width="8"/><path d="m86 100 24-27h84l18 27" fill="#776879" stroke="#e9c7ad" stroke-width="7"/><circle cx="165" cy="163" r="51" fill="#afa7a0" stroke="#d8d0c6" stroke-width="8"/><circle cx="165" cy="163" r="34" fill="#3f5d6c"/><circle cx="165" cy="163" r="16" fill="#7198a2"/><circle cx="229" cy="126" r="7" fill="#f9d8a6"/>`,
 lake:`<path d="M-10 187q52-68 120-16 65-95 156-9l48-30v129H-10Z" fill="#759b86"/><path d="M0 199q94 29 164 2t146-10v80H0Z" fill="#669e9a"/><path d="M23 219h95m44 15h103M43 253h172" stroke="#d9e7c7" stroke-width="3" opacity=".72"/>`
};
/** Returns an SVG painting with deterministic yet individual foreground layers. */
export function paintedWorld(kind='hills'){
 const p=profiles[kind]||profiles.hills, id=`mw${++serial}`;
 return `<div class="director-frame" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 270" preserveAspectRatio="xMidYMid slice"><defs>
 <linearGradient id="${id}sky" x2="0" y2="1"><stop stop-color="${p[0]}"/><stop offset=".55" stop-color="${p[1]}"/><stop offset="1" stop-color="${p[2]}"/></linearGradient>
 <radialGradient id="${id}sun"><stop stop-color="#fff8da"/><stop offset=".7" stop-color="${p[2]}" stop-opacity=".79"/><stop offset="1" stop-color="${p[2]}" stop-opacity="0"/></radialGradient>
 <linearGradient id="${id}foreground" x2="0" y2="1"><stop stop-color="${p[3]}"/><stop offset="1" stop-color="${p[4]}"/></linearGradient>
 </defs><rect width="310" height="270" fill="url(#${id}sky)"/><g class="sky-orb"><circle cx="226" cy="76" r="72" fill="url(#${id}sun)"/><circle cx="226" cy="76" r="${kind==='moon'?25:31}" fill="${kind==='moon'?'#eee9ce':p[2]}" opacity=".85"/></g>
 <path d="M0 178q65-47 131-10T310 156v114H0Z" fill="${p[3]}" opacity=".32"/>
 ${shapes[kind]||mountains}
 <g class="near-ground"><path d="M0 253q74-31 168 0t142-11v40H0Z" fill="url(#${id}foreground)" opacity=".79"/><path d="M0 264q79-26 171 0t139-9" fill="none" stroke="${p[2]}" opacity=".38" stroke-width="2"/></g>
 <rect width="310" height="270" fill="none" stroke="#f4e8ce" stroke-opacity=".13" stroke-width="6"/>
 </svg></div>`;
}