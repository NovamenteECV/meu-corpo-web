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

  /* ---------- envio ----------
     Regra: só envia se a nuvem ainda estiver na versão que este aparelho conhece.
     Se outro aparelho salvou algo depois, este aparelho baixa primeiro (nunca sobrescreve). */
  const SYNC = id => "mc_st_" + id;
  const syncT = () => +(localStorage.getItem(SYNC(user.id)) || 0);
  const setSync = t => localStorage.setItem(SYNC(user.id), String(t));
  async function cpush() {
    if (!user || !ready) return;
    if (cbusy) { cdirty = true; return }
    cbusy = true;
    try {
      const r = await sb.from(T).select("t").eq("user_id", user.id).limit(1);
      if (r.error) throw r.error;
      const nuvemT = r.data && r.data[0] ? +r.data[0].t : 0;
      if (nuvemT > syncT()) { cbusy = false; await cpull(false); return }   // outro aparelho salvou depois: baixa antes
      const t = Math.max(Date.now(), nuvemT + 1);
      S._t = t;
      const { error } = await sb.from(T).upsert({ user_id: user.id, data: S, t, updated_at: new Date().toISOString() });
      if (error && error.code === "23503") { cbusy = false; contaSumiu(); return }   // a conta foi excluída no servidor
      if (error) setSy("erro na nuvem: " + error.message);
      else { setSync(t); localStorage.setItem(FLAG(user.id), "1"); try { localStorage.setItem(KEY, JSON.stringify(S)) } catch (e) {} setSy("salvo na nuvem ✅") }
    } catch (e) { setSy("sem internet: salvo no aparelho") }
    cbusy = false;
    if (cdirty) { cdirty = false; cpush() }
  }
  push = async function () {
    if (window.NATIVE_SAVE) window.NATIVE_SAVE();
    if (user && ready) localStorage.setItem("mc_dirty_" + user.id, "1");
    clearTimeout(ctimer);
    ctimer = setTimeout(cpush, 1200);
  };

  /* ---------- recebimento ---------- */
  function guardarCopia() {
    try { if (S && S.log && Object.keys(S.log).length) localStorage.setItem("mc_copia_anterior", JSON.stringify({ quando: Date.now(), S })) } catch (e) {}
  }
  function usar(remoto, t) {
    guardarCopia();
    // mantém os dados do relógio de hoje que só este aparelho tem
    const d = hoje(), loc = (S.log || {})[d] || {};
    S = remoto; norm();
    const L = S.log[d] = S.log[d] || {};
    let juntou = false;
    ["passos", "kat", "sono", "fc"].forEach(k => { if (loc[k] != null && L[k] !== loc[k] && (L[k] == null || loc[k] > L[k])) { L[k] = loc[k]; juntou = true } });
    if (t) setSync(t);
    saveLocal(); localStorage.removeItem("mc_dirty_" + user.id);
    if (juntou) { localStorage.setItem("mc_dirty_" + user.id, "1"); setTimeout(cpush, 600) }
    setSy("sincronizado ✅"); draw(1);
  }
  async function cpull(primeira) {
    if (!user) return;
    if (window.NATIVE && !window.NLOADED) { for (let i = 0; i < 30 && !window.NLOADED; i++) await new Promise(r => setTimeout(r, 100)) }
    if (primeira) donoLocal();
    let row = null;
    try {
      const r = await sb.from(T).select("data,t").eq("user_id", user.id).limit(1);
      if (r.error) throw r.error;
      row = (r.data && r.data[0]) || null;
    } catch (e) {
      setSy("sem internet: usando os dados do aparelho");
      if (!S.p || !S.p.nome) {
        const el = tela(`<h1>Sem internet</h1><p>Conecte o celular à internet para carregar os seus dados.</p><button class="pri" id="mcrt">Tentar de novo</button>`);
        el.querySelector("#mcrt").onclick = () => { fechar(); cpull(false) };
        return;
      }
      ready = true; draw(1); return;
    }
    const jaSincronizou = localStorage.getItem(FLAG(user.id)) === "1" && syncT() > 0;
    if (!row) {
      // conta sem dados na nuvem: se este aparelho já criou o perfil dela (e não conseguiu enviar), envia; senão, cadastro
      if (localStorage.getItem("mc_dono") === user.id && S.p && S.p.nome) { ready = true; await cpush(); draw(1); return }
      perfilNovo(); return
    }
    ready = true;
    const rt = +row.t || 0, sujo = localStorage.getItem("mc_dirty_" + user.id) === "1";
    if (!jaSincronizou || rt > syncT()) { usar(row.data, rt); localStorage.setItem(FLAG(user.id), "1") }  // nuvem mudou: ela vale
    else if (sujo) await cpush();                                                                          // só este aparelho mudou
    else setSy("sincronizado ✅");
    draw(1);
  }
  sinc = function () { return cpull(false) };

  /* Os dados guardados no aparelho são de uma conta só (mc_dono). Se quem entrou é outra pessoa,
     eles saem da tela (ficam só no mc_copia_anterior) e a conta começa pelos dados dela. */
  function donoLocal() {
    const d = localStorage.getItem("mc_dono");
    const meu = d === user.id || (!d && localStorage.getItem(FLAG(user.id)) === "1");
    if (!meu) { guardarCopia(); S = S0(); norm(); saveLocal(); localStorage.removeItem("mc_dirty_" + user.id); draw(1) }
    localStorage.setItem("mc_dono", user.id);
  }

  const hoje = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

  /* Conta nova: cadastro em passos (como o do treino). As metas saem do corpo da pessoa e ela pode ajustar. */
  function perfilNovo() {
    const meta0 = (user && user.user_metadata) || {};
    const D = { nome: meta0.full_name || meta0.name || "", sexo: "", nasc: "", alt: "", peso: "", meta: "", obj: "perder", fat: 1.375, m: null };
    let passo = 0;
    const op = (k, v, t) => `<button class="${String(D[k]) === String(v) ? "on" : ""}" data-op="${k}:${v}">${t}</button>`;
    const n = v => parseFloat(String(v).replace(",", "."));
    const perfil = () => ({ nome: D.nome, sexo: D.sexo, nasc: D.nasc, alt: n(D.alt), meta: n(D.meta), obj: D.obj, fat: +D.fat });
    const P = [
      () => `<h1>Bem-vindo(a)!</h1><p>Vamos montar o app com os seus dados, em 5 passos rápidos. Dá para mudar tudo depois em Mais → Metas e perfil.</p>
        <label>Nome completo</label><input id="f_nome" autocomplete="name" value="${esc(D.nome)}"><p class="nota">No app aparece só o primeiro nome.</p>`,
      () => `<h1>Sobre você</h1><p>Sexo e idade entram no cálculo do gasto de energia do corpo.</p>
        <label>Sexo</label><div class="op">${op("sexo", "m", "Masculino")}${op("sexo", "f", "Feminino")}</div>
        <label>Data de nascimento</label><input id="f_nasc" type="date" value="${D.nasc}">`,
      () => `<h1>Suas medidas</h1><p>Se puder, pese-se de manhã, em jejum.</p>
        <label>Altura (cm)</label><input id="f_alt" type="number" inputmode="numeric" value="${D.alt}">
        <label>Peso hoje (kg)</label><input id="f_peso" type="number" inputmode="decimal" step="0.1" value="${D.peso}">`,
      () => `<h1>Seu objetivo</h1><p>O app ajusta as calorias e a proteína pelo objetivo.</p>
        <div class="op">${op("obj", "perder", "Perder gordura")}${op("obj", "manter", "Manter o peso")}${op("obj", "ganhar", "Ganhar massa")}</div>
        <label>Peso que quer alcançar (kg)</label><input id="f_meta" type="number" inputmode="decimal" step="0.1" value="${D.meta}">
        <label>Quanto você se exercita</label><div class="op">${op("fat", 1.2, "Quase nada")}${op("fat", 1.375, "1 a 3 vezes por semana")}${op("fat", 1.55, "3 a 5 vezes")}${op("fat", 1.725, "6 ou mais")}</div>`,
      () => `<h1>Suas metas</h1><p>Calculadas pelo seu corpo e pelo objetivo. Ajuste se o seu médico ou nutricionista indicou outros valores.</p>
        <div class="g2"><div><label>Calorias (kcal)</label><input id="f_kcal" inputmode="numeric" value="${D.m.kcal}"></div><div><label>Proteína (g)</label><input id="f_prot" inputmode="numeric" value="${D.m.prot}"></div>
        <div><label>Água (L)</label><input id="f_agua" inputmode="decimal" value="${String(D.m.agua).replace(".", ",")}"></div><div><label>Passos por dia</label><input id="f_passos" inputmode="numeric" value="${D.m.passos}"></div></div>
        <label>Calorias ativas por dia (kcal)</label><input id="f_kat" inputmode="numeric" value="${D.m.kat}">
        <p class="nota">Água: peso × ml por kg conforme a idade (até 17 anos: 40; 18 a 55: 35; 56 a 65: 30; 66 ou mais: 25).</p>`
    ];
    const ler = el => { el.querySelectorAll("input[id^=f_]").forEach(i => { const k = i.id.slice(2); if (k in D) D[k] = i.value.trim(); else if (D.m) D.m[k] = i.value.trim() }) };
    const valida = () => {
      const p = perfil(), pe = n(D.peso);
      if (passo === 0 && D.nome.split(/\s+/).filter(Boolean).length < 2) return "Informe o nome completo (nome e sobrenome).";
      if (passo === 1) { if (!D.sexo) return "Escolha o sexo."; const id = D.nasc ? (Date.now() - new Date(D.nasc + "T00:00:00")) / 31557600000 : 0; if (!(id >= 10 && id <= 100)) return "Informe uma data de nascimento válida." }
      if (passo === 2 && (!(p.alt > 100 && p.alt < 230) || !(pe > 30 && pe < 300))) return "Informe altura (em cm) e peso válidos.";
      if (passo === 3) { if (!(p.meta > 30 && p.meta < 300)) return "Informe o peso que quer alcançar."; if (D.obj === "perder" && p.meta >= pe) return "Para perder gordura, a meta precisa ser menor que o peso de hoje."; if (D.obj === "ganhar" && p.meta <= pe) return "Para ganhar massa, a meta precisa ser maior que o peso de hoje." }
      if (passo === 4) { const m = D.m; if (!(n(m.kcal) >= 1000 && n(m.kcal) <= 5000) || !(n(m.prot) >= 30 && n(m.prot) <= 300) || !(n(m.agua) >= 1 && n(m.agua) <= 6) || !(n(m.passos) >= 1000 && n(m.passos) <= 40000) || !(n(m.kat) >= 50 && n(m.kat) <= 3000)) return "Confira as metas: algum valor está fora do normal." }
      return "";
    };
    const render = () => {
      const el = tela(`<div class="dots">${P.map((_, i) => `<i class="${i <= passo ? "on" : ""}"></i>`).join("")}</div>${P[passo]()}
        <button class="pri" id="f_ok">${passo === P.length - 1 ? "Começar" : "Continuar"}</button>${passo ? `<button class="lnk" id="f_volta">Voltar</button>` : ""}<div class="msg"></div>`);
      el.querySelectorAll("[data-op]").forEach(b => b.onclick = () => { ler(el); const [k, v] = b.dataset.op.split(":"); D[k] = v; if (k === "obj" && v === "manter" && !D.meta) D.meta = D.peso; render() });
      const volta = el.querySelector("#f_volta"); if (volta) volta.onclick = () => { ler(el); passo--; render() };
      el.querySelector("#f_ok").onclick = async () => {
        ler(el); const e = valida(); if (e) { msg(e); return }
        if (passo === 3) { const m = metasPadrao(perfil(), n(D.peso)); D.m = { kcal: m.kcal, prot: m.prot, agua: m.agua, passos: m.passos, kat: m.kat } }
        if (passo < P.length - 1) { passo++; render(); return }
        const pe = n(D.peso), sug = metasPadrao(perfil(), pe), p = Object.assign(perfil(), { kcal: Math.round(n(D.m.kcal)), prot: Math.round(n(D.m.prot)), passos: Math.round(n(D.m.passos)), kat: Math.round(n(D.m.kat)) });
        const ag = Math.round(n(D.m.agua) * 100) / 100; if (Math.abs(ag - sug.agua) > .01) p.agua = ag;
        S = S0(); S.p = p; S.log[hoje()] = { peso: pe }; S._t = Date.now();
        norm(); ready = true; saveLocal(); localStorage.removeItem("mc_blank"); localStorage.setItem("mc_dono", user.id);
        el.querySelector("#f_ok").disabled = true; msg("Salvando…", true);
        await cpush(); fechar(); tab = "inicio"; sub = null; draw();
      };
    };
    render();
  }

  /* ---------- telas ---------- */
  const css = `
  .mcov{position:fixed;inset:0;z-index:100;background:linear-gradient(160deg,#0f766e,#134e4a);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:24px;padding-top:calc(24px + env(safe-area-inset-top));font-family:inherit}
  .mcov .bx{margin:auto 0;background:#fff;border-radius:22px;padding:26px 22px;width:100%;max-width:380px;box-shadow:0 20px 50px rgba(0,0,0,.25);color:#0f172a}
  .mcov h1{font-size:24px;margin:0 0 4px;color:#0f766e}
  .mcov p{margin:0 0 18px;color:#64748b;font-size:14px;line-height:1.45}
  .mcov label{display:block;font-size:13px;font-weight:600;margin:12px 0 6px;color:#334155}
  .mcov{color-scheme:light}
  .mcov input{width:100%;box-sizing:border-box;border:1.5px solid #cbd5e1;border-radius:12px;padding:13px 14px;font-size:16px;background:#f8fafc;color:#0f172a;-webkit-text-fill-color:#0f172a}
  .mcov input::placeholder{color:#94a3b8;-webkit-text-fill-color:#94a3b8}
  .mcov input:-webkit-autofill{-webkit-box-shadow:0 0 0 40px #f8fafc inset}
  .mcov input:focus{outline:none;border-color:#0d9488;background:#fff}
  .mcov button{width:100%;border:0;border-radius:12px;padding:14px;font-size:16px;font-weight:700;margin-top:16px;cursor:pointer}
  .mcov .pri{background:#0d9488;color:#fff}
  .mcov .sec{background:#f1f5f9;color:#0f766e;margin-top:10px}
  .mcov .lnk{background:none;color:#0f766e;font-weight:600;padding:8px;margin-top:6px}
  .mcov .msg{min-height:20px;margin-top:12px;font-size:14px;color:#b91c1c;text-align:center}
  .mcov .msg.ok{color:#047857}
  .mcov .logo{width:56px;height:56px;border-radius:16px;margin-bottom:12px}
  .mcov button:disabled{opacity:.6}
  .mcov .bx{margin-bottom:0}
  .mcov .assin{margin:18px 0 auto;padding-bottom:env(safe-area-inset-bottom);color:rgba(255,255,255,.72);font-size:12px;letter-spacing:.02em;text-align:center}
  .mcov .assin b{color:#fff;letter-spacing:.05em}
  .mcov .op{display:flex;flex-wrap:wrap;gap:8px}
  .mcov .op button{flex:1 1 auto;width:auto;margin:0;background:#f1f5f9;color:#0f766e;padding:12px 10px;font-size:15px}
  .mcov .op button.on{background:#0d9488;color:#fff}
  .mcov .g2{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}
  .mcov .nota{font-size:12.5px;margin:10px 0 0}
  .mcov .dots{display:flex;gap:6px;margin:0 0 14px}
  .mcov .dots i{flex:1;height:5px;border-radius:9px;background:#e2e8f0}
  .mcov .dots i.on{background:#0d9488}
  .mcov .goo{display:flex;align-items:center;justify-content:center;gap:10px;background:#fff;color:#1f2937;border:1.5px solid #cbd5e1}
  .mcov .goo svg{width:20px;height:20px}
  .mcov .ou{display:flex;align-items:center;gap:10px;margin:16px 0 0;color:#94a3b8;font-size:13px}
  .mcov .ou:before,.mcov .ou:after{content:"";flex:1;height:1px;background:#e2e8f0}
  #mctr{z-index:150}
  #mctr .cad{font-size:44px;margin:4px 0 8px}
  .mcacc{display:flex;align-items:center;justify-content:space-between;gap:10px}
  .mcacc small{color:#64748b}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function tela(html) {
    let el = document.getElementById("mcl");
    if (!el) { el = document.createElement("div"); el.id = "mcl"; el.className = "mcov"; document.body.appendChild(el) }
    el.innerHTML = `<div class="bx"><img class="logo" src="icon-192.png" onerror="this.remove()">${html}</div><p class="assin">Criado e desenvolvido por <b>VALLEN TECNOLOGIA</b></p>`;
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
      <div id="mcgoo" hidden><div class="ou">ou</div><button class="goo" id="mcg"><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Entrar com o Google</button></div>
      <div class="msg"></div>`);
    googleLigado().then(ok => { const g = el.querySelector("#mcgoo"); if (ok && g) g.hidden = false });
    el.querySelector("#mcg").onclick = async () => {
      el.querySelectorAll("button").forEach(b => b.disabled = true); msg("Abrindo o Google…", true);
      try { await entrarGoogle() } catch (e) { msg(traduz(e)); el.querySelectorAll("button").forEach(b => b.disabled = false) }
    };
    try { const av = sessionStorage.getItem("mc_aviso"); if (av) { msg(av); sessionStorage.removeItem("mc_aviso") } } catch (x) {}
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



  /* ---------- fotos fora do Claude (site e iPhone) ----------
     O app original só salvava fotos no Claude ou no app nativo. Aqui elas são
     reduzidas e guardadas junto com os dados da conta. */
  async function reduzir(f, max, q) {
    try { return await shrink(f, max, q) } catch (e) {}
    const url = URL.createObjectURL(f);
    try {
      const img = await new Promise((ok, erro) => { const i = new Image(); i.onload = () => ok(i); i.onerror = erro; i.src = url });
      const sc = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.naturalWidth * sc); cv.height = Math.round(img.naturalHeight * sc);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      return cv.toDataURL("image/jpeg", q);
    } finally { URL.revokeObjectURL(url) }
  }
  if (!NATIVE) {
    window.NATIVE_PHOTO = async f => {
      try {
        const pos = document.getElementById("fpo");
        S.fotos = S.fotos || [];
        S.fotos.push({ d: td(), id: await reduzir(f, 800, .72), p: pos ? pos.value : "" });
        sv(); draw(1); toast("📷 Foto salva");
      } catch (e) { toast("Não consegui salvar a foto.") }
    };
    upPh = async function (id, f) {
      try {
        S.tr.ph = S.tr.ph || {};
        S.tr.ph[id] = await reduzir(f, 520, .72);
        sv(); draw(1);
        if (typeof SH !== "undefined" && SH && SH.k == "ex") renderSheet();
        toast("📷 Foto salva");
      } catch (e) { toast("Não consegui salvar a foto.") }
    };
  }

  /* ---------- conta na tela "Nuvem e backup" ---------- */
  const bk0 = bkV;
  bkV = function () {
    const conta = user ? `<div class="c mcacc"><div><small>Conectado como</small><br><b>${esc(user.email || "")}</b></div><button id="mcout">Sair</button></div>` : "";
    return conta + bk0();
  };
  /* tira os dados desta pessoa do aparelho (no "Sair" e quando a conta deixou de existir) */
  async function limparAparelho() {
    try { localStorage.removeItem(KEY); localStorage.removeItem("mc_dono"); localStorage.setItem("mc_blank", "1") } catch (x) {}
    try { if (window.Capacitor && Capacitor.Plugins.Preferences) await Capacitor.Plugins.Preferences.remove({ key: KEY }) } catch (x) {}
  }
  /* A conta foi excluída no servidor, mas o aparelho ainda tinha a sessão: sai e volta para o login com aviso. */
  let saindo = false;
  async function contaSumiu() {
    if (saindo) return; saindo = true;
    clearTimeout(ctimer); ready = false;
    try { await sb.auth.signOut({ scope: "local" }) } catch (x) {}
    await limparAparelho();
    try { sessionStorage.setItem("mc_aviso", "Esta conta não existe mais. Entre com outra conta ou crie uma nova.") } catch (x) {}
    location.reload();
  }
  /* Sair: envia o que falta, encerra a sessão e não deixa os dados desta pessoa no aparelho. */
  async function sair() {
    clearTimeout(ctimer); try { await cpush() } catch (x) {}
    try { await sb.auth.signOut() } catch (x) { try { await sb.auth.signOut({ scope: "local" }) } catch (y) {} }
    try { localStorage.removeItem(TRV) } catch (x) {}
    await limparAparelho();
    location.reload();
  }
  document.addEventListener("click", e => {
    if (e.target && e.target.id === "mcout") { e.target.disabled = true; e.target.textContent = "Saindo…"; sair() }
  });

  /* ---------- login com o Google ----------
     O botão só aparece quando o Google está ligado no Supabase (Authentication → Providers).
     No APK, o Google abre no navegador e volta para o app pelo link com.andremeucorpo.app://login. */
  const VOLTA_APP = "com.andremeucorpo.app://login";
  const VOLTA_SITE = "https://novamenteecv.github.io/meu-corpo-web/volta.html";   // o Chrome só abre o app a partir de uma página, então o Google volta para cá primeiro
  async function googleLigado() {
    try { const r = await fetch(SB_URL + "/auth/v1/settings", { headers: { apikey: SB_KEY } }); const j = await r.json(); return !!(j.external && j.external.google) } catch (e) { return false }
  }
  async function entrarGoogle() {
    const nat = !!window.NATIVE;
    const { data, error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: nat ? VOLTA_SITE : location.origin + location.pathname, skipBrowserRedirect: nat, queryParams: { prompt: "select_account" } } });
    if (error) throw error;
    if (nat && data && data.url) location.href = data.url;   // o Capacitor abre fora do app, no navegador
  }
  async function voltaDoGoogle(url) {
    if (!url || url.indexOf(VOLTA_APP) !== 0) return;
    const u = new URL(url.replace(VOLTA_APP, "https://app/login")), h = new URLSearchParams(u.search.slice(1) + "&" + u.hash.slice(1)), code = h.get("code");
    try {
      if (code) { const r = await sb.auth.exchangeCodeForSession(code); if (r.error) throw r.error }
      else if (h.get("access_token")) { const r = await sb.auth.setSession({ access_token: h.get("access_token"), refresh_token: h.get("refresh_token") }); if (r.error) throw r.error }
      else if (h.get("error_description") || u.searchParams.get("error_description")) msg(h.get("error_description") || u.searchParams.get("error_description"));
    } catch (e) { msg(traduz(e)) }
  }
  if (window.NATIVE && window.Capacitor && Capacitor.Plugins.App) {
    try { Capacitor.Plugins.App.addListener("appUrlOpen", d => voltaDoGoogle(d && d.url)) } catch (e) {}
    try { Capacitor.Plugins.App.getLaunchUrl().then(d => voltaDoGoogle(d && d.url)).catch(() => {}) } catch (e) {}
  }

  /* ---------- trava com digital, rosto ou Face ID ----------
     Vale por aparelho (mc_trava no localStorage, não vai para a nuvem). No APK usa o plugin nativo Biometria;
     no site (iPhone) usa o Face ID ou o Touch ID pelo WebAuthn. */
  const TRV = "mc_trava";
  const trava = () => { try { return JSON.parse(localStorage.getItem(TRV)) } catch (e) { return null } };
  const BIO = () => window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.Biometria;
  const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const unb64 = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  const desafio = () => crypto.getRandomValues(new Uint8Array(32));
  async function travaDisponivel() {
    if (window.NATIVE) { try { return !!(BIO() && (await BIO().disponivel()).disponivel) } catch (e) { return false } }
    try { return !!(window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) } catch (e) { return false }
  }
  async function confirmar() {
    const t = trava(); if (!t) return true;
    if (t.tipo === "nativo") return !!(await BIO().verificar({ titulo: "Meu Corpo", subtitulo: "Confirme que é você para abrir" })).ok;
    return !!(await navigator.credentials.get({ publicKey: { challenge: desafio(), allowCredentials: [{ type: "public-key", id: unb64(t.id) }], userVerification: "required", timeout: 60000 } }));
  }
  async function ligarTrava() {
    if (window.NATIVE) {
      const r = await BIO().verificar({ titulo: "Ativar a trava", subtitulo: "Confirme com a digital, o rosto ou o bloqueio de tela" });
      if (!r.ok) return false;
      localStorage.setItem(TRV, JSON.stringify({ tipo: "nativo" })); return true;
    }
    const c = await navigator.credentials.create({ publicKey: { challenge: desafio(), rp: { name: "Meu Corpo", id: location.hostname }, user: { id: crypto.getRandomValues(new Uint8Array(16)), name: (user && user.email) || "meucorpo", displayName: (S.p && S.p.nome) || "Meu Corpo" }, pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }], authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "discouraged" }, attestation: "none", timeout: 60000 } });
    if (!c) return false;
    localStorage.setItem(TRV, JSON.stringify({ tipo: "web", id: b64(c.rawId) })); return true;
  }
  let travado = false, escondido = 0;
  function travar() {
    if (!trava() || !user || travado) return;
    travado = true;
    let el = document.getElementById("mctr");
    if (!el) { el = document.createElement("div"); el.id = "mctr"; el.className = "mcov"; document.body.appendChild(el) }
    el.innerHTML = `<div class="bx" style="text-align:center"><div class="cad">🔒</div><h1>Meu Corpo</h1><p>Confirme que é você para abrir.</p><button class="pri" id="mcdes">${window.NATIVE ? "Usar digital ou rosto" : "Usar Face ID"}</button><button class="lnk" id="mcsen">Sair e entrar com a senha</button><div class="msg" id="mctrm"></div></div><p class="assin">Criado e desenvolvido por <b>VALLEN TECNOLOGIA</b></p>`;
    const aviso = t => { const m = el.querySelector("#mctrm"); if (m) m.textContent = t };
    const tenta = async () => {
      try { if (await confirmar()) { travado = false; el.remove() } else aviso("Não foi possível confirmar. Toque para tentar de novo.") }
      catch (e) { aviso("Não foi possível confirmar. Toque para tentar de novo.") }
    };
    el.querySelector("#mcdes").onclick = tenta;
    el.querySelector("#mcsen").onclick = () => { el.querySelector("#mcsen").textContent = "Saindo…"; sair() };
    if (window.NATIVE) setTimeout(tenta, 250);   // no Android já abre a digital; no iPhone o Face ID precisa de um toque
  }
  /* usado em Metas e perfil */
  window.MC_TRAVA = {
    ativa: () => !!trava(),
    async alternar() {
      if (trava()) { localStorage.removeItem(TRV); toast("Trava desligada"); draw(1); return }
      if (window.NATIVE ? !(await travaDisponivel()) : !window.PublicKeyCredential) { toast(window.NATIVE ? "Cadastre uma digital, rosto ou bloqueio de tela no celular primeiro." : "Este navegador não tem Face ID ou Touch ID disponível para o app."); return }
      try { if (await ligarTrava()) { toast("🔒 Trava ligada"); draw(1) } else toast("Não foi possível confirmar.") } catch (e) { toast("Não foi possível ligar a trava.") }
    }
  };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) escondido = Date.now();
    else if (escondido && Date.now() - escondido > 60000) travar();   // ficou mais de 1 minuto fora do app
  });

  /* ---------- sessão ---------- */
  let ultimo = null;
  sb.auth.onAuthStateChange((ev, session) => {
    const u = session && session.user;
    if (u && (!ultimo || ultimo !== u.id)) {
      ultimo = u.id; user = u; ready = false; fechar();
      // confere no servidor se a conta ainda existe (sem internet, segue normal)
      sb.auth.getUser().then(r => { const e = r && r.error; if (e && (e.status === 401 || e.status === 403 || e.status === 404 || /not exist|not found/i.test(e.message || ""))) contaSumiu() }).catch(() => {});
      travar();
      setSy("sincronizando…"); cpull(true);
    } else if (!u) {
      ultimo = null; user = null; ready = false;
      telaLogin();
    }
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && user && ready) cpull(false) });
})();
