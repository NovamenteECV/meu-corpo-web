/* Meu Corpo · relatório em PDF (para a consulta) e planilhas (CSV) com os dados da pessoa.
   O PDF é montado aqui mesmo, sem biblioteca: A4, fonte Helvetica (acentos pela WinAnsiEncoding), gráfico do peso e tabelas.
   O relatório vai para terceiros (médico, nutricionista): não leva a assinatura do sistema.
   Arquivos carregados em ordem pelo index.html (scripts comuns, escopo global compartilhado).
   Criado e desenvolvido por VALLEN TECNOLOGIA */

let RELP=90;   // período do relatório em dias (0 = tudo)
const RELOP=[[30,"30 dias"],[90,"3 meses"],[180,"6 meses"],[365,"1 ano"],[0,"Tudo"]];
function relIni(){if(!RELP)return"0000-00-00";const d=new Date(td()+"T12:00:00");d.setDate(d.getDate()-RELP+1);return d.toISOString().slice(0,10)}
function relatorioV(){return`<div class="c"><h2>Relatório para a consulta</h2><label>Período</label><div class="tg">${RELOP.map(([v,n])=>`<button class="${RELP==v?"on":""}" data-mcrelp="${v}">${n}</button>`).join("")}</div><button class="p wide lg" data-mcpdf="1">${I("doc",18)} Baixar PDF</button><p class="m" style="margin:8px 0 0">Peso com gráfico, medidas, médias do dia a dia, treinos, bioimpedância, exames e pontos para conversar. Sem dados de login.</p></div>
<div class="c"><h2>Planilhas</h2><p class="m" style="margin-top:0">Seus dados em arquivos que abrem no Excel, no Google Planilhas ou no LibreOffice (separados por ponto e vírgula).</p><div class="r" style="flex-wrap:wrap">${[["diario","Diário"],["bio","Bioimpedância"],["exames","Exames"],["treinos","Treinos"]].map(([k,n])=>`<button class="wide" data-mccsv="${k}" style="flex:1 1 45%">${n}</button>`).join("")}</div></div>
<details class="c"><summary><b style="flex:1">Ver o resumo na tela</b></summary><div class="rt" style="margin-top:10px">${relBody()}</div><button class="wide ghost" id="rdl" style="margin-top:10px">Baixar como página (HTML)</button></details>`}

/* ---------- PDF mínimo ---------- */
const PW=595.28,PH=841.89,PM=42,VERDE="0.059 0.463 0.431",CINZA="0.39 0.45 0.55",ESC="0.06 0.09 0.16";
const WIN={"–":150,"—":151,"‘":145,"’":146,"“":147,"”":148,"•":149,"…":133,"€":128};
/* texto para bytes WinAnsi; o que não existe na fonte vira equivalente simples ou some (emojis) */
function pdfStr(s){let o="";for(const ch of String(s??"").replace(/−/g,"-").replace(/≥/g,">=").replace(/≤/g,"<=").replace(/[  ]/g," ")){const c=ch.codePointAt(0);let b=WIN[ch]??(c<256?c:null);if(b==null)continue;const x=String.fromCharCode(b);o+=x=="("||x==")"||x=="\\"?"\\"+x:x}return o}
/* largura aproximada na Helvetica (pt) */
function pdfLarg(s,sz,neg){let w=0;for(const ch of String(s)){w+=/[il.,:;'!|]/.test(ch)?.24:/[fjrt ]/.test(ch)?.3:/[mwMW]/.test(ch)?.85:/[A-Z]/.test(ch)?.68:/[0-9]/.test(ch)?.556:.53}return w*sz*(neg?1.05:1)}
function pdfCorta(s,sz,larg,neg){s=String(s??"");if(pdfLarg(s,sz,neg)<=larg)return s;while(s.length>1&&pdfLarg(s+"…",sz,neg)>larg)s=s.slice(0,-1);return s+"…"}
function pdfQuebra(s,sz,larg,neg){const out=[];String(s??"").split("\n").forEach(par=>{let l="";par.split(" ").forEach(p=>{const t=l?l+" "+p:p;if(pdfLarg(t,sz,neg)>larg&&l){out.push(l);l=p}else l=t});out.push(l)});return out}
function Pdf(titulo){this.titulo=titulo;this.pags=[];this.nova()}
Pdf.prototype={
nova(){this.c=[];this.pags.push(this.c);this.y=PH-PM},
cabe(h){if(this.y-h<PM+24)this.nova()},
t(x,y,s,sz=10,neg=false,cor=ESC,dir=false){const tx=dir?x-pdfLarg(s,sz,neg):x;this.c.push(`BT /${neg?"F2":"F1"} ${sz} Tf ${cor} rg ${tx.toFixed(2)} ${y.toFixed(2)} Td (${pdfStr(s)}) Tj ET`)},
lin(x1,y1,x2,y2,cor="0.85 0.88 0.92",lw=.7,tr=null){this.c.push(`q ${cor} RG ${lw} w ${tr?`[${tr}] 0 d `:""}${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S Q`)},
ret(x,y,w,h,cor){this.c.push(`q ${cor} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f Q`)},
cam(pts,cor,lw,tr){if(pts.length<2)return;this.c.push(`q ${cor} RG ${lw} w 1 J 1 j ${tr?`[${tr}] 0 d `:""}${pts.map((p,i)=>`${p[0].toFixed(2)} ${p[1].toFixed(2)} ${i?"l":"m"}`).join(" ")} S Q`)},
h1(s){this.cabe(40);this.t(PM,this.y-16,s,18,true,VERDE);this.y-=26},
h2(s){this.cabe(46);this.y-=10;this.t(PM,this.y-12,s,12.5,true,VERDE);this.y-=16;this.lin(PM,this.y,PW-PM,this.y,"0.06 0.46 0.43",.8);this.y-=8},
p(s,sz=9.5,cor=ESC,neg=false){pdfQuebra(s,sz,PW-2*PM,neg).forEach(l=>{this.cabe(sz*1.4);this.t(PM,this.y-sz,l,sz,neg,cor);this.y-=sz*1.4})},
kp(itens){const w=(PW-2*PM)/itens.length;this.cabe(44);itens.forEach(([v,r],i)=>{const x=PM+i*w;this.ret(x+2,this.y-40,w-4,40,"0.94 0.98 0.97");this.t(x+10,this.y-19,v,13,true,ESC);this.t(x+10,this.y-33,r,8,false,CINZA)});this.y-=48},
tab(cab,linhas,larg){const W=PW-2*PM,ls=larg.map(x=>x*W),alt=15,linha=(cel,neg,fundo)=>{this.cabe(alt);if(fundo)this.ret(PM,this.y-alt+3,W,alt,fundo);let x=PM;cel.forEach((v,i)=>{this.t(x+3,this.y-9.5,pdfCorta(v,8.5,ls[i]-6,neg),8.5,neg,neg?VERDE:ESC);x+=ls[i]});this.y-=alt};
linha(cab,true,"0.93 0.96 0.96");linhas.forEach((l,i)=>{if(this.y-alt<PM+24){this.nova();linha(cab,true,"0.93 0.96 0.96")}linha(l,false,i%2?"0.98 0.98 0.99":null)});this.y-=4},
graf(pts,meta,mm){const H=170,W=PW-2*PM;this.cabe(H+26);const top=this.y,x0=PM+30,x1=PM+W-6,y0=top-H+18,y1=top-8,vs=pts.map(p=>p[1]).concat(meta!=null?[meta]:[]),lo=Math.floor(Math.min(...vs)-1),hi=Math.ceil(Math.max(...vs)+1),d0=pts[0][0],sp=Math.max(1,days(d0,pts[pts.length-1][0])),X=d=>x0+days(d0,d)/sp*(x1-x0),Y=v=>y0+(v-lo)/(hi-lo||1)*(y1-y0);
[lo,(lo+hi)/2,hi].forEach(v=>{this.lin(x0,Y(v),x1,Y(v));this.t(PM,Y(v)-3,f1(v,v%1?1:0),8,false,CINZA)});
if(meta!=null){this.lin(x0,Y(meta),x1,Y(meta),"0.09 0.64 0.29",1,"4 3");this.t(x1,Y(meta)+3,"meta "+f1(meta,1).replace(",0",""),8,false,"0.09 0.64 0.29",true)}
if(mm&&mm.length>2)this.cam(mm.map(p=>[X(p[0]),Y(p[1])]),"0.96 0.62 0.04",1.6,"5 3");this.cam(pts.map(p=>[X(p[0]),Y(p[1])]),VERDE,2);
pts.forEach(p=>this.ret(X(p[0])-1.6,Y(p[1])-1.6,3.2,3.2,VERDE));this.t(x0,y0-12,fd(d0),8,false,CINZA);this.t(x1,y0-12,fd(pts[pts.length-1][0]),8,false,CINZA,true);
this.y=y0-18;if(mm&&mm.length>2){this.ret(x0,this.y-3,10,3,VERDE);this.t(x0+14,this.y-5,"pesagens",8,false,CINZA);this.ret(x0+70,this.y-3,10,3,"0.96 0.62 0.04");this.t(x0+84,this.y-5,"média de 7 dias",8,false,CINZA);this.y-=14}},
bytes(rodape){const n=this.pags.length,obj=[];obj[1]="<< /Type /Catalog /Pages 2 0 R >>";obj[3]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";obj[4]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";obj[5]=`<< /Title (${pdfStr(this.titulo)}) /Producer (Meu Corpo) /CreationDate (D:${td().replace(/-/g,"")}) >>`;const kids=[];
this.pags.forEach((c,i)=>{const pg=6+i*2,ct=pg+1;kids.push(pg+" 0 R");const fim=[`BT /F1 7.5 Tf ${CINZA} rg ${PM} 24 Td (${pdfStr(rodape)}) Tj ET`,`BT /F1 7.5 Tf ${CINZA} rg ${(PW-PM-60).toFixed(2)} 24 Td (${pdfStr("Página "+(i+1)+" de "+n)}) Tj ET`],s=c.concat(fim).join("\n");obj[pg]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${ct} 0 R >>`;obj[ct]=`<< /Length ${s.length} >>\nstream\n${s}\nendstream`});
obj[2]=`<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${n} >>`;let out="%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";const off=[];for(let i=1;i<obj.length;i++){off[i]=out.length;out+=`${i} 0 obj\n${obj[i]}\nendobj\n`}const xr=out.length;out+=`xref\n0 ${obj.length}\n0000000000 65535 f \n`+off.slice(1).map(o=>String(o).padStart(10,"0")+" 00000 n \n").join("")+`trailer\n<< /Size ${obj.length} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xr}\n%%EOF`;const b=new Uint8Array(out.length);for(let i=0;i<out.length;i++)b[i]=out.charCodeAt(i)&255;return b}};

function relPDF(){const ini=relIni(),hoje=td(),ks=Object.keys(S.log).sort().filter(k=>k>=ini&&k<=hoje),p=S.p,c=calc(),D=new Pdf("Relatório de acompanhamento · "+p.nome);
const per=RELP?`${fd(ks[0]||ini)} a ${fd(hoje)}`:ks.length?`${fd(ks[0])} a ${fd(hoje)}`:"sem registros";
D.h1("Relatório de acompanhamento");D.p(`${p.nome}${p.nasc?` · ${c.id} anos`:""}${p.alt?` · altura ${p.alt} cm`:""}${p.meta?` · meta ${f1(p.meta,1)} kg`:""}`,11,ESC,true);D.p(`Período: ${per} · gerado em ${fd(hoje)}`,9,CINZA);D.y-=4;
const pes=ks.filter(k=>S.log[k].peso!=null),cin=ks.filter(k=>S.log[k].cint!=null),pi=pes.length?S.log[pes[0]].peso:null,pf=pes.length?S.log[pes[pes.length-1]].peso:null,imc=pf&&p.alt?pf/((p.alt/100)**2):null,tn=tendData();
D.h2("Resumo");D.kp([[pf!=null?f1(pf,1)+" kg":"–","peso atual"],[pi!=null&&pf!=null?(pf-pi>0?"+":"")+f1(pf-pi,1)+" kg":"–","variação no período"],[cin.length?f1(S.log[cin[cin.length-1]].cint,1)+" cm":"–","cintura atual"],[imc?f1(imc,1):"–","IMC"],[tn?(tn.rt>=0?"-":"+")+f1(Math.abs(tn.rt),2)+" kg":"–","ritmo por semana (4 sem.)"]]);
if(pes.length>=2){const pts=pes.map(k=>[k,S.log[k].peso]),mm=pts.length>=4?pts.map(a=>[a[0],avg(pts.filter(b=>b[0]<=a[0]&&days(b[0],a[0])<7).map(b=>b[1]))]):null;D.h2("Peso");D.graf(pts,p.meta||null,mm)}
const pc=ks.filter(k=>S.log[k].peso!=null||S.log[k].cint!=null);if(pc.length){D.h2("Pesagens e cintura");D.tab(["Data","Peso (kg)","Cintura (cm)"],pc.slice().reverse().map(k=>[fd(k),S.log[k].peso!=null?f1(S.log[k].peso,2):"–",S.log[k].cint!=null?f1(S.log[k].cint,1):"–"]),[.4,.3,.3])}
const ds=ks.filter(k=>S.log[k].dose);if(ds.length){D.h2(`Aplicações registradas (${S.med?S.med.nome:"medicação"})`);D.tab(["Data",`Dose (${S.med&&S.med.un||"mg"})`],ds.slice().reverse().map(k=>[fd(k),f1(S.log[k].dose)]),[.5,.5])}
const R=ks.map(k=>S.log[k]),m=f=>{const v=R.map(x=>x[f]).filter(x=>x!=null);return v.length?avg(v):null},tr=ks.filter(k=>treinouEm(k)).length;
D.h2("Médias do período");D.tab(["Apetite 1–5","Azia 0–3","Proteína (g)","Água (L)","Sono","Passos","Dias com treino"],[[f1(m("fome")),f1(m("azia")),m("prot")==null?"–":String(Math.round(m("prot"))),f1(m("agua"),1),m("sono")==null?"–":fhm(m("sono")),m("passos")==null?"–":Math.round(m("passos")).toLocaleString("pt-BR"),String(tr)]],[.13,.12,.14,.12,.14,.16,.19]);D.p("Médias dos dias com registro. Metas atuais: "+[p.prot?`proteína ${p.prot} g`:"",`água ${f1(aguaMeta(),1)} L`,`passos ${passosMeta().toLocaleString("pt-BR")}`].filter(Boolean).join(" · ")+".",8.5,CINZA);
const ses=S.tr.ses.filter(s=>s.d>=ini).sort((a,b)=>a.d<b.d?1:-1);if(ses.length){D.h2(`Treinos (${ses.length} no período, ${Math.round(ses.reduce((a,s)=>a+(+s.dur||0),0)/60)} h no total)`);D.tab(["Data","Treino","Duração","Esforço (RPE)","Volume (kg)"],ses.slice(0,25).map(s=>[fd(s.d),TN[s.key]||s.key||"–",s.dur?s.dur+" min":"–",s.rpe!=null?String(s.rpe):"–",s.vol?Math.round(s.vol).toLocaleString("pt-BR"):"–"]),[.17,.33,.15,.17,.18]);if(ses.length>25)D.p(`Mostrando as 25 mais recentes.`,8.5,CINZA)}
let B=S.bios.filter(b=>b.d>=ini).sort((a,b)=>a.d<b.d?-1:1);if(!B.length&&S.bios.length)B=[S.bios.slice().sort((a,b)=>a.d<b.d?-1:1).pop()];if(B.length){D.h2("Bioimpedância");D.tab(["Data","Peso","Gordura kg","Gordura %","Músculo kg","Visceral","TMB"],B.map(x=>[fd(x.d),f1(x.peso),f1(x.gk),f1(x.gp),f1(x.mus),x.vis!=null?String(x.vis):"–",x.tmb?String(Math.round(x.tmb)):"–"]),[.16,.12,.14,.14,.15,.13,.16])}
if(S.ex.r.length){D.h2("Exames"+(S.ex.d?` (${S.ex.d})`:""));D.tab(["Exame","Resultado","Referência"],S.ex.r.map(x=>[x[0]+(x[3]?" (fora da faixa)":""),x[1],x[2]||"–"]),[.45,.3,.25])}
const eh=Object.entries(S.exh||{}).flatMap(([n,a])=>a.filter(h=>h[0]>=ini).map(h=>[n,fd(h[0]),String(h[1]).replace(".",",")]));if(eh.length){D.h2("Resultados adicionados depois");D.tab(["Exame","Data","Valor"],eh,[.5,.25,.25])}
const nt=ks.filter(k=>S.log[k].nota).slice(-10);if(nt.length){D.h2("Observações");D.tab(["Data","Nota"],nt.map(k=>[fd(k),S.log[k].nota]),[.18,.82])}
const pts=[...(S.med&&S.med.desc?[`Produto em uso: ${S.med.desc}. Orientação sobre continuidade e dose.`]:[]),...S.ex.r.filter(x=>x[3]).map(x=>`${x[0]}: ${x[1]} (referência ${x[2]}), fora da faixa.`),...alertasL().map(x=>String(x).replace(/<[^>]+>/g,"")),...S.pend.filter(x=>!S.done[x.id]).map(x=>x.t)];if(pts.length){D.h2("Pontos para conversar");pts.forEach(x=>D.p("• "+x,9.5))}
return D.bytes("Dados registrados pela própria pessoa no app Meu Corpo. Não é laudo nem prescrição.")}

/* ---------- Planilhas (CSV com ponto e vírgula e vírgula decimal, que o Excel em português abre direto) ---------- */
const csvV=v=>{if(v==null)return"";if(typeof v=="number")v=String(Math.round(v*100)/100).replace(".",",");v=String(v);return/[;"\n\r]/.test(v)?`"${v.replace(/"/g,'""')}"`:v};
const csv=(cab,linhas)=>"﻿"+[cab,...linhas].map(l=>l.map(csvV).join(";")).join("\r\n");
const CSVROT={peso:"Peso (kg)",cint:"Cintura (cm)",agua:"Água (L)",prot:"Proteína (g)",kcal:"Calorias comidas (kcal)",passos:"Passos",kat:"Calorias ativas (kcal)",sono:"Sono (h)",fc:"Freq. cardíaca",fome:"Apetite (1–5)",azia:"Azia (0–3)",dose:"Dose",treino:"Treinou",nota:"Nota"};
function planilha(tipo){const hoje=td();let nome,txt;
if(tipo=="diario"){const ks=Object.keys(S.log).sort(),cols=Object.keys(CSVROT).filter(c=>ks.some(k=>S.log[k][c]!=null)).concat([...new Set(ks.flatMap(k=>Object.keys(S.log[k]||{})))].filter(c=>!CSVROT[c]&&typeof S.log[ks.find(k=>S.log[k][c]!=null)][c]!="object"));txt=csv(["Data",...cols.map(c=>CSVROT[c]||c),"O que comeu"],ks.map(k=>{const L=S.log[k]||{};return[fd(k),...cols.map(c=>c=="treino"?(L.treino?"sim":""):L[c]),(S.food[k]||[]).map(([id,g])=>((FOOD.find(f=>f[0]==id)||[0,id])[1])+" "+g+" g").join(", ")]}));nome="diario"}
else if(tipo=="bio"){txt=csv(["Data",...BIOF.map(x=>x[1]+(x[2]?` (${x[2]})`:""))],S.bios.slice().sort((a,b)=>a.d<b.d?-1:1).map(b=>[fd(b.d),...BIOF.map(x=>b[x[0]])]));nome="bioimpedancia"}
else if(tipo=="exames"){const L=S.ex.r.map(x=>[x[0],S.ex.d||"",x[1],x[2]||"",x[3]?"sim":"",x[4]||""]);Object.entries(S.exh||{}).forEach(([n,a])=>a.forEach(h=>L.push([n,fd(h[0]),String(h[1]),"","",""])));txt=csv(["Exame","Data","Resultado","Referência","Fora da faixa","Observação"],L);nome="exames"}
else{const L=[],nomeEx=id=>(EXL.find(x=>x[0]==id)||[0,id])[1];S.tr.ses.slice().sort((a,b)=>a.d<b.d?-1:1).forEach(s=>{const base=[fd(s.d),TN[s.key]||s.key||"",s.dur||"",s.rpe??""];const ex=s.ex||[];if(!ex.length)L.push([...base,"","","","",""]);ex.forEach(e=>(e.sets||[]).forEach((st,i)=>{const kg=Array.isArray(st)?st[0]:st.kg,r=Array.isArray(st)?st[1]:st.r,sb=Array.isArray(st)?st[2]:st.rr;L.push([...base,nomeEx(e.id),i+1,kg,r,sb])}))});txt=csv(["Data","Treino","Duração (min)","Esforço (RPE)","Exercício","Série","Carga (kg)","Repetições","Sobraram"],L);nome="treinos"}
baixar(`meucorpo-${nome}-${hoje}.csv`,txt,"text/csv")}

document.addEventListener("click",async e=>{const t=e.target.closest("[data-mcrelp],[data-mcpdf],[data-mccsv]");if(!t)return;const D=t.dataset;
if(D.mcrelp!=null){RELP=+D.mcrelp;draw(1);return}
if(D.mcpdf){try{const b=relPDF();await baixar(`relatorio-meucorpo-${td()}.pdf`,b,"application/pdf")}catch(x){toast("Não consegui gerar o PDF.")}return}
if(D.mccsv){try{planilha(D.mccsv)}catch(x){toast("Não consegui gerar a planilha.")}}});
