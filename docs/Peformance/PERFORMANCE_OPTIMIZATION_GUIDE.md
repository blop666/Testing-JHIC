# CibiOne CMS: Performance Optimization Guide

Panduan teknis untuk mempercepat website, menjaga backend stabil, dan menyiapkan project untuk traffic tinggi.

## 1. Target

Target baseline deployment:

- VPS single instance, RAM 4 GB.
- Next.js production server di belakang Nginx.
- PostgreSQL sebagai source of truth.
- Public page cepat melalui Server Components dan Next.js Data Cache.
- Admin page menggunakan TanStack Query untuk client/server state.
- Redis hanya untuk kebutuhan distributed: rate limit, cache panas terukur, atau queue.
- Upload gambar persisten, teroptimasi, dan masuk backup.

Target awal yang perlu diukur, bukan diasumsikan:

| Metric | Target baseline |
| --- | --- |
| Public TTFB cached | < 300 ms di region dekat server |
| Public TTFB uncached | < 800 ms |
| API CRUD p95 | < 500 ms |
| Image LCP resource | < 200 KB untuk thumbnail, < 500 KB hero |
| Error rate | < 1% |
| PostgreSQL pool saturation | < 70% |
| VPS memory usage normal | < 75% |
| VPS disk usage alert | 70%, critical 85% |

Ukur dengan access log Nginx, `curl`, browser DevTools, dan monitoring server. Jangan menambah dependency berdasarkan dugaan.

## 2. Prioritas Implementasi

### P0: sebelum production

- Pastikan semua public query memakai `isPublished = true` dan `publishedAt <= now` untuk post terjadwal.
- Jangan ambil `posts.body` pada list/card query; body hanya untuk detail.
- Tambahkan limit pada setiap query section publik.
- Gunakan `next/image` untuk gambar content; hindari raw `<img>` kecuali ada alasan teknis.
- Validasi upload dengan MIME dan magic bytes.
- Resize dan encode upload ke WebP atau AVIF sebelum disimpan.
- Tambahkan swap pada VPS.
- Uji cache invalidation setelah create, update, publish, unpublish, dan delete.
- Tambahkan health endpoint yang tidak bergantung pada provider AI.
- Tambahkan logging latency untuk database, upload, dan provider AI.

### P1: setelah baseline stabil

- Tambahkan cache tag yang konsisten untuk seluruh public resource.
- Cache `getPublicJurusan()` dan query public yang jarang berubah.
- Ganti offset pagination untuk dataset besar dengan cursor pagination.
- Tambahkan index berdasarkan query nyata dan verifikasi dengan `EXPLAIN ANALYZE`.
- Pisahkan endpoint chatbot dari request page biasa dengan timeout dan rate limit ketat.
- Tambahkan cleanup upload orphan.

### P2: saat traffic tinggi

- Redis untuk rate limit lintas instance.
- Redis untuk hot data hanya setelah cache hit/miss dan query latency terukur.
- CDN/object storage untuk media.
- Read replica PostgreSQL bila database read menjadi bottleneck.
- Worker terpisah untuk image processing, chatbot job, dan scheduled publishing.
- PM2 cluster atau beberapa application instance hanya setelah session, upload, cache, dan rate limit siap distributed.

## 3. Strategi Caching

### Public website

Gunakan urutan berikut:

1. Next.js Server Components.
2. `unstable_cache` atau API cache terbaru yang kompatibel dengan Next.js version project.
3. Cache tags per resource.
4. `revalidateTag()` setelah mutation berhasil.
5. Nginx/CDN cache untuk asset statis dan gambar.

Jangan memakai TanStack Query untuk menggantikan server cache public. TanStack Query cocok untuk admin UI yang membutuhkan fetch, mutation, retry, dan invalidation di browser.

Cache key harus memuat parameter yang memengaruhi hasil:

```text
public-posts:{type}:{limit}:{jurusan}:{page}
public-post:{slug}
public-guru:{jurusan}:{category}
public-setting:{key}
```

Aturan invalidation:

- Post mutation: `public-posts`, type terkait, detail slug lama/baru.
- Guru mutation: `public-guru`, `public-guru-categories`.
- Facility mutation: `public-facilities`.
- Partner mutation: `public-partners`.
- Setting mutation: key setting spesifik.
- Jurusan mutation: `public-jurusan` dan resource yang menampilkan nama jurusan.

Jangan cache response private atau response yang dipengaruhi session.

### Admin website

TanStack Query digunakan untuk:

- List CRUD.
- Mutation dan invalidation.
- Loading/error state.
- Retry terbatas untuk GET.
- Prefetch detail yang kemungkinan dibuka.

Aturan:

- Jangan meng-cache data permission tanpa memperhitungkan user/session.
- `staleTime` pendek untuk data admin yang sering berubah.
- `staleTime` lebih panjang untuk categories/settings yang jarang berubah.
- Batasi retry mutation: default `0`.
- Invalidate query setelah mutation sukses, bukan sebelum commit.
- Hindari refetch interval global.

TanStack Query tidak mempercepat SQL. Ia mengurangi request berulang dari browser.

### Redis

Redis belum wajib pada single VPS. Tambahkan hanya untuk:

- Rate limit lintas process/instance.
- Cache data panas yang terbukti lambat.
- Counter atau analytics sementara.
- Queue pendek untuk pekerjaan asynchronous.

Jangan simpan source of truth berikut hanya di Redis:

- User.
- Session tanpa strategi persistence yang jelas.
- Permission.
- Posts.
- Settings.
- Upload metadata penting.

Jika Redis ditambahkan:

- Gunakan TTL untuk semua cache.
- Namespace key, contoh `cibione:public:posts:berita`.
- Tangani Redis unavailable dengan fallback ke PostgreSQL untuk public read.
- Jangan membuat page gagal hanya karena cache gagal.
- Monitor memory, evictions, hit rate, dan connection count.

## 4. Query dan Database

### Query rules

- Select hanya kolom yang dipakai.
- List tidak mengambil `body` atau gallery besar.
- Detail mengambil body dan gallery saat diperlukan.
- Semua list memiliki `limit` maksimum.
- Hindari N+1 query; gunakan join atau `Promise.all` untuk query independen.
- `count(*)` hanya jika UI benar-benar membutuhkan total.
- Hindari `ilike '%keyword%'` pada tabel besar tanpa strategi search.

### Index rules

Index harus mengikuti filter dan sort aktual. Kandidat yang perlu diverifikasi:

```text
posts(type, is_published, published_at)
posts(jurusan_id, is_published, published_at)
posts(category_id)
guru(jurusan_id, is_published, sort_order)
sessions(expires_at)
chatbot_knowledge(jurusan_id, is_active, is_published, effective_until)
```

Sebelum menambah index:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT ...;
```

Index tambahan meningkatkan write cost. Jangan menambah index spekulatif.

### Pagination

Offset pagination cukup untuk admin dengan data kecil. Gunakan cursor pagination jika dataset besar atau page number tinggi mulai lambat. Cursor harus memakai kolom sort stabil, misalnya `(published_at, id)`.

## 5. Image Pipeline

Upload saat ini menyimpan file asli. Target production:

1. Authentikasi user.
2. Validasi content type.
3. Validasi magic bytes.
4. Tolak file di atas batas upload.
5. Decode image.
6. Strip EXIF dan metadata sensitif.
7. Resize berdasarkan jenis media.
8. Encode WebP atau AVIF.
9. Simpan nama random.
10. Simpan metadata URL, width, height, byte size.

Rekomendasi batas:

| Jenis | Max dimension | Format |
| --- | ---: | --- |
| Thumbnail/card | 800 px | WebP |
| Article image | 1920 px | WebP/AVIF |
| Hero | 2400 px | WebP/AVIF |
| Logo | 800 px | WebP/PNG sesuai kebutuhan |

Jangan mengandalkan extension atau MIME header client sebagai satu-satunya validasi. Gunakan library image processing yang sudah disetujui tim.

Object storage/CDN lebih tepat saat upload bertambah cepat, backup upload mengganggu operasi, atau lebih dari satu application instance digunakan.

## 6. Chatbot dan AI

Retrieval saat ini memuat knowledge rows lalu scoring di memory. Ini cukup untuk knowledge base kecil, tetapi tidak untuk ribuan dokumen.

Tahap optimasi:

1. Batasi jumlah row dan ukuran chunk.
2. Cache daftar public resource yang dipakai chatbot.
3. Tambahkan timeout provider.
4. Rate limit per IP dan per session.
5. Log provider latency dan token usage.
6. Pindahkan chunk ke tabel terpisah jika knowledge bertambah.
7. Gunakan PostgreSQL full-text search atau `pg_trgm`.
8. Gunakan vector search hanya jika keyword retrieval terbukti tidak cukup.

Provider failure harus menghasilkan response terkontrol, bukan menahan seluruh request sampai gateway timeout.

## 7. Nginx dan HTTP

- Aktifkan gzip atau Brotli jika tersedia dan diuji.
- Aktifkan HTTP/2 melalui HTTPS.
- Cache asset immutable dengan nama hashed dari Next.js.
- Jangan cache response admin atau API private.
- Set `client_max_body_size` sesuai batas upload.
- Set security headers tanpa merusak image, font, dan script.
- Proxy hanya ke `127.0.0.1:3000`.

Contoh cache asset statis:

```nginx
location /_next/static/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

Jangan memberi cache panjang pada `/uploads/` jika file dapat diganti dengan URL yang sama. Gunakan nama file baru setiap upload.

## 8. Monitoring

Pantau minimal:

- Nginx request count, status code, latency.
- PM2 restart count dan memory.
- Node.js event loop lag.
- PostgreSQL connections, slow query, locks, disk.
- Redis hit rate dan memory jika digunakan.
- Disk usage dan ukuran `public/uploads`.
- Chatbot provider timeout/error rate.
- Upload error rate.

Alert minimum:

```text
5xx > 1%
memory > 80%
disk > 70%
disk > 85% critical
database connection saturation > 80%
PM2 restart berulang
provider AI timeout meningkat
```

## 9. Load Test

Jalankan hanya terhadap staging atau endpoint yang disetujui. Jangan load test production tanpa window dan batas request.

Uji terpisah:

- Public homepage cached.
- Public article detail.
- Public list uncached.
- Login.
- Admin list.
- Upload.
- Chatbot.

Catat p50, p95, p99 latency, requests per second, error rate, memory, CPU, database connection usage, dan cache hit rate.

## 10. Definition of Done

- [ ] Public list tidak mengambil body artikel.
- [ ] Semua scheduled post memfilter waktu publish.
- [ ] Semua public resource memiliki cache key/tag yang benar.
- [ ] Mutation meng-invalidate cache terkait.
- [ ] Admin list memakai TanStack Query secara konsisten.
- [ ] Upload tervalidasi dan diproses ukurannya.
- [ ] Raw `<img>` sudah direview.
- [ ] Query besar memiliki limit/pagination.
- [ ] Chatbot memiliki timeout, rate limit, dan latency logging.
- [ ] Backup database dan upload teruji restore.
- [ ] Monitoring dan alert aktif.
- [ ] Load test staging selesai.
