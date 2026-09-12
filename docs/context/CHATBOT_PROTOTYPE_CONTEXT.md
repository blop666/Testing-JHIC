# Context Update: AI Chatbot Prototype untuk CMS Admin

**Tanggal:** 24 Agustus 2026  
**Status:** Prototype UI Complete  
**Tujuan:** Mensimulasikan alur kerja AI Content Assistant untuk admin CMS

---

## Overview

Prototype chatbot AI telah dibuat di halaman `/admin/chatbot` untuk mendemonstrasikan alur kerja masa depan di mana admin dapat memberikan instruksi dalam bahasa natural untuk membuat konten CMS (berita, prestasi, pengumuman) tanpa harus mengisi form manual.

**Penting:** Ini adalah prototype simulasi. Semua respons menggunakan template hard-coded dan tidak terhubung ke:
- Model AI/LLM sungguhan
- Database production
- API endpoint `/api/chatbot`

---

## Alur Kerja Prototype

### 1. Admin Memberikan Instruksi
Admin mengetik instruksi dalam bahasa natural, misalnya:
```
Buatkan berita tentang kegiatan PKL kelas XI SIJA yang berlangsung minggu ini.
```

### 2. Chatbot Memahami Instruksi (Simulasi)
Chatbot menampilkan:
- Status "sedang memahami instruksi" (typing indicator)
- Pesan konfirmasi pemahaman

**Logika deteksi konten (template):**
```typescript
const isAchievement = /prestasi|juara|penghargaan|kompetisi|lomba/i.test(text);
const isAnnouncement = /pengumuman|pendaftaran|ppdb|daftar/i.test(text);
const contentType = isAchievement ? "Prestasi" : isAnnouncement ? "Pengumuman" : "Berita";
```

**Logika deteksi jurusan (template):**
```typescript
const department = isAchievement ? "RPL" : /sija/i.test(text) ? "SIJA" : /tkj/i.test(text) ? "TKJ" : "Umum";
```

### 3. Preview Konten
Chatbot menampilkan preview card dengan:
- **Judul:** Judul konten yang akan dibuat
- **Ringkasan/Excerpt:** Isi singkat konten
- **Kategori:** Jenis konten (Prestasi Siswa, Kegiatan Sekolah, Pengumuman)
- **Jurusan:** Scope konten (SIJA, RPL, TKJ, Umum)
- **Status:** Draft (menunggu review)
- **Placeholder Image:** Icon placeholder untuk gambar

### 4. Aksi Admin
Admin dapat:
- **Preview Detail:** Membuka modal detail (belum diimplementasi)
- **Publikasikan:** Mensimulasikan publikasi konten

### 5. Simulasi Publikasi
Setelah admin klik "Publikasikan", chatbot menampilkan pesan sukses:
```
Konten berhasil disimulasikan untuk publikasi. Pada implementasi nyata, konten akan disimpan ke database dan dipublikasikan setelah admin menyetujui.
```

---

## Implementasi Teknis

### File Utama
**Path:** `app/admin/chatbot/page.tsx`

### Struktur Data Message
```typescript
type Message = {
  id: number;
  sender: "ai" | "user";
  text?: string;
  isTyping?: boolean;
  preview?: {
    type: string;
    title: string;
    excerpt: string;
    category: string;
    department: string;
    imageUrl?: string;
  };
  showActions?: boolean;
};
```

### Contoh Prompt yang Tersedia
1. `Buatkan berita tentang kegiatan PKL kelas XI SIJA yang berlangsung minggu ini.`
2. `Tambahkan prestasi baru: Tim RPL juara 2 lomba aplikasi tingkat provinsi.`
3. `Buat pengumuman tentang pendaftaran siswa baru tahun ajaran 2026/2027.`

### Timing Simulasi
- **User mengirim pesan** → typing indicator muncul: `300ms`
- **Typing indicator** → pesan "memahami instruksi": `900ms` (total `1200ms`)
- **Memahami instruksi** → preview konten: `1800ms` (total `3000ms`)

### UI Components yang Digunakan
- `@/components/ui/alert`
- `@/components/ui/badge`
- `@/components/ui/button`
- `motion/react` untuk animasi
- `lucide-react` untuk icon

---

## Perbedaan dengan Implementasi Lama

### Sebelum (Form-based)
- Admin mengisi textarea besar
- Pilih contoh prompt melalui button chip
- Klik "Pahami instruksi" → panel interpretasi muncul
- Panel terpisah untuk workflow steps, interpretasi AI, dan preview
- Layout grid dengan card terpisah

### Sekarang (Chat-based)
- Interface seperti chatbot pada umumnya
- Input di bagian bawah dengan tombol "Kirim"
- Percakapan bergantian: user → AI → user
- Preview konten ditampilkan sebagai message card di dalam chat
- Typing indicator untuk simulasi "AI sedang berpikir"
- Pesan konfirmasi "sedang memahami instruksi"
- Tombol aksi (Preview Detail, Publikasikan) ada di dalam preview card

---

## Yang Belum Diimplementasi (Future)

### 1. Integrasi AI/LLM Sungguhan
Saat ini respons menggunakan regex dan template. Implementasi production memerlukan:
- Provider AI (OpenAI, Anthropic, Gemini, atau lokal)
- Prompt engineering untuk ekstraksi intent dan data
- Structured output (JSON) untuk judul, excerpt, kategori, jurusan
- Context window management
- Error handling untuk hallucination atau respons tidak valid

**Pertimbangan:**
- Model apa yang akan digunakan?
- Apakah self-hosted atau API?
- Format prompt template?
- Bagaimana menangani ambiguitas instruksi?
- Validasi output AI sebelum preview?

### 2. Ekstraksi Data Konten
AI harus dapat mengekstrak:
- **Judul:** dari instruksi user
- **Isi/Body:** generate atau minta user melengkapi
- **Ringkasan/Excerpt:** generate otomatis atau extract dari body
- **Kategori:** deteksi dari konteks atau minta konfirmasi
- **Jurusan:** scope konten (SIJA, RPL, TKJ, atau Umum)
- **Gambar:** saat ini placeholder, future bisa:
  - Generate dengan AI image generator
  - Minta user upload
  - Suggest dari library media
- **Tanggal event:** untuk konten agenda
- **Tags/metadata:** untuk SEO dan filtering

### 3. Preview Detail Modal
Tombol "Preview Detail" saat ini hanya menampilkan alert. Implementasi production:
- Modal/drawer fullscreen
- Render preview konten seperti tampilan public
- Edit inline jika admin ingin menyesuaikan
- Preview responsive (desktop/mobile)

### 4. Konfirmasi dan Validasi Server
Sebelum publikasi, sistem harus:
- Validasi data di server (`server/validators/posts.ts`)
- Cek permission admin (apakah boleh publish untuk jurusan ini?)
- Cek duplikasi konten
- Sanitasi input untuk XSS
- Generate slug unik
- Compress dan optimize gambar

### 5. Penyimpanan ke Database
Saat ini tidak ada koneksi database. Production flow:
- Admin klik "Publikasikan" → request ke `/api/chatbot/publish`
- Server validasi data
- Insert ke tabel `posts` atau `teachers` atau `facilities` sesuai tipe konten
- Set status `draft` atau `published` sesuai permission
- Return post ID dan URL preview

**Schema reference:**
- `db/schema.ts`: table `posts`, `teachers`, `facilities`, `industryPartners`
- `server/validators/posts.ts`: validasi create/update post
- `server/services/posts.ts`: service layer untuk insert

### 6. Scope Akses Jurusan
Admin harus dibatasi scope konten berdasarkan role:
- **Super Admin:** semua jurusan
- **Admin SIJA:** hanya konten SIJA
- **Admin RPL:** hanya konten RPL
- **Admin TKJ:** hanya konten TKJ

**Yang perlu ditambahkan:**
- Field `department` atau `scope` di tabel `admins`
- Middleware validasi scope di API routes
- AI harus mendeteksi jurusan dari instruksi dan memvalidasi dengan scope admin
- Error message jika admin mencoba buat konten di luar scope

### 7. Audit Log
Setiap aksi AI harus dicatat:
- Instruksi user (raw text)
- Interpretasi AI (extracted data)
- Konten yang di-generate
- Timestamp
- Admin ID
- Status (draft/published/rejected)

**Schema baru yang diperlukan:**
```typescript
export const aiChatLogs = pgTable("ai_chat_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => admins.id),
  sessionId: varchar("session_id", { length: 255 }),
  instruction: text("instruction").notNull(),
  interpretation: jsonb("interpretation"),
  generatedContent: jsonb("generated_content"),
  action: varchar("action", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 8. Multi-turn Conversation
Saat ini chatbot hanya satu instruksi → satu respons. Future:
- Admin bisa refine instruksi: "Ubah judulnya menjadi lebih menarik"
- Admin bisa minta revisi: "Tambahkan paragraf tentang manfaat PKL"
- AI harus maintain context dari pesan sebelumnya
- Session management untuk conversation history

**Implementasi:**
- Simpan conversation history di state
- Kirim context ke AI di setiap request
- Identifikasi apakah instruksi baru atau refinement
- Clear context jika admin mulai topik baru

### 9. Batch Operations
Admin bisa minta AI membuat multiple konten sekaligus:
```
Buatkan 3 berita untuk jurusan SIJA tentang kegiatan bulan ini.
```

AI harus:
- Deteksi batch request
- Generate multiple preview cards
- Admin bisa approve/reject per-item atau all
- Bulk insert ke database

### 10. Integration dengan Editor CMS
Alur hybrid:
- AI generate draft → admin review di chatbot → klik "Edit di CMS"
- Redirect ke `/admin/konten/[id]` dengan data pre-filled
- Admin bisa fine-tune dengan rich text editor
- Save draft atau publish dari editor

**Komponen terkait:**
- `components/admin/editor-page.tsx`: form editor yang sudah ada
- Perlu endpoint untuk create draft dari chatbot: `POST /api/chatbot/create-draft`

### 11. Rollback dan Versioning
Jika konten sudah dipublish dari chatbot:
- Admin bisa rollback dari chat history
- Preview diff sebelum rollback
- Versioning untuk track perubahan

### 12. Rate Limiting dan Cost Control
AI API biasanya berbayar:
- Limit request per admin per hari
- Limit token usage per request
- Cache common patterns untuk efisiensi
- Fallback ke template response jika quota habis

### 13. Error Handling
Skenario error yang harus ditangani:
- AI API timeout
- AI return invalid JSON
- Konten generate melanggar policy (spam, inappropriate)
- Database insert gagal
- Permission denied
- Network error

**UI feedback:**
- Error message di chat
- Retry button
- Fallback ke manual form

---

## API Contract (Future Implementation)

### POST `/api/chatbot/interpret`
Request:
```typescript
{
  instruction: string;
  sessionId?: string;
  context?: Message[];
}
```

Response:
```typescript
{
  interpretation: {
    contentType: "berita" | "prestasi" | "pengumuman" | "guru" | "mitra";
    action: "create" | "update" | "delete";
    department: "SIJA" | "RPL" | "TKJ" | "Umum";
    data: {
      title: string;
      excerpt: string;
      body?: string;
      category?: string;
      tags?: string[];
      imageUrl?: string;
      eventDate?: string;
    };
  };
  confidence: number;
  suggestions?: string[];
}
```

### POST `/api/chatbot/publish`
Request:
```typescript
{
  sessionId: string;
  messageId: number;
  contentData: {
    type: string;
    title: string;
    excerpt: string;
    body: string;
    category: string;
    department: string;
    imageUrl?: string;
    status: "draft" | "published";
  };
}
```

Response:
```typescript
{
  success: boolean;
  postId: number;
  slug: string;
  previewUrl: string;
  message: string;
}
```

---

## Security Considerations

### Input Validation
- Sanitasi instruksi user untuk XSS
- Limit panjang instruksi (max 2000 karakter)
- Block prompt injection attempts
- Validasi extracted data sebelum insert

### Authorization
- Verify admin session sebelum process
- Check department scope untuk setiap request
- Audit log semua aksi AI
- Rate limit per user

### Data Privacy
- Jangan kirim credential atau PII ke AI provider
- Mask sensitive data di audit log
- Comply dengan GDPR/privacy policy sekolah

### AI Safety
- Content moderation sebelum publish
- Block inappropriate/offensive content
- Verify fakta untuk konten prestasi/pengumuman
- Human-in-the-loop untuk high-impact content

---

## Testing Strategy

### Unit Tests
- Template detection logic (regex untuk tipe konten)
- Message state management
- Timing simulasi

### Integration Tests
- API `/api/chatbot/interpret` dengan mock AI
- API `/api/chatbot/publish` dengan test database
- Validation dan error handling

### E2E Tests
- User journey: instruksi → preview → publikasi
- Multi-turn conversation
- Permission boundary testing
- Error recovery flow

### Manual Testing Checklist
- [ ] Kirim instruksi berita untuk SIJA
- [ ] Kirim instruksi prestasi untuk RPL
- [ ] Kirim instruksi pengumuman umum
- [ ] Klik contoh prompt
- [ ] Preview detail (saat sudah diimplementasi)
- [ ] Simulasi publikasi
- [ ] Responsive mobile/desktop
- [ ] Typing indicator smooth
- [ ] Scroll otomatis ke message terbaru
- [ ] Input disabled saat processing

---

## Deployment Checklist

Sebelum deploy ke production:

### Backend
- [ ] Pilih AI provider (OpenAI/Anthropic/Gemini/local)
- [ ] Setup API key dan environment variable
- [ ] Implement `/api/chatbot/interpret`
- [ ] Implement `/api/chatbot/publish`
- [ ] Add rate limiting middleware
- [ ] Add scope validation middleware
- [ ] Create audit log table migration
- [ ] Seed test data untuk development

### Frontend
- [ ] Ganti hard-coded template dengan API call
- [ ] Implement preview detail modal
- [ ] Add error boundary
- [ ] Add loading states
- [ ] Implement retry mechanism
- [ ] Add confirmation dialog sebelum publish
- [ ] Optimize bundle size (lazy load motion/react jika perlu)

### Security
- [ ] Security review untuk prompt injection
- [ ] Content moderation integration
- [ ] CSRF protection
- [ ] Input sanitization
- [ ] Rate limiting
- [ ] Audit logging

### Documentation
- [ ] Admin user guide untuk fitur chatbot
- [ ] API documentation untuk future maintenance
- [ ] Prompt engineering guide
- [ ] Troubleshooting guide
- [ ] Cost estimation dan monitoring

---

## Related Files

### Core Implementation
- `app/admin/chatbot/page.tsx` - Halaman chatbot utama (prototype)
- `app/api/chatbot/route.ts` - API endpoint untuk AI integration (belum terhubung)

### Supporting Components
- `components/ui/ai-chat-card.tsx` - Chatbot publik lama (berbeda dari admin chatbot)
- `components/admin/editor-page.tsx` - Form editor manual CMS
- `components/admin/resource-page.tsx` - List resource admin

### Backend Services
- `server/validators/posts.ts` - Validasi post schema
- `server/services/posts.ts` - Service layer untuk create/update post
- `server/queries/public-content.ts` - Query konten public

### Database
- `db/schema.ts` - Schema Drizzle ORM
- `db/index.ts` - Database connection singleton

### Documentation
- `docs/context/AI_FINALIZATION_CONTEXT.md` - Context implementasi utama
- `docs/planning/cms-content-and-collaboration.md` - Kontrak CMS dan ownership

---

## Prompt Examples untuk Testing

### Berita Kegiatan
```
Buatkan berita tentang kunjungan industri siswa TKJ ke PT Telkom minggu lalu.
```

Expected output:
- Type: Berita
- Department: TKJ
- Category: Kegiatan Sekolah
- Title: Siswa TKJ Kunjungi PT Telkom untuk Eksplorasi Teknologi Industri
- Excerpt: Siswa kelas XI TKJ melaksanakan kunjungan industri ke PT Telkom...

### Prestasi Siswa
```
Tim SIJA juara 1 lomba jaringan komputer tingkat nasional, tolong buatkan pengumumannya.
```

Expected output:
- Type: Prestasi
- Department: SIJA
- Category: Prestasi Siswa
- Title: Tim SIJA Raih Juara 1 Lomba Jaringan Komputer Tingkat Nasional
- Excerpt: Tim Sistem Informasi Jaringan dan Aplikasi SMKN 1 Cibinong meraih...

### Pengumuman
```
Buat pengumuman libur semester genap tahun ajaran 2025/2026 dari tanggal 20-30 Desember.
```

Expected output:
- Type: Pengumuman
- Department: Umum
- Category: Pengumuman
- Title: Libur Semester Genap Tahun Ajaran 2025/2026
- Excerpt: SMKN 1 Cibinong mengumumkan libur semester genap akan berlangsung...

### Ambiguous Case (butuh clarification)
```
Buatkan konten tentang RPL.
```

AI harus:
- Deteksi instruksi terlalu umum
- Minta klarifikasi: "Konten apa yang ingin dibuat? Berita, prestasi, atau pengumuman? Topik spesifik apa?"

---

## Performance Metrics (Future)

Metrics yang perlu dimonitor:
- **AI Response Time:** target < 3 detik
- **Accuracy Rate:** % instruksi yang berhasil diinterpretasi dengan benar
- **User Satisfaction:** rating setelah publish konten
- **Edit Rate:** % konten yang diedit manual setelah AI generate
- **Publish Rate:** % preview yang akhirnya dipublish
- **Error Rate:** % request yang gagal
- **Cost per Request:** biaya AI API per instruksi

---

## Kesimpulan

Prototype chatbot admin ini adalah demonstrasi alur kerja masa depan. Semua respons saat ini menggunakan template dan tidak terhubung ke AI atau database sungguhan.

**Next Steps:**
1. Review dan approval prototype UI/UX
2. Pilih AI provider dan setup API
3. Implement backend `/api/chatbot/*` endpoints
4. Integrate chatbot prototype dengan API
5. Add scope validation dan audit logging
6. Testing dan iteration
7. Production deployment dengan monitoring

**Untuk AI/Developer Selanjutnya:**
- Baca file ini untuk memahami konteks lengkap
- Jangan ubah prototype tanpa diskusi dengan stakeholder
- Prioritaskan security dan validation sebelum menghubungkan ke AI sungguhan
- Test secara menyeluruh sebelum deploy
- Document setiap perubahan di file ini

---

**End of Context Update**
