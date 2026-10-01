# CibiOne CMS: Panduan Deploy VPS + Object Storage (MinIO)

Runbook lengkap untuk deploy CibiOne CMS ke VPS Ubuntu/Debian dengan PostgreSQL lokal, PM2, Nginx, DNS, HTTPS, dan media object storage MinIO.

## Arsitektur

```text
Domain (media.domain.com)
  -> DNS A/CNAME record
VPS
  -> Nginx :80/:443  ->  media.domain.com  ->  MinIO :9000 (localhost saja)
  -> Nginx :80/:443  ->  domain.com         ->  Next.js + PM2 :3000 (localhost saja)
  -> PostgreSQL :5432 (localhost saja)
  -> MinIO :9000 (API) / :9001 (console)  (localhost saja, tidak dibuka ke publik)
```

Nilai contoh wajib diganti:

```text
DOMAIN=contoh.sch.id
MEDIA_DOMAIN=media.contoh.sch.id
VPS_IP=203.0.113.10
REPOSITORY=https://github.com/blop666/Testing-JHIC.git
APP_PATH=/var/www/cibione-cms
APP_USER=cibione
DB_NAME=cibione
DB_USER=cibione
MINIO_USER=minioadmin
MINIO_PASSWORD=PASSWORD_MINIO_RANDOM
BUCKET=cibione-media
```

Jangan menyalin password atau API key dari contoh. Buat nilai baru.

## 1. Prasyarat

- VPS Ubuntu 22.04/24.04 atau Debian 12.
- Minimal 2 GB RAM dan 20 GB storage.
- Akses SSH dengan user root atau sudo.
- Domain utama dan subdomain media dapat diubah DNS-nya.
- Provider AI kompatibel dengan OpenAI Chat Completions API.

Project membutuhkan Node.js 22 LTS. PostgreSQL, Node.js, MinIO, dan dependency production harus diverifikasi pada VPS sebelum go-live.

## 2. DNS

Di panel DNS domain, tambahkan A record untuk domain utama dan subdomain media:

```text
Type: A   Name: @      Value: VPS_IP   TTL: 300
Type: A   Name: www    Value: VPS_IP   TTL: 300
Type: A   Name: media  Value: VPS_IP   TTL: 300
```

Verifikasi dari komputer lokal:

```bash
nslookup contoh.sch.id
nslookup media.contoh.sch.id
```

Lanjut ke HTTPS setelah domain mengarah ke VPS.

## 3. Update server

Login sebagai root:

```bash
ssh root@VPS_IP
```

Update sistem dan install kebutuhan dasar:

```bash
apt update
apt upgrade -y
apt install -y curl git nginx postgresql postgresql-contrib ufw unzip ca-certificates wget
timedatectl set-timezone Asia/Jakarta
```

Buat user aplikasi non-root:

```bash
adduser --disabled-password --gecos "" cibione
usermod -aG sudo cibione
```

Gunakan SSH key untuk user `cibione`. Setelah login key teruji, nonaktifkan login password dan root sesuai kebijakan provider VPS. Jangan menonaktifkan akses root sebelum sesi SSH key baru berhasil.

## 4. Firewall

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status verbose
```

Jangan membuka port aplikasi, database, atau MinIO ke internet:

```text
3000: localhost saja
5432: localhost saja
9000: localhost saja
9001: localhost saja
```

## 5. Node.js 22 dan PM2

Install Node.js 22 LTS melalui NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
```

Verifikasi:

```bash
node --version
npm --version
```

Target Node harus `v22.x`.

Install PM2:

```bash
npm install --global pm2
```

## 6. PostgreSQL

Aktifkan PostgreSQL:

```bash
systemctl enable --now postgresql
systemctl status postgresql
```

Buat user dan database:

```bash
sudo -u postgres createuser --pwprompt cibione
sudo -u postgres createdb --owner=cibione cibione
```

Database hanya diakses lokal. Jangan expose PostgreSQL ke internet.

## 7. MinIO (object storage)

### 7.1 Download binary

MinIO resmi mengarsipkan image Docker Hub dan binary `dl.min.io` sejak 2025. Gunakan binary server resmi yang masih tersedia atau S3-compatible storage lain. Untuk production single-node, binary MinIO adalah jalur termudah:

```bash
mkdir -p /opt/minio/bin /opt/minio/data
cd /opt/minio/bin
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
```

Jika `dl.min.io` mengembalikan `410 Gone`, unduh dari mirror resmi GitHub releases:

```bash
wget https://github.com/minio/minio/releases/latest/download/minio
chmod +x minio
```

Verifikasi:

```bash
./minio --version
```

### 7.2 Buat user sistem

```bash
useradd --system --no-create-home --shell /sbin/nologin minio
chown -R minio:minio /opt/minio/data
```

### 7.3 Environment MinIO

Buat file environment yang tidak masuk Git:

```bash
nano /etc/default/minio
```

Isi:

```env
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=PASSWORD_MINIO_RANDOM
MINIO_VOLUMES="/opt/minio/data"
MINIO_OPTS="--console-address :9001"
```

Ubah permission:

```bash
chmod 600 /etc/default/minio
```

### 7.4 Systemd service

```bash
nano /etc/systemd/system/minio.service
```

Isi:

```ini
[Unit]
Description=MinIO
Documentation=https://min.io/docs/minio/linux/index.html
Wants=network-online.target
After=network-online.target
AssertFileIsExecutable=/opt/minio/bin/minio

[Service]
WorkingDirectory=/opt/minio
User=minio
Group=minio
ProtectProc=invisible
EnvironmentFile=-/etc/default/minio
ExecStartPre=/bin/bash -c "if [ -z \"${MINIO_VOLUMES}\" ]; then echo \"Variable MINIO_VOLUMES not set in /etc/default/minio\"; exit 1; fi"
ExecStart=/opt/minio/bin/minio server $MINIO_OPTS $MINIO_VOLUMES
Restart=always
LimitNOFILE=65536
TasksMax=infinity
TimeoutStopSec=infinity
SendSIGKILL=no

[Install]
WantedBy=multi-user.target
```

Aktifkan:

```bash
systemctl daemon-reload
systemctl enable --now minio
systemctl status minio
```

Verifikasi lokal:

```bash
curl -I http://127.0.0.1:9000/minio/health/live
```

Console hanya dapat diakses lokal (atau via SSH tunnel):

```bash
ssh -L 9001:127.0.0.1:9001 cibione@VPS_IP
# lalu buka http://localhost:9001 di browser lokal
```

### 7.5 Buat bucket dan akses key

Install MinIO Client `mc`:

```bash
cd /opt/minio/bin
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
```

Jika `dl.min.io` `410 Gone`, pakai mirror GitHub releases:

```bash
wget https://github.com/minio/mc/releases/latest/download/mc
chmod +x mc
```

Buat alias dan bucket:

```bash
/opt/minio/bin/mc alias set local http://127.0.0.1:9000 minioadmin PASSWORD_MINIO_RANDOM
/opt/minio/bin/mc mb local/cibione-media
```

Buat access key khusus aplikasi (bukan root credential). Buka console MinIO lalu buat access key baru, atau via `mc admin`:

```bash
/opt/minio/bin/mc admin accesskey create local --access-key S3_ACCESS_KEY_ID_APP
```

Simpan `S3_ACCESS_KEY_ID` dan `S3_SECRET_ACCESS_KEY` yang dihasilkan untuk dipakai aplikasi.

### 7.6 Policy bucket publik (read-only anonymous)

Aplikasi menyimpan object dan membacanya melalui URL publik `media.domain.com`. Agar browser dapat memuat gambar, object harus dapat dibaca publik (read-only). Buat policy:

```bash
cat > /tmp/cibione-media-public.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": ["*"] },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::cibione-media/*"]
    }
  ]
}
EOF

/opt/minio/bin/mc anonymous set-json /tmp/cibione-media-public.json local/cibione-media
```

Hanya `GetObject` yang publik. Operasi tulis hanya lewat API aplikasi dengan access key yang dipegang aplikasi, tidak pernah expose ke browser.

## 8. Clone repository

```bash
mkdir -p /var/www/cibione-cms
chown -R cibione:cibione /var/www/cibione-cms
su - cibione

git clone https://github.com/blop666/Testing-JHIC.git /var/www/cibione-cms
cd /var/www/cibione-cms
npm ci
```

Verifikasi source:

```bash
git branch --show-current
```

## 9. Environment production

Buat file yang tidak masuk Git:

```bash
cd /var/www/cibione-cms
touch .env.production
nano .env.production
chmod 600 .env.production
chown cibione:cibione .env.production
```

Isi sesuai kode saat ini:

```env
NODE_ENV=production

DATABASE_URL=postgresql://cibione:PASSWORD_DATABASE@127.0.0.1:5432/cibione

INITIAL_ADMIN_EMAIL=admin@contoh.sch.id
INITIAL_ADMIN_PASSWORD=PASSWORD_ADMIN_RANDOM_MINIMAL_20_KARAKTER

AI_BASE_URL=https://provider-ai.example/v1
AI_API_KEY=SECRET_AI_API_KEY
AI_MODEL=MODEL_NAME
AI_VISION_MODEL=VISION_MODEL_NAME
AI_FALLBACK_MODEL=FALLBACK_MODEL_NAME

AI_REQUEST_TIMEOUT_MS=30000
AI_MAX_OUTPUT_TOKENS=1200
AI_ADMIN_DAILY_LIMIT=30

# Media storage: local | s3
MEDIA_STORAGE=s3

# S3/MinIO
S3_ENDPOINT=http://127.0.0.1:9000
S3_REGION=us-east-1
S3_BUCKET=cibione-media
S3_ACCESS_KEY_ID=S3_ACCESS_KEY_ID_APP
S3_SECRET_ACCESS_KEY=S3_SECRET_ACCESS_KEY_APP
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_URL=https://media.contoh.sch.id/cibione-media
```

Catatan penting:

- `S3_PUBLIC_URL` harus **memuat nama bucket** (mis. `https://media.contoh.sch.id/cibione-media`). URL ini dipakai untuk membangun `imageUrl` publik dan hostname gambar Next.js (`remotePatterns`).
- `S3_ENDPOINT` adalah alamat internal yang dipakai aplikasi untuk menulis object, bukan URL publik.
- Jangan memakai `NEXT_PUBLIC_` untuk secret.
- Jangan commit `.env.production`.
- `CHATBOT_PROVIDER_URL` dan `CHATBOT_PROVIDER_KEY` pada `.env.example` lama tidak dipakai route AI saat ini.
- Rotate key jika pernah terekspos di Git, log, screenshot, atau dokumentasi publik.

Jika ingin kembali ke penyimpanan lokal (tanpa MinIO), set `MEDIA_STORAGE=local`. Upload akan disimpan ke `public/uploads/`.

## 10. Migration dan seed awal

Dari directory project:

```bash
cd /var/www/cibione-cms
set -a
. ./.env.production
set +a

npx drizzle-kit migrate
npm run db:seed
```

Jangan memakai `drizzle-kit push` pada production.

Migration dijalankan satu kali oleh operator sebelum restart aplikasi. Jangan menjalankan migration dari banyak worker PM2 secara bersamaan.

## 11. Akun admin jurusan

Setelah data jurusan tersedia:

```bash
cd /var/www/cibione-cms
npx tsx scripts/create-jurusan-admins.ts
```

Script membuat akun yang belum ada dan menulis kredensial ke:

```text
docs/jurusan-admin-credentials.md
```

File itu di-ignore Git. Distribusikan melalui kanal aman, lalu:

- Login dengan tiap akun.
- Verifikasi hanya dapat mengakses jurusannya.
- Ganti password awal.
- Jangan kirim password melalui issue, commit, atau chat publik.

## 12. Test dan build

```bash
cd /var/www/cibione-cms
npm run test:backend
npm run test:storage
npx tsc --noEmit
npm run build
```

Jalankan test lokal di VPS sebelum PM2:

```bash
set -a
. ./.env.production
set +a
npm run start
```

Di terminal lain:

```bash
curl --fail http://127.0.0.1:3000
```

Hentikan proses manual dengan `Ctrl+C` setelah health check.

## 13. PM2

```bash
cd /var/www/cibione-cms
set -a
. ./.env.production
set +a

pm2 start npm --name cibione-cms -- start
pm2 save
pm2 startup
```

Jalankan command `sudo` yang dicetak PM2 sebagai root. Setelah itu:

```bash
pm2 save
pm2 status
pm2 logs cibione-cms
curl --fail http://127.0.0.1:3000
```

Perintah operasional:

```bash
pm2 restart cibione-cms --update-env
pm2 stop cibione-cms
pm2 delete cibione-cms
pm2 logs cibione-cms
```

## 14. Nginx HTTP

Sebagai root, buat konfigurasi untuk domain utama:

```bash
nano /etc/nginx/sites-available/cibione-cms
```

Isi:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name contoh.sch.id www.contoh.sch.id;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Buat konfigurasi untuk subdomain media (proxy ke MinIO):

```bash
nano /etc/nginx/sites-available/cibione-media
```

Isi:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name media.contoh.sch.id;

    client_max_body_size 10m;

    # Tidak proxy ke console :9001; hanya API :9000
    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan keduanya:

```bash
ln -s /etc/nginx/sites-available/cibione-cms /etc/nginx/sites-enabled/cibione-cms
ln -s /etc/nginx/sites-available/cibione-media /etc/nginx/sites-enabled/cibione-media
nginx -t
systemctl reload nginx
```

Tes:

```bash
curl -I http://contoh.sch.id
curl -I http://media.contoh.sch.id
```

## 15. HTTPS dengan Let's Encrypt

Pastikan DNS sudah benar, lalu:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d contoh.sch.id -d www.contoh.sch.id
certbot --nginx -d media.contoh.sch.id
```

Pilih redirect HTTP ke HTTPS saat ditanya.

Tes certificate renewal:

```bash
certbot renew --dry-run
```

Tes production:

```bash
curl -I https://contoh.sch.id
curl -I https://media.contoh.sch.id/cibione-media/
```

## 16. Verifikasi upload object storage

Login ke CMS, upload gambar di editor. Verifikasi:

1. Response `imageUrl` mengarah ke `https://media.contoh.sch.id/cibione-media/images/<category>/<uuid>.webp`.
2. URL gambar dapat dibuka di browser (200).
3. Object tampil di console MinIO di `images/<category>/`.
4. Database hanya menyimpan string URL, bukan binary.

Tes manual upload ke bucket (opsional, dari VPS):

```bash
echo "tes" | /opt/minio/bin/mc pipe local/cibione-media/tes.txt
curl -I https://media.contoh.sch.id/cibione-media/tes.txt
/opt/minio/bin/mc rm local/cibione-media/tes.txt
```

## 17. Checklist production

```text
[ ] DNS A record utama dan subdomain media mengarah ke VPS
[ ] HTTP redirect ke HTTPS (domain utama dan media)
[ ] npm ci berhasil
[ ] npm run test:backend berhasil
[ ] npm run test:storage berhasil
[ ] npx tsc --noEmit berhasil
[ ] npm run build berhasil
[ ] Migration berhasil
[ ] Seed berhasil
[ ] MinIO service aktif
[ ] Bucket cibione-media dibuat
[ ] Bucket policy public read-only aktif
[ ] Login super admin berhasil
[ ] Login admin jurusan berhasil
[ ] Scope admin jurusan terisolasi
[ ] CRUD berita berhasil
[ ] Detail berita berhasil
[ ] Upload berhasil (media tersimpan ke MinIO)
[ ] Gambar upload tampil di publik
[ ] Upload tetap ada setelah restart PM2
[ ] Upload tetap ada setelah restart MinIO
[ ] Chatbot publik berhasil
[ ] AI content generation berhasil (termasuk analisis gambar)
[ ] Port 3000 tidak dibuka firewall
[ ] Port 5432 tidak dibuka firewall
[ ] Port 9000/9001 tidak dibuka firewall
[ ] Backup database berhasil
[ ] Backup data MinIO berhasil
[ ] Restore backup pernah diuji
```

## 18. Update rutin

```bash
su - cibione
cd /var/www/cibione-cms

git status
git pull --ff-only origin main
npm ci
npm run test:backend
npm run test:storage
npx tsc --noEmit
```

Jika release memiliki migration:

```bash
set -a
. ./.env.production
set +a
npx drizzle-kit migrate
```

Build dan restart:

```bash
npm run build
pm2 restart cibione-cms --update-env
pm2 save
curl --fail http://127.0.0.1:3000
```

Jangan menjalankan `git reset --hard` pada server tanpa memastikan `.env.production` tidak terdampak.

## 19. Backup

Buat directory backup:

```bash
mkdir -p /var/backups/cibione
chown cibione:cibione /var/backups/cibione
```

Backup database:

```bash
sudo -u postgres pg_dump -Fc cibione \
  > /var/backups/cibione/db-$(date +%F).dump
```

Backup data MinIO:

```bash
/opt/minio/bin/mc mirror --overwrite local/cibione-media \
  /var/backups/cibione/minio-$(date +%F)/
```

Salin backup ke storage atau server berbeda. Disk VPS yang sama bukan backup yang cukup.

Restore database:

```bash
sudo -u postgres pg_restore \
  --clean \
  --if-exists \
  -d cibione \
  /var/backups/cibione/db-YYYY-MM-DD.dump
```

Restore data MinIO:

```bash
/opt/minio/bin/mc mirror --overwrite \
  /var/backups/cibione/minio-YYYY-MM-DD/ \
  local/cibione-media
```

Uji restore secara berkala pada bucket/database terpisah.

## 20. Monitoring dan troubleshooting

```bash
pm2 status
pm2 logs cibione-cms
systemctl status nginx
systemctl status postgresql
systemctl status minio
journalctl -u minio -n 100
free -h
tail -f /var/log/nginx/error.log
```

Jika domain gagal:

```bash
nslookup contoh.sch.id
nslookup media.contoh.sch.id
nginx -t
systemctl status nginx
curl -I http://127.0.0.1:3000
```

Jika upload ke MinIO gagal:

```bash
systemctl status minio
curl -I http://127.0.0.1:9000/minio/health/live
pm2 logs cibione-cms --lines 200 | grep -i "upload\|s3\|minio"
test -r /var/www/cibione-cms/.env.production
```

Jika gambar tidak tampil (404):

```bash
# Cek policy publik
/opt/minio/bin/mc anonymous get local/cibione-media
# Cek object ada
/opt/minio/bin/mc ls local/cibione-media/images/
# Cek URL publik
curl -I https://media.contoh.sch.id/cibione-media/images/<category>/<uuid>.webp
```

Jika database gagal:

```bash
systemctl status postgresql
sudo -u postgres psql -d cibione -c 'select 1;'
```

## 21. Rollback aplikasi

Untuk rollback aplikasi tanpa migration yang tidak kompatibel:

```bash
cd /var/www/cibione-cms
npm ci
npm run build
pm2 restart cibione-cms --update-env
```

Jangan rollback schema database secara sembarangan. Migration harus backward-compatible.

## Catatan batasan production

- Rate limit saat ini in-memory per instance; cukup untuk single instance, belum ideal untuk multi-instance.
- `S3_PUBLIC_URL` memakai bucket sebagai prefix path; pastikan Nginx subdomain media tidak menambah prefix lain.
- Scheduled publishing memerlukan validasi `publishedAt` dan job/cron terproteksi sebelum dipakai serius.
- Migration production wajib direview dan dijalankan operator atau deployment job satu kali.
