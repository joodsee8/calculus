/* ===== 9. ARRANQUE ===== */
const NAV=[['Inicio',home],['Mundos',worlds],['Práctica',practice],['Desafío',challenge],['Repaso',review],['Examen',examSetup],['IA',()=>aiMode()],['Progreso',stats],['Ajustes',ajustes]];
NAV.forEach(([t,f])=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{clearInterval(timer);P=null;f()};document.getElementById('nav').append(b)});
document.getElementById('chat').onsubmit=e=>{e.preventDefault();const q=document.getElementById('q');if(q.value.trim())ask(q.value);q.value=''};
const na=document.getElementById('na');na.checked=S.na;document.body.classList.toggle('na',S.na);na.onchange=()=>{S.na=na.checked;document.body.classList.toggle('na',S.na);save()};
const sn=document.getElementById('sn');sn.checked=S.snd;sn.onchange=()=>{S.snd=sn.checked;save()};
const away=S.last&&Date.now()-S.last>3*864e5;home();say(away?'back':'start','h');wave();
