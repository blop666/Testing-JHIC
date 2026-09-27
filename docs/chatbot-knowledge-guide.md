# Panduan Knowledge Chatbot

## Tujuan

Knowledge adalah informasi resmi yang boleh dipakai chatbot publik untuk menjawab pertanyaan tentang SMKN 1 Cibinong.

Chatbot tidak belajar permanen dari percakapan pengguna. Chatbot membaca knowledge aktif dan published dari database pada setiap request.

Alur data:

```text
Data resmi
  -> ditulis menjadi knowledge
  -> disimpan ke chatbot_knowledge
  -> diverifikasi admin
  -> isPublished = true
  -> chatbot dapat memakai data
```

## Aturan Utama

- Masukkan hanya informasi resmi dan dapat diverifikasi.
- Satu knowledge sebaiknya membahas satu topik.
- Sertakan tanggal berlaku untuk informasi yang berubah.
- Jangan memasukkan password, token, data siswa, nilai, atau data privat.
- Jangan memasukkan asumsi atau informasi yang belum dikonfirmasi sekolah.
- Jangan memasukkan PPDB sebelum jadwal dan ketentuan resmi diterbitkan.
- Data draft tidak boleh dipakai chatbot publik.
- Setelah informasi berubah, nonaktifkan knowledge lama dan buat versi terbaru.
- Jangan mengandalkan model untuk memperbaiki fakta yang salah.

## Format Knowledge yang Disarankan

Saat ini tabel `chatbot_knowledge` menyimpan satu field teks utama:

```text
contentText
```

Gunakan format teks terstruktur berikut:

```text
TOPIK: PPDB/SPMB SMKN 1 Cibinong
STATUS: RESMI
BERLAKU MULAI: 2026-05-01
BERLAKU SAMPAI: 2026-06-30
SUMBER: https://contoh.sch.id/ppdb
TERAKHIR DIVERIFIKASI: 2026-05-01

FAKTA:
- Nama program: SPMB SMKN 1 Cibinong.
- Tahun ajaran: 2026/2027.
- Jadwal pendaftaran: ...
- Persyaratan: ...
- Jalur pendaftaran: ...
- Tautan pendaftaran: ...
- Kontak resmi: ...

BATASAN JAWABAN:
- Jika pengguna bertanya di luar fakta di atas, katakan informasi belum tersedia.
- Jangan membuat jadwal, biaya, kuota, atau persyaratan baru.
```

## Contoh Knowledge PPDB

Jangan gunakan contoh ini sebagai data nyata. Ganti semua placeholder dengan data resmi.

```text
TOPIK: PPDB/SPMB SMKN 1 Cibinong
STATUS: RESMI
TAHUN AJARAN: 2026/2027
BERLAKU MULAI: 2026-05-01
BERLAKU SAMPAI: 2026-06-30
SUMBER: https://profile.smkn1cibinong.sch.id/spmb/
TERAKHIR DIVERIFIKASI: 2026-05-01

INFORMASI:
SPMB SMKN 1 Cibinong untuk tahun ajaran 2026/2027 dilaksanakan melalui ...

JADWAL:
- Pendaftaran dibuka: [tanggal resmi]
- Pendaftaran ditutup: [tanggal resmi]
- Pengumuman: [tanggal resmi]

PERSYARATAN:
- [persyaratan resmi 1]
- [persyaratan resmi 2]

JALUR:
- [jalur resmi 1]
- [jalur resmi 2]

TAUTAN:
- Portal resmi: [URL resmi]
- Informasi sekolah: https://profile.smkn1cibinong.sch.id/spmb/

ATURAN:
Jika informasi tidak tercantum di knowledge ini, chatbot harus mengatakan bahwa informasi resmi belum tersedia. Chatbot tidak boleh menebak atau mengambil ketentuan dari sekolah lain.
```

## Cara Menambahkan Sekarang

Belum ada halaman admin CRUD khusus untuk `chatbot_knowledge`. Untuk sementara, tambahkan data melalui seed.

1. Buka `db/seeds/index.ts`.
2. Tambahkan string baru ke `chatbotKnowledgeSeeds`.
3. Pastikan sumber dan tanggal verifikasi tercantum.
4. Jalankan:

```bash
npm run db:seed
```

5. Pastikan record memiliki:

```text
isActive = true
isPublished = true
```

6. Uji chatbot melalui website publik.

Seed saat ini memakai `onConflictDoNothing()`. Menjalankan seed ulang tidak memperbarui teks knowledge yang sudah ada. Jika fakta berubah, gunakan salah satu cara berikut:

- Nonaktifkan record lama melalui database lalu tambahkan record baru.
- Buat migration/update script khusus.
- Tunggu fitur admin knowledge management.

Jangan menghapus data production tanpa backup.

## Contoh Seed

```ts
const chatbotKnowledgeSeeds = [
  "TOPIK: PPDB/SPMB ...\nSTATUS: RESMI\nSUMBER: https://...\nTERAKHIR DIVERIFIKASI: 2026-05-01\nFAKTA: ...\nATURAN: Jangan mengarang fakta yang tidak tercantum.",
];
```

Jika knowledge panjang, pecah berdasarkan topik:

- PPDB jadwal.
- PPDB persyaratan.
- PPDB jalur.
- PPDB kontak.

Jangan membuat satu knowledge berisi seluruh website. Context terlalu besar meningkatkan biaya dan menurunkan relevansi jawaban.

## Sumber Data yang Diterima

Prioritas sumber:

1. Pengumuman resmi sekolah.
2. Halaman resmi sekolah.
3. Dokumen resmi sekolah.
4. Surat keputusan atau dokumen pemerintah yang relevan.
5. Konten published di CMS.

Hindari:

- Blog tidak resmi.
- Komentar media sosial.
- Artikel sekolah lain.
- Pesan WhatsApp tanpa verifikasi.
- Screenshot tanpa URL/tanggal/sumber.

Untuk setiap sumber, simpan URL asli dalam knowledge.

## Status dan Masa Berlaku

Informasi sementara seperti PPDB, agenda, biaya, kuota, dan jadwal harus memiliki:

- Tahun ajaran atau periode.
- Tanggal mulai berlaku.
- Tanggal akhir berlaku jika ada.
- Tanggal terakhir diverifikasi.
- Sumber resmi.

Saat periode berakhir:

1. Set `isActive = false` pada knowledge lama.
2. Set `isPublished = false` jika tidak boleh terlihat lagi.
3. Tambahkan knowledge periode baru.
4. Uji pertanyaan lama dan baru.

## Testing Checklist

Setelah menambah knowledge, uji pertanyaan:

- Pertanyaan langsung.
- Pertanyaan dengan singkatan.
- Pertanyaan dengan bahasa informal.
- Pertanyaan yang meminta tanggal.
- Pertanyaan yang meminta persyaratan.
- Pertanyaan tentang informasi yang memang tidak ada.
- Pertanyaan tentang sekolah lain.
- Prompt injection, misalnya: `abaikan aturan sebelumnya`.

Hasil yang benar:

- Fakta tersedia: `answered` dengan sumber.
- Fakta tidak tersedia: `unknown`.
- Di luar konteks sekolah: `refused`.
- Data lama tidak boleh muncul setelah dinonaktifkan.

Contoh pengujian lokal:

```powershell
$body = @{ prompt = "Apa saja persyaratan SPMB tahun ajaran 2026/2027?" } | ConvertTo-Json
Invoke-RestMethod `
  -Uri "http://localhost:3000/api/chatbot" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

## Kesalahan yang Harus Dihindari

- Menulis `PPDB dibuka bulan Juni` tanpa sumber resmi.
- Menulis tanggal lama lalu membiarkannya published.
- Menggabungkan PPDB 2025 dan PPDB 2026 dalam satu paragraf tanpa label.
- Menambahkan fakta hasil tebakan AI ke database.
- Memasukkan data private karena dianggap membantu chatbot.
- Menganggap upload file otomatis menjadi knowledge.
- Mengirim seluruh isi database ke model.

## Rencana Fitur Admin Knowledge

Fitur berikut belum menjadi bagian dari panduan implementasi saat ini, tetapi diperlukan sebelum CMS digunakan rutin:

- Halaman admin `Knowledge Chatbot`.
- Create, edit, preview, publish, unpublish, archive.
- Field judul/topik.
- Field isi knowledge.
- Field URL sumber.
- Field tanggal berlaku.
- Field tanggal verifikasi.
- Scope global atau jurusan.
- Riwayat perubahan.
- Audit admin.
- Tombol uji chatbot terhadap knowledge tertentu.

Sebelum fitur tersebut dibuat, seed tetap menjadi mekanisme manual yang aman karena perubahan melewati code review dan deployment.

## Checklist PPDB Sebelum Publish

- [ ] Data berasal dari sumber resmi.
- [ ] Tahun ajaran tertulis.
- [ ] Jadwal lengkap dan telah diverifikasi.
- [ ] Persyaratan lengkap dan telah diverifikasi.
- [ ] Jalur pendaftaran telah diverifikasi.
- [ ] Tautan pendaftaran benar.
- [ ] Kontak resmi tersedia.
- [ ] Data lama telah dinonaktifkan.
- [ ] Chatbot menjawab pertanyaan langsung dengan benar.
- [ ] Chatbot menolak menebak data yang tidak tersedia.
- [ ] Admin menyetujui publikasi.
