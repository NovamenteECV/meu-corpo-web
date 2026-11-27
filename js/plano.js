/* Vallen Fitness · mensalidade. O plano vem da Vallen Central (central.vallentecnologia.com.br), pelo MESMO e-mail da conta do app:
   o app manda o token de login (Supabase) e a Central responde {nivel 0-3, nome, ate, origem, planos[]}.
   Níveis: 1 Básico, 2 Intermediário, 3 Completo; 0 = sem plano (teste grátis acabou e não assinou).
   A resposta fica guardada (mc_plano_<uid>) e vale sem internet; se a Central nunca respondeu, nada é bloqueado.
   Sem plano, a pessoa ainda baixa os dados, exclui a conta e sai (Nuvem e backup), como manda a LGPD.
   Criado e desenvolvido por VALLEN TECNOLOGIA */
const PLANO_URL = "https://central.vallentecnologia.com.br/api/fitness/plano";
const PLANO_NOMES = ["Sem plano", "Básico", "Intermediário", "Completo"];
/* nível mínimo de cada tela (o que não está aqui é do Básico): "aba", "mais.<sub>", "diario.<dsub>", "evo.<esub>" */
const PLANO_REQ = { treino: 2, "diario.cardapio": 2, "diario.compras": 2, "diario.plano": 2, "evo.medidas": 2, "evo.corpo": 2, "evo.relogio": 2, "evo.fotos": 2, "evo.conq": 2,
  "mais.plano": 2, "mais.saude": 2, "mais.lemb": 2, "mais.ci": 2, "mais.ciclo": 2, "mais.resumo": 2, "mais.exames": 3, "mais.med": 3, "mais.rel": 3, "mais.comp": 3, "mais.ia": 3 };
const PLANO_LIVRE = { "mais.backup": 1, "mais.assinatura": 1 };   // abrem mesmo sem plano
let PLANO = null, PLANO_UID = null, PLANO_BUSY = false, PLANO_ULT = 0;
const planoHoje = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10) };
function planoNivel() {
  if (!PLANO) return 3;   // a Central ainda não respondeu nenhuma vez: não bloqueia ninguém
  const n = +PLANO.nivel || 0;
  if (n && PLANO.ate) { const lim = new Date(PLANO.ate + "T12:00:00"); lim.setDate(lim.getDate() + 2); if (lim.toISOString().slice(0, 10) < planoHoje()) return 0 }   // venceu (2 dias de folga sem internet)
  return n;
}
function planoChave() {
  if (tab == "mais") return sub ? "mais." + sub : "mais";
  if (tab == "diario") return "diario." + (dsub || "diario");
  if (tab == "evo") return "evo." + (esub || "peso");
  return tab;
}
const planoReq = k => PLANO_REQ[k] || 1;
/* rótulo no menu Mais para o que o plano atual não libera */
function planoTag(k) { const r = planoReq("mais." + k); return PLANO_LIVRE["mais." + k] || planoNivel() >= r ? "" : " · 🔒 plano " + PLANO_NOMES[r] }
function planoResumo() {
  if (!PLANO) return "Planos e assinatura";
  const n = planoNivel(), o = PLANO.origem;
  if (!n) return "Sem plano · toque para assinar";
  return PLANO_NOMES[n] + (o == "teste" ? " (teste grátis)" : o == "cortesia" ? " (cortesia)" : "") + (PLANO.ate ? " · até " + fd(PLANO.ate) : "");
}
function planoLista(min) {
  const todos = (PLANO && PLANO.planos || []).filter(p => p.nivel >= (min || 1));
  // um cartão por nível (o mensal); o anual, se houver, vira o segundo botão do mesmo cartão
  const ps = todos.filter(p => p.periodo !== "anual");
  if (!ps.length) return `<p class="m">Os planos estão na Vallen Central: <a href="https://central.vallentecnologia.com.br/produtos/fitness" target="_blank" rel="noopener">central.vallentecnologia.com.br</a></p>`;
  return ps.map(p => { const a = todos.find(x => x.periodo === "anual" && x.nivel === p.nivel);
    return `<div class="c"${p.destaque ? ' style="border:2px solid var(--ac,#0d9488)"' : ""}><div class="r sp"><b>${esc(p.nivel_nome || p.nome)}</b><b>${esc(p.preco)}<small>${esc(p.sufixo)}</small></b></div><p class="m" style="margin:6px 0 10px">${esc(p.descricao || "")}</p>`
    + `<a class="p wide" href="${esc(p.url)}" target="_blank" rel="noopener" style="display:block;text-align:center;text-decoration:none">${planoNivel() == p.nivel ? "Renovar" : "Assinar"} (mensal)</a>`
    + (a ? `<a class="wide ghost" href="${esc(a.url)}" target="_blank" rel="noopener" style="display:block;text-align:center;text-decoration:none;margin-top:8px">Anual: ${esc(a.preco)} · 2 meses grátis</a>` : "") + `</div>` }).join("");
}
const planoEmail = () => PLANO && PLANO.email ? `<p class="m">Na Vallen Central, use o mesmo e-mail do app: <b>${esc(PLANO.email)}</b>. Depois de pagar, volte aqui e toque em <b>Conferir agora</b>.</p>` : "";
const planoBotoes = () => `<div class="r" style="gap:8px;flex-wrap:wrap;margin-top:6px"><button class="p" data-plano-conferir="1">Conferir agora</button><button class="ghost" data-plano-backup="1">Meus dados e conta</button></div>`;
/* Meu plano (Mais) */
function planoV() {
  const n = planoNivel();
  return `<div class="c"><small>Seu plano</small><div style="font-size:22px;font-weight:800;margin:2px 0">${PLANO_NOMES[n]}</div><p class="m">${PLANO ? esc(planoResumo()) : "Ainda não consegui falar com a Vallen Central. Conecte à internet e toque em Conferir agora."}</p>${planoBotoes()}</div>`
    + planoEmail() + planoLista(1)
    + `<p class="m">Básico: início, diário do dia e peso. Intermediário: mais treino, plano alimentar, cardápio, compras, medidas, composição, fotos, relógio, lembretes e check-in. Completo: tudo, com exames, medicação, relatórios, compartilhar com o profissional e IA.</p>`;
}
/* chamado pelo draw(): devolve a tela de bloqueio ou "" */
function planoBloqueio() {
  const k = planoChave(), n = planoNivel();
  if (PLANO_LIVRE[k]) return "";
  if (n <= 0) return hero("", "Escolha seu plano", PLANO && PLANO.origem == "nenhum" ? "Seu teste grátis acabou" : "Seu plano venceu") + `<div class="pad"><div class="c"><p class="m" style="margin:0 0 8px">Seus dados continuam guardados na sua conta. Assine um plano para voltar a usar o app.</p>${planoBotoes()}</div>${planoEmail()}${planoLista(1)}</div>`;
  const r = planoReq(k);
  if (n >= r) return "";
  return hero("", "Plano " + PLANO_NOMES[r], "Este recurso faz parte do plano " + PLANO_NOMES[r], "", 1) + `<div class="pad"><div class="c"><p class="m" style="margin:0 0 8px">Seu plano é o <b>${PLANO_NOMES[n]}</b>. Troque de plano para liberar; os dias que faltam do atual viram dias do novo.</p><button class="ghost" data-plano-voltar="1">Voltar</button></div>${planoEmail()}${planoLista(r)}</div>`;
}
/* pergunta o plano à Central (ao entrar, ao voltar para o app e a cada 30 min) */
async function planoConferir(forcar) {
  if (PLANO_BUSY || !window.MC_SESSAO) return;
  if (!forcar && Date.now() - PLANO_ULT < 30 * 60000) return;
  PLANO_BUSY = true;
  try {
    const s = await MC_SESSAO();
    if (!s) return;
    if (s.uid !== PLANO_UID) { PLANO_UID = s.uid; try { PLANO = JSON.parse(localStorage.getItem("mc_plano_" + s.uid) || "null") } catch (e) { PLANO = null } }
    const r = await fetch(PLANO_URL, { headers: { Authorization: "Bearer " + s.t, Accept: "application/json" }, cache: "no-store" });
    if (!r.ok) { if (forcar) toast(r.status == 401 ? "Entre de novo na sua conta." : "A Vallen Central não respondeu agora."); return }
    const j = await r.json(), antes = planoNivel();
    PLANO = Object.assign(j, { em: Date.now() }); PLANO_ULT = Date.now();
    try { localStorage.setItem("mc_plano_" + s.uid, JSON.stringify(PLANO)) } catch (e) {}
    if (forcar) toast("Plano: " + PLANO_NOMES[planoNivel()]);
    if (forcar || antes !== planoNivel() || (tab == "mais" && sub == "assinatura")) draw(1);
  } catch (e) { if (forcar) toast("Sem internet. Tente de novo.") }
  finally { PLANO_BUSY = false }
}
/* cache da conta já conhecida, antes de a Central responder (abre sem piscar) */
function planoCarregar(uid) { if (uid === PLANO_UID) return; PLANO_UID = uid; PLANO_ULT = 0; try { PLANO = JSON.parse(localStorage.getItem("mc_plano_" + uid) || "null") } catch (e) { PLANO = null } }
document.addEventListener("click", e => {
  const t = e.target && e.target.closest && e.target.closest("[data-plano-conferir],[data-plano-backup],[data-plano-voltar]");
  if (!t) return;
  if (t.dataset.planoConferir) { t.disabled = true; t.textContent = "Conferindo…"; planoConferir(true).finally(() => { t.disabled = false; t.textContent = "Conferir agora" }) }
  else if (t.dataset.planoBackup) { tab = "mais"; sub = "backup"; draw() }
  else { if (tab == "diario") dsub = "diario"; else if (tab == "evo") esub = "peso"; else if (tab == "mais") sub = null; else tab = "inicio"; draw() }
});
document.addEventListener("visibilitychange", () => { if (!document.hidden) planoConferir(false) });
setInterval(() => planoConferir(false), 30 * 60000);
