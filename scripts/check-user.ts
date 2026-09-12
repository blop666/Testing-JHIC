import { eq } from "drizzle-orm";
import { client, db } from "@/db";
import { users } from "@/db/schema";

async function main() {
  console.log("Checking users table...");
  const allUsers = await db.select({ id: users.id, email: users.email, role: users.role, isActive: users.isActive }).from(users).limit(10);
  console.log("Users found:", allUsers.length);
  for (const user of allUsers) {
    console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Active: ${user.isActive}`);
  }
  
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  if (adminEmail) {
    console.log(`\nChecking for admin user: ${adminEmail}`);
    const [admin] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
    if (admin) {
      console.log("Admin found:", { id: admin.id, email: admin.email, role: admin.role, isActive: admin.isActive });
    } else {
      console.log("Admin user NOT FOUND. Run `npm run db:seed` to create it.");
    }
  }
}

main()
  .catch(console.error)
  .finally(() => client.end());
