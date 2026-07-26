// 앱 셸(화면을 구성하는 파일)만 캐싱합니다.
// 실제 탑승자/명단 데이터는 Firebase에서 매번 최신으로 불러오므로 여기서 캐싱하지 않습니다.
const CACHE_NAME = 'shuttle-board-shell-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
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
  // Firebase 등 외부 API 요청은 캐싱하지 않고 그대로 네트워크로 보냅니다.
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => caches.match('./index.html'));
    })
  );
});
