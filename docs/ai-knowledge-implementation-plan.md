# Rencana Implementasi AI Chatbot Knowledge

Status: Planned

Dokumen ini menjadi rencana implementasi untuk:

1. CRUD `chatbot_knowledge` di admin.
2. Upload PDF/DOCX sebagai sumber knowledge.
3. Ekstraksi teks, preview, verifikasi, dan publish workflow.
4. Retrieval knowledge yang lebih relevan.
5. Integrasi embeddings dan Supabase `pgvector` setelah provider embedding tervalidasi.

Rencana ini melanjutkan arsitektur pada `docs/ai-chatbot-plan.md` dan aturan operasional pada `docs/chatbot-knowledge-guide.md`.

## 1. Keputusan Utama

- Knowledge tetap dikontrol admin; chatbot tidak belajar permanen dari percakapan.
- AI tidak boleh menulis knowledge atau konten langsung ke database.
- Semua knowledge baru berstatus draft sampai diverifikasi admin.
- Data yang dipakai chatbot publik hanya `isActive = true` dan `isPublished = true`.
- Dokumen asli PDF/DOCX tidak disimpan secara default.
- Sistem menyimpan teks hasil ekstraksi, metadata sumber, dan hash file.
- PDF text-based dan DOCX didukung pada tahap awal.
- PDF scan/image membutuhkan OCR dan tidak menjadi bagian default tahap awal.
- `.doc` lama tidak didukung pada tahap awal; admin diarahkan mengonversinya ke `.docx`.
- Scope `super_admin` global; `jurusan_admin` hanya scope jurusannya.
- `pgvector` tidak langsung diaktifkan sebelum endpoint/model embedding provider diverifikasi.
- UI publik dan UI admin yang sudah ada dipertahankan; fitur ditambahkan tanpa mengubah layout utama.

## 2. Alur Target

### 2.1 Knowledge Manual

```text
Admin buka Knowledge Chatbot
  -> isi judul/topik, teks, sumber, masa berlaku
  -> simpan draft
  -> preview context
  -> verifikasi fakta
  -> publish
  -> chatbot membaca knowledge aktif dan berlaku
```

### 2.2 Knowledge dari PDF/DOCX

```text
Admin upload PDF/DOCX
  -> validasi session, MIME, ekstensi, ukuran
  -> ekstrak teks di server
  -> normalisasi teks
  -> tampilkan preview hasil ekstraksi
  -> admin memperbaiki atau menolak hasil
  -> simpan sebagai draft knowledge
  -> chunking
  -> embedding jika pgvector aktif
  -> publish setelah verifikasi
```

### 2.3 Pertanyaan Chatbot

```text
Pertanyaan pengguna
  -> validasi dan rate limit
  -> filter knowledge active/published/berlaku
  -> retrieval keyword atau vector
  -> pilih context terbatas
  -> kirim context ke model chat
  -> validasi response JSON
  -> tampilkan jawaban dan sumber
```

## 3. Fase Implementasi

### Fase 0: Verifikasi Provider dan Baseline

Tujuan: memastikan fitur tidak dibangun berdasarkan asumsi provider.

Pekerjaan:

- Verifikasi xKiro mendukung endpoint `/embeddings`.
- Verifikasi model embedding yang tersedia dan dimensinya.
- Verifikasi harga input/output chat dan embedding.
- Verifikasi batas request, context window, timeout, dan rate limit.
- Uji apakah provider menerima request terstruktur yang sudah dipakai aplikasi.
- Ukur retrieval keyword saat ini terhadap pertanyaan sekolah nyata.
- Tetapkan batas file, teks hasil ekstraksi, chunk, context, dan output.

Output:

- Provider embedding terdokumentasi atau keputusan memakai provider embedding terpisah.
- Daftar model dan dimensi vector.
- Baseline accuracy retrieval.
- Keputusan lanjut/tunda `pgvector`.

Acceptance criteria:

- Tidak ada API key di browser, Git, atau dokumen.
- Ada smoke test server-side untuk chat dan embedding jika endpoint tersedia.
- Dimensi vector diketahui sebelum migration dibuat.

### Fase 1: CRUD Knowledge Manual

Tujuan: admin dapat mengelola knowledge tanpa upload file.

Pekerjaan database:

- Pertahankan `chatbot_knowledge` sebagai record utama/topik.
- Tambahkan metadata sumber dan masa berlaku bila belum tersedia:
  - `title` atau `topic`.
  - `source_url`.
  - `source_file_name`.
  - `source_mime_type`.
  - `source_size_bytes`.
  - `source_hash`.
  - `effective_from`.
  - `effective_until`.
  - `verified_at`.
  - `updated_by`.
- Gunakan `isActive` untuk archive/nonaktif.
- Gunakan `isPublished` untuk draft/published.

Pekerjaan API:

- `GET /api/chatbot-knowledge` untuk list/search/filter.
- `POST /api/chatbot-knowledge` untuk create draft.
- `GET /api/chatbot-knowledge/:id` untuk detail/preview.
- `PUT /api/chatbot-knowledge/:id` untuk edit.
- `DELETE /api/chatbot-knowledge/:id` untuk archive/nonaktif, bukan hard delete.
- `POST /api/chatbot-knowledge/:id/publish` untuk publish.
- `POST /api/chatbot-knowledge/:id/unpublish` untuk unpublish.
- `POST /api/chatbot-knowledge/:id/test` untuk menguji context knowledge tertentu.

Pekerjaan UI:

- Tambahkan halaman admin `/admin/chatbot-knowledge`.
- Tabel list dengan judul, sumber, scope, status, masa berlaku, verifikasi, updatedAt.
- Form tambah/edit.
- Preview isi dan context.
- Tombol simpan draft, publish, unpublish, archive.
- Pencarian dan filter status.
- Konfirmasi sebelum publish/archive.

Acceptance criteria:

- `jurusan_admin` tidak dapat membaca atau mengubah knowledge jurusan lain.
- Draft tidak masuk retrieval publik.
- Knowledge expired tidak masuk retrieval publik.
- Publish membutuhkan validasi isi dan metadata minimum.
- Archive tidak menghapus histori secara permanen.

### Fase 2: Upload dan Ekstraksi PDF/DOCX

Tujuan: admin dapat membuat draft knowledge dari dokumen resmi.

Format tahap awal:

- `.pdf` text-based.
- `.docx`.

Format ditunda:

- `.doc`.
- PDF scan/image yang memerlukan OCR.
- Spreadsheet dan presentasi.

Pekerjaan server:

- Tambahkan endpoint `POST /api/chatbot-knowledge/extract`.
- Terima multipart upload hanya dari admin terautentikasi.
- Validasi ekstensi dan MIME type.
- Batasi ukuran upload, rekomendasi awal 10 MB.
- Batasi jumlah halaman/paragraph jika library mendukung.
- Ekstrak teks tanpa mengirim binary ke provider AI.
- Normalisasi whitespace, header/footer berulang, dan karakter tidak terbaca.
- Hitung `source_hash` SHA-256.
- Kembalikan metadata dan preview teks ke admin.
- Jangan publish otomatis.

Pekerjaan UI:

- Input upload PDF/DOCX.
- Tampilkan nama file, ukuran, tipe, dan hash ringkas.
- Tampilkan preview teks hasil ekstraksi.
- Tampilkan peringatan jika teks kosong, terlalu pendek, atau kemungkinan hasil scan.
- Sediakan edit teks sebelum disimpan.
- Simpan sebagai draft Knowledge.

Aturan dokumen:

- Dokumen asli tidak disimpan secara default.
- `source_file_name`, MIME, ukuran, hash, dan waktu ekstraksi tetap disimpan.
- Jika admin perlu rujukan publik, simpan `source_url` eksternal.
- File sementara harus dihapus setelah ekstraksi selesai.
- Jangan menaruh dokumen privat di `/public/uploads`.

Acceptance criteria:

- File invalid, terlalu besar, kosong, atau unsupported ditolak dengan aman.
- Hasil ekstraksi dapat dilihat sebelum tersimpan.
- Dokumen tidak pernah menjadi knowledge published tanpa persetujuan admin.
- Binary dokumen tidak tertinggal di storage lokal setelah proses selesai.

### Fase 3: Chunking dan Retrieval Keyword

Tujuan: memperbaiki relevansi tanpa menunggu `pgvector`.

Pekerjaan:

- Pecah `contentText` berdasarkan heading/paragraf, bukan pemotongan buta saja.
- Target awal chunk 500-1.000 token dengan overlap kecil.
- Simpan metadata chunk secara internal atau gunakan chunk saat retrieval.
- Tambahkan scoring keyword sederhana terhadap pertanyaan.
- Prioritaskan kecocokan judul/topik, istilah penting, dan sumber.
- Filter status publik serta tanggal berlaku sebelum scoring.
- Ambil context terbatas, rekomendasi awal 5-8 chunk.
- Hindari mengirim seluruh database ke model.

Acceptance criteria:

- Pertanyaan terkait memakai knowledge yang benar.
- Pertanyaan di luar knowledge menghasilkan status `unknown`.
- Knowledge lama/expired tidak muncul.
- Prompt injection di dalam dokumen tidak mengubah system rules.
- Token context lebih kecil dibanding pengiriman seluruh dokumen.

### Fase 4: Supabase `pgvector`

Tujuan: similarity retrieval untuk knowledge panjang, banyak, atau istilah yang tidak cocok secara literal.

Prasyarat:

- Extension `vector` aktif di Supabase.
- Model embedding dan dimensi vector sudah diverifikasi.
- Harga dan rate limit embedding sudah diketahui.
- Fase 3 menunjukkan keyword retrieval tidak cukup akurat.

Migration konseptual:

```sql
create extension if not exists vector;

create table chatbot_knowledge_chunks (
  id bigint generated always as identity primary key,
  knowledge_id bigint not null references chatbot_knowledge(id) on delete cascade,
  chunk_index integer not null,
  content_text text not null,
  embedding vector(<EMBEDDING_DIMENSION>),
  created_at timestamptz not null default now(),
  unique (knowledge_id, chunk_index)
);
```

`<EMBEDDING_DIMENSION>` wajib diganti dengan dimensi model sebenarnya. Jangan menggunakan `1536` tanpa verifikasi.

Pekerjaan:

- Tambahkan `generateEmbedding()` ke provider adapter.
- Buat job/service re-index saat knowledge dibuat atau isi berubah.
- Hapus/rebuild chunks saat knowledge di-archive atau diedit.
- Tambahkan RPC SQL similarity search di Supabase.
- Filter `isActive`, `isPublished`, scope jurusan, dan tanggal berlaku dalam query.
- Gunakan cosine similarity.
- Tetapkan threshold relevansi; hasil di bawah threshold diabaikan.
- Ambil top 5-8 chunk.
- Fallback ke keyword retrieval jika embedding provider gagal.
- Catat model embedding dan versi indexing.

Contoh fungsi similarity secara konseptual:

```sql
select
  c.knowledge_id,
  c.content_text,
  1 - (c.embedding <=> query_embedding) as similarity
from chatbot_knowledge_chunks c
join chatbot_knowledge k on k.id = c.knowledge_id
where k.is_active = true
  and k.is_published = true
order by c.embedding <=> query_embedding
limit 8;
```

Acceptance criteria:

- Re-index hanya terjadi jika isi knowledge berubah.
- Pertanyaan yang memakai sinonim tetap menemukan knowledge relevan.
- Hasil similarity rendah tidak dipakai sebagai fakta.
- Kegagalan embedding tidak membuat chatbot mengirim context privat.
- Retrieval vector dan keyword menghasilkan evaluasi yang dapat dibandingkan.

### Fase 5: Integrasi Admin AI Chatbot

Tujuan: admin dapat menggunakan knowledge sebagai sumber pembuatan draft konten.

Pekerjaan:

- Tambahkan pilihan knowledge atau mode `Knowledge published` pada UI AI Content Assistant.
- Admin dapat memilih knowledge tertentu atau membiarkan retrieval berdasarkan prompt.
- Tampilkan sumber knowledge yang dipakai pada preview draft.
- Gunakan context yang sama dengan aturan publik, dengan scope admin yang valid.
- Tetap validasi hasil AI dengan schema Zod.
- Tetap simpan hasil sebagai draft.
- Publish konten hanya melalui aksi admin.

Aturan:

- Knowledge draft tidak boleh dikirim ke chatbot publik.
- `jurusan_admin` hanya boleh memakai knowledge scope yang diizinkan.
- Instruksi di dalam dokumen dianggap data, bukan system instruction.
- AI tidak boleh mengubah knowledge hanya karena diminta lewat chat.

### Fase 6: Audit, Cost Control, dan Operasional

Pekerjaan:

- Catat request ID, user ID, action, model chat, model embedding, status, dan durasi.
- Catat token prompt/completion bila provider mengembalikan usage.
- Jangan log API key, password, token, atau isi dokumen privat penuh.
- Rate limit chatbot publik dan endpoint embedding.
- Batasi retry; jangan retry tanpa batas.
- Cache hasil ekstraksi berdasarkan hash.
- Cache embedding berdasarkan hash teks + model embedding.
- Re-index hanya saat teks/model berubah.
- Tambahkan batas harian/bulanan provider jika tersedia.
- Monitor error provider, timeout, quota, dan biaya.

## 4. Skema Data yang Direkomendasikan

### `chatbot_knowledge`

Record utama/topik knowledge:

| Field | Fungsi |
|---|---|
| `id` | ID knowledge |
| `title`/`topic` | Judul/topik yang terlihat admin dan sumber |
| `content_text` | Teks terverifikasi yang menjadi sumber fakta |
| `source_url` | URL sumber resmi, jika ada |
| `source_file_name` | Nama file asal, tanpa menyimpan binary |
| `source_mime_type` | MIME file asal |
| `source_size_bytes` | Ukuran file asal |
| `source_hash` | Deteksi dokumen duplikat/perubahan |
| `effective_from` | Awal masa berlaku |
| `effective_until` | Akhir masa berlaku |
| `verified_at` | Waktu terakhir diverifikasi admin |
| `jurusan_id` | Scope jurusan atau null untuk global |
| `is_active` | Archive/nonaktif |
| `is_published` | Draft/published |
| `created_by` | Admin pembuat |
| `updated_by` | Admin terakhir mengubah |
| `created_at`/`updated_at` | Audit waktu |

### `chatbot_knowledge_chunks`

Digunakan saat `pgvector` aktif:

| Field | Fungsi |
|---|---|
| `id` | ID chunk |
| `knowledge_id` | Parent knowledge |
| `chunk_index` | Urutan chunk |
| `content_text` | Potongan teks yang dikirim ke model |
| `embedding` | Vector hasil model embedding |
| `embedding_model` | Model yang menghasilkan vector |
| `content_hash` | Deteksi perlu/tidaknya re-index |
| `created_at` | Waktu indexing |

### Riwayat perubahan

Jika audit perubahan dibutuhkan, tambahkan `chatbot_knowledge_versions` atau gunakan audit log terpusat. Jangan menghapus versi lama hanya karena knowledge baru dipublish.

## 5. Security dan Validation

- Semua endpoint admin memanggil `getSession()`.
- Authorization dan scope dilakukan server-side, bukan hanya menyembunyikan tombol UI.
- Validasi MIME dan ekstensi dilakukan server-side.
- Jangan mempercayai nama file dari browser.
- Batasi ukuran request dan teks hasil ekstraksi.
- Tolak file terenkripsi/password-protected jika parser tidak bisa memverifikasi isinya.
- Bersihkan metadata dan karakter kontrol yang tidak diperlukan.
- Jangan render HTML hasil ekstraksi tanpa sanitasi.
- Jangan menganggap isi dokumen sebagai instruksi sistem.
- Knowledge hanya boleh memuat fakta resmi dan non-privat.
- Jangan memasukkan data siswa, nilai, password, token, atau informasi sensitif.
- `source_url` tetap menggunakan validasi URL yang aman.
- Dokumen asli tidak boleh masuk ke `/public`.
- Gunakan temporary file/memory dengan cleanup yang terjamin.
- Publik hanya melihat fakta dari knowledge published dan berlaku.

## 6. Biaya dan Opportunity Cost

### Biaya Token

- Upload PDF/DOCX: tidak memakai token jika ekstraksi dilakukan lokal.
- Parsing PDF/DOCX: tidak memakai token.
- Embedding knowledge: memakai token/biaya embedding saat create/update/re-index.
- Embedding pertanyaan: memakai token/biaya embedding setiap pencarian vector.
- Chat completion: biaya utama setiap jawaban chatbot atau draft admin.
- OCR PDF scan: biaya tambahan jika memakai layanan OCR berbasis AI.

`pgvector` sendiri tidak mengenakan biaya token. Ia hanya menyimpan dan mencari vector di PostgreSQL. Biaya Supabase database/storage tetap mengikuti paket dan pemakaian Supabase.

### Dampak Positif

- Jawaban lebih relevan terhadap dokumen sekolah.
- Dokumen panjang tidak perlu dikirim utuh ke model.
- Context yang lebih kecil dapat mengurangi token chat completion.
- Admin dapat memperbarui pemahaman AI tanpa mengubah kode.
- Sumber dan masa berlaku dapat diaudit.
- Draft/publish mencegah perubahan fakta otomatis.

### Dampak Negatif

- Parser PDF/DOCX dapat merusak tabel, kolom, header, atau footer.
- PDF scan membutuhkan OCR.
- `pgvector` menambah migration, indexing, re-indexing, dan monitoring.
- Provider embedding menambah dependency dan kemungkinan biaya baru.
- Knowledge salah tetap menghasilkan jawaban salah.
- Upload dokumen membuka risiko prompt injection dan data sensitif.
- Tanpa dokumen asli, hasil ekstraksi tidak bisa dibandingkan ulang dari binary.
- Fitur membutuhkan waktu implementasi dan maintenance yang tidak terlihat oleh pengguna.

### Mitigasi tanpa menyimpan dokumen asli

- Preview hasil ekstraksi sebelum publish.
- Wajib verifikasi admin.
- Simpan nama file, tipe, ukuran, hash, dan waktu ekstraksi.
- Simpan `source_url` resmi bila tersedia.
- Simpan versi teks atau audit perubahan.
- Sediakan re-upload jika hasil ekstraksi perlu diperiksa ulang.

## 7. Testing Plan

### Upload dan Ekstraksi

- PDF text-based valid.
- DOCX valid dengan heading dan list.
- PDF scan tanpa text layer.
- File kosong.
- File terlalu besar.
- MIME palsu.
- File terenkripsi.
- Dokumen dengan tabel.
- Dokumen dengan karakter Indonesia.
- Dua file berbeda dengan hash sama.

### CRUD dan Authorization

- Create/edit draft.
- Publish/unpublish.
- Archive.
- Expired knowledge tidak terambil.
- `super_admin` dapat mengelola global dan semua jurusan.
- `jurusan_admin` tidak dapat membaca atau mengubah scope lain.
- Direct API access tidak dapat melewati authorization.
- Publish idempotent dan tidak membuat duplicate.

### Retrieval dan Chatbot

- Pertanyaan dengan kata yang sama.
- Pertanyaan dengan sinonim.
- Pertanyaan informal.
- Pertanyaan tanpa jawaban.
- Knowledge expired.
- Knowledge draft.
- Prompt injection di dalam dokumen.
- Pertanyaan tentang sekolah lain.
- Provider timeout.
- Provider quota failure.
- Embedding failure dan fallback keyword.
- Citation/source accuracy.
- Tidak ada fakta yang diada-adakan.

### Cost dan Operasional

- Token usage tercatat jika tersedia.
- Rate limit bekerja.
- Context tidak melebihi batas.
- Re-index tidak terjadi jika content hash tidak berubah.
- Retry terbatas.
- Error tidak membocorkan secret atau isi privat.

## 8. Acceptance Criteria Final

- Admin dapat membuat dan mengedit Knowledge secara manual.
- Admin dapat upload PDF/DOCX dan melihat hasil ekstraksi sebelum publish.
- Dokumen asli tidak wajib disimpan.
- Knowledge draft tidak dipakai chatbot publik.
- Knowledge expired/nonaktif tidak dipakai.
- Semua mutasi tervalidasi dan terotorisasi server-side.
- Chatbot publik menggunakan context relevan dan terbatas.
- Prompt injection dari dokumen tidak mengubah system rules.
- AI menjawab `unknown` jika fakta tidak tersedia.
- Admin AI Chatbot dapat memakai Knowledge sebagai context.
- Semua konten hasil AI tetap memerlukan approval admin.
- `pgvector` hanya aktif setelah model embedding dan dimensinya tervalidasi.
- Fallback keyword tersedia saat vector retrieval gagal.
- Token, error, request volume, dan biaya dapat dipantau.
- Tidak ada secret yang terkirim ke browser atau tersimpan di repository.

## 9. Urutan Implementasi Final

1. Verifikasi provider chat/embedding, harga, limit, dan dimensi vector.
2. Implementasikan CRUD `chatbot_knowledge` manual.
3. Implementasikan draft/publish/unpublish/archive dan authorization scope.
4. Implementasikan upload PDF/DOCX dan ekstraksi lokal.
5. Implementasikan preview/edit hasil ekstraksi.
6. Implementasikan chunking dan retrieval keyword.
7. Uji kualitas, biaya, keamanan, dan UX.
8. Aktifkan Supabase `pgvector` jika baseline keyword belum cukup.
9. Implementasikan embedding, similarity search, dan fallback keyword.
10. Integrasikan Knowledge terpilih ke Admin AI Content Assistant.
11. Tambahkan audit, usage tracking, rate limit, dan cost control.
12. Jalankan migration, seed verification, backend tests, typecheck, dan uji manual production-like.

## 10. Di Luar Scope Tahap Awal

- Penyimpanan file asli permanen.
- OCR otomatis untuk semua PDF scan.
- Dukungan `.doc` lama.
- Fine-tuning model.
- Chatbot belajar dari percakapan publik.
- Publish otomatis dari hasil AI.
- Pengiriman seluruh dokumen ke model.
- `pgvector` sebelum provider embedding dan baseline retrieval tervalidasi.
