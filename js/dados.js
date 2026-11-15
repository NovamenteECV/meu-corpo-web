/* Meu Corpo · estado (S), migração, cálculos, metas, pendências, horários e perguntas à IA
   Arquivos carregados em ordem pelo index.html (scripts comuns, escopo global compartilhado).
   Criado e desenvolvido por VALLEN TECNOLOGIA */
const KEY="meucorpo1",T=[["hoje","🏠","Hoje"],["res","📈","Resumo"],["dieta","🍽","Dieta"],["treino","🏋","Treino"],["perfil","👤","Perfil"],["ia","💬","Perguntar"]];
const CAFE=[["c1","Pão de sal 1 un (50 g) + 2 ovos + 1 fatia de queijo (café só depois de comer)",360,22,30,17],["c2","Pão de sal 1 un + omelete de 2 ovos com queijo + leite desnatado 200 ml",430,29,40,17],["c3","Pão integral 2 fatias + 2 ovos cozidos + cottage 50 g",320,23,24,14]];
const L1=[["l1","Iogurte natural 200 g + 1 fruta (maçã, pera, melancia ou uva)",160,9,31,1],["l2","2 ovos cozidos + 1 fruta",215,13,18,10],["l3","Iogurte natural 200 g + whey 30 g + 1 fruta",280,32,33,2]];
const L2=[["t1","Pão integral 2 fatias + cottage 100 g + pera",300,16,47,6],["t2","Frango desfiado 100 g + pão francês 50 g",315,35,29,7],["t3","Iogurte 200 g + cottage 100 g",190,20,16,5]];
const PR=[["p1","Frango grelhado 130 g",215,40,0,5],["p2","Patinho 130 g",230,38,0,9],["p3","Omelete (3 ovos + 2 claras)",250,30,1,15],["p4","Frango desfiado 150 g",250,45,0,6]];
const CB=[["a1","Arroz",120,156,3,34,0],["a2","Batata-doce",150,129,2,30,0],["a3","Macarrão cozido",150,200,7,40,1],["a4","Batata inglesa",200,150,4,34,0],["a5","Cuscuz",120,135,3,30,1],["a6","Aipim",100,125,1,30,0]];
const JA=[["j1","Pão de sal 1 un + 2 ovos + 1 fatia de queijo",360,22,30,17],["j2","Pão de sal 2 un + frango desfiado 100 g + 1 fatia de queijo",530,45,58,12],["j3","Pão de sal 1 un + omelete (2 ovos + 2 claras) + 1 fatia de queijo",395,29,30,17],["j4","Sopa de frango (150 g) com legumes e batata",330,40,25,8]];
const ALL=[...CAFE,...L1,...L2,...PR,...JA,...CB.map(x=>[x[0],x[1]])],WD=["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
/* Versão do app. Ao exigir que todos atualizem, suba este número e o "min" do versao.json juntos. */
const APP_VER=2;
/* Refeições que a pessoa pode escolher: chave, nome, ícone, janela (de, até), horário padrão, peso nas calorias do dia, tipo. */
const REFS=[["cafe","Café da manhã","☀️","05:30","09:30","07:30",.25,"cafe"],["lm","Lanche da manhã","🍎","09:00","11:00","10:00",.1,"lanche"],["alm","Almoço","🍽️","11:00","14:00","12:00",.3,"ref"],["lt","Lanche da tarde","🥪","14:30","18:00","16:00",.1,"lanche"],["jan","Jantar","🌙","18:00","21:30","19:30",.25,"ref"],["ceia","Ceia","🥛","21:00","23:30","22:00",.07,"ceia"]];
let NM=[],TH=[],HR=[],EMJ=[];
let S;
try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
/* Estado em branco: nenhum dado de outra pessoa entra numa conta nova. */
const S0=()=>({v:2,p:{nome:"",fat:1.375},bad:{},done:{},ate:{},log:{},bios:[],ex:{d:"",r:[]},exh:{},food:{},tr:{prog:"app",ses:[],cardio:[],sw:{}},pend:[]});
if(!S||!S.p)S=S0();
/* Contas criadas antes da versão 2 (só a do André tinha exames e aplicações): leva para os dados dela o que antes ficava fixo no código. */
function migrar(){if(S.v>=2)return;const leg=(S.ex&&S.ex.r&&S.ex.r.length)||Object.values(S.log).some(x=>x&&x.dose);if(leg){S.dieta=S.dieta||{legado:1,nunca:"mamão, banana, castanha, chá, aveia, girassol, linhaça, chia e frutos do mar"};S.med=S.med||{nome:"Tirzepatida",un:"mg",desc:"tirzepatida T.G. (Indufar), frasco 15 mg/0,5 mL"};S.p.sexo=S.p.sexo||"m";const b=S.bios.find(x=>x.d=="2026-11-05");if(b){b.agua=b.agua??54.6;b.rcq=b.rcq??.92;b.tmb=b.tmb??1978;b.mm=b.mm??74.5}[["med","Levar a TGP levemente alta (50) ao médico: ultrassom de abdome e repetir em 8–12 semanas"],["b12","Pedir ao médico B12 e vitamina D (não dosadas)"],["gastro","Consulta com o gastro (esofagite) e informar produto, dose e dia da aplicação"]].forEach(([id,t])=>{if(!S.pend.some(x=>x.id==id))S.pend.push({id,t})})}delete S.bio;S.v=2}
const norm=()=>{S.p=S.p||{};S.log=S.log||{};S.bad=S.bad||{};S.done=S.done||{};S.tr=S.tr||{};S.tr.prog=S.tr.prog||"app";S.tr.ses=S.tr.ses||[];S.tr.cardio=S.tr.cardio||[];S.tr.sw=S.tr.sw||{};S.ate=S.ate||{};S.food=S.food||{};S.exh=S.exh||{};S.bios=S.bios||[];S.ex=S.ex&&S.ex.r?S.ex:{d:"",r:[]};S.pend=S.pend||[];migrar();try{addAlim()}catch(e){}};
norm();
let ref=null,sy="ligando…",busy=0,dirty=0,pt;
const sv=()=>{S._t=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}clearTimeout(pt);pt=setTimeout(push,800)};
async function push(){if(window.NATIVE_SAVE){window.NATIVE_SAVE();return}if(!ref)return;if(busy){dirty=1;return}busy=1;try{await ref.set({j:JSON.stringify(S),t:S._t||0});sy="salva na nuvem ✅"}catch(e){sy="erro ao salvar (os dados seguem no aparelho)"}busy=0;if(dirty){dirty=0;push()}}
async function sinc(){try{const U=await claude.use("user"),D=await claude.use("db"),id=U&&await U.id();if(!D||!id){sy="indisponível (abra logado na sua conta do Claude)";return}
ref=D.doc("data/users/"+id+"/state");const s=await ref.get();if(s.exists&&s.data().t>=(S._t||0)){S=JSON.parse(s.data().j);norm();try{localStorage.setItem(KEY,s.data().j)}catch(e){}sy="sincronizada ✅";draw(1)}else{S._t=S._t||Date.now();await push()}}catch(e){sy="indisponível"}if(tab=="perfil")draw(1)}
const $=s=>document.querySelector(s),td=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
let tab="inicio",dt=td(),dd=null,rm="w";
const num=v=>v===""||v==null?undefined:parseFloat(String(v).replace(",","."));
const avg=a=>{a=a.filter(x=>typeof x=="number");return a.length?a.reduce((x,y)=>x+y,0)/a.length:null};
const f1=(x,d=1)=>x==null?"–":x.toFixed(d).replace(".",",");
const days=(a,b)=>Math.round((new Date(b+"T12:00:00")-new Date(a+"T12:00:00"))/864e5);
const wi=d=>(new Date(d+"T12:00:00").getDay()+6)%7;
function lastPeso(){const k=Object.keys(S.log).filter(k=>S.log[k].peso).sort();return k.length?S.log[k.pop()].peso:null}
const idade=n=>n?Math.floor(days(n,td())/365.25):null;
const pn=()=>String(S.p.nome||"").trim().split(/\s+/)[0]||"";
/* Taxa metabólica basal de Mifflin-St Jeor, pelo sexo. */
const mifflin=(pe,alt,id,sx)=>10*pe+6.25*alt-5*id+(sx=="f"?-161:5);
function ultBio(){return S.bios.slice().sort((a,b)=>a.d<b.d?-1:1).pop()||null}
/* TMB: medida na bioimpedância; senão estimada pela massa magra (Katch-McArdle); senão por peso, altura, idade e sexo. */
function tmbInfo(){const u=ultBio(),pe=lastPeso(),mm=u&&(u.mm||(u.peso&&u.gk!=null?u.peso-u.gk:null));if(u&&u.tmb)return{v:u.tmb,f:"medida na bioimpedância de "+fd(u.d)};if(mm)return{v:370+21.6*mm,f:"estimada pela massa magra (fórmula de Katch-McArdle)"};if(pe&&S.p.alt&&S.p.nasc)return{v:mifflin(pe,S.p.alt,idade(S.p.nasc),S.p.sexo),f:"estimada por peso, altura, idade e sexo (fórmula de Mifflin-St Jeor)"};return null}
function calc(){const p=S.p,pe=lastPeso()||p.peso0||70,id=idade(p.nasc)||30,t=tmbInfo(),tmb=t?t.v:mifflin(pe,p.alt||170,id,p.sexo);return{pe,id,tmb,gasto:tmb*(p.fat||1.375)}}
/* Água: peso × ml por kg conforme a idade (até 17 anos: 40; 18 a 55: 35; 56 a 65: 30; 66 ou mais: 25). */
const aguaRec=(pe,id)=>pe&&id!=null?Math.round(pe*(id<=17?40:id<=55?35:id<=65?30:25)/50)*50/1000:null;
const aguaMeta=()=>S.p.agua||aguaRec(lastPeso()||S.p.peso0,idade(S.p.nasc))||2.5;
const passosMeta=()=>S.p.passos||7000,katMeta=()=>S.p.kat||400;
/* Metas sugeridas pelo perfil. obj: perder, manter ou ganhar. */
function metasPadrao(p,pe){const id=idade(p.nasc)||30,g=mifflin(pe,p.alt,id,p.sexo)*(p.fat||1.375),o=p.obj||"perder";let k=o=="perder"?g-500:o=="ganhar"?g+300:g;k=Math.max(p.sexo=="f"?1200:1500,Math.round(k/50)*50);const pr=o=="perder"?Math.min(1.6*pe,2*(p.meta||pe)):o=="ganhar"?1.8*pe:1.6*pe,f=p.fat||1.375;return{kcal:k,prot:Math.min(220,Math.round(pr/5)*5),agua:aguaRec(pe,id),passos:f<1.3?6000:f<1.5?7000:f<1.65?8000:10000,kat:f<1.3?250:f<1.5?350:f<1.65?450:550}}
function hasRecent(k){const f=k=="peso"?"peso":"cint";return Object.keys(S.log).some(d=>S.log[d][f]&&days(d,td())<=7&&days(d,td())>=0)}
/* Pendências: as do app saem dos dados da própria pessoa; as próprias ela mesma cria. [id, texto, feita, ação, própria] */
function pendList(){const r=[],p=S.p;if(!p.sexo||!p.nasc||!p.alt)r.push(["perfil","Completar o perfil (sexo, nascimento e altura)",0,"perfil"]);r.push(["dieta","Montar o programa alimentar",temPlano(),"dieta"]);r.push(["treino","Montar o programa de treino",!!S.tr.cfg,"treino"]);r.push(["peso","Pesar-se esta semana",hasRecent("peso"),"peso"]);r.push(["cint","Medir a cintura esta semana",hasRecent("cint"),"peso"]);r.push(["foto","Fotos de progresso (frente, lado e costas)",!!(S.fotos&&S.fotos.length),"foto"]);const u=ultBio();r.push(["bio",u?"Repetir a bioimpedância (a cada 4 a 6 semanas)":"Fazer uma bioimpedância",!!(u&&days(u.d,td())<=42),"bio"]);S.pend.forEach(x=>r.push([x.id,x.t,!!S.done[x.id],null,1]));return r}
const temPlano=()=>!!(S.dieta&&(S.dieta.legado||S.dieta.cfg));
function pick(a,i){const o=a.filter(x=>!S.bad[x[0]]);return(o.length?o:a)[i%(o.length||a.length)]}
/* Horários das refeições: os do plano da pessoa, os padrão ou, no cardápio original, os fixos dele. */
function refsAtual(){if(S.dieta&&S.dieta.legado&&!S.dieta.cfg)return[["Café","7h30–9h",8.5,"☀️"],["Lanche da manhã","10h–11h",10.5,"🍎"],["Almoço","12h30",12.5,"🍽️"],["Lanche da tarde","16h30",16.5,"🥪"],["Jantar","20h30",20.5,"🌙"]];return refsCfg().map(r=>[r.n,fh(r.h),hDec(r.h),r.e])}
function refsCfg(){const c=S.dieta&&S.dieta.cfg,on=c?c.refs:REFS.filter(r=>r[0]!="ceia").map(r=>({k:r[0],h:r[5]}));return REFS.filter(r=>on.some(o=>o.k==r[0])).map(r=>{const o=on.find(x=>x.k==r[0]);return{k:r[0],n:r[1],e:r[2],h:o.h||r[5],w:r[6],t:r[7]}})}
const hDec=h=>{const[a,b]=String(h).split(":").map(Number);return a+(b||0)/60},fh=h=>{const[a,b]=String(h).split(":").map(Number);return a+"h"+(b?String(b).padStart(2,"0"):"")};
function setRefs(){const r=refsAtual();NM=r.map(x=>x[0]);TH=r.map(x=>x[1]);HR=r.map(x=>x[2]);EMJ=r.map(x=>x[3])}
function dia(i){if(!S.dieta)return null;if(S.dieta.cfg)return gerarDia(i);if(!S.dieta.legado)return null;const c=pick(CAFE,i),l1=pick(L1,i),l2=pick(L2,i+1),pa=pick(PR,i),j=pick(JA,i+2),a=pick(CB,i);
const fx=c[2]+l1[2]+l2[2]+pa[2]+j[2]+162,f=Math.min(1.6,Math.max(.6,(S.p.kcal-fx)/a[3])),q=x=>Math.round(x[2]*f/5)*5;
const m=[[c[1],c[2],c[3]],[l1[1],l1[2],l1[3]],[`${pa[1]} + ${a[1]} ${q(a)} g + feijão 100 g + legumes e azeite 5 ml`,pa[2]+a[3]*f+162,pa[3]+a[4]*f+7],[l2[1],l2[2],l2[3]],[j[1],j[2],j[3]]];
return{m,K:m.reduce((s,x)=>s+x[1],0),P:m.reduce((s,x)=>s+x[2],0)}}
function grp(kf){const g={};Object.keys(S.log).sort().forEach(d=>{(g[kf(d)]=g[kf(d)]||[]).push(S.log[d])});return Object.keys(g).sort().map(k=>{const a=g[k],v=f=>a.map(x=>x[f]);return{k,peso:avg(v("peso")),cint:avg(v("cint")),pr:a.filter(x=>x.prot>=130).length,ag:avg(v("agua")),ps:avg(v("passos")),tr:a.filter(x=>x.treino).length,so:avg(v("sono")),az:Math.max(-1,...a.map(x=>x.azia??-1))}})}
const wk=d=>{const x=new Date(d+"T12:00:00");x.setDate(x.getDate()-(x.getDay()+6)%7);return x.toISOString().slice(0,10)};
function alertasL(){const g=grp(wk).filter(x=>x.peso!=null),r=[],ls=[];for(let i=1;i<g.length;i++)ls.push((g[i-1].peso-g[i].peso)/Math.max(1,days(g[i-1].k,g[i].k)/7));
if(ls.length>1&&ls.slice(-2).every(x=>x>1))r.push("Perda acima de 1 kg por semana há 2 semanas: considere subir 150 a 200 kcal e converse com o médico.");
if((S.p.obj||"perder")=="perder"&&ls.length>2&&ls.slice(-3).every(x=>x<.25))r.push("Perda abaixo de 0,25 kg por semana há 3 semanas: considere reduzir 100 a 150 kcal ou aumentar os passos.");
const ks=Object.keys(S.log).sort();if(ks.slice(-3).some(k=>S.log[k].azia>=2))r.push("Azia forte recente: prefira refeições menores e leve ao médico.");
const pr=ks.map(k=>S.log[k].prot).filter(x=>x!=null).slice(-2),lim=Math.round((S.p.prot||100)*.55);if(pr.length==2&&pr.every(x=>x<lim))r.push(`Proteína abaixo de ${lim} g por 2 dias seguidos${S.med?": fale com o médico antes da próxima aplicação":": reforce a proteína nas refeições"}.`);
return r}
function alertas(){const r=alertasL();return r.length?r.map(x=>`<p class="w">⚠ ${x}</p>`).join(""):`<p class="o">✅ Sem alertas pelos dados registrados.</p>`}
function quem(){const p=S.p,o={perder:"perder gordura preservando músculo",manter:"manter o peso e melhorar a composição corporal",ganhar:"ganhar massa muscular"}[p.obj||"perder"];return`${p.nome||"a pessoa"} (${idade(p.nasc)??"?"} anos${p.sexo?", "+(p.sexo=="f"?"mulher":"homem"):""}, ${p.alt||"?"} cm, ${f1(lastPeso(),1)} kg, meta ${p.meta||"?"} kg; objetivo: ${o}; metas: ${p.kcal} kcal e ${p.prot} g de proteína por dia, água ${f1(aguaMeta(),1)} L, ${passosMeta()} passos${S.med?"; usa "+S.med.nome+", com acompanhamento médico":""})`}
function evitaIA(){const c=S.dieta&&S.dieta.cfg,a=[...(c?(c.evita||[]).map(r=>(RESTR.find(x=>x[0]==r)||[0,r])[1]):[]),...Object.keys(S.bad).filter(k=>S.bad[k]).map(k=>{const f=FD(k)||ALL.find(x=>x[0]==k);return f?nomeC(f):k}),...(S.dieta&&S.dieta.nunca?[S.dieta.nunca]:[])];return a.length?" Restrições e alimentos que a pessoa evita: "+a.join("; ")+".":""}
async function perguntar(){const q=$("#q").value.trim();if(!q)return;const r=$("#rs");r.style.display="block";r.textContent="Pensando…";let sm;try{sm=window.claude?await claude.use("sample"):window.MC_IA}catch(e){}if(!sm){r.textContent="Este recurso não está disponível neste aparelho.";return}
const ks=Object.keys(S.log).sort().slice(-14),ctx=JSON.stringify({perfil:S.p,registros:ks.map(k=>({d:k,...S.log[k]}))});
try{const x=await sm("Você apoia "+quem()+", atuando como nutricionista, endocrinologista e personal trainer informativos. Responda em português, direto, em poucas linhas, com nível de confiança (Certeza/Provável/Chute). Nunca indique ou ajuste dose de medicamento: encaminhe ao médico."+evitaIA()+" Dados: "+ctx+"\n\nPergunta: "+q,{cache:false,onText:t=>{r.textContent=t.text}});r.textContent=x.text}catch(e){r.textContent=e&&e.msg||"Não consegui responder agora. Tente de novo."}}
const FOOD=[["arroz","Arroz branco cozido",128,2.5,120],["feijao","Feijão cozido",76,4.8,100],["frango","Frango grelhado",159,32,130],["patinho","Patinho grelhado",219,35.9,130],["ovo","Ovo inteiro (1 un = 50 g)",143,13,50],["clara","Clara de ovo (1 un = 33 g)",52,11,33],["paosal","Pão de sal/francês (1 un = 50 g)",300,8,50],["paoint","Pão integral (1 fatia = 25 g)",253,9.4,50],["mussarela","Queijo mussarela (1 fatia = 20 g)",330,22.6,20],["minas","Queijo minas frescal",264,17.4,30],["presunto","Presunto (1 fatia = 15 g)",94,14.3,15],["cottage","Cottage",98,11,50],["iogurte","Iogurte natural desnatado",41,3.8,200],["whey","Whey (1 dose = 30 g)",400,80,30],["leite","Leite desnatado (ml)",35,3.4,200],["batdoce","Batata-doce cozida",77,0.6,150],["batata","Batata inglesa cozida",52,1.2,150],["macarrao","Macarrão cozido",102,3.4,150],["cuscuz","Cuscuz de milho",113,2.2,120],["aipim","Aipim cozido",125,0.6,100],["maca","Maçã (1 un = 130 g)",56,0.3,130],["pera","Pera (1 un = 130 g)",53,0.6,130],["melancia","Melancia",33,0.9,200],["uva","Uva",53,0.7,100],["melao","Melão",29,0.7,200],["salada","Salada de folhas e tomate",13,1.2,100],["legumes","Legumes cozidos",35,1.5,100],["azeite","Azeite (1 colher = 8 ml)",884,0,8],["coca0","Coca-Cola Zero (ml)",0,0,350],["cafe","Café sem açúcar (ml)",4,0.2,100]];
