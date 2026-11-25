/* Vallen Fitness · alimentos: alimentos da própria pessoa (S.alim), leitor de código de barras e lista de compras.
   Arquivos carregados em ordem pelo index.html (scripts comuns, escopo global compartilhado).
   Criado e desenvolvido por VALLEN TECNOLOGIA */

/* Alimentos que a pessoa cadastrou (pelo código de barras ou à mão): [id, nome, kcal/100 g, proteína/100 g, porção g, código].
   Entram na lista FOOD para a busca, as somas do dia e o relatório. O norm() chama addAlim() a cada dado novo da nuvem. */
function addAlim(){try{(S.alim||[]).forEach(a=>{if(a&&a[0]&&!FOOD.some(f=>f[0]==a[0]))FOOD.push(a.slice(0,5))})}catch(e){}}
addAlim();
const limpaNome=s=>String(s||"").replace(/[<>&"]/g,"").replace(/\s+/g," ").trim().slice(0,70);

/* ---------- Código de barras ---------- */
const temCamWeb=()=>"BarcodeDetector"in window&&!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);
const plugCB=()=>NATIVE&&window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.CodigoBarras;
let CBR=null,CBVID=null;
function cbAbrir(){CBR={etapa:"ler",cod:"",nome:"",kcal:"",prot:"",porc:"",msg:""};cbDesenha();if(plugCB())cbLerNativo()}
function cbFechar(){cbPararCam();CBR=null;const el=document.getElementById("mccb");if(el)el.remove()}
function cbDesenha(){let el=document.getElementById("mccb");if(!el){el=document.createElement("div");el.id="mccb";el.className="mcov";document.body.appendChild(el)}const v=x=>x===""||x==null?"":String(x).replace(".",",");let h;
if(CBR.etapa=="ler")h=`<h2>Código de barras</h2>${plugCB()||temCamWeb()?`<button class="p wide lg" data-mccbcam="1">${I("cam",18)} Ler com a câmera</button><div id="cbVid"></div>`:""}<label style="margin-top:12px">${plugCB()||temCamWeb()?"Ou digite":"Digite"} o número embaixo das barras</label><div class="r"><input id="cbNum" inputmode="numeric" maxlength="14" placeholder="7891234567890" value="${esc(CBR.cod)}"><button class="p" data-mccbbusca="1" style="flex:0 0 auto">Buscar</button></div>${CBR.msg?`<p class="m">${esc(CBR.msg)}</p>`:""}<p class="m">Os dados vêm do Open Food Facts, uma base aberta e colaborativa. Confira com o rótulo.</p>`;
else h=`<h2>${CBR.achou?"Encontrado":"Preencha pelo rótulo"}</h2>${CBR.achou?"":`<p class="m" style="margin-top:0">Não achei o código ${esc(CBR.cod)} na base. Copie os valores da tabela nutricional (por 100 g).</p>`}<label>Nome</label><input id="cbNome" maxlength="70" value="${esc(CBR.nome)}"><div class="r" style="margin-top:10px"><div><label>kcal em 100 g</label><input id="cbKcal" inputmode="decimal" value="${v(CBR.kcal)}"></div><div><label>Proteína em 100 g</label><input id="cbProt" inputmode="decimal" value="${v(CBR.prot)}"></div></div><label style="margin-top:10px">Porção que você costuma comer (g)</label><input id="cbPorc" inputmode="decimal" value="${v(CBR.porc)}"><button class="p wide lg" data-mccbsalva="1" style="margin-top:14px">Salvar e adicionar</button>`;
el.innerHTML=`<div class="mcovc">${h}<button class="wide ghost" data-mccbx="1" style="margin-top:10px">Cancelar</button></div>`;if(CBR.etapa=="ler"&&!plugCB()&&CBVID)cbMostraVideo()}
async function cbLerNativo(){try{const r=await plugCB().ler();if(r&&r.codigo)cbBuscar(r.codigo)}catch(e){CBR&&(CBR.msg="Não consegui abrir o leitor. Digite o número.",cbDesenha())}}
async function cbLerWeb(){try{const st=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}),det=new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e"]});CBVID={st,det,tm:null};cbMostraVideo()}catch(e){CBR.msg="Não consegui usar a câmera. Digite o número.";cbDesenha()}}
function cbMostraVideo(){const box=document.getElementById("cbVid");if(!box||!CBVID)return;box.innerHTML=`<video playsinline muted autoplay class="cbv"></video>`;const vd=box.querySelector("video");vd.srcObject=CBVID.st;clearInterval(CBVID.tm);CBVID.tm=setInterval(async()=>{try{const r=await CBVID.det.detect(vd);if(r&&r[0]&&r[0].rawValue){const c=r[0].rawValue;cbPararCam();cbBuscar(c)}}catch(e){}},350)}
function cbPararCam(){if(CBVID){clearInterval(CBVID.tm);try{CBVID.st.getTracks().forEach(t=>t.stop())}catch(e){}CBVID=null}}
async function cbBuscar(cod){cod=String(cod||"").replace(/\D/g,"");if(!CBR)return;if(cod.length<8){CBR.msg="O código tem de 8 a 14 números.";cbDesenha();return}CBR.cod=cod;
const ja=(S.alim||[]).find(a=>a[5]==cod);if(ja){cbUsar(ja[0]);return}
CBR.msg="Buscando…";cbDesenha();let p=null;try{const r=await fetch("https://world.openfoodfacts.org/api/v2/product/"+cod+".json?fields=product_name,product_name_pt,brands,nutriments,serving_quantity");const j=await r.json();if(j&&j.status==1)p=j.product}catch(e){CBR.msg="Sem internet para buscar. Preencha pelo rótulo.";}
const n=p&&p.nutriments||{},kc=n["energy-kcal_100g"]!=null?+n["energy-kcal_100g"]:n.energy_100g!=null?+n.energy_100g/4.184:"",marca=p&&p.brands?String(p.brands).split(",")[0].trim():"";
Object.assign(CBR,{etapa:"conf",achou:!!p,nome:limpaNome(p?((p.product_name_pt||p.product_name||"Produto")+(marca?" · "+marca:"")):""),kcal:kc===""?"":Math.round(kc),prot:n.proteins_100g!=null?Math.round(+n.proteins_100g*10)/10:"",porc:p&&+p.serving_quantity>0?Math.round(+p.serving_quantity):100});cbDesenha()}
function cbSalvar(){const g=id=>{const x=parseFloat(String(document.getElementById(id).value).replace(",","."));return isNaN(x)?null:x},nome=limpaNome(document.getElementById("cbNome").value),kc=g("cbKcal"),pr=g("cbProt"),po=g("cbPorc");
if(!nome||kc==null||kc<0||kc>900||pr==null||pr<0||pr>100||!po||po<=0||po>2000){toast("Confira nome, kcal (0–900), proteína (0–100) e porção.");return}
const id="cb_"+(CBR.cod||Date.now().toString(36)),a=[id,nome,Math.round(kc),Math.round(pr*10)/10,Math.round(po),CBR.cod||""];S.alim=(S.alim||[]).filter(x=>x[0]!=id);S.alim.push(a);const i=FOOD.findIndex(f=>f[0]==id);if(i>=0)FOOD.splice(i,1);addAlim();sv();cbUsar(id)}
/* deixa o alimento escolhido na folha "Adicionar ao …", com a porção pronta para confirmar */
function cbUsar(id){cbFechar();if(typeof SH!="undefined"&&SH){SH.sel=id;SH.mul=1;SH.q="";renderSheet()}toast("Alimento pronto: confira a quantidade")}
document.addEventListener("click",e=>{const t=e.target.closest("[data-mccb],[data-mccbx],[data-mccbcam],[data-mccbbusca],[data-mccbsalva],[data-mccomp],[data-mccompsh]");if(!t)return;const D=t.dataset;
if(D.mccb){cbAbrir();return}if(D.mccbx){cbFechar();return}
if(D.mccbcam){if(plugCB())cbLerNativo();else cbLerWeb();return}
if(D.mccbbusca){cbBuscar(document.getElementById("cbNum").value);return}
if(D.mccbsalva){cbSalvar();return}
if(D.mccomp){comprasMarca(D.mccomp);return}
if(D.mccompsh){comprasCompartilhar();return}});

/* ---------- Lista de compras da semana (a partir do cardápio montado pelo programa alimentar) ---------- */
const segDaSemana=()=>{const d=new Date(td()+"T12:00:00");d.setDate(d.getDate()-wi(td()));return d.toISOString().slice(0,10)};
function comprasItens(){if(!temPlano()||!S.dieta||!S.dieta.cfg)return null;const T={};for(let i=0;i<7;i++){const d=gerarDia(i);(d.m||[]).forEach(m=>(m[3]||[]).forEach(x=>{T[x.id]=(T[x.id]||0)+x.g}))}
const cat=id=>{const c=String(FC[id]||"").split(/[ |]/)[0];return c||"outros"},nomeCat=Object.fromEntries(DCAT.map(x=>[x[0],x[1]]));nomeCat.outros="Outros";
const G={};Object.entries(T).forEach(([id,g])=>{const f=FOOD.find(z=>z[0]==id);if(!f)return;const u=f[1].match(/1 (un|fatia|dose|colher) = (\d+)/);let q;if(u){const n=Math.ceil(g/+u[2]);q=`${n} ${u[1]=="un"?"un":n>1?{fatia:"fatias",dose:"doses",colher:"colheres"}[u[1]]:u[1]}`}else{const ml=/\(ml\)/.test(f[1]);q=g>=1000?f1(g/1000,1)+(ml?" L":" kg"):Math.round(g/10)*10+(ml?" ml":" g")}(G[cat(id)]=G[cat(id)]||[]).push({id,nome:nomeC(f),q})});
return DCAT.map(x=>x[0]).concat(["outros"]).filter(c=>G[c]).map(c=>[nomeCat[c]||c,G[c].sort((a,b)=>a.nome.localeCompare(b.nome))])}
function comprasOk(){const s=segDaSemana();if(!S.compras||S.compras.sem!=s)return{};return S.compras.ok||{}}
function comprasMarca(id){const s=segDaSemana();if(!S.compras||S.compras.sem!=s)S.compras={sem:s,ok:{}};S.compras.ok[id]=!S.compras.ok[id];if(!S.compras.ok[id])delete S.compras.ok[id];sv();draw(1)}
function comprasV(){const L=comprasItens();if(!L)return`<div class="c" style="text-align:center"><div style="font-size:40px">🛒</div><h2>Sem lista ainda</h2><p class="m">A lista sai do cardápio da semana. Monte seu programa alimentar primeiro.</p><button class="p wide lg" data-dplano="1">Montar meu programa</button></div>`;const ok=comprasOk(),n=L.reduce((a,x)=>a+x[1].length,0),feitos=L.reduce((a,x)=>a+x[1].filter(i=>ok[i.id]).length,0);
return`<div class="c"><div class="r sp"><div><small>Semana de ${fd(segDaSemana()).slice(0,5)}</small><b>${feitos} de ${n} itens</b></div><button class="p sm" data-mccompsh="1" style="flex:0 0 auto">Compartilhar</button></div><p class="m" style="margin:6px 0 0">Quantidades para os 7 dias do cardápio. Toque para marcar o que já está no carrinho.</p></div>${L.map(([c,its])=>`<div class="c"><h2>${esc(c)}</h2>${its.map(i=>`<button class="lv cmpi${ok[i.id]?" ok":""}" data-mccomp="${esc(i.id)}"><span><b>${esc(i.nome)}</b></span><span>${esc(i.q)} ${ok[i.id]?"✅":"⬜"}</span></button>`).join("")}</div>`).join("")}`}
async function comprasCompartilhar(){const L=comprasItens();if(!L)return;const ok=comprasOk(),txt="🛒 Lista de compras da semana (Vallen Fitness)\n\n"+L.map(([c,its])=>c+":\n"+its.map(i=>`${ok[i.id]?"✅":"▫️"} ${i.nome}: ${i.q}`).join("\n")).join("\n\n");try{if(navigator.share){await navigator.share({text:txt});return}}catch(e){if(e&&e.name=="AbortError")return}try{await navigator.clipboard.writeText(txt);toast("Lista copiada")}catch(e){toast("Não consegui compartilhar a lista.")}}
