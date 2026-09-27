# Redesign Spec — Halaman Jurusan (Kompetensi Keahlian) SMKN 1 Cibinong

Mencakup dua tampilan dari screenshot yang kamu kirim: **halaman list** (filter
+ card besar + grid) dan **modal detail jurusan** (contoh: DKV). Token warna
tetap satu keluarga dengan `design.md` (Kontak) — dua dokumen ini harus
menghasilkan halaman yang terasa dari situs yang sama.

---

## 1. Token (konsisten dengan spec Kontak)

| Token | Hex | Peran |
|---|---|---|
| `--color-primary-900` | `#1C398E` | Heading besar |
| `--color-primary-700` | `#1C4E97` | Tombol/filter aktif, bullet, checkmark (sudah dipakai konsisten di modal DKV — pertahankan) |
| `--color-action-600` | `#155DFC` | Elemen interaktif: link, CTA, focus state |
| `--color-action-50` | `#EFF5FC` | Background box highlight (dipakai di "Tentang Program" & "Prospek Karier") |
| `--color-text-heading` | `#101828` | Judul |
| `--color-text-body` | `#364153` | Paragraf |
| `--color-surface` | `#FFFFFF` | Permukaan utama |
| `--color-border` | `#E5E7EB` | Pengganti shadow |

**Hapus:** hijau `#00C950` (dot status di card SIJA yang terpilih di halaman
list) — sama seperti temuan sebelumnya, warna ini tidak match token manapun.

Kabar baiknya: checkmark hijau yang kamu khawatirkan di modal DKV ternyata
**bukan hijau** — setelah dicek pixel-nya, warnanya `#1C4E97` (navy brand
kalian). Jadi checkmark itu aman, tidak perlu diganti warnanya — yang perlu
diperbaiki adalah cara ia dibungkus (lihat §3).

---

## 2. Halaman List — perbaikan

*(ringkas dari analisis sebelumnya, tetap relevan karena screenshot baru
menunjukkan struktur yang sama)*

- **Hapus dot hijau** di pojok card SIJA yang terpilih.
- **Samakan data**: copy bilang "10 program keahlian", grid cuma tampilkan 6.
  Perbaiki angkanya atau lengkapi datanya — pilih salah satu, jangan biarkan
  keduanya beda.
- **Grid kanan**: hapus subjudul yang terpotong ("Rekayasa Perangkat...",
  "Teknik Konstruksi dan..."). Detail lengkap sudah ada di panel kiri — grid
  cukup logo + akronim (SIJA, RPL, DKV, TKJ, TKP, TP), tidak perlu subjudul
  yang akhirnya kepotong.
- **Card besar (kiri)**: ganti background gradient hitam dekoratif dengan foto
  asli kegiatan/siswa jurusan tersebut. Gradient polos tanpa foto terbaca
  sebagai fallback template, bukan pilihan desain.

---

## 3. Modal Detail Jurusan — temuan utama

Ini bagian paling banyak "AI slop"-nya. Tiga pola yang paling terlihat generik:

### a) Card-di-dalam-card untuk list sederhana

Section **"Kompetensi yang Dipelajari"** membungkus tiap baris teks (yang
cuma satu baris: checkmark + kata) ke dalam card putih rounded dengan shadow
sendiri-sendiri. Ini pola "SaaS card kit" — konten yang sebenarnya cuma
daftar sederhana dipaksa jadi 6 card terpisah dengan shadow identik.

**Ganti dengan:** daftar dua kolom polos, tanpa card individual — checkmark
`--color-primary-700` + teks, dipisahkan garis tipis `--color-border` atau
cukup spacing 16px, tanpa shadow dan tanpa background putih terpisah per item.

### b) Emoji sebagai ikon di "Fokus Keahlian"

🎨 🎬 🎞️ 📷 adalah emoji sistem (bukan ikon yang didesain), jadi:
- Renderingnya beda-beda tergantung OS/browser pengunjung (di Windows vs iOS
  bentuknya beda) — nggak terkontrol secara desain.
- Warnanya random (oranye, ungu, biru tua) dan nggak nyambung ke palet brand
  sama sekali.
- Ini salah satu tell paling gampang dikenali sebagai konten yang
  di-generate cepat tanpa asset desain sungguhan.

**Ganti dengan:** ikon SVG line-icon satu set yang konsisten (mis. dari
Lucide/Phosphor, weight sama semua), diwarnai `--color-primary-700`, di atas
background `--color-action-50` — bukan emoji berwarna-warni.

### c) "Fokus Keahlian" duplikat dengan "Kompetensi yang Dipelajari"

Dua section ini isinya tumpang tindih: Video Editing, Animation/Animasi,
Photography/Fotografi muncul di **kedua** section dengan dua bahasa visual
berbeda (checklist card vs icon card). User yang scroll akan bingung: ini
dua hal berbeda atau info yang sama diulang?

**Gabungkan jadi satu section.** Dua opsi:
1. Satu daftar checklist (skill detail, granular) — hapus "Fokus Keahlian".
2. Satu grid ikon ringkas (highlight, 4 item) — hapus "Kompetensi yang
   Dipelajari" yang lebih panjang, pindahkan sisa item sebagai teks biasa di
   paragraf "Tentang Program".

Pilih salah satu, jangan tampilkan dua representasi untuk informasi yang sama
— ini pola duplikasi yang sama seperti temuan di halaman list (card besar vs
grid kanan).

### d) Bullet dot dekoratif di tiap heading section

Titik biru kecil "•" sebelum "Tentang Program", "Kompetensi yang Dipelajari",
"Fokus Keahlian", "Prospek Karier" itu murni dekorasi berulang, tidak
menyampaikan informasi apapun (bukan penomoran urutan, bukan status). Pola
"label/eyebrow dekoratif di atas tiap konten" ini salah satu tell umum
konten AI-generated.

**Hapus bullet dot.** Cukup andalkan ukuran & bold heading untuk membedakan
section — tidak butuh elemen dekoratif tambahan.

### e) Highlight box dipakai untuk semua section

"Tentang Program" dan "Prospek Karier" sama-sama dapat background biru muda
`#EFF5FC`. Kalau semua di-highlight, tidak ada yang benar-benar menonjol.

**Rekomendasi:** sisakan treatment highlight biru itu **hanya untuk "Prospek
Karier"** — karena ini info paling actionable buat siswa/orang tua ("jadi apa
nanti anak saya"). "Tentang Program" cukup jadi paragraf teks biasa di atas
`--color-surface` putih, tanpa box.

### f) Header modal — gradient gelap tanpa foto

Sama seperti card besar di halaman list: banner atas modal pakai gradient
hitam dekoratif kosong. Ganti dengan foto asli aktivitas/karya siswa jurusan
tersebut (untuk DKV misalnya: contoh karya desain siswa) — lebih meyakinkan
untuk mitra industri yang menilai kualitas program.

---

## 4. Struktur modal setelah revisi (ringkas)

```
┌──────────────────────────────────────────┐
│ [ Foto asli jurusan — bukan gradient ]  X │  ← header, radius 12px
│  [logo]  IT badge                         │
│  DKV                                      │
│  Desain Komunikasi Visual                 │
├──────────────────────────────────────────┤
│ Tentang Program                            │  ← heading polos, tanpa bullet dot
│ Paragraf teks biasa, tanpa box.            │
│                                            │
│ Kompetensi yang Dipelajari                 │  ← satu section gabungan,
│ ✓ Desain Grafis      ✓ Ilustrasi Digital   │     daftar dua kolom polos,
│ ✓ Fotografi          ✓ Video Editing       │     ikon SVG konsisten kalau perlu,
│ ✓ Animasi 2D/3D      ✓ Multimedia          │     tanpa card+shadow per item
│ ✓ Digital Imaging    ✓ UI/UX Design        │
│                                            │
│ ╔══════════════════════════════════════╗  │
│ ║ Prospek Karier                        ║  │  ← satu-satunya box highlight
│ ║ Graphic Designer, Illustrator, Video  ║  │     di halaman ini
│ ║ Editor, Animator, Content Creator...  ║  │
│ ╚══════════════════════════════════════╝  │
└──────────────────────────────────────────┘
```

---

## 5. Checklist revisi

- [ ] Hapus dot hijau di halaman list (SIJA card terpilih).
- [ ] Samakan angka "10 program keahlian" dengan jumlah yang benar-benar ditampilkan.
- [ ] Hapus subjudul terpotong di grid kanan halaman list.
- [ ] Ganti gradient hitam di card besar (list) & header modal dengan foto asli.
- [ ] Bongkar card-per-item di "Kompetensi yang Dipelajari" jadi daftar polos tanpa shadow.
- [ ] Ganti emoji di "Fokus Keahlian" dengan ikon SVG satu set yang konsisten warna.
- [ ] Gabungkan "Kompetensi yang Dipelajari" + "Fokus Keahlian" jadi satu section, hapus duplikasi.
- [ ] Hapus bullet dot dekoratif di semua heading section modal.
- [ ] Sisakan box highlight biru hanya untuk "Prospek Karier"; "Tentang Program" jadi teks polos.
