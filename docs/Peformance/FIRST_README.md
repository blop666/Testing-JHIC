# CibiOne CMS: First Read

Dokumen ini untuk engineer yang baru mengambil alih project. Ikuti urutan. Jangan langsung mengubah kode atau menjalankan migration production tanpa membaca bagian wajib.

## 1. Identitas Project

- Project: CibiOne CMS SMKN 1 Cibinong.
- Repository: `https://github.com/gloomsgluyy/CibiOne_CMS.git`.
- Branch production: `main`.
- Stack: Next.js 15, React 19, TypeScript, Tailwind 4, Drizzle, PostgreSQL, local filesystem media.
- Target deployment: full self-hosted VPS. Chatbot tetap memakai provider AI eksternal.

## 2. Setelah Masuk VPS

Pastikan akses tersedia:

```bash
git --version
node --version
npm --version
```

Target runtime: Node.js 22 LTS, npm 10+.

Clone pertama kali:

```bash
git clone https://github.com/gloomsgluyy/CibiOne_CMS.git
cd CibiOne_CMS
```

Jika folder sudah ada:

```bash
cd CibiOne_CMS
git status
git pull origin main
```

Jangan memakai `git reset --hard`, `git clean -fd`, atau checkout destruktif sebelum memastikan tidak ada perubahan lokal penting.

## 3. Baca Dokumen Ini Berurutan

1. `FIRST_README.md` ini.
2. `docs/context/AI_CONTEXT_2.md` untuk status implementasi terbaru.
3. `docs/context/AI_CONTEXT.md` untuk aturan project.
4. `docs/context/AI_FINALIZATION_CONTEXT.md` untuk kontrak backend/CMS.
5. `docs/PRODUCTION_SETUP.md` untuk setup production lengkap.
6. `docs/PERFORMANCE_OPTIMIZATION_GUIDE.md` untuk target performa, caching, image pipeline, dan scaling.
7. SRS terkait di `docs/srs/` sebelum mengubah fitur tertentu.

Setelah membaca, pahami dulu bagian **Known Production Gaps** pada `AI_CONTEXT_2.md`. Project belum boleh disebut production-ready hanya karena build berhasil.

## 4. Install dan Verifikasi Tanpa Mengubah Data Production

```bash
npm ci
npm run test:backend
npx tsc --noEmit
npm run build
git diff --check
```

Jika semua lulus, source code dan dependency dasar valid.

Jika `npm ci` gagal:

- Baca error lengkap.
- Jangan menjalankan `npm audit fix --force`.
- Jangan upgrade Next.js/Drizzle sembarangan.
- Cek Node.js 22 LTS.
- Bandingkan `package.json` dan `package-lock.json`.

## 5. Environment Variables

Buat file local hanya untuk development:

```bash
cp .env.example .env.local
```

Isi variable sesuai environment, bukan memakai credential historis:

```env
DATABASE_URL=
INITIAL_ADMIN_EMAIL=
INITIAL_ADMIN_PASSWORD=
CHATBOT_PROVIDER_URL=
CHATBOT_PROVIDER_KEY=
```

Rules:

- Jangan commit `.env.local`.
- Jangan menulis secret di Markdown, source code, issue, atau chat.
- Jangan memakai database production untuk local development.
- Jangan memakai Preview deployment untuk database production.
- Credential yang pernah bocor wajib direvoke dan diganti.

## 6. Database

Project memakai PostgreSQL dan Drizzle. Migration production dijalankan terpisah dari build aplikasi.

Lihat `docs/PRODUCTION_SETUP.md` sebelum menjalankan command berikut:

```bash
npx drizzle-kit migrate
npm run db:seed
```

Rules:

- Production: gunakan `drizzle-kit migrate`.
- Production: jangan gunakan `drizzle-kit push`.
- Seed harus idempotent.
- Pastikan `DATABASE_URL` menunjuk environment yang benar sebelum migration.
- Backup database sebelum migration berisiko.

## 7. Run Development

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/admin
```

Jika database kosong dan `NODE_ENV=development`, preview login tersedia hanya untuk UI:

```text
Email: preview@cibione.local
Password: preview-cms
```

Preview login bukan credential production.

## 8. Deployment

Canonical flow:

```text
push main -> GitHub CI -> deploy VPS
```

GitHub CI berada di `.github/workflows/ci.yml` dan menjalankan:

```bash
npm ci
npx tsc --noEmit
npm run build
```

Production setup VPS, PostgreSQL lokal, media lokal, domain, backup, dan security:

```text
docs/PRODUCTION_SETUP.md
```

Full self-hosted memakai Nginx, PM2, PostgreSQL lokal, dan filesystem media. Untuk deploy VPS, gunakan urutan:

```bash
npm ci
npm run build
npx drizzle-kit migrate
pm2 restart cibione-cms --update-env
```

Jangan menaruh secret di script yang di-commit. Jangan menjalankan migration setelah aplikasi baru aktif jika schema baru wajib tersedia; gunakan urutan migration yang backward-compatible sesuai `docs/PRODUCTION_SETUP.md`.

## 9. Area yang Sudah Ada

- Public school website.
- Protected admin shell.
- Auth/session/RBAC.
- CRUD posts, categories, guru, facilities, partners, settings.
- Drizzle schema, migrations, seeds.
- Local filesystem upload endpoint (`public/uploads/`).
- Dashboard, Top Posts, content analytics.
- Public content query layer and initial cache tags.
- TanStack Query foundation for admin.
- Chatbot provider boundary and knowledge-base lookup.

## 10. Jangan Salah Klaim

Fitur berikut belum lengkap atau belum runtime-verified:

- Chatbot NLU action engine.
- Chatbot admin management UI.
- Scheduled publishing worker/cron.
- Distributed rate limiting; current limiter is in-memory per instance.
- Full PostgreSQL/media production integration test.
- Full API authorization matrix integration test.
- Complete role-aware admin menu visibility.
- Complete settings repeaters.
- Complete service/repository migration for every resource.

Chatbot provider saat ini hanya menerima prompt + knowledge dan mengembalikan `{ answer: string }`. Jangan memberi provider kemampuan mutation langsung. Action CMS harus memakai intent schema, server authorization, preview, confirmation, idempotency, dan audit log.

## 11. Rules Saat Mengubah Kode

- Baca context dan SRS terkait terlebih dahulu.
- Pertahankan public UI yang sudah disetujui.
- Jangan percaya `jurusan_id` dari browser untuk authorization.
- Validasi input di trust boundary dengan Zod.
- Gunakan standard API envelope.
- Jangan expose secret.
- Jangan menambah Redis sebelum ada kebutuhan terukur.
- Jangan mengubah dependency major tanpa review.
- Tambahkan verification untuk logic non-trivial.
- Run checks sebelum commit.

## 12. Sebelum Commit dan Push

```bash
npm run test:backend
npx tsc --noEmit
npm run build
```

Commit hanya file yang dimaksud:

```bash
```

Setelah push, buka GitHub Actions. Status harus hijau sebelum menyatakan perubahan aman. Jika gagal, baca job log; jangan menghapus workflow atau melewati check.

## 13. Pertanyaan ke AI

Berikan prompt berikut bersama path project:

```text
Baca FIRST_README.md, docs/context/AI_CONTEXT_2.md,
docs/context/AI_CONTEXT.md, docs/context/AI_FINALIZATION_CONTEXT.md,
docs/PRODUCTION_SETUP.md, lalu file SRS terkait.

Jelaskan status project berdasarkan file aktual. Jangan mengklaim fitur
production-ready tanpa runtime verification. Sebelum mengubah kode,
cek git status dan pertahankan perubahan yang tidak terkait.
```

## 14. First Action Checklist

- [ ] `git status` bersih atau perubahan lokal sudah dipahami.
- [ ] `git pull origin main` selesai.
- [ ] `FIRST_README.md` selesai dibaca.
- [ ] `docs/context/AI_CONTEXT_2.md` selesai dibaca.
- [ ] `docs/PRODUCTION_SETUP.md` selesai dibaca.
- [ ] Node.js 22 LTS aktif.
- [ ] `npm ci` lulus.
- [ ] Tidak ada secret di working tree yang akan di-commit.
- [ ] Database target sudah dipastikan bukan salah environment.
- [ ] Backup tersedia sebelum migration production.
- [ ] GitHub Actions hijau setelah push.
