/* Meu Corpo · atalhos do ícone e widget da tela inicial (só no APK).
   - Atalhos (segurar o ícone) e toques no widget abrem com.andremeucorpo.app://acao/<agua|peso|treino|inicio>.
   - O widget mostra os números de hoje: o app manda para o plugin nativo Widget a cada salvamento (nsave).
   Arquivos carregados em ordem pelo index.html (scripts comuns, escopo global compartilhado).
   Criado e desenvolvido por VALLEN TECNOLOGIA */

let WGULT="";
function atualizarWidget(){try{const W=NATIVE&&window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.Widget;if(!W||!S||!S.p||!S.p.nome)return;const d=td(),L=S.log[d]||{},o={dia:d,kat:+L.kat||0,katMeta:+katMeta()||0,prot:+L.prot||0,protMeta:+S.p.prot||0,agua:+L.agua||0,aguaMeta:+aguaMeta()||0,passos:+L.passos||0,passosMeta:+passosMeta()||0},j=JSON.stringify(o);if(j==WGULT)return;WGULT=j;W.atualizar(o).catch(()=>{})}catch(e){}}

/* espera o app ter os dados (do aparelho e, se der, da nuvem) antes de mexer, para a ação não se perder */
async function esperarDados(){for(let i=0;i<80;i++){const pronto=S&&S.p&&S.p.nome&&(!NATIVE||window.NLOADED)&&(!window.MC_SY_ESTADO||!MC_SY_ESTADO().logado||/sincroniz|salvo|sem internet|erro/i.test(MC_SY_ESTADO().txt||""));if(pronto)return true;await new Promise(r=>setTimeout(r,100))}return!!(S&&S.p&&S.p.nome)}
async function acaoAtalho(url){const m=/^com\.andremeucorpo\.app:\/\/acao\/([a-z]+)/.exec(url||"");if(!m)return;const a=m[1];if(!await esperarDados())return;if(typeof SH!="undefined"&&SH)closeSheet();
if(a=="agua"){dt=td();const L=LG();L.agua=Math.round(((L.agua||0)+.25)*100)/100;clean(L);sv();tab="inicio";sub=null;draw();toast(`💧 +1 copo · ${f1(L.agua,2)} L hoje`)}
else if(a=="peso"){tab="inicio";sub=null;draw();openSheet("peso")}
else if(a=="treino"){tab="treino";sub=null;draw()}
else{tab="inicio";sub=null;draw()}}
if(NATIVE&&window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.App){const A=Capacitor.Plugins.App;try{A.addListener("appUrlOpen",d=>acaoAtalho(d&&d.url))}catch(e){}try{A.getLaunchUrl().then(d=>acaoAtalho(d&&d.url)).catch(()=>{})}catch(e){}try{A.addListener("appStateChange",s=>{if(!s.isActive){WGULT="";atualizarWidget()}})}catch(e){}}
