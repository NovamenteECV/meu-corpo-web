/* Vallen Fitness · exercícios, prescrição, progressão e sessão de treino
   Arquivos carregados em ordem pelo index.html (scripts comuns, escopo global compartilhado).
   Criado e desenvolvido por VALLEN TECNOLOGIA */
const EQ=[["barra","Barra e anilhas"],["halter","Halteres"],["banco","Banco"],["maquina","Máquinas"],["cabo","Polia/cabos"],["barra_fixa","Barra fixa"],["elastico","Elásticos"]];
const LOC=[["acad","Academia completa",["barra","halter","banco","maquina","cabo","barra_fixa"]],["cond","Academia do prédio ou condomínio",["halter","banco","maquina","elastico"]],["casa","Casa com halteres",["halter","banco","elastico"]],["zero","Casa sem equipamento",[]]];
const LIM=[["joelho","Joelho"],["lombar","Lombar"],["ombro","Ombro"],["punho","Punho"]];
const EXP=[["ini","Parado ou iniciante"],["ret","Já treinei e estou voltando"],["int","Treino há mais de 1 ano"]];
const GR={sq:"Quadríceps",ul:"Quadríceps",qa:"Quadríceps",hg:"Posterior e glúteos",ha:"Posterior e glúteos",ph:"Peito",pa:"Peito",pv:"Ombros",la:"Ombros",fp:"Ombros",rh:"Costas",vv:"Costas",bi:"Braços",tr:"Braços",co:"Core",ca:"Panturrilha"};
const EXL=[
["agach","Agachamento livre com barra","sq","barra","joelho,lombar","C","Pés na largura dos ombros; desça com o tronco firme até onde a coluna continuar neutra."],
["legpress","Leg press 45°","sq","maquina","","C","Não deixe a lombar descolar do encosto no fim da descida; joelhos alinhados com os pés."],
["hack","Agachamento hack","sq","maquina","joelho","C","Desça em 2–3 s e empurre com o pé inteiro."],
["goblet","Agachamento goblet","sq","halter","","C","Halter junto ao peito, cotovelos por dentro dos joelhos, tronco alto."],
["agbanco","Agachamento até o banco","sq","","","C","Encoste de leve no banco e suba sem sentar. Ótimo para aprender o movimento."],
["romeno","Levantamento terra romeno","hg","barra","lombar","C","Quadril vai para trás, barra rente às pernas, joelhos levemente flexionados."],
["stiffh","Stiff com halteres","hg","halter","lombar","C","Desça até alongar atrás da coxa, sem arredondar as costas."],
["pelvica","Elevação pélvica no banco","hg","banco","","C","Costas apoiadas no banco; suba o quadril contraindo os glúteos e segure 1 s."],
["ponte","Ponte de glúteos no chão","ha","","","A","Calcanhares perto do quadril; suba contraindo os glúteos."],
["flexora","Mesa ou cadeira flexora","ha","maquina","","A","Controle a volta; não tire o quadril do apoio."],
["afundo","Afundo com halteres","ul","halter","joelho","C","Passo médio; o joelho da frente acompanha o pé."],
["bulgaro","Agachamento búlgaro","ul","halter,banco","joelho","C","Pé de trás no banco; o peso fica na perna da frente."],
["stepup","Subida no banco (step-up)","ul","banco","","C","Suba empurrando com a perna de cima, sem impulso da de baixo."],
["extensora","Cadeira extensora","qa","maquina","joelho","A","Suba controlando e segure 1 s em cima."],
["supino","Supino reto com barra","ph","barra,banco","ombro","C","Escápulas juntas e para baixo; a barra desce na linha do mamilo."],
["supinoh","Supino com halteres","ph","halter,banco","","C","Cotovelos a ~45° do tronco; desça até alongar o peito."],
["supmaq","Supino máquina","ph","maquina","","C","Ajuste o banco para a pegada ficar na linha do peito."],
["flexao","Flexão de braços (inclinada se precisar)","ph","","punho","C","Corpo em prancha; se faltar força, apoie as mãos num banco ou mesa."],
["cross","Crucifixo na polia","pa","cabo","ombro","A","Braços levemente flexionados; feche à frente do peito."],
["desenvh","Desenvolvimento com halteres sentado","pv","halter,banco","ombro","C","Suba sem travar os cotovelos, costas apoiadas."],
["desenvm","Desenvolvimento máquina","pv","maquina","ombro","C","Pegada na linha dos ombros, sem arquear a lombar."],
["desenve","Desenvolvimento com elástico","pv","elastico","ombro","C","Pise no elástico e empurre para cima com o abdômen firme."],
["elevlat","Elevação lateral com halteres","la","halter","","A","Suba até a linha dos ombros, cotovelos levemente flexionados."],
["elevlatc","Elevação lateral na polia","la","cabo","","A","Movimento lento, sem balançar o tronco."],
["remcurv","Remada curvada com barra","rh","barra","lombar","C","Tronco inclinado e firme; puxe a barra em direção ao umbigo."],
["remmaq","Remada máquina com apoio no peito","rh","maquina","","C","Peito apoiado; puxe os cotovelos para trás juntando as escápulas."],
["remh","Remada unilateral com halter","rh","halter,banco","","C","Mão e joelho no banco; puxe o halter em direção ao quadril."],
["rembaixa","Remada baixa na polia","rh","cabo","","C","Tronco parado; puxe até o abdômen."],
["reme","Remada com elástico","rh","elastico","","C","Elástico preso à frente; puxe juntando as escápulas."],
["remtoalha","Remada na porta com toalha","rh","","","C","Toalha presa numa porta firme, corpo inclinado para trás; puxe o peito em direção à porta."],
["puxada","Puxada frente na polia","vv","cabo","","C","Puxe até a parte de cima do peito, sem jogar o tronco para trás."],
["barrafixa","Barra fixa (com elástico de ajuda se precisar)","vv","barra_fixa","ombro","C","Desça quase estendendo os braços; suba levando o peito à barra."],
["puxe","Puxada alta com elástico","vv","elastico","","C","Elástico preso no alto; puxe os cotovelos para baixo."],
["facepull","Face pull","fp","cabo|elastico","","A","Puxe na direção do rosto, abrindo os cotovelos. Protege os ombros."],
["rosca","Rosca direta com halteres","bi","halter","","A","Cotovelos parados ao lado do corpo."],
["roscac","Rosca na polia","bi","cabo","","A","Sem balançar o tronco; desça devagar."],
["roscae","Rosca com elástico","bi","elastico","","A","Pise no elástico; cotovelos fixos."],
["tricorda","Tríceps na polia com corda","tr","cabo","","A","Cotovelos colados ao corpo; abra a corda no final."],
["tricfr","Tríceps francês com halter","tr","halter","ombro","A","Cotovelos apontados para cima; desça atrás da cabeça com controle."],
["trice","Tríceps com elástico","tr","elastico","","A","Elástico preso no alto; estenda os cotovelos."],
["tricbanco","Mergulho no banco","tr","banco","ombro,punho","A","Mãos no banco atrás do corpo; desça só até 90° nos cotovelos."],
["deadbug","Dead bug","co","","","A","Lombar colada no chão; estenda braço e perna opostos devagar."],
["prancha","Prancha","co","","","A","Corpo reto do ombro ao calcanhar. Com refluxo, faça longe das refeições ou troque por dead bug."],
["pallof","Pallof press","co","cabo|elastico","","A","Empurre à frente do peito sem deixar o tronco girar."],
["fazendeiro","Caminhada do fazendeiro","co","halter","","A","Halteres pesados ao lado do corpo; caminhe com o tronco ereto."],
["pantp","Panturrilha em pé","ca","","","A","Suba na ponta dos pés, segure 1 s e desça alongando."],
["pantm","Panturrilha na máquina","ca","maquina","","A","Amplitude completa, sem quicar."]];
const TPL={A:["sq","ph","rh","hg","la","co","bi"],B:["hg","pv","vv","ul","tr","fp","co"],C:["ul","ph","rh","ha","fp","ca","bi"],UA:["ph","rh","pv","vv","la","tr","bi"],UB:["vv","ph","rh","pv","fp","bi","tr"],LA:["sq","hg","ul","qa","ca","co"],LB:["hg","sq","ul","ha","ca","co"]};
const TN={A:"Corpo inteiro A",B:"Corpo inteiro B",C:"Corpo inteiro C",UA:"Superior A",UB:"Superior B",LA:"Inferior A",LB:"Inferior B"};
const SPL={2:["A","B"],3:["A","B","C"],4:["UA","LA","UB","LB"],5:["UA","LA","UB","LB","C"]};
const VI={A:0,B:0,C:1,UA:0,UB:1,LA:0,LB:1},FB={qa:"ul",ha:"hg",la:"pv",fp:"rh",pa:"ph",vv:"rh",ul:"sq"};
let tv="hoje",LEVE=0,TD=null,RT=null,TI=null,AC=null;
const EXF=id=>EXL.find(e=>e[0]==id),fmtT=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`,e1=s=>s&&s.kg&&s.r?s.kg*(1+s.r/30):0;
function okEx(e){const c=S.tr.cfg,eq=new Set(c.eq),req=e[3]?e[3].split(","):[];return req.every(r=>r.split("|").some(x=>eq.has(x)))&&!(e[4]&&e[4].split(",").some(x=>c.lim.includes(x)))}
const RK={maquina:0,cabo:1,halter:2,banco:3,"":3,elastico:4,barra:5,barra_fixa:5};
const opts=pat=>{const o=EXL.filter(e=>e[2]==pat&&!e[7]&&okEx(e));if(S.tr.cfg&&S.tr.cfg.exp=="ini"){const r=e=>e[0]=="bulgaro"?6:Math.max(...(e[3]||"").split(",").map(x=>RK[x.split("|")[0]]??3));return o.map((e,i)=>[e,i]).sort((a,b)=>r(a[0])-r(b[0])||a[1]-b[1]).map(x=>x[0])}return o};
function sess0(key){const c=S.tr.cfg,n={30:4,45:5,60:6,75:7}[c.dur]||5,pats=TPL[key],out=[],used=new Set();for(let i=0;i<pats.length&&out.length<n;i++){let pat=pats[i],o=opts(pat).filter(e=>!used.has(e[0]));if(!o.length&&FB[pat]){pat=FB[pat];o=opts(pat).filter(e=>!used.has(e[0]))}if(!o.length)continue;const sk=key+":"+i,sw=S.tr.sw[sk],e=(sw&&o.find(x=>x[0]==sw))||o[VI[key]%o.length];used.add(e[0]);out.push({sk,e,o})}return out}
function fase(){const w=Math.max(0,Math.floor(days(S.tr.start||td(),td())/7)),wb=w%8+1,ini=S.tr.cfg.exp=="ini";let f;if(wb<=2)f={n:"Adaptação",sc:ini?2:3,sa:2,rir:"3–4",d:"Aprenda a técnica com cargas confortáveis. Termine cada série sentindo que faria mais 3–4 repetições."};else if(wb<=6)f={n:"Progressão",sc:3,sa:3,rir:"2",d:"Suba carga ou repetições sempre que bater o topo da faixa. Termine com ~2 repetições sobrando."};else if(wb==7)f={n:"Intensificação",sc:3,sa:3,rir:"1–2",d:"Semana mais forte do bloco, sempre com técnica perfeita."};else f={n:"Deload",sc:2,sa:1,rir:"4",d:"Semana de recuperação: carga 10% menor e menos séries. Ela faz parte do progresso.",dl:1};return{...f,w:w+1,wb,bl:Math.floor(w/8)+1}}
function presc0(e,f,leve){const t=e[5],p=e[2],sec=["prancha","fazendeiro"].includes(e[0]);let s=t=="C"?f.sc:f.sa;if(leve)s=Math.max(1,s-1);const rr=sec?[30,45]:p=="ca"?[12,20]:p=="co"?[10,15]:t=="C"?[8,12]:[10,15];return{s,lo:rr[0],hi:rr[1],u:sec?" s":" reps",rest:t=="C"?(["sq","hg"].includes(p)?150:120):p=="co"||p=="ca"?45:75}}
function inc(e){const q=e[3];return/barra|maquina/.test(q)?(["sq","hg","ul"].includes(e[2])?5:2.5):/halter/.test(q)?2:/cabo|elastico/.test(q)&&!/maquina/.test(q)?(q.includes("cabo")?2.5:0):0}
function lastOf(id){for(let i=S.tr.ses.length-1;i>=0;i--){const x=S.tr.ses[i].ex.find(y=>y.id==id);if(x&&x.sets.length)return{d:S.tr.ses[i].d,sets:x.sets}}return null}
function best(id){let b=null;S.tr.ses.forEach(s=>s.ex.forEach(x=>{if(x.id==id)x.sets.forEach(z=>{const v=e1(z);if(v&&(b==null||v>b))b=v})}));return b}
function sug0(e,pr,f){const l=lastOf(e[0]),i=inc(e),st=i||1,rnd=x=>Math.round(x/st)*st;if(!l)return{kg:null,txt:i?"Primeira vez: escolha uma carga que deixe ~3 repetições sobrando.":"Primeira vez: faça com boa técnica e anote as repetições."};const kg=Math.max(0,...l.sets.map(s=>s.kg||0)),top=l.sets.every(s=>(s.r||0)>=pr.hi),low=l.sets.some(s=>(s.r||0)<pr.lo);
if(f.dl&&kg)return{kg:rnd(kg*.9),txt:`Deload: use ${f1(rnd(kg*.9),1)} kg.`};if(top&&i&&kg)return{kg:kg+i,txt:`Você bateu ${pr.hi}${pr.u} em todas as séries: suba para ${f1(kg+i,1)} kg.`};if(top)return{kg:kg||null,txt:"Bateu o topo da faixa: faça 1–2 repetições a mais ou uma variação mais difícil."};if(low&&kg)return{kg,txt:"Na última vez ficou abaixo da faixa: mantenha a carga e busque mais repetições."};return{kg:kg||null,txt:kg?`Mantenha ${f1(kg,1)} kg e tente +1 repetição por série.`:"Tente +1 repetição por série."}}
function nextKey0(){const sp=SPL[S.tr.cfg.dias.length]||SPL[3],ls=S.tr.ses.length?S.tr.ses[S.tr.ses.length-1].key:null,i=sp.indexOf(ls);return sp[(i+1)%sp.length]}
function mkEx(e,sk,f,leve){const pr=presc(e,f,leve),sg=sug(e,pr,f);return{id:e[0],sk,sets:[...Array(pr.s)].map(()=>({kg:sg.kg,r:null,rir:null,done:0}))}}
function startT(key){const f=fase();S.tr.cur={d:td(),key,t0:Date.now(),leve:LEVE,ex:sess(key).map(x=>mkEx(x.e,x.sk,f,LEVE))};S.tr.last=null;sv();tv="hoje";draw()}
const elap=()=>S.tr.cur?Math.floor((Date.now()-S.tr.cur.t0)/60000)+" min":"";
function beep(){try{if(!AC)return;[0,.3,.6].forEach(t=>{const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=880;o.connect(g);g.connect(AC.destination);g.gain.setValueAtTime(.25,AC.currentTime+t);o.start(AC.currentTime+t);o.stop(AC.currentTime+t+.18)})}catch(e){}}
function rest(sec){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)()}catch(e){}RT={end:Date.now()+sec*1e3,tot:sec};restNotif(RT.end);if(!TI)TI=setInterval(tick,250);tick()}
function tick(){const el=document.getElementById("tmr"),te=document.getElementById("tel");if(te)te.textContent=elap();if(!RT){if(el)el.style.display="none";restCancela();return}const left=Math.max(0,Math.ceil((RT.end-Date.now())/1e3));if(el){el.style.display="flex";el.querySelector("b").textContent=fmtT(left);el.querySelector("i").style.width=Math.min(100,100-left/RT.tot*100)+"%"}if(left<=0){RT=null;beep();try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(e){}if(el)el.style.display="none"}}
function lastDoseDays(){const ds=Object.keys(S.log).filter(k=>S.log[k].dose).sort();return ds.length?days(ds[ds.length-1],td()):null}
function trInput(t){const c=S.tr.cur;if(!c)return;const[i,j,fl]=t.dataset.ts.split(":"),x=c.ex[+i];if(!x)return;const s=x.sets[+j],v=fl=="rir"?(t.value===""?null:+t.value):(num(t.value)??null);if(fl=="kg"){const old=s.kg;x.sets.forEach((z,k)=>{if(k>+j&&!z.done&&z.kg===old)z.kg=v})}s[fl]=v;sv();if(fl=="kg")draw(1)}
function finishT(){const c=S.tr.cur,f=fase(),ex=c.ex.map(x=>({id:x.id,sets:x.sets.filter(s=>s.done).map(s=>({kg:s.kg,r:s.r,rir:s.rir}))})).filter(x=>x.sets.length);if(!ex.length){alert("Marque pelo menos uma série como feita (OK).");return}
const prs=[];ex.forEach(x=>{const b=best(x.id),n=Math.max(0,...x.sets.map(e1));if(n>0&&b!=null&&n>b+.01)prs.push([x.id,n])});const vol=ex.reduce((a,x)=>a+x.sets.reduce((b,s)=>b+(s.kg||0)*(s.r||0),0),0),dur=Math.max(1,Math.round((Date.now()-c.t0)/6e4));
S.tr.ses.push({d:c.d,key:c.key,ex,dur,rpe:num($("#tpe").value),note:$("#tno").value,vol,leve:c.leve,fase:f.n});const L=S.log[c.d]=S.log[c.d]||{};L.treino=true;S.tr.last={prs,vol,dur,n:ex.reduce((a,x)=>a+x.sets.length,0)};S.tr.cur=null;RT=null;LEVE=0;sv();draw()}
function spk(v){if(v.length<2)return"";const lo=Math.min(...v),hi=Math.max(...v),d=hi-lo||1;return`<svg viewBox="0 0 100 24" width="90" height="24" aria-hidden="true"><polyline fill="none" stroke="var(--ac)" stroke-width="2" points="${v.map((x,i)=>`${i/(v.length-1)*100},${22-(x-lo)/d*20}`).join(" ")}"/></svg>`}
async function trIA(){const r=$("#tiar");r.textContent="Analisando…";let sm;try{sm=window.claude?await claude.use("sample"):window.MC_IA}catch(e){}if(!sm){r.textContent="Recurso indisponível neste aparelho.";return}
const ctx=JSON.stringify({config:S.tr.cfg,fase:fase(),sessoes:S.tr.ses.slice(-12).map(s=>({d:s.d,treino:TN[s.key],min:s.dur,esforco:s.rpe,nota:s.note,ex:s.ex.map(x=>({n:EXF(x.id)[1],series:x.sets.map(z=>[z.kg,z.r,z.rir])}))})),cardio:S.tr.cardio.slice(-10),pesos:Object.keys(S.log).sort().filter(k=>S.log[k].peso).slice(-8).map(k=>[k,S.log[k].peso]),bioimpedancia:S.bios});
try{const x=await sm("Você é o personal trainer do app Vallen Fitness de "+quem()+". Nas séries, cada item é [kg, repetições, repetições que sobraram]. Responda em português, direto, sem elogios e sem abertura, neste formato:\n1) Progressão de força (o que subiu, o que travou)\n2) Volume e frequência versus o objetivo\n3) Até 3 ajustes concretos para as próximas 2 semanas (exercício, séries, reps ou carga)\n4) Sinais de alerta, se houver\nMarque cada item com [Certeza], [Provável] ou [Chute]. Não fale de dose de medicamento nem faça diagnóstico; dor articular que persiste = procurar um profissional. Se houver poucos dados, diga isso primeiro.\n\nDados (JSON): "+ctx,{cache:false,tipo:"treino",onText:t=>{r.textContent=t.text}});S.tr.ia={d:td(),t:x.text};sv();r.textContent=x.text}catch(e){r.textContent=e&&e.msg?e.msg:e&&e.code=="rate_limited"?"Muitas solicitações agora. Tente mais tarde.":"Não consegui analisar agora."}}
function cycleSw(sk){const key=sk.split(":")[0],x=sess(key).find(y=>y.sk==sk);if(!x||x.o.length<2)return null;const n=x.o[(x.o.indexOf(x.e)+1)%x.o.length];S.tr.sw[sk]=n[0];return n}
function trClick(t,D){
if(D.tv){tv=D.tv;TD=null;draw();return 1}
if(D.tx!=null){if(!RT)return 1;const v=+D.tx;if(!v)RT.end=Date.now();else{RT.end+=v*1e3;RT.tot=Math.max(RT.tot,Math.ceil((RT.end-Date.now())/1e3))}tick();return 1}
if(D.tlev){LEVE=LEVE?0:1;draw(1);return 1}
if(D.tstart){startT(D.tstart);return 1}
if(D.tdone){const[i,j]=D.tdone.split(":").map(Number),c=S.tr.cur,x=c.ex[i],s=x.sets[j],e=EXF(x.id),pr=presc(e,fase(),c.leve);s.done=s.done?0:1;if(s.done){if(s.r==null)s.r=pr.lo;const last=i==c.ex.length-1&&j==x.sets.length-1;if(!last)rest(pr.rest)}sv();draw(1);return 1}
if(D.tadd!=null){const x=S.tr.cur.ex[+D.tadd],l=x.sets[x.sets.length-1];x.sets.push({kg:l?l.kg:null,r:null,rir:null,done:0});sv();draw(1);return 1}
if(D.tsw!=null){const c=S.tr.cur,i=+D.tsw,n=cycleSw(c.ex[i].sk);if(n){if(c.ex[i].sets.some(s=>s.done)&&!confirm("Trocar o exercício apaga as séries já marcadas dele. Continuar?"))return 1;c.ex[i]=mkEx(n,c.ex[i].sk,fase(),c.leve)}else alert("Sem alternativa com seus equipamentos e limitações.");sv();draw(1);return 1}
if(D.psw){cycleSw(D.psw);sv();draw(1);return 1}
if(D.tfin){finishT();return 1}
if(D.tcan){if(confirm("Descartar este treino sem salvar?")){S.tr.cur=null;RT=null;sv();draw()}return 1}
if(D.tdel!=null){if(confirm("Apagar este treino do histórico?")){lixo("treino",S.tr.ses.splice(+D.tdel,1)[0]);sv();draw(1)}return 1}
if(D.cdel!=null){lixo("cardio",S.tr.cardio.splice(+D.cdel,1)[0]);sv();draw(1);return 1}
if(D.cty){window.CTY=D.cty;draw(1);return 1}
if(t.id=="csv"){const mi=num($("#cmi").value),km=num($("#ckm").value);if(!mi||mi<=0){alert("Informe os minutos.");return 1}S.tr.cardio.push({d:td(),tipo:window.CTY||"Caminhada",min:Math.round(mi),km:km||null});sv();draw(1);return 1}
if(t.id=="tia"){trIA();return 1}
const T0=TD;if(T0){
if(D.tloc){T0.loc=D.tloc;T0.eq=[...LOC.find(x=>x[0]==D.tloc)[2]];draw(1);return 1}
if(D.teq){T0.eq=T0.eq.includes(D.teq)?T0.eq.filter(x=>x!=D.teq):[...T0.eq,D.teq];draw(1);return 1}
if(D.tdia!=null){const v=+D.tdia;T0.dias=T0.dias.includes(v)?T0.dias.filter(x=>x!=v):[...T0.dias,v].sort((a,b)=>a-b);draw(1);return 1}
if(D.tdur){T0.dur=+D.tdur;draw(1);return 1}
if(D.texp){T0.exp=D.texp;draw(1);return 1}
if(D.tlim){T0.lim=T0.lim.includes(D.tlim)?T0.lim.filter(x=>x!=D.tlim):[...T0.lim,D.tlim];draw(1);return 1}
if(D.tsave){if(!T0.loc){alert("Escolha onde vai treinar.");return 1}if(T0.dias.length<2||T0.dias.length>(S.tr.prog=="sf"?7:5)){alert(S.tr.prog=="sf"?"Escolha pelo menos 2 dias.":"Escolha de 2 a 5 dias.");return 1}const first=!S.tr.cfg;S.tr.cfg=JSON.parse(JSON.stringify(T0));if(first||!S.tr.start)S.tr.start=td();TD=null;tv="hoje";sv();draw();return 1}
if(D.trst){if(confirm("Recomeçar o bloco a partir da semana 1?")){S.tr.start=td();sv();tv="hoje";TD=null;draw()}return 1}}
return 0}
function sumAte(){const d=dia(wi(dt)),a=S.ate[dt]||{},L=LG();let k=0,p=0;(d?d.m:[]).forEach((x,i)=>{if(a[i]){k+=x[1];p+=x[2]}});(S.food[dt]||[]).forEach(([id,g])=>{const f=FOOD.find(x=>x[0]==id);if(f){k+=f[2]*g/100;p+=f[3]*g/100}});p+=L.px||0;if(k)L.kcal=Math.round(k);else delete L.kcal;if(p)L.prot=Math.round(p);else delete L.prot;clean(L)}
