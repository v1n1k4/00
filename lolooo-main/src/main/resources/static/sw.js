/**
 * CLAEX Service Worker — Suporte a PWA no Android e Cache Offline da Interface.
 *
 * Estratégia:
 *  - Arquivos estáticos (HTML, CSS, JS, ícones): Network-First com fallback para Cache
 *    (garante que o usuário veja sempre a versão mais nova quando online e continue
 *    navegando pelas telas no celular mesmo sem sinal).
 *  - Chamadas de API (/login, /salas, /grade, /form_cadastro-html, /professor):
 *    NUNCA são cacheadas em disco por segurança (dados autenticados não ficam no cache).
 */
const CACHE_NAME = 'claex-pwa-v10';
const STATIC_SHELL = [
  './',
  './index.html',
  './form_login.html',
  './form_cadastro.html',
  './listar_sala.html',
  './form_nova_sala.html',
  './config_sala.html',
  './grade.html',
  './painel_professor.html',
  './tabela_cadastros.html',
  './manifest.json',
  './css/style.css',
  './css/minimal.css',
  './css/brutalist.css',
  './js/api.js',
  './js/claex-notify.js',
  './js/calex-ui.js',
  './js/calex-story.js',
  './img/icon-192.png',
  './img/icon-512.png'
];

const API_PREFIXES = [
  '/login',
  '/form_cadastro-html',
  '/salas',
  '/grade',
  '/materias',
  '/professores',
  '/professor'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (API_PREFIXES.some((p) => url.pathname.startsWith(p))) {
    return; // Nunca cachear respostas da API
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});
