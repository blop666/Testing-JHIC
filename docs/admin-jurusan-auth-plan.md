# Planning Auth Admin Berbasis Jurusan

## Tujuan

Membatasi akses `jurusan_admin` berdasarkan `users.jurusanId` tanpa mengorbankan performa halaman publik, admin, atau AI Content Generation.

Contoh: admin SIJA hanya dapat mengelola berita, prestasi, guru, kategori, mitra, knowledge, fasilitas vokasi, dan program unggulan yang terkait SIJA.

## Prinsip Keamanan

- `super_admin` memiliki akses seluruh jurusan dan data global.
- `jurusan_admin` hanya memiliki satu scope dari `users.jurusanId`.
- `jurusan_admin` wajib memiliki `jurusanId` aktif.
- Server selalu menjadi sumber kebenaran scope.
- `jurusanId` dari client, form, URL, atau output AI tidak dipercaya.
- UI hanya menyembunyikan menu; API tetap wajib memvalidasi authorization.
- Update tidak boleh memindahkan data ke jurusan lain.
- Publish, unpublish, test, extract, dan delete wajib memakai scope check yang sama.
- Data publik hanya memuat record yang sudah dipublikasikan.

## Matriks Akses

| Resource | `super_admin` | `jurusan_admin` |
| --- | --- | --- |
| Berita | Semua | Jurusannya |
| Pengumuman | Semua | Jurusannya |
| Prestasi | Semua | Jurusannya |
| Agenda | Semua | Jurusannya |
| Guru & Staff | Semua | Jurusannya |
| Kategori Konten | Semua/global | Kategori jurusannya |
| Kategori Guru | Semua/global | Kategori jurusannya |
| Mitra Industri | Semua | Mitra jurusannya |
| Knowledge AI | Semua | Knowledge jurusannya |
| Fasilitas Praktik Vokasi | Semua | Fasilitas jurusannya |
| Program Unggulan | Semua/global | Program jurusannya |
| Sarana & Prasarana umum | Semua | Read-only atau tidak ditampilkan |
| Pengaturan sekolah | Semua | Tidak boleh |
| Chatbot AI | Semua konteks | Konteks jurusannya |

## Model Data

### Data Per Jurusan

Sudah memiliki `jurusanId`:

- `posts`
- `guru`
- `post_categories`
- `guru_categories`
- `kerjasama_industri`
- `chatbot_knowledge`
- `fasilitas_vokasi`

### Program Unggulan

Tambahkan `jurusanId` nullable ke `program_unggulan`.

- `jurusanId = null`: program global, hanya dikelola `super_admin`.
- `jurusanId != null`: program khusus jurusan, dikelola admin jurusan terkait.

Contoh:

- Global: `Program Sekolah Adiwiyata`.
- SIJA: `TeFa Software Development`.
- TKJ: `Academy Mikrotik`.

### Data Global

`sarana_prasarana` tetap general jika memang menggambarkan fasilitas sekolah secara keseluruhan. Admin jurusan tidak dapat mengubahnya.

## Fase Implementasi

### Fase 1: Authorization Terpusat

Buat policy terpusat agar aturan tidak tersebar dan tidak mudah terlewat pada route baru.

File baru:

- `server/auth/policy.ts`

API yang disediakan:

```ts
canAccessResource(user, resource)
canManageResource(user, resource)
resolveScopedJurusanId(user, requestedJurusanId)
assertResourceScope(user, jurusanId)
```

Aturan:

- `super_admin`: scope global atau jurusan tertentu.
- `jurusan_admin`: selalu `session.jurusanId`.
- Payload `jurusanId` admin jurusan diabaikan atau ditolak.
- Scope mismatch menghasilkan `403`, bukan sekadar array kosong.

### Fase 2: Session dan Role

Audit dan perbaiki:

- `server/auth/session.ts`
- `app/api/auth/login/route.ts`
- `app/admin/layout.tsx`
- `app/api/auth/login-debug/route.ts`

Validasi:

- User aktif.
- Session belum expired dan belum revoked.
- `jurusan_admin` wajib memiliki `jurusanId`.
- Jurusan user aktif dan dipublikasikan.
- `login-debug` dihapus atau dibatasi ke development.

Admin layout tetap melakukan authentication check. Authorization tetap dilakukan di API dan server page.

### Fase 3: Scope API CRUD

Audit dan selaraskan:

- `app/api/posts`
- `app/api/guru`
- `app/api/post-categories`
- `app/api/guru-categories`
- `app/api/kerjasama-industri`
- `app/api/chatbot-knowledge`
- `app/api/fasilitas-vokasi`
- `app/api/program-unggulan`
- `app/api/sarana-prasarana`

Perilaku wajib:

- GET admin memakai filter `jurusanId`.
- POST memaksa `jurusanId` session.
- PUT mempertahankan `jurusanId` record.
- DELETE hanya dapat dilakukan pada scope sendiri.
- Publish/unpublish memakai scope check.
- Query `jurusan_id` milik jurusan lain ditolak `403`.
- Count, pagination, dan analytics memakai filter scope yang sama.

### Fase 4: Integritas Relasi

Cegah kategori lintas jurusan:

- Post SIJA tidak boleh memakai kategori TKJ.
- Guru SIJA tidak boleh memakai kategori guru TKJ.
- Kategori global hanya dipakai jika policy mengizinkan.

Validasi server:

```ts
category.jurusanId === null || category.jurusanId === content.jurusanId
```

Validasi dilakukan sebelum insert/update. Jika diperlukan, gunakan transaksi agar validasi dan mutation konsisten.

### Fase 5: Migration dan Index

Migration:

- Tambah `jurusanId` nullable ke `program_unggulan`.
- Tambah index `(jurusan_id, is_published, sort_order)`.
- Pastikan index scope tersedia pada resource yang sering ditampilkan.

Index yang dibutuhkan:

- `posts(jurusan_id, is_published, published_at)`.
- `guru(jurusan_id, is_published, sort_order)`.
- `post_categories(jurusan_id, is_active)`.
- `guru_categories(jurusan_id, is_active, sort_order)`.
- `kerjasama_industri(jurusan_id, is_published, sort_order)`.
- `chatbot_knowledge(jurusan_id, is_active, is_published, effective_until)`.
- `fasilitas_vokasi(jurusan_id, is_published, sort_order)`.
- `program_unggulan(jurusan_id, is_published, sort_order)`.

Hindari index berlebihan. Verifikasi query plan setelah migration menggunakan `EXPLAIN ANALYZE` pada query list dan public rendering.

### Fase 6: Public Query dan Cache

Public query harus tetap ringan:

- Filter `isPublished=true` di database.
- Select hanya kolom yang dipakai UI.
- Gunakan `unstable_cache` dengan cache key yang memasukkan scope bila query scoped.
- Revalidate tag setelah mutation.
- Jangan memuat seluruh tabel jika UI hanya membutuhkan data carousel.
- Batasi jumlah record program dan fasilitas pada query publik bila desain memiliki batas tampilan.

Contoh cache key:

```ts
["public-programs", jurusanId ? String(jurusanId) : "global"]
```

Tag:

- `public-programs`
- `public-programs-${jurusanId}`
- `public-vokasi`
- `public-vokasi-${jurusanId}`

Jangan memakai satu cache key untuk data global dan data jurusan. Risiko: data scope tercampur atau cache invalidation terlalu luas.

### Fase 7: Admin UI

Sidebar berdasarkan role:

#### `super_admin`

- Semua menu.

#### `jurusan_admin`

- Konten.
- Kategori Konten.
- Guru & Staff.
- Kategori Guru.
- Mitra Industri.
- Knowledge AI.
- Fasilitas Praktik Vokasi.
- Program Unggulan jurusan.

Sembunyikan dari admin jurusan:

- Sarana & Prasarana umum.
- Pengaturan.
- Program global.
- Menu data lintas jurusan.

Tambahkan identitas scope pada header:

- Nama admin.
- Nama jurusan.
- Label `Scope: SIJA`.

Hiding menu bukan authorization. Route server dan API tetap wajib aman saat URL dibuka langsung.

### Fase 8: Editor dan Filter

Pada admin jurusan:

- Jangan tampilkan dropdown jurusan.
- Tampilkan badge jurusan aktif.
- Server menentukan `jurusanId`.
- Dropdown kategori hanya memuat kategori scope sendiri dan kategori global yang diizinkan.
- Pagination dan search dilakukan server-side.
- Jangan mengambil `limit=100` jika jumlah data dapat besar; gunakan endpoint option khusus atau limit kecil.

File terkait:

- `components/admin/editor-page.tsx`
- `components/admin/feature-editor.tsx`
- `components/admin/knowledge-editor.tsx`
- `components/admin/resource-page.tsx`
- `components/admin/category-page.tsx`
- `components/admin/admin-shell.tsx`

### Fase 9: AI Content Generation

AI menerima konteks jurusan dari server, bukan dari input bebas admin:

```ts
{
  jurusanId: session.jurusanId,
  jurusanCode: "SIJA",
  jurusanName: "Sistem Informasi, Jaringan dan Aplikasi"
}
```

Aturan prompt:

- Konten relevan dengan jurusan aktif.
- Jangan mengarang nama siswa, tanggal, angka, prestasi, industri, atau fasilitas.
- Data yang tidak tersedia masuk `missingFields`.
- AI tidak boleh memilih jurusan lain.
- `jurusanHint` hanya metadata bantu, bukan authorization.

Saat publish:

- Server mengabaikan `jurusanId` hasil AI.
- Server memakai `session.jurusanId`.
- Payload final divalidasi ulang.
- AI generation tidak otomatis mem-publish data.

Resource AI:

- Berita.
- Pengumuman.
- Prestasi.
- Agenda.
- Guru.
- Mitra Industri.
- Knowledge AI.
- Fasilitas Praktik Vokasi.
- Program Unggulan jurusan.

Performa AI:

- Context jurusan berupa ringkasan pendek, bukan seluruh database.
- Ambil data referensi dengan query terlimit.
- Cache metadata jurusan aktif.
- Pertahankan rate limit per user dan IP.
- Jangan melakukan query database berulang untuk setiap token atau retry.
- Audit input/output tanpa menyimpan secret atau dokumen sensitif.

### Fase 10: Knowledge AI dan Retrieval

Untuk `jurusan_admin`:

- Retrieval memakai `jurusanId` sendiri.
- Knowledge global boleh ikut jika policy mengizinkan.
- Test chatbot tidak dapat membaca knowledge jurusan lain.
- Draft jurusan lain tidak muncul di list, preview, test, atau publish.

Untuk chatbot publik:

- Gunakan hanya `isActive=true` dan `isPublished=true`.
- Data seluruh jurusan boleh digabung jika memang informasi publik.
- Data internal jurusan harus memiliki policy publikasi yang jelas.
- Retrieval program unggulan dan fasilitas vokasi memakai filter publik yang sama.

File terkait:

- `server/ai/retrieval.ts`
- `app/api/chatbot-knowledge/[id]/test/route.ts`
- `app/api/chatbot-knowledge/[id]/publish/route.ts`
- `app/api/ai/content/generate/route.ts`
- `app/api/ai/resource/generate/route.ts`

Performa retrieval:

- Filter scope dilakukan di SQL sebelum scoring.
- Batasi jumlah kandidat sebelum keyword scoring.
- Gunakan `contentText` terpotong sesuai kebutuhan prompt.
- Cache knowledge publik yang stabil.
- Hindari mengirim seluruh knowledge ke provider AI.
- Jika jumlah data meningkat, siapkan full-text search atau `pgvector` setelah provider embedding tervalidasi.

### Fase 11: Dashboard

Dashboard `jurusan_admin` hanya menghitung scope sendiri:

- Konten jurusan.
- Guru jurusan.
- Mitra jurusan.
- Fasilitas vokasi jurusan.
- Knowledge jurusan.
- Draft dan publikasi jurusan.

Jangan mengambil semua record lalu memfilter di browser. Filter scope harus masuk ke query count dan analytics.

## Performa Web

### Server Rendering

- Pertahankan homepage dan halaman publik sebagai Server Component jika tidak memerlukan state browser.
- Kirim data carousel sebagai props minimal ke Client Component.
- Jangan fetch endpoint publik dari browser jika data dapat diambil saat server render.
- Jangan mengirim field audit, body panjang, atau metadata internal ke client.

### Carousel

- Query hanya record aktif dan terbit.
- Batasi gambar dengan `next/image` dan `sizes` yang benar.
- Gunakan `loading="lazy"` untuk kartu di bawah fold.
- Jangan melakukan fetch ulang setiap interval 5 detik.
- Interval hanya mengganti slide lokal.
- Pause timer saat tab tidak terlihat, modal terbuka, atau user hover/focus.
- Reset timer saat user memilih slide manual.
- Pastikan carousel tidak membuat layout shift dengan rasio gambar tetap.

### Admin List

- Pagination server-side, default 15 record.
- Search dan filter dikirim ke API.
- Debounce search hanya jika menerapkan search-as-you-type; submit button lebih murah.
- Gunakan query count terpisah hanya jika pagination membutuhkannya.
- Hindari `limit=100` untuk dropdown besar.
- Cache daftar jurusan/kategori yang jarang berubah.

### Database

- Semua scope filter memakai index yang sesuai.
- Hindari `ilike '%query%'` pada tabel besar tanpa strategi search.
- Gunakan `EXPLAIN ANALYZE` untuk endpoint list, dashboard, dan retrieval.
- Jangan membuat query N+1 saat mengambil jurusan/kategori.
- Gunakan join terpilih atau batch query.
- Gunakan transaksi untuk validasi relasi dan mutation yang harus atomik.

### Cache Invalidation

- Mutation hanya revalidate tag resource terkait.
- Jangan revalidate seluruh cache situs untuk perubahan satu jurusan.
- Gunakan tag global dan tag jurusan terpisah.
- Pastikan perubahan kategori hanya menginvalidasi query yang benar-benar bergantung pada kategori.

## Test Wajib

Tambahkan self-check backend atau test kecil untuk:

1. Admin SIJA dapat membuat berita SIJA.
2. Admin SIJA tidak dapat membuat berita TKJ.
3. Admin SIJA tidak dapat membaca draft TKJ.
4. Admin SIJA tidak dapat mengubah post TKJ.
5. Admin SIJA tidak dapat publish knowledge TKJ.
6. Admin SIJA hanya melihat fasilitas vokasi SIJA.
7. Admin SIJA tidak dapat mengubah `jurusanId` melalui payload.
8. AI admin SIJA menyimpan hasil sebagai SIJA.
9. Prompt AI tidak dapat memaksa scope jurusan lain.
10. Super admin dapat mengelola semua jurusan.
11. Kategori TKJ ditolak saat digunakan pada konten SIJA.
12. Program global hanya dapat dikelola super admin.
13. Scope mismatch mengembalikan `403`.
14. Cache public tidak mencampur data global dan data jurusan.
15. Query list memakai index dan tidak menghasilkan N+1 query.

## Observability

Catat metrik berikut tanpa menyimpan konten sensitif:

- Durasi query endpoint scoped.
- Durasi retrieval AI.
- Jumlah kandidat retrieval.
- Cache hit/miss.
- AI request count per user.
- Authorization failure count per resource.
- Ukuran payload AI.

Alert jika:

- `403` meningkat abnormal.
- Query scoped melewati threshold.
- AI context melebihi batas token.
- Cache miss public terlalu tinggi.
- Endpoint admin mengembalikan data lintas scope.

## Rollout Aman

1. Tambahkan policy dan test tanpa mengubah UI.
2. Audit semua endpoint existing.
3. Tambahkan migration dan index.
4. Aktifkan scope read untuk admin jurusan.
5. Aktifkan scope mutation setelah test lulus.
6. Aktifkan scope AI generation dan publish.
7. Sembunyikan menu yang tidak tersedia.
8. Jalankan migration staging.
9. Jalankan seed dan verifikasi dua jurusan berbeda.
10. Jalankan `npx tsc --noEmit`.
11. Jalankan `npm run test:backend`.
12. Jalankan `npm run build`.
13. Monitor query, cache, dan authorization failure setelah deploy.

## Urutan Pengerjaan Minimum

1. Central policy authorization.
2. Validasi session dan role.
3. Scope API existing.
4. Perbaiki scope `fasilitas_vokasi`.
5. Tambah `program_unggulan.jurusanId`.
6. Validasi relasi kategori.
7. Scope AI generation dan publish.
8. Scope chatbot retrieval dan test.
9. Filter sidebar dan admin UI.
10. Dashboard per jurusan.
11. Self-check authorization dan performance.
12. Migration, seed, typecheck, dan build.
