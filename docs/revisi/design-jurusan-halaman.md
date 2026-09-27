# Revisi Spec — Struktur Halaman Jurusan (Kompetensi Keahlian)

Dokumen sekali-pakai untuk revisi halaman `/jurusan` berdasarkan mockup baru
yang kamu kirim. **Bagian grid card jurusan di mockup ini TIDAK dipakai** —
grid uniform 3-kolomnya itu sebabnya kelihatan melonjong/tidak rata di
screenshot kamu. Untuk grid card, tetap pakai layout lama (card besar kiri +
grid kanan) sesuai `design-jurusan.md` yang sudah dibuat sebelumnya, dengan
tambahan kecil di §4.

Token warna sama seperti 2 dokumen sebelumnya (`design.md`, `design-jurusan.md`):

| Token | Hex |
|---|---|
| `--color-primary-900` | `#1C398E` |
| `--color-primary-700` | `#1C4E97` |
| `--color-action-600` | `#155DFC` |
| `--color-action-50` | `#EFF5FC` |
| `--color-text-heading` | `#101828` |
| `--color-text-body` | `#364153` |
| `--color-surface-muted` | `#F9FAFB` |
| `--color-border` | `#E5E7EB` |

Catatan: filter pill aktif di mockup barumu sudah pakai `#155DFC` — cocok
dengan token `--color-action-600` yang sudah ditetapkan, tidak perlu diubah.

---

## 1. Ruang lingkup revisi ini

**Diambil dari mockup baru** (bagian yang kamu suka, ditambahkan ke halaman):
- Breadcrumb
- 3 card "Keunggulan" (Akreditasi, SMK PK, Teaching Factory)
- Filter kategori (struktur & warnanya sudah oke, cuma dirapikan spacing-nya)
- Section "Fasilitas Praktik Vokasi" (galeri 3 foto)
- CTA banner sebelum footer
- Struktur footer 4 kolom

**Diabaikan dari mockup baru:**
- Grid card jurusan 3-kolom uniform → tetap pakai desain lama (card besar +
  grid kecil kanan) yang sudah direvisi di `design-jurusan.md`.

**Ditambahkan baru (belum ada di manapun):**
- Badge durasi/jenis program per jurusan (BDP 3 Tahun, D1 4 Tahun, dst) —
  dipasang ke card lama, bukan card baru.
- Footer versi navy (bukan abu-abu terang seperti mockup).

---

## 2. Susunan halaman (atas ke bawah)

```
1. Breadcrumb            "Beranda / Program Keahlian"
2. Header halaman         Judul + 1 paragraf pengantar
3. Keunggulan (3 card)     Akreditasi A · SMK PK · Teaching Factory
4. Filter kategori         pill, aktif = --color-action-600
5. Grid jurusan            [pakai desain lama, lihat design-jurusan.md +  §4]
6. Fasilitas Praktik Vokasi  3 foto: lab, bengkel, LSP
7. CTA banner              "Butuh arahan memilih jurusan?"
8. Footer (navy)            4 kolom + copyright bar
```

---

## 3. Section baru: 3 Card Keunggulan

Posisi: langsung di bawah paragraf pengantar, sebelum filter.

- Layout: 3 kolom sejajar (mobile: stack 1 kolom).
- Tiap card: ikon kecil (outline, `--color-primary-700`) + judul bold + 1-2
  baris deskripsi.
- Background card: `--color-surface-muted` (`#F9FAFB`), border tipis
  `--color-border`, radius `12px`, **tanpa shadow**.
- Konten (pertahankan isi dari mockup, cukup rapikan panjang teks supaya 3
  card sama tinggi):
  1. **Akreditasi A Unggul** — Penilaian BAN-SM dengan predikat Sangat Baik,
     standar nasional pendidikan terpenuhi.
  2. **SMK Pusat Keunggulan** — Ditetapkan Kemendikbudristek sebagai
     institusi penggerak link and match industri.
  3. **Teaching Factory (TeFa)** — Sistem bengkel dan lab produksi riil,
     berlisensi sertifikasi BNSP & asosiasi profesi.

---

## 4. Tambahan ke card jurusan lama: badge durasi/jenis program

Card besar (kiri) dan grid kecil (kanan) di `design-jurusan.md` tetap dipakai
apa adanya, tambahkan satu elemen baru: **badge durasi program** di pojok
kanan atas card, sejajar dengan tag "IT"/"Teknik" yang sudah ada.

- Format teks: `<KODE> • <durasi> Tahun` — contoh: `TJKT • 3 Tahun`.
- Untuk program setara diploma, tambahkan suffix: `SIJA • 4 Tahun (Setara D1)`.
- Style: pill kecil, background `--color-action-50`, teks
  `--color-primary-700`, satu style yang sama untuk SEMUA jurusan — termasuk
  BDP (Bisnis Daring & Pemasaran, 3 Tahun) dan program 4-tahun setara D1.
  Jangan buat style berbeda untuk tiap jenis durasi; bedakan cukup lewat teks
  isinya, bukan lewat warna/bentuk badge yang beda-beda.
- Badge ini tambahan, bukan pengganti tag kategori ("IT"/"Teknik") yang sudah
  ada — keduanya tampil berdampingan di baris yang sama.

---

## 5. Section baru: Fasilitas Praktik Vokasi

- Heading + 1 baris subjudul ("Teaching Factory & Standarisasi Industri...").
- Grid 3 kolom (mobile: scroll horizontal atau stack), tiap item:
  - Foto asli fasilitas (bukan placeholder/gradient) — rasio 4:3, radius `12px`.
  - Judul singkat (mis. "Laboratorium Komputer Enterprise").
  - 1-2 baris deskripsi kapasitas/spesifikasi.
- Background section: `--color-surface-muted` untuk membedakan dari section
  grid jurusan di atasnya (putih) — pemisah section pakai perbedaan warna
  background, bukan shadow atau garis tebal.

---

## 6. Section baru: CTA banner

- Satu baris pertanyaan + 2 tombol: outline (WhatsApp) dan solid
  (`--color-action-600`, "Kirim Pesan Pertanyaan").
- Background: `--color-surface-muted`, radius `12px`, padding besar (32-48px).
- Ini pengganti yang lebih relevan dibanding section "Berlangganan" newsletter
  yang sudah kita hapus dari halaman Kontak — pola yang sama bisa dipakai
  konsisten di kedua halaman.

---

## 7. Footer — redesign warna (bagian paling penting dari revisi ini)

Footer di mockup barumu masih background terang (`#FFFFFF`/`#F9FAFB`) dengan
kotak logo kecil. Kamu minta warnanya ikut navbar situs kalian — asumsi saya
navbar pakai `--color-primary-900` (`#1C398E`, navy brand kalian, konsisten
dengan tombol filter aktif & heading di seluruh situs). **Kalau navbar asli
kalian ternyata beda warna, ganti nilai di bawah ini dengan hex navbar yang
sebenarnya — strukturnya tetap sama.**

- Background footer: `--color-primary-900` (`#1C398E`).
- Teks judul kolom ("Alamat & Kontak", "Navigasi Cepat"): putih `#FFFFFF`, bold.
- Teks isi/link: putih dengan opacity ~70% (`rgba(255,255,255,0.7)`), hover
  jadi putih penuh — bukan abu-abu gelap seperti sebelumnya (kontras kurang
  di atas navy).
- Logo "S" di footer: background putih atau `--color-action-50`, ikon logo
  tetap warna aslinya — supaya tetap kebaca di atas navy gelap.
- Garis pemisah antar kolom & sebelum copyright bar: putih opacity 15%
  (`rgba(255,255,255,0.15)`), bukan abu-abu terang.
- Struktur 4 kolom dari mockup **dipertahankan apa adanya**, cuma warnanya
  yang berubah:
  1. Logo + deskripsi singkat sekolah
  2. Alamat & Kontak
  3. Navigasi Cepat
  4. *(opsional, kalau ada)* — jangan tambahkan newsletter/berlangganan di sini
- Copyright bar paling bawah: background sedikit lebih gelap dari footer
  utama (mis. `#152F73`) untuk pemisahan visual halus tanpa garis tegas.

---

## 8. Checklist implementasi

- [ ] Breadcrumb + header halaman ditambahkan.
- [ ] 3 card Keunggulan ditambahkan, tinggi sama rata, tanpa shadow.
- [ ] Filter kategori dirapikan (tinggi & padding pill konsisten), warna aktif tetap `#155DFC`.
- [ ] Grid jurusan TETAP pakai layout lama (card besar + grid kanan) dari `design-jurusan.md`, bukan grid 3-kolom uniform dari mockup baru.
- [ ] Badge durasi/jenis program (`<KODE> • <durasi> Tahun`, + "(Setara D1)" kalau perlu) ditambahkan ke card lama, satu style untuk semua.
- [ ] Section "Fasilitas Praktik Vokasi" ditambahkan dengan foto asli.
- [ ] CTA banner ditambahkan sebelum footer.
- [ ] Footer diganti jadi background navy `#1C398E`, teks putih, struktur 4 kolom dipertahankan.
- [ ] Konfirmasi hex navbar asli — kalau beda dari `#1C398E`, sesuaikan footer.
