// Aggiorna subito il service worker senza attendere
self.addEventListener("install", () => self.skipWaiting());

// Prende subito il controllo delle pagine aperte
self.addEventListener("activate", () => clients.claim());

// Strategia: rete prima, cache come fallback
self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
