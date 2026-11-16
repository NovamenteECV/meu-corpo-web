/* Meu Corpo · erros do app: carregado antes de tudo. Anota na tabela meucorpo_erros a mensagem do erro, o arquivo,
   a linha, a tela, a versão, a plataforma e o navegador, para a Gestão ver. Nenhum dado de saúde vai junto.
   No máximo 5 erros por abertura do app, sem repetir o mesmo.
   Criado e desenvolvido por VALLEN TECNOLOGIA */
(function () {
  const URL = "https://swqjqsdpzwcgtwihwttw.supabase.co/rest/v1/meucorpo_erros", KEY = "sb_publishable_pfKC3mv8VL-trq8Fv8iTqQ_GnklcdDe";
  let n = 0;
  const vistos = new Set();
  const token = () => { try { const k = Object.keys(localStorage).find(x => /^sb-.*-auth-token$/.test(x)); const s = k && JSON.parse(localStorage.getItem(k)); return s && s.access_token && s.expires_at * 1000 > Date.now() ? s.access_token : null } catch (e) { return null } };
  function manda(msg, arquivo, linha) {
    try {
      msg = String(msg || "").replace(/\s+/g, " ").trim().slice(0, 300);
      const arq = String(arquivo || "").split("?")[0].split("/").pop().slice(0, 80), k = msg + "|" + arq + "|" + (linha | 0);
      if (!msg || n >= 5 || vistos.has(k) || /^Script error\.?$/.test(msg)) return;
      vistos.add(k); n++;
      let tela = "";
      try { tela = (typeof tab != "undefined" ? tab : "") + (typeof sub != "undefined" && sub ? "/" + sub : "") } catch (e) {}
      const nativo = !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
      const corpo = JSON.stringify({ msg, arquivo: arq, linha: linha | 0, tela: tela.slice(0, 40), versao: (() => { try { return APP_VER } catch (e) { return null } })(), plataforma: nativo ? "android" : /iPhone|iPad|iPod/.test(navigator.userAgent) ? "iphone" : "web", ua: navigator.userAgent.slice(0, 200) });
      const envia = t => fetch(URL, { method: "POST", keepalive: true, headers: Object.assign({ apikey: KEY, "Content-Type": "application/json", Prefer: "return=minimal" }, t ? { Authorization: "Bearer " + t } : {}), body: corpo });
      const t = token();
      envia(t).then(r => { if (!r.ok && t) envia(null) }).catch(() => {});
    } catch (e) {}
  }
  addEventListener("error", e => { if (e.target && e.target !== window) return; manda(e.message, e.filename, e.lineno) });
  addEventListener("unhandledrejection", e => { const r = e.reason; manda("Promise: " + (r && r.message || r), r && r.fileName, 0) });
  window.MC_ERRO = manda;
})();
