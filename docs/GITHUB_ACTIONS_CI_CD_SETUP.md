# CibiOne CMS: Setup GitHub Actions CI/CD

Runbook untuk alur:

```text
Pull request/push main
  -> CI: npm ci, self-check, typecheck, build
  -> deploy hanya jika CI lulus
  -> SSH ke VPS
  -> pull main, build, migration, restart PM2, health check
```

Workflow:

```text
.github/workflows/ci-cd.yml
```

Script VPS:

```text
scripts/deploy-vps.sh
```

## 1. Prasyarat

- Branch production: `main`.
- VPS project: `/var/www/cibione-cms`.
- User deploy: `cibione`.
- Service aplikasi: `pm2-cibione`.
- Node.js 22 pada VPS.
- GitHub repository admin access.
- SSH dari GitHub-hosted runner menuju VPS.

Cloudflare Tunnel hanya menyediakan HTTP/HTTPS ke aplikasi. Tunnel tidak otomatis membuat SSH dari GitHub Actions ke VPS. `DEPLOY_HOST` harus berupa hostname/IP yang dapat dijangkau runner GitHub.

## 2. Verifikasi Workflow

Pastikan file workflow ada:

```bash
test -f .github/workflows/ci-cd.yml
test -f scripts/deploy-vps.sh
```

CI menjalankan:

```bash
npm ci
npm run test:backend
npm run test:storage
npx tsc --noEmit
npm run build
```

Deploy hanya berjalan pada push ke `main` setelah job CI sukses. Pull request tidak melakukan deploy.

## 3. Siapkan VPS

Jalankan sebagai `root`:

```bash
chown -R cibione:cibione /var/www/cibione-cms
chmod 750 /var/www/cibione-cms/scripts/deploy-vps.sh
```

Pastikan service aplikasi aktif:

```bash
systemctl status pm2-cibione --no-pager
```

Buat sudo rule minimum untuk user `cibione`:

```bash
cat > /etc/sudoers.d/cibione-pm2 <<'EOF'
cibione ALL=(root) NOPASSWD: /usr/bin/systemctl restart pm2-cibione, /usr/bin/systemctl is-active pm2-cibione
EOF

chmod 440 /etc/sudoers.d/cibione-pm2
visudo -cf /etc/sudoers.d/cibione-pm2
```

Tes:

```bash
sudo -iu cibione sudo systemctl is-active pm2-cibione
```

Target:

```text
active
```

Jangan memberikan `sudo` penuh kepada user deploy.

## 4. Pastikan SSH Bisa Dijangkau GitHub

Dari komputer developer, tes endpoint yang akan disimpan sebagai `DEPLOY_HOST`:

```bash
ssh -o ConnectTimeout=10 cibione@DEPLOY_HOST
```

Jika VPS hanya memiliki private IP seperti `172.16.x.x`, GitHub-hosted runner tidak dapat mengaksesnya langsung.

Pilihan konektivitas:

1. Gunakan public SSH IP/hostname dari provider.
2. Gunakan Cloudflare Access SSH dengan konfigurasi khusus.
3. Gunakan self-hosted runner di jaringan VPS, dengan konsekuensi keamanan dan maintenance.
4. Gunakan pull-based deployer di VPS, bukan workflow SSH.

Rekomendasi awal: gunakan SSH public yang dibatasi firewall/provider, bukan self-hosted runner.

## 5. Buat Deploy Key

Jalankan di workstation. Jangan jalankan sebagai `root` VPS:

```bash
ssh-keygen -t ed25519 \
  -f ~/.ssh/cibione-deploy \
  -C cibione-github-actions
```

Tambahkan public key ke user VPS:

```bash
ssh-copy-id \
  -i ~/.ssh/cibione-deploy.pub \
  cibione@DEPLOY_HOST
```

Jika `ssh-copy-id` tidak tersedia, tambahkan isi `.pub` ke:

```text
/home/cibione/.ssh/authorized_keys
```

Permission VPS:

```bash
chown -R cibione:cibione /home/cibione/.ssh
chmod 700 /home/cibione/.ssh
chmod 600 /home/cibione/.ssh/authorized_keys
```

Tes dengan private key:

```bash
ssh -i ~/.ssh/cibione-deploy \
  -o IdentitiesOnly=yes \
  cibione@DEPLOY_HOST \
  'whoami && hostname'
```

Target:

```text
cibione
```

## 6. Simpan Host Key

Ambil host key setelah memverifikasi fingerprint dengan provider/VPS:

```bash
ssh-keyscan -t ed25519 DEPLOY_HOST
```

Jangan memasukkan output yang belum diverifikasi ke GitHub secret.

Simpan seluruh output terverifikasi sebagai:

```text
DEPLOY_KNOWN_HOSTS
```

## 7. Buat GitHub Environment

Buka:

```text
Repository -> Settings -> Environments -> New environment
```

Buat environment:

```text
production
```

Aktifkan:

- Required reviewers, direkomendasikan.
- Deployment branch rule: `main`.

## 8. Tambahkan Secrets

Pada environment `production`, tambahkan:

| Secret | Isi |
| --- | --- |
| `DEPLOY_HOST` | Public hostname/IP yang dapat dijangkau GitHub |
| `DEPLOY_USER` | `cibione` |
| `DEPLOY_PATH` | `/var/www/cibione-cms` |
| `DEPLOY_SSH_PRIVATE_KEY` | Isi lengkap private key `~/.ssh/cibione-deploy` |
| `DEPLOY_KNOWN_HOSTS` | Host key SSH terverifikasi |

Private key harus memiliki format lengkap:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

Jangan menambahkan:

- `DATABASE_URL`.
- `INITIAL_ADMIN_PASSWORD`.
- `AI_API_KEY`.
- `.env.production`.
- Cloudflare token.

CI build tidak membutuhkan secret production. Secret production tetap berada di VPS.

## 9. Branch Protection

Buka:

```text
Repository -> Settings -> Branches -> Add branch ruleset
```

Atur branch:

```text
main
```

Aktifkan:

- Require a pull request before merging.
- Require approvals.
- Require status checks to pass.
- Pilih `Test and build` dari workflow CI/CD.
- Require branches to be up to date.
- Block force pushes.
- Block deletions.

Jangan izinkan direct push ke `main` kecuali emergency policy memang mengharuskannya.

## 10. Test CI Tanpa Deploy

Buat branch test:

```bash
git checkout -b chore/test-github-actions
git push -u origin chore/test-github-actions
```

Buka GitHub Actions. Pastikan job berikut lulus:

```text
Test and build
  npm ci
  test:backend
  test:storage
  tsc
  build
```

Pull request dari branch tersebut tidak boleh menjalankan job deploy.

## 11. Test Deploy

Setelah secrets, environment, dan branch protection siap, merge pull request ke `main`.

Di GitHub Actions, target:

```text
CI lulus
Deploy production berjalan
SSH berhasil
Health check berhasil
```

Di VPS pantau:

```bash
journalctl -u pm2-cibione -f
```

Di terminal lain:

```bash
curl -I http://127.0.0.1:3000
curl -I https://jhic.baogoostudio.my.id
```

## 12. Urutan Deploy Script

`scripts/deploy-vps.sh` menjalankan:

```text
git pull --ff-only origin main
npm ci
npm run build
load .env.production
npx drizzle-kit migrate
systemctl restart pm2-cibione
health check localhost:3000
```

Migration dijalankan setelah build lulus dan hanya oleh satu deployment job. Migration harus backward-compatible.

Jika migration berisiko, jalankan backup sebelum merge:

```bash
sudo -u postgres pg_dump -Fc cibione \
  > /var/backups/cibione/db-$(date +%F-%H%M%S).dump
```

## 13. Troubleshooting

### CI gagal pada build

```text
Jangan deploy manual.
Baca log job yang gagal.
Perbaiki branch.
Push ulang.
```

### SSH gagal

Uji:

```bash
ssh -i ~/.ssh/cibione-deploy \
  -o IdentitiesOnly=yes \
  cibione@DEPLOY_HOST \
  'echo ssh-ok'
```

Periksa:

- `DEPLOY_HOST` dapat dijangkau dari internet.
- `DEPLOY_USER` benar.
- Private key cocok dengan `authorized_keys`.
- `DEPLOY_KNOWN_HOSTS` benar.
- Firewall mengizinkan SSH.

### Deploy gagal restart service

```bash
sudo journalctl -u pm2-cibione -n 100 --no-pager
sudo systemctl status pm2-cibione --no-pager
```

### Health check gagal

```bash
curl -I http://127.0.0.1:3000
sudo journalctl -u pm2-cibione -n 100 --no-pager
```

### Deploy overlap

Workflow memakai concurrency group. Jangan menjalankan deploy manual bersamaan dengan GitHub Actions.

## 14. Security Rules

- Jangan commit private key.
- Jangan menaruh `.env.production` di GitHub secrets build jika tidak diperlukan.
- Jangan memakai root SSH untuk deploy.
- Jangan memberi `NOPASSWD: ALL`.
- Jangan memakai `StrictHostKeyChecking=no`.
- Rotate deploy key jika pernah terekspos.
- Hapus deploy key lama dari `authorized_keys` setelah rotation.
- Aktifkan MFA GitHub.
- Aktifkan required reviewer untuk production.
