# CibiOne CMS: Revisi QA dan Performance Plan

Status: **Planning only**. Belum ada implementasi kode.

Dokumen ini menggabungkan temuan spreadsheet `Revisi website jhic`, keputusan terbaru, dan dua dokumen performance:

- `docs/Peformance/PERFORMANCE_OPTIMIZATION_GUIDE.md`
- `docs/Peformance/FIRST_README.md`

## Keputusan Disetujui

### Lifecycle Data: Draft, Terbit, Nonaktif, Hapus

CMS menyediakan empat status/aksi berbeda:

| Status/aksi | Penyimpanan | Tampil publik |
| --- | --- | --- |
| Draft | Tetap di database | Tidak |
| Terbit | Tetap di database | Ya |
| Nonaktifkan | Tetap di database | Tidak |
| Hapus permanen | Dihapus dari database | Tidak |

Aturan implementasi:

- `Draft` memakai status tersimpan tetapi tidak published.
- `Terbit` memakai status aktif dan published.
- `Nonaktifkan` mempertahankan row dan mengubah status aktif/publik menjadi nonaktif.
- `Hapus permanen` memakai endpoint server-side terpisah atau mode delete yang eksplisit.
- Tombol `Hapus permanen` tersedia di UI, tetapi harus memeriksa referensi/foreign key di server.
- Hard delete wajib memiliki confirmation dialog yang menyebut nama data.
- Authorization, scope jurusan, validasi ID, dan audit/error handling tetap server-side.
- Setelah aksi berhasil, list di-refresh/invalidate dan status sukses ditampilkan.
- Action utama pada list tetap `Edit` dan `Nonaktifkan`; `Hapus permanen` berada di menu aksi lanjutan.
- UI list menyediakan filter `Draft`, `Terbit`, `Nonaktif`, dan `Semua`.

Resource yang harus dipetakan sebelum coding:

```text
Posts/berita
Guru/staff
Kategori konten
Kategori guru
Sarana-prasarana
Mitra industri
Program unggulan
Fasilitas vokasi
Knowledge chatbot
```

Rancangan status awal untuk resource yang mendukung `isActive` dan `isPublished`:

| Status | `isActive` | `isPublished` |
| --- | ---: | ---: |
| Draft | `true` | `false` |
| Terbit | `true` | `true` |
| Nonaktif | `false` | `false` |
| Hapus permanen | row dihapus | row dihapus |

Resource yang hanya memiliki `isPublished` perlu dipetakan sebelum coding. Jika perlu, tambahkan field/status melalui migration agar Draft dan Nonaktif tidak tercampur. Hard delete wajib menangani data yang direferensikan; server menolak penghapusan bila berisiko merusak relasi.

### Upload Gambar Production

Upload tidak boleh bergantung pada filesystem lokal development. Client tetap mengirim file ke endpoint aplikasi, tetapi storage production harus persisten dan dapat diakses public.

Rencana target:

1. Client upload melalui endpoint terautentikasi.
2. Server validasi MIME, magic bytes, ukuran, dan dimensi.
3. Server resize, strip metadata sensitif, encode WebP/AVIF bila sesuai.
4. Server menyimpan metadata URL, width, height, dan byte size.
5. Database menyimpan URL/key asset; halaman public membaca URL tersebut.
6. Upload menggunakan nama random/versioned agar cache aman.
7. File tidak boleh disimpan hanya di workspace/container sementara.

Pilihan deployment:

| Pilihan | Status | Catatan |
| --- | --- | --- |
| VPS persistent volume | Baseline deployment saat ini | Sesuai VPS Jagoan Hosting; perlu permission, backup, disk monitoring, dan restore test |
| S3-compatible/object storage | Upgrade path | Dipilih bila deploy ulang, backup, CDN, storage, atau multi-instance membutuhkan media terpisah |
| Upload langsung dari browser ke object storage | Tahap lanjutan | Memerlukan signed upload URL dan flow tambahan |

Rekomendasi saat ini: buat storage abstraction, gunakan persistent volume VPS sebagai baseline production, pertahankan local filesystem hanya untuk development/test. Jangan mengunci implementasi ke provider tertentu. Object storage tetap menjadi upgrade path.

Keputusan yang harus diambil sebelum coding upload:

- Apakah persistent volume VPS cukup setelah staging test.
- Provider object storage bila upgrade path diaktifkan.
- Apakah upload tetap melalui server atau memakai signed URL.
- Batas ukuran dan dimensi final tiap jenis gambar.
- Kebijakan cleanup file orphan.
- Lokasi backup dan retention.

### Carousel Fasilitas

Keputusan disetujui:

- Autoplay sekitar `3500-4000ms`.
- Transition sekitar `300-500ms`.
- Preload image active dan next.
- Render image berikutnya sebelum pergantian.
- Aspect ratio tetap agar CLS tidak naik.
- Pause saat hover, focus, tab tidak aktif, atau modal terbuka.
- Previous/next tetap keyboard-accessible.
- Fallback image tetap tersedia.

### QA-23/24: Redirect Mitra Industri

Item 24 merupakan bagian dari bug CRUD Mitra Industri pada item 23. Setelah create/update berhasil, halaman diarahkan ke route yang salah dan menampilkan 404.

- Route tujuan yang benar: `/admin/mitra-industri`.
- Route `/admin/kerjasama-industri` tidak dipakai sebagai redirect admin.
- Data yang baru dibuat harus tetap terlihat pada tabel mitra industri.
- Uji create, update, refresh, direct navigation, dan session jurusan.
- Link website mitra pada data tetap diuji terpisah; jangan mengubah target eksternal tanpa bug reproduksi.

## Baseline Performance

Baseline lokal yang tercatat:

| Metric | Saat ini | Target |
| --- | ---: | ---: |
| Lighthouse Performance | 44/100 | Mobile >= 85, desktop >= 95 |
| FCP | 1.2 s | < 1.8 s |
| LCP | 17.2 s | Mobile < 2.5 s, desktop < 2.0 s |
| TBT | 3,930 ms | < 200 ms |
| CLS | 0 | < 0.1 |
| Speed Index | 3.9 s | < 3.0 s |
| Main-thread work | 7.9 s | < 3.0 s |

Baseline production wajib diulang pada production build, bukan `next dev`, minimal tiga kali dan memakai median.

```bash
npm run build
npm run start
npx lighthouse http://localhost:3000/ --preset=mobile --output=html --output-path=reports/local-mobile-home.html
npx lighthouse http://localhost:3000/ --preset=desktop --output=html --output-path=reports/local-desktop-home.html
npx lighthouse https://jhic.gamblingslayer.site/ --preset=mobile --output=html --output-path=reports/live-mobile-home.html
```

Uji tanpa extension pada viewport 360x800, 390x844, 1366x768, dan 1440x900. Catat LCP, INP/TBT, CLS, TTFB, transfer size, long task, dan dropped frame.

## Temuan dan Scope Revisi

### QA-02: Responsive Homepage

- Audit homepage pada mobile, tablet, desktop.
- Hilangkan fixed width yang menyebabkan horizontal overflow.
- Periksa hero, section, image, footer, modal, carousel, dan chatbot.
- Acceptance: tidak ada horizontal overflow dan tidak ada konten terpotong pada 360px.

### QA-03: Sambutan Kepala Sekolah

- Pastikan button tetap di dalam card/container.
- Gunakan wrapping dan width responsif.
- Uji text panjang pada 360px dan 390px.

### QA-04: Form Subheading

- Label/subheading `font-semibold` dengan kontras jelas.
- Helper text lebih kecil dan tidak menyerupai input.
- Semua label terhubung dengan input melalui `htmlFor`.

### QA-05: Button Spacing

- Gap konsisten antar-button.
- Touch target minimal sekitar 44px.
- Button dapat wrap/full-width pada mobile.

### QA-06: Tabel Data

- Header, divider, row hover, status badge, dan action column dibuat jelas.
- Tabel memakai horizontal scroll bila perlu.
- Jika tetap sulit dibaca di mobile, gunakan card layout mobile.
- Jangan mengubah pagination atau authorization tanpa kebutuhan.

### QA-07/08: Statistic Cards
1.
- Icon di kiri.
- Label dan angka di kanan.
- Angka lebih dominan.
- Satu kolom pada mobile.
- Hindari layout shift saat data selesai dimuat.

### QA-09: Scroll Performance

Target utama:

- Hero image menjadi LCP yang cepat.
- Kurangi `fixed`, parallax, `clip-path`, dan scroll handler pada mobile bila baseline membuktikan mahal.
- Lazy-load section/modal/video di bawah fold.
- Pertahankan Server Component untuk section statis.
- Batasi AOS/Motion; animasi sederhana memakai CSS.
- Hormati `prefers-reduced-motion`.
- Chatbot tetap deferred.

Hero tidak diubah sebelum baseline production dan screenshot comparison tersedia.

### QA-10/11: Carousel Mitra Industri

- Item masuk dari luar kanan, bukan muncul dari tengah/kiri.
- Loop harus kontinu dan stabil.
- Animasi hanya `transform`/`opacity`.
- Preload asset yang akan masuk.
- Pause saat hover/focus/tab tidak aktif.
- Uji reduced motion dan mobile.
- Review `LogoLoop` dan `LogoCloud` secara terpisah karena implementasinya berbeda.

### QA-12: Carousel Fasilitas

- Ikuti keputusan carousel fasilitas di atas.
- Ukuran image harus eksplisit.
- Jangan menunggu image baru memulai transition.
- Ukur transfer size dan cache hit.

### QA-13: Detail Jurusan

- Audit modal/detail pada 360px dan 390px.
- Periksa overlay, background, tabs, grid, text wrapping, CTA, dan close button.
- Body tidak boleh horizontal scroll saat modal terbuka.

### QA-14: Card Praktik Vokasi

- Transition lebih responsif pada kisaran 300-500ms.
- Autoplay fasilitas sekitar 3500-4000ms.
- Preload active/next image.
- Kontrol manual tetap tersedia.

### QA-15: Delete dan Nonaktifkan

- Tambahkan dua aksi dengan label berbeda.
- Confirmation wajib untuk keduanya.
- Loading/error/success state wajib.
- Soft delete default; hard delete hanya untuk resource yang aman.
- Refresh/invalidate list setelah mutation.

### QA-16: Upload Gambar

- Ganti storage abstraction sesuai keputusan production.
- Jangan memakai gambar default untuk menutupi kegagalan upload tanpa error yang terlihat.
- Tampilkan progress/pending state dan error server yang dapat ditindaklanjuti.
- Validasi magic bytes, ukuran, dimensi, dan format.
- Optimalkan image sebelum storage.
- Uji upload dari client pada development, staging, dan deployment VPS.

### QA-17: Confirmation Nonaktifkan

- Dialog: `Apakah Anda yakin ingin menonaktifkan data ini?`
- Tombol: `Ya, nonaktifkan` dan `Batal`.
- Tidak ada mutation sebelum user mengonfirmasi.

### QA-18: Tombol Form

- Pindahkan `Simpan draft`, `Terbitkan`, dan `Simpan` ke bagian bawah form.
- Jika form panjang, gunakan action bar sticky yang tidak menutup input.
- Warna primary biru untuk action utama.

### QA-19: Loading CMS

- Tampilkan skeleton/loading state sejak page mulai menunggu data.
- Hindari blank page.
- Bedakan loading, empty, error, dan success state.
- Jangan memakai retry berlebihan pada mutation.

### QA-20: Form dan Status Kategori

- Status aktif berwarna hijau.
- Switch memiliki transition singkat dan tidak memicu refetch berlebihan.
- Uji keyboard, focus, disabled, dan reduced motion.

### QA-21: Button Simpan

- Button simpan primary memakai biru.
- Disabled hanya saat pending/invalid, bukan karena variant visual default.

### QA-22: Alert dan Required Marker

- Gunakan pola `Data [nama field] belum diisi`.
- Simbol `*` berwarna merah.
- Error terhubung ke field dan terbaca screen reader.

### QA-23/24: Redirect Mitra Industri

- Verifikasi redirect setelah create/update.
- Pastikan route tujuan sesuai route aktual `/admin/mitra-industri`.
- Data yang baru dibuat harus tetap terlihat di list tanpa menuju 404.
- Uji direct navigation, refresh, dan session jurusan.
- Jika ada masalah link website mitra yang terpisah, catat URL tujuan dan langkah reproduksi sebelum perubahan tambahan.

## Upload dan Performance Design

Image pipeline direncanakan sesuai `docs/Peformance/PERFORMANCE_OPTIMIZATION_GUIDE.md`:

```text
auth -> MIME/magic bytes validation -> size/dimension validation
-> decode -> strip metadata -> resize -> WebP/AVIF
-> persistent object storage -> save URL/key metadata
```

Panduan ukuran awal:

| Jenis | Maksimum dimensi | Target |
| --- | ---: | --- |
| Thumbnail/card | 800 px | WebP, sekitar <= 200 KB |
| Article image | 1920 px | WebP/AVIF |
| Hero | 2400 px | WebP/AVIF, sekitar <= 500 KB |
| Logo | 800 px | WebP/PNG sesuai kebutuhan |

Do not overbuild: object storage/CDN diprioritaskan karena kebutuhan deployment, bukan untuk mengejar traffic yang belum terukur. Redis, queue, worker, dan multi-instance ditunda sampai monitoring membuktikan kebutuhan.

## Roadmap Implementasi Setelah Approval

### P0: Baseline dan Bug Kritis

1. Ambil Lighthouse production/local/live.
2. Reproduksi QA-16 upload.
3. Perbaiki redirect QA-23.
4. Identifikasi dan reproduksi QA-24.
5. Tetapkan kontrak storage; provider tetap dapat ditukar.
6. Pastikan tidak ada data mutation tanpa authorization/scope server-side.

### P1: CMS Safety dan Usability

1. Generic confirmation/action flow untuk nonaktifkan.
2. Tambahkan UI Draft/Terbit/Nonaktif/Hapus permanen sesuai resource map.
3. Hard delete terkontrol sesuai resource map.
4. Loading/error/success state.
5. Form action placement, button color, spacing, labels, alerts, required markers.
6. Table dan statistic cards.

### P2: Responsive Public UI

1. Homepage dan sambutan kepala sekolah.
2. Detail jurusan dan modal.
3. Detail berita, kontak, footer, dan overflow.
4. Carousel mitra dan fasilitas.

### P3: Performance

1. Hero/LCP.
2. Image delivery dan upload processing.
3. Lazy-load section bawah fold.
4. AOS/Motion/client bundle.
5. Font loading.
6. Query/cache/invalidation.
7. Nginx asset cache dan upload route.

### P4: Verification

1. Lighthouse ulang tiga kali per target page.
2. Visual check desktop/mobile.
3. Typecheck.
4. Backend self-check.
5. Production build.
6. Upload restore test.
7. Load test hanya staging atau production window yang disetujui.

## Acceptance Gate

```text
[ ] Tidak ada implementasi sebelum planning dan keputusan terbuka disetujui.
[ ] Tidak ada horizontal overflow pada viewport target.
[ ] Tidak ada blank carousel.
[ ] Carousel mitra masuk dari luar kanan.
[ ] Carousel fasilitas tidak menunggu image saat transition.
[ ] Draft, Terbit, Nonaktif, dan Hapus permanen memiliki efek berbeda dan jelas.
[ ] Hard delete tidak menghapus data terreferensi secara tidak sengaja.
[ ] Upload client berhasil pada deployment target.
[ ] Upload tersimpan pada persistent volume VPS atau storage provider yang disetujui.
[ ] Backup upload dan restore test lulus.
[ ] Tidak ada fallback image yang menyembunyikan upload failure.
[ ] LCP/TBT membaik tanpa CLS memburuk.
[ ] Lighthouse target diukur dengan production build.
[ ] Typecheck, backend test, build, dan diff check lulus.
[ ] Tidak ada secret, credential, atau report sensitif ikut commit.
```

## Keputusan yang Diminta Sebelum Implementasi

1. Setelah staging upload test, putuskan apakah persistent volume VPS cukup atau object storage diperlukan.
2. Setujui status model Draft/Terbit/Nonaktif/Hapus permanen dan migration yang diperlukan.
3. Pastikan QA-23/24 hanya mencakup redirect ke `/admin/mitra-industri`; link eksternal diuji terpisah bila ada bukti.
4. Gunakan staging untuk upload dan load test; jangan load test production tanpa window yang disetujui.
5. Setujui target carousel fasilitas: autoplay `3500-4000ms`, transition `300-500ms`.
6. Parallax hero mobile belum diputuskan; hasil benchmark wajib dilaporkan terlebih dahulu.
