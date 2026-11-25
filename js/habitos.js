/* Vallen Fitness · hábitos: aviso de sincronização, sequências e conquistas, check-in semanal, ciclo menstrual e comparação de fotos.
   Arquivos carregados em ordem pelo index.html (scripts comuns, escopo global compartilhado).
   Criado e desenvolvido por VALLEN TECNOLOGIA */

/* ---------- Está tudo salvo? (window.MC_SY_ESTADO vem do nuvem.js) ---------- */
function syQuando(ms){const s=(Date.now()-ms)/1000;if(s<60)return"agora";if(s<3600)return"há "+Math.round(s/60)+" min";if(s<86400)return"há "+Math.round(s/3600)+" h";return"em "+new Date(ms).toLocaleDateString("pt-BR")}
function syTexto(){const e=window.MC_SY_ESTADO?MC_SY_ESTADO():null;if(!e||!e.logado)return null;
if(/erro/i.test(e.txt||""))return{c:"w",t:"⚠️ Não consegui salvar na nuvem. Seus dados estão no aparelho; tento de novo sozinho."};
if(e.pendente)return navigator.onLine===false?{c:"a",t:"⏳ Sem internet: as alterações estão salvas no aparelho e sobem quando conectar."}:{c:"a",t:"⏳ Enviando alterações para a nuvem…"};
if(/sem internet/i.test(e.txt||""))return{c:"a",t:"⏳ Sem internet agora. O que você registrar fica no aparelho e sobe depois."};
return e.em?{c:"o",t:"☁️ Tudo salvo na nuvem "+syQuando(e.em)}:{c:"a",t:"☁️ Conectando à nuvem…"}}
function syChip(){const x=syTexto();return x?`<div id="mcsy" class="mcsy ${x.c}" role="status">${esc(x.t)}</div>`:""}
window.MC_SY_ATUALIZA=()=>{const el=document.getElementById("mcsy"),x=syTexto();if(el&&x){el.className="mcsy "+x.c;el.textContent=x.t}};
setInterval(()=>window.MC_SY_ATUALIZA(),20000);
addEventListener("online",()=>window.MC_SY_ATUALIZA());addEventListener("offline",()=>window.MC_SY_ATUALIZA());

/* ---------- Sequências e conquistas (calculadas a partir dos registros; nada novo é gravado) ---------- */
const diaAnt=(d,n=1)=>{const x=new Date(d+"T12:00:00");x.setDate(x.getDate()-n);return x.toISOString().slice(0,10)};
const treinouEm=d=>S.tr.ses.some(s=>s.d==d)||!!(S.log[d]&&S.log[d].treino);
/* dias seguidos até hoje (hoje só conta se já bateu; senão, conta a partir de ontem) */
function seqDias(ok){let d=td(),n=0;if(!ok(S.log[d]||{},d))d=diaAnt(d);for(let i=0;i<400&&ok(S.log[d]||{},d);i++){n++;d=diaAnt(d)}return n}
const okAgua=L=>(L.agua||0)>=aguaMeta()-.001,okProt=L=>!!S.p.prot&&(L.prot||0)>=S.p.prot*.9,okPassos=L=>(L.passos||0)>=passosMeta();
/* semanas seguidas (segunda a domingo) com os treinos planejados; a semana atual só conta se já cumpriu */
function seqSemanas(){const meta=S.tr.cfg&&S.tr.cfg.dias?Math.max(1,S.tr.cfg.dias.length):2;let seg=diaAnt(td(),wi(td())),n=0;const conta=s=>{let c=0;for(let i=0;i<7;i++){const x=new Date(s+"T12:00:00");x.setDate(x.getDate()+i);if(treinouEm(x.toISOString().slice(0,10)))c++}return c};if(conta(seg)<meta)seg=diaAnt(seg,7);for(let i=0;i<104&&conta(seg)>=meta;i++){n++;seg=diaAnt(seg,7)}return n}
function sequencias(){return[["💧","água",seqDias(okAgua),"dias"],["🥩","proteína",seqDias(okProt),"dias"],["👟","passos",seqDias(okPassos),"dias"],["🏋️","treino",seqSemanas(),"semanas"]]}
function seqCard(){const s=sequencias().filter(x=>x[2]>=2);if(!s.length)return"";return`<div class="c seqc"><h2>🔥 Sequências</h2><div class="seqs">${s.map(x=>`<div><b>${x[0]} ${x[2]}</b><small>${x[3]} seguidos de ${x[1]}</small></div>`).join("")}</div></div>`}
/* data em que cada conquista foi alcançada (null = ainda não) */
function conquistas(){const ks=Object.keys(S.log).sort(),ses=S.tr.ses.map(s=>s.d).sort(),tr=[...new Set([...ses,...ks.filter(k=>S.log[k].treino)])].sort(),pes=ks.filter(k=>S.log[k].peso),p0=pes.length?S.log[pes[0]].peso:null,perder=(S.p.obj||"perder")=="perder",C=[];
const nTreino=n=>tr.length>=n?tr[n-1]:null;C.push(["🏁","Primeiro treino",nTreino(1)],["💪","10 treinos",nTreino(10)],["🥈","25 treinos",nTreino(25)],["🥇","50 treinos",nTreino(50)],["🏆","100 treinos",nTreino(100)]);
const seqAte=(ok,n)=>{let c=0;for(const k of ks){if(ok(S.log[k]||{})){c++;if(c>=n)return k}else c=0}return null};
/* sequência por dias corridos (um dia sem registro quebra) */
const seqCorr=(ok,n)=>{let c=0,prev=null;for(const k of ks){const L=S.log[k]||{};if(ok(L)){c=prev&&days(prev,k)==1&&c?c+1:1;prev=k;if(c>=n)return k}else{c=0;prev=null}}return null};
C.push(["💧","7 dias seguidos batendo a água",seqCorr(okAgua,7)],["🌊","30 dias seguidos batendo a água",seqCorr(okAgua,30)],["🥩","7 dias seguidos batendo a proteína",seqCorr(okProt,7)],["👟","7 dias seguidos batendo os passos",seqCorr(okPassos,7)]);
if(p0!=null&&perder){for(const kg of[1,3,5,10,15,20]){const k=pes.find(d=>S.log[d].peso<=p0-kg);C.push(["⚖️",`${kg} kg a menos`,k||null])}}
if(p0!=null&&S.p.meta){const k=pes.find(d=>perder?S.log[d].peso<=S.p.meta:S.log[d].peso>=S.p.meta);C.push(["🎯","Meta de peso atingida",k||null])}
const b=S.bios.slice().sort((a,c)=>a.d<c.d?-1:1);C.push(["🔬","Primeira bioimpedância",b.length?b[0].d:null]);
C.push(["📅","30 dias com registros",ks.length>=30?ks[29]:null]);
return C}
function conqV(){const C=conquistas(),ok=C.filter(x=>x[2]).sort((a,b)=>a[2]<b[2]?1:-1),falta=C.filter(x=>!x[2]);return seqCard()+`<div class="c"><h2>Conquistas · ${ok.length} de ${C.length}</h2>${ok.length?ok.map(x=>`<div class="er"><span>${x[0]} <b>${esc(x[1])}</b></span><small>${fd(x[2])}</small></div>`).join(""):`<p class="m">Ainda nenhuma. A primeira vem com o primeiro treino ou com 7 dias seguidos de água.</p>`}</div>${falta.length?`<div class="c"><h2>Próximas</h2>${falta.map(x=>`<div class="er" style="opacity:.6"><span>${x[0]} ${esc(x[1])}</span></div>`).join("")}</div>`:""}`}
/* avisa uma vez (por aparelho) a conquista alcançada nos últimos 3 dias */
function avisaConquista(){try{const vis=JSON.parse(localStorage.getItem("mc_conq_vistas")||"[]"),nova=conquistas().find(x=>x[2]&&days(x[2],td())<=3&&!vis.includes(x[1]));if(!nova)return;vis.push(nova[1]);localStorage.setItem("mc_conq_vistas",JSON.stringify(vis));setTimeout(()=>toast(`${nova[0]} Conquista: ${nova[1]}!`),700)}catch(e){}}

/* ---------- Check-in semanal: peso, cintura, foto e como foi a semana, no dia escolhido (S.ci) ---------- */
const DSEM=["segunda","terça","quarta","quinta","sexta","sábado","domingo"];
function ciUltimo(){const h=(S.ci&&S.ci.h)||{};return Object.keys(h).sort().pop()||null}
function ciPendente(){if(!S.ci||S.ci.dia==null)return false;const hoje=td(),u=ciUltimo();if(u==hoje)return false;if(wi(hoje)==S.ci.dia)return true;return!!u&&days(u,hoje)>=8}
function ciCardAgora(){if(!ciPendente())return"";const atras=wi(td())!=S.ci.dia;return`<div class="c act"><div class="ai g">${I("check")}</div><div><small>Check-in da semana${atras?" · atrasado":""}</small><b>Peso, cintura, foto e como foi</b><span class="m">Leva 1 minuto</span></div><button class="p sm" data-mcci="1">Fazer</button></div>`}
function ciV(){const c=S.ci||{},h=c.h||{},ks=Object.keys(h).sort().reverse();return`<div class="c"><h2>Dia do check-in</h2><p class="m" style="margin-top:0">No dia escolhido, o Início mostra o check-in: peso, cintura, uma foto e como foi a semana. Medir sempre no mesmo dia deixa as comparações justas.</p><div class="tg">${DSEM.map((d,i)=>`<button class="${c.dia===i?"on":""}" data-mccid="${i}">${cap(d)}</button>`).join("")}</div>${c.dia!=null?`<button class="wide ghost" data-mccid="off">Desligar o check-in</button>`:""}<button class="p wide lg" data-mcci="1" style="margin-top:10px">Fazer check-in agora</button></div>
${ks.length?`<div class="c"><h2>Check-ins</h2>${ks.map(k=>{const L=S.log[k]||{},x=h[k];return`<div class="er"><div><b>${fd(k)}</b>${x.t?`<small>${esc(x.t)}</small>`:""}</div><span style="text-align:right">${L.peso!=null?`<b>${f1(L.peso,1)} kg</b>`:""}${L.cint!=null?`<small>cintura ${f1(L.cint,1)} cm</small>`:""}<small>${"★".repeat(x.n||0)}${"☆".repeat(5-(x.n||0))}</small></span></div>`}).join("")}</div>`:""}`}
let CI=null;
function ciAbrir(){const L=S.log[td()]||{},pe=lastPeso(),ck=Object.keys(S.log).sort().filter(k=>S.log[k].cint),uc=ck.length?S.log[ck[ck.length-1]].cint:null;CI={passo:0,peso:L.peso??pe??"",cint:L.cint??uc??"",n:0,t:""};ciDesenha()}
function ciFechar(){CI=null;const el=document.getElementById("mcci");if(el)el.remove()}
function ciDesenha(){let el=document.getElementById("mcci");if(!el){el=document.createElement("div");el.id="mcci";el.className="mcov";document.body.appendChild(el)}const v=x=>x===""||x==null?"":String(x).replace(".",",");
const P=[
()=>`<h2>1 de 4 · Peso</h2><p class="m">De manhã, em jejum, depois do banheiro.</p><input id="ciPeso" inputmode="decimal" value="${v(CI.peso)}" placeholder="kg">`,
()=>`<h2>2 de 4 · Cintura</h2><p class="m">Fita na altura do umbigo, sem apertar. Pode pular.</p><input id="ciCint" inputmode="decimal" value="${v(CI.cint)}" placeholder="cm">`,
()=>`<h2>3 de 4 · Foto</h2><p class="m">Mesmo lugar, mesma luz. Pode pular.</p><label>Pose</label><select id="fpo"><option>Frente</option><option>Lado</option><option>Costas</option></select><label class="p wide lg" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;background:var(--tc);color:#fff;border-radius:16px;min-height:56px;cursor:pointer">${I("cam",20)} Tirar ou escolher foto<input type="file" accept="image/*" id="fin" hidden></label><p class="m" id="fst"></p>`,
()=>`<h2>4 de 4 · Como foi a semana?</h2><div class="tg">${[1,2,3,4,5].map(n=>`<button class="${CI.n==n?"on":""}" data-mccin="${n}">${"★".repeat(n)}</button>`).join("")}</div><textarea id="ciTxt" rows="3" maxlength="300" placeholder="O que ajudou, o que atrapalhou (opcional)">${esc(CI.t)}</textarea>`];
el.innerHTML=`<div class="mcovc">${P[CI.passo]()}<div class="r" style="margin-top:16px">${CI.passo?`<button class="wide ghost" data-mccv="-1">Voltar</button>`:`<button class="wide ghost" data-mccx="1">Agora não</button>`}<button class="p wide" data-mccv="1">${CI.passo==3?"Concluir":CI.passo==2?"Seguir":"Próximo"}</button></div></div>`}
function ciLer(){const n=id=>{const e=document.getElementById(id);if(!e)return undefined;const x=parseFloat(String(e.value).replace(",","."));return isNaN(x)?"":x};if(CI.passo==0)CI.peso=n("ciPeso");if(CI.passo==1)CI.cint=n("ciCint");if(CI.passo==3){const t=document.getElementById("ciTxt");if(t)CI.t=t.value.trim()}}
function ciConcluir(){const d=td(),L=S.log[d]=S.log[d]||{};if(CI.peso!==""&&CI.peso>20&&CI.peso<400)L.peso=Math.round(CI.peso*100)/100;if(CI.cint!==""&&CI.cint>30&&CI.cint<250)L.cint=Math.round(CI.cint*10)/10;S.ci=S.ci||{};S.ci.h=S.ci.h||{};S.ci.h[d]={n:CI.n||0,t:CI.t||""};sv();ciFechar();draw(1);toast("✅ Check-in da semana salvo")}

/* ---------- Ciclo menstrual (S.ciclo.ini: datas em que a menstruação começou) ---------- */
const cicloOn=()=>S.p.sexo=="f";
function cicloInfo(){const I0=((S.ciclo&&S.ciclo.ini)||[]).slice().sort();if(!I0.length)return null;const ds=[];for(let i=1;i<I0.length;i++){const x=days(I0[i-1],I0[i]);if(x>=20&&x<=45)ds.push(x)}const dur=ds.length?Math.round(avg(ds.slice(-6))):28,ult=I0[I0.length-1],dia=days(ult,td())+1,prox=new Date(ult+"T12:00:00");prox.setDate(prox.getDate()+dur);return{ini:I0,dur,ult,dia,prox:prox.toISOString().slice(0,10),medido:ds.length}}
/* nota para o peso: fase pré-menstrual e primeiros dias, quando a retenção de líquido costuma subir o peso */
function cicloNota(){if(!cicloOn())return"";const c=cicloInfo();if(!c||c.dia>c.dur+10)return"";let f=null;if(c.dia<=3)f=`primeiros dias da menstruação (dia ${c.dia} do ciclo)`;else if(c.dia>=c.dur-5)f=`fase pré-menstrual (dia ${c.dia} de ~${c.dur})`;if(!f)return"";return`<div class="c tip cicn"><b>🌸 ${cap(f)}</b><p class="m" style="margin:4px 0 0">Nesses dias a retenção de líquido pode subir o peso de 0,5 a 2 kg, sem ser gordura. Compare com o mesmo dia do ciclo anterior.</p></div>`}
function cicloV(){const c=cicloInfo();return`${c?`<div class="kp"><div><b>${Math.max(1,c.dia)}</b><small>dia do ciclo</small></div><div><b>${c.dur}</b><small>dias por ciclo${c.medido?"":" (padrão)"}</small></div><div><b style="font-size:16px;line-height:1.6">${fd(c.prox).slice(0,5)}</b><small>próxima prevista</small></div></div>`:""}<div class="c"><h2>Registrar</h2><button class="p wide lg" data-mccic="hoje">🌸 A menstruação começou hoje</button><label style="margin-top:12px">Ou outra data</label><div class="r"><input type="date" id="cicD" max="${td()}"><button class="p" data-mccic="data" style="flex:0 0 auto">Salvar</button></div><p class="m">O app usa as datas para avisar, no peso, quando a retenção de líquido do ciclo pode estar subindo o número. Fica só na sua conta.</p></div>${c?`<div class="c"><h2>Inícios registrados</h2>${c.ini.slice().reverse().map(d=>`<div class="er"><span>${cap(longDate(d))}</span><button class="ib" data-mccidel="${d}" aria-label="Apagar data" style="width:32px;min-height:32px;flex:0 0 32px">${I("x",14)}</button></div>`).join("")}</div>`:""}`}
function cicloAdd(d){if(!d)return;S.ciclo=S.ciclo||{};const a=S.ciclo.ini=S.ciclo.ini||[];if(!a.includes(d))a.push(d);a.sort();sv();draw(1);toast("🌸 Data salva")}

/* ---------- Comparar fotos lado a lado, com o controle deslizante de antes e depois ---------- */
let CMP=null;
function cmpFotos(){return(S.fotos||[]).slice().sort((a,b)=>a.d<b.d?-1:1)}
function cmpCard(){const F=cmpFotos();if(F.length<2)return"";if(!CMP||!F[CMP.a]||!F[CMP.b]){const P=["Frente","Lado","Costas"].map(p=>F.map((x,i)=>[x,i]).filter(([x])=>x.p==p)).sort((a,b)=>b.length-a.length)[0];CMP=P.length>=2?{a:P[0][1],b:P[P.length-1][1],v:50}:{a:0,b:F.length-1,v:50}}const op=s=>F.map((x,i)=>`<option value="${i}" ${i==s?"selected":""}>${fd(x.d)} · ${esc(x.p||"foto")}</option>`).join("");
return`<div class="c"><h2>Comparar</h2><div class="r"><div><label>Antes</label><select id="cmpA">${op(CMP.a)}</select></div><div><label>Depois</label><select id="cmpB">${op(CMP.b)}</select></div></div><div class="cmpw" id="cmpW"><img src="${esc(srcOf(F[CMP.b].id))}" alt="Depois, ${fd(F[CMP.b].d)}"><div class="cmpa" style="clip-path:inset(0 ${100-CMP.v}% 0 0)"><img src="${esc(srcOf(F[CMP.a].id))}" alt="Antes, ${fd(F[CMP.a].d)}"></div><i class="cmpl" style="left:${CMP.v}%"></i><span class="cmpt e">${fd(F[CMP.a].d).slice(0,5)}</span><span class="cmpt d">${fd(F[CMP.b].d).slice(0,5)}</span></div><input type="range" id="cmpR" min="0" max="100" value="${CMP.v}" aria-label="Arraste para comparar"><p class="m" style="margin:4px 0 0">Arraste para mostrar mais da foto de antes ou da de depois.</p></div>`}

/* ---------- Eventos ---------- */
document.addEventListener("click",e=>{const t=e.target.closest("[data-mcci],[data-mccx],[data-mccv],[data-mccin],[data-mccid],[data-mccic],[data-mccidel]");if(!t)return;const D=t.dataset;
if(D.mcci){ciAbrir();return}
if(D.mccx){ciFechar();return}
if(D.mccin){ciLer();CI.n=+D.mccin;ciDesenha();return}
if(D.mccv){ciLer();if(+D.mccv>0&&CI.passo==3){ciConcluir();return}CI.passo=Math.max(0,Math.min(3,CI.passo+ +D.mccv));ciDesenha();return}
if(D.mccid){S.ci=S.ci||{};if(D.mccid=="off")S.ci.dia=null;else S.ci.dia=+D.mccid;sv();draw(1);return}
if(D.mccic){if(D.mccic=="hoje")cicloAdd(td());else{const v=document.getElementById("cicD").value;if(v&&v<=td())cicloAdd(v);else toast("Escolha uma data até hoje.")}return}
if(D.mccidel){S.ciclo.ini=(S.ciclo.ini||[]).filter(d=>d!=D.mccidel);sv();draw(1);return}});
document.addEventListener("input",e=>{if(e.target.id=="cmpR"&&CMP){CMP.v=+e.target.value;const w=document.getElementById("cmpW");if(w){w.querySelector(".cmpa").style.clipPath=`inset(0 ${100-CMP.v}% 0 0)`;w.querySelector(".cmpl").style.left=CMP.v+"%"}}});
document.addEventListener("change",e=>{if((e.target.id=="cmpA"||e.target.id=="cmpB")&&CMP){CMP[e.target.id=="cmpA"?"a":"b"]=+e.target.value;draw(1)}});
