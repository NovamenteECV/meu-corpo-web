// Ao publicar versão nova, mude o número em CACHE.
// "mc-fotos" é o cache das fotos da conta (nuvem.js): não pode ser apagado ao trocar de versão.
const CACHE = "meucorpo-web-v39";
const BASE = ["./", "index.html", "css/app.css", "js/alimentos.js", "js/app.js", "js/atalhos.js", "js/comida.js", "js/compartilhar.js", "js/corpo.js", "js/dados.js", "js/erros.js", "js/habitos.js", "js/laudo.js", "js/lembretes-web.js", "js/plano.js", "js/relatorio.js", "js/resumo.js", "js/rotina.js", "js/saude.js", "js/telas.js", "js/treino.js", "nuvem.js", "supabase.js", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== "mc-fotos").map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== self.location.origin) return; // nunca guarda dados da nuvem
  if (u.pathname.endsWith("/versao.json")) return; // versão mínima: sempre da rede
  // página: tenta a rede primeiro (pega versão nova), cai no cache sem internet
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put("index.html", cp)); return r; }).catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
    return r;
  })));
});
// Lembretes por notificação (Web Push): a Edge Function meucorpo-lembretes manda {title, body, tag, url}.
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {} } catch (x) { d = { body: e.data ? e.data.text() : "" } }
  e.waitUntil(self.registration.showNotification(d.title || "Vallen Fitness", { body: d.body || "", icon: "icon-192.png", badge: "icon-192.png", tag: d.tag || undefined, data: { url: d.url || "./" } }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(l => {
    for (const c of l) { if ("focus" in c) return c.focus() }
    return self.clients.openWindow(url);
  }));
});
