// Handlers Web Push — importé dans le service worker généré par Workbox
// (voir vite.config.ts > workbox.importScripts).

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_e) {
    data = { title: "SamaBoutique", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "SamaBoutique";
  const options = {
    body: data.body || "",
    icon: data.icon || "/pwa-192x192.png",
    badge: data.badge || "/pwa-192x192.png",
    tag: data.tag || "samaboutique",
    renotify: true,
    data: { url: data.url || "/", category: data.category || "system" },
    vibrate: [80, 40, 80],
    timestamp: data.timestamp || Date.now(),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Si un onglet de l'app est déjà ouvert, on le focus et on navigue
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) {
            try { client.navigate(targetUrl); } catch (_e) { /* ignore */ }
          }
          return;
        }
      }
      // Sinon on ouvre une nouvelle fenêtre
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
