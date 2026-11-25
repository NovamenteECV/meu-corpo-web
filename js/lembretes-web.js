/* Vallen Fitness · lembretes no iPhone e no site (Web Push). No APK continua a notificação local (saude.js).
   O aparelho se inscreve no navegador, grava a inscrição e a lista de lembretes (lembLista) em meucorpo_push,
   e a Edge Function meucorpo-lembretes manda na hora certa (o agendador do banco chama a cada 5 minutos).
   No iPhone só funciona com o app adicionado à Tela de Início (iOS 16.4 ou mais novo).
   Arquivos carregados em ordem pelo index.html (scripts comuns, escopo global compartilhado).
   Criado e desenvolvido por VALLEN TECNOLOGIA */

const pushPossivel=()=>!NATIVE&&"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window;
const ehIOS=/iPhone|iPad|iPod/.test(navigator.userAgent);
const naTelaInicio=()=>{try{return matchMedia("(display-mode: standalone)").matches||navigator.standalone===true}catch(e){return false}};
let LWEST=null;   // {ativo, endpoint}
const lwAtivo=()=>!!(LWEST&&LWEST.ativo);
const b64uBytes=s=>{s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return Uint8Array.from(atob(s),c=>c.charCodeAt(0))};
async function lwInscricao(){try{const r=await navigator.serviceWorker.getRegistration();return r?await r.pushManager.getSubscription():null}catch(e){return null}}
async function lwEstado(){if(!pushPossivel())return null;const s=await lwInscricao();LWEST={ativo:!!s&&Notification.permission=="granted",endpoint:s?s.endpoint:null};return LWEST}
function lwCartao(){const precisaInstalar=ehIOS&&!naTelaInicio();return`<div class="c" style="text-align:center"><div style="font-size:40px">🔔</div><h2>Lembretes por notificação</h2><p class="m">Água, refeições, treino, pesagem, sono e check-in na hora certa, como no app do Android.</p>${precisaInstalar?`<p class="w">No iPhone, primeiro adicione o Vallen Fitness à Tela de Início: toque em Compartilhar e depois em Adicionar à Tela de Início. Abra o app por lá e volte aqui.</p>`:`<button class="p wide lg" data-mclw="ativar">Ativar notificações</button>`}</div>`}
function lwTopo(){if(NATIVE||!lwAtivo())return"";return`<div class="c"><div class="r sp"><div><small>Notificações</small><b>Ligadas neste aparelho</b></div><span style="display:flex;gap:6px;flex:0 0 auto"><button class="sm" data-mclw="teste">Testar</button><button class="sm ghost" data-mclw="desligar">Desligar</button></span></div><p class="m" style="margin:6px 0 0">Ligue abaixo o que quer receber. Os horários valem para este aparelho e chegam mesmo com o app fechado.</p></div>`}
async function lwGravar(s){const j=s.toJSON(),r=await SB.from("meucorpo_push").upsert({endpoint:j.endpoint,p256dh:j.keys.p256dh,auth:j.keys.auth,lembretes:lembLista(),fuso:Intl.DateTimeFormat().resolvedOptions().timeZone||"America/Sao_Paulo",atualizado:new Date().toISOString()},{onConflict:"endpoint"});if(r.error)throw r.error}
async function lwTeste(endpoint){try{const r=await SB.functions.invoke("meucorpo-lembretes",{body:{teste:endpoint}});if(r.error)throw r.error;toast("Mandei uma notificação de teste")}catch(e){toast("Não consegui mandar o teste agora.")}}
async function lwAtivar(){if(!window.SB){toast("Entre na sua conta primeiro.");return}if(ehIOS&&!naTelaInicio()){toast("Adicione o Vallen Fitness à Tela de Início e abra por lá.");return}
try{const p=await Notification.requestPermission();if(p!=="granted"){toast("As notificações não foram permitidas. Libere nos Ajustes do aparelho.");return}
const k=await SB.functions.invoke("meucorpo-lembretes",{method:"GET"});const pub=k.data&&k.data.publica;if(!pub){toast("As notificações ainda não estão ligadas no servidor.");return}
const reg=await navigator.serviceWorker.ready;let s=await reg.pushManager.getSubscription();if(!s)s=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64uBytes(pub)});
if(!S.lemb||!Object.values(S.lemb).some(Boolean)){S.lemb={agua:1,peso:1};sv()}
await lwGravar(s);LWEST={ativo:true,endpoint:s.endpoint};draw(1);lwTeste(s.endpoint)}catch(e){toast("Não consegui ativar as notificações neste aparelho.")}}
async function lwDesligar(){try{const s=await lwInscricao();if(s){await SB.from("meucorpo_push").delete().eq("endpoint",s.endpoint);await s.unsubscribe()}}catch(e){}LWEST={ativo:false,endpoint:null};draw(1);toast("Notificações desligadas neste aparelho")}
/* depois de mudar um lembrete (lembAgendar chama aqui quando não é o APK) */
async function lembWebSync(){if(!pushPossivel()||!window.SB)return;const s=await lwInscricao();if(!s)return;try{await lwGravar(s);const n=lembLista().length;toast(n?`🔔 ${n} lembretes ativos`:"Lembretes desligados")}catch(e){toast("Não consegui atualizar os lembretes.")}}
document.addEventListener("click",e=>{const t=e.target.closest("[data-mclw]");if(!t)return;const a=t.dataset.mclw;if(a=="ativar")lwAtivar();else if(a=="teste")lwTeste(LWEST&&LWEST.endpoint);else if(a=="desligar")ask("Desligar as notificações neste aparelho?","Desligar",lwDesligar)});
if(pushPossivel())lwEstado().then(()=>{try{if(tab=="mais"&&sub=="lemb")draw(1)}catch(e){}});
