/* Animações "quadro branco" das cardiopatias congênitas.
   Cada cardiopatia = lista de passos; o passo 0 desenha o coração normal.
   Passo: {say, hide:[ids], fill:{AD:'m'}, color:{ao:'m'}, add:'<svg…>'}
   Áudio: audio/cc/normal.mp3 e audio/cc/<chave>-<n>.mp3 */
(function(){
const C={o2:'#c8574d',o2f:'#f7dcd5',v:'#4a7fa0',vf:'#d8e7f1',m:'#8a6aa8',mf:'#e8def2',wall:'#5a5149',hl:'#e0a526',mus:'#e4d3c4',ink:'#33302b'};
const NS='http://www.w3.org/2000/svg';

/* ---------- peças de desenho ---------- */
const tube=(id,ds,k,ws)=>{let o='',i='';ds.forEach((d,j)=>{
  o+=`<path class="d" d="${d}" fill="none" stroke="${C.wall}" stroke-width="${ws[j]+5}" stroke-linecap="round" stroke-linejoin="round"/>`;
  i+=`<path class="k" data-c="${id}" d="${d}" fill="none" stroke="${C[k]}" stroke-width="${ws[j]}" stroke-linecap="round" stroke-linejoin="round"/>`});
  return `<g id="${id}">${o}${i}</g>`};
const arr=(x1,y1,x2,y2,k)=>{const a=Math.atan2(y2-y1,x2-x1),bx=x2-12*Math.cos(a),by=y2-12*Math.sin(a),px=-Math.sin(a)*7,py=Math.cos(a)*7;
  return `<line class="d" x1="${x1}" y1="${y1}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${C[k]}" stroke-width="4.5" stroke-linecap="round"/><path class="k" d="M${x2} ${y2}L${(bx+px).toFixed(1)} ${(by+py).toFixed(1)}L${(bx-px).toFixed(1)} ${(by-py).toFixed(1)}Z" fill="${C[k]}"/>`};
const hl=(x,y,r)=>`<circle class="d dash" cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.hl}" stroke-width="3"/>`;
const hole=(x,y,w,h,k='m')=>`<rect class="k" x="${x}" y="${y}" width="${w}" height="${h}" fill="${C[k+'f']}"/>`;
const X=(x,y,s=10)=>`<path class="d" d="M${x-s} ${y-s}L${x+s} ${y+s}M${x+s} ${y-s}L${x-s} ${y+s}" stroke="${C.o2}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
const badge=(x,y,n)=>`<g class="k"><circle cx="${x}" cy="${y}" r="11" fill="${C.wall}"/><text x="${x}" y="${y+5}" text-anchor="middle" class="bd">${n}</text></g>`;
const note=(t,l,k='ink')=>`<text class="k nt" x="165" y="${338+l*27}" text-anchor="middle" fill="${C[k]}">${t}</text>`;
const lbl=(x,y,t,cls='')=>`<text class="k ${cls}" x="${x}" y="${y}" text-anchor="middle">${t}</text>`;

const AO='M186 214 L186 70 Q186 30 224 30 Q262 30 262 70 L262 110';
const AP=['M128 214 L128 92','M128 92 Q128 82 112 82 L86 82','M128 92 Q130 80 150 80 L236 80'];

function base(){
  let s='<g id="B">';
  [['AD',36,120,124,72,'vf'],['AE',160,120,124,72,'o2f'],['VD',36,196,124,102,'vf'],['VE',160,196,124,102,'o2f']].forEach(([n,x,y,w,h,f])=>{
    s+=`<rect id="f-${n}" class="k fc" x="${x}" y="${y}" width="${w}" height="${h}" rx="16" style="fill:${C[f]}"/>`});
  [['AD',36,120,124,72],['AE',160,120,124,72],['VD',36,196,124,102],['VE',160,196,124,102]].forEach(([n,x,y,w,h])=>{
    s+=`<rect class="d" x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="none" stroke="${C.wall}" stroke-width="3"/>`});
  s+=`<path class="d" d="M160 121 V191" stroke="${C.wall}" stroke-width="16" fill="none"/><path class="d" d="M160 197 V297" stroke="${C.wall}" stroke-width="16" fill="none"/>`;
  s+=`<path class="d" d="M37 194 H283" stroke="${C.wall}" stroke-width="10" fill="none"/>`;
  s+=`<g id="tric" class="k"><rect x="66" y="189" width="58" height="10" fill="${C.vf}"/><path d="M66 194L80 212M124 194L110 212" stroke="${C.wall}" stroke-width="3"/></g>`;
  s+=`<g id="mit" class="k"><rect x="196" y="189" width="58" height="10" fill="${C.o2f}"/><path d="M196 194L210 212M254 194L240 212" stroke="${C.wall}" stroke-width="3"/></g>`;
  s+=tube('vcs',['M60 18 L60 126'],'v',[22])+tube('vvpp',['M316 152 L282 152'],'o2',[14])+tube('ao',[AO],'o2',[22])+tube('ap',AP,'v',[22,14,14]);
  return s+'</g><g id="L"></g>';
}
function labels(){
  return '<g id="LB">'+[['l-AD',78,164,'AD'],['l-AE',244,164,'AE'],['l-VD',84,264,'VD'],['l-VE',234,264,'VE'],['l-Ao',224,13,'Ao'],['l-AP',98,70,'AP'],['l-VCS',26,36,'VCS'],['l-VVPP',298,140,'VVPP']]
    .map(([id,x,y,t])=>`<text id="${id}" class="k" x="${x}" y="${y}" text-anchor="middle">${t}</text>`).join('')+'</g>';
}

/* ---------- roteiros ---------- */
const NORMAL={say:'Este é o coração normal: sangue venoso à direita, em azul, e oxigenado à esquerda, em vermelho.'};
const ANIM={
civ:{t:'CIV',steps:[NORMAL,
  {say:'Na CIV, existe um buraco no septo entre os ventrículos.',add:hole(152,236,16,24)+hl(160,248,26)},
  {say:'O ventrículo esquerdo, com pressão maior, joga sangue para o direito. É um shunt da esquerda para a direita, por isso não há cianose.',fill:{VD:'m'},color:{ap:'m'},add:arr(214,248,110,248,'o2')},
  {say:'Mais sangue vai para o pulmão: hiperfluxo. Os sintomas aparecem por volta de dois meses, quando cai a resistência pulmonar.',add:note('hiperfluxo pulmonar',0,'m')+note('sintomas ~2 meses',1)},
  {say:'No exame, sopro holossistólico na borda esternal esquerda baixa. A CIV pequena pode fechar sozinha. A grande, com insuficiência cardíaca, vai para cirurgia.',add:note('sopro holossistólico · BEE baixa',2,'o2')}]},

cia:{t:'CIA',steps:[NORMAL,
  {say:'Na CIA, o buraco fica no septo entre os átrios.',add:hole(152,140,16,28)+hl(160,154,26)},
  {say:'O sangue passa do átrio esquerdo para o direito e sobrecarrega as câmaras direitas.',fill:{AD:'m',VD:'m'},color:{ap:'m'},add:arr(214,154,104,154,'o2')+note('AD e VD sobrecarregados',0,'m')},
  {say:'O sinal clássico é a segunda bulha com desdobramento amplo e fixo. O sopro vem do excesso de fluxo na valva pulmonar, e não do buraco.',add:note('B2 desdobrada FIXA',1,'o2')},
  {say:'No eletro, bloqueio de ramo direito incompleto, com eixo para a direita. O fechamento costuma ser percutâneo.',add:note('ECG: BRD incompleto',2)}]},

pca:{t:'PCA',steps:[NORMAL,
  {say:'Na PCA, o canal arterial, que liga a aorta à artéria pulmonar, não fechou.',add:tube('duct',['M246 50 L238 74'],'m',[9])+hl(242,62,22)+lbl(292,58,'canal','sm')},
  {say:'Como a pressão da aorta é maior, o sangue passa para a pulmonar o tempo todo, na sístole e na diástole. Por isso o sopro é contínuo, em maquinaria.',color:{ap:'m'},add:arr(270,42,252,78,'o2')+note('sopro contínuo em maquinaria',0,'o2')},
  {say:'É comum no prematuro, que pode fechar o canal com ibuprofeno ou indometacina. No recém-nascido a termo, o fechamento é percutâneo ou cirúrgico.',add:note('prematuro: AINE fecha o canal',1)+note('termo: percutâneo ou cirurgia',2)}]},

dsav:{t:'DSAV',steps:[NORMAL,
  {say:'No defeito do septo atrioventricular, falta o centro do coração: uma CIA baixa, uma CIV alta e uma única valva atrioventricular.',hide:['tric','mit'],
    add:`<g class="k"><rect x="64" y="189" width="192" height="10" fill="${C.mf}"/><path d="M64 194L78 212M256 194L242 212" stroke="${C.wall}" stroke-width="3"/></g>`+hole(152,166,16,58)+hl(160,194,36)},
  {say:'O sangue passa da esquerda para a direita nos átrios e nos ventrículos, com hiperfluxo pulmonar e insuficiência cardíaca precoce.',fill:{AD:'m',VD:'m'},color:{ap:'m'},add:arr(222,176,100,176,'o2')+arr(222,226,100,226,'o2')},
  {say:'É a cardiopatia típica da síndrome de Down. No eletro, eixo desviado para a esquerda. A cirurgia é feita entre três e seis meses, antes da hipertensão pulmonar.',add:note('síndrome de Down',0,'m')+note('ECG: eixo à esquerda',1)+note('cirurgia 3–6 meses',2)}]},

coarc:{t:'Coarctação da aorta',steps:[NORMAL,
  {say:'Na coarctação, a aorta descendente tem um estreitamento, perto do canal arterial.',add:`<path class="k" d="M248 80 L260 90 L248 100Z M276 80 L264 90 L276 100Z" fill="${C.wall}"/>`+hl(262,90,22)},
  {say:'Antes do estreitamento a pressão sobe, e depois cai. Resultado: pressão alta nos braços e pulsos femorais fracos.',add:note('PA braços > pernas',0,'o2')+note('pulsos femorais fracos',1)},
  {say:'Associa-se à síndrome de Turner e à valva aórtica bicúspide. Na criança maior, o raio X mostra o sinal do três e a corrosão das costelas, o sinal de Roesler.',add:note('Turner · aorta bicúspide',2,'m')},
  {say:'No recém-nascido, a forma crítica depende do canal: quando ele fecha, vem o choque. Conduta: prostaglandina E1.',add:note('RN crítico → PGE1',3,'o2')}]},

fallot:{t:'Tetralogia de Fallot',steps:[NORMAL,
  {say:'Agora o Fallot. Defeito um: uma comunicação interventricular, alta no septo.',add:hole(152,200,16,28)+hl(160,214,22)+badge(198,234,1)},
  {say:'Defeito dois: a aorta se desloca e fica cavalgando o septo, em cima da CIV, recebendo sangue dos dois ventrículos.',hide:['ao','l-Ao'],add:tube('ao2',['M162 214 L162 70 Q162 30 212 30 Q262 30 262 70 L262 110'],'o2',[24])+lbl(212,13,'Ao')+badge(140,56,2)},
  {say:'Defeito três: a saída do ventrículo direito para a pulmonar se estreita. É a estenose pulmonar infundibular, que gera o sopro.',hide:['ap'],add:tube('ap2',['M120 214 L120 96','M120 96 Q120 86 106 86 L86 86','M120 96 Q122 84 136 84 L236 84'],'v',[9,8,8])+hl(120,150,18)+badge(92,112,3)},
  {say:'Defeito quatro: o ventrículo direito, fazendo força contra essa obstrução, fica hipertrofiado.',add:`<path class="d" d="M43 206 L43 291 L150 291" fill="none" stroke="${C.wall}" stroke-width="10" stroke-linecap="round"/>`+badge(58,314,4)},
  {say:'Resultado: com a saída pulmonar apertada, o sangue venoso do ventrículo direito escapa pela CIV direto para a aorta. Isso é cianose. Quanto maior a estenose, maior a cianose.',color:{ao2:'m'},add:arr(96,252,150,222,'v')+note('VD → aorta = cianose',1,'m')},
  {say:'No raio X, coração em bota, com hipofluxo pulmonar. Na crise hipoxêmica: posição genupeitoral, para aumentar a resistência sistêmica, oxigênio, morfina, volume e betabloqueador.',add:note('RX: coração em bota',2)+note('crise: genupeitoral ↑ RVS',3,'o2')}]},

tga:{t:'Transposição das grandes artérias',steps:[NORMAL,
  {say:'Na transposição, as artérias estão trocadas: a aorta sai do ventrículo direito, e a pulmonar, do esquerdo.',hide:['ao','ap','l-Ao','l-AP'],
    add:tube('ap2',['M196 214 L196 98','M196 98 Q196 86 180 86 L86 86','M196 98 Q198 86 212 86 L238 86'],'o2',[22,14,14])+tube('ao2',['M124 214 L124 70 Q124 30 193 30 Q262 30 262 70 L262 110'],'v',[22])+lbl(193,13,'Ao')+lbl(224,112,'AP')},
  {say:'Ficam dois circuitos separados: o sangue azul volta para o corpo, e o vermelho volta para o pulmão.',add:note('2 circuitos em paralelo',0,'v')},
  {say:'Só há vida se houver mistura, por uma CIA, uma CIV ou pelo canal arterial.',add:hole(152,142,16,24)+hl(160,154,24)+arr(160,154,186,154,'m')+arr(160,154,134,154,'m')+note('precisa de mistura: CIA/CIV/PCA',1,'m')},
  {say:'A cianose é intensa nas primeiras horas, muitas vezes sem sopro. Raio X em ovo deitado. Conduta: prostaglandina, atriosseptostomia de Rashkind e cirurgia de Jatene.',add:note('RX: ovo deitado no fio',2)+note('PGE1 → Rashkind → Jatene',3,'o2')}]},

atresiaT:{t:'Atresia tricúspide',steps:[NORMAL,
  {say:'Na atresia tricúspide, não existe a valva entre o átrio e o ventrículo direitos.',hide:['tric'],add:X(95,194,11)+hl(95,194,22)},
  {say:'Sem entrada de sangue, o ventrículo direito fica pequeno, hipoplásico.',hide:['l-VD'],
    add:`<rect class="k" x="38" y="199" width="114" height="97" rx="14" fill="${C.mus}"/><rect class="k" x="96" y="204" width="56" height="56" rx="12" fill="${C.vf}"/>`+lbl(124,238,'VD')},
  {say:'O sangue do átrio direito é obrigado a passar pela CIA para o lado esquerdo, onde se mistura.',fill:{AE:'m',VE:'m'},color:{ao:'m'},add:hole(152,136,16,32,'v')+arr(100,152,212,152,'v')},
  {say:'Pela CIV, um pouco chega ao ventrículo direito e à pulmonar. Por isso há hipofluxo pulmonar.',hide:['ap'],add:hole(152,214,16,22)+arr(216,226,134,226,'m')+tube('ap2',['M126 214 L126 94','M126 94 Q126 84 112 84 L86 84','M126 94 Q128 82 144 82 L236 82'],'m',[12,9,9])},
  {say:'Pegadinha: é cianótica com eixo para a esquerda no eletro. O tratamento é em etapas: Blalock, Glenn e Fontan.',add:note('ECG: eixo à ESQUERDA',0,'o2')+note('Blalock → Glenn → Fontan',1)}]},

truncus:{t:'Truncus arteriosus',steps:[NORMAL,
  {say:'No truncus, sai um único tronco arterial dos dois ventrículos, e dele nascem a aorta e as pulmonares.',hide:['ao','ap','l-Ao','l-AP'],
    add:tube('tr',['M160 214 L160 70 Q160 30 211 30 Q262 30 262 70 L262 110','M150 104 Q132 92 110 92 L86 92','M172 100 Q192 90 236 90'],'o2',[30,11,11])+lbl(211,13,'Tronco')+lbl(104,78,'AP')},
  {say:'Ele fica em cima de uma CIV, então recebe sangue dos dois lados, e tudo se mistura.',color:{tr:'m'},add:hole(152,200,16,28)+hl(160,214,24)+arr(96,252,146,226,'v')+arr(226,252,176,226,'o2')},
  {say:'Há cianose leve com hiperfluxo pulmonar e insuficiência cardíaca. Associa-se à síndrome de DiGeorge. A correção é a cirurgia de Rastelli.',add:note('cianose + hiperfluxo + ICC',0,'m')+note('DiGeorge (22q11)',1)+note('cirurgia de Rastelli',2,'o2')}]},

datvp:{t:'Drenagem anômala total das veias pulmonares',steps:[NORMAL,
  {say:'Na drenagem anômala total, as veias pulmonares não chegam ao átrio esquerdo. Elas sobem por uma veia vertical e desembocam na veia cava.',hide:['vvpp','l-VVPP','l-Ao'],
    add:tube('vv2',['M316 152 L300 152 L300 8 L60 8 L60 22'],'o2',[12])+X(288,170,8)+lbl(224,62,'Ao')+lbl(272,98,'veia','sm')+lbl(272,112,'vertical','sm')},
  {say:'Todo o sangue oxigenado volta para o lado direito e se mistura.',fill:{AD:'m',VD:'m'},color:{vcs:'m',ap:'m'}},
  {say:'O lado esquerdo só recebe sangue pela CIA, que é obrigatória.',fill:{AE:'m',VE:'m'},color:{ao:'m'},add:hole(152,140,16,28)+hl(160,154,24)+arr(104,154,212,154,'m')},
  {say:'No raio X, a forma supracardíaca dá o boneco de neve. A forma obstrutiva é emergência cirúrgica.',add:note('RX: boneco de neve',0)+note('obstrutiva = emergência',1,'o2')}]},
};
(typeof window!=='undefined'?window:globalThis).CC_ANIM=ANIM;

/* ---------- motor ---------- */
if(typeof document==='undefined')return;
let svg,L,cap,dots,playB,sndB,au,key=null,cur=0,playing=false,sound=true,timer=null,token=0;
const $=s=>svg.querySelector(s);

function animateIn(box,instant){
  const ds=[...box.querySelectorAll('.d')];
  ds.forEach((p,j)=>{
    let len=600;try{len=Math.ceil(p.getTotalLength())+4}catch(e){}
    if(instant){p.style.strokeDasharray=p.classList.contains('dash')?'6 4':'none';return}
    p.style.transition='none';p.style.strokeDasharray=len;p.style.strokeDashoffset=len;
    p.getBoundingClientRect();
    p.style.transition=`stroke-dashoffset .9s ease ${(j*0.13).toFixed(2)}s`;p.style.strokeDashoffset=0;
    if(p.classList.contains('dash'))setTimeout(()=>{p.style.transition='none';p.style.strokeDasharray='6 4';p.style.strokeDashoffset=0},900+j*130+50);
  });
  const ks=[...box.querySelectorAll('.k')];
  const go=()=>ks.forEach(k=>k.classList.add('on'));
  if(instant)go();else setTimeout(go,ds.length*130+600);
}
function apply(i,instant){
  const st=ANIM[key].steps[i];
  if(i===0){animateIn(svg,instant);return}
  (st.hide||[]).forEach(id=>{const e=$('#'+id);if(e){e.style.transition=instant?'none':'opacity .6s';e.style.opacity=0}});
  for(const n in st.fill||{}){const e=$('#f-'+n);if(e){e.style.transition=instant?'none':'fill 1.2s';e.style.fill=C[st.fill[n]+'f']}}
  for(const id in st.color||{})svg.querySelectorAll(`[data-c="${id}"]`).forEach(p=>{p.style.transition=instant?'none':'stroke 1.2s';p.style.stroke=C[st.color[id]]});
  if(st.add){const g=document.createElementNS(NS,'g');g.innerHTML=st.add;L.appendChild(g);animateIn(g,instant)}
}
function build(){svg.innerHTML=base()+labels();L=$('#L');svg.appendChild($('#LB'))}
function render(i){
  const S=ANIM[key].steps;
  cap.innerHTML=`<span class="am-st">${i+1}/${S.length}</span> ${S[i].say}`;
  [...dots.children].forEach((d,j)=>d.classList.toggle('on',j<=i));
}
const src=i=>i===0?'audio/cc/normal.mp3':`audio/cc/${key}-${i}.mp3`;
function stop(){playing=false;token++;clearTimeout(timer);try{au.pause()}catch(e){}playB.textContent='▶ Assistir'}
function wait(i,done){
  const my=token,txt=ANIM[key].steps[i].say,fb=()=>{if(my===token)timer=setTimeout(done,Math.max(3000,txt.length*65))};
  if(!sound){fb();return}
  au.onended=()=>{if(my===token)timer=setTimeout(done,700)};au.onerror=fb;
  au.src=src(i);const p=au.play();if(p&&p.catch)p.catch(fb);
}
function run(){
  if(!playing)return;
  apply(cur,false);render(cur);
  wait(cur,()=>{if(!playing)return;if(cur<ANIM[key].steps.length-1){cur++;run()}else{playing=false;playB.textContent='↺ De novo'}});
}
function goTo(i){stop();build();for(let j=0;j<i;j++)apply(j,true);cur=i;apply(i,false);render(i);
  if(sound){token++;const my=token;au.onended=null;au.src=src(i);au.play().catch(()=>{});}}
function open(k){
  key=k;cur=0;stop();build();
  document.getElementById('am-t').textContent=ANIM[k].t;
  dots.innerHTML=ANIM[k].steps.map(()=>'<i></i>').join('');
  cap.innerHTML='Toque em <b>▶ Assistir</b>. O coração vai ser desenhado e o defeito aparece passo a passo.';
  document.getElementById('am').hidden=false;document.body.style.overflow='hidden';
  // começa direto (o toque no botão já libera o áudio)
  playing=true;token++;playB.textContent='❚❚ Pausar';run();
}
function close(){stop();document.getElementById('am').hidden=true;document.body.style.overflow=''}

function mount(){
  const css=`.am{position:fixed;inset:0;z-index:50;background:rgba(40,36,32,.55);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:12px}
.am[hidden]{display:none}
.am-in{background:var(--bg,#faf6ef);border-radius:18px;max-width:560px;width:100%;padding:14px;box-shadow:0 12px 40px rgba(0,0,0,.25)}
.am-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
.am-hd h3{margin:0;font-family:'Lora',serif;font-size:1.2rem;color:var(--terra,#c0704e)}
.am-x{min-width:44px;min-height:44px;border-radius:50%;border:1.5px solid var(--line,#e8dfd2);background:#fff;font-size:20px;cursor:pointer}
.am-bd{background:#fff;border:8px solid #cfc8bd;border-radius:12px;padding:4px}
.am-bd svg{width:100%;height:auto;display:block}
.am-bd text{font:700 18px 'Caveat','Source Sans 3',cursive;fill:#33302b;paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round}
.am-bd text.nt{font-size:21px;stroke-width:5px}.am-bd text.sm{font-size:15px}.am-bd text.bd{fill:#fff;stroke:none;font:700 13px 'Source Sans 3',sans-serif}
.am-bd .k{opacity:0;transition:opacity .8s}.am-bd .k.on{opacity:1}
.am-cap{min-height:88px;margin:10px 0;padding:10px 14px;border-left:5px solid #e0a526;background:#fff;border-radius:10px;font-size:17px;line-height:1.45}
.am-st{font-weight:700;color:var(--soft,#6e675e);font-size:.8rem;margin-right:4px}
.am-ct{display:flex;flex-wrap:wrap;gap:8px}
.am-ct button{font:700 15px 'Source Sans 3',sans-serif;min-height:44px;padding:8px 14px;border-radius:999px;border:1.5px solid var(--ink,#33302b);background:#fff;color:var(--ink,#33302b);cursor:pointer}
.am-ct button.main{background:var(--ink,#33302b);color:#fff}
.am-dots{display:flex;gap:6px;margin-top:10px}.am-dots i{width:10px;height:10px;border-radius:50%;background:var(--line,#e8dfd2)}.am-dots i.on{background:var(--terra,#c0704e)}
.am-open{display:block;width:100%;margin-top:6px;min-height:44px;border:1.5px solid var(--terra,#c0704e);background:var(--terra-bg,#f8e6dc);color:#8a4428;font:700 15px 'Source Sans 3',sans-serif;border-radius:999px;cursor:pointer}
@media(prefers-reduced-motion:reduce){.am-bd .k{transition:none}}`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  const d=document.createElement('div');d.className='am';d.id='am';d.hidden=true;d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
  d.innerHTML=`<div class="am-in"><div class="am-hd"><h3 id="am-t"></h3><button class="am-x" id="am-x" aria-label="Fechar">✕</button></div>
  <div class="am-bd"><svg viewBox="0 0 330 430" id="am-svg" role="img" aria-label="Animação do defeito cardíaco"></svg></div>
  <div class="am-cap" id="am-cap" aria-live="polite"></div>
  <div class="am-ct"><button class="main" id="am-play">▶ Assistir</button><button id="am-prev" aria-label="Passo anterior">◀</button><button id="am-next" aria-label="Próximo passo">▶▶</button><button id="am-snd">🔊 Som</button></div>
  <div class="am-dots" id="am-dots"></div></div>`;
  document.body.appendChild(d);
  svg=document.getElementById('am-svg');cap=document.getElementById('am-cap');dots=document.getElementById('am-dots');playB=document.getElementById('am-play');sndB=document.getElementById('am-snd');
  au=new Audio();au.preload='auto';
  document.getElementById('am-x').onclick=close;
  d.addEventListener('click',e=>{if(e.target===d)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!d.hidden)close()});
  playB.onclick=()=>{
    if(playing){stop();return}
    const n=ANIM[key].steps.length;
    if(playB.textContent.includes('novo')){build();cur=0}else if(cur<n-1){cur++}else{build();cur=0}
    playing=true;token++;playB.textContent='❚❚ Pausar';run();
  };
  document.getElementById('am-next').onclick=()=>goTo(Math.min(cur+1,ANIM[key].steps.length-1));
  document.getElementById('am-prev').onclick=()=>goTo(Math.max(cur-1,0));
  sndB.onclick=()=>{sound=!sound;sndB.textContent=sound?'🔊 Som':'🔇 Mudo';if(!sound)try{au.pause()}catch(e){}};
  document.querySelectorAll('.fig [data-h]').forEach(el=>{
    const k=el.dataset.h;if(!ANIM[k])return;
    const b=document.createElement('button');b.className='am-open';b.textContent='▶ Ver desenhando (com áudio)';b.onclick=()=>open(k);
    el.parentNode.insertBefore(b,el.nextSibling);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
