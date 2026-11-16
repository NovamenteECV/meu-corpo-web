/* Meu Corpo · núcleo: draw, eventos, relatório, versão mínima, aviso e início
   Arquivos carregados em ordem pelo index.html (scripts comuns, escopo global compartilhado).
   Criado e desenvolvido por VALLEN TECNOLOGIA */
// ---------- NÚCLEO ----------
function aplicarTema(){const r=document.documentElement;if(S.tema)r.dataset.theme=S.tema;else delete r.dataset.theme;try{aplicarA11y()}catch(e){}}
function draw(keep){aplicarTema();if(!S.p.nome){$("#nv").innerHTML="";$("#v").innerHTML=`<div style="min-height:80vh;display:grid;place-items:center;color:var(--mu)">Carregando…</div>`;return}setRefs();if(!S.tr.cfg&&isSF())S.tr.cfg={loc:"acad",eq:[...LOC[0][2]],dias:[0,1,2,3,4,5],dur:60,exp:"ini",lim:[]};document.body.dataset.tab=tab;nav();const V={inicio:vInicio,diario:vDiario,treino:vTreino,evo:vEvo,mais:vMais};$("#v").innerHTML=(V[tab]||vInicio)();if(!keep)window.scrollTo(0,0);if(tab=="inicio")requestAnimationFrame(animRings);else RGPREV=null}
const LG=()=>S.log[dt]=S.log[dt]||{};
const clean=L=>{if(!Object.keys(L).length)delete S.log[dt]};
document.addEventListener("input",e=>{const t=e.target;if((t.id=="kmi"||t.id=="kkm")&&$("#kpace")){const p=pace(num($("#kmi").value),num($("#kkm").value));$("#kpace").textContent=p?"Ritmo: "+p:""}if((t.id=="hkin"||t.id=="stx")&&/MC\s*;/i.test(t.value)){const m=impSaude(t.value);t.value="";t.blur();draw(1);toast(m);return}if(t.id=="fsearch"&&SH){SH.q=t.value;$("#flist").innerHTML=flist()}if(t.id=="sgr"&&SH&&SH.sel){const f=FOOD.find(x=>x[0]==SH.sel),g=num(t.value)||0;$("#skc").textContent=Math.round(f[2]*g/100);$("#spr").textContent=f1(f[3]*g/100)}});
document.addEventListener("change",e=>{const t=e.target,k=t.dataset.k;if(k){const L=LG(),x=k=="nota"?t.value:num(t.value);if(x===undefined||x===""||(typeof x=="number"&&isNaN(x)))delete L[k];else L[k]=x;clean(L);sv();if(!SH)draw(1);return}if(t.dataset.p){const k=t.dataset.p,v=num(t.value);if(v>0)S.p[k]=v;else if(["agua","passos","kat","meta"].includes(k))delete S.p[k];sv();draw(1);return}
if(t.dataset.pt){const k=t.dataset.pt,v=t.value.trim();if(k=="nome"&&v.split(/\s+/).length<2){toast("Informe o nome completo (nome e sobrenome).");t.value=S.p.nome||"";return}if(v)S.p[k]=v;sv();draw(1);return}
if(t.dataset.pm&&S.med){S.med[t.dataset.pm]=t.value.trim();sv();return}
if(t.dataset.dh&&DT){const r=DT.refs.find(x=>x.k==t.dataset.dh);if(r)r.h=t.value;return}
if(t.dataset.thora&&TD){TD.hora=t.value;return}
if(t.dataset.lh){S.lh=S.lh||{};S.lh[t.dataset.lh]=t.dataset.lh=="pdia"?+t.value:t.value;sv();draw(1);lembAgendar();return}if(t.id=="fin"&&t.files&&t.files[0]){foto(t.files[0]);return}if(t.dataset.xph&&t.files&&t.files[0]){upPh(t.dataset.xph,t.files[0]);return}if(t.dataset.ts){trInput(t);if(SH&&SH.k=="ex")renderSheet();return}
if(t.dataset.xkg!=null&&S.tr.cur){const v=num(t.value)??null;S.tr.cur.ex[+t.dataset.xkg].sets.forEach(s=>{if(!s.done)s.kg=v});sv();draw(1);renderSheet();return}
if(t.dataset.xnote){S.tr.nt=S.tr.nt||{};const v=t.value.trim();if(v)S.tr.nt[t.dataset.xnote]=v;else delete S.tr.nt[t.dataset.xnote];sv();return}});
document.addEventListener("click",e=>{const t=e.target.closest("button,.tap,.li,.ch,.fr,.sbg");if(!t)return;const D=t.dataset||{};
if(D.close){closeSheet();if(tab!="treino")draw(1);return}
if(D.gosub){tab="mais";sub=D.gosub;draw();return}
if(D.go){tab=D.go;sub=null;draw();return}
if(D.sub){sub=D.sub;draw();return}
if(D.back){sub=null;draw();return}
if(D.sheet){openSheet(D.sheet);return}
if(D.tprog){S.tr.prog=D.tprog;sv();draw(1);return}
if(t.id=="hksync"){toast("Lendo o Saúde…");hkSync(1);return}if(t.id=="hkdiag"){hkDiag();return}if(t.id=="hkdperm"||t.id=="hkdabre"||t.id=="hkdcop"){hkDiagAcao(t.id);return}
if(D.lemb){S.lemb=S.lemb||{};S.lemb[D.lemb]=!S.lemb[D.lemb];sv();draw(1);lembAgendar();return}
if(D.tsel){TSEL=D.tsel;draw(1);return}
if(D.xo!=null&&S.tr.cur){openSheet("ex");SH.i=+D.xo;renderSheet();return}
if(D.trest!=null&&S.tr.cur){const x=S.tr.cur.ex[+D.trest];rest(presc(EXF(x.id),fase(),S.tr.cur.leve).rest);return}
if(D.xall!=null&&S.tr.cur){const x=S.tr.cur.ex[+D.xall],pr=presc(EXF(x.id),fase(),S.tr.cur.leve),all=x.sets.every(s=>s.done);x.sets.forEach(s=>{s.done=all?0:1;if(!all&&s.r==null)s.r=pr.lo});sv();draw(1);if(!all&&+D.xall<S.tr.cur.ex.length-1)rest(pr.rest);return}
if(D.xsw&&S.tr.cur){const[i,id]=D.xsw.split(":"),c=S.tr.cur,x=c.ex[+i];S.tr.sw[x.sk]=id;c.ex[+i]=mkEx(EXF(id),x.sk,fase(),c.leve);sv();draw(1);renderSheet();return}
if(D.tfin&&S.tr.cur&&!S.tr.cur.ex.some(x=>x.sets.some(s=>s.done))){openSheet("skip");SH.fp=1;renderSheet();return}
if(D.skm&&SH){SH.mode=D.skm;renderSheet();return}
if(D.skundo){if(S.tr.day)delete S.tr.day[td()];sv();draw(1);return}
if(t.id=="sksv"&&SH){const md=SH.mode=="Outro"?"Cardio":SH.mode,mi=num($("#kmi").value),km=num($("#kkm").value),fc=num($("#kfc").value),kc=num($("#kca").value);if(!mi||mi<=0){alert("Informe o tempo em minutos.");return}S.tr.cardio.push({d:td(),tipo:SH.mode=="Outro"?"Outro":SH.mode,min:Math.round(mi),km:km||null,fc:fc?Math.round(fc):null,kcal:kc?Math.round(kc):null});if(S.tr.day)delete S.tr.day[td()];if(SH.fp){S.tr.cur=null;RT=null}closeSheet();sv();tab="treino";draw();toast(`✅ ${md} ${md=="Cardio"?"salvo":"salva"}${km?` · ${pace(mi,km)}`:""}`);return}
if(t.id=="skrest"&&SH){S.tr.day=S.tr.day||{};S.tr.day[td()]="descanso";if(SH.fp){S.tr.cur=null;RT=null}closeSheet();sv();tab="treino";draw();toast("😴 Descanso registrado");return}
if(t.id=="cfy"&&SH&&SH.fn){const f=SH.fn;closeSheet();f();return}
if(D.tcan){ask("Descartar este treino sem salvar?","Descartar treino",()=>{S.tr.cur=null;RT=null;sv();tab="treino";draw()});return}
if(D.tdel!=null){const ix=+D.tdel;ask("Apagar este treino do histórico?","Apagar",()=>{lixo("treino",S.tr.ses.splice(ix,1)[0]);sv();draw(1)});return}
if(D.trst){ask("Recomeçar o bloco de 8 semanas a partir da semana 1?","Recomeçar",()=>{S.tr.start=td();sv();tv="hoje";TD=null;draw()});return}
if(D.tstart){tab="treino";TSEL=null}
if(trClick(t,D)){if(D.tcan&&!S.tr.cur)closeSheet();else if(SH&&SH.k=="ex")renderSheet();return}
if(D.day){const d=new Date(dt+"T12:00:00");d.setDate(d.getDate()+ +D.day);dt=d.toISOString().slice(0,10);draw(1);return}
if(D.dsub){dsub=D.dsub;draw(1);return}
if(D.esub){esub=D.esub;draw(1);return}
if(D.agua){const L=LG();L.agua=Math.max(0,Math.round(((L.agua||0)+ +D.agua)*100)/100);if(!L.agua)delete L.agua;clean(L);sv();draw(1);return}
if(D.cup){const L=LG(),v=+D.cup*.25;L.agua=Math.abs((L.agua||0)-v)<.01?v-.25:v;if(!L.agua)delete L.agua;clean(L);sv();draw(1);return}
if(D.ate!=null){const a=S.ate[dt]=S.ate[dt]||{};a[D.ate]=!a[D.ate];sumAte();sv();draw(1);return}
if(D.fsel!=null&&SH){SH.sel=D.fsel||null;SH.mul=1;renderSheet();return}
if(D.mul&&SH){SH.mul=+D.mul;renderSheet();return}
if(D.fx!=null){const e0=(S.food[dt]||[]).splice(+D.fx,1)[0];if(e0)lixo("comida",{d:dt,e:e0});if(S.food[dt]&&!S.food[dt].length)delete S.food[dt];sumAte();sv();draw(1);return}
if(D.s){const[k,v]=D.s.split(":"),L=LG(),x=v=="true"?true:+v;if(L[k]===x)delete L[k];else L[k]=x;clean(L);sv();if(SH)renderSheet();else draw(1);return}
if(D.d){const x=pendList().find(y=>y[0]==D.d);if(!x)return;if(x[4]){S.done[x[0]]=!S.done[x[0]];sv();draw(1);return}const a=x[3];if(a=="treino"){tab="treino";draw()}else if(a=="dieta"){tab="diario";dsub="plano";draw()}else if(a=="perfil"){tab="mais";sub="perfil";draw()}else if(a=="peso")openSheet("peso");else if(a=="foto"){tab="evo";esub="fotos";draw()}else if(a=="bio"){tab="evo";esub="corpo";draw()}return}
if(D.pdel){const id=D.pdel;lixo("pend",S.pend.find(x=>x.id==id));S.pend=S.pend.filter(x=>x.id!=id);delete S.done[id];sv();draw(1);return}
if(t.id=="padd"){const v=$("#pnew").value.trim();if(!v){toast("Escreva a pendência.");return}S.pend.push({id:"p"+Date.now().toString(36),t:v});PDO=true;sv();draw(1);return}
if(D.dplano){tab="diario";dsub="plano";sub=null;draw();return}
if(D.dm&&DT){const k=D.dm;if(DT.refs.some(r=>r.k==k))DT.refs=DT.refs.filter(r=>r.k!=k);else DT.refs.push({k,h:REFS.find(x=>x[0]==k)[5]});draw(1);return}
if(D.dg&&DT){const[c,id]=D.dg.split(":");if(!foodOk(id,DT.evita)){toast("Esse alimento está fora pelas suas restrições.");return}const a=DT.gosta[c]||[];DT.gosta[c]=a.includes(id)?a.filter(x=>x!=id):[...a,id];t.classList.toggle("on");return}
if(D.dr&&DT){DT.evita=DT.evita.includes(D.dr)?DT.evita.filter(x=>x!=D.dr):[...DT.evita,D.dr];draw(1);return}
if(D.dsave&&DT){dietaSalvar();return}
if(D.psx){S.p.sexo=D.psx;sv();draw(1);return}
if(D.pobj){S.p.obj=D.pobj;sv();draw(1);return}
if(D.precalc){const m=metasPadrao(S.p,lastPeso());Object.assign(S.p,{kcal:m.kcal,prot:m.prot,passos:m.passos,kat:m.kat});delete S.p.agua;sv();draw(1);toast("✅ Metas recalculadas");return}
if(D.pmed){if(S.med)ask("Parar de acompanhar a medicação? As doses já registradas continuam no histórico.","Parar",()=>{delete S.med;sv();draw(1)});else{S.med={nome:"",un:"mg"};sv();draw(1)}return}
if(D.trava){if(window.MC_TRAVA)MC_TRAVA.alternar();return}
if(D.tema){S.tema=D.tema=="auto"?"":D.tema;sv();draw(1);return}
if(D.lhc){S.lh=S.lh||{};S.lh.acada=+D.lhc;sv();draw(1);lembAgendar();return}
if(D.lht){S.lh=S.lh||{};S.lh.tantes=+D.lht;sv();draw(1);lembAgendar();return}
if(D.efx){t.classList.toggle("on");return}
if(D.exdel!=null){const ix=+D.exdel;ask("Apagar este exame e o histórico dele?","Apagar",()=>{const x=S.ex.r.splice(ix,1)[0];if(x){lixo("exame",{r:x,h:S.exh[x[0]]||null});delete S.exh[x[0]]}sv();draw(1)});return}
if(D.bdel!=null){const ix=+D.bdel;ask("Apagar esta medição de bioimpedância?","Apagar",()=>{lixo("bio",S.bios.splice(ix,1)[0]);sv();draw(1)});return}
if(D.w){dd=+D.w;draw(1);return}
if(D.f){S.p.fat=+D.f;sv();draw(1);return}
if(D.b){S.bad[D.b]=!S.bad[D.b];sv();t.classList.toggle("x");return}
if(t.id=="ssv"){const L=LG(),p=num($("#spe").value),c=num($("#sci").value);if(p)L.peso=p;else delete L.peso;if(c)L.cint=c;else delete L.cint;clean(L);sv();closeSheet();draw(1);return}
if(t.id=="sfa"&&SH){const g=num($("#sgr").value),m=+SH.k.split(":")[1];if(!g||g<=0){alert("Informe a quantidade.");return}(S.food[dt]=S.food[dt]||[]).push([SH.sel,g,m]);sumAte();sv();closeSheet();draw(1);return}
if(t.id=="esv"){const n=$("#en").value.trim(),v=$("#ev").value.trim(),d=$("#ed").value,rf=$("#er").value.trim(),fx=$("#efx").classList.contains("on");if(!n||!v||!d){alert("Preencha exame, resultado e data.");return}const R=S.ex.r,i=R.findIndex(x=>nrm(x[0])==nrm(n));if(i>=0){(S.exh[R[i][0]]=S.exh[R[i][0]]||[]).push([d,v]);if(rf)R[i][2]=rf;R[i][3]=fx?1:0}else{R.push([n,v,rf,fx?1:0,"Em "+fd(d)]);S.ex.d=fd(d)}sv();draw(1);toast("✅ Exame salvo");return}
if(t.id=="bsv"){const g=id=>num($("#"+id).value),d=$("#bd").value,x={d,peso:g("bpe"),gk:g("bgk"),gp:g("bgp"),mus:g("bmu"),mm:g("bmm"),agua:g("bag"),vis:g("bvi"),rcq:g("brc"),tmb:g("btm"),idm:g("bim"),ptn:g("bpt"),min:g("bmi")};if(!d||!(x.peso>0)){alert("Preencha pelo menos data e peso.");return}if(x.gk!=null&&x.gp==null)x.gp=Math.round(x.gk/x.peso*1000)/10;if(x.gp!=null&&x.gk==null)x.gk=Math.round(x.peso*x.gp)/100;Object.keys(x).forEach(k=>{if(x[k]==null||Number.isNaN(x[k]))delete x[k]});S.bios.push(x);sv();draw(1);toast("✅ Bioimpedância salva");return}
if(t.id=="scp"){(navigator.clipboard&&navigator.clipboard.readText?navigator.clipboard.readText():Promise.reject()).then(x=>{const m=impSaude(x);draw(1);$("#sst").textContent=m}).catch(()=>{$("#sst").textContent="O navegador não deixou ler a área de transferência. Toque e segure na caixa acima, escolha Colar e toque em Importar texto."});return}
if(t.id=="scp2"){(navigator.clipboard&&navigator.clipboard.readText?navigator.clipboard.readText():Promise.reject()).then(x=>{const m=impSaude(x);draw(1);toast(m)}).catch(()=>{tab="mais";sub="saude";draw();$("#sst").textContent="O iPhone não deixou o app ler a área de transferência. Toque e segure na caixa acima, escolha Colar e toque em Importar texto."});return}
if(t.id=="simp"){const m=impSaude($("#stx").value);draw(1);$("#sst").textContent=m;return}
if(t.id=="aib"){semana();return}
if(t.id=="go"){perguntar();return}
if(t.id=="rdl"){const html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório Meu Corpo</title><style>body{font:14px Arial,sans-serif;max-width:760px;margin:20px auto;padding:0 12px;color:#111}table{border-collapse:collapse;width:100%;margin-bottom:8px}td,th{border:1px solid #ccc;padding:4px 6px;text-align:left}h3{margin:16px 0 6px}</style></head><body>${relBody()}</body></html>`;const nome="relatorio-meu-corpo-"+td()+".html";if(window.claude){claude.use("downloads").then(d=>{if(d)d.save({filename:nome,data:html}).catch(()=>{});else alert("Download indisponível neste aparelho.")}).catch(()=>alert("Download indisponível neste aparelho."));return}baixar(nome,html,"text/html");return}
if(t.id=="im"){try{S=JSON.parse($("#bk").value);norm();sv();draw()}catch(x){alert("Texto inválido.")}return}
if(t.id=="ex"){(window.claude?claude.use("downloads"):Promise.reject()).then(d=>{if(d)d.save({filename:"meu-corpo-backup.json",data:JSON.stringify(S)}).catch(()=>{});else alert("Copie o texto da caixa abaixo.")}).catch(()=>alert("Copie o texto da caixa abaixo."));return}});
/* Relatório fora do Claude: compartilha o arquivo (celular) ou baixa (navegador). */
async function baixar(nome,txt,tipo){try{const f=new File([txt],nome,{type:tipo});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:"Relatório Meu Corpo"});return}}catch(e){if(e&&e.name=="AbortError")return}try{const u=URL.createObjectURL(new Blob([txt],{type:tipo})),a=document.createElement("a");a.href=u;a.download=nome;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);toast("Relatório baixado")}catch(e){toast("Não consegui baixar o relatório neste aparelho.")}}
/* Versão mínima: o site publica versao.json. Se este app for mais antigo, bloqueia e pede para atualizar. */
const VURL="https://novamenteecv.github.io/meu-corpo-web/versao.json";let VCHK=0;
/* Versão mínima e aviso: versao.json do site + meucorpo_config do Supabase (editado pela Gestão, lido por window.MC_CFG do nuvem.js). Vale o maior "min". */
async function checaVersao(){if(Date.now()-VCHK<3e5)return;VCHK=Date.now();let v=null,c=null;try{const r=await fetch(VURL+"?t="+Date.now(),{cache:"no-store"});if(r.ok)v=await r.json()}catch(e){}try{c=window.MC_CFG?await MC_CFG():null}catch(e){}if(c){v=v||{};if(+c.min>(+v.min||0)){v.min=+c.min;if(c.msg)v.msg=c.msg}if(c.apk)v.apk=c.apk}try{await avisoEscolher(c)}catch(e){}if(!v)return;if(+v.min>APP_VER)bloqueiaVersao(v);else try{sessionStorage.removeItem("mc_vrl")}catch(e){}}
/* avisos: o geral da meucorpo_config (Gestão, "agora") e os da meucorpo_avisos (agendados ou para esta pessoa, window.MC_AVISOS do nuvem.js). Mostra o primeiro que ainda não teve "Entendi". */
const avisosVistos=()=>{try{return(localStorage.getItem("mc_aviso_ok")||"").split(",").filter(Boolean)}catch(e){return[]}};
async function avisoEscolher(c){const L=[];if(c&&c.aviso_texto&&c.aviso_id)L.push(c);try{const t=window.MC_AVISOS?await MC_AVISOS():[];(t||[]).forEach(a=>L.push({aviso_id:"t"+a.id,aviso_texto:a.texto,aviso_titulo:a.titulo,aviso_tipo:a.tipo,aviso_ate:a.ate}))}catch(e){}const vis=avisosVistos();mostraAviso(L.find(a=>!vis.includes(String(a.aviso_id))&&!(a.aviso_ate&&new Date(a.aviso_ate)<new Date()))||null)}
function mostraAviso(c){let el=document.getElementById("mcav");const vale=c&&c.aviso_texto&&c.aviso_id&&!(c.aviso_ate&&new Date(c.aviso_ate)<new Date());if(!vale||avisosVistos().includes(String(c.aviso_id))){if(el)el.remove();return}if(!el){el=document.createElement("div");el.id="mcav";document.body.appendChild(el)}el.className="mcav"+(c.aviso_tipo=="alerta"?" al":"");el.setAttribute("role","status");el.innerHTML=`<div>${c.aviso_titulo?`<b>${esc(c.aviso_titulo)}</b>`:""}<p>${esc(c.aviso_texto)}</p></div><button class="sm" id="mcavok">Entendi</button>`;el.querySelector("#mcavok").onclick=()=>{try{localStorage.setItem("mc_aviso_ok",avisosVistos().concat(String(c.aviso_id)).slice(-30).join(","))}catch(e){}el.remove();VCHK=0;checaVersao()}}
function bloqueiaVersao(v){if(!NATIVE){try{if(!sessionStorage.getItem("mc_vrl")){sessionStorage.setItem("mc_vrl","1");location.reload();return}}catch(e){}}let el=document.getElementById("mcver");if(!el){el=document.createElement("div");el.id="mcver";document.body.appendChild(el)}el.style.cssText="position:fixed;inset:0;z-index:300;background:linear-gradient(160deg,#0f766e,#134e4a);display:grid;place-items:center;padding:24px";el.innerHTML=`<div style="background:#fff;color:#0f172a;border-radius:22px;padding:26px 22px;max-width:380px;width:100%;text-align:center"><div style="font-size:44px">⬆️</div><h2 style="color:#0f766e;font-size:22px;margin:6px 0">Existe uma nova versão</h2><p style="color:#64748b;margin:0 0 16px">${esc(v.msg||(NATIVE?"Esta versão do Meu Corpo não é mais aceita. Instale a versão nova para continuar; seus dados estão salvos na sua conta.":"Feche o app e abra de novo para carregar a versão nova."))}</p>${NATIVE&&v.apk?`<a href="${esc(v.apk)}" target="_blank" rel="noopener" style="display:block;background:#0d9488;color:#fff;border-radius:12px;padding:14px;font-weight:700;text-decoration:none">Baixar a versão nova</a>`:""}${NATIVE?"":`<button onclick="location.reload()" style="width:100%;background:#0d9488;color:#fff;border:0;border-radius:12px;padding:14px;font-weight:700">Recarregar</button>`}</div>`}
document.addEventListener("visibilitychange",()=>{if(!document.hidden)checaVersao()});
document.addEventListener("toggle",e=>{if(e.target.id=="pdet")PDO=e.target.open},true);
try{if(/saude/i.test(location.hash+location.search)){tab="mais";sub="saude"}}catch(e){}
window.alert=m=>toast(String(m));
checaVersao();draw();if(NATIVE){nload().then(()=>{window.NLOADED=1;hkSync(0)});try{CP("App").addListener("appStateChange",s=>{if(s.isActive)hkSync(0)})}catch(e){}}else sinc();

