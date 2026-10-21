// HeadMath (web sürümü) - kamera + MediaPipe ile kafa hareketi ve el algılama.
// Python sürümündeki kafa_takip.py ile aynı mantık. İki mod var:
//   kafa modu (varsayılan): Face Landmarker ile kafa eğimi / zıplama
//   el modu (sınıf seçimi): Hand Landmarker ile işaret parmağı ucunun yeri
// Aynı anda yalnızca biri çalışır; böylece tablet yorulmaz.
//
// Not: Görüntü aynalı gösterilir. Bu yüzden bütün x değerleri (1 - x) ile aynalanır;
// oyuncu sağa eğilince ekranda da sağa eğilmiş görünür.

import * as A from "./ayarlar.js";

const SOL_GOZ_DIS = 33, SAG_GOZ_DIS = 263, BURUN_UCU = 1, ALIN = 10, CENE = 152;
const ISARET_PARMAGI_UCU = 8;

export class KafaTakip {
  constructor(video) {
    this.video = video;
    this.yuzAlgilayici = null;
    this.elAlgilayici = null;
    this.elHatasi = "";
    this.elModu = false;
    this.yon = null;
    this.egim = 0;
    this.yukselme = 0;
    this.yuzVar = false;
    this.el = null;            // [x, y] 0-1 arası, aynalı görüntüye göre
    this.burunTaban = null;
    this.ziplamaSayac = 0;
    this.sonVideoZamani = -1;
    this.sonZamanMs = 0;
  }

  /** Kamerayı açar ve modelleri yükler. durumYaz(metin) yükleme mesajı için. */
  async baslat(durumYaz = () => {}) {
    durumYaz("Kamera açılıyor...");
    const akis = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: A.KAMERA_GENISLIK }, height: { ideal: A.KAMERA_YUKSEKLIK } },
      audio: false,
    });
    this.video.srcObject = akis;
    await this.video.play();

    durumYaz("Yapay zekâ modelleri yükleniyor...");
    const { FilesetResolver, FaceLandmarker, HandLandmarker } = await import(`${A.KUTUPHANE}/vision_bundle.mjs`);
    const dosyalar = await FilesetResolver.forVisionTasks(`${A.KUTUPHANE}/wasm`);
    this.yuzAlgilayici = await this._olustur(FaceLandmarker, dosyalar, A.YUZ_MODELI, { numFaces: 3 });
    try {
      this.elAlgilayici = await this._olustur(HandLandmarker, dosyalar, A.EL_MODELI, { numHands: 2 });
    } catch (hata) {
      // El modeli yüklenemezse oyun yine çalışır; sınıf dokunarak seçilir.
      this.elHatasi = String(hata);
      console.warn("El modeli yüklenemedi:", hata);
    }
  }

  /** Önce GPU dener, olmazsa CPU ile açar (bazı tabletlerde GPU desteklenmez). */
  async _olustur(Sinif, dosyalar, model, ek) {
    const yol = model;
    for (const delegate of ["GPU", "CPU"]) {
      try {
        return await Sinif.createFromOptions(dosyalar, {
          baseOptions: { modelAssetPath: yol, delegate },
          runningMode: "VIDEO",
          ...ek,
        });
      } catch (hata) {
        if (delegate === "CPU") throw hata;
        console.warn(`${delegate} açılamadı, CPU deneniyor:`, hata);
      }
    }
  }

  tabaniSifirla() { this.burunTaban = null; }

  elModuAyarla(acik) {
    this.elModu = Boolean(acik) && this.elAlgilayici !== null;
    this.el = null;
    this.yon = null;
  }

  durum() {
    return { yon: this.yon, egim: this.egim, yuzVar: this.yuzVar, el: this.el,
             gozler: this.gozler, burun: this.burun };
  }

  /** Her ekran karesinde çağrılır; kamerada yeni kare varsa algılama yapar. */
  guncelle() {
    const v = this.video;
    if (!this.yuzAlgilayici || v.readyState < 2 || v.currentTime === this.sonVideoZamani) return;
    this.sonVideoZamani = v.currentTime;
    let zamanMs = performance.now();
    if (zamanMs <= this.sonZamanMs) zamanMs = this.sonZamanMs + 1;    // MediaPipe artan zaman damgası ister
    this.sonZamanMs = zamanMs;

    if (this.elModu) this._elIsle(this.elAlgilayici.detectForVideo(v, zamanMs));
    else this._isle(this.yuzAlgilayici.detectForVideo(v, zamanMs));
  }

  _elIsle(sonuc) {
    // Birden fazla el varsa en yukarıda olan (kaldırılmış) parmak seçilir.
    let el = null;
    for (const noktalar of sonuc.landmarks || []) {
      const uc = noktalar[ISARET_PARMAGI_UCU];
      if (!el || uc.y < el[1]) el = [1 - uc.x, uc.y];
    }
    this.el = el;
    this.yon = null;
  }

  _isle(sonuc) {
    const w = this.video.videoWidth || A.KAMERA_GENISLIK;
    const h = this.video.videoHeight || A.KAMERA_YUKSEKLIK;
    const yuzler = sonuc.faceLandmarks || [];
    if (!yuzler.length) {
      this.yuzVar = false;
      this.gozler = null;
      this.yon = null;
      this.ziplamaSayac = 0;
      return;
    }
    // En büyük yüzü (kameraya en yakın kişiyi) seç
    const boy = (y) => Math.abs(y[CENE].y - y[ALIN].y);
    const yuz = yuzler.reduce((a, b) => (boy(b) > boy(a) ? b : a));

    let p1 = [(1 - yuz[SOL_GOZ_DIS].x) * w, yuz[SOL_GOZ_DIS].y * h];
    let p2 = [(1 - yuz[SAG_GOZ_DIS].x) * w, yuz[SAG_GOZ_DIS].y * h];
    if (p1[0] > p2[0]) [p1, p2] = [p2, p1];                 // p1 ekranın solundaki göz olsun
    // Ekranda sola eğilince soldaki göz aşağı iner -> pozitif açı
    const egim = (Math.atan2(p1[1] - p2[1], p2[0] - p1[0]) * 180) / Math.PI;

    const yuzBoyu = Math.max(boy(yuz), 1e-3);
    const burunY = yuz[BURUN_UCU].y;
    if (this.burunTaban === null) this.burunTaban = burunY;
    const yukselme = (this.burunTaban - burunY) / yuzBoyu;  // + : yukarı çıktı

    if (yukselme > A.ZIPLAMA_ESIGI) {
      this.ziplamaSayac += 1;
    } else {
      this.ziplamaSayac = 0;
      // Kişi yavaşça yer değiştirirse taban da yavaşça takip etsin
      if (Math.abs(egim) < A.NOTR_EGIM_DERECE) this.burunTaban += (burunY - this.burunTaban) * A.TABAN_UYUM_HIZI;
    }

    let yon = null;
    if (this.ziplamaSayac >= A.ZIPLAMA_KARE_SAYISI) yon = "ust";
    else if (egim > A.EGIM_ESIGI_DERECE) yon = "sol";
    else if (egim < -A.EGIM_ESIGI_DERECE) yon = "sag";

    this.yuzVar = true;
    this.egim = egim;
    this.yukselme = yukselme;
    this.yon = yon;
    // Çizim yardımı için (oyun.js gözler arası çizgiyi ve burnu çizer)
    this.gozler = [[p1[0] / w, p1[1] / h], [p2[0] / w, p2[1] / h]];
    this.burun = [1 - yuz[BURUN_UCU].x, burunY];
  }
}
