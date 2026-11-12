// PARCHE4: gráficas para visualizar los problemas. Pegar dentro del <script>, justo ANTES de "/* ===== 9. ARRANQUE ===== */".
// Cada entrada de GR describe la gráfica de un ejercicio por su id:
//  f: funciones a dibujar · x,y: rangos · sh: [desde, hasta, curva_sup, curva_inf?] área sombreada
//  t: recta tangente (discontinua) · p: puntos [x, y, etiqueta, 1 = círculo abierto]
const GR={
L01:{f:[x=>(x*x-4)/(x-2)],x:[-1,5],y:[-1,7],p:[[2,4,'hueco',1]]},
L02:{f:[x=>(x*x-9)/(x*x-x-6)],x:[0,6],y:[-1,4],p:[[3,1.2,'hueco',1]]},
L03:{f:[x=>(3*x*x+x)/(5*x*x-2)],x:[2,20],y:[0,1],p:[]},
L04:{f:[x=>(Math.sqrt(x+4)-2)/x],x:[-3.5,6],y:[0,0.6],p:[[0,0.25,'hueco',1]]},
L05:{f:[x=>(x*x-1)/(x-1)],x:[-2,4],y:[-2,5],p:[[1,2,'hueco',1]]},
L07:{f:[x=>Math.sqrt(x*x+3*x)-x],x:[0.5,30],y:[0,2]},
L08:{f:[x=>2*x+1],x:[0,5],y:[0,12],p:[[3,7,'(3, 7)']]},
L09:{f:[x=>x===0?NaN:Math.abs(x)/x],x:[-3,3],y:[-2,2],p:[[0,-1,'',1],[0,1,'',1]]},
L10:{f:[x=>(x*x*x-1)/(x-1)],x:[-1,3],y:[0,14],p:[[1,3,'hueco',1]]},
L11:{f:[x=>(x+1)/(x*x-4)],x:[-5,5],y:[-4,4]},
L19:{f:[x=>(x*x-1)/(x+1)],x:[-4,3],y:[-6,3],p:[[-1,-2,'hueco',1]]},
L20:{f:[x=>(4*x+1)/(2*x-3)],x:[2,30],y:[0,8]},
L21:{f:[x=>(x*x+1)/(x*x*x-2)],x:[1.5,20],y:[0,2]},
L22:{f:[x=>(x*x+x-2)/(x*x-1)],x:[0,4],y:[0,3],p:[[1,1.5,'hueco',1]]},
L23:{f:[x=>(Math.sqrt(x)-3)/(x-9)],x:[0.5,20],y:[0,0.5],p:[[9,1/6,'hueco',1]]},
L24:{f:[x=>1/x],x:[-4,4],y:[-6,6]},
L26:{f:[x=>Math.sqrt(4*x*x+1)/(x+1)],x:[1,30],y:[0,4]},
L27:{f:[x=>(3*x*x+1)/(x*x-4)],x:[-6,6],y:[-6,10]},
L28:{f:[x=>Math.sqrt(x*x+x)-Math.sqrt(x*x-x)],x:[1,30],y:[0,1.5]},
D01:{f:[x=>x**3-3*x],x:[-2.5,3],y:[-4,8],t:x=>9*(x-2)+2,p:[[2,2,'x=2']]},
D02:{f:[x=>(x*x+1)*(x-3)],x:[-2,4],y:[-15,10]},
D03:{f:[x=>Math.sin(x*x)],x:[-3,3],y:[-1.5,1.5]},
D04:{f:[x=>x/(x+1)],x:[0,5],y:[0,1.2],t:x=>0.25*(x-1)+0.5,p:[[1,0.5,'x=1']]},
D05:{f:[t=>20*t-2*t*t],x:[0,10],y:[0,60]},
D06:{f:[x=>x*(12-2*x)**2],x:[0,6],y:[0,140]},
D09:{f:[x=>5*x*x-2*x+7],x:[-1,4],y:[0,90],t:x=>28*(x-3)+46,p:[[3,46,'x=3']]},
D10:{f:[x=>x**4-2*x**3],x:[-1,2.5],y:[-2,6]},
D11:{f:[t=>t**3-6*t*t+9*t],x:[0,5],y:[-2,22],p:[[2,2,'t=2']]},
D12:{f:[x=>Math.log(x*x+1)],x:[-3,3],y:[0,3]},
D13:{f:[x=>x*x],x:[-1,5],y:[-10,25],t:x=>6*x-9,p:[[3,9,'(3, 9)']]},
D14:{f:[x=>x**3-3*x],x:[-2.5,2.5],y:[-4,4]},
D15:{f:[x=>x**3-6*x*x+9*x+1],x:[-0.5,4.5],y:[-2,8]},
D16:{f:[r=>2*Math.PI*r*r+108*Math.PI/r],x:[0.8,8],y:[0,700]},
D17:{f:[x=>Math.sqrt(25-x*x)],x:[-6,6],y:[-1,6],t:x=>-0.75*(x-3)+4,p:[[3,4,'(3, 4)']]},
D22:{f:[x=>x**3],x:[-2,2],y:[-8,8],p:[[0,0,'x=0']]},
D26:{f:[x=>x*x],x:[-3,3],y:[-1,9],t:x=>-4*(x+2)+4,p:[[-2,4,'x=−2']]},
D27:{f:[x=>Math.sqrt(x)],x:[0,9],y:[0,3.5],t:x=>0.25*(x-4)+2,p:[[4,2,'x=4']]},
D28:{f:[x=>x**3-3*x*x],x:[-1,4],y:[-5,17]},
D29:{f:[t=>t**3-9*t*t+24*t],x:[0,6],y:[0,40]},
I02:{f:[x=>3*x*x+1],x:[-0.5,3],y:[0,14],sh:[0,2,x=>3*x*x+1]},
I03:{f:[t=>3*t*t-4],x:[0,3.5],y:[-5,25],sh:[0,3,t=>3*t*t-4]},
I05:{f:[x=>x],x:[-1.5,2.5],y:[-1.5,2.5],sh:[-1,2,x=>x]},
I06:{f:[x=>x,x=>x*x],x:[-0.3,1.3],y:[-0.2,1.5],sh:[0,1,x=>x,x=>x*x]},
I07:{f:[t=>4+6*t],x:[0,3.5],y:[0,26],sh:[0,3,t=>4+6*t]},
I09:{f:[x=>Math.sqrt(x)],x:[0,5],y:[0,2.5],sh:[1,4,x=>Math.sqrt(x)]},
I11:{f:[x=>Math.sin(x)],x:[-0.5,3.6],y:[-1.2,1.2],sh:[0,Math.PI,x=>Math.sin(x)]},
I12:{f:[t=>12*Math.exp(-0.5*t)],x:[0,4],y:[0,13],sh:[0,2,t=>12*Math.exp(-0.5*t)]},
I14:{f:[x=>2*x],x:[0,4],y:[0,8],sh:[1,3,x=>2*x]},
I16:{f:[x=>x**3],x:[-1.5,1.5],y:[-2,2],sh:[-1,1,x=>x**3]},
I20:{f:[x=>2*x+3],x:[-0.5,2],y:[0,6],sh:[0,1,x=>2*x+3]},
I23:{f:[x=>Math.cos(x)],x:[-0.5,3.5],y:[-1.2,1.2],sh:[0,Math.PI/2,x=>Math.cos(x)]},
I25:{f:[t=>3*t*t],x:[0,3.5],y:[0,30],sh:[1,3,t=>3*t*t]},
I26:{f:[x=>2*x,x=>x*x],x:[-0.5,2.8],y:[-0.5,5.5],sh:[0,2,x=>2*x,x=>x*x]},
I27:{f:[x=>x*x],x:[-3,3],y:[0,9],sh:[-2,2,x=>x*x]},
I28:{f:[t=>10-2*t],x:[0,6],y:[-2,11],sh:[0,5,t=>10-2*t]},
I29:{f:[t=>0.5*t+2],x:[0,5],y:[0,5],sh:[0,4,t=>0.5*t+2]},
I30:{f:[t=>4-t],x:[0,7],y:[-3,5],sh:[0,6,t=>4-t]}
};
function gph(e){const s=GR[e.id];if(!s||e.q.includes('<svg'))return'';
 const W=340,H=210,m=28,[a,b]=s.x,[c,d]=s.y,X=x=>m+(x-a)/(b-a)*(W-2*m),Y=y=>H-m-(Math.min(d,Math.max(c,y))-c)/(d-c)*(H-2*m);
 const st=r=>{const k=r/6,p=Math.pow(10,Math.floor(Math.log10(k))),u=k/p;return(u<1.5?1:u<3.5?2:u<7.5?5:10)*p};
 const sx=st(b-a),sy=st(d-c),fx=v=>+v.toFixed(2);let o='';
 for(let x=Math.ceil(a/sx)*sx;x<=b+1e-9;x+=sx)o+=`<line x1="${X(x)}" y1="${Y(c)}" x2="${X(x)}" y2="${Y(d)}" stroke="#ffffff1a"/><text x="${X(x)}" y="${H-10}" fill="#f2e8cf" font-size="10" text-anchor="middle">${fx(x)}</text>`;
 for(let y=Math.ceil(c/sy)*sy;y<=d+1e-9;y+=sy)o+=`<line x1="${X(a)}" y1="${Y(y)}" x2="${X(b)}" y2="${Y(y)}" stroke="#ffffff1a"/><text x="${m-4}" y="${Y(y)+3}" fill="#f2e8cf" font-size="10" text-anchor="end">${fx(y)}</text>`;
 const ax=Math.min(b,Math.max(a,0)),ay=Math.min(d,Math.max(c,0));
 o+=`<path d="M${X(a)} ${Y(ay)}H${X(b)}M${X(ax)} ${Y(c)}V${Y(d)}" stroke="#f2e8cf" fill="none"/>`;
 if(s.sh){const[lo,hi,top,bot]=s.sh,n=120,xs=Array.from({length:n+1},(_,i)=>lo+(hi-lo)*i/n);
  if(bot)o+=`<path d="M${xs.map(x=>X(x)+' '+Y(top(x))).join('L')}L${xs.slice().reverse().map(x=>X(x)+' '+Y(bot(x))).join('L')}Z" fill="#7bd88f55"/>`;
  else[[Math.max,'#7bd88f66'],[Math.min,'#e5707e66']].forEach(([fn,col])=>o+=`<path d="M${X(lo)} ${Y(0)}L${xs.map(x=>X(x)+' '+Y(fn(top(x),0))).join('L')}L${X(hi)} ${Y(0)}Z" fill="${col}"/>`)}
 const path=(fn,col,w,da)=>{let p='',pen=0;for(let i=0;i<=200;i++){const x=a+(b-a)*i/200,y=fn(x);if(isFinite(y)&&y>=c&&y<=d){p+=(pen?'L':'M')+X(x).toFixed(1)+' '+Y(y).toFixed(1);pen=1}else pen=0}
  return `<path d="${p}" fill="none" stroke="${col}" stroke-width="${w}"${da?' stroke-dasharray="6 4"':''}/>`};
 if(s.t)o+=path(s.t,'#e5707e',2,1);
 (s.f||[]).forEach((fn,i)=>o+=path(fn,i?'#f4a259':'#7bd88f',3));
 (s.p||[]).forEach(([x,y,l,op])=>o+=`<circle cx="${X(x)}" cy="${Y(y)}" r="4.5" fill="${op?'#0a151c':'#f4a259'}" stroke="#f4a259" stroke-width="2"/>`+(l?`<text x="${X(x)+8}" y="${Y(y)-8}" fill="#f4a259" font-size="11">${l}</text>`:''));
 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica del problema" style="width:100%;max-width:400px;background:#0a151c;border:3px solid var(--bl);margin:10px 0;display:block">${o}</svg>`+(s.sh?'<div class="tag" style="font-size:8px;line-height:1.8">Verde: área positiva · Rojo: área negativa</div>':'')}
