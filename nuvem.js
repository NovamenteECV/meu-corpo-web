/* Meu Corpo: login e sincronização com o Supabase.
   Carregado depois do app principal. Usa as variáveis globais S, KEY, sy, norm, draw, push, sinc. */
(function () {
  const SB_URL = "https://swqjqsdpzwcgtwihwttw.supabase.co";
  const SB_KEY = "sb_publishable_pfKC3mv8VL-trq8Fv8iTqQ_GnklcdDe";
  const T = "meucorpo_state";
  if (!window.supabase || SB_URL.indexOf("__") === 0) return;

  const sb = window.supabase.createClient(SB_URL, SB_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: window.localStorage }
  });
  window.SB = sb;

  let user = null, ready = false, cbusy = false, cdirty = false, ctimer = null;
  const FLAG = id => "mc_sync_" + id;
  const setSy = t => { try { sy = t } catch (e) {} };
  const saveLocal = () => {
    try { localStorage.setItem(KEY, JSON.stringify(S)) } catch (e) {}
    if (window.NATIVE_SAVE) window.NATIVE_SAVE();
  };

  /* ---------- envio ---------- */
  async function cpush() {
    if (!user || !ready) return;
    if (cbusy) { cdirty = true; return }
    cbusy = true;
    try {
      const { error } = await sb.from(T).upsert({ user_id: user.id, data: S, t: S._t || Date.now(), updated_at: new Date().toISOString() });
      setSy(error ? "erro na nuvem: " + error.message : "salvo na nuvem ✅");
      if (!error) localStorage.setItem(FLAG(user.id), "1");
    } catch (e) { setSy("sem internet: salvo no aparelho") }
    cbusy = false;
    if (cdirty) { cdirty = false; cpush() }
  }
  push = async function () {
    if (window.NATIVE_SAVE) window.NATIVE_SAVE();
    clearTimeout(ctimer);
    ctimer = setTimeout(cpush, 1200);
  };

  /* ---------- recebimento ---------- */
  function usar(remoto) {
    S = remoto; norm(); saveLocal();
    setSy("sincronizado ✅"); draw(1);
  }
  async function cpull(primeira) {
    if (!user) return;
    let row = null;
    try {
      const r = await sb.from(T).select("data,t").eq("user_id", user.id).limit(1);
      if (r.error) throw r.error;
      row = (r.data && r.data[0]) || null;
    } catch (e) {
      setSy("sem internet: usando os dados do aparelho");
      ready = true; draw(1); return;
    }
    const jaSincronizou = localStorage.getItem(FLAG(user.id)) === "1";
    if (!row) {
      if (primeira && temDadosLocais()) { levarOuZerar(); return }
      perfilNovo(); return
    }
    if (!jaSincronizou && primeira && temDadosLocais()) { escolher(row); return }
    ready = true;
    if (!jaSincronizou || (row.t || 0) > (S._t || 0)) { usar(row.data); localStorage.setItem(FLAG(user.id), "1") }
    else if ((row.t || 0) < (S._t || 0)) await cpush();
    else setSy("sincronizado ✅");
    draw(1);
  }
  sinc = function () { return cpull(false) };

  function temDadosLocais() {
    try { return !!localStorage.getItem(KEY) && localStorage.getItem("mc_blank") !== "1" && Object.keys(S.log || {}).length > 6 } catch (e) { return false }
  }
  const hoje = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

  /* conta nova sem dados: perfil em branco + cadastro rápido */
  function perfilNovo() {
    const el = tela(`<h1>Bem-vindo(a)!</h1><p>Conte um pouco sobre você para o app montar suas metas. Dá para mudar depois em Mais → Metas e perfil.</p>
      <label>Nome</label><input id="pnome" autocomplete="given-name">
      <label>Sexo</label><div style="display:flex;gap:8px"><button class="sec" data-sx="m" style="margin:0">Masculino</button><button class="sec" data-sx="f" style="margin:0">Feminino</button></div>
      <label>Data de nascimento</label><input id="pnasc" type="date">
      <label>Altura (cm)</label><input id="palt" type="number" inputmode="numeric">
      <label>Peso hoje (kg)</label><input id="ppeso" type="number" inputmode="decimal" step="0.1">
      <label>Meta de peso (kg)</label><input id="pmeta" type="number" inputmode="decimal" step="0.1">
      <button class="pri" id="pok">Começar</button><div class="msg"></div>`);
    let sx = "";
    el.querySelectorAll("[data-sx]").forEach(b => b.onclick = () => {
      sx = b.dataset.sx;
      el.querySelectorAll("[data-sx]").forEach(o => { o.style.background = o === b ? "#0d9488" : "#f1f5f9"; o.style.color = o === b ? "#fff" : "#0f766e" });
    });
    el.querySelector("#pok").onclick = async () => {
      const v = id => el.querySelector(id).value.trim(), num = id => parseFloat(v(id).replace(",", "."));
      const nome = v("#pnome"), nasc = v("#pnasc"), alt = num("#palt"), peso = num("#ppeso"), meta = num("#pmeta");
      if (!nome || !sx || !nasc || !(alt > 100 && alt < 230) || !(peso > 30 && peso < 300) || !(meta > 30 && meta < 300)) { msg("Preencha todos os campos com valores válidos."); return }
      const idade = Math.floor((Date.now() - new Date(nasc + "T00:00:00")) / 31557600000);
      const tmb = 10 * peso + 6.25 * alt - 5 * idade + (sx === "m" ? 5 : -161);
      const kcal = Math.max(sx === "m" ? 1500 : 1200, Math.round((tmb * 1.375 - 500) / 50) * 50);
      const prot = Math.round(Math.min(1.6 * peso, 2 * meta) / 5) * 5;
      S = { p: { nome, sexo: sx, nasc, alt, meta, fat: 1.2, kcal, prot }, bad: {}, done: {}, ate: {}, log: { [hoje()]: { peso } },
            bios: [], ex: { d: "—", r: [] }, bio: { d: "—", lean: 0, r: [] }, tr: { prog: "app" }, _t: Date.now() };
      norm(); ready = true; saveLocal(); localStorage.removeItem("mc_blank");
      await cpush(); fechar(); tab = "inicio"; draw(1);
    };
  }

  /* conta nova num aparelho que já tem dados */
  function levarOuZerar() {
    const el = tela(`<h1>Conta nova</h1><p>Este aparelho já tem dados do Meu Corpo (${Object.keys(S.log || {}).length} dias registrados, de ${esc(S.p && S.p.nome || "alguém")}). Eles são seus?</p>
      <button class="pri" id="lv">Sim, levar para minha conta</button>
      <button class="sec" id="zr">Não, começar do zero</button>`);
    el.querySelector("#lv").onclick = async () => { ready = true; S._t = Date.now(); saveLocal(); await cpush(); fechar(); draw(1) };
    el.querySelector("#zr").onclick = () => perfilNovo();
  }

  /* ---------- telas ---------- */
  const css = `
  #mcl{position:fixed;inset:0;z-index:100;background:linear-gradient(160deg,#0f766e,#134e4a);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:24px;padding-top:calc(24px + env(safe-area-inset-top));font-family:inherit}
  #mcl .bx{margin:auto 0;background:#fff;border-radius:22px;padding:26px 22px;width:100%;max-width:380px;box-shadow:0 20px 50px rgba(0,0,0,.25);color:#0f172a}
  #mcl h1{font-size:24px;margin:0 0 4px;color:#0f766e}
  #mcl p{margin:0 0 18px;color:#64748b;font-size:14px;line-height:1.45}
  #mcl label{display:block;font-size:13px;font-weight:600;margin:12px 0 6px;color:#334155}
  #mcl input{width:100%;box-sizing:border-box;border:1.5px solid #cbd5e1;border-radius:12px;padding:13px 14px;font-size:16px;background:#f8fafc}
  #mcl input:focus{outline:none;border-color:#0d9488;background:#fff}
  #mcl button{width:100%;border:0;border-radius:12px;padding:14px;font-size:16px;font-weight:700;margin-top:16px;cursor:pointer}
  #mcl .pri{background:#0d9488;color:#fff}
  #mcl .sec{background:#f1f5f9;color:#0f766e;margin-top:10px}
  #mcl .lnk{background:none;color:#0f766e;font-weight:600;padding:8px;margin-top:6px}
  #mcl .msg{min-height:20px;margin-top:12px;font-size:14px;color:#b91c1c;text-align:center}
  #mcl .msg.ok{color:#047857}
  #mcl .logo{width:56px;height:56px;border-radius:16px;margin-bottom:12px}
  #mcl button:disabled{opacity:.6}
  .mcacc{display:flex;align-items:center;justify-content:space-between;gap:10px}
  .mcacc small{color:#64748b}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function tela(html) {
    let el = document.getElementById("mcl");
    if (!el) { el = document.createElement("div"); el.id = "mcl"; document.body.appendChild(el) }
    el.innerHTML = `<div class="bx"><img class="logo" src="icon-192.png" onerror="this.remove()">${html}</div>`;
    return el;
  }
  function fechar() { const el = document.getElementById("mcl"); if (el) el.remove() }
  const msg = (t, ok) => { const m = document.querySelector("#mcl .msg"); if (m) { m.textContent = t; m.className = "msg" + (ok ? " ok" : "") } };
  const traduz = e => {
    const s = (e && e.message || "").toLowerCase();
    if (s.includes("invalid login")) return "E-mail ou senha incorretos.";
    if (s.includes("already registered") || s.includes("already been registered")) return "Esse e-mail já tem conta. Toque em Entrar.";
    if (s.includes("not confirmed")) return "Confirme o e-mail pelo link que enviamos e tente de novo.";
    if (s.includes("signups not allowed") || s.includes("signup is disabled")) return "Novos cadastros estão fechados.";
    if (s.includes("password")) return "A senha precisa ter pelo menos 6 caracteres.";
    if (s.includes("fetch") || s.includes("network")) return "Sem internet. Conecte e tente de novo.";
    return e && e.message ? e.message : "Não deu certo. Tente de novo.";
  };

  function telaLogin() {
    const el = tela(`<h1>Meu Corpo</h1><p>Entre para ver seus dados em qualquer celular.</p>
      <label>E-mail</label><input id="mce" type="email" autocomplete="email" inputmode="email">
      <label>Senha</label><input id="mcs" type="password" autocomplete="current-password">
      <button class="pri" id="mcin">Entrar</button>
      <button class="sec" id="mcup">Criar conta</button>
      <div class="msg"></div>`);
    const go = async cadastro => {
      const email = el.querySelector("#mce").value.trim(), password = el.querySelector("#mcs").value;
      if (!email || !password) { msg("Preencha e-mail e senha."); return }
      el.querySelectorAll("button").forEach(b => b.disabled = true);
      msg(cadastro ? "Criando conta…" : "Entrando…", true);
      try {
        const r = cadastro ? await sb.auth.signUp({ email, password }) : await sb.auth.signInWithPassword({ email, password });
        if (r.error) throw r.error;
        if (cadastro && !r.data.session) { msg("Conta criada. Abra o e-mail, toque no link de confirmação e depois entre aqui.", true) }
      } catch (e) { msg(traduz(e)) }
      el.querySelectorAll("button").forEach(b => b.disabled = false);
    };
    el.querySelector("#mcin").onclick = () => go(false);
    el.querySelector("#mcup").onclick = () => go(true);
    el.querySelector("#mcs").onkeydown = e => { if (e.key === "Enter") go(false) };
  }

  function escolher(row) {
    const n = o => Object.keys((o && o.log) || {}).length;
    const el = tela(`<h1>Qual versão usar?</h1>
      <p>Sua conta já tem dados salvos (${n(row.data)} dias registrados). Este aparelho também tem (${n(S)} dias).<br>Escolha qual fica valendo. A outra será substituída.</p>
      <button class="pri" id="mcn">Usar os da conta (nuvem)</button>
      <button class="sec" id="mcd">Usar os deste aparelho</button>`);
    el.querySelector("#mcn").onclick = () => { ready = true; localStorage.setItem(FLAG(user.id), "1"); usar(row.data); fechar() };
    el.querySelector("#mcd").onclick = async () => { ready = true; S._t = Date.now(); saveLocal(); await cpush(); fechar(); draw(1) };
  }

  /* ---------- conta na tela "Nuvem e backup" ---------- */
  const bk0 = bkV;
  bkV = function () {
    const conta = user ? `<div class="c mcacc"><div><small>Conectado como</small><br><b>${esc(user.email || "")}</b></div><button id="mcout">Sair</button></div>` : "";
    return conta + bk0();
  };
  document.addEventListener("click", async e => {
    if (e.target && e.target.id === "mcout") {
      e.target.disabled = true; e.target.textContent = "Saindo…";
      clearTimeout(ctimer); await cpush();
      await sb.auth.signOut();
      /* não deixa os dados desta pessoa no aparelho para a próxima */
      try { localStorage.removeItem(KEY); localStorage.setItem("mc_blank", "1") } catch (x) {}
      try { if (window.Capacitor && Capacitor.Plugins.Preferences) await Capacitor.Plugins.Preferences.remove({ key: KEY }) } catch (x) {}
      location.reload();
    }
  });

  /* ---------- sessão ---------- */
  let ultimo = null;
  sb.auth.onAuthStateChange((ev, session) => {
    const u = session && session.user;
    if (u && (!ultimo || ultimo !== u.id)) {
      ultimo = u.id; user = u; ready = false; fechar();
      setSy("sincronizando…"); cpull(true);
    } else if (!u) {
      ultimo = null; user = null; ready = false;
      telaLogin();
    }
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && user && ready) cpull(false) });
})();
