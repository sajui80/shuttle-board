// 앱 셸(화면을 구성하는 파일)만 캐싱합니다.
// 실제 탑승자/명단 데이터는 Firebase에서 매번 최신으로 불러오므로 여기서 캐싱하지 않습니다.
//
// 버전을 올릴 때마다(v3, v4...) 아래 CACHE_NAME 숫자를 반드시 바꿔주세요.
// 그래야 이미 앱을 설치한 휴대폰들도 강제로 최신 버전을 받습니다.
const CACHE_NAME = 'shuttle-board-shell-v3';
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

  const isPageRequest = event.request.mode === 'navigate' || event.request.url.endsWith('index.html') || event.request.url.endsWith('/');

  if (isPageRequest) {
    // 화면(index.html)은 항상 최신 버전을 먼저 시도하고, 오프라인일 때만 저장된 화면을 씁니다.
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(event.request).then((c) => c || caches.match('./index.html')))
    );
  } else {
    // 아이콘 등 잘 안 바뀌는 파일은 저장된 것을 먼저 씁니다.
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
