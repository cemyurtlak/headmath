// HeadMath (web sürümü) - oyun ekranı ve akışı.
// Python sürümündeki main.py ile aynı akış:
//   BASLAT (dokun) → SINIF_SECIM (el ile) → SINIF_SECILDI → KALIBRASYON → SORU ⇄ GERI_BILDIRIM
//   → BITIS (isim) → SKOR_TABLOSU → (Yeni oyuncu) SINIF_SECIM
// Tablet için ek olarak: sınıf kutusuna ve şık kutusuna dokunarak da seçim yapılabilir.

import * as A from "./ayarlar.js";
import { soruUret, sayi } from "./sorular.js";
import { KafaTakip } from "./takip.js";

const W = A.EKRAN_GENISLIK, H = A.EKRAN_YUKSEKLIK;
const FONT = 'system-ui, "Segoe UI", Roboto, Arial, sans-serif';
const F_DEV = `bold 72px ${FONT}`, F_BUYUK = `bold 52px ${FONT}`, F_ORTA = `bold 34px ${FONT}`, F_KUCUK = `24px ${FONT}`;

const ARKA = "rgb(18,24,38)", BEYAZ = "rgb(240,240,240)", GRI = "rgb(120,130,150)", KUTU = "rgb(40,52,80)";
const YESIL = "rgb(46,204,113)", KIRMIZI = "rgb(231,76,60)", SARI = "rgb(241,196,15)";
const renk = (r, a = 1) => `rgba(${r[0]},${r[1]},${r[2]},${a})`;

const YONLER = ["sol", "ust", "sag"];
const YON_ETIKET = { sol: "← SOLA EĞİL", ust: "↑ ZIPLA", sag: "SAĞA EĞİL →" };
const SKOR_ANAHTARI = "headmath_skorlar";
const simdi = () => performance.now() / 1000;
/** Bir işlem belirtilen sürede bitmezse hata verir (tabletlerde takılıp kalmasın diye). */
const zamanAsimi = (soz, sn, ad) => Promise.race([soz, new Promise((_, red) =>
  setTimeout(() => red(new Error(`${ad} ${sn} sn içinde bitmedi`)), sn * 1000))]);

// ======================================================================
class Secici {
  /** Ham kafa yönünü 'kesin seçim'e çevirir (yanlışlıkla seçimi önler). */
  constructor() { this.sifirla(); }
  sifirla() { this.notrBekleniyor = true; this.aday = null; this.baslangic = 0; this.ilerleme = 0; }
  guncelle(yon, t) {
    this.ilerleme = 0;
    if (this.notrBekleniyor) { if (yon === null) this.notrBekleniyor = false; return null; }
    if (yon === "ust") return "ust";             // zıplama zaten birkaç karede doğrulandı
    if (yon === null) { this.aday = null; return null; }
    if (yon !== this.aday) { this.aday = yon; this.baslangic = t; }
    this.ilerleme = Math.min(1, (t - this.baslangic) / A.EGIM_TUTMA_SURESI);
    return this.ilerleme >= 1 ? yon : null;
  }
}

class ElSecici {
  /** El (veya fare) bir kutunun üzerinde yeterince durursa o kutuyu seçer. */
  constructor() { this.sifirla(); }
  sifirla() { this.aday = null; this.baslangic = 0; this.ilerleme = 0; }
  guncelle(kutuNo, t) {
    if (kutuNo === null) { this.sifirla(); return null; }
    if (kutuNo !== this.aday) { this.aday = kutuNo; this.baslangic = t; }
    this.ilerleme = Math.min(1, (t - this.baslangic) / A.EL_TUTMA_SURESI);
    return this.ilerleme >= 1 ? kutuNo : null;
  }
}

// ======================================================================
class Sesler {
  /** Web Audio ile çalar. Tarayıcılar ilk dokunuştan önce ses çalmaya izin vermez;
   *  bu yüzden ac() "Başla" dokunuşunda çağrılır. Dosya yoksa oyun sessiz devam eder. */
  constructor() { this.tamponlar = {}; this.uyarilar = []; this.calan = null; this.ctx = null; }

  /** Ses motorunu açar ve sesleri yükler. Hiçbir adım oyunu bekletmez: bazı Android
   *  tabletlerde resume() veya decodeAudioData() hiç cevap vermeyebiliyor. */
  async ac() {
    if (!A.SES_ACIK) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();   // dokunuş anında oluşturulmalı
    } catch (hata) { this.uyarilar.push(`Ses açılamadı: ${hata}`); return; }
    zamanAsimi(this.ctx.resume(), 3, "Ses motoru").catch((h) => console.warn(h));
    // Bazı tarayıcılar sesi ancak bir sonraki dokunuşta açar
    const ac = () => { if (this.ctx.state !== "running") this.ctx.resume().catch(() => {}); };
    window.addEventListener("pointerdown", ac);
    const liste = [["dogru", A.DOGRU_SESI, true], ["yanlis", A.YANLIS_SESI, true], ["dogru_soz", A.DOGRU_SOZ_SESI, false]];
    await Promise.all(liste.map(async ([ad, yol, zorunlu]) => {
      if (!yol) return;
      try {
        const yanit = await zamanAsimi(fetch(yol), 15, "İndirme");
        if (!yanit.ok) throw new Error(`dosya yok (${yanit.status})`);
        const veri = await yanit.arrayBuffer();
        // Eski tarayıcılar decodeAudioData'yı yalnızca geri çağırmayla destekler
        this.tamponlar[ad] = await zamanAsimi(new Promise((ok, red) => {
          const s = this.ctx.decodeAudioData(veri, ok, red);
          if (s && s.then) s.then(ok, red);
        }), 10, "Ses çözme");
      } catch (hata) {
        if (zorunlu) this.uyarilar.push(`Ses yüklenemedi: ${yol} (${hata.message || hata})`);
      }
    }));
    this.uyarilar.forEach((u) => console.warn(u));
  }

  varMi(ad) { return ad in this.tamponlar; }
  uzunluk(ad) { return this.tamponlar[ad] ? this.tamponlar[ad].duration : 0; }

  cal(ad, enUzun = null) {
    const tampon = this.tamponlar[ad];
    if (!tampon || !this.ctx) return;
    this.durdur();
    const kaynak = this.ctx.createBufferSource();
    const kazanc = this.ctx.createGain();
    kazanc.gain.value = A.SES_SEVIYESI;
    kaynak.buffer = tampon;
    kaynak.connect(kazanc).connect(this.ctx.destination);
    if (enUzun) kaynak.start(0, 0, enUzun); else kaynak.start();
    this.calan = { kaynak, kazanc };
  }

  durdur() {
    if (this.calan) { try { this.calan.kaynak.stop(); } catch (_) { /* zaten bitti */ } this.calan = null; }
  }

  sustur() {   // yavaşça kıs (yeni soruya geçerken)
    if (!this.calan || !this.ctx) return;
    const { kaynak, kazanc } = this.calan, t = this.ctx.currentTime;
    kazanc.gain.setValueAtTime(kazanc.gain.value, t);
    kazanc.gain.linearRampToValueAtTime(0, t + 0.3);
    try { kaynak.stop(t + 0.3); } catch (_) { /* zaten bitti */ }
    this.calan = null;
  }
}

// ======================================================================
function skorlariOku() {
  try { return JSON.parse(localStorage.getItem(SKOR_ANAHTARI)) || []; } catch (_) { return []; }
}

function skorKaydet(isim, puan, sinif) {
  const t = new Date(), iki = (n) => String(n).padStart(2, "0");
  let liste = skorlariOku();
  liste.push({ isim: isim || "İsimsiz", sinif, puan,
               tarih: `${iki(t.getDate())}.${iki(t.getMonth() + 1)}.${t.getFullYear()} ${iki(t.getHours())}:${iki(t.getMinutes())}` });
  liste.sort((a, b) => b.puan - a.puan);
  liste = liste.slice(0, A.SKOR_TABLOSU_BOYUTU);
  try { localStorage.setItem(SKOR_ANAHTARI, JSON.stringify(liste)); } catch (_) { /* gizli sekme vb. */ }
  return liste;
}

const kutu = (x, y, w, h) => ({ x, y, w, h, cx: x + w / 2, cy: y + h / 2 });
const icinde = (k, p) => p && p[0] >= k.x && p[0] <= k.x + k.w && p[1] >= k.y && p[1] <= k.y + k.h;

/** 13 sınıf kutusunun ekrandaki yeri: 5 + 5 + 3 düzeni. */
function sinifKutulari() {
  const gen = 210, yuk = 120, bosluk = 24, kutular = [];
  [5, 5, 3].forEach((adet, satir) => {
    const x0 = Math.floor((W - (adet * gen + (adet - 1) * bosluk)) / 2), y = 165 + satir * (yuk + 30);
    for (let i = 0; i < adet; i++) kutular.push(kutu(x0 + i * (gen + bosluk), y, gen, yuk));
  });
  return kutular;
}

/** Kamera görüntüsünün ekrana yayılacak kısmı (0-1 arası x0, y0, x1, y1). En-boy oranı korunur. */
function kirpmaAlani(kg, ky) {
  const x0 = A.EL_ALAN_YATAY_KENAR, gen = (1 - 2 * x0) * kg;
  const yuk = Math.min(ky, (gen * H) / W), y0 = (ky - yuk) / 2 / ky;
  return [x0, y0, 1 - x0, 1 - y0];
}

const SIK_KUTULARI = [kutu(30, 380, 330, 140), kutu(W / 2 - 165, 172, 330, 120), kutu(W - 360, 380, 330, 140)];
const YENI_OYUNCU_DUGMESI = kutu(W / 2 - 170, 655, 340, 52);

// ======================================================================
class Oyun {
  constructor() {
    this.tuval = document.getElementById("tuval");
    this.c = this.tuval.getContext("2d");
    this.video = document.getElementById("video");
    this.isimKutusu = document.getElementById("isim-kutusu");
    this.isimGirdi = document.getElementById("isim");
    this.sesler = new Sesler();
    this.takip = null;
    this.uyari = "";
    this.yukleme = "";
    this.secici = new Secici();
    this.elSecici = new ElSecici();
    this.sinifKutu = sinifKutulari();
    this.imlec = null;
    this.fare = null;
    this.fareZaman = -10;
    this.bekleyenSes = null;          // [zaman, ses adı, en uzun sn]
    this.yaziZamani = 0;
    this.sinifI = 0;
    this.skorlar = [];
    this.durum = "BASLAT";
    this._olaylariBagla();
    requestAnimationFrame(() => this.dongu());
  }

  elTakibiVar() { return this.takip !== null && this.takip.elAlgilayici !== null; }

  // ------------------------------------------------------------------ olaylar
  _olaylariBagla() {
    const noktaya = (e) => {
      const r = this.tuval.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
    };
    this.tuval.addEventListener("pointermove", (e) => {
      if (e.pointerType === "mouse") { this.fare = noktaya(e); this.fareZaman = simdi(); }
    });
    this.tuval.addEventListener("pointerdown", (e) => this.dokun(noktaya(e)));
    window.addEventListener("keydown", (e) => this.tus(e));
    document.getElementById("isim-form").addEventListener("submit", (e) => { e.preventDefault(); this.isimKaydet(); });
  }

  dokun(p) {
    const d = this.durum;
    if (d === "BASLAT") return this.baslat();
    if (d === "SINIF_SECIM") {
      const i = this.sinifKutu.findIndex((k) => icinde(k, p));
      if (i >= 0) this.sinifSec(i);
    } else if (d === "SORU") {
      const i = SIK_KUTULARI.findIndex((k) => icinde(k, p));
      if (i >= 0) this.cevapla(YONLER[i]);
    } else if (d === "SKOR_TABLOSU" && icinde(YENI_OYUNCU_DUGMESI, p)) {
      this.sinifSecimineGec();
    }
  }

  tus(e) {
    if (this.durum === "BITIS") return;                    // isim kutusu kendi tuşlarını alır
    if (e.key === "f" || e.key === "F") return tamEkranDegistir();
    if (e.key === " " || e.key === "Enter") {
      if (this.durum === "BASLAT") this.baslat();
      else if (this.durum === "SKOR_TABLOSU") this.sinifSecimineGec();
      e.preventDefault();
      return;
    }
    if (this.durum !== "SORU") return;
    const yon = { ArrowLeft: "sol", ArrowRight: "sag", ArrowUp: "ust" }[e.key];
    if (yon) { this.cevapla(yon); e.preventDefault(); }
  }

  // ------------------------------------------------------------------ akış
  async baslat() {
    this.durum = "YUKLENIYOR";
    tamEkranAc();
    this.sesler.ac();          // arka planda; oyun sesleri beklemez
    try {
      const takip = new KafaTakip(this.video);
      await takip.baslat((m) => { this.yukleme = m; });
      this.takip = takip;
    } catch (hata) {
      this.uyari = `Kamera kullanılamıyor (${hata.message || hata}). Dokunarak oynayın.`;
      console.warn(this.uyari);
    }
    this.sinifSecimineGec();
  }

  sinifSecimineGec() {
    this.durum = "SINIF_SECIM";
    this.elSecici.sifirla();
    this.imlec = null;
    if (this.takip) this.takip.elModuAyarla(true);
  }

  sinifSec(i) {
    this.sinifI = i;
    this.durum = "SINIF_SECILDI";
    this.zaman = simdi();
    if (this.takip) this.takip.elModuAyarla(false);       // artık kafa takibi
  }

  yeniOyun() {
    this.puan = 0;
    this.dogruSayisi = 0;
    this.soruListesi = [];
    const zorBaslangic = Math.round(A.SORU_SAYISI * (1 - A.ZOR_SORU_ORANI));
    const metinler = [];
    for (let n = 0; n < A.SORU_SAYISI; n++) {
      const s = soruUret(this.sinifI + 1, n < zorBaslangic ? "kolay" : "zor", metinler);
      metinler.push(s.metin);
      this.soruListesi.push(s);
    }
    this.soruNo = -1;
    if (this.takip) {
      this.takip.tabaniSifirla();
      this.durum = "KALIBRASYON";
      this.zaman = simdi();
    } else {
      this.sonrakiSoru();
    }
  }

  sonrakiSoru() {
    this.bekleyenSes = null;
    this.sesler.sustur();
    this.soruNo += 1;
    if (this.soruNo >= this.soruListesi.length) {
      this.durum = "BITIS";
      this.isimGirdi.value = "";
      this.isimKutusu.hidden = false;
      setTimeout(() => this.isimGirdi.focus(), 50);
      return;
    }
    this.soru = this.soruListesi[this.soruNo];
    this.sure = A.SINIFLAR[this.sinifI][1];
    this.zaman = simdi();
    this.secim = null;
    this.secici.sifirla();
    this.durum = "SORU";
  }

  soruPuani() { return this.soru.zorluk === "zor" ? A.ZOR_PUAN : A.KOLAY_PUAN; }

  cevapla(yon) {
    const tabanPuan = this.soruPuani(), sure = this.sure, t = simdi();
    this.secim = yon ? YONLER.indexOf(yon) : null;
    this.dogruMu = this.secim === this.soru.dogruIndex;
    this.kazanilan = 0;
    if (this.dogruMu) {
      const kalan = Math.max(0, sure - (t - this.zaman));
      const bonus = A.HIZ_BONUSU ? Math.round((tabanPuan * 0.5 * kalan) / sure) : 0;
      this.kazanilan = tabanPuan + bonus;
      this.puan += this.kazanilan;
      this.dogruSayisi += 1;
      // Önce kısa alkış, alkış bitince "DOĞRU BİLDİN!" yazısı (varsa sesli de söylenir).
      this.sesler.cal("dogru", A.ALKIS_EN_UZUN);
      const alkisSuresi = Math.min(this.sesler.uzunluk("dogru"), A.ALKIS_EN_UZUN);
      this.yaziZamani = t + alkisSuresi;
      let yaziSuresi = A.DOGRU_YAZI_SURESI;
      if (this.sesler.varMi("dogru_soz")) {
        this.bekleyenSes = [this.yaziZamani, "dogru_soz", null];
        yaziSuresi = Math.max(yaziSuresi, this.sesler.uzunluk("dogru_soz") + 0.2);
      }
      this.geriBildirimSuresi = Math.max(A.GERI_BILDIRIM_SURESI, alkisSuresi + yaziSuresi);
    } else {
      this.yaziZamani = 0;
      this.geriBildirimSuresi = A.GERI_BILDIRIM_SURESI;
      if (yon !== null || A.SURE_DOLUNCA_ZORT) this.sesler.cal("yanlis");
    }
    this.durum = "GERI_BILDIRIM";
    this.zaman = t;
  }

  isimKaydet() {
    this.isim = this.isimGirdi.value.trim().slice(0, 16);
    this.skorlar = skorKaydet(this.isim, this.puan, A.SINIFLAR[this.sinifI][0]);
    this.isimKutusu.hidden = true;
    this.isimGirdi.blur();
    this.durum = "SKOR_TABLOSU";
  }

  // ------------------------------------------------------------------ sınıf seçimi
  imleciGuncelle(kafa, t) {
    let hedef = null;
    const v = this.video;
    if (kafa.el && v.videoWidth) {
      const [x0, y0, x1, y1] = kirpmaAlani(v.videoWidth, v.videoHeight);
      const hx = ((kafa.el[0] - x0) / (x1 - x0)) * W, hy = ((kafa.el[1] - y0) / (y1 - y0)) * H;
      hedef = [Math.min(Math.max(hx, 0), W - 1), Math.min(Math.max(hy, 0), H - 1)];
    } else if (t - this.fareZaman < 2) {
      hedef = this.fare;
    }
    if (!hedef) this.imlec = null;
    else if (!this.imlec) this.imlec = hedef;
    else {
      const k = A.IMLEC_YUMUSATMA;
      this.imlec = [this.imlec[0] + (hedef[0] - this.imlec[0]) * k, this.imlec[1] + (hedef[1] - this.imlec[1]) * k];
    }
  }

  // ------------------------------------------------------------------ döngü
  dongu() {
    try { this.adim(); } catch (hata) { console.error(hata); }
    requestAnimationFrame(() => this.dongu());
  }

  adim() {
    if (this.takip) this.takip.guncelle();
    const kafa = this.takip ? this.takip.durum() : { yon: null, yuzVar: false, el: null };
    const t = simdi(), d = this.durum;

    if (d === "SINIF_SECIM") {
      this.imleciGuncelle(kafa, t);
      const i = this.sinifKutu.findIndex((k) => icinde(k, this.imlec));
      const secilen = this.elSecici.guncelle(i >= 0 ? i : null, t);
      if (secilen !== null) this.sinifSec(secilen);
    } else if (d === "SINIF_SECILDI" && t - this.zaman >= A.SINIF_SECILDI_SURESI) {
      this.yeniOyun();
    } else if (d === "KALIBRASYON" && t - this.zaman >= A.KALIBRASYON_SURESI) {
      this.sonrakiSoru();
    } else if (d === "SORU") {
      const secilen = this.takip ? this.secici.guncelle(kafa.yon, t) : null;
      if (secilen) this.cevapla(secilen);
      else if (t - this.zaman >= this.sure) this.cevapla(null);   // süre doldu
    } else if (d === "GERI_BILDIRIM") {
      if (this.bekleyenSes && t >= this.bekleyenSes[0]) {
        this.sesler.cal(this.bekleyenSes[1], this.bekleyenSes[2]);
        this.bekleyenSes = null;
      }
      if (t - this.zaman >= this.geriBildirimSuresi) this.sonrakiSoru();
    }
    this.ciz(kafa);
  }

  // ------------------------------------------------------------------ çizim yardımcıları
  yaz(metin, font, r, x, y) {
    const c = this.c;
    c.font = font; c.fillStyle = r; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(metin, x, y);
  }

  yazSigdir(metin, fontlar, r, x, y, enFazla) {
    let f = fontlar[fontlar.length - 1];
    for (const font of fontlar) { this.c.font = font; if (this.c.measureText(metin).width <= enFazla) { f = font; break; } }
    this.yaz(metin, f, r, x, y);
  }

  dikdortgen(k, dolgu, cerceve = null, kalinlik = 2, yaricap = 16) {
    const c = this.c;
    c.beginPath();
    c.roundRect(k.x, k.y, k.w, k.h, yaricap);
    if (dolgu) { c.fillStyle = dolgu; c.fill(); }
    if (cerceve) { c.strokeStyle = cerceve; c.lineWidth = kalinlik; c.stroke(); }
  }

  /** Videoyu aynalı çizer. kaynak: [x0,y0,x1,y1] (0-1, aynalı görüntüye göre). */
  videoCiz(k, kaynak = [0, 0, 1, 1]) {
    const v = this.video, c = this.c;
    if (!v.videoWidth) return false;
    const [x0, y0, x1, y1] = kaynak, vw = v.videoWidth, vh = v.videoHeight;
    c.save();
    c.translate(k.x + k.w, k.y);
    c.scale(-1, 1);
    c.drawImage(v, (1 - x1) * vw, y0 * vh, (x1 - x0) * vw, (y1 - y0) * vh, 0, 0, k.w, k.h);
    c.restore();
    return true;
  }

  kameraCiz(kafa, k) {
    if (!this.takip || !this.videoCiz(k)) {
      this.dikdortgen(k, KUTU, null, 0, 12);
      this.yaz("Kamera yok", F_KUCUK, GRI, k.cx, k.cy);
      return;
    }
    if (kafa.gozler) {   // gözleri birleştiren çizgi ve burun noktası
      const c = this.c, r = kafa.yon ? "rgb(0,255,0)" : "white";
      const nk = (p) => [k.x + p[0] * k.w, k.y + p[1] * k.h];
      const [a, b] = kafa.gozler.map(nk), n = nk(kafa.burun);
      c.strokeStyle = r; c.lineWidth = 3;
      c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.stroke();
      c.fillStyle = r; c.beginPath(); c.arc(n[0], n[1], 6, 0, Math.PI * 2); c.fill();
    }
    if (!kafa.yuzVar) this.yaz("Yüzün görünmüyor - kameraya bak", F_KUCUK, SARI, k.cx, k.y + k.h - 25);
  }

  // ------------------------------------------------------------------ ekranlar
  ciz(kafa) {
    const c = this.c, d = this.durum;
    c.fillStyle = ARKA; c.fillRect(0, 0, W, H);

    if (d === "BASLAT" || d === "YUKLENIYOR") {
      this.yaz("HeadMath", F_DEV, SARI, W / 2, 200);
      this.yaz("Kafanla cevapla!", F_ORTA, BEYAZ, W / 2, 275);
      const dugme = kutu(W / 2 - 200, 360, 400, 110);
      if (d === "BASLAT") {
        const nabiz = 0.85 + 0.15 * Math.sin(simdi() * 4);
        this.dikdortgen(dugme, renk([46, 204, 113], nabiz), BEYAZ, 3, 24);
        this.yaz("BAŞLA", F_BUYUK, BEYAZ, dugme.cx, dugme.cy);
        this.yaz("Başlamak için ekrana dokunun", F_KUCUK, GRI, W / 2, 520);
        this.yaz("Kamera izni istenirse \"İzin ver\" deyin", F_KUCUK, GRI, W / 2, 560);
      } else {
        this.yaz(this.yukleme, F_ORTA, BEYAZ, W / 2, dugme.cy);
        this.yaz("İlk açılışta biraz sürebilir", F_KUCUK, GRI, W / 2, 520);
      }
      return;
    }
    if (d === "SINIF_SECIM") return this.sinifSecimCiz(kafa);
    if (d === "SINIF_SECILDI") {
      const [ad, , r] = A.SINIFLAR[this.sinifI];
      this.yaz(ad, F_DEV, renk(r), W / 2, H / 2 - 40);
      this.yaz("Başarılar!", F_BUYUK, BEYAZ, W / 2, H / 2 + 50);
      return;
    }
    if (d === "KALIBRASYON") {
      const kalan = A.KALIBRASYON_SURESI - (simdi() - this.zaman);
      this.yaz("Hazırlan! Başını DÜZ tut ve kameraya bak", F_ORTA, SARI, W / 2, 80);
      this.kameraCiz(kafa, kutu(W / 2 - 320, 140, 640, 480));
      this.yaz(Math.max(0, kalan).toFixed(1), F_DEV, BEYAZ, W / 2, 670);
      return;
    }
    if (d === "BITIS" || d === "SKOR_TABLOSU") return this.bitisCiz();

    // ---------------- SORU / GERI_BILDIRIM ----------------
    const [ad, sure, r] = A.SINIFLAR[this.sinifI];
    const zorluk = this.soru.zorluk === "zor" ? "Zor" : "Kolay";
    c.fillStyle = renk(r); c.fillRect(0, 0, W, 56);
    this.yaz(`${ad}  •  ${zorluk}  •  ${this.soruPuani()} puan`, F_KUCUK, BEYAZ, 230, 28);
    this.yaz(`Soru ${this.soruNo + 1}/${this.soruListesi.length}`, F_ORTA, BEYAZ, W / 2, 28);
    this.yaz(`Puan: ${this.puan}`, F_ORTA, BEYAZ, W - 150, 28);
    this.yazSigdir(this.soru.metin, [F_BUYUK, F_ORTA], BEYAZ, W / 2, 105, W - 60);

    // süre çubuğu
    const oran = d === "SORU" ? Math.max(0, 1 - (simdi() - this.zaman) / sure) : 0;
    this.dikdortgen(kutu(40, 145, W - 80, 14), KUTU, null, 0, 7);
    if (oran > 0) this.dikdortgen(kutu(40, 145, (W - 80) * oran, 14), oran > 0.5 ? YESIL : oran > 0.25 ? SARI : KIRMIZI, null, 0, 7);

    this.kameraCiz(kafa, kutu(W / 2 - 240, 305, 480, 360));

    SIK_KUTULARI.forEach((k, i) => {
      const yon = YONLER[i];
      let zemin = KUTU;
      if (d === "GERI_BILDIRIM") {
        if (i === this.soru.dogruIndex) zemin = YESIL;
        else if (i === this.secim) zemin = KIRMIZI;
      }
      this.dikdortgen(k, zemin);
      if (d === "SORU" && this.secici.aday === yon && this.secici.ilerleme > 0) {
        this.dikdortgen(kutu(k.x, k.y, k.w * this.secici.ilerleme, k.h), renk(r));
      }
      if (d === "SORU" && kafa.yon === yon) this.dikdortgen(k, null, SARI, 5);
      this.yaz(sayi(this.soru.siklar[i]), F_BUYUK, BEYAZ, k.cx, k.cy - 12);
      this.yaz(this.takip ? YON_ETIKET[yon] : "dokun", F_KUCUK, BEYAZ, k.cx, k.y + k.h - 22);
    });

    if (d === "SORU" && this.secici.notrBekleniyor && this.takip) this.yaz("Başını düzelt", F_KUCUK, SARI, W / 2, 690);

    if (d === "GERI_BILDIRIM" && simdi() >= this.yaziZamani) {   // doğruda alkış bitince çıkar
      let mesaj, mr;
      if (this.dogruMu) [mesaj, mr] = [`DOĞRU BİLDİN!  +${this.kazanilan}`, YESIL];
      else if (this.secim === null) [mesaj, mr] = ["SÜRE DOLDU!", SARI];
      else [mesaj, mr] = ["YANLIŞ!", KIRMIZI];
      c.fillStyle = "rgba(0,0,0,0.75)"; c.fillRect(0, 560, W, 110);
      this.yaz(mesaj, F_DEV, mr, W / 2, 615);
    }
  }

  sinifSecimCiz(kafa) {
    const c = this.c;
    if (this.takip && this.video.videoWidth) {
      this.videoCiz(kutu(0, 0, W, H), kirpmaAlani(this.video.videoWidth, this.video.videoHeight));
      c.fillStyle = "rgba(10,14,25,0.6)"; c.fillRect(0, 0, W, H);
    }
    this.yaz("HeadMath", F_BUYUK, SARI, W / 2, 45);
    this.yaz(this.elTakibiVar() ? "Kaçıncı sınıfsın?  Elini sınıfının üzerinde tut!"
                                : "Kaçıncı sınıfsın?  Sınıfına dokun.", F_ORTA, BEYAZ, W / 2, 112);

    this.sinifKutu.forEach((k, i) => {
      const [ad, , r] = A.SINIFLAR[i];
      this.dikdortgen(k, renk(r, 0.6), null, 0, 18);
      if (this.elSecici.aday === i && this.elSecici.ilerleme > 0) {
        const yuk = k.h * this.elSecici.ilerleme;
        this.dikdortgen(kutu(k.x, k.y + k.h - yuk, k.w, yuk), renk(r), null, 0, 18);
        this.dikdortgen(k, null, SARI, 6, 18);
      } else {
        this.dikdortgen(k, null, BEYAZ, 2, 18);
      }
      this.yazSigdir(ad, [F_ORTA, F_KUCUK], BEYAZ, k.cx, k.cy, k.w - 16);
    });

    if (this.elTakibiVar() && !kafa.el) this.yaz("Elini kaldır, kameraya göster", F_KUCUK, SARI, W / 2, 660);
    if (this.uyari) this.yaz(this.uyari, F_KUCUK, KIRMIZI, W / 2, 695);
    else if (this.takip && !this.elTakibiVar()) this.yaz("El modeli yüklenemedi - sınıfa dokunun", F_KUCUK, KIRMIZI, W / 2, 695);
    else if (this.sesler.uyarilar.length) this.yaz(this.sesler.uyarilar[0], F_KUCUK, GRI, W / 2, 695);

    if (this.imlec) {
      c.beginPath(); c.arc(this.imlec[0], this.imlec[1], 16, 0, Math.PI * 2);
      c.fillStyle = SARI; c.fill(); c.lineWidth = 3; c.strokeStyle = "black"; c.stroke();
    }
  }

  bitisCiz() {
    this.yaz("OYUN BİTTİ", F_DEV, SARI, W / 2, 70);
    this.yaz(`Puanın: ${this.puan}    (${this.dogruSayisi}/${this.soruListesi.length} doğru)`, F_BUYUK, BEYAZ, W / 2, 150);
    if (this.durum === "BITIS") {
      this.yaz("İsmini yaz ve Kaydet'e bas:", F_ORTA, BEYAZ, W / 2, 260);   // kutu HTML ile çiziliyor
      return;
    }
    this.yaz("EN YÜKSEK SKORLAR", F_ORTA, SARI, W / 2, 225);
    const benimSinif = A.SINIFLAR[this.sinifI][0];
    this.skorlar.forEach((s, i) => {
      const ben = s.puan === this.puan && s.isim === (this.isim || "İsimsiz") && (s.sinif || "") === benimSinif;
      const r = ben ? YESIL : BEYAZ, y = 270 + i * 38;
      this.yaz(`${i + 1}.`, F_KUCUK, r, W / 2 - 300, y);
      this.yaz(s.isim, F_KUCUK, r, W / 2 - 120, y);
      this.yaz(s.sinif || "", F_KUCUK, r, W / 2 + 90, y);
      this.yaz(String(s.puan), F_KUCUK, r, W / 2 + 260, y);
    });
    this.dikdortgen(YENI_OYUNCU_DUGMESI, renk([46, 204, 113]), null, 0, 14);
    this.yaz("Yeni oyuncu", F_ORTA, BEYAZ, YENI_OYUNCU_DUGMESI.cx, YENI_OYUNCU_DUGMESI.cy);
  }
}

// ======================================================================
function tamEkranAc() {
  const el = document.documentElement;
  if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().catch(() => {});
}
function tamEkranDegistir() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else tamEkranAc();
}

window.oyun = new Oyun();   // (testler ve hata ayıklama için erişilebilir)
