# CibiOne CMS: Tech Stack, Optimasi, Skalabilitas, dan Metode Pengujian

> Ringkasan garis besar arsitektur website untuk klien/juri, strategi optimasi, dan rencana pengujian berdasarkan kondisi website saat ini.

---

## 1. Framework dan CMS

### Framework utama: Next.js 15

Website menggunakan **Next.js 15** sebagai framework full-stack:

- **App Router**
- **React 19**
- Server Components untuk halaman publik
- Client Components untuk fitur interaktif
- API Route Handlers untuk backend
- Static rendering dan server-side rendering
- `next/image` untuk optimasi gambar
- `next/font` untuk optimasi font

Frontend, backend API, authentication, rendering, dan integrasi AI berada dalam satu aplikasi.

### CMS: Custom CMS

CMS dibuat khusus (bukan WordPress / CMS pihak ketiga), disesuaikan kebutuhan sekolah.

Fitur CMS:

- Berita
- Pengumuman
- Prestasi
- Agenda
- Guru dan staff
- Jurusan
- Sarana prasarana
- Program unggulan
- Fasilitas vokasi
- Mitra industri
- Knowledge chatbot
- Pengaturan halaman sekolah
- AI Content Assistant

Role dan scope akses:

- `super_admin`
- `jurusan_admin`

`jurusan_admin` dibatasi hanya dapat mengelola data jurusannya. Validasi akses dilakukan di server, bukan hanya di frontend.

## 2. Frontend

### React 19

Digunakan untuk form CMS, dashboard admin, AI Content Assistant, modal/dialog, preview, upload gambar, serta filter dan interaksi halaman.

### Tailwind CSS

Digunakan untuk layout responsif, styling komponen, mobile-first design, grid, flexbox, spacing, warna, dan breakpoint.

### Library UI & interaksi

- Base UI
- Radix utilities
- Lucide Icons
- Framer Motion / Motion
- AOS (pada bagian tertentu)
- Sonner untuk notifikasi
- TanStack Query (pada area client-side tertentu)

Desain publik dan admin dibuat custom.

## 3. Backend

Backend berada di dalam Next.js melalui API Route Handlers.

Alur request umum:

```text
Request
  -> Authentication
  -> Validation
  -> Authorization
  -> Business logic
  -> Database / Object Storage
  -> API response
```

Backend menangani: login dan session, CRUD konten, role authorization, scope jurusan, upload gambar, AI generation, chatbot, knowledge base, rate limiting, public content queries, dan cache invalidation.

Format response API memakai envelope konsisten:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "error": { "code": "INVALID_FILE", "message": "File tidak valid." } }
```

## 4. AI dan NLP

### Provider AI

Kode AI menggunakan provider yang kompatibel dengan **OpenAI Chat Completions API**.

Konfigurasi dibaca dari environment variable:

```env
AI_BASE_URL=
AI_API_KEY=
AI_MODEL=
AI_VISION_MODEL=
AI_FALLBACK_MODEL=
```

Pada environment lokal saat ini provider yang dikonfigurasi adalah **XKiro** (model utama Qwen, fallback DeepSeek). Arsitektur tidak dikunci ke satu vendor; provider dapat diganti selama mendukung API kompatibel.

### Peran AI

Sistem memakai Large Language Model untuk:

- Generate berita / pengumuman / prestasi / agenda
- Generate data sekolah
- Mengedit konten berdasarkan instruksi bahasa natural
- Menyusun draft terstruktur
- Mengidentifikasi field yang belum lengkap
- Memberikan warning data ambigu
- Menghasilkan deskripsi gambar (computer vision)
- Membantu pengelolaan data CMS

### Alur NLP-based orchestration

```text
Instruksi natural language
  -> Intent/resource detection
  -> Context building
  -> Prompt construction
  -> LLM response
  -> JSON schema validation
  -> Preview/confirmation
  -> Database mutation
```

Output AI divalidasi memakai **Zod schema**. AI tidak menulis langsung ke database; admin melihat preview dan mengonfirmasi terlebih dahulu.

### Computer vision

Jika admin melampirkan gambar, AI vision model menganalisis dan menghasilkan deskripsi faktual sebagai konteks. Sistem tidak menebak identitas, nama orang, tanggal, atau angka pada gambar.

## 5. Database

### PostgreSQL

Database utama menggunakan **PostgreSQL**, menyimpan user, session, role, jurusan, berita, kategori, guru, sarana prasarana, mitra industri, program unggulan, fasilitas vokasi, knowledge chatbot, pengaturan website, dan URL media.

Database **tidak** menyimpan gambar sebagai binary/base64; hanya menyimpan URL atau metadata media.

### Drizzle ORM

Akses database memakai **Drizzle ORM**: type-safe query, schema di kode, migration terkontrol, integrasi baik dengan TypeScript.

### Development vs Production

- Development: PostgreSQL hosted (mis. Supabase) atau lokal.
- Production VPS: PostgreSQL lokal di VPS.

Aplikasi tidak bergantung pada vendor tertentu selama tersedia `DATABASE_URL`.

## 6. Object Storage

Media upload memakai adapter storage:

```env
MEDIA_STORAGE=local   # default
MEDIA_STORAGE=s3      # MinIO / S3-compatible
```

Alur production:

```text
Next.js API
  -> Image validation
  -> Resize + WebP conversion
  -> MinIO / S3 object storage
  -> Public media URL
  -> URL disimpan di PostgreSQL
```

Object key: `images/{category}/{uuid}.webp`

Sebelum disimpan: MIME type divalidasi, magic bytes divalidasi, ukuran maksimal divalidasi, resize maksimal 2048 px, EXIF dibersihkan, dikonversi ke WebP, nama file tidak dikontrol user.

## 7. Authentication dan Security

- Session cookie `HttpOnly`
- Token session random, disimpan sebagai hash
- Password hashing bcrypt
- Validasi input Zod
- Rate limit login, upload, dan AI
- Server-side authorization
- Scope authorization berdasarkan jurusan
- Secret di environment variable
- Credential object storage tidak dikirim ke browser

---

# Optimasi dan Strategi Skalabilitas

## Optimasi yang sudah diterapkan

- Server Components untuk halaman publik
- Query publik dibatasi limit
- Scheduled post difilter
- Sorting konsisten
- Cache tag untuk data publik (`unstable_cache`)
- Font Poppins self-hosted
- Hero image dikompresi ke WebP
- `next/image` untuk gambar
- `background-attachment: fixed` dihapus
- Upload dikonversi ke WebP
- Object storage adapter tersedia
- Rate limiting dasar

## 1. Optimasi Latency

### Server-side rendering

Halaman publik memakai Server Components agar data diambil langsung dari server, tanpa request browser ke API internal, HTML awal lebih cepat, SEO lebih baik, JavaScript client lebih sedikit.

### Caching

Cache data publik yang jarang berubah (jurusan, guru, sarana prasarana, program unggulan, mitra, kategori, konten publik). Saat admin mengubah data, revalidate cache tag.

```text
Public request -> Cache hit -> Return data cepat
Admin mutation -> Update DB -> Revalidate cache tag
```

### Database indexing

Tambahkan index pada kolom yang sering dipakai: `is_published`, `published_at`, `created_at`, `slug`, `category_id`, `jurusan_id`, `is_active`, `event_date`.

### Pagination

Area admin memakai limit, offset/cursor, search query, dan filter status/jurusan/kategori agar tidak mengambil seluruh data sekaligus.

### Media delivery

Object storage memisahkan traffic gambar dari aplikasi utama:

```text
Tanpa object storage: Browser -> Next.js -> VPS disk -> Browser
Dengan object storage: Browser -> Media domain/object storage
```

### Kompresi gambar

```text
Original -> Resize -> Strip EXIF -> WebP -> Object storage
```

Mengurangi ukuran response, bandwidth, waktu download, storage, dan beban VPS.

## 2. Skalabilitas Database

1. Index query utama.
2. Pagination cursor.
3. Connection pooling.
4. Pisahkan query publik dari admin.
5. Cache hasil query publik.
6. Read replica bila diperlukan.
7. Managed PostgreSQL bila resource VPS terbatas.

Untuk tahap sekarang, satu instance PostgreSQL masih cukup.

## 3. Skalabilitas Application Server

Kondisi saat ini cocok untuk single VPS:

```text
Nginx -> PM2 -> Next.js -> PostgreSQL -> MinIO
```

Jika traffic meningkat:

```text
Load Balancer
  -> Next.js Instance 1..N
  -> Shared PostgreSQL
  -> Shared Object Storage
  -> Shared Redis / rate limiter
```

Perhatian: rate limiter saat ini masih **in-memory**. Pada multi-instance, pindahkan ke Redis / Upstash Redis / Vercel KV / database-based limiter.

## 4. CDN

Langkah paling berdampak berikutnya:

- Cloudflare sebagai CDN
- Cache media subdomain
- Cache static assets
- Aktifkan Brotli
- HTTP/2 atau HTTP/3
- Cache image response agresif
- DNS proxy untuk domain media

Object storage tetap origin; CDN melayani request berulang dari edge terdekat.

## 5. Skalabilitas AI

AI dapat menjadi bottleneck karena request lebih lama dari CRUD biasa.

- Rate limit per user
- Batas maksimum prompt dan token response
- Timeout request
- Fallback model
- Batasi panjang source
- Cache hasil analisis gambar bila sama
- Queue untuk task berat / jumlah besar
- Audit AI tanpa menyimpan data sensitif

Bila traffic AI tinggi:

```text
Admin request -> Job queue -> AI worker -> Result storage -> Admin polling/WebSocket
```

## 6. Monitoring

Pantau CPU, RAM, disk, PostgreSQL connections, query latency, PM2 restart, Nginx response time, MinIO disk, AI latency, HTTP 4xx/5xx, upload error rate.

Tools: PM2, Nginx logs, `journalctl`, `htop`, `free -h`, `iostat`, Uptime Kuma, Grafana + Prometheus, Sentry, UptimeRobot, Cloudflare Analytics.

---

# Metode Pengujian

## 1. Static Type Checking

```bash
npx tsc --noEmit --pretty false
```

Menemukan error TypeScript, memastikan props dan tipe API result konsisten.

## 2. Backend Self-check

```bash
npm run test:backend
```

File: `scripts/backend-self-check.ts` — sanitasi HTML/Markdown, validasi post & setting, role authorization, scope admin jurusan, scope kategori, public/private resource scope.

## 3. Storage Self-check

```bash
npm run test:storage
```

File: `scripts/storage-self-check.ts` — image processing, magic bytes validation, WebP output, category sanitization, invalid image rejection, default local mode.

## 4. S3-compatible integration test

LocalStack dipakai untuk menguji object storage lokal (image MinIO public Docker tidak lagi tersedia).

```bash
docker compose -f docker-compose.localstack.yml up -d
```

Environment:

```env
MEDIA_STORAGE=s3
S3_ENDPOINT=http://127.0.0.1:4566
S3_REGION=us-east-1
S3_BUCKET=cibione-media
S3_ACCESS_KEY_ID=test
S3_SECRET_ACCESS_KEY=test
S3_FORCE_PATH_STYLE=true
```

Diuji: create bucket, upload object, object key, content type `image/webp`, read object, size, public HTTP response. Production tetap MinIO server, bukan LocalStack.

## 5. Build validation

```bash
npm run build
```

Memastikan seluruh route build valid, dynamic route valid, dependency production tersedia, mendeteksi error bundling, melihat ukuran First Load JS.

## 6. Git diff validation

```bash
git diff --check
```

Mendeteksi trailing whitespace dan masalah format patch sebelum push.

## 7. Manual functional testing

- **Authentication**: login valid/salah, session expired, logout, isolasi admin jurusan.
- **CMS CRUD**: buat/simpan draft/publish/edit/hapus untuk semua resource.
- **Upload**: JPEG/PNG/WebP/AVIF, file bukan gambar, >5 MB, gambar rusak, output WebP, URL media terbuka, tersimpan di object storage.
- **AI**: generate semua tipe konten, vision analysis, edit, preview, publish, klik berulang hanya kirim satu request, button loading, error ditampilkan.
- **Public**: homepage, profil, berita, detail, kompetensi, guru & staff, sarana; mobile/tablet/desktop.

## 8. Performance testing (Lighthouse)

Tools: Chrome Lighthouse, PageSpeed Insights, Chrome DevTools, WebPageTest.

Target: Performance, Accessibility, Best Practices, SEO, LCP, INP, CLS, TBT, FCP.

Metode: jalankan production build (`npm run start`), buka DevTools mode mobile, jalankan Lighthouse minimal 3x, gunakan median.

Halaman prioritas: Homepage, Profil sekolah, Kompetensi keahlian, Berita, Detail berita.

## 9. Load testing

Tools: k6, Artillery, ApacheBench, autocannon.

Target: 50 / 100 / 250 / 500 virtual users.

Endpoint: `GET /`, `GET /berita`, `GET /profil-sekolah`, `GET /kompetensi-keahlian`, `GET /api/health`, `GET /api/posts`, upload endpoint (rate terbatas).

Metrics: RPS, average latency, P95/P99, error rate, CPU, RAM, DB connections, Nginx response time.

```text
Baseline -> 50 -> 100 -> 250 users -> Identify bottleneck -> Optimize -> Repeat
```

## 10. Pengujian keamanan

Tools: OWASP ZAP, Burp Suite, `npm audit`, Snyk, Lighthouse Best Practices, security headers test.

Diuji: SQL injection, XSS rich content, upload berbahaya, path traversal, unauthorized API, role escalation, rate limit bypass, credential exposure, public MinIO write access, missing headers.

```bash
npm audit
```

Object storage wajib diverifikasi: public user hanya boleh GET object, tidak boleh PUT/DELETE/lihat access key.

---

# Rencana Peningkatan jika Traffic Meningkat

## Tahap 1: 0–5.000 page views/hari

Cukup dengan arsitektur saat ini: 1 VPS, 1 Next.js/PM2, 1 PostgreSQL, 1 MinIO, Nginx, Cloudflare opsional.

Fokus: pastikan WebP aktif, cache publik aktif, backup berjalan, pantau resource, jalankan Lighthouse berkala.

## Tahap 2: 5.000–50.000 page views/hari

Tambahkan: Cloudflare CDN, Redis untuk rate limit, PostgreSQL tuning, database index, query pagination, PM2 cluster/multi-instance, monitoring terpusat, CDN caching media, compression + HTTP/2.

## Tahap 3: 50.000–250.000 page views/hari

Pertimbangkan load balancer, multi-instance Next.js, Redis, managed PostgreSQL, MinIO cluster/managed object storage, CDN. Tambahkan read replica, queue untuk AI, worker terpisah, centralized logging, error tracking, automated deployment, health checks, autoscaling.

## Tahap 4: Traffic & AI usage sangat tinggi

Pisahkan service: public web, admin API, AI orchestration, background worker, PostgreSQL, Redis, object storage, CDN, monitoring. AI generation menjadi job asynchronous yang diproses worker.

## Prioritas peningkatan

1. Object storage MinIO production.
2. Image CDN dan cache header.
3. PostgreSQL indexes.
4. Public query caching.
5. Redis distributed rate limiting.
6. Load testing k6.
7. Monitoring server dan error.
8. Multi-instance application.
9. AI queue/worker.
10. Read replica / managed database.

---

## Kesimpulan

CibiOne CMS memakai **custom full-stack Next.js CMS** dengan PostgreSQL, Drizzle ORM, AI/NLP berbasis OpenAI-compatible API, computer vision untuk analisis gambar, dan object storage S3-compatible untuk media.

Arsitektur saat ini cocok untuk single VPS dan traffic kecil hingga menengah. Fondasi skalabilitas sudah tersedia (caching, image optimization, object storage adapter, validation, rate limiting, SSR).

Bottleneck utama saat traffic meningkat: database query, resource single VPS, in-memory rate limit, latency AI, dan bandwidth media tanpa CDN.

Peningkatan paling berdampak berikutnya: **CDN, Redis, database indexing, monitoring, load testing, lalu multi-instance deployment**.
