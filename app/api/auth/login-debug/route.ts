import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    console.log("=== LOGIN DEBUG START ===");
    const body = await request.json();
    console.log("Request body:", body);
    
    const { email, password } = body;
    console.log("Parsed credentials:", { email, passwordLength: password?.length });
    
    if (!process.env.DATABASE_URL) {
      console.log("DATABASE_URL missing");
      return apiError({ code: "INTERNAL_ERROR", message: "DATABASE_URL not configured" }, { status: 500 });
    }
    
    console.log("Importing db...");
    const { db } = await import("@/db");
    console.log("db imported successfully");
    
    const { users } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    
    console.log("Querying user...");
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    console.log("User query result:", user ? { id: user.id, email: user.email, isActive: user.isActive } : "not found");
    
    if (!user) {
      return apiError({ code: "INVALID_CREDENTIALS", message: "User not found" }, { status: 401 });
    }
    
    const { verifyPassword } = await import("@/server/auth/session");
    console.log("Verifying password...");
    const passwordValid = await verifyPassword(password, user.passwordHash);
    console.log("Password valid:", passwordValid);
    
    if (!passwordValid) {
      return apiError({ code: "INVALID_CREDENTIALS", message: "Invalid password" }, { status: 401 });
    }
    
    const { createSession } = await import("@/server/auth/session");
    console.log("Creating session...");
    const session = await createSession(user);
    console.log("Session created:", { token: session.token.substring(0, 10) + "...", expiresAt: session.expiresAt });
    
    const response = apiSuccess({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
    
    const { sessionCookie } = await import("@/server/auth/session");
    const cookie = sessionCookie(session.token, session.expiresAt);
    response.headers.append("Set-Cookie", `${cookie.name}=${cookie.value}; Path=/; HttpOnly; SameSite=Lax; Expires=${cookie.options.expires.toUTCString()}`);
    
    console.log("=== LOGIN DEBUG SUCCESS ===");
    return response;
  } catch (error) {
    console.error("=== LOGIN DEBUG ERROR ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "no stack");
    console.error("=== LOGIN DEBUG END ===");
    
    return apiError({ 
      code: "INTERNAL_ERROR", 
      message: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
