/* Vallen Fitness · compartilhar com um profissional: link só de leitura, com prazo (tabela meucorpo_compartilhamentos).
   Quem abre o link vê o ver.html do site, que pede ao banco só as partes escolhidas (função meucorpo_ver_compartilhado).
   Arquivos carregados em ordem pelo index.html (scripts comuns, escopo global compartilhado).
   Criado e desenvolvido por VALLEN TECNOLOGIA */

const COMP_SITE="https://novamenteecv.github.io/meu-corpo-web/ver.html#";
const COMP_PARTES=[["peso","Peso"],["medidas","Cintura"],["bio","Bioimpedância"],["exames","Exames"],["treinos","Treinos"]];
let COMP={lista:null,erro:"",novo:null,para:"",partes:["peso","medidas","bio"],dias:30};
const compLink=t=>COMP_SITE+t;
function compV(){if(!window.SB)return`<div class="c"><p class="m">Entre na sua conta para compartilhar.</p></div>`;if(COMP.lista===null&&!COMP.erro)setTimeout(compCarregar,0);
const ok=COMP.partes;return`<div class="c"><h2>Novo link</h2><p class="m" style="margin-top:0">A pessoa que receber o link vê só o que você marcar, sem poder mudar nada e sem precisar de conta. Medicação, fotos, comida e anotações nunca vão.</p><label>Para quem (opcional)</label><input id="compPara" maxlength="80" placeholder="Ex.: Dra. Ana, nutricionista" value="${esc(COMP.para||"")}"><label style="margin-top:10px">O que mostrar</label><div class="tg">${COMP_PARTES.map(([k,n])=>`<button class="${ok.includes(k)?"on":""}" data-mccompp="${k}">${n}</button>`).join("")}</div><label>Vale por</label><div class="tg">${[[7,"7 dias"],[30,"30 dias"],[90,"90 dias"]].map(([d,n])=>`<button class="${COMP.dias==d?"on":""}" data-mccompd="${d}">${n}</button>`).join("")}</div><button class="p wide lg" data-mccompnovo="1">Criar link</button></div>
${COMP.novo?`<div class="c" style="border:2px solid var(--tc)"><h2>Link criado</h2><p class="m" style="margin-top:0;word-break:break-all">${esc(compLink(COMP.novo))}</p><div class="r"><button class="p" data-mccompenv="${esc(COMP.novo)}">Enviar</button><button data-mccompcop="${esc(COMP.novo)}">Copiar</button></div></div>`:""}
<div class="c"><h2>Links ativos</h2><div id="compl">${compLista()}</div></div>`}
function compLista(){if(COMP.erro)return`<p class="w">${esc(COMP.erro)}</p>`;if(COMP.lista===null)return`<p class="m">Carregando…</p>`;const L=COMP.lista.filter(x=>new Date(x.ate)>new Date());if(!L.length)return`<p class="m">Nenhum link ativo.</p>`;
const nm=p=>p.map(k=>(COMP_PARTES.find(x=>x[0]==k)||[0,k])[1]).join(", ");return L.map(x=>`<div class="er"><div style="flex:1;min-width:0"><b>${esc(x.para||"Sem nome")}</b><small>${esc(nm(x.partes||[]))}</small><small>Vale até ${new Date(x.ate).toLocaleDateString("pt-BR")} · ${x.acessos?`aberto ${x.acessos} vez(es), a última em ${new Date(x.ultimo_acesso).toLocaleDateString("pt-BR")}`:"ainda não aberto"}</small></div><span style="display:flex;gap:6px;flex:0 0 auto"><button class="ib" data-mccompenv="${esc(x.token)}" aria-label="Enviar de novo">${I("chat",16)}</button><button class="ib" data-mccompdel="${esc(x.token)}" aria-label="Cancelar link">${I("x",16)}</button></span></div>`).join("")}
async function compCarregar(){try{const r=await SB.from("meucorpo_compartilhamentos").select("token,para,partes,ate,criado,acessos,ultimo_acesso").order("criado",{ascending:false});if(r.error)throw r.error;COMP.lista=r.data||[];COMP.erro=""}catch(e){COMP.erro="Sem internet para carregar os links."}const el=document.getElementById("compl");if(el)el.innerHTML=compLista()}
function compToken(){const b=new Uint8Array(24);crypto.getRandomValues(b);return btoa(String.fromCharCode(...b)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
async function compCriar(){if(!COMP.partes.length){toast("Marque pelo menos uma parte.");return}const para=(document.getElementById("compPara").value||"").replace(/[<>]/g,"").trim().slice(0,80),ate=new Date(Date.now()+COMP.dias*864e5).toISOString(),token=compToken();
try{const r=await SB.from("meucorpo_compartilhamentos").insert({token,para:para||null,partes:COMP.partes,ate});if(r.error)throw r.error;COMP.novo=token;COMP.lista=null;draw(1);compEnviar(token)}catch(e){toast("Não consegui criar o link. Confira a internet.")}}
async function compEnviar(t){const u=compLink(t),txt="Acompanhamento do Vallen Fitness (só leitura): "+u;try{if(navigator.share){await navigator.share({text:txt});return}}catch(e){if(e&&e.name=="AbortError")return}compCopiar(t)}
async function compCopiar(t){try{await navigator.clipboard.writeText(compLink(t));toast("Link copiado")}catch(e){toast("Não consegui copiar.")}}
async function compApagar(t){try{const r=await SB.from("meucorpo_compartilhamentos").delete().eq("token",t);if(r.error)throw r.error;if(COMP.novo==t)COMP.novo=null;COMP.lista=null;draw(1);toast("Link cancelado: não abre mais")}catch(e){toast("Não consegui cancelar. Confira a internet.")}}
document.addEventListener("click",e=>{const t=e.target.closest("[data-mccompp],[data-mccompd],[data-mccompnovo],[data-mccompenv],[data-mccompcop],[data-mccompdel]");if(!t)return;const D=t.dataset;
if(D.mccompp){const p=COMP.partes;COMP.partes=p.includes(D.mccompp)?p.filter(x=>x!=D.mccompp):p.concat(D.mccompp);draw(1);return}
if(D.mccompd){COMP.dias=+D.mccompd;draw(1);return}
if(D.mccompnovo){compCriar();return}
if(D.mccompenv){compEnviar(D.mccompenv);return}
if(D.mccompcop){compCopiar(D.mccompcop);return}
if(D.mccompdel){ask("Cancelar este link? Quem tiver o endereço não consegue mais abrir.","Cancelar link",()=>compApagar(D.mccompdel))}});
document.addEventListener("input",e=>{if(e.target.id=="compPara")COMP.para=e.target.value});
