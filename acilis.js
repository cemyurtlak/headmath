// HeadMath (web sürümü) - süslü açılış ekranı (BAŞLA ve yükleniyor ekranı).
// Hareketli renk geçişi, yukarı süzülen matematik sembolleri, zıplayan parlak başlık,
// dalga halkaları yayan BAŞLA düğmesi ve "nasıl oynanır" rozetleri çizer.

const FONT = 'system-ui, "Segoe UI", Roboto, Arial, sans-serif';
const SEMBOLLER = ["+", "−", "×", "÷", "=", "√", "π", "²", "%", "1", "2", "3", "5", "7", "9", "∑", "?"];
const RENKLER = ["#f1c40f", "#2ecc71", "#3498db", "#e91e63", "#ff9800", "#9b59b6", "#1abc9c"];
const BASLIK = "HeadMath";

let parcaciklar = null;
let oncekiZaman = null;

function rastgele(a, b) { return a + Math.random() * (b - a); }

function parcacikOlustur(W, H, rastgeleY = true) {
  return {
    sembol: SEMBOLLER[Math.floor(Math.random() * SEMBOLLER.length)],
    renk: RENKLER[Math.floor(Math.random() * RENKLER.length)],
    x: rastgele(0, W),
    y: rastgeleY ? rastgele(0, H) : H + 60,
    boyut: rastgele(26, 70),
    hiz: rastgele(18, 55),            // piksel / sn, yukarı
    salinim: rastgele(0, Math.PI * 2),
    donus: rastgele(-0.6, 0.6),       // radyan / sn
    aci: rastgele(0, Math.PI * 2),
    saydamlik: rastgele(0.12, 0.35),
  };
}

function yuvarlakDikdortgen(c, x, y, w, h, r) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

/** Açılış ekranını çizer. durum: "BASLAT" ya da "YUKLENIYOR". t: saniye. */
export function acilisCiz(c, W, H, t, durum, yukleme) {
  const dt = oncekiZaman === null ? 0 : Math.min(0.1, t - oncekiZaman);
  oncekiZaman = t;
  if (!parcaciklar) parcaciklar = Array.from({ length: 30 }, () => parcacikOlustur(W, H));

  // ---------- arka plan: yavaşça dönen renk geçişi ----------
  const a = t * 0.15;
  const g = c.createLinearGradient(W / 2 + Math.cos(a) * W, H / 2 + Math.sin(a) * H,
                                   W / 2 - Math.cos(a) * W, H / 2 - Math.sin(a) * H);
  g.addColorStop(0, "#0f1b3d");
  g.addColorStop(0.5, "#1b1240");
  g.addColorStop(1, "#06243a");
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);

  // ortadan yayılan hafif ışık
  const isik = c.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.6);
  isik.addColorStop(0, "rgba(46,204,113,0.18)");
  isik.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = isik;
  c.fillRect(0, 0, W, H);

  // ---------- yukarı süzülen matematik sembolleri ----------
  c.textAlign = "center";
  c.textBaseline = "middle";
  for (const p of parcaciklar) {
    p.y -= p.hiz * dt;
    p.aci += p.donus * dt;
    if (p.y < -80) Object.assign(p, parcacikOlustur(W, H, false));
    const x = p.x + Math.sin(t * 0.8 + p.salinim) * 25;
    c.save();
    c.translate(x, p.y);
    c.rotate(p.aci);
    c.globalAlpha = p.saydamlik;
    c.font = `bold ${p.boyut}px ${FONT}`;
    c.fillStyle = p.renk;
    c.fillText(p.sembol, 0, 0);
    c.restore();
  }

  // ---------- başlık: harfleri tek tek zıplayan, parlayan yazı ----------
  c.font = `900 96px ${FONT}`;
  const harfGen = [...BASLIK].map((h) => c.measureText(h).width);
  const toplam = harfGen.reduce((s, w) => s + w, 0);
  let x = W / 2 - toplam / 2;
  const baslikGrad = c.createLinearGradient(W / 2 - toplam / 2, 0, W / 2 + toplam / 2, 0);
  const kayma = (t * 0.25) % 1;
  ["#f1c40f", "#ff9800", "#e91e63", "#3498db", "#2ecc71"].forEach((r, i, d) =>
    baslikGrad.addColorStop((i / (d.length - 1) + kayma) % 1, r));
  [...BASLIK].forEach((harf, i) => {
    const y = 150 + Math.sin(t * 3 + i * 0.55) * 9;
    c.save();
    c.textAlign = "left";
    c.shadowColor = "rgba(241,196,15,0.75)";
    c.shadowBlur = 22;
    c.lineWidth = 8;
    c.strokeStyle = "rgba(10,14,30,0.9)";
    c.strokeText(harf, x, y);
    c.fillStyle = baslikGrad;
    c.fillText(harf, x, y);
    c.restore();
    x += harfGen[i];
  });

  c.font = `bold 34px ${FONT}`;
  c.fillStyle = "#f0f0f0";
  c.shadowColor = "rgba(0,0,0,0.6)";
  c.shadowBlur = 8;
  c.fillText("Kafanla cevapla!  🧠", W / 2, 232);
  c.shadowBlur = 0;

  // ---------- düğme ----------
  const dg = 420, dy = 120, dx = W / 2 - dg / 2, dyy = 300;
  if (durum === "BASLAT") {
    // dalga halkaları
    for (let k = 0; k < 3; k++) {
      const faz = ((t * 0.7 + k / 3) % 1);
      const genis = 8 + faz * 42;
      c.save();
      c.globalAlpha = (1 - faz) * 0.55;
      c.strokeStyle = "#2ecc71";
      c.lineWidth = 4;
      yuvarlakDikdortgen(c, dx - genis, dyy - genis, dg + genis * 2, dy + genis * 2, 36 + genis);
      c.stroke();
      c.restore();
    }
    const nabiz = 1 + Math.sin(t * 4) * 0.03;
    c.save();
    c.translate(W / 2, dyy + dy / 2);
    c.scale(nabiz, nabiz);
    c.translate(-W / 2, -(dyy + dy / 2));
    // gölge + gövde
    c.shadowColor = "rgba(46,204,113,0.8)";
    c.shadowBlur = 35;
    const govde = c.createLinearGradient(0, dyy, 0, dyy + dy);
    govde.addColorStop(0, "#5ef09a");
    govde.addColorStop(0.55, "#27ae60");
    govde.addColorStop(1, "#1e8449");
    c.fillStyle = govde;
    yuvarlakDikdortgen(c, dx, dyy, dg, dy, 36);
    c.fill();
    c.shadowBlur = 0;
    // üstte parlak şerit
    const parlak = c.createLinearGradient(0, dyy, 0, dyy + dy / 2);
    parlak.addColorStop(0, "rgba(255,255,255,0.55)");
    parlak.addColorStop(1, "rgba(255,255,255,0.05)");
    c.fillStyle = parlak;
    yuvarlakDikdortgen(c, dx + 10, dyy + 6, dg - 20, dy / 2 - 4, 30);
    c.fill();
    // üzerinden geçen ışık
    const isikX = dx - 120 + ((t * 0.6) % 1.6) * (dg + 240) / 1.6;
    c.save();
    yuvarlakDikdortgen(c, dx, dyy, dg, dy, 36);
    c.clip();
    const serit = c.createLinearGradient(isikX - 60, 0, isikX + 60, 0);
    serit.addColorStop(0, "rgba(255,255,255,0)");
    serit.addColorStop(0.5, "rgba(255,255,255,0.45)");
    serit.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = serit;
    c.fillRect(isikX - 60, dyy, 120, dy);
    c.restore();
    // çerçeve
    c.strokeStyle = "rgba(255,255,255,0.9)";
    c.lineWidth = 4;
    yuvarlakDikdortgen(c, dx, dyy, dg, dy, 36);
    c.stroke();
    // ▶ işareti ve yazı
    const ox = W / 2 - 112, oy = dyy + dy / 2;
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.moveTo(ox - 16, oy - 22); c.lineTo(ox + 22, oy); c.lineTo(ox - 16, oy + 22); c.closePath();
    c.fill();
    c.font = `900 60px ${FONT}`;
    c.textAlign = "center";
    c.shadowColor = "rgba(0,0,0,0.35)";
    c.shadowBlur = 6;
    c.fillText("BAŞLA", W / 2 + 28, oy + 2);
    c.shadowBlur = 0;
    c.restore();

    // parıltılar
    for (let k = 0; k < 6; k++) {
      const faz = (t * 0.9 + k / 6) % 1;
      const aci = k * 1.05 + t * 0.3;
      const px = W / 2 + Math.cos(aci) * (dg / 2 + 40), py = dyy + dy / 2 + Math.sin(aci) * (dy / 2 + 35);
      const r = Math.sin(faz * Math.PI) * 9;
      c.save();
      c.translate(px, py);
      c.rotate(t);
      c.fillStyle = `rgba(241,196,15,${Math.sin(faz * Math.PI)})`;
      c.beginPath();
      for (let j = 0; j < 8; j++) {
        const rr = j % 2 ? r * 0.35 : r;
        c.lineTo(Math.cos((j * Math.PI) / 4) * rr, Math.sin((j * Math.PI) / 4) * rr);
      }
      c.closePath();
      c.fill();
      c.restore();
    }
  } else {
    // yükleniyor: dönen renkli halka + mesaj
    const mx = W / 2, my = dyy + 30;
    for (let k = 0; k < 12; k++) {
      const aci = (k / 12) * Math.PI * 2 + t * 4;
      c.globalAlpha = 0.25 + 0.75 * (k / 12);
      c.fillStyle = RENKLER[k % RENKLER.length];
      c.beginPath();
      c.arc(mx + Math.cos(aci) * 34, my + Math.sin(aci) * 34, 7, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    c.font = `bold 32px ${FONT}`;
    c.fillStyle = "#f0f0f0";
    c.textAlign = "center";
    c.fillText(yukleme || "Hazırlanıyor...", W / 2, dyy + 115);
    c.font = `22px ${FONT}`;
    c.fillStyle = "rgba(240,240,240,0.7)";
    c.fillText("İlk açılışta biraz sürebilir", W / 2, dyy + 155);
  }

  // ---------- nasıl oynanır rozetleri ----------
  const rozetler = [["←", "Sola eğil", "#3498db"], ["↑", "Zıpla", "#e91e63"], ["→", "Sağa eğil", "#ff9800"]];
  const rg = 230, rh = 64, ara = 28, rx0 = W / 2 - (rg * 3 + ara * 2) / 2, ry = 500;
  rozetler.forEach(([ikon, yazi, ikonRenk], i) => {
    const rx = rx0 + i * (rg + ara);
    const zip = Math.max(0, Math.sin(t * 2.2 - i * 0.9)) * 6;
    c.fillStyle = "rgba(255,255,255,0.08)";
    yuvarlakDikdortgen(c, rx, ry - zip, rg, rh, 32);
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.25)";
    c.lineWidth = 2;
    c.stroke();
    c.textAlign = "center";
    c.fillStyle = ikonRenk;
    c.beginPath();
    c.arc(rx + 38, ry + rh / 2 - zip, 22, 0, Math.PI * 2);
    c.fill();
    c.font = `900 30px ${FONT}`;
    c.fillStyle = "#ffffff";
    c.fillText(ikon, rx + 38, ry + rh / 2 - zip + 1);
    c.font = `bold 26px ${FONT}`;
    c.fillStyle = "#f0f0f0";
    c.fillText(yazi, rx + rg / 2 + 22, ry + rh / 2 - zip + 1);
  });

  if (durum === "BASLAT") {
    c.font = `22px ${FONT}`;
    c.fillStyle = "rgba(240,240,240,0.75)";
    c.textAlign = "center";
    c.fillText("Başlamak için ekrana dokunun  •  Kamera izni istenirse \"İzin ver\" deyin", W / 2, 640);
  }
  c.font = `18px ${FONT}`;
  c.fillStyle = "rgba(240,240,240,0.4)";
  c.fillText("Önce sınıfını seç, sonra kafanla cevapla!", W / 2, 690);
}
