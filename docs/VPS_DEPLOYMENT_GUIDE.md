# CibiOne CMS: Panduan Deploy VPS

Runbook lengkap untuk deploy CibiOne CMS ke VPS Ubuntu/Debian dengan PostgreSQL lokal, PM2, Nginx, DNS, HTTPS, dan upload file persisten.

## Arsitektur

```text
Domain
  -> DNS A record
VPS
  -> Nginx :80/:443
  -> Next.js + PM2 :3000 (localhost saja)
  -> PostgreSQL :5432 (localhost saja)
```

Nilai contoh wajib diganti:

```text
DOMAIN=contoh.sch.id
VPS_IP=203.0.113.10
REPOSITORY=https://github.com/blop666/Testing-JHIC.git
APP_PATH=/var/www/cibione-cms
APP_USER=cibione
DB_NAME=cibione
DB_USER=cibione
```

Jangan menyalin password atau API key dari contoh. Buat nilai baru.

## 1. Prasyarat

- VPS Ubuntu 22.04/24.04 atau Debian 12.
- Minimal 2 GB RAM dan 20 GB storage.
- Akses SSH dengan user root atau sudo.
- Domain dapat diubah DNS-nya.
- Provider AI kompatibel dengan OpenAI Chat Completions API.
- Backup storage terpisah dari disk VPS.

Project membutuhkan Node.js 22 LTS. PostgreSQL, Node.js, dan dependency production harus diverifikasi pada VPS sebelum go-live.

## 2. DNS

Di panel DNS domain, tambahkan:

```text
Type: A
Name: @
Value: VPS_IP
TTL: 300
```

Opsional untuk `www`:

```text
Type: A
Name: www
Value: VPS_IP
TTL: 300
```

Verifikasi dari komputer lokal:

```bash
nslookup contoh.sch.id
nslookup www.contoh.sch.id
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
apt install -y curl git nginx postgresql postgresql-contrib ufw unzip ca-certificates
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

Jangan membuka port aplikasi atau database:

```text
3000: localhost saja
5432: localhost saja
```

## 5. Node.js 22 dan PM2

Install Node.js 22 LTS melalui NodeSource atau `nvm`. Contoh NodeSource:

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

## 7. Clone repository

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

## 8. Environment production

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

AI_REQUEST_TIMEOUT_MS=30000
AI_MAX_OUTPUT_TOKENS=1200
AI_ADMIN_DAILY_LIMIT=30
```

Catatan:

- Kode AI membaca `AI_BASE_URL`, `AI_API_KEY`, dan `AI_MODEL`.
- `CHATBOT_PROVIDER_URL` dan `CHATBOT_PROVIDER_KEY` pada `.env.example` lama tidak dipakai oleh route AI saat ini.
- Jangan memakai password historis.
- Jangan memakai `NEXT_PUBLIC_` untuk secret.
- Jangan commit `.env.production`.
- Rotate key jika pernah terekspos di Git, log, screenshot, atau dokumentasi publik.

Load environment hanya di shell saat menjalankan command database:

```bash
set -a
. ./.env.production
set +a
```

## 9. Upload persisten

Upload disimpan di disk VPS. Buat directory dan permission:

```bash
mkdir -p /var/www/cibione-cms/public/uploads
chown -R cibione:cibione /var/www/cibione-cms/public/uploads
chmod 750 /var/www/cibione-cms/public/uploads
```

Jangan menghapus directory ini saat update. Pastikan directory ikut backup.

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

Sebagai root, buat konfigurasi:

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

Ganti `contoh.sch.id` dengan domain sebenarnya, lalu aktifkan:

```bash
ln -s /etc/nginx/sites-available/cibione-cms /etc/nginx/sites-enabled/cibione-cms
nginx -t
systemctl reload nginx
```

Tes:

```bash
curl -I http://contoh.sch.id
```

## 15. HTTPS dengan Let's Encrypt

Pastikan DNS sudah benar, lalu:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d contoh.sch.id -d www.contoh.sch.id
```

Pilih redirect HTTP ke HTTPS saat ditanya.

Tes certificate renewal:

```bash
certbot renew --dry-run
```

Tes production:

```bash
curl -I https://contoh.sch.id
```

## 16. Checklist production

```text
[ ] DNS A record mengarah ke VPS
[ ] HTTP redirect ke HTTPS
[ ] npm ci berhasil
[ ] npm run test:backend berhasil
[ ] npx tsc --noEmit berhasil
[ ] npm run build berhasil
[ ] Migration berhasil
[ ] Seed berhasil
[ ] Login super admin berhasil
[ ] Login admin jurusan berhasil
[ ] Scope admin jurusan terisolasi
[ ] CRUD berita berhasil
[ ] Detail berita berhasil
[ ] Upload berhasil
[ ] Upload tetap ada setelah restart
[ ] Chatbot publik berhasil
[ ] AI content generation berhasil
[ ] Port 3000 tidak dibuka firewall
[ ] Port 5432 tidak dibuka firewall
[ ] Backup database berhasil
[ ] Backup uploads berhasil
[ ] Restore backup pernah diuji
```

## 17. Update rutin

```bash
su - cibione
cd /var/www/cibione-cms

git status
git pull --ff-only origin main
npm ci
npm run test:backend
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

Jangan menjalankan `git reset --hard` pada server tanpa memastikan upload dan `.env.production` tidak terdampak.

## 18. Backup

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

Backup upload:

```bash
tar -C /var/www/cibione-cms \
  -czf /var/backups/cibione/uploads-$(date +%F).tar.gz \
  public/uploads
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

Uji restore secara berkala pada database terpisah.

## 19. Monitoring dan troubleshooting

```bash
pm2 status
pm2 logs cibione-cms
systemctl status nginx
systemctl status postgresql
free -h
tail -f /var/log/nginx/error.log
```

Jika domain gagal:

```bash
nslookup contoh.sch.id
nginx -t
systemctl status nginx
curl -I http://127.0.0.1:3000
```

Jika aplikasi gagal:

```bash
pm2 logs cibione-cms --lines 200
test -r /var/www/cibione-cms/.env.production
test -d /var/www/cibione-cms/public/uploads
```

Jika database gagal:

```bash
systemctl status postgresql
sudo -u postgres psql -d cibione -c 'select 1;'
```

## 20. Rollback aplikasi

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
- Upload lokal hanya persisten selama disk VPS dan backup terjaga.
- Scheduled publishing memerlukan validasi `publishedAt` dan job/cron terproteksi sebelum dipakai serius.
- Migration production wajib direview dan dijalankan operator atau deployment job satu kali.
