import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";

import { asc, eq } from "drizzle-orm";

import { db, client } from "@/db";
import { jurusan, users } from "@/db/schema";
import { hashPassword } from "@/server/auth/session";

const outputPath = "docs/jurusan-admin-credentials.md";

function createPassword() {
  return randomBytes(18).toString("base64url");
}

async function main() {
  const departments = await db
    .select({ id: jurusan.id, code: jurusan.code, name: jurusan.name })
    .from(jurusan)
    .orderBy(asc(jurusan.sortOrder), asc(jurusan.name));

  if (!departments.length) throw new Error("Tidak ada data jurusan.");

  const credentials: Array<{ code: string; name: string; username: string; password: string; status: string }> = [];

  for (const department of departments) {
  const username = `admin.${department.code.toLowerCase()}@cibione.local`;
  const [existing] = await db
    .select({ id: users.id, role: users.role, jurusanId: users.jurusanId, isActive: users.isActive })
    .from(users)
    .where(eq(users.email, username))
    .limit(1);

  if (existing) {
    if (existing.role !== "jurusan_admin" || existing.jurusanId !== department.id) {
      throw new Error(`Akun ${username} sudah ada dengan scope atau role berbeda.`);
    }
    credentials.push({ code: department.code, name: department.name, username, password: "(password existing tidak diubah)", status: existing.isActive ? "existing aktif" : "existing nonaktif" });
    continue;
  }

  const password = createPassword();
  await db.insert(users).values({
    name: `Admin ${department.code}`,
    email: username,
    passwordHash: await hashPassword(password),
    role: "jurusan_admin",
    jurusanId: department.id,
    isActive: true,
  });
  credentials.push({ code: department.code, name: department.name, username, password, status: "created" });
  }

const generatedAt = new Date().toISOString();
const lines = [
  "# Kredensial Admin Jurusan",
  "",
  "> Rahasia. Jangan commit, upload, atau kirim melalui kanal publik.",
  "> Username menggunakan email. Password hanya tampil di file ini.",
  "",
  `Dibuat: ${generatedAt}`,
  "",
  "| Jurusan | Username | Password | Status |",
  "| --- | --- | --- | --- |",
  ...credentials.map((item) => `| ${item.code} - ${item.name} | \`${item.username}\` | \`${item.password}\` | ${item.status} |`),
  "",
  "## Catatan Keamanan",
  "",
  "- Segera ganti password setelah login pertama.",
  "- Jangan gunakan password ini di layanan lain.",
  "- Jika file bocor, reset password semua akun terkait segera.",
  "",
];

  await writeFile(outputPath, lines.join("\n"), { encoding: "utf8", mode: 0o600 });
  console.log(`Credentials written: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => client.end());
