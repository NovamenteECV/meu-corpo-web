/* Meu Corpo · lixeira com "Desfazer", letra maior e contraste, aviso do fim do descanso (APK), jejum,
   refeições favoritas e tamanho do copo.
   Arquivos carregados em ordem pelo index.html (scripts comuns, escopo global compartilhado).
   Criado e desenvolvido por VALLEN TECNOLOGIA */

/* ---------- Lixeira: o que é apagado fica 30 dias em S.lixo e dá para desfazer na hora ---------- */
const LIXO_T={
  treino:["Treino",x=>`${fd(x.d)} · ${TN[x.key]||x.key||""}`,x=>{S.tr.ses.push(x);S.tr.ses.sort((a,b)=>a.d<b.d?-1:1)}],
  cardio:["Cardio",x=>`${fd(x.d||"")} · ${x.tipo||""}`,x=>{S.tr.cardio.push(x);S.tr.cardio.sort((a,b)=>(a.d||"")<(b.d||"")?-1:1)}],
  exame:["Exame",x=>x.r[0],x=>{if(!S.ex.r.some(r=>r[0]==x.r[0]))S.ex.r.push(x.r);if(x.h)S.exh[x.r[0]]=x.h}],
  bio:["Bioimpedância",x=>fd(x.d),x=>{S.bios.push(x)}],
  pend:["Pendência",x=>x.t,x=>{if(!S.pend.some(p=>p.id==x.id))S.pend.push(x)}],
  comida:["Comida",x=>`${fd(x.d)} · ${((FOOD.find(f=>f[0]==x.e[0])||[0,x.e[0]])[1])} ${x.e[1]} g`,x=>{(S.food[x.d]=S.food[x.d]||[]).push(x.e)}]
};
function lixo(tipo,dado){if(dado==null||!LIXO_T[tipo])return;const id=Date.now().toString(36)+Math.random().toString(36).slice(2,6);S.lixo=(S.lixo||[]).filter(x=>days(String(x.em).slice(0,10),td())<=30);S.lixo.push({id,em:new Date().toISOString(),tipo,dado:JSON.parse(JSON.stringify(dado))});toastAcao(`${LIXO_T[tipo][0]} apagado`,"Desfazer",()=>lixoVolta(id))}
function lixoVolta(id){const L=S.lixo||[],i=L.findIndex(x=>x.id==id);if(i<0)return;const x=L.splice(i,1)[0];try{LIXO_T[x.tipo][2](x.dado);if(x.tipo=="comida")sumAte()}catch(e){}sv();draw(1);toast("↩️ Restaurado")}
function lixeiraV(){const L=(S.lixo||[]).filter(x=>days(String(x.em).slice(0,10),td())<=30&&LIXO_T[x.tipo]).slice().reverse();return`<div class="c"><h2>🗑️ Lixeira</h2><p class="m" style="margin-top:0">O que você apaga (treinos, cardio, exames, bioimpedância, pendências e comida) fica aqui por 30 dias.</p>${L.length?L.map(x=>`<div class="er"><div><b>${LIXO_T[x.tipo][0]}</b><small>${esc(LIXO_T[x.tipo][1](x.dado))} · apagado em ${new Date(x.em).toLocaleDateString("pt-BR")}</small></div><button class="sm" data-mclixo="${x.id}" style="flex:0 0 auto">Restaurar</button></div>`).join(""):`<p class="m">Vazia.</p>`}</div>`}
function toastAcao(msg,rot,fn){let el=document.getElementById("mcta");if(el)el.remove();el=document.createElement("div");el.id="mcta";el.className="mcta";el.innerHTML=`<span>${esc(msg)}</span><button>${esc(rot)}</button>`;document.body.appendChild(el);el.querySelector("button").onclick=()=>{el.remove();fn()};setTimeout(()=>{if(el.isConnected)el.remove()},7000)}

/* ---------- Letra maior e contraste (S.a11y, vale em todos os aparelhos da conta) ---------- */
function aplicarA11y(){const r=document.documentElement,a=S.a11y||{};if(a.letra&&a.letra!="n")r.dataset.letra=a.letra;else delete r.dataset.letra;if(a.contraste)r.dataset.contraste="1";else delete r.dataset.contraste}
function a11yV(){const a=S.a11y||{},c=S.p.copo||.25;return`<label style="margin-top:14px">Tamanho da letra</label><div class="tg">${[["n","Normal"],["g","Grande"],["gg","Maior"]].map(o=>`<button class="${(a.letra||"n")==o[0]?"on":""}" data-mcletra="${o[0]}">${o[1]}</button>`).join("")}</div><div class="lv"><span><b>Mais contraste</b><small>Textos e bordas mais escuros</small></span><button class="sw ${a.contraste?"on":""}" data-mccontr="1" aria-label="Mais contraste"><i></i></button></div><label style="margin-top:14px">Tamanho do copo</label><div class="tg">${[[.2,"200 ml"],[.25,"250 ml"],[.3,"300 ml"],[.35,"350 ml"],[.5,"500 ml"]].map(o=>`<button class="${Math.abs(c-o[0])<.001?"on":""}" data-mccopo="${o[0]}">${o[1]}</button>`).join("")}</div><small>O botão "+ copo" do Início, o atalho do ícone e o widget somam esse tamanho.</small>`}
const copoTxt=()=>{const c=S.p.copo||.25;return c>=1?f1(c,1)+" L":Math.round(c*1000)+" ml"};

/* ---------- Aviso do fim do descanso com o app fechado (APK, notificação local) ---------- */
let RNOT=false;
async function restNotif(fim){if(!NATIVE)return;const N=CP("LocalNotifications");if(!N)return;try{if(!RNOT){const p=await N.checkPermissions();if(p.display!=="granted")await N.requestPermissions()}await N.cancel({notifications:[{id:9001}]}).catch(()=>{});if(fim-Date.now()<5000)return;await N.schedule({notifications:[{id:9001,title:"⏱️ Descanso terminou",body:"Hora da próxima série.",schedule:{at:new Date(fim),allowWhileIdle:true}}]});RNOT=true}catch(e){}}
function restCancela(){if(!RNOT)return;RNOT=false;try{const N=CP("LocalNotifications");if(N)N.cancel({notifications:[{id:9001}]}).catch(()=>{})}catch(e){}}

/* ---------- Jejum intermitente (S.jejum: {ini, meta em horas, h: histórico}) ---------- */
const JMETAS=[12,14,16,18];
function jejumHoras(){const j=S.jejum;return j&&j.ini?(Date.now()-new Date(j.ini))/36e5:0}
function jejumCard(compacto){const j=S.jejum||{},meta=j.meta||16;if(compacto&&!j.ini)return"";
if(j.ini){const h=jejumHoras(),pct=Math.min(100,h/meta*100),fim=new Date(new Date(j.ini).getTime()+meta*36e5);return`<div class="c"><div class="r sp"><div><small>⏳ Jejum de ${meta} h</small><b id="mcjej">${fhm(h)}</b><span class="m">${h>=meta?"Meta cumprida! Pode quebrar o jejum quando quiser.":"Termina às "+fim.toTimeString().slice(0,5)+(fim.toDateString()!=new Date().toDateString()?" de amanhã":"")}</span></div><button class="p sm" data-mcjej="fim" style="flex:0 0 auto">Terminar</button></div><div class="dbar"><i style="width:${pct}%"></i></div></div>`}
const H=(j.h||[]).slice(-5).reverse();return`<div class="c"><div class="r sp"><div><small>⏳ Jejum intermitente</small><b>Começar agora</b></div><button class="p sm" data-mcjej="ini" style="flex:0 0 auto">Começar</button></div><div class="tg" style="margin:10px 0 0">${JMETAS.map(m=>`<button class="${meta==m?"on":""}" data-mcjejm="${m}">${m} h</button>`).join("")}</div>${H.length?H.map(x=>`<div class="er"><span>${fd(String(x.i).slice(0,10))}</span><b class="${x.hr>=(x.m||16)?"o":""}">${fhm(x.hr)}</b></div>`).join(""):""}<small>Só se o médico ou o nutricionista concordarem. Quem usa medicação para diabetes deve falar com o médico antes.</small></div>`}
async function jejumNotif(){if(!NATIVE)return;const N=CP("LocalNotifications");if(!N)return;try{await N.cancel({notifications:[{id:9002}]}).catch(()=>{});const j=S.jejum;if(!j||!j.ini)return;const fim=new Date(new Date(j.ini).getTime()+(j.meta||16)*36e5);if(fim>new Date())await N.schedule({notifications:[{id:9002,title:"⏳ Jejum concluído",body:`Você completou ${j.meta||16} h de jejum.`,schedule:{at:fim,allowWhileIdle:true}}]})}catch(e){}}
setInterval(()=>{const el=document.getElementById("mcjej");if(el)el.textContent=fhm(jejumHoras())},30000);

/* ---------- Refeições favoritas (S.fav: [{id, n, it:[[alimento, g]]}]) ---------- */
function favLista(m){const F=S.fav||[],hoje=(S.food[dt]||[]).filter(e=>e[2]==m);return`${F.length?`<h3 class="sec" style="margin-top:12px">⭐ Favoritas</h3>${F.map(f=>`<div class="fr" data-mcfav="${f.id}"><div>${esc(f.n)}<small>${f.it.map(([id,g])=>esc(((FOOD.find(x=>x[0]==id)||[0,id])[1]).replace(/ \(.*\)/,""))+" "+g+" g").join(" + ")} · ${Math.round(f.it.reduce((a,[id,g])=>{const x=FOOD.find(z=>z[0]==id);return a+(x?x[2]*g/100:0)},0))} kcal</small></div><button class="ib" data-mcfavdel="${f.id}" aria-label="Apagar favorita" style="width:32px;min-height:32px;flex:0 0 32px">${I("x",14)}</button><span class="addc">${I("plus",18)}</span></div>`).join("")}`:""}${hoje.length?`<div class="r" style="margin-top:10px"><input id="favNome" maxlength="40" placeholder="Nome (ex.: Meu café de sempre)"><button class="sm" data-mcfavsv="${m}" style="flex:0 0 auto">⭐ Salvar</button></div><small>Salva o que você já registrou nesta refeição hoje para adicionar de uma vez nos próximos dias.</small>`:""}`}

/* ---------- Eventos ---------- */
document.addEventListener("click",e=>{const t=e.target.closest("[data-mclixo],[data-mcletra],[data-mccontr],[data-mccopo],[data-mcjej],[data-mcjejm],[data-mcfav],[data-mcfavsv],[data-mcfavdel]");if(!t)return;const D=t.dataset;
if(D.mclixo){lixoVolta(D.mclixo);return}
if(D.mcletra){S.a11y=S.a11y||{};S.a11y.letra=D.mcletra;sv();aplicarA11y();draw(1);return}
if(D.mccontr){S.a11y=S.a11y||{};S.a11y.contraste=S.a11y.contraste?0:1;sv();aplicarA11y();draw(1);return}
if(D.mccopo){S.p.copo=+D.mccopo;sv();draw(1);return}
if(D.mcjejm){S.jejum=S.jejum||{};S.jejum.meta=+D.mcjejm;sv();draw(1);return}
if(D.mcjej=="ini"){S.jejum=S.jejum||{};S.jejum.ini=new Date().toISOString();sv();jejumNotif();draw(1);toast("⏳ Jejum começou");return}
if(D.mcjej=="fim"){const j=S.jejum,hr=jejumHoras();(j.h=j.h||[]).push({i:j.ini,f:new Date().toISOString(),hr:Math.round(hr*100)/100,m:j.meta||16});j.h=j.h.slice(-60);j.ini=null;sv();jejumNotif();draw(1);toast(`Jejum de ${fhm(hr)}`);return}
if(D.mcfavdel){S.fav=(S.fav||[]).filter(x=>x.id!=D.mcfavdel);sv();renderSheet();return}
if(D.mcfav){const f=(S.fav||[]).find(x=>x.id==D.mcfav);if(!f||!SH)return;const m=+SH.k.split(":")[1];f.it.forEach(([id,g])=>(S.food[dt]=S.food[dt]||[]).push([id,g,m]));sumAte();sv();closeSheet();draw(1);toast("⭐ "+f.n+" adicionada");return}
if(D.mcfavsv!=null){const m=+D.mcfavsv,n=(document.getElementById("favNome").value||"").replace(/[<>]/g,"").trim().slice(0,40),it=(S.food[dt]||[]).filter(e=>e[2]==m).map(e=>[e[0],e[1]]);if(!n){toast("Dê um nome à favorita.");return}if(!it.length)return;S.fav=(S.fav||[]).filter(x=>x.n!=n);S.fav.push({id:Date.now().toString(36),n,it});sv();renderSheet();toast("⭐ Favorita salva");return}});
