// HeadMath (web sürümü) - sınıfa göre soru üretici.
// Python sürümündeki sorular.py ile aynı soruları üretir.
// Her sınıfta "kolay" ve "zor" iki soru havuzu vardır. Sınıf 13 = Öğretmen.

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));   // a ve b dahil
const sec = (liste) => liste[Math.floor(Math.random() * liste.length)];
const sifirsiz = (a, b) => { let x; do { x = R(a, b); } while (x === 0); return x; };
const faktoriyel = (n) => (n <= 1 ? 1 : n * faktoriyel(n - 1));
const komb = (n, r) => faktoriyel(n) / (faktoriyel(r) * faktoriyel(n - r));
const ebob = (a, b) => (b === 0 ? a : ebob(b, a % b));
const mod = (a, b) => ((a % b) + b) % b;

const UST = "⁰¹²³⁴⁵⁶⁷⁸⁹", ALT = "₀₁₂₃₄₅₆₇₈₉";
const us = (n) => String(n).replace(/\d/g, (d) => UST[d]);
const alt = (n) => String(n).replace(/\d/g, (d) => ALT[d]);

/** Negatif sayıyı düzgün eksi işaretiyle yazar: -5 -> −5 */
export const sayi = (n) => (n < 0 ? `−${-n}` : String(n));
const parantez = (n) => (n < 0 ? `(${sayi(n)})` : String(n));
const isaretli = (n) => (n >= 0 ? `+ ${n}` : `− ${-n}`);

const KESIR_EK = { 2: "si", 3: "ü", 4: "ü", 5: "i" };
const YUZDE_EK = { 10: "u", 20: "si", 25: "i", 50: "si" };

// ====================== 1. SINIF ======================
const s1_toplama_10 = () => { const a = R(1, 8), b = R(1, 10 - a); return [`${a} + ${b} = ?`, a + b]; };
const s1_cikarma_10 = () => { const a = R(3, 10), b = R(1, a - 1); return [`${a} − ${b} = ?`, a - b]; };
const s1_toplama_20 = () => { const a = R(5, 12), b = R(3, 20 - a); return [`${a} + ${b} = ?`, a + b]; };
const s1_cikarma_20 = () => { const a = R(11, 20), b = R(2, 9); return [`${a} − ${b} = ?`, a - b]; };
const s1_eksik = () => { const a = R(2, 9), t = R(a + 2, 18); return [`${a} + ? = ${t}`, t - a]; };

// ====================== 2. SINIF ======================
const s2_onluk = () => { const a = R(1, 6) * 10, b = R(1, 9 - a / 10) * 10; return [`${a} + ${b} = ?`, a + b]; };
const s2_iki_bir = () => { const a = R(20, 89), b = R(2, 9); return [`${a} + ${b} = ?`, a + b]; };
const s2_cikarma = () => { const a = R(30, 99), b = R(2, 9); return [`${a} − ${b} = ?`, a - b]; };
const s2_iki_iki = () => { const a = R(15, 60), b = R(11, 99 - a); return [`${a} + ${b} = ?`, a + b]; };
const s2_carpma = () => { const a = sec([2, 3, 4, 5]), b = R(2, 10); return [`${a} × ${b} = ?`, a * b]; };
const s2_ritmik = () => {
  const adim = sec([2, 5, 10]), bas = adim * R(1, 5);
  return [`${bas}, ${bas + adim}, ${bas + 2 * adim}, ?`, bas + 3 * adim];
};

// ====================== 3. SINIF ======================
const s3_carpim = () => { const a = R(2, 9), b = R(2, 9); return [`${a} × ${b} = ?`, a * b]; };
const s3_yuzluk = () => {
  const a = R(1, 5) * 100 + R(1, 9) * 10, b = R(1, 3) * 100 + R(1, 9) * 10;
  return [`${a} + ${b} = ?`, a + b];
};
const s3_bolme = () => { const b = R(2, 9), c = R(2, 9); return [`${b * c} ÷ ${b} = ?`, c]; };
const s3_iki_bir_carpma = () => { const a = R(12, 30), b = R(2, 5); return [`${a} × ${b} = ?`, a * b]; };
const s3_cikarma = () => { const a = R(300, 900), b = R(100, a - 50); return [`${a} − ${b} = ?`, a - b]; };

// ====================== 4. SINIF ======================
const s4_carpma = () => { const a = R(12, 49), b = R(3, 9); return [`${a} × ${b} = ?`, a * b]; };
const s4_bolme = () => { const b = R(3, 9), c = R(11, 30); return [`${b * c} ÷ ${b} = ?`, c]; };
const s4_kesir = () => {
  const p = sec([2, 3, 4, 5]), n = p * R(3, 12);
  return [`${n} sayısının 1/${p}'${KESIR_EK[p]} kaçtır?`, n / p];
};
const s4_kare_cevre = () => { const k = R(3, 15); return [`Kenarı ${k} cm olan karenin çevresi?`, 4 * k]; };
const s4_dikdortgen_alan = () => {
  const a = R(3, 12), b = R(2, 9);
  return [`Kenarları ${a} cm ve ${b} cm. Dikdörtgenin alanı?`, a * b];
};

// ====================== 5. SINIF ======================
const s5_oncelik = () => { const a = R(2, 20), b = R(2, 9), c = R(2, 9); return [`${a} + ${b} × ${c} = ?`, a + b * c]; };
const s5_kesir = () => {
  const p = sec([3, 4, 5]), k = p === 4 ? 3 : R(2, p - 1), n = p * R(2, 10);   // sadeleşmeyen kesir
  return [`${n} sayısının ${k}/${p}'${KESIR_EK[p]} kaçtır?`, (n * k) / p];
};
const s5_yuzde = () => {
  const y = sec([10, 20, 25, 50]), n = sec([40, 60, 80, 120, 200, 240, 300, 400]);
  return [`${n} sayısının %${y}'${YUZDE_EK[y]} kaçtır?`, (n * y) / 100];
};
const s5_bolme = () => { const b = R(3, 9), c = R(21, 99); return [`${b * c} ÷ ${b} = ?`, c]; };
const s5_carpma = () => { const a = R(101, 399), b = R(2, 5); return [`${a} × ${b} = ?`, a * b]; };

// ====================== 6. SINIF ======================
const s6_kare = () => { const a = R(2, 15); return [`${a}² = ?`, a * a]; };
const s6_kup = () => { const a = R(2, 5); return [`${a}³ = ?`, a ** 3]; };
const s6_parantez = () => { const a = R(2, 9), b = R(2, 9), c = R(2, 6); return [`(${a} + ${b}) × ${c} = ?`, (a + b) * c]; };
const s6_ebob = () => {
  const g = R(2, 9), [x, y] = sec([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [3, 7], [2, 7]]);
  return [`EBOB(${g * x}, ${g * y}) = ?`, g];
};
const s6_ekok = () => {
  const [a, b] = sec([[4, 6], [6, 8], [6, 9], [4, 10], [8, 12], [10, 15], [6, 10], [9, 12], [12, 18]]);
  return [`EKOK(${a}, ${b}) = ?`, (a * b) / ebob(a, b)];
};
const s6_tamsayi = () => { const a = R(-15, -2), b = R(2, 20); return [`${sayi(a)} + ${b} = ?`, a + b]; };

// ====================== 7. SINIF ======================
const s7_carpma = () => {
  const a = R(-12, -2), b = R(2, 9);
  return Math.random() < 0.5 ? [`${parantez(a)} × ${b} = ?`, a * b] : [`${b} × ${parantez(a)} = ?`, a * b];
};
const s7_bolme = () => {
  const b = R(2, 9), c = R(2, 12);
  return Math.random() < 0.5
    ? [`${parantez(-b * c)} ÷ ${b} = ?`, -c]
    : [`${parantez(-b * c)} ÷ ${parantez(-b)} = ?`, c];
};
const s7_cikarma = () => { const a = R(-10, 10), b = R(-10, -1); return [`${sayi(a)} − ${parantez(b)} = ?`, a - b]; };
const s7_denklem = () => {
  const x = R(2, 12), a = R(2, 9), b = R(1, 20);
  return [`${a}x + ${b} = ${a * x + b}   ise   x = ?`, x];
};
const s7_yuzde_ters = () => {
  const y = sec([10, 20, 25, 50]), n = sec([20, 40, 60, 80, 100, 200]);
  return [`%${y}'${YUZDE_EK[y]} ${(n * y) / 100} olan sayı kaçtır?`, n];
};

// ====================== 8. SINIF ======================
const s8_us2 = () => { const n = R(3, 8); return [`2${us(n)} = ?`, 2 ** n]; };
const s8_us10 = () => { const n = R(2, 5); return [`10${us(n)} = ?`, 10 ** n]; };
const s8_karekok = () => { const a = R(6, 15); return [`√${a * a} = ?`, a]; };
const s8_us_carpim = () => {
  const a = sec([2, 3, 5]), m = R(2, 6), n = R(2, 6);
  return [`${a}${us(m)} × ${a}${us(n)} = ${a} üzeri kaç?`, m + n];
};
const s8_dogru = () => {
  const m = R(2, 6), c = sifirsiz(-9, 9), x = R(1, 6);
  return [`y = ${m}x ${isaretli(c)} doğrusunda x = ${x} ise y = ?`, m * x + c];
};
const s8_denklem_parantez = () => {
  const x = R(1, 9), a = R(2, 5), b = R(1, 9);
  return [`${a}(x + ${b}) = ${a * (x + b)}   ise   x = ?`, x];
};

// ====================== 9. SINIF ======================
const s9_mutlak = () => { const a = R(-15, -2), b = R(-9, 9); return [`|${sayi(a)}| + |${sayi(b)}| = ?`, Math.abs(a) + Math.abs(b)]; };
const s9_negatif_us = () => { const a = R(-5, -2), n = sec([2, 3]); return [`(${sayi(a)})${us(n)} = ?`, a ** n]; };
const s9_denklem = () => {
  const x = sifirsiz(-9, 9), a = R(2, 7), b = sifirsiz(-20, 20);
  return [`${a}x ${isaretli(b)} = ${sayi(a * x + b)}   ise   x = ?`, x];
};
const s9_kalan = () => { const b = R(3, 9), n = R(20, 99); return [`${n} sayısının ${b} ile bölümünden kalan?`, mod(n, b)]; };
const s9_ardisik = () => { const n = R(5, 40); return [`Ardışık 3 sayının toplamı ${3 * n + 3}. En büyüğü?`, n + 2]; };

// ====================== 10. SINIF ======================
const s10_fonksiyon = () => {
  const a = R(2, 6), b = sifirsiz(-9, 9), k = R(-3, 5);
  return [`f(x) = ${a}x ${isaretli(b)}   ise   f(${sayi(k)}) = ?`, a * k + b];
};
const s10_faktoriyel = () => { const n = R(3, 5); return [`${n}! = ?`, faktoriyel(n)]; };
const s10_faktoriyel_bolme = () => { const n = R(5, 12); return [`${n}! ÷ ${n - 1}! = ?`, n]; };
const s10_permutasyon = () => { const n = R(4, 8); return [`P(${n}, 2) = ?`, n * (n - 1)]; };
const s10_kombinasyon = () => { const n = R(4, 9); return [`C(${n}, 2) = ?`, komb(n, 2)]; };
const s10_polinom = () => {
  const a = sifirsiz(-5, 5), b = sifirsiz(-9, 9), k = R(1, 3);
  const aYazi = `${isaretli(a)}x`.replace("+ 1x", "+ x").replace("− 1x", "− x");
  return [`P(x) = x² ${aYazi} ${isaretli(b)}   ise   P(${k}) = ?`, k * k + a * k + b];
};

// ====================== 11. SINIF ======================
const s11_log2 = () => { const n = R(3, 10); return [`log₂(${2 ** n}) = ?`, n]; };
const s11_log10 = () => { const n = R(2, 6); return [`log(${10 ** n}) = ?`, n]; };
const s11_log3 = () => { const n = R(2, 5); return [`log₃(${3 ** n}) = ?`, n]; };
const s11_kok_toplam = () => {
  const r1 = R(1, 9), r2 = R(1, 9);
  return [`x² − ${r1 + r2}x + ${r1 * r2} = 0   köklerin toplamı?`, r1 + r2];
};
const s11_kok_carpim = () => {
  const r1 = R(1, 9), r2 = R(1, 9);
  return [`x² − ${r1 + r2}x + ${r1 * r2} = 0   köklerin çarpımı?`, r1 * r2];
};

// ====================== 12. SINIF ======================
const s12_turev_kare = () => { const a = R(2, 6), k = R(1, 5); return [`f(x) = ${a}x²   ise   f'(${k}) = ?`, 2 * a * k]; };
const s12_turev_kup = () => { const k = R(1, 4); return [`f(x) = x³   ise   f'(${k}) = ?`, 3 * k * k]; };
const s12_limit = () => { const k = R(1, 5), c = R(1, 9); return [`x → ${k} iken  x² + ${c}  ifadesinin limiti?`, k * k + c]; };
const s12_integral = () => {
  const k = R(2, 6), ek = { 2: "ye", 3: "e", 4: "e", 5: "e", 6: "ya" }[k];
  return [`2x fonksiyonunun 0'dan ${k}'${ek} integrali?`, k * k];
};
const s12_dizi = () => {
  const a1 = R(1, 9), d = R(2, 6), n = sec([10, 15, 20]);
  return [`a₁ = ${a1}, d = ${d}   ise   a${alt(n)} = ?`, a1 + (n - 1) * d];
};

// ====================== ÖĞRETMEN ======================
const ogr_iki_basamak = () => { const a = R(13, 39), b = R(13, 39); return [`${a} × ${b} = ?`, a * b]; };
const ogr_toplam = () => { const n = sec([10, 20, 30, 40, 50, 100]); return [`1 + 2 + 3 + ... + ${n} = ?`, (n * (n + 1)) / 2]; };
const ogr_yuzde = () => {
  const y = sec([15, 35, 45, 75]), n = sec([40, 80, 120, 160, 240]);
  return [`${n} sayısının yüzde ${y}'i kaçtır?`, Math.floor((n * y) / 100)];
};
const ogr_faktoriyel = () => { const n = R(5, 7); return [`${n}! = ?`, faktoriyel(n)]; };
const ogr_log = () => { const n = R(3, 10); return [`log₂(${2 ** n}) = ?`, n]; };
const ogr_kombinasyon = () => { const n = R(5, 9); return [`C(${n}, 3) = ?`, komb(n, 3)]; };
const ogr_kareler = () => { const n = R(4, 8); return [`1² + 2² + ... + ${n}² = ?`, (n * (n + 1) * (2 * n + 1)) / 6]; };

// Sınıf no -> { kolay: [...], zor: [...] }
export const SINIF_SORULARI = {
  1: { kolay: [s1_toplama_10, s1_cikarma_10], zor: [s1_toplama_20, s1_cikarma_20, s1_eksik] },
  2: { kolay: [s2_onluk, s2_iki_bir, s2_cikarma], zor: [s2_iki_iki, s2_carpma, s2_ritmik] },
  3: { kolay: [s3_carpim, s3_yuzluk], zor: [s3_bolme, s3_iki_bir_carpma, s3_cikarma] },
  4: { kolay: [s4_carpma, s4_bolme], zor: [s4_kesir, s4_kare_cevre, s4_dikdortgen_alan] },
  5: { kolay: [s5_oncelik, s5_bolme, s5_carpma], zor: [s5_kesir, s5_yuzde] },
  6: { kolay: [s6_kare, s6_kup, s6_parantez], zor: [s6_ebob, s6_ekok, s6_tamsayi] },
  7: { kolay: [s7_carpma, s7_bolme, s7_cikarma], zor: [s7_denklem, s7_yuzde_ters] },
  8: { kolay: [s8_us2, s8_us10, s8_karekok], zor: [s8_us_carpim, s8_dogru, s8_denklem_parantez] },
  9: { kolay: [s9_mutlak, s9_negatif_us], zor: [s9_denklem, s9_kalan, s9_ardisik] },
  10: { kolay: [s10_fonksiyon, s10_faktoriyel, s10_faktoriyel_bolme], zor: [s10_permutasyon, s10_kombinasyon, s10_polinom] },
  11: { kolay: [s11_log2, s11_log10, s11_log3], zor: [s11_kok_toplam, s11_kok_carpim] },
  12: { kolay: [s12_turev_kare, s12_turev_kup, s12_limit], zor: [s12_integral, s12_dizi] },
  13: { kolay: [ogr_iki_basamak, ogr_toplam, ogr_yuzde], zor: [ogr_faktoriyel, ogr_log, ogr_kombinasyon, ogr_kareler] },
};

/** Doğru cevaba yakın, inandırıcı ve birbirinden farklı yanlış şıklar. */
function yanlisSiklar(dogru, negatifOlabilir, adet = 2) {
  const adaylar = new Set();
  const sapmalar = [1, 2, 3, 5, 10];
  if (Math.abs(dogru) >= 20) sapmalar.push(Math.floor(Math.abs(dogru) / 10), Math.floor(Math.abs(dogru) / 5));
  for (let deneme = 0; adaylar.size < adet && deneme < 100; deneme++) {
    const aday = dogru + sec(sapmalar) * sec([-1, 1]);
    if (aday !== dogru && (negatifOlabilir || aday >= 0)) adaylar.add(aday);
  }
  for (let k = 1; adaylar.size < adet; k++) adaylar.add(dogru + 100 * k);   // güvenlik
  return [...adaylar];
}

function karistir(liste) {
  for (let i = liste.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
  return liste;
}

/** sinif: 1-12, 13 = Öğretmen. zorluk: "kolay" / "zor".
 *  {metin, siklar: [sol, ust, sag], dogruIndex, zorluk} döndürür. */
export function soruUret(sinif, zorluk = "kolay", oncekiMetinler = []) {
  const havuz = SINIF_SORULARI[sinif][zorluk];
  let metin, dogru;
  for (let i = 0; i < 30; i++) {          // aynı oyunda aynı soru tekrar gelmesin
    [metin, dogru] = sec(havuz)();
    if (!oncekiMetinler.includes(metin)) break;
  }
  // Eksi şık yalnızca soruda eksi sayı geçiyorsa çıkar (kalan, log gibi sorularda çıkmasın).
  // 1-5. sınıfta hiç çıkmaz.
  const negatifOlabilir = dogru < 0 || (sinif >= 6 && metin.includes("−"));
  const siklar = karistir([...yanlisSiklar(dogru, negatifOlabilir), dogru]);
  return { metin, siklar, dogruIndex: siklar.indexOf(dogru), zorluk };
}
