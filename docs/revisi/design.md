# Redesign Spec — Halaman Kontak SMKN 1 Cibinong

Dokumen ini jadi acuan untuk membangun ulang halaman `/kontak`. Semua token warna
di bawah diambil langsung dari screenshot situs berjalan (bukan tebakan), supaya
hasil akhir tetap satu keluarga visual dengan halaman lain — bukan palet baru.

---

## 1. Tujuan

- Ganti pola "card menumpuk di atas card + shadow" pada form dengan satu bidang
  yang rata dan tenang.
- Tambahkan peta sekolah sebagai elemen utama (hero), bukan sekadar teks alamat.
- Hilangkan elemen yang terbaca sebagai "AI slop": dot status hijau off-brand,
  shadow bertumpuk, paragraf duplikat, section newsletter generik.
- Tetap satu sistem warna/tipografi dengan halaman Beranda & Jurusan.

---

## 2. Design tokens (diambil dari situs berjalan)

### Warna

Situs kalian sebenarnya sudah punya 2 biru yang konsisten dipakai, cuma belum
diberi "peran" yang jelas. Formalkan jadi token, jangan tambah warna baru:

| Token | Hex | Sumber di situs saat ini | Peran |
|---|---|---|---|
| `--color-primary-900` | `#1C398E` | Judul "Hubungi Kami", heading | Teks heading, elemen non-interaktif yang perlu tegas |
| `--color-primary-700` | `#1C4E97` | Tombol filter "All" aktif | Alternatif heading di atas background terang |
| `--color-action-600` | `#155DFC` | Tombol "Kirim Pesan", ikon sosmed | **Satu-satunya** warna untuk elemen interaktif: tombol, link, focus ring, marker aktif |
| `--color-action-50` | `#EFF6FF` | Background bulatan ikon sosmed | Background lembut untuk ikon/badge |
| `--color-text-heading` | `#101828` | Judul "SMKN 1 Cibinong" | Judul besar di atas putih |
| `--color-text-body` | `#364153` | Paragraf deskripsi | Body text |
| `--color-surface` | `#FFFFFF` | Card form | Permukaan utama |
| `--color-surface-muted` | `#F9FAFB` | Input field | Background input, section alternatif |
| `--color-border` | `#E5E7EB` | (tersirat dari pemisah antar elemen) | Pengganti shadow — lihat §4 |

**Hapus:** hijau `#00C950` (dot status di card Jurusan). Warna ini tidak
punya pasangan di token manapun — itu sebabnya kerasa "nempel", bukan bagian
dari sistem. Tidak dipakai sama sekali di halaman Kontak yang baru.

### Tipografi

- Satu family yang sudah dipakai di situs, dua weight saja: **Bold** untuk
  heading, **Regular** untuk body. Jangan tambah family baru untuk halaman ini.
- Heading halaman: 28–32px / bold / `--color-text-heading`.
- Label field & meta text: 14px / medium / `--color-text-body` — **bukan
  all-caps**. All-caps label adalah salah satu tell AI-generated paling umum.
- Hindari karakter em dash "—" atau pola "Label — keterangan". Kalau perlu
  memisahkan dua info pendek, pakai titik, koma, atau baris baru — bukan tanda pisah panjang.

### Spacing (grid 4px)

Pakai skala tetap, jangan angka acak per komponen:

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`

- Padding dalam card/section: 24px (mobile) / 32px (desktop).
- Jarak antar blok konten (map → info → form): 32px.
- Jarak antar field form: 16px.
- Jarak label ke input: 8px.

### Radius & elevasi (ganti shadow bertumpuk)

Ini yang menjawab keluhan kamu soal form "kayak card di atas card":

- **Radius:** satu nilai untuk semua permukaan sejenis — `12px` untuk card/peta,
  `8px` untuk input & tombol. Jangan campur beberapa radius berbeda di layar yang sama.
- **Elevasi:** hapus `box-shadow` sebagai penanda "ini card". Ganti dengan salah satu:
  1. **Border tipis** `1px solid var(--color-border)`, atau
  2. **Perbedaan warna background** (mis. section putih di atas section `--color-surface-muted`)
  
  Shadow lembut abu-abu di bawah tiap card itu pola default UI-kit ("soft grey
  shadow") — dipakai di mana-mana tanpa fungsi, itu sebabnya kerasa generik.
  Kalau butuh menegaskan satu elemen paling penting di halaman (bukan semua
  elemen), baru boleh pakai shadow tipis **di situ saja** — bukan default semua card.

---

## 3. Konsep layout baru

Pola: **peta sebagai hero, bukan pelengkap.** Form dipisah jadi section sendiri
di bawahnya, bukan ditumpuk di atas card lain.

```
┌────────────────────────────────────────────────────────┐
│  Hubungi Kami                                            │  ← heading halaman
│  Satu baris kalimat kontekstual (jam layanan)             │
├────────────────────────────────────────────────────────┤
│                                                          │
│                  [ PETA — full width ]                  │  ← hero, radius 12px,
│                    📍 marker merah di lokasi sekolah      │     border tipis, TANPA shadow
│                                                          │
├───────────────────────┬──────────────────────────────────┤
│ Info Kontak (kiri)    │  Form Pesan (kanan)                │
│ - Alamat              │  Nama Lengkap                       │
│ - Telepon             │  Email                              │
│ - Email               │  Perihal                            │
│ - Jam layanan         │  Pesan                              │
│ - Ikon sosmed         │  [ Kirim Pesan ]                    │
└───────────────────────┴──────────────────────────────────┘
```

- Peta dan blok info-kontak+form **sama-sama berada di atas
  `--color-surface` (putih)**, dipisahkan hanya oleh whitespace 32px dan
  border tipis di peta — bukan card putih di atas card putih dengan shadow.
- Di layar sempit (mobile): peta tetap di atas, lalu info kontak, lalu form —
  urutan sama, cuma jadi satu kolom.
- Section "Berlangganan" (newsletter) di footer **dihapus dari halaman ini**.
  Gantikan dengan satu tombol WhatsApp langsung di dekat info kontak — lebih
  relevan untuk audiens orang tua siswa di Indonesia daripada form subscribe ala SaaS.
- Paragraf "SMK Negeri 1 Cibinong adalah lembaga pendidikan..." di atas card
  (duplikat dari halaman Profil) **dihapus**. Ganti dengan satu baris jam
  layanan, contoh: `Senin–Jumat, 07.00–15.00 WIB`.

---

## 4. Komponen: Peta

- Gunakan Google Maps embed standar (iframe) dengan titik lokasi:
  `Jl. Raya Karadenan No.7, Karadenan, Kec. Cibinong, Kabupaten Bogor, Jawa Barat 16111`.
- Marker default Google Maps **sudah berwarna merah** — tidak perlu kustomisasi
  tambahan untuk dapat waypoint merah yang kamu maksud.
- Kalau ingin marker custom yang match brand (mis. pin biru `--color-action-600`
  dengan logo sekolah kecil di dalamnya), itu butuh Maps JavaScript API atau
  Mapbox/Leaflet, bukan embed iframe biasa — opsi ini lebih berat untuk
  dikerjakan, pertimbangkan apakah worth it dibanding marker merah default.
- Tinggi peta: 320px (mobile) / 420px (desktop). Radius `12px`, `overflow: hidden`.
- Tambahkan link teks kecil di bawah peta: "Buka di Google Maps" mengarah ke
  URL Maps asli — berguna untuk user yang mau langsung navigasi.

---

## 5. Komponen: Form

Redesign untuk menghilangkan efek "card di atas card":

- Form **tidak** dibungkus card terpisah dengan shadow sendiri. Form adalah
  bagian dari section info-kontak+form yang satu permukaan (`--color-surface`).
- Input field: background `--color-surface-muted` (`#F9FAFB`), border
  `1px solid var(--color-border)`, radius `8px`, padding `12px 16px`. Tidak
  pakai shadow di dalam maupun di luar field.
- Fokus state: border berubah ke `--color-action-600`, tanpa glow/shadow biru
  berlebihan — cukup perubahan warna border 2px.
- Tombol "Kirim Pesan": background `--color-action-600`, teks putih, radius
  `8px`, tanpa gradient, tanpa shadow. Hover: sedikit gelapkan warna (bukan
  menambah shadow).
- Dropdown "Perihal": styling sama seperti input text, bukan komponen visual
  berbeda sendiri.

---

## 6. Checklist "hapus kesan AI slop"

- [ ] Hapus dot status hijau di elemen manapun yang dibawa dari halaman Jurusan.
- [ ] Hapus semua `box-shadow` dekoratif pada card kontak & form; ganti border tipis/whitespace.
- [ ] Satu radius per jenis elemen (card = 12px, input/button = 8px) — jangan campur.
- [ ] Hapus paragraf deskripsi yang duplikat dari halaman Profil.
- [ ] Hapus section "Berlangganan" newsletter dari halaman ini.
- [ ] Ganti pola label "WORD — fragment" (kalau ada) dengan kalimat biasa, tanpa em dash.
- [ ] Tidak ada label ALL-CAPS baru untuk section ini.
- [ ] Icon sosmed tetap dipakai (sudah sesuai brand), tapi jangan tambah bulatan/badge dekoratif baru selain itu.
- [ ] Pastikan hanya satu warna aksi dipakai untuk semua elemen interaktif (`--color-action-600`) — jangan campur biru gelap untuk tombol.

---

## 7. Di luar cakupan file ini

Spec ini fokus ke halaman Kontak sesuai permintaan. Temuan dari halaman
Jurusan (data 10 vs 6 program, footer yang tidak sinkron, duplikasi card
grid) belum termasuk di sini — bisa dibuatkan spec terpisah kalau diperlukan.
