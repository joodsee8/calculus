/* PARCHE5: Edith con Gemini (clases, checklist por mundo, problemas IA con dificultad adaptativa) */
const TOPICS=[[0,['Concepto intuitivo de límite','Evaluación directa','Factorización y simplificación','Racionalización','Límites laterales','Límites al infinito','Límites infinitos y asíntotas','Tipos de discontinuidad','Parámetros de continuidad','Teoremas de continuidad']],
[1,['Derivadas de potencias','Regla del producto','Regla del cociente','Regla de la cadena','Derivadas logarítmicas','Derivadas trigonométricas','Derivación implícita','Rectas tangentes y normales','Puntos críticos y máximos/mínimos','Concavidad y puntos de inflexión','Optimización','Tasas relacionadas','Regla de L’Hôpital']],
[2,['Integrales inmediatas','Integral definida','Sustitución (cambio de variable)','Integración por partes','Sustitución trigonométrica','Fracciones parciales','Área entre curvas','Volúmenes de revolución','Acumulación en ingeniería química','Integrales impropias']]];
const TP=TOPICS.flatMap(([w,l])=>l.map(t=>[t,w]));
S.rk=S.rk||{};S.ck=S.ck||{};
document.head.insertAdjacentHTML('beforeend','<style>#say{max-height:240px;overflow:auto}.msg{padding:8px;margin:6px 0;border-left:4px solid var(--ln)}.msg.u{border-color:var(--bl);background:#5b8def22}.sm{font-size:8px!important;padding:6px 8px!important}</style>');
/* --- Gemini (vía servidor: la clave NUNCA está en el navegador) --- */
const API=(window.CQ_API||'').replace(/\/+$/,'');
const gk=()=>API&&!/TU-SERVICIO/.test(API)?'srv':'';
async function gem(sys,msgs){let r;try{r=await fetch(API+'/api/gemini',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:sys,messages:msgs}),signal:AbortSignal.timeout(60000)})}catch(e){throw new Error('No se pudo conectar con el servidor. Si lleva rato inactivo, Render gratis tarda ~1 min en despertar: reintenta.')}
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||('Error '+r.status));return d.text}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const rich=t=>esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').split('\n').map(fm).join('<br>');
function esay(t,m){sprite(m||'n');const s=document.getElementById('say');s.innerHTML=rich(t);if(window.MathJax&&MathJax.typesetPromise)MathJax.typesetPromise([s]).catch(()=>{})}
const ES='Eres Edith, tutora de cálculo cálida, paciente y directa dentro de un videojuego. Hablas con José, estudiante de ingeniería química en México. Español, mensajes cortos (máx. 150 palabras), sin Markdown ni LaTeX: usa símbolos Unicode (x², √, ∫, π, →, ′). Una sola pregunta a la vez. ';
function ctx(){const m=topicStats(),E=Object.entries(m);return `Nivel ${lvl()}. Temas dominados: ${E.filter(([k,t])=>mastered(t)).map(x=>x[0]).slice(0,6).join(', ')||'ninguno aún'}. Temas débiles: ${E.filter(([k,t])=>weak(t)).map(x=>x[0]).slice(0,4).join(', ')||'ninguno'}.`}
/* --- Chat lateral con Gemini (sin clave sigue usando las respuestas locales) --- */
const CH=[];
{const o=ask;ask=function(t){if(!gk())return o(t);
 if(P&&P.mode==='exam'){say(0,'x','En modo examen no puedo ayudarte, José. ¡Tú puedes!');return}
 const e=P&&P.q[P.i];CH.push({r:'user',t});while(CH.length>12||(CH[0]&&CH[0].r!=='user'))CH.shift();say(0,'t','Pensando…');
 gem(ES+ctx()+(e?` El estudiante trabaja este ejercicio: «${e.q.replace(/<[^>]+>/g,' ')}». No reveles la respuesta final; guía con preguntas y pistas.`:'')+' Si pregunta algo ajeno al cálculo, redirige amablemente.',CH)
 .then(r=>{CH.push({r:'model',t:r});esay(r,'h')}).catch(er=>{CH.pop();esay('No pude conectar con Gemini ('+er.message+'). Revisa la conexión en Ajustes.','w')})}}
/* --- Checklist por mundo --- */
function stat(t){const x=topicStats()[t];if(S.ck[t]==='si')return '✔ Lo domino';if(S.ck[t]==='no')return '✘ No lo sé';
 if(x&&x.n)return mastered(x)?'✔ Dominado':weak(x)?'⚠ Reforzar':'… En progreso ('+x.ok+'/'+x.n+')';return '○ Sin ver'}
function checklist(w){const rows=TP.map((x,i)=>[x,i]).filter(([x])=>x[1]===w).map(([x,i])=>`<tr><td>${x[0]}</td><td>${stat(x[0])}</td><td><button class="btn sm" onclick="lesson(${i})">Clase</button><button class="btn alt sm" onclick="aiMode(${i})">IA</button><button class="btn gh sm" onclick="ckc(${i})">Marcar</button></td></tr>`).join('');
 return `<div class="pn"><h2>Checklist: ${WORLDS[w].n}</h2><p>«Marcar» alterna: sin marca → No lo sé → Lo domino. «Clase» te la da Edith; «IA» genera problemas a tu nivel.</p><table>${rows}</table></div>`}
const CKS=['','no','si'];
function ckc(i){const t=TP[i][0];S.ck[t]=CKS[(CKS.indexOf(S.ck[t]||'')+1)%3];save();world(TP[i][1])}
{const o=world;world=function(w){o(w);document.getElementById('v').insertAdjacentHTML('afterbegin',checklist(w))}}
/* --- Clases con Edith --- */
let LS=null;
function lesson(i){const t=TP[i][0];LS={i,t,m:[],busy:false};
 view(`<div class="pn"><h2>Clase: ${t}</h2><div id="lg"></div><p><input type="text" id="li" placeholder="Tu respuesta o duda…" autocomplete="off"></p><button class="btn" id="ls">Enviar</button><button class="btn alt" id="lp">Problema IA</button><button class="btn gh" id="lx">Salir</button></div>`);
 ls.onclick=lsend;lp.onclick=()=>aiMode(i);lx.onclick=()=>{LS=null;world(TP[i][1])};li.onkeydown=k=>{if(k.key==='Enter')lsend()};
 if(!gk()){lg.innerHTML='<p class="bad">Para dar clase necesito conexión con el servidor de IA. Ve a Ajustes.</p>';return}
 lturn('Empieza la clase sobre «'+t+'». Primero pregúntame qué sé del tema.',true)}
function lsend(){const v=li.value.trim();if(!v||LS.busy)return;li.value='';lturn(v)}
async function lturn(txt,hidden){LS.busy=true;const g=document.getElementById('lg');
 if(!hidden)g.insertAdjacentHTML('beforeend',`<div class="msg u">${rich(txt)}</div>`);LS.m.push({r:'user',t:txt});say(0,'t','Pensando…');
 try{let r=await gem(ES+`Das una clase del tema «${LS.t}» hasta que José lo domine. Método: 1) pregunta qué sabe; 2) explica con intuición y un ejemplo resuelto paso a paso; 3) propón UN ejercicio corto y espera su respuesta; 4) corrige con pistas, sin dar la solución de golpe; 5) sube la dificultad poco a poco; 6) tras 2 aciertos seguidos plantea un problema real de ingeniería (modelar, optimizar, acumular), no solo mecánico; 7) cuando lo resuelva con comprensión, felicítalo y termina tu mensaje con [DOMINADO]. Si le faltan prerrequisitos, retrocede y enséñalos. `+ctx(),LS.m);
  LS.m.push({r:'model',t:r});const ok=/\[DOMINADO\]/.test(r);r=r.replace(/\[DOMINADO\]/g,'').trim();
  g.insertAdjacentHTML('beforeend',`<div class="msg">${rich(r)}</div>`);say(0,'h','Sigue con la clase, José.');
  if(ok){S.ck[LS.t]='si';save();g.insertAdjacentHTML('beforeend','<p class="ok"><b>¡Tema dominado!</b> Consolídalo con problemas IA.</p>')}
 }catch(er){LS.m.pop();g.insertAdjacentHTML('beforeend',`<p class="bad">Error con Gemini: ${esc(er.message)}</p>`)}
 LS.busy=false}
/* --- Problemas infinitos con dificultad adaptativa --- */
async function aiMode(i){if(!gk()){ajustes();return}
 if(typeof i!=='number'){const m=topicStats(),all=TP.map((x,j)=>j),wk=all.filter(j=>m[TP[j][0]]&&weak(m[TP[j][0]])),nd=all.filter(j=>S.ck[TP[j][0]]!=='si'&&!(m[TP[j][0]]&&mastered(m[TP[j][0]]))),pool=(wk.length&&Math.random()<.6)?wk:(nd.length?nd:all);i=pool[Math.floor(Math.random()*pool.length)]}
 const[t,w]=TP[i],k=S.rk[t]=S.rk[t]||{r:2,u:0,d:0},r=k.r;
 view(`<div class="pn"><h2>Generando problema…</h2><p>${t} · dificultad ${r}/5</p></div>`);say(0,'t','Preparando un problema a tu nivel…');
 try{const txt=await gem('Eres un generador de ejercicios de cálculo para estudiantes de ingeniería química. Responde SOLO un objeto JSON válido.',[{r:'user',t:`Tema: ${t}. Dificultad ${r}/5 (1 directo, 3 varios pasos, 5 problema aplicado exigente). ${r>=3?'Plantea un problema de contexto real (ingeniería química, física o economía) que exija modelar la situación.':'Ejercicio directo y claro.'} La respuesta final debe ser UN número que se pueda teclear (sin respuestas simbólicas; si el tema es una integral indefinida, pide una definida). Resuelve primero con cuidado y verifica el resultado. Sin Markdown ni LaTeX; usa Unicode (x², √, ∫, π). JSON con este orden de claves: {"q":"enunciado en español","sol":"solución paso a paso breve","a":número,"tol":tolerancia absoluta,"h":["pista1","pista2","pista3"],"err":"error típico"}`}]);
  const o=JSON.parse(txt.replace(/^[^{]*|[^}]*$/g,''));if(typeof o.q!=='string'||!isFinite(o.a))throw new Error('Respuesta de IA inválida');
  const e={id:'AI'+Date.now(),w,r,top:t,t:'n',q:o.q,a:+o.a,tol:Math.max(+o.tol||0,Math.abs(o.a)*.005,.01),h:[...(o.h||[]),'Identifica qué te piden.','Escribe lo que sabes.','Revisa tus cuentas.'].slice(0,3),sol:String(o.sol||''),err:String(o.err||'')};
  startRun([e],{mode:'ai'});document.getElementById('ex').insertAdjacentHTML('afterend','<button class="btn gh" id="bd">Problema defectuoso</button>');bd.onclick=()=>{P=null;aiMode(i)}
 }catch(er){view(`<div class="pn"><h2>No pude generar el problema</h2><p class="bad">${esc(er.message)}</p><button class="btn" onclick="aiMode(${i})">Reintentar</button><button class="btn alt" onclick="ajustes()">Ajustes</button></div>`)}}
{const o=endRun;endRun=function(){if(!P||P.mode!=='ai')return o();const e=P.q[0],ok=!!(P.res[0]&&P.res[0].ok),t=e.top,k=S.rk[t]=S.rk[t]||{r:2,u:0,d:0};P=null;
 if(ok){k.u++;k.d=0}else{k.d++;k.u=0}let n='';if(k.u>=2&&k.r<5){k.r++;k.u=0;n='Subo la dificultad.'}else if(k.d>=2&&k.r>1){k.r--;k.d=0;n='Bajo un poco la dificultad para consolidar.'}
 save();const j=TP.findIndex(x=>x[0]===t);
 view(`<div class="pn"><h2>${ok?'¡Bien hecho!':'Sigamos practicando'}</h2><p>${t} · dificultad ${k.r}/5. ${n}</p><button class="btn" onclick="aiMode(${j})">Otro problema</button>${ok?'':`<button class="btn alt" onclick="lesson(${j})">Clase con Edith</button>`}<button class="btn gh" onclick="aiMode()">Otro tema</button><button class="btn gh" onclick="home()">Inicio</button></div>`);say(ok?'ok':'bad',ok?'h':'w')}}
/* --- Conexión --- */
function ajustes(){view(`<div class="pn"><h2>Conexión de Edith (IA)</h2><p>Servidor: <b>${esc(API||'sin configurar')}</b></p><p>La clave de Gemini vive en el servidor. Para cambiar la URL edita <code>web/config.js</code>.</p><button class="btn" id="gs">Probar conexión</button><div id="gt"></div></div>`);
 gs.onclick=async()=>{gt.innerHTML='<p>Probando…</p>';try{const h=await fetch(API+'/api/health').then(r=>r.json());if(!h.key)throw new Error('El servidor no tiene GEMINI_API_KEY');const r=await gem(ES,[{r:'user',t:'Salúdame en una frase.'}]);gt.innerHTML=`<p class="ok">Conectado (${esc(h.model)}).</p>`;esay(r,'h')}catch(er){gt.innerHTML='<p class="bad">'+esc(er.message)+'</p>'}}}
