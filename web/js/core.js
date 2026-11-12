/* ===== 2. PERSISTENCIA ===== */
const KEY='acq_v1';
const DEF=()=>({xp:0,seen:[],log:[],xpd:{},lv:{},exams:[],streak:0,best:0,last:0,na:false,snd:true});
let S;try{S=Object.assign(DEF(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){S=DEF()}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
/* ===== 3. VALIDACIÓN ===== */
function compile(s){try{s=String(s).toLowerCase().replace(/,/g,'.').replace(/\+\s*c\s*$/,'').replace(/\^/g,'**').replace(/\bln\b/g,'log').replace(/(?<![a-z])pi(?![a-z])|π/g,'(3.141592653589793)');
s=s.replace(/(\d|\)|x(?![a-z]))\s*(?=[a-z(])/g,'$1*').replace(/\b(sin|cos|tan|sqrt|exp|log)\b/g,'Math.$1');
if(!s.trim()||!/^[\dx+\-*/().\s]*$/.test(s.replace(/Math\.(sin|cos|tan|sqrt|exp|log)/g,'')))return null;
const f=new Function('x','return '+s);f(1);return f}catch(e){return null}}
function check(ex,v){
 if(ex.t==='o')return v===ex.steps.map((_,i)=>i).join(',');
 if(ex.t==='m')return v==ex.a;
 const f=compile(v);if(!f)return null;
 if(ex.t==='n'){const r=f(0);return isFinite(r)&&Math.abs(r-ex.a)<=(ex.tol||0.005)}
 const xs=[0.7,1.3,2.1,-0.6,1.9];let d=null;
 for(const x of xs){const u=f(x),g=ex.f(x);if(!isFinite(u))return null;const e=ex.t==='a'?u-g:u-g;
  if(ex.t==='a'){if(Math.abs(e)>1e-6*Math.max(1,Math.abs(g)))return false}
  else{if(d===null)d=e;else if(Math.abs(e-d)>1e-6*Math.max(1,Math.abs(g)))return false}}
 return true}
/* ===== 4. EDITH (personaje por reglas, sin IA) ===== */
const pick=a=>a[Math.floor(Math.random()*a.length)];
const DLG={
start:['¡José! Justo a tiempo. Tenemos ejercicios pendientes y sospecho que no se van a resolver solos. ¿Empezamos?','Hola, José. Hoy toca avanzar un poquito. Con constancia se llega lejos.'],
back:['José, qué bueno verte de nuevo. Retomemos donde nos quedamos; primero recordemos lo que ya dominabas.'],
ok:['¡Eso es, José! Elegiste bien el procedimiento, no solo el resultado.','¡Muy bien! Guarda ese movimiento, lo vamos a necesitar después.','Correcto. Se nota que estás entendiendo la idea.'],
bad:['Casi, José. La idea tiene sentido, pero hay un detalle que nos juega en contra. Vamos a revisarlo.','No pasa nada, equivocarse es parte de aprender. Mira la pista y lo intentamos otra vez.','Todavía no, José, pero estás cerca de ver el patrón.'],
frus:['Tranquilo, José. No tienes que dominarlo todo en un intento. Dividamos el problema en pasos más pequeños.'],
hint:['Te doy una pista, pero la mayor parte del camino es tuya.','Mira esto con calma; ya casi lo ves.'],
lvl:['¡Nivel superado! ¿Ves lo que pasa cuando no abandonas un problema a la primera? Estoy orgullosa de tu progreso, José.'],
nolvl:['Aún no llegamos al 80 %, José. Revisa los errores y repítelo cuando quieras; no pierdes nada.'],
think:['Piensa en qué te piden y qué sabes. Aquí estoy.']};
const FAQ=[[/l[ií]mite|indetermin/,'Un límite describe a qué valor se acerca f(x) cuando x se acerca a un punto. Si al sustituir sale 0/0, factoriza, racionaliza o simplifica antes de volver a sustituir.'],
[/continu|discontinu/,'f es continua en a si f(a) existe, el límite existe y ambos coinciden. Si el límite existe pero no coincide con f(a), la discontinuidad es evitable.'],
[/cociente/,'Regla del cociente: (u/v)′=(u′v−uv′)/v². El orden del numerador importa.'],
[/cadena|compuest/,'Regla de la cadena: deriva la función exterior (sin tocar la interior) y multiplica por la derivada de la interior.'],
[/producto/,'Regla del producto: (uv)′=u′v+uv′.'],
[/derivad/,'La derivada es la pendiente de la tangente y la razón de cambio instantánea. Reglas clave: potencia, suma, producto, cociente y cadena.'],
[/optimiz|m[aá]xim|m[ií]nim|cr[ií]tic/,'Para optimizar: modela la función, deriva, resuelve f′=0, clasifica con la segunda derivada o el signo de f′, y revisa el dominio y los extremos.'],
[/constante|\+ ?c/,'En integrales indefinidas siempre va +C, porque muchas funciones tienen la misma derivada.'],
[/integral|antiderivad|[aá]rea/,'La integral definida acumula cantidad: ∫ₐᵇ f = F(b)−F(a). El área geométrica separa las partes bajo el eje x; la neta las resta.']];
/* Sprite de Edith 36x46: formas + sombreado + contorno automático */
const W=36,H=46,PAL={o:'#14143a',r:'#c8452a',R:'#e8744a',t:'#2a8f9a',q:'#4fd1b8',n:'#14143a',k:'#f2c9b0',K:'#d9a98f',e:'#14143a',m:'#a23b4a',w:'#ffffff',b:'#2f9cb8',B:'#1f6f8a'};
const MOUTH={n:[[14,21],[15,21],[16,21],[17,21]],h:[[13,20],[14,21],[15,21],[16,21],[17,21],[18,20]],w:[[13,22],[14,21],[15,21],[16,21],[17,21],[18,22]],x:[[15,20],[16,20],[15,21],[16,21]],t:[[14,21],[15,21],[16,21],[17,20]]};
let cm='n';
function build(m,hd){const g=Array.from({length:H},()=>Array(W).fill(0));
 const P=(x,y,c)=>{if(x>=0&&x<W&&y>=0&&y<H)g[y][x]=c};
 const R=(x,y,w,h,c)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)P(x+i,y+j,c)};
 const E=(cx,cy,rx,ry,c)=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<=1)P(x,y,c)};
 /* piernas, zapatos y torso del overol */
 R(11,34,4,9,'b');R(17,34,4,9,'b');R(11,34,10,2,'b');R(14,36,1,7,'B');R(17,36,1,7,'B');R(10,43,6,2,'n');R(16,43,6,2,'n');
 R(10,24,12,10,'b');R(9,25,14,3,'b');R(13,24,6,1,'B');R(16,25,1,9,'B');R(10,33,12,1,'B');R(14,22,4,2,'k');R(14,23,4,1,'K');
 /* brazo en la cadera (izquierda de la imagen) */
 R(8,25,2,3,'b');R(6,28,3,3,'b');R(7,31,3,2,'b');R(9,32,2,2,'k');
 /* brazo derecho: en reposo o saludando */
 if(!hd){R(22,25,3,3,'b');R(24,28,2,6,'b');R(24,34,2,2,'k')}
 /* cabello, moño, diadema, cara y flequillo */
 E(13,4.5,4,3.5,'r');R(11,3,2,1,'R');
 E(16,14,10,8,'r');R(10,8,3,1,'R');R(18,9,2,1,'R');
 R(7,8,18,2,'t');
 E(16,16,7,6.5,'k');R(9,10,14,2,'r');R(9,12,2,5,'r');R(21,12,2,5,'r');R(13,11,3,1,'R');
 /* lentes redondos turquesa */
 [8,17].forEach(fx=>{R(fx,14,7,5,'n');R(fx+1,15,5,3,'q');R(fx+2,16,3,2,'e');[[0,0],[6,0],[0,4],[6,4]].forEach(([a,b])=>P(fx+a,14+b,(fx+a<=9||fx+a>=22)?'r':'k'))});R(15,15,2,1,'n');P(16,19,'K');
 /* boca */
 (MOUTH[m]||MOUTH.n).forEach(([x,y])=>P(x,y,'e'));
 /* mano que saluda */
 if(hd){const dx=hd===2?1:0;R(22,25,7,3,'b');R(27,20,3,6,'b');R(27+dx,16,3,4,'b');R(27+dx,16,3,1,'B');E(28.5+dx,13.5,2.4,2.4,'k');
  R(26+dx,10,1,3,'k');R(27+dx,9,1,4,'k');R(28+dx,8,1,5,'k');R(29+dx,9,1,4,'k');R(30+dx,12,1,2,'k')}
 const o=g.map(r=>r.slice());
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!g[y][x]&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>g[y+b]&&g[y+b][x+a]))o[y][x]='o';
 return o}
function sprite(m,hd){cm=m;let h='';build(m,hd).forEach((row,y)=>{let x=0;while(x<W){const c=row[x];if(!c){x++;continue}let n=1;while(x+n<W&&row[x+n]===c)n++;h+=`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${PAL[c]}"/>`;x+=n}});
 document.getElementById('sp').innerHTML=h}
function wave(){let n=0;if(S.na){sprite(cm,1);setTimeout(()=>sprite(cm,0),2500);return}
 const t=setInterval(()=>{sprite(cm,n%2+1);if(++n>9){clearInterval(t);sprite(cm,0)}},320)}
/* ===== Sonidos arcade (WebAudio, sin archivos; solo tras una interacción) ===== */
let AC;function snd(notes,type,dur,vol){if(!S.snd)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume();let t=AC.currentTime;
 notes.forEach(f=>{const o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.value=f;g.gain.setValueAtTime(vol||.04,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+dur);t+=dur*.9})}catch(e){}}
const SFX={click:()=>snd([660],'square',.05),ok:()=>snd([523,659,784,1047],'square',.09),bad:()=>snd([196,147],'sawtooth',.16),hint:()=>snd([880,988],'triangle',.07),lvl:()=>snd([523,523,523,659,784,659,784,1047],'square',.11)};
document.addEventListener('click',e=>{if(e.target.closest('button,.btn,.opt'))SFX.click()},true);
function say(k,m,txt){sprite(m||'n');document.getElementById('say').textContent=txt||pick(DLG[k])}
function ask(t){t=t.toLowerCase();for(const[r,a]of FAQ)if(r.test(t)){say(0,'n',a);return}
 say(0,'w','Esa pregunta se me escapa un poco, José. Puedo ayudarte con límites, continuidad, reglas de derivación, optimización e integrales. ¿Cuál quieres revisar?')}
/* ===== 5. PROGRESO Y ESTADÍSTICAS ===== */
const lvl=()=>Math.floor(S.xp/100)+1;
const exOf=(w,r)=>EX.filter(e=>e.w===w&&e.r===r);
const lvDone=(w,r)=>!!(S.lv[w+'-'+r]&&S.lv[w+'-'+r].done);
const lvOpen=()=>true;
const pct=(a,b)=>b?Math.round(100*a/b):0;
function topicStats(){const m={};S.log.forEach(l=>{const t=m[l.top]=m[l.top]||{n:0,ok:0,last:0};t.n++;t.ok+=l.ok?1:0;t.last=Math.max(t.last,l.ts)});return m}
const mastered=t=>t.n>=3&&t.ok/t.n>=.8, weak=t=>t.n>=2&&t.ok/t.n<.6;
function badges(){const b=[];if(S.log.length>=1)b.push('Primer paso');if(S.best>=5)b.push('Racha de 5');if(S.log.filter(l=>l.ok).length>=10)b.push('10 aciertos');
 WORLDS.forEach((w,i)=>{if([1,2,3,4,5].every(r=>lvDone(i,r)))b.push('Mundo '+(i+1)+' completo')});if(S.exams.length)b.push('Examinado');return b}
/* ===== Renderizado matemático (MathJax opcional) =====
 Convierte símbolos Unicode a TeX solo si MathJax cargó; sin conexión se muestra el texto plano.
 MathJax nunca calcula ni valida respuestas. */
const SUP={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-','ⁿ':'n','ˣ':'x'},SUB={'₀':'0','₁':'1','₂':'2','₃':'3','₋':'-'};
const TRIG=/[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿˣ₀₁₂₃√∫∞π′≤≥→≈·×^]|\d\/|\)\/|\/\(|^sen$|[=<>]/;
function tex(t){return t.replace(/−/g,'-').replace(/[₀₁₂₃₋]+/g,m=>'_{'+[...m].map(c=>SUB[c]).join('')+'}').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿˣ⁻]+/g,m=>'^{'+[...m].map(c=>SUP[c]).join('')+'}')
 .replace(/\^\(([^()]*)\)/g,'^{$1}').replace(/√\(([^()]*)\)/g,'\\sqrt{$1}').replace(/√([A-Za-z0-9]+)/g,'\\sqrt{$1}').replace(/\(([^()]+)\)\/\(([^()]+)\)/g,'\\frac{$1}{$2}')
 .replace(/∫/g,'\\int ').replace(/∞/g,'\\infty ').replace(/π/g,'\\pi ').replace(/′/g,"'").replace(/≤/g,'\\le ').replace(/≥/g,'\\ge ').replace(/→/g,'\\to ').replace(/≈/g,'\\approx ').replace(/·/g,'\\cdot ').replace(/×/g,'\\times ')
 .replace(/\bsen\b/g,'\\operatorname{sen}').replace(/\b(cos|tan|ln)\b/g,'\\$1')}
function fmText(t){const parts=t.split(/(\s+)/),tk=[];
 parts.forEach(x=>{if(!x||/^\s+$/.test(x)){tk.push({sp:x});return}const m=x.match(/^([¿¡«]*)(.*?)([.,;:?!»]*)$/);tk.push({pre:m[1],core:m[2],post:m[3],math:TRIG.test(m[2])&&!/^(\d+\.?|[.,]+)$/.test(m[2])})});
 const w=tk.filter(x=>!x.sp),OP=/^[+\-−=·×*]$/,SH=/^[\w().^{}'√]{1,10}$/;
 for(let i=1;i<w.length;i++){const p=w[i-1],c=w[i];if(!c.math&&!p.post&&p.math){if(OP.test(c.core))c.math=true;else if(/^d[xyt]$/.test(c.core))c.math=true}else if(!c.math&&!p.post&&p.math&&p.op&&SH.test(c.core))c.math=true;if(p.math&&OP.test(p.core)&&!p.post&&!c.math&&SH.test(c.core))c.math=true;if(OP.test(c.core)&&c.math)c.op=1}
 for(let i=w.length-2;i>=0;i--){const c=w[i],n=w[i+1];if(!c.math&&!c.post&&n.math&&OP.test(c.core)){c.math=true;if(i>0&&!w[i-1].post&&!w[i-1].math&&SH.test(w[i-1].core))w[i-1].math=true}}
 let o='',run=[],post='',sp='';
 const flush=()=>{if(run.length){o+='\\('+tex(run.join(' '))+'\\)'+post;run=[];post=''}o+=sp;sp=''};
 for(const x of tk){
  if(x.sp!==undefined){if(run.length)sp+=x.sp;else o+=x.sp;continue}
  if(x.math){if(!run.length)o+=x.pre;run.push(x.core);sp='';post=x.post;if(post)flush()}
  else{flush();o+=x.pre+x.core+x.post}}
 flush();return o}
function fm(s){if(!(window.MathJax&&window.MathJax.typesetPromise))return s;return String(s).split(/(<[^>]+>)/).map(x=>x[0]==='<'?x:fmText(x)).join('')}
let mjBusy=false,mjT;
function mjRun(){if(!(window.MathJax&&window.MathJax.typesetPromise))return;mjBusy=true;MathJax.typesetPromise([document.getElementById('v')]).catch(()=>{}).finally(()=>{mjObs.takeRecords();mjBusy=false})}
const mjObs=new MutationObserver(()=>{if(mjBusy)return;clearTimeout(mjT);mjT=setTimeout(mjRun,30)});
mjObs.observe(document.getElementById('v'),{childList:true,subtree:true});
/* ===== 6. MOTOR DE EJERCICIOS ===== */
let P=null,timer=null;
function startRun(q,o){if(!q.length){view(`<div class="pn"><h2>Sin ejercicios</h2><p>No hay ejercicios disponibles para esta selección.</p></div>`);return}
 P=Object.assign({q,i:0,ok1:0,res:[],tries:0,hint:0,hints:true,mode:'practice',done:false},o);show()}
function show(){const e=P.q[P.i];P.tries=0;P.hint=0;P.cur=null;
 const inp=e.t==='o'?'<div id="ord"></div>':e.t==='m'?e.o.map((o,i)=>`<label class="opt"><input type="radio" name="o" value="${i}"> ${fm(o)}</label>`).join(''):`<input type="text" id="ans" autocomplete="off" aria-label="Respuesta" placeholder="${e.t==='n'?'Número o fracción, ej. 3/5':'Expresión, ej. 3x^2+1'}">`;
 view(`<div class="pn pop"><div class="tag">${WORLDS[e.w].n} · ${RANKS[e.r-1]} · ${e.top} · ${P.i+1}/${P.q.length}${P.mode==='exam'?' · <span id="tm"></span>':''}</div>
 <h3 style="margin-top:12px;line-height:1.6;font-family:Georgia;font-size:18px;color:var(--cr)">${fm(e.q)}</h3>${gph(e)}${inp}
 <div><button class="btn" id="go">Comprobar</button>${P.hints?'<button class="btn alt" id="hn">Pista</button>':''}<button class="btn gh" id="ex">Salir</button></div>
 <div id="fb"></div></div>`);
 S.last=Date.now();if(!S.seen.includes(e.id))S.seen.push(e.id);save();say('think','t');
 if(e.t==='o'){const so=e.steps.map((_,i)=>i).join();do{P.perm=shuf(e.steps.map((_,i)=>i))}while(P.perm.join()===so);P.seq=[];ordR()}
 go.onclick=submit;ex.onclick=()=>{clearInterval(timer);P=null;home()};if(P.hints)hn.onclick=hint;
 const a=document.getElementById('ans');if(a){a.focus();a.onkeydown=k=>{if(k.key==='Enter')submit()}}}
function ordR(){const e=P.q[P.i],d=document.getElementById('ord');
 d.innerHTML='<p class="tag" style="line-height:1.8">Toca los pasos en el orden correcto:</p>'+P.perm.filter(i=>!P.seq.includes(i)).map(i=>`<button class="btn gh" data-i="${i}" style="text-align:left;font:15px Georgia;display:block;width:100%">${fm(e.steps[i])}</button>`).join('')+(P.seq.length?`<p class="tag">Tu orden:</p><ol>${P.seq.map(i=>`<li>${fm(e.steps[i])}</li>`).join('')}</ol><button class="btn alt" id="rs">Reiniciar orden</button>`:'');
 d.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{P.seq.push(+b.dataset.i);ordR()});const r=document.getElementById('rs');if(r)r.onclick=()=>{P.seq=[];ordR()}}
function hint(){const e=P.q[P.i];if(P.hint<3){document.getElementById('fb').insertAdjacentHTML('beforeend',`<p class="tag" style="line-height:1.8">Pista ${P.hint+1}: <span style="font:15px Georgia;color:var(--cr)">${fm(e.h[P.hint])}</span></p>`);P.hint++;say('hint','t');SFX.hint()}
 else document.getElementById('fb').insertAdjacentHTML('beforeend','<p>Ya no hay más pistas. Intenta una respuesta y luego verás la solución completa.</p>')}
function submit(){const e=P.q[P.i];let v;
 if(e.t==='o'){if(P.seq.length<e.steps.length)return;v=P.seq.join(',')}else if(e.t==='m'){const r=document.querySelector('input[name=o]:checked');if(!r)return;v=r.value}else v=document.getElementById('ans').value;
 if(!String(v).trim())return;const c=check(e,v);const fb=document.getElementById('fb');
 if(c===null){fb.innerHTML='<p class="bad">No pude interpretar esa expresión. Usa x, +, −, *, /, ^ y paréntesis (ej. 2x*(x^2+1)). Puedes escribir fracciones como 3/5.</p>';return}
 P.tries++;
 if(P.tries===1){P.res.push({id:e.id,ok:c,top:e.top});if(c)P.ok1++;
  if(P.mode==='exam'){nextEx();return}
  const prevFail=S.log.some(l=>l.id===e.id&&!l.ok);
  S.log.push({id:e.id,ok:c,ts:Date.now(),w:e.w,top:e.top,m:P.mode});
  if(c){S.streak++;S.best=Math.max(S.best,S.streak);if(!S.xpd[e.id]){S.xpd[e.id]=1;S.xp+=10*e.r+(prevFail?5:0)}}else S.streak=0}
 else if(c&&!S.xpd[e.id]){S.xpd[e.id]=1;S.xp+=3}
 save();
 if(c){fb.innerHTML=`<div class="ok"><h3>✔ Correcto</h3><p><b>Procedimiento:</b> ${fm(e.sol)}</p><p><b>Error típico:</b> ${fm(e.err)}</p></div><button class="btn" id="nx">Siguiente</button>`;nx.onclick=nextEx;say('ok','h');SFX.ok()}
 else{const two=S.log.slice(-2).every(l=>!l.ok);fb.innerHTML=`<div class="bad"><h3>✘ Aún no</h3><p><b>Error típico:</b> ${fm(e.err)}</p>${P.hints?'':''}</div><button class="btn alt" id="sl">Ver solución</button>`;
  sl.onclick=()=>{fb.insertAdjacentHTML('beforeend',`<div class="ok"><p><b>Solución:</b> ${fm(e.sol)}</p></div><button class="btn" id="nx">Siguiente</button>`);nx.onclick=nextEx};
  say(two?'frus':'bad','w');SFX.bad()}}
function nextEx(){if(P.i<P.q.length-1){P.i++;show()}else endRun()}
function endRun(){clearInterval(timer);const n=P.res.length,a=pct(P.ok1,n);let msg='';
 if(P.mode==='story'){const k=P.w+'-'+P.r;if(a>=80){if(!lvDone(P.w,P.r))S.xp+=25;S.lv[k]={done:true,best:Math.max(a,(S.lv[k]||{}).best||0)};say('lvl','x');SFX.lvl()}
  else{S.lv[k]=Object.assign({done:false},S.lv[k],{best:Math.max(a,(S.lv[k]||{}).best||0)});say('nolvl','w')}msg=a>=80?'¡Nivel superado!':'Necesitas 80 % para superar el nivel. Puedes repetirlo.'}
 if(P.mode==='exam'){S.exams.push({ts:Date.now(),pct:a,items:P.res});msg='Examen terminado (resultados separados de la práctica).'}
 save();const rev=P.res.map(r=>{const e=EX.find(x=>x.id===r.id);return `<tr><td>${r.ok?'✔':'✘'}</td><td>${fm(e.q)}</td><td>${P.mode==='exam'?fm(e.sol):''}</td></tr>`}).join('');
 view(`<div class="pn"><h2>${msg||'Sesión terminada'}</h2><p>Aciertos al primer intento: ${P.ok1}/${n} (${a} %).</p>${P.mode==='exam'?`<h3>Revisión</h3><table>${rev}</table><h3>Por tema</h3>${byTopic(P.res)}`:''}<button class="btn" onclick="home()">Inicio</button><button class="btn alt" onclick="stats()">Progreso</button></div>`);P=null}
function byTopic(r){const m={};r.forEach(x=>{(m[x.top]=m[x.top]||[0,0]);m[x.top][1]++;if(x.ok)m[x.top][0]++});return '<table>'+Object.entries(m).map(([k,v])=>`<tr><td>${k}</td><td>${v[0]}/${v[1]}</td></tr>`).join('')+'</table>'}
/* ===== 7. MODOS ===== */
const shuf=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
function practice(w){if(w===undefined){view(`<div class="pn"><h2>Modo práctica</h2><p>Elige un mundo. Se priorizan ejercicios que aún no has visto.</p>${WORLDS.map((x,i)=>`<button class="btn" onclick="practice(${i})">${x.n}</button>`).join('')}</div>`);return}
 const all=EX.filter(e=>e.w===w),fresh=all.filter(e=>!S.seen.includes(e.id));
 if(!fresh.length){view(`<div class="pn"><h2>Banco agotado</h2><p>Ya viste todos los ejercicios de este mundo. Puedes repasarlos voluntariamente o reiniciar el historial de vistos.</p><button class="btn" onclick="startRun(shuf(EX.filter(e=>e.w===${w})),{})">Repasar todos</button><button class="btn alt" onclick="if(confirm('¿Reiniciar el historial de ejercicios vistos?')){S.seen=[];save();practice(${w})}">Reiniciar historial</button></div>`);return}
 startRun(shuf(fresh),{mode:'practice'})}
function challenge(){startRun(shuf(EX.filter(e=>e.r>=4)),{mode:'challenge'})}
function review(){const m=topicStats(),bad=EX.filter(e=>S.log.some(l=>l.id===e.id&&!l.ok)&&!S.log.some(l=>l.id===e.id&&l.ok&&l.ts>Math.max(...S.log.filter(x=>x.id===e.id&&!x.ok).map(x=>x.ts))));
 const sc=e=>{const t=m[e.top]||{n:0,ok:0,last:0};return -(t.n-t.ok)*10-(Date.now()-t.last)/864e5};
 if(!bad.length){view('<div class="pn"><h2>Repaso inteligente</h2><p>Aún no tienes errores pendientes de repaso. Practica un poco y vuelve aquí. (Es un algoritmo local de selección: prioriza temas con más errores y más tiempo sin practicar.)</p></div>');say(0,'h','Sin errores pendientes, José. ¡Buen trabajo!');return}
 startRun(bad.sort((a,b)=>sc(a)-sc(b)).slice(0,8),{mode:'review'})}
function examSetup(){view(`<div class="pn"><h2>Modo examen</h2><p>Sin pistas ni retroalimentación durante la prueba. Resultados separados de la práctica.</p>
 <p>Preguntas: <input type="text" id="en" value="8" style="width:70px"> Minutos: <input type="text" id="et" value="20" style="width:70px"></p>
 <p>Dificultad: <select id="ed"><option value="0">Todas</option><option value="1">Rangos 1-2</option><option value="2">Rango 3</option><option value="3">Rangos 4-5</option></select></p>
 <button class="btn" id="es">Comenzar</button></div>`);
 es.onclick=()=>{const d=+ed.value;let q=EX.filter(e=>d===0||(d===1&&e.r<=2)||(d===2&&e.r===3)||(d===3&&e.r>=4));q=shuf(q).slice(0,Math.max(1,Math.min(+en.value||8,q.length)));
  const mins=Math.max(1,+et.value||20);let left=mins*60;startRun(q,{mode:'exam',hints:false});
  clearInterval(timer);P.end=Date.now()+mins*60000;timer=setInterval(()=>{if(!P||P.mode!=='exam'){clearInterval(timer);return}const l=Math.round((P.end-Date.now())/1000);if(l<=0)endRun();else{const t=document.getElementById('tm');if(t)t.textContent='⏱ '+Math.floor(l/60)+':'+String(l%60).padStart(2,'0')}},1000)}}
/* ===== 8. PANTALLAS ===== */
function view(h){document.getElementById('v').innerHTML=h}
function home(){const total=S.log.length,ok=S.log.filter(l=>l.ok).length;
 view(`<div class="pn"><h1>EDITH’S CALCULUS QUEST</h1><p>Cada problema te acerca a dominar el cálculo.</p>
 <button class="btn" onclick="worlds()">${total?'Continuar':'Nueva aventura'}</button><button class="btn alt" onclick="practice()">Práctica</button><button class="btn gh" onclick="examSetup()">Examen</button></div>
 <div class="pn"><h3>Progreso general</h3><p>Nivel ${lvl()} · ${S.xp} XP · Aciertos ${pct(ok,total)} % · Racha ${S.streak} (máx. ${S.best})</p><div class="bar"><i style="width:${S.xp%100}%"></i></div></div>
 <div class="grid">${WORLDS.map((w,i)=>`<div class="pn ${lvOpen(i,1)?'':'lock'}"><h2>Mundo ${i+1}</h2><p>${w.n}</p><p class="tag">${[1,2,3,4,5].filter(r=>lvDone(i,r)).length}/5 niveles</p></div>`).join('')}</div>`)}
function worlds(){view(`<div class="grid">${WORLDS.map((w,i)=>`<div class="pn ${lvOpen(i,1)?'':'lock'}"><h2>Mundo ${i+1}: ${w.n}</h2><p>${[...new Set(EX.filter(e=>e.w===i).map(e=>e.top))].join(', ')}.</p><button class="btn" ${lvOpen(i,1)?'':'disabled'} onclick="world(${i})">Entrar</button></div>`).join('')}</div>
 <p>Todos los mundos y niveles están desbloqueados.</p>`)}
function world(w){view(`<div class="pn"><h2>${WORLDS[w].n}</h2>${[1,2,3,4,5].map(r=>{const o=lvOpen(w,r),l=S.lv[w+'-'+r]||{};return `<div class="pn ${o?'':'lock'}" style="margin:8px 0"><b class="px" style="font-size:11px">Rango ${r}: ${RANKS[r-1]}</b> ${lvDone(w,r)?'✔':''}<br>${exOf(w,r).length} ejercicios · mejor: ${l.best!==undefined?l.best+' %':'—'}<br><button class="btn" ${o?'':'disabled'} onclick="startRun(exOf(${w},${r}),{mode:'story',w:${w},r:${r}})">${lvDone(w,r)?'Repetir':'Jugar'}</button></div>`}).join('')}</div>`)}
function stats(){const m=topicStats(),ent=Object.entries(m);
 const wr=WORLDS.map((w,i)=>{const L=S.log.filter(l=>l.w===i);return `<tr><td>${w.n}</td><td>${pct(L.filter(l=>l.ok).length,L.length)} % (${L.length} intentos)</td></tr>`}).join('');
 const rows=ent.map(([k,t])=>`<tr><td>${k}</td><td>${t.ok}/${t.n}</td><td>${mastered(t)?'Dominado':weak(t)?'Reforzar':'Sin evidencia suficiente'}</td></tr>`).join('');
 const w=ent.filter(([k,t])=>weak(t)).sort((a,b)=>a[1].ok/a[1].n-b[1].ok/b[1].n)[0],s=ent.filter(([k,t])=>mastered(t))[0];
 const rec=w?`José, necesitas practicar «${w[0]}» (${w[1].ok}/${w[1].n} aciertos). Te recomiendo el modo repaso antes del siguiente nivel.${s?` Vas bien en «${s[0]}».`:''}`:ent.length?'Aún no hay temas claramente débiles. Sigue practicando: un solo acierto no demuestra dominio.':'Todavía no hay datos. Resuelve algunos ejercicios.';
 const last=S.log.slice(-15).map(l=>l.ok?'■':'□').join(' ');
 view(`<div class="pn"><h2>Seguimiento</h2><p>${rec}</p><h3>Por mundo</h3><table>${wr}</table><h3>Por tema</h3><table>${rows||'<tr><td>Sin datos</td></tr>'}</table>
 <h3>Últimos 15 intentos</h3><p class="px" style="font-size:10px">${last||'—'}</p>
 <h3>Examen (separado)</h3><p>${S.exams.length?S.exams.slice(-5).map(e=>e.pct+' %').join(', '):'Sin exámenes aún.'}</p>
 <h3>Insignias</h3><p>${badges().join(' · ')||'Ninguna aún.'}</p><p>Ejercicios vistos: ${S.seen.filter(x=>!x.startsWith('AI')).length}/${EX.length} · Problemas IA: ${S.log.filter(l=>l.m==='ai').length}</p>
 <button class="btn" onclick="exp()">Exportar JSON</button><label class="btn alt">Importar<input type="file" id="imp" accept=".json" hidden></label><button class="btn gh" onclick="if(confirm('¿Borrar TODO tu progreso? No se puede deshacer.')){S=DEF();save();home()}">Reiniciar</button></div>`);
 document.getElementById('imp').onchange=ev=>{const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(typeof d.xp!=='number'||!Array.isArray(d.log))throw 0;S=Object.assign(DEF(),d);save();home()}catch(e){alert('Archivo no válido.')}};r.readAsText(ev.target.files[0])}}
function exp(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='calculus-quest-progreso.json';a.click()}
