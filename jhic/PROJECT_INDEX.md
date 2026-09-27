# PROJECT INDEX — CibiOne CMS

> Indeks proyek otomatis untuk **CibiOne CMS** — Website CMS Terdesentralisasi SMKN 1 Cibinong (JHIC 2026).
> Dokumen ini memetakan struktur folder, dokumentasi (`.md`), alur website/aplikasi, dan komponen penting.
> Seluruh tautan memakai format Obsidian Wiki-Links `[[Nama Note]]` agar siap diimpor ke Obsidian Graph View.
>
> Generated: 2026-09-23

---

## 1. Ringkasan Project

- **Nama**: CibiOne CMS — CMS terdesentralisasi untuk [[SMKN 1 Cibinong]]
- **Dibangun untuk**: Jagoan Hosting Innovation Competition (JHIC) 2026
- **Stack**: Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS 4, Drizzle ORM, PostgreSQL, TanStack Query
- **Target deployment**: self-hosted VPS (Nginx + PM2 + PostgreSQL lokal); media lokal di `public/uploads/`; chatbot memakai provider AI eksternal
- **Konsep utama**: tiap jurusan/kompetensi keahlian punya kontrol mandiri atas kontennya (multi-role: `super_admin` & `jurusan_admin`)

---

## 2. Folder & File Structure

```
CibiOne_CMS/
├── app/                          # Next.js App Router (routes, pages, API)
│   ├── (public)/                 # Halaman publik (Server Components / SSR)
│   │   ├── page.tsx              # Home
│   │   ├── profil-sekolah/       # Profil Sekolah
│   │   ├── kompetensi-keahlian/  # Kompetensi Keahlian
│   │   ├── berita/               # Berita (list + prestasi + [slug])
│   │   └── kontak/               # Kontak
│   ├── admin/                    # Dashboard CMS (Client Components + TanStack Query)
│   │   ├── berita/               # Kelola berita/konten
│   │   ├── chatbot/              # Chatbot AI (prototype)
│   │   ├── guru/                 # Guru & Staff
│   │   ├── kategori-guru/        # Kategori guru
│   │   ├── kategori-konten/      # Kategori konten
│   │   ├── konten/               # Konten (berita/pengumuman/prestasi/agenda)
│   │   ├── mitra-industri/       # Mitra industri
│   │   ├── pengaturan/           # Pengaturan (visi-misi, akreditasi)
│   │   └── sarana-prasarana/     # Sarana & prasarana
│   ├── api/                      # REST API Route Handlers
│   │   ├── auth/                 # login, logout, session, login-debug
│   │   ├── chatbot/              # POST /api/chatbot (provider boundary)
│   │   ├── guru/                 # CRUD guru
│   │   ├── guru-categories/      # CRUD kategori guru
│   │   ├── jurusan/              # CRUD jurusan
│   │   ├── kerjasama-industri/   # CRUD mitra industri
│   │   ├── post-categories/      # CRUD kategori post
│   │   ├── posts/                # CRUD posts + analytics
│   │   ├── sarana-prasarana/     # CRUD fasilitas
│   │   ├── settings/             # GET/PUT site settings
│   │   └── uploads/              # Upload media (filesystem)
│   ├── login/                    # Halaman login
│   ├── uploads/                  # Serve media lokal
│   ├── layout.tsx                # Root layout (font, chatbot loader)
│   └── globals.css               # Global styles
├── components/                   # Komponen React
│   ├── admin/                    # Admin shell & page helper (CRUD, editor, dll)
│   ├── sections/                 # Section halaman publik (per halaman)
│   │   ├── berita/               # Section berita (card, list, modal, prestasi)
│   │   └── profil-sekolah/       # Section profil (sejarah, visi-misi, dll)
│   └── ui/                       # Base UI primitives (shadcn/Base UI)
├── db/                           # Database
│   ├── schema.ts                 # Drizzle schema (semua tabel)
│   ├── index.ts                  # Koneksi DB (load env)
│   └── seeds/                    # Seed idempoten
├── drizzle/                      # Migrasi SQL (0000, 0001) + meta
├── docs/                         # Dokumentasi (lihat §3)
├── hooks/                        # Hook shared (use-mobile)
├── lib/                          # Helper (auth, api-response, slug, utils)
├── public/                       # Static assets (logo, banner, uploads)
├── scripts/                      # Backend self-check, deploy VPS, check-user
├── server/                       # Backend logic layer
│   ├── auth/                     # Session management
│   ├── content/                  # Markdown sanitizer
│   ├── queries/                  # Public read models (public-content, dashboard)
│   ├── repositories/             # Drizzle query layer (posts)
│   ├── services/                 # Business logic (posts)
│   ├── validators/               # Zod schemas (content, posts)
│   ├── cache.ts / http.ts / rate-limit.ts / settings.ts
├── .github/workflows/            # CI (ci.yml) & deploy (deploy.yml)
├── layout_image/                 # Gambar layout + laporan Lighthouse
├── package.json                  # Dependencies & scripts
├── drizzle.config.ts             # Konfigurasi Drizzle Kit
├── next.config.ts                # Konfigurasi Next.js
├── tsconfig.json                 # Konfigurasi TypeScript
└── .env / .env.example           # Environment variables (tidak di-commit)
```

**Catatan**: folder `node_modules`, `.git`, `.next`, `dist`, `vendor` dan build artifacts diabaikan dari indeks ini.

### Fungsi Direktori Utama

| Direktori | Fungsi |
|---|---|
| `app/(public)/` | Halaman publik yang dirender server-side (SEO) |
| `app/admin/` | Dashboard CMS terproteksi (client-side, TanStack Query) |
| `app/api/` | Backend logic via Next.js Route Handlers (REST-style) |
| `components/` | Komponen UI (ui = primitives, sections = blok halaman, admin = form/tabel CMS) |
| `db/` + `drizzle/` | Skema database dan migrasi |
| `server/` | Layer bisnis backend: auth, query, repository, service, validators |
| `lib/` | Helper lintas-konteks (auth, api response envelope, slug, utils) |
| `docs/` | Dokumentasi, SRS, planning, referensi komponen |
| `scripts/` | Self-check backend, deploy VPS, util |

---

## 3. Dokumentasi & Content Summary (.md Files)

### 3.1 Dokumentasi Root (Project)

| File | Ringkasan |
|---|---|
| [[README]] | Quick start, fitur utama, tech stack, struktur project, API endpoints, roadmap |
| [[FIRST_README]] | Panduan engineer baru: identitas project, urutan baca dokumen, env vars, aturan deploy & kode |
| [[DOCUMENTATION]] | Dokumentasi lengkap: ringkasan, teknologi, schema DB, API, arsitektur, panduan development |
| [[CHANGELOG]] | Riwayat perubahan (Keep a Changelog + SemVer), roadmap, known issues |
| [[CONTRIBUTING]] | Panduan kontribusi: workflow, coding standards, git, PR, testing, review |
| [[SECURITY]] | Kebijakan keamanan, report vulnerability, best practices, checklist |
| [[LICENSE]] | Lisensi MIT & atribusi third-party |

### 3.2 Dokumentasi `docs/` (Operasional & Panduan)

| File | Ringkasan |
|---|---|
| [[PANDUAN_PENGGUNAAN]] | Panduan end-user: login, dashboard, kelola berita/prestasi/agenda/guru/jurusan/settings/chatbot |
| [[API_DOCUMENTATION]] | Dokumentasi REST API lengkap (auth, posts, jurusan, guru, settings, chatbot) + error codes |
| [[DEPLOYMENT_GUIDE]] | Panduan deploy ke Vercel, DB production, Blob storage, custom domain, monitoring |
| [[PRODUCTION_SETUP]] | Runbook production self-hosted VPS (Nginx, PM2, PostgreSQL, media lokal, backup, keamanan) |
| [[PANDUAN_MERGE_GITHUB]] | Panduan merge & push GitHub tanpa konflik (branch, rebase, PR, squash) |
| [[LAPORAN_KOMPETENSI_KEAHLIAN]] | Laporan section Kompetensi Keahlian: perubahan, gap menuju konten dinamis |

### 3.3 `docs/context/` (Konteks Inti & Aturan)

| File | Ringkasan |
|---|---|
| [[AI_CONTEXT]] | Briefing single-source-of-truth untuk AI: rules ketat (component reuse, static vs dynamic), stack, aturan repo |
| [[AI_CONTEXT_2]] | Handoff status implementasi terbaru: backend, CMS frontend, chatbot reality, production gaps |
| [[AI_FINALIZATION_CONTEXT]] | Handoff implementasi backend/CMS: non-negotiable rules, schema target, API target, urutan implementasi |
| [[architecture]] | Arsitektur sistem, struktur folder, pattern backend (ContentList & SiteSetting), auth & role scoping |
| [[project]] | Overview & site map halaman/section beserta klasifikasi konten |
| [[component-registry]] | Daftar komponen/template per section (Cult UI, UI Layouts, Magic UI, Aura Build, dll) |
| [[decisions]] | ADR (Architecture Decision Records) ADR-001 s/d ADR-010 |
| [[glossary]] | Istilah domain & teknis baku (section, jurusan, ContentList, SiteSetting, dll) |
| [[SRS_TEMPLATE]] | Template wajib untuk menulis SRS section |
| [[FRONTEND_HANDOFF_2026-08-20]] | Handoff frontend: status, kontrak navbar, area sensitif (hero, sejarah), image & performa |
| [[CHATBOT_PROTOTYPE_CONTEXT]] | Konteks prototype AI chatbot admin (alur, struktur data, future integration) |

### 3.4 `docs/planning/` (Perencanaan Implementasi)

| File | Ringkasan |
|---|---|
| [[01-current-state-and-target]] | Kondisi saat ini vs target MVP + content ownership matrix |
| [[02-target-architecture]] | Target arsitektur modular monolith, layer responsibilities, request pipeline, security |
| [[03-data-model-and-migrations]] | Skema data target, tabel baru, index, prosedur migration & seed |
| [[04-api-and-authorization-contract]] | Kontrak REST API, visibility/sorting, authorization matrix, delete policy |
| [[05-implementation-roadmap]] | Urutan implementasi, test checklist, batas kolaborasi |
| [[cms-content-and-collaboration]] | Kontrak CMS konten, database, API, integrasi frontend, kolaborasi GitHub |

### 3.5 SRS — Software Requirement Specifications (`docs/srs/`)

#### Home (`docs/srs/home/`)

| File | Section | Status |
|---|---|---|
| [[hero-banner]] | Hero Banner (Dynamic – List) | Waiting for Approval |
| [[principal-greeting]] | Sambutan Kepala Sekolah | Waiting for Approval |
| [[announcement-board]] | Pengumuman (bento) | Waiting for Approval |
| [[news-showcase]] | Berita Terbaru (masonry) | Waiting for Approval |
| [[school-events]] | Event Sekolah | Waiting for Approval |
| [[profile-video]] | Video Profil | Waiting for Approval |

#### Profil Sekolah (`docs/srs/profil-sekolah/`)

| File | Section | Status |
|---|---|---|
| [[sejarah]] | Sejarah (Static) | Done |
| [[sejarah-revision]] | Sejarah revision (timeline) | Done |
| [[visi-misi]] | Visi & Misi (Singleton) | Fase 1 Done |
| [[visi-misi-revision]] | Visi & Misi revision | Done |
| [[guru-staff]] | Guru & Staff (List) | Pending |
| [[guru-staff-revision]] | Guru & Staff revision | Done |
| [[sarana-prasarana]] | Sarana & Prasarana (List) | Fase 1 Done |
| [[akreditasi]] | Akreditasi (Singleton) | Fase 1 Done |
| [[kerja-sama-industri]] | Kerja Sama Industri (List) | Fase 1 Done |

#### Berita, Kompetensi, Kontak

| File | Section | Status |
|---|---|---|
| [[berita]] | Berita (Dynamic – List) | Waiting for Approval |
| [[program-keahlian-section]] | Daftar Program Keahlian (jurusan) | Fase 1 Done |
| [[contact-section]] | Section Kontak (footer) | Waiting for Approval |

#### Backend & Admin

| File | Ringkasan |
|---|---|
| [[backend-finalization]] | Kontrak implementasi backend CMS MVP (schema, endpoint, auth, upload, seed, dashboard) |
| [[backend-completion]] | SRS pelengkap gap: layer contract, seed, migration, admin CMS, media, cache, chatbot, rate limit |
| [[admin-ui]] | SRS UI admin: halaman, role, form, state, aksi per resource |
| [[design]] | Design system visual admin CMS (warna, tipografi, komponen) |
| [[design/README]] | Indeks design spec per page admin |

### 3.6 Referensi & Analisis (`docs/references/`, `docs/analysis/`, `docs/revisi/`, `docs/sections/`)

| File | Ringkasan |
|---|---|
| [[modal-animation-analysis]] | Analisis performa animasi modal berita (opsi & benchmark) |
| [[DOKUMENTASI_CONTACT]] | Dokumentasi detail section kontak (struktur, elemen, styling, status) |
| [[design]] (revisi) | Redesign spec halaman Kontak (token, peta hero, form, checklist AI slop) |
| [[design-jurusan]] | Redesign spec halaman Jurusan (list + modal detail) |
| [[design-jurusan-halaman]] | Revisi struktur halaman Jurusan (breadcrumb, keunggulan, fasilitas, footer navy) |
| `docs/references/home/hero-banner/README` | Panduan code reference Hero Banner |
| `docs/references/berita/berita/linear-dialog-reference` | Referensi Linear Dialog |
| `docs/references/kontak/footer-template/ADAPTASI` | Adaptasi template footer ke React |

### 3.7 Catatan Tim (BELA, di luar scope CMS)

Folder `docs/ignoret/` berisi dokumen lomba terpisah (proposal **BELA** untuk BEEFest SDLC 2026):

| File | Ringkasan |
|---|---|
| [[BELA_REVISION_GUIDE]] | Panduan revisi proposal BELA (bukti produk, rule engine, privasi, pilot, metrik) |
| [[BELA_TEAM_WORKPLAN]] | Rencana kerja tim proposal & programmer BELA |
| [[changelog-revisi-BELA]] | Changelog revisi proposal BELA |

### 3.8 Laporan Performa

| File | Ringkasan |
|---|---|
| [[lighthouse-report]] | Laporan Lighthouse: Performance 44/100, LCP 17.2s, TBT 3930ms + prioritas perbaikan |

---

## 4. Website & Application Flow

### 4.1 Struktur Rute Publik

| Route | File | Deskripsi |
|---|---|---|
| `/` | `app/(public)/page.tsx` | Halaman Home (hero, sambutan, prestasi, berita, event, video) |
| `/profil-sekolah` | `app/(public)/profil-sekolah/page.tsx` | Profil Sekolah (sejarah, visi-misi, guru, sarana, akreditasi, mitra) |
| `/kompetensi-keahlian` | `app/(public)/kompetensi-keahlian/page.tsx` | Daftar 10 program keahlian |
| `/berita` | `app/(public)/berita/page.tsx` | List berita + highlight prestasi |
| `/berita/prestasi` | `app/(public)/berita/prestasi/page.tsx` | Highlight Prestasi |
| `/berita/[slug]` | `app/(public)/berita/[slug]/page.tsx` | Detail berita |
| `/kontak` | `app/(public)/kontak/page.tsx` | Halaman kontak |
| `/login` | `app/login/page.tsx` | Halaman login admin |

### 4.2 Struktur Rute Admin (terproteksi)

| Route | Deskripsi |
|---|---|
| `/admin` | Dashboard (ringkasan konten) |
| `/admin/konten` (+ `/baru`, `/[id]`) | Kelola berita/pengumuman/prestasi/agenda |
| `/admin/kategori-konten` | Kategori konten |
| `/admin/guru` (+ `/baru`, `/[id]`) | Kelola guru & staff |
| `/admin/kategori-guru` | Kategori guru |
| `/admin/sarana-prasarana` (+ `/baru`, `/[id]`) | Kelola fasilitas |
| `/admin/mitra-industri` (+ `/baru`, `/[id]`) | Kelola mitra industri |
| `/admin/pengaturan` (+ `/visi-misi`, `/akreditasi`) | Pengaturan sekolah |
| `/admin/chatbot` | Chatbot AI (placeholder/prototype) |

### 4.3 API Endpoints

| Grup | Endpoint | Fungsi |
|---|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/session`, `login-debug` | Autentikasi & session |
| Posts | `GET/POST /api/posts`, `GET/PUT/DELETE /api/posts/[id]`, `GET /api/posts/analytics` | CRUD konten (berita/pengumuman/prestasi/agenda) |
| Kategori post | `GET/POST /api/post-categories`, `/[id]` | Master kategori konten |
| Guru | `GET/POST /api/guru`, `/[id]` | CRUD guru |
| Kategori guru | `GET/POST /api/guru-categories`, `/[id]` | Master kategori guru |
| Jurusan | `GET/POST /api/jurusan`, `/[id]` | CRUD jurusan |
| Mitra | `GET/POST /api/kerjasama-industri`, `/[id]` | CRUD mitra industri |
| Sarana | `GET/POST /api/sarana-prasarana`, `/[id]` | CRUD fasilitas |
| Settings | `GET/PUT /api/settings`, `/[key]` | Site settings (visi-misi, akreditasi) |
| Chatbot | `POST /api/chatbot` | Provider boundary chatbot |
| Uploads | `POST /api/uploads`, `GET /api/uploads/[...path]` | Upload & serve media |

### 4.4 Alur Aplikasi

```
Pengunjung publik ──► Server Components (app/(public)/)
                      └─► server/queries/ ──► PostgreSQL
                             └─► render ke sections/ (UI interaktif)

Admin (super_admin / jurusan_admin)
   └─► /login ─► session cookie (httpOnly) ─► app/admin/
        └─► TanStack Query ─► app/api/** ─► server/services ─► repositories ─► PostgreSQL

Media upload ─► app/api/uploads ─► public/uploads/ (filesystem) ─► URL disimpan di DB

Chatbot ─► app/api/chatbot ─► provider AI eksternal (prompt + knowledge) ─► { answer }
```

### 4.5 Komponen Utama (Section Publik)

| Halaman | Komponen | File |
|---|---|---|
| Home | Hero Banner | `components/sections/hero-banner.tsx` |
| Home | Sambutan Kepala Sekolah | `components/sections/principal-greeting.tsx` |
| Home | Highlight Prestasi | `components/sections/achievement-highlight.tsx` |
| Home | Berita Terbaru | `components/sections/news-showcase.tsx` |
| Home | Pengumuman | `components/sections/announcement-board.tsx` |
| Home | Event Sekolah | `components/sections/school-events.tsx` |
| Home | Video Profil | `components/sections/school-profile-video.tsx` |
| Profil | Sejarah | `components/sections/profil-sekolah/sejarah-section.tsx` |
| Profil | Visi & Misi | `components/sections/profil-sekolah/visi-misi-section.tsx` |
| Profil | Guru & Staff | `components/sections/profil-sekolah/guru-staff-section.tsx` |
| Profil | Sarana & Prasarana | `components/sections/profil-sekolah/sarana-prasarana-section.tsx` |
| Profil | Akreditasi | `components/sections/profil-sekolah/akreditasi-section.tsx` |
| Profil | Kerja Sama Industri | `components/sections/profil-sekolah/kerja-sama-industri-section.tsx` |
| Kompetensi | Daftar Jurusan | `components/sections/kompetensi-section.tsx` |
| Berita | Section Berita | `components/sections/berita/berita-section.tsx` |
| Kontak | Footer Kontak | `components/sections/contact-footer.tsx` |

### 4.6 Komponen Admin & UI

| Kategori | Komponen |
|---|---|
| Admin shell | `components/admin/admin-shell.tsx`, `query-provider.tsx` |
| Admin page helper | `resource-page.tsx`, `editor-page.tsx`, `content-list.tsx`, `category-page.tsx`, `settings-page.tsx` |
| UI primitives | `button.tsx`, `input.tsx`, `dialog.tsx`, `sheet.tsx`, `table.tsx`, `tabs.tsx`, `badge.tsx`, dll (folder `components/ui/`) |
| Komponen interaktif | `bento-gallery.tsx`, `infinite-slider.tsx`, `logo-cloud.tsx`, `cutout-card.tsx`, `linear-dialog.tsx`, `timeline.tsx`, `ai-chat-card.tsx` |

### 4.7 Backend Logic (server/)

| Layer | File | Fungsi |
|---|---|---|
| Auth | `server/auth/session.ts` | Session cookie (hash token, create/validate/revoke) |
| Query publik | `server/queries/public-content.ts` | Read model untuk post/guru/fasilitas/mitra/settings |
| Dashboard | `server/queries/dashboard.ts` | Aggregate & Top Posts |
| Repository | `server/repositories/posts.ts` | Query Drizzle posts |
| Service | `server/services/posts.ts` | Business rule posts |
| Validators | `server/validators/content.ts`, `posts.ts` | Zod schema |
| Util | `server/cache.ts`, `http.ts`, `rate-limit.ts`, `settings.ts`, `content/markdown.ts` | Helper backend |

### 4.8 Database Schema (drizzle)

| Tabel | Deskripsi |
|---|---|
| `users` | Akun admin (super_admin / jurusan_admin) |
| `sessions` | Session token (hash) |
| `jurusan` | Kompetensi keahlian |
| `posts` | Konten terpadu (berita/pengumuman/prestasi/agenda) |
| `post_categories` | Kategori konten |
| `guru` + `guru_categories` | Data guru & kategori |
| `sarana_prasarana` | Fasilitas sekolah |
| `kerjasama_industri` | Mitra industri |
| `site_settings` | Key-value singleton (visi-misi, akreditasi) |
| `chatbot_knowledge` | Knowledge base chatbot |

Definisi lengkap: `db/schema.ts`; migrasi: `drizzle/`; seed: `db/seeds/index.ts`.

---

## 5. Obsidian Graph Compatibility

- Semua entri penting dalam dokumen ini memakai Wiki-Link `[[Nama Note]]`.
- File `.md` tertaut berdasarkan nama filenya (tanpa ekstensi, sesuai default Obsidian).
- File kode (`.tsx`, `.ts`) dirujuk sebagai catatan dengan path, mis. `[[app/(public)/profil-sekolah/page.tsx]]`.
- Agar file non-`.md` muncul di Graph View, aktifkan **Settings → Files & Links → Detect all file extensions**.
- Topologi utama yang akan terlihat di Graph View:
  - **Root docs** (`README`, `DOCUMENTATION`, `AI_CONTEXT`, dll) menjadi hub pusat.
  - **`docs/planning/`** menjadi jembatan antara konteks dan SRS.
  - **SRS per section** tertaut ke komponen UI dan endpoint API terkait.
  - **`architecture` / `decisions`** menghubungkan pola backend (ContentList, SiteSetting) ke seluruh resource.
