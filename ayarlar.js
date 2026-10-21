// HeadMath (web sürümü) - tüm ayarlar tek yerde.
// Python sürümündeki ayarlar.py ile aynı adları ve değerleri kullanır.

export const EKRAN_GENISLIK = 1280;   // Oyun bu boyutta çizilir, ekrana sığacak şekilde büyütülür/küçültülür
export const EKRAN_YUKSEKLIK = 720;

// ---------------- Yapay zekâ dosyaları ----------------
// MediaPipe kütüphanesi ve modeller ilk açılışta buralardan iner, sonra tablette saklanır
// (sw.js). Böylece sonraki açılışlarda internet gerekmez.
export const KUTUPHANE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21";
export const YUZ_MODELI = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
export const EL_MODELI = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

// ---------------- Kamera ----------------
export const KAMERA_GENISLIK = 640;
export const KAMERA_YUKSEKLIK = 480;

// ---------------- Kafa hareketi algılama ----------------
export const EGIM_ESIGI_DERECE = 15;    // Kafa bu açıdan fazla eğilirse sağ/sol sayılır
export const EGIM_TUTMA_SURESI = 0.5;   // Seçim için eğimin kaç saniye korunması gerekir
export const ZIPLAMA_ESIGI = 0.25;      // Burun, yüz boyunun bu oranı kadar yukarı çıkarsa "zıplama"
export const ZIPLAMA_KARE_SAYISI = 2;   // Zıplama kaç ardışık karede görülmeli
export const NOTR_EGIM_DERECE = 8;      // Yeni soruya geçmeden önce kafa bu açının altına dönmeli
export const TABAN_UYUM_HIZI = 0.05;    // Burun "normal" yüksekliği ne kadar hızlı güncellenir (0-1)
export const KALIBRASYON_SURESI = 2.0;  // Oyun başında düz durma süresi (sn)

// ---------------- El ile sınıf seçimi ----------------
export const EL_TUTMA_SURESI = 1.5;     // El bir sınıfın üzerinde kaç saniye durursa o sınıf seçilir
export const EL_ALAN_YATAY_KENAR = 0.10;// Kamera görüntüsünün sağından/solundan bu oran kırpılır
export const IMLEC_YUMUSATMA = 0.5;     // El imlecinin titremesini azaltır (0-1)
export const SINIF_SECILDI_SURESI = 1.5;

// ---------------- Sınıflar ----------------
const ILKOKUL = [76, 175, 80], ORTAOKUL = [33, 150, 243], LISE = [255, 152, 0], OGRETMEN = [233, 30, 99];
// Her sınıf: [ekranda yazan ad, soru süresi sn, renk]. Sıra = sınıf numarası (13. = Öğretmen)
export const SINIFLAR = [
  ["1. Sınıf", 15, ILKOKUL], ["2. Sınıf", 15, ILKOKUL], ["3. Sınıf", 15, ILKOKUL], ["4. Sınıf", 15, ILKOKUL],
  ["5. Sınıf", 15, ORTAOKUL], ["6. Sınıf", 15, ORTAOKUL], ["7. Sınıf", 15, ORTAOKUL], ["8. Sınıf", 15, ORTAOKUL],
  ["9. Sınıf", 18, LISE], ["10. Sınıf", 18, LISE], ["11. Sınıf", 18, LISE], ["12. Sınıf", 18, LISE],
  ["Öğretmen", 20, OGRETMEN],
];

// ---------------- Oyun akışı ----------------
export const SORU_SAYISI = 12;
export const ZOR_SORU_ORANI = 0.5;      // Soruların son kısmı "zor" gelir
export const KOLAY_PUAN = 10;
export const ZOR_PUAN = 20;
export const HIZ_BONUSU = true;
export const GERI_BILDIRIM_SURESI = 2.0;
export const SKOR_TABLOSU_BOYUTU = 10;

// ---------------- Sesler ----------------
export const SES_ACIK = true;
export const DOGRU_SESI = "sesler/alkis.mp3";
export const YANLIS_SESI = "sesler/zort.mp3";
export const SES_SEVIYESI = 1.0;
// Doğru cevapta önce alkış çalar, alkış bitince "DOĞRU BİLDİN!" yazısı çıkar.
export const ALKIS_EN_UZUN = 1.5;
export const DOGRU_YAZI_SURESI = 1.2;
export const DOGRU_SOZ_SESI = "sesler/dogru_bildin.mp3"; // İsteğe bağlı; yoksa atlanır
export const SURE_DOLUNCA_ZORT = true;
