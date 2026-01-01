/* ============================================================
   SERVICE WORKER — CACHE DISABLED
   MindTrap Escape Room
============================================================ */

self.addEventListener("install", () => {
    // Salta subito la fase di waiting
    self.skipWaiting();
});

self.addEventListener("activate", () => {
    // Prende immediatamente il controllo delle pagine aperte
    clients.claim();
});

self.addEventListener("fetch", event => {
    // Nessuna cache: sempre rete, fallback a cache solo se necessario
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
