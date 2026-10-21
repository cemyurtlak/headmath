// HeadMath - çevrimdışı çalışma. İlk açılışta oyun dosyalarını, MediaPipe kütüphanesini ve
// modelleri tabletin önbelleğine alır; sonra internet olmasa da oyun açılır.
// Oyunda değişiklik yapınca SURUM numarasını artırın; tabletler bir sonraki internetli
// açılışta yeni sürümü alır.
const SURUM = "headmath-v1";
const KUTUPHANE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21";
const MODELLER = "https://storage.googleapis.com/mediapipe-models";
const DOSYALAR = [
  "./", "index.html", "stil.css", "oyun.js", "ayarlar.js", "sorular.js", "takip.js", "manifest.json",
  "simge-192.png", "simge-512.png", "sesler/alkis.mp3", "sesler/zort.mp3",
  `${KUTUPHANE}/vision_bundle.mjs`,
  `${KUTUPHANE}/wasm/vision_wasm_internal.js`,
  `${KUTUPHANE}/wasm/vision_wasm_internal.wasm`,
  `${MODELLER}/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
  `${MODELLER}/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
];
// Bu adreslerden gelen dosyalar da (ör. eski tabletlerdeki "nosimd" kütüphanesi) önbelleğe alınır.
const SAKLANACAK = [location.origin, "https://cdn.jsdelivr.net", "https://storage.googleapis.com"];

self.addEventListener("install", (e) => {
  // Biri inmezse diğerleri yine saklansın diye dosyalar tek tek eklenir.
  e.waitUntil(caches.open(SURUM)
    .then((c) => Promise.all(DOSYALAR.map((d) => c.add(d).catch((h) => console.warn("Önbelleğe alınamadı:", d, h)))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((adlar) => Promise.all(adlar.filter((a) => a !== SURUM).map((a) => caches.delete(a))))
    .then(() => self.clients.claim()));
});

// Önce önbellek, yoksa internet (inen dosya önbelleğe eklenir).
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((kayitli) => kayitli ||
    fetch(e.request).then((yanit) => {
      if (yanit.ok && SAKLANACAK.some((k) => e.request.url.startsWith(k))) {
        const kopya = yanit.clone();
        caches.open(SURUM).then((c) => c.put(e.request, kopya));
      }
      return yanit;
    })));
});
