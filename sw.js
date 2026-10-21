// HeadMath - çevrimdışı çalışma. İlk açılışta oyun dosyalarını, MediaPipe kütüphanesini ve
// modelleri tabletin önbelleğine alır; sonra internet olmasa da oyun açılır.
// Oyunda değişiklik yapınca SURUM numarasını artırın; tabletler bir sonraki internetli
// açılışta yeni sürümü alır.
const SURUM = "headmath-v4";
const KUTUPHANE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21";
const MODELLER = "https://storage.googleapis.com/mediapipe-models";
const DOSYALAR = [
  "./", "index.html", "stil.css", "oyun.js", "ayarlar.js", "sorular.js", "takip.js", "manifest.json",
  "simge-192.png", "simge-512.png", "sesler/alkis.mp3", "sesler/zort.mp3", "sesler/dogru_bildin.mp3",
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

// Oyunun kendi dosyaları (html/js/css/json): önce internet, yoksa önbellek. Böylece GitHub'a
// yüklenen düzeltmeler tablete hemen ulaşır, internet yoksa kayıtlı kopya açılır.
// Büyük dosyalar (kütüphane, modeller, sesler, simgeler): önce önbellek, yoksa internet.
// İnen dosya önbelleğe eklenir; kurulumda inemeyen bir dosya sonraki açılışta tamamlanır.
// Yalnızca bu sürümün önbelleğine bakılır; eski sürümlerden kalan dosya kullanılmaz.
const KOD = /\/$|\.(html|js|mjs|css|json)$/;

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const saklanir = SAKLANACAK.some((k) => e.request.url.startsWith(k));
  const kaydet = (c, yanit) => { if (yanit.ok && saklanir) c.put(e.request, yanit.clone()); return yanit; };
  const kendiKodu = url.origin === location.origin && KOD.test(url.pathname);
  e.respondWith(caches.open(SURUM).then((c) => kendiKodu
    ? fetch(e.request).then((y) => kaydet(c, y)).catch(() => c.match(e.request).then((k) => k || Response.error()))
    : c.match(e.request).then((k) => k || fetch(e.request).then((y) => kaydet(c, y)))));
});
